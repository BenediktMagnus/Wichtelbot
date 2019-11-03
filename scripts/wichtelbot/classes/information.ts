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
    internationalAllowed: boolean;
    wishList: string;
    allergies: string;
    giftExclusion: string;
    userExclusion: string;
    freeText: string;
}

export default class Information implements InformationData
{
    public contactId: string;
    public lastUpdateTime: number;
    public giftTypeAsTaker: GiftType;
    public giftTypeAsGiver: GiftType;
    public address: string;
    public country: string;
    public digitalAddress: string;
    public internationalAllowed: boolean;
    public wishList: string;
    public allergies: string;
    public giftExclusion: string;
    public userExclusion: string;
    public freeText: string;

    constructor (contactIdOrInformationData: string | InformationData)
    {
        this.contactId = '';
        this.lastUpdateTime = 0;
        this.giftTypeAsTaker = GiftType.Nothing;
        this.giftTypeAsGiver = GiftType.Nothing;
        this.address = '';
        this.country = '';
        this.digitalAddress = '';
        this.internationalAllowed = false;
        this.wishList = '';
        this.allergies = '';
        this.giftExclusion = '';
        this.userExclusion = '';
        this.freeText = '';

        if ((typeof contactIdOrInformationData) === 'string')
        {
            this.contactId = contactIdOrInformationData as string;
        }
        else
        {
            Object.assign(this, contactIdOrInformationData);

            // Force booleans to be of type boolean.
            // This is necessary because the database returns them as numbers.
            this.internationalAllowed = !!this.internationalAllowed;
        }
    }
}
