# Quadratwurzeln: Sicher rechnen

Lernseite: `/mathematik/quadratwurzeln/` · Lernzettel:
`/mathematik/quadratwurzeln/lernzettel/` · Klasse 9 Gymnasium.

## Aufbau und Lernziele

Der Quadratzahlen-Trainer bleibt als Grundlagenbereich erhalten. Die sechs
Lernkapitel bauen aufeinander auf:

1. **Wurzelgesetze:** Produkt, Quotient, Voraussetzungen, Betrag bei √(x²),
   Abgrenzung von Summen und Differenzen.
2. **Teilweises Wurzelziehen:** größter quadratischer Teiler, vollständige
   Vereinfachung und quadratfreier Rest.
3. **Faktoren unter die Wurzel bringen:** Vorfaktor quadrieren, Minus außen
   behalten und positive Terme vergleichen.
4. **Wurzelsummen:** zuerst vereinfachen, dann gleichartige Terme mit ihren
   Vorzeichen addieren oder subtrahieren.
5. **Intervallschachtelung:** Grenzen durch Quadrieren prüfen, dezimal
   verfeinern, Eingrenzen von Runden unterscheiden.
6. **Wurzeln von Wurzeln:** von innen nach außen rechnen, vierte und achte
   Wurzel, Unterscheidung vom Produkt zweier Wurzeln.

Jedes Kapitel bietet Einstiegsfrage, Lernziel, eigenständige Erklärung,
Schrittfolge, typische Fehler, ein interaktives Beispiel und fünf Aufgaben.
Eine eigene Gesamtabfrage enthält zwölf neue Aufgaben (zwei pro Kapitel),
darunter Anwendungen und Verknüpfungen mehrerer Regeln. Die Navigation zeigt
den aktuellen Kapitelbereich an. Alle Kapitel besitzen stabile Sprungmarken.

## Freie Eingabe und Auswertung

Keine Multiple-Choice-Aufgaben. Zahlenfelder akzeptieren Komma und Punkt.
Ergebnisse a√b werden als Vorfaktor und Radikand eingegeben; die Darstellung
muss vollständig vereinfacht sein. Ein Vorfaktor 1 wird ausdrücklich eingegeben.
Negative Ergebnisse haben ein für Minuszeichen geeignetes Texteingabefeld;
sonst wird die Dezimaltastatur angefordert. Es wird kein Ausdruck ausgewertet
und kein `eval` eingesetzt.

Die Prüfung erfolgt je Kapitel oder gemeinsam für die Gesamtabfrage. Sie
unterscheidet beantwortet, selbstständig richtig, falsch/offen und mit
Musterlösung bearbeitet. Das Öffnen einer Lösung markiert die Aufgabe für die
laufende Runde als bearbeitet mit Hilfe; sie zählt dann nicht als selbstständig
richtig. „Neu versuchen“ setzt Felder, Markierungen, Lösungen und Ergebnis
zurück. Die Gesamtabfrage empfiehlt Kapitel für offene, falsche und aufgedeckte
Aufgaben. Ihre Ergebnisse bleiben von den Kapitelübungen getrennt.

Es werden keine Konten oder dauerhafte Speicherung verwendet. Alle Stände
bleiben in der Sitzung und gehen beim Neuladen verloren. Erklärungen,
Beispiele, Musterlösungen und Lernzettel sind ohne JavaScript zugänglich;
Prüfbuttons und die veränderbaren Werkzeuge benötigen JavaScript.

## Quadratzahlen-Trainer

- Gemischt: alle 40 Aufgaben zu 1²…20² und den entsprechenden Wurzeln.
- Einzelrichtungen: jeweils 20 Aufgaben; Teilbereiche 1–10 und 11–20 möglich.
- Jede Runde mischt den vollständigen gewählten Aufgabenbestand.
- Freie Zifferneingabe, mobile Zahlentastatur und optionales Ziffernfeld.
- Enter prüft und führt nach der Rückmeldung zur nächsten Aufgabe.
- Falsche/aufgedeckte Aufgaben folgen hinter bis zu drei anderen Aufgaben
  erneut, bis sie richtig abgerufen wurden.
- „Sicher“ zählt unterschiedliche richtig gelöste Aufgaben; „Direkt richtig“
  den Erfolg beim ersten Auftreten; Fehler/Aufdecken zählen Versuche.
- Neue Runde übernimmt Einstellungen und setzt den Stand zurück.

## Mathematik und Druck

`roots-math.ts` zerlegt ganzzahlige Radikanden exakt. Die Intervallschachtelung
berechnet ihre Grenzen und deren Quadrate mit skalierten ganzen Zahlen (`BigInt`),
nicht durch gerundete Fließkomma-Näherungen. Sonderfälle für Quadratzahlen
und 0 werden durch eine Intervallbreite 0 dargestellt; die interaktive Auswahl
enthält Nichtquadratzahlen, für die strikte Ungleichungen gelten.

Der Lernzettel ist als drei A4-Seiten angelegt: Grundlagen/Tabelle und Kapitel
1–2, Kapitel 3–4 mit einer verbundenen Beispielrechnung, Kapitel 5–6 mit
Intervalltabelle und Ergebniskontrolle. Gemeinsame Kapitel-Metadaten halten
Zusammenfassungen und Kernbeispiele konsistent. Der Druckbutton und die normale
Browser-Druckfunktion funktionieren. Die Druckansicht ist weiß und auch in
Graustufen lesbar.

## Quellen und Medien

Texte, Aufgaben und Werkzeuge sind eigenständig erstellt. Fachliche Referenzen:
ARD alpha „Wurzelgesetze“ (1–4), Landesbildungsserver Baden-Württemberg
„Näherungsverfahren“ (5), Matheretter G21-2 (6). Direkte Links stehen auf der
Lernseite; eine Quellenzeile steht auf dem Lernzettel.

Abweichung von der SOLL-Empfehlung für Videos im gemeinsamen Lernseitenstandard:
Diese Erweiterung enthält vorerst keine eingebetteten Videos. Der direkte
YouTube-Abruf war bei der Quellenprüfung nicht möglich; aktuelle Abspielbarkeit
und vollständige Kapitelabdeckung konnten nicht bestätigt werden. Alle
Erklärungen sind eigenständig und durch interaktive Beispiele ergänzt.

## Prüfung

- `npm run test:unit`: sämtliche Unit-Tests inklusive Faktorisierung,
  exakter Intervallgrenzen und Quadrierung, Antwortregeln, Aufgabenabdeckung.
- `npm run build`: Astro-/TypeScript-Prüfung und statischer Build.
- `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:roots`: gezielte
  Browserprüfung der neuen Kapitel plus vollständige Runden des vorhandenen
  Quadratzahlen-Trainers bei 1440, 768, 390 und 320 Pixeln.
- `EDUCATION_SCREENSHOTS=<Verzeichnis>` speichert Kapitelaufnahmen und das
  Lernzettel-PDF. Der Test prüft drei tatsächliche A4-Seiten.
- Die neuen Kapitelprüfungen sind zusätzlich in `npm run test:browser` integriert.
