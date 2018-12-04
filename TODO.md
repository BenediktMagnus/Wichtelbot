-Paketnummern
-Ganz am Anfang eine Info darüber, was vom Bot gefragt wird. (Eventuell auch mehr Informationen über den Prozess.)
    -> Dass später wird anonym kommuniziert werden können (auch digitale Geschenke darüber austauschbar).
-Adminfeld bei den Mods, im Falle von Fehlern taggen.
-Datenbankverwaltung auf Termin umstellen!
-In allen Datenbankvorgängen Zeiten/Termine berücksichtigen.
-Ausschlüsse mit früheren Wichteln kombinieren.
-Neues Land: "andere"
-Umstieg auf synchrone SQLITE-Bibliothek?
-Config auf Datenbank umstellen.
-Auf "doch" mit "oh" und auf "danke" mit "bitte" reagieren.
-Aufteilung der Steckbriefe verschönern.
-Alle Promises behandeln.
-In NachrichtAnWichtelpaten Zugriff auf neue Nutzer.WichtelpateId!

--Stille Post zwischen Nutzern verbessern:
1. Abfrage einbauen, ob man das auch wirklich lesen möchte.
2. Zeitliche Limitierung einbauen, in der man keine erneute Nachricht schreiben darf.
3. Verzögerung einbauen, bevor der eine Nachricht versendet wird.
4. Abbruchmöglichkeit einbauen.

--Paketnummernaufnahme verbessern...:
1. Sicher machen!!!
2. Aktualisierung nach Paketnummern ordnen oder hilfsweise auf NULL prüfen.

--Algorithmus reparieren: Internationaler Versand wird nicht richtig ausgeschlossen.
1. Wenn man analog bewichteln möchte und keinen internationalen Versand erlaubt, muss nach dem Land gefragt werden!
2. Die Unterschiede im Land werden zwar berücksichtig, wenn der Wichtel analog bewichtelt werden möchte, aber nicht, wenn man selbst
   nur analog bewichteln möchte!