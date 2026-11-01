# Education

Statische Website mit Astro und TypeScript.

## Lokal entwickeln

Voraussetzungen: Node.js 24 (siehe `.nvmrc`) und npm. Mit optional installiertem
`nvm` lässt sich die passende Node-Version auswählen:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Ohne `nvm` genügt eine installierte Node-24-Version. Der Entwicklungsserver ist
unter <http://localhost:4321/> erreichbar.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit automatischem Neuladen |
| `npm run check` | Astro und TypeScript prüfen |
| `npm run test:unit` | Unit-Tests ausführen |
| `npm run build` | Prüfung und statischer Build nach `dist/` |
| `npm run preview` | Den erstellten Build lokal ansehen |
| `npm run test:browser` | Den erstellten Build mit Chromium prüfen |

Für die Browsertests einmal Chromium installieren und anschließend bauen:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

Die Browsertests starten und beenden ihren lokalen Testserver selbst.
Mit `CHROMIUM_EXECUTABLE_PATH` kann ein vorhandenes Chromium verwendet werden.

## Repository-Struktur

```text
public/             Statische Dateien
src/assets/         Verarbeitete Bild- und Mediendateien
src/components/     Wiederverwendbare Komponenten
src/content/        Inhaltsdateien
src/data/           Daten und fachliche Berechnungen
src/layouts/        Gemeinsame Seitenrahmen
src/pages/          Seiten und Routen
src/scripts/        Interaktive Funktionen
src/styles/         Gestaltung und Druckansichten
tests/              Unit- und Browsertests
documentation/      Projekt- und Entwicklungsdokumentation
astro.config.mjs    Astro-Konfiguration
package.json        Abhängigkeiten und Entwicklungsbefehle
```

`package-lock.json` wird versioniert. Generierte Verzeichnisse wie `dist/`,
`.astro/` und `node_modules/` werden nicht eingecheckt.

## Latein-Vokabeltrainer

Unter `/sprachen/latein/vokabeltrainer/` lassen sich lateinische Wörter deutschen Bedeutungen zuordnen. Die [Trainer-Dokumentation](documentation/LATEIN_TRAINER.md) beschreibt Datenübernahme, Ablauf, Zugänglichkeit und die Begrenzungen der ersten Iteration.
