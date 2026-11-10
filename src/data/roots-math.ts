/** Exact integer factorization: √n = factor · √rest, rest is square-free. */
export function simplifyRadical(n: number): { factor: number; rest: number } {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Nichtnegative ganze Zahl erforderlich');
  if (n === 0) return { factor: 0, rest: 1 };
  let factor = 1, rest = n;
  for (let p = 2; p * p <= rest; p++) {
    while (rest % (p * p) === 0) { factor *= p; rest /= p * p; }
  }
  return { factor, rest };
}
export function radicalText(factor: number, rest: number): string {
  if (factor === 0) return '0';
  if (rest === 1) return String(factor).replace('-', '−');
  return `${factor === 1 ? '' : factor === -1 ? '−' : String(factor).replace('-', '−')}√${rest}`;
}
function integerSqrt(n: bigint): bigint {
  let low = 0n, high = n + 1n;
  while (high - low > 1n) {
    const mid = (low + high) / 2n;
    if (mid * mid <= n) low = mid; else high = mid;
  }
  return low;
}
export function fixedDecimal(n: bigint, digits: number): string {
  if (!digits) return String(n);
  const text = String(n).padStart(digits + 1, '0');
  return `${text.slice(0, -digits)},${text.slice(-digits)}`;
}
/** Decimal enclosure by integer arithmetic, with exact squared boundary values. */
export function rootInterval(n: number, digits: number) {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isInteger(digits) || digits < 0 || digits > 6) throw new RangeError('Ungültiges Intervall');
  const scale = 10n ** BigInt(digits), target = BigInt(n) * scale * scale;
  const lower = integerSqrt(target), exact = lower * lower === target, upper = exact ? lower : lower + 1n;
  return { lower: fixedDecimal(lower, digits), upper: fixedDecimal(upper, digits), lowerSquare: fixedDecimal(lower * lower, digits * 2), upperSquare: fixedDecimal(upper * upper, digits * 2), width: fixedDecimal(upper - lower, digits), exact };
}
export function numericAnswer(input: string, expected: number): boolean {
  const normalized = input.trim().replace('−', '-').replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return false;
  const value = Number(normalized);
  return Number.isFinite(value) && value === expected;
}
