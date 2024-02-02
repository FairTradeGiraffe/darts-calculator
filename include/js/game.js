//Gamesettings Variables
var Gamemode, Checkoutmode, Checkoutpath, InputMethod, showRealColors, SelectedPlayers, activateMonitoring, DBAccessorKey, DBRefreshTime,Players;

//CurrentPlayer Variables
var CurrentPlayerIndex = 0;
var CurrentPlayerRemainingDarts = 3;
var CurrentPlayerRemainingPoints = [];
var CurrentPlayerScoredPoints = [];
var CurrentPlayerScoredFieldvalues = [];
//First Leg = Startplayer is the first array element, due to submitted selected player array in the bullseye winning order
var CurrentLegStartplayer = CurrentPlayerIndex;

//Store the PlayerAverages
var PlayerAverages = [];
//Store the PlayerHighscores
var PlayerHighscores = [];
//Store the PlayerCheckoutAttempts
var PlayerCheckoutAttempts = [];
//Store the PlayerCheckoutSuccesses
var PlayerCheckoutSuccesses = [];
//Store the PlayerWonLegs
var PlayerWonLegs = [];
//Store the PlayerInterface
var PlayerInterface = [];

//LEG BY LEG STATISTICS
//Store the PlayerThrownDarts
var PlayerThrownDarts = [];
//Store the PlayerLegAverages
var PlayerLegAverages = [];

//Localgame Variables
var GameOver = false;
var Snapshots = [];
var MaximumAmountOfSnapshots = 10;
           
//Define settings for creating snapshot settings
var SnapshotGameSettings = new Object();
//Store the Leghistory
var LegHistory = [];

//INITIALISE GAME STUFF

//No Pinch2Zoom
/*
window.addEventListener("touchstart", touchHandler, false);
document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) {  
       e.preventDefault();
    }
  }, {passive: false})*/

$(document).ready(function() {
    //Gamesettings ajax call to store in global vars
    //LoadGame();
    NewGameOrRestoreGame();
});

function getSearchParams(k){
    var p={};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
    return k?p[k]:p;
}

function isEmptyObject(object){
    var isEmpty = true;

    if(JSON.stringify(object)==JSON.stringify({})){
        // Object is Empty
        isEmpty = true;
      }
      else{
        //Object is Not Empty
        isEmpty = false;
      }
      return isEmpty;
}

function NewGameOrRestoreGame(){

    if(getSearchParams("loadGame") != null){
        Logger("LoadGame-Parameter übergeben: "+getSearchParams("loadGame"));

         if(getSearchParams("loadGame") == "true"){

            Logger("Vorheriges Spiel soll geladen werden...");

            //Does savedSessionData exists?
            var DBAccessorKeyLocal = getSearchParams("code");
            if(DBAccessorKeyLocal == null || DBAccessorKeyLocal == ""){
                notify("error", "Information", "Kein DBAccessorKey übermittelt.");
                Logger("Kein DBAccessorKey übermittelt. Starte normales Spiel...");
                LoadGame();
                return;
            }

            //AJAX Call to backend
            var ajaxRequest = new Object();
            ajaxRequest['action'] = 'GET';
            ajaxRequest['method'] = 'getSavedSessionDataAndPushItToSession';
            ajaxRequest['content'] = DBAccessorKeyLocal;
                            
            $.ajax({
                url: 'include/php/backend.php',
                type: 'post',
                data: ajaxRequest,
                success: function(data, status) {
                  //Logger(data);

                  data = JSON.parse(data);

                  if(data['statuscode']){
                
                      //Logger(data['content']);

                      if(data['content'] == "" || data['content'] == null){
                        notify("error", "Information", "DBAccessorKey hat kein gespeicherten Spielstand.");
                        LoadGame();
                        return;
                      }

                      //Content JSON DECODE
                      data['content'] = JSON.parse(data['content']);

                      //Zunächst GameSettings laden
                      if(data['content']['lastSnapshotSettings'] != null){
                        Logger("GameSettings wurden aus DB geladen und bereits in PHP-Session geladen...");

                        var gameSettings = data['content']['lastSnapshotSettings'];

                        Gamemode = gameSettings['Gamemode'];
                        Checkoutmode = gameSettings['Checkoutmode'];
                        Checkoutpath = gameSettings['Checkoutpath'];
                        InputMethod = gameSettings['InputMethod'];
                        showRealColors = gameSettings['showRealColors'];
                        SelectedPlayers = gameSettings['SelectedPlayers'];
                        Players = gameSettings['Players'];
                        activateMonitoring = gameSettings['activateMonitoring'];
                        DBAccessorKey = gameSettings['DBAccessorKey'];
                        DBRefreshTime = gameSettings['DBRefreshTime'];

                        SnapshotGameSettings['Gamemode'] = Gamemode;
                        SnapshotGameSettings['Checkoutmode'] = Checkoutmode;
                        SnapshotGameSettings['Checkoutpath'] = Checkoutpath;
                        SnapshotGameSettings['InputMethod'] = InputMethod;
                        SnapshotGameSettings['showRealColors'] = showRealColors;
                        SnapshotGameSettings['SelectedPlayers'] = SelectedPlayers;
                        SnapshotGameSettings['Players'] = Players;
                        SnapshotGameSettings['activateMonitoring'] = activateMonitoring;
                        SnapshotGameSettings['DBAccessorKey'] = DBAccessorKey;
                        SnapshotGameSettings['DBRefreshTime'] = DBRefreshTime;

                        //Logger(gameSettings);

                        //Set SnapshotGameSettings as GameSettings-Cookie
                        Cookies.set('GameSettings', JSON.stringify(gameSettings), { expires: 180, sameSite:'strict', secure: true });
                                
                        /*STARTGAME NESSESSARY */
                        //Build the playerlist
                        BuildPlayerlist();
                                
                        //Firstplayer in red
                        $('#playernamefield-' + CurrentPlayerIndex + '').css({ 'color': 'red' });
                        $('#playername-' + CurrentPlayerIndex + '').css({ 'border-color': 'red' });
                        SetDartIcons(CurrentPlayerRemainingDarts);
                        /*STARTGAME NESSESSARY */
                                
                        Logger("GameData wird geladen...");
                        Snapshots.push(data['content']['lastSnapshot']);
                        restoreSnapshot(); //Also updates StoreGameDatainDatabase
                                
                        StoreLegHistoryDataInDatabase();

                      }else{
                        Logger("GameSettings wurden in DB nicht gefunden... Starte normales Spiel.");
                        LoadGame();
                        return;
                    }
                  }
                  else{
                      notify("error", "Information", data['content']);
                      LoadGame();
                      return;
                  }
              
                },
                error: function(xhr, desc, err) {
                  Logger(xhr);
                  Logger("Details: " + desc + "\nError:" + err);
                }
              }); // end ajax call 
         }
         else{
            LoadGame();
            return;
         }
    }
    else{
        LoadGame();
        return;
    }
}


function LoadGame(){
   //AJAX Call to backend
   var ajaxRequest = new Object();
   ajaxRequest['action'] = 'GET';
   ajaxRequest['method'] = 'getGamesettings';
   ajaxRequest['content'] = null;

   $.ajax({
     url: 'include/php/backend.php',
     type: 'post',
     data: ajaxRequest,
     success: function(data, status) {
       Logger(data);

       data = JSON.parse(data);

       if(data['statuscode']){
           //Fill global vars
           Gamemode = data['content']['Gamemode'];
           Checkoutmode = data['content']['Checkoutmode'];
           Checkoutpath = data['content']['Checkoutpath'];
           InputMethod = data['content']['InputMethod'];
           showRealColors = data['content']['showRealColors'];
           SelectedPlayers = data['content']['SelectedPlayers'];
           Players = data['content']['Players'];
           activateMonitoring = data['content']['activateMonitoring'];
           DBAccessorKey = data['content']['DBAccessorKey'];
           DBRefreshTime = data['content']['DBRefreshTime'];

           //Its a new Game store the GameSettings in a Variable just in Case the user wants to save the game later...
           SnapshotGameSettings['Gamemode'] = Gamemode;
           SnapshotGameSettings['Checkoutmode'] = Checkoutmode;
           SnapshotGameSettings['Checkoutpath'] = Checkoutpath;
           SnapshotGameSettings['InputMethod'] = InputMethod;
           SnapshotGameSettings['showRealColors'] = showRealColors;
           SnapshotGameSettings['SelectedPlayers'] = SelectedPlayers;
           SnapshotGameSettings['Players'] = Players;
           SnapshotGameSettings['activateMonitoring'] = activateMonitoring;
           SnapshotGameSettings['DBAccessorKey'] = DBAccessorKey;
           SnapshotGameSettings['DBRefreshTime'] = DBRefreshTime;

           //StartGame
           StartGame();

       }
       else{
           notify("error", "Information", data['content']);
       }

     },
     error: function(xhr, desc, err) {
       Logger(xhr);
       Logger("Details: " + desc + "\nError:" + err);
     }
   }); // end ajax call 
}


