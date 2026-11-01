# Latein-Vokabeltrainer · erste Iteration

Die Seite `/sprachen/latein/vokabeltrainer/` trainiert lateinisch-deutsche Wortbedeutungen durch Zuordnung. Sie richtet sich an Lernende mit ersten Lateinkenntnissen und folgt dem gemeinsamen Modern-Classic-Design. Fachübersicht „Sprachen“ und Startseitenkarussell erschließen sie über den Katalog.

## Wortschatz und Format

Quelle ist das benachbarte Latin-Projekt, `data/vocabulary.json`: 955 eindeutige Stichwörter aus den Lektionen 1–23 mit 1.037 erhaltenen Original-IDs. Die vollständige konsolidierte Datei liegt identisch unter `src/content/latin/vocabulary.json`. Education baut und läuft eigenständig; es gibt keine API, Datenbank oder Laufzeitverknüpfung mit Latin.

Ein Wort hat `id`, `latein` und `verwendungen`. Die Verwendungen enthalten `ids`, `wortart`, `bedeutungen` sowie optional `grammatik` und `hinweis`. Unterschiedliche Wortarten und Kontexte bleiben erhalten. `src/data/latin.ts` leitet daraus eine deduplizierte Bedeutungsmenge und eine reihenfolgeunabhängige Vergleichssignatur ab. Alle Bedeutungen eines Wortes stehen auf der deutschen Karte; grammatische Details werden in dieser Iteration nicht abgefragt.

Nach Änderungen an Latin zunächst dort validieren, dann die JSON-Datei vollständig nach Education kopieren und die Education-Prüfungen ausführen. Die Herkunft und verlustfreie Konsolidierung dokumentiert das Latin-Projekt einschließlich Schema und SHA-256-basierter Rekonstruktion aller Originaleinträge. Education benötigt Python nicht.

## Verhalten

- „Paare pro Runde“: ganze Zahl von 2 bis 10, Standard 5. „Vokabeln insgesamt“: ganze Zahl von 1 bis zur Größe des Wortschatzes, derzeit 955, Standard 20.
- Zufällige Wortauswahl ohne Wiederholung; unabhängige Mischung der deutschen Karten. Die letzte Runde kann kleiner sein, auch nur ein Wort enthalten.
- Auswahl auf beiden Seiten, beliebige Klickreihenfolge. Erneutes Anklicken wählt ab; eine andere Karte derselben Seite ersetzt die Auswahl.
- Zwei gewählte Karten werden sofort geprüft. Bei einem Fehler bleiben die Karten verfügbar, beide Auswahlen werden aufgehoben und ein Fehlversuch wird gezählt. Beide versuchten Karten zeigen bis zur nächsten Auswahl „Passt noch nicht“, damit die Rückmeldung auch auf langen mobilen Listen sichtbar bleibt. Richtige Karten bleiben sichtbar markiert und zählen nur einmal.
- Identische vollständige Bedeutungssets sind austauschbar, auch wenn ihre Wort-IDs verschieden sind. Gemeinsame einzelne Bedeutungen bei ansonsten unterschiedlichen Bedeutungssets gelten nicht als identische Karte.
- Alle Paare einer Runde müssen gelöst sein. „Nächste Runde“ wechselt ausdrücklich weiter. Das letzte Paar führt zur Abschlussauswertung mit gelösten Wörtern, Versuchen und Fehlern.
- „Erneut trainieren“ verwendet dieselbe Konfiguration mit neuer Zufallsauswahl. „Einstellungen ändern“ und „Training abbrechen“ führen zur Konfiguration zurück. Während des Trainings sind die Einstellungen verborgen und gesperrt.
- Kein Konto, keine Cookies und keine dauerhafte Speicherung. Neuladen setzt Konfiguration und Training zurück.

## Bewusste Begrenzung gegenüber dem Lernseitenstandard

Dies ist ein Übungswerkzeug, kein vollständiger Lehrgang. Deshalb enthält diese ausdrücklich begrenzte erste Iteration keine Lernkapitel, Videos, gesonderte Gesamtabfrage oder druckbaren Lernzettel. Die laufende Zuordnungsübung und ihre Auswertung bilden den Lernablauf. Lektionenfilter, weitere Übungsarten, Zeitmessung und gespeicherte Lernstände sind nicht enthalten.

## Bedienung und Gestaltung

Bestehendes BaseLayout, Farben, Schriften, Fokusrahmen und Icons bleiben maßgeblich. Die Konfiguration steht unter einer kurzen Einführung. Im Training stehen Fortschritt und Abbrechen über zwei dauerhaft nebeneinander angeordneten Spalten; auch bei 320px umbrechen lange Bedeutungen innerhalb der Karte. Es gibt keine zeitabhängigen Bedienfristen oder Drag-and-drop-Anforderung. Semantische Buttons unterstützen Tastatur und Touch, sichtbare Texte kennzeichnen gelöste Paare und die Statusregion kündigt Rückmeldungen an. Ohne JavaScript bleiben die Einstellungen gesperrt und ein Hinweis erklärt die Voraussetzung.

Das Katalog-Cover `latin` verwendet `src/assets/latin-vocabulary-painted.png`: eine gemalte Wortpaar-Komposition mit Papierkörnung, lasierenden Salbei- und Sandflächen, Waldgrün und Terrakotta passend zu den anderen Lernseiten. Astro liefert responsive WebP-Varianten. Generierungs-Prompt und Stilreferenzen stehen in `documentation/visual-directions/latin-vocabulary-painted.json`; der Prompt ist zusätzlich im PNG eingebettet.

## Prüfungen

`npm run test:unit`, `npm run build`, `npm run test:browser` unter Node.js 24. Der Browserlauf startet und beendet seinen statischen Testserver selbst. Die Tests prüfen Konfigurationsgrenzen, unveränderte Daten, deterministisch kontrollierten Zufall, Mehrdeutigkeiten, Fehler, Rundenwechsel, Abschluss, Neustart und Abbruch. Browserprüfungen decken 320, 390, 768, 1024 und 1440px, lange Bedeutungen am tatsächlichen Wort „cum“, Tastatur, Fokus, Navigation und fehlendes JavaScript ab. `EDUCATION_SCREENSHOTS` aktiviert Bildschirmfotos.
