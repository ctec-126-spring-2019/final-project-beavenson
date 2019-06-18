var suits = ['hearts', 'clubs', 'diamonds', 'spades'];
var ranks = [ 'ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
var deck = [];
var playerHand = {
    val: 0,
    cards: []
};
var splitHand = {
    val: 0,
    cards: []
}
var dealerHand = {
    val: 0,
    cards: []
};
var credits;
var bet;
var insurance = 0;
var firstSplit = false;
var split = false;

//^^^Global Variables^^^

$(document).ready(function(){
    $('#placeBet').attr('disabled', false); //enable the start button when we're loaded
    credits = 100;
    $('#betIn').attr('max', credits);   //you cant bet more credits than you have
});

function startGame(){
    $('#placeBet').attr('disabled', true);  //Disable the start button when we begin to play.

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

    credits -= parseInt($('#betIn').val()); //subtract the player's bet from their credits
    bet = parseInt($('#betIn').val());    
    $('#bet').html('<p>Bet: ' + bet + ' Credits</p>');  
    $('#credits').html('<p>Credits: ' + credits + '</p>');

        //display the cards and hand value for the player

    $('#playerhand').html("<img src=" + playerHand.cards[0].img + "><img src=" + playerHand.cards[1].img + ">");
    $('#dealerhand').html("<img src=" + dealerHand.cards[0].imgback + "><img src=" + dealerHand.cards[1].img + ">");

    $('#playvalue').html("<p>Your hand has a value of " + playerHand.val + "</p>");
    
 
    if(dealerHand.cards[1].rank === "ace"){     //if there's a faceup ace, the player can bet up to half of
                                                //their original bet in insurance
            if(credits > bet/2){
                $('#betIn').attr('max', Math.ceil(bet/2));
                $('#betIn').attr('value', Math.ceil(bet/2));
            }else{
                $('#betIn').attr('max', credits);
                $('#betIn').attr('value', credits);
            }
            $('#insurance').attr('disabled', false);
            $('#noInsurance').attr('disabled', false);
            $('#status').html("<p>The Dealer has dealt an ace face up, you can choose to bet insurance...</p>");
            return;
    }

    if(playerHand.val == 21){         
        $('#status').html('<p>Blackjack!</p>');
        gameEnd('play');
    }
    if((playerHand.val == 21)&&(dealerHand.val == 21)){ //check for blackjacks!
        $('#status').html('<p>Its a Push</p>');
        $('#dealerhand').html("<img src=" + dealerHand.cards[0].img + "><img src=" + dealerHand.cards[1].img + ">");
        gameEnd('push');
    }
    if(dealerHand.val == 21){
        $('#status').html('<p>The Dealer has a Blackjack...</p>');
        $('#dealerhand').html("<img src=" + dealerHand.cards[0].img + "><img src=" + dealerHand.cards[1].img + ">");
        gameEnd('deal');
    }

    if((playerHand.cards[0].rank === playerHand.cards[1].rank) && credits >= bet){
        $('#split').attr('disabled', false);    //allow player to split if both cards are of same rank
    }
    if(((playerHand.val === 9) || (playerHand.val === 10) || (playerHand.val === 11)) && credits >= bet){
        $('#double').attr('disabled', false);   //allow player to double down if able
    }
    $('#hit').attr('disabled', false);  //enable our buttons!
    $('#stay').attr('disabled', false);
}

function hitMe(){
    hand = playerHand;  //This is to let us know which hand we are working with in the case of a split
    handDiv = '#playerhand';
    if(firstSplit){
        handDiv = '#splithand';
        hand = splitHand;
    }
    $('#insurance').attr('disabled', true); //disable these buttons, you cant make these actions after the first hit
    $('#double').attr('disabled', true);
    $('#split').attr('disabled', true);
    let newCard = deck.pop();
    hand.cards.push(newCard); //draw a card and add it to the hand
    hand.val += newCard.value;    //calculate new hand value
    $(handDiv).html($(handDiv).html() + "<img src=" + newCard.img + ">");   //show new card

    if(hand.val > 21){            //If the player busted, see if we can change any 11's to 1's.
        for(card in hand.cards){
            if(hand.cards[card].value == 11){
                hand.cards[card].value = 1;
                hand.val -= 10;
                break;
            }
        }
    }
    $('#playvalue').html("<p>Your hand has a value of " + hand.val + "</p>");
    if(hand.val > 21){
        $('#status').html("<p>You Bust!</p>");  //The player busted. disable the buttons and end the game
        $('#hit').attr('disabled', true);
        $('#stay').attr('disabled', true);
        if(firstSplit){ //if this is the first hand of a split, the game isnt over, we need to switch to the second hand
            firstSplit = false;
            setTimeout(changeHand, 2000);
            return;
        }
        if(split){
            stay(); //if we've gotten this far, it means that we busted on the second hand of a split, but we
            return; //still need to have the dealer draw so that we can see if the first hand wins.
        }
        gameEnd('deal');
    }
}

function stay(){
    if(firstSplit){
        firstSplit = false; //if staying on firsthand of a split, change hands and go back to hitting.
        changeHand();
        return;
    }
    $('#hit').attr('disabled', true);   //disable these buttons. the user cant do anything while the dealer is drawing
    $('#stay').attr('disabled', true);
    $('#insurance').attr('disabled', true);
    $('#double').attr('disabled', true);
    $('#split').attr('disabled', true);
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
    if(playerHand.val > 21){    //if the program somehow gets here without the player busting, they will bust here.
        gameEnd('deal');
    }
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

function betInsurance(){
    insurance = parseInt($('#betIn').val());    //collect insurance bet
    credits = credits - insurance;
    $('#credits').html("<p>Credits: " + credits + "</p>");
    if((playerHand.val == 21)&&(dealerHand.val == 21)){ //check for blackjacks!
        $('#status').html('<p>Its a Push... but you still collect insurance!</p>'); //pay out insurance accordingly
        credits = credits + (insurance * 2);
        gameEnd('push');
        return;
    }
    if(playerHand.val == 21){
        $('#status').html("<p>You don't collect insurance, but you've got a blackjack!</p>");
        gameEnd('play');
        return;
    }
    if(dealerHand.val == 21){
        $('#status').html('<p>The Dealer has a Blackjack... but you collect insurance!</p>');
        credits = credits + (insurance * 2);
        gameEnd('deal');
        return;
    }
    $('#status').html("<p>The Dealer doesn't have Blackjack... no insurance for you...</p>");
    if(playerHand.cards[0].rank === playerHand.cards[1].rank){  //play resumes normally if the player doesnt collect
        $('#split').attr('disabled', false);
    }
    if((playerHand.val === 9) || (playerHand.val === 10) || (playerHand.val === 11)){
        $('#double').attr('disabled', false);
    }
    $('#hit').attr('disabled', false);  //enable our buttons!
    $('#stay').attr('disabled', false);
}

function noInsurance(){ //play resumes normally if the player chooses not to bet insurance
    if((playerHand.val == 21)&&(dealerHand.val == 21)){ //check for blackjacks!
        $('#status').html('<p>Its a Push</p>');
        $('#dealerhand').html("<img src=" + dealerHand.cards[0].img + "><img src=" + dealerHand.cards[1].img + ">");
        gameEnd('push');
        return;
    }
    if(playerHand.val == 21){
        $('#status').html('<p>Blackjack!</p>');
        gameEnd('play');
        return;
    }
    if(dealerHand.val == 21){
        $('#status').html('<p>The Dealer has a Blackjack...</p>');
        $('#dealerhand').html("<img src=" + dealerHand.cards[0].img + "><img src=" + dealerHand.cards[1].img + ">");
        gameEnd('deal');
        return;
    }
    $('#status').html('');
    if(playerHand.cards[0].rank === playerHand.cards[1].rank){
        $('#split').attr('disabled', false);
    }
    if(((playerHand.val === 9) || (playerHand.val === 10) || (playerHand.val === 11)) && credits >= bet){
        $('#double').attr('disabled', false);
    }
    $('#hit').attr('disabled', false);  //enable our buttons!
    $('#stay').attr('disabled', false);
}

function doubleDown(){  //the player doesn't get to keep playing after a double down, disable the buttons
    $('#hit').attr('disabled', true);
    $('#stay').attr('disabled', true);
    $('#split').attr('disabled', true);
    credits -= bet; //the bet is doubled
    bet *= 2;
    hitMe() //draw a single card (its impossible to bust on a double down)
    setTimeout(stay(), 2000);   //wait two seconds, then stay
}

function mySplit(){
    $('#split').attr('disabled', true); //disable the split button
    credits -= bet; //place the same bet on the new hand
    splitHand.cards.push(playerHand.cards.pop());   //the new hand is made from one of the cards of the old hand
    splitHand.val = splitHand.cards[0].value;
    playerHand.val -= splitHand.val;
    if(playerHand.val == 1){
        playerHand.val = 11;    //change aces counted as 1's into 11's
    }
    $('#credits').html("<p>Credits: " + credits + "</p>");
    $('#status').html('<p>You are currently playing the left hand.</p>');   //highlight and let the player know
    $('#splithand').css('background-color', 'gold');                    //which hand they are playing
    $('#playvalue').html('<p>Your hand has a value of ' + splitHand.val + '</p>');
    $('#splithand').html('<img src="' + splitHand.cards[0].img + '"/>');
    $('#playerhand').html('<img src="' + playerHand.cards[0].img + '"/>');
    firstSplit = true;  //this flag tells us we are on the first hand of the split 
    split = true;   //this flag tells us we are playing a split
}

function changeHand(){
    $('#status').html('<p>You are currently playing the right hand.</p>');  //let the player know the hands are changed
    $('#playvalue').html('<p>Your hand has a value of ' + playerHand.val + '</p>');
    $('#playerhand').css('background-color', 'gold');
    $('#splithand').css('background-color', '');
    $('#hit').attr('disabled', false);
    $('#stay').attr('disabled', false);
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
    if(split && (splitHand.val <= 21)){ //if the next hand isnt a bust, swap the hands and score the next one
        playerHand = splitHand;
        split = false;
        scoreHands();
    }
    setTimeout(reset, 2000);    //let this end state stand on the screen for 2 seconds, then reset
}

function reset(){
    $('#playerhand').html('');  //clear the hands
    $('#dealerhand').html('');
    $('#splithand').html('');
    $('#status').html('');  //clear the status
    $('#bet').html(''); //clear the bet
    $('#playvalue').html('');   //clear the hand values
    $('#dealvalue').html('');
    $('#placeBet').css('display', 'block'); //enable our button
    $('#placeBet').attr('disabled', false);
    $('#betIn').attr('max', credits);   //set the new max for our bet selector
    playerHand = { 
        val: 0,
        cards: []
    };              //fresh objects
    dealerHand = { 
        val: 0,
        cards: []
    };
    splitHand = {
        val: 0,
        cards: []
    };
    insurance = 0;
    if(credits == 0){   //player has to refresh the page if they run out of credits.
        $('#status').html('<p>You have run out of credits. Refresh the page to reset to 100.');
        $('#placeBet').attr('disabled', true);
    }
    $('#playerhand').css('background-color', '');   //get rid of the hand highlight
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