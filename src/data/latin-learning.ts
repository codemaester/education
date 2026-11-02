import { shuffle, vocabulary, type TrainerWord } from './latin.ts';
import { detectiveCases, missionCases, huntCases, thematicGroups } from '../content/latin/activities.ts';
import lessonSource from '../content/latin/lessons.json' with { type: 'json' };

export type Mode = 'matching' | 'workshop' | 'detective' | 'mission' | 'hunt' | 'parcours';
export type Dimension = 'meaning' | 'forms' | 'grammar' | 'context';
export const modes: { id: Mode; label: string; description: string; details: string[] }[] = [
  { id: 'matching', label: 'Wörter zuordnen', description: 'Verbinde lateinische Wörter mit ihren deutschen Bedeutungen.', details: [
    'Links stehen lateinische Wörter, rechts ihre deutschen Bedeutungen. Wähle die passenden Paare aus. Richtige Zuordnungen bleiben markiert; bei einem Fehler kannst du es erneut versuchen.',
    'Du bestimmst, wie viele Paare gleichzeitig erscheinen und wie viele Wörter du insgesamt übst. Nach jeder vollständig gelösten Runde geht es mit „Nächste Runde“ weiter.',
    'Dieser Modus eignet sich zum Aufwärmen und Wiedererkennen. Stammformen werden hier nicht abgefragt; dafür stehen dir die Werkstatt und der Formen-Detektiv zur Verfügung.',
  ] },
  { id: 'workshop', label: 'Stammformen-Werkstatt', description: 'Ergänze fehlende Stammformen und rufe die deutsche Grundbedeutung ab.', details: [
    'Ausgehend von einem lateinischen Infinitiv ergänzt du wechselnde Lücken in der Stammformenreihe: Präsens, Perfekt und – soweit hinterlegt – das Supinum auf -um. Zusätzlich nennst du eine deutsche Grundbedeutung.',
    'Mit Formenbausteinen kannst du die Reihen zunächst zusammensetzen. Ohne Bausteine tippst du die fehlenden Formen selbst ein. Längenzeichen musst du nicht eingeben.',
    'Bedeutungen und einzelne Formen werden getrennt bewertet. Unsichere Angaben kommen später noch einmal vor. Deponentien erhalten passende Aufgaben; fehlende Daten werden nicht als Fehler gewertet.',
  ] },
  { id: 'detective', label: 'Formen-Detektiv', description: 'Erkenne Wortformen im Satz und finde Grundform und Übersetzung.', details: [
    'Du siehst eine veränderte lateinische Verbform in einem kurzen Satz. Finde den zugehörigen Infinitiv, übersetze die Form passend ins Deutsche und ergänze die vorhandenen Stammformen.',
    'Dabei begegnest du besonders Perfektstämmen, unregelmäßigen Verben und Deponentien. Bei Bedarf kannst du Hinweise zum Stamm und zum Anfang der Grundform aufdecken.',
    'Die Rückmeldung erklärt, wie die Form zur Stammformenreihe gehört und welche Bedeutung im Satz passt. So übst du das Wiedererkennen der Vokabeln, die dir in der Lektüre begegnen.',
  ] },
  { id: 'mission', label: 'Bedeutungs-Mission', description: 'Erschließe passende Bedeutungen und Konstruktionen in kurzen lateinischen Texten.', details: [
    'Kurze lateinische Übungstexte führen dich zum Brückenbau, zu einer Friedensgesandtschaft oder in eine Senatsdebatte. Übersetze jeweils die hervorgehobene Wortgruppe so, dass sie zum Zusammenhang passt.',
    'Bei passenden Aufgaben bestimmst du zusätzlich den verlangten Kasus oder ergänzt einen Perfektstamm. Entscheidend ist die Bedeutung im Text: Nicht jede Wörterbuchbedeutung passt zu jeder Verwendung.',
    'Nach deiner Antwort erklärt die Auflösung die wichtigen Textsignale und Konstruktionen. Unbekannte deutsche Formulierungen kannst du mit den Lösungen vergleichen und selbst bewerten.',
  ] },
  { id: 'hunt', label: 'Fehlerjagd und Verwechslungsduell', description: 'Entdecke Verwechslungen bei Formen und Bedeutungen. Danach folgt ein freier Abruf.', details: [
    'Prüfe eine Formenreihe oder eine Aussage zu Bedeutung, Genus oder Kasus. Sie kann einen Fehler enthalten oder vollständig richtig sein. Entscheide dich und gib die passende Angabe an.',
    'Du unterscheidest zum Beispiel ähnliche Perfektstämme oder erkennst, ob eine deutsche Bedeutung zur lateinischen Form passt. Die Auflösung zeigt dir die entscheidende Abgrenzung.',
    'Anschließend folgt ein freier Abruf desselben Wortes. Damit überprüfst du, ob du die Bedeutung und die Zusatzangaben auch ohne vorgegebene Aussage wiedergeben kannst.',
  ] },
  { id: 'parcours', label: 'Vokabel-Parcours', description: 'Übe in drei Etappen: Bedeutungen, grammatische Zusatzangaben und gemischte Wiederholung.', details: [
    'In der ersten Etappe siehst du lateinische Stichwörter und nennst eine deutsche Grundbedeutung. Danach ergänzt du die grammatischen Zusatzangaben der Wörter aus deinem Lernpaket.',
    'Je nach Wortart sind das Stammformen, Genitiv und Genus, Adjektivgrundformen oder eine bekannte Kasusrektion. Abgefragt wird nur, was für das jeweilige Wort hinterlegt ist.',
    'Zum Abschluss folgen gemischte Aufgaben. Unsichere Angaben werden erneut abgerufen; Bedeutungen und Formen behalten eigene Lernstände. Der Parcours eignet sich für eine abwechslungsreiche tägliche Wiederholung.',
  ] },
];
export const dimensions: Record<Dimension, string> = { meaning: 'Bedeutungen', forms: 'Stammformen', grammar: 'Zusatzangaben', context: 'Bedeutung im Kontext' };
export interface LearningField {
  key: string; label: string; answers: string[]; kind: 'latin' | 'german' | 'choice';
  dimension: Dimension; skill: string; choices?: string[];
}
export interface Exercise {
  id: string; wordId: string; mode: Exclude<Mode, 'matching'>; title: string; prompt: string;
  context?: string; target?: string; explanation: string; hints: string[]; fields: LearningField[];
  provided?: string[]; tiles?: string[]; retry?: boolean;
}
export interface SkillProgress { attempts: number; correct: number; streak: number; lastReviewed: number; nextDue: number; }
export interface Progress { version: 1; words: Record<string, Record<string, SkillProgress>>; }
export const PROGRESS_KEY = 'education.latin.progress.v1';
export const emptyProgress = (): Progress => ({ version: 1, words: {} });
const DAY = 86_400_000;
export const intervals = [1, 3, 7, 14, 30];

