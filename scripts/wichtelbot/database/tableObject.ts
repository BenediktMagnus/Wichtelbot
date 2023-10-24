export class TableObject<TObject extends object>
{
    private readonly bindableObject: TObject;
    private readonly columnNames: string[];

    constructor (mainObject: TObject)
    {
        const rawObject = {
            ...mainObject,
        };

        this.bindableObject = this.extractBindables(rawObject);
        this.columnNames = Object.keys(this.bindableObject);
    }

    /**
     * Copies all bindable properties from an object, returning a bindable object
     * that can be used as binding parameters when running SQLite statements.
     */
    private extractBindables (object: TObject): TObject
    {
        // Objects can contain data that is not bindable for SQLite, for
        // example constructors, methods etc.
        // This spread operator shallow copies all properties from the object
        // into an empty one, leaving the methods alone.
        const bindableObject = { ...object };

        // SQLite3 does not support boolean values. So we have to convert
        // them into numbers, otherwise an error will be thrown.
        for (const [key, value] of Object.entries(bindableObject))
        {
            if ((typeof value) === 'boolean')
            {
                const valueAsNumber = value ? 1 : 0;

                const indexedBindableObject = bindableObject as {[key: string]: any};

                indexedBindableObject[key] = valueAsNumber;
            }
        }

        return bindableObject;
    }

    public getBindables (): Readonly<TObject>
    {
        // TODO: Even if safer, is it really necessary to return a copy?

        const bindableObjectCopy = {
            ...this.bindableObject
        };

        return bindableObjectCopy;
    }

    /**
     * Returns the names of the object properties (i.e. the column names) in the form "x, y, z".
     */
    public getJoinedColumnNames (): string
    {
        const joinedNames = this.columnNames.join(', ');

        return joinedNames;
    }

    /**
     * Returns the names of the object properties (i.e. the column names) in the form ":x, :y, :z".
     */
    public getJoinedValueKeys (): string
    {
        const valueKeys = this.columnNames.map(value => ':' + value);
        const joinedValueKeys = valueKeys.join(', ');

        return joinedValueKeys;
    }

    /**
     * Returns the names of the object properties (i.e. the column names) in the form "x = :x, y = :y, z = :z".
     */
    public getJoinedSetStatements (): string
    {
        const setStatements = this.columnNames.map(value => value + ' = :' + value);
        const joinedSetStatements = setStatements.join(',');

        return joinedSetStatements;
    }
}
