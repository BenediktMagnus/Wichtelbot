import Contact from './contact';
import Information from './information';
import ContactType from '../types/contactType';

export default class Member extends Contact
{
    type = ContactType.Member; // Overriden
    information: Information;

    constructor (contactId: string, discordName: string, name: string)
    {
        super(contactId, discordName, name);

        this.information = new Information(this.contactId);
    }

    public static fromContact (contact: Contact): Member
    {
        // Set the type for the contact, too, to prevent errors that could
        // happen when the contact is used after the conversion to a member:
        contact.type = ContactType.Member;

        let member = new Member(contact.contactId, contact.discordName, contact.name);

        member = Object.assign(
            member,
            contact
        );

        return member;
    }

    /**
     * Will create a full member object from member data. \
     * This is used to create complete objects from database data.
     * @param memberData An object with the same properties as the member class.
     */
    public static fromMemberData (memberData: Member): Member
    {
        let member = new Member(memberData.contactId, memberData.discordName, memberData.name);

        member = Object.assign(member, memberData);

        return member;
    }
}
