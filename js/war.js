var suits = ['hearts', 'clubs', 'diamonds', 'spades'];
var ranks = [ 'ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
var deck = [];
var playDeck;
var compDeck;
var playCard;
var compCard;
var warArray = [];

//^^^All of the global variables we need^^^

$(document).ready(function(){
    $('#startBtn').attr('disabled', false); //enable the start button when we're loaded
});

function startGame(){
    $('#startBtn').css('display', 'none');  //hide the start button when clicked
    deck = buildDeck(suits, ranks);
    deck = shuffleDeck(deck);       //build and shuffle the deck
    // console.log(deck);
    playDeck = deck.splice(0, 26);  //divide it into two decks
    compDeck = deck;
    // console.log(playDeck);
    // console.log(compDeck);
    $('#compdeck').html('<img src="img/back.png">');    //show card backs for the decks
    $('#playdeck').html('<img src="img/back.png">');  
    $('#compdeckarea').css('display', 'block');
    $('#playdeckarea').css('display', 'block');
    $('#compdeckcount').html(compDeck.length);  //show how many cards in each deck
    $('#playdeckcount').html(playDeck.length);
    $('#flipBtn').attr('disabled', false);  //enable the flip button and show it
    $('#flipBtn').css('display', 'block');
    $('#winmessage').html('');  //Clear the win message if they are playing a second time.
}

function flip(){
    $('#flipBtn').attr('disabled', true);   //disable the flip button while we do stuff
    playCard = playDeck.pop();
    compCard = compDeck.pop();  //get a card from each deck
    $('#compcard').html('<img src="' + compCard.img + '">');    //display our two cards
    $('#playcard').html('<img src="' + playCard.img + '">');
    $('#compcard').css('display', 'block');
    $('#playcard').css('display', 'block');
    $('#compdeckcount').html(compDeck.length);  //show how many cards in each deck
    $('#playdeckcount').html(playDeck.length);
    if(compCard.value > playCard.value){                //choose which deck to add to
        setTimeout(function(){addCards('comp')}, 2000); //use timeouts so that the cards stay up for awhile
    }else if(playCard.value > compCard.value){ 
        setTimeout(function(){addCards('play')}, 2000);
    }else{
        $('#warsplash').html('<b>WAR!</b>');    //Show the war splash
        setTimeout(function(){war()}, 2000);    //call the war routine
    }
}

function war(){
    warArray.push(playCard, compCard);  //put the last two cards played into our war pile
    if(compDeck.length > 0){            //if a player can't put in another card, they lose.
        warArray.push(compDeck.pop());
    }else{
        gameEnd('play');
    }
    if(playDeck.length > 0){
        warArray.push(playDeck.pop());
    }else{
        gameEnd('comp');
    }
    $('#compdeckcount').html(compDeck.length);  //show how many cards in each deck
    $('#playdeckcount').html(playDeck.length);
    $('#warzonecount').html('Cards at stake: ' + warArray.length); //show how many cards are in the war pile
    $('#compcard').css('display', 'none');  //hide the cards to show that they have been put in the war pile
    $('#playcard').css('display', 'none');
    $('#compcard').html('');
    $('#playcard').html('');
    $('#flipBtn').attr('disabled', false);  //enable the flip button again
    if(compDeck.length == 0){   //if a player has no more cards after this, they lose
        gameEnd('play');
    }
    if(playDeck.length == 0){
        gameEnd('comp');
    }
}

function addCards(deckToAdd){
    if(deckToAdd == 'comp'){        //add the two cards that were just drawn
        compDeck.unshift(compCard);
        compDeck.unshift(playCard);
        while(warArray[0] != undefined){    //then add any cards in the war array
            compDeck.unshift(warArray.shift());
        }
    }
    if(deckToAdd == 'play'){
        playDeck.unshift(compCard);
        playDeck.unshift(playCard);
        while(warArray[0] != undefined){
            playDeck.unshift(warArray.shift());
        }
    }
    $('#compdeckcount').html(compDeck.length);  //show how many cards in each deck
    $('#playdeckcount').html(playDeck.length);
    $('#compcard').html('');    //make the card images go away
    $('#playcard').html('');
    $('#warzonecount').html('');    //clear the warpile info
    $('#flipBtn').attr('disabled', false);  //enable the flip button again
    $('#warsplash').html('');
    $('#compcard').css('display', 'none');
    $('#playcard').css('display', 'none');
    if(compDeck.length == 0){   //if a player cant flip a card, they lose
        gameEnd('play');
    }
    if(playDeck.length == 0){
        gameEnd('comp');
    }
}

function gameEnd(winner){
    if(winner == 'play'){   //display a message based on the result of the game.
        $('#winmessage').html('<p>YOU WIN!!!</p>');
    }
    if(winner == 'comp'){
        $('#winmessage').html('<p>YOU LOSE...</p>');
    }
    $('#flipBtn').css('display', 'none');       //hide all of the game components
    $('#compdeckarea').css('display', 'none');
    $('#playdeckarea').css('display', 'none');
    $('#compcard').css('display', 'none');
    $('#playcard').css('display', 'none');
    $('#warzonecount').html('');
    $('#warsplash').html('');
    $('#startBtn').css('display', 'block'); //bring the start button back for if the user wants to play again.
}

function buildDeck(){
    let deck = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            deck.push({                             //each card is an object with an image and value
                img: 'img/' + ranks[j] + '_of_' + suits[i] + '.jpg',
                imgback: 'back.png',
                value: j
            });
        }
    }
    return deck;
}
function shuffleDeck(){
    let randomIndex;
    let temp;
    for (let i = 0; i < deck.length; i++) { //swap the card in spot 0 with a random card, repeat for each spot
        randomIndex = Math.floor(Math.random()*52);
        temp = deck[i];
        deck[i] = deck[randomIndex];
        deck[randomIndex] = temp;
    }
    return deck;
}