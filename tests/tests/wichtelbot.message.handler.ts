import 'mocha';
import { assert } from 'chai';

import ConfigTestUtility from '../utility/config';
import { TestMessage, TestMessageWithFixedAuthor } from '../utility/message';

import Localisation from '../../scripts/utility/localisation';
import Database from '../../scripts/wichtelbot/database';
import Config from '../../scripts/utility/config';

import MessageHandler from '../../scripts/wichtelbot/message/handler';

import User from '../../scripts/wichtelbot/message/definitions/user';
import { ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';

describe('message handler',
    function ()
    {
        let database: Database;
        let messageHandler: MessageHandler;

        before(
            function ()
            {
                // Set event phase to "registration" as a basis to work with:
                ConfigTestUtility.setToRegistrationPhase();

                // Initialise dependencies:
                database = new Database('mainTest', 'logTest', true);
                messageHandler = new MessageHandler(database);

                const resultCallback = (): void => {};

                // Make first contact so we are known:
                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Server);
                message.content = Config.main.commandPrefix + Localisation.commands.contacting.commands[0];
                messageHandler.process(message);
            }
        );

        after(
            function ()
            {
                database.close();

                ConfigTestUtility.resetConfig();
            }
        );

        it('does not answer bots.',
            function ()
            {
                const resultCallback = (): void =>
                {
                    assert.fail('The bot must not answer bot messages!');
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);

                message.author.isBot = true;

                messageHandler.process(message);
            }
        );

        it('does not answer in ignored channel types.',
            function ()
            {
                const resultCallback = (): void =>
                {
                    assert.fail('The bot must not answer in ignored channels!');
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);

                message.channel.type = ChannelType.Ignore;

                messageHandler.process(message);
            }
        );

        it('does not answer non-prefixed server messages.',
            function ()
            {
                const resultCallback = (): void =>
                {
                    assert.fail('The bot must not answer non-prefixed server messages!');
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Server);

                Config.main.commandPrefix = '!';
                message.content = '?' + message.content;

                messageHandler.process(message);
            }
        );

        it('reacts with first contact to unknown contacts.',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.contactingRegistration.process(author));
                    called = true;
                };

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('calls messageNotUnterstood correctly.',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );
    }
);
