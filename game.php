<?php
require_once('include/php/session.php');

if(!count($_SESSION['SelectedPlayers']) > 0 && !isset($_GET['loadGame'])){
  header("Location: index.php");
  exit();
}

$version = "1.0.6";

?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Game of Darts Calculator">
    <meta name="author" content="Marcel Huss">
    <meta name="keywords" content="HTML,CSS,JavaScript, Darts Calculator, Game, Darts">
    <!--Favicons-->
    <link rel="apple-touch-icon" sizes="180x180" href="./include/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./include/img/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./include/img/favicons/favicon-16x16.png">
    <link rel="manifest" href="./include/img/favicons/manifest.json">
    <link rel="mask-icon" href="./include/img/favicons/safari-pinned-tab.svg" color="#277cea">
    <link rel="shortcut icon" href="./include/img/favicons/favicon.ico">
    <meta name="msapplication-config" content="./include/img/favicons/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">


    <title>DartsCalculator - Game</title>
    <!-- Bootstrap core CSS -->
    <link href="./include/css/bootstrap.min.css" rel="stylesheet">
    <link href="./include/css/fontawesome6.all.min.css" rel="stylesheet">
    <link href="./include/css/notification-service.1.0.1.css" rel="stylesheet">
    <link href="./include/css/dartboard.css?v=<?php echo $version;?>" rel="stylesheet">
    <link href="./include/css/game.css?v=<?php echo $version;?>" rel="stylesheet">

  </head>
  <body class="darkbody">

<div class="container-full">

  <div class="row">

  <div class="col-12 col-md-11 col-lg-5 col-xl-6 leftinformationtable">
    <ul id="playerlist" class="playerlist"> </ul>
  </div>

  <div class="col-12 col-md-1 col-lg-1 col-xl-1 darts" style="margin-left:-0.5rem;">
    <img id="dart1" src="include/img/dart-icon-white.png"></img>
    <img id="dart2" src="include/img/dart-icon-white.png"></img>
    <img id="dart3" src="include/img/dart-icon-white.png"></img>
  </div>

    <div class="col-12 col-md-12 col-lg-6 col-xl-5">
      
      <div class="col-12" id="numberblock">
      <ul class="list-group list-group-horizontal list-inline">
        <!--<li class="list-group-item flex-fill" style="padding-top:15px"><h3><i class="fa-duotone fa-bullseye-arrow"></i> Eingabe</h3></li>-->
        <li class="list-group-item flex-fill"><button id="undomove" type="button" class="btn btn-primary" style="margin-top:5px; margin-right:15px; float:left;"><i class="fa-duotone fa-clock-rotate-left fa-lg"></i> UNDO</button><button id="showstats" type="button" class="btn btn-primary" style="margin-top:5px; margin-right:15px; float:center;"><i class="fa-duotone fa-chart-line fa-lg"></i> Statistiken</button><button id="showinfos" type="button" class="btn btn-primary" style="margin-top:5px; margin-right:15px; float:center;"><i class="fa-duotone fa-circle-info fa-lg"></i> Infos</button><button id="quitgame" type="button" class="btn btn-primary" style="margin-top:5px; float:right;"><i class="fa-duotone fa-right-from-bracket fa-lg"></i> Beenden</button></li>
      </ul>

      <?php

      //Loop through darts numbers
      for( $i = 20; $i >= 1; $i-- ) {

        //Define red and green numbers
        $redButtonsArray = [20,18,14,13,12,10,8,7,3,2];
        $greenButtonsArray = [19,17,16,15,11,9,6,5,4,1];

        $singleFields = "btn-primary";
        $multipliedFields = "btn-default";

        if($_SESSION['showRealColors'] == "true"){
          if (in_array($i, $redButtonsArray)) {
            $singleFields = "btn-blacknumber";
            $multipliedFields = "btn-rednumber";
          }else{
            $singleFields = "btn-beigenumber";
            $multipliedFields = "btn-greennumber";
          }
        }

        //UL zumachen, wenn $i kleiner als 20 ist und durch 4 teilbar ist!
        if($i < 20){
          if($i % 4 == 0){echo '</ul>';}
        }

        //UL aufmachen, wenn $i durch 4 teilbar ist
        if($i % 4 == 0){echo '<ul class="list-group list-group-horizontal col-sm-12">';}

        echo '
          <li class="list-group-item col-sm-3 text-center">
            	<button type="button" class="btn '.$singleFields.' addpoints btn-addpoints-margin col-12" data-value="' . $i . '">' . $i . '</button>
					  	<button type="button" class="btn '.$multipliedFields.' addpoints btn-addpoints-margin col-12" data-value="D' . ( $i ) . '">D' . ( $i ) . '</button>
            	<button type="button" class="btn '.$multipliedFields.' addpoints btn-addpoints-margin col-12" data-value="T' . ( $i ) . '">T' . ( $i ). '</button>
          </li>';

        /*
        echo '
          <li class="list-group-item col-sm-3 text-center">
            	<button type="button" class="btn '.$singleFields.' addpoints btn-addpoints-margin col-12" data-value="' . $i . '">' . $i . '</button>
					  	<button type="button" class="btn '.$multipliedFields.' addpoints btn-addpoints-margin col-12" data-value="D' . ( $i ) . '">D(' . ( 2 * $i ) . ')</button>
            	<button type="button" class="btn '.$multipliedFields.' addpoints btn-addpoints-margin col-12" data-value="T' . ( $i ) . '">T(' . ( 3 * $i ). ')</button>
          </li>';*/
      }
          
      echo '</ul>
      <ul class="list-group list-group-horizontal col-12">
        <li class="list-group-item col-12 text-center">
          <button type="button" class="btn btn-default addpoints btn-addpoints-margin col-12 col-sm-3" data-value="MISS">MISS</button>
          <button type="button" class="btn btn-success addpoints btn-addpoints-margin col-12 col-sm-3" data-value="SB">SingleBull</button>
          <button type="button" class="btn btn-danger addpoints btn-addpoints-margin col-12 col-sm-3" data-value="DB">BullsEye</button>			
        </li>
      </ul>';?>

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
    <script type="text/javascript" src="include/js/js-cookie-2.2.1.min.js"></script>

    <script type="text/javascript" src="include/js/functions.js?v=<?php echo $version;?>"></script>
    <script type="text/javascript" src="include/js/checkoutpaths.js?v=<?php echo $version;?>"></script>
    <script type="text/javascript" src="include/js/game.js?v=<?php echo $version;?>"></script>

  </body>
</html>    