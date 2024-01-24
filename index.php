<?php
require_once('include/php/session.php');

/*
//Load Cookie if exist
$cookie_name = "GameSettings";
if(isset($_COOKIE[$cookie_name])) {

  $cookieContent = json_decode($_COOKIE[$cookie_name],true);
  $_SESSION['DBAccessorKey'] = $cookieContent['DBAccessorKey'];
  $_SESSION['Gamemode'] = $cookieContent['Gamemode'];
  $_SESSION['Checkoutmode'] = $cookieContent['Checkoutmode'];
  $_SESSION['Checkoutpath'] = $cookieContent['Checkoutpath'];
  $_SESSION['InputMethod'] = $cookieContent['InputMethod'];
  $_SESSION['showRealColors'] = $cookieContent['showRealColors'];
  $_SESSION['SelectedPlayers'] = $cookieContent['SelectedPlayers'];
  $_SESSION['Players'] = $cookieContent['Players'];
  $_SESSION['activateMonitoring'] = $cookieContent['activateMonitoring'];
  $_SESSION['DBAccessorKey'] = $cookieContent['DBAccessorKey'];
  $_SESSION['DBRefreshTime'] = $cookieContent['DBRefreshTime'];

  //echo "Cookieinhalt: " . $_COOKIE[$cookie_name];
  
}
*/
?>

