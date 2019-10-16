import * as fs from 'fs';

import Sqlite = require('better-sqlite3');

import Contact from './classes/contact';
import Information from './classes/information';
import Member from './classes/member';

export default class Database
{

    protected static readonly defaultMainFileName = 'main';
    protected static readonly defaultLogFileName = 'log';

    protected readonly dataPath = './data/';

    /**
     * The main database containing all important tables.
     */
    protected mainDatabase: Sqlite.Database;

    /**
     * The log database containing all access logs.
     */
    protected logDatabase: Sqlite.Database;

    /**
     * Initialises the database connectiones.
     */
    constructor (mainFileName = Database.defaultMainFileName, logFileName = Database.defaultLogFileName, inMemory = false)
    {
        this.mainDatabase = this.openOrCreateDatabase(mainFileName, Database.defaultMainFileName, inMemory);
        this.logDatabase = this.openOrCreateDatabase(logFileName, Database.defaultLogFileName, inMemory);
    }

    protected openOrCreateDatabase (databaseName: string, describerFileName: string, inMemory: boolean): Sqlite.Database
    {
        const databaseFilePath = this.dataPath + databaseName + '.sqlite';

        const fileCreated = !fs.existsSync(databaseFilePath);

        const options: Sqlite.Options = {
            memory: inMemory
        };

        const database = Sqlite(databaseFilePath, options);

        // WAL journal mode for better performance:
        database.pragma('journal_mode = WAL');
        // We want save data, so full synchronous:
        database.pragma('synchronous = FULL');

        if (fileCreated || inMemory)
        {
            const databaseDescriberFilePath = this.dataPath + describerFileName + '.sql';

            const sql = fs.readFileSync(databaseDescriberFilePath, 'utf8');

            try
            {
                database.exec(sql);
            }
            catch (error)
            {
                // If an error has occured here, something went wrong with the
                // sql statement. We then have to close the connection and
                // delete the file to prevent that we accidently reopen it and
                // assume it to be ready to use.
                // Because this only can happen if we created the file ourselves
                // a couple of milliseconds ago, a deletion means no data loss.

                database.close();

                if (fs.existsSync(databaseFilePath))
                {
                    fs.unlinkSync(databaseFilePath);
                }

                throw error;
            }
        }
        else
        {
            // If this is an old file, call vaccuum to defragment the database file:
            database.exec('VACUUM;');
        }

        // One call to optimise after each closed database connection
        // is recommended, so we do it before we open one:
        database.pragma('optimize');

        return database;
    }

    protected getCurrentUnixTime (): number
    {
        return Math.floor(new Date().getTime() / 1000);
    }

    /**
     * Copies all bindable properties from an object, returning a bindable object
     * that can be used as binding parameters when running SQLite statements.
     */
    protected getBindablesFromObject (object: any): any
    {
        // Objects can contain data that is not bindable for SQLite, for
        // example constructors, methods etc.
        // This spread operator shallow copies all properties from the object
        // into an empty one, leaving the methods alone.
        const bindableObject = { ...object };

        return bindableObject;
    }

    /**
     * Closes all database connections.
     */
    public close (): void
    {
        // This process must be save because it will be called when the programme
        // is terminated. Therefor we must be sure to not throw any errors.

        try
        {
            this.mainDatabase.close();
        }
        catch (error)
        {
            console.error(error);
        }

        try
        {
            this.logDatabase.close();
        }
        catch (error)
        {
            console.error(error);
        }
    }

    /**
     * Logs user input (messages from contacts).
     * @param contactId The contact's Discord ID.
     * @param name The contact's name, used for easy identification by humans.
     * @param message The message send by the contact.
     * @param [channelId=null] The channel ID; if null, the message was a direct message.
     */
    public log (contactId: string, name: string, message: string, channelId: string|null = null): Sqlite.RunResult
    {
        const statement = this.logDatabase.prepare('INSERT INTO Log (contactId, name, channelId, message, timestamp) VALUES (?, ?, ?, ?, ?)');

        const result = statement.run(
            contactId,
            name,
            channelId,
            message,
            this.getCurrentUnixTime()
        );

        return result;
    }

    public hasContact (contactId: string): boolean
    {
        const statement = this.mainDatabase.prepare(
            `SELECT
                CASE
                    WHEN EXISTS
                        (SELECT 1 FROM contact WHERE id = ? LIMIT 1)
                    THEN 1
                    ELSE 0
                END`
        );

        // Will make the get method to return the value of the first column
        // instead of an object for all columns. Since we only want one value
        // this makes it much easier:
        statement.pluck(true);

        const result = statement.get(contactId);

        return result;
    }

    /**
     * NOTE: The contact objects's lastUpdateTime will be updated.
     */
    public saveContact (contact: Contact): void
    {
        const statement = this.mainDatabase.prepare(
            `INSERT INTO
                contact (id, discordName, name, nickname, lastUpdateTime, type, state)
            VALUES
                (:id, :discordName, :name, :nickname, :lastUpdateTime, :type, :state)`
        );

        contact.lastUpdateTime = this.getCurrentUnixTime();

        statement.run(
            this.getBindablesFromObject(contact)
        );
    }

