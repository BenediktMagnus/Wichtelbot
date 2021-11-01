import { CommandHandlerFunction, StateCommandHandlerFunction } from './handlingTools/handlerFunctions';
import Localisation, { CommandInfo } from '../../utility/localisation';
import { ComponentBuilder } from './handlingTools/componentBuilder';
import Config from '../../utility/config';
import GeneralModule from './modules/generalModule';
import GiftType from '../types/giftType';
import InformationModule from './modules/informationModule';
import Message from '../endpoint/definitions/message';
import State from "../endpoint/definitions/state";
import TokenString from '../../utility/tokenString';

interface CommandDefinition
{
    commandInfo: CommandInfo;
    handlerFunction: CommandHandlerFunction;
}

interface CommandPath
{
    command: CommandInfo;
    result: any;
}

interface PathedStateCommandDefinition
{
    state: State;
    paths: CommandPath[];
    handlerFunction: StateCommandHandlerFunction;
}

interface CatchallStateCommandDefinition
{
    state: State;
    paths: null;
    handlerFunction: CommandHandlerFunction;
}

type StateCommandDefinition = PathedStateCommandDefinition | CatchallStateCommandDefinition;

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
            paths: [
                {
                    command: Localisation.commands.goodAfternoon,
                    result: Localisation.texts.goodAfternoon,
                },
                {
                    command: Localisation.commands.goodMorning,
                    result: Localisation.texts.goodMorning,
                },
                {
                    command: Localisation.commands.goodNight,
                    result: Localisation.texts.goodNight,
                },
                {
                    command: Localisation.commands.hello,
                    result: Localisation.texts.hello,
                },
                {
                    command: Localisation.commands.maybe,
                    result: Localisation.texts.maybeResponse,
                }
            ],
            handlerFunction: async (message, result): Promise<void> => this.generalModule.reply(message, result)
        },
        // Initialise registration:
        {
            state: State.New,
            paths: [
                {
                    command: Localisation.commands.registration,
                    result: Localisation.texts.registration,
                },
            ],
            handlerFunction: async (message, result): Promise<void> =>
                this.generalModule.continue(message, State.Registration, result, ComponentBuilder.yesNo)
        },
        // Confirm registration:
        {
            state: State.Registration,
            paths: [
                {
                    command: Localisation.commands.yes,
                    result: Localisation.texts.informationGiftTypeAsGiver,
                },
                {
                    command: Localisation.commands.no,
                    result: Localisation.texts.registrationCancelled,
                },
            ],
            handlerFunction: async (message: Message, result: TokenString): Promise<void> =>
            {
                if (result === Localisation.texts.informationGiftTypeAsGiver)
                {
                    this.generalModule.register(message);
                    await this.generalModule.continue(message, State.InformationGiftTypeAsGiver, result, ComponentBuilder.giftTypes);
                    await this.informationModule.sendCurrentGiftTypeAsGiver(message);
                }
                else
                {
                    await this.generalModule.continue(message, State.New, result);
                }
            }
        },
        // Information, GiftTypeAsGiver:
        {
            state: State.InformationGiftTypeAsGiver,
            paths: [
                {
                    command: Localisation.commands.informationAnalogue,
                    result: GiftType.Analogue
                },
                {
                    command: Localisation.commands.informationDigital,
                    result: GiftType.Digital
                },
                {
                    command: Localisation.commands.informationBothAnalogueAndDigital,
                    result: GiftType.All
                }
            ],
            handlerFunction: async (message: Message, result: GiftType): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsGiver(message, result);
                await this.generalModule.continue(
                    message,
                    State.InformationGiftTypeAsTaker,
                    Localisation.texts.informationGiftTypeAsTaker,
                    ComponentBuilder.giftTypes
                );
                await this.informationModule.sendCurrentGiftTypeAsTaker(message);
            }
        },
        // Information, GiftTypeAsTaker:
        {
            state: State.InformationGiftTypeAsTaker,
            paths: [
                {
                    command: Localisation.commands.informationAnalogue,
                    result: GiftType.Analogue
                },
                {
                    command: Localisation.commands.informationDigital,
                    result: GiftType.Digital
                },
                {
                    command: Localisation.commands.informationBothAnalogueAndDigital,
                    result: GiftType.All
                }
            ],
            handlerFunction: async (message: Message, result: GiftType): Promise<void> =>
            {
                this.informationModule.setGiftTypeAsTaker(message, result);

                if (result === GiftType.Digital)
                {
                    await this.generalModule.continue(
                        message,
                        State.InformationDigitalAddress,
                        Localisation.texts.informationDigitalAddress
                    );
                    await this.informationModule.sendCurrentDigitalAddress(message);
                }
                else
                {
                    await this.generalModule.continue(message, State.InformationAddress, Localisation.texts.informationAddress);
                    await this.informationModule.sendCurrentAddress(message);
                }
            }
        },
        // Information, Address:
        {
            state: State.InformationAddress,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setAddress(message);
                await this.generalModule.continue(
                    message,
                    State.InformationCountry,
                    Localisation.texts.informationCountry,
                    ComponentBuilder.countries
                );
                await this.informationModule.sendCurrentCountry(message);
            }
        },
        // Information, Country:
        {
            state: State.InformationCountry,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                const normalisedCountry = message.command; // Commands are already normalised, i.e. lowercase and trimmed.

                if (Config.main.allowedCountries.includes(normalisedCountry))
                {
                    this.informationModule.setCountry(message);

                    const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                    if (neededInformationStates.includes(State.InformationDigitalAddress))
                    {
                        await this.generalModule.continue(
                            message,
                            State.InformationDigitalAddress,
                            Localisation.texts.informationDigitalAddress
                        );
                        await this.informationModule.sendCurrentDigitalAddress(message);
                    }
                    else if (neededInformationStates.includes(State.InformationInternationalAllowed))
                    {
                        await this.generalModule.continue(
                            message,
                            State.InformationInternationalAllowed,
                            Localisation.texts.informationInternationalAllowed,
                            ComponentBuilder.yesNo
                        );
                        await this.informationModule.sendCurrentInternationalAllowed(message);
                    }
                    else
                    {
                        await this.generalModule.continue(message, State.InformationWishList, Localisation.texts.informationWishList);
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
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setDigitalAddress(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationInternationalAllowed))
                {
                    await this.generalModule.continue(
                        message,
                        State.InformationInternationalAllowed,
                        Localisation.texts.informationInternationalAllowed,
                        ComponentBuilder.yesNo
                    );
                    await this.informationModule.sendCurrentInternationalAllowed(message);
                }
                else
                {
                    await this.generalModule.continue(message, State.InformationWishList, Localisation.texts.informationWishList);
                    await this.informationModule.sendCurrentWishList(message);
                }
            }
        },
        // Information, InternationalAllowed:
        {
            state: State.InformationInternationalAllowed,
            paths: [
                {
                    command: Localisation.commands.yes,
                    result: true
                },
                {
                    command: Localisation.commands.no,
                    result: false
                },
            ],
            handlerFunction: async (message: Message, result: boolean): Promise<void> =>
            {
                this.informationModule.setInternationalAllowed(message, result);
                await this.generalModule.continue(message, State.InformationWishList, Localisation.texts.informationWishList);
                await this.informationModule.sendCurrentWishList(message);
            }
        },
        // Information, Wish List:
        {
            state: State.InformationWishList,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setWishList(message);

                const neededInformationStates = this.informationModule.getListOfNeededInformationStates(message);

                if (neededInformationStates.includes(State.InformationAllergies))
                {
                    await this.generalModule.continue(message, State.InformationAllergies, Localisation.texts.informationAllergies);
                    await this.informationModule.sendCurrentAllergies(message);
                }
                else
                {
                    await this.generalModule.continue(message, State.InformationGiftExclusion, Localisation.texts.informationGiftExclusion);
                    await this.informationModule.sendCurrentGiftExclusion(message);
                }
            }
        },
        // Information, Allergies:
        {
            state: State.InformationAllergies,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setAllergies(message);
                await this.generalModule.continue(message, State.InformationGiftExclusion, Localisation.texts.informationGiftExclusion);
                await this.informationModule.sendCurrentGiftExclusion(message);
            }
        },
        // Information, GiftExclusion:
        {
            state: State.InformationGiftExclusion,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setGiftExclusion(message);
                await this.generalModule.continue(message, State.InformationUserExclusion, Localisation.texts.informationUserExclusion);
                await this.informationModule.sendCurrentUserExclusion(message);
            }
        },
        // Information, UserExclusion:
        {
            state: State.InformationUserExclusion,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setUserExclusion(message);
                await this.generalModule.continue(message, State.InformationFreeText, Localisation.texts.informationFreeText);
                await this.informationModule.sendCurrentFreeText(message);
            }
        },
        // Information, FreeText:
        {
            state: State.InformationFreeText,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setFreeText(message);
                await this.informationModule.completeInformationGathering(message);
            }
        },
        // Change information:
        {
            state: State.Waiting,
            paths: [
                {
                    command: Localisation.commands.changeInformation,
                    result: Localisation.texts.informationGiftTypeAsGiver,
                }
            ],
            handlerFunction: async (message: Message, result: TokenString): Promise<void> =>
            {
                await this.generalModule.continue(message, State.InformationGiftTypeAsGiver, result, ComponentBuilder.giftTypes);
                await this.informationModule.sendCurrentGiftTypeAsGiver(message);
            }
        }
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
