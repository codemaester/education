export const opticsChapters = [
  { id: 'k1', title: 'Licht an Grenzflächen', short: 'Grenzflächen' },
  { id: 'k2', title: 'Schatten', short: 'Schatten' },
  { id: 'k3', title: 'Das Reflexionsgesetz', short: 'Reflexionsgesetz' },
  { id: 'k4', title: 'Eigenschaften des Spiegelbilds', short: 'Spiegelbild' },
  { id: 'k5', title: 'Spiegelbilder konstruieren', short: 'Spiegel konstruieren' },
  { id: 'k6', title: 'Lichtbrechung', short: 'Lichtbrechung' },
  { id: 'k7', title: 'Totalreflexion', short: 'Totalreflexion' },
];

export interface AssessmentQuestion { id: string; chapter: string; prompt: string; options: string[]; answer: number; explanation: string; }
export const opticsAssessment: AssessmentQuestion[] = [
  { id: 'material', chapter: 'k1', prompt: 'Du erkennst durch eine Milchglasscheibe nur unscharfe Umrisse. Welche Vorgänge erklären das?', options: ['Nur Absorption', 'Transmission mit Streuung', 'Nur geordnete Reflexion'], answer: 1, explanation: 'Licht gelangt durch die Scheibe, wird dabei aber in verschiedene Richtungen gestreut. Deshalb entsteht kein klares Bild.' },
  { id: 'shadow', chapter: 'k2', prompt: 'Zwei kleine Lichtquellen beleuchten einen undurchsichtigen Körper. Was kennzeichnet den Kernschatten?', options: ['Dorthin gelangt das Licht beider Quellen.', 'Dorthin gelangt nur das Licht einer Quelle.', 'Dorthin gelangt das Licht keiner der beiden Quellen.'], answer: 2, explanation: 'Im Kernschatten sind beide Lichtquellen verdeckt. Im Halbschatten erreicht dagegen das Licht einer Quelle den Schirm.' },
  { id: 'reflection', chapter: 'k3', prompt: 'Ein Strahl bildet einen Winkel von 30° mit der Spiegeloberfläche. Wie groß ist sein Reflexionswinkel zum Lot?', options: ['30°', '60°', '90°'], answer: 1, explanation: 'Oberfläche und Lot stehen senkrecht aufeinander. Der Einfallswinkel zum Lot beträgt 90° − 30° = 60°. Nach dem Reflexionsgesetz ist auch der Reflexionswinkel 60°.' },
  { id: 'image', chapter: 'k4', prompt: 'Du stehst 1,2 m vor einem ebenen Spiegel. Wie groß ist der Abstand zwischen dir und deinem virtuellen Bild?', options: ['0,6 m', '1,2 m', '2,4 m'], answer: 2, explanation: 'Das virtuelle Bild liegt 1,2 m hinter dem Spiegel. Gegenstand und Bild sind deshalb insgesamt 2,4 m voneinander entfernt.' },
  { id: 'construction', chapter: 'k5', prompt: 'Eine 1,80 m große Person möchte sich vollständig im ebenen Spiegel sehen. Welche Mindesthöhe braucht ein passend angebrachter Spiegel?', options: ['0,90 m', '1,80 m', 'Das hängt vom Abstand zum Spiegel ab.'], answer: 0, explanation: 'Ein richtig angebrachter Ganzkörperspiegel muss mindestens halb so hoch wie die Person sein: 1,80 m / 2 = 0,90 m. Diese Mindesthöhe ist unabhängig vom Abstand.' },
  { id: 'refraction', chapter: 'k6', prompt: 'Licht tritt schräg aus Luft in Glas ein. Was passiert mit dem gebrochenen Strahl?', options: ['Er wird zum Lot hin gebrochen.', 'Er wird vom Lot weg gebrochen.', 'Seine Richtung bleibt immer unverändert.'], answer: 0, explanation: 'Beim Übergang in ein optisch dichteres Medium wird der Strahl zum Lot hin gebrochen. Der Brechungswinkel ist kleiner als der Einfallswinkel.' },
  { id: 'total-reflection', chapter: 'k7', prompt: 'Wann kann Totalreflexion auftreten?', options: ['Bei jedem Übergang von Luft zu Glas', 'Vom optisch dichteren ins dünnere Medium, oberhalb des Grenzwinkels', 'Nur bei einem Einfallswinkel von 0°'], answer: 1, explanation: 'Beide Bedingungen müssen erfüllt sein: Übergang vom optisch dichteren ins dünnere Medium und ein Einfallswinkel, der größer als der Grenzwinkel ist.' },
];

export function evaluateAssessment(questions: AssessmentQuestion[], answers: Record<string, number>) {
  return questions.map(question => ({ id: question.id, chapter: question.chapter, correct: answers[question.id] === question.answer }));
}
