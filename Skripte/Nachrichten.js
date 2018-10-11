const Config = require('../Config/Config.json');
const Texte = require('../Config/Texte.json');

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
    if (Nachricht.content == Config.Anmeldebefehl)
        Nachricht.author.send(Texte.Begruessung);
}