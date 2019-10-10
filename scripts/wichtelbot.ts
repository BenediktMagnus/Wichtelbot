import { Client as DiscordClient } from 'discord.js';

import Config from './utility/config';
import Database from './wichtelbot/database';

export default class Wichtelbot
{
    protected client: DiscordClient;
    protected database: Database;

    constructor (onStarted: (loginName: string) => void)
    {
        this.database = new Database();
        this.client = new DiscordClient();

        /*
        // Nachrichtenverarbeitung starten:
        console.log('Initialisiere Nachrichtenverarbeitung...');
        const Nachrichten = require('./Skripte/Nachrichten.js');
        Nachrichten.Initialisieren(Datenbank, Klient);
        */

        this.client.on('error',
            (error) => {
                console.error(error);
            }
        );

        this.client.on('message',
            (message) => {
                //Nachrichten.Verarbeiten(Nachricht);
                console.log(message);
            }
        );

        // Start bot:
        this.client.login(Config.bot.token).then(
            () => {
                onStarted(this.client.user.tag);
            }
        );
    }

    public terminate (): void
    {
        try
        {
            if (this.client)
            {
                this.client.destroy();
            }
        }
        catch (error)
        {
            console.error(error);
        }

        try
        {
            if (this.database)
            {
                this.database.close();
            }
        }
        catch (error)
        {
            console.error(error);
        }
    }
}
