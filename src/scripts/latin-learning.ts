import { initFlashcards } from './latin-flashcards';
import { vocabulary, type TrainerWord } from '../data/latin';
import { buildExercises, checkAnswer, decodeProgress, defaultFilters, dimensions, filterWords,
  PROGRESS_KEY, progressSummary, recordProgress, retryExercise, wordById, wordTypesForMode,
  type AnswerFormat, type AnswerResult, type Dimension, type Exercise, type Filters, type Mode, type Progress } from '../data/latin-learning';

export function initLearning(root: HTMLElement, edit: () => void) {
  const el = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const modeInputs = [...root.querySelectorAll<HTMLInputElement>('input[name="trainingMode"]')];
  const selectedModeInput = () => modeInputs.find(input => input.checked) ?? modeInputs[0];
  const modePicker = el('[data-mode-picker]');
  const modeTiles = [...root.querySelectorAll<HTMLElement>('.latin-mode-tile')];
  const trainingOptions = el<HTMLFieldSetElement>('[data-training-options]');
  const changeMode = el<HTMLButtonElement>('[data-change-mode]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selectionVersion = 0;
  let selectionAnimations: Animation[] = [];
  const packInput = el<HTMLSelectElement>('#learning-package');
  const posInput = el<HTMLSelectElement>('#word-type');
  let configuredWordTypeMode: Mode | null = null;
  const weaknessInput = el<HTMLSelectElement>('#learning-weakness');
  const answerFormatInput = el<HTMLInputElement>('#answer-format');
  const totalInput = el<HTMLInputElement>('#total-words');
  const activity = el('[data-activity]');
  const activityForm = el<HTMLFormElement>('[data-answer-form]');
  const fields = el('[data-answer-fields]');
  const next = el<HTMLButtonElement>('[data-activity-next]');
  const check = el<HTMLButtonElement>('[data-check-answer]');
  const report = el('[data-answer-report]');
  const summary = el('[data-activity-result]');
  let progress: Progress;
  let storageAvailable = true;
  try { progress = decodeProgress(localStorage.getItem(PROGRESS_KEY)); }
  catch { progress = decodeProgress(null); storageAvailable = false; }
  let queue: Exercise[] = [];
  let index = 0;
  let statuses: AnswerResult[] | null = null;
  let committed = false;
  let hinted = false;
  let selfAssessed = new Set<number>();
  let hintIndex = 0;
  let totals: Record<Dimension, { correct: number; total: number }>;
  let mistakes: Set<string>;
  let running: { mode: Exclude<Mode, 'matching' | 'flashcards'>; pool: TrainerWord[]; total: number; answerFormat: AnswerFormat } | null = null;

  const flashcards = initFlashcards(root, edit, (id, correct) => {
    progress = recordProgress(progress, id, 'meaning', correct); save();
  });

  const mode = () => selectedModeInput().value as Mode;
  const filters = (): Filters => ({ packageId: packInput.value, partOfSpeech: posInput.value, lesson: null, weakness: weaknessInput.value });
  const pool = () => filterWords(vocabulary, mode(), filters(), progress);
  const ready = () => modeInputs.some(input => input.checked) && !trainingOptions.hidden && !trainingOptions.disabled;

  function cancelSelectionAnimation(): void {
    selectionVersion++;
    selectionAnimations.forEach(animation => animation.cancel());
    selectionAnimations = [];
  }
  function focusSelection(): void {
    const input = selectedModeInput();
    const target = modePicker.dataset.expanded === 'true' ? el(`#mode-title-${input.value}`) : input;
    target.focus({ preventScroll: true });
  }
  function openMode(input: HTMLInputElement, animate = true): void {
    const tile = input.closest<HTMLElement>('.latin-mode-tile')!;
    if (tile.dataset.expanded === 'true' && modePicker.dataset.expanded === 'true') return;
    const before = tile.getBoundingClientRect();
    cancelSelectionAnimation();
    const version = selectionVersion;
    trainingOptions.hidden = true; trainingOptions.disabled = true;
    modeInputs.forEach(candidate => { candidate.checked = candidate === input; });
    modeTiles.forEach(candidate => {
      const expanded = candidate === tile;
      candidate.hidden = !expanded;
      candidate.dataset.expanded = String(expanded);
      candidate.querySelector<HTMLElement>('.latin-mode-details')!.hidden = !expanded;
      const radio = candidate.querySelector<HTMLInputElement>('input')!;
      radio.setAttribute('aria-describedby', `mode-${expanded ? 'details' : 'description'}-${radio.value}`);
    });
    modePicker.dataset.expanded = 'true';
    root.dataset.modeOpening = 'true';
    changeMode.hidden = false;
    el('#mode-choice-help').hidden = true;
    answerFormatInput.checked = true;
    refresh();
    tile.scrollIntoView({ block: 'start', behavior: 'instant' });
    const reveal = () => {
      if (selectionVersion !== version || !input.checked) return;
      root.dataset.modeOpening = 'false';
      trainingOptions.hidden = false; trainingOptions.disabled = false;
      focusSelection();
    };
    if (!animate || reducedMotion.matches || typeof tile.animate !== 'function' || before.width === 0) { reveal(); return; }
    // One shared-element moment: the chosen tile moves from its grid bounds
    // into the full-width explanation. Configuration follows only on completion.
    const after = tile.getBoundingClientRect();
    const content = tile.querySelector<HTMLElement>('.latin-mode-content')!;
    const explanation = tile.querySelector<HTMLElement>('.latin-mode-details')!;
    selectionAnimations = [
      content.animate([
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})` },
        { transform: 'none' },
      ], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
      explanation.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 140, fill: 'backwards', easing: 'ease-out' }),
    ];
    void Promise.allSettled(selectionAnimations.map(animation => animation.finished)).then(reveal);
  }
  function closeMode(): void {
    const previous = selectedModeInput();
    cancelSelectionAnimation();
    root.dataset.modeOpening = 'false';
    trainingOptions.hidden = true; trainingOptions.disabled = true;
    modePicker.dataset.expanded = 'false'; changeMode.hidden = true;
    el('#mode-choice-help').hidden = false;
    modeTiles.forEach(tile => {
      tile.hidden = false; delete tile.dataset.expanded;
      tile.querySelector<HTMLElement>('.latin-mode-details')!.hidden = true;
      const input = tile.querySelector<HTMLInputElement>('input')!;
      input.checked = false;
      input.setAttribute('aria-describedby', `mode-description-${input.value}`);
    });
    el('#config-error').hidden = true;
    previous.focus();
  }
  changeMode.addEventListener('click', closeMode);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) selectionAnimations.forEach(animation => animation.finish());
  });
  function showProgress(): void {
    const s = progressSummary(progress);
    el('[data-learning-summary]').textContent = `${s.practiced} Wörter geübt · ${s.due} zur Wiederholung fällig · ${s.weak} mit unsicheren Angaben`;
    el('[data-storage-note]').textContent = storageAvailable
      ? 'Dein Lernstand bleibt in diesem Browser. Kein Konto, keine Übertragung. Bedeutungen und einzelne Formen werden getrennt wiederholt.'
      : 'Die Browserspeicherung ist nicht verfügbar. Du kannst weiterlernen; dein Lernstand gilt für diese geöffnete Seite.';
    const due = el('[data-due-list]');
    const upcoming = Object.entries(progress.words).flatMap(([id, skills]) => Object.entries(skills).map(([skill, p]) => ({ id, skill, ...p }))).sort((a, b) => a.nextDue - b.nextDue).slice(0, 5);
    due.replaceChildren(...upcoming.map(p => {
      const li = document.createElement('li');
      const word = wordById(p.id);
      const label = p.skill === 'meaning' ? 'Bedeutung' : p.skill === 'perfekt_1sg' ? 'Perfektstamm' : p.skill === 'geschlecht' ? 'Genus' : p.skill.startsWith('context') || p.skill === 'form_meaning' ? 'Kontext' : 'Form / Zusatzangabe';
      li.textContent = `${word?.latin ?? p.id} · ${label} · ${p.nextDue <= Date.now() ? 'jetzt fällig' : new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(p.nextDue)}`;
      return li;
    }));
    el<HTMLButtonElement>('[data-reset-progress]').disabled = s.practiced === 0;
  }
  function save(): void {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); storageAvailable = true; }
    catch { storageAvailable = false; }
    showProgress();
  }
  function refresh(): void {
    const wordTypes = wordTypesForMode(mode());
    const fixedWordType = wordTypes.length === 1;
    if (configuredWordTypeMode !== mode()) {
      const previousValue = posInput.disabled ? '' : posInput.value;
      const choices = fixedWordType ? wordTypes : [{ value: '', label: 'Alle Wortarten' }, ...wordTypes];
      posInput.replaceChildren(...choices.map(choice => {
        const option = document.createElement('option'); option.value = choice.value; option.textContent = choice.label; return option;
      }));
      posInput.value = wordTypes.some(choice => choice.value === previousValue) ? previousValue : '';
      configuredWordTypeMode = mode();
    }
    if (fixedWordType) posInput.value = wordTypes[0].value;
    posInput.disabled = fixedWordType;
    const wordTypeNote = el('[data-word-type-note]');
    wordTypeNote.hidden = !fixedWordType;
    wordTypeNote.textContent = fixedWordType ? `Dieser Modus trainiert ausschließlich ${wordTypes[0].label}.` : '';
    const count = pool().length;
    el('[data-pool-size]').textContent = count
      ? `${count} passende Wörter · ${packInput.selectedOptions[0].textContent}`
      : 'Keine passenden Wörter. Wähle ein anderes Paket oder lockere die Filter. Persönliche Fehlerpakete füllen sich erst beim Üben.';
    const requested = totalInput.valueAsNumber;
    const actual = Math.min(requested, count);
    el<HTMLOutputElement>('[data-total-output]').value = String(requested);
    totalInput.setAttribute('aria-valuetext', count && actual < requested ? `${requested} ausgewählt, ${actual} ${actual === 1 ? 'Wort' : 'Wörter'} verfügbar` : `${requested} Wörter`);
    el('[data-total-help]').textContent = count && actual < requested
      ? actual === 1 ? 'Dein Lernpaket enthält nur ein passendes Wort. Du übst dieses Wort.'
        : `Dein Lernpaket enthält nur ${actual} passende Wörter. Du übst alle ${actual}.`
      : '5 bis 30 Wörter in Fünferschritten';
    el('[data-matching-settings]').hidden = mode() !== 'matching';
    el('[data-answer-format-settings]').hidden = ['matching', 'flashcards'].includes(mode());
    answerFormatInput.disabled = ['matching', 'flashcards'].includes(mode());
    el('[data-pool-size]').dataset.empty = String(!count);
    el('#config-error').hidden = true; el('#config-error').textContent = '';
    totalInput.removeAttribute('aria-invalid');
  }
  function configure(nextMode: Mode, packageId = 'all', weakness = ''): void {
    edit();
    packInput.value = packageId;
    posInput.value = '';
    weaknessInput.value = weakness;
    refresh();
    openMode(modeInputs.find(input => input.value === nextMode)!, false);
  }
  for (const input of [packInput, posInput, weaknessInput]) input.addEventListener('change', () => refresh());
  totalInput.addEventListener('input', () => refresh());
  answerFormatInput.addEventListener('change', () => refresh());
  modeInputs.forEach(input => {
    input.addEventListener('change', () => openMode(input));
    input.addEventListener('click', () => openMode(input));
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); openMode(input); } });
  });
  el('[data-clear-filters]').addEventListener('click', () => {
    const defaults = defaultFilters(); packInput.value = defaults.packageId; posInput.value = ''; weaknessInput.value = ''; refresh();
  });
  let resetPending = false;
  el('[data-reset-progress]').addEventListener('click', () => {
    const button = el<HTMLButtonElement>('[data-reset-progress]');
    if (!resetPending) {
      resetPending = true; button.textContent = 'Lernstand wirklich löschen'; el('[data-cancel-reset]').hidden = false; return;
    }
    try { localStorage.removeItem(PROGRESS_KEY); } catch { storageAvailable = false; }
    progress = decodeProgress(null); resetPending = false; button.textContent = 'Lernstand löschen'; el('[data-cancel-reset]').hidden = true; showProgress(); refresh();
  });
  el('[data-cancel-reset]').addEventListener('click', () => {
    resetPending = false; el('[data-reset-progress]').textContent = 'Lernstand löschen'; el('[data-cancel-reset]').hidden = true;
  });
  function current(): Exercise { return queue[index]; }
  function render(): void {
    const exercise = current();
    statuses = null; committed = false; hinted = false; hintIndex = 0; selfAssessed = new Set();
    check.hidden = false; next.hidden = true; report.replaceChildren(); report.hidden = true;
    el('[data-activity-title]').textContent = exercise.title;
    el('[data-activity-count]').textContent = `Aufgabe ${index + 1} von ${queue.length} · ohne Zeitlimit`;
    const bar = el<HTMLProgressElement>('[data-activity-progress]'); bar.max = queue.length; bar.value = index;
    el('[data-activity-prompt]').textContent = exercise.prompt;
    el('[data-activity-context]').textContent = exercise.context ?? '';
    el('[data-activity-context]').hidden = !exercise.context;
    el('[data-provided-forms]').textContent = exercise.provided?.join(' · ') ?? '';
    el('[data-provided-forms]').hidden = !exercise.provided?.length;
    el('[data-answer-help]').hidden = exercise.answerFormat !== 'selection';
    el('[data-activity-hints]').replaceChildren();
    el<HTMLButtonElement>('[data-hint]').disabled = exercise.hints.length === 0;
    fields.dataset.answerFormat = exercise.answerFormat ?? 'input';
    fields.replaceChildren(...exercise.fields.map((field, n) => {
      if (exercise.answerFormat === 'selection') {
        const group = document.createElement('fieldset'); group.className = 'latin-answer-field latin-selection-field';
        group.setAttribute('aria-describedby', `latin-response-${n}`);
        const legend = document.createElement('legend'); legend.textContent = field.label;
        const value = document.createElement('input'); value.type = 'hidden'; value.id = `latin-answer-${n}`; value.name = field.key;
        const options = document.createElement('div'); options.className = 'latin-answer-options';
        const response = document.createElement('small'); response.id = `latin-response-${n}`;
        options.append(...field.choices!.map(choice => {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'latin-answer-option';
          button.textContent = choice; button.lang = field.kind === 'latin' ? 'la' : 'de'; button.setAttribute('aria-pressed', 'false');
          button.addEventListener('click', () => {
            if (statuses) return;
            value.value = value.value === choice ? '' : choice;
            options.querySelectorAll('button').forEach(option => option.setAttribute('aria-pressed', String(option.textContent === value.value)));
            group.removeAttribute('aria-invalid'); response.textContent = '';
          });
          return button;
        }));
        group.append(legend, value, options, response); return group;
      }
      const label = document.createElement('label'); label.className = 'latin-answer-field';
      const text = document.createElement('span'); text.textContent = field.label;
      const control = field.choices ? document.createElement('select')
        : field.kind === 'german' ? document.createElement('textarea') : document.createElement('input');
      control.id = `latin-answer-${n}`; control.name = field.key; control.required = true;
      control.setAttribute('aria-describedby', `latin-response-${n}`);
      if (!(control instanceof HTMLSelectElement)) {
        control.autocomplete = 'off'; control.spellcheck = false;
        control.lang = field.kind === 'latin' ? 'la' : 'de'; control.setAttribute('autocapitalize', 'none');
        if (control instanceof HTMLInputElement) {
          control.type = 'text';
        } else control.rows = 3;
      } else {
        const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Bitte wählen';
        control.append(placeholder, ...field.choices!.map(choice => { const option = document.createElement('option'); option.value = choice; option.textContent = choice; return option; }));
      }
      const response = document.createElement('small'); response.id = `latin-response-${n}`;
      control.addEventListener('input', () => { if (!statuses) { control.removeAttribute('aria-invalid'); response.textContent = ''; } });
      label.append(text, control, response); return label;
    }));
    activityForm.reset();
    el('[data-activity-title]').focus();
  }
  function controlAt(n: number): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement { return el(`#latin-answer-${n}`); }
  function commit(): void {
    if (!statuses || committed || statuses.includes('review')) return;
    committed = true;
    const exercise = current();
    const failed: string[] = [];
    exercise.fields.forEach((field, n) => {
      const correct = statuses![n] === 'correct'; totals[field.dimension].total++; totals[field.dimension].correct += Number(correct);
      progress = recordProgress(progress, exercise.wordId, field.skill, correct, Date.now(), exercise.answerFormat === 'selection' || hinted || selfAssessed.has(n));
      if (!correct) { failed.push(field.key); mistakes.add(`${wordById(exercise.wordId)?.latin} · ${field.label}`); }
    });
    if (failed.length && !exercise.retry) queue.splice(Math.min(queue.length, index + 3), 0, retryExercise(exercise, failed));
    save(); next.hidden = false; next.textContent = index + 1 === queue.length ? 'Auswertung ansehen' : 'Nächste Aufgabe';
    el('[data-activity-count]').textContent = `Aufgabe ${index + 1} von ${queue.length} · ${failed.length ? 'Unsichere Angaben werden noch einmal abgefragt.' : hinted || exercise.answerFormat === 'selection' ? 'Mit Hilfe gelöst · später noch einmal frei abrufen.' : 'Rückmeldung gespeichert.'}`;
  }
  activityForm.addEventListener('submit', event => {
    event.preventDefault(); if (statuses) return;
    const exercise = current();
    const emptyIndex = exercise.fields.findIndex((_, n) => !controlAt(n).value.trim());
    if (emptyIndex >= 0) {
      el(`#latin-response-${emptyIndex}`).textContent = exercise.answerFormat === 'selection'
        ? 'Bitte wähle eine Antwort oder „Lösung aufdecken“.' : 'Bitte antworte oder wähle „Lösung aufdecken“.';
      const control = controlAt(emptyIndex);
      const target = exercise.answerFormat === 'selection' ? control.closest<HTMLElement>('fieldset')! : control;
      target.setAttribute('aria-invalid', 'true');
      (target.querySelector<HTMLButtonElement>('button') ?? control).focus(); return;
    }
    evaluate(false);
  });
  function evaluate(reveal: boolean): void {
    if (statuses) return;
    const exercise = current();
    hinted ||= reveal;
    statuses = exercise.fields.map((field, n) => reveal ? 'incorrect' : checkAnswer(field, controlAt(n).value));
    exercise.fields.forEach((field, n) => {
      const control = controlAt(n); control.disabled = true; control.removeAttribute('aria-invalid');
      if (exercise.answerFormat === 'selection') {
        const group = control.closest<HTMLFieldSetElement>('fieldset')!;
        group.disabled = true; group.removeAttribute('aria-invalid');
      }
      const response = el(`#latin-response-${n}`);
      const status = statuses![n]; response.dataset.tone = status;
      response.textContent = status === 'correct' ? 'Richtig.' : status === 'review' ? 'Vergleiche deine Formulierung unten mit der Lösung.' : `Noch üben. Lösung: ${field.answers.join(' / ')}`;
    });
    check.hidden = true;
    el<HTMLButtonElement>('[data-hint]').disabled = true;
    report.hidden = false;
    const explanation = document.createElement('p'); explanation.textContent = exercise.explanation;
    report.append(explanation);
    exercise.fields.forEach((field, n) => {
      if (statuses![n] !== 'review') return;
      const section = document.createElement('div'); section.className = 'latin-self-check';
      const p = document.createElement('p'); p.textContent = `Deine Antwort: „${controlAt(n).value}“. Mögliche Lösungen: ${field.answers.join(' / ')}. Passt deine Formulierung sinngemäß?`;
      section.append(p);
      for (const [text, correct] of [['Sinngemäß richtig', true], ['Noch üben', false]] as const) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'button button-secondary'; button.textContent = text;
        button.addEventListener('click', () => {
          if (statuses![n] !== 'review') return;
          statuses![n] = correct ? 'correct' : 'incorrect';
          // Self-assessed synonyms are supported practice, not an automatic pass.
          selfAssessed.add(n);
          const response = el(`#latin-response-${n}`); response.textContent = correct ? 'Als sinngemäß richtig bewertet.' : `Noch üben. Lösung: ${field.answers.join(' / ')}`; response.dataset.tone = statuses![n];
          section.querySelectorAll<HTMLButtonElement>('button').forEach(b => { b.disabled = true; }); commit();
          if (committed) next.focus();
          else report.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
        }); section.append(button);
      }
      report.append(section);
    });
    const solution = document.createElement('details'); const heading = document.createElement('summary'); heading.textContent = 'Vollständige Lösung';
    const list = document.createElement('ul');
    exercise.fields.forEach(field => { const item = document.createElement('li'); item.textContent = `${field.label}: ${field.answers.join(' / ')}`; list.append(item); });
    solution.append(heading, list); report.append(solution);
    commit(); report.focus();
  }
  el('[data-reveal]').addEventListener('click', () => evaluate(true));
  el('[data-hint]').addEventListener('click', () => {
    if (statuses || hintIndex >= current().hints.length) return;
    hinted = true; const p = document.createElement('p'); p.textContent = current().hints[hintIndex++]; el('[data-activity-hints]').append(p);
    el<HTMLButtonElement>('[data-hint]').disabled = hintIndex >= current().hints.length;
  });
  function finish(): void {
    activity.hidden = true; summary.hidden = false;
    el('[data-activity-result-title]').textContent = 'Training abgeschlossen.';
    const stats = el('[data-activity-stats]');
    stats.replaceChildren(...(Object.entries(totals) as [Dimension, { correct: number; total: number }][]).filter(([, value]) => value.total).map(([dimension, value]) => {
      const div = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = dimensions[dimension]; const dd = document.createElement('dd'); dd.textContent = `${value.correct} / ${value.total}`; div.append(dt, dd); return div;
    }));
    el('[data-activity-mistakes]').textContent = mistakes.size ? `Weiter üben: ${[...mistakes].join('; ')}.` : 'Alle abgefragten Angaben richtig beantwortet. Wiederhole sie später noch einmal ohne Hilfe.';
    el('[data-followup]').hidden = running?.mode !== 'workshop';
    el('[data-activity-result-title]').focus();
  }
  next.addEventListener('click', () => { if (!committed) return; index++; if (index === queue.length) finish(); else render(); });
  function start(selectedMode: Exclude<Mode, 'matching'>, selectedPool: TrainerWord[], total: number,
    answerFormat: AnswerFormat = answerFormatInput.checked ? 'selection' : 'input'): void {
    flashcards.stop();
    if (selectedMode === 'flashcards') {
      el<HTMLFieldSetElement>('[data-settings]').disabled = true; el('[data-config]').hidden = true;
      el('[data-result]').hidden = true; el('[data-workspace]').hidden = true; summary.hidden = true; activity.hidden = true;
      flashcards.start(selectedPool, total); return;
    }
    running = { mode: selectedMode, pool: selectedPool, total, answerFormat };
    queue = buildExercises(selectedMode, selectedPool, total, Math.random, answerFormat); index = 0;
    totals = { meaning: { correct: 0, total: 0 }, forms: { correct: 0, total: 0 }, grammar: { correct: 0, total: 0 }, context: { correct: 0, total: 0 } }; mistakes = new Set();
    el<HTMLFieldSetElement>('[data-settings]').disabled = true; el('[data-config]').hidden = true;
    el('[data-result]').hidden = true; el('[data-workspace]').hidden = true; summary.hidden = true; activity.hidden = false; render();
  }
  el('[data-activity-abort]').addEventListener('click', edit);
  el('[data-activity-edit]').addEventListener('click', edit);
  el('[data-activity-restart]').addEventListener('click', () => { if (running) start(running.mode, running.pool, running.total, running.answerFormat); });
  el('[data-mixed-review]').addEventListener('click', () => configure('parcours'));
  el('[data-followup]').addEventListener('click', () => {
    const packageId = packInput.value;
    const savedFilters = filters();
    edit(); modeInputs.forEach(input => { input.checked = input.value === 'detective'; }); packInput.value = packageId;
    if (!pool().length) { posInput.value = savedFilters.partOfSpeech; weaknessInput.value = ''; }
    openMode(modeInputs.find(input => input.value === 'detective')!, false);
  });
  refresh(); showProgress();
  return {
    mode, pool, ready, focusSelection, start,
    stop: () => { flashcards.stop(); activity.hidden = true; summary.hidden = true; refresh(); },
    recordMatching: (id: string, correct: boolean) => { progress = recordProgress(progress, id, 'meaning', correct, Date.now(), true); save(); },
  };
}
