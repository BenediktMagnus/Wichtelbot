import * as Discord from 'discord.js';
import { Additions, ButtonStyle, Component, ComponentType, Visualisation, VisualisationType } from '../../definitions';

const safetyMargin = 16;
const maxMessageLength = 2000 - safetyMargin;
const maxUserNameLength = 32; // Alternatively maxUserIdLength = 20 should be enough, but this is safe.
const maxMentionLength = maxUserNameLength + 5; // Because of the following format: <@&user> and the space
const maxMessageWithMentionLength = maxMessageLength - maxMentionLength;
const maxEmbedLength = 6000;

export type SendMessage = (options: Discord.MessageOptions) => Promise<any>;

export abstract class DiscordUtils
{
    public static readonly maxMessageLength = maxMessageLength;
    public static readonly maxMessageWithMentionLength = maxMessageWithMentionLength;

    public static async sendMultiMessage (
        sendMessage: SendMessage,
        messageTexts: string[],
        additions?: Additions
    ): Promise<void>
    {
        let entryCounter = messageTexts.length - 1;
        for (const messageText of messageTexts)
        {
            const messageOptions: Discord.MessageOptions = {
                content: messageText,
            };

            if ((entryCounter === 0) && (additions !== undefined))
            {
                // Optional additions must be attached to the last message we send.

                if (typeof additions === 'string')
                {
                    messageOptions.files = [
                        {
                            attachment: additions,
                        },
                    ];
                }
                else if (this.isComponents(additions))
                {
                    const messageComponents = this.convertComponents(additions);
                    messageOptions.components = messageComponents;
                }
                else if (this.isVisualisations(additions))
                {
                    // The compact visualisations are added as a shared embed to the last message.

                    const sharedCompactEmbed = new Discord.MessageEmbed();

                    for (const visualisation of additions)
                    {
                        if (visualisation.type == VisualisationType.Compact)
                        {
                            // FIXME: Warum gab es hier leere Felder?!
                            sharedCompactEmbed.addField(visualisation.headline, visualisation.text);
                        }
                    }

                    if (sharedCompactEmbed.fields.length > 0)
                    {
                        messageOptions.embeds = [sharedCompactEmbed];
                    }
                }
            }

            await sendMessage(messageOptions);

            entryCounter--;
        }

        // All normal visualisations are send as seperate messages:
        if ((additions !== undefined) && (this.isVisualisations(additions)))
        {
            let embeds: Discord.MessageEmbed[] = [];
            let characterSum = 0;

            for (const visualisation of additions)
            {
                if (visualisation.type == VisualisationType.Normal)
                {
                    const normalEmbed = new Discord.MessageEmbed();
                    normalEmbed.setTitle(visualisation.headline);
                    normalEmbed.setDescription(visualisation.text);

                    const characterCount = visualisation.headline.length + visualisation.text.length;

                    if (characterSum + characterCount > maxEmbedLength)
                    {
                        await sendMessage({ embeds: embeds });
                        embeds = [normalEmbed];
                        characterSum = characterCount;
                    }
                    else
                    {
                        embeds.push(normalEmbed);
                        characterSum += characterCount;
                    }
                }
            }

            if (embeds.length > 0)
            {
                await sendMessage({ embeds: embeds });
            }
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
                    const messageButton = new Discord.MessageButton();
                    messageButton.setLabel(component.label);
                    messageButton.setCustomId(component.label);

                    switch (component.style)
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
                    const messageSelect = new Discord.MessageSelectMenu();
                    messageSelect.setPlaceholder(component.placeholder);
                    messageSelect.setCustomId('menu'); // TODO: Should this be unique or even given by the user?

                    for (const option of component.options)
                    {
                        messageSelect.addOptions(
                            {
                                label: option,
                                value: option,
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

    public static isComponents (additions: Additions): additions is Component[]
    {
        if (typeof additions === 'string')
        {
            return false;
        }
        else if (additions.length === 0)
        {
            return true;
        }
        else
        {
            return Object.values(ComponentType).includes(additions[0].type as ComponentType);
        }
    }

    public static isVisualisations (additions: Additions): additions is Visualisation[]
    {
        if (typeof additions === 'string')
        {
            return false;
        }
        else if (additions.length === 0)
        {
            return true;
        }
        else
        {
            return Object.values(VisualisationType).includes(additions[0].type as VisualisationType);
        }
    }
}
