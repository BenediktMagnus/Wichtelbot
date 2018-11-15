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
    let Namensende = Nachricht.Parameter.indexOf("\n");
    if (Namensende == -1)
    {
        Nachricht.reply("\n" + Texte.ParameteranzahlUngenügend);
        return;
    }

    let Name = Nachricht.Parameter.substr(0, Namensende);

    Nachricht.Parameter = Nachricht.Parameter.substr(Name.length + 1);

    let Nutzer = Nutzerverwaltung.VonName(Name);

    if (Nutzer)
        NachrichtSendenUndBestätigen(Nachricht, [Nutzer]);
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
    const AusstehendeZustände = ['Neu', 'Registrierung', 'AnalogDigitalWichtel', 'AnalogDigitalSelbst', 'Anschrift', 'Land', 'Steam',
                                'International', 'Wunschliste', 'Allergien', 'AusschlussGeschenk', 'AusschlussWichtel', 'Freitext'];

    let Nutzerliste = [];

    for (let Nutzer of Nutzerverwaltung.Liste.values())
    {
        if (AusstehendeZustände.indexOf(Nutzer.Zustand) == -1)
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
 * Beendet die Anmeldephase und gibt allen Teilnehmern den Wichtelstatus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function AnmeldephaseBeenden (Nachricht)
{
    let Teilnehmerliste = [];

    for (let Nutzer of Nutzerverwaltung.Liste.values())
    {
        //Wir prüfen hier auf "Teilnehmer" und "Wartend", damit im Falle eines Fehlers beim Eintragen in die Datenbank
        //ein erneutes Ausführen des Befehls den Fehler bereinigen kann.
        if ((Nutzer.Zustand == 'Teilnehmer') || (Nutzer.Zustand == 'Wartend'))
        {
            Teilnehmerliste.push(Nutzer.Id);
            Nutzer.Zustand = 'Wartend';
        }
    }

    Datenbankverwaltung.TeilnehmerZuWichtelnMachen(Teilnehmerliste, function (EintragenErfolgreich)
        {
            if (EintragenErfolgreich)
            {
                let Bestätigung = Texte.AnmeldephaseBeendenErfolgreich.replace(/\[\[ANZAHL\]\]/g, Teilnehmerliste.length);
                Nachricht.reply("\n" + Bestätigung);
            }
            else
                Nachricht.reply("\n" + Texte.AnmeldephaseBeendenFehlgeschlagen);
        }
    );
}
exports.AnmeldephaseBeenden = AnmeldephaseBeenden;

/**
 * Führt die Ziehung der Wichtel aus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function ZiehungAusführen (Nachricht)
{
    let Prioritätenliste = [];

    if (Nachricht.Parameter != '')
        Prioritätenliste = Nachricht.Parameter.split("\n");

    let Ziehung = require('../Ziehung.js');

    Ziehung.Initialisieren(Nutzerverwaltung, Datenbankverwaltung, Klient);
    Ziehung.Ausführen(Prioritätenliste, function (IstFehlerfrei)
        {
            if (IstFehlerfrei)
                Nachricht.reply("\n" + Texte.ZiehungAusgeführt);
            else
                Nachricht.reply("\n" + Texte.ZiehungFehlgeschlagen);
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
 * Verteilt die Steckbriefe ihrer Wichtel an alle Wartenden.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function SteckbriefeVerteilen (Nachricht)
{
    let AnzahlSteckbriefe = 0;

    for (let Nutzer of Nutzerverwaltung.Liste.values())
        if ((Nutzer.Zustand == 'Wartend') && (Nutzer.WichtelId))
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
                    const MaximaleNachrichtengröße = 1996;
                    const AnzahlNachrichten = Math.ceil(Steckbrief.length / MaximaleNachrichtengröße);
                    let Nachrichten = new Array(AnzahlNachrichten);
                    for (let i = 0, n = 0; i < AnzahlNachrichten; ++i, n += MaximaleNachrichtengröße)
                        Nachrichten[i] = Steckbrief.substr(n, MaximaleNachrichtengröße);

                    for (let Steckbriefteil of Nachrichten)
                        DiscordNutzer.send(Steckbriefteil);
                }
            );

            AnzahlSteckbriefe++;
        }

    let Bestätigung = Texte.SteckbriefeGesendet.replace(/\[\[ANZAHL\]\]/g, AnzahlSteckbriefe);

    Nachricht.reply("\n" + Bestätigung);
}
exports.SteckbriefeVerteilen = SteckbriefeVerteilen;