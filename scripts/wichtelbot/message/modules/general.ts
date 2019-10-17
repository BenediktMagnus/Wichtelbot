import Localisation from '../../../utility/localisation';
import Database from '../../database';
import Message from '../definitions/message';
import TokenString from '../../../utility/tokenString';
import Contact from '../../classes/contact';
import ContactType from '../../types/contactType';
import State from '../definitions/state';

/**
 * Message module for general things to handle.
 */
export default class General
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    /**
     * Replies with a defined text. \
     * Will set Contact and Information for the TokenString.
     */
    public reply (message: Message, text: TokenString): void
    {
        if (this.database.hasContact(message.author.id))
        {
            const contact = this.database.getContact(message.author.id);
            text.setContact(contact);

            if (contact.type != ContactType.Contact)
            {
                const member = this.database.getMember(contact.id);
                text.setInformation(member.information);
            }
            // TODO: Wichtel data.
        }
        else
        {
            // If the user is no known contact, we must settle for him instead:
            text.setUser(message.author);
        }

        const answer = text.getResult();

        message.reply(answer);
    }

    /**
     * Makes first contact with a new user. \
     * Will save the new contact in the database.
     */
    public firstContact (message: Message): void
    {
        if (!this.database.hasContact(message.author.id))
        {
            const contact = new Contact(message.author);
            contact.state = State.Registration;

            this.database.saveContact(contact);
        }

        this.reply(message, Localisation.texts.contacting);
    }

    /**
     * Replies context-dependend help messages.
     */
    public notUnderstood (message: Message): void
    {
        const answer = Localisation.texts.notUnderstood;

        // TODO: Print information about available commands.

        this.reply(message, answer);
    }
}
