import Message from '../../endpoint/definitions/message';

export type CommandHandlerFunction = (message: Message) => Promise<void>;
export type StateCommandHandlerFunction = (message: Message, result: any) => Promise<void>;
