<?php


function getRandomString($n) {
    $characters = '0123456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';
    $randomString = '';
  
    for ($i = 0; $i < $n; $i++) {
        $index = rand(0, strlen($characters) - 1);
        $randomString .= $characters[$index];
    }
  
    return $randomString;
}

function parse_boolean($obj) {
  return filter_var($obj, FILTER_VALIDATE_BOOLEAN);
}

function displayErrorSite($error){
    echo ' 
  <!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Gamemode of Darts Calculator">
    <meta name="author" content="Marcel Huss">
    <meta name="keywords" content="HTML,CSS,JavaScript, Darts Calculator, Settings">
    <!--Favicons-->
    <link rel="apple-touch-icon" sizes="180x180" href="./include/img/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./include/img/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./include/img/favicons/favicon-16x16.png">
    <link rel="manifest" href="./include/img/favicons/manifest.json">
    <link rel="mask-icon" href="./include/img/favicons/safari-pinned-tab.svg" color="#277cea">
    <link rel="shortcut icon" href="./include/img/favicons/favicon.ico">
    <meta name="msapplication-config" content="./include/img/favicons/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">


    <title>DartsCalculator - Monitoring</title>
    <!-- Bootstrap core CSS -->
    <link href="./include/css/bootstrap.min.css" rel="stylesheet">
    <link href="./include/css/fontawesome6.all.min.css" rel="stylesheet">
    <link href="./include/css/notification-service.1.0.1.css" rel="stylesheet">
    <link href="./include/css/game.css" rel="stylesheet">

  </head>

  <body class="darkbody">
  
    <div class="container-full">
      <div class="row">
        <div class="col-12">
          <div class="col-6 mx-auto">
            <h2 style="color:white; float:center">'.$error.'</h2>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <form action="monitoring.php" method="get" class="col-6 mx-auto">
            <div class="input-group mb-3">
              <span class="input-group-text" id="monitoring-code-addon"><i class="fa-solid fa-key"></i></span>
              <input id="monitoring-code" type="text" class="form-control" placeholder="Monitoring-Code" name="code" aria-label="Monitoring-Code" aria-describedby="monitoring-code-addon" value="">
            </div>

            <button id="randomMonitoringCode" type="submit" class="btn btn-primary" tabindex="1"><i class="fa-solid fa-paper-plane fa-lg" aria-hidden="true"></i> Senden</button>

          </form>
        </div>
      </div>

      <div class="row" style="margin-top:20px;">
      <div class="col-12">
        <div class="col-6 mx-auto">
          <h3 style="color:white; float:center">Eventuell existiert der Code momentan noch nicht...<br>Zum erneuten Laden der Seite folgenden Button</h3>
        </div>
      </div>
    </div>

      <div class="row">
        <div class="col-12">
          <div class="col-6 mx-auto">
            <button id="refreshpage" type="button" class="btn btn-primary" tabindex="1"><i class="fa-solid fa-rotate-forward fa-lg" aria-hidden="true"></i> Seite erneut laden</button>
          </div>
        </div>
      </div>

    </div>


      <!-- JS Librarys at the end -->
      <script type="text/javascript" src="include/js/bootstrap.bundle.min.js"></script>
      <script type="text/javascript" src="include/js/jquery-3.5.1.min.js"></script>
      <script type="text/javascript" src="include/js/fontawesome6.all.min.js"></script>
      <script type="text/javascript" src="include/js/monitoring.js"></script>

    </body>
  </html> ';
  }
  
?>