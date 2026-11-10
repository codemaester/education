import assert from 'node:assert/strict';
import { chapterExercises, finalExercises } from '../src/data/roots-exercises.ts';
import { rootChapters } from '../src/data/roots-lesson.ts';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { testSquareTrainer } from './square-trainer-browser.mjs';

export async function testRootsLesson(browser, origin, screenshots) {
  for (const width of [1440,768,390,320]) {
    const page = await browser.newPage({ viewport:{width,height:1000} });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) errors.push(r.url()); });
    await page.goto(origin + '/mathematik/quadratwurzeln/');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.rl-chapter').count(),6);
    assert.equal(await page.locator('[data-root-quiz]').count(),7);
    assert.equal(await page.locator('[data-exercise]').count(),42);
    await page.locator('[data-course-menu] summary').click();
    await page.locator('[data-course-menu] a[href="#intervallschachtelung"]').click();
    assert.equal(await page.locator('[data-course-menu]').getAttribute('open'),null);
    const interval = page.locator('[data-explorer="intervallschachtelung"]');
    for (let d = 0; d < 3; d++) await interval.locator('[data-interval-step]').click();
    assert.match(await interval.locator('[data-interval-rows]').textContent(),/2,645 < √7 < 2,646/);
    assert.match(await interval.locator('[data-explorer-output]').textContent(),/0,001/);
    await interval.locator('select').selectOption('10');
    assert.equal(await interval.locator('[data-interval-rows] > p').count(),1);
    await interval.locator('[data-interval-step]').click();
    await interval.locator('[data-interval-reset]').click();
    assert.equal(await interval.locator('[data-interval-rows] > p').count(),1);
    const partial = page.locator('[data-explorer="teilweises-wurzelziehen"]');
    await partial.locator('select').selectOption('200');
    assert.match(await partial.locator('[data-explorer-output]').textContent(),/10√2/);
    const nested = page.locator('[data-explorer="wurzeln-von-wurzeln"]');
    await nested.locator('select').selectOption('625');
    assert.match(await nested.locator('[data-explorer-output]').textContent(),/√25 = 5/);
    const first = page.locator('#uebungen-wurzelgesetze');
    await first.locator('[data-quiz-check]').click();
    assert.match(await first.locator('[data-quiz-status]').textContent(),/0 \/ 5 beantwortet/);
    await page.locator('#law-1-0').fill('sqrt(36)');
    await first.locator('[data-quiz-check]').click();
    assert.equal(await page.locator('#law-1-0').getAttribute('aria-invalid'),'true');
    await page.locator('#law-1-0').fill('6');
    await first.locator('[data-quiz-check]').click();
    assert.match(await first.locator('[data-quiz-status]').textContent(),/1 selbstständig richtig/);
    await page.locator('[data-exercise="law-1"] summary').click();
    await page.waitForFunction(() => document.querySelector('#uebungen-wurzelgesetze [data-quiz-status]').textContent.includes('1 mit Musterlösung'));
    assert.match(await first.locator('[data-quiz-status]').textContent(),/0 selbstständig richtig/);
    await first.locator('[data-quiz-reset]').click();
    assert.equal(await page.locator('#law-1-0').inputValue(),'');
    assert.equal(await page.locator('[data-exercise="law-1"] details').getAttribute('open'),null);
    if (width === 1440) {
      for (const exercise of [...chapterExercises, ...finalExercises]) for (const [i, field] of exercise.fields.entries()) await page.locator(`#${exercise.id}-${i}`).fill(String(field.answer).replace('.',','));
      for (const chapter of rootChapters) {
        const quiz = page.locator(`#uebungen-${chapter.id}`);
        await quiz.locator('[data-quiz-check]').click();
        assert.match(await quiz.locator('[data-quiz-status]').textContent(),/5 \/ 5 beantwortet · 5 selbstständig richtig/);
      }
      const final = page.locator('#wurzel-abschlusscheck');
      await final.locator('[data-quiz-check]').click();
      assert.match(await final.locator('[data-quiz-status]').textContent(),/12 \/ 12 beantwortet · 12 selbstständig richtig/);
      await page.locator('#final-extract-1-0').fill('3');
      await final.locator('[data-quiz-check]').click();
      assert.equal(await final.locator('[data-recommendations] a').getAttribute('href'),'#teilweises-wurzelziehen');
      assert.match(await page.locator('#uebungen-teilweises-wurzelziehen [data-quiz-status]').textContent(),/5 selbstständig richtig/);
      await final.locator('[data-quiz-reset]').click();
      assert.equal(await final.locator('[data-recommendations] a').count(),0);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`Lesson overflow ${width}`);
    if (screenshots && [1440,390].includes(width)) {
      await page.locator('#intervallschachtelung').screenshot({path:`${screenshots}/roots-interval-${width}.png`});
      await page.locator('#wurzelsummen').screenshot({path:`${screenshots}/roots-sums-${width}.png`});
    }
    assert.deepEqual(errors,[]);
    await page.goto(origin + '/mathematik/quadratwurzeln/lernzettel/');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.rs-page').count(),3);
    assert.equal(await page.locator('#roots-print').isEnabled(),true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`Sheet overflow ${width}`);
    await page.evaluate(() => { window.__printed = false; window.print = () => { window.__printed = true; }; });
    await page.locator('#roots-print').click();
    assert.equal(await page.evaluate(() => window.__printed),true);
    if (width === 1440) {
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.rs-actions').isVisible(),false);
      const pdf = await page.pdf({format:'A4',preferCSSPageSize:true,printBackground:false});
      if (screenshots) await writeFile(`${screenshots}/quadratwurzeln-lernzettel.pdf`,pdf);
      const pages = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
      assert.equal(pages.length,3,'A4 sheet must occupy three unclipped pages');
    }
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`Roots ${width}px: chapters, input, feedback, solutions, intervals, print and layout passed`);
  }
  const page = await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:900}});
  await page.goto(origin + '/mathematik/quadratwurzeln/');
  assert.equal(await page.locator('.rl-chapter').count(),6);
  await page.locator('[data-exercise="extract-1"] summary').click();
  assert.match(await page.locator('[data-exercise="extract-1"] details').textContent(),/4√3/);
  assert.equal(await page.locator('[data-quiz-check]').first().isDisabled(),true);
  await page.goto(origin + '/mathematik/quadratwurzeln/lernzettel/');
  assert.equal(await page.locator('.rs-page').count(),3);
  await page.close();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve('dist');
  const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
  const server = createServer(async (request,response) => {
    try {
      let file = resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
      if (!file.startsWith(root+sep) && file !== root) throw new Error('Invalid path');
      if ((await stat(file)).isDirectory()) file = resolve(file,'index.html');
      response.writeHead(200,{'Content-Type':mime[extname(file)] ?? 'application/octet-stream'});
      response.end(await readFile(file));
    } catch {response.writeHead(404);response.end('Not found');}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const screenshots = process.env.EDUCATION_SCREENSHOTS;
  if (screenshots) await mkdir(screenshots,{recursive:true});
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || undefined});
    await testRootsLesson(browser,origin,screenshots);
    await testSquareTrainer(browser,origin);
  } finally {await browser?.close();await new Promise(resolve => server.close(resolve));}
}
