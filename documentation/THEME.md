# Modern Classic für Lernseiten

Die gewählte Referenz ist
[Modern Classic](visual-directions/03-modern-classic.png).
Die verbindlichen Implementierungsdetails werden zusätzlich in
[DESIGN.md](../DESIGN.md) dokumentiert.

## Gemeinsame Styles

| Datei | Verantwortung |
| --- | --- |
| `src/styles/theme.css` | Palette, Schriften, Abstände, Radien und Seitenbreite |
| `src/styles/base.css` | Semantische Grundelemente, Layout, Navigation, Buttons und Fokus |
| `src/styles/global.css` | Einstieg, importiert Theme und Basis |
| `src/styles/catalog.css` | Startseite, Fachverzeichnis, Kurslisten und leere Fachseiten |
| `src/styles/carousel.css` | Überblendung, gemeinsame Rasterfläche und Steuerung der neuesten Lernseiten |
| `src/styles/learning.css` | Kapitel, Lernnavigation, Aufgaben und Theme-Anpassung für Optik |
| `src/styles/mathematics.css` | Scoped Theme-Anpassung für die Mathematik-Lernseite |
| `src/styles/study-sheet.css` | Lernzettel mit eigenständiger A4-Druckdarstellung |
| `src/styles/imported/` | Auf die jeweilige Lernseite begrenzte Layout- und Zustandsregeln des Prototyps |

Schriften werden lokal aus den npm-Paketen ausgeliefert. Newsreader übernimmt
Überschriften und kurze redaktionelle Akzente, Manrope Lesetexte, Beschriftungen
und Bedienung. Es gibt keinen erforderlichen Aufruf eines externen Font-Servers.

Die ursprüngliche Palette bleibt in `theme.css` erhalten. Für kleinen Text auf
hellem Hintergrund gibt es zusätzlich ein dunkleres Terrakotta. Helle Salbei-
und Sandtöne strukturieren Flächen; sie ersetzen keine lesbare Schriftfarbe.

## Eine Seite im gemeinsamen Theme anlegen

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Icon from '../../components/Icon.astro';
---

<BaseLayout title="Meine Lernseite" description="Eine konkrete Beschreibung.">
  <div class="page-shell">
    <h1>Ein Thema entdecken.</h1>
    <p>Eine verständliche Einführung.</p>
    <a class="button" href="#erstes-kapitel">
      Loslegen <Icon name="arrow" size={18} />
    </a>
    <section id="erstes-kapitel"><h2>Das erste Kapitel</h2></section>
  </div>
