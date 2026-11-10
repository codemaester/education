import { testRootsLesson } from './roots-browser.mjs';
import { testSquareTrainer } from './square-trainer-browser.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';
import { testMuseum } from './museum-browser.mjs';
import { testCarousel } from './carousel-browser.mjs';
import { testLatinFlashcards } from './latin-flashcards-browser.mjs';
import { testLatin } from './latin-browser.mjs';
import { testLatinLearning } from './latin-learning-browser.mjs';
import { testLatinSelection } from './latin-selection-browser.mjs';
import { testLatinUsability } from './latin-usability-browser.mjs';
import { testLatinContrast } from './latin-contrast-browser.mjs';

// Serve the actual Pages build, including nested index.html routes.
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    let file = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const screenshots = process.env.EDUCATION_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined });
  await testSquareTrainer(browser, origin, screenshots);
  await testRootsLesson(browser, origin, screenshots);
  await testLatinContrast(browser, origin);
  await testLatinUsability(browser, origin, screenshots);
  await testLatinFlashcards(browser, origin, screenshots);
  await testLatin(browser, origin, screenshots);
  await testLatinLearning(browser, origin, screenshots);
  await testLatinSelection(browser, origin, screenshots);
  if (process.env.EDUCATION_BROWSER_FOCUS !== 'latin') {
  await testCarousel(browser, origin, screenshots);
  await testMuseum(browser, origin, screenshots);
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: 'light' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url()); });
    await page.route('https://www.youtube.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<html lang="de"><title>Video fixture</title></html>' }));
    await page.goto(origin + '/');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.subject-entry').count(), 9);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Home ${width}: overflow`);
    if (screenshots && [1440, 390].includes(width)) await page.screenshot({ path: `${screenshots}/home-${width}.png`, fullPage: true });
    const subjects = await page.locator('.subject-entry').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
    if (width === 1440) for (const href of subjects) {
      const response = await page.request.get(origin + href);
      assert.equal(response.status(), 200);
    }
    await page.locator('.subject-entry[href="/faecher/physik/"]').click();
    assert.equal(await page.locator('h1').textContent(), 'Physik');
    await page.locator('.course-list-entry').click();
    await page.locator('.live-sim').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.live-sim').count(), 7);
    if (width <= 390) {
      await page.waitForFunction(() => [...document.querySelectorAll('.live-sim svg text')].every(text => Number.parseFloat(getComputedStyle(text).fontSize) * text.getScreenCTM().a >= 10.9));
      const clippedLabels = await page.locator('.live-sim svg text').evaluateAll(labels => labels.filter(text => { const box = text.getBBox(); return box.x < 0 || box.x + box.width > 761; }).map(text => text.textContent));
      assert.deepEqual(clippedLabels, [], `Optics ${width}: annotations must fit the diagram`);
    }
    assert.equal(await page.locator('.css-mcq').count(), 105);
    assert.equal(await page.locator('.written textarea').count(), 14);
    assert.equal(await page.locator('main').count(), 1);
    const startButton = page.locator('.course-hero .button');
    const contrast = await startButton.evaluate(element => {
      const style = getComputedStyle(element);
      const luminance = color => {
        const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
          const s = value / 255;
          return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
        });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      const foreground = luminance(style.color), background = luminance(style.backgroundColor);
      return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
    });
    assert.ok(contrast >= 4.5, `Optics ${width}: start button needs readable text`);
    const overflows = await page.evaluate(() => [...document.querySelectorAll('.metric small,.control-card label,h2,.table th,.chapter-head,.quiz-option label,.video-info')].filter(el => el.clientWidth && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.slice(0, 70)));
    assert.deepEqual(overflows, [], `Optics ${width}: clipped content`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Optics ${width}: overflow`);
    for (const svg of await page.locator('.live-sim svg').all()) assert.ok(await svg.getAttribute('aria-label'));
    if (screenshots && [1440, 390].includes(width)) await page.screenshot({ path: `${screenshots}/optics-${width}.png` });
    await page.locator('#chapter-menu summary').click();
    await page.locator('.chapter-picker a[href="#k5"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'k5');
    assert.equal(await page.locator('#chapter-menu').getAttribute('open'), null);
    assert.ok(await page.locator('#k5').evaluate(el => el.getBoundingClientRect().top >= 65));
    await page.locator('#s5height').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#s5height').getAttribute('aria-valuetext'), '176 cm');
    await page.locator('#k5 .live-reset').click();
    assert.equal(await page.locator('#s5height').getAttribute('aria-valuetext'), '175 cm');
    if (screenshots && [1440, 390].includes(width)) await page.locator('#k5 .live-sim').screenshot({ path: `${screenshots}/simulation-${width}.png` });
    const card = page.locator('#k1 .css-mcq').first();
    await card.locator('label').nth(0).click();
    assert.ok(await card.locator('.option-feedback.bad').first().isVisible());
    await card.locator('label').nth(1).click();
    assert.ok(await card.locator('.option-feedback.good').isVisible());
    assert.match(await page.locator('#k1 .quiz-score').textContent(), /1 von 15 beantwortet · 1 richtig/);
    await page.locator('#k1 .quiz-reset').click();
    assert.equal(await card.locator('input:checked').count(), 0);
    await page.locator('label[for="antwort-1"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'antwort-1');
    const video = page.locator('.video-modern').first();
    await video.locator('.video-art-cta').click();
    assert.equal(await video.locator('iframe').count(), 1);
    await video.locator('.video-embed').click();
    assert.equal(await video.locator('iframe').count(), 0);
    const questions = JSON.parse(await page.locator('.assessment-form').getAttribute('data-questions'));
    for (const question of questions) await page.locator(`[data-question="${question.id}"] input[value="${question.answer}"]`).check();
    await page.locator('.assessment-submit').click();
    assert.match(await page.locator('.assessment-result').textContent(), /7 von 7 richtig/);
    assert.equal(await page.locator('.assessment-feedback:visible').count(), 7);
    await page.locator('.assessment-form button[type="reset"]').click();
    assert.equal(await page.locator('.assessment-form input:checked').count(), 0);
    assert.equal(await page.locator('.assessment-feedback:visible').count(), 0);
    await page.locator('.study-sheet-link').click();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.sheet').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Print page ${width}: overflow`);
    if (screenshots && [1440, 390].includes(width)) await page.screenshot({ path: `${screenshots}/sheet-${width}.png`, fullPage: true });
    await page.evaluate(() => { window.print = () => { window.printCalled = true; }; });
    await page.locator('#print-sheet').click();
    assert.equal(await page.evaluate(() => window.printCalled), true);
    if (width === 1440) {
      await page.emulateMedia({ media: 'print' });
      const pdf = await page.pdf({ preferCSSPageSize: true, displayHeaderFooter: false, printBackground: false });
      const count = [...pdf.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length;
      assert.equal(count, 2, 'Learning sheet must fit two A4 pages');
      if (screenshots) await writeFile(`${screenshots}/lernzettel.pdf`, pdf);
      await page.emulateMedia({ media: 'screen' });
    }
    assert.deepEqual(errors, [], `Browser errors at ${width}px`);
    await page.close();
    console.log(`${width}px: home, subject links, optics, simulations, quiz, video, final assessment and learning sheet passed`);
  }
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  await page.goto(origin + '/physik/optik/');
  assert.equal(await page.locator('.css-sim:visible').count(), 7);
  await page.locator('label[for="mat-black"]').click();
  assert.ok(await page.locator('.scene.mat-black').isVisible());
  assert.ok(await page.locator('.assessment-submit').isDisabled());
  await page.locator('.study-sheet-link').click();
  assert.ok(await page.getByRole('heading', { name: 'Optik · Lernzettel', exact: true }).isVisible());
  assert.ok(await page.getByText('Alternativ kannst du die Druckfunktion deines Browsers nutzen.').isVisible());
  await page.close();
  const empty = await browser.newPage();
  await empty.goto(origin + '/faecher/geschichte/');
  assert.ok(await empty.locator('.empty-subject').isVisible());
  await empty.locator('.empty-subject .button').first().click();
  assert.ok(empty.url().endsWith('/physik/optik/'));
  await empty.close();
  for (const width of [1440, 1024, 768, 390, 320]) {
    const maths = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    maths.on('pageerror', error => errors.push(error.message));
    maths.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url()); });
    await maths.goto(origin + '/faecher/mathematik/');
    assert.equal(await maths.locator('.course-list-entry').count(), 3);
    assert.equal(await maths.locator('.course-list-entry[href="/mathematik/wurzel-2/"] img[src*="sqrt-two-editorial"]').count(), 1);
    await maths.locator('.course-list-entry[href="/mathematik/wurzel-2/"]').click();
    await maths.locator('[data-number="2"]').waitFor({ state: 'visible' });
    await maths.waitForFunction(() => !document.querySelector('[data-number="2"]').disabled);
    await maths.evaluate(() => document.fonts.ready);
    assert.equal(await maths.locator('main').count(), 1);
    assert.equal(await maths.locator('.proof-step').count(), 7);
    assert.equal(await maths.locator('.question').count(), 3);
    assert.equal(await maths.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Mathematics ${width}: overflow`);
    const clipped = await maths.evaluate(() => [...document.querySelectorAll('.sqrt2-page h1,.sqrt2-page h2,.equation,.reduce-visual,.parity-result,.choice')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.trim().slice(0, 80)));
    assert.deepEqual(clipped, [], `Mathematics ${width}: clipped formulas or content`);
    if (screenshots && [1440, 390].includes(width)) {
      await maths.screenshot({ path: `${screenshots}/maths-${width}.png`, fullPage: true });
      await maths.screenshot({ path: `${screenshots}/maths-top-${width}.png` });
      const isolatedCaptureStyle = await maths.addStyleTag({ content: '.math-course-nav { visibility: hidden; }' });
      await maths.locator('#uebungen').screenshot({ path: `${screenshots}/maths-quiz-${width}.png` });
      await isolatedCaptureStyle.evaluate(element => element.remove());
    }
    const approximations = ['1,4² = 1,96', '1,41² = 1,9881', '1,414² = 1,999396', '1,4142² = 1,99996164'];
    for (let index = 0; index < approximations.length; index++) {
      await maths.locator(`[data-approx="${index}"]`).click();
      assert.equal(await maths.locator('#approx-equation').textContent(), approximations[index]);
      assert.equal(await maths.locator('[data-approx][aria-pressed="true"]').count(), 1);
    }
    for (let number = 2; number <= 7; number++) {
      await maths.locator(`[data-number="${number}"]`).click();
      assert.equal(await maths.locator('#parity-equation').textContent(), `${number} × ${number} = ${number * number}`);
      assert.equal(await maths.locator('.square-cell').count(), number * number);
      assert.equal(await maths.locator('.square-cell.leftover').count(), number % 2);
    }
    await maths.locator('[data-go="7"]').click();
    assert.equal(await maths.locator('[data-go="7"]').getAttribute('aria-current'), 'step');
    assert.ok(await maths.locator('#next-step').isDisabled());
    await maths.locator('#prev-step').click();
    assert.ok(await maths.locator('#schritt-6').evaluate(el => el.classList.contains('is-current')));
    await maths.locator('[data-go="1"]').click();
    assert.ok(await maths.locator('#prev-step').isDisabled());
    await maths.locator('#quiz-form button[type="submit"]').click();
    assert.match(await maths.locator('#quiz-result').textContent(), /3 Fragen noch offen/);
    for (const [name, answer] of [['q1', 'b'], ['q2', 'a'], ['q3', 'b']]) await maths.locator(`input[name="${name}"][value="${answer}"]`).check();
    await maths.locator('#quiz-form button[type="submit"]').click();
    assert.match(await maths.locator('#quiz-result').textContent(), /3 von 3 richtig/);
    await maths.locator('#quiz-reset').click();
    assert.equal(await maths.locator('#quiz-form input:checked').count(), 0);
    assert.equal(await maths.locator('#quiz-result').textContent(), '');
    await maths.evaluate(() => { window.print = () => { window.printCalled = true; }; });
    await maths.locator('#print-button').click();
    assert.equal(await maths.evaluate(() => window.printCalled), true);
    if (width === 1440) {
      await maths.emulateMedia({ media: 'print' });
      assert.equal(await maths.locator('.math-course-nav').isVisible(), false);
      assert.equal(await maths.locator('.proof-step:visible').count(), 7);
      const pdf = await maths.pdf({ format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }, displayHeaderFooter: false });
      if (screenshots) await writeFile(`${screenshots}/mathematik.pdf`, pdf);
    }
    assert.deepEqual(errors, [], `Mathematics ${width}: browser errors`);
    await maths.close();
    console.log(`${width}px: mathematics integration, approximations, parity, proof navigation, quiz and print passed`);
  }
  const staticMaths = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  await staticMaths.goto(origin + '/mathematik/wurzel-2/');
  assert.ok(await staticMaths.locator('.math-noscript').isVisible());
  assert.equal(await staticMaths.locator('.proof-step:visible').count(), 7);
  assert.ok(await staticMaths.locator('[data-number="2"]').isDisabled());
  await staticMaths.close();
  console.log('No-JavaScript fallback, learning-sheet access and empty-subject navigation passed');
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
