# Latein-Vokabeltraining für Fortgeschrittene

Die Seite `/sprachen/latein/vokabeltrainer/` richtet sich an Lernende mit etwa fünf Jahren Lateinunterricht. Sie verbindet Wortbedeutungen, Stammformen und Textverständnis. Übersetzungen gehen ausschließlich von Latein nach Deutsch; lateinische Grund- und Stammformen werden aus lateinischen Vorgaben abgerufen. Alle Modi sind ohne Zeitlimit bedienbar.

## Wortschatz und Herkunft

Die unveränderte, eigenständige Kopie aus `Latin/data/vocabulary.json` liegt unter `src/content/latin/vocabulary.json`: 955 eindeutige Stichwörter aus Lektionen 1–23 mit 1.037 erhaltenen Original-IDs. Education benötigt weder Python noch eine API, Datenbank oder Laufzeitverbindung zum Latin-Projekt.

`src/data/latin.ts` erhält neben deduplizierten Bedeutungen und der bisherigen Vergleichssignatur auch getrennte Verwendungen, Wortarten, Grammatik, Hinweise und Original-IDs. Unterschiedliche Kontexte werden nicht zu einer gemeinsamen Konstruktionsfrage vermischt. Ergänzende Stammformen desselben Verbs werden aus seinen Verwendungen zusammengeführt; alternative Formen bleiben erhalten. Die vierte Stammform ist das Supinum auf -um, kein automatisch erzeugtes PPP.

262 Stichwörter haben eine Verb-Verwendung, davon 112 eine vollständig hinterlegte Reihe mit Präsens, Perfekt und Supinum. Die Werkstatt kann derzeit 240 infinitivische Verbeinträge mit mindestens einer bekannten Stammform nutzen. Finite Einträge wie `est` werden dort nicht als Infinitive behandelt. Deponentien wie `sequī` behalten ihre mehrteiligen Perfektformen und aktive deutsche Bedeutung; die feminine Sprecherform ist ebenfalls zulässig. Für `esse`, `posse`, `velle`, `nōlle` und `mālle` wird ausdrücklich kein Supinum verlangt. Bei anderen fehlenden Angaben wird nur die Datenlücke beschrieben; fehlende Daten gelten nicht als grammatische Nichtexistenz.

Nach Quelldatenänderungen zuerst Latin validieren, dann die komplette Vokabeldatei nach Education kopieren und die Education-Prüfungen ausführen. Neue Grammatik und Wörter gehören in die maßgebliche Latin-Quelle. Zusätzliche didaktische Inhalte liegen getrennt daneben.

## Sechs Trainingsmodi

- **Wörter zuordnen:** Der bisherige Modus bleibt erhalten: 2–10 Paare pro Runde, standardmäßig 5, und standardmäßig 20 Wörter. Die Wortauswahl kommt jetzt aus dem gewählten Lernpaket. Ein Wort erscheint höchstens einmal pro Durchgang. Auswahl ist auf beiden Seiten möglich und lässt sich durch erneutes Klicken aufheben. Richtige Paare bleiben markiert; Fehler erlauben weitere Versuche. Identische vollständige Bedeutungssets sind austauschbar.
- **Stammformen-Werkstatt:** Standardmäßig sechs Verben. Zufällig wechselnde Lücken fragen maximal zwei bekannte Stammformen und eine deutsche Grundbedeutung ab; vorhandene weitere Formen stehen als Orientierung dabei. Optionale Formenbausteine helfen beim Einüben, freie Eingabe dient dem Abruf. Der aktive Eingabefokus bestimmt das Ziel eines Bausteins; erneutes Klicken wählt ihn ab.
- **Formen-Detektiv:** 15 eigens erstellte Fälle mit finiter Form im eindeutigen lateinischen Satz. Gefragt werden Infinitiv, deutsche Übersetzung der konkreten Form und vorhandene Stammformen. Schrittweise Hinweise helfen bei der Erkennung. Die Auflösung erläutert Stammwechsel, Tempus und Modus.
- **Bedeutungs-Mission:** Zwölf kontextgebundene Aufgaben in vier kurzen Übungstexten: Brückenbau, Friedensgesandtschaft, Vertrauen und Senatsdebatte. Abgefragt werden passende deutsche Wortgruppen, eindeutig zugeordnete Konstruktionen und bei Verben der hinterlegte Perfektstamm. Aufgaben bleiben in Textreihenfolge. Die Texte sind selbst verfasst, keine Originalzitate.
- **Fehlerjagd und Verwechslungsduell:** Zehn Fälle prüfen Stammformen, Bedeutungen, Genus und Kasus. Jede Aussage kann ausdrücklich fehlerhaft oder richtig sein; auch vollständig richtige Beispiele sind enthalten. Auf jeden Fall folgt ein freier Abruf desselben Wortes.
- **Vokabel-Parcours:** Standardmäßig zwölf Wörter. Erst werden Bedeutungen abgerufen, dann bekannte wortartspezifische Zusatzangaben (Verbstammformen, Genitiv/Genus, Adjektivgrundformen und vorhandene Steigerung oder eindeutige Kasusrektion). Bis zu drei Wörter folgen als gemischter Abruf mit veränderter Aufgabenstellung. Wörter ohne bekannte Zusatzangaben werden in Etappe zwei ausgelassen.

