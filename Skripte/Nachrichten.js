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
            "löschenachricht": {
                Funktion: ModulModeration.NachrichtEntfernen
            },
            "anmeldephasebeenden": {
                Funktion: ModulModeration.AnmeldephaseBeenden
            },
            "ziehungausführen": {
                Funktion: ModulModeration.ZiehungAusführen
            },
            "steamnamenauflisten": {
                Funktion: ModulModeration.SteamnamenAuflisten
            },
            "steckbriefeverteilen": {
                Funktion: ModulModeration.SteckbriefeVerteilen
            }
        },
        //Nur in einem bestimmten Zustand gültig:
        Zustände: {
            Wichtel: {
                "anonym meinem wichtelpaten schreiben": {
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "NachrichtAnWichtelpaten",
                    Text: Texte.NachrichtAnWichtelpaten
                },
                "anonym meinem wichtelkind schreiben": {
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "NachrichtAnWichtelkind",
                    Text: Texte.NachrichtAnWichtelkind
                },
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
            NachrichtAnWichtelpaten: {
                Datenaufnahme: true,
                Funktion: ModulAllgemein.NachrichtAnWichtelpaten
            },
            NachrichtAnWichtelkind: {
                Datenaufnahme: true,
                Funktion: ModulAllgemein.NachrichtAnWichtelkind
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
