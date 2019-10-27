import GeneralTestUtility from './general';

import Contact, { ContactCoreData } from '../../scripts/wichtelbot/classes/contact';
import Information from '../../scripts/wichtelbot/classes/information';
import GiftType from '../../scripts/wichtelbot/types/giftType';
import Member from '../../scripts/wichtelbot/classes/member';

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

    public static createRandomContactCoreData (): ContactCoreData
    {
        const contactCoreData = {
            id: GeneralTestUtility.createRandomString(),
            tag: GeneralTestUtility.createRandomString() + '#1234',
            name: GeneralTestUtility.createRandomString(),
        };

        return contactCoreData;
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
                steamName: GeneralTestUtility.createRandomString(),
                international: GeneralTestUtility.createRandomString(),
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
        const information = ContactTestUtility.createRandomMemberInformation();

        const member = new Member(contact, information);

        return member;
    }
}
