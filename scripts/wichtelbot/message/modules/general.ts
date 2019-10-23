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
        const answer = text.process(whatIsThere);

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

        const answer = Localisation.texts.contacting.process(message.author);

        message.reply(answer);
    }

    /**
     * Replies context-dependend help messages.
     */
    public notUnderstood (message: Message): void
    {
        const answer = Localisation.texts.notUnderstood.process(message.author);

        // TODO: Print information about available commands.

        message.reply(answer);
    }
}
