/*
    This file was automatically generated by Studio 3T.

    Collection:  (luandz@it4483.cf:27017) > luoi_dien > incident_levels

    Warnings about type conversion issues are stored as comments above the
    corresponding INSERT statement of each document.
*/


SET NAMES 'utf8' COLLATE 'utf8_general_ci';

DROP TABLE IF EXISTS `incident_levels`;
CREATE TABLE `incident_levels` (
    `_id` VARBINARY(12) NOT NULL,
    `name` LONGTEXT,
    `code` INTEGER,
    `__v` INTEGER,
    `createdAt` DATETIME,
    `updatedAt` DATETIME,
    PRIMARY KEY (`_id`)
) CHARSET=utf8mb4;

INSERT INTO `incident_levels` (`_id`, `name`, `code`, `__v`, `createdAt`, `updatedAt`)
    VALUES
        (x'5FBA2E7AA1E657329C688906', 'Bình thường', 0, 0, '2020-11-22 09:25:14.557000', '2020-12-28 18:36:04.116000');
INSERT INTO `incident_levels` (`_id`, `name`, `code`, `__v`, `createdAt`, `updatedAt`)
    VALUES
        (x'5FBA2E7AA1E657329C688907', 'Khẩn cấp', 1, 0, '2020-11-22 09:25:14.557000', '2020-12-28 18:36:22.299000');
