import 'mocha';
import { assert } from 'chai';
import * as Discord from 'discord.js';

import GeneralTestUtility from '../utility/general';
import { TestMessage } from '../utility/message';

import User from '../../scripts/wichtelbot/message/definitions/user';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import Message from '../../scripts/wichtelbot/message/definitions/message';

import {
    DiscordClient as DiscordClientImplementation,
    DiscordUser as DiscordUserImplementation,
    DiscordChannel as DiscordChannelImplementation,
    DiscordMessage as DiscordMessageImplementation,
} from '../../scripts/wichtelbot/clients/discord';

describe('discord client',
    function ()
    {
        let discordClient: Discord.Client;
        let discordUser: Discord.User;
        let discordDMChannel: Discord.DMChannel;
        let discordMessage: Discord.Message;

        before(
            function ()
            {
                const discordDMChannelInternals = {
                    recipients: [{}],
                };
                const discordMessageInternals = {
                    author: {},
                    embeds: [],
                    attachments: [],
                };

                discordClient = new Discord.Client();
                discordUser = new Discord.User(discordClient, {});
                discordDMChannel = new Discord.DMChannel(discordClient, discordDMChannelInternals);
                discordMessage = new Discord.Message(discordDMChannel, discordMessageInternals, discordClient);
            }
        );

        it('has working user class.',
            function ()
            {
                const testId = 'testId';
                const testName = 'testName';
                const testIsBot = true;
                const expectedTag = testName + '#undefined';

                discordUser.id = testId;
                discordUser.username = testName;
                discordUser.bot = testIsBot;

                const user: User = new DiscordUserImplementation(discordUser);

                assert.strictEqual(user.id, testId);
                assert.strictEqual(user.name, testName);
                assert.strictEqual(user.tag, expectedTag);
                assert.strictEqual(user.isBot, testIsBot);
            }
        );

        it('has working channel class.',
            function ()
            {
                const testId = 'testId';
                const testType = ChannelType.Personal;

                discordDMChannel.id = testId;
                discordDMChannel.type = 'dm';

                const channel: Channel = new DiscordChannelImplementation(discordDMChannel);

                assert.strictEqual(channel.id, testId);
                assert.strictEqual(channel.type, testType);
            }
        );

        it('has working message class.',
            function ()
            {
                const testContent = 'testContent';
                const testAuthor = new DiscordUserImplementation(discordUser);
                const testChannel = new DiscordChannelImplementation(discordDMChannel);

                discordMessage.content = testContent;
                discordMessage.author = discordUser;
                discordMessage.channel = discordDMChannel;

                const message: Message = new DiscordMessageImplementation(discordMessage, new DiscordClientImplementation(discordClient));

                assert.strictEqual(message.content, testContent);
                assert.deepStrictEqual(message.author, testAuthor);
                assert.deepStrictEqual(message.channel, testChannel);
            }
        );

        it('can handle multi-messages.',
            function ()
            {
                let numberOfCalls = 0;

                const resultCallback = (): void =>
                {
                    numberOfCalls++;
                };

                // For the following, we have the TestMessage class to inject custom methods for handling send/reply. We can
                // give this class to the DiscordMessageImplementation, which will use it as its internal message class instead
                // of the normal Discord implementation.
                // With this we can count how many times the Discord implementation logic calls the send method under the hood.
                const testMessage = new TestMessage(resultCallback, resultCallback, resultCallback, ChannelType.Personal);
                const message: Message = new DiscordMessageImplementation(testMessage as any, new DiscordClientImplementation(discordClient));

                let longMessage = '';
                while (longMessage.length < 5000) // NOTE: Must be adjusted in case the limit is changed by Discord.
                {
                    longMessage += GeneralTestUtility.createRandomString();
                }

                message.reply(longMessage);

                assert.strictEqual(numberOfCalls, 3);
            }
        );
    }
);
