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
 *
 * TODO: This class is bad, not as bad as the informationModule, but bad. The duplicate code must be reduced.
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
            commandInfo: Localisation.commands.hello,
            handlerFunction: (message): void => this.generalModule.reply(message, Localisation.texts.hello)
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
                this.informationModule.sendCurrentGiftTypeAsGiver(message);
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
                this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.Digital);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
                this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.All);
                this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
                this.informationModule.sendCurrentGiftTypeAsTaker(message);
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
                this.informationModule.sendCurrentAddress(message);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.Digital);
                this.generalModule.continue(message, Localisation.texts.informationDigitalAddress, State.InformationDigitalAddress);
                this.informationModule.sendCurrentDigitalAddress(message);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: (message): void =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.All);
                this.generalModule.continue(message, Localisation.texts.informationAddress, State.InformationAddress);
                this.informationModule.sendCurrentAddress(message);
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
                this.informationModule.sendCurrentCountry(message);
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
                        this.informationModule.sendCurrentDigitalAddress(message);
                    }
                    else if (neededInformationStates.includes(State.InformationInternationalAllowed))
                    {
                        this.generalModule.continue(message, Localisation.texts.informationInternationalAllowed, State.InformationInternationalAllowed);
                        this.informationModule.sendCurrentInternationalAllowed(message);
                    }
                    else
                    {
                        this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                        this.informationModule.sendCurrentWishList(message);
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
                    this.informationModule.sendCurrentInternationalAllowed(message);
                }
                else
                {
                    this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                    this.informationModule.sendCurrentWishList(message);
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
                this.informationModule.sendCurrentWishList(message);
            }
        },
        {
            state: State.InformationInternationalAllowed,
            commandInfo: Localisation.commands.no,
            handlerFunction: (message): void =>
            {
                this.informationModule.setInternationalAllowed(message, false);
                this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                this.informationModule.sendCurrentWishList(message);
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
                    this.informationModule.sendCurrentAllergies(message);
                }
                else
                {
                    this.generalModule.continue(message, Localisation.texts.informationGiftExclusion, State.InformationGiftExclusion);
                    this.informationModule.sendCurrentGiftExclusion(message);
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
                this.informationModule.sendCurrentGiftExclusion(message);
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
                this.informationModule.sendCurrentUserExclusion(message);
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
                this.informationModule.sendCurrentFreeText(message);
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
