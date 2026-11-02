import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { adaptVocabulary, vocabulary } from '../src/data/latin.ts';
import { buildExercises, checkAnswer, decodeProgress, defaultFilters, emptyProgress, eligibleForMode,
  filterWords, formFields, additionalFields, grammarValues, lessonsFor, modes, normalizeLatin, packages,
  progressSummary, recordProgress, retryExercise, commonWordTypes, wordTypesForMode } from '../src/data/latin-learning.ts';
import { detectiveCases, missionCases, huntCases, formationGroups, thematicGroups, wordFamilies } from '../src/content/latin/activities.ts';

const word = lemma => {
  const entry = vocabulary.find(w => w.latin === lemma);
  assert.ok(entry, `Missing vocabulary: ${lemma}`); return entry;
};
const random = () => { let n = 1234; return () => ((n = (n * 1664525 + 1013904223) >>> 0) / 2 ** 32); };
const field = (w, key) => additionalFields(word(w)).find(f => f.key === key);

test('adapter preserves usage-specific meanings, grammar, notes and original IDs without mutating source', () => {
  const data = JSON.parse(readFileSync(new URL('../src/content/latin/vocabulary.json', import.meta.url)));
  const before = structuredClone(data);
  const words = adaptVocabulary(data);
  assert.deepEqual(data, before);
  assert.equal(words.length, 955);
  assert.deepEqual(word('cum').partsOfSpeech.sort(), ['Konjunktion', 'Präposition']);
  assert.equal(word('cum').usages.length, 3);
  assert.match(word('cum').usages[0].hinweis, /Ablativ/);
  assert.ok(grammarValues(word('capere'), 'supinum', 'Verb').includes('captum'));
  assert.equal(words.flatMap(w => w.sourceIds).length, 1037);
  assert.equal(words.filter(w => formFields(w).length === 3).length, 112);
  words[0].usages[0].bedeutungen.push('changed');
  assert.deepEqual(data, before);
});

test('lesson membership comes from each documented original ID, including later occurrences', () => {
  assert.deepEqual(lessonsFor(word('Graecus')), [14]);
  assert.deepEqual(lessonsFor(word('capere')), [6, 9, 14]);
  for (const w of vocabulary) assert.ok(lessonsFor(w).length, w.latin);
  for (let lesson = 1; lesson <= 23; lesson++) {
    const selected = filterWords(vocabulary, 'matching', { ...defaultFilters(), lesson }, emptyProgress());
    assert.ok(selected.length);
    assert.ok(selected.every(w => lessonsFor(w).includes(lesson)));
  }
});

test('overlapping packages combine with word type, lesson and progress filters', () => {
  const selected = filterWords(vocabulary, 'parcours', { ...defaultFilters(), packageId: 'theme:politics', partOfSpeech: 'Substantiv' }, emptyProgress());
  assert.ok(selected.some(w => w.latin === 'lēx'));
  assert.ok(selected.every(w => w.partsOfSpeech.includes('Substantiv')));
  const due = filterWords(vocabulary, 'workshop', { ...defaultFilters(), weakness: 'due' }, emptyProgress());
  assert.deepEqual(due, []);
  assert.deepEqual(filterWords(vocabulary, 'parcours', { ...defaultFilters(), packageId: 'unknown' }, emptyProgress()), []);
  const conjunction = filterWords(vocabulary, 'parcours', { ...defaultFilters(), partOfSpeech: 'Konjunktion' }, emptyProgress()).find(w => w.latin === 'cum');
  assert.ok(conjunction.meanings.includes('obwohl'));
  assert.ok(!conjunction.meanings.includes('mit'));
  assert.ok(!conjunction.usages.some(u => u.wortart === 'Präposition'));
  assert.ok(!filterWords(vocabulary, 'mission', { ...defaultFilters(), partOfSpeech: 'Konjunktion' }, emptyProgress()).some(w => w.latin === 'cum'));
});

