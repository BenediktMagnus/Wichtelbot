import Localisation from "../../../utility/localisation";
import Config from "../../../utility/config";
import TokenString from "../../../utility/tokenString";
import { KeyValuePairList } from "../../../utility/keyValuePair";

import Database from "../../database";

import Message from "../definitions/message";
import State from "../definitions/state";
import GiftType from "../../types/giftType";
import ContactType from "../../types/contactType";
import Member from "../../classes/member";

/**
 * Message module for gathering and saving contact information data.
 *
 * TODO: This class is bad, really bad. All this duplicate code... there MUST be a better way!
 */
export default class InformationModule
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    protected sendCurrentInformationValue (message: Message, member: Member, value: string): void
    {
        if (value.trim() === '')
        {
            return;
        }

        const parameters = new KeyValuePairList('informationValue', value);

        const answer = Localisation.texts.oldInformation.process(member, parameters);

        message.reply(answer);
    }

    protected sendCurrentGiftType (message: Message, member: Member, giftType: GiftType): void
    {
        if (giftType !== GiftType.Nothing)
        {
            this.sendCurrentInformationValue(message, member, Localisation.translateGiftType(giftType));
        }
    }

    protected sendCurrentBoolean (message: Message, member: Member, booleanValue: boolean): void
    {
        // NOTE: Boolean values are only send if they are true. False is the default value.
        //       This is needed to prevent sending "current values" the first time a contact registered.
        //       We could allow null for boolean values instead.
        if (booleanValue)
        {
            this.sendCurrentInformationValue(message, member, Localisation.translateBoolean(booleanValue));
        }
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

    public sendCurrentGiftTypeAsGiver (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentGiftType(message, member, member.information.giftTypeAsGiver);
    }

    public sendCurrentGiftTypeAsTaker (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentGiftType(message, member, member.information.giftTypeAsTaker);
    }

    public sendCurrentAddress (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.address);
    }

    public sendCurrentCountry (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.country);
    }

    public sendCurrentDigitalAddress (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.digitalAddress);
    }

    public sendCurrentInternationalAllowed (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentBoolean(message, member, member.information.internationalAllowed);
    }

    public sendCurrentWishList (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.wishList);
    }

    public sendCurrentAllergies (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.allergies);
    }

    public sendCurrentGiftExclusion (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.giftExclusion);
    }

    public sendCurrentUserExclusion (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.userExclusion);
    }

    public sendCurrentFreeText (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        this.sendCurrentInformationValue(message, member, member.information.freeText);
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
     * Completes the information gathering by either making the contact a full member or, if he is already one,
     * replying with a text stating that the information change has been successful.
     */
    public completeInformationGathering (message: Message): void
    {
        const member = this.database.getMember(message.author.id);

        let text: TokenString;

        if (member.type == ContactType.Member)
        {
            text = Localisation.texts.changedInformation;
        }
        else
        {
            text = Localisation.texts.becameMember;
            member.type = ContactType.Member;
        }

        member.state = State.Waiting;

        this.database.updateMember(member);

        const parameters = new KeyValuePairList('currentEventName', Config.main.currentEvent.name);
        const answer = text.process(member, parameters);

        message.reply(answer);
    }
}
