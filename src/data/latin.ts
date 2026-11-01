import dataset from '../content/latin/vocabulary.json' with { type: 'json' };

export interface VocabularyEntry {
  id: string;
  latein: string;
  verwendungen: { bedeutungen: string[] }[];
}
export interface TrainerWord { id: string; latin: string; meanings: string[]; signature: string; }
export interface TrainingConfig { roundSize: number; total: number; }
export type Side = 'left' | 'right';
export interface Round { left: TrainerWord[]; right: TrainerWord[]; }
export interface Session {
  rounds: Round[];
  roundIndex: number;
  total: number;
  completed: number;
  attempts: number;
  errors: number;
  selected: Record<Side, string | null>;
  solved: Record<Side, string[]>;
}
export type Feedback = 'selected' | 'cleared' | 'correct' | 'incorrect' | 'ignored';

const normalize = (text: string) => text.normalize('NFC').trim();
export function adaptVocabulary(entries: readonly VocabularyEntry[]): TrainerWord[] {
  return entries.map(entry => {
    const meanings = [...new Set(entry.verwendungen.flatMap(use => use.bedeutungen).map(normalize))];
    return { id: entry.id, latin: entry.latein, meanings, signature: JSON.stringify([...meanings].sort()) };
  });
}
export const vocabulary = adaptVocabulary(dataset);

export function configError(config: TrainingConfig, available: number): string | null {
  if (!Number.isInteger(config.roundSize) || config.roundSize < 2 || config.roundSize > 10)
    return 'Wähle eine ganze Zahl von 2 bis 10 für die Paare pro Runde.';
  if (!Number.isInteger(config.total) || config.total < 1 || config.total > available)
    return `Wähle eine ganze Zahl von 1 bis ${available} für die Vokabeln insgesamt.`;
  return null;
}

/** Fisher–Yates; copies the input. Inject random for reproducible tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createSession(pool: readonly TrainerWord[], config: TrainingConfig, random: () => number = Math.random): Session {
  const error = configError(config, pool.length);
  if (error) throw new Error(error);
  const chosen = shuffle(pool, random).slice(0, config.total);
  const rounds: Round[] = [];
  for (let i = 0; i < chosen.length; i += config.roundSize) {
    const left = chosen.slice(i, i + config.roundSize);
    rounds.push({ left, right: shuffle(left, random) });
  }
  return { rounds, roundIndex: 0, total: chosen.length, completed: 0, attempts: 0, errors: 0,
    selected: { left: null, right: null }, solved: { left: [], right: [] } };
}
export const currentRound = (state: Session): Round => state.rounds[state.roundIndex];
export const stage = (state: Session): 'training' | 'round-complete' | 'complete' =>
  state.completed === state.total ? 'complete' : state.solved.left.length === currentRound(state).left.length ? 'round-complete' : 'training';

export function selectCard(state: Session, side: Side, id: string): { state: Session; feedback: Feedback } {
  if (stage(state) !== 'training' || state.solved[side].includes(id) || !currentRound(state)[side].some(word => word.id === id))
    return { state, feedback: 'ignored' };
  const selected = { ...state.selected, [side]: state.selected[side] === id ? null : id };
  if (!selected.left || !selected.right)
    return { state: { ...state, selected }, feedback: selected[side] ? 'selected' : 'cleared' };
  const round = currentRound(state);
  const left = round.left.find(word => word.id === selected.left)!;
  const right = round.right.find(word => word.id === selected.right)!;
  const correct = left.signature === right.signature;
  return {
    feedback: correct ? 'correct' : 'incorrect',
    state: { ...state, selected: { left: null, right: null }, attempts: state.attempts + 1,
      completed: state.completed + (correct ? 1 : 0), errors: state.errors + (correct ? 0 : 1),
      solved: correct ? { left: [...state.solved.left, left.id], right: [...state.solved.right, right.id] } : state.solved },
  };
}
export function nextRound(state: Session): Session {
  if (stage(state) !== 'round-complete') return state;
  return { ...state, roundIndex: state.roundIndex + 1, selected: { left: null, right: null }, solved: { left: [], right: [] } };
}