test('learning packages are independent of grammatical word categories', () => {
  assert.deepEqual([...new Set(packages.map(pack => pack.group))], ['Wortschatz', 'Sachfelder', 'Bedeutung und Konstruktion']);
  for (const id of ['pos:Verb', 'pos:Substantiv', 'pos:Eigenname', 'structure', 'conj:a-Konjugation', 'decl:3. Deklination', 'deponents', 'adjective:two', 'formation:change', 'family:ferre']) {
    assert.ok(!packages.some(pack => pack.id === id), `${id} is no longer a package`);
    assert.deepEqual(filterWords(vocabulary, 'parcours', { ...defaultFilters(), packageId: id }, emptyProgress()), []);
  }
  const multiple = packages.find(pack => pack.id === 'polysemy');
  assert.equal(multiple.label, 'Mehrere Bedeutungen');
  assert.ok(multiple.matches(word('ferre')));
  assert.ok(multiple.matches(word('lēx')));
  assert.ok(multiple.matches(word('fortis')));
});

test('only common and mode-appropriate word types can be selected', () => {
  const general = ['Verb', 'Substantiv', 'Adjektiv', 'Pronomen', 'Adverb', 'Präposition', 'Konjunktion'];
  assert.deepEqual(commonWordTypes.map(option => option.value), general);
  const expected = { matching: general, workshop: ['Verb'], detective: ['Verb'], mission: ['Verb', 'Substantiv', 'Präposition'],
    hunt: ['Verb', 'Substantiv', 'Adjektiv', 'Präposition'], parcours: general };
  for (const { id: mode } of modes) {
    assert.deepEqual(wordTypesForMode(mode).map(option => option.value), expected[mode], mode);
    for (const option of wordTypesForMode(mode)) {
      const selected = filterWords(vocabulary, mode, { ...defaultFilters(), partOfSpeech: option.value }, emptyProgress());
      assert.ok(selected.length > 0, `${mode}/${option.value} has real tasks`);
      assert.ok(selected.every(word => word.usages.every(usage => usage.wortart === option.value)));
    }
    for (const value of ['Eigenname', 'Interjektion', 'Partikel', 'Zahlwort', 'Wendung', ...general.filter(pos => !expected[mode].includes(pos))]) {
      assert.deepEqual(filterWords(vocabulary, mode, { ...defaultFilters(), partOfSpeech: value }, emptyProgress()), []);
    }
  }
  assert.ok(filterWords(vocabulary, 'matching', defaultFilters(), emptyProgress()).some(word => word.partsOfSpeech.includes('Eigenname')), 'removing a selector does not remove vocabulary');
});

test('authored cases and explicit memberships refer to real vocabulary and contextual targets', () => {
  for (const c of [...detectiveCases, ...missionCases, ...huntCases]) word(c.lemma);
  for (const c of detectiveCases) {
    assert.ok(c.context.includes(c.form)); assert.ok(c.meanings.length); assert.ok(c.analysis);
  }
  for (const c of missionCases) {
    assert.ok(c.passage.includes(c.target)); assert.ok(c.meanings.length); assert.ok(c.explanation);
  }
  assert.ok(huntCases.every(c => c.correction), 'the presence of a correction field must not give away the verdict');
  for (const group of [formationGroups, thematicGroups, wordFamilies]) for (const p of Object.values(group)) {
    assert.ok(p.lemmas.length >= 2);
    for (const lemma of p.lemmas) word(lemma);
  }
});

