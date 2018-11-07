/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../../Config/Texte.json');

var Nutzerverwaltung;

var ModulAllgemein;

/**
 * Initialisiert das Datenaufnahmemodul der Nachrichtenverarbeitung.
 * @param {Object} Nutzerbibliothek
 * @param {Object} NeuesModulAllgemein Das allgemeine Modul der Nachrichtenverarbeitung mit grundlegenden Basisfunktionen.
 */
exports.Initialisieren = function (Nutzerbibliothek, NeuesModulAllgemein)
{
    Nutzerverwaltung = Nutzerbibliothek;
    ModulAllgemein = NeuesModulAllgemein;
};

/**
 * Nimmt die gesendeten Daten auf und fährt mit dem nächsten Ziel fort.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function DatenAufnehmen (Nachricht, Nutzer, Befehlsobjekt)
{
    //Wenn der Zustand jeden Text aufnimmt, muss dieser in seiner Beschaffenheit erhalten bleiben.
    //Gibt es jedoch einen spezifischen Befehl, also wenn keine pauschale Datenaufnahme stattfindet, so wird dieser eingetragen,
    //da er bereits verarbeitet wurde (nur Kleinbuchstaben, Punkt am Ende abgetrennt etc.).
    Nutzer[Nutzer.Zustand] = Befehlsobjekt.Datenaufnahme ? Nachricht.content : Nachricht.Befehl;

    Nutzerverwaltung.Aktualisieren(Nutzer);

    ModulAllgemein.Fortfahren(Nachricht, Nutzer, Befehlsobjekt);
}
exports.DatenAufnehmen = DatenAufnehmen;

/**
 * Verarbeitet die Eingabe des eigenen Landes und schickt den Nutzer zur nächsten Frage.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function LandVerarbeiten (Nachricht, Nutzer)
{
    Nutzer[Nutzer.Zustand] = Nachricht.Befehl;

    let Antworttext = '';

    if (Nutzer.AnalogDigitalSelbst == 'beides')
    {
        Nutzer.Zustand = 'Steam';
        Antworttext = Texte.Steam;
    }
    else if (Nutzer.AnalogDigitalWichtel != 'digital')
    {  
        Nutzer.Zustand = 'International';
        Antworttext = Texte.International;
    }
    else
    {
        Nutzer.Zustand = 'Wunschliste';
        Antworttext = Texte.Wunschliste;
    }

    Nutzerverwaltung.Aktualisieren(Nutzer);

    Nachricht.reply(Antworttext);

    ModulAllgemein.AlteDatenAusgeben(Nachricht, Nutzer);
}
exports.LandVerarbeiten = LandVerarbeiten;

/**
 * Verarbeitet die Eingabe eines Steamnamens und schickt den Nutzer zur nächsten Frage.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function SteamVerarbeiten (Nachricht, Nutzer)
{
    Nutzer[Nutzer.Zustand] = Nachricht.content;

    let Antworttext = '';

    if (Nutzer.AnalogDigitalWichtel != 'digital')
    {  
        Nutzer.Zustand = 'International';
        Antworttext = Texte.International;
    }
    else
    {
        Nutzer.Zustand = 'Wunschliste';
        Antworttext = Texte.Wunschliste;
    }

    Nutzerverwaltung.Aktualisieren(Nutzer);

    Nachricht.reply(Antworttext);

    ModulAllgemein.AlteDatenAusgeben(Nachricht, Nutzer);
}
exports.SteamVerarbeiten = SteamVerarbeiten;

/**
 * Verarbeitet die Eingabe einer Wunschliste und schickt den Nutzer zur nächsten Frage.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function WunschlisteVerarbeiten (Nachricht, Nutzer)
{
    Nutzer[Nutzer.Zustand] = Nachricht.content;

    let Antworttext = '';

    if (Nutzer.AnalogDigitalSelbst != 'digital')
    {  
        Nutzer.Zustand = 'Allergien';
        Antworttext = Texte.Allergien;
    }
    else
    {
        Nutzer.Zustand = 'AusschlussGeschenk';
        Antworttext = Texte.AusschlussGeschenk;
    }

    Nutzerverwaltung.Aktualisieren(Nutzer);

    Nachricht.reply(Antworttext);

    ModulAllgemein.AlteDatenAusgeben(Nachricht, Nutzer);
}
exports.WunschlisteVerarbeiten = WunschlisteVerarbeiten;

/**
 * Setzt die Datenaufnahme zurück, sodass der Nutzer erneut alles eingeben kann.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function DatenÄndern (Nachricht, Nutzer, Befehlsobjekt)
{
    Nachricht.reply(Texte.ÄnderungStarten);

    ModulAllgemein.Fortfahren(Nachricht, Nutzer, Befehlsobjekt);
}
exports.DatenÄndern = DatenÄndern;