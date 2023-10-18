import { Visualisation, VisualisationType } from "../../endpoint/definitions";
import GiftType from "../../types/giftType";
import Localisation from "../../../utility/localisation";
import Member from "../../classes/member";

export abstract class HandlingUtils
{
    public static getProfileVisualisations (member: Member): Visualisation[]
    {
        const visualisations: Visualisation[] = [
            {
                headline: Localisation.texts.profileName.process(member),
                text: member.name,
                type: VisualisationType.Compact
            },
            {
                headline: Localisation.texts.profileGiftType.process(member),
                text: Localisation.translateGiftType(member.information.giftTypeAsTaker),
                type: VisualisationType.Compact
            }
        ];

        const sendAnalogue = member.information.giftTypeAsTaker == GiftType.Analogue || member.information.giftTypeAsTaker == GiftType.All;
        const sendDigital = member.information.giftTypeAsTaker == GiftType.Digital || member.information.giftTypeAsTaker == GiftType.All;

        if (sendAnalogue)
        {
            visualisations.push(
                {
                    headline: Localisation.texts.profileCounty.process(member),
                    text: Localisation.translateCountry(member.information.country),
                    type: VisualisationType.Compact
                }
            );

            visualisations.push(
                {
                    headline: Localisation.texts.profileAddress.process(member),
                    text: member.information.address,
                    type: VisualisationType.Compact
                }
            );
        }

        if (sendDigital)
        {
            const steamFriendshipCode = member.information.steamFriendshipCode.trim();
            if (this.isValidSteamFriendshipCode(steamFriendshipCode))
            {
                visualisations.push(
                    {
                        headline: Localisation.texts.profileSteamFriendshipCode.process(member),
                        text: steamFriendshipCode,
                        type: VisualisationType.Compact
                    }
                );
            }

            visualisations.push(
                {
                    headline: Localisation.texts.profileDigitalAddress.process(member),
                    text: member.information.digitalAddress,
                    type: VisualisationType.Compact
                }
            );
        }

        visualisations.push(
            {
                headline: Localisation.texts.profileWishlist.process(member),
                text: member.information.wishList,
                type: VisualisationType.Normal
            }
        );

        if (sendAnalogue)
        {
            visualisations.push(
                {
                    headline: Localisation.texts.profileAllergies.process(member),
                    text: member.information.allergies,
                    type: VisualisationType.Normal
                }
            );
        }

        visualisations.push(
            {
                headline: Localisation.texts.profileExclusion.process(member),
                text: member.information.giftExclusion,
                type: VisualisationType.Normal
            }
        );

        visualisations.push(
            {
                headline: Localisation.texts.profileFreeText.process(member),
                text: member.information.freeText,
                type: VisualisationType.Normal
            }
        );

        return visualisations;
    }

    public static isValidSteamFriendshipCode (value: string): boolean
    {
        return /^\d+$/.test(value.trim());
    }
}
