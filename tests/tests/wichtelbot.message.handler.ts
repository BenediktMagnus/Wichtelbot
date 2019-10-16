import 'mocha';
import * as assert from 'assert';

import Localisation from '../../scripts/utility/localisation';
import Database from '../../scripts/wichtelbot/database';

import MessageHandler from '../../scripts/wichtelbot/message/handler';

import { MessageWithParser } from '../../scripts/wichtelbot/message/definitions/message';
import MessageDefinition from '../../scripts/wichtelbot/message/definitions/message';
import User from '../../scripts/wichtelbot/message/definitions/user';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import Client from '../../scripts/wichtelbot/message/definitions/client';
import GeneralTestUtility from '../utility/general';
import Config from '../../scripts/utility/config';

type sendOrReply = (text: string, imageUrl?: string) => void;

class TestMessage extends MessageWithParser implements MessageDefinition
{
    public content: string;
    public author: User;
    public channel: Channel;
    public client: Client;
    public reply: sendOrReply;

    constructor (reply: sendOrReply, userSend: sendOrReply, channelSend: sendOrReply, channelType: ChannelType)
    {
        super();

        this.content = GeneralTestUtility.createRandomString();
        this.author = {
            id: 'testId',
            tag: 'testName#1234',
            name: 'testName',
            isBot: false,
            send: userSend,
        };
        this.channel = {
            id: GeneralTestUtility.createRandomString(),
            type: channelType,
            send: channelSend,
        };
        this.client = {
            getChannel: (): Channel =>
            {
                return this.channel;
            },
            fetchUser: (): Promise<User> =>
            {
                return new Promise(
                    (resolve): void =>
                    {
                        resolve(this.author);
                    }
                );
            },
        };
        this.reply = reply;
    }
}

describe('message handler',
    function ()
    {
        let database: Database;
        let messageHandler: MessageHandler;

        before(
            function ()
            {
                database = new Database('mainTest', 'logTest', true);
                messageHandler = new MessageHandler(database);

                const resultCallback = (): void => {};

                // Make first contact so we are known:
                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Server);
                message.content = Config.main.commandPrefix + Localisation.commands.contacting.commands[0];
                messageHandler.process(message);
            }
        );

        after(
            function ()
            {
                database.close();
            }
        );

        it('does not answer bots.',
            function ()
            {
                const resultCallback = (): void =>
                {
                    assert.fail('The bot must not answer bot messages!');
                };

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);

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

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);

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

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Server);

                Config.main.commandPrefix = '!';
                message.content = '?' + message.content;

                messageHandler.process(message);
            }
        );

        it('reacts with first contact to unknown contacts.',
            function ()
            {
                let called = false;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.contacting.getResult());
                    called = true;
                };

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                message.author.id = 'newTestId';
                message.author.tag = 'newTestName#1234';
                message.author.name = 'newTestName';

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );

        it('has working messageNotUnterstood.',
            function ()
            {
                let called = false;

                const resultCallback = (text: string): void =>
                {
                    assert.strictEqual(text, Localisation.texts.notUnderstood.getResult());
                    called = true;
                };

                const message = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);

                messageHandler.process(message);

                assert.strictEqual(called, true);
            }
        );
    }
);
