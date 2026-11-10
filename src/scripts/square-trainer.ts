import { createTasks, answerFor, expressionFor, isCorrect, repeatTask } from '../data/square-trainer';
import type { Mode, Task } from '../data/square-trainer';

const root = document.querySelector<HTMLElement>('#square-trainer');
if (root) {
  const el = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#sq-${id}`)!;
  const input = el<HTMLInputElement>('answer');
  const submit = el<HTMLButtonElement>('submit');
  const reveal = el<HTMLButtonElement>('reveal');
  const progress = el<HTMLProgressElement>('progress');
  let queue: Task[] = [];
  let current: Task;
  let checked = false;
  let total = 0, mastered = 0, first = 0, misses = 0, streak = 0;

  function showTask(focus = true) {
    const next = queue.shift();
    if (!next) {
      el('question-area').hidden = true;
      el('summary').hidden = false;
      el('summary-text').textContent = `Alle ${total} Aufgaben sicher gelöst. ${first} davon direkt beim ersten Versuch. Fehler oder aufgedeckte Lösungen: ${misses}.`;
      el('summary').focus();
      return;
    }
    current = next;
    checked = false;
    el('expression').textContent = expressionFor(current);
    el('kind').textContent = current.kind === 'square' ? 'Quadrieren' : 'Wurzelziehen';
    el('repeat').hidden = !current.repeated;
    el('answer-label').textContent = `Deine Antwort für ${expressionFor(current)}`;
    input.value = '';
    input.readOnly = false;
    input.removeAttribute('aria-invalid');
    el('feedback').textContent = '';
    el('feedback').removeAttribute('data-result');
    submit.textContent = 'Antwort prüfen ↵';
    reveal.disabled = false;
    if (focus) input.focus();
  }
  function stats() {
    progress.value = mastered;
    el('progress-text').textContent = `${mastered} / ${total} sicher`;
    el('first').textContent = String(first);
    el('misses').textContent = String(misses);
    el('streak').textContent = String(streak);
  }
  function start(focus = true) {
    const mode = root!.querySelector<HTMLInputElement>('input[name="sq-mode"]:checked')!.value as Mode;
    const range = el<HTMLSelectElement>('range').value;
    const min = range === 'large' ? 11 : 1, max = range === 'small' ? 10 : 20;
    queue = createTasks(mode, min, max);
    total = queue.length;
    mastered = first = misses = streak = 0;
    progress.max = total;
    el('round-label').textContent = `${mode === 'mixed' ? 'Gemischt' : mode === 'root' ? 'Wurzelziehen' : 'Quadrieren'} · ${min} bis ${max}`;
    el('summary').hidden = true;
    el('question-area').hidden = false;
    stats();
    showTask(focus);
  }
  function assess(known: boolean) {
    if (checked) return;
    if (known && !/^\d{1,3}$/.test(input.value)) {
      el('feedback').textContent = 'Bitte gib dein Ergebnis als ganze Zahl ein.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    const correct = known && isCorrect(current, input.value);
    const explanation = `${current.n} · ${current.n} = ${current.n * current.n}.`;
    el('feedback').dataset.result = correct ? 'correct' : 'incorrect';
    el('feedback').textContent = correct
      ? `✓ Richtig! ${expressionFor(current)} = ${answerFor(current)}.`
      : `${known ? 'Noch nicht ganz.' : 'Schau es dir in Ruhe an.'} ${expressionFor(current)} = ${answerFor(current)}. ${explanation} Diese Aufgabe kommt wieder.`;
    if (correct) {
      mastered++;
      if (!current.repeated) first++;
      streak++;
    } else {
      queue = repeatTask(queue, current);
      misses++;
      streak = 0;
      if (known) input.setAttribute('aria-invalid', 'true');
    }
    checked = true;
    input.readOnly = true;
    reveal.disabled = true;
    submit.textContent = queue.length ? 'Nächste Aufgabe →' : 'Runde auswerten →';
    stats();
    submit.focus();
  }
  el<HTMLFormElement>('form').addEventListener('submit', event => {
    event.preventDefault();
    if (checked) showTask(); else assess(true);
  });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
    input.removeAttribute('aria-invalid');
  });
  reveal.addEventListener('click', () => assess(false));
  el('restart').addEventListener('click', () => start());
  el('again').addEventListener('click', () => start());
  const toggle = el('keypad-toggle');
  toggle.addEventListener('click', () => {
    const panel = el('keypad');
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    toggle.textContent = panel.hidden ? 'Ziffernfeld anzeigen' : 'Ziffernfeld ausblenden';
  });
  el('keypad').addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button || checked) return;
    if (button.id === 'sq-delete') input.value = input.value.slice(0, -1);
    else if (input.value.length < 3) input.value += button.dataset.digit;
    input.removeAttribute('aria-invalid');
  });
  root.hidden = false;
  start(false);
}
