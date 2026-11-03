import { createFlashcards, flipFlashcard, rateFlashcard, flashcardDetails, type FlashcardSession } from '../data/latin-flashcards';
import type { TrainerWord } from '../data/latin';

export function initFlashcards(root: HTMLElement, edit: () => void, record: (id: string, correct: boolean) => void) {
  const el = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const section = el('[data-flashcards]');
  const card = el<HTMLButtonElement>('[data-flashcard]');
  const ratings = el('[data-flashcard-ratings]');
  const status = el('[data-flashcards-status]');
  let state: FlashcardSession | null = null;
  let settings: { pool: TrainerWord[]; total: number } | null = null;
  function render(): void {
    if (!state) return;
    const complete = state.solved === state.total;
    const bar = el<HTMLProgressElement>('[data-flashcards-progress]'); bar.max = state.total; bar.value = state.solved;
    el('[data-flashcards-count]').textContent = `Runde ${state.round} · ${state.solved} von ${state.total} Karten geschafft${complete ? '' : ` · Karte ${state.index + 1} von ${state.cards.length} in dieser Runde`}`;
    el('[data-flashcards-play]').hidden = complete;
    el('[data-flashcards-result]').hidden = !complete;
    el('[data-flashcards-abort]').hidden = complete;
    if (complete) {
      el('[data-flashcards-result-text]').textContent = `${state.total} Karten in ${state.round} ${state.round === 1 ? 'Runde' : 'Runden'} geschafft · ${state.attempts} Selbstbewertungen.`;
      el('[data-flashcards-result-title]').focus(); return;
    }
    const word = state.cards[state.index];
    // Reset orientation without animating the next solution into view.
    card.classList.add('is-resetting');
    card.classList.remove('is-flipped');
    void card.offsetWidth;
    card.classList.remove('is-resetting');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-labelledby', 'flashcard-front');
    el('[data-flashcard-front]').setAttribute('aria-hidden', 'false');
    el('[data-flashcard-back]').setAttribute('aria-hidden', 'true');
    el('[data-flashcard-word]').textContent = word.latin;
    el('[data-flashcard-meaning]').textContent = word.meanings.join('; ');
    el('[data-flashcard-forms]').replaceChildren(...flashcardDetails(word).map(detail => {
      const row = document.createElement('span');
      const label = document.createElement('small'); label.textContent = detail.label;
      const value = document.createElement('span'); value.textContent = detail.value; value.lang = detail.latin ? 'la' : 'de';
      row.append(label, value); return row;
    }));
    ratings.hidden = true;
    card.focus({ preventScroll: true });
  }
  card.addEventListener('click', () => {
    if (!state) return;
    state = flipFlashcard(state);
    card.classList.toggle('is-flipped', state.flipped);
    card.setAttribute('aria-pressed', String(state.flipped));
    card.setAttribute('aria-labelledby', state.flipped ? 'flashcard-back' : 'flashcard-front');
    el('[data-flashcard-front]').setAttribute('aria-hidden', String(state.flipped));
    el('[data-flashcard-back]').setAttribute('aria-hidden', String(!state.flipped));
    ratings.hidden = !state.flipped;
  });
  function rate(correct: boolean): void {
    if (!state?.flipped) return;
    const previous = state;
    const word = previous.cards[previous.index];
    state = rateFlashcard(previous, correct);
    record(word.id, correct);
    render();
    status.textContent = state.solved === state.total ? 'Alle Karten einmal richtig gewusst. Training abgeschlossen.'
      : state.round > previous.round ? `Runde ${previous.round} abgeschlossen. In Runde ${state.round} wiederholst du ${state.cards.length} ${state.cards.length === 1 ? 'Karte' : 'Karten'}.`
      : correct ? `${word.latin}: geschafft und abgelegt.` : `${word.latin}: für die nächste Runde vorgemerkt.`;
  }
  el('[data-flashcard-correct]').addEventListener('click', () => rate(true));
  el('[data-flashcard-wrong]').addEventListener('click', () => rate(false));
  function start(pool: TrainerWord[], total: number): void {
    settings = { pool, total }; state = createFlashcards(pool, total);
    section.hidden = false; status.textContent = ''; render();
  }
  el('[data-flashcards-restart]').addEventListener('click', () => { if (settings) start(settings.pool, settings.total); });
  el('[data-flashcards-abort]').addEventListener('click', edit);
  el('[data-flashcards-edit]').addEventListener('click', edit);
  return { start, stop: () => { state = null; section.hidden = true; } };
}
