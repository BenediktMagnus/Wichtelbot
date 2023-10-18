import * as Discord from 'discord.js';
import { Additions, User } from '../../definitions';
import { DiscordUtils } from './discordUtils';
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
        return this.user.displayName;
    }

    public get isBot (): boolean
    {
        return this.user.bot;
    }

    public async send (text: string, additions: Additions): Promise<void>
    {
        const splittetText = Utils.splitTextNaturally(text, DiscordUtils.maxMessageLength);

        await DiscordUtils.sendMultiMessage(this.user.send.bind(this.user), splittetText, additions);
    }
}
