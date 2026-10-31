import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const route = '/mathematik/museum-der-unendlichkeit/';

export async function testMuseum(browser, origin, screenshots) {
  const capture = screenshots || '/tmp/education-museum-review';
  await mkdir(capture, { recursive: true });
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url()); });
    await page.goto(origin + route);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.museum-room').count(), 3);
    assert.equal(await page.locator('h1').count(), 1);
    const referenceMarker = await page.locator('[data-reference-marker]').getAttribute('transform');
    await page.locator('[data-zoom-in]').click();
    assert.equal(await page.locator('[data-lower]').textContent(), '1,4');
    assert.match(await page.locator('[data-zoom-factor]').textContent(), /10¹-fach/);
    assert.equal(await page.locator('[data-zoom-exhibit]').getAttribute('data-zoom-animating'), null);
    assert.ok(Math.abs(Number(await page.locator('[data-reference-window]').getAttribute('width')) - 71.6) < 1e-8);
    assert.equal(await page.locator('[data-reference-marker]').getAttribute('transform'), referenceMarker);
    await page.locator('#zoom-depth').focus();
    await page.keyboard.press('End');
    assert.equal(await page.locator('[data-upper]').textContent(), '1,414213562373095048801689');
    assert.ok(await page.locator('[data-zoom-in]').isDisabled());
    assert.match(await page.locator('[data-reference-note]').textContent(), /kleiner als ein Pixel/);
    assert.ok(await page.locator('[data-reference-window]').evaluate(el => el.hasAttribute('data-hidden')));
    assert.ok(await page.locator('[data-reference-location]').isVisible());
    assert.match(await page.locator('[data-zoom-factor]').textContent(), /10²⁴-fach/);
    if ([1440, 390, 320].includes(width)) {
      await page.locator('[data-zoom-exhibit]').screenshot({ path: `${capture}/zoom-deep-${width}.png` });
    }
    await page.locator('[data-zoom-reset]').click();
    assert.equal(await page.locator('[data-lower]').textContent(), '1');
    assert.equal(await page.locator('[data-reference-window]').getAttribute('width'), '716');
    const overviewBox = await page.locator('.zoom-reference').boundingBox();
    const detailBox = await page.locator('.zoom-detail').boundingBox();
    if (width < 740) assert.ok(detailBox.y >= overviewBox.y + overviewBox.height);
    else assert.ok(detailBox.x > overviewBox.x);
    await page.locator('[data-orbit-many]').click();
    assert.equal(await page.locator('[data-orbit-unique="rational"]').textContent(), '5');
    assert.equal(await page.locator('[data-orbit-unique="irrational"]').textContent(), '101');
    await page.locator('#rational-step').selectOption('5/12');
    assert.equal(await page.locator('[data-orbit-count]').textContent(), '0 Schritte');
    await page.locator('[data-orbit-many]').click();
    assert.equal(await page.locator('[data-orbit-unique="rational"]').textContent(), '12');
    assert.match(await page.locator('.orbit-figure.rational svg').getAttribute('aria-label'), /Zyklus umfasst 12 Landepunkte/);
    await page.locator('[data-orbit-reset]').click();
    for (const kind of ['rational', 'irrational']) {
      const circle = await page.locator(`.orbit-figure.${kind} svg`).boundingBox();
      const step = await page.locator(`#${kind}-step`).boundingBox();
      assert.ok(step.y >= circle.y + circle.height, `${width}: step below ${kind} circle`);
      assert.ok(Math.abs(step.x + step.width / 2 - circle.x - circle.width / 2) < 1, `${width}: centered ${kind} step`);
    }
    const speed = page.locator('#orbit-speed');
    assert.equal(await speed.getAttribute('type'), 'range');
    assert.equal(await speed.inputValue(), '2');
    await speed.focus();
    await page.keyboard.press('Home');
    assert.equal(await speed.getAttribute('aria-valuetext'), '1 Schritt pro Sekunde');
    assert.equal(await page.locator('[data-orbit-speed]').textContent(), '1 Schritt/s');
    await page.keyboard.press('End');
    assert.equal(await speed.inputValue(), '60');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await speed.inputValue(), '59');
    assert.equal(await page.locator('[data-orbit-speed]').textContent(), '59 Schritte/s');
    await speed.fill('60');
    const tempoBounds = await page.locator('.orbit-tempo').boundingBox();
    const rowBounds = await page.locator('.orbit-controls').boundingBox();
    assert.ok(Math.abs(tempoBounds.x + tempoBounds.width - rowBounds.x - rowBounds.width) < 1, `${width}: tempo reaches right edge`);
    if (width >= 1024) {
      const actions = await page.locator('.orbit-controls .museum-actions').boundingBox();
      const tempo = await page.locator('.orbit-tempo').boundingBox();
      assert.ok(Math.abs(actions.y + actions.height / 2 - tempo.y - tempo.height / 2) < 1, `${width}: tempo beside actions`);
    }
    await page.locator('[data-orbit-play]').click();
    assert.equal(await page.locator('[data-orbit-play]').textContent(), 'Stopp');
    await page.waitForFunction(() => parseInt(document.querySelector('[data-orbit-count]').textContent) >= 6);
    const beforeSpeedChange = parseInt(await page.locator('[data-orbit-count]').textContent());
    await speed.fill('1');
    assert.equal(await page.locator('[data-orbit-play]').getAttribute('aria-pressed'), 'true');
    assert.ok(parseInt(await page.locator('[data-orbit-count]').textContent()) >= beforeSpeedChange);
    await page.locator('[data-orbit-play]').click();
    assert.equal(await page.locator('[data-orbit-play]').textContent(), 'Start');
    const stopped = await page.locator('[data-orbit-count]').textContent();
    await page.waitForTimeout(550);
    assert.equal(await page.locator('[data-orbit-count]').textContent(), stopped);
    assert.deepEqual(await page.locator('[data-hotel-mode]').evaluateAll(nodes => nodes.map(el => el.dataset.hotelMode)), ['one', 'bus']);
    await page.locator('[data-hotel-run]').click();
    assert.equal(await page.locator('[data-hotel-guest]').first().textContent(), 'Neu');
    await page.locator('[data-hotel-mode="bus"]').click();
    assert.match(await page.locator('[data-hotel-task]').textContent(), /unendlich vielen Gästen/);
    assert.match(await page.locator('[data-hotel-rule="existing"]').textContent(), /Zimmer n → Zimmer 2n/);
    assert.match(await page.locator('[data-hotel-rule="new"]').textContent(), /Busgast k → Zimmer 2k − 1/);
    const existingRule = await page.locator('[data-hotel-rule="existing"]').boundingBox();
    const newRule = await page.locator('[data-hotel-rule="new"]').boundingBox();
    assert.ok(width <= 740 ? newRule.y >= existingRule.y + existingRule.height + 31 : newRule.x >= existingRule.x + existingRule.width + 31);
    await page.locator('[data-hotel-run]').click();
    assert.equal(await page.locator('[data-hotel-guest]').nth(2).textContent(), 'B2');
    assert.equal(await page.locator('[data-hotel-guest]').nth(3).textContent(), '2');
    assert.equal(await page.locator('[data-hotel-run]').textContent(), 'Noch einmal abspielen');
    assert.match(await page.locator('[data-hotel-waiting-note]').textContent(), /Wartezone ist leer/);
    assert.equal(await page.locator('[data-hotel-mover]').count(), 0);
    if ([1440, 390, 320].includes(width)) await page.locator('[data-hotel-exhibit]').screenshot({ path: `${capture}/hotel-bus-${width}.png` });
    await page.locator('[data-diagonal-step]').click();
    assert.equal(await page.locator('[data-changed]').count(), 1);
    await page.locator('[data-diagonal-all]').click();
    assert.equal(await page.locator('[data-changed]').count(), 6);
    const digits = await page.locator('[data-diagonal-result]').textContent();
    const old = await page.locator('.diagonal-cell').allTextContents();
    digits.split(' ').forEach((digit, i) => assert.notEqual(digit, old[i]));
    await page.locator('[data-diagonal-reset]').click();
    assert.equal(await page.locator('[data-changed]').count(), 0);
    const quiz = page.locator('#zoom-quiz');
    await quiz.getByRole('button', { name: 'Antworten prüfen' }).click();
    assert.match(await quiz.locator('[data-quiz-summary]').textContent(), /0 von 2 beantwortet/);
    await quiz.locator('fieldset').first().locator('input').nth(1).check();
    await quiz.locator('fieldset').nth(1).locator('input').nth(1).check();
    await quiz.getByRole('button', { name: 'Antworten prüfen' }).click();
    assert.match(await quiz.locator('[data-quiz-summary]').textContent(), /2 richtig/);
    await quiz.getByRole('button', { name: 'Neu versuchen' }).click();
    assert.equal(await quiz.locator('input:checked').count(), 0);
    assert.equal(await page.locator('#museum-final input:checked').count(), 0);
    const final = page.locator('#museum-final');
    for (const field of await final.locator('fieldset').all()) await field.locator('input').first().check();
    await final.getByRole('button', { name: 'Antworten prüfen' }).click();
    assert.match(await final.locator('[data-quiz-summary]').textContent(), /4 von 4 beantwortet/);
    await page.locator('[data-zoom-in]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-lower]').textContent(), '1,4');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: no overflow`);
    const clipped = await page.locator('.museum-page button, .museum-page h1, .museum-page h2, .museum-page output, .diagonal-table').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent));
    assert.deepEqual(clipped, [], `${width}: no clipped controls or numbers`);
    assert.deepEqual(errors, []);
    if ([1440, 390, 320].includes(width)) {
      await page.locator('[data-orbit-many]').click();
      await page.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = false); window.scrollTo(0, 0); });
      await page.screenshot({ path: `${capture}/museum-${width}.png`, fullPage: true });
      await page.locator('[data-orbit-exhibit]').screenshot({ path: `${capture}/orbit-${width}.png` });
      await page.locator('[data-zoom-exhibit]').screenshot({ path: `${capture}/zoom-${width}.png` });
      await page.locator('[data-hotel-exhibit]').screenshot({ path: `${capture}/hotel-${width}.png` });
      await page.locator('[data-diagonal-all]').click();
      await page.locator('[data-diagonal-exhibit]').screenshot({ path: `${capture}/diagonal-${width}.png` });
    }
    await page.goto(origin + route + 'lernzettel/');
    assert.ok(await page.getByRole('link', { name: 'Zurück ins Museum' }).isVisible());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: guide fits`);
    if (width === 1440) {
      await page.pdf({path: `${capture}/museum-guide.pdf`, preferCSSPageSize: true});
      await page.emulateMedia({media: 'print'});
      assert.equal(await page.locator('.guide-actions').isVisible(), false);
    }
    await page.close();
    console.log(`Museum ${width}px: zoom, orbit animation, hotel, diagonal, quizzes, keyboard, layout and guide passed`);
  }
  // Exercise the spatial sequence with motion enabled; the main matrix above
  // deliberately uses reduced motion and must settle synchronously.
  const moving = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const motionErrors = [];
  moving.on('pageerror', error => motionErrors.push(error.message));
  await moving.goto(origin + route);
  await moving.locator('[data-zoom-in]').scrollIntoViewIfNeeded();
  await moving.evaluate(() => document.fonts.ready);
  await moving.waitForTimeout(100); // Let the initial ResizeObserver measurement settle.
  const exhibit = moving.locator('[data-zoom-exhibit]');
  async function settled(depth) {
    await moving.waitForFunction(d => {
      const el = document.querySelector('[data-zoom-exhibit]');
      return !el.hasAttribute('data-zoom-animating') && el.dataset.zoomDepth === String(d);
    }, depth);
  }
  await moving.locator('[data-zoom-in]').click();
  assert.equal(await exhibit.getAttribute('data-zoom-animating'), 'true');
  assert.ok(Number(await moving.locator('[data-detail-window]').getAttribute('width')) < 716);
  await moving.waitForTimeout(250);
  const expanding = Number(await moving.locator('[data-detail-window]').getAttribute('width'));
  assert.ok(expanding > 71.6 && expanding < 716);
  const sharedScale = await moving.evaluate(() => {
    const selection = document.querySelector('[data-detail-window]');
    const x = Number(selection.getAttribute('x'));
    const width = Number(selection.getAttribute('width'));
    const marker = Number(document.querySelector('[data-zoom-marker]').getAttribute('transform').match(/translate\(([^ ]+)/)[1]);
    return (marker - x) / width;
  });
  assert.ok(Math.abs(sharedScale - .14213562) < 1e-7);
  assert.equal(await moving.locator('[data-lower]').textContent(), '1');
  await exhibit.screenshot({ path: `${capture}/zoom-in-motion.png` });
  await settled(1);
  assert.equal(await moving.locator('[data-lower]').textContent(), '1,4');
  await moving.locator('[data-zoom-out]').click();
  assert.equal(await exhibit.getAttribute('data-zoom-animating'), 'true');
  await settled(0);
  await moving.locator('[data-zoom-in]').click();
  await moving.locator('[data-zoom-in]').click();
  await settled(2);
  assert.equal(await moving.locator('[data-lower]').textContent(), '1,41');
  await moving.locator('[data-zoom-in]').click();
  await moving.locator('[data-zoom-reset]').click();
  await settled(0);
  // A range jump cancels an active step, including beyond Number precision.
  await moving.locator('[data-zoom-in]').click();
  await moving.locator('#zoom-depth').fill('23');
  await settled(23);
  await moving.locator('[data-zoom-in]').click();
  await settled(24);
  assert.equal(await moving.locator('[data-upper]').textContent(), '1,414213562373095048801689');
  const markerX = Number((await moving.locator('[data-zoom-marker]').getAttribute('transform')).match(/translate\(([^ ]+)/)[1]);
  assert.ok(markerX > 42 && markerX < 758);
  await moving.locator('[data-zoom-out]').click();
  await moving.emulateMedia({ reducedMotion: 'reduce' });
  await settled(23);
  assert.equal(await moving.locator('[data-zoom-old-ticks]').getAttribute('opacity'), '0');
  await moving.locator('#zoom-depth').fill('3');
  assert.ok(await moving.locator('[data-reference-window]').evaluate(el => el.hasAttribute('data-hidden')));
  // One ten-thousandth is always subpixel; no invented minimum interval width.
  await moving.locator('#zoom-depth').fill('4');
  await moving.setViewportSize({ width: 320, height: 1000 });
  await moving.waitForTimeout(100);
  assert.match(await moving.locator('[data-reference-note]').textContent(), /nicht die Breite/);
  await moving.locator('[data-zoom-reset]').click();
  await moving.emulateMedia({ reducedMotion: 'no-preference' });
  await moving.locator('[data-zoom-in]').click();
  assert.equal(await exhibit.getAttribute('data-zoom-animating'), 'true');
  await settled(1);
  assert.equal(await moving.locator('[data-lower]').textContent(), '1,4');
  await moving.locator('#zoom-depth').focus();
  await moving.keyboard.press('ArrowRight');
  assert.equal(await exhibit.getAttribute('data-zoom-animating'), 'true');
  await settled(2);
  await moving.locator('[data-zoom-in]').click();
  await moving.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await settled(3);
  await moving.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await moving.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(motionErrors, []);
  await moving.close();
  // Both arrival scenarios use the same real, interruptible two-stage journey.
  for (const width of [1440, 1024, 768, 390, 320]) {
    const hotelPage = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'no-preference' });
    const hotelErrors = [];
    hotelPage.on('pageerror', error => hotelErrors.push(error.message));
    await hotelPage.goto(origin + route);
    await hotelPage.evaluate(() => document.fonts.ready);
    const hotel = hotelPage.locator('[data-hotel-exhibit]');
    const button = hotelPage.locator('[data-hotel-run]');
    async function phase(value) {
      await hotelPage.waitForFunction(expected => document.querySelector('[data-hotel-exhibit]').dataset.hotelPhase === expected, value);
    }
    for (const mode of ['one', 'bus']) {
      await hotelPage.locator(`[data-hotel-mode="${mode}"]`).click();
      await button.scrollIntoViewIfNeeded();
      await hotelPage.waitForTimeout(100);
      if (mode === 'one') {
        await button.focus();
        await hotelPage.keyboard.press('Enter');
      } else await button.click();
      await phase('moving');
      assert.ok(await button.isDisabled());
      assert.match(await hotelPage.locator('[data-hotel-waiting-title]').textContent(), /wart/);
      assert.equal(await hotelPage.locator('[data-hotel-mover]').count(), 8);
      assert.ok(await hotelPage.locator('[data-hotel-rule="existing"]').evaluate(el => el.hasAttribute('data-active')));
      const traveler = hotelPage.locator('[data-hotel-mover="1"]');
      const origin = await traveler.boundingBox();
      await hotelPage.waitForTimeout(350);
      const traveling = await traveler.boundingBox();
      assert.ok(Math.hypot(traveling.x - origin.x, traveling.y - origin.y) > 5);
      const targets = await hotelPage.locator('[data-hotel-mover]').evaluateAll(nodes => nodes.map(el => Number(el.dataset.hotelTarget)));
      assert.deepEqual(targets, mode === 'one' ? [2,3,4,5,6,7,8,9] : [2,4,6,8,10,12,14,16]);
      if ([1440, 320].includes(width)) await hotel.screenshot({ path: `${capture}/hotel-${mode}-moving-${width}.png` });
      await phase('vacant');
      const intermediate = await hotelPage.locator('[data-hotel-guest]').allTextContents();
      assert.deepEqual(intermediate, mode === 'one' ? ['—','1','2','3','4','5','6','7'] : ['—','1','—','2','—','3','—','4']);
      await phase('arriving');
      assert.equal(await hotelPage.locator('[data-hotel-mover]').count(), mode === 'one' ? 1 : 4);
      assert.ok(await hotelPage.locator('[data-hotel-rule="new"]').evaluate(el => el.hasAttribute('data-active')));
      if ([1440, 320].includes(width)) await hotel.screenshot({ path: `${capture}/hotel-${mode}-arriving-${width}.png` });
      await phase('complete');
      assert.deepEqual(await hotelPage.locator('[data-hotel-guest]').allTextContents(), mode === 'one' ? ['Neu','1','2','3','4','5','6','7'] : ['B1','1','B2','2','B3','3','B4','4']);
      assert.equal(await hotelPage.locator('[data-hotel-mover]').count(), 0);
      assert.ok(await button.isEnabled());
    }
    // Replay is a fresh initial arrangement; resetting cancels its pending work.
    await button.click();
    await phase('moving');
    await hotelPage.locator('[data-hotel-reset]').click();
    await phase('ready');
    assert.deepEqual(await hotelPage.locator('[data-hotel-guest]').allTextContents(), ['1','2','3','4','5','6','7','8']);
    assert.equal(await hotelPage.locator('[data-hotel-mover]').count(), 0);
    if (width === 1440) {
      await button.click();
      await phase('moving');
      await hotelPage.locator('[data-hotel-mode="one"]').click();
      await phase('ready');
      assert.deepEqual(await hotelPage.locator('[data-hotel-guest]').allTextContents(), ['1','2','3','4','5','6','7','8']);
      await button.click();
      await phase('arriving');
      await hotelPage.locator('[data-hotel-reset]').click();
      await phase('ready');
      await button.click();
      await phase('arriving');
      await hotelPage.locator('[data-hotel-mode="bus"]').click();
      await phase('ready');
      await button.click();
      await phase('moving');
      await hotelPage.emulateMedia({ reducedMotion: 'reduce' });
      await phase('complete');
      await hotelPage.emulateMedia({ reducedMotion: 'no-preference' });
      await button.click();
      await phase('moving');
      await hotelPage.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await phase('complete');
      await hotelPage.evaluate(() => { delete document.hidden; });
      await button.click();
      await phase('moving');
      await hotelPage.setViewportSize({ width: 1024, height: 1100 });
      await phase('complete');
      await button.click();
      await phase('moving');
      await hotelPage.evaluate(() => window.scrollTo(0, 0));
      await phase('complete');
    }
    assert.deepEqual(hotelErrors, []);
    assert.equal(await hotelPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await hotelPage.close();
    console.log(`Hotel ${width}px: moving guests, vacant rooms, arrivals, replay and cancellation passed`);
  }
  const noJS = await browser.newPage({javaScriptEnabled: false});
  await noJS.goto(origin + route);
  assert.ok(await noJS.locator('.museum-note').isVisible());
  assert.equal(await noJS.locator('.museum-room').count(), 3);
  assert.ok(await noJS.locator('.zoom-overview').isVisible());
  assert.match(await noJS.locator('.zoom-reference').textContent(), /Referenzintervall \[1, 2\]/);
  assert.match(await noJS.locator('[data-zoom-factor]').textContent(), /1-fach/);
  assert.ok(await noJS.locator('[data-zoom-in]').isDisabled());
  assert.ok(await noJS.locator('#orbit-speed').isDisabled());
  assert.equal(await noJS.locator('.hotel-resident .hotel-person-icon').count(), 8);
  assert.match(await noJS.locator('[data-hotel-rule="existing"]').textContent(), /n → Zimmer n \+ 1/);
  assert.ok(await noJS.locator('[data-hotel-run]').isDisabled());
  assert.equal(await noJS.locator('[data-orbit-speed]').textContent(), '2 Schritte/s');
  await noJS.locator('#zoom-quiz noscript summary').click();
  assert.ok(await noJS.locator('#zoom-quiz noscript details[open]').isVisible());
  await noJS.close();
}
