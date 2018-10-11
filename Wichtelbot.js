console.log('Bot startet...')

const Config = require('./config/config.json');

//Datenbanken laden und Modul initialisieren:
console.log('Initialisiere Datenbanken...');
const Datenbank = require('./skripte/datenbank.js');
Datenbank.Initialisieren();

//Discordbot laden und erstellen:
console.log('Initialisiere Discordbot...');
const Bot = require('./config/bot.json');
const Discord = require('discord.js');
const Klient = new Discord.Client();

//Bot vorbereiten:
console.log('Bereite Discordbot vor...');

Klient.on('ready', () => {
  console.log(`Angemeldet als ${Klient.user.tag}!`);
});

Klient.on('message', function (Nachricht)
  {
    console.log(Nachricht.channel);
  }
);

//Bot starten:
Klient.login(Bot.Token).then(function ()
  {
    console.log('Wichtelbot gestartet!');
  }
);