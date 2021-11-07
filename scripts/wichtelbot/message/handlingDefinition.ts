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

interface BaseCommandDefinition
{
    state: State;
    /** True if the command comes from a previously send component, otherwise false. */
    expectsComponentResult: boolean;
}

interface PathedStateCommandDefinition extends BaseCommandDefinition
{
    paths: CommandPath[];
    handlerFunction: StateCommandHandlerFunction;
}

interface CatchallStateCommandDefinition extends BaseCommandDefinition
{
    paths: null;
    handlerFunction: CommandHandlerFunction;
}

type StateCommandDefinition = PathedStateCommandDefinition | CatchallStateCommandDefinition;

/**
 * The handling definition is an object-based representation of the state/command handling structure.
 */
export default class HandlingDefinition
{
    protected generalModule: GeneralModule;
    protected informationModule: InformationModule;

    private get maxShortMessageLength (): number
    {
        return Math.floor(Config.main.maxMessageLength / 2);
    }

    constructor (generalModule: GeneralModule, informationModule: InformationModule)
    {
        this.generalModule = generalModule;
        this.informationModule = informationModule;
    }

    public stateCommands: StateCommandDefinition[] = [
        // Stateless commands:
        {
            state: State.Nothing,
            expectsComponentResult: false,
            paths: [
                {
                    command: Localisation.commands.callMods,
                    result: Localisation.texts.modsCalled,
                },
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
                // TODO: Response to "thank you".
            ],
            handlerFunction: async (message: Message, result: TokenString): Promise<void> =>
            {
                if (result === Localisation.texts.modsCalled)
                {
                    await this.generalModule.callMods(message);
                }

                await this.generalModule.reply(message, result);
            }
        },
        // Initialise registration:
        {
            state: State.New,
            expectsComponentResult: false,
            paths: [
                {
                    command: Localisation.commands.registration,
                    result: Localisation.texts.registration,
                },
            ],
            handlerFunction: async (message: Message, result: TokenString): Promise<void> =>
                this.generalModule.continue(message, State.Registration, result, ComponentBuilder.yesNo)
        },
        // Confirm registration:
        {
            state: State.Registration,
            expectsComponentResult: true,
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
            expectsComponentResult: true,
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
            }
        },
        // Information, GiftTypeAsTaker:
        {
            state: State.InformationGiftTypeAsTaker,
            expectsComponentResult: true,
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
            expectsComponentResult: false,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                if (message.content.length > this.maxShortMessageLength)
                {
                    await this.generalModule.sendMessageTooLong(message, this.maxShortMessageLength);

                    return;
                }

                this.informationModule.setAddress(message);
                await this.generalModule.continue(
                    message,
                    State.InformationCountry,
                    Localisation.texts.informationCountry,
                    ComponentBuilder.countries
                );
            }
        },
        // Information, Country:
        {
            state: State.InformationCountry,
            expectsComponentResult: true,
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
            expectsComponentResult: false,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                if (message.content.length > this.maxShortMessageLength)
                {
                    await this.generalModule.sendMessageTooLong(message, this.maxShortMessageLength);

                    return;
                }

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
            expectsComponentResult: true,
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
            expectsComponentResult: false,
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
            expectsComponentResult: false,
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
            expectsComponentResult: false,
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
            expectsComponentResult: false,
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
            expectsComponentResult: false,
            paths: null,
            handlerFunction: async (message: Message): Promise<void> =>
            {
                this.informationModule.setFreeText(message);
                await this.informationModule.completeInformationGathering(message);
            }
        },
        // Waiting for Wichtel assignment:
        {
            state: State.Waiting,
            expectsComponentResult: false,
            paths: [
                {
                    command: Localisation.commands.changeInformation,
                    result: Localisation.texts.informationGiftTypeAsGiver,
                },
                {
                    command: Localisation.commands.deregistration,
                    result: Localisation.texts.confirmDeregistration,
                }
            ],
            handlerFunction: async (message: Message, result: TokenString): Promise<void> =>
            {
                if (result === Localisation.texts.informationGiftTypeAsGiver)
                {
                    await this.generalModule.continue(message, State.InformationGiftTypeAsGiver, result, ComponentBuilder.giftTypes);
                }
                else if (result === Localisation.texts.confirmDeregistration)
                {
                    await this.generalModule.continue(message, State.ConfirmDeregistration, result, ComponentBuilder.yesNo);
                }
            }
        },
        // Confirm Deregistration:
        {
            state: State.ConfirmDeregistration,
            expectsComponentResult: true,
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
                if (result)
                {
                    await this.generalModule.continue(message, State.New, Localisation.texts.deregistration);
                }
                else
                {
                    await this.generalModule.continue(message, State.Waiting, Localisation.texts.deregistrationCancelled);
                }
            }
        }
    ];

    public publicCommands: CommandDefinition[] = [
        {
            commandInfo: Localisation.commands.contacting,
            handlerFunction: async (message: Message): Promise<void> => this.generalModule.makeFirstContact(message)
        }
    ];

    public moderatorCommands: CommandDefinition[] = [

    ];
}
