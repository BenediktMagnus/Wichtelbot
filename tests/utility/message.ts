import { Channel, ChannelType, Client, Component, Message, State, User } from '../../scripts/wichtelbot/endpoint/definitions';
import Contact from '../../scripts/wichtelbot/classes/contact';
import Database from '../../scripts/wichtelbot/database/database';
import GeneralTestUtility from '../utility/general';
import Information from '../../scripts/wichtelbot/classes/information';
import Member from '../../scripts/wichtelbot/classes/member';
import { MessageWithParser } from '../../scripts/wichtelbot/endpoint/base/messageWithParser';

// TODO: Can this whole file be replaced with mockito?

type SendOrReplyFunction = (text: string, components?: Component[], imageUrl?: string) => Promise<void>;

export class TestMessage extends MessageWithParser implements Message
{
    public content: string;
    public author: User;
    public channel: Channel;
    public client: Client;
    public hasComponentOrigin: boolean;
    public reply: (text: string, components?: Component[], imageUrl?: string) => Promise<void>;

    constructor (reply: SendOrReplyFunction, userSend: SendOrReplyFunction, channelSend: SendOrReplyFunction, channelType: ChannelType)
    {
        super();

        this.hasComponentOrigin = false;

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
            fetchChannel: async (): Promise<Channel> =>
            {
                return this.channel;
            },
            fetchUser: async (): Promise<User> =>
            {
                return new Promise(
                    (resolve): void =>
                    {
                        resolve(this.author);
                    }
                );
            },
        };
        this.reply = async (text, imageUrl): Promise<void> => { await reply(text, imageUrl); };
    }
}

export class TestMessageWithFixedAuthor extends TestMessage
{
    constructor (reply: SendOrReplyFunction, userSend: SendOrReplyFunction, channelSend: SendOrReplyFunction, channelType: ChannelType)
    {
        super(reply, userSend, channelSend, channelType);

        this.author.id = 'testId';
        this.author.tag = 'testName#1234';
        this.author.name= 'testName';
    }
}

type TestCallbackContact = (text: string, author: Contact) => void;
type TestCallbackMember = (text: string, author: Member) => void;

export class CommandTestMessage extends TestMessage
{
    protected database: Database;
    protected testCallback: TestCallbackContact | TestCallbackMember;

    public called: boolean;

    constructor (database: Database, testCallback: TestCallbackContact | TestCallbackMember, channelType: ChannelType)
    {
        const resultCallback = async (text: string): Promise<void> =>
        {
            this.called = true;

            let whatIsThere: Contact | Member;
            if (this.database.hasInformation(this.author.id))
            {
                whatIsThere = this.database.getMember(this.author.id);
            }
            else if (this.database.hasContact(this.author.id))
            {
                whatIsThere = this.database.getContact(this.author.id);
            }
            else
            {
                throw ReferenceError('The contact or member has not been prepared.');
            }

            this.testCallback(text, whatIsThere as any); // Hacks are allowed in test...
        };

        super(resultCallback, resultCallback, resultCallback, channelType);

        this.database = database;
        this.testCallback = testCallback;
        this.called = false;
    }

    public prepareContact (state: State): void
    {
        const contact = new Contact(this.author);
        contact.state = state;

        this.database.saveContact(contact);
    }

    public prepareMember (state: State, information?: Information): void
    {
        const contact = new Contact(this.author);
        contact.state = state;

        this.database.saveContact(contact);

        const member = new Member(contact, information);

        this.database.saveMember(member);
    }
}
