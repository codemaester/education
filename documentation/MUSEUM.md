# Museum der endlosen Dinge

Neue Mathematik-Lernseite unter `/mathematik/museum-der-unendlichkeit/`, ab Klasse 9
mit einer ausdrücklich als Vertiefung bezeichneten Einführung in Mengenmächtigkeit.
Die vier Museumsräume übernehmen das Modern-Classic-Theme. Zahlenlisten bilden
einen eigenen Lernbereich nach dem Hotel.

## Lernziele und Grenzen

- Zahlenzoom: exakte Zahl und endliche Näherung unterscheiden. Die Intervalle um
  √2 werden mit BigInt und ganzzahliger Quadratwurzel berechnet. 24 Zoomstufen,
  zehnfache Vergrößerung pro Schritt; die Markerposition wird aus acht weiteren
  Dezimalstellen angenähert. Endlich viele Ziffern beweisen keine Irrationalität.
  Der feste Überblick [1, 2] steht neben einer Lupe mit exakten Grenzen,
  Intervallbreite 10⁻ⁿ und Vergrößerung 10ⁿ. Unter 740 px stehen beide Ansichten
  untereinander. Ein Zoomschritt hebt das nächste Zehntel 350 ms hervor und
  vergrößert es anschließend in 900 ms zur vollständigen Zahlenlinie; beim
  Herauszoomen läuft der Maßstabswechsel rückwärts. Teilstriche und Marker
  folgen derselben Kamera. Eine kurze Statusmeldung erklärt den markierten
  Ausschnitt und bestätigt anschließend, dass das neue Intervall die Lupe füllt.
  Lokale Abstände werden vor der Bildschirmnäherung
  mit BigInt berechnet, auch jenseits der Gleitkommagenauigkeit.
  Im Überblick schrumpft die Markierung maßstabsgetreu. Unter einem tatsächlichen
  CSS-Pixel ersetzt sie eine ausdrücklich nicht maßstabsgetreue Ortsmarke;
  Größenänderungen des Fensters aktualisieren diese Grenze. Schnelle Folgeeingaben,
  Reglersprünge und Zurücksetzen erreichen sofort das neue Ziel ohne Warteschlange.
  Reduzierte Bewegung zeigt alle Zustände ohne räumliche Animation. Ein Wechsel
  zu reduzierter Bewegung oder in einen verborgenen Tab beendet den laufenden
  Schritt. Ohne JavaScript bleibt der Überblick auf Stufe 0 sichtbar.
- Kreiswanderer: rationale Periodizität mit einer irrationalen, dichten Bahn
  vergleichen. Die Rückkehrzeit ist bei gekürztem p/q genau q. Die Simulation
  zeigt maximal 1.200 Schritte mit Gleitkomma-Arithmetik; das Widerspruchsargument
  im Text begründet die exakte mathematische Aussage. Dicht heißt nicht, dass
  jeder Punkt getroffen wird. Verbindungen zeigen Landereihenfolge, keine Wege
  durch das Kreisinnere. Ein Animationsrahmen läuft nur während des Versuchs;
  er pausiert außerhalb des Sichtbereichs und bei verborgenem Tab.
  Die Schrittweite steht jeweils mittig unter dem zugehörigen Kreis. Beide
  Wanderer teilen ein Tempo von 1 bis 60 Schritten pro Sekunde (anfangs 2),
  einstellbar über einen beschrifteten Schieberegler mit aktueller Wertanzeige.
  Tempo, Start/Stopp und die weiteren Aktionen stehen bei ausreichender Breite
  in einer Zeile; der Regler nutzt den restlichen Platz bis zum rechten Rand.
  Auf kleinen Bildschirmen umbrechen die Aktionen und der Regler füllt seine Zeile. Tempoänderungen wirken
  während des Laufs, ohne die bisherigen Schritte zurückzusetzen.
