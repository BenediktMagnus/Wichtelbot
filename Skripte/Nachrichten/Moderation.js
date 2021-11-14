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
    const TeilnehmerZustände = ['Teilnehmer', 'Wartend', 'Wichtel'];

    let Nutzerliste = [];

    for (let Nutzer of Nutzerverwaltung.Liste.values())
    {
        if (TeilnehmerZustände.indexOf(Nutzer.Zustand) !== -1)
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
        if (AusstehendeZustände.indexOf(Nutzer.Zustand) !== -1)
            Nutzerliste.push(Nutzer);
    }

    NachrichtSendenUndBestätigen(Nachricht, Nutzerliste);
}
exports.NachrichtAnAlleAusstehendenSenden = NachrichtAnAlleAusstehendenSenden;

/**
 * Sendet eine Nachricht an alle dem Bot bekannten Wichtel, die noch nicht ihr Paket abgeschickt haben.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnAlleSpätenWichtelSenden (Nachricht)
{
    Datenbankverwaltung.WichtelOhneVerschicktesPaket( function (Reihen)
        {
            let Nutzerliste = [];

            for (let Nutzer of Reihen)
                Nutzerliste.push(Nutzerverwaltung.VonId(Nutzer.Id));

            NachrichtSendenUndBestätigen(Nachricht, Nutzerliste);
        }
    );
}
exports.NachrichtAnAlleSpätenWichtelSenden = NachrichtAnAlleSpätenWichtelSenden;

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
