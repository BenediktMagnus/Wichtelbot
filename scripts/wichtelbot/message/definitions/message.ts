import User from "./user";
import { Channel } from "./channel";

/**
 * Interface of a message represenation.
 */
export default interface Message
{
    /**
     * The content of the message, its text.
     */
    content: string;
    /**
     * The user that authored the message.
     */
    author: User;
    /**
     * The channel the message has been send to.
     */
    channel: Channel;
    /**
     * A method to reply directly to the message. \
     * How this is exactly represented (in the same channel, as a tree, with a mention
     * or with a special connection) is free to be chosen by the client library.
     * @param text The text to send.
     * @param imageUrl An optional URL to an image. The client library must decide how it
     * uses this information. It can show the image directly, attach it to the message,
     * send it separately or simply send the URL (if nothing else is possible).
     */
    reply: (text: string, imageUrl?: string) => void;
}
