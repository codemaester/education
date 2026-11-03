import assert from 'node:assert/strict';
import { vocabulary } from '../src/data/latin.ts';
import { flashcardDetails } from '../src/data/latin-flashcards.ts';
export async function testLatinFlashcards(browser, origin, screenshots) {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: width === 390 ? 'no-preference' : 'reduce' });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin + '/sprachen/latein/vokabeltrainer/');
    const root = page.locator('[data-latin-trainer]');
    assert.equal(await root.locator('input[value="mission"]').count(), 0);
    await root.locator('.latin-mode-tile:has(input[value="flashcards"])').click();
    await root.locator('[data-training-options]').waitFor({ state: 'visible' });
    assert.ok(await root.locator('[data-answer-format-settings]').isHidden());
    await root.locator('#total-words').fill('3');
    await root.getByRole('button', { name: 'Training starten' }).click();
    const firstRound = [], secondRound = [];
    let attempts = 0;
    while (await root.locator('[data-flashcards-result]').isHidden()) {
      assert.ok(attempts < 10, 'deck must terminate after all cards are correct');
      const latin = await root.locator('[data-flashcard-word]').textContent();
      const word = vocabulary.find(w => w.latin === latin);
      assert.ok(word);
      assert.equal(await root.locator('[data-flashcard-back]').getAttribute('aria-hidden'), 'true');
      assert.ok(await root.locator('[data-flashcard-ratings]').isVisible());
      const card = root.locator('[data-flashcard]');
      assert.equal(await card.getAttribute('aria-labelledby'), 'flashcard-front');
      if (width !== 390) assert.equal(await card.locator('.latin-flashcard-inner').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
      await card.focus(); await page.keyboard.press('Space');
      assert.equal(await card.getAttribute('aria-pressed'), 'true');
      assert.equal(await card.getAttribute('aria-labelledby'), 'flashcard-back');
      assert.equal(await root.locator('[data-flashcard-front]').getAttribute('aria-hidden'), 'true');
      assert.equal(await root.locator('[data-flashcard-meaning]').textContent(), word.meanings.join('; '));
      for (const detail of flashcardDetails(word)) assert.ok((await root.locator('[data-flashcard-forms]').textContent()).includes(detail.value));
      if (attempts === 0) {
        await page.keyboard.press('Enter');
        assert.ok(await root.locator('[data-flashcard-ratings]').isVisible());
        await page.keyboard.press('Enter');
        if (width === 390) {
          assert.notEqual(await card.locator('.latin-flashcard-inner').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
        }
        if (screenshots) { await page.waitForTimeout(600); await page.screenshot({ path: `${screenshots}/flashcards-back-${width}.png`, fullPage: true }); }
      }
      if (attempts < 3) firstRound.push(latin); else if (attempts < 5) secondRound.push(latin);
      const correct = ![0, 1, 3].includes(attempts);
      await root.locator(correct ? '[data-flashcard-correct]' : '[data-flashcard-wrong]').click();
      attempts++;
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}px overflow`);
    }
    assert.equal(attempts, 6);
    assert.deepEqual(secondRound, firstRound.slice(0, 2));
    assert.equal(await root.locator('[data-flashcards-progress]').getAttribute('value'), '3');
    assert.match(await root.locator('[data-flashcards-result-text]').textContent(), /3 Karten in 3 Runden/);
    await root.locator('[data-flashcards-restart]').click();
    assert.equal(await root.locator('[data-flashcards-progress]').getAttribute('value'), '0');
    await root.locator('[data-flashcard-correct]').click();
    assert.equal(await root.locator('[data-flashcards-progress]').getAttribute('value'), '1');
    await root.locator('[data-flashcard-wrong]').click();
    assert.equal(await root.locator('[data-flashcards-progress]').getAttribute('value'), '1');
    assert.equal(await root.locator('[data-flashcards-status]').count(), 0);
    await root.locator('[data-flashcards-abort]').click();
    assert.ok(await root.locator('[data-config]').isVisible());
    await root.locator('[data-change-mode]').click();
    await root.locator('.latin-mode-tile:has(input[value="workshop"])').click();
    await root.locator('[data-training-options]').waitFor({ state: 'visible' });
    assert.ok(await root.locator('[data-answer-format-settings]').isVisible());
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`Vokabelkarten ${width}px: reveal, source solutions, keyboard, repeated rounds, completion, restart and mode switch passed`);
  }
}
