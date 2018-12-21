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
};

/**
 * Schließt alle Datenbankverbindungen.
 */
exports.Schließen = function ()
{
    try
    {
        DatenbankWichteln.close();
        DatenbankLog.close();
    }
    catch (Fehler)
    {
        console.error(Fehler);
    }
};

/**
 * Speichert einen Nutzer in der Datenbank.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
exports.NutzerSpeichern = function (Nutzer)
{
    Nutzer.Zeit = AktuelleUnixzeit();

    //Nutzer in der Datenbank abspeichern:
    DatenbankWichteln.run(
        'INSERT INTO Nutzer (Id, Discord, Name, Nickname, Zeit, Zustand) VALUES (?, ?, ?, ?, ?, ?)',
        Nutzer.Id,
        Nutzer.Discord,
        Nutzer.Name,
        Nutzer.Nickname,
        Nutzer.Zeit,
        Nutzer.Zustand,
        Fehlerbehandlung
    );

    //Leere Nutzerdaten in der Tabelle anlegen:
    DatenbankWichteln.run(
        'INSERT INTO Informationen (NutzerId, Zeit) VALUES (?, ?)',
        Nutzer.Id,
        AktuelleUnixzeit(),
        Fehlerbehandlung
    );
};

/**
 * Aktualisiert einen Nutzer in der Datenbank.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
exports.NutzerAktualisieren = function (Nutzer)
{
    Nutzer.Zeit = AktuelleUnixzeit();

    //Nutzer aktualisieren:
    DatenbankWichteln.run(
        'UPDATE Nutzer SET Discord = ?, Name = ?, Nickname = ?, Zeit = ?, Zustand = ? WHERE Id = ?',
        Nutzer.Discord,
        Nutzer.Name,
        Nutzer.Nickname,
        Nutzer.Zeit,
        Nutzer.Zustand,
        Nutzer.Id,
        Fehlerbehandlung
    );

    //Nutzerdaten zum Wichteln aktualisieren:
    DatenbankWichteln.run(
        `UPDATE Informationen SET
            Zeit = ?, AnalogDigitalSelbst = ?, AnalogDigitalWichtel = ?, Anschrift = ?, Land = ?, Steam = ?, International = ?,
            Wunschliste = ?, Allergien = ?, AusschlussGeschenk = ?, AusschlussWichtel = ?, Freitext = ?
        WHERE NutzerId = ?`,
        AktuelleUnixzeit(),
        Nutzer.AnalogDigitalSelbst,
        Nutzer.AnalogDigitalWichtel,
        Nutzer.Anschrift,
        Nutzer.Land,
        Nutzer.Steam,
        Nutzer.International,
        Nutzer.Wunschliste,
        Nutzer.Allergien,
        Nutzer.AusschlussGeschenk,
        Nutzer.AusschlussWichtel,
        Nutzer.Freitext,
        Nutzer.Id,
        Fehlerbehandlung
    );
};

/**
 * Lädt einen Nutzer aus der Datenbank.
 * @param {Number} NutzerId Die Discord-ID des Nutzers.
 * @param {Function} Callback Callback, der nach dem Laden des Nutzers ausgeführt wird. Parameter: {Object} Reihe.
 */
exports.NutzerLaden = function (NutzerId, Callback)
{
    DatenbankWichteln.get(
        'SELECT * FROM Nutzer WHERE Id = ?',
        NutzerId,
        function (Fehler, Reihe)
        {
            Fehlerbehandlung(Fehler);
            Callback(Reihe);
        }
    );
};

/**
 * Lädt alle Nutzer aus der Datenbank.
 * @param {Function} Callback Callback, der für jeden gefundenen Nutzer ausgeführt wird. Parameter: {Object} Reihe.
 */
exports.AlleNutzerLaden = function (Callback)
{
    DatenbankWichteln.each(
        `SELECT Nutzer.*, Informationen.*, Wichtelkinder.WichtelId AS WichtelkindId, Wichtelpaten.NutzerId AS WichtelpateId FROM Nutzer
         LEFT JOIN Informationen ON Nutzer.Id = Informationen.NutzerId
         LEFT JOIN Wichtel AS Wichtelkinder ON Nutzer.Id = Wichtelkinder.NutzerId
         LEFT JOIN Wichtel AS Wichtelpaten ON Nutzer.Id = Wichtelpaten.WichtelId`,
        function (Fehler, Reihe)
        {
            Fehlerbehandlung(Fehler);
            Callback(Reihe);
        }
    );
};

