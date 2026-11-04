---
target: Kompletter Latein-Vokabeltrainer mit allen sechs Trainern
total_score: 30
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
target_identity: "file:/workspace/education/src/pages/sprachen/latein/vokabeltrainer/index.astro"
target_fingerprint: "sha256:434fe7561560bc1c31e31b22ca2972de95d64679035b9d92f267de030243ed06"
target_path: /workspace/education/src/pages/sprachen/latein/vokabeltrainer/index.astro
timestamp: 2026-11-04T21-53-25Z
slug: prachen-latein-vokabeltrainer-index-astro-99d67153
closed: true
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review), ergänzt durch Browserprüfungen des Hauptagenten.

# Impeccable-Prüfung: gesamter Latein-Vokabeltrainer

Stand: 4. November 2026, Commit `ceab1ef`. Ziel: `src/pages/sprachen/latein/vokabeltrainer/index.astro`, einschließlich Einstellungen, Lernstand und aller sechs Trainer. Verwendet: Impeccable 4.8.0, Audit und Critique. Prüfung und Bericht, keine Änderungen an der Benutzeroberfläche.

## Urteil

**Die Gestaltung ist produktspezifisch und stimmig; die geprüften Trainingsabläufe funktionieren.** Papier, Waldgrün, Terrakotta, Newsreader und Manrope sowie die bebilderten Trainingsmodi passen zum verbindlichen Modern-Classic-System. Ein grundlegender visueller Umbau ist nicht begründet. Den größten Nutzen bringen bessere Schriftvergrößerung und kürzere Bedienwege auf kleinen Bildschirmen.

**Technisches Audit: 15/20 – gut, mit gezieltem Verbesserungsbedarf. UX-Bewertung: 30/40 – gut.** Die Bewertungen sind fachliche Einschätzungen, keine Zertifizierung. Fünf priorisierte Befunde: **0 P0, 1 P1, 4 P2, 0 P3**. Kein blockierender Ablaufdefekt in den ausgeführten Tests.

## Prüfumfang und Ergebnisse

| Trainer | Tatsächlich geprüft | Ergebnis |
|---|---|---|
| Wörter zuordnen | Vollständige Durchgänge und Runden, falsche/richtige Paare, Auswahl aufheben, Tastatur, Ergebnisse, Neustart und Abbruch; 320/390/768/1024/1440 px | Bestanden. Die Bezeichnung der Schwierigkeit kann die tatsächliche Paarzahl überschätzen: Befund 4. |
| Stammformen-Werkstatt | Freie Eingabe und vorgegebene Antworten, leere Antworten, Hinweise, Auflösung, Selbstbewertung, Wiederholungen, Speicherung, Neustart; 320/390/1440 px | Bestanden. Lange Auswahlaufgaben auf Mobilgeräten: Befund 2. |
| Formen-Detektiv | Beide Antwortarten, zwölf Infinitivoptionen, Kontextübersetzung, Stammformen, Rückmeldungen und Wiederholungen; 320/390/1440 px | Bestanden. Größter Navigationsaufwand zwischen Frage und Auswertung: Befund 2. |
| Vokabelkarten | Vorder-/Rückseite, Quelllösungen, Tastatur, Touch, wiederholte Runden, Abschluss, Neustart und Moduswechsel; 320/390/1440 px | Bestanden. Die unbegrenzte Wiederholung falsch bewerteter Karten ist beabsichtigt und erklärt. |
| Fehlerjagd und Verwechslungsduell | Beide Antwortarten, richtige und falsche Aussagen, Bewertung, Anschlussabruf, Wiederholungen und Ergebnis; 320/390/1440 px | Bestanden. Mehrfeldrige Auswahlschritte betreffen ebenfalls Befund 2. |
| Vokabel-Parcours | Beide Antwortarten, drei Etappen, Zusatzangaben, gemischte Wiederholung, begrenzte Fehlerwiederholungen und Abschluss; 320/390/1440 px | Bestanden. Gemeinsame Befunde zu Auswahlwegen und Lernstand gelten hier ebenfalls. |

Zusätzlich geprüft: Filter und leere Pakete, reduzierte Bewegung, unterbrochene Modusanimation, Start während der Animation, defekte/gesperrte Browserspeicherung, Neuladen und Löschen des Lernstands sowie der Hinweis ohne JavaScript. Die 15 kuratierten Detektivfälle und zehn Fehlerjagd-Fälle wurden im Quelltext durchgesehen. Das ersetzt keine vollständige fachwissenschaftliche Prüfung aller 955 Wörter und sämtlicher möglicher Distraktorkombinationen.

