export interface KeyValuePair
{
    key: string;
    value: string;
}

/**
 * Class for quick creation of KeyValuePair arrays.
 */
export class KeyValuePairList extends Array<KeyValuePair>
{
    constructor (key?: string, value?: string)
    {
        super();

        if ((key !== undefined) && (value !== undefined))
        {
            this.addPair(key, value);
        }
    }

    /**
     * Add a key value pair to the array.
     */
    public addPair (key: string, value: string): void
    {
        this.push(
            {
                key: key,
                value: value
            }
        );
    }
}
