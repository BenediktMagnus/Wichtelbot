import 'mocha';
import { assert } from 'chai';
import { ChannelType } from '../../../scripts/wichtelbot/endpoint/definitions';
import Config from '../../../scripts/utility/config';
import ConfigTestUtility from '../../utility/config';
import Database from '../../../scripts/wichtelbot/database';
import Localisation from '../../../scripts/utility/localisation';
import MessageHandler from '../../../scripts/wichtelbot/message/messageHandler';
import { TestMessageWithFixedAuthor } from '../../utility/message';
import User from '../../../scripts/wichtelbot/endpoint/definitions/user';

describe('statelessCommands',
    function ()
    {
        let database: Database;
        let messageHandler: MessageHandler;

        beforeEach(
            async function ()
            {
                // Set event phase to "registration" as a basis to work with:
                ConfigTestUtility.setToRegistrationPhase();

                // Initialise dependencies:
                database = new Database('mainTest', 'logTest', true);
                messageHandler = new MessageHandler(database);

                const resultCallback = async (): Promise<void> => {};

                // Make first contact so we are known:
                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Server);
                message.content = Config.main.commandPrefix + Localisation.commands.contacting.commands[0];
                await messageHandler.process(message);
            }
        );

        afterEach(
            function ()
            {
                database.close();

                ConfigTestUtility.resetConfig();
            }
        );

        it('goodAfternoon',
            async function ()
            {
                let called = false;
                let author: User;

                const resultCallback = async (text: string): Promise<void> =>
                {
                    assert.strictEqual(text, Localisation.texts.goodAfternoon.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodAfternoon.commands[0];

                author = message.author;

                await messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('goodMorning',
            async function ()
            {
                let called = false;
                let author: User;

                const resultCallback = async (text: string): Promise<void> =>
                {
                    assert.strictEqual(text, Localisation.texts.goodMorning.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodMorning.commands[0];

                author = message.author;

                await messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('goodNight',
            async function ()
            {
                let called = false;
                let author: User;

                const resultCallback = async (text: string): Promise<void> =>
                {
                    assert.strictEqual(text, Localisation.texts.goodNight.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodNight.commands[0];

                author = message.author;

                await messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('hello',
            async function ()
            {
                let called = false;
                let author: User;

                const resultCallback = async (text: string): Promise<void> =>
                {
                    assert.strictEqual(text, Localisation.texts.hello.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.hello.commands[0];

                author = message.author;

                await messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('maybe',
            async function ()
            {
                let called = false;
                let author: User;

                const resultCallback = async (text: string): Promise<void> =>
                {
                    assert.strictEqual(text, Localisation.texts.maybeResponse.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.maybe.commands[0];

                author = message.author;

                await messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );
    }
);
