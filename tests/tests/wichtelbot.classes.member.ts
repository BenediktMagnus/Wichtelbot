import 'mocha';
import { assert } from 'chai';

import ContactTestUtility from '../utility/contact';
import ContactType from '../../scripts/wichtelbot/types/contactType';
import Member from '../../scripts/wichtelbot/classes/member';
import GeneralTestUtility from '../utility/general';

describe('member class',
    function ()
    {
        it('from ContactData',
            function ()
            {
                const contactData = ContactTestUtility.createRandomContactData();

                const member = new Member(contactData);

                // The new information must be present:
                assert.strictEqual(member.information.contactId, contactData.id);

                assert.deepNestedInclude(member, contactData);

                // Only changing the class must not change the type.
                // See "docs/Concepts.md -> Contact types vs contact classes" for more information.
                assert.strictEqual(member.type, ContactType.Contact);
            }
        );

        it('from Contact',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const member = new Member(contact);

                // The new information must be present:
                assert.strictEqual(member.information.contactId, contact.id);

                assert.deepNestedInclude(member, contact);

                // Only changing the class must not change the type.
                // See "docs/Concepts.md -> Contact types vs contact classes" for more information.
                assert.strictEqual(member.type, ContactType.Contact);
            }
        );

        it('from Contact with Information',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();
                const information = ContactTestUtility.createRandomMemberInformation(contact.id);

                const member = new Member(contact, information);

                assert.deepStrictEqual(member.information, information);

                assert.deepNestedInclude(member, contact);
            }
        );

        it('overwrites information ID.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const randomId = GeneralTestUtility.createRandomString();
                const information = ContactTestUtility.createRandomMemberInformation(randomId);

                const member = new Member(contact, information);

                assert.deepStrictEqual(member.information.contactId, contact.id);
            }
        );
    }
);
