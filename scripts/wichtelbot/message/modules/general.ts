import Localisation from '../../../utility/localisation';
import Database from '../../database';
import Message from '../definitions/message';
import TokenString from '../../../utility/tokenString';
import Contact from '../../classes/contact';
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
     * Will set User/Contact data for the TokenString.
     */
    public reply (message: Message, text: TokenString): void
    {
        const whatIsThere = this.database.getWhatIsThere(message.author);
        text.set(whatIsThere);
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

        const text = Localisation.texts.contacting;
        text.set(message.author);
        const answer = text.getResult();

        message.reply(answer);
    }

    /**
     * Replies context-dependend help messages.
     */
    public notUnderstood (message: Message): void
    {
        const text = Localisation.texts.notUnderstood;
        text.set(message.author);

        // TODO: Print information about available commands.

        const answer = text.getResult();

        message.reply(answer);
    }
}
