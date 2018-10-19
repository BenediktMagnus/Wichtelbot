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
 * Loggt die Eingabe eines Nutzers.
 * @param {Number} NutzerId Die Discord-ID des Nutzers.
 * @param {String} Name Der Discordname des Nutzers.
 * @param {String} Eingabe Die Eingabe des Nutzers.
 */
exports.Log = function (NutzerId, Name, Eingabe)
{
    DatenbankLog.run('INSERT INTO Log (NutzerId, Name, Eingabe, Zeit) VALUES (?, ?, ?, ?)',
                     NutzerId,
                     Name,
                     Eingabe,
                     Math.floor(new Date() / 1000)
    );
}

/**
 * Erzeugt eine neue Datenbankverbindung.
 * @param {String} Name Name der Datenbankdatei.
 * @returns {Object} Das Objekt der Datenbankverbindung.
 */
function VerbindeMitDatenbank (Name)
{
    let Datenbank = new SQLite.Database('./Daten/' + Name + '.sqlite', SQLite.OPEN_READWRITE, (Fehler) =>
        {
            if (Fehler) console.error(Fehler);
        }
    );

    //Versetzt die Datenbank in den seriellen Modus, sodass Datenbankabfragen immer nacheinander abgearbeitet werden anstatt gleichzeitig:
    Datenbank.serialize();

    return Datenbank;
}

/**
 * Behandelt auftretende Fehler.
 * @param {String} Fehler Der Fehlertext, den die Datenbank zurückgibt.
 */
function Fehlerbehandlung (Fehler)
{
    if (Fehler)
        console.error(Fehler);
}