## Priorisierte Befunde

### 1. [P1] Textvergrößerung führt zu Überläufen und abgeschnittenen Inhalten

**Reproduktion:** Im Browser bei 320 oder 768 CSS-Pixeln `html { font-size: 200% }` setzen; einen beliebigen Trainer auswählen und Einstellungen sowie Training betrachten. Dies simuliert eine reine Schriftvergrößerung, keinen echten Browser-Zoom.

Bei 320 px wächst die Dokumentbreite auf rund **448 px**, bei 768 px auf **875 px**. Im Seitenkopf überläuft die Marke beziehungsweise die Navigation. Bei 320 px sind zusätzlich Erklärtext im begrenzten Moduscontainer und Beschriftungen der Einstellungen abgeschnitten beziehungsweise überlagert. Das betrifft den gemeinsamen Einstieg aller sechs Modi. In den 36 geprüften Konfigurations-/Trainingszuständen waren 1440 px unauffällig.

**Quelle:** `src/styles/base.css:30` und `:62` (Kopf/Marke), `src/styles/latin.css:63` (begrenzter Moduscontainer), `:169` (drei feste Schwierigkeitsspalten), `:176` (nicht umbrechende Mengenkopfzeile).

**Auswirkung:** Lernende mit vergrößerter Schrift können Anweisungen und Einstellungen nicht vollständig lesen. Relevante Prüfkriterien sind WCAG 1.4.4 und 1.4.10; für eine abschließende Konformitätsaussage ist zusätzlich echter Browser-Zoom zu prüfen.

**Empfehlung:** Kopf und Einstellungsgruppen nach verfügbarem Platz umbrechen lassen, minimale Inhaltsbreiten abbauen und vergrößerten Text nicht abschneiden. Abnahme bei 320/768 px und vergrößerter Schrift einschließlich sichtbarer Fokusrahmen. Passender Befehl: `$impeccable adapt`.

**Belege:** `.impeccable/review/audit-2026-11-04-extra/zoom.json`, `zoom-detail.json`, `text-200-320.png`, `text-200-768.png`.

### 2. [P2] Mobile Auswahlaufgaben trennen Frage, Antworten und Aktionen durch lange Scrollwege

**Reproduktion:** Formen-Detektiv mit „Vorgegeben“ bei 390 oder 320 px starten. Die Aufgabe kann zwölf Infinitive plus jeweils zehn Antworten für Kontextübersetzung und drei Stammformen anzeigen: zusammen **52 Antwortschaltflächen**. Alle Gruppen stehen untereinander; „Antwort prüfen“, Hinweise und Auflösung folgen erst am Ende.

Bereits zehn Optionen benötigen bei 48 px Mindesthöhe und neun 8-px-Abständen mindestens **552 px je Feld**, zwölf Optionen mindestens **664 px** – ohne Überschriften und Gruppenabstände. Die gerenderte Aufnahme bestätigt die sehr lange Gesamtaufgabe. Werkstatt, Fehlerjagd und Parcours sind bei mehreren Feldern ebenfalls betroffen.

**Quelle:** `src/styles/latin.css:105`, `:108`, `:123`; `src/pages/sprachen/latein/vokabeltrainer/index.astro:87`; dynamische Felder in `src/scripts/latin-learning.ts:235`.

**Auswirkung:** Am Ende sind Satz und Ausgangsform weit entfernt; Lernende müssen zwischen Kontext, Auswahlen und Aktionen zurückscrollen. Tastaturnutzer durchlaufen entsprechend viele einzelne Schaltflächen. Die Aufgabe bleibt lösbar, daher P2 statt P1.

**Empfehlung:** Die ausdrücklich gewünschten zehn beziehungsweise zwölf Lernalternativen erhalten. Stattdessen Kontext sichtbar halten und Felder schrittweise bearbeitbar machen oder gezielte Navigation zwischen Antwortgruppen anbieten. Keine schwebenden Bedienelemente, die Antworten oder Fokus verdecken. Passende Befehle: `$impeccable layout`, `$impeccable adapt`.

**Beleg:** `.impeccable/review/audit-2026-11-04-flows/selection-detective-390.png`.

### 3. [P2] Bekannte Trainer verlangen erneut den Weg durch die große Moduserklärung

**Reproduktion:** Einen Modus auswählen. Das Bild wird vergrößert, drei Erklärabsätze erscheinen, und erst dahinter folgen Einstellungen und Start. Auf kleinen Bildschirmen verwendet das aufgeklappte Bild zusätzlich ein höheres 4:3-Format. Für wiederkehrende Lernende gibt es keinen deutlich angebotenen Sprung zu den Einstellungen.

