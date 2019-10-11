import Localisation from '../../../utility/localisation';
import Database from '../../database';
import Message from '../definitions/message';
import TokenString from '../../../utility/tokenString';
import ContactType from '../../types/contactType';

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
        const contact = this.database.getContact(message.author.id);
        text.setContact(contact);

        if (contact.type != ContactType.Contact)
        {
            const member = this.database.getMember(contact.id);
            text.setInformation(member.information);
        }
        // TODO: Wichtel data.

        const answer = text.getResult();

        message.reply(answer);
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
