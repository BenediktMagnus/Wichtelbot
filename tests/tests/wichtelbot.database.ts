import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';

import ContactTestUtility from '../utility/contact';

import Database from '../../scripts/wichtelbot/database';
import Member from '../../scripts/wichtelbot/classes/member';

const mainDatabaseName = 'mainTest';
const logDatabaseName = 'logTest';

describe('database',
    function ()
    {
        let database: Database;

        beforeEach(
            function ()
            {
                try
                {
                    // In-memory database for testing:
                    database = new Database(mainDatabaseName, logDatabaseName, true);
                }
                catch (error)
                {
                    console.log(error);
                }
            }
        );

        afterEach(
            function ()
            {
                try
                {
                    database.close();
                }
                catch (error)
                {
                    console.log(error);
                }
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

        it('can be instantiated and closed.',
            function ()
            {
                // Even if an in-memory database works, we surely want to test the real case:
                const onDiskDatabase = new Database(mainDatabaseName, logDatabaseName);
                onDiskDatabase.close();
            }
        );

        it('can log.',
            function ()
            {
                const result = database.log('0', 'test', 'This is a unit test.');

                assert.notStrictEqual(result.changes, undefined);
                assert.notStrictEqual(result.changes, null);
                assert.notStrictEqual(result.changes, 0);
            }
        );

        it('can save and get a contact.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact); // NOTE: "lastUpdateTime" will be updated automatically in the object.

                const returnedContact = database.getContact(contact.contactId);

                assert.deepStrictEqual(returnedContact, contact);
                assert.notStrictEqual(returnedContact.lastUpdateTime, 0);
            }
        );

        it('can update a contact.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact); // NOTE: "lastUpdateTime" will be updated automatically in the object.

                const updatedContact = ContactTestUtility.createRandomContact();
                updatedContact.contactId = contact.contactId;

                database.updateContact(updatedContact);

                const returnedContact = database.getContact(contact.contactId);

                assert.deepStrictEqual(returnedContact, updatedContact);
            }
        );

        it('can save and get a member.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact); // NOTE: "lastUpdateTime" will be updated automatically in the object.

                const member = Member.fromContact(contact);
                member.information = ContactTestUtility.createRandomMemberInformation(member.contactId);

                database.saveMember(member);

                const returnedMember = database.getMember(member.contactId);

                assert.deepStrictEqual(returnedMember, member);
                assert.notStrictEqual(returnedMember.lastUpdateTime, 0);
                assert.notStrictEqual(returnedMember.information.lastUpdateTime, 0);
            }
        );
    }
);
