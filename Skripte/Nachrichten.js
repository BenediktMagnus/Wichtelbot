export default class MessageHandler
{
    Definitionen = {
        //Nur im Moderationskanal:
        Moderation: {
            "nachrichtankanal": {
                Funktion: ModulModeration.NachrichtAnKanalSenden
            },
            "nachrichtannutzer": {
                Funktion: ModulModeration.NachrichtAnNutzerSenden
            },
            "nachrichtanallenutzer": {
                Funktion: ModulModeration.NachrichtAnAlleNutzerSenden
            },
            "nachrichtanalleteilnehmer": {
                Funktion: ModulModeration.NachrichtAnAlleTeilnehmerSenden
            },
            "nachrichtanalleausstehenden": {
                Funktion: ModulModeration.NachrichtAnAlleAusstehendenSenden
            },
            "nachrichtanallespätenwichtel": {
                Funktion: ModulModeration.NachrichtAnAlleSpätenWichtelSenden
            },
            "steamnamenauflisten": {
                Funktion: ModulModeration.SteamnamenAuflisten
            },
        },
        //Nur in einem bestimmten Zustand gültig:
        Zustände: {
            Wichtel: {
                "paket ist unterwegs": {
                    Funktion: ModulPakete.DatumEinsetzenUndFortfahren,
                    Ziel: "PaketGesendetNummer",
                    Text: Texte.PaketGesendetNummer
                },
                "paket empfangen": {
                    Funktion: ModulPakete.DatumEinsetzenUndFortfahren,
                    Ziel: "PaketEmpfangenDatum",
                    Text: Texte.PaketEmpfangenDatum
                }
            },
            PaketGesendetNummer: {
                Datenaufnahme: true,
                Funktion: ModulPakete.GesendetNummerAufnehmen
            },
            PaketGesendetDatum: {
                Datenaufnahme: true,
                Funktion: ModulPakete.GesendetDatumAufnehmen
            },
            PaketEmpfangenDatum: {
                Datenaufnahme: true,
                Funktion: ModulPakete.EmpfangenDatumAufnehmen
            }
        }
    };
}
