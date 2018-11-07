/**
 * Die Basiskonfiguration.
 */
const Config = require('../Config/Config.json');

/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../Config/Texte.json');

//Die Submodule der Nachrichtenverwaltung, die jeweils verschiedene Aufgaben der verarbeiteten Befehle übernehmen:
var ModulAllgemein = require('./Nachrichten/Allgemein.js');
var ModulDatenaufnahme = require('./Nachrichten/Datenaufnahme.js');
var ModulModeration = require('./Nachrichten/Moderation.js');

const Definitionen = {
    //Die maximale Länge, die ein Befehl haben darf: (Optimiert die Erkennung von Befehlen.)
    MaximaleBefehlslänge: 20,
    //Das Präfix vor Befehlen, um auf Servern nur auf bestimmte Nachrichten zu reagieren.
    ServerBefehlspräfix: '!',
    //Nur auf dem Server möglich:
    Kontaktaufnahme: {
        Befehl: "wischtöööln",
        Text: Texte.Kontaktaufnahme,
        Funktion: Kontaktaufnahme
    },
    //Jederzeit möglich:
    Befehle: {
        "hilfe": {
            Funktion: ModulAllgemein.HilfeRufen,
            Text: Texte.Hilfe
        },
        "guten morgen": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenMorgen
        },
        "morgen": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenMorgen
        },
        "gtnmrgn": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenMorgen
        },
        "mrgn": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenMorgen
        },
        "gute nacht": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GuteNacht
        },
        "nacht": {
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GuteNacht
        }
    },
    //Nur im Moderationskanal:
    Moderation: {
        "nachrichtankanal": {
            Funktion: ModulModeration.NachrichtAnKanalSenden
        },
        "löschenachricht": {
            Funktion: ModulModeration.NachrichtEntfernen
        }
    },
    //Nur in einem bestimmten Zustand gültig:
    Zustände: {
        Neu: {
            "registrieren": {
                Funktion: ModulAllgemein.Registrieren
            }
        },
        Registrierung: {
            "ja": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            },
            "nein": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "Neu",
                Text: Texte.Kontaktaufnahme
            }
        },
        AnalogDigitalWichtel: {
            "analog": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            },
            "digital": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            },
            "beides": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            }
        },
        AnalogDigitalSelbst: {
            "analog": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Anschrift",
                Text: Texte.Anschrift
            },
            "digital": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Steam",
                Text: Texte.Steam
            },
            "beides": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Anschrift",
                Text: Texte.Anschrift
            }
        },
        Anschrift: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.DatenAufnehmen,
            Ziel: "Land",
            Text: Texte.Land
        },
        Land: {
            "deutschland": {
                Funktion: ModulDatenaufnahme.LandVerarbeiten
            },
            "österreich": {
                Funktion: ModulDatenaufnahme.LandVerarbeiten
            },
            "schweiz": {
                Funktion: ModulDatenaufnahme.LandVerarbeiten
            },
            "luxemburg": {
                Funktion: ModulDatenaufnahme.LandVerarbeiten
            }
        },
        Steam: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.SteamVerarbeiten
        },
        International: {
            "ja": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Wunschliste",
                Text: Texte.Wunschliste
            },
            "nein": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Wunschliste",
                Text: Texte.Wunschliste
            }
        },
        Wunschliste: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.WunschlisteVerarbeiten
        },
        Allergien: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.DatenAufnehmen,
            Ziel: "AusschlussGeschenk",
            Text: Texte.AusschlussGeschenk
        },
        AusschlussGeschenk: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.DatenAufnehmen,
            Ziel: "AusschlussWichtel",
            Text: Texte.AusschlussWichtel
        },
        AusschlussWichtel: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.DatenAufnehmen,
            Ziel: "Freitext",
            Text: Texte.Freitext
        },
        Freitext: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.DatenAufnehmen,
            Ziel: "Teilnehmer",
            Text: Texte.Teilnehmer
        },
        Teilnehmer: {
            "ändern": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "ÄnderungBestätigen",
                Text: Texte.ÄnderungBestätigen
            }
        },
        ÄnderungBestätigen: {
            "ja": {
                Funktion: ModulDatenaufnahme.DatenÄndern,
                Ziel: "AnalogDigitalWichtel",
                Text: Texte.AnalogDigitalWichtel
            },
            "nein": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "Teilnehmer",
                Text: Texte.ÄnderungAbgebrochen
            }
        }
    },
    NichtVerstanden: {
        Funktion: ModulAllgemein.NichtVerstanden
    }
};

const Nutzerverwaltung = require('./Nutzer.js');

/**
 * Die Datenbanverwaltung.
 */
