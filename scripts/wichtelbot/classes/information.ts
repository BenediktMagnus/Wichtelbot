import GiftType from "../types/giftType";

export interface InformationData
{
    contactId: string;
    lastUpdateTime: number;
    giftTypeAsTaker: GiftType;
    giftTypeAsGiver: GiftType;
    address: string;
    country: string;
    digitalAddress: string;
    international: string;
    wishList: string;
    allergies: string;
    giftExclusion: string;
    userExclusion: string;
    freeText: string;
}

export default class Information implements InformationData
{
    public contactId = '';
    public lastUpdateTime = 0;
    public giftTypeAsTaker: GiftType = GiftType.Nothing;
    public giftTypeAsGiver: GiftType = GiftType.Nothing;
    public address = '';
    public country = '';
    public digitalAddress = '';
    public international = '';
    public wishList = '';
    public allergies = '';
    public giftExclusion = '';
    public userExclusion = '';
    public freeText = '';

    constructor (contactIdOrInformationData: string | InformationData)
    {
        if ((typeof contactIdOrInformationData) === 'string')
        {
            this.contactId = contactIdOrInformationData as string;
        }
        else
        {
            Object.assign(this, contactIdOrInformationData);
        }
    }
}
