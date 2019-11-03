import GeneralTestUtility from '../utility/general';

import { MessageWithParser } from '../../scripts/wichtelbot/message/definitions/message';
import MessageDefinition from '../../scripts/wichtelbot/message/definitions/message';
import User from '../../scripts/wichtelbot/message/definitions/user';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import Client from '../../scripts/wichtelbot/message/definitions/client';

export type SendOrReplyFunction = (text: string, imageUrl?: string) => void;

export class TestMessage extends MessageWithParser implements MessageDefinition
{
    public content: string;
    public author: User;
    public channel: Channel;
    public client: Client;
    public reply: SendOrReplyFunction;

    constructor (reply: SendOrReplyFunction, userSend: SendOrReplyFunction, channelSend: SendOrReplyFunction, channelType: ChannelType)
    {
        super();

        // TODO: Utility for author/client creation.

        this.content = GeneralTestUtility.createRandomString();
        this.author = {
            id: GeneralTestUtility.createRandomString(),
            tag: GeneralTestUtility.createRandomString(),
            name: GeneralTestUtility.createRandomString(),
            isBot: false,
            send: userSend,
        };
        this.channel = {
            id: GeneralTestUtility.createRandomString(),
            type: channelType,
            send: channelSend,
        };
        this.client = {
            getChannel: (): Channel =>
            {
                return this.channel;
            },
            fetchUser: (): Promise<User> =>
            {
                return new Promise(
                    (resolve): void =>
                    {
                        resolve(this.author);
                    }
                );
            },
        };
        this.reply = reply;
    }
}