Die Wortzahl wird beim Wechsel von Modus oder Filter auf die verfügbare Auswahl begrenzt. Im Parcours und in der Fehlerjagd entstehen mehrere Aufgaben pro gewähltem Wort. Ein leeres Paket zeigt eine Erklärung und kann nicht gestartet werden. Unsichere Felder erscheinen nach weiteren Aufgaben noch einmal ohne Bausteine; pro ursprünglicher Aufgabe gibt es höchstens eine solche Wiederholung. Ein Durchgang endet somit auch bei anhaltenden Fehlern. Nach der Werkstatt führt ein Anschlussangebot zum Detektiv, nach jedem neuen Modus zum gemischten Parcours.

## Lernpakete und Filter

Die Einstiegsansicht zeigt sechs bebilderte Kacheln mit kurzer Beschreibung. Es ist zunächst kein Modus ausgewählt, die Konfiguration ist verborgen und deaktiviert. Eine Auswahl per Klick, Leertaste oder Enter öffnet die gewählte Kachel als vergrößerte Detailansicht; die übrigen Kacheln weichen zurück. Natives Radioverhalten einschließlich Pfeiltasten bleibt in der Übersicht verfügbar. „Anderen Modus wählen“ führt zur Übersicht zurück und setzt den Fokus auf den zuvor gewählten Modus.

Die Kachel zoomt mit einer einmaligen 420-ms-Animation von ihrer bisherigen Position in die breite Detailansicht. Unter dem größeren Bild erläutern drei Absätze Ablauf, erwartete Antworten und Übungsziel. Erst nach Ende der Animation erscheinen die aktivierten Trainingsoptionen. Bei reduzierter Bewegung entfällt die Animation; die Detailansicht und Konfiguration sind sofort verfügbar. Abbruch oder erneute Auswahl verwirft alte Animationsabschlüsse. Enter zur Moduswahl startet kein Training. Nach Abbruch eines Trainings oder „Einstellungen ändern“ bleibt der gewählte Modus geöffnet. Die Kachelbilder sind dekorativ; Texte bleiben zugänglich und werden nicht in Bilder eingebrannt.

Lernpaket, Wortart und persönlicher Lernbedarf stehen offen unter der vergrößerten Erklärung im Bereich „Training konfigurieren“. Ein aufklappbares „Lernpaket verfeinern“ und dessen zusätzliche Trennlinie entfallen. Lernpakete überlappen und werden mit dem Wortartenfilter und dem optionalen persönlichen Lernbedarf kombiniert (UND-Verknüpfung). Der Lektionsfilter ist in der Oberfläche ausgeblendet; die dokumentierte Herkunft und die interne Lektionenzuordnung bleiben erhalten. Der frühere untere Erklärblock „Gezielt üben. Später wiederholen.“ ist entfernt.

Die Lernpaketauswahl enthält nur den gesamten Wortschatz, sechs Sachfelder und die wortartunabhängigen Merkmale „Mehrere Bedeutungen“, „Wörter mit Konstruktionshinweisen“ und „Verwechslungsgruppen“. „Mehrere Bedeutungen“ setzt mindestens zwei hinterlegte deutsche Bedeutungen voraus und gilt für alle Wortarten. Reine Wortarten, Strukturwortgruppen, Konjugationen, Deklinationen, Deponentien, Adjektivtypen, Stammbildungsgruppen und Verb-Wortfamilien werden nicht mehr als Lernpakete angeboten.

Die separate Wortartenauswahl konzentriert sich auf Verben, Substantive, Adjektive, Pronomen, Adverbien, Präpositionen und Konjunktionen. Eigennamen, Interjektionen, Partikeln, Zahlwörter und Wendungen haben keine eigene Auswahl. Ihre Einträge bleiben im gesamten Wortschatz erhalten; die Änderung löscht keine Vokabeln.

