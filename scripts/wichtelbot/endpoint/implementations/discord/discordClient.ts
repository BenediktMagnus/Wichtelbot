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

    public async fetchChannel (id: string): Promise<DiscordChannel>
    {
        const channel = await this.client.channels.fetch(id);

        if (channel === null)
        {
            throw ReferenceError(`Could not fetch Discord channel with id ${id}`);
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
