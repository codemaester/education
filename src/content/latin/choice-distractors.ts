/** Deliberately incorrect translations for the authored contexts in activities.ts.
 * Keep these separate from vocabulary meanings: person, tense, voice, reference
 * and context matter here. Each list leaves room for fresh retry alternatives.
 */
// Conservative exclusions for overlapping German senses. These only remove
// ambiguous distractors; they never add globally accepted answer synonyms.
export const overlappingMeanings: string[][] = [
  ['nehmen', 'wegnehmen', 'wegbringen', 'rauben', 'stehlen', 'entwenden'],
  ['bringen', 'herbeibringen', 'hinbringen', 'herbringen'],
  ['aufheben', 'hochheben', 'in die Höhe heben', 'emporheben', 'erheben'],
  ['folgen', 'nachfolgen', 'nachgehen', 'verfolgen'],
  ['machen', 'tun', 'handeln', 'bewirken', 'herstellen', 'bauen', 'errichten'],
  ['sagen', 'sprechen', 'reden', 'erzählen', 'berichten', 'melden'],
  ['schicken', 'senden', 'entsenden', 'abschicken', 'aussenden'],
  ['anfangen', 'beginnen', 'in Angriff nehmen'],
  ['Gesetz', 'das Gesetz', 'Recht', 'das Recht', 'Vorschrift', 'die Vorschrift'],
  ['Freund', 'der Freund', 'Gefährte', 'der Gefährte', 'Begleiter', 'der Begleiter'],
  ['tapfer', 'mutig', 'beherzt', 'kühn'],
  ['schön', 'hübsch', 'ansehnlich'],
];

export const confusableLemmas: string[][] = [['ferre', 'tollere']];

export const detectiveDistractors: Record<string, string[]> = {
  capere: ['sie erobern', 'sie werden erobern', 'sie hatten erobert', 'sie würden erobern', 'er eroberte', 'wir eroberten', 'ihr erobertet', 'sie wurden erobert', 'sie verteidigten', 'sie verließen', 'sie zerstörten'],
  ferre: ['sie bringen', 'sie brachten', 'sie hatten gebracht', 'sie werden bringen', 'er hätte gebracht', 'wir hätten gebracht', 'ihr hättet gebracht', 'sie wären gebracht worden', 'sie hätten weggenommen', 'sie hätten hochgehoben', 'sie hätten verweigert'],
  tollere: ['sie heben hoch', 'sie werden hochheben', 'sie hatten hochgehoben', 'sie würden hochheben', 'er hob hoch', 'wir hoben hoch', 'ihr hobt hoch', 'sie wurden hochgehoben', 'sie brachten', 'sie schickten', 'sie versteckten'],
  'dūcere': ['sie führen', 'sie werden führen', 'sie hatten geführt', 'sie würden führen', 'er führte', 'wir führten', 'ihr führtet', 'sie wurden geführt', 'sie folgten', 'sie verließen', 'sie besiegten'],
  mittere: ['sie schicken', 'sie werden schicken', 'sie hatten geschickt', 'sie würden schicken', 'er schickte', 'wir schickten', 'ihr schicktet', 'sie wurden geschickt', 'sie empfingen', 'sie entließen', 'sie hielten zurück'],
  'venīre': ['sie kommen', 'sie werden kommen', 'sie waren gekommen', 'sie würden kommen', 'er kam', 'wir kamen', 'ihr kamt', 'sie wurden gerufen', 'sie gingen weg', 'sie blieben', 'sie siegten'],
  esse: ['sie sind', 'sie waren', 'sie waren gewesen', 'sie werden sein', 'er wäre gewesen', 'wir wären gewesen', 'ihr wäret gewesen', 'sie hätten besessen', 'sie wären geworden', 'sie könnten sein', 'sie sollten sein'],
  'sequī': ['sie folgen', 'sie werden folgen', 'sie waren gefolgt', 'sie würden folgen', 'er folgte', 'wir folgten', 'ihr folgtet', 'ihnen wurde gefolgt', 'sie führten', 'sie verfolgten nicht', 'sie verließen'],
  facere: ['sie bauen', 'sie werden bauen', 'sie hatten gebaut', 'sie würden bauen', 'er baute', 'wir bauten', 'ihr bautet', 'sie wurden gebaut', 'sie zerstörten', 'sie überquerten', 'sie verteidigten'],
  perdere: ['sie verlieren', 'sie werden verlieren', 'sie hatten verloren', 'sie würden verlieren', 'er verlor', 'wir verloren', 'ihr verlort', 'sie wurden verloren', 'sie gewannen', 'sie bewahrten', 'sie fanden'],
  dare: ['sie geben', 'sie werden geben', 'sie hatten gegeben', 'sie würden geben', 'er gab', 'wir gaben', 'ihr gabt', 'ihnen wurde gegeben', 'sie baten', 'sie verweigerten', 'sie nahmen'],
  posse: ['sie können', 'sie werden können', 'sie hatten gekonnt', 'sie könnten', 'er konnte', 'wir konnten', 'ihr konntet', 'sie wollten', 'sie mussten', 'sie durften', 'sie wussten'],
  auferre: ['sie rauben', 'sie werden rauben', 'sie hatten geraubt', 'sie würden rauben', 'er raubte', 'wir raubten', 'ihr raubtet', 'sie wurden beraubt', 'sie brachten zurück', 'sie gaben', 'sie verloren'],
  referre: ['sie berichten', 'sie werden berichten', 'sie hatten berichtet', 'sie würden berichten', 'er berichtete', 'wir berichteten', 'ihr berichtetet', 'ihnen wurde berichtet', 'sie verschwiegen', 'sie erfanden', 'sie nahmen weg'],
  incipere: ['sie beginnen', 'sie werden beginnen', 'sie hatten begonnen', 'sie würden beginnen', 'er begann', 'wir begannen', 'ihr begannt', 'es wurde begonnen', 'sie beendeten', 'sie verhinderten', 'sie unterbrachen'],
};
