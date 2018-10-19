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
        Text: Texte.Kontaktaufnahme
    },
    //Jederzeit möglich:
    Befehle: {
        "abbruch": {

        }
    },
    //Nur in einem bestimmten Zustand gültig:
    Zustaende: {
        Neu: {
            "registrieren": {
                Text: Texte.Registriert,
                Ziel: 'Registrierung'
            }
        },
        Registrierung: {

        },
        AnalogDigitalSelbst: {

        },
        AnalogDigitalWichtel: {
            
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
        Leer: {}
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

    if (Nachricht.channel.type == 'dm')
    {
        //Wenn kein Nutzer vorhanden ist bei direkter Kommunikation, impliziere eine Kontaktaufnahme:
        if (!Nutzerverwaltung.Liste.has(Autor.id))
        {
            Kontaktaufnahme(Autor);
            return;
        }

        let Nutzer = Nutzerverwaltung.Liste.get(Autor.id);
        let Zustand = Definitionen.Zustaende[Nutzer.Zustand];

        if (Zustand[Befehl]) //Es gibt einen spezifischen Befehl für den aktuellen Zustand.
            Zustand[Befehl].Funktion(Nachricht)
        else if (Definitionen.Befehle[Befehl]) //Es gibt einen allgemeinen Befehl, der immer gültig ist.
            Definitionen.Befehle[Befehl].Funktion(Nachricht)
        else if (Zustand.Datenaufnahme) //Der aktuelle Zustand nimmt einen beliebigen Text auf.
            Zustand.Funktion(Nachricht)
        else //Es gibt keine passende Aktion für die Nachricht.
            Nachricht.reply(Definitionen.NichtVerstanden.Text);
    }
    else //Nachricht wurde auf einem Server geschrieben.
    {
        if (Befehl == Definitionen.Kontaktaufnahme.Befehl)
            Kontaktaufnahme(Autor);
    }
}

/**
 * Erzeugt einen neuen Nutzer anhand eines Discordnutzers und nimmt Kontakt per privater Nachricht auf.
 * @param {Object} Autor Der Autor einer Nachricht in Discord, ein Discordnutzerobjekt.
 */
function Kontaktaufnahme (Autor)
{
    if (!Nutzerverwaltung.Liste.has(Autor.id)) //Nur einen neuen Nutzer erzeugen, wenn er nicht bereits vorhanden ist...
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