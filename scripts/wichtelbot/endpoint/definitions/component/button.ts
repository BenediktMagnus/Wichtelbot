import { ButtonStyle } from "./buttonStyle";
import { ComponentType } from "./componentType";

export interface Button
{
    type: ComponentType.Button;
    style: ButtonStyle;
    label: string;
}
