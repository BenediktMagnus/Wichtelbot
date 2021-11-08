enum WichtelEventPhase
{
    Waiting = 'waiting',
    Registration = 'registration',
    Wichteln = 'wichteln',
    Ended = 'ended',
}

export default WichtelEventPhase;

export interface WichtelEvent
{
    name: string;
    registration: number;
    assignment: number;
    end: number;
}