Die angebotenen Wortarten werden aus den tatsächlich verfügbaren Aufgaben des gewählten Modus abgeleitet:

- **Zuordnung und Parcours:** alle sieben häufigen Wortarten sowie „Alle Wortarten“.
- **Stammformen-Werkstatt und Formen-Detektiv:** ausschließlich Verben; die Auswahl ist automatisch gesetzt und mit einem erklärenden Hinweis nicht veränderbar.
- **Bedeutungs-Mission:** Verben, Substantive und Präpositionen sowie „Alle Wortarten“.
- **Fehlerjagd:** Verben, Substantive, Adjektive und Präpositionen sowie „Alle Wortarten“.

Passende ausdrückliche Wortartenwahlen bleiben beim Moduswechsel bestehen. Unpassende Wahlen werden zurückgesetzt; eine zuvor automatisch gesetzte Verbwahl schränkt einen nachfolgenden gemischten Modus nicht ein. „Filter zurücksetzen“ erhält in reinen Verbmodi die feste Verbwahl. Auch die Filterlogik akzeptiert nur die für den Modus angebotenen Wortarten.

Das persönliche Fehlerpaket bleibt leer, bis tatsächlich unsichere Angaben vorliegen. Anschlussaktionen nach einem Training ermöglichen den Wechsel zum Formen-Detektiv oder zum gemischten Parcours.

Ein Wortartenfilter begrenzt auch die Verwendungen und Bedeutungen: `cum` als Konjunktion wird beispielsweise nicht mit der Präpositionsbedeutung „mit“ abgefragt. Unzulässige Wortarten werden für den jeweiligen Modus abgewiesen. Die Sachfelder sind explizite Mitgliedschaften in `src/content/latin/activities.ts`, keine automatisch geratenen Kategorien. Sie bilden kuratierte Einstiegspakete und beanspruchen keine vollständige semantische Verschlagwortung aller 955 Wörter. Für eigene Autoren-/Lektürepakete sind die tatsächlichen Unterrichtstexte erforderlich; es wird kein Autorenbezug erfunden.

`src/content/latin/lessons.json` überträgt die dokumentierten Original-ID-Bereiche aus `Latin/scans/VERARBEITET.md`. Alle 1.037 IDs sind abgedeckt. Ein konsolidiertes Wort gehört zu jeder Lektion, in der eine seiner Original-IDs vorkam; die Reihenfolge oder die kanonische Wort-ID allein ist dafür nicht ausreichend. Eine interne Filterung nach Lektion begrenzt die Wortauswahl, nicht die abgefragten Formen auf den damaligen Einführungsstand; die Oberfläche bietet diesen Filter derzeit nicht an.

## Bewertung und Wiederholung

Lateinische Antworten werden nach NFC, äußerem Leerraum und Groß-/Kleinschreibung verglichen; Längenzeichen müssen nicht eingegeben werden. Die Daten behalten ihre Schreibweisen und getrennten Identitäten. Bekannte Formenvarianten werden akzeptiert, unpassende Formen erhalten eine konkrete Lösung.

Bei deutschen Antworten werden hinterlegte Bedeutungen, einfache Artikelvarianten und aus den Einträgen entfernte erklärende Klammerzusätze erkannt. Kontextaufgaben haben eigene Bedeutungslisten und übernehmen keine kontextfremden Bedeutungen aus der Gesamtliste. Eine nicht erkannte Formulierung wird nicht automatisch als falsch gewertet: Nach dem Lösungsvergleich entscheidet die lernende Person zwischen „Sinngemäß richtig“ und „Noch üben“. Diese Selbstbewertung ergänzt keine globalen Synonyme. Offene Bewertungen sperren die Fortsetzung. Leere Eingaben speichern keine Bewertung; „Lösung aufdecken“ ist jederzeit als Lernhilfe möglich und merkt die Angaben zur Wiederholung vor.

Bedeutungen, einzelne Stammformen, Zusatzangaben und kontextbezogene Fähigkeiten erhalten getrennte Lernstände. Ergebnisse zählen beantwortete Angaben, einschließlich Wiederholungen, getrennt nach vier Bereichen. Eine Bewertung wird nur einmal gespeichert. Hinweise und Formenbausteine zählen als unterstütztes Üben; bei selbstbewerteten deutschen Formulierungen betrifft dies nur das betreffende Feld.

