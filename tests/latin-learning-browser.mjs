import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { vocabulary } from '../src/data/latin.ts';
import { buildExercises, defaultFilters, filterWords, emptyProgress, PROGRESS_KEY, retryExercise } from '../src/data/latin-learning.ts';

const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const route = '/sprachen/latein/vokabeltrainer/';
const stripMacrons = text => text.normalize('NFD').replace(/\u0304/g, '').normalize('NFC');
const generalWordTypes = ['Verb', 'Substantiv', 'Adjektiv', 'Pronomen', 'Adverb', 'Präposition', 'Konjunktion'];
const wordTypesByMode = { matching: generalWordTypes, workshop: ['Verb'], detective: ['Verb'],
  flashcards: generalWordTypes, hunt: ['Verb', 'Substantiv', 'Adjektiv', 'Präposition'], parcours: generalWordTypes };

export async function testLatinLearning(browser, origin, screenshots) {
  const capture = screenshots || '.impeccable/review';
  await mkdir(capture, { recursive: true });
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin + route);
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-latin-trainer]');
    assert.equal(await root.getByRole('radio').count(), 6);
    assert.equal(await root.locator('.latin-mode-tile img').count(), 6);
    assert.equal(await root.locator('#learning-lesson').count(), 0);
    assert.equal(await root.locator('[data-pathway]').count(), 0);
    assert.equal(await page.locator('.latin-notes').count(), 0);
    assert.equal(await root.locator('input[name="trainingMode"]:checked').count(), 0);
    assert.ok(await root.locator('[data-training-options]').isHidden());
    assert.ok(await root.locator('[data-training-options]').evaluate(fieldset => fieldset.disabled));
    assert.equal(await root.locator('.latin-filter-details').count(), 0);
    await page.evaluate(async () => {
      const images = [...document.querySelectorAll('.latin-mode-tile img')];
      await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); }));
    });
    const take = async name => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${capture}/${name}.png`, fullPage: true });
    };
    if (width !== 320) await take(width === 1440 ? 'desktop' : 'mobile');
    // Enter opens the chosen tile without submitting the training form.
    const beforeImage = await root.locator('.latin-mode-tile:has(input[value="workshop"]) img').boundingBox();
    await root.getByRole('radio', { name: 'Stammformen-Werkstatt', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.ok(await root.locator('#training-mode-workshop').isChecked());
    assert.equal(await root.locator('.latin-mode-tile:visible').count(), 1);
    assert.ok(await root.locator('[data-training-options]').isVisible());
    assert.equal(await root.locator('#word-type').inputValue(), 'Verb');
    assert.ok(await root.locator('#word-type').isDisabled());
    assert.match(await root.locator('[data-word-type-note]').textContent(), /ausschließlich Verben/);
    assert.ok(await root.locator('[data-activity]').isHidden());
    const expanded = root.locator('.latin-mode-tile[data-expanded="true"]');
    const expandedImage = await expanded.locator('img').boundingBox();
    assert.ok(expandedImage.width > beforeImage.width || expandedImage.height > beforeImage.height, 'selected image becomes larger');
    assert.equal(await expanded.locator('.latin-mode-details > span').count(), 3);
    assert.ok(await expanded.locator('.latin-mode-details').isVisible());
    assert.ok(await expanded.locator('.latin-mode-description').isHidden());
    const tileBox = await expanded.boundingBox();
    const configBox = await root.locator('.latin-configuration').first().boundingBox();
    assert.ok(configBox.y >= tileBox.y + tileBox.height, 'configuration follows the expanded explanation');
    for (const id of ['learning-package', 'word-type', 'learning-weakness']) assert.ok(await root.locator(`#${id}`).isVisible());
    if (width > 900) {
      const pack = await root.locator('#learning-package').boundingBox();
      const type = await root.locator('#word-type').boundingBox();
      assert.ok(Math.abs(pack.y - type.y) < 1 && Math.abs(pack.height - type.height) < 1, 'the fixed-category hint does not misalign neighboring controls');
    }
    assert.equal(await root.locator('[data-training-options]').evaluate(node => getComputedStyle(node).borderTopWidth), '0px');
    assert.equal(await root.locator('.latin-configuration').first().evaluate(node => getComputedStyle(node).borderBottomWidth), '0px');
    assert.equal(await root.evaluate(node => node.getAnimations({ subtree: true }).length), 0, 'reduced motion has no spatial animation');
    if (width !== 320) await take(`expanded-workshop-${width}`);

    // Combined filters and a useful empty state instead of an unstartable session.
    await root.locator('[data-change-mode]').click();
    await root.locator('.latin-mode-tile:has(input[value="matching"])').click();
    assert.deepEqual(await root.locator('#learning-package optgroup').evaluateAll(groups => groups.map(group => group.label)), ['Wortschatz', 'Sachfelder', 'Bedeutung und Konstruktion']);
    const packageIds = await root.locator('#learning-package option').evaluateAll(options => options.map(option => option.value));
    assert.ok(packageIds.every(id => !/^(pos:|conj:|decl:|adjective:|formation:|family:|structure$|deponents$)/.test(id)));
    assert.equal(await root.locator('#learning-package option[value="polysemy"]').textContent(), 'Mehrere Bedeutungen');
    assert.equal(await root.locator('#word-type').inputValue(), '', 'a fixed verb mode does not constrain subsequent general training');
    assert.deepEqual(await root.locator('#word-type option').evaluateAll(options => options.map(option => option.value)), ['', ...generalWordTypes]);
    assert.ok(await root.locator('#word-type').isEnabled());
    if (width !== 320) await take(`expanded-matching-${width}`);
    await root.locator('#learning-package').selectOption('theme:politics');
    await root.locator('#word-type').selectOption('Substantiv');
    assert.match(await root.locator('[data-pool-size]').textContent(), /passende Wörter/);
    await root.locator('#learning-weakness').selectOption('perfekt_1sg');
    assert.match(await root.locator('[data-pool-size]').textContent(), /Keine passenden Wörter/);
    await root.getByRole('button', { name: 'Training starten' }).click();
    assert.match(await root.locator('#config-error').textContent(), /Keine passenden Wörter/);
    await root.locator('[data-clear-filters]').click();
    assert.equal(await root.locator('#word-type').inputValue(), '');
    assert.equal(await root.locator('#learning-weakness').inputValue(), '');
    await root.locator('#word-type').selectOption('Substantiv');

    for (const mode of ['workshop', 'detective', 'hunt', 'parcours']) {
      await root.locator('[data-change-mode]').click();
      assert.equal(await root.locator('.latin-mode-tile:visible').count(), 6);
      assert.ok(await root.locator('[data-training-options]').isHidden());
      await root.locator(`.latin-mode-tile:has(input[value="${mode}"])`).click();
      assert.ok(await root.locator(`#training-mode-${mode}`).isChecked());
      const fixedWordType = wordTypesByMode[mode].length === 1;
      assert.deepEqual(await root.locator('#word-type option').evaluateAll(options => options.map(option => option.value)), fixedWordType ? wordTypesByMode[mode] : ['', ...wordTypesByMode[mode]]);
      assert.equal(await root.locator('#word-type').isDisabled(), fixedWordType);
      assert.equal(await root.locator('#word-type').inputValue(), fixedWordType ? 'Verb' : '');
      assert.equal(await root.locator('[data-word-type-note]').isVisible(), fixedWordType);
      if (fixedWordType) {
        await root.locator('[data-clear-filters]').click();
        assert.equal(await root.locator('#word-type').inputValue(), 'Verb', 'reset retains the mandatory verb category');
      }
      assert.equal(await root.locator('#round-size').isVisible(), false);
      const available = filterWords(vocabulary, mode, defaultFilters(), emptyProgress());
      assert.equal(await root.locator('#total-words').inputValue(), String(Math.min(mode === 'workshop' ? 6 : 12, available.length)));
      const seed = 13579;
      await page.evaluate(seed => { Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); }, seed);
      await root.locator('#total-words').fill('2');
      const support = mode === 'workshop';
      if (support) await root.locator('#form-support').check();
      const pool = filterWords(vocabulary, mode, defaultFilters(), emptyProgress());
      const expected = buildExercises(mode, pool, 2, support, rng(seed));
      await root.getByRole('button', { name: 'Training starten' }).click();
      assert.ok(await root.locator('[data-config]').isHidden());
      let index = 0;
      let wrongOnce = mode === 'workshop';
      let reviewOnce = mode === 'parcours';
      while (await root.locator('[data-activity]').isVisible()) {
        assert.ok(index < 30, 'session remains bounded');
        const task = expected[index];
        assert.ok(task, `${mode}: unexpected exercise ${index}`);
        assert.equal(await root.locator('[data-activity-prompt]').textContent(), task.prompt);
        const before = await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY);
        await root.locator('[data-check-answer]').click();
        assert.equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), before, 'blank answers never update progress');
        assert.equal(await root.locator('[data-activity-next]').isVisible(), false);
        if (support && task.tiles?.length) {
          const input = root.locator('[data-answer-fields] input[lang="la"]').first();
          await input.focus();
          const tile = root.locator('[data-tiles] button').first();
          await tile.click(); assert.equal(await input.inputValue(), await tile.textContent());
          await tile.click(); assert.equal(await input.inputValue(), '');
        }
        if (mode === 'detective' && index === 0) {
          await root.locator('[data-hint]').click(); assert.ok((await root.locator('[data-activity-hints]').textContent()).length);
        }
        const failedKeys = [];
        let reviewIndex = -1;
        for (const [n, field] of task.fields.entries()) {
          const input = root.locator(`#latin-answer-${n}`);
          let answer = stripMacrons(field.answers[0]);
          if (wrongOnce && field.kind === 'latin') { answer = 'falscheform'; failedKeys.push(field.key); wrongOnce = false; }
          if (reviewOnce && field.kind === 'german') { answer = 'Eine unbekannte Umschreibung'; reviewIndex = n; reviewOnce = false; }
          if (field.choices) await input.selectOption(field.answers[0]); else await input.fill(answer);
        }
        if (index === 0 && width !== 320) await take(`${mode}-${width}`);
        await root.locator('[data-check-answer]').focus();
        await page.keyboard.press('Enter');
        assert.ok(await root.locator('[data-answer-report]').isVisible());
        if (reviewIndex >= 0) {
          assert.ok(await root.locator('[data-activity-next]').isHidden(), 'unrecognized German answers await self-assessment');
          await root.getByRole('button', { name: 'Sinngemäß richtig', exact: true }).click();
        }
        assert.ok(await root.locator('[data-activity-next]').isVisible());
        if (failedKeys.length) expected.splice(Math.min(expected.length, index + 3), 0, retryExercise(task, failedKeys));
        const committed = await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY);
        await root.locator('[data-reveal]').click();
        assert.equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), committed, 'grading is committed only once');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${mode} at ${width}px: overflow`);
        const clipped = await root.locator('input, select, button, h3').evaluateAll(nodes => nodes.filter(n => n.clientWidth && n.scrollWidth > n.clientWidth + 2).map(n => n.textContent));
        assert.deepEqual(clipped, [], `${mode} at ${width}px: clipped controls`);
        await root.locator('[data-activity-next]').click(); index++;
      }
      assert.equal(index, expected.length);
      assert.ok(await root.locator('[data-activity-result]').isVisible());
      assert.ok(await root.locator('[data-activity-stats] dd').count());
      assert.equal(await page.evaluate(() => document.activeElement.id), 'activity-result-title');
      const stored = JSON.parse(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY));
      assert.ok(Object.keys(stored.words).length);
      await root.locator('[data-activity-restart]').click();
      assert.ok(await root.locator('[data-activity]').isVisible());
      await root.locator('[data-activity-abort]').click();
      assert.ok(await root.locator('[data-config]').isVisible());
    }
    // Incompatible explicit choices are cleared on mode changes; compatible
    // choices survive. This prevents invisible filters from emptying a task bank.
    await root.locator('#word-type').selectOption('Pronomen');
    await root.locator('[data-change-mode]').click();
    await root.locator('.latin-mode-tile:has(input[value="hunt"])').click();
    assert.equal(await root.locator('#word-type').inputValue(), '');
    await root.locator('#word-type').selectOption('Substantiv');
    await root.locator('[data-change-mode]').click();
    await root.locator('.latin-mode-tile:has(input[value="parcours"])').click();
    assert.equal(await root.locator('#word-type').inputValue(), 'Substantiv');
    await page.reload();
    await root.locator('.latin-mode-tile:has(input[value="matching"])').click();
    await root.locator('.latin-saved-progress summary').click();
    assert.doesNotMatch(await root.locator('[data-learning-summary]').textContent(), /^0 Wörter/);
    await root.locator('[data-reset-progress]').click();
    assert.ok(await root.locator('[data-cancel-reset]').isVisible());
    await root.locator('[data-cancel-reset]').click();
    assert.ok(await root.locator('[data-cancel-reset]').isHidden());
    await root.locator('[data-reset-progress]').click();
    await root.locator('[data-reset-progress]').click();
    assert.match(await root.locator('[data-learning-summary]').textContent(), /^0 Wörter/);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY), null);
    assert.deepEqual(errors, [], `${width}px: advanced trainer browser errors`);
    await context.close();
    console.log(`Latin advanced ${width}px: four exercise modes, filters, tiles, retries, self-assessment, independent progress, reload and reset passed`);
  }
  for (const problem of ['blocked', 'corrupt']) {
    const page = await browser.newPage();
    await page.addInitScript(({ problem, key }) => {
      if (problem === 'blocked') for (const method of ['getItem', 'setItem', 'removeItem']) Storage.prototype[method] = () => { throw new DOMException('Unavailable', 'SecurityError'); };
      else localStorage.setItem(key, '{not-json');
    }, { problem, key: PROGRESS_KEY });
    await page.goto(origin + route);
    const root = page.locator('[data-latin-trainer]');
    if (problem === 'blocked') assert.match(await root.locator('[data-storage-note]').textContent(), /nicht verfügbar/);
    await root.locator('.latin-mode-tile:has(input[value="workshop"])').click();
    await root.locator('#total-words').fill('1');
    await root.getByRole('button', { name: 'Training starten' }).click();
    await root.locator('[data-reveal]').click();
    assert.ok(await root.locator('[data-activity-next]').isVisible());
    await root.locator('[data-activity-abort]').click();
    await root.locator('.latin-saved-progress summary').click();
    assert.doesNotMatch(await root.locator('[data-learning-summary]').textContent(), /^0 Wörter/);
    await page.close();
  }
  console.log('Latin advanced: blocked and corrupt browser storage recover without interrupting training');
  await testModeTransition(browser, origin);
}

async function testModeTransition(browser, origin) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + route);
    await page.waitForFunction(() => !document.querySelector('[data-settings]').disabled);
    const root = page.locator('[data-latin-trainer]');
    const opening = await root.evaluate(node => {
      node.querySelector('.latin-mode-tile:has(input[value="workshop"])').click();
      const animations = node.getAnimations({ subtree: true }).filter(animation => animation.effect.getTiming().duration === 420 || animation.effect.getTiming().duration === 240);
      for (const animation of animations) { animation.pause(); animation.currentTime = 180; }
      return { count: animations.length, hidden: node.querySelector('[data-training-options]').hidden,
        disabled: node.querySelector('[data-training-options]').disabled, opening: node.dataset.modeOpening };
    });
    assert.equal(opening.count, 2, 'the selected tile zooms and its explanation appears');
    assert.deepEqual([opening.hidden, opening.disabled, opening.opening], [true, true, 'true']);
    await root.evaluate(node => node.querySelector('[data-config]').requestSubmit());
    assert.ok(await root.locator('[data-activity]').isHidden(), 'pending selection cannot start training');
    await root.evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
    await page.waitForFunction(() => !document.querySelector('[data-training-options]').hidden);
    assert.equal(await root.getAttribute('data-mode-opening'), 'false');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

    // Cancel a pending zoom, choose another mode, and ensure the old completion
    // cannot reveal configuration for an abandoned selection.
    const interrupted = await root.evaluate(node => {
      node.querySelector('[data-change-mode]').click();
      node.querySelector('.latin-mode-tile:has(input[value="hunt"])').click();
      const old = node.getAnimations({ subtree: true });
      old.forEach(animation => animation.pause());
      node.querySelector('[data-change-mode]').click();
      node.querySelector('.latin-mode-tile:has(input[value="detective"])').click();
      node.getAnimations({ subtree: true }).forEach(animation => animation.pause());
      return { hidden: node.querySelector('[data-training-options]').hidden, selected: node.querySelector('input[name="trainingMode"]:checked').value,
        cancelled: old.every(animation => animation.playState === 'idle') };
    });
    assert.deepEqual(interrupted, { hidden: true, selected: 'detective', cancelled: true });
    assert.ok(await root.locator('[data-training-options]').isHidden());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('[data-training-options]').hidden);
    assert.equal(await root.locator('#training-mode-detective').isChecked(), true);
    assert.equal(await root.locator('.latin-mode-tile:visible').count(), 1);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Latin mode zoom: animation sequencing, pending-submit guard, interruption and live reduced-motion preference passed');
}
