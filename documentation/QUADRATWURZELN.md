# Quadratwurzeln: Quadratzahlen-Trainer

Route: `/mathematik/quadratwurzeln/`, Mathematik, Klasse 9 Gymnasium.

Dieser erste Bereich ist bewusst ein Übungswerkzeug für die Quadratzahlen von
1 bis 20, kein vollständiger Wurzellehrgang. Entsprechend dem ausdrücklich
begrenzten Auftrag gibt es vorerst keine weiteren Kapitel, Videos,
Gesamtabfrage oder separate Druckansicht. Kurze Erklärungen und eine auch ohne
JavaScript zugängliche Merktabelle begleiten den Trainer. Weitere Bereiche
rund um Quadratwurzeln können später ergänzt werden. Die Beispiele und
Erklärungen sind eigenständig erstellt; die Tabelle berechnet n² für n=1…20.

## Lernablauf

- Gemischt (Standard): alle 40 unterschiedlichen Aufgaben, beide Richtungen.
- Quadrieren oder Wurzelziehen: jeweils alle 20 Aufgaben.
- Teilbereiche 1–10 und 11–20 für kleinere Runden.
- Jede neue Runde mischt den vollständigen gewählten Aufgabenbestand.
- Antworten werden frei eingegeben. `inputmode="numeric"` und `[0-9]*`
  fordern auf Mobilgeräten die Zifferntastatur an; die konkrete Tastatur
  bestimmt das Betriebssystem. Optional gibt es ein eingebautes Ziffernfeld.
- Enter prüft; nach der Rückmeldung führt Enter zur nächsten Aufgabe.
- Falsche oder aufgedeckte Aufgaben werden hinter bis zu drei andere Aufgaben
  gestellt. Sie bleiben in der Runde, bis sie richtig abgerufen wurden.
- „Sicher“ zählt unterschiedliche richtig gelöste Aufgaben, „Direkt richtig“
  die beim ersten Auftreten richtig beantworteten. Fehler und Aufdecken werden
  als Versuche gezählt. Die Serie zählt aufeinanderfolgende richtige Antworten.
- Neue Runde übernimmt die Einstellungen und setzt die gesamte Runde zurück.
- Keine Zeitmessung, Konten oder dauerhafte Speicherung. Neuladen setzt zurück.

## Umsetzung und Prüfung

`src/data/square-trainer.ts` enthält Aufgaben, Antwortprüfung und Wiederholung.
Das Browser-Skript verwaltet die Sitzung, der gemeinsame Astro-Seitenrahmen
und die Katalogdaten integrieren die neue Seite in die Sammlung.

`tests/square-trainer.test.mjs` prüft Zahlenbereiche, beide Richtungen,
Antwortregeln und Wiederholungen. `tests/square-trainer-browser.mjs` prüft
komplette Runden mit Fehlern, Moduswechsel, Aufdecken, freie Eingabe,
Ziffernfeld, Darstellung von 320 bis 1440 Pixeln und Inhalte ohne JavaScript.
