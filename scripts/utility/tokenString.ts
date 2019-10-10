import Contact from "../wichtelbot/classes/contact";
import Information from "../wichtelbot/classes/information";

/**
 * A token is an object representation for a token string in the form {object.parameter}
 * inside a string. It contains everything needed to identify and replace the token.
 */
class Token
{
    public readonly position: number;
    public readonly length: number;
    public readonly object: string;
    public readonly parameter: string;

    constructor (position: number, length: number, object: string, parameter: string)
    {
        this.position = position;
        this.length = length;
        this.object = object;
        this.parameter = parameter;
    }
}

/**
 * A token string is a string containing tokens, allowing to replace them easily.
 */
export default class TokenString
{
    protected tokens: Token[] = [];

    protected contactParametersMap = new Map<string, string>();
    protected informationParametersMap = new Map<string, string>();
    protected customsMap = new Map<string, string>();

    public readonly rawString: string;

    constructor (rawString: string)
    {
        this.rawString = rawString;

        this.compile();
    }

    /**
     * Compiles the content string by extracting the tokens.
     */
    protected compile (): void
    {
        const regex = /{(\w+)\.(\w+)}/gi; // Expected form: {object.parameter}

        let match: RegExpExecArray | null;
        while ((match = regex.exec(this.rawString)) !== null)
        {
            const position = match.index;
            const length = match[0].length;
            const object = match[1];
            const parameter = match[2];

            const token = new Token(position, length, object, parameter);

            // We must put the new token at the beginning of the array (therefore the "unshift",
            // really bad name), for the replace function to replace them in reverse order.
            // This is needed to not invalidate all other token positions.
            this.tokens.unshift(token);
        }
    }

    protected replaceToken (text: string, token: Token, value: string): string
    {
        const beforeToken = text.slice(0, token.position);
        const afterToken = text.slice(token.position + token.length);
        const result = beforeToken + value + afterToken;

        return result;
    }

    protected process (map: Map<string, string>, text: string, token: Token): string
    {
        const value = map.get(token.parameter);

        if (value === undefined)
        {
            throw ReferenceError('The token is not defined.');
        }

        const result = this.replaceToken(text, token, value);

        return result;
    }

    protected processContact (text: string, token: Token): string
    {
        try
        {
            return this.process(this.contactParametersMap, text, token);
        }
        catch (error)
        {
            if (this.contactParametersMap.size == 0)
            {
                throw ReferenceError('This TokenString needs a contact.');
            }
            else
            {
                throw ReferenceError('There is no token "' + token.parameter + '" defined for contact.');
            }
        }
    }

    protected processInformation (text: string, token: Token): string
    {
        try
        {
            return this.process(this.informationParametersMap, text, token);
        }
        catch (error)
        {
            if (this.informationParametersMap.size == 0)
            {
                throw ReferenceError('This TokenString needs an information object.');
            }
            else
            {
                throw ReferenceError('There is no token "' + token.parameter + '" defined for information.');
            }
        }
    }

    protected processCustom (text: string, token: Token): string
    {
        try
        {
            return this.process(this.customsMap, text, token);
        }
        catch (error)
        {
            throw ReferenceError('There is no token variable "' + token.parameter + '" defined.');
        }
    }

    public setContact (contact: Contact): void
    {
        this.contactParametersMap.set('name', contact.name);
        this.contactParametersMap.set('discordName', contact.discordName);
        this.contactParametersMap.set('nickname', contact.nickname);
    }

    public setInformation (information: Information): void
    {
        this.informationParametersMap.set('giftTypeAsTaker', information.giftTypeAsTaker);
        this.informationParametersMap.set('giftTypeAsGiver', information.giftTypeAsGiver);
        this.informationParametersMap.set('address', information.address);
        this.informationParametersMap.set('country', information.country);
        this.informationParametersMap.set('steamName', information.steamName);
        this.informationParametersMap.set('international', information.international);
        this.informationParametersMap.set('wishList', information.wishList);
        this.informationParametersMap.set('allergies', information.allergies);
        this.informationParametersMap.set('giftExclusion', information.giftExclusion);
        this.informationParametersMap.set('userExclusion', information.userExclusion);
        this.informationParametersMap.set('freeText', information.freeText);
    }

    /**
     * Set a custom key usable in the string. \
     * The used object does not matter, only the parameter.
     */
    public setCustom (key: string, value: string): void
    {
        this.customsMap.set(key, value);
    }

    /**
     * Processes the tokens for the currently set values.
     * @throws {ReferenceError} The value for all tokens must be given.
     */
    public getResult (): string
    {
        let result = this.rawString;

        for (const token of this.tokens)
        {
            switch (token.object)
            {
                case 'contact':
                    result = this.processContact(result, token);
                    break;
                case 'information':
                    result = this.processInformation(result, token);
                    break;
                default:
                    result = this.processCustom(result, token);
                    break;
            }
        }

        return result;
    }
}
