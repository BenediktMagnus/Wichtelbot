import { Additions } from "./additions";
import { Channel } from "./channel";
import Client from './client';
import User from "./user";

/**
 * Interface of a message representation.
 */
export default interface Message
{
    /**
     * The content of the message, its text.
     */
    content: string;
    /**
     * If true, the content will be split into a command and one or multiple parameters. \
     * If false, the full content will be treatet as a single command without parameters.
     */
    hasParameters: boolean;
    /**
     * If true, the message comes from a used component (e.g. a button click).
     * If false, the message is textual user input.
     */
    hasComponentOrigin: boolean;
    /**
     * The command of the message.
     */
    command: string;
    /**
     * The parameter string of the message.
     */
    parameters: string;
    /**
     * The user that authored the message.
     */
    author: User;
    /**
     * The channel the message has been send to.
     */
    channel: Channel;
    /**
     * The client that has instantiated the message.
     */
    client: Client;
    /**
     * A method to reply directly to the message. \
     * How this is exactly represented (in the same channel, as a tree, with a mention or with a special connection) is free to be chosen
     * by the client library.
     * @param text The text to send.
     * @param additions Optional additions.
     */
    reply (text: string, additions?: Additions): Promise<void>;
    /**
     * A method to parse the message. \
     * Parsing extracts command and parameters.
     */
    parse (): void;
    /**
     * A method to split the parameter string into single parameters.
     * @param separator Optional, defaults to the first space-like character found.
     */
    splitParameters (separator?: string): string[];
}