/**
 * Ermittelt die relevanten Nutzerzahlen: Gesamtzahl, Teilnehmer; abzüglich Mods.
 * @param {Function} Callback Callback, der nach dem Erhalt des Ergebnisses ausgeführt wird. Parameter: {Object} Reihe.
 */
exports.Nutzerzahlen = function (Callback)
{
    DatenbankWichteln.get(
        `SELECT
            COUNT(*) AS Gesamt,
            SUM(CASE WHEN Zustand = 'Teilnehmer' THEN 1 ELSE 0 END) AS Teilnehmer
        FROM Nutzer
        WHERE Id NOT IN (SELECT NutzerId FROM Mods)`,
        function (Fehler, Reihe)
        {
            Fehlerbehandlung(Fehler);
            Callback(Reihe);
        }
    );
};

/**
 * Liest alle eingetragenen Ausschlüsse aus der Datenbank.
 * @param {Number} NutzerId Die Discord-ID des Nutzers.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 */
exports.Ausschlüsse = function (NutzerId, Callback)
{
    DatenbankWichteln.all(
        'SELECT * FROM Ausschluesse WHERE NutzerId = ? ORDER BY Zeit',
        NutzerId,
        function (Fehler, Reihen)
        {
            Fehlerbehandlung(Fehler);

            if (Fehler)
                Reihen = [];

            Callback(Reihen);
        }
    );
};

/**
 * Liest alle Steamnamen aus der Datenbank.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 */
exports.Steamnamen = function (Callback)
{
    DatenbankWichteln.all(
        "SELECT Steam FROM Informationen WHERE AnalogDigitalSelbst != 'analog'",
        function (Fehler, Reihen)
        {
            Fehlerbehandlung(Fehler);

            if (Fehler)
                Reihen = [];

            Callback(Reihen);
        }
    );
};

/**
 * Liest alle Wichtel auf, die noch kein Paket verschickt haben.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 */
exports.WichtelOhneVerschicktesPaket = function (Callback)
{
    DatenbankWichteln.all(
        `SELECT Id
         FROM Nutzer
         WHERE Id NOT IN (SELECT SenderId FROM Pakete)`,
        function (Fehler, Reihen)
        {
            Fehlerbehandlung(Fehler);

            if (Fehler)
                Reihen = [];

            Callback(Reihen);
        }
    );
};

/**
 * Trägt eine Liste an Nutzer-Wichtel-Zuordnungen in die Datenbank ein.
 * @param {Array} Zuordnungen Eine Liste von Objekten mit .Nutzer.Id und .Wichtel.Id.
 * @param {Function} Callback Callback, der nach dem Eintragen der Wichtel ausgeführt wird.
 */
exports.WichtelEintragen = function (Zuordnungen, Callback)
{
    let Transaktion = NeueTransaktion(DatenbankWichteln.Name);

    let Vorgang = Transaktion.prepare("INSERT INTO Wichtel (NutzerId, WichtelId) VALUES (?, ?)", Transaktion.Fehlerbehandlung);

    for (let Zuordnung of Zuordnungen)
        Vorgang.run(Zuordnung.Nutzer.Id, Zuordnung.Wichtel.Id, Transaktion.Fehlerbehandlung);

    Vorgang.finalize(function ()
        {
            Callback(Transaktion.Schließen());
        }
    );
};

/**
 * Setzt den Status einer Liste von Nutzern (Teilnehmern) auf "Wichtel".
 * @param {Array} Teilnehmerliste Eine Liste von Nutzer-IDs, dessen Status zu "Wichtel" geändert werden soll.
 * @param {Function} Callback Callback, der nach dem Eintragen der Wichtel ausgeführt wird.
 */
exports.TeilnehmerZuWichtelnMachen = function (Teilnehmerliste, Callback)
{
    let Transaktion = NeueTransaktion(DatenbankWichteln.Name);

    let Vorgang = Transaktion.prepare("UPDATE Nutzer SET Zustand = 'Wartend' WHERE Id = ?", Transaktion.Fehlerbehandlung);

    for (let TeilnehmerId of Teilnehmerliste)
        Vorgang.run(TeilnehmerId, Transaktion.Fehlerbehandlung);

    Vorgang.finalize(function ()
        {
            Callback(Transaktion.Schließen());
        }
    );
};

