import Localisation, { CommandInfo } from '../../../utility/localisation';
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
    public async reply (message: Message, text: TokenString): Promise<void>
    {
        const whatIsThere = this.database.getWhatIsThere(message.author);
        const answer = text.process(whatIsThere);

        await message.reply(answer);
    }

    /**
     * Sets the state of the contact, then replies.
     */
    public async continue (message: Message, text: TokenString, state: State): Promise<void>
    {
        const contact = this.database.getContact(message.author.id);
        contact.state = state;
        this.database.updateContact(contact);

        await this.reply(message, text);
    }

    /**
     * Makes first contact with a new user. \
     * Will save the new contact in the database.
     */
    public async firstContact (message: Message): Promise<void>
    {
        let answer: string;

        if (Config.currentEventPhase == WichtelEventPhase.Waiting)
        {
            const registrationPhaseTime = new Date(Config.main.currentEvent.registration * 1000);

            const parameters = new KeyValuePairList();
            parameters.addPair('year', registrationPhaseTime.getFullYear().toString());
            parameters.addPair('month', registrationPhaseTime.getMonth().toString());
            parameters.addPair('day', registrationPhaseTime.getDay().toString());
            parameters.addPair('hour', registrationPhaseTime.getHours().toString());
            parameters.addPair('minute', registrationPhaseTime.getMinutes().toString());

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
                    // If the contact type is "Contact", he has not registered in THIS event yet.
                    text = Localisation.texts.contactingRegistration;
                }
                else
                {
                    // Otherwise, if it is of another contact type he wants to
                    // register again, which we answer with a special text.
                    text = Localisation.texts.contactingAlreadyRegistered;
                }
            }

            const privateMessage = text.process(message.author);
            message.author.send(privateMessage);

            answer = Localisation.texts.contactingResponse.process(message.author);
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

    /**
     * Replies context-dependend help messages.
     */
    public async notUnderstood (message: Message, availableCommands: CommandInfo[]): Promise<void>
    {
        let answer = Localisation.texts.notUnderstood.process(message.author);

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

                const parameters = new KeyValuePairList('name', commandInfo.info);
                const singleCommandInfoText = Localisation.texts.commandInfo.process(undefined, parameters);

                commandInfoTexts.push(singleCommandInfoText);
            }

            if (commandInfoTexts.length > 0)
            {
                const infoText = commandInfoTexts.join('\n');

                const parameters = new KeyValuePairList('commandInfo', infoText);
                const helpText = Localisation.texts.helpText.process(undefined, parameters);

                answer += '\n\n' + helpText;
            }
        }

        await message.reply(answer);
    }
}
