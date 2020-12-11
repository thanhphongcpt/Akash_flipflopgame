1. Dockerizing

The Akash works with a Docker images, so first we make Docker Images

1.a Getting the source code
Pull code 

git clone https://github.com/thanhphongcpt/Akash_flipflopgame.git


1.b Build Docker Images with Dockerfile

$ docker build -t <your_username>/memorygame .

Waiting for image complete.

1.c Publishing the image to Docker Hub

List docker images:

$ docker images

REPOSITORY                 TAG       IMAGE ID       CREATED          SIZE
thanhphongcpt/memorygame   latest    dafe7c39b777   46 minutes ago   133MB
nginx                      latest    7baf28ea91eb   10 hours ago     133MB


$ docker push <your_hub_username>/memorygame
Waiting for loading. Dockerization done!

2. Installing and preparing Akash
To interact with the Akash system, you need to install it and create a wallet by follow the official Akash Documentation guides.

https://docs.akash.network/v/master/guides/guides

2.a Choosing a Network

Define the required shell variables:

$ AKASH_NET="https://raw.githubusercontent.com/ovrclk/net/master/edgenet"
$ AKASH_VERSION="$(curl -s "$AKASH_NET/version.txt")"
$ AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
$ AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | shuf -n 1)"

2.b Installing the Akash client
There are several ways to install Akash: from the release page, from the source or via godownloader. The easiest and the most convenient way is to download via godownloader:

$ curl https://raw.githubusercontent.com/ovrclk/akash/master/godownloader.sh | sh -s -- "$AKASH_VERSION"
And add the akash binaries to your shell PATH. Keep in mind that this method will only work in this terminal instance and after restarting your computer or terminal this PATH addition will be removed. You can read how to set your PATH permanently on this page if you want:

$ export PATH="$PATH:./bin"

2.c Wallet setting

Let's define additional shell variables. KEY_NAME value of your choice, I uses a value of "tp":

$ KEY_NAME="tp"
$ KEYRING_BACKEND="file"
Derive a new key locally:

$ akash --keyring-backend "$KEYRING_BACKEND" keys add "$KEY_NAME"
You'll see a response similar to below:

- name: tp
  type: local
  address: akash1j0wftrkr348gn3247p756w657u5xgypy3xrq0d
  pubkey: akashpub1addwnpepqvgttc95tg9pehy8crt229wy6re9d44uuwpqvv9w45ggsvn2uzruxuqhcn8
  mnemonic: ""
  threshold: 0
  pubkeys: []


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

silk hip approve fog raw stage language arrest loyal alley maple notable aim used tenant shadow escape first payment lottery amount access right hen


$ ACCOUNT_ADDRESS="akash1j0wftrkr348gn3247p756w657u5xgypy3xrq0d"

2.d Funding your account

This for testnet and edgenet only.

$ curl "$AKASH_NET/faucet-url.txt"

https://akash.vitwit.com/faucet

Go to the resulting URL and enter your account address; you should see tokens in your account shortly. Check your account balance with:

$ akash --node "$AKASH_NODE" query bank balances "$ACCOUNT_ADDRESS"

balances: 
- amount: "100000000" 
 denom: uakt 
pagination: 
 next_key: null 
 total: "0"


3. Deploying


3.a Creating a deployment configuration
For configuration in Akash uses Stack Definition Language (SDL). Deployment services, datacenters, pricing, etc.. are described by a YAML configuration file. These files may end in .yml or .yaml. Create deploy.yml configuration file with following content.

In the services.images field replace value <your_hub_username>/memorygame with your Docker image name.
The services.expose.port field means the container port to expose. In the first section of the guide I specified port 80.
The services.expose.as field is the port number to expose the container port as specified. Port 80 is the standard port for web servers HTTP protocol.


$ cat > deploy.yml <<EOF
---
version: "2.0"

services:
  web:
    image: <your_hub_username>/memorygame
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:    
      pricing:
        web: 
          denom: uakt
          amount: 9000

deployment:
  web:
    westcoast:
      profile: web
      count: 1
EOF

3.b Creating the deployment

To deploy on Akash, run:

$ akash tx deployment create deploy.yml --from $KEY_NAME \
  --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID \
  --keyring-backend $KEYRING_BACKEND -y
 
 
3.c Wait for your lease
You can check the status of your lease by running:

$ akash query market lease list --owner $ACCOUNT_ADDRESS \
  --node $AKASH_NODE --state active
You should see a response similar to:
leases:
- lease_id:
    dseq: "204221"
    gseq: 1
    oseq: 1
    owner: akash1j0wftrkr348gn3247p756w657u5xgypy3xrq0d
    provider: akash1uu8wfvxscqt7ax89hjkxral0r2k73c6ee97dzn
  price:
    amount: "2122"
    denom: uakt
  state: active
pagination:
  next_key: null
  total: "0"


Extract some new required for future referencing shell variables:

$ PROVIDER="akash1uu8wfvxscqt7ax89hjkxral0r2k73c6ee97dzn"
$ DSEQ="204221"
$ OSEQ="1"
$ GSEQ="1"

3.d Uploading manifest
Upload the manifest using the values from above step:

$ akash provider send-manifest deploy.yml \
  --node $AKASH_NODE --dseq $DSEQ \
  --oseq $OSEQ --gseq $GSEQ \
  --owner $ACCOUNT_ADDRESS --provider $PROVIDER
Your image is deployed, once you uploaded the manifest. You can retrieve the access details by running the below:

$ akash provider lease-status \
  --node $AKASH_NODE --dseq $DSEQ \
  --oseq $OSEQ --gseq $GSEQ \
  --provider $PROVIDER --owner $ACCOUNT_ADDRESS
You should see a response similar to:

{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "6kidfjjg0lddt9h97cdgaq8dq8.provider3.akashdev.net"
      ],
      "observed-generation": 0,
      "replicas": 0,
      "updated-replicas": 0,
      "ready-replicas": 0,
      "available-replicas": 0
    }
  },
  "forwarded-ports": {}
}

You can access the application by visiting the hostnames mapped to your deployment. 
In above example, its http://www.6kidfjjg0lddt9h97cdgaq8dq8.provider3.akashdev.net

Following the address, make sure that the application works: 

3.5 Close your deployment
When you are done with your application, close the deployment. This will deprovision your container and stop the token transfer. Close deployment using deployment by creating a deployment-close transaction:

$ akash tx deployment close --node $AKASH_NODE \
  --chain-id $AKASH_CHAIN_ID --dseq $DSEQ \
  --owner $ACCOUNT_ADDRESS --from $KEY_NAME \
  --keyring-backend $KEYRING_BACKEND -y
Additionally, you can also query the market to check if your lease is closed:

$ akash query market lease list --owner $ACCOUNT_ADDRESS --node $AKASH_NODE
You should see a response similar to:

- lease_id:
    dseq: "204221"
    gseq: 1
    oseq: 1
    owner: akash1j0wftrkr348gn3247p756w657u5xgypy3xrq0d
    provider: akash1uu8wfvxscqt7ax89hjkxral0r2k73c6ee97dzn
  price:
    amount: "2122"
    denom: uakt
  state: closed
pagination:
  next_key: null
  total: "0"
As you can notice from the above, you lease will be marked closed