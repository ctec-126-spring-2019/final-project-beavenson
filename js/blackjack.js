var suits = ['hearts', 'clubs', 'diamonds', 'spades'];
var ranks = [ 'ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
var deck = [];
var playerHand = {
    val: 0,
    cards: []
};
var dealerHand = {
    val: 0,
    cards: []
};
var credits;
var bet;

//^^^Global Variables^^^

$(document).ready(function(){
    $('#startBtn').attr('disabled', false); //enable the start button when we're loaded
    credits = 100;
    $('#betIn').attr('max', credits);
});

function startGame(){
    $('#startBtn').attr('disabled', true);  //Get rid of the start button when we begin to play.
    $('#startBtn').css('display', 'none');

    deck = buildDeck();
    deck = shuffleDeck();                   //build and shuffle our deck
    playerHand.cards.push(deck.pop(), deck.pop());  //deal two cards to the player, two to the dealer
    dealerHand.cards.push(deck.pop(), deck.pop());
    for(card in playerHand.cards){
        playerHand.val += playerHand.cards[card].value; //find the value of the hands
    }
    for(card in dealerHand.cards){
        dealerHand.val += dealerHand.cards[card].value;
    }

    if(playerHand.val == 22){       //If we have two aces, we need to make one a 1 and one an 11
        playerHand.cards[0].value = 1;
        playerHand.val = 12;
    }
    if(dealerHand.val == 22){
        dealerHand.cards[0].value = 1;
        dealerHand.val = 12;
    }

    credits -= $('#betIn').val(); //subtract the player's bet from their credits
    bet = $('#betIn').val()*1     //the possible winnings are twice the player's bet
    $('#bet').html('<p>Bet: ' + bet + ' Credits</p>');  
    $('#credits').html('<p>Credits: ' + credits + '</p>');

        //display the cards and hand value for the player

    $('#playerhand').html("<img src=" + playerHand.cards[0].img + "><img src=" + playerHand.cards[1].img + ">");
    $('#dealerhand').html("<img src=" + dealerHand.cards[0].imgback + "><img src=" + dealerHand.cards[1].img + ">");

    $('#playvalue').html("<p>Your hand has a value of " + playerHand.val + "</p>");

    


    if((playerHand.val == 21)&&(dealerHand.val == 21)){ //check for blackjacks!
        $('#status').html('<p>Its a Push</p>');
        gameEnd('push');
    }
    if(playerHand.val == 21){
        $('#status').html('<p>Blackjack!</p>');
        gameEnd('play');
    }
    if(dealerHand.val == 21){
        $('#status').html('<p>The Dealer has a Blackjack...</p>');
        gameEnd('deal');
    }

    $('#hit').attr('disabled', false);  //enable our buttons!
    $('#stay').attr('disabled', false);
    // if(playerHand.cards[0].rank === playerHand.cards[1].rank){
    //     $('#split').attr('disabled', false);
    // }
}

function hitMe(){
    let newCard = deck.pop();
    playerHand.cards.push(newCard); //draw a card and add it to the hand
    playerHand.val += newCard.value;    //calculate new hand value
    $('#playerhand').html($('#playerhand').html() + "<img src=" + newCard.img + ">");   //show new card

    if(playerHand.val > 21){            //If the player busted, see if we can change any 11's to 1's.
        for(card in playerHand.cards){
            if(playerHand.cards[card].value == 11){
                playerHand.cards[card].value = 1;
                playerHand.val -= 10;
                break;
            }
        }
    }
    $('#playvalue').html("<p>Your hand has a value of " + playerHand.val + "</p>");
    if(playerHand.val > 21){
        $('#status').html("<p>You Bust!</p>");  //The player busted. disable the buttons and end the game
        $('#hit').attr('disabled', true);
        $('#stay').attr('disabled', true);
        gameEnd('deal');
    }
}

function stay(){
    $('#dealvalue').html("<p>The dealer's hand has a value of " + dealerHand.val + "</p>"); //Show the hidden card
    $('#dealerhand').html("<img src=" + dealerHand.cards[0].img + "><img src=" + dealerHand.cards[1].img + ">");
    setTimeout(hitDealer, 2000);    //and add a new card after 2 secs
}

function hitDealer(){
    if(dealerHand.val >= 17){    //dealer stays at 17
        scoreHands();
        return;
    }
    let newCard = deck.pop();   //draw a card and add it to the dealer's hand
    dealerHand.cards.push(newCard);
    dealerHand.val += newCard.value;

    $('#dealerhand').html($('#dealerhand').html() + "<img src=" + newCard.img + ">");

    if(dealerHand.val > 21){
        for(card in dealerHand.cards){  //check for aces to lower the score
            if(dealerHand.cards[card].value == 11){
                dealerHand.cards[card].value = 1;
                dealerHand.val -= 10;
                break;
            }
        }
    }
    $('#dealvalue').html("<p>The dealer's hand has a value of " + dealerHand.val + "</p>");
    setTimeout(hitDealer, 2000);    //try to draw another card after 2 seconds
}

function scoreHands(){
    if(dealerHand.val > 21){    //the dealer bust, player wins
        $('#status').html("<p>The Dealer Bust!</p>");
        gameEnd('play');
    }else if(dealerHand.val > playerHand.val){  //the dealer has a better hand, dealer wins
        $('#status').html("<p>The Dealer has a Better Hand</p>");
        gameEnd('deal');
    }else if(dealerHand.val == playerHand.val){ //both hands are equal in value, push
        $('#status').html("<p>Its a Push</p>");
        gameEnd('push');
    }else{
        $('#status').html("<p>You have the Better Hand</p>");   //player has the better hand, player wins
        gameEnd('play');
    }
}

function gameEnd(endstate){
    switch(endstate){
        case 'play':    //if the player won, payout is double their bet
            credits += bet*2;
            break;
        case 'push':    //in a push, the player gets their bet returned to them.
            credits += bet;
            break;
        case 'deal':    //if dealer wins, the house keeps the money
            break;
    }
    $('#credits').html("<p>Credits: " + credits + "</p>");
    setTimeout(reset, 2000);    //let this end state stand on the screen for 2 seconds, then reset
}

function reset(){
    $('#playerhand').html('');  //clear the hands
    $('#dealerhand').html('');
    $('#status').html('');  //clear the status
    $('#bet').html(''); //clear the bet
    $('#playvalue').html('');   //clear the hand values
    $('#dealvalue').html('');
    $('#startBtn').css('display', 'block'); //enable our button
    $('#startBtn').attr('disabled', false);
    $('#betIn').attr('max', credits);   //set the new max for our bet selector
    playerHand = { 
        val: 0,
        cards: []
    };              //fresh objects
    dealerHand = { 
        val: 0,
        cards: []
    };
    if(credits == 0){   //player has to refresh the page if they run out of credits.
        $('#status').html('<p>You have run out of credits. Refresh the page to reset to 100.');
        $('#startBtn').attr('disabled', true);
    }
}

function buildDeck(){
    let deck = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            val = j+1;      //conditionals to assign the correct value
            if(j == 0){
                val = 11;
            }
            if(j >= 9){
                val = 10;
            }
            deck.push({                             //each card is an object with an image and value
                img: 'img/' + ranks[j] + '_of_' + suits[i] + '.jpg',
                imgback: 'img/back.png',
                value: val,
                rank: ranks[j]          //This time we have a rank so we can look for splits
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