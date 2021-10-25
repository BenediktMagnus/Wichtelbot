import { ComponentType } from "./componentType";

// TODO: Document the whole component system and how it is translated to strings when returned.
export interface Component
{
    type: ComponentType; // TODO: This can be improved for this to be a real type-guard.
}
