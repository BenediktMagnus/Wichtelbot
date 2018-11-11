var Nutzerverwaltung;
var Datenbankverwaltung;

/**
 * Der Klient, der sich mit Discord verbunden hat.
 */
var Klient;

/**
 * Initialisiert die Ziehung/Losung der Wichtel.
 * @param {Object} Nutzerbibliothek
 * @param {Object} Datenbankbibliothek
 * @param {Object} NeuerKlient Der Discordklient, über den sich der Bot verbunden hat.
 */
exports.Initialisieren = function (Nutzerbibliothek, Datenbankbibliothek, NeuerKlient)
{
    Nutzerverwaltung = Nutzerbibliothek;
    Datenbankverwaltung = Datenbankbibliothek;
    Klient = NeuerKlient;
};

exports.Ausführen = function (ZiehungAusgeführt)
{
    let Teilnehmerliste = new Map();

    //Alle Teilnehmer in die Teilnehmerliste füllen:
    for (let Nutzer of Nutzerverwaltung.Liste.values())
        if (Nutzer.Zustand == 'Teilnehmer')
            Teilnehmerliste.set(Nutzer.Id, Nutzer);

    /**
     * Ordnet Nutzern einer möglichen Liste an Wichtelpartnern zu, um diese später zu ermitteln.
     */
    let Zuordnungsliste = new Map();

    //Zuordnungsliste wird gefüllt:
    for (let Teilnehmer of Teilnehmerliste.values())
    {
        let Wichtelliste = new Map(Teilnehmerliste);
        Wichtelliste.delete(Teilnehmer.Id); //Aktuellen Teilnehmer entfernen.

        Zuordnungsliste.set(Teilnehmer.Id, {
                Nutzer: Teilnehmer,
                Wichtel: Wichtelliste,
                Ausschlüsse: {
                    Wunsch: [],
                    Wichtel: [] //War Wichtel des Teilnehmers in vorherigen Jahren.
                },
            }
        );
    }
};
