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
    public id: string; // The ID, unique for every contact.
    public tag: string; // The contact's tag, a contextual identifier.
    public name: string; // The base name.
    public nickname: string; // A setable nickname for the contact for readability purposes, defaults to the name.
    public lastUpdateTime: number; // Unix time
    public type: ContactType;
    public state: State; // The current state the contact is in, used as communication state.

    constructor (contactData: ContactCoreData | ContactData)
    {
        this.id = '';
        this.tag = '';
        this.name = '';
        this.nickname = '';
        this.lastUpdateTime = 0;
        this.type = ContactType.Contact;
        this.state = State.Nothing;

        Object.assign(this, contactData);

        if (this.nickname == '')
        {
            this.nickname = this.name;
        }
    }
}