/** Only this version and bounded, well-formed records are restored. */
export function decodeProgress(raw: string | null): Progress {
  if (!raw || raw.length > 4_000_000) return emptyProgress();
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !value.words || typeof value.words !== 'object' || Array.isArray(value.words)) return emptyProgress();
    const words: Progress['words'] = {};
    for (const [id, skills] of Object.entries(value.words)) {
      if (!/^v\d{6}$/.test(id) || !skills || typeof skills !== 'object' || Array.isArray(skills)) continue;
      const valid: Record<string, SkillProgress> = {};
      for (const [skill, candidate] of Object.entries(skills)) {
        if (!/^[a-z][a-z_0-9]{0,40}$/.test(skill) || skill === 'constructor' || skill === '__proto__') continue;
        const p = candidate as SkillProgress;
        if (p && [p.attempts, p.correct, p.streak, p.lastReviewed, p.nextDue].every(n => Number.isSafeInteger(n) && n >= 0)
          && p.correct <= p.attempts && p.streak <= intervals.length && p.attempts <= 1_000_000
          && p.lastReviewed <= 8_640_000_000_000_000 && p.nextDue <= 8_640_000_000_000_000) valid[skill] = { attempts: p.attempts, correct: p.correct, streak: p.streak, lastReviewed: p.lastReviewed, nextDue: p.nextDue };
      }
      if (Object.keys(valid).length) words[id] = valid;
    }
    return { version: 1, words };
  } catch { return emptyProgress(); }
}
export function recordProgress(progress: Progress, wordId: string, skill: string, correct: boolean, now = Date.now(), assisted = false): Progress {
  const previous = progress.words[wordId]?.[skill];
  // Repeating immediately is useful practice, but does not prove long-term retention.
  const elapsed = previous ? now - previous.lastReviewed : Infinity;
  const streak = !correct ? 0 : assisted ? (previous?.streak ?? 0)
    : elapsed < DAY / 2 ? (previous?.streak ?? 0) : Math.min(intervals.length, (previous?.streak ?? 0) + 1);
  const nextDue = !correct ? now + 10 * 60_000
    : assisted ? Math.min(previous?.nextDue ?? Infinity, now + DAY)
    : previous && elapsed < DAY / 2 ? previous.nextDue : now + intervals[Math.max(0, streak - 1)] * DAY;
  return { version: 1, words: { ...progress.words, [wordId]: { ...progress.words[wordId], [skill]: {
    attempts: (previous?.attempts ?? 0) + 1, correct: (previous?.correct ?? 0) + Number(correct), streak,
    lastReviewed: now, nextDue,
  } } } };
}
export function progressSummary(progress: Progress, now = Date.now()): { practiced: number; due: number; weak: number } {
  const values = Object.values(progress.words);
  return { practiced: values.length, due: values.filter(skills => Object.values(skills).some(p => p.nextDue <= now)).length,
    weak: values.filter(skills => Object.values(skills).some(p => p.streak === 0)).length };
}

