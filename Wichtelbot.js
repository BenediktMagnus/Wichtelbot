console.log('Bot startet...')

const Config = require('./config/Config.json');

//Datenbanken laden und Modul initialisieren:
console.log('Initialisiere Datenbanken...');
const Datenbank = require('./skripte/Datenbank.js');
Datenbank.Initialisieren();

//Nachrichtenverarbeitung starten:
console.log('Initialisiere Nachrichtenverarbeitung...');
const Nachrichten = require('./skripte/Nachrichten.js');
Nachrichten.Initialisieren();

//Discordbot laden und erstellen:
console.log('Initialisiere Discordbot...');
const Bot = require('./config/Bot.json');
const Discord = require('discord.js');
const Klient = new Discord.Client();

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