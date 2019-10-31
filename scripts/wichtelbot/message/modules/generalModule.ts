import Localisation, { CommandInfo } from '../../../utility/localisation';
import Database from '../../database';
import Message from '../definitions/message';
import TokenString from '../../../utility/tokenString';
import Contact from '../../classes/contact';
import State from '../definitions/state';
import Config from '../../../utility/config';
import WichtelEventPhase from '../../../utility/wichtelEvent';
import ContactType from '../../types/contactType';

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
    public reply (message: Message, text: TokenString): void
    {
        const whatIsThere = this.database.getWhatIsThere(message.author);
        const answer = text.process(whatIsThere);

        message.reply(answer);
    }

    /**
     * Sets the state of the contact, then replies.
     */
    public continue (message: Message, text: TokenString, state: State): void
    {
        const contact = this.database.getContact(message.author.id);
        contact.state = state;
        this.database.saveContact(contact);

        this.reply(message, text);
    }

    /**
     * Makes first contact with a new user. \
     * Will save the new contact in the database.
     */
    public firstContact (message: Message): void
    {
        const firstContactWaiting = (): void =>
        {
            const registrationPhaseTime = new Date(Config.main.currentEvent.registration * 1000);
            const parameters = [
                { key: 'year', value: registrationPhaseTime.getFullYear().toString() },
                { key: 'month', value: registrationPhaseTime.getMonth().toString() },
                { key: 'day', value: registrationPhaseTime.getDay().toString() },
                { key: 'hour', value: registrationPhaseTime.getHours().toString() },
                { key: 'minute', value: registrationPhaseTime.getMinutes().toString() },
            ];
            const answer = Localisation.texts.contactingTooEarly.process(message.author, parameters);

            message.reply(answer);
        };

        const firstContactRegistration = (): void =>
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
                    // Otherwise, if it is of another contact type (only possible is "Member" at this point)
                    // he wants to register again, which we answer with a special text.
                    text = Localisation.texts.contactingAlreadyRegistered;
                }
            }

            const answer = text.process(message.author);

            message.author.send(answer);
        };

        const firstContactTooLate = (): void =>
        {
            const answer = Localisation.texts.contactingTooLate.process(message.author);

            message.reply(answer);
        };

        switch (Config.currentEventPhase)
        {
            case WichtelEventPhase.Waiting:
                firstContactWaiting();
                break;
            case WichtelEventPhase.Registration:
                firstContactRegistration();
                break;
            default:
                // Wichteln or Ended
                firstContactTooLate();
                break;
        }
    }

    /**
     * Replies context-dependend help messages.
     */
    public notUnderstood (message: Message, availableCommands: CommandInfo[]): void
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

                const parameters = [
                    {
                        key: 'name',
                        value: commandInfo.info,
                    }
                ];

                const singleCommandInfoText = Localisation.texts.commandInfo.process(undefined, parameters);

                commandInfoTexts.push(singleCommandInfoText);
            }

            if (commandInfoTexts.length > 0)
            {
                const infoText = commandInfoTexts.join('\n');

                const parameters = [
                    {
                        key: 'commandInfo',
                        value: infoText,
                    }
                ];

                const helpText = Localisation.texts.helpText.process(undefined, parameters);

                answer += '\n\n' + helpText;
            }
        }

        message.reply(answer);
    }
}
