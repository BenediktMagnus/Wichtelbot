import * as Discord from 'discord.js';

import ClientDefinition from '../../message/definitions/client';

import User from "./user";
import Message from "./message";
import { Channel } from "./channel";

/**
 * Client implementation for discord.js.
 */
export default class Client implements ClientDefinition
{
    protected client: Discord.Client;

    constructor ()
    {
        this.client = new Discord.Client();
    }

    public set onError (listener: (error: Error) => void)
    {
        this.client.on('error', listener);
    }

    public set onMessage (listener: (message: Message) => void)
    {
        this.client.on('message',
            (discordMessage: Discord.Message) => {
                const message = new Message(discordMessage);
                listener(message);
            }
        );
    }

    public getChannel (id: string): Channel
    {
        const channel = this.client.channels.get(id);

        if (channel === undefined)
        {
            throw ReferenceError('');
        }
        else
        {
            return new Channel(channel);
        }
    }

    public fetchUser (id: string): Promise<User>
    {
        // Argh, promises...
        // This returns a promise for giving back a User instance.
        // In this promise, we call the Discord client to fetch a user.
        // It gives us back a promise for a user. If this action succeeded
        // we resolve the promise with a converted user instance.
        // If an error occurs, we pass it through.
        const result = new Promise<User>(
            (resolve, reject): void => {
                const fetch = this.client.fetchUser(id);

                fetch.then(
                    (discordUser: Discord.User) => {
                        const user = new User(discordUser);
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
