/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../Config/Texte.json');

const Definitionen = {
    //Die maximale Länge, die ein Befehl haben darf: (Optimiert die Erkennung von Befehlen.)
    MaximaleBefehlslaenge: 16,
    //Das Präfix vor Befehlen, um auf Servern nur auf bestimmte Nachrichten zu reagieren.
    ServerBefehlspraefix: '!',
    //Nur auf dem Server möglich:
    Kontaktaufnahme: {
        Befehl: "wichtöööln",
        Text: Texte.Kontaktaufnahme,
        Funktion: Kontaktaufnahme
    },
    //Jederzeit möglich:
    Befehle: {
        //"abbruch": {
        //
        //}
    },
    //Nur in einem bestimmten Zustand gültig:
    Zustaende: {
        Neu: {
            "registrieren": {
                Funktion: Registrieren
            }
        },
        Registrierung: {
            "ja": {
                Funktion: Fortfahren,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            },
            "nein": {
                Funktion: Fortfahren,
                Ziel: "Neu",
                Text: Texte.Kontaktaufnahme
            }
        },
        AnalogDigitalWichtel: {
            "analog": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            },
            "digital": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            },
            "beides": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            }
        },
        AnalogDigitalSelbst: {
            "analog": {
                Funktion: DatenAufnehmen,
                Ziel: "Anschrift",
                Text: Texte.Anschrift
            },
            "digital": {
                Funktion: DatenAufnehmen,
                Ziel: "Steam",
                Text: Texte.Steam
            },
            "beides": {
                Funktion: DatenAufnehmen,
                Ziel: "Anschrift",
                Text: Texte.Anschrift
            }
        },
        Anschrift: {
            Datenaufnahme: true,
            Funktion: DatenAufnehmen,
            Ziel: "Land",
            Text: Texte.Land
        },
        Land: {
            "deutschland": {
                Funktion: LandVerarbeiten
            },
            "österreich": {
                Funktion: LandVerarbeiten
            },
            "schweiz": {
                Funktion: LandVerarbeiten
            },
            "luxemburg": {
                Funktion: LandVerarbeiten
            }
        },
        Steam: {
            Datenaufnahme: true,
            Funktion: SteamVerarbeiten
        },
        International: {
            "ja": {
                Funktion: DatenAufnehmen,
                Ziel: "Wunschliste",
                Text: Texte.Wunschliste
            },
            "nein": {
                Funktion: DatenAufnehmen,
                Ziel: "Wunschliste",
                Text: Texte.Wunschliste
            }
        },
        Wunschliste: {
            Datenaufnahme: true,
            Funktion: WunschlisteVerarbeiten
        },
        Allergien: {
            Datenaufnahme: true,
            Funktion: DatenAufnehmen,
            Ziel: "AusschlussGeschenk",
            Text: Texte.AusschlussGeschenk
        },
        AusschlussGeschenk: {
            Datenaufnahme: true,
            Funktion: DatenAufnehmen,
            Ziel: "AusschlussWichtel",
            Text: Texte.AusschlussWichtel
        },
        AusschlussWichtel: {
            Datenaufnahme: true,
            Funktion: DatenAufnehmen,
            Ziel: "Freitext",
            Text: Texte.Freitext
        },
        Freitext: {
            Datenaufnahme: true,
            Funktion: DatenAufnehmen,
            Ziel: "Teilnehmer",
            Text: Texte.Teilnehmer
        },
        Teilnehmer: {

        }
    },
    NichtVerstanden: {
        Text: Texte.NichtVerstanden
    }
};

const Nutzerverwaltung = require('./Nutzer.js');

/**
 * Die Datenbanverwaltung.
 */
var Datenbanverwaltung;

/**
 * Initialisiert die Nachrichtenverarbeitung.
 * @param {Object} Datenbankbibliothek
 */
exports.Initialisieren = function (Datenbankbibliothek)
{
    Datenbanverwaltung = Datenbankbibliothek;

    Nutzerverwaltung.Initialisieren(Datenbanverwaltung);
}

/**
 * Verarbeitet eingegangene Nachrichten.
 * @param {Object} Nachricht Das vom Discordbot übergebene Nachrichtenobjekt.
 */
