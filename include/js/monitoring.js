$(document).ready(function() {

    if(!isAccessorCodeValid()){
        return;
    }

});

var debug = true;
var globalDateTime = getCurrentDateTime();
var globalMilliseconds = 0;
var globalRefreshToggle = true;
var globalIntervalID = null;
var LegHistory = [];

function Logger(string){
    if(debug){
        console.log(string);
    }
}

//BUILD BY PHP on Errorpage
$('#refreshpage').click(function() {
location.reload();
});

//Full Webpage = document.documentElement
$('#expandscreen').click(function() {
  openFullscreen(document.documentElement);
});

$('#compressscreen').click(function() {
  closeFullscreen(document.documentElement);
});


$('#togglefullscreen').click(function() {

  //var currentMode = $(this).attr('data-currentMode');

  if(document.fullscreenElement){
    Logger("Aktuell Fullscreen, diesen nun verlassen");
    //$(this).attr('data-currentMode', 'compressed'); 
    closeFullscreen(document.documentElement);
    $(this).html('<i class="fa-duotone fa-expand fa-lg" aria-hidden="true"></i> Vollbildmodus');


  }else{
    Logger("Aktuell kein Fullscreen, diesen nun starten");
    //$(this).attr('data-currentMode', 'enlarged'); 
    openFullscreen(document.documentElement);
    $(this).html('<i class="fa-duotone fa-compress fa-lg" aria-hidden="true"></i> Vollbildmodus verlassen');
  };

});


$('input[type=radio][name=fontsize]').change(function() {
  var value = $(this).val();
  changeFontsize(value);
});

function changeFontsize(value){

  Logger("Not implemented yet.");

  /*
  switch(value){
    case 'small':
      $('.playernamefield p').css({'font-size':'55px'});
      break;
    case 'medium':
      $('.playernamefield p').css({'font-size':'65px'});
      break;
    case 'large':
      $('.playernamefield p').css({'font-size':'75px'});
      break;

    default:
      $('.playernamefield p').css({'font-size':'65px'});
      break;
  }*/

}

$('#refreshtoggle').change(function(){
  globalRefreshToggle = $('#refreshtoggle').is(":checked");
  Logger("Aktualisieren gesetzt auf: "+$('#refreshtoggle').is(":checked"));

  //Wenn auf TRUE gesetzt, refreshPage callen
  if(globalRefreshToggle){
    refreshPage();
    $('label[for=refreshtoggle]').text('Aktualisierung');
  }
  else{
    $('label[for=refreshtoggle]').text('Aktualisierung');
  }

});

function refreshPage(){
    
    var updateEvery = 2;

    if(getSearchParams("refreshrate") != null){
        Logger("Refreshrate: "+getSearchParams("refreshrate")+ " Sek.");
        updateEvery = parseInt(getSearchParams("refreshrate"));
    }

    //in MS
    updateEvery = updateEvery*1000;

    globalIntervalID = window.setInterval(function(){
        getLastUpdatetime();
    }, updateEvery);

    //clearInterval(globalIntervalID);
}

function getCurrentDateTime(){
    //OUR TIME
    var today = new Date();
    var year = today.getFullYear()
    var month = String((today.getMonth()+1)).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    var hours = String(today.getHours()).padStart(2, "0");
    var minutes = String(today.getMinutes()).padStart(2, "0");
    var seconds = String(today.getSeconds()).padStart(2, "0");

    var dateTime = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;

    return dateTime;
}

function getSearchParams(k){
    var p={};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
    return k?p[k]:p;
}

