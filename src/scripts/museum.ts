import { sqrtTwoWindow, rationalGuests, rotationPoint, diagonalDigit } from '../data/museum-math';

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
$$<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('[data-museum-js]').forEach(control => control.disabled = false);

// Room I: integer arithmetic keeps the bracket true at all supported zoom levels.
const zoom = $('[data-zoom-exhibit]');
const depth = $<HTMLInputElement>('#zoom-depth');
const out = $<HTMLButtonElement>('[data-zoom-out]');
const into = $<HTMLButtonElement>('[data-zoom-in]');
type ZoomWindow = ReturnType<typeof sqrtTwoWindow>;
const reference = $<SVGSVGElement>('.zoom-overview', zoom);
const referenceWindow = $('[data-reference-window]', zoom);
const referenceNote = $('[data-reference-note]', zoom);
const referenceLocation = $('[data-reference-location]', zoom);
const detailWindow = $('[data-detail-window]', zoom);
const ticks = $('[data-zoom-ticks]', zoom);
const oldTicks = $('[data-zoom-old-ticks]', zoom);
const marker = $('[data-zoom-marker]', zoom);
const plotStart = 42;
const plotWidth = 716;
let zoomDepth = 0;
let zoomFrame = 0;
let referencePixels = reference.getBoundingClientRect().width * plotWidth / 800;

