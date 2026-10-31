import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { courses, recentCourses } from '../src/data/catalog.ts';

test('recent courses handles empty, single, two, five and larger catalogs without mutation', () => {
  for (const size of [0, 1, 2, 5, 8]) {
    const entries = Array.from({ length: size }, (_, index) => ({ ...courses[0], slug: `course-${index}`, addedOrder: index + 1 }));
    // Catalog order is deliberately unrelated to publication order.
    const shuffled = entries.filter((_, index) => index % 2).concat(entries.filter((_, index) => !(index % 2)));
    const original = [...shuffled];
    const selected = recentCourses(shuffled);
    assert.equal(selected.length, Math.min(size, 5));
    assert.deepEqual(selected.map(course => course.addedOrder), Array.from({ length: Math.min(size, 5) }, (_, index) => size - index));
    assert.deepEqual(shuffled, original);
  }
});

test('published metadata identifies real learning pages and the newest lesson', () => {
  assert.deepEqual(recentCourses(courses).map(course => course.slug), ['museum-der-unendlichkeit', 'wurzel-2', 'optik']);
  assert.equal(new Set(courses.map(course => course.addedOrder)).size, courses.length);
  for (const course of courses) {
    assert.ok(Number.isInteger(course.addedOrder) && course.addedOrder > 0);
    assert.ok(course.shortTitle && course.artCaption && course.highlights.length);
    assert.ok(existsSync(new URL(`../src/pages/${course.href}index.astro`, import.meta.url)));
  }
});
