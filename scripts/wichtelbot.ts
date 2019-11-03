import * as Discord from 'discord.js';

import { DiscordClient, DiscordMessage } from './wichtelbot/clients/discord';
import Config from './utility/config';
import Database from './wichtelbot/database';
import MessageHandler from './wichtelbot/message/handler';

export default class Wichtelbot
{
    protected discordClient: Discord.Client;
    protected client: DiscordClient;
    protected database: Database;
    protected messageHandler: MessageHandler;

    constructor (onStarted: (loginName: string) => void, inMemory = false)
    {
        this.database = new Database('main', 'log', inMemory);
        this.messageHandler = new MessageHandler(this.database);

        this.discordClient = new Discord.Client();
        this.client = new DiscordClient(this.discordClient);

        this.discordClient.on('error',
            (error) =>
            {
                console.error(error);
            }
        );

        this.discordClient.on('message',
            (discordMessage) =>
            {
                const message = new DiscordMessage(discordMessage, this.client);
                this.messageHandler.process(message);
                // TODO: Get that abstraction back you removed!
            }
        );

        // Start bot:
        this.discordClient.login(Config.bot.token).then(
            () =>
            {
                onStarted(this.discordClient.user.tag);
            }
        );
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
