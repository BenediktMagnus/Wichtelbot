[![Build](https://github.com/BenediktMagnus/Wichtelbot/workflows/Build/badge.svg)](https://github.com/BenediktMagnus/Wichtelbot/actions)
[![Test](https://github.com/BenediktMagnus/Wichtelbot/workflows/Test/badge.svg)](https://github.com/BenediktMagnus/Wichtelbot/actions)
[![Coverage](https://coveralls.io/repos/github/BenediktMagnus/Wichtelbot/badge.svg?branch=master)](https://coveralls.io/github/BenediktMagnus/Wichtelbot?branch=master)

# Wichtelbot

Ein Bot für die Organisation des Wichtelns an Weihnachten.

Aktuell nur auf Deutsch verfügbar und für Discord implementiert (wenngleich so generisch gehalten, dass andere Sprachen und Plattformen einfach ergänzt werden können).

## Generelle Funktionsweise

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

## Anleitung

Hier folgen Beschreibungen, wie der Wichtelbot eingerichtet und bedient werden kann.

### Bot aufsetzen

#### Bot erstellen

- Gehe zu https://discord.com/developers/applications
- Klicke auf "New Application"
- Benenne deinen Bot
- Klicke auf "Create"
- Klicke auf den Tab "Bot" und dann auf "Add Bot"
- Stelle sicher, dass "Message Content Intent" aktiviert ist.
- "Username" enthält den Namen deines Bots
- "Token" ist der Zugriffstoken deines Bots.
- Unter dem Tab "OAuth" findet sich die Client-ID.

#### Bot zum Server hinzufügen

- In der Anwendungsansicht (siehe Link oben) deines Bots, klicke auf den Tab "OAuth2", dann "URL Generator".
- Wähle die folgenden Berechtigungen: "bot" und "applications.commands"
- Kopiere und öffne die URL, die sich darunter befindet.
- Wähle deinen Server in der Liste.
- Klicke auf "Autorisieren".

### Discordserver konfigurieren

- Es braucht zwei Kanäle: Einen öffentlichen Anmelde- und einen privaten Moderationskanal.
- Im Anmeldekanal müssen alle Teilnehmer sowie der Bot Nachrichten lesen und schreiben können.
  - Achtung: Jeder Kanal, in dem der Bot Leserechte hat, ist ein Anmeldekanal.
  - Optional kann zusätzlich oder stattdessen für Teilnehmer die Ausführung von Botkommandos erlaubt werden.
- Im Moderationskanal müssen alle Moderatoren sowie der Bot Nachrichten lesen und schreiben können.
- Um die IDs der Kanäle und Rollen zu erhalten, aktiviere den Entwicklermodus in den Einstellungen von Discord:
  - Nutzereinstellungen - Erweitert - Entwicklermodus
  - Mit Rechtsklick auf einen Kanal oder eine Rolle erscheint nun die Option "ID kopieren".

### Wichtelbot installieren

- Die neueste (vorkompilierte) Version findet sich [hier](https://github.com/BenediktMagnus/Wichtelbot/releases).
- Der Bot läuft nur auf Linux (getestet mit Ubuntu 22.04 und Debian 11). Er könnte, muss aber nicht, auf anderen Betriebssystemen laufen.
- Du brauchst Node.js (https://nodejs.org/) in Version 16.9.0 oder höher.
- Alle Abhängigkeiten werden mit `npm install` installiert (NPM ist Teil von Node.js).

### Wichtelbot konfigurieren

- Minimale Konfiguration:
  - Kopiere "config/bot.json.default" nach "config/bot.json"
  - Setze "name" auf den Namen deines Bots.
  - Setze "token" auf den Zugriffstoken deines Bots.
  - Setze "clientId" auf die Client-ID deines Bots.
  - Kopiere "config/config.json.default" nach "config/config.json"
  - Setze "moderationChannelId" auf die ID des Moderationskanals.
  - Setze "moderationRoleId" auf die ID der Moderatorenrolle.
  - In "currentEvent", setze:
    - "name" auf den Namen des Ereignisses (z.B. "Weihnachten 2022")
    - "registration" auf den Beginn der Registrierungsphase in Unixzeit
    - "assignment" auf den Beginn der Zuweisungsphase in Unixzeit
    - "end" auf das Ende des Ereignisses (am Ende des Auspackens) in Unixzeit
  - Setze "eventHistory" auf "[]" (d.h. keine vergangenen Wichtelereignisse)
- Texte anpassen:
  - In der Datei "locale/de-DE.texts.json" finden sich die Texte, die der Bot an die Wichtel schickt. Sie sollten an das eigene Wichtelereignis angepasst werden.
  - In der Datei "locale/de-DE.commands.json" finden sich die Befehle. Hier kann angepasst werden, welche Eingaben welche Befehle auslösen und was die möglichen Antworten sind.
  - Die Datei "locale/de-DE.values.json" enhält allgemeine Werte, die vermutlich nicht angepasst werden müssen, jedoch individualisiert werden können.

### Wichtelbot starten

- Starte den Bot mit `npm start`.
- Um den Bot dauerhaft laufen zu lassen, gibt es unter anderem folgende Möglichkeiten:
  - Die Verwendung eines Prozessmanagers wie PM2 (https://pm2.keymetrics.io/)
  - Die Erstellung eines Dienstes bspw. mit Systemd
  - Das Starten des Bots innerhalb von Screen

### Am Wichteln teilnehmen

- Jeder mit Schreibzugriff auf den Anmeldekanal (oder dem Recht auf Ausführung von Botkommandos in dem Kanal) kann sich anmelden.
- Standardmäßig durch `!wichteln` bzw. `/wichteln`. (Sowohl das Befehlspräfix als auch der Befehl sind anpassbar.)

### Auslosung durchführen

- Die Anmeldephase muss vor der Auslosung mittels `!AnmeldephaseBeenden` beendet werden.
- Sollen die von den Wichteln angegeben Nutzerausschlüsse berücksichtigt werden (was optional ist), so sind diese manuell in die SQL-Datenbank ("data/main.sqlite") einzutragen. Die Nutzereingabe findet sich in der Tabelle "information", Spalte "userExclusion". Eingetragen werden müssen sie in der Tabelle "exclusion". "giverId" ist die Discord-ID des Nutzers, der den Ausschlusswunsch geäußert hat; "takerId" die des in "userExclusion" angegebenen Nutzers; "reason" ist zu füllen mit "wish" und "lastUpdateTime" ist auf die aktuelle Unixzeit zu setzen. In Zukunft ist geplant, diesen Prozess teilautomatisiert zu gestalten oder zumindest die manuelle Zuweisung über den Bot zu ermöglichen.
- Anschließend kann die Auslosung mittels `!Auslosen` im Moderationskanal durchgeführt werden.
- Es ist zu empfehlen, dass auch bei einer erfolgreichen Auslosung die korrekte Zuweisung der Wichtel nach der Auslosung manuell überprüft wird. Der Zuteilungsalgorithmus funktioniert in der Regel einwandfrei; Fehler können jedoch nicht ausgeschlossen werden. Dazu ist ein manuelles Auslesen der Zuweisungen aus der SQL-Datenbank "data/main.sqlite" (Tabellenname: "relationship") nötig. Auch hier ist ein einfacheres Auslosen über den Bot in Zukunft geplant, aber noch nicht umgesetzt.
- Nach der Auslösung kann allen Wichteln mit `!SteckbriefeVerteilen` der Steckbrief ihres zugeteilten Wichtelkindes zugestellt werden.

### Fragen oder Probleme

Bei Fragen, Unklarheiten oder Schwierigkeiten kann gerne ein [Issue erstellt](https://github.com/BenediktMagnus/Wichtelbot/issues/new) werden.
