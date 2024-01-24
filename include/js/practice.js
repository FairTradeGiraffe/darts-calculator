//CurrentPlayer Variables
var CurrentPlayerIndex = 0;
var CurrentPlayerRemainingDarts = 3;
var CurrentCheckout = 0;
var CheckoutAttempts = 0;
var CheckoutSuccesses = 0;
var MaximumAmountOfSnapshots = 5;
var Snapshots = [];
var DartsThrown = [];

$(document).ready(function() {
    generateRandomNumber();
});

$('#quitpractice').click(function() {
    showExitPracticeModal();
});

$('#undomove').click(function() {
    restoreSnapshot();
});

$('#skipnumber').click(function() {
    generateRandomNumber();
});

$('#modal-footer').on("click", '#confirmExitPractice', function(e){
    window.location.href = "./index.php";
});

//Oh someone clicked on the numbers
$('.addpoints').click(function() {
    calc($(this).attr('data-value'));
});

function showExitPracticeModal(){
    var title = '<i class="fa-duotone fa-right-from-bracket fa-lg"></i> Beenden';
    var footer = '<button id="confirmExitPractice" type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-19.5rem;"><i class="fa-duotone fa-circle-check fa-lg"></i> Ja</button> <button type="button" class="btn btn-danger" data-bs-dismiss="modal"><i class="fa-duotone fa-circle-xmark fa-lg"></i> Nein</button>';
    var body = "Soll das Training wirklich beendet werden?";

    $('#modal-title').html(title);
    $('#modal-body').html(body);
    $('#modal-footer').html(footer);

    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    myModal.show();
    //myModal.hide(); 
}

$('input[type=radio][name=difficulty]').change(function() {
    generateRandomNumber();
});

function generateRandomNumber(){
    //Get Difficulty
    var difficulty = $('#difficulty input:radio:checked').val();
    var randomnumber = 0;

    //Easy = Up to 50
    //Medium = Up to 100
    //Hard = Up to 170
    do{
        switch(difficulty){
            case "easy":
                randomnumber = Math.floor((Math.random() * 50) + 2);
                break;
            case "medium":
                randomnumber = Math.floor((Math.random() * 100) + 2);
                break;
            case "hard":
                randomnumber = Math.floor((Math.random() * 170) + 2);
                break;
            default:
                randomnumber = Math.floor((Math.random() * 50) + 2);
                break;
        }
    }while(isBogeyNumber(randomnumber));

    //Save Number
    CurrentCheckout = randomnumber;
    //Show Checkoutnumber
    $('#random-checkout-number').html(randomnumber);
    //Calculate Checkoutroute
    SetDartIcons(CurrentPlayerRemainingDarts);
    displayCheckoutroute(0, false);

    //Reset DartsThrown
    DartsThrown = [];
    updateThrownDarts();
}

//Check if Number can be checked
function isBogeyNumber(randomnumber) {
    if ((randomnumber == 169) || (randomnumber == 168) || (randomnumber == 166) || (randomnumber == 165) || (randomnumber == 163) || (randomnumber == 162) || (randomnumber == 159)) {
        return true;
    }
    return false;
}

function randomCheckoutFailed(){

    CurrentPlayerRemainingDarts = 3;
    SetDartIcons(CurrentPlayerRemainingDarts);

    //Reset DartsThrown
    DartsThrown = [];
    updateThrownDarts();

    //Reset Checkoutvalue
    $('#random-checkout-number').html(CurrentCheckout);
    displayCheckoutroute(0, false);

    $('.numberboxanimation').addClass("numberAnimation_bad");
    setTimeout(function() { $('.numberboxanimation').removeClass("numberAnimation_bad"); }, 500);


    CheckoutAttempts++;
    $('#stats-random-checkout-failed-value').html(CheckoutAttempts);
}

function randomCheckoutSucceded(){

    CurrentPlayerRemainingDarts = 3;
    SetDartIcons(CurrentPlayerRemainingDarts);

    //Reset DartsThrown
    DartsThrown = [];
    updateThrownDarts();

    //Reset Checkoutvalue
    $('#random-checkout-number').html(generateRandomNumber());
    displayCheckoutroute(0, false);

    $('.numberboxanimation').addClass("numberAnimation_good");
    setTimeout(function() { $('.numberboxanimation').removeClass("numberAnimation_good"); }, 500);

    CheckoutSuccesses++;
    $('#stats-random-checkout-success-value').html(CheckoutSuccesses);

}


