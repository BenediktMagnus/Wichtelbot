import Contact, { ContactData } from './contact';
import Information, { InformationData } from './information';

export default class Member extends Contact
{
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
            this.information.contactId = this.id;
        }
    }
}
