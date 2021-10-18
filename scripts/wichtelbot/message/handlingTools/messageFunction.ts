import Message from '../../endpoint/definitions/message';

type MessageFunction = (message: Message) => Promise<void>;

export default MessageFunction;
