PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

ALTER TABLE `contact` RENAME TO `contact_old`;

CREATE TABLE `contact` (
    `id` TEXT NOT NULL UNIQUE,
    `tag` TEXT NOT NULL UNIQUE,
    `name` TEXT NOT NULL UNIQUE,
    `nickname` TEXT,
    `lastUpdateTime` INTEGER NOT NULL DEFAULT 0,
    `type` TEXT NOT NULL,
    `state` TEXT NOT NULL,
    PRIMARY KEY(`id`)
) WITHOUT ROWID;

INSERT INTO `contact` SELECT * FROM `contact_old`;

UPDATE `contact` SET `nickname` = NULL WHERE `nickname` = `name`;

DROP TABLE `contact_old`;

COMMIT;

PRAGMA foreign_keys=on;
