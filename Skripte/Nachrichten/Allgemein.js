/**
 * Die Basiskonfiguration.
 */
const Config = require('../../Config/Config.json');

/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../../Config/Texte.json');

/*
 * Das Attachmentobjekt aus der Discordbibliothek zum Erstellen von (Bild-)Anhängen.
 */
const { Attachment } = require('discord.js');

/*
 * Das nette Bild von Sternenrose in der Schatzkiste, das dem Bot als Profilbild dient. Danke, Sternenrose!
 */
const BildSternenrose = new Attachment('https://cdn.discordapp.com/attachments/391928490456514561/394095185275125760/Weihn8.jpg');

var Nutzerverwaltung;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert das allgemeine Modul der Nachrichtenverarbeitung.
 * @param {Object} Nutzerbibliothek
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Nutzerbibliothek, NeuerKlient)
{
    Nutzerverwaltung = Nutzerbibliothek;
    Klient = NeuerKlient;
};

/**
 * Antwortet mit einem im Befehlsobjekt definierten Text.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function Antworten (Nachricht, Nutzer, Befehlsobjekt)
{
    let Antwort = Befehlsobjekt.Text.replace(/\[\[NUTZERNAME\]\]/g, Nutzer.Name);

    Nachricht.reply(Antwort);
}
exports.Antworten = Antworten;

/**
 * Gibt, wenn solche vorhanden sind, die alten/bestehenden Daten zum aktuellen Zustand aus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function AlteDatenAusgeben (Nachricht, Nutzer)
{
    if ((Nutzer[Nutzer.Zustand] != undefined) &&
        (Nutzer[Nutzer.Zustand] != null) &&
        (Nutzer[Nutzer.Zustand] != '')
       )
        Nachricht.reply("\n" + Texte.AlteDaten + "\n" + Nutzer[Nutzer.Zustand]);
}
//Passt nicht ganz zu Allgemein, wird aber von Fortfahren verwendet. Um die Hierarchie zu wahren, bleibt es hier:
exports.AlteDatenAusgeben = AlteDatenAusgeben;

/**
 * Setzt den nächsten Zustand ohne Datenaufnahme.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function Fortfahren (Nachricht, Nutzer, Befehlsobjekt)
{
    Nutzer.Zustand = Befehlsobjekt.Ziel;
    Nutzerverwaltung.Aktualisieren(Nutzer);

    Antworten(Nachricht, Nutzer, Befehlsobjekt);

    AlteDatenAusgeben(Nachricht, Nutzer);
}
exports.Fortfahren = Fortfahren;

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
 * Startet den Registrierungsprozess eines Nutzers.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function Registrieren (Nachricht, Nutzer)
{
    Nutzer.Zustand = 'Registrierung';

    Nutzerverwaltung.Aktualisieren(Nutzer);

    Nachricht.reply(Texte.Registriert + "\n" + Texte.Regeln);
}
exports.Registrieren = Registrieren;

/**
 * Informiert die Orga im privaten Kanal über benötigte Hilfe.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 */
function Sternenrose (Nachricht)
{
    Nachricht.reply(Texte.Sternenrose, BildSternenrose);
}
exports.Sternenrose = Sternenrose;