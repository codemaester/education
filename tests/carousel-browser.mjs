import assert from 'node:assert/strict';
import { courses, recentCourses } from '../src/data/catalog.ts';
const entries = recentCourses(courses);

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
  assert.equal(await activeTitle(), entries[0].title);
  await advance();
  assert.equal(await selected(), '1');
  for (let i = 1; i < entries.length; i++) await advance();
  assert.equal(await selected(), '0', 'automatic rotation wraps');
  assert.equal(await status.textContent(), '', 'automatic rotation stays silent');

  await carousel.hover();
  await advance();
  assert.equal(await selected(), '0', 'hover pauses temporarily');
  await page.mouse.move(0, 0);
  await advance();
  assert.equal(await selected(), '1', 'leaving hover resumes');

  assert.equal(await carousel.locator('button').count(), entries.length, 'one dot per slide');
  await carousel.locator('[data-slide-choice="0"]').focus();
  await page.locator('.home-intro a').focus();
  await advance();
  assert.equal(await selected(), '1', 'focus stops rotation even after leaving');
  await carousel.locator('[data-slide-choice="0"]').click();
  assert.equal(await selected(), '0');
  assert.ok((await status.textContent()).includes(entries[0].title));
  await carousel.locator('[data-slide-choice="1"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await selected(), '1');
  assert.ok((await status.textContent()).includes(entries[1].title));
  assert.equal(await carousel.locator('[data-slide][inert][aria-hidden="true"]').count(), entries.length - 1);
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
  // A compact viewport lets the footer move the entire carousel offscreen.
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const offscreen = await carousel.boundingBox();
  assert.ok(offscreen.y + offscreen.height <= 0, 'carousel is fully outside the viewport');
  await advance();
  assert.equal(await selected(), '1', 'offscreen carousel clears the timer');
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await advance();
  assert.equal(await selected(), String(2 % entries.length));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  await advance();
  assert.equal(await selected(), String(2 % entries.length), 'reduced motion stops automatic rotation');
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

  // Inspect real CSS transitions at their midpoint, without wall-clock sleeps.
  const fadePage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  await fadePage.goto(origin + '/');
  await fadePage.locator('[data-carousel-controls]').waitFor({ state: 'visible' });
  const fade = await fadePage.evaluate(() => {
    const root = document.querySelector('[data-featured-courses]');
    const outgoing = root.querySelector('[data-active]');
    getComputedStyle(outgoing).opacity;
    root.querySelector('[data-slide-choice="1"]').click();
    const incoming = root.querySelector('[data-active]');
    getComputedStyle(incoming).opacity;
    const animations = [outgoing, incoming].map(slide => slide.getAnimations().find(animation => animation.transitionProperty === 'opacity'));
    if (animations.some(animation => !animation)) return null;
    animations.forEach(animation => {
      animation.pause();
      animation.currentTime = Number(animation.effect.getTiming().duration) / 2;
    });
    const midpoint = [outgoing, incoming].map(slide => ({ opacity: Number(getComputedStyle(slide).opacity), visibility: getComputedStyle(slide).visibility }));
    [outgoing, incoming].forEach(slide => slide.getAnimations().forEach(animation => animation.finish()));
    return { midpoint, final: [outgoing, incoming].map(slide => ({ opacity: Number(getComputedStyle(slide).opacity), visibility: getComputedStyle(slide).visibility })) };
  });
  assert.ok(fade, 'both outgoing and incoming slides animate their opacity');
  assert.ok(fade.midpoint.every(slide => slide.opacity > 0 && slide.opacity < 1 && slide.visibility === 'visible'), 'both slides remain painted during the crossfade');
  assert.deepEqual(fade.final, [{ opacity: 0, visibility: 'hidden' }, { opacity: 1, visibility: 'visible' }]);
  await fadePage.close();

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
    assert.equal(await root.locator('[data-active] .button').getAttribute('href'), `/${entries[1].href}`);
    assert.equal(await root.locator('[data-active] img').count(), 1, 'second course uses an illustration');
    await root.locator('[data-slide-choice="0"]').click();
    assert.equal(await root.locator('[data-active] .button').getAttribute('href'), `/${entries[0].href}`);
    const imageName = { latin: 'latin-vocabulary-painted', 'sqrt-two': 'sqrt-two-editorial', museum: 'infinity-museum', optics: 'optics-editorial' }[entries[0].cover];
    assert.equal(await root.locator(`[data-active] img[src*="${imageName}"]`).count(), 1, 'newest course uses its configured illustration');
    if (width <= 740) {
      const visual = await root.locator('[data-active] .featured-visual').boundingBox();
      const caption = await root.locator('[data-active] .art-caption').boundingBox();
      assert.ok(caption.y >= visual.y + visual.height, 'mobile caption leaves mathematical labels unobstructed');
    }
    assert.equal(await view.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Carousel ${width}: no overflow`);
    const clipped = await root.locator('h2,button,.course-features li').evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent));
    assert.deepEqual(clipped, [], `Carousel ${width}: readable labels`);
    if (screenshots && [1440, 390].includes(width)) {
      await root.screenshot({ path: `${screenshots}/carousel-first-${width}.png` });
      await root.locator('[data-slide-choice="1"]').click();
      await root.screenshot({ path: `${screenshots}/carousel-second-${width}.png` });
    }
    await view.close();
  }
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(origin + '/');
  const root = staticPage.locator('[data-featured-courses]');
  assert.equal(await root.locator('[data-carousel-controls]').isVisible(), false);
  assert.equal(await root.getByRole('link', { name: 'Lernseite entdecken' }).count(), 1);
  assert.equal(await root.getByRole('link', { name: 'Lernseite entdecken' }).getAttribute('href'), `/${entries[0].href}`);
  await staticPage.close();
  console.log('Carousel: ordering, autoplay, wrap, controls, focus, hover, touch, visibility, reduced motion, responsive sizing and no-JS passed');
}
