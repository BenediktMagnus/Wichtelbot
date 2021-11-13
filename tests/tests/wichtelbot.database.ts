import 'mocha';
import { assert } from 'chai';

import ContactTestUtility from '../utility/contact';
import Database from '../../scripts/wichtelbot/database/database';
import GeneralTestUtility from '../utility/general';
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

        it('log.',
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

                database.saveContact(contact);

                const returnedContact = database.getContact(contact.id);

                assert.deepStrictEqual(returnedContact, contact);
                assert.notStrictEqual(returnedContact.lastUpdateTime, 0);
            }
        );

        it('updateContact',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact);

                const updatedContact = ContactTestUtility.createRandomContact();
                updatedContact.id = contact.id;

                database.updateContact(updatedContact);

                const returnedContact = database.getContact(contact.id);

                assert.deepStrictEqual(returnedContact, updatedContact);
            }
        );

        it('can save and get a member.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact);

                const member = new Member(contact);
                member.information = ContactTestUtility.createRandomMemberInformation(member.id);

                database.saveMember(member);

                const returnedMember = database.getMember(member.id);

                assert.deepStrictEqual(returnedMember, member);
                assert.notStrictEqual(returnedMember.lastUpdateTime, 0);
                assert.notStrictEqual(returnedMember.information.lastUpdateTime, 0);
            }
        );

        it('updateMember',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact);

                const member = new Member(contact);
                member.information = ContactTestUtility.createRandomMemberInformation(member.id);

                database.saveMember(member);

                member.name = GeneralTestUtility.createRandomString();

                database.updateMember(member);

                const returnedMember = database.getMember(member.id);

                assert.deepStrictEqual(returnedMember, member);
            }
        );

        it('hasInformation',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact);

                const member = new Member(contact);
                member.information = ContactTestUtility.createRandomMemberInformation(member.id);

                database.saveMember(member);

                const informationNotPresent = database.hasInformation('0');
                const informationIsPresent = database.hasInformation(member.id);

                assert.strictEqual(informationNotPresent, false);
                assert.strictEqual(informationIsPresent, true);
            }
        );

        it('getWhatIsThere with contactCoreData.',
            function ()
            {
                const contactCoreData = ContactTestUtility.createRandomContactCoreData();

                const returnedContact = database.getWhatIsThere(contactCoreData);

                assert.deepStrictEqual(returnedContact, contactCoreData);
            }
        );

        it('getWhatIsThere with a contact.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact);

                const returnedData = database.getWhatIsThere(contact);

                assert.deepStrictEqual(returnedData, contact);
            }
        );

        it('getWhatIsThere with a member.',
            function ()
            {
                const member = ContactTestUtility.createRandomMember();

                database.saveContact(member);
                database.saveMember(member);

                const returnedData = database.getWhatIsThere(member);

                assert.deepStrictEqual(returnedData, member);
            }
        );
    }
);
