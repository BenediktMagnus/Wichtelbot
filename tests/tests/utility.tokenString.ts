import 'mocha';
import * as assert from 'assert';

import ContactTestUtility from '../utility/contact';

import TokenString from '../../scripts/utility/tokenString';

describe('tokenString',
    function ()
    {
        it('set(ContactCoreData)',
            function ()
            {
                const contactCoreData = ContactTestUtility.createRandomContactCoreData();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname}';
                const expectedString = `${contactCoreData.name}, ${contactCoreData.tag}, ${contactCoreData.name}`;

                const text = new TokenString(rawString);
                text.set(contactCoreData);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );

        it('set(Contact)',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname}';
                const expectedString = `${contact.name}, ${contact.tag}, ${contact.nickname}`;

                const text = new TokenString(rawString);
                text.set(contact);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );

        it('set(Member)',
            function ()
            {
                const member = ContactTestUtility.createRandomMember();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname},' +
                                  '{information.giftTypeAsTaker}, {information.giftTypeAsGiver},' +
                                  '{information.address}, {information.country}, {information.steamName},' +
                                  '{information.international}, {information.wishList},' +
                                  '{information.allergies}, {information.giftExclusion},' +
                                  '{information.userExclusion}, {information.freeText}';
                const expectedString = `${member.name}, ${member.tag}, ${member.nickname},` +
                                       `${member.information.giftTypeAsTaker}, ${member.information.giftTypeAsGiver},` +
                                       `${member.information.address}, ${member.information.country}, ${member.information.steamName},` +
                                       `${member.information.international}, ${member.information.wishList},` +
                                       `${member.information.allergies}, ${member.information.giftExclusion},` +
                                       `${member.information.userExclusion}, ${member.information.freeText}`;

                const text = new TokenString(rawString);
                text.set(member);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );

        it('setCustom',
            function ()
            {
                const customTest = 'customTest';
                const varTest = 'varTest';
                const bismarckTest = 'bismarckTest';

                const rawString = '{custom.customKey}, {var.varKey}, {bismarck.bismarckKey}';
                const expectedString = `${customTest}, ${varTest}, ${bismarckTest}`;

                const text = new TokenString(rawString);
                text.setCustom('customKey', customTest);
                text.setCustom('varKey', varTest);
                text.setCustom('bismarckKey', bismarckTest);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );
    }
);
