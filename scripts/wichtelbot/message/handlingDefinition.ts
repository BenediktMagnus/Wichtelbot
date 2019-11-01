import Localisation, { CommandInfo } from '../../utility/localisation';

import State from "./definitions/state";
import MessageFunction from './handlingTools/messageFunction';

import GeneralModule from './modules/generalModule';
import InformationModule from './modules/informationModule';
import GiftType from '../types/giftType';

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
    protected informationModule: InformationModule;

    constructor (generalModule: GeneralModule, informationModule: InformationModule)
    {
        this.generalModule = generalModule;
        this.informationModule = informationModule;
    }

    public stateCommands: StateCommandDefinition[] = [
        // Stateless commands:
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.goodMorning,
            handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.goodMorning)
        },
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.maybe,
            handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.maybeResponse)
        },
        // Registration:
        {
            state: State.New,
            commandInfo: Localisation.commands.registration,
            handlerFunction: (message): void => this.generalModule.continue(message, Localisation.texts.registration, State.Registration)
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.yes,
            handlerFunction: (message): void =>
            {
                this.generalModule.register(message);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsGiver, State.InformationGiftTypeAsGiver);
            }
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.no,
            handlerFunction: (message): void => this.generalModule.continue(message, Localisation.texts.registrationCancelled, State.New)
        },
        // Information, GiftTypeAsGiver:
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationAnalogue,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.Analogue);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.Digital);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.All);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
            }
        },
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
