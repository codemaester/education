import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderRootText, renderRootHtml } from '../src/utils/root-notation.ts';

test('a radical covers its entire product or sum without the source delimiter parentheses', () => {
  const product = renderRootText('√(36 · 2)');
  assert.match(product,/<msqrt><mrow><mn>36<\/mn><mo>·<\/mo><mn>2<\/mn><\/mrow><\/msqrt>/);
  assert.doesNotMatch(product,/[()]/);
  assert.match(renderRootText('√(9 + 16)'),/<mn>9<\/mn><mo>\+<\/mo><mn>16<\/mn>/);
});

test('nested roots stretch independently and fourth roots retain their index', () => {
  const nested = renderRootText('√(√(√256))');
  assert.equal((nested.match(/<msqrt>/g) ?? []).length,3);
  assert.doesNotMatch(nested,/[()]/);
  assert.match(renderRootText('⁴√81'),/<mroot><mrow><mn>81<\/mn><\/mrow><mn>4<\/mn><\/mroot>/);
});

test('essential grouping and powers inside or outside roots are retained', () => {
  assert.match(renderRootText('√((−8)²)'),/<msup><mrow><mo>\(<\/mo><mo>−<\/mo><mn>8<\/mn><mo>\)<\/mo><\/mrow><mn>2<\/mn><\/msup>/);
  assert.match(renderRootText('√(x²b)'),/<msup><mi>x<\/mi><mn>2<\/mn><\/msup><mi>b<\/mi>/);
  assert.match(renderRootText('(√a)²'),/^\(<math.*<\/math>\)²$/);
  assert.match(renderRootText('a²√b'),/^a²<math.*<msqrt>/);
});

test('decimal numbers, punctuation, escaped input and trusted HTML remain intact', () => {
  assert.match(renderRootText('√0,0016.'),/<mn>0,0016<\/mn>.*<\/math>\.$/);
  assert.match(renderRootText('x < 4 & √2'),/^x &lt; 4 &amp; <math/);
  assert.doesNotMatch(renderRootText('<img src=x onerror=alert(1)>√2'),/<img/);
  const html = '<p title="√(9 + 16)">√(9 + 16) &lt; 6</p><script>const x="√2";</script><option>√7</option>';
  const rendered = renderRootHtml(html);
  assert.match(rendered,/<p title="√\(9 \+ 16\)"><math/);
  assert.match(rendered,/&lt; 6<\/p>/);
  assert.match(rendered,/<script>const x="√2";<\/script><option>√7<\/option>/);
  assert.equal(renderRootHtml(rendered),rendered);
  assert.equal(renderRootText('√(unvollständig'), '√(unvollständig');
});
