import ContactType from '../types/contactType';
import State from '../message/definitions/state';

export interface ContactCoreData
{
    id: string;
    tag: string;
    name: string;
}

export interface ContactData extends ContactCoreData
{
    nickname: string;
    lastUpdateTime: number;
    type: ContactType;
    state: State;
}

export default class Contact implements ContactData
{
    public id = ''; // The ID, unique for every contact.
    public tag = ''; // The contact's tag, a contextual identifier.
    public name = ''; // The base name.
    public nickname = ''; // A setable nickname for the contact for readability purposes, defaults to the name.
    public lastUpdateTime = 0; // Unix time
    public type: ContactType = ContactType.Contact;
    public state: State = State.Nothing; // The current state the contact is in, used as communication state.

    constructor (contactData: ContactCoreData | ContactData)
    {
        Object.assign(this, contactData);

        if (this.nickname == '')
        {
            this.nickname = this.name;
        }
    }
}
