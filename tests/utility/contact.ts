import Contact, { ContactCoreData, ContactData } from '../../scripts/wichtelbot/classes/contact';
import ContactType from '../../scripts/wichtelbot/types/contactType';
import GeneralTestUtility from './general';
import GiftType from '../../scripts/wichtelbot/types/giftType';
import Information from '../../scripts/wichtelbot/classes/information';
import Member from '../../scripts/wichtelbot/classes/member';
import State from '../../scripts/wichtelbot/endpoint/definitions/state';

export default abstract class ContactTestUtility
{
    public static getRandomGiftType (): GiftType
    {
        const giftTypes: GiftType[] = [];

        for (const giftType of Object.values(GiftType))
        {
            giftTypes.push(giftType);
        }

        const randomIndex = Math.floor(Math.random() * giftTypes.length);

        const randomGiftType = giftTypes[randomIndex];

        return randomGiftType;
    }

    public static createRandomState (): State
    {
        const states: State[] = [];

        for (const state of Object.values(State))
        {
            states.push(state);
        }

        const randomIndex = Math.floor(Math.random() * states.length);

        const randomState = states[randomIndex];

        return randomState;
    }

    public static createRandomContactCoreData (): ContactCoreData
    {
        const contactCoreData = {
            id: GeneralTestUtility.createRandomString(),
            tag: GeneralTestUtility.createRandomString() + '#1234',
            name: GeneralTestUtility.createRandomString(),
        };

        return contactCoreData;
    }

    public static createRandomContactData (): ContactData
    {
        const contactCoreData = ContactTestUtility.createRandomContactCoreData();

        const contactData = {
            ...contactCoreData,
            nickname: contactCoreData.name,
            lastUpdateTime: GeneralTestUtility.createRandomInteger(),
            type: ContactType.Contact,
            state: ContactTestUtility.createRandomState(),
        };

        return contactData;
    }

    public static createRandomContact (): Contact
    {
        const contactCoreData = ContactTestUtility.createRandomContactCoreData();

        const contact = new Contact(contactCoreData);

        return contact;
    }

    public static createRandomMemberInformation (contactId: string = GeneralTestUtility.createRandomString()): Information
    {
        const information = new Information(
            {
                contactId: contactId,
                lastUpdateTime: 0,
                giftTypeAsTaker: ContactTestUtility.getRandomGiftType(),
                giftTypeAsGiver: ContactTestUtility.getRandomGiftType(),
                address: GeneralTestUtility.createRandomString(),
                country: GeneralTestUtility.createRandomString(),
                digitalAddress: GeneralTestUtility.createRandomString(),
                internationalAllowed: GeneralTestUtility.createRandomBoolean(),
                wishList: GeneralTestUtility.createRandomString(),
                allergies: GeneralTestUtility.createRandomString(),
                giftExclusion: GeneralTestUtility.createRandomString(),
                userExclusion: GeneralTestUtility.createRandomString(),
                freeText: GeneralTestUtility.createRandomString(),
            }
        );

        return information;
    }

    public static createRandomMember (): Member
    {
        const contact = ContactTestUtility.createRandomContact();
        const information = ContactTestUtility.createRandomMemberInformation(contact.id);

        const member = new Member(contact, information);
        member.type = ContactType.Member;

        return member;
    }

    public static createRandomMemberWithMostCompatibleInformation (): Member
    {
        const member = ContactTestUtility.createRandomMember();
        member.state = State.Waiting;
        member.information.country = 'deutschland';
        member.information.giftTypeAsGiver = GiftType.All;
        member.information.giftTypeAsTaker = GiftType.All;
        member.information.internationalAllowed = true;

        return member;
    }
}
