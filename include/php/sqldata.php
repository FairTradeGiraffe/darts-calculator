<?php
require_once('session.php');
require_once('dbconfig.php');


function AccessorKeyAlreadyExist($db,$AccessorKey){

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT monitoringID FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    //There is no row
    if(!$row){
        $db = null;
        return false;
    }

    $db = null;
    return true;
}

function DeleteAccessorKey($db,$monitoringID){

    $data = [
        'monitoringID' => $monitoringID
    ];

    $sql = "DELETE FROM monitoring WHERE monitoringID =: monitoringID";
    $stmt = $db->prepare($sql);

    if($stmt->execute($data) === TRUE){
        return true;
    }

    return false;
}

function SelectGameData($db, $AccessorKey){

    $responseGamaData = "";

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT monitoringID, monitoringAccessorKey, gameData, insertDate, updateDate FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    if($row){
     $responseGamaData = $row['gameData'];   
    }

    return $responseGamaData;
}

function SelectLegHistoryData($db, $AccessorKey){

    $responseGamaData = "";

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT legHistoryData FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    if($row){
     $responseGamaData = $row['legHistoryData'];   
    }

    return $responseGamaData;
}


function SelectAllMetaData($db){

    $sql = "SELECT monitoringID, monitoringAccessorKey, insertDate, updateDate FROM monitoring";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $rows;
}

function SelectLastUpdate($db, $AccessorKey){

    $responseGamaData['updateDate'] = "1970-01-01 00:00:00";
    $responseGamaData['updateMilliseconds'] = "000";
    $responseGamaData['updateDateRelative'] = "Not yet";

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT updateDate,updateMilliseconds FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    if($row){
        $tz = 'Europe/Berlin';
        $lastUpdate = new DateTime($row['updateDate'], new DateTimeZone($tz));

        $responseGamaData['updateDate'] = $row['updateDate'];
        $responseGamaData['updateMilliseconds'] = $row['updateMilliseconds'];
        $responseGamaData['updateDateRelative'] = zdateRelative($lastUpdate->format('U'));     
    }

    return $responseGamaData;
}


function InsertGameData($db, $AccessorKey, $GameData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');
    $milliseconds = $date->format('u');
    //Milliseconds reichen die ersten 3 Stellen...
    $milliseconds = substr($milliseconds,0,3);

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'gameData' => $GameData,
        'insertDate' => $timestamp,
        'updateDate' => $timestamp,
        'updateMilliseconds' => $milliseconds
    ];

    $sql = "INSERT INTO monitoring (monitoringAccessorKey, gameData, insertDate, updateDate, updateMilliseconds) VALUES (:monitoringAccessorKey, :gameData, :insertDate, :updateDate, :updateMilliseconds)";
    $stmt = $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}

function UpdateGameData($db, $AccessorKey, $GameData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');
    $milliseconds = $date->format('u');
    //Milliseconds reichen die ersten 3 Stellen...
    $milliseconds = substr($milliseconds,0,3);

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'gameData' => $GameData,
        'updateDate' => $timestamp,
        'updateMilliseconds' => $milliseconds
    ];

    $sql = "UPDATE monitoring SET gameData=:gameData, updateDate=:updateDate, updateMilliseconds=:updateMilliseconds WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt= $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}

function InsertLegHistoryData($db, $AccessorKey, $LegHistoryData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'legHistoryData' => $LegHistoryData,
        'insertDate' => $timestamp,
        'updateDate' => $timestamp,
    ];

    $sql = "INSERT INTO monitoring (monitoringAccessorKey, legHistoryData, insertDate, updateDate) VALUES (:monitoringAccessorKey, :legHistoryData, :insertDate, :updateDate)";
    $stmt = $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}

function UpdateLegHistoryData($db, $AccessorKey, $LegHistoryData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'legHistoryData' => $LegHistoryData,
        'updateDate' => $timestamp,
    ];

    $sql = "UPDATE monitoring SET legHistoryData=:legHistoryData, updateDate=:updateDate WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt= $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}


function InsertSavedSessionData($db, $AccessorKey, $SavedSessionData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');
    $milliseconds = $date->format('u');
    //Milliseconds reichen die ersten 3 Stellen...
    $milliseconds = substr($milliseconds,0,3);

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'savedSessionData' => $SavedSessionData,
        'insertDate' => $timestamp,
        'updateDate' => $timestamp,
        'updateMilliseconds' => $milliseconds
    ];

    $sql = "INSERT INTO monitoring (monitoringAccessorKey, savedSessionData, insertDate, updateDate, updateMilliseconds) VALUES (:monitoringAccessorKey, :savedSessionData, :insertDate, :updateDate, :updateMilliseconds)";
    $stmt = $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}

