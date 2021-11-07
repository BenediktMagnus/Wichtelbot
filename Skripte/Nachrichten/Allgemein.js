/**
 * Sendet anonym eine Nachricht vom Wichtelkind an seinen Wichtelpaten.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function NachrichtAnWichtelpaten (Nachricht, Nutzer)
{
    Nutzer.Zustand = 'Wichtel';
    Nutzerverwaltung.Aktualisieren(Nutzer);

    for (let Wichtel of Nutzerverwaltung.Liste.values())
    {
        if (Wichtel.WichtelkindId == Nutzer.Id)
        {
            Klient.fetchUser(Wichtel.Id).then(function (DiscordNutzer)
                {
                    DiscordNutzer.send(Texte.NachrichtVonWichtelkind + "\n\n" + Nachricht);
                }
            );

            Nachricht.reply(Texte.StillePostGesendet);

            break;
        }
    }
}
exports.NachrichtAnWichtelpaten = NachrichtAnWichtelpaten;

/**
 * Sendet anonym eine Nachricht vom Wichtelpaten an sein Wichtelkind.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function NachrichtAnWichtelkind (Nachricht, Nutzer)
{
    Nutzer.Zustand = 'Wichtel';
    Nutzerverwaltung.Aktualisieren(Nutzer);

    Klient.fetchUser(Nutzer.WichtelkindId).then(function (DiscordNutzer)
        {
            DiscordNutzer.send(Texte.NachrichtVonWichtelpaten + "\n\n" + Nachricht);

            Nachricht.reply(Texte.StillePostGesendet);
        }
    );
}
exports.NachrichtAnWichtelkind = NachrichtAnWichtelkind;
