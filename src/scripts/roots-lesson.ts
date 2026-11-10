import { rootChapters } from '../data/roots-lesson';
import { chapterExercises, finalExercises } from '../data/roots-exercises';
import { numericAnswer, simplifyRadical, radicalText, rootInterval } from '../data/roots-math';

for (const form of document.querySelectorAll<HTMLFormElement>('[data-root-quiz]')) {
  const exercises = (form.dataset.final ? finalExercises : chapterExercises).filter(e => form.querySelector(`[data-exercise="${e.id}"]`));
  const revealed = new Set<string>();
  let graded = false;
  const status = form.querySelector<HTMLElement>('[data-quiz-status]')!;
  const recommendations = form.querySelector<HTMLElement>('[data-recommendations]');
  const row = (id: string) => form.querySelector<HTMLElement>(`[data-exercise="${id}"]`)!;
  const inputs = (id: string) => [...row(id).querySelectorAll<HTMLInputElement>('input')];
  const countRevealed = () => {
    const answered = exercises.filter(e => inputs(e.id).some(i => i.value.trim())).length;
    const correct = exercises.filter(e => row(e.id).dataset.result === 'correct').length;
    status.textContent = `${answered} / ${exercises.length} beantwortet · ${correct} selbstständig richtig · ${revealed.size} mit Musterlösung bearbeitet.`;
  };
  function grade() {
    const revisit = new Set<string>();
    for (const exercise of exercises) {
      const fields = inputs(exercise.id);
      const complete = fields.every(input => input.value.trim());
      const correct = fields.every((input, i) => numericAnswer(input.value, exercise.fields[i].answer));
      const state = revealed.has(exercise.id) ? 'revealed' : !complete ? 'empty' : correct ? 'correct' : 'incorrect';
      const element = row(exercise.id);
      element.dataset.result = state;
      fields.forEach((input, i) => {
        if (input.value.trim() && !numericAnswer(input.value, exercise.fields[i].answer)) input.setAttribute('aria-invalid','true');
        else input.removeAttribute('aria-invalid');
      });
      element.querySelector<HTMLElement>('[data-task-feedback]')!.textContent = state === 'correct' ? `✓ Richtig. ${exercise.explanation}` : state === 'revealed' ? 'Mit Musterlösung bearbeitet. Starte die Übungen neu, um dich ohne Hilfe zu prüfen.' : state === 'empty' ? 'Noch offen: Fülle alle Ergebnisfelder aus.' : 'Noch nicht richtig. Prüfe Rechenregel, Vorzeichen und vollständige Vereinfachung. Die Musterlösung hilft dir weiter.';
      if (state !== 'correct') revisit.add(exercise.chapter);
    }
    countRevealed();
    if (recommendations) {
      recommendations.replaceChildren();
      const intro = document.createElement('p');
      intro.textContent = revisit.size ? 'Hier lohnt sich eine Wiederholung:' : 'Alle Aufgaben selbstständig richtig gelöst. Sehr gut! Wiederhole die Regeln später noch einmal.';
      recommendations.append(intro);
      for (const chapter of rootChapters.filter(c => revisit.has(c.id))) {
        const a = document.createElement('a');
        a.href = `#${chapter.id}`; a.textContent = chapter.shortTitle;
        recommendations.append(a);
      }
    }
  }
  for (const element of form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button')) element.disabled = false;
  form.addEventListener('submit', event => { event.preventDefault(); graded = true; grade(); });
  form.addEventListener('input', event => {
    const input = event.target as HTMLInputElement;
    input.removeAttribute('aria-invalid');
    const element = input.closest<HTMLElement>('[data-exercise]');
    if (element) { delete element.dataset.result; element.querySelector('[data-task-feedback]')!.textContent = ''; }
    if (graded && recommendations) recommendations.replaceChildren();
    countRevealed();
  });
  for (const exercise of exercises) {
    row(exercise.id).querySelector<HTMLDetailsElement>('details')!.addEventListener('toggle', event => {
      if ((event.target as HTMLDetailsElement).open) {
        revealed.add(exercise.id);
        if (graded) grade(); else countRevealed();
      }
    });
  }
  form.querySelector('[data-quiz-reset]')!.addEventListener('click', () => {
    form.reset(); revealed.clear(); graded = false;
    for (const exercise of exercises) {
      const element = row(exercise.id); delete element.dataset.result;
      element.querySelector<HTMLDetailsElement>('details')!.open = false;
      element.querySelector('[data-task-feedback]')!.textContent = '';
      inputs(exercise.id).forEach(input => input.removeAttribute('aria-invalid'));
    }
    status.textContent = 'Neue Runde. Alle Antworten und Musterlösungsmarkierungen sind zurückgesetzt.';
    recommendations?.replaceChildren();
    inputs(exercises[0].id)[0].focus();
  });
}

for (const explorer of document.querySelectorAll<HTMLElement>('[data-explorer]')) {
  explorer.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-control]').forEach(control => { control.disabled = false; });
  const value = (name: string) => Number(explorer.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-control="${name}"]`)!.value);
  const output = explorer.querySelector<HTMLElement>('[data-explorer-output]')!;
  let digits = 0;
  const update = () => {
    switch (explorer.dataset.explorer) {
      case 'wurzelgesetze': {
        const a = value('a'), b = value('b'), simple = simplifyRadical(a*b);
        output.textContent = `√${a} · √${b} = √${a*b} = ${radicalText(simple.factor, simple.rest)}`; break;
      }
      case 'teilweises-wurzelziehen': {
        const n = value('n'), {factor, rest} = simplifyRadical(n);
        output.textContent = `√${n} = √(${factor*factor} · ${rest}) = ${radicalText(factor, rest)}`;
        explorer.querySelector('[data-square-factor]')!.textContent = `${factor*factor} = ${factor}²`;
        explorer.querySelector('[data-rest-factor]')!.textContent = String(rest); break;
      }
      case 'faktoren-in-die-wurzel': {
        const a = value('a'), b = value('b');
        output.textContent = `${a}√${b} = √(${a}² · ${b}) = √${a*a*b}`; break;
      }
      case 'wurzelsummen': {
        const a = value('a'), b = value('b');
        output.textContent = `${a}√2 + (${b})√2 = (${a} + (${b}))√2 = ${radicalText(a+b,2)}`; break;
      }
      case 'intervallschachtelung': {
        const n = value('n'), rows = explorer.querySelector('[data-interval-rows]')!;
        rows.replaceChildren();
        for (let d = 0; d <= digits; d++) {
          const bounds = rootInterval(n,d), p = document.createElement('p'), small = document.createElement('small');
          p.textContent = `${bounds.lower} < √${n} < ${bounds.upper}`;
          small.textContent = `denn ${bounds.lower}² = ${bounds.lowerSquare} < ${n} < ${bounds.upperSquare} = ${bounds.upper}²`;
          p.append(small); rows.append(p);
        }
        output.textContent = `Intervallbreite: ${rootInterval(n,digits).width} · ${digits} Nachkommastellen`;
        explorer.querySelector<HTMLButtonElement>('[data-interval-step]')!.disabled = digits === 4; break;
      }
      case 'wurzeln-von-wurzeln': {
        const n = value('n'), inner = Math.sqrt(n), outer = Math.sqrt(inner);
        output.textContent = `√(√${n}) = √${inner} = ${outer} · Kontrolle: ${outer}⁴ = ${n}`; break;
      }
    }
  };
  explorer.addEventListener('input', () => { digits = 0; update(); });
  const step = explorer.querySelector<HTMLButtonElement>('[data-interval-step]');
  const reset = explorer.querySelector<HTMLButtonElement>('[data-interval-reset]');
  if (step && reset) {
    step.disabled = reset.disabled = false;
    step.addEventListener('click', () => { digits = Math.min(4,digits+1); update(); });
    reset.addEventListener('click', () => { digits = 0; update(); });
  }
  update();
}
const menu = document.querySelector<HTMLDetailsElement>('[data-course-menu]');
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const active = entries.find(entry => entry.isIntersecting);
    if (!active) return;
    document.querySelectorAll('[data-course-menu] a').forEach(a => {
      if (a.getAttribute('href') === `#${active.target.id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    const title = document.querySelector('[data-current-chapter]');
    const chapter = rootChapters.find(c => c.id === active.target.id);
    if (title) title.textContent = chapter?.shortTitle ?? (active.target.id === 'gesamtabfrage' ? 'Gesamtabfrage' : 'Grundlagen & Trainer');
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('.rl-chapter, #trainer, #gesamtabfrage').forEach(section => observer.observe(section));
}
