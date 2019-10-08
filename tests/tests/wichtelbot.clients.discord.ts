import 'mocha';
import * as assert from 'assert';
import * as Discord from 'discord.js';

import User from '../../scripts/wichtelbot/message/definitions/user';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import Message from '../../scripts/wichtelbot/message/definitions/message';

import {
    DiscordUser as DiscordUserImplementation,
    DiscordChannel as DiscordChannelImplementation,
    DiscordMessage as DiscordMessageImplementation,
} from '../../scripts/wichtelbot/clients/discord';

describe('discord client',
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

        const discordClient = new Discord.Client();
        const discordUser = new Discord.User(discordClient, {});
        const discordDMChannel = new Discord.DMChannel(discordClient, discordDMChannelInternals);
        const discordMessage = new Discord.Message(discordDMChannel, discordMessageInternals, discordClient);

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

                const message: Message = new DiscordMessageImplementation(discordMessage);

                assert.strictEqual(message.content, testContent);
                assert.deepStrictEqual(message.author, testAuthor);
                assert.deepStrictEqual(message.channel, testChannel);
            }
        );
    }
);
