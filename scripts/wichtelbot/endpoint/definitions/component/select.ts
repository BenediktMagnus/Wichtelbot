import { Component } from "./component";
import { ComponentType } from "./componentType";
import { SelectOption } from "./selectOption";

export interface Select extends Component
{
    type: ComponentType.Select;
    placeholder: string;
    options: SelectOption[];
}
