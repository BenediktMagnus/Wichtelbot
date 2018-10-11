const SQLite = require('sqlite3');

/**
 * Die Datenbank mit allen Tabellen rund um das Wichteln.
 */
const DatenbankWichteln = null;
/**
 * Die Datenbank mit einer Tabelle als Zugriffslog auf den Bot.
 */
const DatenbankLog = null;

/**
 * Initialisiert die Datenbankverbindungen.
 */
exports.Initialisieren = function ()
{
    DatenbankWichteln = VerbindeMitDatenbank('wichteln');
    DatenbankLog = VerbindeMitDatenbank('log');
}

/**
 * Erzeugt eine neue Datenbankverbindung.
 * @param {String} Name Name der Datenbankdatei.
 * @returns {Object} Das Objekt der Datenbankverbindung.
 */
function VerbindeMitDatenbank (Name)
{
    return new SQLite.Database('./daten/' + Name + '.sqlite', (Fehler) =>
    {
        if (Fehler) console.error(Fehler);
    }
);
}