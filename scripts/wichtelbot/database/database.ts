import * as fs from 'fs';
import Contact, { ContactCoreData, ContactData } from '../classes/contact';
import { Exclusion, ExclusionData } from '../classes/exclusion';
import { Relationship, RelationshipData } from '../classes/relationship';
import Config from '../../utility/config';
import ContactType from '../types/contactType';
import GiftType from '../types/giftType';
import { GiftTypeStatistics } from './giftTypeStatistics';
import { InformationData } from '../classes/information';
import Member from '../classes/member';
import { ParcelStatistics } from './parcelStatistics';
import Sqlite from 'better-sqlite3';
import { State } from '../endpoint/definitions';
import Utils from '../../utility/utils';
import Wichtel from '../classes/wichtel';

const mainDescriberFileName = 'main';
const logDesriberFileName = 'log';
type DatabaseDescriberFileName = typeof mainDescriberFileName | typeof logDesriberFileName;

export default class Database
{
    protected readonly dataPath = './data/';

    private readonly databaseVersion = {
        [mainDescriberFileName]: 1,
        [logDesriberFileName]: 0,
    };

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
    constructor (mainFileName: string, logFileName: string, inMemory = false)
    {
        this.mainDatabase = this.openOrCreateDatabase(mainFileName, mainDescriberFileName, inMemory);
        this.logDatabase = this.openOrCreateDatabase(logFileName, logDesriberFileName, inMemory);
    }

    protected openOrCreateDatabase (databaseName: string, describerFileName: DatabaseDescriberFileName, inMemory: boolean): Sqlite.Database
    {
        const databaseFilePath = inMemory ? ':memory:' : this.dataPath + databaseName + '.sqlite';

        const fileCreated = inMemory || !fs.existsSync(databaseFilePath);

        const database = Sqlite(databaseFilePath);

        // WAL journal mode for better performance:
        database.pragma('journal_mode = WAL');
        // We want save data, so full synchronous:
        database.pragma('synchronous = FULL');
        // Enable foreign key constraints:
        database.pragma('foreign_keys = ON');

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

                if (!inMemory && fs.existsSync(databaseFilePath))
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

            // Update the database if necessary:
            this.updateDatabase(database, describerFileName);
        }

        // One call to optimise after each closed database connection
        // is recommended, so we do it before we open one:
        database.pragma('optimize');

