BEGIN TRANSACTION;
CREATE TABLE `Wichtel` (
	`Termin`	TEXT,
	`NutzerId`	INTEGER,
	`WichtelId`	INTEGER
);
CREATE TABLE `Pakete` (
	`IdSender`	INTEGER,
	`IdEmpfaenger`	INTEGER,
	`Sendungsnummer`	TEXT,
	`Sendezeitpunkt`	TEXT,
	`Empfangszeitpunkt`	TEXT
);
CREATE TABLE `Nutzer` (
	`NutzerId`	INTEGER UNIQUE,
	`Discord`	TEXT UNIQUE,
	`Name`	TEXT UNIQUE,
	`Nickname`	TEXT UNIQUE,
	`Zeit`	INTEGER,
	`Zustand`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Mods` (
	`NutzerId`	INTEGER UNIQUE,
	`Nickname`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Informationen` (
	`NutzerId`	INTEGER UNIQUE,
	`Zeit`	INTEGER,
	`AnalogDigitalSelbst`	INTEGER,
	`AnalogDigitalWichtel`	INTEGER,
	`Anschrift`	TEXT,
	`Land`	TEXT,
	`Steam`	TEXT,
	`International`	INTEGER,
	`Wunschliste`	TEXT,
	`Links`	TEXT,
	`Allergien`	TEXT,
	`AusschlussGeschenk`	TEXT,
	`AusschlussWichtel`	TEXT,
	`Freitext`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Ausschluesse` (
	`NutzerId`	INTEGER,
	`WichtelId`	INTEGER
);
COMMIT;