- Unendlichkeitshotel: ein neuer Gast mit n → n+1 und unendlich viele Busgäste
  mit n → 2n. Die ersten acht Zimmer zeigen ausdrücklich nur einen Ausschnitt.
  Das Hotel enthält weder die rationale Aufzählung noch Cantors Diagonalargument.
  Einzelgast und Bus nutzen denselben automatischen Ablauf: Die bisherigen
  Gäste verlassen als nummerierte Figuren ihre Zimmer (0,7 s) und beziehen nach
  n → n+1 beziehungsweise n → 2n ihre neuen Zimmer (2,2 s). Kurze Erklärungen
  direkt über der Szene begleiten die Vorbereitung (1,2 s), den Halt im Flur
  (0,9 s), die freien Zimmer (1,6 s) und die Ankündigung der neuen Gäste (1,1 s).
  Anschließend dauert der Einzug 2 s, insgesamt etwa 9,7 s. „Pause/Weiter“ hält
  sowohl Bewegungen als auch die Erklärpausen an und setzt sie fort.
  Der Bus bringt ausdrücklich unendlich viele Gäste mit den Nummern 1, 2, 3, …;
  die neuen Gäste erhalten nach k → 2k−1 die ungeraden Zimmer. Gäste mit einem
  Ziel außerhalb des Ausschnitts verlassen ihre jeweilige Reihe gerade nach
  rechts, ohne zum Beschreibungstext zu laufen. Erst im rechten Auslaufbereich
  verblassen sie passend zu den entfernten Türen; am Bühnenrand sind sie ganz
  unsichtbar. Gäste mit sichtbarem Zielzimmer behalten volle Deckkraft.
  Die Figuren bleiben beim Einzug durchgehend sichtbar: Bewegte Bilder werden
  vor dem Ausblenden der wartenden Person dekodiert, behalten volle Deckkraft
  und gehen ohne Zwischenbild in die gleich große Zimmerdarstellung über.
  Die bewegte Gastnummer wechselt beim Eintritt in den dunklen Zimmerbereich
  sofort zu Weiß und beim Verlassen zurück zur Flurfarbe. Weg, Farbwechsel und
  das Ausblenden des Leerstrichs folgen derselben Animation: Sobald die Figur
  ein freies Zimmer betritt, verschwindet dessen Leerstrich. Pause, Abbruch und
  Zurücksetzen gelten auch für diese Darstellungswechsel.
  Beide Regeln stehen getrennt und beschriftet mit mindestens 2 rem Abstand;
  die jeweils ausgeführte Regel wird unterstrichen. Die ersten acht Zimmer,
  vier Busgäste und sieben zunehmend schmale, eng stehende, verblassende
  Türsilhouetten zeigen nur einen endlichen Ausschnitt. Die schmaleren aktiven
  Türen haben keinen Türknopf. Drei Fortsetzungspunkte stehen vor dem
  Unendlichkeitssymbol über der
  verblassenden Türreihe. Ein zusätzlicher Fortsetzungstext entfällt.
  Auf kleinen Bildschirmen folgt die verblassende Reihe unter den aktiven Zimmern.
  Die Wege berücksichtigen beide Zimmerreihen auf
  kleinen Bildschirmen. Waldgrün und Terrakotta unterscheiden beide Gruppen.
  Die Figuren sind gemalte transparente Ausschnitte mit Papierstruktur nur
  innerhalb der Person; auch der bewegliche Träger hat keinen Hintergrund.
  Das Original `src/assets/hotel-guest-painted.png` wurde mit dem eingebauten
  image_gen-Werkzeug erzeugt. Prompt und Herkunft stehen in
  `documentation/visual-directions/hotel-guest-painted.json`. Astro erzeugt
  kleine responsive WebP-Dateien für die Darstellung.
  Bewegungsziele und Zimmerbelegung teilen dieselbe Zuordnungsberechnung.
  Wiederholen startet denselben Ablauf neu. Zurücksetzen und Situationswechsel
  verwerfen alle laufenden Animationen und verzögerten Fortsetzungen. Ein
  verborgener Tab, eine nicht sichtbare Bühne, Größenänderungen oder der Wechsel
  zu reduzierter Bewegung führen zum korrekten Endzustand. Bei bereits reduzierter
  Bewegung erscheint er sofort.

