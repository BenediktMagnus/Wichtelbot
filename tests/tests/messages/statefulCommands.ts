import 'mocha';
import { assert } from 'chai';

import { ChannelType } from '../../../scripts/wichtelbot/message/definitions/channel';
import { CommandTestMessage } from '../../utility/message';
import Config from '../../../scripts/utility/config';
import ConfigTestUtility from '../../utility/config';
import Contact from '../../../scripts/wichtelbot/classes/contact';
import Database from '../../../scripts/wichtelbot/database';
import GiftType from '../../../scripts/wichtelbot/types/giftType';
import Information from '../../../scripts/wichtelbot/classes/information';
import { KeyValuePairList } from '../../../scripts/utility/keyValuePair';
import Localisation from '../../../scripts/utility/localisation';
import Member from '../../../scripts/wichtelbot/classes/member';
import MessageHandler from '../../../scripts/wichtelbot/message/handler';
import State from '../../../scripts/wichtelbot/message/definitions/state';
import ContactType from '../../../scripts/wichtelbot/types/contactType';

describe('statefulCommands',
    function ()
    {
        let database: Database;
        let messageHandler: MessageHandler;

        beforeEach(
            function ()
            {
                // Set event phase to "registration" as a basis to work with:
                ConfigTestUtility.setToRegistrationPhase();

                // Initialise dependencies:
                database = new Database('mainTest', 'logTest', true);
                messageHandler = new MessageHandler(database);
            }
        );

        afterEach(
            function ()
            {
                database.close();

                ConfigTestUtility.resetConfig();
            }
        );

        it('registration',
            function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.registration.process(contact));
                    assert.strictEqual(contact.state, State.Registration);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.registration.commands[0];

                message.prepareContact(State.New);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> yes',
            function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftTypeAsGiver.process(contact));
                    assert.strictEqual(contact.state, State.InformationGiftTypeAsGiver);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.yes.commands[0];

                message.prepareContact(State.Registration);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> no',
            function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.registrationCancelled.process(contact));
                    assert.strictEqual(contact.state, State.New);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.no.commands[0];

                message.prepareContact(State.Registration);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> invalid',
            function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(contact));
                    assert.strictEqual(contact.state, State.Registration);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = '';

                message.prepareContact(State.Registration);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> Analogue',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftTypeAsTaker.process(member));
                    assert.strictEqual(member.state, State.InformationGiftTypeAsTaker);
                    assert.strictEqual(member.information.giftTypeAsGiver, GiftType.Analogue);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationAnalogue.commands[0];

                message.prepareMember(State.InformationGiftTypeAsGiver);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> Digital',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftTypeAsTaker.process(member));
                    assert.strictEqual(member.state, State.InformationGiftTypeAsTaker);
                    assert.strictEqual(member.information.giftTypeAsGiver, GiftType.Digital);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationDigital.commands[0];

                message.prepareMember(State.InformationGiftTypeAsGiver);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> BothAnalogueAndDigital',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftTypeAsTaker.process(member));
                    assert.strictEqual(member.state, State.InformationGiftTypeAsTaker);
                    assert.strictEqual(member.information.giftTypeAsGiver, GiftType.All);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationBothAnalogueAndDigital.commands[0];

                message.prepareMember(State.InformationGiftTypeAsGiver);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> invalid',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(member));
                    assert.strictEqual(member.state, State.InformationGiftTypeAsGiver);
                    assert.strictEqual(member.information.giftTypeAsGiver, GiftType.Nothing);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = '';

                message.prepareMember(State.InformationGiftTypeAsGiver);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> Analogue',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationAddress.process(member));
                    assert.strictEqual(member.state, State.InformationAddress);
                    assert.strictEqual(member.information.giftTypeAsTaker, GiftType.Analogue);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationAnalogue.commands[0];

                message.prepareMember(State.InformationGiftTypeAsTaker);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> Digital',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationDigitalAddress.process(member));
                    assert.strictEqual(member.state, State.InformationDigitalAddress);
                    assert.strictEqual(member.information.giftTypeAsTaker, GiftType.Digital);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationDigital.commands[0];

                message.prepareMember(State.InformationGiftTypeAsTaker);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> BothAnalogueAndDigital',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationAddress.process(member));
                    assert.strictEqual(member.state, State.InformationAddress);
                    assert.strictEqual(member.information.giftTypeAsTaker, GiftType.All);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.informationBothAnalogueAndDigital.commands[0];

                message.prepareMember(State.InformationGiftTypeAsTaker);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> invalid',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(member));
                    assert.strictEqual(member.state, State.InformationGiftTypeAsTaker);
                    assert.strictEqual(member.information.giftTypeAsTaker, GiftType.Nothing);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = '';

                message.prepareMember(State.InformationGiftTypeAsTaker);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationAddress',
            function ()
            {
                const expectedAddress = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationCountry.process(member));
                    assert.strictEqual(member.state, State.InformationCountry);
                    assert.strictEqual(member.information.address, expectedAddress);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedAddress;

                message.prepareMember(State.InformationAddress);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationDigitalAddress',
            function ()
            {
                const expectedCountry = Config.main.allowedCountries[0];

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationDigitalAddress.process(member));
                    assert.strictEqual(member.state, State.InformationDigitalAddress);
                    assert.strictEqual(member.information.country, expectedCountry);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedCountry;

                const information = new Information('');
                information.giftTypeAsTaker = GiftType.All;

                message.prepareMember(State.InformationCountry, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationInternationalAllowed',
            function ()
            {
                const expectedCountry = Config.main.allowedCountries[0];

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationInternationalAllowed.process(member));
                    assert.strictEqual(member.state, State.InformationInternationalAllowed);
                    assert.strictEqual(member.information.country, expectedCountry);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedCountry;

                const information = new Information('');
                information.giftTypeAsGiver = GiftType.All;

                message.prepareMember(State.InformationCountry, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationWishList',
            function ()
            {
                const expectedCountry = Config.main.allowedCountries[0];

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationWishList.process(member));
                    assert.strictEqual(member.state, State.InformationWishList);
                    assert.strictEqual(member.information.country, expectedCountry);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedCountry;

                const information = new Information('');
                information.giftTypeAsTaker = GiftType.Analogue;
                information.giftTypeAsGiver = GiftType.Digital;

                message.prepareMember(State.InformationCountry, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> invalid',
            function ()
            {
                const expectedCountry = '';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(member));
                    assert.strictEqual(member.state, State.InformationCountry);
                    assert.strictEqual(member.information.country, expectedCountry);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedCountry;

                const information = new Information('');

                message.prepareMember(State.InformationCountry, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationDigitalAddress -> targeting InternationalAllowed',
            function ()
            {
                const expectedDigitalAddress = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationInternationalAllowed.process(member));
                    assert.strictEqual(member.state, State.InformationInternationalAllowed);
                    assert.strictEqual(member.information.digitalAddress, expectedDigitalAddress);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedDigitalAddress;

                const information = new Information('');
                information.giftTypeAsGiver = GiftType.All;

                message.prepareMember(State.InformationDigitalAddress, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationDigitalAddress -> targeting informationWishList',
            function ()
            {
                const expectedDigitalAddress = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationWishList.process(member));
                    assert.strictEqual(member.state, State.InformationWishList);
                    assert.strictEqual(member.information.digitalAddress, expectedDigitalAddress);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedDigitalAddress;

                const information = new Information('');
                information.giftTypeAsGiver = GiftType.Digital;

                message.prepareMember(State.InformationDigitalAddress, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationInternationalAllowed -> yes',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationWishList.process(member));
                    assert.strictEqual(member.state, State.InformationWishList);
                    assert.strictEqual(member.information.internationalAllowed, true);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.yes.commands[0];

                message.prepareMember(State.InformationInternationalAllowed);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationInternationalAllowed -> no',
            function ()
            {
                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationWishList.process(member));
                    assert.strictEqual(member.state, State.InformationWishList);
                    assert.strictEqual(member.information.internationalAllowed, false);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.no.commands[0];

                message.prepareMember(State.InformationInternationalAllowed);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationWishList -> targeting InformationAllergies',
            function ()
            {
                const expectedWishList = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationAllergies.process(member));
                    assert.strictEqual(member.state, State.InformationAllergies);
                    assert.strictEqual(member.information.wishList, expectedWishList);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedWishList;

                const information = new Information('');
                information.giftTypeAsTaker = GiftType.All;

                message.prepareMember(State.InformationWishList, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationWishList -> targeting InformationGiftExclusion',
            function ()
            {
                const expectedWishList = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftExclusion.process(member));
                    assert.strictEqual(member.state, State.InformationGiftExclusion);
                    assert.strictEqual(member.information.wishList, expectedWishList);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedWishList;

                const information = new Information('');
                information.giftTypeAsTaker = GiftType.Digital;

                message.prepareMember(State.InformationWishList, information);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationAllergies',
            function ()
            {
                const expectedAllergies = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftExclusion.process(member));
                    assert.strictEqual(member.state, State.InformationGiftExclusion);
                    assert.strictEqual(member.information.allergies, expectedAllergies);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedAllergies;

                message.prepareMember(State.InformationAllergies);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftExclusion',
            function ()
            {
                const expectedGiftExclusion = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationUserExclusion.process(member));
                    assert.strictEqual(member.state, State.InformationUserExclusion);
                    assert.strictEqual(member.information.giftExclusion, expectedGiftExclusion);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedGiftExclusion;

                message.prepareMember(State.InformationGiftExclusion);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationUserExclusion',
            function ()
            {
                const expectedUserExclusion = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationFreeText.process(member));
                    assert.strictEqual(member.state, State.InformationFreeText);
                    assert.strictEqual(member.information.userExclusion, expectedUserExclusion);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedUserExclusion;

                message.prepareMember(State.InformationUserExclusion);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationFreeText',
            function ()
            {
                const expectedFreeText = '-';

                const testCallback = (text: string, member: Member): void =>
                {
                    const parameters = new KeyValuePairList('currentEventName', Config.main.currentEvent.name);
                    assert.strictEqual(text, Localisation.texts.becameMember.process(member, parameters));
                    assert.strictEqual(member.state, State.Waiting);
                    assert.strictEqual(member.type, ContactType.Member);
                    assert.strictEqual(member.information.freeText, expectedFreeText);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = expectedFreeText;

                message.prepareMember(State.InformationFreeText);

                messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );
    }
);
