import assert from 'node:assert/strict';

export async function testCarousel(browser, origin, screenshots) {
  // Virtual time keeps every eight-second rule deterministic and fast.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await page.goto(origin + '/');
  const carousel = page.locator('[data-featured-courses]');
  const selected = () => carousel.locator('[data-slide-choice][aria-current="true"]').getAttribute('data-slide-choice');
  const status = carousel.locator('[role="status"]');
  await carousel.locator('[data-carousel-controls]').waitFor({ state: 'visible' });
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  const advance = async () => page.clock.runFor(8_100);
  const activeTitle = () => carousel.locator('[data-active] h2').textContent();
  assert.equal(await activeTitle(), 'Warum √2 irrational ist');
  await advance();
  assert.equal(await selected(), '1');
  await advance();
  assert.equal(await selected(), '0', 'automatic rotation wraps');
  assert.equal(await status.textContent(), '', 'automatic rotation stays silent');

  await carousel.hover();
  await advance();
  assert.equal(await selected(), '0', 'hover pauses temporarily');
  await page.mouse.move(0, 0);
  await advance();
  assert.equal(await selected(), '1', 'leaving hover resumes');

  assert.equal(await carousel.locator('button').count(), 2, 'only the two dots remain');
  await carousel.locator('[data-slide-choice="0"]').focus();
  await page.locator('.home-intro a').focus();
  await advance();
  assert.equal(await selected(), '1', 'focus stops rotation even after leaving');
  await carousel.locator('[data-slide-choice="0"]').click();
  assert.equal(await selected(), '0');
  assert.match(await status.textContent(), /Warum √2 irrational ist/);
  await carousel.locator('[data-slide-choice="1"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await selected(), '1');
  assert.match(await status.textContent(), /2 von 2: Licht, Schatten/);
  assert.equal(await carousel.locator('[data-slide][inert][aria-hidden="true"]').count(), 1);
  assert.equal(await carousel.getByRole('link', { name: 'Lernseite entdecken' }).count(), 1);
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-slide-choice')), '1', 'selection keeps focus');
  await page.mouse.move(0, 0);
  await advance();
  assert.equal(await selected(), '1', 'manual selection stops automatic rotation');

  // Reload to test lifecycle behavior with automatic rotation enabled.
  await page.reload();
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  // Tab lifecycle cannot be changed via Playwright's public API; dispatch the
  // browser event with its real document property mocked for this one check.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await advance();
  assert.equal(await selected(), '0', 'hidden tab clears the timer');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await advance();
  assert.equal(await selected(), '1', 'visible tab starts a fresh interval');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await advance();
  assert.equal(await selected(), '1', 'offscreen carousel clears the timer');
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await advance();
  assert.equal(await selected(), '0');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  await advance();
  assert.equal(await selected(), '0', 'reduced motion stops automatic rotation');
  assert.equal(await carousel.locator('[data-slide]').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await carousel.locator('[data-slide-choice="1"]').click();
  assert.equal(await selected(), '1', 'dots still work with reduced motion');
  await page.reload();
  await carousel.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await carousel.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true });
  await advance();
  assert.equal(await selected(), '0', 'touch stops rotation');
  assert.deepEqual(errors, []);
  await page.close();

  for (const width of [1440, 1024, 768, 390, 320]) {
    const view = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await view.goto(origin + '/');
    await view.evaluate(() => document.fonts.ready);
    const root = view.locator('[data-featured-courses]');
    assert.equal(await root.locator('[data-slide-choice="0"]').getAttribute('aria-current'), 'true', 'reduced motion starts static');
    const stage = root.locator('.carousel-stage');
    const first = await stage.boundingBox();
    await root.locator('[data-slide-choice="1"]').click();
    const second = await stage.boundingBox();
    assert.equal(second.height, first.height, `Carousel ${width}: stable height`);
    assert.equal(await root.locator('[data-active] .button').getAttribute('href'), '/physik/optik/');
    assert.equal(await root.locator('[data-active] img').count(), 1, 'optics uses its own illustration');
    await root.locator('[data-slide-choice="0"]').click();
    assert.equal(await root.locator('[data-active] .button').getAttribute('href'), '/mathematik/wurzel-2/');
    assert.equal(await root.locator('[data-active] img[src*="sqrt-two-editorial"]').count(), 1, 'mathematics uses its own cover');
    if (width <= 740) {
      const visual = await root.locator('[data-active] .featured-visual').boundingBox();
      const caption = await root.locator('[data-active] .art-caption').boundingBox();
      assert.ok(caption.y >= visual.y + visual.height, 'mobile caption leaves mathematical labels unobstructed');
    }
    assert.equal(await view.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Carousel ${width}: no overflow`);
    const clipped = await root.locator('h2,button,.course-features li').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent));
    assert.deepEqual(clipped, [], `Carousel ${width}: readable labels`);
    if (screenshots && [1440, 390].includes(width)) {
      await root.screenshot({ path: `${screenshots}/carousel-mathematics-${width}.png` });
      await root.locator('[data-slide-choice="1"]').click();
      await root.screenshot({ path: `${screenshots}/carousel-optics-${width}.png` });
    }
    await view.close();
  }
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(origin + '/');
  const root = staticPage.locator('[data-featured-courses]');
  assert.equal(await root.locator('[data-carousel-controls]').isVisible(), false);
  assert.equal(await root.getByRole('link', { name: 'Lernseite entdecken' }).count(), 1);
  assert.equal(await root.getByRole('link', { name: 'Lernseite entdecken' }).getAttribute('href'), '/mathematik/wurzel-2/');
  await staticPage.close();
  console.log('Carousel: ordering, autoplay, wrap, controls, focus, hover, touch, visibility, reduced motion, responsive sizing and no-JS passed');
}
