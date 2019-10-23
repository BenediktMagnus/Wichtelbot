import Contact, { ContactCoreData } from "../wichtelbot/classes/contact";
import Member from "../wichtelbot/classes/member";

interface KeyValuePair
{
    key: string;
    value: string;
}

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

            this.tokens.push(token);
        }
    }

    protected replaceToken (text: string, token: Token, value: string): string
    {
        const beforeToken = text.slice(0, token.position);
        const afterToken = text.slice(token.position + token.length);
        const result = beforeToken + value + afterToken;

        return result;
    }

    protected processToken (map: Map<string, string>, text: string, token: Token): string
    {
        const value = map.get(token.parameter);

        if (value === undefined)
        {
            throw ReferenceError(`There is no value given for the token ${token.object}.${token.parameter}.`);
        }

        const result = this.replaceToken(text, token, value);

        return result;
    }

    protected setContactData (map: Map<string, string>, contactData: ContactCoreData | Contact | Member): void
    {
        const contact = new Contact(contactData);

        map.set('name', contact.name);
        map.set('tag', contact.tag);
        map.set('nickname', contact.nickname);

        if (contactData instanceof Member)
        {
            map.set('giftTypeAsTaker', contactData.information.giftTypeAsTaker);
            map.set('giftTypeAsGiver', contactData.information.giftTypeAsGiver);
            map.set('address', contactData.information.address);
            map.set('country', contactData.information.country);
            map.set('steamName', contactData.information.steamName);
            map.set('international', contactData.information.international);
            map.set('wishList', contactData.information.wishList);
            map.set('allergies', contactData.information.allergies);
            map.set('giftExclusion', contactData.information.giftExclusion);
            map.set('userExclusion', contactData.information.userExclusion);
            map.set('freeText', contactData.information.freeText);

            // TODO: Wichtel
        }
    }

    /**
     * Processes the tokens for the currently set values.
     * @throws {ReferenceError} The value for all tokens must be given.
     */
    public process (contactData?: ContactCoreData | Contact | Member, customData?: KeyValuePair[]): string
    {
        const contactDataMap = new Map<string, string>();
        const customDataMap = new Map<string, string>();

        if (contactData !== undefined)
        {
            this.setContactData(contactDataMap, contactData);
        }
        if (customData !== undefined)
        {
            for (const keyValuePair of customData)
            {
                customDataMap.set(keyValuePair.key, keyValuePair.value);
            }
        }

        let result = this.rawString;

        // We must go backwards through the array to prevent that the process
        // procedure invalidates all token positions after the first replace:
        for (let i = this.tokens.length; i-- > 0;)
        {
            const token = this.tokens[i];

            switch (token.object)
            {
                case 'contact':
                case 'information':
                    result = this.processToken(contactDataMap, result, token);
                    break;
                default:
                    result = this.processToken(customDataMap, result, token);
                    break;
            }
        }

        return result;
    }
}
