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
        if (Nutzer.Zustand == 'Teilnehmer')
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
            for (let Eintrag of Zuordnungsliste.values())
            {
                GewichtungenBerechnen(Eintrag);
                Eintrag.SortierteWichtel = WichtelSortieren(Eintrag.Wichtel);
            }

            let SortierteZuordnungen = ZuordnungenSortieren(Zuordnungsliste);

            let Einträge = [];
            for (let Eintrag of SortierteZuordnungen)
            {
                delete Eintrag.Wichtel;
                delete Eintrag.FrühereWichtel;

                for (let i = 0; i < Eintrag.SortierteWichtel.length; i++)
                    Eintrag.SortierteWichtel[i] = {
                        Name: Eintrag.SortierteWichtel[i].Daten.Name,
                        Gewichtung: Eintrag.SortierteWichtel[i].Gewichtung
                    };

                Eintrag.Nutzer = Eintrag.Nutzer.Name;

                Einträge.push(Eintrag);
            }
            console.log(JSON.stringify(Einträge));

            ZiehungAusgeführt(true);
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
            Eintrag.Wichtel.get(WichtelId).Gewichtung -= 1000;
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

function ZuordnungenSortieren (Zuordnungsliste)
{
    let Ergebnis = Array.from(Zuordnungsliste.values());

    Ergebnis.sort(function (ZuordnungA, ZuordnungB)
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

            let WertA = ZuordnungA.SortierteWichtel[0].Gewichtung - ZuordnungA.SortierteWichtel.length;
            let WertB = ZuordnungB.SortierteWichtel[0].Gewichtung - ZuordnungB.SortierteWichtel.length;

            ZuordnungA.Wert = WertA;
            ZuordnungB.Wert = WertB;

            return WertB - WertA;
        }
    );

    return Ergebnis;
}