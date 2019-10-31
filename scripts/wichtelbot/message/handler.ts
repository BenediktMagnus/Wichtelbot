import Config from '../../utility/config';
import { CommandInfo } from '../../utility/localisation';

import Database from '../database';

import State from './definitions/state';
import Message from './definitions/message';
import { ChannelType } from './definitions/channel';

import HandlingDefinition from './handlingDefinition';
import MessageFunction from './handlingTools/messageFunction';
import StateCommand from './handlingTools/stateCommand';
import StateCommandMap from './handlingTools/stateCommandMap';

import GeneralModule from './modules/generalModule';
import InformationModule from './modules/informationModule';

// TODO: Replace all toLowerCase with toLocaleLowerCase(locale) as soon as the draft ECMA-402 is accepted.

type CommandMap = Map<string, MessageFunction>;

// TODO: Documentation
export default class MessageHandler
{
    protected database: Database;

    protected generalModule: GeneralModule;
    protected informationModule: InformationModule;

    // In private messages:
    protected stateCommands = new StateCommandMap();
    // In group/server channels:
    protected publicCommands: CommandMap = new Map<string, MessageFunction>();
    protected moderatorCommands: CommandMap = new Map<string, MessageFunction>();
    // Special:
    protected firstContact: MessageFunction = (message): void => this.generalModule.firstContact(message);
    protected messageNotUnterstood = (message: Message, availableCommands: CommandInfo[]): void => this.generalModule.notUnderstood(message, availableCommands);

    /**
     * The handling definition is an object-based representation of the state/command handling structure.
     */
    protected readonly handlingDefinition: HandlingDefinition;

    /**
     * Containts a list of commands for every state.
     * This allows us to determine which commands could be executed in the current state.
     */
    protected commandListsForEveryState = new Map<State, CommandInfo[]>();

    constructor (database: Database)
    {
        this.database = database;

        this.generalModule = new GeneralModule(database);
        this.informationModule = new InformationModule(database);

        this.handlingDefinition = new HandlingDefinition(this.generalModule, this.informationModule);

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
            // For every command, fill it into the command map:
            this.prepareCommandInfo(stateCommandDefinition.commandInfo,
                (command: string): void =>
                {
                    const stateCommand = new StateCommand(stateCommandDefinition.state, command);

                    this.stateCommands.set(stateCommand, stateCommandDefinition.handlerFunction);
                }
            );

            // Fill the command list for this state:
            let commandList: CommandInfo[] = [];

            const givenCommandList = this.commandListsForEveryState.get(stateCommandDefinition.state);
            if (givenCommandList !== undefined)
            {
                commandList = givenCommandList;
            }

            commandList.push(stateCommandDefinition.commandInfo);
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

    /**
     * Tries to find a state command and returns if it has been called.
     * @param stateCommand The state command to search for.
     * @param message The message to call the command with.
     * @return True if the state command has been found and called.
     */
    protected tryToCallStateCommand (stateCommand: StateCommand, message: Message): boolean
    {
        if (this.stateCommands.has(stateCommand))
        {
            // There is a function available for this specific state command combination.
            const messageFunction = this.stateCommands.get(stateCommand);
            messageFunction(message);

            return true;
        }
        else
        {
            return false;
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
                // Public commands (probably contacting):
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
            this.database.log(message.author.id, message.author.tag, message.content);

            if (this.database.hasContact(message.author.id))
            {
                const contact = this.database.getContact(message.author.id);

                if (!this.tryToCallStateCommand(new StateCommand(contact.state, ''), message) && // Catch all
                    !this.tryToCallStateCommand(new StateCommand(contact.state, message.command), message) && // Specific state command
                    !this.tryToCallStateCommand(new StateCommand(State.Nothing, message.command), message)) // Stateless command
                {
                    // No function found.

                    let availableStateCommands = this.commandListsForEveryState.get(contact.state);
                    if (availableStateCommands === undefined)
                    {
                        availableStateCommands = [];
                    }

                    let availableStatelessCommands = this.commandListsForEveryState.get(State.Nothing);
                    if (availableStatelessCommands === undefined)
                    {
                        availableStatelessCommands = [];
                    }

                    const availableCommands = availableStateCommands.concat(availableStatelessCommands);

                    this.messageNotUnterstood(message, availableCommands);
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
