BEGIN TRANSACTION;

CREATE TABLE `contact` (
    `id` TEXT NOT NULL UNIQUE,
    `tag` TEXT NOT NULL UNIQUE,
    `name` TEXT NOT NULL UNIQUE,
    `nickname` TEXT NOT NULL UNIQUE,
    `lastUpdateTime` INTEGER NOT NULL DEFAULT 0,
    `type` TEXT NOT NULL,
    `state` TEXT NOT NULL,
    PRIMARY KEY(`id`)
) WITHOUT ROWID;

CREATE TABLE `superuser` (
    `contactId` TEXT NOT NULL UNIQUE,
    `role` TEXT NOT NULL,
    PRIMARY KEY(`contactId`),
    FOREIGN KEY(`contactId`) REFERENCES `contact`(`id`)
) WITHOUT ROWID;

CREATE TABLE `relationship` (
    `wichtelEvent` TEXT NOT NULL,
    `giverId` TEXT NOT NULL,
    `takerId` TEXT NOT NULL,
    FOREIGN KEY(`takerId`) REFERENCES `contact`(`id`),
    FOREIGN KEY(`giverId`) REFERENCES `contact`(`id`)
);

CREATE TABLE `information` (
    `contactId` TEXT NOT NULL UNIQUE,
    `lastUpdateTime` INTEGER NOT NULL DEFAULT 0,
    `giftTypeAsTaker` TEXT NOT NULL DEFAULT '',
    `giftTypeAsGiver` TEXT NOT NULL DEFAULT '',
    `address` TEXT NOT NULL DEFAULT '',
    `country` TEXT NOT NULL DEFAULT '',
    `steamFriendshipCode` TEXT NOT NULL DEFAULT '',
    `digitalAddress` TEXT NOT NULL DEFAULT '',
    `internationalAllowed` INTEGER NOT NULL DEFAULT 0,
    `wishList` TEXT NOT NULL DEFAULT '',
    `allergies` TEXT NOT NULL DEFAULT '',
    `giftExclusion` TEXT NOT NULL DEFAULT '',
    `userExclusion` TEXT NOT NULL DEFAULT '',
    `freeText` TEXT NOT NULL DEFAULT '',
    PRIMARY KEY(`contactId`),
    FOREIGN KEY(`contactId`) REFERENCES `contact`(`id`)
) WITHOUT ROWID;

CREATE TABLE `exclusion` (
    `giverId` TEXT NOT NULL,
    `takerId` TEXT NOT NULL,
    `reason` TEXT NOT NULL,
    `lastUpdateTime` INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(`takerId`) REFERENCES `contact`(`id`),
    FOREIGN KEY(`giverId`) REFERENCES `contact`(`id`)
);

CREATE TABLE `parcel` (
    `wichtelEvent` TEXT NOT NULL,
    `senderId` TEXT NOT NULL,
    `recipientId` TEXT NOT NULL,
    `consignmentNumber` TEXT NOT NULL DEFAULT '',
    `shippingDate` TEXT NOT NULL DEFAULT '',
    `receivingDate` TEXT NOT NULL DEFAULT '',
    FOREIGN KEY(`senderId`) REFERENCES `contact`(`id`),
    FOREIGN KEY(`recipientId`) REFERENCES `contact`(`id`)
);

CREATE UNIQUE INDEX `relationshipTaker` ON `relationship` (`wichtelEvent`, `takerId`);
CREATE UNIQUE INDEX `relationshipGiver` ON `relationship` (`wichtelEvent`, `giverId`);
CREATE UNIQUE INDEX `parcelSender` ON `parcel` (`wichtelEvent`, `senderId`);
CREATE UNIQUE INDEX `parcelRecipient` ON `parcel` (`wichtelEvent`, `recipientId`);
CREATE INDEX `exclusionTaker` ON `exclusion` (`takerId`);
CREATE INDEX `exclusionGiver` ON `exclusion` (`giverId`);

COMMIT;
