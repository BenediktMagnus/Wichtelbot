import State from '../../endpoint/definitions/state';

export default class StateCommand
{
    public readonly state: State;
    public readonly command: string;
    /**
     * The key for the this StateCommand. \
     * Two StateCommands' keys will be the same if their state and command are the same.
     */
    public readonly key: string;

    constructor (state: State, command: string)
    {
        this.state = state;
        this.command = command;

        this.key = StateCommand.generateKey(this.state, this.command);
    }

    /**
     * Returns a key based on state and command. If they are the same, the key is the same, too.
     */
    public static generateKey (state: State, command: string): string
    {
        const key = state + ':' + command;

        return key;
    }
}
