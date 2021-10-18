import 'mocha';
import { ChannelType, State } from '../../../scripts/wichtelbot/endpoint/definitions';
import { assert } from 'chai';
import { CommandTestMessage } from '../../utility/message';
import Config from '../../../scripts/utility/config';
import ConfigTestUtility from '../../utility/config';
import Contact from '../../../scripts/wichtelbot/classes/contact';
import ContactType from '../../../scripts/wichtelbot/types/contactType';
import Database from '../../../scripts/wichtelbot/database';
import GiftType from '../../../scripts/wichtelbot/types/giftType';
import Information from '../../../scripts/wichtelbot/classes/information';
import { KeyValuePairList } from '../../../scripts/utility/keyValuePair';
import Localisation from '../../../scripts/utility/localisation';
import Member from '../../../scripts/wichtelbot/classes/member';
import MessageHandler from '../../../scripts/wichtelbot/message/messageHandler';

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
            async function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.registration.process(contact));
                    assert.strictEqual(contact.state, State.Registration);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.registration.commands[0];

                message.prepareContact(State.New);

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> yes',
            async function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.informationGiftTypeAsGiver.process(contact));
                    assert.strictEqual(contact.state, State.InformationGiftTypeAsGiver);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.yes.commands[0];

                message.prepareContact(State.Registration);

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> no',
            async function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.registrationCancelled.process(contact));
                    assert.strictEqual(contact.state, State.New);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = Localisation.commands.no.commands[0];

                message.prepareContact(State.Registration);

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('registration -> invalid',
            async function ()
            {
                const testCallback = (text: string, contact: Contact): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(contact));
                    assert.strictEqual(contact.state, State.Registration);
                };

                const message = new CommandTestMessage(database, testCallback, ChannelType.Personal);
                message.content = '';

                message.prepareContact(State.Registration);

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> Analogue',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> Digital',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> BothAnalogueAndDigital',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsGiver -> invalid',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> Analogue',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> Digital',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> BothAnalogueAndDigital',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftTypeAsTaker -> invalid',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationAddress',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationDigitalAddress',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationInternationalAllowed',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> targeting InformationWishList',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationCountry -> invalid',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationDigitalAddress -> targeting InternationalAllowed',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationDigitalAddress -> targeting informationWishList',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationInternationalAllowed -> yes',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationInternationalAllowed -> no',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationWishList -> targeting InformationAllergies',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationWishList -> targeting InformationGiftExclusion',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationAllergies',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationGiftExclusion',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationUserExclusion',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );

        it('InformationFreeText',
            async function ()
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

                await messageHandler.process(message);

                assert.strictEqual(message.called, true);
            }
        );
    }
);