function UpdateSavedSessionData($db, $AccessorKey, $SavedSessionData){

    $tz = 'Europe/Berlin';
    $date = new DateTime("now", new DateTimeZone($tz));
    $timestamp = $date->format('Y-m-d H:i:s');
    $milliseconds = $date->format('u');
    //Milliseconds reichen die ersten 3 Stellen...
    $milliseconds = substr($milliseconds,0,3);

    $data = [
        'monitoringAccessorKey' => $AccessorKey,
        'savedSessionData' => $SavedSessionData,
        'updateDate' => $timestamp,
        'updateMilliseconds' => $milliseconds
    ];

    $sql = "UPDATE monitoring SET savedSessionData=:savedSessionData, updateDate=:updateDate, updateMilliseconds=:updateMilliseconds WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt= $db->prepare($sql);
    //$stmt->execute($data);

    if ($stmt->execute($data) === TRUE){
        $db = null;
        return true;
    } 

    $db = null;
    return false;
}

function SelectSavedSessionData($db, $AccessorKey){

    $responseSavedSessionData = "";

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT savedSessionData FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    if($row){
     $responseSavedSessionData = $row['savedSessionData'];   
    }

    return $responseSavedSessionData;
}

function SelectSavedSessionDataAndPushToSession($db, $AccessorKey){

    $responseSavedSessionData = "";

    $data = [
        'monitoringAccessorKey' => $AccessorKey
    ];

    $sql = "SELECT savedSessionData FROM monitoring WHERE monitoringAccessorKey=:monitoringAccessorKey";
    $stmt = $db->prepare($sql);
    $stmt->execute($data);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);


    if($row){
     $responseSavedSessionData = $row['savedSessionData'];   

     if($responseSavedSessionData != ""){

        $SavedSessionData = json_decode($responseSavedSessionData,true);
        //Write GameSettings to Session
        if($SavedSessionData['lastSnapshotSettings'] != null){

           $_SESSION['DBAccessorKey'] = $SavedSessionData['lastSnapshotSettings']['DBAccessorKey'];
           $_SESSION['Gamemode'] = $SavedSessionData['lastSnapshotSettings']['Gamemode'];
           $_SESSION['Checkoutmode'] = $SavedSessionData['lastSnapshotSettings']['Checkoutmode'];
           $_SESSION['Checkoutpath'] = $SavedSessionData['lastSnapshotSettings']['Checkoutpath'];
           $_SESSION['InputMethod'] = $SavedSessionData['lastSnapshotSettings']['InputMethod'];
           $_SESSION['showRealColors'] = $SavedSessionData['lastSnapshotSettings']['showRealColors'];
           $_SESSION['SelectedPlayers'] = $SavedSessionData['lastSnapshotSettings']['SelectedPlayers'];
           $_SESSION['Players'] = $SavedSessionData['lastSnapshotSettings']['Players'];
           $_SESSION['activateMonitoring'] = $SavedSessionData['lastSnapshotSettings']['activateMonitoring'];
           $_SESSION['DBAccessorKey'] = $SavedSessionData['lastSnapshotSettings']['DBAccessorKey'];
           $_SESSION['DBRefreshTime'] = $SavedSessionData['lastSnapshotSettings']['DBRefreshTime'];
        }
    }

    }

    return $responseSavedSessionData;
}

function zdateRelative($date)
{
  $diff = time() - $date;
  $periods[] = [60, 1, '%s seconds ago', '1 second ago'];
  $periods[] = [60*100, 60, '%s minutes ago', '1 minute ago'];
  $periods[] = [3600*70, 3600, '%s hours ago', '1 hour ago'];
  $periods[] = [3600*24*10, 3600*24, '%s days ago', 'yesterday'];
  $periods[] = [3600*24*30, 3600*24*7, '%s weeks ago', 'last week'];
  $periods[] = [3600*24*30*30, 3600*24*30, '%s month ago', 'last month'];
  $periods[] = [INF, 3600*24*265, '%s years ago', 'last year'];
  foreach ($periods as $period) {
    if ($diff > $period[0]) continue;
    $diff = floor($diff / $period[1]);
    return sprintf($diff > 1 ? $period[2] : $period[3], $diff);
  }
}

?>