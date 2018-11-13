/**
 * Die Basiskonfiguration.
 */
const Config = require('../../Config/Config.json');

/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../../Config/Texte.json');

var Nutzerverwaltung;
var Datenbankverwaltung;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert das Moderationsmodul der Nachrichtenverarbeitung.
 * @param {Object} Nutzerbibliothek
 * @param {Object} Datenbankbibliothek
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Nutzerbibliothek, Datenbankbibliothek, NeuerKlient)
{
    Nutzerverwaltung = Nutzerbibliothek;
    Datenbankverwaltung = Datenbankbibliothek;
    Klient = NeuerKlient;
};

/**
 * Sendet eine Nachricht an den öffentlichen Wichtelkanal.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnKanalSenden (Nachricht)
{
    Klient.channels.get(Config.KanalIdWichteln).send(Nachricht.Parameter);
}
exports.NachrichtAnKanalSenden = NachrichtAnKanalSenden;

/**
 * Sendet eine Nachricht an ein Liste von Nutzern, ersetzt dabei die nötigen Variablen und bestätigt das Versenden.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Array} Nutzerliste Ein Array der Nutzerobjekte mit allen Angaben zum Nutzer.
 */
function NachrichtSendenUndBestätigen (Nachricht, Nutzerliste)
{
    if (!Nachricht.Parameter)
    {
        Nachricht.reply("\n" + Texte.ParameteranzahlUngenügend);
        return;
    }

    for (let Nutzer of Nutzerliste)
    {
        Klient.fetchUser(Nutzer.Id).then(function (DiscordNutzer)
            {
                let Antwort = Nachricht.Parameter.replace(/\[\[NUTZERNAME\]\]/g, Nutzer.Name);
                DiscordNutzer.send(Antwort);
            }
        );
    }

    let Bestätigung = Texte.SendenErfolgreich.replace(/\[\[ANZAHL\]\]/g, Nutzerliste.length);

    Nachricht.reply("\n" + Bestätigung);
}

