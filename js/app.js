/*
 * Create a list that holds all of your cards
 */
const half_list = ["address-book","address-card", "building", "calendar",
"calendar-alt", "chart-bar", "keyboard", "edit"]
let list = half_list.concat(half_list);

//"envelope","envelope-open","file","file-alt",
//"save", "sticky-note", "hdd", "copyright"];

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

/**
* @description Shuffle function from http://stackoverflow.com/a/2450976
* @param {array} array
* @returns {array} shuffled array
*/
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

let nMoves = 0;
let nOpen = 0;
let starHtml = '';
let openedCard;
let deck;
let moves;
let star;
let finalStars;
let timer;
let elapsedTime;
let elapsedTimeId;
let endDialog;

/**
* @description initialize the card deck
*/
const initDeck = () => {
  const shuffledList = shuffle(list);
  const spin = '';//"fa-spin"
  let updatedHtml = '';
  for(let i = 0; i < shuffledList.length; i++) {
    updatedHtml +=`<li class='${shuffledList[i]} card'>
  <i class='fas ${spin} fa-1x fa-${shuffledList[i]}''></i>
</li>
`;
  }
  deck.innerHTML = updatedHtml;
}

/**
* @description Update timer
*/
const updateTimer = (e) => {
  elapsedTime++;
  timer.innerText = elapsedTime;
}

/**
* @description Update the number of moves and star rating
*/
const updateScorePanel = () => {
  moves.innerText = nMoves;
  const nStars = nMoves <= 25 ? 3 : (nMoves <= 45 ? 2 : 1);
  starHtml = '';
  for(let i = 0; i < nStars; i++) {
    starHtml += '<li><i class="fas fa-1x fa-star"></i></li>';
  }
  stars.innerHTML = starHtml;
  timer.innerText = elapsedTime;
}

/**
* @description Initialize global, timer, moves, and star rating
*/
const init = () => {
  moves = document.querySelector('.moves');
  stars = document.querySelector('.stars');
  finalStars = document.querySelector('.finalstars');
  timer = document.querySelector('.timer');
  elapsedTime = 0;
  elapsedTimeId = setInterval(updateTimer, 1000);
  nMoves = 0;
  updateScorePanel();
  nOpen = 0;
  deck = document.querySelector('.deck');
  initDeck();

  endDialog = document.querySelector('.endDialog');
}

/**
* @description Implement the most of game logic
*/
const callBackDeck = (e) => {
  const card = e.target.classList;
  // check if a user click a valid card
  if(e.target.nodeName != 'LI' || card[card.length-1] == 'match') {
    return;
  }
  // check if two cards are the same
  if(nOpen == 1 && openedCard === e.target.classList) {
    //console.log('Now bug fixed\n')
    return;
  }

  // user clicked a valid card
  // then open the card
  nOpen++;
  if(nOpen >= 3) {
    return;
  }
  nMoves++;
  updateScorePanel();
  e.target.classList.add('open');
  e.target.classList.add('show');
  // if this is the first card, save its classList and return
  if(nOpen == 1) {
    openedCard = e.target.classList;
    return;
  }

  // Now, there are two distinctive cards. So check if two cards match
  if(openedCard[0] != e.target.classList[0]) {
    // Cards do not match. So cards close in 1 second and return
    setTimeout( (cardA, cardB) => {
      cardA.remove('show');
      cardA.remove('open');
      cardB.remove('show');
      cardB.remove('open');
      nOpen = 0;
    }, 1000, openedCard, e.target.classList);
    return;
  }
  // Cards match. So tag cards as 'match' and check if all match
  openedCard.remove('show');
  openedCard.replace('open', 'match');
  e.target.classList.remove('show');
  e.target.classList.replace('open', 'match');
  // check if all cards match
  let i;
  for(i = 0; i < deck.children.length; i++) {
    let last = deck.children[i].classList.length - 1;
    if(deck.children[i].classList[last] != 'match') {
      break;
    }
  }
  if(i == deck.children.length) { // You win!
    finalStars.innerHTML = starHtml;
    const finalTimer = document.querySelector('.finaltimer');
    finalTimer.innerText = elapsedTime;
    clearInterval(elapsedTimeId);
    // Pop-up dialog
    endDialog.showModal();
  }
  nOpen = 0;
}


// Register call-back function
document.querySelector('.deck').addEventListener('click', callBackDeck);
document.querySelector('.restart').addEventListener('click', (e) => {
  clearInterval(elapsedTimeId);
  init();
});
document.querySelector('.replay').addEventListener('click', (e) => {
  endDialog.close();
  init();
});
document.querySelector('.quit').addEventListener('click', (e) => {
  endDialog.close();
});

// ignite the exciting memory game!
init();
