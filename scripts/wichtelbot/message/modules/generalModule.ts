import Localisation, { CommandInfo } from '../../../utility/localisation';
import { Additions } from '../../endpoint/definitions';
import Config from '../../../utility/config';
import Contact from '../../classes/contact';
import ContactType from '../../types/contactType';
import Database from '../../database';
import { KeyValuePairList } from '../../../utility/keyValuePair';
import Member from '../../classes/member';
import Message from '../../endpoint/definitions/message';
import State from '../../endpoint/definitions/state';
import TokenString from '../../../utility/tokenString';
import WichtelEventPhase from '../../../utility/wichtelEvent';

/**
 * Message module for general things to handle.
 */
export default class GeneralModule
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    /**
     * Replies with a defined text. \
     * Will set User/Contact data for the TokenString.
     * @param text The text to reply.
     */
    public async reply (message: Message, text: TokenString, options?: Additions): Promise<void>
    {
        const whatIsThere = this.database.getWhatIsThere(message.author);
        const answer = text.process(whatIsThere);

        await message.reply(answer, options);
    }

    /**
     * Sets the state of the contact, then replies.
     */
    public async continue (message: Message, state: State, text: TokenString, options?: Additions): Promise<void>
    {
        const contact = this.database.getContact(message.author.id);
        contact.state = state;
        this.database.updateContact(contact);

        await this.reply(message, text, options);
    }

    /**
     * Makes first contact with a new user. \
     * Will save the new contact in the database.
     */
    public async makeFirstContact (message: Message): Promise<void>
    {
        let answer: string;

        if (Config.currentEventPhase == WichtelEventPhase.Waiting)
        {
            const registrationTimeInMs = Config.main.currentEvent.registration * 1000;
            const randomTimeSpanInMs = 1000 * 60 * 60 * 24;
            const offsetInMs = 1000 * 60 * 60 * 12; // Prevents that the randomness "circles" around the real time.
            const randomAdditionInMs = Math.random() * randomTimeSpanInMs * (Math.random() > 0.5 ? 1 : -1);

            const registrationPhaseTime = new Date(registrationTimeInMs + randomAdditionInMs + offsetInMs);

            const parameters = new KeyValuePairList();
            parameters.addPair('year', registrationPhaseTime.getFullYear().toString());
            parameters.addPair('month', (registrationPhaseTime.getMonth() + 1).toString());
            parameters.addPair('day', registrationPhaseTime.getDate().toString());
            parameters.addPair('hour', registrationPhaseTime.getHours().toString());
            parameters.addPair('minute', registrationPhaseTime.getMinutes().toString().padStart(2, '0'));

            answer = Localisation.texts.contactingTooEarly.process(message.author, parameters);
        }
        else if (Config.currentEventPhase == WichtelEventPhase.Registration)
        {
            let text: TokenString;

            if (!this.database.hasContact(message.author.id))
            {
                const contact = new Contact(message.author);
                contact.state = State.New;

                this.database.saveContact(contact);

                text = Localisation.texts.contactingRegistration;
            }
            else
            {
                const contact = this.database.getContact(message.author.id);

                if (contact.type == ContactType.Contact)
                {
                    if ((contact.state == State.Nothing) || (contact.state == State.New))
                    {
                        // Not registered in THIS event yet.
                        text = Localisation.texts.contactingRegistration;
                    }
                    else
                    {
                        // In the middle of the registration:
                        text = Localisation.texts.contactingWhileRegistration;
                    }
                }
                else
                {
                    // Otherwise, if it is of another contact type he wants to register again, which we answer with a special text.
                    text = Localisation.texts.contactingAlreadyRegistered;
                }
            }

            try
            {
                const privateMessage = text.process(message.author);
                await message.author.send(privateMessage);

                answer = Localisation.texts.contactingResponse.process(message.author);
            }
            catch (error)
            {
                // If there is an error, we probably are not allowed to send private messages. Inform the user about this:
                answer = Localisation.texts.contactingFailedResponse.process(message.author);
            }
        }
        else // Wichteln or Ended
        {
            answer = Localisation.texts.contactingTooLate.process(message.author);
        }

        await message.reply(answer);
    }

    /**
     * Register a contact to become a member with information attached.
     * NOTE: This only attaches information to the contact to become a member CLASS. This will NOT change the contact type!
     */
    public register (message: Message): void
    {
        const contact = this.database.getContact(message.author.id);

        if (!this.database.hasInformation(contact.id))
        {
            const member = new Member(contact);

            // NOTE: We must NOT change the type of the contact here!

            this.database.saveMember(member);
        }
    }

    public async sendHelpText (message: Message, availableCommands: CommandInfo[]): Promise<void>
    {
        let helpText: string|null = null;

        // Print every available command with an info text as help message:
        if (availableCommands.length > 0)
        {
            const commandInfoTexts: string[] = [];

            for (const commandInfo of availableCommands)
            {
                if (commandInfo.info === undefined)
                {
                    continue;
                }

                const parameters = new KeyValuePairList();
                parameters.addPair('name', commandInfo.commands[0]);
                parameters.addPair('info', commandInfo.info);

                const singleCommandInfoText = Localisation.texts.commandInfo.process(message.author, parameters);

                commandInfoTexts.push(singleCommandInfoText);
            }

            if (commandInfoTexts.length > 0)
            {
                const infoText = commandInfoTexts.join('\n');

                const parameters = new KeyValuePairList('commandInfo', infoText);
                helpText = Localisation.texts.helpText.process(message.author, parameters);
            }
        }

        if (helpText === null)
        {
            const answer = Localisation.texts.noCommandsAvailable.process(message.author);
            await message.reply(answer);
        }
        else
        {
            await message.reply(helpText);
        }
    }

    public async sendMessageTooLong (message: Message, maxLength?: number): Promise<void>
    {
        const parameters = new KeyValuePairList();
        parameters.addPair('messageLength', `${message.content.length}`);
        parameters.addPair('maxLength', `${maxLength ?? Config.main.maxMessageLength}`);

        const answer = Localisation.texts.messageTooLong.process(message.author, parameters);

        await message.reply(answer);
    }
}
