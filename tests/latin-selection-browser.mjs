import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { vocabulary } from '../src/data/latin.ts';
import { buildExercises, checkAnswer, defaultFilters, emptyProgress, filterWords, PROGRESS_KEY, retryExercise } from '../src/data/latin-learning.ts';

const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

export async function testLatinSelection(browser, origin, screenshots) {
  const capture = screenshots || '.impeccable/review';
  await mkdir(capture, { recursive: true });
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', hasTouch: width < 600 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/sprachen/latein/vokabeltrainer/');
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-latin-trainer]');
    for (const mode of ['workshop', 'detective', 'hunt', 'parcours']) {
      await root.locator(`.latin-mode-tile:has(input[value="${mode}"])`).click();
      assert.ok(await root.locator('#answer-format').isChecked(), 'predefined answers are the default');
      assert.equal(await root.locator('#form-support').count(), 0);
      await root.locator('#total-words').fill('5');
      const seed = 93561;
      const random = rng(seed);
      const pool = filterWords(vocabulary, mode, defaultFilters(), emptyProgress());
      const expected = buildExercises(mode, pool, Math.min(5, pool.length), random, 'selection');
      await page.evaluate(seed => { Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); }, seed);
      await root.getByRole('button', { name: 'Training starten' }).click();
      let index = 0;
      let retryCount = 0;
      while (await root.locator('[data-activity]').isVisible()) {
        assert.ok(index < 40, 'even repeated errors must end the session');
        const task = expected[index]; assert.ok(task, `${mode}: expected task ${index}`);
        if (task.retry) retryCount++;
        assert.equal(await root.locator('[data-activity-prompt]').textContent(), task.prompt);
        assert.ok(await root.locator('[data-answer-help]').isVisible());
        assert.equal(await root.locator('[data-answer-fields] textarea, [data-answer-fields] input:not([type="hidden"]), [data-answer-fields] select').count(), 0);
        assert.equal(await root.locator('[data-tiles] button').count(), 0);
        const before = await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY);
        await root.locator('[data-check-answer]').click();
        assert.equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), before);
        assert.ok(await root.locator('[data-activity-next]').isHidden());
        assert.equal(await root.locator('.latin-selection-field').first().getAttribute('aria-invalid'), 'true');
        assert.equal(await root.locator('.latin-answer-option').first().evaluate(button => button === document.activeElement), true);
        const failedKeys = [];
        for (const [n, field] of task.fields.entries()) {
          if (n > 0) await root.locator('[data-field-next]').click();
          const group = root.locator('.latin-selection-field').nth(n);
          assert.ok(await group.isVisible());
          assert.equal(await root.locator('.latin-selection-field:visible').count(), 1, 'only the current answer group is shown');
          assert.equal(await group.locator('legend').textContent(), field.label);
          assert.deepEqual(await group.locator('button').allTextContents(), field.choices);
          if (index === 0 && n === 0) {
            const option = group.locator('button').first();
            await option.focus(); await page.keyboard.press('Space');
            assert.equal(await option.getAttribute('aria-pressed'), 'true');
            await page.keyboard.press('Enter');
            assert.equal(await option.getAttribute('aria-pressed'), 'false');
            assert.equal(await root.locator(`#latin-answer-${n}`).inputValue(), '');
            assert.ok(await root.locator('[data-answer-report]').isHidden(), 'selection alone never grades');
            await page.keyboard.press('Tab');
            assert.equal(await group.locator('button').nth(1).evaluate(button => button === document.activeElement), true);
          }
          const wrong = n === 0 && (index === 0 || mode === 'workshop' && task.retry);
          const answer = field.choices.find(choice => checkAnswer(field, choice) === (wrong ? 'incorrect' : 'correct'));
          assert.ok(answer, `${mode}/${field.key}: selectable answer`);
          const option = group.getByRole('button', { name: answer, exact: true });
          if (width < 600) await option.tap(); else await option.click();
          assert.equal(await option.getAttribute('aria-pressed'), 'true');
          assert.equal(await group.locator('[aria-pressed="true"]').count(), 1);
          if (index === 0 && n === 0) {
            await option.click(); assert.equal(await option.getAttribute('aria-pressed'), 'false');
            await option.click();
          }
          if (wrong) failedKeys.push(field.key);
        }
        if (task.fields.length > 1) {
          const lastValue = await root.locator(`#latin-answer-${task.fields.length - 1}`).inputValue();
          await root.locator('[data-field-previous]').click();
          await root.locator('[data-field-next]').click();
          assert.equal(await root.locator(`#latin-answer-${task.fields.length - 1}`).inputValue(), lastValue, 'field navigation preserves selections');
          assert.match(await root.locator('[data-field-status]').textContent(), new RegExp(`${task.fields.length} von ${task.fields.length} ausgewählt`));
        }
        if (index === 0 && width !== 320) {
          await root.locator('[data-activity-title]').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${capture}/selection-${mode}-${width}.png`, fullPage: true });
        }
        await root.locator('[data-check-answer]').click();
        assert.ok(await root.locator('[data-answer-report]').isVisible());
        assert.equal(await root.locator('.latin-self-check').count(), 0, 'selection never asks for German self-assessment');
        assert.ok(await root.locator('[data-activity-next]').isVisible());
        assert.equal(await root.locator('.latin-answer-option:enabled').count(), 0, 'graded choices are locked');
        if (failedKeys.length && !task.retry) expected.splice(Math.min(expected.length, index + 3), 0, retryExercise(task, failedKeys, random));
        const stored = JSON.parse(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY));
        assert.ok(Object.values(stored.words).every(skills => Object.values(skills).every(skill => skill.streak === 0)), 'selection counts as assisted practice');
        const committed = JSON.stringify(stored);
        await root.locator('[data-reveal]').click();
        assert.equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), committed, 'each result is committed once');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${mode}/${width}: overflow`);
        const clipped = await root.locator('.latin-answer-option, .latin-selection-field legend').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent));
        assert.deepEqual(clipped, [], `${mode}/${width}: clipped options`);
        await root.locator('[data-activity-next]').click(); index++;
      }
      assert.equal(index, expected.length); assert.equal(retryCount, 1, 'an incorrect first answer yields exactly one retry');
      await root.locator('[data-activity-restart]').click();
      assert.ok(await root.locator('[data-answer-help]').isVisible(), 'restart retains selection');
      await root.locator('[data-activity-abort]').click();
      assert.ok(await root.locator('#answer-format').isChecked());
      await root.locator('[data-change-mode]').click();
    }
    await root.locator('.latin-mode-tile:has(input[value="matching"])').click();
    assert.ok(await root.locator('[data-answer-format-settings]').isHidden());
    await root.locator('[data-change-mode]').click();
    await root.locator('.latin-mode-tile:has(input[value="workshop"])').click();
    await root.locator('#answer-format').uncheck();
    assert.equal(await root.locator('#form-support').count(), 0);
    await root.locator('#total-words').fill('5');
    await root.getByRole('button', { name: 'Training starten' }).click();
    assert.ok(await root.locator('[data-answer-fields] textarea').isVisible(), 'returning to typing restores free German answers');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`Latin selection ${width}px: all four variants, keyboard/touch, grading, bounded retries, supported progress and restart passed`);
  }
}
