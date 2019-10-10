import ContactType from '../types/contactType';
import State from '../message/definitions/state';

export default class Contact
{
    public id: string; // The Discord ID, used as an unique contact ID.
    discordName: string; // The full Discord name, including display name and tag.
    name: string; // The base name in Discord.
    nickname: string; // A setable nickname for the user for readability purposes, defaults to the name.
    lastUpdateTime = 0; // Unix time
    type: ContactType = ContactType.Contact;
    state: State = State.Nothing; // The current state the contact is in, used as communication state.

    constructor (id: string, discordName: string, name: string)
    {
        this.id = id;
        this.discordName = discordName;
        this.name = name;
        this.nickname = name;
    }

    /**
     * Will create a full contact object from contact data. \
     * This is used to create complete objects from database data.
     * @param contactData An object with the same properties as the contact class.
     */
    public static fromContactData (contactData: Contact): Contact
    {
        let contact = new Contact(contactData.id, contactData.discordName, contactData.name);

        contact = Object.assign(contact, contactData);

        return contact;
    }
}