export function grammarValues(word: TrainerWord, key: string, partOfSpeech?: string): string[] {
  return [...new Set(word.usages.filter(u => !partOfSpeech || u.wortart === partOfSpeech).flatMap(u => {
    const value = u.grammatik?.[key]; return value === undefined ? [] : Array.isArray(value) ? value : [value];
  }))];
}
export function lessonsFor(word: TrainerWord): number[] {
  return [...new Set(word.sourceIds.flatMap(id => {
    const n = Number(id.slice(1));
    return lessonSource.ranges.filter(range => n >= range.first && n <= range.last).map(range => range.lesson);
  }))].sort((a, b) => a - b);
}
export interface Package { id: string; label: string; group: string; matches: (word: TrainerWord) => boolean; }
const membership = (lemmas: string[]) => (word: TrainerWord) => lemmas.includes(word.latin);
export const packages: Package[] = [
  { id: 'all', label: 'Gesamter Wortschatz', group: 'Wortschatz', matches: () => true },
  ...Object.entries(thematicGroups).map(([id, p]) => ({ id: `theme:${id}`, label: p.label, group: 'Sachfelder', matches: membership(p.lemmas) })),
  { id: 'polysemy', label: 'Mehrere Bedeutungen', group: 'Bedeutung und Konstruktion', matches: w => w.meanings.length > 1 },
  { id: 'construction', label: 'Wörter mit Konstruktionshinweisen', group: 'Bedeutung und Konstruktion', matches: w => w.usages.some(u => /Akkusativ|Dativ|Ablativ|Konjunktiv|Infinitiv/.test(u.hinweis ?? '')) },
  { id: 'confusions', label: 'Verwechslungsgruppen', group: 'Bedeutung und Konstruktion', matches: membership(huntCases.map(c => c.lemma)) },
];
export interface Filters { packageId: string; partOfSpeech: string; lesson: number | null; weakness: string; }
export const defaultFilters = (): Filters => ({ packageId: 'all', partOfSpeech: '', lesson: null, weakness: '' });
const infinitive = (w: TrainerWord) => w.partsOfSpeech.includes('Verb') && (/(?:re|rī|se|sse)$/u.test(w.latin)
  || /ī$/u.test(w.latin) && w.usages.some(u => /Deponens|Deponent/i.test(u.hinweis ?? '')));