</BaseLayout>
```

Importpfade richten sich nach der Position der Seite. `BaseLayout` bringt die
globalen Styles, Metadaten, den Sprunglink und die gemeinsame Navigation mit.
`page-shell`, `button`, `button-secondary`, `text-link`, `breadcrumb` und
`subject-symbol` sind die gemeinsamen Grundbausteine.

`Icon.astro` verwendet einen einheitlichen SVG-Strichstil. Dekorative Icons
werden vor Screenreadern verborgen; ein inhaltlich eigenständiges Icon erhält
über `title` einen zugänglichen Namen. Fächer behalten sichtbare Texttitel.

Die neun Fachicons im Verzeichnis der Startseite und auf den Fachseiten verwenden `SubjectArt.astro`
mit gemalten, transparenten Motiven aus `src/assets/subjects/`. Papierstruktur,
lasierende Farbflächen, Waldgrün, Salbei und Terrakotta greifen die vorhandenen
Lektionsbilder auf. Astro liefert responsive WebP-Dateien in 80 und 160 Pixeln
Breite; die Darstellung ist auf Desktop 80 und mobil 56 Pixel groß. Die Variante
`hero` auf den Fachseiten verwendet 110 beziehungsweise 70 Pixel große Motive,
mit Bilddateien in 110 und 220 Pixeln Breite. Die Motive
sind dekorativ, die Fachnamen bleiben als Linktext erhalten. Generiert wurden
sie mit dem eingebauten `image_gen`-Werkzeug; die einzelnen Prompts stehen in
`documentation/visual-directions/subject-icons-prompts.json`.

## Katalog erweitern

`src/data/catalog.ts` enthält die Fächer und tatsächlich vorhandenen Kurse.
Ein Kurs verweist auf eine eigene Astro-Seite. Die Fachseiten und deren
Verfügbarkeitsangaben werden aus diesen Daten erzeugt. Neue Themen dürfen ihre
Illustrationen und interaktiven Diagramme passend zum Fach gestalten, verwenden
aber dieselben Schriften, Tokens, Navigation und Rückmeldungen.

Die `CourseImage`-Komponente wählt die Vorschau über den `cover`-Wert im
Kurskatalog: `optics` liefert responsive WebP-Dateien, `sqrt-two` eine native
SVG-Darstellung eines Quadrats mit Fläche 2 und Seitenlänge √2. Weitere Kurse
benötigen eine passende Bildquelle beziehungsweise eine Erweiterung dieser
Komponente. `chapterLabel` unterscheidet bei Bedarf Kapitel und Abschnitte.

`FeaturedCourses.astro` übernimmt eine Kursliste und zeigt über `recentCourses`
die maximal fünf höchsten `addedOrder`-Werte zuerst. Für neue Kurse den nächsten
eindeutigen Index, einen `shortTitle`, eine `artCaption` und wahrheitsgemäße
`highlights: [{ icon, label }]` ergänzen. Fachsymbol, Niveau, Abschnittszahl,
Beschreibung und Grafik stammen ebenfalls aus dem Katalog.

Die Komponente benötigt die Katalog-Styles für die Bild-Text-Komposition.
Alle Vorschauen teilen sich eine Rasterfläche und reservieren dadurch die
größte benötigte Höhe. Auf kleinen Displays stehen Bildunterschriften unter
der Grafik, damit sie keine Diagrammbeschriftungen verdecken.
Die Steuerung ist erst nach erfolgreicher JavaScript-Initialisierung sichtbar.
Ohne JavaScript bleibt die neueste Vorschau zugänglich; bei null beziehungsweise
einem Kurs entfallen der Bereich beziehungsweise die Wechselsteuerung.

Das eigene Skript `src/scripts/featured-courses.ts` wechselt alle acht Sekunden
mit einer sanften 650-ms-Überblendung. Das ausgehende Thema bleibt während
seines Fade-outs sichtbar, während das nächste Thema eingeblendet wird. Die
gemeinsame Salbeifläche und die Höhe bleiben dabei stabil. Hover, ein verborgener Tab oder eine Vorschau
außerhalb des Sichtbereichs unterbrechen den Timer vorübergehend. Fokus,
Berührung und manuelle Auswahl stoppen den automatischen Wechsel für den restlichen Besuch.
Bei reduzierter Bewegung startet die Vorschau statisch und wechselt ohne
Animation. Nur die aktive Vorschau ist bedienbar und für Screenreader sichtbar;
die Statusmeldung kündigt ausschließlich manuelle Wechsel an.

## Lernseiten und Druck

Die Optik-Interaktionen verwenden die Originalmodelle. Importierte CSS-Regeln
sind auf `.optics-page` beziehungsweise `.study-sheet-page` begrenzt, damit sie
weder Startseite noch andere Fächer überschreiben. Neue native Lernseiten
sollen nur benötigte gemeinsame Regeln übernehmen; die importierte Optik-CSS
ist keine Pflicht für weitere Fächer.

Die Mathematik-Lernseite verwendet `.sqrt2-page` als eigenen Geltungsbereich.
Sie erbt Farben und Schriften aus dem gemeinsamen Theme und bewahrt ihre
Bruchdarstellung, Experimente und Beweisschritte. Bedienelemente, die JavaScript
benötigen, werden erst nach erfolgreicher Initialisierung aktiviert.

Die automatische Gesamtabfrage trennt ihre Ergebnisse von den Kapitelübungen.
Die offene Transferaufgabe dient der Selbstkontrolle und zählt nicht zur
automatisch bewerteten Punktzahl.

Der Lernzettel nutzt eine eigene Druckansicht. Die Bildschirmnavigation und
Videoplayer gehören nicht auf den Ausdruck. Anpassungen an Schriftgrößen oder
Inhalten müssen zusammen mit dem A4-PDF geprüft werden.
