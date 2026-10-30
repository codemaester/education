# Education

Eine Sammlung verschiedener Lernseiten, gebaut mit [Astro](https://astro.build/)
und veröffentlicht über GitHub Actions auf GitHub Pages.

Die erste Seite zeigt **Hello World!** und einen Klickzähler als einfachen Test
für das ausgelieferte HTML, CSS und JavaScript.

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
| `npm run build` | Prüfung und Produktionsbuild nach `dist/` |
| `npm run preview` | Vorschau des zuvor erstellten Produktionsbuilds |

## Repository-Struktur

```text
.github/workflows/deploy.yml  Build und GitHub-Pages-Deployment
public/                       Unverändert kopierte Dateien, z. B. Favicon
src/layouts/BaseLayout.astro  HTML-Rahmen, Metadaten, Kopf- und Fußzeile
src/pages/index.astro         Startseite mit Hello World und Klickzähler
src/styles/global.css        Gemeinsame Styles
astro.config.mjs              Statischer Build, Domain und Basisverzeichnis
PRODUCT.md                    Bestätigter Projektumfang
```

`package-lock.json` wird versioniert. Generierte Verzeichnisse wie `dist/`,
`.astro/` und `node_modules/` werden nicht eingecheckt.

## Weitere Lernseiten hinzufügen

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

Gemeinsame Komponenten können bei Bedarf unter `src/components/` entstehen.
Für textlastige Lernseiten unterstützt Astro auch Markdown in `src/pages/`.

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
`npm ci`, führt `npm run build` aus und lädt `dist/` als Pages-Artefakt hoch.
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
npm run build
npm run preview
```

Unter <http://localhost:4321/> prüfen:

- „Hello World!“ und die Styles werden angezeigt.
- Favicon, CSS und das JavaScript-Modul laden ohne 404-Fehler.
- „Weiterzählen“ ist aktiviert und erhöht den Wert mit jedem Klick.
- Ohne JavaScript bleibt die Seite lesbar; der Zähler ist deaktiviert und ein
  Hinweis wird angezeigt.

Nach dem ersten Push dieselben Schritte auf der veröffentlichten Website
prüfen. Erst ein erfolgreicher GitHub-Actions-Lauf und dieser Browsercheck
bestätigen den vollständigen Publishing-Prozess.

Referenz: [Astro auf GitHub Pages veröffentlichen](https://docs.astro.build/en/guides/deploy/github/).