function BuildPlayerlist() {
    //Use globalvar as Array
    var arr = SelectedPlayers;

    var string = "";
    for(var i=0; i<arr.length;i++){
      string+= '<li id="listelement-' + i + '" class="sidebar-table-players"><div class="col-md-12 col-xs-12 playername" id="playername-' + i + '"><div class="row"><div class="col-md-7 col-xs-7 playernamefield"><div class="row"><div class="col-md-12 col-xs-12"><p id="playernamefield-' + i + '">' + arr[i] + '</p></div></div><div class="row"><div class="col-md-12 col-xs-12 checkouthint"><p id="checkouthint-' + i + '"></p></div></div><div class="row"><div class="col-md-12 col-xs-12 checkouthint2"><p id="checkouthint2-' + i + '"></p></div></div></div><div class="col-md-5 col-xs-5 pointstocheck"><p class="pointstochecktext" id="pointstocheck-' + i + '">' + getStartPoints().toString() + '</p></div></div><div class="row actual-throw"><div class="col-md-4 col-xs-4" id="throw-one-' + i + '"></div><div class="col-md-4 col-xs-4" id="throw-two-' + i + '"></div><div class="col-md-4 col-xs-4" id="throw-three-' + i + '"></div></div><div class="row no-score"><div class="col-md-4 col-xs-4" id="no-score-one-' + i + '"></div><div class="col-md-4 col-xs-4" id="no-score-two-' + i + '"></div><div class="col-md-4" id="no-score-three-' + i + '"></div></div><div class="row statistics"><div class="col-md-4 col-xs-4 three-darts-avg" id="three-darts-avg-' + i + '"></div><div class="col-md-4 col-xs-4 highest-score" id="highest-score-' + i + '"></div><div class="col-md-4 col-xs-4 checkout-percentage" id="checkout-percentage-' + i + '"></div></div><div class="row latest-darts-throw"><div class="col-md-12 col-xs-12"><p class="latest-darts-throw" style="display: inline;" id="latest-darts-throw-score-' + i + '" ></p></div></div><div class="row"><div class="col-md-12 col-xs-12 won-legs-indicator" id="won-legs-indicator-' + i + '"></div></div></li>'
    }

    //Name instead of ID -> arr[i].replace(/\s/g, '')
  
    $('#playerlist').html(string);
}



function StartGame() {

    //Build the playerlist
    BuildPlayerlist();

    //Firstplayer in red
    $('#playernamefield-' + CurrentPlayerIndex + '').css({ 'color': 'red' });
    $('#playername-' + CurrentPlayerIndex + '').css({ 'border-color': 'red' });
    SetDartIcons(CurrentPlayerRemainingDarts);

    StoreGameDataInDatabase();
    StoreLegHistoryDataInDatabase();
}

function StoreSavedSessionDataInDatabase(){

    if(!activateMonitoring){
        return;
    }

    //Gibt keine Snapshots
    if(Snapshots.length == null || Snapshots.length <= 0){
        return;
    }

    //Get LastSnapshot
    var lastSnapshot = Snapshots[Snapshots.length - 1];

    var SavedSessionData = new Object();
    SavedSessionData['lastSnapshot'] = lastSnapshot;
    SavedSessionData['lastSnapshotSettings'] = SnapshotGameSettings;

    SavedSessionData = JSON.stringify(SavedSessionData);

    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'SET';
    ajaxRequest['method'] = 'saveSavedSessionData';
    ajaxRequest['content'] = SavedSessionData;
 
    $.ajax({
      url: 'include/php/backend.php',
      type: 'post',
      data: ajaxRequest,
      success: function(data, status) {
        //Logger(data);
 
        data = JSON.parse(data);
 
        if(data['statuscode']){
             //notify("azurblue", "Information", data['content']);
             Logger("SavedSessionData aktualisiert => DBAccessorKey: "+DBAccessorKey);
        }
        else{
            notify("error", "Information", data['content']);
        }
 
      },
      error: function(xhr, desc, err) {
        Logger(xhr);
        Logger("Details: " + desc + "\nError:" + err);
      }
    }); // end ajax call 
}

function StoreLegHistoryDataInDatabase(){

    if(!activateMonitoring){
        return;
    }

    var LegHistoryData = new Object();
    LegHistoryData['LegHistoryData'] = LegHistory;

    LegHistoryData = JSON.stringify(LegHistoryData);

    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'SET';
    ajaxRequest['method'] = 'saveLegHistoryData';
    ajaxRequest['content'] = LegHistoryData;
 
    $.ajax({
      url: 'include/php/backend.php',
      type: 'post',
      data: ajaxRequest,
      success: function(data, status) {
        //Logger(data);
 
        data = JSON.parse(data);
 
        if(data['statuscode']){
             //notify("azurblue", "Information", data['content']);
             Logger("LegHistoryData aktualisiert => DBAccessorKey: "+DBAccessorKey);
        }
        else{
            notify("error", "Information", data['content']);
        }
 
      },
      error: function(xhr, desc, err) {
        Logger(xhr);
        Logger("Details: " + desc + "\nError:" + err);
      }
    }); // end ajax call 
}


function StoreGameDataInDatabase(){

    if(!activateMonitoring){
        return;
    }

    var GameData = new Object();
    GameData['RemainingDarts'] = CurrentPlayerRemainingDarts;

    //BUILD PlayerData
    var GamePlayerDataArray = new Array();

    for (let x = 0; x < getAmountofPlayers(); x++) {

        var GamePlayerData = new Object();

        var isPlayersTurn = "0";
        if(x == CurrentPlayerIndex){
            isPlayersTurn = "1";
        }

        GamePlayerData['PlayerName'] = getPlayerValueString("playernamefield", x);
        GamePlayerData['PlayerScore'] = getPlayerValueString("pointstocheck", x);
        GamePlayerData['PlayerCheckouthint'] = getPlayerValueString("checkouthint", x);
        GamePlayerData['PlayerCheckouthint2'] = getPlayerValueString("checkouthint2", x);
        GamePlayerData['PlayersTurn'] = isPlayersTurn;

        GamePlayerData['Player-Throw-One'] = getPlayerValueString("throw-one", x);
        GamePlayerData['Player-Throw-Two'] = getPlayerValueString("throw-two", x);
        GamePlayerData['Player-Throw-Three'] = getPlayerValueString("throw-three", x);

        GamePlayerData['Player-No-Score-One'] = getPlayerValueString("no-score-one", x);
        GamePlayerData['Player-No-Score-Two'] = getPlayerValueString("no-score-two", x);
        GamePlayerData['Player-No-Score-Three'] = getPlayerValueString("no-score-three", x);

        GamePlayerData['Player-Three-Darts-Avg'] = getPlayerValueString("three-darts-avg", x);
        GamePlayerData['Player-Highest-Score'] = getPlayerValueString("highest-score", x);
        GamePlayerData['Player-Checkout-Percentage'] = getPlayerValueString("checkout-percentage", x);

        GamePlayerData['Player-Latest-Darts-Throw-Score'] = getPlayerValueString("latest-darts-throw-score", x);

        //GamePlayerData['Player-Won-Legs-Indicator'] = getPlayerValueString("won-legs-indicator", x);

        GamePlayerData['Player-WonLegs'] = 0;

        if(PlayerWonLegs[x] != null){
            GamePlayerData['Player-WonLegs'] = PlayerWonLegs[x]; 
        }


        GamePlayerDataArray.push(GamePlayerData);
    }

    GameData['PlayerData'] = GamePlayerDataArray;

    GameData = JSON.stringify(GameData);

   var ajaxRequest = new Object();
   ajaxRequest['action'] = 'SET';
   ajaxRequest['method'] = 'saveGameData';
   ajaxRequest['content'] = GameData;

   $.ajax({
     url: 'include/php/backend.php',
     type: 'post',
     data: ajaxRequest,
     success: function(data, status) {
       //Logger(data);

       data = JSON.parse(data);

       if(data['statuscode']){
            //notify("azurblue", "Information", data['content']);
            Logger("GameData aktualisiert => DBAccessorKey: "+DBAccessorKey);
       }
       else{
           notify("error", "Information", data['content']);
       }

     },
     error: function(xhr, desc, err) {
       Logger(xhr);
       Logger("Details: " + desc + "\nError:" + err);
     }
   }); // end ajax call 

}

function RestartGame() {

    //New Game
    GameOver = false;

    //PlayerThrownDarts reset
    PlayerThrownDarts = [];
    //PlayerLegAverages reset
    PlayerLegAverages = [];

    for (let x = 0; x < getAmountofPlayers(); x++) {
        $('#three-darts-avg-' + x + '').html("Average: " + getCalculatedAverage(x));
        $('#highest-score-' + x + '').html("Highscore: " + getHighscore(x));
        $('#won-legs-indicator-' + x + '').html(getWonLegsString(x));

        //Hide Last throwed Points cuz restart
        $('#latest-darts-throw-score-' + x + '').hide();
        //Clear Last hidden fields
        $('#throw-one-' + x + '').html('');
        $('#throw-two-' + x + '').html('');
        $('#throw-three-' + x + '').html('');
        //Clear no score/no double
        $('#no-score-one-' + x + '').html('');
        $('#no-score-two-' + x + '').html('');
        $('#no-score-three-' + x + '').html('');


        if (getCheckoutmode() != 'straightout') {

            var CheckoutInfo = getCheckoutPercentage(x);

            $('#checkout-percentage-' + x + '').html("Checkout: " + CheckoutInfo['Rate'] + "% (" + CheckoutInfo['Success'] + "/" + CheckoutInfo['Attempts'] + ")");
        }

        $('#pointstocheck-' + x + '').html(getStartPoints());

    }

    //Next player with CurrentLegStartplayer logic in mind
    nextPlayer(true);

    //Mark the firstplayer
    $('#playernamefield-' + CurrentPlayerIndex + '').css({ 'color': 'red' });
    $('#playername-' + CurrentPlayerIndex + '').css({ 'border-color': 'red' });
    SetDartIcons(CurrentPlayerRemainingDarts);

    //Game restart update
    StoreGameDataInDatabase();
}

//GAME LOGIC

//Playerelement Getter
function getPlayerValue(Elementname){
    return parseInt($('#' + Elementname + '-' + CurrentPlayerIndex + '').text());
}
function getPlayerValueString(Elementname, PlayerID){
    return $('#' + Elementname + '-' + PlayerID + '').text();
}
//Playerelement Setter
function setPlayerValueString(Elementname, PlayerID, Value){
    $('#' + Elementname + '-' + PlayerID + '').html(Value);
}

function getPlayerName(){
    return $('#playernamefield-' + CurrentPlayerIndex + '').text();
}

function getStartPoints(){
    return parseInt(Gamemode);
}

function getCheckoutmode(){
    return Checkoutmode;
}

function getAmountofPlayers(){
    return parseInt(SelectedPlayers.length);
}

function showCheckoutpath(){
    var setting = false;
    switch(Checkoutpath){
        case "yes": setting = true; break;
        case "no": setting = false; break;
        default: setting = false; break;
    }
    return setting;
}

