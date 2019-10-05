import 'mocha';
import * as assert from 'assert';

import Member from '../../scripts/wichtelbot/classes/member';
import ContactTestUtility from '../utility/contact';
import ContactType from '../../scripts/wichtelbot/types/contactType';

describe('member class',
    function ()
    {
        it('has working fromContact method.',
            () => {
                const contact = ContactTestUtility.createRandomContact();

                const member = Member.fromContact(contact);

                // The new information must be present:
                assert.notStrictEqual(member.information, undefined);
                assert.notStrictEqual(member.information, null);

                assert.strictEqual(member.contactId, contact.contactId);
                assert.strictEqual(member.state, contact.state);

                assert.strictEqual(member.type, ContactType.Member);
            }
        );
    }
);
