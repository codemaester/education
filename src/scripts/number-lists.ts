import { diagonalDigit, rationalDiagonalWalk, rationalList } from '../data/museum-math';

export function initializeNumberLists(root: HTMLElement) {
  const get = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const all = <T extends Element = HTMLElement>(selector: string) => [...root.querySelectorAll<T>(selector)];
  const visits = rationalDiagonalWalk();
  const sequence = get<HTMLOListElement>('[data-rational-list]');
  const step = get<HTMLButtonElement>('[data-rational-step]');
  const showAll = get<HTMLButtonElement>('[data-rational-all]');
  const cells = all('[data-rational-cell]');
  let progress = 0;
  function renderRationals() {
    const seen = visits.slice(0, progress);
    const current = seen.at(-1);
    const diagonal = current?.diagonal ?? 2;
    const visited = new Map(seen.map(visit => [`${visit.numerator}-${visit.denominator}`, visit]));
    cells.forEach(cell => {
      const visit = visited.get(cell.dataset.rationalCell!);
      cell.toggleAttribute('data-visited', !!visit);
      cell.toggleAttribute('data-skipped', !!visit && !visit.keep);
      cell.toggleAttribute('data-active-diagonal', Number(cell.dataset.numerator) + Number(cell.dataset.denominator) === diagonal);
      const active = cell.dataset.rationalCell === (current ? `${current.numerator}-${current.denominator}` : '');
      if (active) cell.setAttribute('aria-current', 'step'); else cell.removeAttribute('aria-current');
    });
    sequence.replaceChildren(...rationalList(seen).map(value => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
    get('[data-rational-count]').textContent = `Feld ${progress} / ${visits.length}`;
    get('[data-rational-diagonal]').textContent = `Diagonale p + q = ${diagonal}`;
    get('[data-rational-current]').textContent = current ? `${current.numerator}/${current.denominator}${current.denominator === 1 || !current.keep ? ` = ${current.reduced}` : ''}` : 'Beginne bei 1/1.';
    get('[data-rational-status]').textContent = !current ? 'Die Liste beginnt mit 0. Gehe zum ersten Bruch 1/1.'
      : !current.keep ? `${current.numerator}/${current.denominator} = ${current.reduced}: Dieser Wert steht schon in der Liste. Wir überspringen das ungekürzte Tabellenfeld.`
        : `${current.numerator}/${current.denominator}: Wir ergänzen ${current.reduced} und −${current.reduced}. ${progress === visits.length ? 'Die Vorschau endet hier. Die nächste Diagonale enthält neue Felder außerhalb der Tabelle.' : 'Beide Werte erhalten ihren eigenen Listenplatz.'}`;
    step.disabled = progress === visits.length;
    showAll.disabled = progress === visits.length;
  }
  step.addEventListener('click', () => { progress = Math.min(visits.length, progress + 1); renderRationals(); });
  showAll.addEventListener('click', () => { progress = visits.length; renderRationals(); });
  get('[data-rational-reset]').addEventListener('click', () => { progress = 0; renderRationals(); });
  renderRationals();

  let diagonalProgress = 0;
  let listSeed = 4;
  const digitCells = all('[data-digit]');
  const diagonalStep = get<HTMLButtonElement>('[data-diagonal-step]');
  const diagonalAll = get<HTMLButtonElement>('[data-diagonal-all]');
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
    get('[data-diagonal-result]').textContent = diagonal.map((digit, i) => i < diagonalProgress ? String(digit) : '_').join(' ');
    diagonalStep.disabled = diagonalProgress === 6;
    diagonalAll.disabled = diagonalProgress === 6;
    get('[data-diagonal-status]').textContent = diagonalProgress === 0 ? 'Ändere die erste Stelle. Deine neue Zahl wird sich von Zeile 1 unterscheiden.'
      : diagonalProgress < 6 ? `Stelle ${diagonalProgress}: Die neue Ziffer ist ${diagonal[diagonalProgress - 1]}. Unsere Zahl unterscheidet sich jetzt von jeder der ersten ${diagonalProgress} Zeilen an mindestens einer Stelle.`
        : 'Sechs Unterschiede sind sichtbar. Setzen wir die Regel für alle n fort, unterscheidet sich die neue Zahl von Zeile n an Stelle n. Sie fehlt in der gesamten unendlichen Liste.';
  }
  diagonalStep.addEventListener('click', () => { diagonalProgress = Math.min(6, diagonalProgress + 1); renderDiagonal(); });
  diagonalAll.addEventListener('click', () => { diagonalProgress = 6; renderDiagonal(); });
  get('[data-diagonal-reset]').addEventListener('click', () => renderDiagonal(true));
  renderDiagonal();
}
