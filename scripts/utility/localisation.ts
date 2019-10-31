import * as fs from 'fs';

import Config from './config';
import TokenString from './tokenString';

export interface CommandInfo
{
    commands: string[];
    info: string | undefined;
}

interface Commands
{
    contacting: CommandInfo;
    goodMorning: CommandInfo;
    maybe: CommandInfo;
    no: CommandInfo;
    registration: CommandInfo;
    yes: CommandInfo;
}

interface Texts
{
    commandInfo: TokenString;
    contactingTooEarly: TokenString;
    contactingRegistration: TokenString;
    contactingAlreadyRegistered: TokenString;
    contactingTooLate: TokenString;
    goodMorning: TokenString;
    helpText: TokenString;
    informationGiftTypeAsGiver: TokenString;
    maybeResponse: TokenString;
    notUnderstood: TokenString;
    registration: TokenString;
    registrationCancelled: TokenString;
}

export default abstract class Localisation
{
    private static commandsPath = './locale/' + Config.main.locale + '.commands.json';
    private static textsPath = './locale/' + Config.main.locale + '.texts.json';

    private static _commands: Commands = JSON.parse(fs.readFileSync(Localisation.commandsPath, 'utf8'));
    private static _texts: Texts = JSON.parse(fs.readFileSync(Localisation.textsPath, 'utf8'),
        /**
         * A reviver for the JSON.parse function to convert strings into TokenString.
         */
        function (this: any, _key: string, value: string): any
        {
            if ((typeof value) === 'string')
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
