<?php
/*
PHP_SESSION_DISABLED = 0
PHP_SESSION_NONE = 1
PHP_SESSION_ACTIVE  = 2
 */
if (session_status() == PHP_SESSION_NONE || session_status() == 1) {
    session_start();
}

//Players
if(!isset($_SESSION['Players'])){
    $_SESSION['Players'] = array();
}

//SelectedPlayers
if(!isset($_SESSION['SelectedPlayers'])){
    $_SESSION['SelectedPlayers'] = array();
}

//Gamemode
if(!isset($_SESSION['Gamemode'])){
    $_SESSION['Gamemode'] = 501;
}

//Checkoutmode
if(!isset($_SESSION['Checkoutmode'])){
    $_SESSION['Checkoutmode'] = "doubleout";
}

//Checkoutpath
if(!isset($_SESSION['Checkoutpath'])){
    $_SESSION['Checkoutpath'] = "yes";
}

//InputMethod
if(!isset($_SESSION['InputMethod'])){
    $_SESSION['InputMethod'] = "numbers";
}

//InputMethod_NumbersRealColor
if(!isset($_SESSION['showRealColors'])){
    $_SESSION['showRealColors'] = "false";
}

//RandomDBAccessorKey
if(!isset($_SESSION['DBAccessorKey'])){
    //$_SESSION['DBAccessorKey'] = "DARTS4EVER";

    $characters = '0123456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    $n = 5;
  
    for ($i = 0; $i < $n; $i++) {
        $index = rand(0, strlen($characters) - 1);
        $randomString .= $characters[$index];
    }

    $_SESSION['DBAccessorKey'] = $randomString;

}

//activateMonitoring
if(!isset($_SESSION['activateMonitoring'])){
    $_SESSION['activateMonitoring'] = "false";
}

//DBRefreshTime
if(!isset($_SESSION['DBRefreshTime'])){
    $_SESSION['DBRefreshTime'] = 3;
}

//OVERWRITE SessionVars?

if(!isset($_SESSION['WriteCookieDataToSession'])){
    $_SESSION['WriteCookieDataToSession'] = true;
}

//Does a cookie with nessessary data exist?

$cookie_name = "GameSettings";
if(isset($_COOKIE[$cookie_name]) && $_SESSION['WriteCookieDataToSession']) {

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

  $_SESSION['WriteCookieDataToSession'] = false;

  //echo "Cookieinhalt: " . $_COOKIE[$cookie_name];
}

?>