export function eligibleForMode(word: TrainerWord, mode: Mode): boolean {
  if (mode === 'workshop') return infinitive(word) && formFields(word).length > 0;
  if (mode === 'detective') return word.partsOfSpeech.includes('Verb') && detectiveCases.some(c => c.lemma === word.latin);
  if (mode === 'mission') return missionCases.some(c => c.lemma === word.latin && (!c.partOfSpeech || word.partsOfSpeech.includes(c.partOfSpeech)));
  if (mode === 'hunt') return huntCases.some(c => c.lemma === word.latin && (!c.partOfSpeech || word.partsOfSpeech.includes(c.partOfSpeech)));
  return true;
}
export interface WordTypeOption { value: string; label: string; }
export const commonWordTypes: readonly WordTypeOption[] = [
  { value: 'Verb', label: 'Verben' },
  { value: 'Substantiv', label: 'Substantive' },
  { value: 'Adjektiv', label: 'Adjektive' },
  { value: 'Pronomen', label: 'Pronomen' },
  { value: 'Adverb', label: 'Adverbien' },
  { value: 'Präposition', label: 'Präpositionen' },
  { value: 'Konjunktion', label: 'Konjunktionen' },
];
function withWordType(word: TrainerWord, partOfSpeech: string): TrainerWord | null {
  const usages = word.usages.filter(usage => usage.wortart === partOfSpeech);
  if (!usages.length) return null;
  const meanings = [...new Set(usages.flatMap(usage => usage.bedeutungen))];
  return { ...word, usages, meanings, signature: JSON.stringify([...meanings].sort()), partsOfSpeech: [partOfSpeech],
    sourceIds: [...new Set(usages.flatMap(usage => usage.ids ?? [word.id]))] };
}
/** Only common categories with actual tasks in this mode are selectable. */
export function wordTypesForMode(mode: Mode): WordTypeOption[] {
  return commonWordTypes.filter(option => vocabulary.some(word => {
    const candidate = withWordType(word, option.value);
    return candidate !== null && eligibleForMode(candidate, mode);
  }));
}
export function filterWords(pool: readonly TrainerWord[], mode: Mode, filters: Filters, progress: Progress, now = Date.now()): TrainerWord[] {
  const pack = packages.find(p => p.id === filters.packageId);
  if (!pack) return [];
  const pos = filters.partOfSpeech;
  if (pos && !wordTypesForMode(mode).some(option => option.value === pos)) return [];
  // A word-type filter selects usages, not just a lemma that also happens to
  // occur as that word type (e.g. cum as preposition versus conjunction).
  const candidates = pos ? pool.flatMap(w => {
    const candidate = withWordType(w, pos);
    return candidate ? [candidate] : [];
  }) : pool;
  return candidates.filter(w => eligibleForMode(w, mode) && pack.matches(w)
    && (!filters.partOfSpeech || w.partsOfSpeech.includes(filters.partOfSpeech))
    && (filters.lesson === null || lessonsFor(w).includes(filters.lesson))
    && (!filters.weakness || Object.entries(progress.words[w.id] ?? {}).some(([skill, p]) =>
      filters.weakness === 'due' ? p.nextDue <= now : (filters.weakness === 'weak' || skill === filters.weakness) && p.streak === 0)));
}

