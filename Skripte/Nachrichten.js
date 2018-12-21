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
var ModulPakete = require('./Nachrichten/Pakete.js');
var ModulModeration = require('./Nachrichten/Moderation.js');

const Definitionen = {
    //Die maximale Länge, die ein Befehl haben darf: (Optimiert die Erkennung von Befehlen.)
    MaximaleBefehlslänge: 40,
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
            Aliase: ["morgen", "gtnmrgn", "mrgn"],
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenMorgen
        },
        "guten tag": {
            Aliase: ["tag"],
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GutenTag
        },
        "hallo": {
            Aliase :["hey","hi","hej"],
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.Hallo
        },
        "gute nacht": {
            Aliase: ["nacht"],
            Funktion: ModulAllgemein.Antworten,
            Text: Texte.GuteNacht
        },
        "sternenrose": {
            Funktion: ModulAllgemein.Sternenrose
        }
    },
    //Nur im Moderationskanal:
    Moderation: {
        "info": {
            Aliase: ["hilfe"],
            Funktion: ModulModeration.Info
        },
        "nachrichtankanal": {
            Funktion: ModulModeration.NachrichtAnKanalSenden
        },
        "nachrichtannutzer": {
            Funktion: ModulModeration.NachrichtAnNutzerSenden
        },
        "nachrichtanallenutzer": {
            Funktion: ModulModeration.NachrichtAnAlleNutzerSenden
        },
        "nachrichtanalleteilnehmer": {
            Funktion: ModulModeration.NachrichtAnAlleTeilnehmerSenden
        },
        "nachrichtanalleausstehenden": {
            Funktion: ModulModeration.NachrichtAnAlleAusstehendenSenden
        },
        "nachrichtanallespätenwichtel": {
            Funktion: ModulModeration.NachrichtAnAlleSpätenWichtelSenden
        },
        "löschenachricht": {
            Funktion: ModulModeration.NachrichtEntfernen
        },
        "wichtelstatus": {
            Funktion: ModulModeration.Wichtelstatus
        },
        "anmeldephasebeenden": {
            Funktion: ModulModeration.AnmeldephaseBeenden
        },
        "ziehungausführen": {
            Funktion: ModulModeration.ZiehungAusführen
        },
        "steamnamenauflisten": {
            Funktion: ModulModeration.SteamnamenAuflisten
        },
        "steckbriefeverteilen": {
            Funktion: ModulModeration.SteckbriefeVerteilen
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
                Aliase: ["nö", "ne"],
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "Neu",
                Text: Texte.Kontaktaufnahme
            },
            "vielleicht" : {
                Aliase: ["vllt", "eventuell", "evtl"],
                Funktion: ModulAllgemein.Antworten,
                Text: Texte.Vielleicht
            }
        },
        AnalogDigitalWichtel: {
            "analog": {
                Aliase: ["digital", "beides"],
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AnalogDigitalSelbst",
                Text: Texte.AnalogDigitalSelbst
            }
        },
        AnalogDigitalSelbst: {
            "analog": {
                Aliase: ["beides"],
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Anschrift",
                Text: Texte.Anschrift
            },
            "digital": {
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Steam",
                Text: Texte.Steam
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
                Aliase: ["österreich", "schweiz", "luxemburg"],
                Funktion: ModulDatenaufnahme.LandVerarbeiten
            }
        },
        Steam: {
            Datenaufnahme: true,
            Funktion: ModulDatenaufnahme.SteamVerarbeiten
        },
        International: {
            "ja": {
                Aliase: ["nein", "nö", "ne"],
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Wunschliste",
                Text: Texte.Wunschliste
            },
            "vielleicht" : {
                Aliase: ["vllt", "eventuell", "evtl"],
                Funktion: ModulAllgemein.Antworten,
                Text: Texte.Vielleicht
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
                Aliase: ["nö", "ne"],
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "Teilnehmer",
                Text: Texte.ÄnderungAbgebrochen
            },
            "vielleicht" : {
                Aliase: ["vllt", "eventuell", "evtl"],
                Funktion: ModulAllgemein.Antworten,
                Text: Texte.Vielleicht
            }
        },
        Wartend: {
            //Leer
        },
        Wichtel: {
            "anonym meinem wichtelpaten schreiben": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "NachrichtAnWichtelpaten",
                Text: Texte.NachrichtAnWichtelpaten
            },
            "anonym meinem wichtelkind schreiben": {
                Funktion: ModulAllgemein.Fortfahren,
                Ziel: "NachrichtAnWichtelkind",
                Text: Texte.NachrichtAnWichtelkind
            },
            "paket ist unterwegs": {
                Funktion: ModulPakete.DatumEinsetzenUndFortfahren,
                Ziel: "PaketGesendetNummer",
                Text: Texte.PaketGesendetNummer
            },
            "paket empfangen": {
                Funktion: ModulPakete.DatumEinsetzenUndFortfahren,
                Ziel: "PaketEmpfangenDatum",
                Text: Texte.PaketEmpfangenDatum
            }
        },
        NachrichtAnWichtelpaten: {
            Datenaufnahme: true,
            Funktion: ModulAllgemein.NachrichtAnWichtelpaten
        },
        NachrichtAnWichtelkind: {
            Datenaufnahme: true,
            Funktion: ModulAllgemein.NachrichtAnWichtelkind
        },
        PaketGesendetNummer: {
            Datenaufnahme: true,
            Funktion: ModulPakete.GesendetNummerAufnehmen
        },
        PaketGesendetDatum: {
            Datenaufnahme: true,
            Funktion: ModulPakete.GesendetDatumAufnehmen
        },
        PaketEmpfangenDatum: {
            Datenaufnahme: true,
            Funktion: ModulPakete.EmpfangenDatumAufnehmen
        }
    },
    NichtVerstanden: {
        Funktion: ModulAllgemein.NichtVerstanden
    }
};

