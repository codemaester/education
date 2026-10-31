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
function renderZoom() {
  const d = Number(depth.value);
  const bracket = sqrtTwoWindow(d);
  $('[data-known-digits]').textContent = bracket.left;
  $('.digit-unknown').textContent = d ? '…' : ', …';
  $('[data-lower]').textContent = bracket.left;
  $('[data-upper]').textContent = bracket.right;
  $('[data-zoom-level]').textContent = `Zoomstufe ${d} / 24`;
  $('[data-zoom-marker]').setAttribute('transform', `translate(${42 + bracket.fraction * 716} 0)`);
  $('[data-zoom-status]').textContent = d === 0 ? '√2 liegt zwischen 1 und 2. Beide Grenzen sind rationale Zahlen.' : `Das Intervall ist jetzt 10${superscript(-d)} breit. Bei einem Meter für das ursprüngliche Intervall wäre die aktuelle Vergrößerung 10${superscript(d)}-fach. √2 bleibt exakt dieselbe Zahl.`;
  out.disabled = d === 0;
  into.disabled = d === 24;
}
function superscript(n: number) { const chars: Record<string, string> = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}; return String(n).split('').map(c => chars[c]).join(''); }
depth.addEventListener('input', renderZoom);
out.addEventListener('click', () => { depth.value = String(Number(depth.value) - 1); renderZoom(); });
into.addEventListener('click', () => { depth.value = String(Number(depth.value) + 1); renderZoom(); });
$('[data-zoom-reset]', zoom).addEventListener('click', () => { depth.value = '0'; renderZoom(); });
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
