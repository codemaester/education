/** Exact integer square root, independent of floating point precision. */
export function integerSqrt(n: bigint): bigint {
  if (n < 0n) throw new RangeError('Negative square root');
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}

export function decimal(n: bigint, digits: number): string {
  if (!digits) return n.toString();
  const s = n.toString().padStart(digits + 1, '0');
  return `${s.slice(0, -digits)},${s.slice(-digits)}`;
}

export function sqrtTwoWindow(digits: number) {
  if (!Number.isInteger(digits) || digits < 0 || digits > 24) throw new RangeError('Zoom 0–24');
  const scale = 10n ** BigInt(digits);
  const lower = integerSqrt(2n * scale * scale);
  const fineScale = scale * 100_000_000n;
  const fine = integerSqrt(2n * fineScale * fineScale);
  return { lower, upper: lower + 1n, scale, left: decimal(lower, digits), right: decimal(lower + 1n, digits), fraction: Number(fine % 100_000_000n) / 100_000_000 };
}

/** One source of truth for the visible hotel occupants and their animated trips. */
export function hotelAssignment(mode: 'one' | 'bus', rooms = 8) {
  return {
    moves: Array.from({ length: rooms }, (_, i) => ({ guest: String(i + 1), room: mode === 'one' ? i + 2 : (i + 1) * 2 })),
    arrivals: Array.from({ length: mode === 'one' ? 1 : Math.ceil(rooms / 2) }, (_, i) => ({ guest: mode === 'one' ? 'Neu' : `B${i + 1}`, room: mode === 'one' ? 1 : i * 2 + 1 })),
  };
}

export function rotationPoint(step: number, turn: number) {
  const angle = ((step * turn) % 1) * 2 * Math.PI - Math.PI / 2;
  return { x: 160 + 118 * Math.cos(angle), y: 160 + 118 * Math.sin(angle) };
}

export function diagonalDigit(digit: number): number { return digit === 1 ? 2 : 1; }

export interface RationalVisit {
  numerator: number;
  denominator: number;
  diagonal: number;
  reduced: string;
  keep: boolean;
}

/** Complete anti-diagonals fitting in a size × size positive fraction grid. */
export function rationalDiagonalWalk(size = 6): RationalVisit[] {
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const visits: RationalVisit[] = [];
  for (let diagonal = 2; diagonal <= size + 1; diagonal++) {
    for (let numerator = 1; numerator < diagonal; numerator++) {
      const denominator = diagonal - numerator;
      const divisor = gcd(numerator, denominator);
      const p = numerator / divisor;
      const q = denominator / divisor;
      visits.push({ numerator, denominator, diagonal, reduced: q === 1 ? String(p) : `${p}/${q}`, keep: divisor === 1 });
    }
  }
  return visits;
}

/** Interleave signs after 0; canonical fractions ensure that no value repeats. */
export function rationalList(visits: RationalVisit[]): string[] {
  return ['0', ...visits.filter(visit => visit.keep).flatMap(visit => [visit.reduced, `−${visit.reduced}`])];
}