const Nutzerverwaltung = require('./Nutzer.js');

/**
 * Die Datenbankverwaltung.
 */
var Datenbankverwaltung;

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
    Datenbankverwaltung = Datenbankbibliothek;
    Klient = NeuerKlient;

    AliaseSetzen(Definitionen.Befehle);

    AliaseSetzen(Definitionen.Moderation);
    for (let Zustand in Definitionen.Zustände)
        AliaseSetzen(Definitionen.Zustände[Zustand]);

    Nutzerverwaltung.Initialisieren(Datenbankverwaltung);

    ModulAllgemein.Initialisieren(Nutzerverwaltung, Klient);
    ModulDatenaufnahme.Initialisieren(Nutzerverwaltung, ModulAllgemein);
    ModulPakete.Initialisieren(Nutzerverwaltung, Datenbankverwaltung, ModulAllgemein, Klient);
    ModulModeration.Initialisieren(Nutzerverwaltung, Datenbankverwaltung, Klient);
};

/**
 * Setzt Aliase für Eigenschaften eines Objekts.
 * @param {Object} Zielobjekt Objekt mit Aliasarray.
 */
function AliaseSetzen (Zielobjekt)
{
    for (let Eigenschaft in Zielobjekt)
        if (Zielobjekt[Eigenschaft].Aliase)
        {
            //Aliase durchlaufen und im Zielobjekt jedes davon auf die Ausgangseigenschaft zeigen lassen:
            Zielobjekt[Eigenschaft].Aliase.forEach(function (Alias)
                {
                    Zielobjekt[Alias] = Zielobjekt[Eigenschaft];
                }
            );

            //Anschließend kann das Aliasarray gelöscht werden:
            delete Zielobjekt[Eigenschaft].Aliase;
        }
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
    if (Nachricht.content.length < Definitionen.MaximaleBefehlslänge)
    {
        Befehl = ZuBefehlKürzen(Nachricht.content);

        Nachricht.Befehl = Befehl; //Für späteren Zugriff auf den Befehl in datenverarbeitenden Funktionen.
    }

    let Autor = Nachricht.author;

    if (Nachricht.channel.type == 'dm') //Nachricht wurde in einer privaten Unterhaltung geschrieben.
    {
        Datenbankverwaltung.Log(Autor.id, Autor.username, Nachricht.content);

        //Wenn kein Nutzer vorhanden ist bei direkter Kommunikation, impliziere eine Kontaktaufnahme:
        if (!Nutzerverwaltung.IdIstVorhanden(Autor.id))
        {
            Definitionen.Kontaktaufnahme.Funktion(Autor);
            return;
        }

        let Nutzer = Nutzerverwaltung.VonId(Autor.id);
        let Zustand = Definitionen.Zustände[Nutzer.Zustand];
        let Befehlsobjekt = Zustand ? Zustand[Befehl] : undefined; //Wenn der Zustand undefined ist, brauchen wir auch kein Befehlsobjekt.

        if (Befehlsobjekt) //Es gibt einen spezifischen Befehl für den aktuellen Zustand.
            Befehlsobjekt.Funktion(Nachricht, Nutzer, Befehlsobjekt);
        else if (Definitionen.Befehle[Befehl]) //Es gibt einen allgemeinen Befehl, der immer gültig ist.
            Definitionen.Befehle[Befehl].Funktion(Nachricht, Nutzer, Definitionen.Befehle[Befehl]);
        else if (Zustand && Zustand.Datenaufnahme) //Der aktuelle Zustand nimmt einen beliebigen Text auf.
            Zustand.Funktion(Nachricht, Nutzer, Zustand); //Bei der Datenaufnahme gibt es keinen Befehl, daher ersetzt der Zustand das Befehlsobjekt.
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

        Datenbankverwaltung.Log(Autor.id, Autor.username, Nachricht.content, Nachricht.channel.id);

        //Kontaktaufnahme ist überall möglich:
        if (Befehl == Definitionen.Kontaktaufnahme.Befehl)
            Definitionen.Kontaktaufnahme.Funktion(Nachricht);
        //Moderation nur auf einem bestimmten Kanal:
        else if (Nachricht.channel.id == Config.KanalIdOrganisation)
        {
            //Der Befehl geht bis zum ersten Zeilenumbruch. Gibt es keinen, ist alles der Befehl.
            let Befehlsende = Nachricht.content.indexOf("\n");
            if (Befehlsende == -1)
                Befehlsende = Nachricht.content.length;

            Befehl = Nachricht.content.substr(0, Befehlsende); //Der Befehl steht in der ersten Zeile der Nachricht.
            Befehl = ZuBefehlKürzen(Befehl);

            Nachricht.Parameter = Nachricht.content.substr(Befehl.length + 2); //Befehl und den Zeilenumbruch aus der Nachricht entfernen:

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
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function Kontaktaufnahme (Nachricht)
{
    if (!Config.AnmeldephaseAktiv)
    {
        Nachricht.reply("\n" + Texte.AnmeldephaseBeendet);
        return;
    }

    let Autor = Nachricht.author;

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