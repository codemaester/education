import { hotelAssignment } from '../data/museum-math';

type Mode = 'one' | 'bus';
type Phase = 'ready' | 'preparing' | 'leaving' | 'departed' | 'moving' | 'vacant' | 'welcoming' | 'arriving' | 'complete';
type Point = { x: number; y: number };

export function initializeHotel(hotel: HTMLElement, motion: MediaQueryList) {
  const get = <T extends Element = HTMLElement>(selector: string) => hotel.querySelector<T>(selector)!;
  const all = <T extends Element = HTMLElement>(selector: string) => [...hotel.querySelectorAll<T>(selector)];
  const stage = get('[data-hotel-stage]');
  const layer = get('[data-hotel-motion]');
  const run = get<HTMLButtonElement>('[data-hotel-run]');
  const pause = get<HTMLButtonElement>('[data-hotel-pause]');
  const status = get('[data-hotel-status]');
  const frames = all('.door-frame');
  const residents = all('.hotel-resident');
  const numbers = all('[data-hotel-guest]');
  const labels = all('[data-guest-label]');
  const waiting = all('[data-waiting-person]');
  const existingRule = get('[data-hotel-rule="existing"]');
  const newRule = get('[data-hotel-rule="new"]');
  const personImage = residents[0].querySelector('.hotel-person-icon')!.outerHTML;
  let mode: Mode = 'one';
  let phase: Phase = 'ready';
  let generation = 0;
  let animations: Animation[] = [];
  let timer = 0;
  let resolveWait: (() => void) | undefined;
  let remaining = 0;
  let waitStarted = 0;
  let paused = false;

  function cancel() {
    generation++;
    animations.forEach(animation => animation.cancel());
    animations = [];
    clearTimeout(timer);
    resolveWait?.();
    resolveWait = undefined;
    paused = false;
    pause.textContent = 'Pause';
    pause.setAttribute('aria-pressed', 'false');
    delete hotel.dataset.hotelPaused;
    layer.replaceChildren();
    residents.forEach(resident => resident.removeAttribute('data-traveling'));
    waiting.forEach(person => person.removeAttribute('data-traveling'));
    frames.forEach(frame => frame.removeAttribute('data-open'));
  }

  function setPhase(next: Phase) {
    phase = next;
    hotel.dataset.hotelPhase = next;
    const busy = next !== 'ready' && next !== 'complete';
    run.disabled = busy;
    pause.hidden = !busy;
    run.textContent = busy ? 'Umzug läuft …' : next === 'complete' ? 'Noch einmal abspielen' : 'Gäste umziehen lassen';
    existingRule.toggleAttribute('data-active', ['preparing', 'leaving', 'departed', 'moving', 'vacant'].includes(next));
    newRule.toggleAttribute('data-active', next === 'welcoming' || next === 'arriving');
  }

  function occupants(moved: boolean, includeNew: boolean) {
    const assignment = hotelAssignment(mode);
    numbers.forEach((number, i) => {
      const old = assignment.moves.find(move => move.room === i + 1);
      const arrival = includeNew ? assignment.arrivals.find(move => move.room === i + 1) : undefined;
      const value = !moved ? String(i + 1) : arrival?.guest ?? old?.guest ?? '—';
      number.textContent = value;
      number.closest('.hotel-door')!.toggleAttribute('data-new', !!arrival);
      residents[i].toggleAttribute('data-empty', value === '—');
      labels[i].textContent = !moved ? 'Bisheriger Gast' : arrival ? 'Neuer Gast' : old ? 'Bisheriger Gast' : 'Frei';
    });
    waiting.forEach(person => person.toggleAttribute('data-arrived', includeNew));
    get('[data-waiting-more]').toggleAttribute('data-arrived', includeNew);
    if (includeNew) {
      get('[data-hotel-waiting-title]').textContent = 'Die neuen Gäste sind eingezogen';
      get('[data-hotel-waiting-note]').textContent = 'Die Wartezone ist leer. Jeder Gast hat sein Zimmer.';
    }
  }

  function formula(rule: Element, text: string) {
    const output = rule.querySelector('[data-rule-formula]')!;
    const [source, target] = text.split(' → ');
    output.textContent = target ? `${source} → ` : source;
    if (target) {
      const expression = document.createElement('span');
      expression.textContent = target;
      output.append(expression);
    }
  }

  function rules() {
    get('[data-hotel-task]').textContent = mode === 'one'
      ? 'Alle Zimmer sind belegt. Vor der Tür wartet noch ein Gast. Zuerst ziehen die bisherigen Gäste um, dann zieht der neue Gast ein.'
      : 'Ein Bus mit unendlich vielen Gästen kommt an. Sie sind nummeriert: 1, 2, 3, … Wie finden alle Platz, ohne einen bisherigen Gast auszuquartieren?';
    formula(existingRule, mode === 'one' ? 'Zimmer n → Zimmer n + 1' : 'Zimmer n → Zimmer 2n');
    existingRule.querySelector('[data-rule-example]')!.textContent = mode === 'one' ? '1 → 2, 2 → 3, 3 → 4, …' : '1 → 2, 2 → 4, 3 → 6, …';
    newRule.querySelector('[data-rule-title]')!.textContent = mode === 'bus' ? 'Neue Busgäste' : 'Neuer Gast';
    formula(newRule, mode === 'bus' ? 'Busgast k → Zimmer 2k − 1' : 'Neuer Gast → Zimmer 1');
    newRule.querySelector('[data-rule-example]')!.textContent = mode === 'bus' ? 'Gast 1 → Zimmer 1, Gast 2 → Zimmer 3, Gast 3 → Zimmer 5, …' : 'Erst umziehen, dann den neuen Gast aufnehmen.';
    get('[data-hotel-waiting-title]').textContent = mode === 'bus' ? 'Unendlich viele Busgäste warten' : 'Ein neuer Gast wartet';
    get('[data-hotel-waiting-note]').textContent = mode === 'bus' ? 'Gast 1, 2, 3, 4, … — hier die ersten vier.' : 'Er zieht nach dem Umzug in Zimmer 1.';
    get('[data-waiting-more]').hidden = mode !== 'bus';
    waiting.forEach((person, i) => {
      person.hidden = mode !== 'bus' && i > 0;
      person.querySelector('[data-waiting-guest]')!.textContent = mode === 'bus' ? `B${i + 1}` : 'Neu';
    });
  }

  function reset() {
    cancel();
    rules();
    occupants(false, false);
    setPhase('ready');
    status.textContent = 'Alles ist belegt. Starte den Umzug und beobachte, welche Zimmer frei werden.';
  }

  function complete() {
    occupants(true, true);
    cancel();
    setPhase('complete');
    status.textContent = mode === 'one' ? 'Alle haben Platz: der neue Gast in Zimmer 1, die bisherigen Gäste je ein Zimmer weiter.'
      : 'Alle haben Platz: bisherige Gäste in geraden Zimmern, Busgäste in ungeraden Zimmern.';
  }

  function point(element: Element): Point {
    const rect = element.getBoundingClientRect();
    const base = stage.getBoundingClientRect();
    return { x: rect.left - base.left + rect.width / 2 - 20, y: rect.top - base.top + rect.height / 2 - 38 };
  }
  function lane(room: number) {
    return frames[room - 1].getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 32;
  }
  async function makeTraveler(guest: string, room: number, fresh: boolean) {
    const traveler = document.createElement('div');
    traveler.className = `hotel-traveler${fresh ? ' hotel-traveler-new' : ''}`;
    traveler.dataset.hotelMover = guest;
    traveler.dataset.hotelTarget = String(room);
    traveler.innerHTML = personImage;
    const badge = document.createElement('span');
    badge.textContent = guest;
    traveler.append(badge);
    // Decode while the original is still visible, before handing it to the mover.
    await traveler.querySelector<HTMLImageElement>('img')!.decode().catch(() => undefined);
    return traveler;
  }
  async function fly(traveler: HTMLElement, points: Point[], duration: number) {
    if (!traveler.isConnected) layer.append(traveler);
    let distance = 0;
    const lengths = points.map((p, i) => {
      if (i) distance += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
      return distance;
    });
    const animation = traveler.animate(points.map((p, i) => ({
      transform: `translate(${p.x}px, ${p.y}px)`,
      offset: distance ? lengths[i] / distance : i / (points.length - 1),
      opacity: 1,
    })), { duration, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both' });
    animations.push(animation);
    await animation.finished.catch(() => undefined);
  }
  function scheduleWait() {
    waitStarted = performance.now();
    timer = window.setTimeout(() => {
      timer = 0;
      const resolve = resolveWait;
      resolveWait = undefined;
      resolve?.();
    }, remaining);
  }
  function wait(milliseconds: number) {
    return new Promise<void>(resolve => {
      resolveWait = resolve;
      remaining = milliseconds;
      scheduleWait();
    });
  }

  async function start() {
    reset();
    if (motion.matches || document.hidden) { complete(); return; }
    const token = generation;
    const assignment = hotelAssignment(mode);
    size = { width: stage.clientWidth, height: stage.clientHeight };
    const rail = stage.getBoundingClientRect().width - 6;
    setPhase('preparing');
    status.textContent = mode === 'one' ? 'Jeder bisherige Gast zieht ein Zimmer weiter: 1 → 2, 2 → 3, …'
      : 'Zuerst ziehen die bisherigen Gäste in die geraden Zimmer: 1 → 2, 2 → 4, …';
    const [, departing] = await Promise.all([
      wait(1200),
      Promise.all(assignment.moves.map(move => makeTraveler(move.guest, move.room, false))),
    ]);
    if (token !== generation) return;
    setPhase('leaving');
    status.textContent = 'Die Gäste verlassen ihre bisherigen Zimmer. Ihre Gastnummer bleibt gleich.';
    const trips = assignment.moves.map((move, i) => {
      const origin = point(residents[i]);
      const startLane = lane(i + 1);
      const outside = { x: origin.x, y: startLane };
      const target = move.room <= 8 ? point(residents[move.room - 1])
        : { x: layer.getBoundingClientRect().width + 40, y: startLane };
      const endLane = move.room <= 8 ? lane(move.room) : startLane;
      const points = [outside];
      if (Math.abs(startLane - endLane) > 1) points.push({ x: rail, y: startLane }, { x: rail, y: endLane });
      points.push({ x: target.x, y: endLane });
      if (move.room <= 8) points.push(target);
      residents[i].setAttribute('data-traveling', '');
      frames[i].setAttribute('data-open', '');
      const traveler = departing[i];
      return { traveler, points, departure: fly(traveler, [origin, outside], 700) };
    });
    await Promise.all(trips.map(trip => trip.departure));
    if (token !== generation) return;
    setPhase('departed');
    status.textContent = 'Alle bisherigen Gäste sind im Flur. Jetzt wechseln sie ihre Zimmer.';
    await wait(900);
    if (token !== generation) return;
    setPhase('moving');
    status.textContent = mode === 'one' ? 'Alle rücken ein Zimmer weiter. Gast 8 geht rechts weiter zu Zimmer 9.'
      : 'Alle ziehen in gerade Zimmer. Gäste ab Nummer 5 gehen rechts zu weiteren Zimmern.';
    await Promise.all(trips.map(trip => fly(trip.traveler, trip.points, 2200)));
    if (token !== generation) return;
    layer.replaceChildren();
    residents.forEach(resident => resident.removeAttribute('data-traveling'));
    frames.forEach(frame => frame.removeAttribute('data-open'));
    occupants(true, false);
    setPhase('vacant');
    status.textContent = mode === 'one' ? 'Zimmer 1 ist jetzt frei. Alle bisherigen Gäste haben ein neues Zimmer.'
      : 'Die ungeraden Zimmer 1, 3, 5, 7, … sind jetzt frei. Jeder bisherige Gast hat sein Zimmer.';
    await wait(1600);
    if (token !== generation) return;
    setPhase('welcoming');
    status.textContent = mode === 'one' ? 'Jetzt ist Platz für den neuen Gast: Er bekommt Zimmer 1.'
      : 'Jetzt kommen die Busgäste. Gast 1 bekommt Zimmer 1, Gast 2 Zimmer 3, …';
    const [, arriving] = await Promise.all([
      wait(1100),
      Promise.all(assignment.arrivals.map(move => makeTraveler(move.guest, move.room, true))),
    ]);
    if (token !== generation) return;
    setPhase('arriving');
    status.textContent = mode === 'one' ? 'Der neue Gast zieht in Zimmer 1 ein.' : 'Die Busgäste beziehen die freien ungeraden Zimmer: 1, 3, 5, 7, …';
    await Promise.all(assignment.arrivals.map((move, i) => {
      const origin = point(waiting[i]);
      const target = point(residents[move.room - 1]);
      const endLane = lane(move.room);
      const points = [origin, { x: rail, y: origin.y }, { x: rail, y: endLane }, { x: target.x, y: endLane }, target];
      waiting[i].setAttribute('data-traveling', '');
      frames[move.room - 1].setAttribute('data-open', '');
      return fly(arriving[i], points, 2000);
    }));
    if (token === generation) complete();
  }

  all<HTMLButtonElement>('[data-hotel-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.hotelMode as Mode;
    all('[data-hotel-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    reset();
  }));
  run.addEventListener('click', () => { void start(); });
  get('[data-hotel-reset]').addEventListener('click', reset);
  const busy = () => phase !== 'ready' && phase !== 'complete';
  pause.addEventListener('click', () => {
    if (!busy()) return;
    paused = !paused;
    run.textContent = paused ? 'Umzug pausiert' : 'Umzug läuft …';
    pause.textContent = paused ? 'Weiter' : 'Pause';
    pause.setAttribute('aria-pressed', String(paused));
    hotel.toggleAttribute('data-hotel-paused', paused);
    if (paused) {
      animations.filter(animation => animation.playState === 'running').forEach(animation => animation.pause());
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        remaining = Math.max(0, remaining - (performance.now() - waitStarted));
      }
    } else {
      animations.filter(animation => animation.playState === 'paused').forEach(animation => animation.play());
      if (resolveWait) scheduleWait();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && busy()) complete(); });
  motion.addEventListener('change', () => { if (motion.matches && busy()) complete(); });
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && busy()) complete(); }).observe(stage);
  let size = { width: stage.clientWidth, height: stage.clientHeight };
  new ResizeObserver(() => {
    const next = { width: stage.clientWidth, height: stage.clientHeight };
    if ((next.width !== size.width || next.height !== size.height) && busy()) complete();
    size = next;
  }).observe(stage);
  reset();
}
