import { ComponentType } from "./componentType";
import { SelectOption } from "./selectOption";

export interface Select
{
    type: ComponentType.Select;
    placeholder: string;
    options: SelectOption[];
}
