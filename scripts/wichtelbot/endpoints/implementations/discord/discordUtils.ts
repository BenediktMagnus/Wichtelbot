import * as Discord from 'discord.js';

const safetyMargin = 16;
const maxMessageLength = 2000 - safetyMargin;
const maxUserNameLength = 32; // Alternatively maxUserIdLength = 20 should be enough, but this is safe.
const maxMentionLength = maxUserNameLength + 5; // Because of the following format: <@&user> and the space
const maxMessageWithMentionLength = maxMessageLength - maxMentionLength;

type SendMessage = (message: string, attachment?: Discord.MessageAttachment) => any;

export abstract class DiscordUtils
{
    public static readonly maxMessageLength = maxMessageLength;
    public static readonly maxMessageWithMentionLength = maxMessageWithMentionLength;

    public static sendMultiMessage (sendMessage: SendMessage, messageTexts: string[], imageUrl?: string): void
    {
        let entryCounter = messageTexts.length - 1;
        for (const messageText of messageTexts)
        {
            if ((imageUrl !== undefined) && (entryCounter === 0))
            {
                // The image must be attached to the last message we send.
                const attachment = new Discord.MessageAttachment(imageUrl);
                sendMessage(messageText, attachment);
            }
            else
            {
                sendMessage(messageText);
            }

            entryCounter--;
        }
    }
}
