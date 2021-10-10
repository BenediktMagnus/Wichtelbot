import * as Discord from 'discord.js';

import { DiscordClient, DiscordMessage } from './wichtelbot/clients/discord';
import Config from './utility/config';
import Database from './wichtelbot/database';
import MessageHandler from './wichtelbot/message/messageHandler';

export default class Wichtelbot
{
    protected discordClient: Discord.Client;
    protected client: DiscordClient;
    protected database: Database;
    protected messageHandler: MessageHandler;

    constructor (inMemory = false)
    {
        this.database = new Database('main', 'log', inMemory);
        this.messageHandler = new MessageHandler(this.database);

        const intents = new Discord.Intents();
        intents.add(
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
        );

        this.discordClient = new Discord.Client({ intents });
        this.client = new DiscordClient(this.discordClient);

        this.discordClient.on('error',
            (error) =>
            {
                console.error(error);
            }
        );

        this.discordClient.on('message',
            async (discordMessage) =>
            {
                const message = new DiscordMessage(discordMessage, this.client);
                await this.messageHandler.process(message);
                // TODO: Get that abstraction back you removed!
            }
        );
    }

    public async login (): Promise<string>
    {
        // Start bot:
        await this.discordClient.login(Config.bot.token);

        const loginName = this.discordClient.user?.tag;

        if (loginName === undefined)
        {
            throw new Error('Failed to login to Discord, no user tag found.');
        }

        return loginName;
    }

    public terminate (): void
    {
        try
        {
            if (this.client)
            {
                this.discordClient.destroy();
            }
        }
        catch (error)
        {
            console.error(error);
        }

        try
        {
            if (this.database)
            {
                this.database.close();
            }
        }
        catch (error)
        {
            console.error(error);
        }
    }
}
