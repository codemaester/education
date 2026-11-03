import { shuffle, type TrainerWord } from './latin.ts';
import { additionalFields } from './latin-learning.ts';

export interface FlashcardSession {
  cards: TrainerWord[];
  pending: TrainerWord[];
  index: number;
  round: number;
  total: number;
  solved: number;
  attempts: number;
  flipped: boolean;
}
export function createFlashcards(pool: readonly TrainerWord[], total: number, random = Math.random): FlashcardSession {
  if (!Number.isInteger(total) || total < 1 || total > pool.length) throw new Error('Ungültige Anzahl Vokabelkarten.');
  return { cards: shuffle(pool, random).slice(0, total), pending: [], index: 0, round: 1, total, solved: 0, attempts: 0, flipped: false };
}
export function flipFlashcard(session: FlashcardSession): FlashcardSession {
  return session.solved === session.total ? session : { ...session, flipped: !session.flipped };
}
export function rateFlashcard(session: FlashcardSession, correct: boolean): FlashcardSession {
  if (!session.flipped || session.solved === session.total) return session;
  const pending = correct ? session.pending : [...session.pending, session.cards[session.index]];
  const next = { ...session, pending, index: session.index + 1, solved: session.solved + Number(correct), attempts: session.attempts + 1, flipped: false };
  if (next.index === session.cards.length && pending.length) {
    return { ...next, cards: pending, pending: [], index: 0, round: session.round + 1 };
  }
  return next;
}
/** Keep source variants and missing forms intact, including deponent word groups. */
export function flashcardDetails(word: TrainerWord): { label: string; value: string; latin: boolean }[] {
  return [
    { label: 'Lateinische Grundform', value: word.latin, latin: true },
    ...additionalFields(word).map(field => ({ label: field.label, value: [...new Set(field.answers.filter(answer =>
      field.key === 'construction' || word.usages.some(usage => {
        const source = usage.grammatik?.[field.key];
        return Array.isArray(source) ? source.includes(answer) : source === answer;
      })))].join(' / '), latin: field.kind === 'latin' })),
    ...[...new Set(word.usages.flatMap(usage => usage.hinweis ? [usage.hinweis] : []))].map(value => ({ label: 'Hinweis', value, latin: false })),
  ];
}
