import { ChannelType, Message, State } from '../endpoint/definitions';
import Localisation, { CommandInfo } from '../../utility/localisation';
import { AssignmentModule } from './modules/assignmentModule';
import { CommandHandlerFunction } from './handlingTools/handlerFunctions';
import Config from '../../utility/config';
import Database from '../database/database';
import GeneralModule from './modules/generalModule';
import HandlingDefinition from './handlingDefinition';
import InformationModule from './modules/informationModule';
import { ModerationModule } from './modules/moderationModule';
import StateCommand from './handlingTools/stateCommand';
import StateCommandMap from './handlingTools/stateCommandMap';

type CommandMap = Map<string, CommandHandlerFunction>;

enum CommandCallResult
{
    Called = 'called',
    NotFound = 'notFound',
    /** Found but the state expects a component origin which is not given. */
    MissingComponentOrigin = 'missingComponentOrigin',
}

// TODO: Documentation
export default class MessageHandler
{
    // TODO: Make everything private instead of protected (the same for every class where protected is not needed).
    // TODO: Initialise all fields in the constructor only, not in the declaration (the same for every other class).

    protected database: Database;

    protected generalModule: GeneralModule;
    protected informationModule: InformationModule;
    protected moderationModule: ModerationModule;
    protected assignmentModule: AssignmentModule;

    // In private messages:
    protected stateCommands = new StateCommandMap();
    protected helpCommands: string[] = [];
    // In group/server channels:
    protected publicCommands: CommandMap = new Map<string, CommandHandlerFunction>();
    protected moderatorCommands: CommandMap = new Map<string, CommandHandlerFunction>();

    protected componentExpectedStates: Set<State> = new Set();

    /**
     * The handling definition is an object-based representation of the state/command handling structure.
     */
    public readonly handlingDefinition: HandlingDefinition;

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
        this.moderationModule = new ModerationModule(database);
        this.assignmentModule = new AssignmentModule(database);

        this.handlingDefinition = new HandlingDefinition(
            this.generalModule,
            this.informationModule,
            this.moderationModule,
            this.assignmentModule
        );

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
            if (stateCommandDefinition.expectsComponentResult)
            {
                this.componentExpectedStates.add(stateCommandDefinition.state);
            }

            if (stateCommandDefinition.paths === null)
            {
                const stateCommand = new StateCommand(stateCommandDefinition.state, '');

                this.stateCommands.set(stateCommand, stateCommandDefinition.handlerFunction);
            }
            else
            {
                for (const path of stateCommandDefinition.paths)
                {
                    this.prepareCommandInfo(path.command,
                        (command: string): void =>
                        {
                            const stateCommand = new StateCommand(stateCommandDefinition.state, command);

                            this.stateCommands.set(
                                stateCommand,
                                async (message) => stateCommandDefinition.handlerFunction(message, path.result)
                            );
                        }
                    );
                }

                const commandList = stateCommandDefinition.paths.map((path) => path.command);
                this.commandListsForEveryState.set(stateCommandDefinition.state, commandList);
            }
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

        // Help commands:
        this.prepareCommandInfo(Localisation.commands.help,
            (command: string): void =>
            {
                this.helpCommands.push(command);
            }
        );
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
            command = command.toLocaleLowerCase();

            apply(command);
        }
    }

    /**
     * Tries to find a state command and returns if it has been called.
     * @param message The message to call the command with.
     * @param state The state of the user that sent the message.
     * @return True if the state command has been found and called.
     */
    protected async tryToCallCommand (message: Message, state: State): Promise<CommandCallResult>
    {
        // Help command:
        if (this.helpCommands.includes(message.command))
        {
            const availableCommands = this.getAvailableCommands(state);
            await this.generalModule.sendHelpText(message, availableCommands);

            return CommandCallResult.Called;
        }

        const stateCommands = [
            new StateCommand(state, message.command), // Specific state command
            new StateCommand(State.Nothing, message.command), // Stateless command
            new StateCommand(state, ''), // Catch all
        ];

        for (const stateCommand of stateCommands)
        {
            if (this.stateCommands.has(stateCommand))
            {
                // There is a function available for this specific state command.

                if ((!message.hasComponentOrigin) && (stateCommand.state != State.Nothing) && (this.componentExpectedStates.has(state)))
                {
                    // A statefull command that expects a component origin but got a text message.

                    return CommandCallResult.MissingComponentOrigin;
                }

                const messageFunction = this.stateCommands.get(stateCommand);
                await messageFunction(message);

                return CommandCallResult.Called;
            }
        }

        return CommandCallResult.NotFound;
    }

    public async process (message: Message): Promise<void>
    {
        // FIXME: How could we handle that two buttons are pressed (two messages are sent) at the same time?

        if (message.author.isBot)
        {
            // We will not process messages from bots like ourself.
            // Prevents bot ping pong...
            return;
        }

        if (message.content.length === 0)
        {
            // We will not process empty messages.
            return;
        }

        if (message.channel.type == ChannelType.Server)
        {
            if (!message.content.startsWith(Config.main.commandPrefix))
            {
                // We ignore messages on servers that do not start with the defined message prefix.
                return;
            }

            let messageFunction: CommandHandlerFunction | undefined;

            if (message.channel.id === Config.main.moderationChannelId)
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
                // As we now know the message is relevant for the bot, check if it is too long:
                if (message.content.length > Config.main.maxMessageLength)
                {
                    await this.generalModule.sendMessageTooLong(message);
                    return;
                }

                this.database.log(message.author.id, message.author.tag, message.content, message.channel.id);

                await messageFunction(message);
            }
        }
        else if (message.channel.type == ChannelType.Personal)
        {
            // Every private message is relevant to the bot, so check every private message for the maximum length:
            if (message.content.length > Config.main.maxMessageLength)
            {
                await this.generalModule.sendMessageTooLong(message);
                return;
            }

            this.database.log(message.author.id, message.author.tag, message.content);

            if (this.database.hasContact(message.author.id))
            {
                const contact = this.database.getContact(message.author.id);

                // NOTE: In personal channels, we do not use the "command/parameters" concept because it is much more natural
                //       to speak with the bot in words and sentences. Therefor we use the message content. If we have to
                //       make inputs, we use catch all commands to save the full input.
                //       Short: Instead of <"command parameters"> we use <stateA: "command", stateB: "parameters">.
                message.hasParameters = false;

                const commandCallResult = await this.tryToCallCommand(message, contact.state);

                switch (commandCallResult)
                {
                    case CommandCallResult.Called:
                        // We need to do nothing here, already called successfully.
                        break;
                    case CommandCallResult.MissingComponentOrigin:
                        {
                            // Who sent us the text on a button has to be put to his place:
                            const answer = Localisation.texts.sentComponentText.process(message.author);
                            await message.reply(answer);

                            break;
                        }
                    case CommandCallResult.NotFound:
                        {
                            const answer = Localisation.texts.notUnderstood.process(message.author);
                            await message.reply(answer);

                            break;
                        }
                }
            }
            else
            {
                // First contact:
                await this.generalModule.makeFirstContact(message);
            }
        }
        else
        {
            // We must ignore channels of type "Ignore".
            return;
        }
    }

    private getAvailableCommands (state: State): CommandInfo[]
    {
        let availableStateCommands = this.commandListsForEveryState.get(state);
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

        return availableCommands;
    }
}
