import * as fs from 'fs';

import Config from './config';
import TokenString from './tokenString';

interface Command
{
    commands: string[];
    info: string;
}

interface Commands
{
    notUnderstood: Command;
}

interface Texts
{
    notUnderstood: TokenString;
}

export default abstract class Localisation
{
    private static commandsPath = './local/' + Config.main.local + '.commands.json';
    private static textsPath = './local/' + Config.main.local + '.texts.json';

    private static _commands: Commands = JSON.parse(fs.readFileSync(Localisation.commandsPath, 'utf8'));
    private static _texts: Texts = JSON.parse(fs.readFileSync(Localisation.textsPath, 'utf8'),
        /**
         * A reviver for the JSON.parse function to convert strings into TokenString.
         */
        function (this: any, _key: string, value: string): any
        {
            if ((typeof value) == 'string')
            {
                const tokenString = new TokenString(value);

                return tokenString;
            }
            else
            {
                return value;
            }
        }
    );

    public static get commands (): Commands
    {
        return Localisation._commands;
    }

    public static get texts (): Texts
    {
        return Localisation._texts;
    }
}