    public getContact (contactId: string): Contact
    {
        const statement = this.mainDatabase.prepare(
            'SELECT * FROM contact WHERE id = ?'
        );

        const result = statement.get(contactId);

        const contact = Contact.fromContactData(result);

        return contact;
    }

    /**
     * NOTE: The contact objects's lastUpdateTime will be updated.
     */
    public updateContact (contact: Contact): void
    {
        contact.lastUpdateTime = this.getCurrentUnixTime();

        const statement = this.mainDatabase.prepare(
            `UPDATE
                contact
            SET
                discordName = :discordName, name = :name, nickname = :nickname,
                lastUpdateTime = :lastUpdateTime, type = :type, state = :state
            WHERE
                id = :id`
        );

        statement.run(
            this.getBindablesFromObject(contact)
        );
    }

    /**
     * Saves a member in the database by saving its information and updating the contact. \
     * NOTE: The member and the information objects' lastUpdateTime will be updated.
     */
    public saveMember (member: Member): void
    {
        member.lastUpdateTime = this.getCurrentUnixTime();
        member.information.lastUpdateTime = member.lastUpdateTime;

        // When saving a member, the contact data still exists and only needs to be updated:
        const contactStatement = this.mainDatabase.prepare(
            `UPDATE
                contact
            SET
                discordName = :discordName, name = :name, nickname = :nickname,
                lastUpdateTime = :lastUpdateTime, type = :type, state = :state
            WHERE
                id = :id`
        );

        // THe information data must nevertheless be created because the former contact had no information.
        const informationStatement = this.mainDatabase.prepare(
            `INSERT INTO
                information (contactId, lastUpdateTime, giftTypeAsTaker, giftTypeAsGiver, address, country,
                             steamName, international, wishList, allergies, giftExclusion, userExclusion, freeText)
            VALUES
                (:contactId, :lastUpdateTime, :giftTypeAsTaker, :giftTypeAsGiver, :address, :country,
                 :steamName, :international, :wishList, :allergies, :giftExclusion, :userExclusion, :freeText)`
        );

        const runTransaction = this.mainDatabase.transaction(
            () => {
                contactStatement.run(
                    this.getBindablesFromObject(member)
                );
                informationStatement.run(
                    this.getBindablesFromObject(member.information)
                );
            }
        );

        runTransaction();
    }

    public getMember (contactId: string): Member
    {
        const contactStatement = this.mainDatabase.prepare(
            'SELECT * FROM contact WHERE id = ?'
        );

        const informationStatement = this.mainDatabase.prepare(
            'SELECT * FROM information WHERE contactId = ?'
        );

        const getTransactionResult = this.mainDatabase.transaction(
            (): Member => {
                const memberResult = contactStatement.get(contactId);
                const member = Member.fromMemberData(memberResult);

                const informationResult = informationStatement.get(contactId);
                member.information = Information.fromInformationData(informationResult);

                return member;
            }
        );

        const member = getTransactionResult();

        return member;
    }

    /**
     * Updates an existing member (contact and information data) in the database. \
     * NOTE: The contact and the information objects' lastUpdateTime will be updated.
     */
    public updateMember (member: Member): void
    {
        member.lastUpdateTime = this.getCurrentUnixTime();
        member.information.lastUpdateTime = member.lastUpdateTime;

        const contactStatement = this.mainDatabase.prepare(
            `UPDATE
                contact
            SET
                discordName = :discordName, name = :name, nickname = :nickname,
                lastUpdateTime = :lastUpdateTime, type = :type, state = :state
            WHERE
                id = :id`
        );

        const informationStatement = this.mainDatabase.prepare(
            `UPDATE
                information
            SET
                lastUpdateTime = :lastUpdateTime, giftTypeAsTaker = :giftTypeAsTaker,
                giftTypeAsGiver = :giftTypeAsGiver, address = :address, country = :country,
                steamName = :steamName, international = :international, wishList = :wishList,
                allergies = :allergies, giftExclusion = :giftExclusion,
                userExclusion = :userExclusion, freeText = :freeText
            WHERE
                contactId = :contactId`
        );

        const runTransaction = this.mainDatabase.transaction(
            () => {
                contactStatement.run(
                    this.getBindablesFromObject(member)
                );
                informationStatement.run(
                    this.getBindablesFromObject(member.information)
                );
            }
        );

        runTransaction();
    }
}

