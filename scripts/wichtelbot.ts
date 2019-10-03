import { Client as DiscordClient } from 'discord.js';

import Config from './utility/config';

export default class Wichtelbot
{
    client: DiscordClient;

    constructor ()
    {
        /*
        // Datenbanken laden und Modul initialisieren:
        console.log('Initialisiere Datenbanken...');
        const Datenbank = require('./Skripte/Datenbank.js');
        Datenbank.Initialisieren();
        */

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