function currentDatetime(){
  
    var d = new Date();
  
    var month = d.getMonth()+1;
    var day = d.getDate();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
  
    var output = d.getFullYear() + "-" + (month<10 ? '0' : '') + month + "-" + (day<10 ? '0' : '') + day + " " + (hours<10 ? '0' : '') + hours + ":" + (minutes<10 ? '0' : '') + minutes + ":" + (seconds<10 ? '0' : '') + seconds;

    return output;
}

function getGermanDateTime(date){

    //Fix for Safari
    date = date.replace(/ /g,"T");
  
    var d = new Date(date);
  
    var month = d.getMonth()+1;
    var day = d.getDate();
    var hour =  d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds();
  
    var output = (day<10 ? '0' : '') + day + "." + (month<10 ? '0' : '') + month + "." + d.getFullYear() + " - " +(hour<10 ? '0' : '') + hour + ":" +(min<10 ? '0' : '') + min + ":" +(sec<10 ? '0' : '') + sec;
    return output;
}

function AnimateNextPlayer() {
    $($('#listelement-' + CurrentPlayerIndex + '')).parent().prepend($('#listelement-' + CurrentPlayerIndex + ''));
}

function displayCheckoutroute(calc_value, increaseCheckoutAttemptsbool) {

    var pointsToCheck = getPlayerValue('pointstocheck');

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
                    $('#checkouthint-' + CurrentPlayerIndex + '').html(checkoutString);
                    $('#checkouthint2-' + CurrentPlayerIndex + '').html("");
                }
                if (increaseCheckoutAttemptsbool) {
                    increaseCheckoutAttempts(CurrentPlayerIndex);
                    Logger("Checkout ist möglich (1-Dart Finish) für SpielerID "+CurrentPlayerIndex+": Erhöhe CheckoutAttempts.");
                }
            }

            // Check if the player has enough throws remaining to check out the current score
            if (CurrentPlayerRemainingDarts >= neededDarts) {
                // The user has more remaining throws than needed for checkout - SHOW CHECKOUT TEXT!
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+":  "+checkoutString);
                    $('#checkouthint-' + CurrentPlayerIndex + '').html(checkoutString);
                    $('#checkouthint2-' + CurrentPlayerIndex + '').html("");

                    //This Checkoutpath has for 50 Points 10 - D20 as Path, but we need to make sure to increase attempt when user decides to throw bulleye
                    if(pointsToCheck == 50){
                        increaseCheckoutAttempts(CurrentPlayerIndex);
                        Logger("Checkout ist möglich (BullsEye) für SpielerID "+CurrentPlayerIndex+": Erhöhe CheckoutAttempts.");
                    }
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
                            $('#checkouthint-' + CurrentPlayerIndex + '').html(checkoutStringalternative);
                            $('#checkouthint2-' + CurrentPlayerIndex + '').html("");
                        }
                        //This Checkoutpath has BULLSEYE at 50 Points
                        if (increaseCheckoutAttemptsbool) {
                            increaseCheckoutAttempts(CurrentPlayerIndex);
                            Logger("Checkout ist möglich (1-Dart Finish) für SpielerID "+CurrentPlayerIndex+": Erhöhe CheckoutAttempts.");
                        }
                    }

                    // Check if the player has enough throws remaining to check out the current score
                    //alert("Thrown darts: "+CurrentPlayerRemainingDarts+" must be bigger or equal the needed darts: "+neededDarts);
                    if (CurrentPlayerRemainingDarts >= neededDartsalternative) {
                        // The user has more remaining throws than needed for checkout - SHOW CHECKOUT TEXT!
                        if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                            Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+":  "+checkoutStringalternative);
                            $('#checkouthint-' + CurrentPlayerIndex + '').html(checkoutStringalternative);
                            $('#checkouthint2-' + CurrentPlayerIndex + '').html("");
                        }

                    } else {

                        if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                            Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+": No Checkout! ("+checkoutStringalternative+")");
                            $('#checkouthint-' + CurrentPlayerIndex + '').html('No Checkout!');
                            $('#checkouthint2-' + CurrentPlayerIndex + '').html("("+checkoutStringalternative+")");
                        }
                    }
                } else {
                    if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                        Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+": No Checkout! ("+checkoutString+")");
                        $('#checkouthint-' + CurrentPlayerIndex + '').html('No Checkout!');
                        $('#checkouthint2-' + CurrentPlayerIndex + '').html("("+checkoutString+")");
                    }
                }

                //END Alternative Checkoutroute
            }

            if ((pointsToCheck == 169) || (pointsToCheck == 168) || (pointsToCheck == 166) || (pointsToCheck == 165) || (pointsToCheck == 163) || (pointsToCheck == 162) || (pointsToCheck == 159)) {
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 2 für SpielerID "+CurrentPlayerIndex+": Bogey-Number!");
                    $('#checkouthint-' + CurrentPlayerIndex + '').html('Bogey-Number!');
                    $('#checkouthint2-' + CurrentPlayerIndex + '').html("");
                }
            }
            
        } else {
            if ((pointsToCheck == 169) || (pointsToCheck == 168) || (pointsToCheck == 166) || (pointsToCheck == 165) || (pointsToCheck == 163) || (pointsToCheck == 162) || (pointsToCheck == 159)) {
                if ((showCheckoutpath()) && (getCheckoutmode() != 'straightout')) {

                    Logger("Checkout-Weg 1 für SpielerID "+CurrentPlayerIndex+": Bogey-Number!");
                    $('#checkouthint-' + CurrentPlayerIndex + '').html('Bogey-Number!');
                    $('#checkouthint2-' + CurrentPlayerIndex + '').html("");
                }
            }
        }
    }
}

function createSnapshot(){

    var PlayerInterfaces = [];

    for(let x = 0; x < getAmountofPlayers(); x++){
        var PlayerInterface = {};
        PlayerInterface['pointstocheck'] = getPlayerValueString("pointstocheck", x);
        PlayerInterface['playernamefield'] = getPlayerValueString("playernamefield", x);
        PlayerInterface['checkouthint'] = getPlayerValueString("checkouthint", x);
        PlayerInterface['checkouthint2'] = getPlayerValueString("checkouthint2", x);

        PlayerInterface['throw-one'] = getPlayerValueString("throw-one", x);
        PlayerInterface['throw-two'] = getPlayerValueString("throw-two", x);
        PlayerInterface['throw-three'] = getPlayerValueString("throw-three", x);

        PlayerInterface['no-score-one'] = getPlayerValueString("no-score-one", x);
        PlayerInterface['no-score-two'] = getPlayerValueString("no-score-two", x);
        PlayerInterface['no-score-three'] = getPlayerValueString("no-score-three", x);

        PlayerInterface['three-darts-avg'] = getPlayerValueString("three-darts-avg", x);
        PlayerInterface['highest-score'] = getPlayerValueString("highest-score", x);
        PlayerInterface['checkout-percentage'] = getPlayerValueString("checkout-percentage", x);

        PlayerInterface['latest-darts-throw-score'] = getPlayerValueString("latest-darts-throw-score", x);

        //PlayerInterface['won-legs-indicator'] = getPlayerValueString("won-legs-indicator", x);

        //Now push that Element into that Array
        PlayerInterfaces.push(PlayerInterface);
    }

    //Deep copy of Array -> [...ARRAY] ITS POINTER AND REAL COPY IN MEMORY
    var Data = {};
    Data['CurrentPlayerIndex'] = CurrentPlayerIndex;
    Data['CurrentLegStartplayer'] = CurrentLegStartplayer;
    Data['CurrentPlayerRemainingDarts'] = CurrentPlayerRemainingDarts;
    Data['CurrentPlayerRemainingPoints'] = [...CurrentPlayerRemainingPoints];
    Data['CurrentPlayerScoredPoints'] = [...CurrentPlayerScoredPoints];
    Data['CurrentPlayerScoredFieldvalues'] = [...CurrentPlayerScoredFieldvalues];

    Data['PlayerAverages'] = [...PlayerAverages];
    Data['PlayerHighscores'] = [...PlayerHighscores];
    Data['PlayerCheckoutAttempts'] = [...PlayerCheckoutAttempts];
    Data['PlayerCheckoutSuccesses'] = [...PlayerCheckoutSuccesses];
    Data['PlayerWonLegs'] = [...PlayerWonLegs];
    Data['PlayerInterface'] = [...PlayerInterfaces];
    Data['PlayerThrownDarts'] = [...PlayerThrownDarts];
    Data['PlayerLegAverages'] = [...PlayerLegAverages];
    Data['LegHistory'] = [...LegHistory];

    Data['GameOver'] = GameOver;

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

    //Logger(lastSnapshot);

    for(let x = 0; x < getAmountofPlayers(); x++){
        Logger("Setze SpielerID "+x+" PointsToCheck auf "+lastSnapshot['PlayerInterface'][x]['pointstocheck']);
        setPlayerValueString("pointstocheck", x, lastSnapshot['PlayerInterface'][x]['pointstocheck']);
        setPlayerValueString("playernamefield", x, lastSnapshot['PlayerInterface'][x]['playernamefield']);
        setPlayerValueString("checkouthint", x, lastSnapshot['PlayerInterface'][x]['checkouthint']);
        setPlayerValueString("checkouthint2", x, lastSnapshot['PlayerInterface'][x]['checkouthint2']);

        setPlayerValueString("throw-one", x, lastSnapshot['PlayerInterface'][x]['throw-one']);
        setPlayerValueString("throw-two", x, lastSnapshot['PlayerInterface'][x]['throw-two']);
        setPlayerValueString("throw-three", x, lastSnapshot['PlayerInterface'][x]['throw-three']);

        setPlayerValueString("no-score-one", x, lastSnapshot['PlayerInterface'][x]['no-score-one']);
        setPlayerValueString("no-score-two", x, lastSnapshot['PlayerInterface'][x]['no-score-two']);
        setPlayerValueString("no-score-three", x, lastSnapshot['PlayerInterface'][x]['no-score-three']);

        setPlayerValueString("three-darts-avg", x, lastSnapshot['PlayerInterface'][x]['three-darts-avg']);
        setPlayerValueString("highest-score", x, lastSnapshot['PlayerInterface'][x]['highest-score']);
        setPlayerValueString("checkout-percentage", x, lastSnapshot['PlayerInterface'][x]['checkout-percentage']);

        setPlayerValueString("latest-darts-throw-score", x, lastSnapshot['PlayerInterface'][x]['latest-darts-throw-score']);

        //setPlayerValueString("won-legs-indicator", x, lastSnapshot['PlayerInterface'][x]['won-legs-indicator']);

        //Unset Bordercolors
        $('#playernamefield-' + x + '').css({ 'color': '' });
        $('#playername-' + x + '').css({ 'border-color': 'white' });
    }

    //Deep copy of Array -> [...ARRAY] ITS POINTER AND REAL COPY IN MEMORY
    CurrentPlayerIndex = lastSnapshot['CurrentPlayerIndex'];
    CurrentPlayerRemainingDarts = lastSnapshot['CurrentPlayerRemainingDarts'];
    CurrentPlayerRemainingPoints = [...lastSnapshot['CurrentPlayerRemainingPoints']];
    CurrentPlayerScoredPoints = [...lastSnapshot['CurrentPlayerScoredPoints']];
    CurrentPlayerScoredFieldvalues = [...lastSnapshot['CurrentPlayerScoredFieldvalues']];
    CurrentLegStartplayer = lastSnapshot['CurrentLegStartplayer'];

    PlayerAverages = [...lastSnapshot['PlayerAverages']];
    PlayerHighscores = [...lastSnapshot['PlayerHighscores']];
    PlayerCheckoutAttempts = [...lastSnapshot['PlayerCheckoutAttempts']];
    PlayerCheckoutSuccesses = [...lastSnapshot['PlayerCheckoutSuccesses']];
    PlayerWonLegs = [...lastSnapshot['PlayerWonLegs']];
    PlayerThrownDarts = [...lastSnapshot['PlayerThrownDarts']];
    PlayerLegAverages = [...lastSnapshot['PlayerLegAverages']];
    LegHistory = [...lastSnapshot['LegHistory']];

    //FIX BUT WHY NEEDED?
    if(PlayerAverages[CurrentPlayerIndex] != null){
        PlayerAverages[CurrentPlayerIndex].pop();
    }

    //FIX FOR AVERAGES AGAIN BUT WHY NEEDED?!?
    if(PlayerLegAverages[CurrentPlayerIndex] != null){
        PlayerLegAverages[CurrentPlayerIndex].pop();
    }

    //Loop through players and set values - WonLegs, Averages, etc.
    for(let x = 0; x < getAmountofPlayers(); x++){
        $('#won-legs-indicator-' + x + '').html(getWonLegsString(x));
    }

    SetDartIcons(CurrentPlayerRemainingDarts);
    displayCheckoutroute(0, false);


    AnimateNextPlayer();
    $('#playernamefield-' + CurrentPlayerIndex + '').css({ 'color': 'red' });
    $('#playername-' + CurrentPlayerIndex + '').css({ 'border-color': 'red' });

    //Remove last Snapshot
    Snapshots.pop();

    //Update Monitoring
    StoreGameDataInDatabase();
}



