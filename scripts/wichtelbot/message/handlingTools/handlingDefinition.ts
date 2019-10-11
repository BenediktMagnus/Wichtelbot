import { CommandInfo } from '../../../utility/localisation';
import State from "../definitions/state";
import MessageFunction from './messageFunction';

interface CommandDefinition
{
    commandInfo: CommandInfo;
    handlerFunction: MessageFunction;
}

interface StateCommandDefinition extends CommandDefinition
{
    state: State;
}

/**
 * 
 */
export default interface HandlingDefinition
{
    stateCommands: StateCommandDefinition[];
    publicCommands: CommandDefinition[];
    moderatorCommands: CommandDefinition[];
}
