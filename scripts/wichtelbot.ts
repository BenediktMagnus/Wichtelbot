import { Client as DiscordClient } from 'discord.js';

import Config from './utility/config';
import Database from './wichtelbot/database';

export default class Wichtelbot
{
    client: DiscordClient;
    protected database: Database;

    constructor ()
    {
        this.database = new Database();

        console.log('Initialisiere Discordbot...');
        this.client = new DiscordClient();

        /*
        // Nachrichtenverarbeitung starten:
        console.log('Initialisiere Nachrichtenverarbeitung...');
        const Nachrichten = require('./Skripte/Nachrichten.js');
        Nachrichten.Initialisieren(Datenbank, Klient);
        */

        // Prepare bot:
        console.log('Bereite Discordbot vor...');

        this.client.on('error',
            (message) => {
                console.error(message);
            }
        );

        this.client.on('ready',
            () => {
                console.log(`Angemeldet als ${this.client.user.tag}!`);
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
                console.log('Wichtelbot gestartet!');
            }
        );
    }

    terminate (): void
    {
        if (this.client)
        {
            this.client.destroy();
        }
    }
}