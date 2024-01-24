<?php
//Define Database Credentials
define('DBHOST','localhost');
define('DBUSER','darts');
define('DBPASS','PASSWORD_HERE');
define('DBNAME','darts_live');

try {
	//create PDO connection
	$db = new PDO("mysql:host=".DBHOST.";charset=utf8mb4;dbname=".DBNAME, DBUSER, DBPASS);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $e) {
	//show error
    echo $e->getMessage();
    exit;
}
?>