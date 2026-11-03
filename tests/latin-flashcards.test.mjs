import assert from 'node:assert/strict';
import { test } from 'node:test';
import { vocabulary } from '../src/data/latin.ts';
import { createFlashcards, flipFlashcard, rateFlashcard, flashcardDetails } from '../src/data/latin-flashcards.ts';
const word = latin => vocabulary.find(w => w.latin === latin);
test('cards allow self-assessment on either side and repeat only failures across as many rounds as needed', () => {
  const pool = [word('ferre'), word('urbs'), word('ad')];
  let state = createFlashcards(pool, 3, () => .99);
  assert.deepEqual(state.cards, pool);
  assert.equal(rateFlashcard(state, true).solved, 1);
  assert.equal(state.solved, 0);
  state = flipFlashcard(flipFlashcard(state));
  assert.equal(state.flipped, false);
  state = rateFlashcard(flipFlashcard(state), false);
  state = rateFlashcard(flipFlashcard(state), true);
  state = rateFlashcard(flipFlashcard(state), false);
  assert.equal(state.round, 2); assert.equal(state.solved, 1);
  assert.deepEqual(state.cards, [pool[0], pool[2]]);
  for (let round = 2; round <= 5; round++) {
    state = rateFlashcard(flipFlashcard(state), false);
    state = rateFlashcard(flipFlashcard(state), false);
    assert.equal(state.round, round + 1);
    assert.equal(state.solved, 1);
  }
  state = rateFlashcard(flipFlashcard(state), true);
  state = rateFlashcard(flipFlashcard(state), true);
  assert.equal(state.solved, 3); assert.equal(rateFlashcard(state, true), state);
  assert.equal(flipFlashcard(state), state);
  assert.deepEqual(pool.map(w => w.latin), ['ferre', 'urbs', 'ad']);
});
test('one-card decks repeat and complete, with validated counts and a copied shuffled selection', () => {
  for (const total of [0, -1, 1.5, 956]) assert.throws(() => createFlashcards(vocabulary, total));
  const before = vocabulary.map(w => w.id);
  const selection = createFlashcards(vocabulary, 20);
  assert.equal(new Set(selection.cards.map(w => w.id)).size, 20);
  assert.deepEqual(vocabulary.map(w => w.id), before);
  let state = createFlashcards([word('esse')], 1);
  state = rateFlashcard(state, false);
  assert.equal(state.round, 2);
  state = rateFlashcard(state, true);
  assert.equal(state.solved, state.total);
});
test('solutions preserve source forms, variants, deponents and sparse grammar', () => {
  const details = lemma => flashcardDetails(word(lemma));
  assert.ok(details('ferre').some(d => d.value === 'tulī'));
  assert.ok(details('sequī').some(d => d.value === 'secūtus sum'));
  assert.ok(!details('sequī').some(d => d.value.includes('secūta sum')));
  assert.ok(details('incipere').some(d => d.value.includes('coepī') && d.value.includes('incēpī')));
  assert.ok(!details('esse').some(d => d.label === 'Supinum auf -um'));
  assert.ok(details('urbs').some(d => d.label === 'Genitiv Singular'));
  assert.ok(details('ad').some(d => d.value === 'Akkusativ'));
  for (const w of vocabulary) assert.ok(flashcardDetails(w).every(d => d.value.length > 0), w.latin);
});
