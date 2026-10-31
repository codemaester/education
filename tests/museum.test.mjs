import assert from 'node:assert/strict';
import { test } from 'node:test';
import { integerSqrt, sqrtTwoWindow, hotelAssignment, rotationPoint, diagonalDigit } from '../src/data/museum-math.ts';
import { roomQuestions, finalQuestions } from '../src/data/museum.ts';

test('all zoom windows strictly enclose sqrt(2), including beyond Number precision', () => {
  for (let d = 0; d <= 24; d++) {
    const { lower, upper, scale, fraction } = sqrtTwoWindow(d);
    assert.ok(lower * lower < 2n * scale * scale);
    assert.ok(upper * upper > 2n * scale * scale);
    assert.equal(upper - lower, 1n);
    assert.ok(fraction > 0 && fraction < 1);
  }
  assert.equal(sqrtTwoWindow(24).left, '1,414213562373095048801688');
  assert.equal(sqrtTwoWindow(24).right, '1,414213562373095048801689');
  assert.throws(() => sqrtTwoWindow(25), RangeError);
  for (const n of [0n, 1n, 2n, 99n, 100n, 101n, 10n ** 80n + 123n]) {
    const r = integerSqrt(n); assert.ok(r * r <= n && (r + 1n) ** 2n > n);
  }
});

test('successive zoom windows select exactly one tenth, without losing deep-window offsets', () => {
  for (let depth = 0; depth < 24; depth++) {
    const parent = sqrtTwoWindow(depth);
    const child = sqrtTwoWindow(depth + 1);
    assert.equal(child.scale, parent.scale * 10n);
    assert.ok(child.lower >= parent.lower * 10n);
    assert.ok(child.upper <= parent.upper * 10n);
    const offset = child.lower - parent.lower * 10n;
    assert.ok(offset >= 0n && offset <= 9n);
    assert.ok(Math.abs(parent.fraction - (Number(offset) + child.fraction) / 10) < 1e-8);
  }
  const parent = sqrtTwoWindow(23);
  const child = sqrtTwoWindow(24);
  assert.equal(child.lower - parent.lower * 10n, 8n);
  assert.equal(Number(child.lower) - Number(parent.lower * 10n), 0);
});

test('hotel guests retain their identity and leave exactly the right rooms for arrivals', () => {
  for (const mode of ['one', 'bus']) {
    const { moves, arrivals } = hotelAssignment(mode);
    assert.deepEqual(moves.map(move => move.guest), ['1', '2', '3', '4', '5', '6', '7', '8']);
    assert.equal(new Set(moves.map(move => move.room)).size, 8);
    assert.ok(moves.every(move => move.room === (mode === 'one' ? Number(move.guest) + 1 : Number(move.guest) * 2)));
    const visible = [...moves, ...arrivals].filter(move => move.room <= 8);
    assert.deepEqual(visible.map(move => move.room).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(new Set(visible.map(move => move.guest)).size, 8);
    assert.deepEqual(arrivals.map(move => move.room), mode === 'one' ? [1] : [1, 3, 5, 7]);
    assert.deepEqual(moves.filter(move => move.room > 8).map(move => move.room), mode === 'one' ? [9] : [10, 12, 14, 16]);
  }
});

test('rational rotation returns after denominator steps and all computed points lie on the circle', () => {
  for (const [p, q] of [[2, 5], [1, 3], [5, 12]]) {
    const start = rotationPoint(0, p / q);
    for (let n = 1; n <= q; n++) {
      const point = rotationPoint(n, p / q);
      assert.ok(Math.abs(Math.hypot(point.x - 160, point.y - 160) - 118) < 1e-10);
      const distance = Math.hypot(point.x - start.x, point.y - start.y);
      assert.ok(n === q ? distance < 1e-9 : distance > 1);
    }
  }
});

test('Cantor replacement differs from every possible diagonal digit and avoids 0/9 ambiguity', () => {
  for (let d = 0; d <= 9; d++) {
    assert.notEqual(diagonalDigit(d), d);
    assert.ok([1, 2].includes(diagonalDigit(d)));
  }
});

test('chapter checks and independent final assessment cover all three learning goals', () => {
  for (const set of [roomQuestions, finalQuestions]) {
    assert.deepEqual(new Set(set.map(q => q.room)), new Set(['zahlenzoom', 'kreiswanderer', 'hotel']));
    assert.equal(new Set(set.map(q => q.id)).size, set.length);
    for (const q of set) { assert.ok(q.options[q.answer]); assert.ok(q.explanation.length > 50); }
  }
});