function nextPlayer(GameRestart = false) {

    //Delete old stuff from previous player
    for (let x = 0; x < getAmountofPlayers(); x++) {
        $('#playernamefield-' + x + '').css({ 'color': '' });
        $('#playername-' + x + '').css({ 'border-color': 'white' });
        $('#checkouthint-' + x + '').html('');
        $('#checkouthint2-' + x + '').html('');
    }

    var oldCurrentPlayerIndex = CurrentPlayerIndex;
    var oldCurrentLegSartplayer = CurrentLegStartplayer;

    //Its restart - check who started the leg and whos next...
    if(GameRestart){

        if (CurrentLegStartplayer < getAmountofPlayers() - 1) {
            CurrentLegStartplayer++;
        }
        else {
            CurrentLegStartplayer = 0;
        }

        CurrentPlayerIndex = CurrentLegStartplayer;

        Logger("GameRestart! Voriges Leg wurde von SpielerID "+oldCurrentLegSartplayer+" begonnen, nun also SpielerID "+CurrentLegStartplayer+"");
    }
    else{
        
        //Next Player with -1 because Index is at 0
        if (CurrentPlayerIndex < getAmountofPlayers() - 1) {
            CurrentPlayerIndex++;
        }
        else {
            CurrentPlayerIndex = 0;
        }
        Logger("Nächster Spieler... Bisher SpielerID "+oldCurrentPlayerIndex+" und nun SpielerID "+CurrentPlayerIndex+"");
    }


    AnimateNextPlayer();
    $('#playernamefield-' + CurrentPlayerIndex + '').css({ 'color': 'red' });
    $('#playername-' + CurrentPlayerIndex + '').css({ 'border-color': 'red' });

    //Thrown Darts reset
    CurrentPlayerRemainingPoints = [];

    //Highscore Array reset
    CurrentPlayerScoredPoints = [];

    //Scored PlayerFieldvalues reset
    CurrentPlayerScoredFieldvalues = [];

    //Just in Case
    CurrentPlayerRemainingDarts = 3;
    SetDartIcons(CurrentPlayerRemainingDarts);


    //OH next player throws the first dart - lets delete the privious values
    //Delete No-Score Display
    $('#no-score-one-' + CurrentPlayerIndex + '').html('');
    $('#no-score-two-' + CurrentPlayerIndex + '').html('');
    $('#no-score-three-' + CurrentPlayerIndex + '').html('');
    //Delete privious scores
    $('#throw-one-' + CurrentPlayerIndex + '').html('');
    $('#throw-two-' + CurrentPlayerIndex + '').html('');
    $('#throw-three-' + CurrentPlayerIndex + '').html('');


    //Display the checkoutroute for the next player before he throwed
    displayCheckoutroute(0, false);
    
    return CurrentPlayerIndex;
}

function setHighscore(highscore){

    var isHigher = false;

    if(highscore == null){highscore = 0;}

    if(PlayerHighscores != null){
        if(PlayerHighscores[CurrentPlayerIndex] != null){
            var highscoreold = PlayerHighscores[CurrentPlayerIndex];

            if(highscore > highscoreold){
                PlayerHighscores[CurrentPlayerIndex] = highscore;
                Logger("PlayerHighscores für diesen SpielerID "+CurrentPlayerIndex+" gibt es bereits. Wird erhöht auf "+highscore+"");
                isHigher = true;
            }

            Logger("PlayerHighscores für diesen SpielerID "+CurrentPlayerIndex+" gibt es bereits. Allerdings bereits höherer Highscore vorhanden ("+highscoreold+")");
        }
        else{
            PlayerHighscores[CurrentPlayerIndex] = highscore;
            Logger("PlayerHighscores für diesen SpielerID "+CurrentPlayerIndex+" gibt es noch nicht. Wird angelegt mit "+highscore+"");
        }
    }else{
        Logger("PlayerHighscores ist noch garnicht bekannt. Wird angelegt...");
        PlayerHighscores[CurrentPlayerIndex] = highscore;
        isHigher = true;
    }

    return isHigher;
}

function getHighscore(PlayerID){

    var highscore = 0;

    if(PlayerHighscores != null){
        if(PlayerHighscores[PlayerID] != null){
            highscore = PlayerHighscores[PlayerID];
            Logger("PlayerHighscores für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen ("+highscore+")");
        }
    }

    Logger("PlayerHighscores für diesen SpielerID "+PlayerID+" gibt es noch nicht. Liefere Wert 0 zurück...");
    return highscore;
}


function getCheckoutPercentage(PlayerID) {

    var CheckoutInfo = [];
    var checkoutSuccessful = 0;
    var checkoutAttempts = 0;
    var percentage = 0;

    checkoutAttempts = parseInt(getCheckoutAttempts(PlayerID));
    checkoutSuccessful = parseInt(getCheckoutSuccesses(PlayerID));

    
    if (checkoutSuccessful > 0) {

        //Dont do 1/0 = INFINITY
        if(checkoutAttempts > 0){
            percentage = (100 / checkoutAttempts) * checkoutSuccessful;
            percentage = percentage.toFixed(2);
        }else{
            percentage = 100;
        }
    }

    Logger("Berechne Checkout für SpielerID "+PlayerID+" mit Erfolgen/Misserfolge ("+checkoutSuccessful+"/"+checkoutAttempts+") = "+percentage+"");

    CheckoutInfo['Attempts'] = checkoutAttempts;
    CheckoutInfo['Success'] = checkoutSuccessful;
    CheckoutInfo['Rate'] = percentage;

    return CheckoutInfo;
}

