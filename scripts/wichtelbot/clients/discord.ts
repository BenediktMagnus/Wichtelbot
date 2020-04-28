import * as Discord from 'discord.js';

import { Channel, ChannelType } from '../message/definitions/channel';
import Client from '../message/definitions/client';
import Message from '../message/definitions/message';
import { MessageWithParser } from '../message/definitions/message';
import User from '../message/definitions/user';
import Utils from '../../utility/utils';

const safetyMargin = 16;
const maxMessageLength = 2000 - safetyMargin;
const maxUserNameLength = 32; // Alternatively maxUserIdLength = 20 should be enough, but this is safe.
const maxMentionLength = maxUserNameLength + 5; // Because of the following format: <@&user> and the space
const maxMessageWithMentionLength = maxMessageLength - maxMentionLength;

type SendMessage = (message: string, attachment?: Discord.Attachment) => any;

abstract class DiscordUtils
{
    public static sendMultiMessage (sendMessage: SendMessage, messageTexts: string[], imageUrl?: string): void
    {
        let entryCounter = messageTexts.length - 1;
        for (const messageText of messageTexts)
        {
            if ((imageUrl !== undefined) && (entryCounter === 0))
            {
                // The image must be attached to the last message we send.
                const attachment = new Discord.Attachment(imageUrl);
                sendMessage(messageText, attachment);
            }
            else
            {
                sendMessage(messageText);
            }

            entryCounter--;
        }
    }
}

export class DiscordUser implements User
{
    protected user: Discord.User;

    constructor (user: Discord.User)
    {
        this.user = user;
    }

    public get id (): string
    {
        return this.user.id;
    }

    public get tag (): string
    {
        return this.user.tag;
    }

    public get name (): string
    {
        return this.user.username;
    }

    public get isBot (): boolean
    {
        return this.user.bot;
    }

    public send (text: string, imageUrl?: string): void
    {
        const splittetText = Utils.splitTextNaturally(text, maxMessageLength);

        DiscordUtils.sendMultiMessage(this.user.send.bind(this.user), splittetText, imageUrl);
    }
}

export class DiscordChannel implements Channel
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

        const splittetText = Utils.splitTextNaturally(text, maxMessageLength);

        DiscordUtils.sendMultiMessage(this.channel.send.bind(this.channel), splittetText, imageUrl);
    }
}

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

    public reply (text: string): void
    {
        const splittetText = Utils.splitTextNaturally(text, maxMessageWithMentionLength);

        for (const messageText of splittetText)
        {
            this.message.reply(messageText);
        }
    }
}

/**
 * Client implementation for discord.js.
 */
export class DiscordClient implements Client
{
    protected client: Discord.Client;

    constructor (client?: Discord.Client)
    {
        if (client === undefined)
        {
            this.client = new Discord.Client();
        }
        else
        {
            this.client = client;
        }
    }

    public getChannel (id: string): DiscordChannel
    {
        const channel = this.client.channels.get(id);

        if (channel === undefined)
        {
            throw ReferenceError('');
        }
        else
        {
            return new DiscordChannel(channel);
        }
    }

    public fetchUser (id: string): Promise<DiscordUser>
    {
        // Argh, promises...
        // This returns a promise for giving back a User instance.
        // In this promise, we call the Discord client to fetch a user.
        // It gives us back a promise for a user. If this action succeeded
        // we resolve the promise with a converted user instance.
        // If an error occurs, we pass it through.
        const result = new Promise<DiscordUser>(
            (resolve, reject): void => {
                const fetch = this.client.fetchUser(id);

                fetch.then(
                    (discordUser: Discord.User) => {
                        const user = new DiscordUser(discordUser);
                        resolve(user);
                    }
                );

                fetch.catch(
                    (reason: any) => {
                        reject(reason);
                    }
                );
            }
        );

        return result;
    }
}
