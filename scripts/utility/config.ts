import * as fs from 'fs';

import WichtelEventPhase, { WichtelEvent } from './wichtelEvent';
import Utils from './utils';

interface MainConfig
{
    locale: string;
    commandPrefix: string;
    moderationChannelIds: string[];
    allowedCountries: string[];
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
    private static readonly mainConfigFileName = 'config';
    private static readonly botConfigFileName = 'bot';

    private static _main: MainConfig|null = null;
    private static _bot: BotConfig|null = null;

    public static reload (): void
    {
        Config._bot = JSON.parse(fs.readFileSync('./config/' + Config.botConfigFileName + '.json', 'utf8')) as BotConfig;

        const mainConfig = JSON.parse(fs.readFileSync('./config/' + Config.mainConfigFileName + '.json', 'utf8')) as MainConfig;
        Config._main = mainConfig;

        // Convert all countries to lowercase for safer comparison:
        for (let i = mainConfig.allowedCountries.length; i-- > 0;)
        {
            let country = mainConfig.allowedCountries[i];

            country = country.toLocaleLowerCase();

            mainConfig.allowedCountries[i] = country;
        }
    }

    public static get main (): MainConfig
    {
        if (Config._main === null)
        {
            throw new Error('Config not loaded!');
        }

        return Config._main;
    }

    public static get bot (): BotConfig
    {
        if (Config._bot === null)
        {
            throw new Error('Config not loaded!');
        }

        return Config._bot;
    }

    public static get currentEventPhase (): WichtelEventPhase
    {
        if (this._main === null)
        {
            throw new Error('Config not loaded!');
        }

        const currentEvent = this._main.currentEvent;
        const currentTime = Utils.getCurrentUnixTime();

        if (currentTime < currentEvent.registration)
        {
            return WichtelEventPhase.Waiting;
        }
        else if (currentTime < currentEvent.assignment)
        {
            return WichtelEventPhase.Registration;
        }
        else if (currentTime < currentEvent.end)
        {
            return WichtelEventPhase.Wichteln;
        }
        else
        {
            return WichtelEventPhase.Ended;
        }
    }
}
Config.reload();
