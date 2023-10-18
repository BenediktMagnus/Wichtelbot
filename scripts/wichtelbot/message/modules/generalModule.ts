import { Additions, User, Visualisation, VisualisationType } from '../../endpoint/definitions';
import Localisation, { CommandInfo } from '../../../utility/localisation';
import Config from '../../../utility/config';
import Contact from '../../classes/contact';
import ContactType from '../../types/contactType';
import Database from '../../database/database';
import { KeyValuePairList } from '../../../utility/keyValuePair';
import Member from '../../classes/member';
import Message from '../../endpoint/definitions/message';
import State from '../../endpoint/definitions/state';
import TokenString from '../../../utility/tokenString';
import Utils from '../../../utility/utils';
import WichtelEventPhase from '../../../utility/wichtelEvent';

/**
 * Message module for general things to handle.
 */
export default class GeneralModule
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    /**
     * Replies with a defined text. \
     * Will set User/Contact data for the TokenString.
     * @param text The text to reply.
     */
    public async reply (message: Message, text: TokenString, options?: Additions): Promise<void>
    {
        const whatIsThere = this.database.getWhatIsThere(message.author);
        const answer = text.process(whatIsThere);

        await message.reply(answer, options);
    }

    /**
     * Sets the state of the contact, then replies.
     */
    public async continue (message: Message, state: State, text: TokenString, options?: Additions): Promise<void>
    {
        const contact = this.database.getContact(message.author.id);
        contact.state = state;
        this.database.updateContact(contact);

        await this.reply(message, text, options);
    }

    /**
     * Makes first contact with a new user. \
     * Will save the new contact in the database.
     */
    public async makeFirstContact (message: Message): Promise<void>
    {
        let answer: string;

        if (Config.currentEventPhase == WichtelEventPhase.Waiting)
        {
            const registrationTimeInMs = Config.main.currentEvent.registration * 1000;
            const nowInMs = Date.now();
            const msUntilRegistration = registrationTimeInMs - nowInMs;

            // Twice as long after the registration then until it prevents that the random dates "circles" around the real one:
            const timeSpanInMs = msUntilRegistration * 3;

            const randomAdditionInMs = Math.floor(Math.random() * timeSpanInMs);

            const registrationPhaseTime = new Date(nowInMs + randomAdditionInMs);

            const registrationDateStrings = Utils.dateToDateStrings(registrationPhaseTime);

            const parameters = new KeyValuePairList();
            parameters.addPair('year', registrationDateStrings.year);
            parameters.addPair('month', registrationDateStrings.month);
            parameters.addPair('day', registrationDateStrings.day);
            parameters.addPair('hour', registrationDateStrings.hour);
            parameters.addPair('minute', registrationDateStrings.minute);

            answer = Localisation.texts.contactingTooEarly.process(message.author, parameters);
        }
        else if (Config.currentEventPhase == WichtelEventPhase.Registration)
        {
            let text: TokenString;

            if (!this.database.hasContact(message.author.id))
            {
                const contact = new Contact(message.author);
                contact.state = State.New;

                this.database.saveContact(contact);

                text = Localisation.texts.contactingRegistration;
            }
            else
            {
                const contact = this.database.getContact(message.author.id);

                if (contact.type == ContactType.Contact)
                {
                    if ((contact.state == State.Nothing) || (contact.state == State.New))
                    {
                        // Not registered in THIS event yet.
                        text = Localisation.texts.contactingRegistration;
                    }
                    else
                    {
                        // In the middle of the registration:
                        text = Localisation.texts.contactingWhileRegistration;
                    }
                }
                else
                {
                    // Otherwise, if it is of another contact type he wants to register again, which we answer with a special text.
                    text = Localisation.texts.contactingAlreadyRegistered;
                }
            }

            try
            {
                const parameters = new KeyValuePairList('currentEventName', Config.main.currentEvent.name);
                const privateMessage = text.process(message.author, parameters);
                await message.author.send(privateMessage);

                answer = Localisation.texts.contactingResponse.process(message.author);
            }
            catch (error)
            {
                // If there is an error, we probably are not allowed to send private messages. Inform the user about this:
                answer = Localisation.texts.contactingFailedResponse.process(message.author);
            }
        }
        else // Wichteln or Ended
        {
            answer = Localisation.texts.contactingTooLate.process(message.author);
        }

        await message.reply(answer);
    }

    /**
     * Updates the contact data (tag and name) of a contact if it is in the database.
     * @param user The user to update the contact data for.
     * @param contact If set, the contact to update. If not set, the contact will be fetched from the database.
     */
    public updateContactDataIfInDatabase (user: User, contact?: Contact): void
    {
        let foundContact = contact;

        if (foundContact === undefined)
        {
            if (this.database.hasContact(user.id))
            {
                foundContact = this.database.getContact(user.id);
            }
            else
            {
                return;
            }
        }

        foundContact.tag = user.tag;
        foundContact.name = user.name;

        this.database.updateContact(foundContact);
    }

    /**
     * Register a contact to become a member with information attached.
     * NOTE: This only attaches information to the contact to become a member CLASS. This will NOT change the contact type!
     */
    public register (message: Message): void
    {
        const contact = this.database.getContact(message.author.id);

        if (!this.database.hasInformation(contact.id))
        {
            const member = new Member(contact);

            // NOTE: We must NOT change the type of the contact here!

            this.database.saveMember(member);
        }
    }

    public async sendHelpText (message: Message, availableCommands: CommandInfo[]): Promise<void>
    {
        let helpText: string|null = null;

        // Print every available command with an info text as help message:
        if (availableCommands.length > 0)
        {
            const commandInfoTexts: string[] = [];

            for (const commandInfo of availableCommands)
            {
                if (commandInfo.info === undefined)
                {
                    continue;
                }

                const parameters = new KeyValuePairList();
                parameters.addPair('name', commandInfo.commands[0]);
                parameters.addPair('info', commandInfo.info);

                const singleCommandInfoText = Localisation.texts.commandInfo.process(message.author, parameters);

                commandInfoTexts.push(singleCommandInfoText);
            }

            if (commandInfoTexts.length > 0)
            {
                const infoText = commandInfoTexts.join('\n');

                const parameters = new KeyValuePairList('commandInfo', infoText);
                helpText = Localisation.texts.helpText.process(message.author, parameters);
            }
        }

        if (helpText === null)
        {
            const answer = Localisation.texts.noCommandsAvailable.process(message.author);
            await message.reply(answer);
        }
        else
        {
            await message.reply(helpText);
        }
    }

    public async sendMessageTooLong (message: Message, maxLength?: number): Promise<void>
    {
        const parameters = new KeyValuePairList();
        parameters.addPair('messageLength', `${message.content.length}`);
        parameters.addPair('maxLength', `${maxLength ?? Config.main.maxMessageLength}`);

        const answer = Localisation.texts.messageTooLong.process(message.author, parameters);

        await message.reply(answer);
    }

    public async callMods (message: Message): Promise<void>
    {
        const parameters = new KeyValuePairList('moderationRoleId', Config.main.moderationRoleId);

        const moderationInfo = Localisation.texts.moderationNeedHelp.process(message.author, parameters);

        const moderationChannel = await message.client.fetchChannel(Config.main.moderationChannelId);

        await moderationChannel.send(moderationInfo);
    }

    public async sendSternenroseImage (message: Message): Promise<void>
    {
        await this.reply(
            message,
            Localisation.texts.sternenrose,
            'https://cdn.discordapp.com/attachments/391928490456514561/394095185275125760/Weihn8.jpg'
        );
    }

    public async sendMessageToOwnGiftGiver (message: Message): Promise<void>
    {
        const wichtel = this.database.getWichtel(message.author.id);

        const giverUser = await message.client.fetchUser(wichtel.giverId);

        const messageText = Localisation.texts.messageFromGiftGiverOrTaker.process(message.author);
        const messageVisualisation: Visualisation = {
            headline: Localisation.texts.messageFromGiftTakerHeadline.process(message.author),
            text: message.content,
            type: VisualisationType.Normal
        };

        await giverUser.send(messageText, [messageVisualisation]);
    }

    public async sendMessageToOwnGiftTaker (message: Message): Promise<void>
    {
        const wichtel = this.database.getWichtel(message.author.id);

        const takerUser = await message.client.fetchUser(wichtel.takerId);

        const messageText = Localisation.texts.messageFromGiftGiverOrTaker.process(message.author);
        const messageVisualisation: Visualisation = {
            headline: Localisation.texts.messageFromGiftGiverHeadline.process(message.author),
            text: message.content,
            type: VisualisationType.Normal
        };

        await takerUser.send(messageText, [messageVisualisation]);
    }
}
