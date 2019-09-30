BEGIN TRANSACTION;
CREATE TABLE `Log` (
	`NutzerId`	TEXT,
	`Name`	TEXT,
	`Zeit`	INTEGER,
	`KanalId`	TEXT,
	`Eingabe`	TEXT
);
COMMIT;
