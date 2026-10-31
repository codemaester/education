# Museum der endlosen Dinge

Neue Mathematik-Lernseite unter `/mathematik/museum-der-unendlichkeit/`, ab Klasse 9
mit einer ausdrücklich als Vertiefung bezeichneten Einführung in Mengenmächtigkeit.
Die drei vom Nutzer gewählten Museumsräume übernehmen das Modern-Classic-Theme.

## Lernziele und Grenzen

- Zahlenzoom: exakte Zahl und endliche Näherung unterscheiden. Die Intervalle um
  √2 werden mit BigInt und ganzzahliger Quadratwurzel berechnet. 24 Zoomstufen,
  zehnfache Vergrößerung pro Schritt; die Markerposition wird aus acht weiteren
  Dezimalstellen angenähert. Endlich viele Ziffern beweisen keine Irrationalität.
  Der feste Überblick [1, 2] steht neben einer Lupe mit exakten Grenzen,
  Intervallbreite 10⁻ⁿ und Vergrößerung 10ⁿ. Unter 740 px stehen beide Ansichten
  untereinander. Ein Zoomschritt hebt das nächste Zehntel 100 ms hervor und
  vergrößert es anschließend in 600 ms zur vollständigen Zahlenlinie; beim
  Herauszoomen läuft der Maßstabswechsel rückwärts. Teilstriche und Marker
  folgen derselben Kamera. Lokale Abstände werden vor der Bildschirmnäherung
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
  mit n → 2n, anschließend Cantors Diagonalargument.
  Acht Zimmer und sechs Dezimalstellen sind ausdrücklich nur Ausschnitte. Die
  Ersetzungsregel 1 → 2, sonst → 1 vermeidet Mehrdeutigkeit durch 9er-Perioden.
  Einzelgast und Bus nutzen denselben automatischen Ablauf: Die bisherigen
  Gäste verlassen als nummerierte Figuren ihre Zimmer und beziehen nach
  n → n+1 beziehungsweise n → 2n ihre neuen Zimmer (1,6 s). Nach einer kurzen
  Ansicht der freien Zimmer (0,4 s) ziehen die neuen Gäste aus der Wartezone ein
  (1,2 s). Der Bus bringt ausdrücklich unendlich viele Gäste mit den Nummern
  1, 2, 3, …; die neuen Gäste erhalten nach k → 2k−1 die ungeraden Zimmer.
  Beide Regeln stehen getrennt und beschriftet mit mindestens 2 rem Abstand;
  die jeweils ausgeführte Regel wird unterstrichen. Die ersten acht Zimmer,
  vier Busgäste und beschriftete Wege zu nicht sichtbaren Zimmern zeigen nur
  einen endlichen Ausschnitt. Die Wege berücksichtigen beide Zimmerreihen auf
  kleinen Bildschirmen. Waldgrün und Terrakotta unterscheiden beide Gruppen.
  Bewegungsziele und Zimmerbelegung teilen dieselbe Zuordnungsberechnung.
  Wiederholen startet denselben Ablauf neu. Zurücksetzen und Situationswechsel
  verwerfen alle laufenden Animationen und verzögerten Fortsetzungen. Ein
  verborgener Tab, eine nicht sichtbare Bühne, Größenänderungen oder der Wechsel
  zu reduzierter Bewegung führen zum korrekten Endzustand. Bei bereits reduzierter
  Bewegung erscheint er sofort.

## Didaktischer Aufbau

Jeder Raum hat ein Experiment, eigenständige Erklärung, Vertiefungsfrage mit
Lösung sowie zwei automatisch auswertbare Aufgaben. Der getrennte Abschlusstest
enthält vier Transferfragen und eine offene Aufgabe mit Musterlösung zur
Selbsteinschätzung. Ergebnisse werden je Formular innerhalb der Seite geführt;
keine Speicherung oder Serververbindung. Der eigenständige Museumsführer fasst
alle Räume auf zwei für A4 angelegten Seiten zusammen.

Abweichung von den SOLL-Videos im gemeinsamen Lernseitenstandard: Diese erste,
explizit experimentbasierte Museumsausgabe nutzt bewusst die drei selbst
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
Hotelzuordnungen, Kreisgeometrie und Periodizität, Diagonalregel und Aufgabenabdeckung.
`tests/museum-browser.mjs` prüft die drei Experimente, Animation, Quiz-Neustart,
getrennte Ergebnisse, Tastaturbedienung, fünf Bildschirmbreiten, Quellen-/Asset-
Fehler, No-JS-Lösungen und Druckansicht im Produktionsbuild.
Die Zoomprüfung umfasst außerdem normale und reduzierte Bewegung, Vorwärts-/
Rückwärtsschritte, unterbrochene Animationen, Reglersprünge, Zurücksetzen,
tiefe Zoomstufen und die Ortsmarke für Ausschnitte unter einem Pixel.
Die Hotelprüfung kontrolliert die eindeutigen Zuordnungen, bewegliche Figuren,
freie Zwischenzustände, Einzug, Wiederholung und Abbruch in beiden Phasen sowie
reduzierte Bewegung, Tab-/Größenwechsel und das Verlassen des Sichtbereichs.