function updateDisplayedThrownDarts(value, calc_value, overthrown, nodouble) {

    var calc_throw_helper_string = "";

    Logger("SpielerID "+CurrentPlayerIndex+" hat noch "+CurrentPlayerRemainingDarts+" Darts auf der Hand.");

    //How many darts does the player have?
    if (CurrentPlayerRemainingDarts == 3) {
        if (overthrown === true) {
            Logger("SpielerID "+CurrentPlayerIndex+" hat sich bei "+CurrentPlayerRemainingDarts+" Restdarts überworfen. Restdarts manuell auf 0 gesetzt.");
            CurrentPlayerRemainingDarts = 0;
            calc_throw_helper_string = 'one';
            $('#throw-two-' + CurrentPlayerIndex + '').html('');
            $('#throw-three-' + CurrentPlayerIndex + '').html('');
        } else if (nodouble === true) {
            calc_throw_helper_string = 'one';
            $('#no-score-one-' + CurrentPlayerIndex + '').html('(No Double)');
        } else {
            calc_throw_helper_string = 'one';
        }
    } else if (CurrentPlayerRemainingDarts == 2) {
        if (overthrown === true) {
            Logger("SpielerID "+CurrentPlayerIndex+" hat sich bei "+CurrentPlayerRemainingDarts+" Restdarts überworfen. Restdarts manuell auf 0 gesetzt.");
            CurrentPlayerRemainingDarts = 0;
            calc_throw_helper_string = 'two';
            $('#throw-three-' + CurrentPlayerIndex + '').html('');
        } else if (nodouble === true) {
            calc_throw_helper_string = 'two';
            $('#no-score-two-' + CurrentPlayerIndex + '').html('(No Double)');
        } else {
            calc_throw_helper_string = 'two';
        }
    } else {
        if (overthrown === true) {
            Logger("SpielerID "+CurrentPlayerIndex+" hat sich bei "+CurrentPlayerRemainingDarts+" Restdarts überworfen. Restdarts manuell auf 0 gesetzt.");
            calc_throw_helper_string = 'three';
            CurrentPlayerRemainingDarts = 0;
        } else if (nodouble === true) {
            calc_throw_helper_string = 'three';
            $('#no-score-three-' + CurrentPlayerIndex + '').html('(No Double)');
        } else {
            calc_throw_helper_string = 'three';
        }
    }


    $('#throw-' + calc_throw_helper_string + '-' + CurrentPlayerIndex + '').html(value);

    //Okay lets decrease 1 Dart
    CurrentPlayerRemainingDarts--;
    SetDartIcons(CurrentPlayerRemainingDarts);

    //Does the player has darts left?
    if (CurrentPlayerRemainingDarts <= 0) {

        //Reset RemainingDarts for the next player
        CurrentPlayerRemainingDarts = 3;
        SetDartIcons(CurrentPlayerRemainingDarts);

        //Is it a new Highscore? - Only count if not created when overthrowed
        //coverter converts a "T20" to Number 60
        var highscore = 0;
        var previouslythrown = 0;


        for(let x = 0; x < 3; x++){

            if(overthrown === false){
                highscore +=  CurrentPlayerScoredPoints[x];
            }

            //Add this position if it exists to current thrown
            if(CurrentPlayerScoredPoints[x] != null){
                previouslythrown += parseInt(CurrentPlayerScoredPoints[x]);
            }
            
        }
 
        //DoubleInDoubleOut - No DoubleIn throwed
        if (nodouble === true) {
            setHighscore(0);
        } else {
            setHighscore(highscore);
        }

        //Highscore setzen
        $('#highest-score-' + CurrentPlayerIndex + '').html("Highscore: " + getHighscore(CurrentPlayerIndex));

    

        //Build Previously thrown string
        var previouslythrownstring = "";
        if(nodouble === true){previouslythrownstring = previouslythrown+" (No Double)";}
        else if(overthrown === true){previouslythrownstring = previouslythrown+" (No Score)";}
        else if(previouslythrown == 0){previouslythrownstring = previouslythrown+" (No Score)";}
        else{previouslythrownstring = previouslythrown;}

        //Add the thrown Field to the thrown string
        if(CurrentPlayerScoredFieldvalues != null){
            
            previouslythrownstring += " [ ";

            for(let z = 0; z < 3; z++){

                if(CurrentPlayerScoredFieldvalues[z] != null){

                    if(z > 0){
                        previouslythrownstring += " - "; 
                    }
                    previouslythrownstring += CurrentPlayerScoredFieldvalues[z];
                }
            }

            previouslythrownstring += " ]";
        }

        $('#latest-darts-throw-score-' + CurrentPlayerIndex + '').html('Previously thrown: ' + previouslythrownstring);
        $('#latest-darts-throw-score-' + CurrentPlayerIndex + '').show();

        if (GameOver == false) {

            var CheckoutInfo = getCheckoutPercentage(CurrentPlayerIndex);

            $('#checkout-percentage-' + CurrentPlayerIndex + '').html("Checkout: " + CheckoutInfo['Rate'] + "% (" + CheckoutInfo['Success'] + "/" + CheckoutInfo['Attempts'] + ")");

            //Call nextplayer
            nextPlayer();
        }
    }
}

function increaseCheckoutSuccesses(PlayerID){

    var checkoutsuccess = 0;

    if(PlayerCheckoutSuccesses != null){
        if(PlayerCheckoutSuccesses[PlayerID] != null){
            checkoutsuccess = PlayerCheckoutSuccesses[PlayerID];
            checkoutsuccess++;
            PlayerCheckoutSuccesses[PlayerID] = checkoutsuccess;
            Logger("PlayerCheckoutSuccesses für diesen SpielerID "+PlayerID+" gibt es bereits. Wird erhöht auf "+checkoutsuccess+"");
        }
        else{
            checkoutsuccess++;
            PlayerCheckoutSuccesses[PlayerID] = checkoutsuccess;
            Logger("PlayerCheckoutSuccesses für diesen SpielerID "+PlayerID+" gibt es noch nicht. Wird angelegt mit "+checkoutsuccess+"");
        }
    }else{
        Logger("PlayerCheckoutSuccesses ist noch garnicht bekannt. Wird angelegt...");
        checkoutsuccess++;
        PlayerCheckoutSuccesses[PlayerID] = checkoutsuccess;
    }
}

function increaseCheckoutAttempts(PlayerID) {

    var checkoutAttempts = 0;

        if(PlayerCheckoutAttempts != null){
            if(PlayerCheckoutAttempts[PlayerID] != null){
                checkoutAttempts = PlayerCheckoutAttempts[PlayerID];
                checkoutAttempts++;
                PlayerCheckoutAttempts[PlayerID] = checkoutAttempts;
                Logger("PlayerCheckoutAttempts für diesen SpielerID "+PlayerID+" gibt es bereits. Wird erhöht auf "+checkoutAttempts+"");
            }
            else{
                checkoutAttempts++;
                PlayerCheckoutAttempts[PlayerID] = checkoutAttempts;
                Logger("PlayerCheckoutAttempts für diesen SpielerID "+PlayerID+" gibt es noch nicht. Wird angelegt mit "+checkoutAttempts+"");
            }
        }else{
            Logger("PlayerCheckoutAttempts ist noch garnicht bekannt. Wird angelegt...");
            checkoutAttempts++;
            PlayerCheckoutAttempts[PlayerID] = checkoutAttempts;
        }
}

function getCheckoutSuccesses(PlayerID){

    var checkoutsuccess = 0;

    if(PlayerCheckoutSuccesses != null){
        if(PlayerCheckoutSuccesses[PlayerID] != null){
            checkoutsuccess = PlayerCheckoutSuccesses[PlayerID];
            Logger("PlayerCheckoutSuccesses für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen ("+checkoutsuccess+")");
        }
    }

    Logger("PlayerCheckoutSuccesses für diesen SpielerID "+PlayerID+" gibt es noch nicht. Liefere Wert 0 zurück...");
    return checkoutsuccess;
}

function getCheckoutAttempts(PlayerID){

    var checkoutattempts = 0;

    if(PlayerCheckoutAttempts != null){
        if(PlayerCheckoutAttempts[PlayerID] != null){
            checkoutattempts = PlayerCheckoutAttempts[PlayerID];
            Logger("PlayerCheckoutAttempts für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen ("+checkoutattempts+")");
        }
    }

    Logger("PlayerCheckoutAttempts für diesen SpielerID "+PlayerID+" gibt es noch nicht. Liefere Wert 0 zurück...");
    return checkoutattempts;
}

function savePlayerLegAverage(PlayerID,PointsScored){
    if(PointsScored == null){PointsScored = 0;}

    var PointsScoredArray = [];

    if(PlayerLegAverages != null){
        if(PlayerLegAverages[PlayerID] != null){
            PointsScoredArray = PlayerLegAverages[PlayerID];
            PointsScoredArray.push(PointsScored);
            PlayerLegAverages[PlayerID] = PointsScoredArray;
            Logger("PlayerLegAverages für diesen SpielerID "+PlayerID+" gibt es bereits. Wird erweitert um "+PointsScored);
        }
        else{
            Logger("PlayerLegAverages für diesen SpielerID "+PlayerID+" gibt es noch nicht. Wird angelegt...");
            PointsScoredArray.push(PointsScored);
            PlayerLegAverages[PlayerID] = PointsScoredArray;
        }
    }else{
        Logger("PlayerLegAverages ist noch garnicht bekannt. Wird angelegt...");
        PointsScoredArray.push(PointsScored);
        PlayerLegAverages[PlayerID] = PointsScoredArray;
    }
}

function getPlayerLegAverage(PlayerID){

    var PointsScoredArray = [];

    if(PlayerLegAverages != null){
        if(PlayerAverages[PlayerID] != null){
            Logger("PlayerLegAverages für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen...");
            PointsScoredArray = PlayerLegAverages[PlayerID];
        }
    }

    Logger("PlayerLegAverages für diesen SpielerID "+PlayerID+" gibt es noch nicht. Leeres Array zurück...");
    return PointsScoredArray;
}

function getCalculatedLegAverage(PlayerID){

    var AverageScored = 0;

    //Get Average
    PointsScoredArray = getPlayerLegAverage(PlayerID);

    //Calculate Average
    for (let x = 0; x < PointsScoredArray.length; x++) {
        AverageScored += parseInt(PointsScoredArray[x]);
    }

    //3 Dart Average
    AverageScored = AverageScored / (PointsScoredArray.length / 3);

    //Round value with 2 decimals
    AverageScored = round(AverageScored, 2);

    return AverageScored;
}

function getPlayerThrownDarts(PlayerID){

    var thrownDarts = 0;

    if(PlayerThrownDarts != null){
        if(PlayerThrownDarts[PlayerID] != null){
            thrownDarts = PlayerThrownDarts[PlayerID];
            Logger("PlayerThrownDarts für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen ("+thrownDarts+")");
        }
    }

    Logger("PlayerThrownDarts für diesen SpielerID "+PlayerID+" gibt es noch nicht. Liefere Wert 0 zurück...");
    return thrownDarts;
}

