import { ButtonStyle } from "./buttonStyle";
import { ComponentType } from "./componentType";

export interface Button
{
    type: ComponentType.Button;
    style: ButtonStyle;
    label: string;
    value: string; // TODO: As label and value will and must be the same, we do not need seperate fields for label and value.
}
