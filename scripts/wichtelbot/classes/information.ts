import GiftType from "../types/giftType";

export default class Information
{
    contactId: string;
    lastUpdateTime = 0;
    giftTypeAsTaker: GiftType = GiftType.Nothing;
    giftTypeAsGiver: GiftType = GiftType.Nothing;
    address = '';
    country = '';
    steamName = '';
    international = '';
    wishList = '';
    allergies = '';
    giftExclusion = '';
    userExclusion = '';
    freeText = '';

    constructor (contactId: string)
    {
        this.contactId = contactId;
    }

    /**
     * Will create a full information object from information data. \
     * This is used to create complete objects from database data.
     * @param informationData An object with the same properties as the information class.
     */
    public static fromInformationData (informationData: Information): Information
    {
        let information = new Information(informationData.contactId);

        information = Object.assign(information, informationData);

        return information;
    }
}
