import * as fs from 'fs';
import WichtelEventPhase, { WichtelEvent } from './wichtelEvent';
import Utils from './utils';

interface MainConfig
{
    locale: string;
    commandPrefix: string;
    moderationChannelIds: string[];
    currentEvent: WichtelEvent;
    eventHistory: WichtelEvent[];
}

interface BotConfig
{
    name: string;
    token: string;
}

export default abstract class Config
{
    private static _main: MainConfig = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
    private static _bot: BotConfig = JSON.parse(fs.readFileSync('./config/bot.json', 'utf8'));

    public static get main (): MainConfig
    {
        return Config._main;
    }

    public static get bot (): BotConfig
    {
        return Config._bot;
    }

    public static get currentEventPhase (): WichtelEventPhase
    {
        const currentEvent = this._main.currentEvent;
        const currentTime = Utils.getCurrentUnixTime();

        if (currentEvent.registration < currentTime)
        {
            return WichtelEventPhase.Waiting;
        }
        else if (currentEvent.assignment < currentTime)
        {
            return WichtelEventPhase.Registration;
        }
        else if (currentEvent.end < currentTime)
        {
            return WichtelEventPhase.Wichteln;
        }
        else
        {
            return WichtelEventPhase.Ended;
        }
    }
}
