enum State
{
    // As contact:
    Nothing = 'nothing', // Is allowed to do nothing but stateless commands.
    New = 'new',
    Registration = 'registration',
    // As contact/member:
    InformationGiftTypeAsTaker = 'questionGiftTypeAsTaker',
    InformationGiftTypeAsGiver = 'informationGiftTypeAsGiver',
    InformationAddress = 'informationAddress',
    InformationCountry = 'informationCountry',
    InformationDigitalAddress = 'informationDigitalAddress',
    InformationInternationalAllowed = 'informationInternationalAllowed',
    InformationWishList = 'informationWishList',
    InformationAllergies = 'informationAllergies',
    InformationGiftExclusion = 'informationGiftExclusion',
    InformationUserExclusion = 'informationUserExclusion',
    InformationFreeText = 'informationFreeText',
    // As member:
    /** Waiting for becoming a Wichtel. */
    Waiting = 'waiting', // TODO: Rename to "registered".
    ConfirmDeregistration = 'confirmDeregistration',
    /** While assignment is running; cannot change information. */
    Assignment = 'assignment', // TODO: Rename to "waiting" after "waiting" has been renamed to "registered".
    // As wichtel:
    MessageToGiftGiver = 'messageToGiftGiver',
    MessageToGiftTaker = 'messageToGiftTaker',
    ParcelSendConsignmentNumber = 'sendParcelConsignmentNumber',
    ParcelSendDate = 'parcelSendDate',
    ParcelReceivedDate = 'parcelReceivedDate',
}

export default State;
