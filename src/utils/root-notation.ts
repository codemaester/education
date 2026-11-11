/** Render the lesson's compact radical notation as native, scalable MathML.
 * Parentheses immediately after √ delimit its radicand in source text only.
 * Mathematical grouping inside the radicand is retained, e.g. √((−5)²).
 */
const powers: Record<string, string> = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'−' };
const escape = (text: string) => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
type Radical = { markup: string; end: number };
function closingParen(text: string, start: number): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++;
    if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}
function radical(text: string, start: number): Radical | undefined {
  // A superscript after a coefficient belongs to that coefficient, not the root index.
  if (powers[text[start]] && start > 0 && /[a-zA-Z0-9)\]]/.test(text[start-1])) return;
  let pos = start, degree = '';
  while (powers[text[pos]]) degree += powers[text[pos++]];
  if (text[pos] !== '√') return;
  pos++;
  let content: string, end: number;
  if (text[pos] === '(') {
    const close = closingParen(text,pos);
    if (close < 0) return;
    content = mathRow(text.slice(pos+1,close)); end = close+1;
  } else if (text[pos] === '√' || (powers[text[pos]] && text.slice(pos).match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+√/))) {
    const nested = radical(text,pos);
    if (!nested) return;
    content = nested.markup; end = nested.end;
  } else {
    const atom = text.slice(pos).match(/^(?:\d+(?:[.,]\d+)?|[a-zA-Z]+)/)?.[0];
    if (!atom) return;
    end = pos + atom.length;
    // A power belongs to the radicand, e.g. √x² means the root of x squared.
    while (powers[text[end]]) end++;
    content = mathRow(text.slice(pos,end));
  }
  return { markup: degree ? `<mroot><mrow>${content}</mrow><mn>${escape(degree)}</mn></mroot>` : `<msqrt><mrow>${content}</mrow></msqrt>`, end };
}
function mathRow(text: string): string {
  const nodes: string[] = [];
  for (let i = 0; i < text.length;) {
    if (/\s/.test(text[i])) { i++; continue; }
    const root = radical(text,i);
    let node: string;
    if (root) { node = root.markup; i = root.end; }
    else if (text[i] === '(' && closingParen(text,i) >= 0) {
      const end = closingParen(text,i);
      node = `<mrow><mo>(</mo>${mathRow(text.slice(i+1,end))}<mo>)</mo></mrow>`; i = end+1;
    } else {
      const number = text.slice(i).match(/^\d+(?:[.,]\d+)?/)?.[0];
      if (number) { node = `<mn>${escape(number)}</mn>`; i += number.length; }
      else {
        const char = text[i++];
        node = /^[a-zA-Z]$/.test(char) ? `<mi>${escape(char)}</mi>` : `<mo>${escape(char)}</mo>`;
      }
    }
    let exponent = '';
    while (powers[text[i]]) exponent += powers[text[i++]];
    nodes.push(exponent ? `<msup>${node}<mn>${escape(exponent)}</mn></msup>` : node);
  }
  return nodes.join('');
}
function render(text: string, escapeText: boolean): string {
  let html = '', plainStart = 0;
  const plain = (value: string) => escapeText ? escape(value) : value;
  for (let i = 0; i < text.length;) {
    const root = radical(text,i);
    if (!root) { i++; continue; }
    html += plain(text.slice(plainStart,i));
    html += `<math xmlns="http://www.w3.org/1998/Math/MathML" class="root-math" display="inline">${root.markup}</math>`;
    i = root.end; plainStart = i;
  }
  return html + plain(text.slice(plainStart));
}
/** Plain text is always escaped, including dynamically generated feedback. */
export const renderRootText = (text: string): string => render(text,true);
/** Only for trusted, server-rendered lesson HTML. Preserve tags and attributes. */
export function renderRootHtml(html: string): string {
  const parts = html.split(/(<!--[\s\S]*?-->|<[^>]*>)/g);
  const skipTags = new Set(['script','style','math','svg','textarea','option']);
  let skipped: string | undefined;
  return parts.map(part => {
    if (part.startsWith('<')) {
      const tag = part.match(/^<(\/?)([a-zA-Z][\w-]*)\b/);
      if (tag) {
        const name = tag[2].toLowerCase();
        if (tag[1] && name === skipped) skipped = undefined;
        else if (!skipped && !tag[1] && skipTags.has(name)) skipped = name;
      }
      return part;
    }
    return skipped ? part : render(part,false);
  }).join('');
}
export function setRootText(element: Element, text: string): void {
  element.innerHTML = renderRootText(text);
}
