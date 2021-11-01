export default class MessageHandler
{
    Definitionen = {
        //Jederzeit möglich:
        Befehle: {
            "hilfe": {
                Funktion: ModulAllgemein.HilfeRufen,
                Text: Texte.Hilfe
            },
            "sternenrose": {
                Funktion: ModulAllgemein.Sternenrose
            }
        },
        //Nur im Moderationskanal:
        Moderation: {
            "info": {
                Aliase: ["hilfe"],
                Funktion: ModulModeration.Info
            },
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
            "wichtelstatus": {
                Funktion: ModulModeration.Wichtelstatus
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
            Registrierung: {
                "ja": {
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "AnalogDigitalWichtel",
                    Text: Texte.AnalogDigitalWichtel
                },
                "nein": {
                    Aliase: ["nö", "ne"],
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "Neu",
                    Text: Texte.Kontaktaufnahme
                },
                "vielleicht" : {
                    Aliase: ["vllt", "eventuell", "evtl"],
                    Funktion: ModulAllgemein.Antworten,
                    Text: Texte.Vielleicht
                }
            },
            AnalogDigitalWichtel: {
                "analog": {
                    Aliase: ["digital", "beides"],
                    Funktion: ModulDatenaufnahme.DatenAufnehmen,
                    Ziel: "AnalogDigitalSelbst",
                    Text: Texte.AnalogDigitalSelbst
                }
            },
            AnalogDigitalSelbst: {
                "analog": {
                    Aliase: ["beides"],
                    Funktion: ModulDatenaufnahme.DatenAufnehmen,
                    Ziel: "Anschrift",
                    Text: Texte.Anschrift
                },
                "digital": {
                    Funktion: ModulDatenaufnahme.DatenAufnehmen,
                    Ziel: "Steam",
                    Text: Texte.Steam
                }
            },
            Anschrift: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Land",
                Text: Texte.Land
            },
            Land: {
                "deutschland": {
                    Aliase: ["österreich", "schweiz", "luxemburg"],
                    Funktion: ModulDatenaufnahme.LandVerarbeiten
                }
            },
            Steam: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.SteamVerarbeiten
            },
            International: {
                "ja": {
                    Aliase: ["nein", "nö", "ne"],
                    Funktion: ModulDatenaufnahme.DatenAufnehmen,
                    Ziel: "Wunschliste",
                    Text: Texte.Wunschliste
                },
                "vielleicht" : {
                    Aliase: ["vllt", "eventuell", "evtl"],
                    Funktion: ModulAllgemein.Antworten,
                    Text: Texte.Vielleicht
                }
            },
            Wunschliste: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.WunschlisteVerarbeiten
            },
            Allergien: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AusschlussGeschenk",
                Text: Texte.AusschlussGeschenk
            },
            AusschlussGeschenk: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "AusschlussWichtel",
                Text: Texte.AusschlussWichtel
            },
            AusschlussWichtel: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Freitext",
                Text: Texte.Freitext
            },
            Freitext: {
                Datenaufnahme: true,
                Funktion: ModulDatenaufnahme.DatenAufnehmen,
                Ziel: "Teilnehmer",
                Text: Texte.Teilnehmer
            },
            Teilnehmer: {
                "ändern": {
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "ÄnderungBestätigen",
                    Text: Texte.ÄnderungBestätigen
                }
            },
            ÄnderungBestätigen: {
                "ja": {
                    Funktion: ModulDatenaufnahme.DatenÄndern,
                    Ziel: "AnalogDigitalWichtel",
                    Text: Texte.AnalogDigitalWichtel
                },
                "nein": {
                    Aliase: ["nö", "ne"],
                    Funktion: ModulAllgemein.Fortfahren,
                    Ziel: "Teilnehmer",
                    Text: Texte.ÄnderungAbgebrochen
                },
                "vielleicht" : {
                    Aliase: ["vllt", "eventuell", "evtl"],
                    Funktion: ModulAllgemein.Antworten,
                    Text: Texte.Vielleicht
                }
            },
            Wartend: {
                //Leer
            },
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
        },
        NichtVerstanden: {
            Funktion: ModulAllgemein.NichtVerstanden
        }
    };
}
