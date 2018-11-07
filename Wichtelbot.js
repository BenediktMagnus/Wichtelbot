console.log('Bot startet...')

const Config = require('./Config/Config.json');

//Datenbanken laden und Modul initialisieren:
console.log('Initialisiere Datenbanken...');
const Datenbank = require('./Skripte/Datenbank.js');
Datenbank.Initialisieren();

//Discordbot laden und erstellen:
console.log('Initialisiere Discordbot...');
const Bot = require('./Config/Bot.json');
const Discord = require('discord.js');
const Klient = new Discord.Client();

//Nachrichtenverarbeitung starten:
console.log('Initialisiere Nachrichtenverarbeitung...');
const Nachrichten = require('./Skripte/Nachrichten.js');
Nachrichten.Initialisieren(Datenbank, Klient);

//Bot vorbereiten:
console.log('Bereite Discordbot vor...');

Klient.on('ready', () => {
  console.log(`Angemeldet als ${Klient.user.tag}!`);
});

Klient.on('message', function (Nachricht)
  {
    Nachrichten.Verarbeiten(Nachricht);
  }
);

//Bot starten:
Klient.login(Bot.Token).then(function ()
  {
    console.log('Wichtelbot gestartet!');
  }
);