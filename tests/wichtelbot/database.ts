import 'mocha';
import * as assert from 'assert';

import ContactTestUtility from '../testUtility/contact';

import Database from '../../scripts/wichtelbot/database';
import Member from '../../scripts/wichtelbot/classes/member';

describe('wichtelbot/database',
    function ()
    {
        it('can be instantiated and closed.',
            function ()
            {
                const database = new Database();
                database.close();
            }
        );

        it('can log.',
            function ()
            {
                const database = new Database();

                const result = database.log('0', 'test', 'This is a unit test.');

                database.close();

                assert.notStrictEqual(result.changes, undefined);
                assert.notStrictEqual(result.changes, null);
                assert.notStrictEqual(result.changes, 0);
            }
        );

        it('can save and get a contact.',
            function ()
            {
                const database = new Database();

                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact); // NOTE: "lastUpdateTime" will be updated automatically in the object.

                const returnedContact = database.getContact(contact.contactId);

                database.close();

                assert.deepStrictEqual(returnedContact, contact);
                assert.notStrictEqual(returnedContact.lastUpdateTime, 0);
            }
        );

        it('can update a contact.',
            function ()
            {
                const database = new Database();

                const contact = ContactTestUtility.createRandomContact();

                database.saveContact(contact); // NOTE: "lastUpdateTime" will be updated automatically in the object.

                const updatedContact = ContactTestUtility.createRandomContact();
                updatedContact.contactId = contact.contactId;

                database.updateContact(updatedContact);

                const returnedContact = database.getContact(contact.contactId);

                database.close();

                assert.deepStrictEqual(returnedContact, updatedContact);
            }
        );

        it('can save and get a member.',
            function ()
            {
                const database = new Database();

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