        return database;
    }

    /**
     * Updates the database to the current version.
     * @param database
     */
    private updateDatabase (database: Sqlite.Database, describerFileName: DatabaseDescriberFileName): void
    {
        let version = database.pragma('user_version', { simple: true }) as number;

        while (version < this.databaseVersion[describerFileName])
        {
            // NOTE: The version is updated first because the update always contains the number in the name to which it is updated.
            version++;

            const sql = fs.readFileSync(this.dataPath + `updates/update-${describerFileName}-${version}.sql`, 'utf8');

            database.exec(sql);

            // Update the database version:
            // NOTE: It is recommended to update the database version after each step so that in case of an update error
            //       the wrong version is not left in the database.
            database.pragma(`user_version = ${version}`);
        }
    }

    /**
     * Copies all bindable properties from an object, returning a bindable object
     * that can be used as binding parameters when running SQLite statements.
     */
    private getBindablesFromObject<TObject extends object> (object: TObject): TObject
    {
        // Objects can contain data that is not bindable for SQLite, for
        // example constructors, methods etc.
        // This spread operator shallow copies all properties from the object
        // into an empty one, leaving the methods alone.
        const bindableObject = { ...object };

        // SQLite3 does not support boolean values. So we have to convert
        // them into numbers, otherwise an error will be thrown.
        for (const [key, value] of Object.entries(bindableObject))
        {
            if ((typeof value) === 'boolean')
            {
                const valueAsNumber = value ? 1 : 0;

                const indexedBindableObject = bindableObject as {[key: string]: any};

                indexedBindableObject[key] = valueAsNumber;
            }
        }

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
            Utils.getCurrentUnixTime()
        );

        return result;
    }

    /**
     * Runs the given statement with the given parameters and returns the result as a number.
     */
    private getCount (statement: Sqlite.Statement, parameters: unknown): number
    {
        statement.pluck(true);

        const count = statement.get(parameters) as number;

        return count;
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

        const result = !!statement.get(contactId);

        return result;
    }

    /**
     * NOTE: The contact object's lastUpdateTime will be updated.
     * TODO: Give the save methods a better name like "insert" or "create" or "saveNew".
     */
    public saveContact (contact: Contact): void
    {
        const statement = this.mainDatabase.prepare(
            `INSERT INTO
                contact (id, tag, name, nickname, lastUpdateTime, type, state)
            VALUES
                (:id, :tag, :name, :nickname, :lastUpdateTime, :type, :state)`
        );

        contact.lastUpdateTime = Utils.getCurrentUnixTime();

        statement.run(
            this.getBindablesFromObject(contact)
        );
    }

    public getContact (contactId: string): Contact
    {
        const statement = this.mainDatabase.prepare(
            'SELECT * FROM contact WHERE id = ?'
        );

        const contactData = statement.get(contactId) as ContactData|undefined;

        if (contactData === undefined)
        {
            throw new Error(`Contact with ID ${contactId} not found.`);
        }

        const contact = new Contact(contactData);

        return contact;
    }

    /**
     * NOTE: The contact object's lastUpdateTime will be updated.
     */
    public updateContact (contact: Contact): void
    {
        this.updateContacts([contact]);
    }

    /**
     * NOTE: The contact objects's lastUpdateTime will be updated.
     */
    public updateContacts (contacts: Contact[]): void
    {
        const statement = this.mainDatabase.prepare(
            `UPDATE
                 contact
             SET
                 tag = :tag, name = :name, nickname = :nickname,
                 lastUpdateTime = :lastUpdateTime, type = :type, state = :state
             WHERE
                 id = :id`
        );

        for (const contact of contacts)
        {
            contact.lastUpdateTime = Utils.getCurrentUnixTime();

            statement.run(
                this.getBindablesFromObject(contact)
            );
        }
    }

    public getContactCount (): number
    {
        const statement = this.mainDatabase.prepare(
            'SELECT COUNT(*) FROM contact WHERE contact.state != ?'
        );

        return this.getCount(statement, State.Nothing); // All contacts in this event phase have a state not equal to "Nothing".
    }

    /**
     * Will check if there is information in the database.
     * @param contactId The ID of the contact the information must be linked to.
     */
    public hasInformation (contactId: string): boolean
    {
        const statement = this.mainDatabase.prepare(
            `SELECT
                CASE
                    WHEN EXISTS
                        (SELECT 1 FROM information WHERE contactId = ? LIMIT 1)
                    THEN 1
                    ELSE 0
                END`
        );

        // Will make the get method to return the value of the first column
        // instead of an object for all columns. Since we only want one value
        // this makes it much easier:
        statement.pluck(true);

        const result = !!statement.get(contactId); // Make sure the value is definitely a boolean.

        return result;
    }

    /**
     * Saves a member in the database by saving its information and updating the contact. \
     * NOTE: The member and the information objects' lastUpdateTime will be updated.
     */
    public saveMember (member: Member): void
    {
        member.lastUpdateTime = Utils.getCurrentUnixTime();
        member.information.lastUpdateTime = member.lastUpdateTime;

        // When saving a member, the contact data still exists and only needs to be updated:
        const contactStatement = this.mainDatabase.prepare(
            `UPDATE
                contact
            SET
                tag = :tag, name = :name, nickname = :nickname,
                lastUpdateTime = :lastUpdateTime, type = :type, state = :state
            WHERE
                id = :id`
        );

        // The information data must nevertheless be created because the former contact had no information.
        const informationStatement = this.mainDatabase.prepare(
            `INSERT INTO
                information (contactId, lastUpdateTime, giftTypeAsTaker, giftTypeAsGiver, address, country,
                             digitalAddress, internationalAllowed, wishList, allergies, giftExclusion, userExclusion, freeText)
            VALUES
                (:contactId, :lastUpdateTime, :giftTypeAsTaker, :giftTypeAsGiver, :address, :country,
                 :digitalAddress, :internationalAllowed, :wishList, :allergies, :giftExclusion, :userExclusion, :freeText)`
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
            (): Member|null => {
                const contactData = contactStatement.get(contactId) as ContactData|undefined;
                const informationData = informationStatement.get(contactId) as InformationData|undefined;

                if (contactData === undefined || informationData === undefined)
                {
                    return null;
                }

                const member = new Member(contactData, informationData);

                return member;
            }
        );

        const member = getTransactionResult();

        if (member === null)
        {
            throw new Error(`Member with ID ${contactId} not found.`);
        }

        return member;
    }

    public getMembersByState (state: State): Member[]
    {
        const statement = this.mainDatabase.prepare(
            `SELECT
                contact.*, information.*
            FROM
                contact
            LEFT JOIN
                information
                    ON information.contactId = contact.id
            WHERE
                contact.state = ?`
        );

        statement.expand(true); // Expands the result to have one sub-object for each table.

        const resultData = statement.all(state) as { contact: ContactData, information: InformationData }[];

        const members: Member[] = [];

        for (const result of resultData)
        {
            const member = new Member(result.contact, result.information);

            members.push(member);
        }

        return members;
    }

    /**
     * Updates an existing member (contact and information data) in the database. \
     * NOTE: The contact and the information objects' lastUpdateTime will be updated.
     */
    public updateMember (member: Member): void
    {
        member.lastUpdateTime = Utils.getCurrentUnixTime();
        member.information.lastUpdateTime = member.lastUpdateTime;

        const contactStatement = this.mainDatabase.prepare(
            `UPDATE
                contact
            SET
                tag = :tag, name = :name, nickname = :nickname,
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
                digitalAddress = :digitalAddress, internationalAllowed = :internationalAllowed,
                wishList = :wishList, allergies = :allergies, giftExclusion = :giftExclusion,
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

    public getWichtel (contactId: string): Wichtel
    {
        const contactStatement = this.mainDatabase.prepare(
            'SELECT * FROM contact WHERE id = ?'
        );

        const informationStatement = this.mainDatabase.prepare(
            'SELECT * FROM information WHERE contactId = ?'
        );

        const relationshipStatement = this.mainDatabase.prepare(
            `SELECT
                *
            FROM
                (
                    SELECT
                        giverId
                    FROM
                        relationship
                    WHERE
                        takerId = :contactId
                ),
                (
                    SELECT
                        takerId
                    FROM
                        relationship
                    WHERE
                        giverId = :contactId
                )`
        );

        const getTransactionResult = this.mainDatabase.transaction(
            (): Wichtel|null => {
                const contactData = contactStatement.get(contactId) as ContactData|undefined;
                const informationData = informationStatement.get(contactId) as InformationData|undefined;
                const relationshipData = relationshipStatement.get({contactId: contactId}) as RelationshipData|undefined;

                if (contactData === undefined || informationData === undefined || relationshipData === undefined)
                {
                    return null;
                }

                const wichtel = new Wichtel(contactData, informationData, relationshipData);

                return wichtel;
            }
        );

        const wichtel = getTransactionResult();

        if (wichtel === null)
        {
            throw new Error(`Wichtel with ID ${contactId} not found.`);
        }

        return wichtel;
    }

    /**
     * Will return the type of contact that can be found for this ID. \
     * If no contact is found, the given contactCoreData will be returned instead.
     */
    public getWhatIsThere (contactCoreData: ContactCoreData): ContactCoreData | Contact | Member | Wichtel
    {
        if (this.hasContact(contactCoreData.id))
        {
            // TODO: Create a getContactType method and use it here.

            const contact = this.getContact(contactCoreData.id);

            if (contact.type == ContactType.Contact)
            {
                return contact;
            }
            else if (contact.type == ContactType.Member)
            {
                const member = this.getMember(contactCoreData.id);

                return member;
            }
            else
            {
                const wichtel = this.getWichtel(contactCoreData.id);

                return wichtel;
            }
        }
        else
        {
            // If no contact has been found, return the core data that has been given:
            return contactCoreData;
        }
    }

    public getWaitingMemberCount (): number
    {
        const statement = this.mainDatabase.prepare(
            'SELECT COUNT(*) FROM contact WHERE contact.state = ?'
        );

        return this.getCount(statement, State.Waiting);
    }

    public getUserExclusions (): Exclusion[]
    {
        const statement = this.mainDatabase.prepare(
            'SELECT * FROM exclusion'
        );

        const rawExclusions = statement.all() as Exclusion[];

        const exclusions: Exclusion[] = [];

        for (const rawExclusion of rawExclusions)
        {
            const exclusion = new Exclusion(rawExclusion);

            exclusions.push(exclusion);
        }

        return exclusions;
    }

    public saveUserExclusions (exclusions: ExclusionData[]): void
    {
        const statement = this.mainDatabase.prepare(
            `INSERT INTO
                exclusion (giverId, takerId, reason, lastUpdateTime)
            VALUES
                (:giverId, :takerId, :reason, :lastUpdateTime)`
        );

        for (const exclusion of exclusions)
        {
            const parameters = {
                lastUpdateTime: Utils.getCurrentUnixTime(),
                ...this.getBindablesFromObject(exclusion)
            };

            statement.run(parameters);
        }
    }

    public getRelationships (): Relationship[]
    {
        // TODO: Could these kind of statements be abstracted as "get all and return as this class instances"?

        const statement = this.mainDatabase.prepare(
            'SELECT * FROM relationship'
        );

        const rawRelationships = statement.all() as Relationship[];

        const relationships: Relationship[] = [];

        for (const rawRelationship of rawRelationships)
        {
            const relationship = new Relationship(rawRelationship);

            relationships.push(relationship);
        }

        return relationships;
    }

    public saveRelationships (relationships: RelationshipData[]): void
    {
        const statement = this.mainDatabase.prepare(
            `INSERT INTO
                relationship (wichtelEvent, giverId, takerId)
            VALUES
                (:wichtelEvent, :giverId, :takerId)`
        );

        for (const relationship of relationships)
        {
            const parameters = {
                wichtelEvent: Config.main.currentEvent.name,
                giverId: relationship.giverId,
                takerId: relationship.takerId,
            };

            statement.run(parameters);
        }
    }

    public getGiftTypeStatistics (): GiftTypeStatistics
    {
        const statement = this.mainDatabase.prepare(
            `SELECT
                COUNT(CASE WHEN information.giftTypeAsGiver = :analogueGiftType THEN 1 END) AS analogueGiverCount,
                COUNT(CASE WHEN information.giftTypeAsGiver = :digitalGiftType THEN 1 END) AS digitalGiverCount,
                COUNT(CASE WHEN information.giftTypeAsGiver = :allGiftType THEN 1 END) AS allGiverCount,
                COUNT(CASE WHEN information.giftTypeAsTaker = :analogueGiftType THEN 1 END) AS analogueTakerCount,
                COUNT(CASE WHEN information.giftTypeAsTaker = :digitalGiftType THEN 1 END) AS digitalTakerCount,
                COUNT(CASE WHEN information.giftTypeAsTaker = :allGiftType THEN 1 END) AS allTakerCount
            FROM
                information
            LEFT JOIN
                contact ON information.contactId = contact.id
            WHERE
                information.lastUpdateTime >= :currentEventRegistrationTime
                AND contact.state = :waitingState`
        );

        const result = statement.get(
            {
                analogueGiftType: GiftType.Analogue,
                digitalGiftType: GiftType.Digital,
                allGiftType: GiftType.All,
                currentEventRegistrationTime: Config.main.currentEvent.registration,
                waitingState: State.Waiting,
            }
        ) as GiftTypeStatistics;

        return result;
    }

    public getParcelStatistics (): ParcelStatistics
    {
        const statement = this.mainDatabase.prepare(
            `SELECT
                COUNT(CASE WHEN shippingDate != '' THEN 1 END) AS sentCount,
                COUNT(CASE WHEN receivingDate != '' THEN 1 END) AS receivedCount
            FROM
                parcel
            WHERE
                wichtelEvent = ?`
        );

        const result = statement.get(Config.main.currentEvent.name) as ParcelStatistics;

        return result;
    }
}

/*

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
