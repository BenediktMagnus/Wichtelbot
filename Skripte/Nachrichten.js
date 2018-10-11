const Texte = require('../Config/Texte.json');
const Befehle = require('../Config/Befehle.json');

/**
 * Initialisiert die Nachrichtenverarbeitung.
 */
exports.Initialisieren = function ()
{

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
            default: Nachricht.reply(Texte.NichtVerstanden);
        }
    }
    else
    {
        if (Nachricht.content == Befehle.Kontaktaufnahme)
            Nachricht.author.send(Texte.Begruessung);
    }
}

function Registrieren (Nachricht)
{
    Nachricht.reply(Texte.Registriert);
}