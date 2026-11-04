import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { vocabulary } from '../src/data/latin.ts';
import { PROGRESS_KEY, emptyProgress, recordProgress } from '../src/data/latin-learning.ts';

const route = '/sprachen/latein/vokabeltrainer/';
const modes = ['matching', 'workshop', 'detective', 'flashcards', 'hunt', 'parcours'];
const abort = mode => mode === 'matching' ? '[data-abort]' : mode === 'flashcards' ? '[data-flashcards-abort]' : '[data-activity-abort]';

export async function testLatinUsability(browser, origin, screenshots) {
  const capture = screenshots || '.impeccable/review';
  await mkdir(capture, { recursive: true });
  // Text-only enlargement exercises the original clipping defect, including
  // intrinsic widths that a narrower viewport alone would not reproduce.
  for (const width of [320, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await page.goto(origin + route);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    for (const mode of modes) {
      await page.locator(`.latin-mode-tile:has(input[value="${mode}"])`).click();
      await page.locator('[data-skip-settings]').click();
      assert.equal(await page.locator('[data-config-title]').evaluate(el => el === document.activeElement), true);
      const checkLayout = async state => {
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${mode}/${width}/${state}: enlarged text must reflow`);
        const clipped = await page.locator('.latin-mode-details > span, .latin-trainer button, .latin-trainer legend:not(.visually-hidden), .latin-range-heading').evaluateAll(nodes =>
          nodes.filter(el => el.clientWidth && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent.trim().slice(0, 100)));
        assert.deepEqual(clipped, [], `${mode}/${width}/${state}: enlarged text must not be clipped`);
      };
      await checkLayout('config');
      if (mode === 'matching' && width !== 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${capture}/latin-text-200-${width}.png`, fullPage: true });
      }
      await page.getByRole('button', { name: 'Training starten' }).click();
      await checkLayout('active');
      await page.locator(abort(mode)).click();
      await page.locator('[data-change-mode]').click();
    }
    await page.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true });
  const page = await context.newPage();
  await page.goto(origin + route);
  await page.locator('.latin-mode-tile:has(input[value="matching"])').tap();
  await page.locator('[data-skip-settings]').tap();
  await page.locator('input[name="roundSize"][value="10"]').check();
  assert.match(await page.locator('[data-matching-size-help]').textContent(), /5 Paare statt maximal 10/);
  assert.equal(await page.locator('#total-words').inputValue(), '5', 'clarification must preserve the requested word count');
  await page.getByRole('button', { name: 'Training starten' }).tap();
  assert.equal(await page.locator('[data-left] button').count(), 5);
  await page.locator('[data-abort]').tap();
  await page.locator('#total-words').fill('15');
  assert.match(await page.locator('[data-matching-size-help]').textContent(), /Erste Runde: 10 Paare/);
  await page.locator('[data-change-mode]').tap();
  await page.locator('.latin-mode-tile:has(input[value="detective"])').tap();
  await page.getByRole('button', { name: 'Training starten' }).tap();
  const groups = page.locator('.latin-selection-field');
  assert.ok(await groups.count() > 1);
  assert.equal(await page.locator('.latin-selection-field:visible').count(), 1);
  await groups.first().locator('button').first().tap();
  const saved = await page.locator('#latin-answer-0').inputValue();
  await page.locator('[data-field-next]').tap();
  await page.locator('[data-check-answer]').tap();
  assert.equal(await groups.nth(1).getAttribute('aria-invalid'), 'true', 'validation opens the first unanswered field');
  assert.equal(await groups.nth(1).locator('button').first().evaluate(el => el === document.activeElement), true);
  await page.locator('[data-field-previous]').tap();
  assert.equal(await page.locator('#latin-answer-0').inputValue(), saved);
  await page.locator('[data-field-next]').tap();
  await page.locator('[data-show-prompt]').tap();
  assert.equal(await page.locator('[data-activity-prompt]').evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('#latin-answer-0').inputValue(), saved);
  await page.locator('[data-reveal]').tap();
  await page.locator('[data-field-previous]').tap();
  assert.ok(await groups.first().isVisible(), 'graded fields remain navigable for review');
  assert.ok(await groups.first().locator('button').first().isDisabled());
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${capture}/latin-field-review-390.png`, fullPage: true });
  await context.close();

  // A correct supported answer must be discoverable separately from errors,
  // survive reload, and keep the conservative repetition schedule.
  const progress = recordProgress(emptyProgress(), vocabulary.find(w => w.latin === 'ferre').id, 'meaning', true, Date.now(), true);
  const stored = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await stored.goto(origin + route);
  await stored.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), { key: PROGRESS_KEY, progress });
  await stored.reload();
  await stored.locator('.latin-mode-tile:has(input[value="workshop"])').click();
  await stored.locator('.latin-saved-progress summary').click();
  assert.match(await stored.locator('[data-learning-summary]').textContent(), /0 mit Fehlern · 1 noch nicht frei bestätigt/);
  assert.match(await stored.locator('[data-due-list]').textContent(), /mit Hilfe richtig/);
  await stored.locator('#learning-weakness').selectOption('weak');
  assert.match(await stored.locator('[data-pool-size]').textContent(), /Keine passenden Wörter/);
  await stored.locator('#learning-weakness').selectOption('unconfirmed');
  assert.match(await stored.locator('[data-pool-size]').textContent(), /1 passende Wörter/);
  await stored.close();
  console.log('Latin usability: all six modes at 200% text, settings shortcut, actual pair count, field navigation/validation/touch and distinct supported progress passed');
}
