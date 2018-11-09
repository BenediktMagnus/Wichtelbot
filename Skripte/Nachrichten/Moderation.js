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
 * Entfernt eine Nachricht aus dem öffentlichen Wichtelkanal anhand seiner Id.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtEntfernen (Nachricht)
{
    let NachrichtenId = Nachricht.Parameter.replace(/[^\/\d]/g,''); //Entfernt alles außer Zahlen.

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