/*

/**
 * Lädt alle Nutzer aus der Datenbank.
 * @param {Function} Callback Callback, der für jeden gefundenen Nutzer ausgeführt wird. Parameter: {Object} Reihe.
 * /
export function AlleNutzerLaden (Callback)
{
    mainDatabase.each(
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
}

/**
 * Ermittelt die relevanten Nutzerzahlen: Gesamtzahl, Teilnehmer; abzüglich Mods.
 * @param {Function} Callback Callback, der nach dem Erhalt des Ergebnisses ausgeführt wird. Parameter: {Object} Reihe.
 * /
export function Nutzerzahlen (Callback)
{
    mainDatabase.get(
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
}

/**
 * Liest alle eingetragenen Ausschlüsse aus der Datenbank.
 * @param {Number} NutzerId Die Discord-ID des Nutzers.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 * /
export function Ausschlüsse (NutzerId, Callback)
{
    mainDatabase.all(
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
}

/**
 * Liest alle Steamnamen aus der Datenbank.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 * /
export function Steamnamen (Callback)
{
    mainDatabase.all(
        "SELECT Steam FROM Informationen WHERE AnalogDigitalSelbst != 'analog'",
        function (Fehler, Reihen)
        {
            Fehlerbehandlung(Fehler);

            if (Fehler)
                Reihen = [];

            Callback(Reihen);
        }
    );
}

/**
 * Liest alle Wichtel auf, die noch kein Paket verschickt haben.
 * @param {Function} Callback Callback, der nach dem Laden der Ausschlüsse ausgeführt wird. Parameter: {Array} Ausschlusswichtel.
 * /
export function WichtelOhneVerschicktesPaket (Callback)
{
    mainDatabase.all(
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
}

/**
 * Trägt eine Liste an Nutzer-Wichtel-Zuordnungen in die Datenbank ein.
 * @param {Array} Zuordnungen Eine Liste von Objekten mit .Nutzer.Id und .Wichtel.Id.
 * @param {Function} Callback Callback, der nach dem Eintragen der Wichtel ausgeführt wird.
 * /
export function WichtelEintragen (Zuordnungen, Callback)
{
    let Transaktion = NeueTransaktion(mainDatabase.Name);

    let Vorgang = Transaktion.prepare("INSERT INTO Wichtel (NutzerId, WichtelId) VALUES (?, ?)", Transaktion.Fehlerbehandlung);

    for (let Zuordnung of Zuordnungen)
        Vorgang.run(Zuordnung.Nutzer.Id, Zuordnung.Wichtel.Id, Transaktion.Fehlerbehandlung);

    Vorgang.finalize(function ()
        {
            Callback(Transaktion.Schließen());
        }
    );
}

/**
 * Setzt den Status einer Liste von Nutzern (Teilnehmern) auf "Wichtel".
 * @param {Array} Teilnehmerliste Eine Liste von Nutzer-IDs, dessen Status zu "Wichtel" geändert werden soll.
 * @param {Function} Callback Callback, der nach dem Eintragen der Wichtel ausgeführt wird.
 * /
export function TeilnehmerZuWichtelnMachen (Teilnehmerliste, Callback)
{
    let Transaktion = NeueTransaktion(mainDatabase.Name);

    let Vorgang = Transaktion.prepare("UPDATE Nutzer SET Zustand = 'Wartend' WHERE Id = ?", Transaktion.Fehlerbehandlung);

    for (let TeilnehmerId of Teilnehmerliste)
        Vorgang.run(TeilnehmerId, Transaktion.Fehlerbehandlung);

    Vorgang.finalize(function ()
        {
            Callback(Transaktion.Schließen());
        }
    );
}

/**
 * Legt ein Paket in der Datenbank an.
 * @param {String} SenderId Die ID des Senders, also des Wichtels, der das Paket abgeschickt hat.
 * @param {String} EmpfängerId Die ID des Empfängerwichtels.
 * @param {Function} Callback Callback, der nach dem Erstellen des Pakets ausgeführt wird.
 * /
export function PaketAnlegen (SenderId, EmpfängerId, Callback)
{
    mainDatabase.run(
        'INSERT INTO Pakete (SenderId, EmpfaengerId) VALUES (?, ?)',
        SenderId,
        EmpfängerId,
        function (Fehler)
        {
            Fehlerbehandlung(Fehler);
            Callback();
        }
    );
}

/**
 * Aktualisiert ein Paket in der Datenbank anhand des Senderempfängerpaares.
 * @param {String} SenderId Die ID des Senders, also des Wichtels, der das Paket abgeschickt hat.
 * @param {String} EmpfängerId Die ID des Empfängerwichtels.
 * @param {Object} Daten Ein Objekt, das mindestens eines der folgenden Daten als Eigenschaft enthält: Sendungsnummer, Sendedatum, Empfangsdatum.
 * @param {Function} Callback Callback, der nach dem Aktualisieren des Pakets ausgeführt wird.
 * /
export function PaketAktualisieren (SenderId, EmpfängerId, Daten, Callback)
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

    mainDatabase.run(
        'UPDATE Pakete SET ' + Änderungsliste + ' WHERE SenderId = ?1 AND EmpfaengerId = ?2',
        Parameterliste,
        function (Fehler)
        {
            Fehlerbehandlung(Fehler);
            Callback(!Fehler);
        }
    );
}

*/