function isAccessorCodeValid(){
    var valid = true;

    if(getSearchParams("code") == null){
        return false;
    }

    //AJAX Call to backend
    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'GET';
    ajaxRequest['method'] = 'isAccessorCodeValid';
    ajaxRequest['content'] = decodeURI(getSearchParams("code"));

    $.ajax({
      url: 'include/php/backend.php',
      type: 'post',
      data: ajaxRequest,
      success: function(data, status) {
        //Logger(data);

        data = JSON.parse(data);

        if(data['statuscode']){

          Logger("isAccessorCodeValid: "+data['content']);

          if(data['content'] == true){
            Logger("Calling: refreshPage");
            refreshPage();
          }
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

function getLastUpdatetime(){

  
  if(!globalRefreshToggle){
    Logger("Stoppe automatische Aktualisierung");
    clearInterval(globalIntervalID);
    return;
  }

  //For support of UTF8
  //Logger(decodeURI(getSearchParams("code")));

  //FOOOOR FRODO - euhm i mean FOOOOOR APPLE! -.-
  var currentTime = new Date();
  var currentTimestamp = currentTime.getTime();

  //AJAX Call to backend
  var ajaxRequest = new Object();
  ajaxRequest['action'] = 'GET';
  ajaxRequest['method'] = 'getLastUpdate';
  ajaxRequest['content'] = decodeURI(getSearchParams("code"));
 
  //url: 'include/php/backend.php',

  //url: $(location).attr('origin') + 'include/php/backend.php' + '&nocache=' + new Date().getTime(),

  $.ajaxSetup({ type:'POST', headers: {"cache-control":"no-cache"}});

  $.ajax({
    url: 'include/php/backend.php?nocache='+currentTimestamp,
    type: 'post',
    data: ajaxRequest,
    async: true,
    cache: false,
    headers: {
     'Cache-Control': 'no-cache, no-store, must-revalidate', 
     'Pragma': 'no-cache', 
     'Expires': '0'
   },
    success: function(data, status) {
      //Logger(data);
 
      data = JSON.parse(data);
 
      if(data['statuscode']){

        var DBUpdateDateTime = data['content']['updateDate'];
        var DBUpdateMilliseconds = data['content']['updateMilliseconds'];
        var DBUpdateDateTimeRelative = data['content']['updateDateRelative'];


        Logger("DB-DateTime: "+DBUpdateDateTime+" - Millisekunden: "+DBUpdateMilliseconds);
        Logger("Website-DateTime: "+globalDateTime+" - Millisekunden: "+globalMilliseconds);

        var website = new Date(globalDateTime);
        var database = new Date(DBUpdateDateTime);

        $('#lastupdated').html("Updated: "+DBUpdateDateTimeRelative);

        //Database hold newer data
        if(database > website){

            Logger("DB hat neuere Daten vom: "+DBUpdateDateTime); 
            //Update and set website date to db date
            UpdateMonitoring();
            globalDateTime = DBUpdateDateTime;
            globalMilliseconds = DBUpdateMilliseconds;

        }else{

          //Okay same date  & time but also millisecond same?
          if(DBUpdateMilliseconds > globalMilliseconds){
            Logger("DB hat neuere Daten vom: "+DBUpdateDateTime); 
            //Update and set website date to db date
            UpdateMonitoring();
            globalDateTime = DBUpdateDateTime;
            globalMilliseconds = DBUpdateMilliseconds;
          }

        }
      
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

function randomString() {
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXTZ0123456789abcdefghiklmnopqrstuvwxyz";
  var strlength = 8;
  var random = '';

  for (var i=0; i<strlength; i++) {
    var num = Math.floor(Math.random() * c.length);
    random += c.substring(num,num+1);
  }

  return random;
}

function UpdateMonitoring(){
  
    //FOOOOR FRODO - euhm i mean FOOOOOR APPLE! -.-
    var currentTime = new Date();
    var currentTimestamp = currentTime.getTime();

    $.ajaxSetup({ type:'POST', headers: {"cache-control":"no-cache"}});

    //AJAX Call to backend
    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'GET';
    ajaxRequest['method'] = 'getGameData';
    ajaxRequest['content'] = decodeURI(getSearchParams("code"));

    $.ajax({
      url: 'include/php/backend.php?nocache='+currentTimestamp,
      type: 'post',
      data: ajaxRequest,
      async: true,
      cache: false,
      headers: {
       'Cache-Control': 'no-cache, no-store, must-revalidate', 
       'Pragma': 'no-cache', 
       'Expires': '0'
      },
      success: function(data, status) {
        //Logger(data);

        data = JSON.parse(data);

        if(data['statuscode']){

            DisplayUpdate(data['content']);
        
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

function showHistoryModal(){
  var title = '<i class="fa-duotone fa-clock-rotate-left fa-lg"></i> Leg-Verlauf';
  var footer = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-23.5rem;"><i class="fa-duotone fa-circle-check fa-lg"></i> Okay</button>';
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

          accordionbody += '<div><i class="fa-duotone fa-calendar-clock"></i> '+finishedDate+'</div>';

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

$('#showstats').click(function(){
  getLegHistory();
});


function getLegHistory(){
  //AJAX Call to backend
  var ajaxRequest = new Object();
  ajaxRequest['action'] = 'GET';
  ajaxRequest['method'] = 'getLegHistoryData';
  ajaxRequest['content'] = decodeURI(getSearchParams("code"));

  $.ajax({
    url: 'include/php/backend.php',
    type: 'post',
    data: ajaxRequest,
    success: function(data, status) {

      data = JSON.parse(data);

      //Logger(data);

      if(data['statuscode']){

        if(data['content'] != null){

          data = JSON.parse(data['content']);

          if(data['LegHistoryData'] != null){
            LegHistory = data['LegHistoryData'];
          }

          Logger(LegHistory);
        }

        showHistoryModal();  
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


function DisplayUpdate(gameData){

    gameData = JSON.parse(gameData);

    Logger(gameData);

    var remainingDarts = gameData['RemainingDarts'];
    var playerData = gameData['PlayerData'];

    SetDartIcons(remainingDarts);

    //Sort Array Playerturn -> 1 ON TOP
    playerData.sort(function(a, b) {
        return parseInt(b["PlayersTurn"]) - parseInt(a["PlayersTurn"]);
    });

    var insertLIString = "";

    for(x = 0; x < playerData.length;x++){

        //Define Playercolor
        playerDIVBorderColor = 'style="border-color: white;"';
        playerColor = 'style="color: white;"';

        if(playerData[x]['PlayersTurn'] == "1"){
          playerDIVBorderColor = 'style="border-color: red;"';
          playerColor = 'style="color: red;"';
        }

        //Rebuild WonLegs
        wonLegsString = "";
        for(y= 0; y < parseInt(playerData[x]['Player-WonLegs']); y++){
          //wonLegsString += '<i class="fa-solid fa-circle"></i>';
          wonLegsString += '<svg aria-hidden="true" focusable="false" data-prefix="fa-solid" data-icon="circle" class="svg-inline--fa fa-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M496 256C496 389 389 496 256 496S16 389 16 256S123 16 256 16S496 123 496 256Z" fill="currentColor"/></svg>';
        }

        //insertLIString += "LOL";
        insertLIString += '<li id="listelement-' +x+'" class="sidebar-table-players"><div class="col-md-12 col-xs-12 playername" id="playername-' +x+'" '+playerDIVBorderColor+'><div class="row"><div class="col-md-7 col-xs-7 playernamefield"><div class="row"><div class="col-md-12 col-xs-12"><p id="playernamefield-' +x+'" '+playerColor+'>' +playerData[x]['PlayerName'] + '</p></div></div><div class="row"><div class="col-md-12 col-xs-12 checkouthint"><p id="checkouthint-' +x+'">'+playerData[x]['PlayerCheckouthint']+'</p></div></div><div class="row"><div class="col-md-12 col-xs-12 checkouthint2"><p id="checkouthint2-' +x+'">'+playerData[x]['PlayerCheckouthint2']+'</p></div></div></div><div class="col-md-5 col-xs-5 pointstocheck"><p class="pointstochecktext" id="pointstocheck-' +x+'">' + playerData[x]['PlayerScore'] + '</p></div></div><div class="row actual-throw"><div class="col-md-4 col-xs-4" id="throw-one-' +x+'">'+playerData[x]['Player-Throw-One']+'</div><div class="col-md-4 col-xs-4" id="throw-two-' +x+'">'+playerData[x]['Player-Throw-Two']+'</div><div class="col-md-4 col-xs-4" id="throw-three-' +x+'">'+playerData[x]['Player-Throw-Three']+'</div></div><div class="row no-score"><div class="col-md-4 col-xs-4" id="no-score-one-' +x+'">'+playerData[x]['Player-No-Score-One']+'</div><div class="col-md-4 col-xs-4" id="no-score-two-' +x+'">'+playerData[x]['Player-No-Score-Two']+'</div><div class="col-md-4" id="no-score-three-' +x+'">'+playerData[x]['Player-No-Score-Three']+'</div></div><div class="row statistics"><div class="col-md-4 col-xs-4 three-darts-avg" id="three-darts-avg-' +x+'">'+playerData[x]['Player-Three-Darts-Avg']+'</div><div class="col-md-4 col-xs-4 highest-score" id="highest-score-' +x+'">'+playerData[x]['Player-Highest-Score']+'</div><div class="col-md-4 col-xs-4 checkout-percentage" id="checkout-percentage-' +x+'">'+playerData[x]['Player-Checkout-Percentage']+'</div></div><div class="row latest-darts-throw"><div class="col-md-12 col-xs-12"><p class="latest-darts-throw" style="display: inline;" id="latest-darts-throw-score-' +x+'" >'+playerData[x]['Player-Latest-Darts-Throw-Score']+'</p></div></div><div class="row"><div class="col-md-12 col-xs-12 won-legs-indicator" id="won-legs-indicator-' +x+'">'+wonLegsString+'</div></div></li>';
    }

    $('#playerlist').html(insertLIString);
}

function SetDartIcons(DartsInHand) {
    if (DartsInHand == 1) {
        $("#dart1").css("display","block");
        $("#dart2").css("display","none");
        $("#dart3").css("display","none");
    } else if (DartsInHand == 2) {
        $("#dart1").css("display","block");
        $("#dart2").css("display","block");
        $("#dart3").css("display","none");
    } else if (DartsInHand >= 3) {
        $("#dart1").css("display","block");
        $("#dart2").css("display","block");
        $("#dart3").css("display","block");
    }
}

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen(elem) {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}
