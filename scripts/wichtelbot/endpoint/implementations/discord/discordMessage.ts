import * as Discord from 'discord.js';
import { DiscordChannel } from './discordChannel';
import { DiscordClient } from './discordClient';
import { DiscordUser } from './discordUser';
import { DiscordUtils } from './discordUtils';
import Message from '../../definitions/message';
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

    public async reply (text: string): Promise<void>
    {
        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageWithMentionLength);

        for (const messageText of splittetText)
        {
            await this.message.reply(messageText);
        }
    }
}
