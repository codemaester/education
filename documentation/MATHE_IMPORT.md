# Import: Warum √2 irrational ist

Quelle ist die bereitgestellte Datei `index 2.html` im Repository-Hauptverzeichnis.
Ihr SHA-256-Hash und der übernommene Umfang sind in
`src/content/mathematics/sqrt-two-source.json` dokumentiert.
Nach erfolgreichem Import und Prüfung wurde die Originaldatei entfernt.

## Inhalte und Funktionen

- Fünf Abschnitte: Grundidee, Vorwissen, Beweis, Wissenstest und Merkzettel.
- Vier veränderbare Näherungen an √2 mit exakten Dezimalangaben.
- Ein Geradheitsmodell für die Zahlen 2 bis 7 mit Quadratdarstellung.
- Sieben vollständig lesbare Beweisschritte und ein Beweis-Navigator.
- Drei Testfragen mit Rückmeldung, Behandlung offener Antworten und Neustart.
- Merkzettel, häufige Fragen und Druckfunktion für die Lernseite.

Die Lernseite liegt unter `/mathematik/wurzel-2/` und ist über die Fächerübersicht
auf der Startseite sowie `/faecher/mathematik/` erreichbar.

## Umsetzung

`sqrt-two-hero.html` und `sqrt-two.html` unter `src/content/mathematics/` enthalten
die redaktionellen Inhalte. `src/scripts/sqrt-two.js` enthält die übernommenen
Interaktionen. Die Seite wird vollständig mit Astro gebaut und benötigt die
Originaldatei nicht zur Laufzeit oder beim Build.

Die ursprünglichen Layout- und Zustandsregeln sind in
`src/styles/imported/sqrt-two.css` auf `.sqrt2-page` begrenzt.
`src/styles/mathematics.css` passt sie an Modern Classic an. Kopf- und Fußzeile,
Schriften, Navigation und Fokusverhalten kommen aus dem gemeinsamen Layout.
Die mathematische Grafik verwendet native SVG-Elemente und die Theme-Palette.

Die ursprüngliche Kopf- und Fußzeile wurde durch den gemeinsamen Seitenrahmen
ersetzt. Die Aussagen des Beweises und die numerischen Werte der Experimente
bleiben erhalten. Ohne JavaScript sind Beweis und Erklärung lesbar; Experimente
und automatische Auswertung zeigen keine scheinbar aktiven, funktionslosen
Bedienelemente. Die normale Browser-Druckfunktion bleibt nutzbar.

## Prüfung

Unit-Tests prüfen den vollständigen Import und die Rechenkonsistenz der
Näherungsdaten. Browserprüfungen auf 320, 390, 768, 1024 und 1440 Pixeln decken
Fachverlinkung, Layout und Formeln, alle Näherungen und Geradheitsvarianten,
Navigation durch den Beweis, Quiz-Auswertung und Neustart sowie Drucken ab.
Zusätzlich wird die Lesbarkeit der Beweisschritte ohne JavaScript geprüft.
