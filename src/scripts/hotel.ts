import { hotelAssignment, rationalGuests } from '../data/museum-math';

type Mode = 'one' | 'bus' | 'fractions';
type Phase = 'ready' | 'moving' | 'vacant' | 'arriving' | 'complete';
type Point = { x: number; y: number };

export function initializeHotel(hotel: HTMLElement, motion: MediaQueryList) {
  const get = <T extends Element = HTMLElement>(selector: string) => hotel.querySelector<T>(selector)!;
  const all = <T extends Element = HTMLElement>(selector: string) => [...hotel.querySelectorAll<T>(selector)];
  const stage = get('[data-hotel-stage]');
  const layer = get('[data-hotel-motion]');
  const run = get<HTMLButtonElement>('[data-hotel-run]');
  const status = get('[data-hotel-status]');
  const frames = all('.door-frame');
  const residents = all('.hotel-resident');
  const numbers = all('[data-hotel-guest]');
  const labels = all('[data-guest-label]');
  const waiting = all('[data-waiting-person]');
  const existingRule = get('[data-hotel-rule="existing"]');
  const newRule = get('[data-hotel-rule="new"]');
  const personSVG = residents[0].querySelector('svg')!.outerHTML;
  let mode: Mode = 'one';
  let phase: Phase = 'ready';
  let generation = 0;
  let animations: Animation[] = [];
  let timer = 0;
  let resolveWait: (() => void) | undefined;

  function cancel() {
    generation++;
    animations.forEach(animation => animation.cancel());
    animations = [];
    clearTimeout(timer);
    resolveWait?.();
    resolveWait = undefined;
    layer.replaceChildren();
    residents.forEach(resident => resident.removeAttribute('data-traveling'));
    waiting.forEach(person => person.removeAttribute('data-traveling'));
    frames.forEach(frame => frame.removeAttribute('data-open'));
  }

  function setPhase(next: Phase) {
    phase = next;
    hotel.dataset.hotelPhase = next;
    const busy = next === 'moving' || next === 'vacant' || next === 'arriving';
    run.disabled = busy;
    run.textContent = busy ? 'Umzug läuft …' : next === 'complete' ? 'Noch einmal abspielen' : mode === 'fractions' ? 'Brüche einchecken' : 'Gäste umziehen lassen';
    existingRule.toggleAttribute('data-active', next === 'moving');
    newRule.toggleAttribute('data-active', next === 'arriving');
  }

  function occupants(moved: boolean, includeNew: boolean) {
    const assignment = mode === 'fractions' ? undefined : hotelAssignment(mode);
    const fractions = mode === 'fractions' && moved ? rationalGuests(8) : [];
    numbers.forEach((number, i) => {
      const old = assignment?.moves.find(move => move.room === i + 1);
      const arrival = includeNew ? assignment?.arrivals.find(move => move.room === i + 1) : undefined;
      const value = !moved ? String(i + 1) : mode === 'fractions' ? fractions[i] : arrival?.guest ?? old?.guest ?? '—';
      number.textContent = value;
      number.closest('.hotel-door')!.toggleAttribute('data-new', !!arrival);
      residents[i].toggleAttribute('data-empty', value === '—');
      labels[i].textContent = !moved ? 'Bisheriger Gast' : mode === 'fractions' ? 'Rationale Zahl' : arrival ? 'Neuer Gast' : old ? 'Bisheriger Gast' : 'Frei';
    });
    waiting.forEach(person => person.toggleAttribute('data-arrived', includeNew));
    get('[data-waiting-more]').toggleAttribute('data-arrived', includeNew);
    if (includeNew && mode !== 'fractions') {
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
      : mode === 'bus' ? 'Ein Bus mit unendlich vielen Gästen kommt an. Sie sind nummeriert: 1, 2, 3, … Wie finden alle Platz, ohne einen bisherigen Gast auszuquartieren?'
        : 'Ein Gast für jede rationale Zahl: 0, positive und negative Brüche. Wir vergeben Zimmer in einer Reihenfolge, die jeden erreicht.';
    existingRule.querySelector('h4')!.textContent = mode === 'fractions' ? 'Alle rationalen Gäste' : 'Bisherige Gäste';
    formula(existingRule, mode === 'one' ? 'Zimmer n → Zimmer n + 1' : mode === 'bus' ? 'Zimmer n → Zimmer 2n' : '0, dann Brüche diagonal');
    existingRule.querySelector('[data-rule-example]')!.textContent = mode === 'one' ? '1 → 2, 2 → 3, 3 → 4, …' : mode === 'bus' ? '1 → 2, 2 → 4, 3 → 6, …' : 'Gekürzte positive Brüche nach p + q ordnen und jeweils den negativen Bruch ergänzen.';
    newRule.hidden = mode === 'fractions';
    newRule.querySelector('[data-rule-title]')!.textContent = mode === 'bus' ? 'Neue Busgäste' : 'Neuer Gast';
    formula(newRule, mode === 'bus' ? 'Busgast k → Zimmer 2k − 1' : 'Neuer Gast → Zimmer 1');
    newRule.querySelector('[data-rule-example]')!.textContent = mode === 'bus' ? 'Gast 1 → Zimmer 1, Gast 2 → Zimmer 3, Gast 3 → Zimmer 5, …' : 'Erst umziehen, dann den neuen Gast aufnehmen.';
    get('[data-hotel-exit]').textContent = mode === 'bus' ? 'Weiter zu Zimmer 10, 12, 14, 16, … Die Zimmer gehen ohne letztes Zimmer weiter.' : 'Weiter zu Zimmer 9, … Die Zimmer gehen ohne letztes Zimmer weiter.';
    get('[data-hotel-waiting]').hidden = mode === 'fractions';
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
    status.textContent = 'Überlege: Was passiert mit dem Gast im letzten sichtbaren Zimmer?';
  }

  function complete() {
    cancel();
    occupants(true, true);
    setPhase('complete');
    status.textContent = mode === 'one' ? 'Zimmer 1 nimmt den neuen Gast auf. Gast 8 wohnt jetzt in Zimmer 9, außerhalb unseres Ausschnitts. Jeder bisherige Gast n hat sein Zimmer n + 1.'
      : mode === 'bus' ? 'Die bisherigen Gäste wohnen in den geraden Zimmern. Die Busgäste B1, B2, … belegen alle ungeraden Zimmer. Niemand geht verloren.'
        : 'Jeder gekürzte positive Bruch p/q erscheint bei seiner endlichen Summe p + q. Dazu kommt sein negatives Gegenstück. So erreichen wir jeden rationalen Gast genau einmal.';
  }

  function point(element: Element): Point {
    const rect = element.getBoundingClientRect();
    const base = stage.getBoundingClientRect();
    return { x: rect.left - base.left + rect.width / 2 - 18, y: rect.top - base.top + rect.height / 2 - 30 };
  }
  function lane(room: number) {
    return frames[room - 1].getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 32;
  }
  async function fly(guest: string, room: number, points: Point[], duration: number, fresh: boolean) {
    const traveler = document.createElement('div');
    traveler.className = `hotel-traveler${fresh ? ' hotel-traveler-new' : ''}`;
    traveler.dataset.hotelMover = guest;
    traveler.dataset.hotelTarget = String(room);
    traveler.innerHTML = personSVG;
    const badge = document.createElement('span');
    badge.textContent = guest;
    traveler.append(badge);
    layer.append(traveler);
    let distance = 0;
    const lengths = points.map((p, i) => {
      if (i) distance += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
      return distance;
    });
    const animation = traveler.animate(points.map((p, i) => ({
      transform: `translate(${p.x}px, ${p.y}px)`,
      offset: distance ? lengths[i] / distance : i / (points.length - 1),
      opacity: i === points.length - 1 ? 0 : i === 0 ? .6 : 1,
    })), { duration, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both' });
    animations.push(animation);
    await animation.finished.catch(() => undefined);
  }
  function wait() {
    return new Promise<void>(resolve => {
      resolveWait = resolve;
      timer = window.setTimeout(() => { resolveWait = undefined; resolve(); }, 400);
    });
  }

  async function start() {
    reset();
    if (mode === 'fractions' || motion.matches || document.hidden) { complete(); return; }
    const token = generation;
    const assignment = hotelAssignment(mode);
    size = { width: stage.clientWidth, height: stage.clientHeight };
    const rail = stage.getBoundingClientRect().width - 2;
    setPhase('moving');
    status.textContent = 'Zuerst ziehen die bisherigen Gäste um. Ihre Gastnummer bleibt dieselbe; nur die Zimmernummer ändert sich.';
    const trips = assignment.moves.map((move, i) => {
      const origin = point(residents[i]);
      const startLane = lane(i + 1);
      const target = move.room <= 8 ? point(residents[move.room - 1]) : point(get('[data-hotel-exit]'));
      const points = [origin, { x: origin.x, y: startLane }];
      const endLane = move.room <= 8 ? lane(move.room) : target.y;
      if (Math.abs(startLane - endLane) > 1) points.push({ x: rail, y: startLane }, { x: rail, y: endLane });
      points.push({ x: target.x, y: endLane }, target);
      residents[i].setAttribute('data-traveling', '');
      frames[i].setAttribute('data-open', '');
      return fly(move.guest, move.room, points, 1600, false);
    });
    await Promise.all(trips);
    if (token !== generation) return;
    layer.replaceChildren();
    residents.forEach(resident => resident.removeAttribute('data-traveling'));
    frames.forEach(frame => frame.removeAttribute('data-open'));
    occupants(true, false);
    setPhase('vacant');
    status.textContent = mode === 'one' ? 'Der Umzug ist geschafft. Zimmer 1 ist frei für den neuen Gast.' : 'Der Umzug ist geschafft. Die ungeraden Zimmer 1, 3, 5, 7, … sind frei für die Busgäste.';
    await wait();
    if (token !== generation) return;
    setPhase('arriving');
    status.textContent = mode === 'one' ? 'Jetzt kommt der neue Gast und zieht in Zimmer 1 ein.' : 'Jetzt ziehen die Busgäste ein: Gast 1 in Zimmer 1, Gast 2 in Zimmer 3, Gast 3 in Zimmer 5, …';
    await Promise.all(assignment.arrivals.map((move, i) => {
      const origin = point(waiting[i]);
      const target = point(residents[move.room - 1]);
      const endLane = lane(move.room);
      const points = [origin, { x: rail, y: origin.y }, { x: rail, y: endLane }, { x: target.x, y: endLane }, target];
      waiting[i].setAttribute('data-traveling', '');
      frames[move.room - 1].setAttribute('data-open', '');
      return fly(move.guest, move.room, points, 1200, true);
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
  const busy = () => phase === 'moving' || phase === 'vacant' || phase === 'arriving';
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
