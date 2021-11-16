import Contact, { ContactData } from './contact';
import { InformationData } from './information';
import Member from './member';
import { RelationshipData } from './relationship';

export default class Wichtel extends Member
{
    public giverId: string;
    public takerId: string;

    constructor (contactOrContactData: Contact | ContactData, informationData: InformationData, relationshipData: RelationshipData)
    {
        super(contactOrContactData, informationData);

        this.giverId = relationshipData.giverId;
        this.takerId = relationshipData.takerId;
    }
}
