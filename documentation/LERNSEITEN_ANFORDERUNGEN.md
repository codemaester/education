# Anforderungen an Lernseiten

Dieses Dokument beschreibt den gemeinsamen Standard für neue Lernseiten im
Education-Repository. Als Referenz dient der
[Prototyp Physik Optik](https://github.com/codemaester/physik-optik):
kapitelweise Erklärungen, interaktive Grafiken, eingebettete Videos,
Kapitelübungen und ein druckbarer Lernzettel. Ergänzend gehört eine
kapitelübergreifende Gesamtabfrage zum Standard jeder vollständigen Lernseite.

Die Anforderungen gelten unabhängig vom Fach. Kapitelzahl, Umfang der Übungen
und Länge des Lernzettels richten sich nach Thema, Zielgruppe und Lernzielen.
Die sieben Kapitel, jeweils 15 Testfragen und zwei Druckseiten des Prototyps
sind keine festen Vorgaben.

## 1. Verbindlichkeit und Ziel

- **MUSS:** Bestandteil jeder vollständigen Lernseite.
- **SOLL:** Regelfall; fachlich oder didaktisch begründete Abweichungen werden
  in der Dokumentation der jeweiligen Lernseite festgehalten.
- **KANN:** Optionale Ergänzung mit erkennbarem Nutzen für das Lernen.

Eine Lernseite MUSS eigenständiges Lernen ermöglichen: Inhalte verstehen,
Zusammenhänge ausprobieren, Wissen überprüfen und das Gelernte wiederholen.
Interaktionen und Gestaltung SOLLEN dieses Ziel unterstützen.

## 2. Aufbau einer Lernseite

Jede Lernseite MUSS folgende Bereiche enthalten:

1. **Einstieg:** Thema, Zielgruppe beziehungsweise Lernniveau, benötigtes
   Vorwissen und verständlich formulierte Lernziele.
2. **Kapitelübersicht:** Eine nachvollziehbare Reihenfolge und direkte
   Navigation zu den einzelnen Kapiteln.
3. **Lernkapitel:** Erklärungen und Beispiele, passende interaktive Elemente,
   ergänzende Videos und abschließende Kapitelübungen.
4. **Gesamtabfrage:** Eine abschließende Überprüfung über alle Kapitel hinweg.
5. **Lernzettel:** Eine separat erreichbare, druckbare Zusammenfassung.
6. **Quellen:** Zugeordnete Nachweise für verwendete Inhalte, Medien und Videos.

Kapitel, Gesamtabfrage und Lernzettel MÜSSEN von der Navigation aus erreichbar
sein. Lernende MÜSSEN erkennen können, in welchem Kapitel sie sich befinden.
Kapitel SOLLEN direkt verlinkbar sein. Die Navigation MUSS auch auf kleinen
Displays funktionieren, ohne Inhalte oder Bedienelemente zu verdecken.

## 3. Aufbau und Inhalte eines Kapitels

Jedes Kapitel MUSS ein klar abgegrenztes Thema und konkrete Lernziele haben.
Es SOLL diesem Ablauf folgen:

1. Mit einer Frage, Beobachtung oder alltagsnahen Aufgabe einsteigen.
2. Begriffe und Zusammenhänge verständlich erklären.
3. Ein Beispiel oder eine angeleitete Lösung zeigen.
4. Zusammenhänge selbstständig erkunden lassen, sofern eine Interaktion passt.
5. Passende YouTube-Videos zur Erklärung oder Vertiefung anbieten.
6. Mit mehreren Testfragen oder Aufgaben abschließen.

Die Reihenfolge innerhalb eines Kapitels KANN an den Lerninhalt angepasst
werden. Ein Video ersetzt weder die Erklärung noch die Aufgaben.

Inhalte MÜSSEN fachlich korrekt, altersgerecht und verständlich sein.
Fachbegriffe, Formelzeichen und Einheiten MÜSSEN eingeführt und konsistent
verwendet werden. Wesentliche Aussagen SOLLEN durch Beispiele, beschriftete
Skizzen oder Merksätze unterstützt werden. Typische Fehlvorstellungen SOLLEN
gezielt aufgegriffen werden.

## 4. Interaktive grafische Elemente

Ein Kapitel SOLL interaktive Grafiken enthalten, wenn damit ein Zusammenhang
besser verständlich oder eine Aufgabe sinnvoll bearbeitbar wird. Geeignet sind
beispielsweise Simulationen, veränderbare Diagramme, Konstruktionen,
Zuordnungen oder schrittweise aufgebaute Visualisierungen. Für rein textliche
Inhalte ist keine künstliche Interaktion erforderlich.

Jede Interaktion MUSS:

- Einen erkennbaren Bezug zu mindestens einem Lernziel haben.
- Erklären, was verändert oder untersucht werden kann.
- Auf Eingaben unmittelbar und ohne vollständiges Neuladen der Seite reagieren.
- Grafik, angezeigte Werte und Erklärung konsistent aktualisieren.
- Fachlich plausible Ergebnisse innerhalb der erlaubten Eingaben liefern und
  wichtige Grenzfälle korrekt darstellen.
- Verständliche Beschriftungen, gegebenenfalls Einheiten und eine Legende haben.
- Einen nachvollziehbaren Ausgangszustand anbieten; veränderbare Simulationen
  SOLLEN sich zurücksetzen lassen.

Eine kurze Beobachtungsfrage SOLL die Erkundung anleiten, zum Beispiel:
„Was verändert sich, wenn du den Winkel vergrößerst?“
Wichtige Erkenntnisse MÜSSEN zusätzlich als Text oder statische Darstellung
zugänglich sein. Reine Dekorationsanimationen gelten nicht als Lerninteraktion.

## 5. YouTube-Videos mit Vorschau

Jedes Kapitel SOLL fachlich passende YouTube-Videos enthalten. Die Auswahl MUSS
zum Lernniveau und zum konkreten Kapitel passen. Gibt es kein geeignetes Video,
wird die Abweichung dokumentiert und die Erklärung eigenständig bereitgestellt.

Die Videodarstellung MUSS:

- Vor dem Abspielen eine ansprechende Vorschau zeigen: bevorzugt ein Thumbnail,
  alternativ ein inhaltlich passendes Vorschaubild.
- Titel, Kanal beziehungsweise Quelle und einen klar erkennbaren Abspielbutton
  enthalten. Die Dauer SOLL angezeigt werden, sofern bekannt.
- Kurz erläutern, welche Frage das Video beantwortet oder was beim Ansehen
  beobachtet werden soll.
- Den Player erst nach bewusster Aktivierung laden; beim Seitenaufruf darf keine
  automatische Wiedergabe beginnen.
- Das Video direkt innerhalb der Lernseite abspielen und den Player responsiv
  ohne Layoutsprünge darstellen.
- Einen direkten Link zum Video auf YouTube als Alternative anbieten.
- Bei fehlendem Vorschaubild, gesperrter Einbettung oder fehlender Verbindung
  verständlich und weiterhin bedienbar bleiben.

Das Schließen eines Players MUSS die Wiedergabe beenden. Der Abspielbutton MUSS
auch per Tastatur erreichbar und mit dem Videotitel verständlich benannt sein.
Die Lerninhalte MÜSSEN auch ohne Zugriff auf die Videos verständlich bleiben.

## 6. Testfragen und Aufgaben am Kapitelende

Jedes Kapitel MUSS mit einer Reihe von Aufgaben abschließen, die seine
wesentlichen Lernziele abdecken. Umfang und Schwierigkeit richten sich nach dem
Inhalt; bloße Wiederholungen zur Erhöhung der Fragenzahl sind zu vermeiden.

Geeignete Aufgabenformen sind beispielsweise:

- Single Choice mit genau einer richtigen Antwort.
- Multiple Choice mit mehreren richtigen Antworten.
- Zuordnungen, Reihenfolgen oder Lückentexte.
- Rechen-, Erklärungs-, Konstruktions- und Transferaufgaben.

Bei Auswahlaufgaben MUSS erkennbar sein, ob eine oder mehrere Antworten richtig
sind. Falsche Antwortmöglichkeiten SOLLEN plausible Fehlvorstellungen abbilden.
Komplexere Aufgaben SOLLEN eingesetzt werden, wenn das Lernziel durch eine
Auswahlfrage nicht angemessen überprüft werden kann.

Aufgaben MÜSSEN verständliche Rückmeldung bieten:

- Bei automatisch prüfbaren Antworten: Ergebnis und fachliche Begründung nach
  Auswahl oder bewusst ausgelöster Prüfung.
- Bei offenen oder komplexeren Aufgaben: Musterlösung, nachvollziehbarer
  Lösungsweg oder Kriterien zur Selbsteinschätzung.
- Falsche Antworten: Einen hilfreichen Hinweis statt einer bloßen Fehlermeldung.
- Einen erneuten Versuch beziehungsweise das Zurücksetzen einer Übung.

Musterlösungen SOLLEN erst auf Wunsch sichtbar werden. Eine automatische
Bewertung offener Antworten darf nur behauptet werden, wenn sie tatsächlich
verlässlich umgesetzt ist. Selbsteinschätzungen MÜSSEN als solche erkennbar sein.

Bearbeitungsstand und Ergebnis SOLLEN innerhalb der aktuellen Sitzung sichtbar
sein. Dabei MÜSSEN „beantwortet“, „richtig beantwortet“ und „selbst eingeschätzt“
unterschieden werden. Eine dauerhafte Speicherung ist optional.

## 7. Gesamtabfrage nach allen Kapiteln

Jede vollständige Lernseite MUSS eine eigenständige Gesamtabfrage enthalten.
Eine reine Checkliste oder eine Sammlung von Merksätzen ersetzt sie nicht.

Die Gesamtabfrage MUSS:

- Die wesentlichen Lernziele aller Kapitel abdecken.
- Grundlagen und Anwendung prüfen sowie passende kapitelübergreifende
  Transferaufgaben enthalten.
- Geeignete Aufgabenformen aus den Kapitelübungen kombinieren.
- Antworten zunächst ohne vorweggenommene Lösung bearbeiten lassen.
- Eine bewusst auslösbare Auswertung mit nachvollziehbaren Ergebnissen anbieten.
- Erklärungen und Verweise zu den Kapiteln geben, die wiederholt werden sollten.
- Erneut durchführbar sein und ihren Bearbeitungsstand getrennt von den
  Kapitelübungen führen.

Automatisch bewertete und selbst eingeschätzte Aufgaben MÜSSEN in der Auswertung
unterscheidbar bleiben. Die Gesamtabfrage SOLL das Verständnis auch mit neuen
Beispielen prüfen und nicht nur dieselben Kapitelaufgaben wiederholen.

## 8. Druckbarer Lernzettel

Jede Lernseite MUSS einen Lernzettel als eigenständige Ansicht mit Rückweg zur
Lernseite anbieten. Er MUSS alle Kapitel abdecken und ohne Bedienung von
Simulationen oder Wiedergabe von Videos verständlich sein.

Der Lernzettel MUSS enthalten:

- Die Kapitelstruktur und die wichtigsten Begriffe und Zusammenhänge.
- Zentrale Regeln, Formeln und Einheiten, soweit fachlich relevant.
- Aussagekräftige beschriftete Skizzen, Diagramme oder kurze Beispiele, wo sie
  das Verständnis unterstützen.
- Wichtige Vorgehensweisen und typische Fehler, soweit für das Thema relevant.

Er MUSS eine kompakte, eigenständig formulierte Zusammenfassung sein.
Ein Ausdruck der vollständigen interaktiven Seite reicht nicht aus.

Für die Druckansicht gilt:

- Eine Aktion „Drucken / als PDF speichern“ öffnet den Browser-Druckdialog.
  Die normale Druckfunktion des Browsers MUSS ebenfalls nutzbar bleiben.
- Das Layout MUSS für DIN A4 vorbereitet sein und die tatsächlich benötigte
  Seitenzahl vorsehen. Lesbarkeit hat Vorrang vor einer festen Seitenzahl.
- Navigation, Buttons, Videoplayer und andere reine Bedienelemente werden
  ausgeblendet.
- Text, Formeln, Tabellen und Skizzen dürfen weder abgeschnitten werden noch
  sich überlagern. Seitenumbrüche MÜSSEN inhaltlich sinnvoll gesetzt sein.
- Der Ausdruck MUSS auf weißem Hintergrund und auch in Graustufen verständlich
  sein, ohne farbige Flächen vorauszusetzen.

Bildschirmansicht und Druckansicht MÜSSEN denselben fachlichen Stand wiedergeben.
Lernzettel und Lernkapitel MÜSSEN bei inhaltlichen Änderungen gemeinsam gepflegt
werden.

## 9. Responsive Gestaltung und Zugänglichkeit

Die Seite MUSS auf Smartphone, Tablet und Desktop vollständig nutzbar sein.
„Reaktiv“ bedeutet zusätzlich, dass Interaktionen unmittelbar reagieren; daraus
ergibt sich keine Verpflichtung auf ein bestimmtes JavaScript-Framework.

- Text, Grafiken, Videos und Eingaben MÜSSEN sich an die verfügbare Breite
  anpassen. Die Seite darf keinen unbeabsichtigten horizontalen Überlauf haben.
- Navigation, Typografie, Abstände, Buttons und Rückmeldungen SOLLEN innerhalb
  der Sammlung konsistent gestaltet sein. Fachspezifische Visualisierungen
  bleiben möglich.
- Die Gestaltung MUSS eine klare Hierarchie und gut lesbare Kontraste haben.
  Grafiken und Bedienelemente MÜSSEN auch auf kleinen Displays lesbar bleiben.
- Alle zentralen Funktionen MÜSSEN per Tastatur und per Touch nutzbar sein.
  Drag-and-drop-Aufgaben benötigen eine gleichwertige Bedienalternative.
- Fokuszustände MÜSSEN sichtbar sein. Eingaben benötigen verständliche Labels;
  aussagekräftige Grafiken benötigen eine Textbeschreibung.
- Richtige und falsche Antworten dürfen nicht ausschließlich über Farben
  unterscheidbar sein. Wichtige dynamische Rückmeldungen MÜSSEN auch für
  assistive Technologien zugänglich sein.
- Animationen SOLLEN gezielt eingesetzt werden und reduzierte Bewegung
  berücksichtigen.

## 10. Technischer Rahmen und Wiederverwendung

- Die Lernseiten MÜSSEN in das gemeinsame Astro-Projekt integrierbar sein und
  als statische Website auf GitHub Pages funktionieren.
- Interaktive Funktionen laufen im Browser. Wesentliche Erklärungen und der
  Lernzettel MÜSSEN auch ohne JavaScript lesbar bleiben; nicht verfügbare
  Funktionen benötigen eine sinnvolle Alternative oder Erklärung.
- Die Seiten SOLLEN schnell laden. Videoplayer und aufwendige Interaktionen
  werden bedarfsgerecht geladen, statt die erste Darstellung zu blockieren.
- Wiederkehrende Elemente SOLLEN gemeinsam genutzt werden: Kapitelrahmen,
  Navigation, Video-Vorschau, Aufgaben, Rückmeldungen und Drucklayout.
- Inhaltliche Daten und Auswertungslogik SOLLEN von der Darstellung getrennt
  werden, soweit das Wiederverwendung und Pflege erleichtert.
- Jedes Kapitel benötigt einen stabilen Bezeichner. Aufgaben benötigen eine
  Zuordnung zu Kapitel und Lernziel sowie Antwortregeln oder Bewertungskriterien.
- Ein Konto oder eine Serveranbindung ist für den grundlegenden Lernablauf
  nicht erforderlich. Eine optionale lokale Speicherung MUSS nachvollziehbar
  sein und zurückgesetzt werden können.

## 11. Abnahme einer neuen Lernseite

Vor der Veröffentlichung MUSS geprüft werden:

- [ ] Zielgruppe, Vorwissen und Lernziele sind klar; alle Kapitel sind vollständig.
- [ ] Übersicht, Kapitelnavigation, Gesamtabfrage und Lernzettel sind erreichbar.
- [ ] Interaktionen unterstützen die Lernziele und liefern fachlich korrekte
      Ergebnisse, auch bei relevanten Grenzfällen.
- [ ] Video-Vorschau, bewusster Playerstart, Schließen und externer Ersatzlink
      funktionieren; fehlende externe Medien blockieren das Lernen nicht.
- [ ] Kapitelaufgaben und Gesamtabfrage prüfen die vorgesehenen Lernziele;
      Rückmeldungen, Musterlösungen und erneute Versuche funktionieren.
- [ ] Gesamtauswertung und Wiederholungsempfehlungen sind nachvollziehbar.
- [ ] Der Lernzettel deckt alle Kapitel ab; A4-Ausdruck und PDF wurden auf
      Lesbarkeit, Seitenumbrüche und Vollständigkeit geprüft.
- [ ] Smartphone-, Tablet- und Desktopansicht wurden geprüft, einschließlich
      einer schmalen Ansicht ab 320 CSS-Pixeln.
- [ ] Tastaturbedienung, sichtbarer Fokus, Textalternativen und verständliche
      Rückmeldungen wurden geprüft.
- [ ] Erklärungen und Lernzettel bleiben ohne JavaScript lesbar.
- [ ] Fachliche Quellen, Medienzuordnung und Links sind geprüft.
- [ ] Astro-Prüfung und Produktionsbuild sind erfolgreich; die bereitgestellten
      Pfade funktionieren unter der konfigurierten Domain.

Für fachliche Berechnungen, Aufgabenauswertung und zentrale Lernabläufe SOLLEN
gezielte automatisierte Tests vorhanden sein. Browserprüfungen SOLLEN
Interaktionen, Videos, Navigation und Druckansicht abdecken. Externe Videos
dürfen durch kontrollierte Testantworten ersetzt werden; die tatsächliche
Abspielbarkeit MUSS zusätzlich bei der Inhaltsprüfung überprüft werden.
