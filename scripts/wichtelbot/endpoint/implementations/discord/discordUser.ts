import * as Discord from 'discord.js';
import { DiscordUtils } from './discordUtils';
import User from '../../definitions/user';
import Utils from '../../../../utility/utils';

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
        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageLength);

        DiscordUtils.sendMultiMessage(this.user.send.bind(this.user), splittetText, imageUrl);
    }
}
