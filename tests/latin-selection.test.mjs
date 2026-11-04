import assert from 'node:assert/strict';
import { test } from 'node:test';
import { vocabulary } from '../src/data/latin.ts';
import { buildExercises, checkAnswer, defaultFilters, emptyProgress, filterWords, normalizeGerman,
  normalizeLatin, retryExercise, recordProgress } from '../src/data/latin-learning.ts';
import { detectiveCases } from '../src/content/latin/activities.ts';
import { detectiveDistractors } from '../src/content/latin/choice-distractors.ts';

const rng = (seed = 7251) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const word = lemma => {
  const result = vocabulary.find(w => w.latin === lemma); assert.ok(result, lemma); return result;
};
const exercises = (mode, pool, total = pool.length, seed = 7251) => buildExercises(mode, pool, total, rng(seed), 'selection');
const normalize = (field, value) => field.kind === 'latin' ? normalizeLatin(value)
  : normalizeGerman(value.replace(/\s*\(.*?\)/g, '').trim());

test('all four selection variants have distinct options and exactly one correct option per field', () => {
  const before = structuredClone(vocabulary);
  for (const mode of ['workshop', 'detective', 'hunt', 'parcours']) {
    const pool = filterWords(vocabulary, mode, defaultFilters(), emptyProgress());
    const tasks = exercises(mode, pool, Math.min(pool.length, mode === 'workshop' ? 20 : 30));
    assert.deepEqual(tasks, exercises(mode, pool, Math.min(pool.length, mode === 'workshop' ? 20 : 30)));
    for (const task of tasks) {
      assert.equal(task.answerFormat, 'selection');
      for (const field of task.fields) {
        assert.ok(field.choices.length >= 2, `${mode}/${field.key} needs alternatives`);
        assert.equal(new Set(field.choices.map(value => normalize(field, value))).size, field.choices.length);
        assert.equal(field.choices.filter(choice => checkAnswer(field, choice) === 'correct').length, 1);
        assert.ok(field.choices.every(choice => checkAnswer(field, choice) !== 'review'));
        assert.equal(checkAnswer(field, ''), 'incorrect');
        if (field.kind === 'choice') assert.ok(field.choices.length <= 3);
        else assert.ok(field.choices.length <= (field.key === 'lemma' ? 12 : 10));
      }
    }
  }
  assert.deepEqual(vocabulary, before);
});

test('the complete authored contexts offer ten translations and twelve detective infinitives', () => {
  for (const mode of ['detective']) {
    const pool = filterWords(vocabulary, mode, defaultFilters(), emptyProgress());
    const tasks = exercises(mode, pool);
    assert.equal(tasks.length, detectiveCases.length);
    for (const task of tasks) {
      const field = task.fields.find(f => f.dimension === 'context');
      const lemma = vocabulary.find(w => w.id === task.wordId).latin;
      const authored = detectiveDistractors[lemma];
      assert.ok(authored.length >= 11);
      assert.equal(field.choices.length, 10);
      assert.ok(authored.every(choice => !field.answers.some(answer => normalize(field, answer) === normalize(field, choice))));
      assert.ok(field.choices.filter(choice => choice !== field.answers[0]).every(choice => authored.includes(choice)));
      if (mode === 'detective') assert.equal(task.fields.find(f => f.key === 'lemma').choices.length, 12);
      const retry = retryExercise(task, [field.key], rng(813));
      assert.equal(retry.fields[0].choices.length, 10, 'context survives retry IDs');
    }
  }
});

test('all 955 source words remain playable, including rare word types and sparse grammar', () => {
  const tasks = exercises('parcours', vocabulary);
  assert.equal(tasks.filter(task => task.title.startsWith('Etappe 1')).length, 955);
  for (const task of tasks) for (const field of task.fields) {
    assert.ok(field.choices.length >= 2, `${task.prompt}/${field.key}: no usable alternatives`);
    assert.equal(field.choices.filter(choice => checkAnswer(field, choice) === 'correct').length, 1, `${task.prompt}/${field.key}: ambiguous options`);
  }
});

