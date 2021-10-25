import { ButtonStyle } from "./buttonStyle";
import { Component } from "./component";
import { ComponentType } from "./componentType";

export interface Button extends Component
{
    type: ComponentType.Button;
    style: ButtonStyle;
    label: string;
    value: string;
}
