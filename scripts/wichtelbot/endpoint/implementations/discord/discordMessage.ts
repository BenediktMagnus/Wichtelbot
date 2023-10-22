import * as Discord from 'discord.js';
import { Additions, Message } from '../../definitions';
import { DiscordChannel } from './discordChannel';
import { DiscordClient } from './discordClient';
import { DiscordUser } from './discordUser';
import { DiscordUtils } from './discordUtils';
import Localisation from '../../../../utility/localisation';
import { MessageWithParser } from '../../base/messageWithParser';
import Utils from '../../../../utility/utils';

export class DiscordMessage extends MessageWithParser implements Message
{
    protected message: Discord.Message;
    protected responsibleClient: DiscordClient;

    public readonly hasComponentOrigin: boolean;

    constructor (message: Discord.Message, responsibleClient: DiscordClient)
    {
        super();

        this.message = message;
        this.responsibleClient = responsibleClient;
        // NOTE: We could use the Discord.Message.client property here, but because we then needed
        //       to create a new DiscordClient instance, this would create a circular dependency.

        this.hasComponentOrigin = false;
    }

    public get content (): string
    {
        if ((this.message.attachments.size != 0) && (this.message.content.length == 0))
        {
            return Localisation.commands.file.commands[0];
        }
        else
        {
            return this.message.content;
        }
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

    public async reply (text: string, additions?: Additions): Promise<void>
    {
        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageWithMentionLength);

        await DiscordUtils.sendMultiMessage(this.message.channel.send.bind(this.message.channel), splittetText, additions);
    }
}