test('five additional modes use only Latin prompts and known grammatical forms', () => {
  const before = structuredClone(vocabulary);
  for (const { id: mode } of modes.filter(m => m.id !== 'matching')) {
    const pool = vocabulary.filter(w => eligibleForMode(w, mode));
    assert.ok(pool.length > 0);
    const exercises = buildExercises(mode, pool, Math.min(6, pool.length), false, random());
    assert.ok(exercises.length >= 6, mode);
    for (const exercise of exercises) {
      assert.ok(exercise.prompt); assert.ok(exercise.fields.length);
      const w = vocabulary.find(w => w.id === exercise.wordId);
      assert.ok(w);
      for (const f of exercise.fields) {
        assert.ok(f.answers.length && f.answers.every(a => typeof a === 'string' && a.length));
        assert.equal(checkAnswer(f, f.answers[0]), 'correct');
      }
    }
    assert.deepEqual(exercises, buildExercises(mode, pool, Math.min(6, pool.length), false, random()));
    assert.throws(() => buildExercises(mode, pool, 0));
    assert.throws(() => buildExercises(mode, pool, pool.length + 1));
    assert.throws(() => buildExercises(mode, pool, 1.5));
  }
  assert.deepEqual(vocabulary, before);
});

test('workshop varies gaps, offers optional tiles, and never demands missing or impossible forms', () => {
  const pool = [word('ferre'), word('esse'), word('sequī'), word('amāre')];
  const exercises = buildExercises('workshop', pool, 4, true, random());
  for (const exercise of exercises) {
    const w = vocabulary.find(w => w.id === exercise.wordId);
    for (const f of exercise.fields.filter(f => f.kind === 'latin')) assert.ok(grammarValues(w, f.key, 'Verb').includes(f.answers[0]));
    assert.ok(exercise.tiles.length);
    assert.ok(exercise.fields.some(f => f.dimension === 'meaning'));
    if (w.latin === 'esse') {
      assert.ok(!exercise.fields.some(f => f.key === 'supinum'));
      assert.match(exercise.explanation, /kein Supinum/);
    }
    if (w.latin === 'sequī') assert.match(exercise.explanation, /Deponens/);
  }
  assert.equal(formFields(word('amāre')).length, 1);
  const seen = new Set();
  for (let seed = 1; seed < 10; seed++) {
    const task = buildExercises('workshop', [word('ferre')], 1, false, () => seed / 10)[0];
    seen.add(task.fields.map(f => f.key).join(',')); assert.equal(task.tiles, undefined);
  }
  assert.ok(seen.size > 1);
  assert.equal(eligibleForMode(word('est'), 'workshop'), false);
});

test('Latin input accepts absent macrons and source variants but rejects wrong forms', () => {
  assert.equal(normalizeLatin('  CE\u0304PI\u0304 '), 'cepi');
  const perfect = field('incipere', 'perfekt_1sg');
  assert.equal(checkAnswer(perfect, 'coepi'), 'correct');
  assert.equal(checkAnswer(perfect, 'incepi'), 'correct');
  assert.equal(checkAnswer(field('tollere', 'perfekt_1sg'), 'tuli'), 'incorrect');
  assert.equal(checkAnswer(field('sequī', 'perfekt_1sg'), 'secūtus sum'), 'correct');
  assert.equal(checkAnswer(field('sequī', 'perfekt_1sg'), 'secuta sum'), 'correct');
  assert.equal(checkAnswer(field('sequī', 'perfekt_1sg'), 'secutus'), 'incorrect');
  assert.equal(checkAnswer(field('lēx', 'geschlecht'), 'feminin'), 'correct');
  assert.equal(checkAnswer(field('lēx', 'geschlecht'), 'männlich'), 'incorrect');
});

test('German synonyms can be self-assessed and context answers do not inherit unrelated senses', () => {
  const meaning = buildExercises('parcours', [word('amīcus')], 1)[0].fields[0];
  assert.equal(checkAnswer(meaning, 'Freund'), 'correct');
  assert.equal(checkAnswer(meaning, 'ein Freund.'), 'correct');
  assert.equal(checkAnswer(meaning, 'ein guter Gefährte'), 'review');
  assert.equal(checkAnswer(meaning, ''), 'incorrect');
  const context = buildExercises('mission', [word('cum')], 1)[0];
  assert.equal(checkAnswer(context.fields[0], 'mit den Freunden'), 'correct');
  assert.equal(checkAnswer(context.fields[0], 'obwohl'), 'review');
  assert.equal(checkAnswer(context.fields.find(f => f.key === 'construction'), 'Akkusativ'), 'incorrect');
});

