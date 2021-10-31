import { ButtonStyle, Component, ComponentType } from "../../endpoint/definitions";
import Config from "../../../utility/config";
import Localisation from "../../../utility/localisation";

export abstract class ComponentBuilder
{
    public static readonly yesNo: Component[] = [
        {
            type: ComponentType.Button,
            style: ButtonStyle.Success,
            label: Localisation.values.yes,
        },
        {
            type: ComponentType.Button,
            style: ButtonStyle.Danger,
            label: Localisation.values.no,
        },
    ];

    public static readonly giftTypes: Component[] = [
        {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            label: Localisation.values.giftTypeAnalogue,
        },
        {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            label: Localisation.values.giftTypeDigital,
        },
        {
            type: ComponentType.Button,
            style: ButtonStyle.Success,
            label: Localisation.values.giftTypeAll,
        },
    ];

    public static readonly countries: Component[] = [
        {
            type: ComponentType.Select,
            // TODO: This breaks the principle of processing every TokenString. Is there a better way?
            placeholder: Localisation.texts.countrySelectPlaceholder.rawString,
            options: Config.rawCountries,
        },
    ];
}
