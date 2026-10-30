# Import der Optik-Lernseite

Quelle: [codemaester/physik-optik](https://github.com/codemaester/physik-optik),
Commit `acbbc47653de7b4b209186574b956d75867cd83a`.
Das Ursprungsrepository wurde nur gelesen und bleibt unverändert.

## Übernommener Umfang

- Sieben Kapitel mit sämtlichen Erklärungen, Merksätzen und fachlichen Beispielen.
- Sieben dynamische Simulationen und sieben native Lernskizzen als Alternative
  ohne JavaScript.
- 105 Auswahlfragen mit Rückmeldungen, 14 schriftliche Aufgaben und Musterlösungen.
- Sieben Videoeinbindungen mit Direktlinks auf YouTube.
- Prüfungs-Checkliste, Quellenhinweise und der zweiseitige A4-Lernzettel.

Die Herkunft ist maschinenlesbar in `src/content/optics/source.json` vermerkt.
Die Kapitel stehen in `chapters.html`, Checkliste und Quellen in `appendix.html`
und der Lernzettel in `study-sheet.html` im selben Verzeichnis.
Diese HTML-Fragmente sind redaktioneller Projektinhalt und werden beim Build
eingebunden; sie sind keine Schnittstelle für ungeprüfte Benutzereingaben.

## Integration

- Lernseite: `/physik/optik/`.
- Druckbarer Lernzettel: `/physik/optik/lernzettel/`.
- Einstieg: Startseite und `/faecher/physik/`.
- Stabile Kapitelanker `#k1` bis `#k7` bleiben erhalten.
- Simulationen und Interaktionen liegen als gebündeltes JavaScript in
  `src/scripts/optics.js`; ihre physikalischen Berechnungen wurden beibehalten.
- Die Original-Styles sind auf die Lernseite begrenzt. Das gemeinsame Theme
  ersetzt die bisherige Farb- und Schriftgestaltung.
- Kapitelmenü, Seitenrahmen und Navigation sind in Astro integriert. Es gibt
  nur ein Hauptinhalts-Landmark pro Seite.

## Ergänzungen

Die ursprüngliche Prüfungs-Checkliste wurde um eine eigenständige Gesamtabfrage
ergänzt: sieben neue, kapitelbezogene Auswahlfragen mit bewusst ausgelöster
Auswertung, Erklärungen und Wiederholungslinks. Eine offene Transferaufgabe mit
Musterlösung bietet zusätzliche Selbstkontrolle. Die ursprünglichen
Kapitelübungen und ihre Auswertungen bleiben davon getrennt.

Eine neue Illustration folgt der freigegebenen Modern-Classic-Referenz.
Ihr Generierungsprompt liegt unter
`documentation/visual-directions/optics-illustration-prompt.txt` und ist in der
Quelldatei eingebettet. Astro erzeugt daraus responsive WebP-Dateien; die
Illustration ersetzt keine fachlich genaue Simulation.

## Verifikation

`npm run test:unit` prüft die übernommenen Spiegelmodelle, die Vollständigkeit
des Imports, Katalogdaten und die neue Gesamtauswertung. `npm run test:browser`
prüft den Produktionsbuild auf fünf Bildschirmbreiten einschließlich 320 Pixeln,
Navigation, Simulationen, Aufgaben, Videos, Gesamtabfrage, Verhalten ohne
JavaScript und zweiseitigem A4-PDF. Videoaufrufe werden dabei lokal simuliert.
