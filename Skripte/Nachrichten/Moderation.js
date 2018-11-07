/**
 * Die Basiskonfiguration.
 */
const Config = require('../../Config/Config.json');

var Nutzerverwaltung;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert das Moderationsmodul der Nachrichtenverarbeitung.
 * @param {Object} Nutzerbibliothek
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Nutzerbibliothek, NeuerKlient)
{
    Nutzerverwaltung = Nutzerbibliothek;
    Klient = NeuerKlient;
};

/**
 * Sendet eine Nachricht an den öffentlichen Wichtelkanal.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function NachrichtAnKanalSenden (Nachricht)
{
    Klient.channels.get(Config.KanalIdWichteln).send(Nachricht.content);
}
exports.NachrichtAnKanalSenden = NachrichtAnKanalSenden;

/**
 * Entfernt eine Nachricht aus dem öffentlichen Wichtelkanal anhand seiner Id.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function EntferneNachricht (Nachricht)
{
    let NachrichtenId = Nachricht.content.replace(/[^\/\d]/g,''); //Entfernt alles außer Zahlen.

    Klient.channels.get(Config.KanalIdWichteln).delete(NachrichtenId);
}
exports.EntferneNachricht = EntferneNachricht;