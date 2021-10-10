import 'mocha';
import * as Discord from 'discord.js';
import * as mockito from 'ts-mockito';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import {
    DiscordChannel as DiscordChannelImplementation,
    DiscordClient as DiscordClientImplementation,
    DiscordMessage as DiscordMessageImplementation,
    DiscordUser as DiscordUserImplementation,
} from '../../scripts/wichtelbot/clients/discord';
import { assert } from 'chai';
import GeneralTestUtility from '../utility/general';
import Message from '../../scripts/wichtelbot/message/definitions/message';
import User from '../../scripts/wichtelbot/message/definitions/user';

describe('discord client',
    function ()
    {
        let discordClient: Discord.Client;
        let discordUser: Discord.User;
        let discordDMChannelMock: Discord.DMChannel;
        let discordDMChannel: Discord.DMChannel;
        let discordMessageMock: Discord.Message;
        let discordMessage: Discord.Message;

        before(
            function ()
            {
                discordClient = mockito.instance(mockito.mock(Discord.Client) as Discord.Client);
                discordUser = mockito.instance(mockito.mock(Discord.User));

                discordDMChannelMock = mockito.mock(Discord.DMChannel);
                discordDMChannel = mockito.instance(discordDMChannelMock);

                discordMessageMock = mockito.mock(Discord.Message);
                discordMessage = mockito.instance(discordMessageMock);
            }
        );

        it('has working user class.',
            function ()
            {
                const testId = 'testId';
                const testName = 'testName';
                const testIsBot = true;

                discordUser.id = testId;
                discordUser.username = testName;
                discordUser.bot = testIsBot;

                const user: User = new DiscordUserImplementation(discordUser);

                assert.strictEqual(user.id, testId);
                assert.strictEqual(user.name, testName);
                assert.strictEqual(user.isBot, testIsBot);
            }
        );

        it('has working channel class.',
            function ()
            {
                const testId = 'testId';
                const testType = ChannelType.Personal;

                mockito.when(discordDMChannelMock.isText()).thenReturn(true);

                discordDMChannel.id = testId;
                discordDMChannel.type = 'DM';

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

                mockito.when(discordMessageMock.channel).thenReturn(discordDMChannel);

                discordMessage.content = testContent;
                discordMessage.author = discordUser;

                const message: Message = new DiscordMessageImplementation(discordMessage, new DiscordClientImplementation(discordClient));

                assert.strictEqual(message.content, testContent);
                assert.deepStrictEqual(message.author, testAuthor);
                assert.deepStrictEqual(message.channel, testChannel);
            }
        );

        it('can handle multi-messages.',
            async function ()
            {
                const message: Message = new DiscordMessageImplementation(discordMessage, new DiscordClientImplementation(discordClient));

                let longMessage = '';
                while (longMessage.length < 5000) // NOTE: Must be adjusted in case the limit is changed by Discord.
                {
                    longMessage += GeneralTestUtility.createRandomString();
                }

                await message.reply(longMessage);

                mockito.verify(discordMessageMock.reply(mockito.anyString())).times(3);
            }
        );
    }
);
