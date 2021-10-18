import ContactType from '../types/contactType';
import State from '../endpoints/definitions/state';

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

function instanceOfContactData (object: any): object is ContactData
{
    const potentialContactData = object as ContactData;

    const isInstance = (potentialContactData.nickname !== undefined) &&
                       (potentialContactData.lastUpdateTime !== undefined) &&
                       (potentialContactData.type !== undefined) &&
                       (potentialContactData.state !== undefined);

    return isInstance;
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
        // ContactCoreData:
        this.id = contactData.id;
        this.tag = contactData.tag;
        this.name = contactData.name;

        // ContactData:
        if (instanceOfContactData(contactData))
        {
            if (contactData.nickname == '')
            {
                this.nickname = this.name;
            }
            else
            {
                this.nickname = contactData.nickname;
            }

            this.lastUpdateTime = contactData.lastUpdateTime;
            this.type = contactData.type;
            this.state = contactData.state;
        }
        else
        {
            this.nickname = this.name;
            this.lastUpdateTime = 0;
            this.type = ContactType.Contact;
            this.state = State.Nothing;
        }
    }
}
