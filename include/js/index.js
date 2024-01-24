//No Pinch2Zoom
/*
window.addEventListener("touchstart", touchHandler, false);

document.addEventListener('touchmove', e => {
  if (e.touches.length > 1) {  
     e.preventDefault();
  }
}, {passive: false})
*/

$(document).ready(function() {
    getAllPlayers();
    $("#check-list-box").sortable();
});

$('#new-player').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
       //alert('You pressed a "enter" key in textbox, here submit your form');
       $( '#addplayer' ).click(); 
    }
});


$( '#randomMonitoringCode' ).click( function() {

 //AJAX Call to backend
 var ajaxRequest = new Object();
 ajaxRequest['action'] = 'GET';
 ajaxRequest['method'] = 'generateMonitoringCode';

 $.ajax({
   url: 'include/php/backend.php',
   type: 'post',
   data: ajaxRequest,
   success: function(data, status) {
     Logger(data);

     data = JSON.parse(data);

     if(data['statuscode']){
         notify("azurblue", "Information", "Generierter Code lautet: <b>"+data['content']+"</b>");
         $('#monitoring-code').val(data['content']);
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

});



//Bad for touch
/*
$('#refreshrate').on('click', function(){ 
  $('#refreshratevalue').html("Aktualisierung alle "+$('#refreshrate').val()+" Sek.");
});*/

$('#refreshrate').change(function(){
  $('#refreshratevalue').html("Alle "+$('#refreshrate').val()+" Sek.");
});


$( '#openMonitoringLink' ).click( function() {

  var code = $('#monitoring-code').val();

  var refreshrate = $('#refreshrate').val();


  window.open('./monitoring.php?code='+code+'&refreshrate='+refreshrate, '_blank');

});

$( '#openPracticeLink' ).click( function() {

  window.open('./practice.php', '_self');

});

$( '#copyMonitoringLink' ).click( function() {

  var code = $('#monitoring-code').val();

  var refreshrate = $('#refreshrate').val();

  var link = '/monitoring.php?code='+code+'&refreshrate='+refreshrate;

  var host = window.location.origin; // "https://darts.marcelhuss.de"

  //Current path
  var path = window.location.pathname // "/subfolder/index.php"
  //Get only first path of string
  var pathsplit = path.split("/"); // [ "", "subfolder", "index.php" ]
  //Delete first and last Array element
  pathsplit.pop();
  pathsplit.shift();
  //Unset path and rebuild it
  path = "";
  for(let x = 0; x < pathsplit.length; x++){
    path += "/"+pathsplit[x];
  }
  
  var fulllink = host+path+link;

  var success = copyText(fulllink);

  if(success){
    notify("azurblue", "Information", "Link kopiert");
  }

});

$( '#addplayer' ).click( function() {
    //Get Value from textfield
    var playername = $( '#new-player' ).val();
    //Clean up the textfield
    $( '#new-player' ).val("");
    //alert(playername);
     

    //AJAX Call to backend
    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'SET';
    ajaxRequest['method'] = 'addPlayer';
    ajaxRequest['content'] = playername;

    $.ajax({
      url: 'include/php/backend.php',
      type: 'post',
      data: ajaxRequest,
      success: function(data, status) {
        Logger(data);

        data = JSON.parse(data);

        if(data['statuscode']){
            notify("azurblue", "Information", data['content']);
            getAllPlayers();
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

});


$( '#deleteplayer' ).click( function() {
    //Get Selected players
    var selectedplayers = getSelectedPlayersArrayID();

    Logger("Delete following Players: "+selectedplayers);

    //AJAX Call to backend
    var ajaxRequest = new Object();
    ajaxRequest['action'] = 'SET';
    ajaxRequest['method'] = 'deletePlayer';
    ajaxRequest['content'] = selectedplayers;

    $.ajax({
      url: 'include/php/backend.php',
      type: 'post',
      data: ajaxRequest,
      success: function(data, status) {
        Logger(data);

        data = JSON.parse(data);

        if(data['statuscode']){
            notify("azurblue", "Information", data['content']);
            getAllPlayers();
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

});

function getAllPlayers(){
    
  //AJAX Call to backend
  var ajaxRequest = new Object();
  ajaxRequest['action'] = 'GET';
  ajaxRequest['method'] = 'getAllPlayers';

  $.ajax({
    url: 'include/php/backend.php',
    type: 'post',
    data: ajaxRequest,
    success: function(data, status) {
      //Logger(data);

      data = JSON.parse(data);

      if(data['statuscode']){
          PlayerArray = data['content'];
          displayPlayerlist(PlayerArray);
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

function displayPlayerlist(allPlayersArray){    

    //Remove old itemlist to refresh it
    $('.list-group-item').remove();

    if(allPlayersArray != null){
        if(allPlayersArray.length > 0)
        {
          $('#hintshowplayerlist').remove();
          createSelectPlayerlist(allPlayersArray);
        }
    }
}

function createSelectPlayerlist( arr )  // Pass the Array as argument.
{ 
  var string = "";
  for(var i=0; i<arr.length;i++){
    string+= '<label class="list-group-item"><input class="form-check-input" name="playerselection" type="checkbox" data-arrayID="'+i+'" value="'+ arr[i] +'"> '+ arr[i] +'</label>'
  }

  // string+= '<li class="list-group-item"><label class="list-group-item"><input class="form-check-input" name="playerselection" type="checkbox" data-arrayID="'+i+'" value="'+ arr[i] +'"> '+ arr[i] +'</label></li>'

  $('#check-list-box').html(string);

}

function getSelectedPlayers(){
    var selectedplayers = [];
    $.each($("input[name='playerselection']:checked"), function(){            
        selectedplayers.push($(this).val());
    });

    return selectedplayers;
}

function getCreatedPlayers(){
  var createdplayers = [];
  $.each($("input[name='playerselection']"), function(){            
    createdplayers.push($(this).val());
  });

  return createdplayers;
}

function getSelectedPlayersArrayID(){
    var selectedplayers = [];
    $.each($("input[name='playerselection']:checked"), function(){            
        selectedplayers.push($(this).attr('data-arrayID'));
    });

    return selectedplayers;
}

//Inputmethod was toggled
$('input[name="inputmethod"]').change( function() {
  if($(this).val() == "numbers"){
    $('#inputmethodnumbers_checkboxdiv').show();
  }
  else{
    $('#inputmethodnumbers_checkboxdiv').hide();
  }
});

function getCalculatedAverage(averageArray){

  var AverageScored = 0;

  //Calculate Average
  for (let x = 0; x < averageArray.length; x++) {
      AverageScored += parseInt(averageArray[x]);
  }

  //3 Dart Average
  AverageScored = AverageScored / (averageArray.length / 3);

  //Round value with 2 decimals
  AverageScored = round(AverageScored, 2);

  return AverageScored;
}


$('#loadPreviousSession').click(function(){

  var DBAccessorKey = $('#monitoring-code').val();
  var title = '<i class="fa-duotone fa-clock-rotate-left fa-lg"></i> Vorheriges Spiel laden';
  var footer = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-23.5rem;"><i class="fa-duotone fa-circle-check fa-lg"></i> Okay</button>';
  var body = "Es gibt kein vorheriges Spiel zum Code: '"+DBAccessorKey+"'.";

  //Show previousSession if exists

  //AJAX Call to backend
  var ajaxRequest = new Object();
  ajaxRequest['action'] = 'GET';
  ajaxRequest['method'] = 'getSavedSessionData';
  ajaxRequest['content'] = DBAccessorKey;
  
  $.ajax({
    url: 'include/php/backend.php',
    type: 'post',
    data: ajaxRequest,
    success: function(data, status) {
      //Logger(data);
  
      data = JSON.parse(data);

      if(data['statuscode']){

        //Es gibt kein Content
        if(data['content'] != "" && data['content'] != null){

        data['content'] = JSON.parse(data['content']);

        //Logger(data['content']);

        var SavedSessionData = data['content']['lastSnapshot'];

        var counter = 0;
        var wonLegsPlayer = 0;
        var averagePlayer = 0;

        body = "Soll das folgende Spiel geladen werden?<br><br>";
          
        body += '<table class="table table table-striped"><thead class="table-dark"><tr><th scope="col">#</th><th scope="col">Spieler</th><th scope="col">Average</th><th scope="col">Gewonnene Legs</th></tr></thead><tbody>';

        for(let x=0; x<SavedSessionData['PlayerInterface'].length;x++){
          counter = x+1;
          wonLegsPlayer = 0;
          averagePlayer = 0;


          //Get WonLegs by Player
          if(SavedSessionData['PlayerWonLegs'] != null && SavedSessionData['PlayerWonLegs'].length > 0){
            if(SavedSessionData['PlayerWonLegs'][x] != null){
              wonLegsPlayer = SavedSessionData['PlayerWonLegs'][x];
            }
          }

          //Get Average by Player
          if(SavedSessionData['PlayerAverages'] != null && SavedSessionData['PlayerAverages'].length > 0){
            if(SavedSessionData['PlayerAverages'][x] != null){
              averagePlayer = getCalculatedAverage(SavedSessionData['PlayerAverages'][x]);
            }
          }

          body+= '<tr><th scope="row">'+counter+'</th><td>'+SavedSessionData['PlayerInterface'][x]['playernamefield']+'</td><td>'+averagePlayer+'</td><td>'+wonLegsPlayer+'</td></tr>';
        }

        body += "</tbody></table>";

        //Set other Buttons in Footer
        footer = '<button id="confirmLoadPreviousSession" type="button" class="btn btn-primary" data-bs-dismiss="modal" style="position:relative; left:-19.5rem;"><i class="fa-duotone fa-circle-check fa-lg"></i> Ja</button> <button type="button" class="btn btn-danger" data-bs-dismiss="modal"><i class="fa-duotone fa-circle-xmark fa-lg"></i> Nein</button>';
  
      }
      //Zeige Modal an
      $('#modal-title').html(title);
      $('#modal-body').html(body);
      $('#modal-footer').html(footer);
        
      var myModal = new bootstrap.Modal(document.getElementById('modal'));
      myModal.show();

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

});


$('#modal-footer').on("click", '#confirmLoadPreviousSession', function(e){
  window.location.href = "./game.php?loadGame=true&code="+$('#monitoring-code').val()+"";
});

$(".startgame").click(function(){

    //Get selected players
    var selectedplayers = getSelectedPlayers();
    Logger("SelectedPlayers: "+selectedplayers);

    var createdplayers = getCreatedPlayers();
    Logger("Players: "+createdplayers);


    //Get settings
    var Gamemode = $('#gamemode input:radio:checked').val();
    var Checkoutmode = $('#checkoutmode input:radio:checked').val();
    var Checkoutpath = $('#showcheckoutpath input:radio:checked').val();
    var InputMethod = $('#inputmethod input:radio:checked').val();
    var showRealColors = $('#inputmethodnumbers_realcolor').is(':checked');
    var activateMonitoring = $('#activateMonitoring').is(':checked');
    var DBAccessorKey = $('#monitoring-code').val();
    var DBRefreshTime = $('#refreshrate').val();

    Logger("Gamemode: "+Gamemode);
    Logger("Checkoutmode: "+Checkoutmode);
    Logger("Checkoutpath: "+Checkoutpath);
    Logger("InputMethod: "+InputMethod);
    Logger("showRealColors: "+showRealColors);
    Logger("activateMonitoring: "+activateMonitoring);
    Logger("DBAccessorKey: "+DBAccessorKey);
    Logger("DBRefreshTime: "+DBRefreshTime);

    var gameSettings = new Object();
    gameSettings["Gamemode"] = Gamemode;
    gameSettings["Checkoutmode"] = Checkoutmode;
    gameSettings["Checkoutpath"] = Checkoutpath;
    gameSettings["InputMethod"] = InputMethod;
    gameSettings["showRealColors"] = showRealColors;
    gameSettings["SelectedPlayers"] = selectedplayers;
    gameSettings["Players"] = createdplayers;
    gameSettings["activateMonitoring"] = activateMonitoring;
    gameSettings["DBAccessorKey"] = DBAccessorKey;
    gameSettings["DBRefreshTime"] = DBRefreshTime;

     //AJAX Call to backend
     var ajaxRequest = new Object();
     ajaxRequest['action'] = 'SET';
     ajaxRequest['method'] = 'saveGamesettings';
     ajaxRequest['content'] = gameSettings;
 
     $.ajax({
       url: 'include/php/backend.php',
       type: 'post',
       data: ajaxRequest,
       success: function(data, status) {
         Logger(data);
 
         data = JSON.parse(data);
 
         if(data['statuscode']){
            //Store current Gamesettings in a Cookie -> send via HTTPS and strict
            Cookies.set('GameSettings', JSON.stringify(gameSettings), { expires: 180, sameSite:'strict', secure: true });

            notify("azurblue", "Information", data['content']);
            window.location.href = "./game.php";
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

});