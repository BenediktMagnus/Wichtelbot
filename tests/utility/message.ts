import GeneralTestUtility from '../utility/general';

import { MessageWithParser } from '../../scripts/wichtelbot/message/definitions/message';
import MessageDefinition from '../../scripts/wichtelbot/message/definitions/message';
import User from '../../scripts/wichtelbot/message/definitions/user';
import { Channel, ChannelType } from '../../scripts/wichtelbot/message/definitions/channel';
import Client from '../../scripts/wichtelbot/message/definitions/client';

type sendOrReply = (text: string, imageUrl?: string) => void;

export class TestMessage extends MessageWithParser implements MessageDefinition
{
    public content: string;
    public author: User;
    public channel: Channel;
    public client: Client;
    public reply: sendOrReply;

    constructor (reply: sendOrReply, userSend: sendOrReply, channelSend: sendOrReply, channelType: ChannelType)
    {
        super();

        // TODO: Utility for author/client creation.

        this.content = GeneralTestUtility.createRandomString();
        this.author = {
            id: 'testId',
            tag: 'testName#1234',
            name: 'testName',
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
