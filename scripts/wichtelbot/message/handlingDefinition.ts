import Localisation, { CommandInfo } from '../../utility/localisation';
import Config from '../../utility/config';

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

class CatchAllCommand implements CommandInfo
{
    public commands: string[] = [''];
    public info: string | undefined = undefined;
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
        // Information, GiftTypeAsTaker:
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationAnalogue,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.Analogue);
                this.generalModule.continue(message, Localisation.texts.informationAddress, State.InformationAddress);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.Digital);
                this.generalModule.continue(message, Localisation.texts.informationDigitalAddress, State.InformationDigitalAddress);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.All);
                this.generalModule.continue(message, Localisation.texts.informationAddress, State.InformationAddress);
            }
        },
        // Information, Address:
        {
            state: State.InformationAddress,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setAddress(message);
                this.generalModule.continue(message, Localisation.texts.informationCountry, State.InformationCountry);
            }
        },
        // Information, Country:
        {
            state: State.InformationCountry,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                if (Config.main.allowedCountries.includes(message.command)) // The country must be normalised. Commands are lowercase and trimmed.
                {
                    this.informationModule.setCountry(message);

                    const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                    if (neededInformationStates.includes(State.InformationDigitalAddress))
                    {
                        this.generalModule.continue(message, Localisation.texts.informationDigitalAddress, State.InformationDigitalAddress);
                    }
                    else if (neededInformationStates.includes(State.InformationInternationalAllowed))
                    {
                        this.generalModule.continue(message, Localisation.texts.informationInternationalAllowed, State.InformationInternationalAllowed);
                    }
                    else
                    {
                        this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                    }
                }
                else
                {
                    this.generalModule.reply(message, Localisation.texts.notUnderstood);
                }
            }
        },
        // Information, DigitalAddress:
        {
            state: State.InformationDigitalAddress,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setDigitalAddress(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationInternationalAllowed))
                {
                    this.generalModule.continue(message, Localisation.texts.informationInternationalAllowed, State.InformationInternationalAllowed);
                }
                else
                {
                    this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                }
            }
        },
        // Information, InternationalAllowed:
        {
            state: State.InformationInternationalAllowed,
            commandInfo: Localisation.commands.yes,
            handlerFunction: (message): void =>
            {
                this.informationModule.setInternationalAllowed(message, true);
                this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
            }
        },
        {
            state: State.InformationInternationalAllowed,
            commandInfo: Localisation.commands.no,
            handlerFunction: (message): void =>
            {
                this.informationModule.setInternationalAllowed(message, false);
                this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
            }
        },
        // Information, Wish List:
        {
            state: State.InformationWishList,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setWishList(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationAllergies))
                {
                    this.generalModule.continue(message, Localisation.texts.informationAllergies, State.InformationAllergies);
                }
                else
                {
                    this.generalModule.continue(message, Localisation.texts.informationGiftExclusion, State.InformationGiftExclusion);
                }
            }
        },
        // Information, Allergies:
        {
            state: State.InformationAllergies,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setAllergies(message);
                this.generalModule.continue(message, Localisation.texts.informationGiftExclusion, State.InformationGiftExclusion);
            }
        },
        // Information, GiftExclusion:
        {
            state: State.InformationGiftExclusion,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftExclusion(message);
                this.generalModule.continue(message, Localisation.texts.informationUserExclusion, State.InformationUserExclusion);
            }
        },
        // Information, UserExclusion:
        {
            state: State.InformationUserExclusion,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setUserExclusion(message);
                this.generalModule.continue(message, Localisation.texts.informationFreeText, State.InformationFreeText);
            }
        },
        // Information, FreeText:
        {
            state: State.InformationFreeText,
            commandInfo: new CatchAllCommand(),
            handlerFunction: (message): void =>
            {
                this.informationModule.setFreeText(message);
                this.informationModule.completeInformationGathering(message);
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
