<?php

//No Cache of AJAX
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require_once('session.php');
require_once('dbconfig.php');
require_once('sqldata.php');
require_once('functions.php');


$backendResponse['statuscode'] = false;
$backendResponse['content'] = "Irgendwas ist schief gelaufen.";

//GETTER
if(isset($_POST['action']) && $_POST['action'] == "GET"){
    //which methode?
    if(isset($_POST['method'])){

        switch($_POST['method']){
            case "getAllPlayers":
                $backendResponse['content'] = "GET-Methode: getAllPlayers ist fehlerhaft.";
                if(isset($_SESSION['Players'])){
                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = $_SESSION['Players'];
                }
                break;

            case "getGamesettings":
                    $Gamesettings = array();
                    $Gamesettings['Gamemode'] = $_SESSION['Gamemode'];
                    $Gamesettings['Checkoutmode'] = $_SESSION['Checkoutmode'];
                    $Gamesettings['Checkoutpath'] = $_SESSION['Checkoutpath'];
                    $Gamesettings['InputMethod'] = $_SESSION['InputMethod'];
                    $Gamesettings['showRealColors'] = parse_boolean($_SESSION['showRealColors']);
                    $Gamesettings['SelectedPlayers'] = $_SESSION['SelectedPlayers'];
                    $Gamesettings['Players'] = $_SESSION['Players'];
                    $Gamesettings['activateMonitoring'] = parse_boolean($_SESSION['activateMonitoring']);
                    $Gamesettings['DBAccessorKey'] = $_SESSION['DBAccessorKey'];
                    $Gamesettings['DBRefreshTime'] = $_SESSION['DBRefreshTime'];

                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = $Gamesettings; 
                    break; 

            case "generateMonitoringCode":
                $backendResponse['statuscode'] = true;
                $backendResponse['content'] = getRandomString(5);
                break;

            case "getGameData":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                $backendResponse['statuscode'] = true;
                $backendResponse['content'] = SelectGameData($db, $_POST['content']);
                }
                break;

            case "getLastUpdate":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                $backendResponse['statuscode'] = true;
                $backendResponse['content'] = SelectLastUpdate($db, $_POST['content']);
                }
                break;

            case "isAccessorCodeValid":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                $backendResponse['statuscode'] = true;
                $backendResponse['content'] = AccessorKeyAlreadyExist($db, $_POST['content']);
                }
                break;

            case "getLegHistoryData":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                $backendResponse['statuscode'] = true;
                $backendResponse['content'] = SelectLegHistoryData($db, $_POST['content']);
                }
                break;

            case "getSavedSessionData":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = SelectSavedSessionData($db, $_POST['content']);
                }
                break;

            case "getSavedSessionDataAndPushItToSession":
                if(isset($_POST['content']) && $_POST['content'] != ""){
                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = SelectSavedSessionDataAndPushToSession($db, $_POST['content']);
                }
                break;

            default:
                $backendResponse['content'] = "GET-Methode: Default ausgelöst.";
                break;
        }
    }
}

