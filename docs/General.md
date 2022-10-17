# Generelle Funktionsweise

## Ablauf

- Teilnehmer können sich in einem öffentlichen Kanal mittels `!wichteln` beim Bot anmelden.
- Dieser schreibt dem Teilnehmer anschließend eine private Nachricht und führt ihn durch den Anmeldevorgang.
- Die Kommunikation zwischen Teilnehmer und Bot findet "dialogartig", d.h. mittels Fragen und Antworten nahe an menschlicher Sprache statt. So gibt es keine direkten Befehle wie `!Hilfe`, sondern Aktionen werden durch Sätze und Wörter wie "Hilf mir", "Meinem geheimen Wichtelpaten schreiben" oder "Hä?" ausgelöst.
- In der Anmeldung werden den zukünftigen Wichtel Fragen gestellt, deren Antworten zwei Funktionen erfüllen:
   1. Der spätere Wichtelpate (d.h. derjenige, der später ein Geschenk machen wird) erhält Informationen darüber, was dieses Wichtelkind sich wünscht oder was es nicht mag. Dies erleichtert die Auswahl des Geschenks.
   2. Die Auslosung berücksichtigt einige der Antworten, bspw. die Präferenz von analogen oder digitalen Geschenken oder das Heimatland des Wichtels, um so möglichst ideale Zuweisungen finden zu können.
- Moderatoren kommunizieren im Moderationskanal mit dem Bot über Befehle. Der Bot meldet sich dort ebenfalls an die Moderatoren, wenn bspw. ein Wichtel um Hilfe bitte.
- Am Ende der Anmeldephase wird diese manuell durch einen Moderator beendet und die Auslosung kann durchgeführt werden. Nach der Auslosung erhalten alle Wichtel einen Steckbrief über ihre Wichtelkinder (diejenigen, welche die Geschenke erhalten). Dieser setzt sich zusammen aus den in der Anmeldung erfassten Fragen.
- Nach der Auslosung können die Wichtel anonym über den Bot kommunizieren und so offene Fragen klären oder Sendungsverfolgungsnummern austauschen.

## Befehlsübersicht

Hier eine Übersicht über die wichtigsten Befehle.

Moderation:
- `!Wichtelstatus`: Zeigt eine Übersicht zum Status der aktuellen Teilnehmer.
- `!AnmeldephaseBeenden`: Beendet die Anmeldephase.
- `!Auslosen`: Führt die Auslosung durch.
- `!SteckbriefeVerteilen`: Verteilt den Steckbrief an alle Wichtel.

Anmeldekanal:
- `!wichteln`: Registriert den Teilnehmer für das Wichteln. Der Bot führt einen anschließend per PN durch den Anmeldeprozess.

Private Nachrichten mit dem Bot:
- `Hilfe`: Zeigt eine Übersicht über die aktuell möglichen Befehle.
- `Rufe Hilfe`, `Wichtelorga rufen`: Informiert die Moderatoren im Moderationskanal, dass jemand Hilfe benötigt.
- `Meinem geheimen Wichtelpaten schreiben`: Schreibt eine Nachricht an den eigenen Wichtelpaten.
- `Meinem mir bekannten Wichtelkind schreiben`: Schreibt eine Nachricht an das eigene Wichtelkind.
