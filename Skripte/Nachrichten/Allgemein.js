/**
 * Gibt zustandsabhängige Informationen aus, wenn die Eingabe nicht verstanden wurde.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function NichtVerstanden (Nachricht, Nutzer)
{
    let Antwort = Texte.NichtVerstanden;

    Antwort += "\n\n" + Texte.InfoImmer;

    if (Nutzer.Zustand == 'Teilnehmer')
        Antwort += "\n" + Texte.InfoTeilnehmer;
    else if (Nutzer.Zustand == 'Wichtel')
        Antwort += "\n" + Texte.InfoWichtel;

    Nachricht.reply(Antwort);
}
exports.NichtVerstanden = NichtVerstanden;

/**
 * Informiert die Orga im privaten Kanal über benötigte Hilfe.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function HilfeRufen (Nachricht, Nutzer, Befehlsobjekt)
{
    let Orgainformation = Texte.HilfeOrgainformation.replace(/\[\[NUTZERNAME\]\]/g, Nutzer.Name);
    Orgainformation = Orgainformation.replace(/\[\[NUTZERTAG\]\]/g, Nutzer.Discord);

    Klient.channels.get(Config.KanalIdOrganisation).send(Orgainformation);

    Antworten(Nachricht, Nutzer, Befehlsobjekt);
}
exports.HilfeRufen = HilfeRufen;

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

/**
 * Informiert die Orga im privaten Kanal über benötigte Hilfe.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function Sternenrose (Nachricht)
{
    Nachricht.reply(Texte.Sternenrose, BildSternenrose);
}
exports.Sternenrose = Sternenrose;
