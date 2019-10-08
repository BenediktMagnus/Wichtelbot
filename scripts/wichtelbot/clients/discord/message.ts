import { Message as DiscordMessage } from 'discord.js';

import MessageDefinition from '../../message/definitions/message';
import { Channel } from './channel';
import User from './user';

export default class Message implements MessageDefinition
{
    protected message: DiscordMessage;

    constructor (message: DiscordMessage)
    {
        this.message = message;
    }

    public get content (): string
    {
        return this.message.content;
    }

    public get author (): User
    {
        const author = new User(this.message.author);

        return author;
    }

    public get channel (): Channel
    {
        const channel = new Channel(this.message.channel);

        return channel;
    }

    public reply (text: string): void
    {
        this.message.reply(text);
    }
}
