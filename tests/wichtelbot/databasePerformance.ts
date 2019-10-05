import 'mocha';
import * as fs from 'fs';

import ContactTestUtility from '../testUtility/contact';

import Database from '../../scripts/wichtelbot/database';
import Contact from '../../scripts/wichtelbot/classes/contact';
import Member from '../../scripts/wichtelbot/classes/member';

const testCount = 100;
const mainDatabaseName = 'mainPerformance';
const logDatabaseName = 'logPerformance';

describe('wichtelbot/database Performance',
    function ()
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

        // Contact tests:

        describe('of ' + testCount.toString() + ' contact',
            function ()
            {
                it('inserts.',
                    function ()
                    {
                        for (const contact of contacts)
                        {
                            database.saveContact(contact);
                        }
                    }
                );

                it('updates.',
                    function ()
                    {
                        for (const contact of updatedContacts)
                        {
                            database.updateContact(contact);
                        }
                    }
                );

                it('selects.',
                    function ()
                    {
                        for (const contact of contacts)
                        {
                            database.getContact(contact.contactId);
                        }
                    }
                );
            }
        );

        // Member test:

        describe('of ' + testCount.toString() + ' member',
            function ()
            {
                it('inserts.',
                    function ()
                    {
                        for (const member of members)
                        {
                            database.saveMember(member);
                        }
                    }
                );

                it('updates.',
                    function ()
                    {
                        for (const member of updatedMembers)
                        {
                            database.updateMember(member);
                        }
                    }
                );

                it('selects.',
                    function ()
                    {
                        for (const member of members)
                        {
                            database.getMember(member.contactId);
                        }
                    }
                );
            }
        );
    }
);
