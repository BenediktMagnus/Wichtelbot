import 'mocha';
import * as assert from 'assert';

import Member from '../../scripts/wichtelbot/classes/member';
import ContactTestUtility from '../utility/contact';
import ContactType from '../../scripts/wichtelbot/types/contactType';

describe('member class',
    function ()
    {
        it('has working fromContact method.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const member = new Member(contact);

                // The new information must be present:
                assert.notStrictEqual(member.information, undefined);
                assert.notStrictEqual(member.information, null);

                assert.strictEqual(member.id, contact.id);
                assert.strictEqual(member.state, contact.state);

                assert.strictEqual(member.type, ContactType.Member);
            }
        );
    }
);
