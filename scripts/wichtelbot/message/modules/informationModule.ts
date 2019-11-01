import Database from "../../database";

import Message from "../definitions/message";
import GiftType from "../../types/giftType";

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

    public setGiftTypeAsGiver (message: Message, giftType: GiftType): void
    {
        const member = this.database.getMember(message.author.id);

        member.information.giftTypeAsGiver = giftType;


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
}
