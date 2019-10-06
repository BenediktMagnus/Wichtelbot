import * as fs from 'fs';

interface WichtelEvent
{
    name: string;
    start: number;
    end: number;
}

interface MainConfig
{
    wichtelEvents: WichtelEvent[];
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
}
