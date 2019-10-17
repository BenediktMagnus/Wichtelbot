import Contact, { ContactData } from './contact';
import Information, { InformationData } from './information';
import ContactType from '../types/contactType';

export default class Member extends Contact
{
    public type = ContactType.Member;
    public information: Information;

    constructor (contactOrContactData: Contact | ContactData, informationData?: InformationData)
    {
        super(contactOrContactData);

        if (informationData === undefined)
        {
            this.information = new Information(this.id);
        }
        else
        {
            this.information = new Information(informationData);
        }
    }
}
