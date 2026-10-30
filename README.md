# Education

Eine Sammlung verschiedener Lernseiten, gebaut mit [Astro](https://astro.build/)
und veröffentlicht über GitHub Actions auf GitHub Pages.

Die Startseite führt über eine Fächerübersicht zu den Lernseiten. Den Anfang
macht **Physik · Optik** mit sieben interaktiven Kapiteln, Erklärvideos,
105 Auswahlfragen, 14 schriftlichen Aufgaben, einer Gesamtabfrage und einem
druckbaren Lernzettel. Weitere Fächer haben eigene Übersichtsseiten, die ihren
aktuellen Inhaltsstand ausdrücklich anzeigen.

Unter **Mathematik** ist außerdem [Warum √2 irrational ist](https://edu.promptworks.eu/mathematik/wurzel-2/)
verfügbar: mit Näherungsexperiment, Geradheitsmodell, sieben Beweisschritten,
Beweis-Navigator, Wissenstest und druckbarer Zusammenfassung.

Die gemeinsame Gestaltung folgt der gewählten Richtung **Modern Classic**:
Newsreader und Manrope, Papierweiß, Waldgrün, Terrakotta und Salbei.

Auf der Startseite wechseln die fünf zuletzt hinzugefügten Lernseiten alle acht
Sekunden. Aktuell erscheinen Mathematik und danach Optik. Die Vorschau lässt
sich anhalten und direkt steuern; ohne JavaScript bleibt die neueste Seite sichtbar.

Der gemeinsame Standard für neue Lernseiten ist in den
[Anforderungen an Lernseiten](documentation/LERNSEITEN_ANFORDERUNGEN.md)
festgehalten. Er beschreibt Kapitel, interaktive Elemente, Videos,
Kapitelübungen, Gesamtabfrage und druckbare Lernzettel.

## Lokal entwickeln

Voraussetzungen: Node.js 24 (siehe `.nvmrc`) und npm.

```sh
nvm install
nvm use
npm ci
npm run dev
```

`nvm` ist optional; eine anderweitig installierte Node-24-Version genügt.
Die Seite ist unter <http://localhost:4321/> erreichbar.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit automatischem Neuladen |
| `npm run check` | Astro- und TypeScript-Prüfung |
| `npm run test:unit` | Physik, Importumfang, Katalog und Gesamtauswertung prüfen |
| `npm run test:browser` | Den zuvor gebauten Inhalt mit Chromium prüfen |
| `npm run build` | Prüfung und Produktionsbuild nach `dist/` |
| `npm run preview` | Vorschau des zuvor erstellten Produktionsbuilds |

## Repository-Struktur

```text
.github/workflows/deploy.yml  Build und GitHub-Pages-Deployment
public/                       Unverändert kopierte Dateien, z. B. Favicon
src/layouts/BaseLayout.astro  HTML-Rahmen, Metadaten, Kopf- und Fußzeile
src/pages/index.astro         Einstieg und Fächerübersicht
src/pages/faecher/            Aus dem Katalog generierte Fachseiten
src/pages/physik/optik/       Optik-Lernseite und Lernzettel
src/pages/mathematik/        Mathematik-Lernseiten
src/data/                    Fach-, Kurs- und Aufgabendaten
src/content/optics/          Übernommene Kapitel und Lernzettel
src/content/mathematics/     Übernommene Mathematik-Inhalte
src/components/              Wiederverwendbare Icons, Bilder und Aufgaben
src/styles/                  Theme, Basis, Katalog- und Lernseiten-Styles
src/scripts/optics.js        Übernommene Simulationen und Interaktionen
tests/                       Fachliche Tests und Browserprüfungen
astro.config.mjs              Statischer Build, Domain und Basisverzeichnis
PRODUCT.md                    Bestätigter Projektumfang
```

`package-lock.json` wird versioniert. Generierte Verzeichnisse wie `dist/`,
`.astro/` und `node_modules/` werden nicht eingecheckt.

## Weitere Lernseiten hinzufügen

Fächer und vorhandene Kurse werden in `src/data/catalog.ts` gepflegt. Ein neuer
Kurs benötigt zusätzlich zu seinem Katalogeintrag eine tatsächliche Seite unter
`src/pages/`; erst danach soll er als verfügbar erscheinen. Die Fachübersichten
werden automatisch erzeugt. Leere Fächer dürfen keine fertigen Inhalte behaupten.

Jeder Kurs erhält einen eindeutigen Veröffentlichungsindex `addedOrder` (höher
als alle bisherigen), einen `shortTitle`, eine Bildunterschrift `artCaption`
und passende `highlights` mit Icon und Bezeichnung. Die Startseite wählt daraus
automatisch die fünf höchsten Indizes, unabhängig von der Reihenfolge im Katalog.
Bei einer einzigen Lernseite erscheint eine statische Vorschau ohne Steuerung;
bei einem leeren Katalog entfällt der Bereich.

Astro bildet die Dateien unter `src/pages/` auf URLs ab. Beispielsweise wird
`src/pages/mathematik/index.astro` unter `/mathematik/` erreichbar:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout title="Mathematik" description="Lernseiten zur Mathematik.">
  <h1>Mathematik</h1>
  <p>Hier beginnt die nächste Lernseite.</p>
</BaseLayout>
```

Gemeinsame Komponenten liegen unter `src/components/`.
Für textlastige Lernseiten unterstützt Astro auch Markdown in `src/pages/`.

Die Verwendung der Styles und Komponenten beschreibt
[Modern Classic als gemeinsames Theme](documentation/THEME.md).
Herkunft und Anpassungen der Optik-Seite sind im
[Importprotokoll](documentation/OPTIK_IMPORT.md) dokumentiert.
Die Übernahme von `index 2.html` ist im
[Mathematik-Importprotokoll](documentation/MATHE_IMPORT.md) beschrieben.

Interne Links und Dateien aus `public/` müssen den Basis-Pfad berücksichtigen:

```astro
<a href={`${import.meta.env.BASE_URL}mathematik/`}>Mathematik</a>
<img src={`${import.meta.env.BASE_URL}bilder/beispiel.svg`} alt="Beschreibung" />
```

Assets, die aus `src/` importiert werden, verarbeitet Astro selbst.

## GitHub Pages veröffentlichen

1. Im Repository **Settings → Pages → Build and deployment → Source** auf
   **GitHub Actions** setzen.
2. Unter **Custom domain** die Domain `edu.promptworks.eu` eintragen. Beim
   DNS-Anbieter einen CNAME für `edu` mit dem Ziel `codemaester.github.io.`
   (einschließlich abschließendem Punkt) setzen. Nach erfolgreicher DNS-Prüfung
   und Zertifikatsbereitstellung **Enforce HTTPS** aktivieren.
3. Die Projektdateien einschließlich `package-lock.json` committen und auf
   `main` pushen.
4. Unter **Actions → Deploy to GitHub Pages** den Workflow verfolgen.

Bei jedem Push auf `main` installiert der Build-Job die Abhängigkeiten mit
`npm ci`, führt die Unit-Tests und `npm run build` aus und lädt `dist/` als
Pages-Artefakt hoch.
Erst nach erfolgreichem Build veröffentlicht der Deploy-Job das Artefakt im
Environment `github-pages`. Zusätzliche Secrets und ein `gh-pages`-Branch sind
nicht erforderlich. Eventuelle Freigaberegeln des Environments gelten weiterhin.

Der Workflow kann auch manuell über **Run workflow** gestartet werden.
Veröffentlicht wird ausschließlich der Branch `main`.

Adresse nach erfolgreichem Deployment:
<https://edu.promptworks.eu/>.

`astro.config.mjs` setzt dazu `site: 'https://edu.promptworks.eu'`. Ohne eigenen
`base`-Wert liegt die Website direkt unter `/`. Bei einem Domainwechsel müssen
`site`, die Pages-Einstellungen und die dokumentierte Adresse angepasst werden.
Da über GitHub Actions veröffentlicht wird, ist keine `CNAME`-Datei im
Repository erforderlich; die Custom Domain wird in den Pages-Einstellungen
verwaltet.

## Veröffentlichung prüfen

```sh
npm ci
npm run test:unit
npm run build
npm run preview
```

Unter <http://localhost:4321/> prüfen:

- Startseite, Fachseiten und `/physik/optik/` sind erreichbar.
- Schriftdateien, Illustration, CSS und JavaScript laden ohne 404-Fehler.
- Simulationen, Kapitelmenü, Kapitelquiz und Gesamtabfrage funktionieren.
- Der Lernzettel ist erreichbar und lässt sich auf zwei A4-Seiten drucken.
- Ohne JavaScript bleiben Erklärungen, native Lernskizzen und der Lernzettel
  zugänglich. Die automatische Gesamtauswertung erklärt ihren JavaScript-Bedarf.

Für automatisierte Browserprüfungen einmal `npx playwright install chromium`
ausführen, danach nach jedem Produktionsbuild `npm run test:browser`.
Die Tests starten selbst einen lokalen Server für `dist/` und beenden ihn wieder.
Optional können mit `EDUCATION_SCREENSHOTS=/tmp/education-review` Bildschirmbilder
und das Druck-PDF gespeichert werden. `CHROMIUM_EXECUTABLE_PATH` erlaubt bei Bedarf
die Verwendung eines vorhandenen Chromium-Binaries.

Die Prüfungen umfassen fünf Bildschirmbreiten von 320 bis 1440 Pixeln,
Navigation, Aufgaben, Simulationen, Video-Player und A4-Druck. Externe Videoaufrufe
werden durch Testantworten ersetzt; die tatsächliche Verfügbarkeit der Videos
wird zusätzlich bei der Inhaltsprüfung kontrolliert.

Die Karussellprüfungen decken automatische und manuelle Wechsel, Neustart,
Fokus, Berührung, Hover, Tab-Sichtbarkeit, Scrollen aus dem Sichtbereich,
reduzierte Bewegung, stabile Höhen und den Betrieb ohne JavaScript ab.

Nach dem Push dieselben Schritte auf der veröffentlichten Website
prüfen. Erst ein erfolgreicher GitHub-Actions-Lauf und dieser Browsercheck
bestätigen den vollständigen Publishing-Prozess.

Referenz: [Astro auf GitHub Pages veröffentlichen](https://docs.astro.build/en/guides/deploy/github/).
