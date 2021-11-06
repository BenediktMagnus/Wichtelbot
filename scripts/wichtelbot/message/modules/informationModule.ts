import { Visualisation, VisualisationType } from "../../endpoint/definitions";
import Config from "../../../utility/config";
import ContactType from "../../types/contactType";
import Database from "../../database";
import GiftType from "../../types/giftType";
import { KeyValuePairList } from "../../../utility/keyValuePair";
import Localisation from "../../../utility/localisation";
import Member from "../../classes/member";
import Message from "../../endpoint/definitions/message";
import State from "../../endpoint/definitions/state";
import TokenString from "../../../utility/tokenString";

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

    protected async sendCurrentInformationValue (message: Message, member: Member, value: string): Promise<void>
    {
        if (value.trim() === '')
        {
            return;
        }

        const parameters = new KeyValuePairList('informationValue', value);

        const answer = Localisation.texts.oldInformation.process(member, parameters);

        await message.reply(answer);

        // TODO: It would be handy if current fulltext messages had an accept button to reuse the current information with one click.
    }

    protected async sendCurrentGiftType (message: Message, member: Member, giftType: GiftType): Promise<void>
    {
        if (giftType !== GiftType.Nothing)
        {
            await this.sendCurrentInformationValue(message, member, Localisation.translateGiftType(giftType));
        }
    }

    protected async sendCurrentBoolean (message: Message, member: Member, booleanValue: boolean): Promise<void>
    {
        // NOTE: Boolean values are only send if they are true. False is the default value.
        //       This is needed to prevent sending "current values" the first time a contact registered.
        // TODO: We could allow null for boolean values instead.
        if (booleanValue)
        {
            await this.sendCurrentInformationValue(message, member, Localisation.translateBoolean(booleanValue));
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
            case GiftType.Nothing:
                // FIXME: What to do here?
                break;
        }

        switch (member.information.giftTypeAsGiver)
        {
            case GiftType.All:
            case GiftType.Analogue:
                result.push(State.InformationInternationalAllowed);
                break;
            case GiftType.Digital:
            case GiftType.Nothing:
                // FIXME: What to do here?
                break;
        }

        return result;
    }

    public async sendCurrentGiftTypeAsGiver (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentGiftType(message, member, member.information.giftTypeAsGiver);
    }

    public async sendCurrentGiftTypeAsTaker (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentGiftType(message, member, member.information.giftTypeAsTaker);
    }

    public async sendCurrentAddress (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.address);
    }

    public async sendCurrentCountry (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        // TODO: The country from the database is all lowercase, it should be made "normal" (starting with an upper case,
        //       or even decently localised) at this point.

        await this.sendCurrentInformationValue(message, member, member.information.country);
    }

    public async sendCurrentDigitalAddress (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.digitalAddress);
    }

    public async sendCurrentInternationalAllowed (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentBoolean(message, member, member.information.internationalAllowed);
    }

    public async sendCurrentWishList (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.wishList);
    }

    public async sendCurrentAllergies (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.allergies);
    }

    public async sendCurrentGiftExclusion (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.giftExclusion);
    }

    public async sendCurrentUserExclusion (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.userExclusion);
    }

    public async sendCurrentFreeText (message: Message): Promise<void>
    {
        const member = this.database.getMember(message.author.id);

        await this.sendCurrentInformationValue(message, member, member.information.freeText);
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
    public async completeInformationGathering (message: Message): Promise<void>
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

        await message.reply(answer);

        // TODO: Should we send an overview (like the Steckbrief) to the user?
    }
}
