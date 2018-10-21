/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../Config/Texte.json');

const Definitionen = {
    //Die maximale Länge, die ein Befehl haben darf: (Optimiert die Erkennung von Befehlen.)
    MaximaleBefehlslaenge: 16,
    //Nur auf dem Server möglich:
    Kontaktaufnahme: {
        Befehl: "!wichtöööln",
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
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            },
            "nein": {
                Funktion: Fortfahren,
                Ziel: "Neu",
                ZustandIstPersistent: true,
                Text: Texte.Kontaktaufnahme
            }
        },
        AnalogDigitalSelbst: {
            "analog": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            },
            "digital": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            },
            "beides": {
                Funktion: DatenAufnehmen,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            }
        },
        AnalogDigitalWichtel: {
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
            Datenaufnahme: true
        },
        Steam: {
            Datenaufnahme: true
        },
        International: {
            
        },
        Wunschliste: {
            Datenaufnahme: true
        },
        Links: {
            Datenaufnahme: true
        },
        Allergien: {
            Datenaufnahme: true
        },
        AusschlussGeschenk: {
            Datenaufnahme: true
        },
        AusschlussWichtel: {
            Datenaufnahme: true
        },
        Freitext: {
            Datenaufnahme: true
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
        Befehl = Nachricht.content.toLowerCase();

    let Autor = Nachricht.author;

    if (Nachricht.channel.type == 'dm') //Nachricht wurde in einer privaten Unterhaltung geschrieben.
    {
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
            Zustand.Funktion(Nachricht, Nutzer, Befehlsobjekt)
        else //Es gibt keine passende Aktion für die Nachricht.
            Nachricht.reply(Definitionen.NichtVerstanden.Text);
    }
    else //Nachricht wurde auf einem Server geschrieben.
    {
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

    if (Befehlsobjekt.ZustandIstPersistent)
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
    Nutzer.Daten[Nutzer.Zustand] = Nachricht.content;

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