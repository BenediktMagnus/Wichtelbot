console.log('Bot startet...');

process.on('exit', Schließen);
process.on('SIGINT', Schließen); //Strg + C
process.on('SIGUSR1', Schließen); //"kill pid"
process.on('SIGUSR2', Schließen); //"kill pid"

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

Klient.on('error', console.error);

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

var AnwendungLäuft = true;

/**
 * Beendet alle laufenden Verbindungen und meldet der Konsole das Schließend des Programms.
 */
function Schließen ()
{
  if (AnwendungLäuft)
  {
    AnwendungLäuft = false;

    if (Klient)
      Klient.destroy();

    console.log("\nWichtelbot geschlossen.");
  }
}