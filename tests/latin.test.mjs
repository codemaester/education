import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { adaptVocabulary, configError, createSession, currentRound, nextRound, selectCard, shuffle, stage } from '../src/data/latin.ts';
import { coursesForSubject, recentCourses, courses } from '../src/data/catalog.ts';

const data = JSON.parse(readFileSync(new URL('../src/content/latin/vocabulary.json', import.meta.url)));
const words = adaptVocabulary(data);
const random = () => { let seed = 12345; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); };
const action = (state, side, id) => selectCard(state, side, id).state;
function solveRound(state) {
  for (const word of currentRound(state).left) {
    state = action(state, 'left', word.id);
    state = action(state, 'right', word.id);
  }
  return state;
}

test('consolidated vocabulary is complete, standalone, and preserves usages in the adapter', () => {
  assert.equal(data.length, 955);
  assert.equal(new Set(data.map(word => word.latein)).size, 955);
  const ids = data.flatMap(word => word.verwendungen.flatMap(usage => usage.ids));
  assert.equal(ids.length, 1037);
  assert.equal(new Set(ids).size, 1037);
  const cum = words.find(word => word.latin === 'cum');
  assert.ok(['mit', 'als', 'obwohl'].every(meaning => cum.meanings.includes(meaning)));
  assert.equal(new Set(cum.meanings).size, cum.meanings.length);
  assert.equal(coursesForSubject('sprachen')[0].cover, 'latin');
  assert.ok(recentCourses(courses).some(course => course.slug === 'latein-vokabeltrainer'));
});

test('configuration rejects fractional, missing and out-of-range counts', () => {
  for (const roundSize of [NaN, Infinity, 1, 11, 2.5])
    assert.ok(configError({ roundSize, total: 20 }, words.length));
  for (const total of [NaN, Infinity, 0, -1, 956, 1.2])
    assert.ok(configError({ roundSize: 5, total }, words.length));
  for (const config of [{ roundSize: 2, total: 1 }, { roundSize: 10, total: 955 }])
    assert.equal(configError(config, words.length), null);
  assert.throws(() => createSession(words, { roundSize: 1, total: 20 }), /2 bis 10/);
  assert.throws(() => createSession([], { roundSize: 5, total: 1 }));
});

test('selection and shuffling are reproducible, independent, and never mutate or repeat words', () => {
  const before = structuredClone(words);
  const state = createSession(words, { roundSize: 5, total: 12 }, random());
  assert.deepEqual(state, createSession(words, { roundSize: 5, total: 12 }, random()));
  assert.deepEqual(state.rounds.map(round => round.left.length), [5, 5, 2]);
  const picked = state.rounds.flatMap(round => round.left.map(word => word.id));
  assert.equal(new Set(picked).size, 12);
  assert.notDeepEqual(picked, words.slice(0, 12).map(word => word.id));
  assert.ok(state.rounds.some(round => round.left.map(word => word.id).join() !== round.right.map(word => word.id).join()));
  for (const round of state.rounds) assert.deepEqual([...round.left].sort((a,b) => a.id.localeCompare(b.id)), [...round.right].sort((a,b) => a.id.localeCompare(b.id)));
  assert.deepEqual(words, before);
  assert.deepEqual(shuffle([], random()), []);
  assert.equal(createSession(words, { roundSize: 10, total: 955 }, random()).rounds.length, 96);
});

test('selections toggle, replace, accept either order, and reject invalid or solved cards', () => {
  let state = createSession(words, { roundSize: 3, total: 3 }, random());
  const [a,b] = currentRound(state).left;
  const initial = state;
  assert.equal(selectCard(state, 'left', 'missing').feedback, 'ignored');
  state = action(state, 'left', a.id);
  assert.equal(state.selected.left, a.id);
  assert.equal(initial.selected.left, null);
  state = action(state, 'left', b.id);
  assert.equal(state.selected.left, b.id);
  const cleared = selectCard(state, 'left', b.id);
  assert.equal(cleared.feedback, 'cleared');
  assert.equal(cleared.state.attempts, 0);
  state = action(cleared.state, 'right', a.id);
  const correct = selectCard(state, 'left', a.id);
  assert.equal(correct.feedback, 'correct');
  assert.equal(correct.state.completed, 1);
  assert.equal(correct.state.attempts, 1);
  assert.equal(correct.state.errors, 0);
  assert.equal(selectCard(correct.state, 'right', a.id).state, correct.state);
});

test('wrong answers reset both selections, count once and allow retries', () => {
  let state = createSession(words, { roundSize: 2, total: 2 }, random());
  const [a,b] = currentRound(state).left;
  state = action(state, 'left', a.id);
  const wrong = selectCard(state, 'right', b.id);
  assert.equal(wrong.feedback, 'incorrect');
  state = wrong.state;
  assert.deepEqual(state.selected, { left: null, right: null });
  assert.equal(state.completed, 0);
  assert.equal(state.errors, 1);
  assert.equal(state.attempts, 1);
  state = solveRound(state);
  assert.equal(stage(state), 'complete');
  assert.equal(state.attempts, 3);
  assert.equal(state.errors, 1);
});

test('identical translations are interchangeable and leave every remaining pair solvable', () => {
  const pool = adaptVocabulary([
    { id: 'a', latein: 'a', verwendungen: [{ bedeutungen: ['eins', 'zwei'] }] },
    { id: 'b', latein: 'b', verwendungen: [{ bedeutungen: ['zwei', 'eins', 'eins'] }] },
  ]);
  let state = createSession(pool, { roundSize: 2, total: 2 }, random());
  state = action(action(state, 'left', 'a'), 'right', 'b');
  assert.equal(state.completed, 1);
  state = action(action(state, 'right', 'a'), 'left', 'b');
  assert.equal(stage(state), 'complete');
  assert.equal(state.errors, 0);
});

test('round transitions, final single word and restarting reset the appropriate state', () => {
  const config = { roundSize: 2, total: 5 };
  let state = createSession(words, config, random());
  assert.equal(nextRound(state), state);
  state = solveRound(state);
  assert.equal(stage(state), 'round-complete');
  assert.equal(state.completed, 2);
  assert.equal(selectCard(state, 'left', currentRound(state).left[0].id).feedback, 'ignored');
  state = nextRound(state);
  assert.equal(state.roundIndex, 1);
  assert.deepEqual(state.solved, { left: [], right: [] });
  assert.equal(state.attempts, 2);
  state = nextRound(solveRound(state));
  assert.equal(currentRound(state).left.length, 1);
  state = solveRound(state);
  assert.equal(stage(state), 'complete');
  assert.equal(state.completed, 5);
  assert.equal(nextRound(state), state);
  const restarted = createSession(words, config, random());
  assert.equal(restarted.attempts, 0);
  assert.equal(restarted.completed, 0);
  assert.equal(restarted.roundIndex, 0);
  assert.equal(stage(solveRound(createSession(words, { roundSize: 5, total: 1 }, random()))), 'complete');
});
