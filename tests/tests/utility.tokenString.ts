import 'mocha';
import * as assert from 'assert';

import ContactTestUtility from '../utility/contact';

import TokenString from '../../scripts/utility/tokenString';

describe('tokenString',
    function ()
    {
        it('has working setContact.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname}';
                const expectedString = `${contact.name}, ${contact.tag}, ${contact.nickname}`;

                const text = new TokenString(rawString);
                text.setContact(contact);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );

        it('has working setInformation.',
            function ()
            {
                const information = ContactTestUtility.createRandomMemberInformation();

                const rawString = '{information.giftTypeAsTaker}, {information.giftTypeAsGiver},' +
                                   '{information.address}, {information.country}, {information.steamName},' +
                                   '{information.international}, {information.wishList},' +
                                   '{information.allergies}, {information.giftExclusion},' +
                                   '{information.userExclusion}, {information.freeText}';
                const expectedString = `${information.giftTypeAsTaker}, ${information.giftTypeAsGiver},` +
                                       `${information.address}, ${information.country}, ${information.steamName},` +
                                       `${information.international}, ${information.wishList},` +
                                       `${information.allergies}, ${information.giftExclusion},` +
                                       `${information.userExclusion}, ${information.freeText}`;

                const text = new TokenString(rawString);
                text.setInformation(information);

                const result = text.getResult();

                assert.strictEqual(result, expectedString);
            }
        );

        it('has working setCustom.',
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
