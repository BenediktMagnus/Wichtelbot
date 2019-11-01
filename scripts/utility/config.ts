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

    private static _main: MainConfig = {} as any;
    private static _bot: BotConfig = {} as any;

    private static loadConfig (fileName: string): any
    {
        const content = JSON.parse(fs.readFileSync('./config/' + fileName + '.json', 'utf8'));

        return content;
    }

    public static reload (): void
    {
        Config._bot = Config.loadConfig(Config.botConfigFileName);

        const mainConfig: MainConfig = Config.loadConfig(Config.mainConfigFileName);
        Config._main = mainConfig;

        // Convert all countries to lowercase for safer comparison:
        for (let i = mainConfig.allowedCountries.length; i-- > 0;)
        {
            let country = mainConfig.allowedCountries[i];

            country = country.toLowerCase();

            mainConfig.allowedCountries[i] = country;
        }
    }

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