//SETTER
if(isset($_POST['action']) && $_POST['action'] == "SET"){
    //which methode?
    if(isset($_POST['method'])){

        switch($_POST['method']){
            case "addPlayer":
                $backendResponse['content'] = "SET-Methode: addPlayer ist fehlerhaft.";
                if(isset($_POST['content']) && $_POST['content'] != ""){
                    array_push($_SESSION['Players'],$_POST['content']);
                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = "Spieler ".ucfirst($_POST['content'])." wurde hinzugefügt."; 
                }
                else{
                    $backendResponse['content'] = "Spielername darf nicht leer sein.";
                }
                break;

            case "deletePlayer":
                $backendResponse['content'] = "SET-Methode: deletePlayer ist fehlerhaft.";
                $temptext = "";
                if(isset($_POST['content']) && $_POST['content'] != null){

                    if(count($_POST['content']) > 0){

                        //Rückwärts durch die Liste loopen
                        for($x=count($_POST['content']) - 1;$x >= 0; $x--){
                            //ArrayID aus Content holen und entsprechenden Player entfernen
                            $arrkey = $_POST['content'][$x];
                            $temptext.= $_SESSION['Players'][$arrkey];
                            if($x > 0){$temptext.=",";}
                            unset($_SESSION['Players'][$arrkey]);
                        }
                        $_SESSION['Players'] = array_values($_SESSION['Players']);

                        $backendResponse['statuscode'] = true;
                        $backendResponse['content'] = "Ausgewählte Spieler (".$temptext.") wurden entfernt."; 
                    }
                }
                else{
                    $backendResponse['content'] = "Es muss mindestens ein Spieler ausgewählt sein.";
                }
                break;

            case "saveGamesettings":
                $backendResponse['content'] = "SET-Methode: saveGamesettings ist fehlerhaft.";
                if(isset($_POST['content']) && $_POST['content'] != null){

                    $monitorCode = "";

                    //Fehler abfangen
                    if(!isset($_POST['content']['Players']) || $_POST['content']['Players'] == null){$backendResponse['content'] = "Es gibt keine Spieler.";break;}
                    if(!isset($_POST['content']['SelectedPlayers']) || $_POST['content']['SelectedPlayers'] == null){$backendResponse['content'] = "Es wurden keiner Spieler festgelegt.";break;}
                    if(!isset($_POST['content']['Gamemode']) || $_POST['content']['Gamemode'] == null){$backendResponse['content'] = "Es wurden kein Spielmodus festgelegt.";break;}
                    if(!isset($_POST['content']['Checkoutmode']) || $_POST['content']['Checkoutmode'] == null){$backendResponse['content'] = "Es wurden kein Checkoutmodus festgelegt.";break;}
                    if(!isset($_POST['content']['Checkoutpath']) || $_POST['content']['Checkoutpath'] == null){$backendResponse['content'] = "Es wurden nicht festgelegt, ob Checkoutwege angezeigt werden sollen.";break;}
                    if(!isset($_POST['content']['InputMethod']) || $_POST['content']['InputMethod'] == null){$backendResponse['content'] = "Es wurden keine Eingabemethode festgelegt.";break;}
                    if(!isset($_POST['content']['showRealColors']) || $_POST['content']['showRealColors'] == null){$backendResponse['content'] = "Es wurde nicht festgelegt, ob die echten Dartboardfarben angezeigt werden sollen.";break;}
                    if(!isset($_POST['content']['activateMonitoring']) || $_POST['content']['activateMonitoring'] == null){$backendResponse['content'] = "Es wurde nicht festgelegt, ob Monitoring aktiviert werden soll.";break;}
                    
                    //Show Monitoring? We need a Code then
                    if(isset($_POST['content']['activateMonitoring']) && $_POST['content']['activateMonitoring'] != null ){
                        if(parse_boolean($_POST['content']['activateMonitoring'])){
                            if(!isset($_POST['content']['DBAccessorKey']) || $_POST['content']['DBAccessorKey'] == null){$backendResponse['content'] = "Es wurde kein Monitoring-Code festgelegt.";break;}
                            if(!isset($_POST['content']['DBRefreshTime']) || $_POST['content']['DBRefreshTime'] == null){$backendResponse['content'] = "Es wurde keine Aktualsierungszeit festgelegt.";break;}
                        }
                    }

                    if(isset($_POST['content']['DBAccessorKey'])){
                        $monitorCode = $_POST['content']['DBAccessorKey'];
                    }


                    //Gamesetttings speichern
                    $_SESSION['Gamemode'] = $_POST['content']['Gamemode'];
                    $_SESSION['Checkoutmode'] = $_POST['content']['Checkoutmode'];
                    $_SESSION['Checkoutpath'] = $_POST['content']['Checkoutpath'];
                    $_SESSION['InputMethod'] = $_POST['content']['InputMethod'];
                    $_SESSION['showRealColors'] = parse_boolean($_POST['content']['showRealColors']);
                    $_SESSION['Players'] = $_POST['content']['Players'];
                    $_SESSION['SelectedPlayers'] = $_POST['content']['SelectedPlayers'];
                    $_SESSION['activateMonitoring'] = parse_boolean($_POST['content']['activateMonitoring']);
                    $_SESSION['DBRefreshTime'] = $_POST['content']['DBRefreshTime'];
                    $_SESSION['DBAccessorKey'] = $monitorCode;

                    $backendResponse['statuscode'] = true;
                    $backendResponse['content'] = "Spieleinstellungen wurden gespeichert."; 
                }
                else{
                    $backendResponse['content'] = "Spieleinstellungen waren unvollständig.";
                }
                break;
                
                case "saveGameData":
                    $backendResponse['content'] = "SET-Methode: saveGameData ist fehlerhaft.";
                    $backendResponse['statuscode'] = false;

                    if(isset($_SESSION['activateMonitoring']) && !$_SESSION['activateMonitoring']){
                        $backendResponse['content'] = "Monitoring ist deaktiviert in PHP, in JS scheinbar nicht.";
                        $backendResponse['statuscode'] = false;
                        break;
                    }

                    if(isset($_POST['content']) && $_POST['content'] != null){

                        //JS JSON-Stringifys it
                        $GameData = $_POST['content'];


                            if(AccessorKeyAlreadyExist($db,$_SESSION['DBAccessorKey'])){
                                $backendResponse['statuscode'] = UpdateGameData($db, $_SESSION['DBAccessorKey'], $GameData);
                                if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Update ist fehlgeschlagen.";return;}
                            }
                            else{
                                $backendResponse['statuscode'] = InsertGameData($db, $_SESSION['DBAccessorKey'], $GameData);
                                if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Insert ist fehlgeschlagen.";return;}
                            }

                            $backendResponse['content'] = "GameData erfolgreich aktualisiert.";
                            $backendResponse['statuscode'] = true;
                    }
                    else{
                        $backendResponse['content'] = "saveGameData waren unvollständig.";
                    }
                    break;

                case "deleteDBEntry":
                    $backendResponse['content'] = "SET-Methode: deleteDBEntry ist fehlerhaft.";
                    $temptext = "";
                    if(isset($_POST['content']) && $_POST['content'] != null){

                        $backendResponse['content'] = "Löschen von DB-Eintrag ist fehlgeschlagen."; 
        
                        if(intval($_POST['content']) > 0){

                            if(DeleteAccessorKey($db,$_POST['content'])){
                                $backendResponse['statuscode'] = true;
                                $backendResponse['content'] = "Ausgewählter Eintrag (".$_POST['content'].") wurde entfernt."; 
                            }
         
                        }
                    }
                    else{
                        $backendResponse['content'] = "ID des DBAccessorKey zur Löschung war leer.";
                    }
                    break;

                    case "saveLegHistoryData":
                        $backendResponse['content'] = "SET-Methode: saveLegHistoryData ist fehlerhaft.";
                        $backendResponse['statuscode'] = false;
    
                        if(isset($_SESSION['activateMonitoring']) && !$_SESSION['activateMonitoring']){
                            $backendResponse['content'] = "Monitoring ist deaktiviert in PHP, in JS scheinbar nicht.";
                            $backendResponse['statuscode'] = false;
                            break;
                        }
    
                        if(isset($_POST['content']) && $_POST['content'] != null){
    
                            //JS JSON-Stringifys it
                            $LegHistoryData = $_POST['content'];
    
    
                                if(AccessorKeyAlreadyExist($db,$_SESSION['DBAccessorKey'])){
                                    $backendResponse['statuscode'] = UpdateLegHistoryData($db, $_SESSION['DBAccessorKey'], $LegHistoryData);
                                    if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Update ist fehlgeschlagen.";return;}
                                }
                                else{
                                    $backendResponse['statuscode'] = InsertLegHistoryData($db, $_SESSION['DBAccessorKey'], $LegHistoryData);
                                    if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Insert ist fehlgeschlagen.";return;}
                                }
    
                                $backendResponse['content'] = "saveLegHistoryData erfolgreich aktualisiert.";
                                $backendResponse['statuscode'] = true;
                        }
                        else{
                            $backendResponse['content'] = "saveLegHistoryData waren unvollständig.";
                        }
                        break;

                    case "saveSavedSessionData":
                            $backendResponse['content'] = "SET-Methode: saveSavedSessionData ist fehlerhaft.";
                            $backendResponse['statuscode'] = false;
        
                            if(isset($_SESSION['activateMonitoring']) && !$_SESSION['activateMonitoring']){
                                $backendResponse['content'] = "Monitoring ist deaktiviert in PHP, in JS scheinbar nicht.";
                                $backendResponse['statuscode'] = false;
                                break;
                            }
        
                            if(isset($_POST['content']) && $_POST['content'] != null){
        
                                //JS JSON-Stringifys it
                                $saveSavedSessionData = $_POST['content'];
        
        
                                    if(AccessorKeyAlreadyExist($db,$_SESSION['DBAccessorKey'])){
                                        $backendResponse['statuscode'] = UpdateSavedSessionData($db, $_SESSION['DBAccessorKey'], $saveSavedSessionData);
                                        if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Update ist fehlgeschlagen.";return;}
                                    }
                                    else{
                                        $backendResponse['statuscode'] = InsertSavedSessionData($db, $_SESSION['DBAccessorKey'], $saveSavedSessionData);
                                        if(!$backendResponse['statuscode']){$backendResponse['content'] = "SQL-Insert ist fehlgeschlagen.";return;}
                                    }
        
                                    $backendResponse['content'] = "saveSavedSessionData erfolgreich aktualisiert.";
                                    $backendResponse['statuscode'] = true;
                            }
                            else{
                                $backendResponse['content'] = "saveSavedSessionData waren unvollständig.";
                            }
                            break;

                    case "reloadGameSettingsFromCookie":
                        $backendResponse['content'] = "SET-Methode: reloadGameSettingsFromCookie ist fehlerhaft.";
                        $backendResponse['statuscode'] = false;
    
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
                        }

                        $backendResponse['content'] = $cookie_name." in PHP-Session geschrieben.";
                        $backendResponse['statuscode'] = true;
                        break;

            

            default:
            $backendResponse['content'] = "SET-Methode: Default ausgelöst.";
            break;
        }
    }

}

echo json_encode($backendResponse,JSON_UNESCAPED_UNICODE);
?>