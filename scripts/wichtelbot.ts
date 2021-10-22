import * as Discord from 'discord.js';
import * as DiscordEndpoint from './wichtelbot/endpoint/implementations/discord';
import Config from './utility/config';
import Database from './wichtelbot/database';
import MessageHandler from './wichtelbot/message/messageHandler';

export default class Wichtelbot
{
    protected discordClient: Discord.Client;
    protected client: DiscordEndpoint.Client;
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

        this.discordClient = new Discord.Client(
            {
                intents: intents,
                partials: ['CHANNEL']
                // NOTE: The partial is needed to receive direct messages, see https://github.com/discordjs/discord.js/issues/5687.
                // FIXME: Partials need special handling, see https://discordjs.guide/popular-topics/partials.html#handling-partial-data.
            }
        );
        this.client = new DiscordEndpoint.Client(this.discordClient);

        this.discordClient.on('error',
            (error) =>
            {
                console.error(error);
            }
        );

        this.discordClient.on('message',
            async (discordMessage) =>
            {
                const message = new DiscordEndpoint.Message(discordMessage, this.client);
                await this.messageHandler.process(message);
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
