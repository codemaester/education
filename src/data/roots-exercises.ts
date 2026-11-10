export type RootField = { label: string; answer: number; signed?: boolean };
export type RootExercise = { id: string; chapter: string; goal: string; prompt: string; fields: RootField[]; solution: string; explanation: string };
const number = (answer: number, label = 'Ergebnis'): RootField[] => [{ label, answer, signed: answer < 0 }];
const term = (factor: number, rest: number): RootField[] => [{ label: 'Vorfaktor a (mit Vorzeichen)', answer: factor, signed: factor < 0 }, { label: 'Radikand b', answer: rest }];
const interval = (lower: number, upper: number): RootField[] => [{ label: 'Untere Grenze', answer: lower }, { label: 'Obere Grenze', answer: upper }];
function task(id: string, chapter: string, goal: string, prompt: string, fields: RootField[], solution: string, explanation: string): RootExercise {
  return { id, chapter, goal, prompt, fields, solution, explanation };
}
export const chapterExercises: RootExercise[] = [
  task('law-1','wurzelgesetze','Produktregel anwenden','Berechne √12 · √3.',number(6),'6','√12 · √3 = √36 = 6.'),
  task('law-2','wurzelgesetze','Quotientenregel anwenden','Berechne √98 / √2.',number(7),'7','√(98 / 2) = √49 = 7. Der Nenner ist positiv.'),
  task('law-3','wurzelgesetze','Summen unterscheiden','Berechne √(9 + 16).',number(5),'5','Zuerst 9 + 16 = 25 rechnen, dann √25 = 5. Nicht einzeln die Wurzeln addieren.'),
  task('law-4','wurzelgesetze','Betrag beachten','Berechne √((−8)²).',number(8),'8','(−8)² = 64 und √64 = 8. Eine Quadratwurzel ist nichtnegativ.'),
  task('law-5','wurzelgesetze','Produkt und Quotient kombinieren','Berechne (√6 · √24) / √9.',number(4),'4','√144 / 3 = 12 / 3 = 4.'),
  task('extract-1','teilweises-wurzelziehen','Quadratischen Teiler finden','Vereinfache √48 vollständig zu a√b.',term(4,3),'4√3','48 = 16 · 3. Also √48 = 4√3.'),
  task('extract-2','teilweises-wurzelziehen','Vollständig vereinfachen','Vereinfache √72 vollständig zu a√b.',term(6,2),'6√2','72 = 36 · 2. 3√8 wäre noch nicht vollständig vereinfacht.'),
  task('extract-3','teilweises-wurzelziehen','Größten quadratischen Teiler nutzen','Vereinfache √200 vollständig zu a√b.',term(10,2),'10√2','200 = 100 · 2. Die Wurzel aus 100 ist 10.'),
  task('extract-4','teilweises-wurzelziehen','Quadratfaktor erkennen','Vereinfache √147 vollständig zu a√b.',term(7,3),'7√3','147 = 49 · 3. Deshalb kommt 7 vor die Wurzel.'),
  task('extract-5','teilweises-wurzelziehen','Quadratfreie Zahl erkennen','Schreibe √30 vollständig vereinfacht als a√b.',term(1,30),'1√30 = √30','30 = 2 · 3 · 5 enthält keinen quadratischen Teiler größer als 1. Der Vorfaktor ist 1.'),
  task('insert-1','faktoren-in-die-wurzel','Vorfaktor quadrieren','Schreibe 3√5 als √n. Bestimme n.',number(45,'Radikand n'),'√45','3² · 5 = 9 · 5 = 45.'),
  task('insert-2','faktoren-in-die-wurzel','Umkehrung anwenden','Schreibe 5√2 als √n. Bestimme n.',number(50,'Radikand n'),'√50','5² · 2 = 25 · 2 = 50.'),
  task('insert-3','faktoren-in-die-wurzel','Minus außen behalten','Schreibe −4√3 als −√n. Bestimme n.',number(48,'Radikand n'),'−√48','Das Minus bleibt außen. Nur der Betrag des Vorfaktors wandert quadriert hinein: 4² · 3 = 48.'),
  task('insert-4','faktoren-in-die-wurzel','Dezimalen Vorfaktor quadrieren','Schreibe 0,5√8 als √n. Bestimme n.',number(2,'Radikand n'),'√2','0,5² · 8 = 0,25 · 8 = 2.'),
  task('insert-5','faktoren-in-die-wurzel','Positive Terme vergleichen','Welcher Radikand ist größer: der von 3√7 = √63 oder der von 4√5 = √80? Gib die größere Zahl unter der Wurzel ein.',number(80,'Größerer Radikand'),'80','3² · 7 = 63 und 4² · 5 = 80. Also ist 4√5 der größere Wurzelterm.'),
  task('sum-1','wurzelsummen','Gleichartige Terme addieren','Fasse 3√5 + 2√5 vollständig zu a√b zusammen.',term(5,5),'5√5','Nur die Vorfaktoren addieren: (3 + 2)√5.'),
  task('sum-2','wurzelsummen','Zuerst Wurzeln vereinfachen','Fasse √8 + √18 vollständig zu a√b zusammen.',term(5,2),'5√2','√8 = 2√2 und √18 = 3√2. Zusammen ergibt das 5√2.'),
  task('sum-3','wurzelsummen','Subtrahieren und vereinfachen','Fasse √75 − √12 vollständig zu a√b zusammen.',term(3,3),'3√3','5√3 − 2√3 = 3√3.'),
  task('sum-4','wurzelsummen','Vorzeichen beachten','Fasse 3√2 − 5√2 vollständig zu a√b zusammen.',term(-2,2),'−2√2','Die Vorfaktoren ergeben 3 − 5 = −2. Das Minus bleibt im Ergebnis.'),
  task('sum-5','wurzelsummen','Aufhebung erkennen','Berechne √50 − 5√2.',number(0),'0','√50 = 5√2. Daher 5√2 − 5√2 = 0.'),
  task('interval-1','intervallschachtelung','Ganze Grenzen finden','Grenze √20 zwischen zwei benachbarten ganzen Zahlen ein.',interval(4,5),'4 < √20 < 5','4² = 16 < 20 < 25 = 5².'),
  task('interval-2','intervallschachtelung','Zehntelgrenzen prüfen','Grenze √7 zwischen benachbarten Zehnteln ein.',interval(2.6,2.7),'2,6 < √7 < 2,7','2,6² = 6,76 und 2,7² = 7,29.'),
  task('interval-3','intervallschachtelung','Hundertstelgrenzen bestimmen','Grenze √5 zwischen benachbarten Hundertsteln ein.',interval(2.23,2.24),'2,23 < √5 < 2,24','2,23² = 4,9729 < 5 < 5,0176 = 2,24².'),
  task('interval-4','intervallschachtelung','Korrekt runden','Runde √7 auf zwei Nachkommastellen. Nutze 2,645 < √7 < 2,646.',number(2.65),'2,65','Die dritte Nachkommastelle ist 5. Die Hundertstelstelle wird aufgerundet.'),
  task('interval-5','intervallschachtelung','Intervallbreite bestimmen','Wie breit ist das Intervall von 2,645 bis 2,646?',number(0.001,'Intervallbreite'),'0,001','Obere Grenze minus untere Grenze: 2,646 − 2,645 = 0,001.'),
  task('nested-1','wurzeln-von-wurzeln','Von innen nach außen rechnen','Berechne √(√81).',number(3),'3','Zuerst √81 = 9, dann √9 = 3.'),
  task('nested-2','wurzeln-von-wurzeln','Vierte Wurzel berechnen','Berechne √(√625).',number(5),'5','√625 = 25, dann √25 = 5. Kontrolle: 5⁴ = 625.'),
  task('nested-3','wurzeln-von-wurzeln','Produkt und Verschachtelung unterscheiden','Berechne √16 · √16.',number(16),'16','Das ist ein Produkt, keine verschachtelte Wurzel: 4 · 4 = 16.'),
  task('nested-4','wurzeln-von-wurzeln','Dezimale Radikanden verstehen','Berechne √(√0,0016).',number(0.2),'0,2','Die innere Wurzel ist 0,04. Die Wurzel daraus ist 0,2.'),
  task('nested-5','wurzeln-von-wurzeln','Mehrfaches Wurzelziehen','Berechne √(√(√256)).',number(2),'2','Von innen: √256 = 16, √16 = 4, √4 = 2. Kontrolle: 2⁸ = 256.'),
];
export const finalExercises: RootExercise[] = [
  task('final-law-1','wurzelgesetze','Wurzelgesetze kombinieren','Berechne (√15 · √60) / √25.',number(6),'6','√900 / 5 = 30 / 5 = 6.'),
  task('final-law-2','wurzelgesetze','Nichtnegative Wurzel beachten','Berechne √((−11)²).',number(11),'11','√121 = 11. Allgemein gilt √(x²) = |x|.'),
  task('final-extract-1','teilweises-wurzelziehen','Vollständig vereinfachen','Vereinfache √108 vollständig zu a√b.',term(6,3),'6√3','108 = 36 · 3, also √108 = 6√3.'),
  task('final-extract-2','teilweises-wurzelziehen','Vereinfachung übertragen','Vereinfache √245 vollständig zu a√b.',term(7,5),'7√5','245 = 49 · 5. Ziehe die Wurzel aus 49.'),
  task('final-insert-1','faktoren-in-die-wurzel','Negative Vorfaktoren behandeln','Schreibe −6√2 als −√n. Bestimme n.',number(72,'Radikand n'),'−√72','6² · 2 = 72. Das Minus bleibt außerhalb.'),
  task('final-insert-2','faktoren-in-die-wurzel','Flächenmodell übertragen','Ein Quadrat hat Seitenlänge 2√7 cm. Seine Fläche ist A cm². Bestimme A.',number(28,'Fläche A in cm²'),'28 cm²','(2√7)² = 2² · 7 = 28. Die Seitenlänge ist auch √28 cm.'),
  task('final-sum-1','wurzelsummen','Mehrere Regeln verbinden','Fasse √27 + √48 − √12 vollständig zu a√b zusammen.',term(5,3),'5√3','3√3 + 4√3 − 2√3 = 5√3.'),
  task('final-sum-2','wurzelsummen','Summen und Quotienten verbinden','Berechne (√75 − 3√12) / √3.',number(-1),'−1','(5√3 − 6√3) / √3 = −√3 / √3 = −1.'),
  task('final-interval-1','intervallschachtelung','Grenzen selbst bestimmen','Grenze √10 zwischen benachbarten Hundertsteln ein.',interval(3.16,3.17),'3,16 < √10 < 3,17','3,16² = 9,9856 < 10 < 10,0489 = 3,17².'),
  task('final-interval-2','intervallschachtelung','Näherungswert runden','Runde √10 auf zwei Nachkommastellen. Nutze 3,162 < √10 < 3,163.',number(3.16),'3,16','Die dritte Nachkommastelle ist 2, also wird abgerundet.'),
  task('final-nested-1','wurzeln-von-wurzeln','Wurzeln nacheinander ziehen','Berechne √(√1296).',number(6),'6','√1296 = 36 und √36 = 6.'),
  task('final-nested-2','wurzeln-von-wurzeln','Verschachtelung und Produkt verbinden','Berechne √(√81) · √(√16).',number(6),'6','Die Faktoren sind 3 und 2. Zusammen ergeben sie 6.'),
];
