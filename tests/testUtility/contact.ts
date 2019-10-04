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

    public static createRandomString (): string
    {
        const currentTime = new Date();

        const randomNumber = Math.random();

        const randomString = currentTime.getTime().toString() + '-' + randomNumber.toString();

        return randomString;
    }

    public static createRandomContact (): Contact
    {
        const contact = new Contact(
            ContactTestUtility.createRandomString(),
            ContactTestUtility.createRandomString(),
            ContactTestUtility.createRandomString()
        );

        contact.state = 'Test';

        return contact;
    }

    public static createRandomMemberInformation (contactId: string = ContactTestUtility.createRandomString()): Information
    {
        const information = new Information(contactId);

        information.giftTypeAsTaker = ContactTestUtility.getRandomGiftType();
        information.giftTypeAsGiver = ContactTestUtility.getRandomGiftType();
        information.address = ContactTestUtility.createRandomString();
        information.country = ContactTestUtility.createRandomString();
        information.steamName = ContactTestUtility.createRandomString();
        information.international = ContactTestUtility.createRandomString();
        information.wishList = ContactTestUtility.createRandomString();
        information.allergies = ContactTestUtility.createRandomString();
        information.giftExclusion = ContactTestUtility.createRandomString();
        information.userExclusion = ContactTestUtility.createRandomString();
        information.freeText = ContactTestUtility.createRandomString();

        return information;
    }
}
