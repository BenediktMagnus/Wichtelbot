import GeneralTestUtility from './general';

import Contact from '../../scripts/wichtelbot/classes/contact';
import Information from '../../scripts/wichtelbot/classes/information';
import GiftType from '../../scripts/wichtelbot/types/giftType';

export default class ContactTestUtility
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

    public static createRandomContact (): Contact
    {
        const contact = new Contact(
            GeneralTestUtility.createRandomString(),
            GeneralTestUtility.createRandomString(),
            GeneralTestUtility.createRandomString()
        );

        return contact;
    }

    public static createRandomMemberInformation (contactId: string = GeneralTestUtility.createRandomString()): Information
    {
        const information = new Information(contactId);

        information.giftTypeAsTaker = ContactTestUtility.getRandomGiftType();
        information.giftTypeAsGiver = ContactTestUtility.getRandomGiftType();
        information.address = GeneralTestUtility.createRandomString();
        information.country = GeneralTestUtility.createRandomString();
        information.steamName = GeneralTestUtility.createRandomString();
        information.international = GeneralTestUtility.createRandomString();
        information.wishList = GeneralTestUtility.createRandomString();
        information.allergies = GeneralTestUtility.createRandomString();
        information.giftExclusion = GeneralTestUtility.createRandomString();
        information.userExclusion = GeneralTestUtility.createRandomString();
        information.freeText = GeneralTestUtility.createRandomString();

        return information;
    }
}
