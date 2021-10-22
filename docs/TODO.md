Wichtig:
-Funktion herausnehmen, mit der man als Bot schreiben kann.



-Paketnummern
-Ganz am Anfang eine Info darüber, was vom Bot gefragt wird. (Eventuell auch mehr Informationen über den Prozess.)
    -> Dass später wird anonym kommuniziert werden können (auch digitale Geschenke darüber austauschbar).
-Adminfeld bei den Mods, im Falle von Fehlern taggen.
-Datenbankverwaltung auf Termin umstellen!
-In allen Datenbankvorgängen Zeiten/Termine berücksichtigen.
-Ausschlüsse mit früheren Wichteln kombinieren.
-Neues Land: "andere"
-Config auf Datenbank umstellen.
-Auf "doch" mit "oh" und auf "danke" mit "bitte" reagieren.
-Aufteilung der Steckbriefe verschönern.
-Alle Promises behandeln.
-In NachrichtAnWichtelpaten Zugriff auf neue Nutzer.WichtelpateId!
-Globale Fehlerbehandlung als Log, nicht als Konsolenausgabe.
-Überall prüfen, ob Nachrichten zu lang für Discord werden.

--Stille Post zwischen Nutzern verbessern:
1. Abfrage einbauen, ob man das auch wirklich lesen möchte. -> Spoilerfunktion
2. Zeitliche Limitierung einbauen, in der man keine erneute Nachricht schreiben darf.
3. Verzögerung einbauen, bevor der eine Nachricht versendet wird.
4. Abbruchmöglichkeit einbauen.

--Paketnummernaufnahme verbessern...:
1. Sicher machen!!!
2. Aktualisierung nach Paketnummern ordnen oder hilfsweise auf NULL prüfen.
3. Im anfänglichen Fragebogen abfragen, ob die Paketnummer erhalten werden soll (oder nur die Info übers Erhalten oder gar nicht).
4. Befehl einbauen, mit dem man die Paketnummer und den Status abfragen kann.
5. "Paket angekommen" vor "Paket gesendet" braucht einen Sonderfall?
6. Anlegen des Pakets in der Datenbank direkt bei "Paket ist unterwegs", nicht erst bei der Seriennummer?
7. API von DHL und Hermes anzapfen und automatisch informieren?

--Algorithmus reparieren: Internationaler Versand wird nicht richtig ausgeschlossen.
1. Wenn man analog bewichteln möchte und keinen internationalen Versand erlaubt, muss nach dem Land gefragt werden!
2. Die Unterschiede im Land werden zwar berücksichtigt, wenn der Wichtel analog bewichtelt werden möchte, aber nicht, wenn man selbst
   nur analog bewichteln möchte!
