-- phpMyAdmin SQL Dump
-- version 4.4.15.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2017-02-20 17:18:21
-- 服务器版本： 5.5.48-MariaDB
-- PHP Version: 7.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tplink`
--

-- --------------------------------------------------------

--
-- 表的结构 `accesskey`
--

CREATE TABLE IF NOT EXISTS `accesskey` (
  `id` int(11) NOT NULL,
  `userkey` varchar(64) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `checked` int(11) NOT NULL DEFAULT '0',
  `isbad` int(11) NOT NULL DEFAULT '0',
  `badreason` varchar(200) DEFAULT NULL,
  `info` varchar(200) DEFAULT NULL,
  `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `scanlog`
--

CREATE TABLE IF NOT EXISTS `scanlog` (
  `id` int(11) NOT NULL,
  `host` varchar(15) NOT NULL,
  `mac` varchar(17) NOT NULL,
  `ssid` varchar(120) NOT NULL,
  `wifikey` varchar(120) NOT NULL,
  `country` varchar(20) NOT NULL,
  `province` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `isp` varchar(20) NOT NULL,
  `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accesskey`
--
ALTER TABLE `accesskey`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scanlog`
--
ALTER TABLE `scanlog`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accesskey`
--
ALTER TABLE `accesskey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `scanlog`
--
ALTER TABLE `scanlog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