<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Settings of Darts Calculator">
    <meta name="author" content="Marcel Huss">
    <meta name="keywords" content="HTML,CSS,JavaScript, Darts Calculator, Settings, Darts">
    <!--Favicons-->
    <link rel="apple-touch-icon" sizes="180x180" href="./include/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./include/img/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./include/img/favicons/favicon-16x16.png">
    <link rel="manifest" href="./include/img/favicons/manifest.json">
    <link rel="mask-icon" href="./include/img/favicons/safari-pinned-tab.svg" color="#277cea">
    <link rel="shortcut icon" href="./include/img/favicons/favicon.ico">
    <meta name="msapplication-config" content="./include/img/favicons/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">


    <title>DartsCalculator - Settings</title>
    <!-- Bootstrap core CSS -->
    <link href="./include/css/bootstrap.min.css" rel="stylesheet">
    <link href="./include/css/fontawesome6.all.min.css" rel="stylesheet">
    <link href="./include/css/notification-service.1.0.1.css" rel="stylesheet">
    <link href="./include/css/main.css" rel="stylesheet">

  </head>
  <body class="lightbody">

    <div class="container" style="margin-top:20px;">
    <div class="row">

        <div class="col-md-6">
          <h2>Spielmodus</h2>
          <p>Standard ist '501'. Für Anfänger werden kürzere Distanzen empfohlen.</p>

            <div id="gamemode" class="btn-group" role="group">
              <input type="radio" class="btn-check" name="gamemode" id="gamemode301" autocomplete="off" value="301" <?php if($_SESSION['Gamemode'] == "301"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="gamemode301">301</label>

              <input type="radio" class="btn-check" name="gamemode" id="gamemode401" autocomplete="off" value="401" <?php if($_SESSION['Gamemode'] == "401"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="gamemode401">401</label>

              <input type="radio" class="btn-check" name="gamemode" id="gamemode501" autocomplete="off" value="501" <?php if($_SESSION['Gamemode'] == "501"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="gamemode501">501</label>
            </div>

            oder
            <button id="openPracticeLink" type="button" class="btn btn-primary col-4" tabindex="1"><i class='fa-duotone fa-arrow-up-right-from-square fa-lg' aria-hidden='true'></i> Trainingsmodus</button>

            <hr>

          <h2>Checkout</h2>
          <p>Welcher Checkout-Modus soll gespielt werden? Für Anfänger wird 'Straight Out' empfohlen.</p>

            <div id="checkoutmode" class="btn-group" role="group">
              <input type="radio" class="btn-check" name="checkoutmode" id="checkoutmodeSO" autocomplete="off" value="straightout" <?php if($_SESSION['Checkoutmode'] == "straightout"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="checkoutmodeSO">Straight Out</label>

              <input type="radio" class="btn-check" name="checkoutmode" id="checkoutmodeDO" autocomplete="off" value="doubleout" <?php if($_SESSION['Checkoutmode'] == "doubleout"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="checkoutmodeDO">Double Out</label>

              <input type="radio" class="btn-check" name="checkoutmode" id="checkoutmodeDIDO" autocomplete="off" value="doublein_doubleout" <?php if($_SESSION['Checkoutmode'] == "doublein_doubleout"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="checkoutmodeDIDO">Double In - Double Out</label>
            </div>

            <hr>

    
          <h2>Anzeige möglicher Checkout-Wege</h2>
          <p>Sollen mögliche Standard-Checkout-Wege angezeigt werden?<br><i class="fa fa-info-circle" aria-hidden="true"></i> Nur verfügbar in Double Out & Double In - Double Out</p>
            <div id="showcheckoutpath" class="btn-group" role="group">
              <input type="radio" class="btn-check" name="showcheckoutpath" id="showcheckoutpathyes" autocomplete="off" value="yes" <?php if($_SESSION['Checkoutpath'] == "yes"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="showcheckoutpathyes">Ja</label>

              <input type="radio" class="btn-check" name="showcheckoutpath" id="showcheckoutpathno" autocomplete="off" value="no" <?php if($_SESSION['Checkoutpath'] == "no"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="showcheckoutpathno">Nein</label>

            </div>

            <hr>

          <h2>Eingabemethode</h2>
          <p>Soll eine Dartscheibe zur Eingabe genutzt werden oder ein Nummernblock?</p>
            <div id="inputmethod" class="btn-group" role="group">
              <input type="radio" class="btn-check" name="inputmethod" id="inputmethoddartboard" autocomplete="off" value="dartboard" disabled <?php if($_SESSION['InputMethod'] == "dartboard"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="inputmethoddartboard">Dartboard</label>

              <input type="radio" class="btn-check" name="inputmethod" id="inputmethodnumbers" autocomplete="off" value="numbers" <?php if($_SESSION['InputMethod'] == "numbers"){echo "checked";}?>>
              <label class="btn btn-outline-primary" for="inputmethodnumbers">Nummernblock</label>

            </div>

            <div id="inputmethodnumbers_checkboxdiv" style="display:block; margin-top:0.5em;">
            <p>Sollen die Nummbernfarben dem Dartboard entsprechen eingefärbt werden? (rot,grün,beige,schwarz)</p>
              <div class="form-check funkyradio">
                <input class="form-check-input" type="checkbox" value="showRealColor" id="inputmethodnumbers_realcolor"  <?php if($_SESSION['showRealColors'] == "true"){echo "checked";}?> />
                <label class="form-check-label" for="inputmethodnumbers_realcolor">
                  Dartboard Feldfarben anzeigen
                </label>
              </div>
            </div>

            <hr>

            <h2>Spiel starten</h2>
            <p>Nachdem mindestens ein Spieler ausgewählt wurde, kann das Spiel gestartet werden. Alternativ kann das vorherige Spiel fortgesetzt werden.</p>
            <div class="row">
            <div class="col-12 col-md-6">
              <button id="gameon" type="button" class="btn btn-lg col-12 btn-primary startgame" style="margin-bottom:20px;" tabindex="2"><i class="fa-duotone fa-bullseye-arrow fa-lg"></i> Neues Spiel starten</button>
            </div>
            <div class="col-12 col-md-6">
              <button id="loadPreviousSession" type="button" class="btn btn-lg col-12 btn-primary" style="margin-bottom:20px;" tabindex="2"><i class="fa-duotone fa-clock-rotate-left fa-lg"></i> Vorheriges Spiel laden</button>
            </div>

            </div>

            
        </div>

        <div class="col-md-6">

            <h2>Zuschauermodus</h2>
            <p>Das Spiel kann auch parallel im Zuschauer-Modus angezeigt werden. Zum Beispiel für Spiele über das Internet, vergleichbar mit der Anzeige bei Darts Events.<br><br>Code auf der Zuschauer-Seite eingeben.</p>

            <div class="row">
              <div class="col-12 col-md-7">
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="monitoring-code-addon"><i class="fa-duotone fa-key"></i></span>
                    <input id="monitoring-code" type="text" class="form-control" placeholder="Monitoring-Code" aria-label="Monitoring-Code" aria-describedby="monitoring-code-addon" value="<?php if(isset($_SESSION['DBAccessorKey'])){echo $_SESSION['DBAccessorKey'];}?>" autocomplete="off">
                  </div>
              </div>

              <div class="col-12 col-md-5">
                <button id="randomMonitoringCode" type="button" class="btn btn-primary col-12" tabindex="1"><i class='fa-duotone fa-dice fa-lg' aria-hidden='true'></i> Zufälliger Code</button>
              </div>
            </div>

            <div class="row">
              <p>Wie oft soll abgefragt werden, ob neue Daten vorliegen?</p>
              <div class="col-12 col-md-8">
                <div class="slidecontainer">
                  <input type="range" min="1" max="60" value="<?php if(isset($_SESSION['DBRefreshTime'])){echo $_SESSION['DBRefreshTime'];}?>" class="slider" id="refreshrate">
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div id="refreshratevalue">Alle <?php if(isset($_SESSION['DBRefreshTime'])){echo $_SESSION['DBRefreshTime'];}?> Sek.</div>  
              </div>
            </div>

            <div id="activateMonitoring_checkboxdiv">
              <!--Soll Zuschauermodus aktiviert werden?-->
              <div class="form-check funkyradio" style="display:inline-block; margin-left:0.5em; margin-bottom:0.5em; margin-top:0.5em;">
                <input class="form-check-input" type="checkbox" value="no" id="activateMonitoring" <?php if($_SESSION['activateMonitoring'] == "true"){echo "checked";}?>/>
                <label class="form-check-label" for="activateMonitoring">
                  Zuschauermodus aktivieren
                </label>
              </div>
            </div>

            <div class="row">
              <div class="col-12 col-md-6">
                <button id="copyMonitoringLink" type="button" class="btn btn-primary col-12" tabindex="1"><i class='fa-duotone fa-clipboard fa-lg' aria-hidden='true'></i> Link kopieren</button>
              </div>

              <div class="col-12 col-md-6">
                <button id="openMonitoringLink" type="button" class="btn btn-primary col-12" tabindex="1"><i class='fa-duotone fa-arrow-up-right-from-square fa-lg' aria-hidden='true'></i> Link öffnen</button>
              </div>
            </div>

            <hr>

             <h2>Spieler hinzufügen</h2>
             <p>Namen eingeben und auf 'Spieler hinzufügen' klicken.<br>Spieler dürfen gleich heißen, kann allerdings zu Verwirrung führen...</p>
             
             <div class="input-group mb-3">
              <span class="input-group-text" id="playername-addon"><i class="fa-duotone fa-user fa-lg"></i></span>
              <input id="new-player" type="text" class="form-control" placeholder="Spielername" aria-label="Spielername" aria-describedby="playername-addon" autocomplete="off">
             </div>

              <button id="addplayer" type="button" class="btn btn-primary col-12 col-md-5" tabindex="1"><i class='fa-duotone fa-user-plus fa-lg' aria-hidden='true'></i> Spieler hinzufügen</button>
              <button id="deleteplayer" type="button" class="btn btn-danger col-12 col-md-5" style="float:right;" tabindex="1"><i class='fa-duotone fa-user-minus fa-lg' aria-hidden='true'></i> Spieler entfernen</button>				
         
            <hr>

            <h2>Spieler auswählen</h2>
            <p>Die Spieler können auch noch verschoben werden, der Spieler welcher oben steht fängt an. Dies geht einfach per Drag&Drop (<i class="fa-duotone fa-up-down-left-right"></i>)</p>
            <div class="greybox" style="max-height: 500px;overflow: auto;">
                <div id="hintshowplayerlist" align="center"><p style="display:inline; color: #353c43;">Keine Spieler angelegt</p></div>
            	<ul id="check-list-box" class="list-group checked-list-box"></ul>
                
            </div>
        </div>      
    </div>

      <!---Modal -->
      <div id="modal" class="modal" tabindex="-1">
      <div class="modal-dialog"> <!--modal-xl-->
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modal-title" class="modal-title">MODAL_TITLE</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div id="modal-body" class="modal-body"></div>
          <div id="modal-footer" class="modal-footer"></div>
        </div>
      </div>
    </div>

</div>

<!-- JS Librarys at the end -->
<script type="text/javascript" src="include/js/bootstrap.bundle.min.js"></script>
<script type="text/javascript" src="include/js/jquery-3.5.1.min.js"></script>
<script type="text/javascript" src="include/js/fontawesome6.all.min.js"></script>
<script type="text/javascript" src="include/js/notification.1.0.1.js"></script>
<script type="text/javascript" src="include/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="include/js/jquery.ui.touch-punch.min.js"></script>
<script type="text/javascript" src="include/js/js-cookie-2.2.1.min.js"></script>

<script type="text/javascript" src="include/js/functions.js"></script>
<script type="text/javascript" src="include/js/index.js"></script>

</body>
</html>