/**
 * Sendet eine Nachricht an einen bestimmten Nutzer. Erste Zeile: Nutzername, weitere Zeilen: Nachricht.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnNutzerSenden (Nachricht)
{
    let Parameter = Nachricht.Parameter.split("\n");
    if (Parameter.length < 2)
    {
        Nachricht.reply("\n" + Texte.ParameteranzahlUngenügend);
        return;
    }

    let Nutzer = Nutzerverwaltung.VonName(Parameter[0]);

    if (Nutzer)
    {
        Nachricht.Parameter = Parameter[1]; //Die folgende Funktion erwartet die Nachricht im Parameter der Nachricht.
        NachrichtSendenUndBestätigen(Nachricht, [Nutzer]);
    }
    else
        Nachricht.reply("\n" + Texte.NutzernameNichtGefunden);
}
exports.NachrichtAnNutzerSenden = NachrichtAnNutzerSenden;

/**
 * Sendet eine Nachricht an alle dem Bot bekannten Nutzer.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnAlleNutzerSenden (Nachricht)
{
    let Nutzerliste = Array.from(Nutzerverwaltung.Liste.values());

    NachrichtSendenUndBestätigen(Nachricht, Nutzerliste);
}
exports.NachrichtAnAlleNutzerSenden = NachrichtAnAlleNutzerSenden;

/**
 * Sendet eine Nachricht an alle vollständig registrierten Nutzer im Zustand "Teilnehmer".
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnAlleTeilnehmerSenden (Nachricht)
{
    let Nutzerliste = [];

    for (let Nutzer of Nutzerverwaltung.Liste.values())
    {
        if (Nutzer.Zustand == 'Teilnehmer')
            Nutzerliste.push(Nutzer);
    }

    NachrichtSendenUndBestätigen(Nachricht, Nutzerliste);
}
exports.NachrichtAnAlleTeilnehmerSenden = NachrichtAnAlleTeilnehmerSenden;

/**
 * Sendet eine Nachricht an alle dem Bot bekannten Nutzer, die sich NICHT im Zustand "Teilnehmer" befinden.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnAlleAusstehendenSenden (Nachricht)
{
    let Nutzerliste = [];

    for (let Nutzer of Nutzerverwaltung.Liste.values())
    {
        if (Nutzer.Zustand != 'Teilnehmer')
            Nutzerliste.push(Nutzer);
    }

    NachrichtSendenUndBestätigen(Nachricht, Nutzerliste);
}
exports.NachrichtAnAlleAusstehendenSenden = NachrichtAnAlleAusstehendenSenden;

/**
 * Entfernt eine Nachricht aus dem öffentlichen Wichtelkanal anhand seiner Id.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtEntfernen (Nachricht)
{
    let NachrichtenId = Nachricht.Parameter.replace(/[^/\d]/g,''); //Entfernt alles außer Zahlen.

    Klient.channels.get(Config.KanalIdWichteln).delete(NachrichtenId);
}
exports.NachrichtEntfernen = NachrichtEntfernen;

/**
 * Ermittelt die aktuelle Anzahl an gegebener Wichtel.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function Wichtelstatus (Nachricht)
{
    Datenbankverwaltung.Nutzerzahlen(function (Ergebnis)
        {
            let Antwort = Texte.Wichtelstatus;
            Antwort = Antwort.replace(/\[\[GESAMT\]\]/g, Ergebnis.Gesamt);
            Antwort = Antwort.replace(/\[\[TEILNEHMER\]\]/g, Ergebnis.Teilnehmer);

            Nachricht.channel.send(Antwort);
        }
    );
}
exports.Wichtelstatus = Wichtelstatus;

/**
 * Gibt eine Info zu den möglichen Moderationsbefehlen aus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function Info (Nachricht)
{
    Nachricht.channel.send(Texte.ModerationInfo);
}
exports.Info = Info;

/**
 * Führt die Ziehung der Wichtel aus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function ZiehungAusführen (Nachricht)
{
    let Ziehung = require('../Ziehung.js');

    Ziehung.Initialisieren(Nutzerverwaltung, Datenbankverwaltung, Klient);
    Ziehung.Ausführen(function (IstFehlerfrei)
        {
            if (IstFehlerfrei)
                Nachricht.channel.send(Texte.ZiehungAusgeführt);
            else
                Nachricht.channel.send(Texte.ZiehungFehlgeschlagen);
        }
    );
}
exports.ZiehungAusführen = ZiehungAusführen;

/**
 * Listet alle Steamnamen von Nutzern auf, die digital bewichtelt werden wollen.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function SteamnamenAuflisten (Nachricht)
{
    Datenbankverwaltung.Steamnamen(function (Reihen)
        {
            let Steamnamen = [];

            for (let Eintrag of Reihen)
                Steamnamen.push(Eintrag.Steam);

            Nachricht.channel.send(Steamnamen.join("\n"));
        }
    );
}
exports.SteamnamenAuflisten = SteamnamenAuflisten;

/**
 * Verteilt die Steckbriefe ihrer Wichtel an alle Teilnehmer.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function SteckbriefeVerteilen (Nachricht)
{
    let AnzahlSteckbriefe = 0;

    for (let Nutzer of Nutzerverwaltung.Liste.values())
        if ((Nutzer.Zustand == 'Teilnehmer') && (Nutzer.WichtelId))
        {
            let Wichtel = Nutzerverwaltung.VonId(Nutzer.WichtelId);

            let Geschenkziel;
            let Allergientext = Texte.Steckbrief.Allergien.replace(/\[\[ALLERGIEN\]\]/g, Wichtel.Allergien);

            switch (Wichtel.AnalogDigitalSelbst)
            {
                case 'analog':
                    Geschenkziel = Texte.Steckbrief.Anschrift;
                    break;
                case 'digital':
                    Geschenkziel = Texte.Steckbrief.Steam;
                    Allergientext = '';
                    break;
                default:
                    Geschenkziel = Texte.Steckbrief.Anschrift + "\n\n" + Texte.Steckbrief.Steam;
            }

            Geschenkziel = Geschenkziel.replace(/\[\[LAND\]\]/g, Wichtel.Land);
            Geschenkziel = Geschenkziel.replace(/\[\[ANSCHRIFT\]\]/g, Wichtel.Anschrift);
            Geschenkziel = Geschenkziel.replace(/\[\[STEAM\]\]/g, Wichtel.Steam);

            let Steckbrief = Texte.Steckbrief.Text;

            Steckbrief = Steckbrief.replace(/\[\[NUTZERNAME\]\]/g, Nutzer.Name);
            Steckbrief = Steckbrief.replace(/\[\[GESCHENKZIEL\]\]/g, Geschenkziel);
            Steckbrief = Steckbrief.replace(/\[\[ALLERGIENTEXT\]\]/g, Allergientext);
            Steckbrief = Steckbrief.replace(/\[\[WICHTELNAME\]\]/g, Wichtel.Name);
            Steckbrief = Steckbrief.replace(/\[\[ANALOGDIGITAL\]\]/g, Wichtel.AnalogDigitalSelbst);
            Steckbrief = Steckbrief.replace(/\[\[WUNSCHLISTE\]\]/g, Wichtel.Wunschliste);
            Steckbrief = Steckbrief.replace(/\[\[UNERWÜNSCHT\]\]/g, Wichtel.AusschlussGeschenk);
            Steckbrief = Steckbrief.replace(/\[\[FREITEXT\]\]/g, Wichtel.Freitext);

            Klient.fetchUser(Nutzer.Id).then(function (DiscordNutzer)
                {
                    DiscordNutzer.send(Steckbrief);
                }
            );

            AnzahlSteckbriefe++;
        }

    let Bestätigung = Texte.SteckbriefeGesendet.replace(/\[\[ANZAHL\]\]/g, AnzahlSteckbriefe);

    Nachricht.reply("\n" + Bestätigung);
}
exports.SteckbriefeVerteilen = SteckbriefeVerteilen;