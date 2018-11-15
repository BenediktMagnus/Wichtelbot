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
    let Teilnehmerliste = [];

    //Alle Teilnehmer in die Teilnehmerliste füllen:
    for (let Nutzer of Nutzerverwaltung.Liste.values())
        if (Nutzer.Zustand == 'Wartend')
            Teilnehmerliste.push(Nutzer);

    /**
     * Ordnet Nutzern einer möglichen Liste an Wichtelpartnern zu, um diese später zu ermitteln.
     */
    let Zuordnungsliste = new Map();

    //Zuordnungsliste wird gefüllt:
    for (let Teilnehmer of Teilnehmerliste)
    {
        let Wichtelliste = new Map();

        //Aktuellen Teilnehmer herausfiltern und eigene Objekte mit Datenreferenzen auf den Wichtel in die Liste eintragen:
        for (let Wichtel of Teilnehmerliste)
            if (Wichtel.Id != Teilnehmer.Id)
                Wichtelliste.set(Wichtel.Id, { Daten: Wichtel });

        Zuordnungsliste.set(Teilnehmer.Id, {
                Nutzer: Teilnehmer,
                Wichtel: Wichtelliste,
                FrühereWichtel: [],
                SortierteWichtel: []
            }
        );
    }

    //Ausschlüsse ermitteln:
    let Ausschlüsse = [];

    for (let Eintrag of Zuordnungsliste.values())
    {
        DigitalAnalogAusschließen(Eintrag);
        InternationalAusschließen(Eintrag);
        Ausschlüsse.push(AusschlüsseErmitteln(Eintrag));
    }

    Promise.all(Ausschlüsse).then(function ()
        {
            //Erstmalig sortieren:
            for (let Eintrag of Zuordnungsliste.values())
            {
                GewichtungenBerechnen(Eintrag);
                Eintrag.SortierteWichtel = WichtelSortieren(Eintrag.Wichtel);
            }

            let SortierteZuordnungen = ZuordnungenSortieren(Zuordnungsliste, true);

            let Ergebnisliste = [];

            //Eigentliche Ziehung durchführen:
            while (SortierteZuordnungen.length != 0)
            {
                let ErsteZuordnung = SortierteZuordnungen.shift(); //Ersten Eintrag entfernen und Indizes anpassen.

                if (ErsteZuordnung == undefined)
                {
                    //Wenn es kein Element in der Liste gab, ist für eine Person kein Wichtel übrig.
                    //In dem Falle haben wir ein unvollständiges Ergebnis, das korrigiert werden muss.
                    ZiehungAusgeführt(false);
                    return;
                }

                let Ergebnis = {
                    Nutzer: ErsteZuordnung.Nutzer,
                    Wichtel: ErsteZuordnung.SortierteWichtel[0].Daten,
                    Wert: ErsteZuordnung.SortierteWichtel[0].Gewichtung
                };

                //Aktualisieren der gespeicherten Wichtel-ID des Nutzers auf die aktuelle:
                Ergebnis.Nutzer.WichtelId = Ergebnis.Wichtel.Id;

                Ergebnisliste.push(Ergebnis);

                for (let Eintrag of SortierteZuordnungen)
                    if (Eintrag.Wichtel.delete(Ergebnis.Wichtel.Id))
                        Eintrag.SortierteWichtel = WichtelSortieren(Eintrag.Wichtel);

                //Die ID des Nutzers muss aus der Wichtelliste des Wichtels entfernt werden.
                //Das machen wir über die Map Zuordnungsliste, um nicht das Array SortierteZuordnungen durchsuchen zu müssen.
                //Map und Array beinhalten dieselbe Referenz, daher erfolgt die Änderung bei beiden Listen.
                Zuordnungsliste.get(Ergebnis.Wichtel.Id).Wichtel.delete(Ergebnis.Nutzer.Id);

                SortierteZuordnungen = ZuordnungenSortieren(SortierteZuordnungen);
            }

            //Ergebnisse eintragen:
            Datenbankverwaltung.WichtelEintragen(Ergebnisliste, ZiehungAusgeführt);
        }
    );
};

