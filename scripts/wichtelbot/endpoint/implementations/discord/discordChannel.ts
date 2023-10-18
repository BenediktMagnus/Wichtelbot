import * as Discord from 'discord.js';
import { Additions, Channel, ChannelType } from '../../definitions';
import { DiscordUtils } from './discordUtils';
import Utils from '../../../../utility/utils';

export class DiscordChannel implements Channel
{
    // TODO: Should we include Discord threads here?
    protected channel: Discord.DMChannel | Discord.PartialDMChannel | Discord.TextChannel | null;

    public readonly type: ChannelType;

    constructor (channel: Discord.Channel)
    {
        // Determine channel type:
        if (!channel.isTextBased())
        {
            this.type = ChannelType.Ignore;
            this.channel = null;
        }
        else
        {
            switch (channel.type)
            {
                case Discord.ChannelType.DM:
                    this.type = ChannelType.Personal;
                    this.channel = channel;
                    break;
                case Discord.ChannelType.GuildText:
                    this.type = ChannelType.Server;
                    this.channel = channel;
                    break;
                // TODO: What to do with threads?
                default:
                    this.type = ChannelType.Ignore;
                    this.channel = null;
            }
        }
    }

    public get id (): string
    {
        if (this.channel === null)
        {
            throw TypeError('Cannot access channel of this type.');
        }

        return this.channel.id;
    }

    public async send (text: string, additions?: Additions): Promise<void>
    {
        if (this.channel === null)
        {
            throw TypeError('Cannot access channel of this type.');
        }

        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageLength);

        await DiscordUtils.sendMultiMessage(this.channel.send.bind(this.channel), splittetText, additions);
    }
}
