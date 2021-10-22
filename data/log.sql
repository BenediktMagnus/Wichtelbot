BEGIN TRANSACTION;

CREATE TABLE `log` (
    `contactId` TEXT,
    `name` TEXT,
    `timestamp` INTEGER,
    `channelId` TEXT,
    `message` TEXT
);

COMMIT;
