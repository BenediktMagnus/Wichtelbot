import * as Discord from 'discord.js';
import Client from '../../definitions/client';
import { DiscordChannel } from './discordChannel';
import { DiscordUser } from './discordUser';

/**
 * Client implementation for discord.js.
 */
export class DiscordClient implements Client
{
    protected client: Discord.Client;

    constructor (client: Discord.Client)
    {
        this.client = client;
    }

    public getChannel (id: string): DiscordChannel
    {
        const channel = this.client.channels.cache.get(id); // TODO: Shouldn't this be fetched, too?

        if (channel === undefined)
        {
            throw ReferenceError('');
        }
        else
        {
            return new DiscordChannel(channel);
        }
    }

    public async fetchUser (id: string): Promise<DiscordUser>
    {
        const discordUser = await this.client.users.fetch(id);

        const user = new DiscordUser(discordUser);

        return user;
    }
}
