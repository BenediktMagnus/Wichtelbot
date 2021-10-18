import Localisation, { CommandInfo } from '../../utility/localisation';
import Config from '../../utility/config';
import GeneralModule from './modules/generalModule';
import GiftType from '../types/giftType';
import InformationModule from './modules/informationModule';
import Message from '../endpoints/definitions/message';
import MessageFunction from './handlingTools/messageFunction';
import State from "../endpoints/definitions/state";

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
            commandInfo: Localisation.commands.goodAfternoon,
            handlerFunction: async (message): Promise<void> => this.generalModule.reply(message, Localisation.texts.goodAfternoon)
        },
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.goodMorning,
            handlerFunction: async (message): Promise<void> => this.generalModule.reply(message, Localisation.texts.goodMorning)
        },
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.goodNight,
            handlerFunction: async (message): Promise<void> => this.generalModule.reply(message, Localisation.texts.goodNight)
        },
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.hello,
            handlerFunction: async (message): Promise<void> => this.generalModule.reply(message, Localisation.texts.hello)
        },
        {
            state: State.Nothing,
            commandInfo: Localisation.commands.maybe,
            handlerFunction: async (message): Promise<void> => this.generalModule.reply(message, Localisation.texts.maybeResponse)
        },
        // Registration:
        {
            state: State.New,
            commandInfo: Localisation.commands.registration,
            handlerFunction: async (message): Promise<void> =>
                this.generalModule.continue(message, Localisation.texts.registration, State.Registration)
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.yes,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.generalModule.register(message);
                await this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsGiver, State.InformationGiftTypeAsGiver);
                await this.informationModule.sendCurrentGiftTypeAsGiver(message);
            }
        },
        {
            state: State.Registration,
            commandInfo: Localisation.commands.no,
            handlerFunction: async (message): Promise<void> =>
                this.generalModule.continue(message, Localisation.texts.registrationCancelled, State.New)
        },
        // Information, GiftTypeAsGiver:
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationAnalogue,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.Analogue);
                await this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
                await this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.Digital);
                await this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
                await this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        {
            state: State.InformationGiftTypeAsGiver,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsGiver(message, GiftType.All);
                await this.generalModule.continue(message, Localisation.texts.informationGiftTypeAsTaker, State.InformationGiftTypeAsTaker);
                await this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        // Information, GiftTypeAsTaker:
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationAnalogue,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.Analogue);
                await this.generalModule.continue(message, Localisation.texts.informationAddress, State.InformationAddress);
                await this.informationModule.sendCurrentAddress(message);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationDigital,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.Digital);
                await this.generalModule.continue(message, Localisation.texts.informationDigitalAddress, State.InformationDigitalAddress);
                await this.informationModule.sendCurrentDigitalAddress(message);
            }
        },
        {
            state: State.InformationGiftTypeAsTaker,
            commandInfo: Localisation.commands.informationBothAnalogueAndDigital,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsTaker(message, GiftType.All);
                await this.generalModule.continue(message, Localisation.texts.informationAddress, State.InformationAddress);
                await this.informationModule.sendCurrentAddress(message);
            }
        },
        // Information, Address:
        {
            state: State.InformationAddress,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setAddress(message);
                await this.generalModule.continue(message, Localisation.texts.informationCountry, State.InformationCountry);
                await this.informationModule.sendCurrentCountry(message);
            }
        },
        // Information, Country:
        {
            state: State.InformationCountry,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                if (Config.main.allowedCountries.includes(message.command)) // The country must be normalised. Commands are lowercase and trimmed.
                {
                    this.informationModule.setCountry(message);

                    const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                    if (neededInformationStates.includes(State.InformationDigitalAddress))
                    {
                        await this.generalModule.continue(message, Localisation.texts.informationDigitalAddress, State.InformationDigitalAddress);
                        await this.informationModule.sendCurrentDigitalAddress(message);
                    }
                    else if (neededInformationStates.includes(State.InformationInternationalAllowed))
                    {
                        await this.generalModule.continue(message, Localisation.texts.informationInternationalAllowed, State.InformationInternationalAllowed);
                        await this.informationModule.sendCurrentInternationalAllowed(message);
                    }
                    else
                    {
                        await this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                        await this.informationModule.sendCurrentWishList(message);
                    }
                }
                else
                {
                    await this.generalModule.reply(message, Localisation.texts.notUnderstood);
                }
            }
        },
        // Information, DigitalAddress:
        {
            state: State.InformationDigitalAddress,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setDigitalAddress(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationInternationalAllowed))
                {
                    await this.generalModule.continue(message, Localisation.texts.informationInternationalAllowed, State.InformationInternationalAllowed);
                    await this.informationModule.sendCurrentInternationalAllowed(message);
                }
                else
                {
                    await this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                    await this.informationModule.sendCurrentWishList(message);
                }
            }
        },
        // Information, InternationalAllowed:
        {
            state: State.InformationInternationalAllowed,
            commandInfo: Localisation.commands.yes,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setInternationalAllowed(message, true);
                await this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                await this.informationModule.sendCurrentWishList(message);
            }
        },
        {
            state: State.InformationInternationalAllowed,
            commandInfo: Localisation.commands.no,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setInternationalAllowed(message, false);
                await this.generalModule.continue(message, Localisation.texts.informationWishList, State.InformationWishList);
                await this.informationModule.sendCurrentWishList(message);
            }
        },
        // Information, Wish List:
        {
            state: State.InformationWishList,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setWishList(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationAllergies))
                {
                    await this.generalModule.continue(message, Localisation.texts.informationAllergies, State.InformationAllergies);
                    await this.informationModule.sendCurrentAllergies(message);
                }
                else
                {
                    await this.generalModule.continue(message, Localisation.texts.informationGiftExclusion, State.InformationGiftExclusion);
                    await this.informationModule.sendCurrentGiftExclusion(message);
                }
            }
        },
        // Information, Allergies:
        {
            state: State.InformationAllergies,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setAllergies(message);
                await this.generalModule.continue(message, Localisation.texts.informationGiftExclusion, State.InformationGiftExclusion);
                await this.informationModule.sendCurrentGiftExclusion(message);
            }
        },
        // Information, GiftExclusion:
        {
            state: State.InformationGiftExclusion,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftExclusion(message);
                await this.generalModule.continue(message, Localisation.texts.informationUserExclusion, State.InformationUserExclusion);
                await this.informationModule.sendCurrentUserExclusion(message);
            }
        },
        // Information, UserExclusion:
        {
            state: State.InformationUserExclusion,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setUserExclusion(message);
                await this.generalModule.continue(message, Localisation.texts.informationFreeText, State.InformationFreeText);
                await this.informationModule.sendCurrentFreeText(message);
            }
        },
        // Information, FreeText:
        {
            state: State.InformationFreeText,
            commandInfo: new CatchAllCommand(),
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setFreeText(message);
                await this.informationModule.completeInformationGathering(message);
            }
        },
    ];
    public publicCommands: CommandDefinition[] = [
        {
            commandInfo: Localisation.commands.contacting,
            handlerFunction: async (message: Message): Promise<void> => this.generalModule.firstContact(message)
        }
    ];
    public moderatorCommands: CommandDefinition[] = [

    ];
}
