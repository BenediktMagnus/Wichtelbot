BEGIN TRANSACTION;
CREATE TABLE `Wichtel` (
	`Termin`	TEXT,
	`NutzerId`	TEXT,
	`WichtelId`	TEXT
);
CREATE TABLE `Pakete` (
	`IdSender`	TEXT,
	`IdEmpfaenger`	TEXT,
	`Sendungsnummer`	TEXT,
	`Sendezeitpunkt`	TEXT,
	`Empfangszeitpunkt`	TEXT
);
CREATE TABLE `Nutzer` (
	`NutzerId`	TEXT UNIQUE,
	`Discord`	TEXT UNIQUE,
	`Name`	TEXT UNIQUE,
	`Nickname`	TEXT UNIQUE,
	`Zeit`	INTEGER,
	`Zustand`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Mods` (
	`NutzerId`	TEXT UNIQUE,
	`Nickname`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Informationen` (
	`NutzerId`	TEXT UNIQUE,
	`Zeit`	INTEGER,
	`AnalogDigitalSelbst`	TEXT,
	`AnalogDigitalWichtel`	TEXT,
	`Anschrift`	TEXT,
	`Land`	TEXT,
	`Steam`	TEXT,
	`International`	TEXT,
	`Wunschliste`	TEXT,
	`Allergien`	TEXT,
	`AusschlussGeschenk`	TEXT,
	`AusschlussWichtel`	TEXT,
	`Freitext`	TEXT,
	PRIMARY KEY(NutzerId)
) WITHOUT ROWID;
CREATE TABLE `Ausschluesse` (
	`NutzerId`	TEXT,
	`WichtelId`	TEXT
);
COMMIT;
