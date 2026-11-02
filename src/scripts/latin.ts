import { configError, createSession, currentRound, nextRound, selectCard, stage, type Session, type Side, type TrainingConfig } from '../data/latin';
import { initLearning } from './latin-learning';

export function initLatinTrainer(root: HTMLElement): void {
  const element = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const form = element<HTMLFormElement>('[data-config]');
  const settings = element<HTMLFieldSetElement>('[data-settings]');
  const roundSize = element<HTMLInputElement>('#round-size');
  const total = element<HTMLInputElement>('#total-words');
  const error = element('#config-error');
  const workspace = element('[data-workspace]');
  const result = element('[data-result]');
  const feedback = element('[data-feedback]');
  const next = element<HTMLButtonElement>('[data-next]');
  let state: Session | null = null;
  let incorrect: Record<Side, string | null> = { left: null, right: null };
  let config: TrainingConfig = { roundSize: 5, total: 20 };
  const learning = initLearning(root, edit);

  function update(): void {
    if (!state) return;
    const phase = stage(state);
    element('[data-round-title]').textContent = `Runde ${state.roundIndex + 1} von ${state.rounds.length}`;
    element('[data-progress]').textContent = `${state.completed} von ${state.total} gelöst · ${state.errors} Fehlversuche`;
    const progress = element<HTMLProgressElement>('[data-progress-bar]');
    progress.max = state.total;
    progress.value = state.completed;
    root.querySelectorAll<HTMLButtonElement>('[data-card]').forEach(button => {
      const side = button.dataset.side as Side;
      const solved = state!.solved[side].includes(button.dataset.id!);
      button.setAttribute('aria-pressed', String(state!.selected[side] === button.dataset.id));
      button.setAttribute('aria-disabled', String(solved));
      button.dataset.solved = String(solved);
      const failed = incorrect[side] === button.dataset.id;
      button.dataset.incorrect = String(failed);
      button.querySelector<HTMLElement>('[data-card-status]')!.textContent = solved ? 'Richtig zugeordnet' : failed ? 'Passt noch nicht' : '';
      button.tabIndex = solved ? -1 : 0;
    });
    next.hidden = phase !== 'round-complete';
    if (phase === 'complete') {
      workspace.hidden = true;
      result.hidden = false;
      element('[data-result-completed]').textContent = String(state.completed);
      element('[data-result-attempts]').textContent = String(state.attempts);
      element('[data-result-errors]').textContent = String(state.errors);
      element('#result-title').focus();
    }
  }

  function renderRound(): void {
    if (!state) return;
    incorrect = { left: null, right: null };
    for (const side of ['left', 'right'] as const) {
      const column = element(`[data-${side}]`);
      column.replaceChildren(...currentRound(state)[side].map(word => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'latin-word';
        button.dataset.card = '';
        button.dataset.side = side;
        button.dataset.id = word.id;
        const text = document.createElement('span');
        text.textContent = side === 'left' ? word.latin : word.meanings.join('; ');
        const status = document.createElement('small');
        status.dataset.cardStatus = '';
        button.append(text, status);
        return button;
      }));
    }
    feedback.textContent = '';
    delete feedback.dataset.tone;
    update();
    element('[data-round-title]').focus();
  }

  function start(): void {
    state = createSession(learning.pool(), config);
    settings.disabled = true;
    form.hidden = true;
    result.hidden = true;
    workspace.hidden = false;
    renderRound();
  }

  function edit(): void {
    state = null;
    incorrect = { left: null, right: null };
    workspace.hidden = true;
    result.hidden = true;
    form.hidden = false;
    settings.disabled = false;
    feedback.textContent = '';
    delete feedback.dataset.tone;
    learning.stop();
    learning.focusSelection();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!learning.ready()) return;
    const proposed = { roundSize: roundSize.valueAsNumber, total: total.valueAsNumber };
    const available = learning.pool().length;
    const message = available === 0 ? 'Keine passenden Wörter. Wähle ein anderes Paket oder lockere die Filter.'
      : configError({ ...proposed, roundSize: learning.mode() === 'matching' ? proposed.roundSize : 5 }, available);
    error.hidden = !message;
    error.textContent = message ?? '';
    roundSize.removeAttribute('aria-invalid');
    total.removeAttribute('aria-invalid');
    if (message) {
      const invalid = learning.mode() === 'matching' && configError({ roundSize: proposed.roundSize, total: 1 }, Math.max(1, available)) ? roundSize : total;
      invalid.setAttribute('aria-invalid', 'true');
      invalid.focus();
      return;
    }
    config = proposed;
    const mode = learning.mode();
    if (mode !== 'matching') { learning.start(mode, learning.pool(), proposed.total, learning.support()); return; }
    start();
  });
  workspace.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-card]') : null;
    if (!target || !state) return;
    const side = target.dataset.side as Side;
    const previous = state;
    const outcome = selectCard(state, side, target.dataset.id!);
    if (outcome.feedback === 'ignored') return;
    state = outcome.state;
    incorrect = { left: null, right: null };
    delete feedback.dataset.tone;
    if (outcome.feedback === 'correct') {
      const latinId = side === 'left' ? target.dataset.id : previous.selected.left;
      const word = currentRound(state).left.find(word => word.id === latinId)!;
      feedback.textContent = `Richtig: ${word.latin} – ${word.meanings.join('; ')}.${stage(state) === 'round-complete' ? ' Runde geschafft! Weiter mit „Nächste Runde“.' : ''}`;
      feedback.dataset.tone = 'correct';
      learning.recordMatching(word.id, true);
    } else if (outcome.feedback === 'incorrect') {
      incorrect = { left: side === 'left' ? target.dataset.id! : previous.selected.left, right: side === 'right' ? target.dataset.id! : previous.selected.right };
      feedback.textContent = 'Das passt noch nicht. Wähle ein neues Paar und versuche es erneut.';
      feedback.dataset.tone = 'incorrect';
      const failedId = side === 'left' ? target.dataset.id! : previous.selected.left!;
      learning.recordMatching(failedId, false);
    } else {
      feedback.textContent = outcome.feedback === 'cleared' ? 'Auswahl aufgehoben.' : side === 'left' ? 'Lateinisches Wort ausgewählt. Wähle die passende Übersetzung.' : 'Übersetzung ausgewählt. Wähle das passende lateinische Wort.';
    }
    update();
    if (stage(state) === 'round-complete') next.focus();
    else if (outcome.feedback === 'correct' && stage(state) === 'training')
      root.querySelector<HTMLButtonElement>('[data-left] [data-solved="false"]')?.focus();
  });
  next.addEventListener('click', () => {
    if (!state || stage(state) !== 'round-complete') return;
    state = nextRound(state);
    renderRound();
  });
  element('[data-abort]').addEventListener('click', edit);
  element('[data-edit]').addEventListener('click', edit);
  element('[data-restart]').addEventListener('click', start);
  settings.disabled = false;
}