test('parcours has ordered stages and word-type-specific additional questions', () => {
  const selected = [word('ferre'), word('urbs'), word('pulcher'), word('ad')];
  const tasks = buildExercises('parcours', selected, 4, false, random());
  assert.ok(tasks.slice(0, 4).every(e => e.title.startsWith('Etappe 1') && e.fields.length === 1));
  assert.ok(tasks.slice(4, 8).every(e => e.title.startsWith('Etappe 2')));
  assert.ok(tasks.slice(8).every(e => e.title.startsWith('Etappe 3')));
  assert.deepEqual(additionalFields(word('urbs')).map(f => f.key), ['genitiv', 'genitiv_plural', 'geschlecht']);
  assert.ok(additionalFields(word('pulcher')).some(f => f.key === 'nominativ_weiblich'));
  assert.deepEqual(additionalFields(word('ad')).map(f => f.key), ['construction']);
  assert.deepEqual(additionalFields(word('cum')), [], 'different constructions are not merged into one unqualified case question');
  const hunt = buildExercises('hunt', [word('tollere')], 1);
  assert.equal(hunt.length, 2); assert.match(hunt[1].title, /frei abrufen/);
  const retry = retryExercise(hunt[1], ['perfekt_1sg']);
  assert.ok(retry.retry); assert.equal(retry.tiles, undefined); assert.deepEqual(retry.fields.map(f => f.key), ['perfekt_1sg']);
});

test('progress schedules each skill independently and immediate repetitions never inflate mastery', () => {
  const now = 1_800_000_000_000;
  let p = recordProgress(emptyProgress(), word('ferre').id, 'meaning', true, now);
  p = recordProgress(p, word('ferre').id, 'perfekt_1sg', false, now);
  assert.equal(p.words[word('ferre').id].meaning.streak, 1);
  assert.equal(p.words[word('ferre').id].perfekt_1sg.streak, 0);
  p = recordProgress(p, word('ferre').id, 'meaning', true, now + 1000);
  assert.equal(p.words[word('ferre').id].meaning.streak, 1);
  assert.equal(p.words[word('ferre').id].meaning.nextDue, now + 86_400_000, 'same-session answers never postpone a scheduled review');
  p = recordProgress(p, word('ferre').id, 'meaning', true, now + 86_400_000);
  assert.equal(p.words[word('ferre').id].meaning.streak, 2);
  assert.equal(p.words[word('ferre').id].meaning.nextDue, now + 4 * 86_400_000);
  const assisted = recordProgress(emptyProgress(), word('ferre').id, 'meaning', true, now, true);
  assert.equal(assisted.words[word('ferre').id].meaning.streak, 0);
  assert.deepEqual(progressSummary(p, now + 700_000), { practiced: 1, due: 1, weak: 1 });
  assert.deepEqual(filterWords(vocabulary, 'workshop', { ...defaultFilters(), weakness: 'perfekt_1sg' }, p).map(w => w.id), [word('ferre').id]);
  assert.deepEqual(decodeProgress(JSON.stringify(p)), p);
  for (const raw of [null, '{', 'null', '[]', '{}', '{"version":2,"words":{}}']) assert.deepEqual(decodeProgress(raw), emptyProgress());
  assert.deepEqual(decodeProgress(JSON.stringify({ version: 1, words: { [word('ferre').id]: { meaning: { attempts: -1 } }, '__proto__': {} } })), emptyProgress());
  assert.deepEqual(decodeProgress(JSON.stringify({ version: 1, words: { v000001: { constructor: { attempts: 1, correct: 1, streak: 1, lastReviewed: now, nextDue: now } } } })), emptyProgress());
});
