/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100410
 Source Host           : localhost:3306
 Source Schema         : academy

 Target Server Type    : MySQL
 Target Server Version : 100410
 File Encoding         : 65001

 Date: 04/06/2021 20:58:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for academy
-- ----------------------------
DROP TABLE IF EXISTS `academy`;
CREATE TABLE `academy`  (
  `academy_id` int(11) NOT NULL AUTO_INCREMENT,
  `academy_category_id` int(11) NOT NULL,
  `academy_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description_short` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description_detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `price` bigint(20) NOT NULL COMMENT 'Giá khoá học',
  `status` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `teacher_id` int(11) NOT NULL COMMENT 'Mã giáo viên',
  `price_discount` int(11) NULL DEFAULT NULL COMMENT 'Khuyến mãi' DEFAULT 0,
  `register` int(11) NOT NULL DEFAULT 0,
  `view` int(11) NOT NULL DEFAULT 0,
  `rate` DOUBLE NOT NULL DEFAULT 0,
  `is_delete` tinyint(1) NULL DEFAULT 0 COMMENT '0: Chưa xoá, 1: Đã xoá',
  `created_at` timestamp(0) NULL DEFAULT NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`academy_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for academy_category
-- ----------------------------
DROP TABLE IF EXISTS `academy_category`;
CREATE TABLE `academy_category`  (
  `academy_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `academy_category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `academy_parent_id` int(11) NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  `created_by` int(11) NULL DEFAULT NULL,
  `updated_by` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`academy_category_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for academy_rate
-- ----------------------------
DROP TABLE IF EXISTS `academy_rate`;
CREATE TABLE `academy_rate`  (
  `academy_rate_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `academy_id` int(11) NOT NULL,
  `point` int(11) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp(0) NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  `updated_by` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`academy_rate_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for academy_outline
-- ----------------------------
DROP TABLE IF EXISTS `academy_outline`;
CREATE TABLE `academy_outline`  (
  `academy_outline_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã đề cương khoá học',
  `academy_id` int(11) NOT NULL COMMENT 'Mã khoá học',
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề chương học',
  `url_video` text NOT NULL COMMENT 'URL video',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả khoá học',
  `created_at` timestamp(0) NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`academy_outline_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for academy_register_like
-- ----------------------------
DROP TABLE IF EXISTS `academy_register_like`;
CREATE TABLE `academy_register_like`  (
  `academy_register_like_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `academy_id` int(11) NOT NULL,
  `is_like` tinyint(1) NOT NULL DEFAULT 0,
  `is_register` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp(0) NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`academy_register_like_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birthday` date NULL DEFAULT NULL,
  `money` bigint(20) NOT NULL DEFAULT 0,
  `gender` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verify` tinyint(1) NOT NULL DEFAULT 0,
  `code` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT current_timestamp(0),
  `updated_at` timestamp(0) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;


-- update sql 
ALTER TABLE `academy_category` 
ADD COLUMN `is_delete` tinyint(1) NULL DEFAULT 0 COMMENT '0: chưa xoá, 1: đã xoá' AFTER `academy_category_name`;

ALTER TABLE `user` 
ADD COLUMN `is_delete` tinyint(1) NULL DEFAULT 0 COMMENT '0: chưa xoá, 1: đã xoá' AFTER `role`;

ALTER TABLE academy ADD FULLTEXT(academy_name)

ALTER TABLE `academy` 
MODIFY COLUMN `status` tinyint(1) NULL DEFAULT 0 COMMENT '0: Chưa hoàn thành, 1: Đã hoàn thành' AFTER `price`;