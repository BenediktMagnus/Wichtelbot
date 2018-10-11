const SQLite = require('sqlite3');

/**
 * Die Datenbank mit allen Tabellen rund um das Wichteln.
 */
var DatenbankWichteln = null;
/**
 * Die Datenbank mit einer Tabelle als Zugriffslog auf den Bot.
 */
var DatenbankLog = null;

/**
 * Initialisiert die Datenbankverbindungen.
 */
exports.Initialisieren = function ()
{
    DatenbankWichteln = VerbindeMitDatenbank('Wichteln');
    DatenbankLog = VerbindeMitDatenbank('Log');
}

/**
 * Erzeugt eine neue Datenbankverbindung.
 * @param {String} Name Name der Datenbankdatei.
 * @returns {Object} Das Objekt der Datenbankverbindung.
 */
function VerbindeMitDatenbank (Name)
{
    let Datenbank = new SQLite.Database('./daten/' + Name + '.sqlite', SQLite.OPEN_READWRITE, (Fehler) =>
        {
            if (Fehler) console.error(Fehler);
        }
    );

    //Versetzt die Datenbank in den seriellen Modus, sodass Datenbankabfragen immer nacheinander abgearbeitet werden anstatt gleichzeitig:
    Datenbank.serialize();

    return Datenbank;
}