- Zahlenlisten: eigenständiger vierter Raum mit zwei unterschiedlichen diagonalen
  Verfahren. Die Bruchtabelle zeigt p/q für p, q = 1…6 und durchläuft die ersten
  sechs vollständigen Diagonalen mit p+q = 2…7 (21 Felder). Vollständig gekürzte
  Brüche werden aufgenommen; ungekürzte Felder wie 2/2 oder 2/4 werden sichtbar
  übersprungen. Die Liste beginnt mit 0 und ergänzt nach jedem positiven Wert
  sein negatives Gegenstück. „Nächstes Feld“, die vollständige Vorschau und
  Zurücksetzen steuern den Durchlauf ohne automatische Animation. Die nächste
  Diagonale enthält etwa 1/7 außerhalb der Tabelle. Das endliche Bild illustriert
  den allgemeinen Beweis: Jeder gekürzte Bruch liegt auf seiner endlichen
  Diagonale; davor liegen nur endlich viele Felder. Die Liste muss nicht nach
  Zahlenwert sortiert sein. Null, Vorzeichen und ganze Zahlen sind berücksichtigt.
  Cantors bisherige Dezimaltabelle folgt als unabhängiges zweites Experiment.
  Es gibt keine Rezeption und keine Gäste in diesem Argument. Die Ersetzungsregel
  1 → 2, sonst → 1 vermeidet 9er-Perioden und doppelte Dezimalschreibweisen.
  Sechs Stellen illustrieren die Konstruktion; der Beweis benötigt die Regel für
  jede Zeile einer beliebigen vorgeschlagenen unendlichen Liste. Die Diagonale
  der Bruchtabelle liefert eine Aufzählung, Cantors Argument widerlegt die
  Vollständigkeit einer reellen Liste. Hauptquelle: Cornell University,
  „Cardinality and countability“, CS 2800, Fall 2017.

## Didaktischer Aufbau

Jeder Raum hat ein Experiment, eigenständige Erklärung, Vertiefungsfrage mit
Lösung sowie zwei automatisch auswertbare Aufgaben. Der getrennte Abschlusstest
enthält vier Transferfragen und eine offene Aufgabe mit Musterlösung zur
Selbsteinschätzung. Ergebnisse werden je Formular innerhalb der Seite geführt;
keine Speicherung oder Serververbindung. Der eigenständige Museumsführer fasst
alle Räume auf zwei für A4 angelegten Seiten zusammen.

Abweichung von den SOLL-Videos im gemeinsamen Lernseitenstandard: Diese erste,
explizit experimentbasierte Museumsausgabe nutzt bewusst die selbst
steuerbaren Exponate als zentrales Medium. Es werden keine ungesichteten Videos
als Ersatz eingebettet. Eigenständige Erklärungen, Aufgabenlösungen und nach
Raum zugeordnete fachliche Quellen bleiben auch ohne JavaScript verfügbar.

## Gestaltung und Medien

Die Bildsprache setzt die Optik- und √2-Cover fort. Das neu generierte
`src/assets/infinity-museum.png` ist atmosphärische Editorial-Illustration;
exakte Mathematik zeigen die SVG-Exponate. Astro erzeugt responsive WebP-Dateien.
Das Museum erscheint als neuester Eintrag auf Startseite und Mathematikübersicht.
Die vorhandenen globalen Design-Dateien bleiben maßgeblich; die Museumseite
führt kein neues Designsystem ein.

## Prüfung

`tests/museum.test.mjs` prüft Intervallinvarianten und verschachtelte Zehntel
einschließlich lokaler Abstände bis 24 Dezimalstellen,
Hotelzuordnungen, Kreisgeometrie und Periodizität, rationale Diagonalfolgen,
kanonische Brüche und beide Vorzeichen, Diagonalregel und Aufgabenabdeckung.
`tests/museum-browser.mjs` prüft die vier Räume und ihre Experimente, Animation, Quiz-Neustart,
getrennte Ergebnisse, Tastaturbedienung, fünf Bildschirmbreiten, Quellen-/Asset-
Fehler, No-JS-Lösungen und Druckansicht im Produktionsbuild.
Die Zoomprüfung umfasst außerdem normale und reduzierte Bewegung, Vorwärts-/
Rückwärtsschritte, unterbrochene Animationen, Reglersprünge, Zurücksetzen,
tiefe Zoomstufen und die Ortsmarke für Ausschnitte unter einem Pixel.
Die Hotelprüfung kontrolliert die eindeutigen Zuordnungen, bewegliche Figuren,
Erklärpausen, Pause/Weiter, transparente Figuren, lückenlosen Einzug, schmaler
werdende verblassende Türen mit Unendlichkeitssymbol, rechte Ausgänge mit
allmählichem Verblassen erst am rechten Rand, Fortsetzungspunkte, synchronen
Farbwechsel an der Zimmergrenze und verschwindende Leerstriche beim Einzug, freie
Zwischenzustände, Einzug, Wiederholung und Abbruch in den Phasen sowie
reduzierte Bewegung, Tab-/Größenwechsel und das Verlassen des Sichtbereichs.

Der neue Zahlenlisten-Test prüft übersprungene Duplikate, fortlaufende
Listennummern, Vorschaugrenzen, unabhängige Neustarts beider Experimente, eigene
Aufgaben, Navigation und Lesbarkeit ohne JavaScript.
