<?php
require_once('include/php/session.php');

echo "<h2>Welcome on the debug page</h2>";

function boolToString(){

}

echo "Array of all created players:";
echo "<pre>";
print_r($_SESSION['Players']);
echo "</pre>";
echo "<hr>";

echo "Array of all selected players:";
echo "<pre>";
print_r($_SESSION['SelectedPlayers']);
echo "</pre>";
echo "<hr>";

echo "Gamemode:";
echo "<pre>";
print_r($_SESSION['Gamemode']);
echo "</pre>";
echo "<hr>";

echo "Checkoutmode:";
echo "<pre>";
print_r($_SESSION['Checkoutmode']);
echo "</pre>";
echo "<hr>";

echo "Checkoutpath:";
echo "<pre>";
print_r($_SESSION['Checkoutpath']);
echo "</pre>";
echo "<hr>";

echo "InputMethod:";
echo "<pre>";
print_r($_SESSION['InputMethod']);
echo "</pre>";
echo "<hr>";

echo "showRealColors:";
echo "<pre>";
print_r($_SESSION['showRealColors'] ? 'true' : 'false');
echo "</pre>";
echo "<hr>";

echo "DBAccessorKey:";
echo "<pre>";
print_r($_SESSION['DBAccessorKey']);
echo "</pre>";
echo "<hr>";

echo "activateMonitoring:";
echo "<pre>";
print_r($_SESSION['activateMonitoring'] ? 'true' : 'false');
echo "</pre>";
echo "<hr>";

echo "DBRefreshTime:";
echo "<pre>";
print_r($_SESSION['DBRefreshTime']);
echo "</pre>";
echo "<hr>";

echo "WriteCookieDataToSession:";
echo "<pre>";
print_r($_SESSION['WriteCookieDataToSession'] ? 'true' : 'false');
echo "</pre>";
echo "<hr>";

echo "Does GameSettings Cookie exists:</br>";
if(isset($_COOKIE['GameSettings'])){echo "<pre>true</pre>";echo "Content:<pre>";print_r($_COOKIE['GameSettings']);echo "</pre>";echo "<hr>";}else{echo "<pre>false</pre>";}
?>