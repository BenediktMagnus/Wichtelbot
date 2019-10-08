import * as Discord from 'discord.js';

import { ChannelType, Channel as ChannelDefinition } from '../../message/definitions/channel';

export class Channel implements ChannelDefinition
{
    protected channel: Discord.DMChannel | Discord.GroupDMChannel | Discord.TextChannel | null;

    public readonly type: ChannelType;

    constructor (channel: Discord.Channel)
    {
        // Determine channel type:
        switch (channel.type)
        {
            case 'dm':
                this.type = ChannelType.Personal;
                this.channel = channel as Discord.DMChannel;
                break;
            case 'group':
                this.type = ChannelType.Group;
                this.channel = channel as Discord.GroupDMChannel;
                break;
            case 'text':
            case 'news': // TODO: Check what the news channel is for.
                this.type = ChannelType.Server;
                this.channel = channel as Discord.TextChannel;
                break;
            default:
                this.type = ChannelType.Ignore;
                this.channel = null;
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

    public send (text: string, imageUrl?: string): void
    {
        if (this.channel === null)
        {
            throw TypeError('Cannot access channel of this type.');
        }

        if (imageUrl === undefined)
        {
            this.channel.send(text);
        }
        else
        {
            const attachment = new Discord.Attachment(imageUrl);
            this.channel.send(text, attachment);
        }
    }
}