**Quelle:** `src/scripts/latin-learning.ts:67`, `:87`; `src/styles/latin.css:88`, `:129`; `src/data/latin-learning.ts:9`.

**Auswirkung:** Die ausführliche, für den ersten Besuch hilfreiche Erklärung verlängert auch den Einstieg in eine kurze Fünf-Wörter-Runde. Das ist eine Bedienverbesserung, keine Abweichung vom dokumentierten Aufklappverhalten.

**Empfehlung:** Illustration und ausführliche Erklärung erhalten, aber nach der Auswahl einen klaren, tastaturbedienbaren Weg „Zu den Einstellungen“ oder eine kompakte Ansicht für wiederkehrende Nutzer anbieten. Passender Befehl: `$impeccable distill`.

**Beleg:** `.impeccable/review/audit-2026-11-04-flows/expanded-workshop-390.png`.

### 4. [P2] „Schwer · 10 Paare“ kann tatsächlich nur fünf Paare starten

**Reproduktion:** „Wörter zuordnen“ wählen, die Standardmenge fünf Wörter beibehalten und „Schwer · 10 Paare“ auswählen. Training starten. Ergebnis: fünf lateinische Karten, fünf Übersetzungen und „0 von 5 gelöst“.

**Quelle:** `src/pages/sprachen/latein/vokabeltrainer/index.astro:50`; `src/data/latin.ts:63`; `src/scripts/latin.ts:101`.

**Auswirkung:** Eine Änderung von „Leicht“ auf „Schwer“ hat unter dieser Kombination keinen sichtbaren Einfluss auf die Paarzahl. Die Gesamtmenge wird korrekt eingehalten, aber die Beschriftung verspricht mehr als angezeigt wird.

**Empfehlung:** „Bis zu 10 Paare pro Runde“ und die tatsächliche Paarzahl anzeigen oder die Abhängigkeit zur Gesamtmenge ausdrücklich erklären. Die unabhängig gewählte Wortanzahl nicht stillschweigend verändern. Passender Befehl: `$impeccable clarify`.

### 5. [P2] Korrekte Auswahlantworten erscheinen gemeinsam mit echten Fehlern als „unsicher“

**Reproduktion:** Ein bisher ungeübtes Wort mit vorgegebenen Antworten richtig lösen, danach den Lernstand ansehen. Auswahlantworten werden absichtlich als unterstützt gespeichert und erhöhen die freie Abrufserie nicht. `progressSummary` zählt aber jeden Stand mit `streak === 0` als unsicher – auch einen richtigen ersten Auswahlversuch.

**Quelle:** `src/scripts/latin-learning.ts:286`, `:130`; `src/data/latin-learning.ts:84`, `:94`, `:169`.

**Auswirkung:** Die didaktisch sinnvolle Unterscheidung zwischen Wiedererkennen und freiem Abruf wird im Sammelbegriff „unsichere Angaben“ als Fehlerergebnis lesbar. Das kann eine richtige Antwort unnötig entwerten und macht persönliche Filter weniger eindeutig.

**Empfehlung:** Im Lernstand „mit Hilfe geübt / noch nicht frei bestätigt“ von „falsch beantwortet“ unterscheiden oder die Zusammenfassung entsprechend erläutern. Die zurückhaltende Wiederholungsplanung für unterstützte Antworten beibehalten. Passender Befehl: `$impeccable clarify`.

## Bewertungen

| Technische Dimension | Punkte / 4 | Begründung |
|---|---:|---|
| Barrierefreiheit | 3 | Beschriftungen, Tastatur, Rückmeldungen und reduzierte Bewegung gut; Textvergrößerung braucht Nacharbeit. |
| Performance | 3 | Statisches Astro-Build, responsive Bilder und lokale Schriften; Latein-JavaScript ca. 270 kB unkomprimiert inklusive Wortschatz. Kein belastbarer Test auf einem langsamen realen Mobilgerät. |
| Theming | 4 | Kohärentes vorhandenes Farbsystem; lokale Karteikartenmaterialien sind bewusste Ausnahmen. Ein Dunkelmodus ist nicht Produktanforderung. |
| Responsive Darstellung | 2 | Reguläre Breiten und synthetisierte Touch-Bedienung bestehen; Textvergrößerung und lange mobile Auswahlwege bleiben schwach. |
| Implementierungsintegrität | 3 | Kohärente Lernmechanik und keine Quell-Detektorbefunde; einzelne Begriffe bilden den tatsächlichen Zustand nicht präzise ab. |
| **Gesamt** | **15/20** | **Gut; gezielte Verbesserungen statt Neugestaltung.** |

