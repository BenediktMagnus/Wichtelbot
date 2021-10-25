import * as DiscordEndpoint from './wichtelbot/endpoint/implementations/discord';
import Database from './wichtelbot/database';
import MessageHandler from './wichtelbot/message/messageHandler';

export default class Wichtelbot
{
    protected discordBot: DiscordEndpoint.Bot;
    protected database: Database;
    protected messageHandler: MessageHandler;

    constructor (inMemory = false)
    {
        this.database = new Database('main', 'log', inMemory);
        this.messageHandler = new MessageHandler(this.database);
        this.discordBot = new DiscordEndpoint.Bot(this.messageHandler);
    }

    public async run (): Promise<void>
    {
        const discordName = await this.discordBot.login();

        console.log(`Discord login name: "${discordName}"`);
    }

    public terminate (): void
    {
        try
        {
            if (this.discordBot)
            {
                this.discordBot.terminate();
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
