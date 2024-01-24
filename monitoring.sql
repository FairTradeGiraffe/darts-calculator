-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server Version:               10.3.14-MariaDB - mariadb.org binary distribution
-- Server Betriebssystem:        Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Exportiere Datenbank Struktur für darts_live
DROP DATABASE IF EXISTS `darts_live`;
CREATE DATABASE IF NOT EXISTS `darts_live` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `darts_live`;

-- Exportiere Struktur von Tabelle darts_live.monitoring
DROP TABLE IF EXISTS `monitoring`;
CREATE TABLE IF NOT EXISTS `monitoring` (
  `monitoringID` int(11) NOT NULL AUTO_INCREMENT,
  `monitoringAccessorKey` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gameData` LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legHistoryData` LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `savedSessionData` LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insertDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  `updateMilliseconds` smallint(4) DEFAULT NULL,
  PRIMARY KEY (`monitoringID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daten Export vom Benutzer nicht ausgewählt

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
