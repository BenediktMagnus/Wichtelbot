import * as Discord from 'discord.js';
import { Button, ButtonStyle, Component, ComponentType, Select } from '../../definitions';

const safetyMargin = 16;
const maxMessageLength = 2000 - safetyMargin;
const maxUserNameLength = 32; // Alternatively maxUserIdLength = 20 should be enough, but this is safe.
const maxMentionLength = maxUserNameLength + 5; // Because of the following format: <@&user> and the space
const maxMessageWithMentionLength = maxMessageLength - maxMentionLength;

type SendMessage = (options: Discord.MessageOptions) => Promise<any>;

export abstract class DiscordUtils
{
    public static readonly maxMessageLength = maxMessageLength;
    public static readonly maxMessageWithMentionLength = maxMessageWithMentionLength;

    public static async sendMultiMessage (
        sendMessage: SendMessage,
        messageTexts: string[],
        components?: Component[],
        imageUrl?: string
    ): Promise<void>
    {
        let entryCounter = messageTexts.length - 1;
        for (const messageText of messageTexts)
        {
            const messageOptions: Discord.MessageOptions = {
                content: messageText,
            };

            if (entryCounter === 0)
            {
                // Components and images must be attached to the last message we send.

                if (components !== undefined)
                {
                    const messageComponents = this.convertComponents(components);
                    messageOptions.components = messageComponents;
                }

                if (imageUrl !== undefined)
                {
                    const attachment = new Discord.MessageAttachment(imageUrl);
                    messageOptions.attachments = [attachment];
                }
            }

            await sendMessage(messageOptions);

            entryCounter--;
        }
    }

    /**
     * Convert a list of component definitions to Discord message components.
     */
    public static convertComponents (components: Component[]): Discord.MessageActionRow[]
    {
        const actionRow = new Discord.MessageActionRow();

        for (const component of components)
        {
            switch (component.type)
            {
                case ComponentType.Button:
                {
                    const button = component as Button;

                    const messageButton = new Discord.MessageButton();
                    messageButton.setLabel(button.label);
                    messageButton.setCustomId(button.value);

                    switch (button.style)
                    {
                        case ButtonStyle.Primary:
                            messageButton.setStyle('PRIMARY');
                            break;
                        case ButtonStyle.Secondary:
                            messageButton.setStyle('SECONDARY');
                            break;
                        case ButtonStyle.Success:
                            messageButton.setStyle('SUCCESS');
                            break;
                        case ButtonStyle.Danger:
                            messageButton.setStyle('DANGER');
                            break;
                        case ButtonStyle.Link:
                            messageButton.setStyle('LINK');
                            break;
                    }

                    actionRow.addComponents(messageButton);

                    break;
                }
                case ComponentType.Select:
                {
                    const select = component as Select;

                    const messageSelect = new Discord.MessageSelectMenu();
                    messageSelect.setPlaceholder(select.placeholder);
                    messageSelect.setCustomId('menu'); // TODO: Should this be unique or even given by the user?

                    for (const option of select.options)
                    {
                        messageSelect.addOptions(
                            {
                                label: option.label,
                                value: option.value,
                            }
                        );
                    }

                    actionRow.addComponents(messageSelect);

                    break;
                }
            }
        }

        // TODO: What about multiple rows?
        return [actionRow];
    }
}
