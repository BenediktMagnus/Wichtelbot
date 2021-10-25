import { Component } from "./component";
import { ComponentType } from "./componentType";
import { SelectOption } from "./selectOption";

export interface Select extends Component
{
    type: ComponentType.Select;
    options: SelectOption[];
}
