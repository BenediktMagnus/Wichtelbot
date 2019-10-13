import Client from './client';
import User from "./user";
import { Channel } from "./channel";

/**
 * An abstract base class for message implementations that allows to parse and handle commands and
 * parameters of a message. This is independent from the implementation, so can be used everywhere.
 */
export abstract class MessageWithParser
{
    protected _command = '';
    protected _parameters = '';

    protected hasBeenParsed = false;
    protected separator = '';

    protected abstract get content (): string;

    /**
     * Get the message's parsed command.
     */
    public get command (): string
    {
        if (!this.hasBeenParsed)
        {
            this.parse();
        }

        return this._command;
    }

    /**
     * Get the message's parsed parameters as single string. \
     * For having them separated, use the splitParameters method.
     */
    public get parameters (): string
    {
        if (!this.hasBeenParsed)
        {
            this.parse();
        }

        return this._parameters;
    }

    /**
     * Parse the message to extract the command and the parameters string. \
     * It is not required to call this method as it is called on the first access
     * to either the command or the parameters. But it can to choose when the
     * parsing exactly should happen.
     */
    public parse (): void
    {
        // For parsing, we ignore space-like characters at the beginning and end of the content:
        const content = this.content.trim();

        // The following regex finds commands and the parameter string by searching for
        // the first space-like character. Everything before is the command, everything
        // after it (including more space-like characters) is the parameter string:
        const regex = /(\S+)(\s?)([\S\s]*)/g;

        const match = regex.exec(content);

        if (match === null)
        {
            // This can only be the case if the string has been empty, soo...
            this.hasBeenParsed = true;
            return;
            // Done.
        }

        this._command = match[1];
        this.separator = match[2];
        this._parameters = match[3];

        // Remove all symbols from the command that must be ignored (explanation mark, question mark, full stop, comma, semicolon, space):
        this._command = this._command.replace(/^[!?.,;\s]+|[!?.,;\s]+$/g, '');

        this.hasBeenParsed = true;
    }

    /**
     * Split the parameter string into single parameters.
     * @param separator Defaults to the separator used to split the command from the parameters, which
     * is the first space-like character that could be found.
     */
    public splitParameters (overrideSeparator?: string): string[]
    {
        if (!this.hasBeenParsed)
        {
            this.parse();
        }

        const separator = (overrideSeparator === undefined ? this.separator : overrideSeparator);

        const parameters = this._parameters.split(separator);

        return parameters;
    }
}

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
     * The client that is instantiated the message.
     */
    client: Client;
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
