# Education

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, statische Ausgabe und GitHub Pages. GitHub Actions baut und veröffentlicht
bei Pushes auf `main`. npm verwaltet die Abhängigkeiten.

## Product Purpose

Eine Sammlung interaktiver Lernseiten für verschiedene Fächer. Die Startseite
und eigene Fachübersichten ermöglichen den Einstieg. Die erste vollständige
Lernseite behandelt Optik für Klasse 9 mit sieben Kapiteln, Simulationen,
Videos, Kapitelübungen, Gesamtabfrage und druckbarem Lernzettel.
Die Mathematik-Lernseite „Warum √2 irrational ist“ für Klasse 9 ergänzt die
Sammlung um interaktive Beispiele, einen Beweis-Navigator und Wissenstest.
Das „Museum der endlosen Dinge“ ergänzt vier experimentelle Räume zu
irrationalen Zahlen und Unendlichkeit: Zahlenzoom, Kreiswanderer und
Unendlichkeitshotel sowie einen eigenen Zahlenlisten-Bereich zur Abzählbarkeit
rationaler und Überabzählbarkeit reeller Zahlen, mit Aufgaben und Museumsführer.

Der Latein-Vokabeltrainer ergänzt unter Sprachen ein konfigurierbares Zuordnungstraining mit 955 eindeutigen Stichwörtern, direkter Rückmeldung und Abschlussauswertung. Der Wortschatz ist eine eigenständige Kopie aus dem Latin-Projekt.

## Brand Commitments

Der Schriftzug im gemeinsamen Seitenkopf lautet **Education.Weiterdenken.**
Die Startseite begrüßt mit **„Verstehe, wie die Welt funktioniert.“**

Die gewählte Gestaltung ist **Modern Classic** aus
`documentation/visual-directions/03-modern-classic.png`: Newsreader für
Überschriften, Manrope für Lesetext und Bedienung, Papierweiß, Waldgrün,
Terrakotta, Salbei und Sand. Das Theme soll über alle Fächer hinweg
wiederverwendbar sein. Icons und grafische Symbole unterstützen die Orientierung.

## Capabilities and Constraints

- Ein gemeinsames Astro-Projekt mit erweiterbaren Unterseiten.
- Der Latein-Vokabeltrainer ist in der ersten Iteration ein begrenztes Übungswerkzeug ohne Kapitel, Videos oder Lernzettel; siehe [Trainer-Dokumentation](documentation/LATEIN_TRAINER.md).
- Neue Lernseiten folgen den
  [gemeinsamen Anforderungen](documentation/LERNSEITEN_ANFORDERUNGEN.md).
- Hosting unter `https://edu.promptworks.eu/` über GitHub Pages.
- Responsive Startseite, Fachseiten, gemeinsames Layout und gemeinsame Styles.
- Optik ist aus `codemaester/physik-optik` übernommen; das Ursprungsrepository
  bleibt unverändert. Mathematik ist aus der bereitgestellten `index 2.html`
  übernommen. Fächer ohne Lernseiten zeigen ihren noch leeren Inhaltsstand.
- Weitere konkrete Lernthemen und Zielgruppen sind noch offen.
