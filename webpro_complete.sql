-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2024 at 09:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webpro_complete`
--

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

CREATE TABLE `request` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `selecttime` int(1) NOT NULL COMMENT '1=08:00-10:00,2=10:00-12:00,3=13:00-15:00,4=15:00-17:00',
  `date` date NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `who_app` int(9) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `request`
--

INSERT INTO `request` (`request_id`, `user_id`, `room_id`, `selecttime`, `date`, `status`, `who_app`) VALUES
(355, 7756, 2, 3, '2024-04-30', 'approved', 12),
(356, 16, 1, 3, '2024-04-30', 'rejected', 7754);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(2) UNSIGNED NOT NULL,
  `role_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'user'),
(2, 'staff'),
(3, 'approver');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(4) NOT NULL,
  `roomname` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=disable, 1=enable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `roomname`, `image`, `description`, `status`) VALUES
(1, 'ROOM1', 'room1.jpg', 'Expertly rendered by Carl Hansen & Son, the lounge chair-first introduced in 1951 and enduring ever since is available in oak or as a combination of oak and walnut, sourced from sustainable forestry. Choose from seat and back upholstery in a selection of leather options or in a custom fabric.', 0),
(2, 'ROOM2', 'room2.jpg', 'Expertly rendered by Carl Hansen & Son, the lounge chair-first introduced in 1951 and enduring ever since is available in oak or as a combination of oak and walnut, sourced from sustainable forestry. Choose from seat and back upholstery in a selection of leather options or in a custom fabric.', 1),
(3, 'ROOM3', 'room3.jpg', 'Expertly rendered by Carl Hansen & Son, the lounge chair-first introduced in 1951 and enduring ever since is available in oak or as a combination of oak and walnut, sourced from sustainable forestry. Choose from seat and back upholstery in a selection of leather options or in a custom fabric.', 0),
(4, 'ROOM4', 'room4.jpg', 'Expertly rendered by Carl Hansen & Son, the lounge chair-first introduced in 1951 and enduring ever since is available in oak or as a combination of oak and walnut, sourced from sustainable forestry. Choose from seat and back upholstery in a selection of leather options or in a custom fabric.', 1),
(6, 'ROOM 5', 'room5.jpg', 'Expertly rendered by Carl Hansen & Son, the lounge chair-first introduced in 1951 and enduring ever since is available in oak or as a combination of oak and walnut, sourced from sustainable forestry. Choose from seat and back upholstery in a selection of leather options or in a custom fabric.', 1),
(16, 'ROOM 6', 'room6.jpg', '', 1),
(18, '7', 'room7.jpg', 'no', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(9) NOT NULL,
  `role_id` int(2) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `student_id` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `role_id`, `name`, `username`, `password`, `student_id`) VALUES
(8, 1, 'a', 'a', '$2b$10$ZYC8XeV6JA6GpLGuiRiRaO0XJR57wGJdh6lUd5xGGljDOX/NbZrlO', 'a'),
(11, 2, 'staff', 'staff', '$2b$10$8B5yqVX9lR5XKCR4WwxZMulHSp8pQqss2snHRF1z0qF1XVlKOUsZq', ''),
(12, 3, 'approver', 'approver', '$2b$10$Nyv/XyA1obh/BhqAZZ4d.O5.Dzw.8heOU2yRTHi7G1DbDM4XftR6m', ''),
(16, 1, 'b', 'b', '$2b$10$1oBOTJwnu7L0u9Rfuw2s5e7pYYicnULRUfRRs8/LOatgqCOlPNPM6', '6531500000'),
(18, 1, 'natcha', 'natcha', '$2b$10$2ci9BYCYtAXdHAot90c7oes4EfTat9EfzMPUtvjexicrD6QkgtgpC', '6531501037'),
(25, 1, 'Worrawit', '4', '$2b$10$GDP2LBJdwikSfGBeEMMlZe6CKUrduwWO4MIC.9HYYDSw5TP/i8UZe', '6531501113'),
(7754, 3, 'admin', 'admin', '$2b$10$Nyv/XyA1obh/BhqAZZ4d.O5.Dzw.8heOU2yRTHi7G1DbDM4XftR6m', NULL),
(7755, 1, 'try', 'try', '$2b$10$ocotHHM2aRt2Rdu92hVCk.GNODoHTyP1boiMgf35KZTffMzKbvuu2', '090988'),
(7756, 1, 'Worrawit', '\'', '$2b$10$5/gyn189jXMA2UmxVj706OBI12xPYUUvOVG9/z7ZNJ7.7TfgQZVJG', '6531501113'),
(7757, 1, 'bb', 'bb', '$2b$10$eSGX22Z43Q8sYyhAqllas.5P/YJJjepkE7YkMzGwAJAqG7jKo5m06', '6531501089'),
(7758, 1, 'pp', 'pb', '$2b$10$pQiTX.ox3E7idSsj5.HgJuHJgqX91kW29ZoJF4TpRDI7xTIJJiUlq', '98'),
(7759, 1, 'Pongsakorn', 'oomsin', '$2b$10$ojqnR09cwQe92gZRgEmEF.AcR5/djZwy17FimzkXjl7d1pUpRfoJm', '6531501081'),
(7760, 1, 'oomsin', 'oom', '$2b$10$NsiXwAiPqA446fW36BoTNeBs1TNjvp6QnGX5wmkB7EwyHZhLyz9Fy', '999999999'),
(7761, 1, 'an', 'an', '$2b$10$puEvDTf3aiC/9UecBTcboOn9LrtWC4Wl/O88UBrLPfPBcoG2lgWbC', '072'),
(7762, 1, 'nat', 'nat', '$2b$10$hwrkNx2oRs2ZxXlPXBgA6.bXRqgkqEW66ybpLYBTTMK4vCIQrK2qu', '059'),
(7763, 1, '123', '123', '$2b$10$qyRIwmzP98njmKPWqTQqSe3PFHuXvXL2jJDoDA4XU3E589QsQjhOy', '1234567'),
(7764, 1, 'yu', 'yu', '$2b$10$QJBpEN2bUDn5wo1Yott9tuQdcHlS9gSExQpyDLFdiz9kOm.fz7TH2', '56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `who_app` (`who_app`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `request`
--
ALTER TABLE `request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=357;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(2) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7765;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `request_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `request_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `request_ibfk_3` FOREIGN KEY (`who_app`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