function increasePlayerThrownDarts(PlayerID){

    var thrownDarts = 0;

    if(PlayerThrownDarts != null){
        if(PlayerThrownDarts[PlayerID] != null){
            thrownDarts = PlayerThrownDarts[PlayerID];
            thrownDarts++;
            PlayerThrownDarts[PlayerID] = thrownDarts;
            Logger("PlayerThrownDarts für diesen SpielerID "+PlayerID+" gibt es bereits. Wird erhöht auf "+thrownDarts+"");
        }
        else{
            thrownDarts++;
            PlayerThrownDarts[PlayerID] = thrownDarts;
            Logger("PlayerThrownDarts für diesen SpielerID "+PlayerID+" gibt es noch nicht. Wird angelegt mit "+thrownDarts+"");
        }
    }else{
        Logger("PlayerThrownDarts ist noch garnicht bekannt. Wird angelegt...");
        thrownDarts++;
        PlayerThrownDarts[PlayerID] = thrownDarts;
    }
}


function increaseWonLegs(PlayerID){

    var wonLegs = 0;

    if(PlayerWonLegs != null){
        if(PlayerWonLegs[PlayerID] != null){
            wonLegs = PlayerWonLegs[PlayerID];
            wonLegs++;
            PlayerWonLegs[PlayerID] = wonLegs;
            Logger("PlayerWonLegs für diesen SpielerID "+PlayerID+" gibt es bereits. Wird erhöht auf "+wonLegs+"");
        }
        else{
            wonLegs++;
            PlayerWonLegs[PlayerID] = wonLegs;
            Logger("PlayerWonLegs für diesen SpielerID "+PlayerID+" gibt es noch nicht. Wird angelegt mit "+wonLegs+"");
        }
    }else{
        Logger("PlayerWonLegs ist noch garnicht bekannt. Wird angelegt...");
        wonLegs++;
        PlayerWonLegs[PlayerID] = wonLegs;
    }
}

function getWonLegs(PlayerID){

    var wonLegs = 0;

    if(PlayerWonLegs != null){
        if(PlayerWonLegs[PlayerID] != null){
            wonLegs = PlayerWonLegs[PlayerID];
            Logger("PlayerWonLegs für diesen SpielerID "+PlayerID+" gibt es bereits. Wird abgerufen ("+wonLegs+")");
        }
    }

    Logger("PlayerWonLegs für diesen SpielerID "+PlayerID+" gibt es noch nicht. Liefere Wert 0 zurück...");
    return wonLegs;
}

function getWonLegsString(PlayerID){
    var wonLegs = getWonLegs(PlayerID);
    var string = "";

    for(let x = 0; x < wonLegs; x++){
        //string += '<i class="fa-solid fa-circle"></i>'; //NOT WORKING WHY?!
        string += '<svg aria-hidden="true" focusable="false" data-prefix="fa-solid" data-icon="circle" class="svg-inline--fa fa-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M496 256C496 389 389 496 256 496S16 389 16 256S123 16 256 16S496 123 496 256Z" fill="currentColor"/></svg>';
    }

    return string;
}


function saveAverage(PointsScored){
    if(PointsScored == null){PointsScored = 0;}

    var PointsScoredArray = [];

    if(PlayerAverages != null){
        if(PlayerAverages[CurrentPlayerIndex] != null){
            PointsScoredArray = PlayerAverages[CurrentPlayerIndex];
            PointsScoredArray.push(PointsScored);
            PlayerAverages[CurrentPlayerIndex] = PointsScoredArray;
            Logger("PlayerAverages für diesen SpielerID "+CurrentPlayerIndex+" gibt es bereits. Wird erweitert um "+PointsScored);
        }
        else{
            Logger("PlayerAverages für diesen SpielerID "+CurrentPlayerIndex+" gibt es noch nicht. Wird angelegt...");
            PointsScoredArray.push(PointsScored);
            PlayerAverages[CurrentPlayerIndex] = PointsScoredArray;
        }
    }else{
        Logger("PlayerAverages ist noch garnicht bekannt. Wird angelegt...");
        PointsScoredArray.push(PointsScored);
        PlayerAverages[CurrentPlayerIndex] = PointsScoredArray;
    }
}

function getAverage(PlayerIndex){

    var PointsScoredArray = [];

    if(PlayerAverages != null){
        if(PlayerAverages[PlayerIndex] != null){
            Logger("PlayerAverages für diesen SpielerID "+PlayerIndex+" gibt es bereits. Wird abgerufen...");
            PointsScoredArray = PlayerAverages[PlayerIndex];
        }
    }

    Logger("PlayerAverages für diesen SpielerID "+PlayerIndex+" gibt es noch nicht. Leeres Array zurück...");
    return PointsScoredArray;
}

function getCalculatedAverage(PlayerID){

    var AverageScored = 0;

    //Get Average
    PointsScoredArray = getAverage(PlayerID);

    //Calculate Average
    for (let x = 0; x < PointsScoredArray.length; x++) {
        AverageScored += parseInt(PointsScoredArray[x]);
    }

    //3 Dart Average
    AverageScored = AverageScored / (PointsScoredArray.length / 3);

    //Round value with 2 decimals
    AverageScored = round(AverageScored, 2);

    return AverageScored;
}

