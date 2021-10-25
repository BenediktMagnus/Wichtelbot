import * as Discord from 'discord.js';
import { Component, Message } from '../../definitions';
import { DiscordChannel } from './discordChannel';
import { DiscordClient } from './discordClient';
import { DiscordUser } from './discordUser';
import { DiscordUtils } from './discordUtils';
import { MessageWithParser } from '../../base/messageWithParser';
import Utils from '../../../../utility/utils';

export class DiscordMessage extends MessageWithParser implements Message
{
    protected message: Discord.Message;
    protected responsibleClient: DiscordClient;

    constructor (message: Discord.Message, responsibleClient: DiscordClient)
    {
        super();

        this.message = message;
        this.responsibleClient = responsibleClient;
        // NOTE: We could use the Discord.Message.client property here, but because we then needed
        //       to create a new DiscordClient instance, this would create a circular dependency.
    }

    public get content (): string
    {
        return this.message.content;
    }

    public get author (): DiscordUser
    {
        const author = new DiscordUser(this.message.author);

        return author;
    }

    public get channel (): DiscordChannel
    {
        const channel = new DiscordChannel(this.message.channel);

        return channel;
    }

    public get client (): DiscordClient
    {
        return this.responsibleClient;
    }

    public async reply (text: string, components?: Component[], imageUrl?: string): Promise<void>
    {
        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageWithMentionLength);

        await DiscordUtils.sendMultiMessage(this.message.reply.bind(this.message), splittetText, components, imageUrl);

        /* TODO: This is really only needed for the Steckbrief.
                 Instead of naively splitting the text, we could create an embed for each part. It has a title for the question of the
                 Steckbrief and a description for the answer with a length limit of 4096 (much more than the 2000 of a message).
        */
    }
}
