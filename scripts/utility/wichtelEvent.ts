enum WichtelEventPhase
{
    Waiting,
    Registration,
    Wichteln,
    Ended,
}

export default WichtelEventPhase;

export interface WichtelEvent
{
    name: string;
    registration: number;
    assignment: number;
    end: number;
}