function DigitalAnalogAusschließen (Eintrag)
{
    if (Eintrag.Nutzer.AnalogDigitalWichtel == 'beides')
        return;

    for (let Wichtel of Eintrag.Wichtel.values())
        if ((Wichtel.Daten.AnalogDigitalSelbst != 'beides') && (Eintrag.Nutzer.AnalogDigitalWichtel != Wichtel.Daten.AnalogDigitalSelbst))
            Eintrag.Wichtel.delete(Wichtel.Daten.Id);
}

function InternationalAusschließen (Eintrag)
{
    if ((Eintrag.Nutzer.AnalogDigitalWichtel == 'digital') || (Eintrag.Nutzer.International == 'ja'))
        return;

    for (let Wichtel of Eintrag.Wichtel.values())
        if ((Eintrag.Nutzer.Land != Wichtel.Daten.Land) && (Wichtel.Daten.AnalogDigitalSelbst == 'analog'))
            Eintrag.Wichtel.delete(Wichtel.Daten.Id);
}

function AusschlüsseErmitteln (Eintrag)
{
    return new Promise(function (ErfolgMelden)
        {
            Datenbankverwaltung.Ausschlüsse(Eintrag.Nutzer.Id, function (Ausschlüsse)
                {
                    for (let Ausschluss of Ausschlüsse)
                    {
                        if (Ausschluss.Grund == 'Wunsch')
                            Eintrag.Wichtel.delete(Ausschluss.WichtelId);
                        else
                            Eintrag.FrühereWichtel.push(Ausschluss.WichtelId);
                    }

                    ErfolgMelden();
                }
            );
        }
    );
}

function GewichtungenBerechnen (Eintrag)
{
    for (let Wichtel of Eintrag.Wichtel.values())
    {
        Wichtel.Gewichtung = 0;

        //Vergleich Analog/Digital:
        if (Wichtel.Daten.AnalogDigitalSelbst == Eintrag.Nutzer.AnalogDigitalWichtel)
            Wichtel.Gewichtung += 4;

        //Vergleich Herkunftsland:
        if (Wichtel.Daten.Land == Eintrag.Nutzer.Land)
            Wichtel.Gewichtung += 2;
    }

    //Frühere Wichtel:
    for (let WichtelId of Eintrag.FrühereWichtel)
        if (Eintrag.Wichtel.has(WichtelId))
            Eintrag.Wichtel.get(WichtelId).Gewichtung = -2;
}

function WichtelSortieren (Wichtelliste)
{
    let Ergebnis = Array.from(Wichtelliste.values());

    Ergebnis.sort(function (WichtelA, WichtelB)
        {
            return WichtelB.Gewichtung - WichtelA.Gewichtung;
        }
    );

    return Ergebnis;
}

function ZuordnungenSortieren (Zuordnungsliste, IstMap = false)
{
    if (IstMap)
        Zuordnungsliste = Array.from(Zuordnungsliste.values());

    Zuordnungsliste.sort(function (ZuordnungA, ZuordnungB)
        {
            let AIstLeer = (ZuordnungA.SortierteWichtel.length == 0);
            let BIstLeer = (ZuordnungB.SortierteWichtel.length == 0);

            if (AIstLeer || BIstLeer)
            {
                if (AIstLeer && BIstLeer)
                    return 0;
                else if (AIstLeer)
                    return -1;
                else
                    return 1;
            }

            //Der Wert der Wichtelkette wird anhand der akkumulierten Gewichtungen aller Wichtel bestimmt plus deren Gesamtanzahl.
            //Je mehr es davon gibt, desto nachrangiger ist der Nutzer für die Auszählung.
            //Dies stellt einen Kompromiss dar zwischen "finde die höchstwertigen Kombinationen", "stelle sicher, dass alle bedient werden" und
            //"versuche möglichst niemanden schlecht dastehen zu lassen".
            let Akkumulation = (Akkumulator, AktuellerWichtel) => Akkumulator + AktuellerWichtel.Gewichtung;

            ZuordnungA.Wert = ZuordnungA.SortierteWichtel.reduce(Akkumulation, 0) + ZuordnungA.SortierteWichtel.length;
            ZuordnungB.Wert = ZuordnungB.SortierteWichtel.reduce(Akkumulation, 0) + ZuordnungB.SortierteWichtel.length;

            return ZuordnungA.Wert - ZuordnungB.Wert;
        }
    );

    return Zuordnungsliste;
}