| Nielsen-Heuristik | Punkte / 4 | Einordnung |
|---|---:|---|
| Sichtbarkeit des Systemstatus | 3 | Fortschritt und Rückmeldungen vorhanden; unterstütztes Üben missverständlich zusammengefasst. |
| Übereinstimmung mit der Lernwelt | 4 | Fachlich passende Aufgaben, Formen und vertraute Begriffe. |
| Kontrolle und Freiheit | 3 | Auswahl aufheben, abbrechen, neu starten; laufende Sitzungen werden nicht wiederhergestellt. |
| Konsistenz und Standards | 4 | Gemeinsame Navigation, Bedienelemente und visuelle Sprache. |
| Fehlervermeidung | 3 | Gute Validierung und Standardantworten; Schwierigkeit und Gesamtmenge können widersprüchlich wirken. |
| Wiedererkennen statt Erinnern | 3 | Hilfen und sichtbare Alternativen; auf langen Aufgaben verschwindet der Kontext aus dem Blick. |
| Flexibilität und Effizienz | 2 | Tastatur/Touch vorhanden; viele einzelne Auswahlstopps und wiederkehrende Einstiegswege. |
| Ästhetische Klarheit | 2 | Stimmige Identität, aber große Erklärblöcke und lange Auswahlgruppen vor den Aktionen. |
| Fehler erkennen und beheben | 3 | Lokale Meldungen, Lösungen und begrenzte Wiederholungen. |
| Hilfe und Dokumentation | 3 | Zweckbezogene Erklärungen und Hinweise; für wiederkehrende Nutzer nicht kompakt genug erreichbar. |
| **Gesamt** | **30/40** | **Gut. Alle zehn Heuristiken wurden bewertet.** |

Die unabhängige Designbewertung war zunächst quellenbasiert und vorläufig; der Hauptagent hat die zentralen Darstellungsaussagen mit Browseraufnahmen und Interaktionen abgeglichen. Die Punktzahlen bleiben eine qualitative Momentaufnahme.

## Was erhalten bleiben sollte

- Eigenständige, passende Modern-Classic-Gestaltung und klar unterscheidbare Lernmechanismen.
- Rückmeldungen als Text statt nur Farbe; mindestens 48 px hohe Antwortoptionen; sichtbarer Fokus; bewusst behandelte reduzierte Bewegung.
- Getrennte Lernstände für Bedeutungen und Formen, vorsichtige Bewertung von Auswahlhilfen und Selbstbewertung sinngemäßer deutscher Antworten.
- Robuste Fortsetzung bei nicht verfügbarer Speicherung und begrenzte Wiederholungen in den vier Aufgabenmodi.

## Nutzerperspektiven und kognitive Last

- **Mobile, unterbrochene Nutzung:** Mehrfeldrige Auswahlaufgaben verlangen häufige Wege zwischen Kontext und Antworten. Bereits bewerteter Lernstand bleibt erhalten; ein laufender Durchgang wird nach Neuladen nicht fortgesetzt.
- **Tastatur und große Schrift:** Grundabläufe sind bedienbar. Die vielen Tabstopps der Auswahlgruppen und der belegte Textüberlauf erschweren diese Nutzung.
- **Erster Besuch / Wiederkehr:** Die Erklärung vermittelt den Zweck gut; für wiederkehrende Nutzer bleibt der Weg zum Start unnötig lang. „Unsicher“ sollte unterstütztes richtiges Üben genauer einordnen.

Die sechs Modusoptionen und zehn beziehungsweise zwölf fachlichen Antwortalternativen sind bewusst gewählte Produktanforderungen. Ihre bloße Anzahl ist kein eigenständiger Fehler. Die priorisierten Probleme betreffen Kontext, Bedienwege und verständliche Statusangaben.


Prüfbelege: Unit-Tests, Astro-Build und fokussierte Latein-Browserprüfungen erfolgreich; 52 zusätzliche axe-Zustände ohne automatisch bestätigte Verstöße. Impeccable-Quellscan: [] (nur Astro-Markup). Schriftvergrößerung und mobile Bedienwege separat im Hauptagentenbrowser geprüft.

## Anschlussfragen

1. Zuerst Schriftvergrößerung/Barrierefreiheit oder kürzere mobile Bedienwege?
2. Die drei wichtigsten Befunde oder alle fünf umsetzen?