function superscript(n: number) { const chars: Record<string, string> = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}; return String(n).split('').map(c => chars[c]).join(''); }
// Convert only after subtracting exact integers: deep windows must not collapse
// when their two endpoints would round to the same JavaScript Number.
function ratio(numerator: bigint, denominator: bigint) {
  return Number(numerator * 100_000_000n / denominator) / 100_000_000;
}
function overviewGeometry(bracket: ZoomWindow) {
  return { left: ratio(bracket.lower - bracket.scale, bracket.scale), width: 1 / Number(bracket.scale) };
}
function drawOverview(left: number, width: number) {
  const subpixel = width * referencePixels < 1;
  referenceWindow.toggleAttribute('data-hidden', subpixel);
  referenceLocation.toggleAttribute('data-hidden', !subpixel);
  referenceWindow.setAttribute('x', String(plotStart + left * plotWidth));
  referenceWindow.setAttribute('width', String(width * plotWidth));
  const note = subpixel
    ? 'Ausschnitt kleiner als ein Pixel. Die Ortsmarke zeigt die Lage, nicht die Breite.'
    : width === 1 ? 'Markiert: der gesamte Ausschnitt.' : 'Markiert: der Ausschnitt unter der Lupe.';
  if (referenceNote.textContent !== note) referenceNote.textContent = note;
}
function tickMarkup() {
  return Array.from({ length: 11 }, (_, i) => `<line x1="${i / 10}" x2="${i / 10}" y1="${i === 0 || i === 10 ? 77 : 87}" y2="104" class="diagram-tick" vector-effect="non-scaling-stroke"/>`).join('');
}
ticks.innerHTML = tickMarkup();
oldTicks.innerHTML = tickMarkup();
function drawTicks(group: Element, left: number, width: number) {
  group.setAttribute('transform', `translate(${plotStart + left * plotWidth} 0) scale(${width * plotWidth} 1)`);
}
function commitZoom() {
  const bracket = sqrtTwoWindow(zoomDepth);
  $('[data-known-digits]', zoom).textContent = bracket.left;
  $('.digit-unknown', zoom).textContent = zoomDepth ? '…' : ', …';
  $('[data-lower]', zoom).textContent = bracket.left;
  $('[data-upper]', zoom).textContent = bracket.right;
  $('[data-zoom-level]', zoom).textContent = `Zoomstufe ${zoomDepth} / 24`;
  $('[data-zoom-factor]', zoom).textContent = `Vergrößerung 10${superscript(zoomDepth)}${zoomDepth === 0 ? ' = 1' : ''}-fach`;
  $('[data-zoom-width]', zoom).textContent = `10${superscript(-zoomDepth)}${zoomDepth === 0 ? ' = 1' : ''}`;
  $('[data-zoom-status]', zoom).textContent = zoomDepth === 0
    ? '√2 liegt zwischen 1 und 2. Beide Grenzen sind rationale Zahlen.'
    : `Das Intervall ist jetzt 10${superscript(-zoomDepth)} breit. Die Lupe vergrößert 10${superscript(zoomDepth)}-fach. Im festen Überblick wird der Ausschnitt kleiner. √2 bleibt exakt dieselbe Zahl.`;
  $('#zoom-svg-title', zoom).textContent = `√2 liegt zwischen ${bracket.left} und ${bracket.right}. Vergrößerung 10${superscript(zoomDepth)}-fach.`;
  marker.setAttribute('transform', `translate(${plotStart + bracket.fraction * plotWidth} 0)`);
  drawTicks(ticks, 0, 1);
  ticks.setAttribute('opacity', '1');
  oldTicks.setAttribute('opacity', '0');
  detailWindow.setAttribute('x', String(plotStart));
  detailWindow.setAttribute('width', String(plotWidth));
  const overview = overviewGeometry(bracket);
  drawOverview(overview.left, overview.width);
  zoom.dataset.zoomDepth = String(zoomDepth);
  delete zoom.dataset.zoomAnimating;
}
function finishZoom() {
  cancelAnimationFrame(zoomFrame);
  zoomFrame = 0;
  commitZoom();
}
function renderZoom(animate = false) {
  const previousDepth = zoomDepth;
  const interrupted = zoomFrame !== 0;
  cancelAnimationFrame(zoomFrame);
  zoomFrame = 0;
  zoomDepth = Number(depth.value);
  out.disabled = zoomDepth === 0;
  into.disabled = zoomDepth === 24;
  // Slider jumps and interrupted gestures settle immediately; never queue steps.
  if (!animate || interrupted || motion.matches || document.hidden || Math.abs(zoomDepth - previousDepth) !== 1) {
    commitZoom();
    return;
  }
  const previous = sqrtTwoWindow(previousDepth);
  const target = sqrtTwoWindow(zoomDepth);
  const commonScale = previous.scale > target.scale ? previous.scale : target.scale;
  const oldSpan = Number(commonScale / previous.scale);
  const newSpan = Number(commonScale / target.scale);
  const oldLower = previous.lower * (commonScale / previous.scale);
  const newLower = target.lower * (commonScale / target.scale);
  const newLeft = Number(newLower - oldLower);
  const markerPosition = newLeft + target.fraction * newSpan;
  const fromOverview = overviewGeometry(previous);
  const toOverview = overviewGeometry(target);
  const zoomingIn = zoomDepth > previousDepth;
  const selectedLeft = zoomingIn ? newLeft : 0;
  const selectedSpan = Math.min(oldSpan, newSpan);
  const started = performance.now();
  zoom.dataset.zoomAnimating = 'true';
  function draw(now: number) {
    // A short hold lets the selected tenth register before it fills the lens.
    const t = Math.min(1, Math.max(0, (now - started - 100) / 600));
    const eased = 1 - (1 - t) ** 3;
    const span = oldSpan * (newSpan / oldSpan) ** eased;
    const travel = (oldSpan - span) / (oldSpan - newSpan);
    const left = newLeft * travel;
    drawTicks(oldTicks, -left / span, oldSpan / span);
    drawTicks(ticks, (newLeft - left) / span, newSpan / span);
    oldTicks.setAttribute('opacity', String(1 - eased));
    ticks.setAttribute('opacity', String(eased));
    detailWindow.setAttribute('x', String(plotStart + (selectedLeft - left) / span * plotWidth));
    detailWindow.setAttribute('width', String(selectedSpan / span * plotWidth));
    marker.setAttribute('transform', `translate(${plotStart + (markerPosition - left) / span * plotWidth} 0)`);
    drawOverview(fromOverview.left + (toOverview.left - fromOverview.left) * travel,
      fromOverview.width + (toOverview.width - fromOverview.width) * travel);
    if (t < 1) zoomFrame = requestAnimationFrame(draw);
    else { zoomFrame = 0; commitZoom(); }
  }
  draw(started);
}
depth.addEventListener('input', () => renderZoom(true));
out.addEventListener('click', () => { depth.value = String(Number(depth.value) - 1); renderZoom(true); });
into.addEventListener('click', () => { depth.value = String(Number(depth.value) + 1); renderZoom(true); });
$('[data-zoom-reset]', zoom).addEventListener('click', () => { depth.value = '0'; renderZoom(); });
motion.addEventListener('change', () => { if (motion.matches) finishZoom(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && zoomFrame) finishZoom(); });
new ResizeObserver(() => {
  referencePixels = reference.getBoundingClientRect().width * plotWidth / 800;
  if (zoomFrame) finishZoom();
  else { const geometry = overviewGeometry(sqrtTwoWindow(zoomDepth)); drawOverview(geometry.left, geometry.width); }
}).observe(reference);
renderZoom();

