import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { opticsAssessment, opticsChapters, evaluateAssessment } from '../src/data/optics.ts';
import { subjects, courses, coursesForSubject } from '../src/data/catalog.ts';

test('assessment covers every chapter with valid and independently explainable answers', () => {
  assert.deepEqual(new Set(opticsAssessment.map(q => q.chapter)), new Set(opticsChapters.map(chapter => chapter.id)));
  assert.equal(new Set(opticsAssessment.map(q => q.id)).size, opticsAssessment.length);
  for (const question of opticsAssessment) {
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.ok(question.explanation.length > 30);
  }
});

test('assessment distinguishes correct, wrong and unanswered questions', () => {
  const correct = Object.fromEntries(opticsAssessment.map(q => [q.id, q.answer]));
  assert.equal(evaluateAssessment(opticsAssessment, correct).filter(item => item.correct).length, 7);
  const mixed = { ...correct, [opticsAssessment[0].id]: 0 };
  delete mixed[opticsAssessment[1].id];
  const result = evaluateAssessment(opticsAssessment, mixed);
  assert.equal(result.filter(item => item.correct).length, 5);
  assert.equal(result[0].chapter, 'k1');
  assert.equal(result[1].correct, false);
  assert.equal(evaluateAssessment(opticsAssessment, {}).some(item => item.correct), false);
});

test('import retains every chapter question, written task, video and native simulation', () => {
  const html = readFileSync(new URL('../src/content/optics/chapters.html', import.meta.url), 'utf8');
  assert.equal((html.match(/class="css-mcq"/g) ?? []).length, 105);
  assert.equal((html.match(/<textarea /g) ?? []).length, 14);
  assert.equal((html.match(/class="css-sim"/g) ?? []).length, 7);
  assert.equal((html.match(/data-video-id=/g) ?? []).length, 7);
  for (const chapter of opticsChapters) assert.ok(html.includes(`id="${chapter.id}"`));
});

test('catalog keeps courses attached to real subjects and distinguishes empty subjects', () => {
  assert.equal(new Set(subjects.map(s => s.slug)).size, subjects.length);
  for (const course of courses) {
    assert.ok(subjects.some(s => s.slug === course.subject));
    assert.ok(!course.href.startsWith('/') && course.href.endsWith('/'));
  }
  assert.equal(coursesForSubject('physik').length, 1);
  assert.equal(coursesForSubject('mathematik').length, 2);
  assert.equal(coursesForSubject('geschichte').length, 0);
});
