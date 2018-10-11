const Config = require('config/config.json');
const Bot = require('config/bot.json');
const Discord = require('discord.js');

const Klient = new Discord.Client();

Klient.on('ready', () => {
  console.log(`Logged in as ${Klient.user.tag}!`);
});

Klient.on('message', function (Nachricht)
  {
    console.log(Nachricht.channel);
  }
);

Klient.login(Bot.Token).then(function ()
  {
    Klient.users.forEach( function (Kanal)
      {
        console.log(Kanal);
      }
    );
  }
);