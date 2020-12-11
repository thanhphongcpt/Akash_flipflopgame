# Base Image
FROM ubuntu:latest

# Maintainer
LABEL maintainer "Jungpil YU"

# Update OS and Install web server
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install nginx

# Configure
EXPOSE 80

# Install App
ADD index.html /var/www/html/
RUN mkdir /var/www/html/js
ADD js/* /var/www/html/js
RUN mkdir /var/www/html/css
ADD css/* /var/www/html/css

# Launch Web Server
CMD ["nginx", "-g", "daemon off;"]
