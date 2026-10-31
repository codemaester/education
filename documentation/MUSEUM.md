# Museum der endlosen Dinge

Neue Mathematik-Lernseite unter `/mathematik/museum-der-unendlichkeit/`, ab Klasse 9
mit einer ausdrücklich als Vertiefung bezeichneten Einführung in Mengenmächtigkeit.
Die drei vom Nutzer gewählten Museumsräume übernehmen das Modern-Classic-Theme.

## Lernziele und Grenzen

- Zahlenzoom: exakte Zahl und endliche Näherung unterscheiden. Die Intervalle um
  √2 werden mit BigInt und ganzzahliger Quadratwurzel berechnet. 24 Zoomstufen,
  zehnfache Vergrößerung pro Schritt; die Markerposition wird aus acht weiteren
  Dezimalstellen angenähert. Endlich viele Ziffern beweisen keine Irrationalität.
- Kreiswanderer: rationale Periodizität mit einer irrationalen, dichten Bahn
  vergleichen. Die Rückkehrzeit ist bei gekürztem p/q genau q. Die Simulation
  zeigt maximal 1.200 Schritte mit Gleitkomma-Arithmetik; das Widerspruchsargument
  im Text begründet die exakte mathematische Aussage. Dicht heißt nicht, dass
  jeder Punkt getroffen wird. Verbindungen zeigen Landereihenfolge, keine Wege
  durch das Kreisinnere. Ein Animationsrahmen läuft nur während des Versuchs;
  er pausiert außerhalb des Sichtbereichs und bei verborgenem Tab.
- Unendlichkeitshotel: n → n+1 und n → 2n, diagonal geordnete gekürzte Brüche
  einschließlich Vorzeichen und 0, anschließend Cantors Diagonalargument.
  Acht Zimmer und sechs Dezimalstellen sind ausdrücklich nur Ausschnitte. Die
  Ersetzungsregel 1 → 2, sonst → 1 vermeidet Mehrdeutigkeit durch 9er-Perioden.

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

`tests/museum.test.mjs` prüft Intervallinvarianten bis 24 Dezimalstellen,
Bruchaufzählung, Kreisgeometrie und Periodizität, Diagonalregel und Aufgabenabdeckung.
`tests/museum-browser.mjs` prüft die drei Experimente, Animation, Quiz-Neustart,
getrennte Ergebnisse, Tastaturbedienung, fünf Bildschirmbreiten, Quellen-/Asset-
Fehler, No-JS-Lösungen und Druckansicht im Produktionsbuild.
