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
    }
}
