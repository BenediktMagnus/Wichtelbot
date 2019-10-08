import * as Discord from 'discord.js';

import UserDefiniton from '../../message/definitions/user';

export default class User implements UserDefiniton
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
        if (imageUrl === undefined)
        {
            this.user.send(text);
        }
        else
        {
            const attachment = new Discord.Attachment(imageUrl);
            this.user.send(text, attachment);
        }
    }
}