/**
 * Legt ein Paket in der Datenbank an.
 * @param {String} SenderId Die ID des Senders, also des Wichtels, der das Paket abgeschickt hat.
 * @param {String} EmpfängerId Die ID des Empfängerwichtels.
 * @param {Function} Callback Callback, der nach dem Erstellen des Pakets ausgeführt wird.
 */
exports.PaketAnlegen = function (SenderId, EmpfängerId, Callback)
{
    DatenbankWichteln.run(
        'INSERT INTO Pakete (SenderId, EmpfaengerId) VALUES (?, ?)',
        SenderId,
        EmpfängerId,
        function (Fehler)
        {
            Fehlerbehandlung(Fehler);
            Callback();
        }
    );
};

/**
 * Aktualisiert ein Paket in der Datenbank anhand des Senderempfängerpaares.
 * @param {String} SenderId Die ID des Senders, also des Wichtels, der das Paket abgeschickt hat.
 * @param {String} EmpfängerId Die ID des Empfängerwichtels.
 * @param {Object} Daten Ein Objekt, das mindestens eines der folgenden Daten als Eigenschaft enthält: Sendungsnummer, Sendedatum, Empfangsdatum.
 * @param {Function} Callback Callback, der nach dem Aktualisieren des Pakets ausgeführt wird.
 */
exports.PaketAktualisieren = function (SenderId, EmpfängerId, Daten, Callback)
{
    let Parameterliste = [SenderId, EmpfängerId];
    let Änderungsliste = '';

    for (let Eigenschaft in Daten) //Nur gültig für die Eigenschaften Sendungsnummer, Sendedatum und Empfangsdatum!
    {
        if (Änderungsliste != '')
            Änderungsliste += ', ';

        Parameterliste.push(Daten[Eigenschaft]);

        Änderungsliste += Eigenschaft + ' = ?' + Parameterliste.length; //Arrays starten in SQLite bei 1, demnach ergibt length den Index.
    }

    DatenbankWichteln.run(
        'UPDATE Pakete SET ' + Änderungsliste + ' WHERE SenderId = ?1 AND EmpfaengerId = ?2',
        Parameterliste,
        function (Fehler)
        {
            Fehlerbehandlung(Fehler);
            Callback(!Fehler);
        }
    );
};

/**
 * Loggt die Eingabe eines Nutzers.
 * @param {String} NutzerId Die Discord-ID des Nutzers.
 * @param {String} Name Der Discordname des Nutzers.
 * @param {String} Eingabe Die Eingabe des Nutzers.
 * @param {String} KanalId OPTIONAL Die Id des Kanals. Wenn eine direkte Nachricht, dann undefined.
 */
exports.Log = function (NutzerId, Name, Eingabe, KanalId)
{
    DatenbankLog.run(
        'INSERT INTO Log (NutzerId, Name, KanalId, Eingabe, Zeit) VALUES (?, ?, ?, ?, ?)',
        NutzerId,
        Name,
        KanalId,
        Eingabe,
        AktuelleUnixzeit()
    );
};

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

    Datenbank.Name = Name;

    return Datenbank;
}

/**
 * Erzeugt eine neue Transaktion.
 * @param {String} Name Name der Datenbankdatei.
 * @returns {Object} Das Objekt der Transaktion.
 */
function NeueTransaktion (Name)
{
    let Transaktion = VerbindeMitDatenbank(Name);

    Transaktion.Fehlersammlung = false;

    Transaktion.Fehlerbehandlung = function (Fehler)
    {
        Transaktion.Fehlersammlung = Transaktion.Fehlersammlung && Fehler;
        Fehlerbehandlung(Fehler);
    };

    /**
     * Schließt die Transaktion und beendet die Datenbankverbindung.
     * @returns {Boolean} True wenn erfolgreich, false wenn nicht.
     */
    Transaktion.Schließen = function ()
    {
        if (Transaktion.Fehlersammlung)
            Transaktion.run('ROLLBACK;');
        else
            Transaktion.run('COMMIT;');

        Transaktion.close();

        return !Transaktion.Fehlersammlung;
    };

    Transaktion.run('BEGIN;');

    return Transaktion;
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

/**
 * Gibt die aktuelle Unixzeit zurück.
 * @returns {Number} Die aktuelle Unixzeit in Sekunden.
 */
function AktuelleUnixzeit ()
{
    return Math.floor(new Date() / 1000);
}