Die Standardintervalle nach zeitlich getrenntem freien Abruf sind 1, 3, 7, 14 und 30 Tage. Fehler werden nach zehn Minuten wieder fällig. Unmittelbarer erneuter Abruf erhöht die Stufe nicht und verschiebt die Fälligkeit nicht. Unterstütztes Üben verschiebt eine bestehende Fälligkeit nicht nach hinten. Das sind transparente Startwerte, kein Anspruch auf individuell optimale Lernintervalle.

## Lokale Speicherung und Bedienung

Der versionierte Schlüssel `education.latin.progress.v1` in `localStorage` speichert nur Wort-IDs, Fähigkeiten, Zähler und Wiederholungstermine. Kein Konto, keine Cookies, kein Server und keine Übertragung von Antworten. Der Lernstand überlebt Neuladen; Einstellungen und laufende Durchgänge werden nicht wiederhergestellt. Löschen erfordert einen zweiten ausdrücklichen Klick und bietet „Behalten“ an.

Ungültige Daten werden abgefangen und nur gültige Datensätze der bekannten Version übernommen. Gesperrte oder volle Browserspeicherung unterbricht das Lernen nicht; ein sichtbarer Hinweis erklärt die Begrenzung auf die geöffnete Seite. Es gibt keine automatische Synchronisierung zwischen Geräten oder gleichzeitig geöffneten Tabs.

Das gemeinsame Modern-Classic-Design, BaseLayout, Farben, Schriften und Cover bleiben erhalten. Die Moduskacheln verwenden das vorhandene Zuordnungsbild und fünf neue gemalte Illustrationen unter `src/assets/latin-mode-*.png`. Astro liefert responsive WebP-Varianten. Die mit dem integrierten Imagegen erzeugten Bilder tragen ihren exakten Prompt als PNG-Metadatum; Dateipfade, Stilreferenz und vollständige Prompts stehen in `documentation/visual-directions/latin-training-modes.json`. Native beschriftete Auswahl- und Eingabefelder, Buttons, sichtbare Fokusrahmen, Statusmeldungen und gezieltes Fokusmanagement unterstützen Tastatur und Touch. Keine Zeitfristen, kein Drag-and-drop. Die Zuordnungsspalten bleiben bei 320px nebeneinander; die neuen Antwortfelder ordnen sich auf schmalen Bildschirmen untereinander an. Ohne JavaScript bleiben die Einstellungen gesperrt und ein Hinweis erklärt die Voraussetzung.

## Prüfungen

Unter Node.js 24: `npm run test:unit`, `npm run build`, `npm run test:browser`. Mit `EDUCATION_BROWSER_FOCUS=latin npm run test:browser` laufen nur die beiden Latein-Browserprüfungen. Der Browserlauf startet und beendet den statischen Testserver selbst; mit `CHROMIUM_EXECUTABLE_PATH` kann ein vorhandener Chromium verwendet werden.

Unit-Tests prüfen Datenherkunft und -erhalt, Lektionen, wortartunabhängige Pakete, häufige und modusspezifische Wortarten, fünf neue Modi, Deponentien, fehlende Formen, Varianten, Kontextgrenzen, unbekannte deutsche Formulierungen, Wiederholungen und robuste versionierte Lernstände. Browserprüfungen decken den bisherigen Zuordnungsablauf bei 320, 390, 768, 1024 und 1440px sowie alle neuen Modi bei 320, 390 und 1440px ab: bebilderte Kacheln, Radioauswahl per Maus und Tastatur, vergrößerte Erklärung und größere Bilder, Freigabe der Konfiguration nach der Zoomanimation, Rückkehr zur Übersicht, abgesicherter Start während der Animation, unterbrochene Auswahl und reduzierte Bewegung, offen angeordnete Filter ohne zusätzliche Trennlinie, bereinigte Lernpakete, automatisch festgelegte Verbmodi, modusspezifische Wortarten sowie Erhalt/Zurücksetzen beim Moduswechsel, entfernte Schnellwahl/Lektionsfilter/Erklärblock, vollständige Durchgänge, leere Antworten, Bausteine, Hinweise, fehlerabhängige Wiederholung, Selbstbewertung, Speicherung, Neuladen, Löschen und defekte/gesperrte Speicherung. Screenshots liegen standardmäßig in der ignorierten `.impeccable/review/`; `EDUCATION_SCREENSHOTS` kann einen anderen Pfad vorgeben.
