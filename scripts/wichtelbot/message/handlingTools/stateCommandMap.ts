import { CommandHandlerFunction } from './handlerFunctions';
import StateCommand from './stateCommand';

export default class StateCommandMap
{
    protected map = new Map<string, CommandHandlerFunction>();

    public set (stateCommand: StateCommand, handlerFunction: CommandHandlerFunction): void
    {
        this.map.set(stateCommand.key, handlerFunction);
    }

    public has (stateCommand: StateCommand): boolean
    {
        const result = this.map.has(stateCommand.key);

        return result;
    }

    public get (stateCommand: StateCommand): CommandHandlerFunction
    {
        const messageFunction = this.map.get(stateCommand.key);

        if (messageFunction === undefined)
        {
            throw new ReferenceError('The given state command has no associated message function.');
        }

        return messageFunction;
    }
}
