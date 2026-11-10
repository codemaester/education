import assert from 'node:assert/strict';

export async function testSquareTrainer(browser, origin, screenshots) {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin + '/mathematik/quadratwurzeln/');
    const input = page.locator('#sq-answer');
    const submit = page.locator('#sq-submit');
    const expr = page.locator('#sq-expression');
    const result = async () => {
      const text = await expr.textContent();
      return text.startsWith('√') ? String(Math.sqrt(Number(text.slice(1)))) : String(Number(text.slice(0,-1)) ** 2);
    };
    assert.equal(await input.getAttribute('inputmode'), 'numeric');
    assert.equal(await page.locator('#sq-progress').getAttribute('max'), '40');
    assert.equal(await page.locator('.sq-reference').getAttribute('open'), null);
    await submit.click();
    assert.match(await page.locator('#sq-feedback').textContent(), /Bitte gib/);
    assert.equal(await page.locator('#sq-misses').textContent(), '0');
    await input.fill('abc');
    assert.equal(await input.inputValue(), '');
    const missedExpression = await expr.textContent();
    await input.fill('0');
    await submit.click();
    assert.match(await page.locator('#sq-feedback').textContent(), /Diese Aufgabe kommt wieder/);
    assert.equal(await page.locator('#sq-misses').textContent(), '1');
    // Double submitting feedback advances once, without adding another failure.
    await submit.click();
    const seen = new Set([missedExpression]);
    let retries = 0;
    while (await page.locator('#sq-summary').isHidden()) {
      seen.add(await expr.textContent());
      if (await page.locator('#sq-repeat').isVisible()) retries++;
      await input.fill(await result());
      await input.press('Enter');
      await submit.click();
    }
    assert.equal(seen.size, 40);
    assert.equal(retries, 1);
    assert.match(await page.locator('#sq-summary-text').textContent(), /Alle 40 Aufgaben sicher gelöst. 39 davon direkt/);
    assert.equal(await page.locator('#sq-progress').getAttribute('value'), '40');
    await page.locator('input[value="root"]').check();
    await page.selectOption('#sq-range', 'large');
    await page.locator('#sq-restart').click();
    assert.equal(await page.locator('#sq-progress').getAttribute('max'), '10');
    assert.match(await expr.textContent(), /^√/);
    assert.equal(await page.locator('#sq-first').textContent(), '0');
    await page.locator('#sq-reveal').click();
    assert.match(await page.locator('#sq-feedback').textContent(), /Schau es dir/);
    assert.equal(await page.locator('#sq-misses').textContent(), '1');
    await submit.click();
    await page.locator('#sq-keypad-toggle').click();
    const answer = await result();
    for (const digit of answer) await page.locator(`[data-digit="${digit}"]`).click();
    assert.equal(await input.inputValue(), answer);
    await page.locator('#sq-delete').click();
    assert.equal(await input.inputValue(), answer.slice(0,-1));
    await page.locator(`[data-digit="${answer.at(-1)}"]`).click();
    await submit.click();
    assert.match(await page.locator('#sq-feedback').textContent(), /Richtig!/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `trainer overflow at ${width}`);
    await page.evaluate(() => document.fonts.ready);
    if (screenshots && [1440,390].includes(width)) await page.screenshot({ path: `${screenshots}/square-trainer-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await page.close();
  }
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(origin + '/mathematik/quadratwurzeln/');
  assert.ok(await page.locator('noscript').isVisible());
  await page.locator('.sq-reference summary').click();
  assert.equal(await page.locator('.sq-reference-grid > div').count(), 20);
  await page.close();
}
