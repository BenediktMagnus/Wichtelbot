import Config from "../../utility/config";

export interface RelationshipData
{
    giverId: string;
    takerId: string;
}

function instanceOfRelationship (object: any): object is Relationship
{
    const potentialRelationship = object as Relationship;

    return (potentialRelationship.wichtelEvent !== undefined);
}

export class Relationship implements RelationshipData
{
    public wichtelEvent: string;
    public giverId: string;
    public takerId: string;

    constructor (relationship: Relationship|RelationshipData)
    {
        if (instanceOfRelationship(relationship))
        {
            this.wichtelEvent = relationship.wichtelEvent;
        }
        else
        {
            this.wichtelEvent = Config.main.currentEvent.name;
        }

        this.giverId = relationship.giverId;
        this.takerId = relationship.takerId;
    }
}
