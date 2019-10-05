import 'mocha';
import * as fs from 'fs';

import ContactTestUtility from '../utility/contact';

import Database from '../../scripts/wichtelbot/database';
import Contact from '../../scripts/wichtelbot/classes/contact';
import Member from '../../scripts/wichtelbot/classes/member';

const testCount = 100;
const mainDatabaseName = 'mainPerformance';
const logDatabaseName = 'logPerformance';

function performanceTest (this: Mocha.Suite): void
{
    let database: Database;

    const contacts: Contact[] = [];
    const updatedContacts: Contact[] = [];
    const members: Member[] = [];
    const updatedMembers: Member[] = [];

    // We do not want a timeout in a performance test:
    this.timeout(0);

    before(
        function ()
        {
            for (let i = 0; i < testCount; i++)
            {
                const contact = ContactTestUtility.createRandomContact();
                const updatedContact = ContactTestUtility.createRandomContact();
                updatedContact.contactId = contact.contactId;

                contacts.push(contact);
                updatedContacts.push(updatedContact);

                const member = Member.fromContact(contact);
                const updatedMember = Member.fromContact(updatedContact);

                members.push(member);
                updatedMembers.push(updatedMember);
            }
        }
    );

    beforeEach(
        function ()
        {
            // We do not want to have caching involved in our performance tests,
            // therefor we reopen the database before each test:
            database = new Database(mainDatabaseName, logDatabaseName);
        }
    );

    afterEach(
        function ()
        {
            database.close();
        }
    );

    after(
        function ()
        {
            // Remove used database files:
            fs.unlinkSync('./data/' + mainDatabaseName + '.sqlite');
            fs.unlinkSync('./data/' + logDatabaseName + '.sqlite');
        }
    );

    it('contact inserts.',
        function ()
        {
            for (const contact of contacts)
            {
                database.saveContact(contact);
            }
        }
    );

    it('contact updates.',
        function ()
        {
            for (const contact of updatedContacts)
            {
                database.updateContact(contact);
            }
        }
    );

    it('contact selects.',
        function ()
        {
            for (const contact of contacts)
            {
                database.getContact(contact.contactId);
            }
        }
    );

    // Member test:

    it('member inserts.',
        function ()
        {
            for (const member of members)
            {
                database.saveMember(member);
            }
        }
    );

    it('member updates.',
        function ()
        {
            for (const member of updatedMembers)
            {
                database.updateMember(member);
            }
        }
    );

    it('member selects.',
        function ()
        {
            for (const member of members)
            {
                database.getMember(member.contactId);
            }
        }
    );
}

describe('Performance',
    function ()
    {
        describe('of database for ' + testCount.toString(), performanceTest);
    }
);
