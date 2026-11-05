import assert from 'node:assert/strict';

async function assertReadable(button, state) {
  const result = await button.evaluate(el => {
    const style = getComputedStyle(el);
    const luminance = color => {
      const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
        const s = v / 255;
        return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
      });
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const foreground = luminance(style.color), background = luminance(style.backgroundColor);
    return { ratio: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05), color: style.color, background: style.backgroundColor, opacity: style.opacity };
  });
  assert.ok(result.ratio >= 4.5, `${state}: contrast ${result.ratio.toFixed(2)}:1 (${result.color} on ${result.background})`);
  assert.equal(result.opacity, '1', `${state}: selected text must remain fully opaque`);
}

export async function testLatinContrast(browser, origin) {
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: { width: touch ? 390 : 1440, height: 900 }, hasTouch: touch, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const activate = async button => touch ? button.tap() : button.click();
    await page.goto(origin + '/sprachen/latein/vokabeltrainer/');
    await activate(page.locator('.latin-mode-tile:has(input[value="matching"])'));
    await page.locator('[data-training-options]:not([disabled])').waitFor();
    await activate(page.getByRole('button', { name: 'Training starten' }));
    const left = page.locator('[data-left] button').first();
    await activate(left);
    // Sample the state change too: crossfading dark-on-light into light-on-dark
    // can briefly produce unreadable intermediate text despite good endpoints.
    for (const ms of [0, 40, 40, 100]) {
      if (ms) await page.waitForTimeout(ms);
      await assertReadable(left, `matching left ${touch ? 'touch' : 'mouse'} after ${ms}ms`);
    }
    await activate(left);
    const right = page.locator('[data-right] button').first();
    await activate(right);
    await assertReadable(right, 'matching right selected');
    const id = await right.getAttribute('data-id');
    await activate(page.locator(`[data-left] button[data-id="${id}"]`));
    await assertReadable(right, 'matching solved right');
    await assertReadable(page.locator(`[data-left] button[data-id="${id}"]`), 'matching solved left');
    await activate(page.locator('[data-abort]'));
    await activate(page.locator('[data-change-mode]'));

    for (const mode of ['workshop', 'detective', 'hunt', 'parcours']) {
      await activate(page.locator(`.latin-mode-tile:has(input[value="${mode}"])`));
      await page.locator('[data-training-options]:not([disabled])').waitFor();
      await activate(page.getByRole('button', { name: 'Training starten' }));
      const groups = page.locator('.latin-selection-field');
      const count = await groups.count();
      for (let n = 0; n < count; n++) {
        if (n) await activate(page.locator('[data-field-next]'));
        const option = groups.nth(n).locator('button').first();
        await activate(option);
        await assertReadable(option, `${mode}/${n}: selected while pointer remains over it`);
        if (!touch) {
          await option.hover();
          await assertReadable(option, `${mode}/${n}: selected hover`);
          await page.mouse.move(0, 0);
          await assertReadable(option, `${mode}/${n}: selected without hover`);
          await option.focus();
          await page.keyboard.press('Space');
          await page.keyboard.press('Space');
          await assertReadable(option, `${mode}/${n}: selected with keyboard focus`);
        }
      }
      await activate(page.locator('[data-check-answer]'));
      const selected = groups.last().locator('button[aria-pressed="true"]');
      assert.ok(await selected.isDisabled());
      await assertReadable(selected, `${mode}: selected after grading`);
      await activate(page.locator('[data-activity-abort]'));
      await activate(page.locator('[data-change-mode]'));
    }
    await context.close();
  }
  console.log('Latin contrast: selected/hover/focus/touch/graded answers and matching transitions meet 4.5:1 in all five selection modes');
}
