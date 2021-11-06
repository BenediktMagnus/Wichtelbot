import 'mocha';
import { assert } from 'chai';

import ContactTestUtility from '../utility/contact';
import { KeyValuePairList } from '../../scripts/utility/keyValuePair';
import Localisation from '../../scripts/utility/localisation';
import TokenString from '../../scripts/utility/tokenString';
import Config from '../../scripts/utility/config';

describe('tokenString',
    function ()
    {
        it('with ContactCoreData.',
            function ()
            {
                const contactCoreData = ContactTestUtility.createRandomContactCoreData();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname}';
                const expectedString = `${contactCoreData.name}, ${contactCoreData.tag}, ${contactCoreData.name}`;

                const text = new TokenString(rawString);

                const result = text.process(contactCoreData);

                assert.strictEqual(result, expectedString);
            }
        );

        it('with a Contact.',
            function ()
            {
                const contact = ContactTestUtility.createRandomContact();

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname}';
                const expectedString = `${contact.name}, ${contact.tag}, ${contact.nickname}`;

                const text = new TokenString(rawString);

                const result = text.process(contact);

                assert.strictEqual(result, expectedString);
            }
        );

        it('with a Member.',
            function ()
            {
                const member = ContactTestUtility.createRandomMember();

                member.information.country = Config.main.allowedCountries[0];
                const expectedCountry = Localisation.translateCountry(member.information.country);

                const internationalAllowedString = Localisation.translateBoolean(member.information.internationalAllowed);
                const giftTypeAsTakerString = Localisation.translateGiftType(member.information.giftTypeAsTaker);
                const giftTypeAsGiverString = Localisation.translateGiftType(member.information.giftTypeAsGiver);

                const rawString = '{contact.name}, {contact.tag}, {contact.nickname},' +
                                  '{information.giftTypeAsTaker}, {information.giftTypeAsGiver},' +
                                  '{information.address}, {information.country}, {information.digitalAddress},' +
                                  '{information.internationalAllowed}, {information.wishList},' +
                                  '{information.allergies}, {information.giftExclusion},' +
                                  '{information.userExclusion}, {information.freeText}';
                const expectedString = `${member.name}, ${member.tag}, ${member.nickname},` +
                                       `${giftTypeAsTakerString}, ${giftTypeAsGiverString},` +
                                       `${member.information.address}, ${expectedCountry}, ${member.information.digitalAddress},` +
                                       `${internationalAllowedString}, ${member.information.wishList},` +
                                       `${member.information.allergies}, ${member.information.giftExclusion},` +
                                       `${member.information.userExclusion}, ${member.information.freeText}`;

                const text = new TokenString(rawString);

                const result = text.process(member);

                assert.strictEqual(result, expectedString);
            }
        );

        it('with custom data.',
            function ()
            {
                const customTest = 'customTest';
                const varTest = 'varTest';
                const bismarckTest = 'bismarckTest';

                const rawString = '{custom.customKey}, {var.varKey}, {bismarck.bismarckKey}';
                const expectedString = `${customTest}, ${varTest}, ${bismarckTest}`;

                const text = new TokenString(rawString);

                const keyValuePairs = new KeyValuePairList();
                keyValuePairs.addPair('customKey', customTest);
                keyValuePairs.addPair('varKey', varTest);
                keyValuePairs.addPair('bismarckKey', bismarckTest);

                const result = text.process(undefined, keyValuePairs);

                assert.strictEqual(result, expectedString);
            }
        );
    }
);
