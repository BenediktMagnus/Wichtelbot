/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../Config/Texte.json');
/**
 * Eine Sammlung aller für den Bot verfügbaren Befehle.
 */
const Befehle = require('../Config/Befehle.json');

const Zustaende = {
    Nichts: undefined,
    Registrierung: 1,
    AnalogDigitalSelbst: 2,
    AnalogDigitalWichtel: 3,
    Anschrift: 4,
    Steam: 5,
    International: 6,
    Wunschliste: 7,
    Links: 8,
    Allergien: 9,
    AusschlussGeschenk: 10,
    AusschlussWichtel: 11,
    Freitext: 12
}

// NutzerId, Zeit, AnalogDigitalSelbst, AnalogDigitalWichtel, Anschrift, Land, Steam, International,
// Wunschliste, Links, Allergien, AusschlussGeschenk, AusschlussWichtel, Freitext

/**
 * Eine Zuordnungsliste aller bekannten Nutzer und ihrer derzeitigen Unterhaltungszustände.
 */
var Nutzerliste;

/**
 * Initialisiert die Nachrichtenverarbeitung.
 */
exports.Initialisieren = function ()
{
    Nutzerliste = new Map();
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

    if (Nachricht.channel.type == 'dm')
    {
        switch (Nachricht.content.toLowerCase())
        {
            case Befehle.Registrieren:
                Registrieren(Nachricht);
                break;
            default: 
                if (!NachrichtMitZustandVerarbeiten(Nachricht))
                    Nachricht.reply(Texte.NichtVerstanden);
        }
    }
    else
    {
        if (Nachricht.content == Befehle.Kontaktaufnahme)
        {
            Nachricht.author.send(Texte.Begruessung);
        }
    }
}

/**
 * Verarbeitet Nachrichten, die während eines bestimmten Zustandes relevant sind.
 * @param {Object} Nachricht Das vom Discordbot übergebene Nachrichtenobjekt.
 * @returns {Boolean} True, wenn verarbeitet, false, wenn unbehandelt.
 */
function NachrichtMitZustandVerarbeiten (Nachricht)
{
    if (!Nutzerliste.has(Nachricht.author.id))
        return false;

    let Nutzer = Nutzerliste.get(Nachricht.author.id);

    switch (Nutzer.Zustand)
    {
        case Zustaende.Registrierung:
            break;
        default:
            return false;
    }

    //Wenn hier angelangt, wurde einer der Fälle durchlaufen, womit die Verarbeitung durchlaufen ist.
    return true;
}

/**
 * Startet den Registrierungsprozess.
 * @param {Object} Nachricht Das vom Discordbot übergebene Nachrichtenobjekt.
 */
function Registrieren (Nachricht)
{
    let Nutzer = {
        Id: Nachricht.author.id,
        Zustand: Zustaende.Registrierung
    };

    Nutzerliste.set(Nutzer.Id, Nutzer);

    Nachricht.reply(Texte.Registriert);
}