exports.Verarbeiten = function (Nachricht)
{
    //Keine Nachrichten von einem selbst oder anderen Bots verarbeiten:
    if (Nachricht.author.bot)
        return;

    let Befehl;
    if (Nachricht.content.length < Definitionen.MaximaleBefehlslaenge)
    {
        Befehl = Nachricht.content;
        //Entferne sämtliche zu ignorierenden Symbole am Anfang und Ende. (Ausrufezeichen, Fragezeichen, Punkte, Kommata, Semikolons, Leerzeichen):
        Befehl = Befehl.replace(/^[!?.,;\s]+|[!?.,;\s]+$/g, '');
        Befehl = Befehl.toLowerCase();

        Nachricht.Befehl = Befehl; //Für späteren Zugriff auf den Befehl in datenverarbeitenden Funktionen.
    }

    let Autor = Nachricht.author;

    if (Nachricht.channel.type == 'dm') //Nachricht wurde in einer privaten Unterhaltung geschrieben.
    {
        Datenbanverwaltung.Log(Autor.id, Autor.username, Nachricht.content);

        //Wenn kein Nutzer vorhanden ist bei direkter Kommunikation, impliziere eine Kontaktaufnahme:
        if (!Nutzerverwaltung.IdIstVorhanden(Autor.id))
        {
            Kontaktaufnahme(Autor);
            return;
        }

        let Nutzer = Nutzerverwaltung.VonId(Autor.id);
        let Zustand = Definitionen.Zustaende[Nutzer.Zustand];
        let Befehlsobjekt = Zustand[Befehl];

        if (Befehlsobjekt) //Es gibt einen spezifischen Befehl für den aktuellen Zustand.
            Befehlsobjekt.Funktion(Nachricht, Nutzer, Befehlsobjekt)
        else if (Definitionen.Befehle[Befehl]) //Es gibt einen allgemeinen Befehl, der immer gültig ist.
            Definitionen.Befehle[Befehl].Funktion(Nachricht, Nutzer, Befehlsobjekt)
        else if (Zustand.Datenaufnahme) //Der aktuelle Zustand nimmt einen beliebigen Text auf.
            Zustand.Funktion(Nachricht, Nutzer, Zustand) //Bei der Datenaufnahme gibt es keinen Befehl, daher ersetzt der Zustand das Befehlsobjekt.
        else //Es gibt keine passende Aktion für die Nachricht.
            Nachricht.reply(Definitionen.NichtVerstanden.Text);
    }
    else //Nachricht wurde auf einem Server geschrieben.
    {
        if (!Nachricht.content.startsWith(Definitionen.ServerBefehlspraefix))
            return; //Auf Servern nur auf Nachrichten reagieren, die mit dem Befehlspräfix beginnen.

        Datenbanverwaltung.Log(Autor.id, Autor.username, Nachricht.content);

        if (Befehl == Definitionen.Kontaktaufnahme.Befehl)
            Definitionen.Kontaktaufnahme.Funktion(Autor);
    }
}

/**
 * Erzeugt einen neuen Nutzer anhand eines Discordnutzers und nimmt Kontakt per privater Nachricht auf.
 * @param {Object} Autor Der Autor einer Nachricht in Discord, ein Discordnutzerobjekt.
 */
function Kontaktaufnahme (Autor)
{
    if (!Nutzerverwaltung.IdIstVorhanden(Autor.id)) //Nur einen neuen Nutzer erzeugen, wenn er nicht bereits vorhanden ist...
    {
        let NeuerNutzer = Nutzerverwaltung.LeerenNutzerErzeugen();
        NeuerNutzer.Id = Autor.id;
        NeuerNutzer.Discord = Autor.tag;
        NeuerNutzer.Name = Autor.username;
        NeuerNutzer.Nickname = Autor.username;
        Nutzerverwaltung.Hinzufuegen(NeuerNutzer);
    }

    Autor.send(Definitionen.Kontaktaufnahme.Text);
}

/**
 * Setzt den nächsten Zustand ohne Datenaufnahme.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function Fortfahren (Nachricht, Nutzer, Befehlsobjekt)
{
    Nutzer.Zustand = Befehlsobjekt.Ziel;
    Nutzerverwaltung.Aktualisieren(Nutzer);
    
    Nachricht.reply(Befehlsobjekt.Text);
}

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

    Fortfahren(Nachricht, Nutzer, Befehlsobjekt);
}

/**
 * Startet den Registrierungsprozess eines Nutzers.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function Registrieren (Nachricht, Nutzer)
{
    Nutzer.Zustand = 'Registrierung';

    Nutzerverwaltung.Aktualisieren(Nutzer);

    Nachricht.reply(Texte.Registriert);
    Nachricht.reply(Texte.Regeln);
}

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
}

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
}

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
}