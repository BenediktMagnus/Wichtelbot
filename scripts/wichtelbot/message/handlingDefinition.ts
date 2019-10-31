import Localisation, { CommandInfo } from '../../utility/localisation';
import State from "./definitions/state";
import MessageFunction from './handlingTools/messageFunction';

import GeneralModule from './modules/generalModule';
interface CommandDefinition
{
    commandInfo: CommandInfo;
    handlerFunction: MessageFunction;
}

interface StateCommandDefinition extends CommandDefinition
{
    state: State;
}

/**
 * The handling definition is an object-based representation of the state/command handling structure.
 */
export default class HandlingDefinition
{
    protected generalModule: GeneralModule;

    constructor (generalModule: GeneralModule)
    {
        this.generalModule = generalModule;
    }

    public stateCommands: StateCommandDefinition[] = [
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.goodMorning,
            handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.goodMorning)
        },
        {
            state: State.New,
            commandInfo: Localisation.commands.registration,
            handlerFunction: (message): void => this.generalModule.continue(message, Localisation.texts.registration, State.Registration)
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.yes,
            handlerFunction: (message): void => this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsGiver, State.InformationGiftTypeAsGiver) // FIXME: Text
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.no,
            handlerFunction: (message): void => this.generalModule.continue(message, Localisation.texts.registrationCancelled, State.New)
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.maybe,
            handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.maybeResponse)
        }
    ];
    public publicCommands: CommandDefinition[] = [
        {
            commandInfo: Localisation.commands.contacting,
            handlerFunction: (message): void => this.generalModule.firstContact(message)
        }
    ];
    public moderatorCommands: CommandDefinition[] = [

    ];
}
