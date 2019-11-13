import 'mocha';
import { assert } from 'chai';

import ConfigTestUtility from '../../utility/config';
import { TestMessageWithFixedAuthor } from '../../utility/message';

import Localisation from '../../../scripts/utility/localisation';
import Database from '../../../scripts/wichtelbot/database';
import Config from '../../../scripts/utility/config';

import MessageHandler from '../../../scripts/wichtelbot/message/handler';

import User from '../../../scripts/wichtelbot/message/definitions/user';
import { ChannelType } from '../../../scripts/wichtelbot/message/definitions/channel';

describe('statelessCommands',
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

                const resultCallback = (): void => {};

                // Make first contact so we are known:
                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Server);
                message.content = Config.main.commandPrefix + Localisation.commands.contacting.commands[0];
                messageHandler.process(message);
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
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.goodAfternoon.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodAfternoon.commands[0];

                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('goodMorning',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.goodMorning.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodMorning.commands[0];

                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('goodNight',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.goodNight.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.goodNight.commands[0];

                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('hello',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.hello.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.hello.commands[0];

                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('maybe',
            function ()
            {
                let called = false;
                let author: User;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.maybeResponse.process(author));
                    called = true;
                };

                const message = new TestMessageWithFixedAuthor(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.content = Localisation.commands.maybe.commands[0];

                author = message.author;

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );
    }
);
