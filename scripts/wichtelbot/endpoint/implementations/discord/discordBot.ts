import * as Discord from 'discord.js';
import Config from '../../../../utility/config';
import { DiscordClient } from './discordClient';
import { DiscordInteraction } from './discordInteraction';
import { DiscordMessage } from './discordMessage';
import MessageHandler from '../../../message/messageHandler';

export class DiscordBot
{
    /** The client from the discord.js library. */
    private nativeClient: Discord.Client;
    /** The endpoint's client implementation. */
    private client: DiscordClient;
    private messageHandler: MessageHandler;

    constructor (messageHander: MessageHandler)
    {
        this.messageHandler = messageHander;

        const intents = new Discord.IntentsBitField(
            [
                Discord.GatewayIntentBits.Guilds,
                Discord.GatewayIntentBits.GuildMessages,
                Discord.GatewayIntentBits.DirectMessages,
                Discord.GatewayIntentBits.DirectMessageReactions,
                Discord.GatewayIntentBits.MessageContent,
            ]
        );

        const partials = [
            Discord.Partials.Channel,
        ];

        this.nativeClient = new Discord.Client(
            {
                intents: intents,
                partials: partials
                // NOTE: The partial is needed to receive direct messages, see https://github.com/discordjs/discord.js/issues/5687.
                // FIXME: Partials need special handling, see https://discordjs.guide/popular-topics/partials.html#handling-partial-data.
            }
        );

        this.client = new DiscordClient(this.nativeClient);

        this.nativeClient.on('error', this.onError.bind(this));
        this.nativeClient.on('messageCreate', this.onMessage.bind(this));
        this.nativeClient.on('interactionCreate', this.onInteraction.bind(this));
    }

    private onError (error: Error): void
    {
        console.error(error);
    }

    private async onMessage (discordMessage: Discord.Message): Promise<void>
    {
        if (discordMessage.system)
        {
            // Ignore system messages as they are not meant for the bot and it cannot be replied to them.
            return;
        }

        const message = new DiscordMessage(discordMessage, this.client);
        await this.messageHandler.process(message);
    }

    private async onInteraction (discordInteraction: Discord.Interaction): Promise<void>
    {
        const interaction = new DiscordInteraction(discordInteraction, this.client);
        await interaction.fetchIfNecessary();

        await interaction.defer();
        await this.messageHandler.process(interaction);
    }

    /**
     * @returns The Discord user name.
     */
    public async login (): Promise<string>
    {
        await this.nativeClient.login(Config.bot.token);

        const loginName = this.nativeClient.user?.tag;

        if (loginName === undefined)
        {
            throw new Error('Failed to login to Discord, no user tag found.');
        }

        const commands = this.loadCommands();
        await this.registerCommands(commands);

        return loginName;
    }

    private loadCommands (): Discord.SlashCommandBuilder[]
    {
        const slashCommands: Discord.SlashCommandBuilder[] = [];

        // Public commands:
        for (const command of this.messageHandler.handlingDefinition.publicCommands)
        {
            const slashCommand = new Discord.SlashCommandBuilder();
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

    private async registerCommands (commands: Discord.SlashCommandBuilder[]): Promise<void>
    {
        const discordRestApi = new Discord.REST(
            {
                version: '9'
            }
        );

        discordRestApi.setToken(Config.bot.token);

        const guilds = this.nativeClient.guilds.cache.values();

        const commandsAsJsonArray = commands.map(command => command.toJSON());

        // We do not register global commands but instead register all commands in all guilds.
        // This prevents the one hour cache restriction of the Discord API.
        for (const guild of guilds)
        {
            await discordRestApi.put(
                Discord.Routes.applicationGuildCommands(
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
        if (this.client)
        {
            this.nativeClient.destroy();
        }
    }
}
