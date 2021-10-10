import Message from '../definitions/message';

type MessageFunction = (message: Message) => Promise<void>;

export default MessageFunction;
