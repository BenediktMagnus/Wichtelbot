import { Additions } from "./additions";

/**
 * Interface representation of a user.
 */
export default interface User
{
    /**
     * An unique identifier for the user. Must be unique. For all users.
     */
    id: string;
    /**
     * An "official" name of the user. A client library must be able to recognise it contextually.
     * Can be used for mentions or similar.
     */
    tag: string;
    /**
     * A name we can use to call the user (directly) for him to non-critically recognise himself.
     * Does not need to be unique.
     */
    name: string;
    /**
     * True if the user is a known bot, otherwise false.
     */
    isBot: boolean;
    /**
     * A method to send a message directly to the user. \
     * How this is exactly represented (with a direct message or as a mention or similar)
     * is free to be chosen by the client library.
     * @param text The text to send.
     * @param additions Optional additions.
     */
    send (text: string, additions?: Additions): Promise<void>;
}