function calculateAverage(calc_value) {

    var PointsScoredArray = [];

    var AverageScored = 0;

    //Save Average
    saveAverage(calc_value);

    //Get Average
    PointsScoredArray = getAverage(CurrentPlayerIndex);

    //Calculate Average
    for (let x = 0; x < PointsScoredArray.length; x++) {
        AverageScored += parseInt(PointsScoredArray[x]);
    }

    //3 Dart Average
    AverageScored = AverageScored / (PointsScoredArray.length / 3);

    //Round value with 2 decimals
    AverageScored = round(AverageScored, 2);

    //Store for LegHistory in PlayerLegAverages
    savePlayerLegAverage(CurrentPlayerIndex,calc_value);

    $('#three-darts-avg-' + CurrentPlayerIndex + '').html("Average: " + AverageScored);
    Logger("3-Dart Average von SpielerID "+CurrentPlayerIndex+": "+AverageScored);

    //Logger("Averages-Arrays sind gleich?: "+arraysEqual(PlayerAverages[CurrentPlayerIndex], PlayerLegAverages[CurrentPlayerIndex]));
    //Logger(PlayerAverages[CurrentPlayerIndex]);
    //Logger(PlayerLegAverages[CurrentPlayerIndex]);
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

function overthrown(value, calc_value, pointsToCheck) {

    var resetscore = 0;

    Logger("Überworfen: SpielerID "+CurrentPlayerIndex+"; Darts übrig: "+CurrentPlayerRemainingDarts);

    //Overthrown at first dart
    if (CurrentPlayerRemainingDarts == 3) {

        //Remove last Averageentry and replace it with 0 - first entry will be calculated at the end of this function 
        /*if(PlayerAverages[CurrentPlayerIndex] != null){
            PlayerAverages[CurrentPlayerIndex].pop();
            PlayerAverages[CurrentPlayerIndex].push(0);
        }*/

        //At first Dart overthrown, push 2 additional Darts to needed Darts - first is done by calc
        if(PlayerThrownDarts[CurrentPlayerIndex] != null){
            increasePlayerThrownDarts(CurrentPlayerIndex);
            increasePlayerThrownDarts(CurrentPlayerIndex);
        }

        $('#no-score-one-' + CurrentPlayerIndex + '').html('(No Score)');
        $('#no-score-two-' + CurrentPlayerIndex + '').html('');
        $('#no-score-three-' + CurrentPlayerIndex + '').html('');

        if(CurrentPlayerRemainingPoints[0] != null){resetscore = CurrentPlayerRemainingPoints[0];}
        Logger("SpielerID "+CurrentPlayerIndex+" überworfen beim ersten Wurf. Reset Punkte auf: "+resetscore);
    } 
    else if (CurrentPlayerRemainingDarts == 2) {

        //Okay overthrown at second dart

        //Remove last 2 Averageentry and replace it with 0 - second entry will be calculated at the end of this function 
        if(PlayerAverages[CurrentPlayerIndex] != null){
          PlayerAverages[CurrentPlayerIndex].pop();
          PlayerAverages[CurrentPlayerIndex].push(0);
        }

        //Same for PlayerLegAverages
        if(PlayerLegAverages[CurrentPlayerIndex] != null){
            PlayerLegAverages[CurrentPlayerIndex].pop();
            PlayerLegAverages[CurrentPlayerIndex].push(0);
        }

        //At second Dart overthrown, push 1 additional Dart to needed Darts - first two are done by calc
        if(PlayerThrownDarts[CurrentPlayerIndex] != null){
         increasePlayerThrownDarts(CurrentPlayerIndex);
        }

        $('#no-score-one-' + CurrentPlayerIndex + '').html('(No Score)');
        $('#no-score-two-' + CurrentPlayerIndex + '').html('(No Score)');
        $('#no-score-three-' + CurrentPlayerIndex + '').html('');

        if(CurrentPlayerRemainingPoints[0] != null){resetscore = CurrentPlayerRemainingPoints[0];}
        Logger("SpielerID "+CurrentPlayerIndex+" überworfen beim zweiten Wurf. Reset Punkte auf: "+resetscore);
    } 
    else if (CurrentPlayerRemainingDarts == 1) {

        //Okay overthrown at last dart

        //Remove last 2 Averageentry and replace it with 0 - third entry will be calculated at the end of this function 
        if(PlayerAverages[CurrentPlayerIndex] != null){
            PlayerAverages[CurrentPlayerIndex].pop();
            PlayerAverages[CurrentPlayerIndex].pop();
            PlayerAverages[CurrentPlayerIndex].push(0);
            PlayerAverages[CurrentPlayerIndex].push(0);
        }

        //Same for PlayerLegAverages
        if(PlayerLegAverages[CurrentPlayerIndex] != null){
            PlayerLegAverages[CurrentPlayerIndex].pop();
            PlayerLegAverages[CurrentPlayerIndex].pop();
            PlayerLegAverages[CurrentPlayerIndex].push(0);
            PlayerLegAverages[CurrentPlayerIndex].push(0);
        }

        //No additional Dart needs to be pushed to thrown Darts cuz overthrown at third dart..

        $('#no-score-one-' + CurrentPlayerIndex + '').html('(No Score)');
        $('#no-score-two-' + CurrentPlayerIndex + '').html('(No Score)');
        $('#no-score-three-' + CurrentPlayerIndex + '').html('(No Score)');

        if(CurrentPlayerRemainingPoints[0] != null){resetscore = CurrentPlayerRemainingPoints[0];}
        Logger("SpielerID "+CurrentPlayerIndex+" überworfen beim letzten Wurf. Reset Punkte auf: "+resetscore);
    }

    //calculate the average before updating the nextplayer()
    calculateAverage(0);


    setPlayerValueString('pointstocheck', CurrentPlayerIndex ,resetscore);
    updateDisplayedThrownDarts(value, calc_value, true, false);

    displayCheckoutroute(pointsToCheck, true); //Overthrown but calc a Checkoutattempt when it was a one dart finish
}

function calc(value) {

    //Whos throwing? -> Global var CurrentPlayerIndex know it
    //How many Points does the player has left?
    var pointsToCheck = getPlayerValue('pointstocheck');

    //Since Doubles, Triples, SB, DB, OUT arent real numbers first transform them...
    //What that complicated instead of set the value directly on buttons?
    //Player scored "3", but is it a Single 3 or a Triple 1 ?!

    var calc_value = 0;

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

    //Update Darts thrown
    increasePlayerThrownDarts(CurrentPlayerIndex);
    Logger(getPlayerThrownDarts(CurrentPlayerIndex));

    //Save pointsToCheck before calculated - Used for overthrown
    CurrentPlayerRemainingPoints.push(pointsToCheck);
    CurrentPlayerScoredPoints.push(calc_value);
    CurrentPlayerScoredFieldvalues.push(value);

    //Begin of Game - DoubleIn DoubleOut
    if ((pointsToCheck == getStartPoints()) && (getCheckoutmode() == 'doublein_doubleout')) {

        //Submitted Value is a Double or DB or MISS
        if ((value.startsWith("D") == true) || value == "MISS") {
            
            //Recalculate new pointsToCheck
            pointsToCheck = pointsToCheck - calc_value;

            //Update the values
            setPlayerValueString('pointstocheck', CurrentPlayerIndex, pointsToCheck);

            //calculate the average before updating the nextplayer()
            calculateAverage(calc_value);

            //put the value in the current throw fields
            updateDisplayedThrownDarts(value, calc_value, false, false);

        } else {

            //Remove thrown value and replace with 0, because no double were hit.
            CurrentPlayerScoredPoints.pop();
            CurrentPlayerScoredPoints.push(0);

            //calculate the average before updating the nextplayer()
            calculateAverage(0);

            setPlayerValueString('pointstocheck', CurrentPlayerIndex, getStartPoints());
            updateDisplayedThrownDarts(value, calc_value, false, true);
        }
    }
    //Error overthrown or value is negativ due to a bug
    else if ((pointsToCheck - calc_value < 0) || (pointsToCheck - calc_value == 1)) {
        if (getCheckoutmode() == 'straightout') {
            if (pointsToCheck - calc_value > 0) {
                pointsToCheck = pointsToCheck - calc_value;

                setPlayerValueString('pointstocheck', CurrentPlayerIndex, pointsToCheck);

                //calculate the average before updating the nextplayer()
                calculateAverage(calc_value);

                //put the value in the current throw fields
                updateDisplayedThrownDarts(value, calc_value, false, false);

            } else {
                increaseCheckoutAttempts(CurrentPlayerIndex);

                var CheckoutInfo = getCheckoutPercentage(CurrentPlayerIndex);

                $('#checkout-percentage-' + CurrentPlayerIndex + '').html("Checkout: " + CheckoutInfo['Rate'] + "% (" + CheckoutInfo['Success'] + "/" + CheckoutInfo['Attempts'] + ")");

                overthrown(value, calc_value,pointsToCheck);
            }

        }else{
            overthrown(value, calc_value,pointsToCheck);
        }

    } else if ((pointsToCheck - calc_value == 0) && (value.startsWith("D") == true)) {
        //This also coveres finishs over DB

        //WON LEGS
        increaseWonLegs(CurrentPlayerIndex);

        setPlayerValueString('won-legs-indicator', CurrentPlayerIndex, getWonLegsString(CurrentPlayerIndex));

        if ((getCheckoutmode() == 'doubleout') || (getCheckoutmode() == 'doublein_doubleout')) {


            //increaseCheckoutAttempts(CurrentPlayerIndex);
            increaseCheckoutSuccesses(CurrentPlayerIndex);

            var CheckoutInfo = getCheckoutPercentage(CurrentPlayerIndex);

            $('#checkout-percentage-' + CurrentPlayerIndex + '').html("Checkout: " + CheckoutInfo['Rate'] + "% (" + CheckoutInfo['Success'] + "/" + CheckoutInfo['Attempts'] + ")");

        }

        //Lets set GameOver true, because some1 won.
        GameOver = true;

        //Update the values
        setPlayerValueString('pointstocheck', CurrentPlayerIndex, 0);

        //calculate the average before updating the nextplayer()
        calculateAverage(calc_value);

        //put the value in the current throw fields
        updateDisplayedThrownDarts(value, calc_value, false, false);

        //Won Modal
        notify("azurblue", "Information", $('#playernamefield-' + CurrentPlayerIndex + '').text()+" hat gewonnen!");

        //Build LegHistory
        var PlayerLegAveragesArray = [];
        for(let x = 0; x < getAmountofPlayers(); x++){
            PlayerLegAveragesArray.push({"ID": x, "PlayerName": $('#playernamefield-' + x + '').text(), "Average": getCalculatedLegAverage(x)});
        }

        var PointsCheckedToFinish = 0;
        for(let x = 0; x < CurrentPlayerScoredPoints.length; x++){
            PointsCheckedToFinish = PointsCheckedToFinish + parseInt(CurrentPlayerScoredPoints[x]);
        }

        var FieldsCheckedToFinish = "???";
        if(CurrentPlayerScoredFieldvalues != null){

            FieldsCheckedToFinish = "";
            
            FieldsCheckedToFinish += " [ ";

            for(let z = 0; z < 3; z++){

                if(CurrentPlayerScoredFieldvalues[z] != null){

                    if(z > 0){
                        FieldsCheckedToFinish += " - "; 
                    }
                    FieldsCheckedToFinish += CurrentPlayerScoredFieldvalues[z];
                }
            }

            FieldsCheckedToFinish += " ]";
        }

        LegHistory.push({
            "DartsToFinish" : getPlayerThrownDarts(CurrentPlayerIndex), 
            "LegWonByName" : $('#playernamefield-' + CurrentPlayerIndex + '').text(), 
            "LegWonByID" : CurrentPlayerIndex,
            "LegBeginnerName" : $('#playernamefield-' + CurrentLegStartplayer + '').text(), 
            "LegBeginnerID" : CurrentLegStartplayer,
            "PlayerLegAverages" : PlayerLegAveragesArray,
            "PointsCheckedToFinish" : PointsCheckedToFinish,
            "FieldsCheckedToFinish" : FieldsCheckedToFinish,
            "DateTime" : currentDatetime()
        });

        Logger(LegHistory);

        
        //Store played Leg in Database
        StoreLegHistoryDataInDatabase();

        RestartGame();


    } else if ((pointsToCheck - calc_value == 0)) {
        if (getCheckoutmode() == 'straightout') {

            //WON LEGS
            increaseWonLegs(CurrentPlayerIndex);

            //increaseCheckoutAttempts
            increaseCheckoutAttempts(CurrentPlayerIndex);

            //IncreaseCheckoutSuccess
            increaseCheckoutSuccesses(CurrentPlayerIndex);

            var CheckoutInfo = getCheckoutPercentage(CurrentPlayerIndex);

            $('#checkout-percentage-' + CurrentPlayerIndex + '').html("Checkout: " + CheckoutInfo['Rate'] + "% (" + CheckoutInfo['Success'] + "/" + CheckoutInfo['Attempts'] + ")");

            setPlayerValueString('won-legs-indicator', CurrentPlayerIndex, getWonLegsString(CurrentPlayerIndex));

            //Lets set GameOver true, because some1 won.
            GameOver = true;

            //Update the values
            setPlayerValueString('pointstocheck', CurrentPlayerIndex, 0);

            //calculate the average before updating the nextplayer()
            calculateAverage(calc_value);

            //put the value in the current throw fields
            updateDisplayedThrownDarts(value, calc_value, false, false);

            //Won Modal
            notify("azurblue", "Information", $('#playernamefield-' + CurrentPlayerIndex + '').text()+" hat gewonnen!");

            //Build LegHistory
            var PlayerLegAveragesArray = [];
            for(let x = 0; x < getAmountofPlayers(); x++){
                PlayerLegAveragesArray.push({"ID": x, "PlayerName": $('#playernamefield-' + x + '').text(), "Average": getCalculatedLegAverage(x)});
            }

            var PointsCheckedToFinish = 0;
            for(let x = 0; x < CurrentPlayerScoredPoints.length; x++){
                PointsCheckedToFinish = PointsCheckedToFinish + parseInt(CurrentPlayerScoredPoints[x]);
            }

            var FieldsCheckedToFinish = "???";
            if(CurrentPlayerScoredFieldvalues != null){

                FieldsCheckedToFinish = "";
                
                FieldsCheckedToFinish += " [ ";
    
                for(let z = 0; z < 3; z++){
    
                    if(CurrentPlayerScoredFieldvalues[z] != null){
    
                        if(z > 0){
                            FieldsCheckedToFinish += " - "; 
                        }
                        FieldsCheckedToFinish += CurrentPlayerScoredFieldvalues[z];
                    }
                }
    
                FieldsCheckedToFinish += " ]";
            }

            LegHistory.push({
                "DartsToFinish" : getPlayerThrownDarts(CurrentPlayerIndex), 
                "LegWonByName" : $('#playernamefield-' + CurrentPlayerIndex + '').text(), 
                "LegWonByID" : CurrentPlayerIndex,
                "LegBeginnerName" : $('#playernamefield-' + CurrentLegStartplayer + '').text(), 
                "LegBeginnerID" : CurrentLegStartplayer,
                "PlayerLegAverages" : PlayerLegAveragesArray,
                "PointsCheckedToFinish" : PointsCheckedToFinish,
                "FieldsCheckedToFinish" : FieldsCheckedToFinish,
                "DateTime" : currentDatetime()
            });

            Logger(LegHistory);

            //Store played Leg in Database
            StoreLegHistoryDataInDatabase();

            RestartGame();

        } else {
            overthrown(value, calc_value,pointsToCheck);
        }

    } else {

        //Okay no special thing about calculating the points so...
        pointsToCheck = pointsToCheck - calc_value;

        setPlayerValueString('pointstocheck', CurrentPlayerIndex, pointsToCheck);

        //calculate the average before updating the nextplayer()
        calculateAverage(calc_value);

        //put the value in the current throw fields
        updateDisplayedThrownDarts(value, calc_value, false, false);

        //Routecalculation at the end because it gets the values of some divcontainers an therefore it must be updated before
        //Lets be careful with the true here, lets say User has 24 Points left and still 2 darts and he throws 12 instead of D12 he gets another miss so we need to stop that with ignoring third throw and checkoutroute

        //alert("current player: " + CurrentPlayerIndex + " and thrownindex " + CurrentPlayerRemainingDarts);
        if (CurrentPlayerRemainingDarts > 0) {
            displayCheckoutroute(calc_value, true);
        }

    }

    //Update Monitoring
    StoreGameDataInDatabase();
}

//Oh someone clicked on the numbers
$('.addpoints').click(function() {
    calc($(this).attr('data-value'));
});

$('#quitgame').click(function() {
    //window.location.href = "./index.php";
    showExitGameModal();
});

$('#undomove').click(function() {
    restoreSnapshot();
});

	
//Show History
$('#playerlist').on("click", '.won-legs-indicator', function(e){
    showHistoryModal();
});

$('#showstats').click(function(){
    showHistoryModal();
});

$('#showinfos').click(function(){
   showInfoModal();
});

function showInfoModal(){
    var title = '<i class="fa-solid fa-circle-info fa-lg"></i> Infos';
    var footer = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-23.5rem;"><i class="fa-solid fa-circle-check fa-lg"></i> Okay</button>';
    var body = 'Folgende GameSettings sind aktuell geladen:</br>';

    /*
    for (const [key, value] of Object.entries(SnapshotGameSettings)) {
        body += `</br>`+`${key}: ${value}`;
    }*/

    body += '<table class="table table table-striped" style="overflow-x: scroll;"><thead class="table-dark"><tr><th scope="col">#</th><th scope="col">Einstellung</th><th scope="col">Wert</th></tr></thead><tbody>';

    /*
    var counter = 0;
    for (const [key, value] of Object.entries(SnapshotGameSettings)) {
       counter++;
        body += `<tr><th scope="row">`+counter+`</th><td>`+key+`</td><td>`+value+`</td>`;
    }
    */

    body += `<tr><th scope="row">1</th><td>Gamemode</td><td>`+Gamemode+`</td>`;
    body += `<tr><th scope="row">2</th><td>Checkoutmode</td><td>`+Checkoutmode+`</td>`;
    body += `<tr><th scope="row">3</th><td>Checkoutpath</td><td>`+Checkoutpath+`</td>`;
    body += `<tr><th scope="row">4</th><td>InputMethod</td><td>`+InputMethod+`</td>`;
    body += `<tr><th scope="row">5</th><td>showRealColors</td><td>`+showRealColors+`</td>`;
    body += `<tr><th scope="row">6</th><td>SelectedPlayers</td><td>`+SelectedPlayers+`</td>`;
    body += `<tr><th scope="row">7</th><td>Players</td><td>`+Players+`</td>`;
    body += `<tr><th scope="row">8</th><td>activateMonitoring</td><td>`+activateMonitoring+`</td>`;
    body += `<tr><th scope="row">9</th><td>DBAccessorKey</td><td>`+DBAccessorKey+`</td>`;
    body += `<tr><th scope="row">10</th><td>DBRefreshTime</td><td>`+DBRefreshTime+`</td>`;


    body += "</tbody></table>";

    $('#modal-title').html(title);
    $('#modal-body').html(body);
    $('#modal-footer').html(footer);

    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    myModal.show();
    //myModal.hide(); 
}



function showHistoryModal(){
    var title = '<i class="fa-solid fa-clock-rotate-left fa-lg"></i> Leg-Verlauf';
    var footer = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-23.5rem;"><i class="fa-solid fa-circle-check fa-lg"></i> Okay</button>';
    var body = "Es wurde noch kein Leg beendet.";

    if(LegHistory != null && LegHistory.length > 0){

        var body = '<div class="accordion" id="accordionLegHistory">';


        var counter = 0;

        for(let x = 0; x < LegHistory.length; x++){
            counter = x + 1;

            var showLastAccordion = "";
            var showFirstAccordionsButtonCollapsed = "collapsed";
            if(x == LegHistory.length-1){
                showLastAccordion = "show";
                showFirstAccordionsButtonCollapsed = "";
            }
            
            var accordionTitleBREAK = "";
            var accordionBodyBREAK = "";
            if(LegHistory[x]["LegWonByID"] != LegHistory[x]["LegBeginnerID"]){
                accordionTitleBREAK = "- BREAK!";
                accordionBodyBREAK = "Dieses Leg war ein Break, da "+LegHistory[x]["LegWonByName"]+" kein Anwurf hatte.</br>";
            }

            //Kein Datum bekannt? - Legacy Data hatte kein Datum
            var finishedDate = "Unbekannt";
            if(LegHistory[x]["DateTime"] != null){
                finishedDate = getGermanDateTime(LegHistory[x]["DateTime"]);
            }

            var accordionbody = accordionBodyBREAK;

            accordionbody += "Es wurde mit "+LegHistory[x]["PointsCheckedToFinish"]+" Punkten "+LegHistory[x]["FieldsCheckedToFinish"]+" dicht gemacht.</br></br>";

            accordionbody += '<table class="table table table-striped"><thead class="table-dark"><tr><th scope="col">#</th><th scope="col">Spieler</th><th scope="col">Average</th><th scope="col">Anwurf</th></tr></thead><tbody>';

            var playercounter = 0;
            for(let y = 0; y < LegHistory[x]['PlayerLegAverages'].length; y++){

                //Mark player who started the leg...
                var LegBeginnerString = "";
                if(LegHistory[x]["LegBeginnerID"] == y){
                    LegBeginnerString = "<i class='fa-solid fa-circle fa-lg' style='margin-left:0.9em;'></i>";
                }

                playercounter = y + 1;
                accordionbody += '<tr><th scope="row">'+playercounter+'</th><td>'+LegHistory[x]['PlayerLegAverages'][y]['PlayerName']+'</td><td>'+LegHistory[x]['PlayerLegAverages'][y]['Average']+'</td><td>'+LegBeginnerString+'</td></tr>';
            }

            accordionbody += "</tbody></table>";

            accordionbody += '<div><i class="fa-solid fa-clock"></i> '+finishedDate+'</div>';

            body += '<div class="accordion-item"><h2 class="accordion-header" id="headline'+x+'"><button class="accordion-button '+showFirstAccordionsButtonCollapsed+'" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'+x+'" aria-expanded="true" aria-controls="collapse'+x+'">Leg #'+counter+' - Sieger <strong style="padding-left: 4px;padding-right: 4px;">'+LegHistory[x]["LegWonByName"]+'</strong> mit '+LegHistory[x]["DartsToFinish"]+' Darts '+accordionTitleBREAK+'</button></h2><div id="collapse'+x+'" class="accordion-collapse collapse '+showLastAccordion+'" aria-labelledby="headline'+x+'" data-bs-parent="#accordionLegHistory"><div class="accordion-body">'+accordionbody+'</div></div></div>';

        }

        body += "</div>";
    }

    $('#modal-title').html(title);
    $('#modal-body').html(body);
    $('#modal-footer').html(footer);

    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    myModal.show();
    //myModal.hide(); 
}

function showExitGameModal(){
    var title = '<i class="fa-solid fa-right-from-bracket fa-lg"></i> Beenden';
    var footer = '<button id="confirmExitGame" type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-19.5rem;"><i class="fa-solid fa-circle-check fa-lg"></i> Ja</button> <button type="button" class="btn btn-danger" data-bs-dismiss="modal"><i class="fa-solid fa-circle-xmark fa-lg"></i> Nein</button>';
    var body = 'Sofern der Spielstand beim Verlassen gespeichert werden soll, folgende Checkbox aktivieren. Dadurch kann dieses Spiel später erneut geladen werden.<div><div class="form-check funkyradio" style="display:inline-block; margin-left:0.5em; margin-bottom:0.5em; margin-top:0.5em;"><input class="form-check-input" type="checkbox" value="no" id="saveSessiondata" checked/><label class="form-check-label" for="saveSessiondata">Spielstand merken</label></div></div>Soll das Spiel wirklich beendet werden?';

    $('#modal-title').html(title);
    $('#modal-body').html(body);
    $('#modal-footer').html(footer);

    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    myModal.show();
    //myModal.hide(); 
}

$('#modal-footer').on("click", '#confirmExitGame', function(e){

    //Should Session be saved?
    var saveSessiondata = $('#saveSessiondata').is(':checked');
    //Logger(saveSessiondata);

    if(saveSessiondata){
        //Use LastSnapshot to store GameData to resume Game later on
        createSnapshot();

        StoreSavedSessionDataInDatabase();
    }

    setTimeout(function(){ window.location.href = "./index.php"; }, 300);
});
