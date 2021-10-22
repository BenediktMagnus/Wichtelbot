/**
 * An abstract base class for message implementations that allows to parse and handle commands and
 * parameters of a message. This is independent from the implementation, so can be used everywhere.
 */
export abstract class MessageWithParser
{
    private _command = '';
    private _parameters = '';

    protected hasBeenParsed = false;
    protected separator = '';

    /**
     * If set to false the content is parsed as a single command instead of a command with parameters.
     */
    public hasParameters = true;

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

        if (this.hasParameters)
        {
            // The following regex finds commands and the parameter string by searching for
            // the first space-like character. Everything before is the command, everything
            // after it (including more space-like characters) is the parameter string:
            const regex = /(\S+)(\s?)([\S\s]*)/;

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
        }
        else
        {
            // If this message is set to having no parameters we treat the full content as command.
            this._command = content;
        }

        // Remove all symbols from the command that must be ignored (explanation mark, question mark, full stop, comma, semicolon, space):
        this._command = this._command.replace(/^[!?.,;\s]+|[!?.,;\s]+$/g, '');

        // A command always lower case for correct comparisons:
        this._command = this._command.toLocaleLowerCase();

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