function displayCheckoutroute(calc_value, increaseCheckoutAttemptsbool) {

    var pointsToCheck = parseInt($('#random-checkout-number').html());

    //Under 170 and over 1 = Display Checkoutroute
    if ((pointsToCheck - calc_value <= 170)) {
        
        Logger("SpielerID "+CurrentPlayerIndex+" hat ein Checkout stehen ("+pointsToCheck+")");

        // Check, if the remaining score is able to be checked out
        if (typeof checkouts[pointsToCheck] == "object") {

            // Evaluate how many darts are needed to check out the current score
            var neededDarts = 0;
            var first = checkouts[pointsToCheck]['first'];
            var second = checkouts[pointsToCheck]['second'];
            var third = checkouts[pointsToCheck]['third'];

            // Add the first needed score to the checkout string
            var checkoutString = first;
            neededDarts++;

            // If a second score is needed to checkout the score, add it to checkout string
            if (second != '') {
                checkoutString += ' - ' + second;
                neededDarts++;
            }
            // If third dart is needed, add it to the checkout string
            if (third != '') {
                checkoutString += ' - ' + third;
                neededDarts++;
            }

            Logger("SpielerID "+CurrentPlayerIndex+" hat noch "+CurrentPlayerRemainingDarts+" Darts und benötigt für ein Checkout "+neededDarts+" Darts");

            // If one dart is needed we have a checkout! increase checkout attempt
            if (neededDarts == 1 && CurrentPlayerRemainingDarts <= 3) {
                //alert("We have a 1 Dart Finish!");
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+":  "+checkoutString);
                    $('#checkouthint').html(checkoutString);
                }
            }

            // Check if the player has enough throws remaining to check out the current score
            if (CurrentPlayerRemainingDarts >= neededDarts) {
                // The user has more remaining throws than needed for checkout - SHOW CHECKOUT TEXT!
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+":  "+checkoutString);
                    $('#checkouthint').html(checkoutString);
                }

            } else {
                //Alternative Checkoutroute
                if (typeof checkoutsalternative[pointsToCheck] == "object") {
                    // Evaluate how many darts are needed to check out the current score
                    var neededDartsalternative = 0;
                    //var CurrentPlayerRemainingDarts = readCurrentPlayerRemainingDarts();
                    var firstalternative = checkoutsalternative[pointsToCheck]['first'];
                    var secondalternative = checkoutsalternative[pointsToCheck]['second'];
                    var thirdalternative = checkoutsalternative[pointsToCheck]['third'];

                    // Add the first needed score to the checkout string
                    var checkoutStringalternative = firstalternative;
                    neededDartsalternative++;

                    // If a second score is needed to checkout the score, add it to checkout string
                    if (secondalternative != '') {
                        checkoutStringalternative += ' - ' + secondalternative;
                        neededDartsalternative++;
                    }
                    // If third dart is needed, add it to the checkout string
                    if (thirdalternative != '') {
                        checkoutStringalternative += ' - ' + thirdalternative;
                        neededDartsalternative++;
                    }
                    //alert(checkoutString);
                    // If one dart is needed we have a checkout! increase checkout attempt
                    if (neededDartsalternative == 1 && CurrentPlayerRemainingDarts <= 3) {
                        //alert("We have a 1 Dart Finish!");
                        if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                            Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+":  "+checkoutStringalternative);
                            $('#checkouthint').html(checkoutStringalternative);
                        }
                    }

                    // Check if the player has enough throws remaining to check out the current score
                    //alert("Thrown darts: "+CurrentPlayerRemainingDarts+" must be bigger or equal the needed darts: "+neededDarts);
                    if (CurrentPlayerRemainingDarts >= neededDartsalternative) {
                        // The user has more remaining throws than needed for checkout - SHOW CHECKOUT TEXT!
                        if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                            Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+":  "+checkoutStringalternative);
                            $('#checkouthint').html(checkoutStringalternative);
                        }

                    } else {

                        if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                            Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+": No Checkout!");
                            $('#checkouthint').html('No Checkout!');
                            //Practicemode - RandomCheckout failed
                            randomCheckoutFailed();
                        }
                    }
                } else {
                    if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                        Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+": No Checkout!");
                        $('#checkouthint').html('No Checkout!');
                        //Practicemode - RandomCheckout failed
                        randomCheckoutFailed();
                    }
                }

                //END Alternative Checkoutroute
            }

            if ((pointsToCheck == 169) || (pointsToCheck == 168) || (pointsToCheck == 166) || (pointsToCheck == 165) || (pointsToCheck == 163) || (pointsToCheck == 162) || (pointsToCheck == 159)) {
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+": Bogey-Number!");
                    $('#checkouthint').html('Bogey-Number!');
                    //Practicemode - RandomCheckout failed
                    randomCheckoutFailed();
                }
            }
            
        } else {
            if ((pointsToCheck == 169) || (pointsToCheck == 168) || (pointsToCheck == 166) || (pointsToCheck == 165) || (pointsToCheck == 163) || (pointsToCheck == 162) || (pointsToCheck == 159)) {
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+": Bogey-Number!");
                    $('#checkouthint').html('Bogey-Number!');
                    //Practicemode - RandomCheckout failed
                    randomCheckoutFailed();
                }
            }
        }
    }
}