var Datenbanverwaltung;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert die Nachrichtenverarbeitung.
 * @param {Object} Datenbankbibliothek
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Datenbankbibliothek, NeuerKlient)
{
    Datenbanverwaltung = Datenbankbibliothek;
    Klient = NeuerKlient;

    Nutzerverwaltung.Initialisieren(Datenbanverwaltung);

    ModulAllgemein.Initialisieren(Nutzerverwaltung, Klient);
    ModulDatenaufnahme.Initialisieren(Nutzerverwaltung, ModulAllgemein);
    ModulModeration.Initialisieren(Nutzerverwaltung, Klient);
};

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
    if (Nachricht.content.length < Definitionen.MaximaleBefehlslänge)
    {
        Befehl = ZuBefehlKürzen(Nachricht.content);
        
        Nachricht.Befehl = Befehl; //Für späteren Zugriff auf den Befehl in datenverarbeitenden Funktionen.
    }

    let Autor = Nachricht.author;

    if (Nachricht.channel.type == 'dm') //Nachricht wurde in einer privaten Unterhaltung geschrieben.
    {
        Datenbanverwaltung.Log(Autor.id, Autor.username, Nachricht.content);

        //Wenn kein Nutzer vorhanden ist bei direkter Kommunikation, impliziere eine Kontaktaufnahme:
        if (!Nutzerverwaltung.IdIstVorhanden(Autor.id))
        {
            Definitionen.Kontaktaufnahme.Funktion(Autor);
            return;
        }

        let Nutzer = Nutzerverwaltung.VonId(Autor.id);
        let Zustand = Definitionen.Zustände[Nutzer.Zustand];
        let Befehlsobjekt = Zustand[Befehl];

        if (Befehlsobjekt) //Es gibt einen spezifischen Befehl für den aktuellen Zustand.
            Befehlsobjekt.Funktion(Nachricht, Nutzer, Befehlsobjekt)
        else if (Definitionen.Befehle[Befehl]) //Es gibt einen allgemeinen Befehl, der immer gültig ist.
            Definitionen.Befehle[Befehl].Funktion(Nachricht, Nutzer, Definitionen.Befehle[Befehl])
        else if (Zustand.Datenaufnahme) //Der aktuelle Zustand nimmt einen beliebigen Text auf.
            Zustand.Funktion(Nachricht, Nutzer, Zustand) //Bei der Datenaufnahme gibt es keinen Befehl, daher ersetzt der Zustand das Befehlsobjekt.
        else //Es gibt keine passende Aktion für die Nachricht.
            Definitionen.NichtVerstanden.Funktion(Nachricht, Nutzer);
    }
    else //Nachricht wurde auf einem Server geschrieben.
    {
        if ((Nachricht.channel.id != Config.KanalIdWichteln) &&
            (Nachricht.channel.id != Config.KanalIdOrganisation))
            return; //Nur auf Kanäle reagieren, die wirklich überwacht werden.

        if (!Nachricht.content.startsWith(Definitionen.ServerBefehlspräfix))
            return; //Auf Servern nur auf Nachrichten reagieren, die mit dem Befehlspräfix beginnen.

        Datenbanverwaltung.Log(Autor.id, Autor.username, Nachricht.content, Nachricht.channel.id);

        //Kontaktaufnahme ist überall möglich:
        if (Befehl == Definitionen.Kontaktaufnahme.Befehl)
            Definitionen.Kontaktaufnahme.Funktion(Autor)
        //Moderation nur auf einem bestimmten Kanal:
        else if (Nachricht.channel.id == Config.KanalIdOrganisation)
        {
            Befehl = Nachricht.content.substr(0, Nachricht.content.indexOf("\n")); //Der Befehl steht in der ersten Zeile der Nachricht.
            Befehl = ZuBefehlKürzen(Befehl);

            Nachricht.content = Nachricht.content.substr(Befehl.length + 1); //Befehl aus der Nachricht entfernen:

            if (Definitionen.Moderation[Befehl])
                Definitionen.Moderation[Befehl].Funktion(Nachricht);
        }
    }

    function ZuBefehlKürzen (Eingabe)
    {
        let Ergebnis;
        //Entferne sämtliche zu ignorierenden Symbole am Anfang und Ende. (Ausrufezeichen, Fragezeichen, Punkte, Kommata, Semikolons, Leerzeichen):
        Ergebnis = Eingabe.replace(/^[!?.,;\s]+|[!?.,;\s]+$/g, '');
        Ergebnis = Ergebnis.toLowerCase();

        return Ergebnis;
    }
};

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
        Nutzerverwaltung.Hinzufügen(NeuerNutzer);
    }

    Autor.send(Definitionen.Kontaktaufnahme.Text);
}