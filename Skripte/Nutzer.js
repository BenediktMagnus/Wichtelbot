/**
 * Die Datenbanverwaltung.
 */
var Datenbank;

/**
 * Eine Zuordnungsliste aller bekannten Nutzer und ihrer derzeitigen Unterhaltungszustände.
 */
const Nutzerliste = new Map();
exports.Liste = Nutzerliste;

/**
 * Initialisiert die Nutzerverwaltung.
 * @param {Object} Datenbankbibliothek
 */
exports.Initialisieren = function (Datenbankbibliothek)
{
    Datenbank = Datenbankbibliothek;

    Datenbank.AlleNutzerLaden(
        function (Nutzer)
        {
            delete Nutzer.NutzerId; //Doppelte Information, die der Sauberkeit halber entfernt werden sollte.

            Nutzerliste.set(Nutzer.Id, Nutzer);
        }
    );
};

/**
 * Erzeugt ein leeres Nutzerobjekt.
 * @returns {Object} Das leere Nutzerobjekt.
 */
exports.LeerenNutzerErzeugen = function ()
{
    return {
        Id: 0,
        Discord: '',
        Name: '',
        Nickname: '',
        Zeit: 0,
        Zustand: 'Neu'
    };
}

/**
 * Fügt einen Nutzer zur Nutzerliste hinzu und speichert ihn in der Datenbank.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
exports.Hinzufügen = function (Nutzer)
{
    Nutzerliste.set(Nutzer.Id, Nutzer);
    Datenbank.NutzerSpeichern(Nutzer);
};

/**
 * Aktualisiert einen Nutzer in der Liste und speichert die neuen Werte in der Datenbank.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
exports.Aktualisieren = function (Nutzer)
{
    Datenbank.NutzerAktualisieren(Nutzer);
};

/**
 * Überprüft, ob ein Nutzer mit dieser Id in der Liste vorhanden ist.
 * @param {String} Id Die Id des Nutzers.
 * @returns {Boolean} True, wenn vorhanden, andernfalls false.
 */
exports.IdIstVorhanden = function (Id)
{
    return Nutzerliste.has(Id);
};

/**
 * Holt ein Nutzerobjekt aus der Liste anhand seiner Id.
 * @param {String} Id Die Id des Nutzers.
 * @returns {Object} Das Nutzerobjekt.
 */
exports.VonId = function (Id)
{
    if (!Nutzerliste.has(Id))
        console.error('FEHLER: Konnte Nutzer nicht anhand der Id ' + Id + ' ermitteln.');

    return Nutzerliste.get(Id);
};

/**
 * Holt ein Nutzerobjekt aus der Liste anhand seines Namens oder Nicknamens.
 * WARNUNG: Diese Funktion ist POTENTIELL unzuverlässig, da Namen NICHT eindeutig sein müssen. Daher ist der Anwendungsfall zu beachten!
 * @param {String} Name Der Name oder Nickname des Nutzers.
 * @returns {Object} Das Nutzerobjekt.
 */
exports.VonName = function (Name)
{
    for (let Nutzer of Nutzerliste.values())
    {
        if ((Nutzer.Name == Name) ||(Nutzer.Nickname == Name))
            return Nutzer;
    }

    return undefined; //Kein Nutzer mit dem angegebenen Namen gefunden.
};