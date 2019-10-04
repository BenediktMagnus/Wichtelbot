BEGIN TRANSACTION;

CREATE TABLE `contact` (
	`contactId`	TEXT NOT NULL UNIQUE,
	`discordName`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL UNIQUE,
	`nickname`	TEXT NOT NULL UNIQUE,
	`lastUpdateTime`	INTEGER NOT NULL DEFAULT 0,
	`type`	TEXT NOT NULL,
	`state`	TEXT NOT NULL,
	PRIMARY KEY(contactId)
) WITHOUT ROWID;

CREATE TABLE `superuser` (
	`contactId`	TEXT NOT NULL UNIQUE, -- Foreign key to contact.contactId.
	`role`	TEXT NOT NULL, -- An indicator role of the superuser, can be "admin" or "mod" for example.
	PRIMARY KEY(contactId)
) WITHOUT ROWID;

CREATE TABLE `relationship` (
	`wichtelEvent`	TEXT NOT NULL,
	`giverId`	TEXT NOT NULL,
	`takerId`	TEXT NOT NULL
);

CREATE TABLE `information` (
	`contactId`	TEXT NOT NULL UNIQUE,
	`lastUpdateTime`	INTEGER NOT NULL DEFAULT 0,
	`giftTypeAsTaker`	TEXT NOT NULL DEFAULT '',
	`giftTypeAsGiver`	TEXT NOT NULL DEFAULT '',
	`address`	TEXT NOT NULL DEFAULT '',
	`country`	TEXT NOT NULL DEFAULT '',
	`steamName`	TEXT NOT NULL DEFAULT '',
	`international`	TEXT NOT NULL DEFAULT '',
	`wishList`	TEXT NOT NULL DEFAULT '',
	`allergies`	TEXT NOT NULL DEFAULT '',
	`giftExclusion`	TEXT NOT NULL DEFAULT '',
	`userExclusion`	TEXT NOT NULL DEFAULT '',
	`freeText`	TEXT NOT NULL DEFAULT '',
	PRIMARY KEY(contactId)
) WITHOUT ROWID;

CREATE TABLE `exclusion` (
	`giverId`	TEXT NOT NULL,
	`takerId`	TEXT NOT NULL,
	`reason`	TEXT NOT NULL,
	`lastUpdateTime`	INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE `parcel` (
	`wichtelEvent`	TEXT NOT NULL,
	`senderId`	TEXT NOT NULL,
	`recipientId`	TEXT NOT NULL,
	`consignmentNumber`	TEXT NOT NULL DEFAULT '',
	`shippingDate`	TEXT NOT NULL DEFAULT '',
	`receivingDate`	TEXT NOT NULL DEFAULT ''
);

COMMIT;
