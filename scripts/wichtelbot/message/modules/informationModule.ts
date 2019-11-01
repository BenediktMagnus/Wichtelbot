import Localisation from "../../../utility/localisation";
import Config from "../../../utility/config";

import Database from "../../database";

import Message from "../definitions/message";
import State from "../definitions/state";
import GiftType from "../../types/giftType";
import ContactType from "../../types/contactType";

/**
 * Message module for gathering and saving contact information data.
 */
export default class InformationModule
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    /**
     * Checks which information that depend on the two gift type questions are needed to be asked.
     * These can be "Adress", "DigitalAdress" and "InternationalAllowed".
     * @returns A list of states which represent the questions for information needed.
     */
    public getListOfNeededInformationStates (message: Message): State[]
    {
        const result: State[] = [];

        const member = this.database.getMember(message.author.id);

        switch (member.information.giftTypeAsTaker)
        {
            case GiftType.All:
                result.push(State.InformationAddress);
                result.push(State.InformationAllergies);
                result.push(State.InformationDigitalAddress);
                break;
            case GiftType.Analogue:
                result.push(State.InformationAddress);
                result.push(State.InformationAllergies);
                break;
            case GiftType.Digital:
                result.push(State.InformationDigitalAddress);
                break;
        }

        switch (member.information.giftTypeAsGiver)
        {
            case GiftType.All:
            case GiftType.Analogue:
                result.push(State.InformationInternationalAllowed);
                break;
        }

        return result;
    }

    public setGiftTypeAsGiver (message: Message, giftType: GiftType): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.giftTypeAsGiver = giftType;

        this.database.updateMember(member);
    }

    public setGiftTypeAsTaker (message: Message, giftType: GiftType): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.giftTypeAsTaker = giftType;

        this.database.updateMember(member);
    }

    public setAddress (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.address = message.content;

        this.database.updateMember(member);
    }

    public setCountry (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.country = message.command; // We need the country normalised. Commands are lowercase and trimmed, so useful.

        this.database.updateMember(member);
    }

    public setDigitalAddress (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.digitalAddress = message.content;

        this.database.updateMember(member);
    }

    public setInternationalAllowed (message: Message, internationalAllowed: boolean): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.internationalAllowed = internationalAllowed;

        this.database.updateMember(member);
    }

    public setWishList (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.wishList = message.content;

        this.database.updateMember(member);
    }

    public setAllergies (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.allergies = message.content;

        this.database.updateMember(member);
    }

    public setGiftExclusion (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.giftExclusion = message.content;

        this.database.updateMember(member);
    }

    public setUserExclusion (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.userExclusion = message.content;

        this.database.updateMember(member);
    }

    public setFreeText (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.freeText = message.content;

        this.database.updateMember(member);
    }

    /**
     * Make a contact to a full member after a successfull registration with all information given.
     */
    public becomeMember (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        member.type = ContactType.Member;
        member.state = State.Waiting;

        this.database.updateMember(member);

        const parameters = [
            {
                key: 'currentEventName',
                value: Config.main.currentEvent.name
            }
        ];

        const answer = Localisation.texts.becameMember.process(member, parameters);

        message.reply(answer);
    }
}