test('selection keeps source variants, full multiword forms and only known grammatical questions', () => {
  const tasks = exercises('detective', [word('sequī'), word('esse'), word('incipere')]);
  const deponent = tasks.find(task => task.wordId === word('sequī').id);
  const perfect = deponent.fields.find(f => f.key === 'perfekt_1sg');
  assert.ok(perfect.choices.includes('secūtus sum'));
  assert.ok(!perfect.choices.includes('secūtus'));
  assert.ok(!perfect.choices.includes('secūta sum'), 'accepted variants never become distractors');
  assert.ok(!tasks.find(task => task.wordId === word('esse').id).fields.some(f => f.key === 'supinum'));
  const incipere = tasks.find(task => task.wordId === word('incipere').id).fields.find(f => f.key === 'perfekt_1sg');
  assert.equal(incipere.choices.filter(value => ['coepi', 'incepi'].includes(normalizeLatin(value))).length, 1);
  const hunt = exercises('hunt', [word('pulcher'), word('capere'), word('lēx')]);
  const adjective = hunt.find(task => task.prompt.startsWith('pulcher –')).fields.find(f => f.key === 'correction');
  assert.ok(adjective.choices.includes('pulchra, pulchrum'));
  assert.ok(adjective.choices.every(value => value.includes(', ')), 'adjective pairs remain complete');
  const correctClaim = hunt.find(task => task.prompt.startsWith('capere –'));
  assert.equal(checkAnswer(correctClaim.fields[0], 'Alles richtig'), 'correct');
  const partial = exercises('workshop', [word('amāre')])[0];
  assert.equal(partial.fields.filter(f => f.kind === 'latin').length, 1);
  const commonGender = exercises('parcours', [word('sacerdōs')]).find(task => task.title.startsWith('Etappe 2'))
    .fields.find(field => field.key === 'geschlecht');
  assert.ok(commonGender.choices.includes('männlich oder weiblich'));
  assert.equal(checkAnswer(commonGender, 'männlich oder weiblich'), 'correct');
  assert.equal(retryExercise({ ...partial, fields: [commonGender] }, ['geschlecht'], rng()).fields[0].choices.length, 2);
});

test('word filters limit questions while full vocabulary provides plausible wrong options', () => {
  const pool = filterWords(vocabulary, 'parcours', { ...defaultFilters(), partOfSpeech: 'Konjunktion' }, emptyProgress());
  const cum = pool.find(w => w.latin === 'cum');
  const tasks = exercises('parcours', [cum]);
  const meaning = tasks[0].fields[0];
  assert.ok(!meaning.choices.includes('mit'));
  assert.ok(!meaning.answers.includes('mit'));
  const single = exercises('workshop', [word('tollere')])[0];
  for (const field of single.fields) assert.equal(field.choices.length, 10, 'a single-word package still has a challenging option pool');
  for (let seed = 1; seed <= 10; seed++) {
    const tasks = exercises('parcours', [word('tollere'), word('ferre')], 2, seed);
    for (const task of tasks.filter(task => task.title.startsWith('Etappe 2'))) {
      const perfect = task.fields.find(field => field.key === 'perfekt_1sg');
      assert.ok(perfect.choices.includes(task.wordId === word('tollere').id ? 'tulī' : 'sustulī'), 'include the targeted stem confusion');
    }
    const meaning = tasks.find(task => task.wordId === word('tollere').id && task.title.startsWith('Etappe 1')).fields[0];
    assert.ok(!meaning.choices.includes('rauben'), 'overlapping senses must not become ambiguous distractors');
  }
  const meaningTask = exercises('parcours', [word('lēx')])[0].fields[0];
  assert.equal(meaningTask.choices.filter(option => meaningTask.answers.includes(option)).length, 1);
});

test('selection retries remain bounded, change their options and preserve skill identities', () => {
  const tasks = exercises('parcours', [word('ferre')]);
  const first = tasks[0];
  const retry = retryExercise(first, ['meaning'], rng(327));
  assert.ok(retry.retry); assert.equal(retry.answerFormat, 'selection');
  assert.equal(retry.fields.length, 1); assert.equal(retry.fields[0].skill, first.fields[0].skill);
  assert.notDeepEqual(retry.fields[0].choices, first.fields[0].choices);
  assert.notDeepEqual(tasks.at(-1).fields[0].choices, first.fields[0].choices);
  assert.doesNotMatch(retry.title, /ohne Hilfe/);
  const now = 1_800_000_000_000;
  const id = word('ferre').id;
  const progress = recordProgress(emptyProgress(), id, 'meaning', true, now);
  const assisted = recordProgress(progress, id, 'meaning', true, now + 86_400_000, true);
  assert.equal(assisted.words[id].meaning.streak, progress.words[id].meaning.streak);
  assert.equal(assisted.words[id].meaning.nextDue, progress.words[id].meaning.nextDue);
});

test('selection is the default and free answers still support German self-assessment', () => {
  assert.equal(buildExercises('workshop', [word('ferre')], 1, rng())[0].answerFormat, 'selection');
  const task = buildExercises('workshop', [word('ferre')], 1, rng(), 'input')[0];
  assert.equal(task.answerFormat, 'input');
  const meaning = task.fields.find(f => f.kind === 'german');
  assert.equal(meaning.choices, undefined); assert.equal(checkAnswer(meaning, 'Eine andere Umschreibung'), 'review');
  assert.equal(retryExercise(task, ['meaning']).fields[0].choices, undefined);
});