function getCheckoutmode(){
    return "doubleout";
}

function showCheckoutpath(){
    return true;
}

function calc(value) {
    var points_left = parseInt($('#random-checkout-number').text());
    //convert throw to number, because a D20 is no real number
    //otherside inserting a numer e.g 3 is unclear - Single 3 or Tripple 1 ?
    var calc_value = "";

    switch (value) {
        //Singlefields
        case '20': calc_value = 20; break;
        case '19': calc_value = 19; break;
        case '18': calc_value = 18; break;
        case '17': calc_value = 17; break;
        case '16': calc_value = 16; break;
        case '15': calc_value = 15; break;
        case '14': calc_value = 14; break;
        case '13': calc_value = 13; break;
        case '12': calc_value = 12; break;
        case '11': calc_value = 11; break;
        case '10': calc_value = 10; break;
        case '9': calc_value = 9; break;
        case '8': calc_value = 8; break;
        case '7': calc_value = 7; break;
        case '6': calc_value = 6; break;
        case '5': calc_value = 5; break;
        case '4': calc_value = 4; break;
        case '3': calc_value = 3; break;
        case '2': calc_value = 2; break;
        case '1': calc_value = 1; break;
        //Doubles
        case 'D20': calc_value = 40; break;
        case 'D19': calc_value = 38; break;
        case 'D18': calc_value = 36; break;
        case 'D17': calc_value = 34; break;
        case 'D16': calc_value = 32; break;
        case 'D15': calc_value = 30; break;
        case 'D14': calc_value = 28; break;
        case 'D13': calc_value = 26; break;
        case 'D12': calc_value = 24; break;
        case 'D11': calc_value = 22; break;
        case 'D10': calc_value = 20; break;
        case 'D9': calc_value = 18; break;
        case 'D8': calc_value = 16; break;
        case 'D7': calc_value = 14; break;
        case 'D6': calc_value = 12; break;
        case 'D5': calc_value = 10; break;
        case 'D4': calc_value = 8; break;
        case 'D3': calc_value = 6; break;
        case 'D2': calc_value = 4; break;
        case 'D1': calc_value = 2; break;
        //Triples
        case 'T20': calc_value = 60; break;
        case 'T19': calc_value = 57; break;
        case 'T18': calc_value = 54; break;
        case 'T17': calc_value = 51; break;
        case 'T16': calc_value = 48; break;
        case 'T15': calc_value = 45; break;
        case 'T14': calc_value = 42; break;
        case 'T13': calc_value = 39; break;
        case 'T12': calc_value = 36; break;
        case 'T11': calc_value = 33; break;
        case 'T10': calc_value = 30; break;
        case 'T9': calc_value = 27; break;
        case 'T8': calc_value = 24; break;
        case 'T7': calc_value = 21; break;
        case 'T6': calc_value = 18; break;
        case 'T5': calc_value = 15; break;
        case 'T4': calc_value = 12; break;
        case 'T3': calc_value = 9; break;
        case 'T2': calc_value = 6; break;
        case 'T1': calc_value = 3; break;
        //Specials  
        case 'SB': calc_value = 25; break;
        case 'DB': calc_value = 50; break;
        case 'MISS': calc_value = 0; break;
        default: calc_value = 0; break;
    }

    //Create a Snapshot to UNDO Action
    createSnapshot();

    //Push thrown Dart to array
    DartsThrown.push(value);

    CurrentPlayerRemainingDarts--;
    SetDartIcons(CurrentPlayerRemainingDarts);

    //Does the player has darts left?
    if (CurrentPlayerRemainingDarts <= 0) {
        CurrentPlayerRemainingDarts = 3;
    }

    if ((points_left - calc_value < 0) || (points_left - calc_value == 1)) {
        //Overthrown
        randomCheckoutFailed();
    } else if ((points_left - calc_value === 0) && (value.startsWith("D") === true)) {
        //Finished
        if (CurrentPlayerRemainingDarts <= 3) {

            randomCheckoutSucceded();

        } else {
            //Player failed
            randomCheckoutFailed();
        }
    } else if (CurrentPlayerRemainingDarts >= 3) {
        //Player failed
        randomCheckoutFailed();
    } else if ((points_left - calc_value === 0) && (value.startsWith("D") !== true)) {
        //Player failed
        randomCheckoutFailed();
    } else {
        $('#random-checkout-number').html(points_left - calc_value);
    }


    displayCheckoutroute(calc_value,false);

    updateThrownDarts();

}

