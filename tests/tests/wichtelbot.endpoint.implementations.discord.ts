import 'mocha';
import * as Discord from 'discord.js';
import * as DiscordEndpoint from '../../scripts/wichtelbot/endpoint/implementations/discord';
import * as mockito from 'ts-mockito';
import { assert } from 'chai';
import { ChannelType } from '../../scripts/wichtelbot/endpoint/definitions';

describe('discord client',
    function ()
    {
        let discordClient: Discord.Client;
        let discordUserMock: Discord.User;
        let discordUser: Discord.User;
        let discordDMChannelMock: Discord.DMChannel;
        let discordDMChannel: Discord.DMChannel;
        let discordMessageMock: Discord.Message;
        let discordMessage: Discord.Message;
        let discordInteractionMock: Discord.ButtonInteraction;
        let discordInteraction: Discord.ButtonInteraction;

        before(
            function ()
            {
                discordClient = mockito.instance(mockito.mock(Discord.Client) as Discord.Client);

                discordUserMock = mockito.mock(Discord.User);
                mockito.when(discordUserMock.displayName).thenCall(() => discordUser.globalName);
                discordUser = mockito.instance(discordUserMock);

                discordDMChannelMock = mockito.mock(Discord.DMChannel);
                discordDMChannel = mockito.instance(discordDMChannelMock);

                discordMessageMock = mockito.mock(Discord.Message);
                mockito.when(discordMessageMock.attachments).thenReturn(new Discord.Collection());
                discordMessage = mockito.instance(discordMessageMock);

                discordInteractionMock = mockito.mock(Discord.ButtonInteraction);
                mockito.when(discordInteractionMock.isButton()).thenReturn(true);
                discordInteraction = mockito.instance(discordInteractionMock);
                discordInteraction.type = Discord.InteractionType.MessageComponent;
                discordInteraction.componentType = Discord.ComponentType.Button;
            }
        );

        it('has working user class.',
            function ()
            {
                const testId = 'testId';
                const testName = 'testName';
                const testIsBot = true;

                discordUser.id = testId;
                discordUser.globalName = testName;
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

                mockito.when(discordDMChannelMock.isTextBased()).thenReturn(true);

                discordDMChannel.id = testId;
                discordDMChannel.type = Discord.ChannelType.DM;

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
                // TODO: This only tests button interactions.

                const testContent = 'testContent';
                const testAuthor = new DiscordEndpoint.User(discordUser);
                const testChannel = new DiscordEndpoint.Channel(discordDMChannel);

                mockito.when(discordInteractionMock.channel).thenReturn(discordDMChannel);

                discordInteraction.customId = testContent;
                discordInteraction.user = discordUser;

                const interaction = new DiscordEndpoint.Interaction(discordInteraction, new DiscordEndpoint.Client(discordClient));

                assert.strictEqual(interaction.content, testContent);
                assert.deepStrictEqual(interaction.author, testAuthor);
                assert.deepStrictEqual(interaction.channel, testChannel);
            }
        );
    }
);
