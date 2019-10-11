import Config from '../../utility/config';
import Localisation from '../../utility/localisation';

import Database from '../database';

import State from './definitions/state';
import Message from './definitions/message';
import { ChannelType } from './definitions/channel';
import { CommandInfo } from '../../utility/localisation';

import HandlingDefinition from './handlingTools/handlingDefinition';
import MessageFunction from './handlingTools/messageFunction';
import StateCommand from './handlingTools/stateCommand';
import StateCommandMap from './handlingTools/stateCommandMap';

import GeneralModule from './modules/general';

// TODO: Replace all toLowerCase with toLocalLowerCase(locale) as soon as the draft ECMA-402 is accepted.

type CommandMap = Map<string, MessageFunction>;

// TODO: Documentation
export default class MessageHandler
{
    protected database: Database;

    protected generalModule: GeneralModule;

    protected readonly handlingDefinition: HandlingDefinition = {
        stateCommands: [
            {
                state: State.Nothing,
                commandInfo: Localisation.commands.goodMorning,
                handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.goodMorning)
            }
        ],
        publicCommands: [
            {
                commandInfo: Localisation.commands.contacting,
                handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.contacting)
            }
        ],
        moderatorCommands: [

        ]
    };

    protected commandMaxLength = 0;

    // In private messages:
    protected stateCommands = new StateCommandMap();
    // In group/server channels:
    protected publicCommands: CommandMap = new Map<string, MessageFunction>();
    protected moderatorCommands: CommandMap = new Map<string, MessageFunction>();
    // Special:
    protected messageNotUnterstood: MessageFunction;

    constructor (database: Database)
    {
        this.database = database;

        this.generalModule = new GeneralModule(database);

        this.applyHandlingDefinition();

        this.messageNotUnterstood = (message): void => this.generalModule.notUnderstood(message);
    }

    protected applyHandlingDefinition (): void
    {
        // State commands:
        for (const stateCommandDefinition of this.handlingDefinition.stateCommands)
        {
            for (let command of stateCommandDefinition.commandInfo.commands)
            {
                command = command.toLowerCase();

                const stateCommand = new StateCommand(stateCommandDefinition.state, command);

                this.stateCommands.set(stateCommand, stateCommandDefinition.handlerFunction);
            }
        }

        // Public commands:
        for (const commandDefinition of this.handlingDefinition.publicCommands)
        {
            for (let command of commandDefinition.commandInfo.commands)
            {
                command = command.toLowerCase();

                this.publicCommands.set(command, commandDefinition.handlerFunction);
            }
        }

        // Moderation commands:
        for (const commandDefinition of this.handlingDefinition.moderatorCommands)
        {
            for (let command of commandDefinition.commandInfo.commands)
            {
                command = command.toLowerCase();

                this.moderatorCommands.set(command, commandDefinition.handlerFunction);
            }
        }
    }

    public process (message: Message): void
    {
        if (message.author.isBot)
        {
            // We will not process messages from bots like ourselves.
            // Prevents bot ping pong...
            return;
        }

        if ((message.channel.type == ChannelType.Server) || message.channel.type == ChannelType.Group)
        {
            if (!message.content.startsWith(Config.main.commandPrefix))
            {
                // We ignore messages on servers that do not start with the defined message prefix.
                return;
            }

            if (Config.main.moderationChannelIds.includes(message.channel.id))
            {
                // Moderation
            }
            else
            {
                // Kontaktaufnahme
            }
        }
        else if (message.channel.type == ChannelType.Personal)
        {
            // Befehl
        }
        else
        {
            // We must ignore channels of type "Ignore".
            return;
        }
    }
}
