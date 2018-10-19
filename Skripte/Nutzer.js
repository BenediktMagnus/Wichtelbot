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
            Nutzerliste.set(
                Nutzer.NutzerId,
                {
                    Id: Nutzer.NutzerId,
                    Discord: Nutzer.Discord,
                    Name: Nutzer.Name,
                    Nickname: Nutzer.Nickname,
                    Zeit: Nutzer.Zeit,
                    Zustand: Nutzer.Zustand
                }
            );
        }
    );
};

/**
 * Erzeugt ein leeres Nutzerobjekt.
 * @returns {Object} Das leere Nutzerobjekt.
 */
exports.ErzeugeLeerenNutzer = function ()
{
    return {
        Id: 0,
        Discord: '',
        Name: '',
        Nickname: '',
        Zeit: 0,
        Zustand: ''
    };
}

/**
 * Fügt einen Nutzer zur Nutzerliste hinzu und speichert ihn in der Datenbank.
 * @param {Object} Nutzer Das Nutzerobjekt mit allen Angaben zum Nutzer.
 */
exports.NutzerHinzufuegen = function (Nutzer)
{
    Nutzerliste.set(Nutzer.Id, Nutzer);
    Datenbank.NutzerHinzufuegen(Nutzer);
};