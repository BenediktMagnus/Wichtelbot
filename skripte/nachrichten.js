const Config = require('../config/config.json');

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
        Nachricht.author.send('Hallo!');
}