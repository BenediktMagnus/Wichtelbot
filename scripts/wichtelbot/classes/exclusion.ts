import { ExclusionReason } from "../types/exclusionReason";

export class Exclusion
{
    public wichtelEvent: string;
    public giverId: string;
    public takerId: string;
    public reason: ExclusionReason;

    constructor (exclusion: Exclusion)
    {
        this.wichtelEvent = exclusion.wichtelEvent;
        this.giverId = exclusion.giverId;
        this.takerId = exclusion.takerId;
        this.reason = exclusion.reason;
    }
}
