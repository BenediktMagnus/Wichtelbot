import 'mocha';
import * as Discord from 'discord.js';
import * as DiscordEndpoint from '../../scripts/wichtelbot/endpoint/implementations/discord';
import * as mockito from 'ts-mockito';
import { assert } from 'chai';
import { ChannelType } from '../../scripts/wichtelbot/endpoint/definitions';
import Config from '../../scripts/utility/config';
import GeneralTestUtility from '../utility/general';

describe('discord client',
    function ()
    {
        let discordClient: Discord.Client;
        let discordUser: Discord.User;
        let discordDMChannelMock: Discord.DMChannel;
        let discordDMChannel: Discord.DMChannel;
        let discordMessageMock: Discord.Message;
        let discordMessage: Discord.Message;
        let discordInteractionMock: Discord.MessageComponentInteraction;
        let discordInteraction: Discord.MessageComponentInteraction;

        before(
            function ()
            {
                discordClient = mockito.instance(mockito.mock(Discord.Client) as Discord.Client);
                discordUser = mockito.instance(mockito.mock(Discord.User));

                discordDMChannelMock = mockito.mock(Discord.DMChannel);
                discordDMChannel = mockito.instance(discordDMChannelMock);

                discordMessageMock = mockito.mock(Discord.Message);
                discordMessage = mockito.instance(discordMessageMock);

                discordInteractionMock = mockito.mock(Discord.MessageComponentInteraction);
                mockito.when(discordInteractionMock.isMessageComponent()).thenReturn(true);
                discordInteraction = mockito.instance(discordInteractionMock);
                discordInteraction.type = 'MESSAGE_COMPONENT';
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

                const user = new DiscordEndpoint.User(discordUser);

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

                const channel = new DiscordEndpoint.Channel(discordDMChannel);

                assert.strictEqual(channel.id, testId);
                assert.strictEqual(channel.type, testType);
            }
        );

        it('has working message class.',
            function ()
            {
                const testContent = 'testContent';
                const testAuthor = new DiscordEndpoint.User(discordUser);
                const testChannel = new DiscordEndpoint.Channel(discordDMChannel);

                mockito.when(discordMessageMock.channel).thenReturn(discordDMChannel);

                discordMessage.content = testContent;
                discordMessage.author = discordUser;

                const message = new DiscordEndpoint.Message(discordMessage, new DiscordEndpoint.Client(discordClient));

                assert.strictEqual(message.content, testContent);
                assert.deepStrictEqual(message.author, testAuthor);
                assert.deepStrictEqual(message.channel, testChannel);
            }
        );

        it('has working interaction class.',
            function ()
            {
                // TODO: This only tests message component interactions.

                const testContent = 'testContent';
                const testAuthor = new DiscordEndpoint.User(discordUser);
                const testChannel = new DiscordEndpoint.Channel(discordDMChannel);

                const expectedContent = Config.main.commandPrefix + 'testContent';

                mockito.when(discordInteractionMock.channel).thenReturn(discordDMChannel);

                discordMessage.content = testContent;
                discordMessage.author = discordUser;
                discordInteraction.message = discordMessage;
                discordInteraction.user = discordUser;

                const interaction = new DiscordEndpoint.Interaction(discordInteraction, new DiscordEndpoint.Client(discordClient));

                assert.strictEqual(interaction.content, expectedContent);
                assert.deepStrictEqual(interaction.author, testAuthor);
                assert.deepStrictEqual(interaction.channel, testChannel);
            }
        );

        it('can handle multi-messages.',
            async function ()
            {
                const message = new DiscordEndpoint.Message(discordMessage, new DiscordEndpoint.Client(discordClient));

                let longMessage = '';
                while (longMessage.length < 5000) // NOTE: Must be adjusted in case the limit is changed by Discord.
                {
                    longMessage += GeneralTestUtility.createRandomString();
                }

                await message.reply(longMessage);

                mockito.verify(discordMessageMock.reply(mockito.anything())).times(3);
            }
        );
    }
);
