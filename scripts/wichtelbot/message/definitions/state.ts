enum State
{
    // As contact:
    Nothing = '', // Is allowed to do nothing but stateless commands.
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
    Waiting = 'waiting', // Waiting for becoming a wichtel.
    ConfirmInformationChange = 'confirmInformationChange',
    // As wichtel:
    MessageToGiftGiver = 'messageToGiftGiver',
    MessageToGiftTaker = 'messageToGiftTaker',
    ParcelSendConsignmentNumber = 'sendParcelConsignmentNumber',
    ParcelSendDate = 'parcelSendDate',
    ParcelReceivedDate = 'parcelReceivedDate',
}

export default State;
