import MessageFunction from './messageFunction';
import StateCommand from './stateCommand';

export default class StateCommandMap
{
    protected map = new Map<string, MessageFunction>();

    public set (stateCommand: StateCommand, messageFunction: MessageFunction): void
    {
        this.map.set(stateCommand.key, messageFunction);
    }

    public has (stateCommand: StateCommand): boolean
    {
        const result = this.map.has(stateCommand.key);

        return result;
    }

    public get (stateCommand: StateCommand): MessageFunction
    {
        const messageFunction = this.map.get(stateCommand.key);

        if (messageFunction === undefined)
        {
            throw new ReferenceError('The given state command has no associated message function.');
        }

        return messageFunction;
    }
}
