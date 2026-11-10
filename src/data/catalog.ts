import type { IconName } from './icons';
export interface Subject { slug: string; name: string; description: string; icon: IconName; tone: 'sage' | 'clay' | 'sand'; }
export const subjects: Subject[] = [
  { slug: 'physik', name: 'Physik', description: 'Den Gesetzen der Natur auf der Spur.', icon: 'physics', tone: 'sage' },
  { slug: 'mathematik', name: 'Mathematik', description: 'Muster erkennen. Lösungen finden.', icon: 'maths', tone: 'clay' },
  { slug: 'biologie', name: 'Biologie', description: 'Das Leben in all seinen Formen.', icon: 'biology', tone: 'sage' },
  { slug: 'chemie', name: 'Chemie', description: 'Stoffe, Teilchen und ihre Verwandlungen.', icon: 'chemistry', tone: 'sand' },
  { slug: 'sprachen', name: 'Sprachen', description: 'Mit Worten neue Welten erschließen.', icon: 'languages', tone: 'clay' },
  { slug: 'geschichte', name: 'Geschichte', description: 'Vergangenheit entdecken. Gegenwart verstehen.', icon: 'history', tone: 'sand' },
  { slug: 'geografie', name: 'Geografie', description: 'Unsere Erde und ihre Zusammenhänge.', icon: 'geography', tone: 'sage' },
  { slug: 'informatik', name: 'Informatik', description: 'Logisch denken. Digital gestalten.', icon: 'computing', tone: 'clay' },
  { slug: 'kunst', name: 'Kunst & Gestaltung', description: 'Genau hinsehen. Eigene Ideen entwickeln.', icon: 'art', tone: 'sand' },
];
export interface Course {
  slug: string;
  subject: string;
  title: string;
  shortTitle: string;
  /** Stable publication sequence; give each new course the next higher number. */
  addedOrder: number;
  description: string;
  level: string;
  chapters: number;
  chapterLabel?: string;
  highlights: { icon: IconName; label: string }[];
  artCaption: string;
  cover: 'optics' | 'sqrt-two' | 'museum' | 'latin' | 'square-trainer';
  href: string;
}
export const courses: Course[] = [
  { slug: 'latein-vokabeltrainer', subject: 'sprachen', title: 'Latein-Vokabeltrainer', shortTitle: 'Latein', addedOrder: 4, description: 'Bedeutungen abrufen, Stammformen festigen und Wörter im Kontext erschließen. Trainiere Latein mit passenden Lernpaketen und persönlicher Wiederholung.', level: 'Fortgeschrittene · etwa 5 Lernjahre', chapters: 6, chapterLabel: 'Trainingsmodi', highlights: [{ icon: 'languages', label: '955 Wörter' }, { icon: 'check', label: 'Bedeutungen & Stammformen' }], artCaption: 'Wörter kennen. Latein verstehen.', cover: 'latin', href: 'sprachen/latein/vokabeltrainer/' },
  { slug: 'optik', subject: 'physik', title: 'Licht, Schatten, Spiegel & Brechung', shortTitle: 'Optik', addedOrder: 1, description: 'Vom ersten Lichtstrahl bis zur Totalreflexion. Entdecke die Optik mit Simulationen, Erklärvideos und Aufgaben.', level: 'Klasse 9 · Gymnasium', chapters: 7, highlights: [{ icon: 'lens', label: 'Simulationen' }, { icon: 'print', label: 'Lernzettel' }], artCaption: 'Eine neue Perspektive auf Licht.', cover: 'optics', href: 'physik/optik/' },
  { slug: 'wurzel-2', subject: 'mathematik', title: 'Warum √2 irrational ist', shortTitle: 'Warum √2?', addedOrder: 2, description: 'Warum kann √2 kein Bruch sein? Entdecke rationale Zahlen, probiere Beispiele aus und folge dem Beweis in sieben kleinen Schritten.', level: 'Klasse 9', chapters: 5, chapterLabel: 'Abschnitte', highlights: [{ icon: 'maths', label: 'Beweis-Navigator' }, { icon: 'check', label: 'Wissenstest' }], artCaption: 'Fläche 2. Seitenlänge √2.', cover: 'sqrt-two', href: 'mathematik/wurzel-2/' },
  { slug: 'museum-der-unendlichkeit', subject: 'mathematik', title: 'Museum der endlosen Dinge', shortTitle: 'Unendlichkeit', addedOrder: 3, description: 'Vier Räume über irrationale Zahlen und Unendlichkeit: Zahlenzoom, Kreiswanderer, Unendlichkeitshotel und Zahlenlisten.', level: 'Ab Klasse 9 · Vertiefung', chapters: 4, chapterLabel: 'Museumsräume', highlights: [{ icon: 'maths', label: 'Experimente' }, { icon: 'print', label: 'Museumsführer' }], artCaption: 'Vier Räume. Kein letztes Ende.', cover: 'museum', href: 'mathematik/museum-der-unendlichkeit/' },
  { slug: 'quadratwurzeln', subject: 'mathematik', title: 'Quadratwurzeln: Sicher rechnen', shortTitle: 'Quadratwurzeln', addedOrder: 5, description: 'Wurzelgesetze verstehen, Wurzelterme vereinfachen und Näherungswerte bestimmen. Mit Quadratzahlen-Trainer, Kapitelübungen, Gesamtabfrage und Lernzettel.', level: 'Klasse 9 · Gymnasium', chapters: 6, highlights: [{ icon: 'maths', label: 'Quadratzahlen-Trainer' }, { icon: 'print', label: 'Lernzettel' }], artCaption: 'Quadrieren. Wurzeln ziehen. Sicher werden.', cover: 'square-trainer', href: 'mathematik/quadratwurzeln/' },
];
export const coursesForSubject = (slug: string) => courses.filter(course => course.subject === slug);

/** Catalog ordering remains independent of the home page's publication order. */
export const recentCourses = (entries: readonly Course[]) =>
  [...entries].sort((a, b) => b.addedOrder - a.addedOrder).slice(0, 5);