export function normalizeLatin(value: string): string {
  // Strip only length marks, not other diacritics; preserve word identity in data.
  return value.normalize('NFD').replace(/\u0304/g, '').normalize('NFC').toLocaleLowerCase('la').trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ');
}
export function normalizeGerman(value: string): string {
  return value.normalize('NFC').toLocaleLowerCase('de').trim().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ').replace(/^(?:der|die|das|ein|eine) /, '');
}
export type AnswerResult = 'correct' | 'incorrect' | 'review';
export function checkAnswer(field: LearningField, answer: string): AnswerResult {
  const normalize = field.kind === 'latin' ? normalizeLatin : normalizeGerman;
  if (field.answers.some(a => normalize(a) === normalize(answer))) return 'correct';
  return field.kind === 'german' && answer.trim() ? 'review' : 'incorrect';
}
const labels: Record<string, string> = { praesens_1sg: '1. Person Singular Präsens', perfekt_1sg: '1. Person Singular Perfekt', supinum: 'Supinum auf -um', genitiv: 'Genitiv Singular', genitiv_plural: 'Genitiv Plural', geschlecht: 'Genus', nominativ_weiblich: 'Weibliche Grundform', nominativ_saechlich: 'Sächliche Grundform', komparativ: 'Komparativ', superlativ: 'Superlativ' };
function grammarField(word: TrainerWord, key: string, partOfSpeech: string): LearningField | null {
  const values = grammarValues(word, key, partOfSpeech);
  if (!values.length) return null;
  const answers = [...values];
  if (key === 'perfekt_1sg' && word.usages.some(u => /Deponens/.test(u.hinweis ?? ''))) {
    for (const value of values) if (/us sum$/.test(value)) answers.push(value.replace(/us sum$/, 'a sum'));
  }
  if (key === 'geschlecht') for (const value of values) answers.push(...(value === 'männlich' ? ['maskulin', 'm'] : value === 'weiblich' ? ['feminin', 'f'] : ['neutrum', 'n', 'neutral']));
  return { key, label: labels[key], answers, kind: key === 'geschlecht' ? 'choice' : 'latin', dimension: partOfSpeech === 'Verb' ? 'forms' : 'grammar', skill: key,
    ...(key === 'geschlecht' ? { choices: ['männlich', 'weiblich', 'sächlich'] } : {}) };
}
export function formFields(word: TrainerWord): LearningField[] {
  return ['praesens_1sg', 'perfekt_1sg', 'supinum'].flatMap(key => grammarField(word, key, 'Verb') ?? []);
}
export function additionalFields(word: TrainerWord): LearningField[] {
  if (infinitive(word)) return formFields(word);
  const part = word.partsOfSpeech.includes('Substantiv') ? 'Substantiv' : word.partsOfSpeech.includes('Adjektiv') ? 'Adjektiv' : word.partsOfSpeech.includes('Eigenname') ? 'Eigenname' : '';
  const keys = part === 'Adjektiv' ? ['nominativ_weiblich', 'nominativ_saechlich', 'komparativ', 'superlativ'] : ['genitiv', 'genitiv_plural', 'geschlecht'];
  const fields = part ? keys.flatMap(key => grammarField(word, key, part) ?? []) : [];
  const cases = [...new Set(word.usages.flatMap(u => /^(?:Mit|mit) (Akkusativ|Dativ|Ablativ)\.$/.exec(u.hinweis ?? '')?.slice(1) ?? []))];
  if (!fields.length && cases.length === 1 && word.partsOfSpeech.length === 1) fields.push({ key: 'construction', label: 'Welchen Kasus verlangt dieses Wort?', answers: cases, kind: 'choice', dimension: 'grammar', skill: 'construction', choices: ['Akkusativ', 'Dativ', 'Ablativ'] });
  return fields;
}
function meaningField(word: TrainerWord): LearningField {
  // Parenthetical annotations stay visible in the solution; these plain aliases
  // remove explanations, not arbitrary substrings or approximate spellings.
  const aliases = word.meanings.map(m => m.replace(/\s*\(.*?\)/g, '').trim()).filter(Boolean);
  return { key: 'meaning', label: 'Eine deutsche Grundbedeutung', answers: [...new Set([...word.meanings, ...aliases])], kind: 'german', dimension: 'meaning', skill: 'meaning' };
}
function availabilityNote(word: TrainerWord): string {
  if (['esse', 'posse', 'velle', 'nōlle', 'mālle'].includes(word.latin)) return 'Dieses Verb besitzt kein Supinum auf -um. Es wird keines verlangt.';
  if (word.usages.some(u => /Deponens/.test(u.hinweis ?? ''))) return 'Deponens: passive Formen mit aktiver Bedeutung. Das hinterlegte Perfekt wird als Wortgruppe abgefragt.';
  return 'Nur hinterlegte Zusatzangaben werden abgefragt. Fehlende Daten sind keine fehlenden Kenntnisse.';
}
function recallExercise(word: TrainerWord, mode: Exercise['mode'], id: string, title: string, grammar = true): Exercise {
  return { id, wordId: word.id, mode, title, prompt: word.latin, explanation: availabilityNote(word),
    hints: [word.partsOfSpeech.join(' · '), ...word.usages.flatMap(u => u.hinweis ? [u.hinweis] : [])],
    fields: [meaningField(word), ...(grammar ? additionalFields(word) : [])] };
}
export function buildExercises(mode: Exclude<Mode, 'matching'>, pool: readonly TrainerWord[], total: number, support = false, random: () => number = Math.random): Exercise[] {
  const available = pool.filter(w => eligibleForMode(w, mode));
  if (!Number.isInteger(total) || total < 1 || total > available.length) throw new Error(`Wähle 1 bis ${available.length} Wörter für diesen Modus und dieses Paket.`);
  const chosen = shuffle(available, random).slice(0, total);
  if (mode === 'parcours') {
    const first = chosen.map(w => recallExercise(w, mode, `${w.id}:meaning`, 'Etappe 1 · Bedeutung abrufen', false));
    const second = chosen.flatMap(w => {
      const fields = additionalFields(w);
      return fields.length ? [{ ...recallExercise(w, mode, `${w.id}:grammar`, 'Etappe 2 · Zusatzangaben ergänzen'), fields }] : [];
    });
    const third = chosen.slice(0, Math.min(3, total)).map(w => {
      const exercise = recallExercise(w, mode, `${w.id}:transfer`, 'Etappe 3 · Gemischt wiederholen');
      return { ...exercise, fields: [meaningField(w), ...shuffle(additionalFields(w), random).slice(0, 1)] };
    });
    return [...first, ...second, ...third];
  }
  if (mode === 'mission') return missionCases.filter(c => chosen.some(w => w.latin === c.lemma && (!c.partOfSpeech || w.partsOfSpeech.includes(c.partOfSpeech)))).map(c => {
    const word = chosen.find(w => w.latin === c.lemma)!;
    const fields: LearningField[] = [{ key: 'context', label: `Übersetze „${c.target}“ ins Deutsche.`, answers: c.meanings, kind: 'german', dimension: 'context', skill: `context_${c.id.replaceAll('-', '_')}` }];
    if (c.construction) fields.push({ key: 'construction', label: c.construction.question, answers: c.construction.answers, kind: 'choice', dimension: 'grammar', skill: `construction_${c.id.replaceAll('-', '_')}`, choices: ['Akkusativ', 'Dativ', 'Ablativ'] });
    fields.push(...formFields(word).filter(f => f.key === 'perfekt_1sg'));
    return { id: c.id, wordId: word.id, mode, title: c.mission, prompt: c.target, context: c.passage, target: c.target, explanation: c.explanation, hints: ['Achte auf die Wörter vor und nach dem Zielwort.'], fields };
  });
  return chosen.flatMap(word => {
    if (mode === 'workshop') {
      const all = formFields(word);
      const missing = shuffle(all, random).slice(0, Math.min(2, all.length));
      const provided = all.filter(f => !missing.includes(f)).map(f => `${f.label}: ${f.answers[0]}`);
      const exercise = recallExercise(word, mode, `${word.id}:workshop`, 'Stammformen-Werkstatt');
      return [{ ...exercise, fields: [...missing, meaningField(word)], provided,
        tiles: support ? shuffle([...new Set(missing.flatMap(f => f.answers))], random) : undefined }];
    }
    if (mode === 'detective') {
      const c = detectiveCases.find(c => c.lemma === word.latin)!;
      return [{ id: `${word.id}:detective`, wordId: word.id, mode, title: 'Formen-Detektiv', prompt: c.form, context: c.context, explanation: c.analysis,
        hints: ['Suche nach dem Präsens- oder Perfektstamm.', `Die Grundform beginnt mit ${word.latin.slice(0, 2)}…`],
        fields: [{ key: 'lemma', label: 'Lateinische Grundform (Infinitiv)', answers: [word.latin], kind: 'latin', dimension: 'forms', skill: 'recognition' },
          { key: 'meaning', label: 'Deutsche Übersetzung der markierten Form im Satz', answers: c.meanings, kind: 'german', dimension: 'context', skill: 'form_meaning' }, ...formFields(word)] }];
    }
    const c = huntCases.find(c => c.lemma === word.latin)!;
    const fields: LearningField[] = [{ key: 'verdict', label: 'Prüfe die Aussage. Sie kann einen Fehler enthalten oder vollständig richtig sein.', answers: [c.verdict], kind: 'choice', dimension: 'grammar', skill: 'discrimination', choices: ['Fehler enthalten', 'Alles richtig'] }];
    if (c.correction) fields.push({ key: 'correction', label: c.correction.label, answers: c.correction.answers,
      kind: c.correction.latin ? 'latin' : ['geschlecht', 'construction'].includes(c.correction.skill) ? 'choice' : 'german',
      dimension: c.correction.latin ? 'forms' : c.correction.skill === 'meaning' ? 'meaning' : 'grammar', skill: c.correction.skill,
      ...(c.correction.skill === 'geschlecht' ? { choices: ['männlich', 'weiblich', 'sächlich'] } : c.correction.skill === 'construction' ? { choices: ['Akkusativ', 'Dativ', 'Ablativ'] } : {}) });
    return [{ id: c.id, wordId: word.id, mode, title: 'Fehlerjagd', prompt: c.claim, explanation: c.explanation,
      hints: ['Vergleiche Präsensstamm, Perfektstamm, Bedeutung und Konstruktion einzeln.'], fields },
    recallExercise(word, mode, `${c.id}:recall`, 'Verwechslungsduell · Jetzt frei abrufen')];
  });
}

export function retryExercise(exercise: Exercise, failedKeys: string[]): Exercise {
  return { ...exercise, id: `${exercise.id}:retry`, title: 'Erneuter Abruf · Noch einmal ohne Hilfe', provided: undefined, tiles: undefined, retry: true,
    fields: exercise.fields.filter(f => failedKeys.includes(f.key)) };
}
export const wordById = (id: string): TrainerWord | undefined => vocabulary.find(w => w.id === id);
