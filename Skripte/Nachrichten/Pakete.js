/**
 * Eine Sammlung aller vom Bot benutzten Texte.
 */
const Texte = require('../../Config/Texte.json');

var Nutzerverwaltung;
var Datenbankverwaltung;

/**
 * Das Nachrichtenmodul mit allgemeinen Funktionen.
 */
var ModulAllgemein;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert das Paketmodul..
 * @param {Object} Nutzerbibliothek
 * @param {Object} Datenbankbibliothek
 * @param {Object} NeuesModulAllgemein Das allgemeine Modul der Nachrichtenverarbeitung mit grundlegenden Basisfunktionen.
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Nutzerbibliothek, Datenbankbibliothek, NeuesModulAllgemein, NeuerKlient)
{
    Nutzerverwaltung = Nutzerbibliothek;
    Datenbankverwaltung = Datenbankbibliothek;
    ModulAllgemein = NeuesModulAllgemein;
    Klient = NeuerKlient;
};

/**
 * Setzt das Datum in den Text und führt anschließend ModulAllgemein.Fortfahren aus.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 * @param {Object} Befehlsobjekt Das Befehlsobjekt der Zustandsdefinition, das gerade ausgeführt wird.
 */
function DatumEinsetzenUndFortfahren (Nachricht, Nutzer, Befehlsobjekt)
{
    let ModifiziertesBefehlsobjekt = Object.assign(Befehlsobjekt); //Tiefenkopie des Objektes, nicht per Referenz.

    ModifiziertesBefehlsobjekt.Text = DatumErsetzen(ModifiziertesBefehlsobjekt.Text);

    ModulAllgemein.Fortfahren(Nachricht, Nutzer, ModifiziertesBefehlsobjekt);
}
exports.DatumEinsetzenUndFortfahren = DatumEinsetzenUndFortfahren;

/**
 * Nimmt die Paketnummer für ein gesendetes Paket auf und informiert das Wichtelkind.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function GesendetNummerAufnehmen (Nachricht, Nutzer)
{
    Datenbankverwaltung.PaketAnlegen(Nutzer.Id, Nutzer.WichtelkindId, function ()
        {
            Datenbankverwaltung.PaketAktualisieren(Nutzer.Id, Nutzer.WichtelkindId, {Sendungsnummer: Nachricht.content}, function ()
                {
                    Nutzer.Zustand = 'PaketGesendetDatum';
                    Nutzerverwaltung.Aktualisieren(Nutzer);

                    Nachricht.reply(DatumErsetzen(Texte.PaketGesendetDatum));

                    //Wichtelkind über verschicktes Paket informieren:
                    Klient.fetchUser(Nutzer.WichtelkindId).then(function (DiscordNutzer)
                        {
                            let Antwort = Texte.PaketGesendetBenachrichtigung;
                            if (Nachricht.content != '-')
                                Antwort += Texte.PaketGesendetSendungsnummer.replace(/\[\[SENDUNGSNUMMER\]\]/g, Nachricht.content);
                            DiscordNutzer.send(Antwort);
                        }
                    );
                }
            );
        }
    );
}
exports.GesendetNummerAufnehmen = GesendetNummerAufnehmen;

/**
 * Nimmt das Sendedatum für ein gesendetes Paket auf.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function GesendetDatumAufnehmen (Nachricht, Nutzer)
{
    Datenbankverwaltung.PaketAktualisieren(Nutzer.Id, Nutzer.WichtelkindId, {Sendedatum: Nachricht.content}, function ()
        {
            Nutzer.Zustand = 'Wichtel';
            Nutzerverwaltung.Aktualisieren(Nutzer);

            Nachricht.reply(Texte.PaketGesendetVollständig);
        }
    );
}
exports.GesendetDatumAufnehmen = GesendetDatumAufnehmen;

/**
 * Nimmt das Empfangsdatum für ein gesendetes Paket auf und informiert den Wichtelpaten.
 * @param {Object} Nachricht Die Nachricht, die per Discord erhalten wurde, ein Discordnachrichtenobjekt.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
function EmpfangenDatumAufnehmen (Nachricht, Nutzer)
{
    Datenbankverwaltung.PaketAktualisieren(Nutzer.WichtelpateId, Nutzer.Id, {Empfangsdatum: Nachricht.content}, function ()
        {
            Nutzer.Zustand = 'Wichtel';
            Nutzerverwaltung.Aktualisieren(Nutzer);

            //Wichtelpaten über angekommenes Paket informieren:
            Klient.fetchUser(Nutzer.WichtelpateId).then(function (DiscordNutzer)
                {
                    DiscordNutzer.send(Texte.PaketEmpfangenBenachrichtigung);
                }
            );

            Nachricht.reply(Texte.PaketEmpfangenVollständig);
        }
    );
}
exports.EmpfangenDatumAufnehmen = EmpfangenDatumAufnehmen;

/**
 * Setzt das aktuelle Datum als formatierte Zeichenkette in einen Text ein.
 * @param {String} Datumstext Ein Text, der "[[DATUM]]" enthält.
 * @returns {String} Den Text mit eingesetztem Datum.
 */
function DatumErsetzen (Datumstext)
{
    let Heute = new Date();
    let FormatiertesDatum = Heute.getDate() + '.' + (Heute.getMonth() + 1) + '.' + Heute.getFullYear();

    return Datumstext.replace(/\[\[DATUM\]\]/g, FormatiertesDatum);
}