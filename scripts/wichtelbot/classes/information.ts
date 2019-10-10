import GiftType from "../types/giftType";

export default class Information
{
    public contactId: string;
    public lastUpdateTime = 0;
    public giftTypeAsTaker: GiftType = GiftType.Nothing;
    public giftTypeAsGiver: GiftType = GiftType.Nothing;
    public address = '';
    public country = '';
    public steamName = '';
    public international = '';
    public wishList = '';
    public allergies = '';
    public giftExclusion = '';
    public userExclusion = '';
    public freeText = '';

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
