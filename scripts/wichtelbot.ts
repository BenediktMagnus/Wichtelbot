import * as Discord from 'discord.js';
import * as DiscordEndpoint from './wichtelbot/endpoint/implementations/discord';
import Config from './utility/config';
import Database from './wichtelbot/database';
import { REST as DiscordRestApi } from '@discordjs/rest';
import { Routes as DiscordRoutes } from 'discord-api-types/v9';
import MessageHandler from './wichtelbot/message/messageHandler';
import { SlashCommandBuilder } from '@discordjs/builders';

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
            Discord.Intents.FLAGS.GUILDS,
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

        this.discordClient.on('messageCreate',
            async (discordMessage) =>
            {
                const message = new DiscordEndpoint.Message(discordMessage, this.client);
                await this.messageHandler.process(message);
            }
        );

        this.discordClient.on('interactionCreate',
            async (discordInteraction) =>
            {
                const interaction = new DiscordEndpoint.Interaction(discordInteraction, this.client);
                await interaction.defer();
                await this.messageHandler.process(interaction);
            }
        );
    }

    public async run (): Promise<string>
    {
        // Start bot:
        await this.discordClient.login(Config.bot.token);

        const loginName = this.discordClient.user?.tag;

        if (loginName === undefined)
        {
            throw new Error('Failed to login to Discord, no user tag found.');
        }

        const commands = this.loadCommands();
        await this.registerCommands(commands);

        return loginName;
    }

    private loadCommands (): SlashCommandBuilder[]
    {
        const slashCommands: SlashCommandBuilder[] = [];

        // Public commands:
        for (const command of this.messageHandler.handlingDefinition.publicCommands)
        {
            const slashCommand = new SlashCommandBuilder();
            slashCommand.setDefaultPermission(true);

            const commandName = this.formatCommand(command.commandInfo.commands[0]); // Only the first command name is used.

            slashCommand.setName(commandName);

            if (command.commandInfo.info !== undefined)
            {
                slashCommand.setDescription(command.commandInfo.info);
            }
            else
            {
                slashCommand.setDescription('Wichtelbot'); // TODO: Enforce an info field or use a default description?
            }

            slashCommands.push(slashCommand);
        }

        return slashCommands;
    }

    /**
     * Format a command name for use in a Discord (slash) command.
     */
    private formatCommand (command: string): string
    {
        let result = command.toLocaleLowerCase();
        result = result.replace(/\s/g, ''); // Remove spaces.
        result = result.replace(/[^\x20-\x7F]/g, ''); // Remove non-ASCII and non-visible characters.

        return result;
    }

    private async registerCommands (commands: SlashCommandBuilder[]): Promise<void>
    {
        const discordRestApi = new DiscordRestApi(
            {
                version: '9'
            }
        );

        discordRestApi.setToken(Config.bot.token);

        const guilds = this.discordClient.guilds.cache.values();

        const commandsAsJsonArray = commands.map(command => command.toJSON());

        // We do not register global commands but instead register all commands in all guilds.
        // This prevents the one hour cache restriction of the Discord API.
        for (const guild of guilds)
        {
            await discordRestApi.put(
                DiscordRoutes.applicationGuildCommands(
                    Config.bot.clientId, guild.id
                ),
                {
                    body: commandsAsJsonArray
                }
            ) as { id: Discord.Snowflake}[];
        }
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
