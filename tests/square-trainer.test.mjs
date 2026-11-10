import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTasks, answerFor, expressionFor, isCorrect, repeatTask } from '../src/data/square-trainer.ts';

test('rounds cover every requested pair exactly once in both directions', () => {
  for (const mode of ['mixed', 'square', 'root']) for (const [min, max] of [[1,20], [1,10], [11,20]]) {
    const tasks = createTasks(mode, min, max);
    assert.equal(tasks.length, (max-min+1) * (mode === 'mixed' ? 2 : 1));
    assert.equal(new Set(tasks.map(t => `${t.n}-${t.kind}`)).size, tasks.length);
    for (const task of tasks) {
      assert.ok(task.n >= min && task.n <= max);
      assert.equal(answerFor(task), task.kind === 'square' ? task.n ** 2 : task.n);
      assert.equal(expressionFor(task), task.kind === 'square' ? `${task.n}²` : `√${task.n ** 2}`);
      assert.ok(isCorrect(task, String(answerFor(task))));
      assert.ok(!isCorrect(task, String(answerFor(task) + 1)));
      assert.equal(task.repeated, false);
    }
  }
});

test('only whole numeric answers are accepted; square roots have positive answers', () => {
  const task = { n: 12, kind: 'root', repeated: false };
  for (const answer of ['', ' ', '-12', '±12', '12.0', '12abc', '1e1', '144']) assert.equal(isCorrect(task, answer), false, answer);
  assert.ok(isCorrect(task, '12'));
  assert.ok(isCorrect(task, '012'));
  assert.equal(answerFor({ n: 20, kind: 'square' }), 400);
});

test('missed tasks are spaced, retain their direction and are retried until solved', () => {
  const task = { n: 17, kind: 'square', repeated: false };
  const original = createTasks('root', 1, 5);
  const retry = repeatTask(original, task);
  assert.equal(original.length, 5);
  assert.deepEqual(retry[3], { ...task, repeated: true });
  assert.deepEqual(retry.filter((_, i) => i !== 3), original);
  assert.deepEqual(repeatTask([], task), [{ ...task, repeated: true }]);
  let queue = createTasks('mixed');
  const total = queue.length;
  let mastered = 0, seen = new Set();
  while (queue.length) {
    const current = queue.shift();
    const key = `${current.n}-${current.kind}`;
    if (!seen.has(key)) { seen.add(key); queue = repeatTask(queue, current); }
    else { mastered++; }
  }
  assert.equal(mastered, total);
});
