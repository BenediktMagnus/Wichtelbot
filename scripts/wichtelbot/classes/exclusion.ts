import { ExclusionReason } from "../types/exclusionReason";
import Utils from "../../utility/utils";

export interface ExclusionData
{
    giverId: string;
    takerId: string;
    reason: ExclusionReason;
}

function instanceOfExclusion (object: any): object is Exclusion
{
    const potentialExclusion = object as Exclusion;

    return (potentialExclusion.lastUpdateTime !== undefined);
}

export class Exclusion implements ExclusionData
{
    public giverId: string;
    public takerId: string;
    public reason: ExclusionReason;
    public lastUpdateTime: number;

    constructor (exclusion: Exclusion|ExclusionData)
    {
        if (instanceOfExclusion(exclusion))
        {
            this.lastUpdateTime = exclusion.lastUpdateTime;
        }
        else
        {
            this.lastUpdateTime = Utils.getCurrentUnixTime();
        }

        this.giverId = exclusion.giverId;
        this.takerId = exclusion.takerId;
        this.reason = exclusion.reason;
    }
}
