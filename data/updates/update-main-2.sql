PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

ALTER TABLE `contact` RENAME TO `contact_old`;

CREATE TABLE `contact_new` (
    `id` TEXT NOT NULL UNIQUE,
    `tag` TEXT NOT NULL UNIQUE,
    `name` TEXT NOT NULL UNIQUE,
    `nickname` TEXT,
    `lastUpdateTime` INTEGER NOT NULL DEFAULT 0,
    `type` TEXT NOT NULL,
    `state` TEXT NOT NULL,
    PRIMARY KEY(`id`)
) WITHOUT ROWID;

INSERT INTO `contact_new` SELECT * FROM `contact_old`;
UPDATE `contact_new` SET `nickname` = NULL WHERE `nickname` = `name`;

DROP TABLE `contact_old`;

-- The following name flip-flopping is needed to preserve the foreign keys:
ALTER TABLE `contact_new` RENAME TO `contact_old`;
ALTER TABLE `contact_old` RENAME TO `contact`;

COMMIT;

PRAGMA foreign_keys=on;
