import Message from '../../endpoints/definitions/message';

type MessageFunction = (message: Message) => Promise<void>;

export default MessageFunction;