function updateThrownDarts(){
     //Thrown Darts
     var thrownDartsString = "";
     if(DartsThrown != null){
 
         if(DartsThrown.length > 0){
         thrownDartsString = "Geworfene Darts: ";
 
             for(let x = 0; x < DartsThrown.length; x++){
                 if(x > 0){
                     thrownDartsString += " - " +  DartsThrown[x];
                 }else{
                     thrownDartsString += DartsThrown[x];
                 }
             }
         }
     }
     $('#thrown-darts').html(thrownDartsString);
}

function createSnapshot(){

    //Deep copy of Array -> [...ARRAY] ITS POINTER AND REAL COPY IN MEMORY
    var Data = {};
    Data['CurrentPlayerIndex'] = CurrentPlayerIndex;
    Data['CurrentPlayerRemainingDarts'] = CurrentPlayerRemainingDarts;
    Data['CurrentCheckout'] = CurrentCheckout;
    Data['CheckoutAttempts'] = CheckoutAttempts;
    Data['CheckoutSuccesses'] = CheckoutSuccesses;
    Data['DartsThrown'] =  [...DartsThrown];;

    Snapshots.push(Data);

    Logger(Snapshots);

    //Maximum amount of Snapshots
    if(Snapshots.length != null && Snapshots.length >= MaximumAmountOfSnapshots){
        Snapshots.shift();
    }
}

function restoreSnapshot(){

    if(Snapshots.length != null && Snapshots.length <= 0){Logger("Kein Snapshot vorhanden.");notify("azurblue", "Information", "Kein weiterer UNDO möglich.");return;}

    var lastSnapshot = Snapshots[Snapshots.length - 1];


    CurrentPlayerIndex = lastSnapshot['CurrentPlayerIndex'];
    CurrentPlayerRemainingDarts = lastSnapshot['CurrentPlayerRemainingDarts'];
    CurrentCheckout = lastSnapshot['CurrentCheckout'];
    CheckoutAttempts = lastSnapshot['CheckoutAttempts'];
    CheckoutSuccesses = lastSnapshot['CheckoutSuccesses'];
    DartsThrown = [...lastSnapshot['DartsThrown']];


    SetDartIcons(CurrentPlayerRemainingDarts);
    $('#random-checkout-number').html(CurrentCheckout);
    $('#stats-random-checkout-failed-value').html(CheckoutAttempts);
    $('#stats-random-checkout-success-value').html(CheckoutSuccesses);
    displayCheckoutroute(0, false);

    updateThrownDarts();

    //Remove last Snapshot
    Snapshots.pop();
}