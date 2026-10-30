import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { coursesForSubject } from '../src/data/catalog.ts';

test('mathematics import retains all five sections, seven proof steps and three questions', () => {
  const html = readFileSync(new URL('../src/content/mathematics/sqrt-two.html', import.meta.url), 'utf8');
  for (const id of ['grundidee', 'werkzeuge', 'beweis', 'uebungen', 'mitnehmen']) assert.ok(html.includes(`id="${id}"`));
  assert.equal((html.match(/class="proof-step(?: is-current)?"/g) ?? []).length, 7);
  assert.equal((html.match(/class="question"/g) ?? []).length, 3);
  assert.equal(coursesForSubject('mathematik')[0].href, 'mathematik/wurzel-2/');
  assert.equal(coursesForSubject('mathematik')[0].cover, 'sqrt-two');
});

test('the actual approximation data stays mathematically consistent', () => {
  const script = readFileSync(new URL('../src/scripts/sqrt-two.js', import.meta.url), 'utf8');
  const declaration = script.slice(script.indexOf('const approximations ='), script.indexOf('const approxButtons'));
  const values = runInNewContext(declaration + '\napproximations');
  assert.equal(values.length, 4);
  let previousDifference = Infinity;
  for (const value of values) {
    const number = Number(value.x.replace(',', '.'));
    const square = Number(value.square.replace(',', '.'));
    const difference = Number(value.difference.replace(',', '.'));
    assert.ok(Math.abs(number * number - square) < 1e-12);
    assert.ok(Math.abs(2 - square - difference) < 1e-12);
    assert.ok(difference > 0 && difference < previousDifference);
    previousDifference = difference;
  }
});
