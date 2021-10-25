import * as Discord from 'discord.js';
import { Channel, ChannelType, Component } from '../../definitions';
import { DiscordUtils } from './discordUtils';
import Utils from '../../../../utility/utils';

export class DiscordChannel implements Channel
{
    protected channel: Exclude<Discord.TextBasedChannels, Discord.ThreadChannel> | null;

    public readonly type: ChannelType;

    constructor (channel: Discord.Channel|Discord.TextBasedChannels)
    {
        // Determine channel type:
        if (!channel.isText())
        {
            this.type = ChannelType.Ignore;
            this.channel = null;
        }
        else
        {
            switch (channel.type)
            {
                case 'DM':
                    this.type = ChannelType.Personal;
                    this.channel = channel;
                    break;
                case 'GUILD_TEXT':
                case 'GUILD_NEWS': // TODO: Check what the news channel is for.
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

    public async send (text: string, components?: Component[], imageUrl?: string): Promise<void>
    {
        if (this.channel === null)
        {
            throw TypeError('Cannot access channel of this type.');
        }

        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageLength);

        await DiscordUtils.sendMultiMessage(this.channel.send.bind(this.channel), splittetText, components, imageUrl);
    }
}
