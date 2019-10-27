import Config from '../../utility/config';
import Localisation, { CommandInfo } from '../../utility/localisation';

import Database from '../database';

import State from './definitions/state';
import Message from './definitions/message';
import { ChannelType } from './definitions/channel';

import HandlingDefinition from './handlingTools/handlingDefinition';
import MessageFunction from './handlingTools/messageFunction';
import StateCommand from './handlingTools/stateCommand';
import StateCommandMap from './handlingTools/stateCommandMap';

import GeneralModule from './modules/general';

// TODO: Replace all toLowerCase with toLocaleLowerCase(locale) as soon as the draft ECMA-402 is accepted.

type CommandMap = Map<string, MessageFunction>;

// TODO: Documentation
export default class MessageHandler
{
    protected database: Database;

    protected generalModule: GeneralModule;

    // In private messages:
    protected stateCommands = new StateCommandMap();
    // In group/server channels:
    protected publicCommands: CommandMap = new Map<string, MessageFunction>();
    protected moderatorCommands: CommandMap = new Map<string, MessageFunction>();
    // Special:
    protected firstContact: MessageFunction = (message): void => this.generalModule.firstContact(message);
    protected messageNotUnterstood: MessageFunction = (message): void => this.generalModule.notUnderstood(message);

    /**
     * The handling definition is an object-based representation of the state/command handling structure.
     */
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
                handlerFunction: this.firstContact
            }
        ],
        moderatorCommands: [

        ]
    };

    constructor (database: Database)
    {
        this.database = database;

        this.generalModule = new GeneralModule(database);

        this.applyHandlingDefinition();
    }

    /**
     * Applies the handling definition by inserting the specifications into the usable map structure.
     */
    protected applyHandlingDefinition (): void
    {
        // State commands:
        for (const stateCommandDefinition of this.handlingDefinition.stateCommands)
        {
            this.prepareCommandInfo(stateCommandDefinition.commandInfo,
                (command: string): void =>
                {
                    const stateCommand = new StateCommand(stateCommandDefinition.state, command);

                    this.stateCommands.set(stateCommand, stateCommandDefinition.handlerFunction);
                }
            );
        }

        // Public commands:
        for (const commandDefinition of this.handlingDefinition.publicCommands)
        {
            this.prepareCommandInfo(commandDefinition.commandInfo,
                (command: string): void =>
                {
                    this.publicCommands.set(command, commandDefinition.handlerFunction);
                }
            );
        }

        // Moderation commands:
        for (const commandDefinition of this.handlingDefinition.moderatorCommands)
        {
            this.prepareCommandInfo(commandDefinition.commandInfo,
                (command: string): void =>
                {
                    this.moderatorCommands.set(command, commandDefinition.handlerFunction);
                }
            );
        }
    }

    /**
     * Prepares a single command info by converting it as needed and setting externalities. \
     * The applying of the command must be done by the caller via the apply callback.
     * @param commandInfo The command info to prepare.
     * @param apply A callback called for every command to apply.
     */
    protected prepareCommandInfo (commandInfo: CommandInfo, apply: (command: string) => void): void
    {
        for (let command of commandInfo.commands)
        {
            command = command.toLowerCase();

            apply(command);
        }
    }

    public process (message: Message): void
    {
        if (message.author.isBot)
        {
            // We will not process messages from bots like ourself.
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

            let messageFunction: MessageFunction | undefined;

            if (Config.main.moderationChannelIds.includes(message.channel.id))
            {
                // Moderation:
                messageFunction = this.moderatorCommands.get(message.command);
            }
            else
            {
                // Public commands (propably contacting):
                messageFunction = this.publicCommands.get(message.command);
            }

            if (messageFunction !== undefined)
            {
                this.database.log(message.author.id, message.author.tag, message.content, message.channel.id);

                messageFunction(message);
            }
        }
        else if (message.channel.type == ChannelType.Personal)
        {
            // Main command:

            this.database.log(message.author.id, message.author.tag, message.content);

            if (this.database.hasContact(message.author.id))
            {
                const author = this.database.getContact(message.author.id);

                const catchAllState = new StateCommand(author.state, '');

                if (this.stateCommands.has(catchAllState))
                {
                    // The contact state has a catch all command that accepts every input.
                    const messageFunction = this.stateCommands.get(catchAllState);
                    messageFunction(message);
                }
                else
                {
                    const stateCommand = new StateCommand(author.state, message.command);

                    if (this.stateCommands.has(stateCommand))
                    {
                        // There is a function available for this specific state command combination.
                        const messageFunction = this.stateCommands.get(stateCommand);
                        messageFunction(message);
                    }
                    else
                    {
                        // No specific or catch all function found.
                        this.messageNotUnterstood(message);
                    }
                }
            }
            else
            {
                // First contact:
                this.firstContact(message);
            }
        }
        else
        {
            // We must ignore channels of type "Ignore".
            return;
        }
    }
}