// Room II: one bounded animation loop, no timers while paused or off screen.
const orbit = $('[data-orbit-exhibit]');
const play = $<HTMLButtonElement>('[data-orbit-play]');
const rational = $<HTMLSelectElement>('#rational-step');
const irrational = $<HTMLSelectElement>('#irrational-step');
const speed = $<HTMLSelectElement>('#orbit-speed');
let steps = 0;
let running = false;
let frame = 0;
let previous = 0;
let progress = 0;
let orbitVisible = false;
const cap = 1200;
function turns() { const [p, q] = rational.value.split('/').map(Number); return { p, q, rational: p / q, irrational: irrational.value === 'sqrt' ? Math.SQRT2 - 1 : (3 - Math.sqrt(5)) / 2 }; }
function updateWalkers(offset = 0) {
  const values = turns();
  for (const kind of ['rational', 'irrational'] as const) {
    const point = rotationPoint(steps + offset, values[kind]);
    const walker = $<SVGCircleElement>(`[data-walker="${kind}"]`);
    walker.setAttribute('cx', String(point.x)); walker.setAttribute('cy', String(point.y));
  }
}
function renderOrbit() {
  const values = turns();
  $('[data-orbit-count]').textContent = `${steps.toLocaleString('de-DE')} ${steps === 1 ? 'Schritt' : 'Schritte'}`;
  $('[data-orbit-formula="rational"]').textContent = `${rational.value} einer Umdrehung · ${values.q} Landepunkte`;
  $('[data-orbit-formula="irrational"]').textContent = irrational.value === 'sqrt' ? '√2 − 1 ≈ 0,4142 Umdrehungen' : '(3 − √5) / 2 ≈ 0,3820 Umdrehungen';
  for (const kind of ['rational', 'irrational'] as const) {
    const count = kind === 'rational' ? Math.min(steps + 1, values.q) : steps + 1;
    $(`.orbit-figure.${kind} svg`).setAttribute('aria-label', kind === 'rational'
      ? `Rationale Kreisbahn mit Schrittweite ${rational.value} einer Umdrehung. Bisher ${count} verschiedene Landepunkte. Der Zyklus umfasst ${values.q} Landepunkte.`
      : `Irrationale Kreisbahn mit Schrittweite ${irrational.value === 'sqrt' ? 'Wurzel aus 2 minus 1' : '3 minus Wurzel aus 5, geteilt durch 2'}. Bisher ${count} verschiedene Landepunkte. Keine exakte Wiederholung.`);
    const points = Array.from({length: count}, (_, i) => rotationPoint(i, values[kind]));
    $(`[data-orbit-dots="${kind}"]`).innerHTML = points.map(p => `<circle cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${kind === 'rational' ? 4 : 2.2}"/>`).join('');
    const paths = Array.from({length: Math.min(steps, kind === 'rational' ? values.q : 240)}, (_, i) => {
      const a = rotationPoint(i, values[kind]); const b = rotationPoint(i + 1, values[kind]);
      return `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    });
    $(`[data-orbit-chords="${kind}"]`).setAttribute('d', paths.join(''));
    $(`[data-orbit-unique="${kind}"]`).textContent = String(count);
    $(`[data-orbit-unique="${kind}"]`).nextElementSibling!.textContent = count === 1 ? 'besuchter Ort' : 'verschiedene Orte';
  }
  updateWalkers();
}
function orbitMessage() {
  const { q } = turns();
  $('[data-orbit-status]').textContent = steps === 0 ? 'Beide beginnen am selben Startpunkt. Starte die Wanderer oder gehe einen Schritt weiter.' : `${steps} ${steps === 1 ? 'Schritt' : 'Schritte'}: Der rationale Wanderer ${steps >= q ? `besucht weiterhin nur ${q} verschiedene Orte${steps % q === 0 ? ' und steht wieder am Start' : ''}` : `kehrt nach ${q} Schritten erstmals zurück`}. Der irrationale hat ${steps + 1} verschiedene Landepunkte einschließlich des Starts.${steps === cap ? ' Der sichtbare Versuch endet hier; die mathematische Bahn geht weiter.' : ''}`;
}
function pauseOrbit(announce = false) {
  running = false; cancelAnimationFrame(frame); progress = 0;
  play.textContent = 'Wanderer starten'; play.setAttribute('aria-pressed', 'false');
  updateWalkers(); if (announce) orbitMessage();
}
function tick(time: number) {
  if (!running) return;
  const elapsed = previous ? Math.min((time - previous) / 1000, .1) : 0; previous = time;
  progress += elapsed * Number(speed.value);
  if (progress >= 1) {
    const advance = Math.floor(progress); progress -= advance; steps = Math.min(cap, steps + advance); renderOrbit();
    if (steps === cap) { pauseOrbit(true); return; }
  }
  updateWalkers(motion.matches ? 0 : progress);
  frame = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (running) { pauseOrbit(true); return; }
  if (steps === cap) steps = 0;
  running = true; previous = 0; progress = 0; renderOrbit();
  play.textContent = 'Wanderer anhalten'; play.setAttribute('aria-pressed', 'true');
  $('[data-orbit-status]').textContent = 'Beide Wanderer sind unterwegs. Du kannst die Bewegung jederzeit anhalten.';
  frame = requestAnimationFrame(tick);
});
function manualSteps(n: number) { pauseOrbit(); steps = Math.min(cap, steps + n); renderOrbit(); orbitMessage(); }
$('[data-orbit-step]').addEventListener('click', () => manualSteps(1));
$('[data-orbit-many]').addEventListener('click', () => manualSteps(100));
function resetOrbit() { pauseOrbit(); steps = 0; renderOrbit(); orbitMessage(); }
$('[data-orbit-reset]').addEventListener('click', resetOrbit);
rational.addEventListener('change', resetOrbit); irrational.addEventListener('change', resetOrbit);
document.addEventListener('visibilitychange', () => { if (document.hidden && running) pauseOrbit(true); });
motion.addEventListener('change', () => { if (motion.matches && running) pauseOrbit(true); });
new IntersectionObserver(([entry]) => { orbitVisible = entry.isIntersecting; if (!orbitVisible && running) pauseOrbit(true); }).observe(orbit);
renderOrbit();

// Room III: the rule is infinite; the eight room slots are a finite preview.
let hotelMode = 'one';
const hotel = $('[data-hotel-exhibit]');
const hotelRun = $<HTMLButtonElement>('[data-hotel-run]');
const doors = $$('[data-hotel-guest]');
function renderHotel(moved = false) {
  $('[data-hotel-rule]').textContent = hotelMode === 'one' ? 'n → n + 1' : hotelMode === 'bus' ? 'n → 2n · Busgast k → 2k − 1' : '0, dann positive und negative Brüche diagonal';
  $('[data-hotel-task]').textContent = hotelMode === 'one' ? 'Alle Zimmer sind belegt. Vor der Tür wartet noch ein Gast. Öffne die Türen mit einer einzigen Regel.' : hotelMode === 'bus' ? 'Ein Bus mit den Gästen 1, 2, 3, … kommt an. Wie finden alle Platz, ohne einen bisherigen Gast auszuquartieren?' : 'Ein Gast für jede rationale Zahl: 0, positive und negative Brüche. Wir vergeben Zimmer in einer Reihenfolge, die jeden erreicht.';
  const guests = rationalGuests(8);
  doors.forEach((door, i) => {
    const room = i + 1;
    const fresh = moved && hotelMode !== 'fractions' && (hotelMode === 'one' ? i === 0 : room % 2 === 1);
    door.closest('.hotel-door')!.toggleAttribute('data-new', fresh);
    door.textContent = !moved ? String(room) : hotelMode === 'fractions' ? guests[i] : fresh ? (hotelMode === 'one' ? 'Neu' : `B${(room + 1) / 2}`) : String(hotelMode === 'one' ? room - 1 : room / 2);
    door.parentElement!.nextElementSibling!.textContent = !moved ? 'Bisheriger Gast' : hotelMode === 'fractions' ? 'Rationale Zahl' : fresh ? 'Neuer Gast' : 'Bisheriger Gast';
  });
  const corridor = $('.hotel-corridor');
  corridor.removeAttribute('data-moved');
  if (moved) { void (corridor as HTMLElement).offsetWidth; corridor.setAttribute('data-moved', ''); }
  hotelRun.disabled = moved;
  hotelRun.textContent = hotelMode === 'fractions' ? 'Brüche einchecken' : 'Gäste umziehen lassen';
  $('[data-hotel-status]').textContent = !moved ? 'Überlege: Was passiert mit dem Gast im letzten sichtbaren Zimmer?' : hotelMode === 'one' ? 'Zimmer 1 ist frei geworden und nimmt den neuen Gast auf. Gast 8 wohnt jetzt in Zimmer 9, außerhalb unseres Ausschnitts. Jeder bisherige Gast n hat sein Zimmer n + 1.' : hotelMode === 'bus' ? 'Die bisherigen Gäste wohnen in den geraden Zimmern. Die Busgäste B1, B2, … belegen alle ungeraden Zimmer. Niemand geht verloren.' : 'Jeder gekürzte positive Bruch p/q erscheint bei seiner endlichen Summe p + q. Dazu kommt sein negatives Gegenstück. So erreichen wir jeden rationalen Gast genau einmal.';
}
$$<HTMLButtonElement>('[data-hotel-mode]').forEach(button => button.addEventListener('click', () => {
  hotelMode = button.dataset.hotelMode!;
  $$('[data-hotel-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  renderHotel();
}));
hotelRun.addEventListener('click', () => renderHotel(true));
$('[data-hotel-reset]', hotel).addEventListener('click', () => renderHotel());

let diagonalProgress = 0;
let listSeed = 4;
const digitCells = $$('[data-digit]');
const diagonalStep = $<HTMLButtonElement>('[data-diagonal-step]');
const diagonalAll = $<HTMLButtonElement>('[data-diagonal-all]');
function renderDiagonal(newList = false) {
  if (newList) { listSeed = (listSeed + 3) % 10; diagonalProgress = 0; }
  const diagonal: number[] = [];
  digitCells.forEach(cell => {
    const [r, c] = cell.dataset.digit!.split('-').map(Number);
    const digit = (r * 7 + c * 3 + listSeed + (r === c ? r : 0)) % 10;
    cell.textContent = String(digit);
    cell.toggleAttribute('data-changed', r === c && r < diagonalProgress);
    if (r === c) diagonal.push(diagonalDigit(digit));
  });
  $('[data-diagonal-result]').textContent = diagonal.map((d, i) => i < diagonalProgress ? String(d) : '_').join(' ');
  diagonalStep.disabled = diagonalProgress === 6; diagonalAll.disabled = diagonalProgress === 6;
  $('[data-diagonal-status]').textContent = diagonalProgress === 0 ? 'Ändere die erste Stelle. Deine neue Zahl wird sich von Zeile 1 unterscheiden.' : diagonalProgress < 6 ? `Stelle ${diagonalProgress}: Die neue Ziffer ist ${diagonal[diagonalProgress - 1]}. Unsere Zahl unterscheidet sich jetzt von jeder der ersten ${diagonalProgress} Zeilen an mindestens einer Stelle.` : 'Sechs Unterschiede sind sichtbar. Setzen wir die Regel für alle n fort, unterscheidet sich die neue Zahl von Zeile n an Stelle n. Sie fehlt in der gesamten unendlichen Liste.';
}
diagonalStep.addEventListener('click', () => { diagonalProgress++; renderDiagonal(); });
diagonalAll.addEventListener('click', () => { diagonalProgress = 6; renderDiagonal(); });
$('[data-diagonal-reset]').addEventListener('click', () => renderDiagonal(true));
renderDiagonal();

$$<HTMLFormElement>('[data-museum-quiz]').forEach(form => {
  const questions = $$<HTMLFieldSetElement>('[data-question]', form);
  const summary = $('[data-quiz-summary]', form);
  form.addEventListener('submit', event => {
    event.preventDefault(); let answered = 0; let correct = 0;
    questions.forEach(question => {
      const selected = $<HTMLInputElement>('input:checked', question);
      const ok = !!selected && selected.value === question.dataset.answer;
      answered += Number(!!selected); correct += Number(ok);
      const feedback = $('[data-feedback]', question);
      feedback.hidden = false; feedback.dataset.correct = String(ok);
      $('[data-verdict]', feedback).textContent = !selected ? 'Noch offen.' : ok ? 'Richtig.' : 'Noch nicht richtig.';
    });
    summary.textContent = `${answered} von ${questions.length} beantwortet · ${correct} richtig. ${correct === questions.length ? 'Du hast die Zusammenhänge verstanden.' : 'Die Erklärungen helfen dir beim nächsten Versuch.'}`;
  });
  form.addEventListener('reset', () => {
    $$('[data-feedback]', form).forEach(feedback => feedback.hidden = true);
    summary.textContent = 'Noch nicht ausgewertet.';
  });
});

const roomLinks = $$<HTMLAnchorElement>('.museum-nav a[href^="#"]');
// Observe all chapters with one shared observer for current-room wayfinding.
const navigationObserver = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => roomLinks.forEach(link => {
    if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  }));
}, {rootMargin: '-10% 0px -60% 0px'});
$$('.museum-room, .museum-exit').forEach(section => navigationObserver.observe(section));
