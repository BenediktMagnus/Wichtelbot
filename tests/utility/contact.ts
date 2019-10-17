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
            {
                id: GeneralTestUtility.createRandomString(),
                tag: GeneralTestUtility.createRandomString() + '#1234',
                name: GeneralTestUtility.createRandomString(),
            }
        );

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
}
