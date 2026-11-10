import assert from 'node:assert/strict';
import { test } from 'node:test';
import { simplifyRadical, rootInterval, numericAnswer, radicalText } from '../src/data/roots-math.ts';
import { rootChapters } from '../src/data/roots-lesson.ts';
import { chapterExercises, finalExercises } from '../src/data/roots-exercises.ts';

test('radical factorization preserves the radicand and leaves a square-free rest', () => {
  for (let n = 0; n <= 2000; n++) {
    const { factor, rest } = simplifyRadical(n);
    assert.equal(factor*factor*rest,n);
    for (let p = 2; p*p <= rest; p++) assert.notEqual(rest % (p*p),0);
  }
  assert.deepEqual(simplifyRadical(72), {factor:6,rest:2});
  assert.deepEqual(simplifyRadical(147), {factor:7,rest:3});
  for (const n of [-1,1.5,Infinity,NaN]) assert.throws(() => simplifyRadical(n),RangeError);
  assert.equal(radicalText(-1,2),'−√2');
  assert.equal(radicalText(0,2),'0');
  assert.equal(radicalText(5,1),'5');
});

test('decimal intervals use exact boundary squares and remain nested', () => {
  const parse = s => Number(s.replace(',','.'));
  for (const n of [0,1,2,3,4,5,7,10,20,50,81]) {
    let previousLow = 0, previousHigh = Infinity;
    for (let digits = 0; digits <= 6; digits++) {
      const bounds = rootInterval(n,digits), low = parse(bounds.lower), high = parse(bounds.upper);
      assert.ok(low >= previousLow && high <= previousHigh);
      // Verify scaled integer squares, without floating-point comparisons.
      const lowInt = BigInt(bounds.lower.replace(',','')), highInt = BigInt(bounds.upper.replace(',',''));
      const target = BigInt(n) * 10n ** BigInt(2*digits);
      assert.ok(lowInt*lowInt <= target && highInt*highInt >= target);
      assert.equal(lowInt*lowInt === target,bounds.exact);
      assert.equal(highInt-lowInt,bounds.exact ? 0n : 1n);
      previousLow = low; previousHigh = high;
    }
  }
  assert.deepEqual(rootInterval(7,3),{lower:'2,645',upper:'2,646',lowerSquare:'6,996025',upperSquare:'7,001316',width:'0,001',exact:false});
  for (const args of [[-1,2],[7,-1],[7,7],[7,1.5]]) assert.throws(() => rootInterval(...args));
});

test('numeric free entry accepts German decimal notation and rejects expressions and malformed input', () => {
  for (const input of ['2,65','2.65',' 2,650 ']) assert.ok(numericAnswer(input,2.65));
  assert.ok(numericAnswer('−2',-2));
  assert.ok(numericAnswer('-1',-1));
  for (const input of ['', ' ', '2,6', '2,65abc', 'sqrt(7)', '1/2', 'Infinity', '2e0', '2,65.0']) assert.equal(numericAnswer(input,2.65),false,input);
  assert.equal(numericAnswer('',0),false);
});

test('all six topics have five chapter tasks, separate final questions, learning goals and explained solutions', () => {
  assert.equal(rootChapters.length,6);
  assert.equal(chapterExercises.length,30);
  assert.equal(finalExercises.length,12);
  const all = [...chapterExercises,...finalExercises];
  assert.equal(new Set(all.map(e => e.id)).size,42);
  for (const chapter of rootChapters) {
    assert.equal(chapterExercises.filter(e => e.chapter === chapter.id).length,5);
    assert.equal(finalExercises.filter(e => e.chapter === chapter.id).length,2);
    assert.ok(chapter.goal && chapter.steps.length >= 3 && chapter.formula && chapter.summary && chapter.mistake);
  }
  for (const exercise of all) {
    assert.ok(exercise.goal && exercise.solution && exercise.explanation);
    assert.ok(exercise.fields.length >= 1 && exercise.fields.every(f => Number.isFinite(f.answer)));
    assert.ok(rootChapters.some(c => c.id === exercise.chapter));
  }
  // Independently verify the transfer tasks and the nested decimal example.
  assert.ok(Math.abs(finalExercises.find(e => e.id === 'final-sum-2').fields[0].answer - (Math.sqrt(75)-3*Math.sqrt(12))/Math.sqrt(3)) < 1e-12);
  assert.ok(Math.abs(chapterExercises.find(e => e.id === 'nested-4').fields[0].answer - Math.sqrt(Math.sqrt(.0016))) < 1e-12);
});
