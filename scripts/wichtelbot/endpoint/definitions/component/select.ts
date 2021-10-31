import { ComponentType } from "./componentType";

export interface Select
{
    type: ComponentType.Select;
    placeholder: string;
    options: string[];
}
