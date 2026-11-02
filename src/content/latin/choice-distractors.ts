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

export const missionDistractors: Record<string, string[]> = {
  'bridge-build': ['eine Brücke zerstören', 'eine Brücke überqueren', 'eine Brücke verteidigen', 'eine Brücke suchen', 'eine Brücke verlassen', 'einen Plan fassen', 'einen Fluss bauen', 'eine Brücke tun', 'eine Brücke reparieren', 'eine Brücke bewachen', 'eine Brücke versprechen'],
  'bridge-to': ['am Fluss', 'vom Fluss', 'über den Fluss', 'mit dem Fluss', 'im Fluss', 'unter dem Fluss', 'hinter dem Fluss', 'ohne den Fluss', 'vor dem Fluss', 'zwischen den Flüssen', 'durch den Fluss'],
  'bridge-defend': ['sie greifen die Brücke an', 'sie verteidigen die Feinde gegen die Brücke', 'die Feinde verteidigen die Brücke', 'sie verteidigten die Brücke gegen die Feinde', 'sie werden die Brücke gegen die Feinde verteidigen', 'sie verlassen die Brücke vor den Feinden', 'sie zerstören die Brücke der Feinde', 'sie erobern die Brücke von den Feinden', 'er verteidigt die Brücke gegen die Feinde', 'wir verteidigen die Brücke gegen die Feinde', 'sie verteidigen die Brücke zusammen mit den Feinden'],
  'peace-ask': ['sie greifen den Frieden an', 'sie bewahren den Frieden', 'sie brechen den Frieden', 'sie versprechen Frieden', 'sie bitten um Krieg', 'er bittet um Frieden', 'wir bitten um Frieden', 'sie baten um Frieden', 'sie werden um Frieden bitten', 'sie verweigern den Frieden', 'sie verkünden den Frieden'],
  'peace-plan': ['er nimmt eine Beratung', 'er verwirft einen Plan', 'er erklärt einen Plan', 'er führt einen Plan aus', 'sie fassen einen Plan', 'wir fassen einen Plan', 'er fasste einen Plan', 'er wird einen Plan fassen', 'er erobert den Rat', 'er fragt nach einem Plan', 'er hält eine Beratung ab'],
  'peace-answer': ['er fragt die Gesandten', 'er antwortet über die Gesandten', 'die Gesandten antworten ihm', 'er schickt die Gesandten', 'er erwartet die Gesandten', 'er antwortete den Gesandten', 'er wird den Gesandten antworten', 'wir antworten den Gesandten', 'ihr antwortet den Gesandten', 'er antwortet dem Senat', 'er hört den Gesandten zu'],
  'trust-with': ['ohne Freunde', 'wegen der Freunde', 'gegen die Freunde', 'für die Freunde', 'zu den Freunden', 'von den Freunden', 'unter den Freunden', 'obwohl die Freunde', 'weil die Freunde', 'mit den Feinden', 'vor den Freunden'],
  'trust-place': ['in die Stadt', 'aus der Stadt', 'vor der Stadt', 'hinter der Stadt', 'über der Stadt', 'unter der Stadt', 'zur Stadt', 'um die Stadt herum', 'gegen die Stadt', 'durch die Stadt', 'mit der Stadt'],
  'trust-believe': ['er misstraut den Freunden', 'er glaubt an die Feinde', 'die Freunde glauben ihm', 'er überzeugt die Freunde', 'er glaubt über die Freunde', 'er glaubte den Freunden', 'er wird den Freunden glauben', 'wir glauben den Freunden', 'ihr glaubt den Freunden', 'er vertraut den Feinden', 'er fragt die Freunde'],
  'debate-speak': ['er verkündet ein Gesetz', 'er widerspricht dem Gesetz', 'er spricht für das Gesetz', 'er spricht gegen das Gesetz', 'er schweigt über das Gesetz', 'er sprach über das Gesetz', 'er wird über das Gesetz sprechen', 'wir sprechen über das Gesetz', 'ihr sprecht über das Gesetz', 'er spricht über den Krieg', 'das Gesetz spricht über ihn'],
  'debate-trust': ['sie brechen ihr Wort', 'sie gewinnen Vertrauen', 'sie bewachen den Glauben', 'sie verlieren die Treue', 'sie dienen der Treue', 'er hält sein Wort', 'wir halten unser Wort', 'sie hielten ihr Wort', 'sie werden ihr Wort halten', 'sie versprechen Treue', 'sie verlangen Treue'],
  'debate-law': ['ein altes Gesetz', 'ein gerechtes Gesetz', 'eine neue Bedingung', 'ein neuer Beschluss', 'ein neues Recht', 'ein neuer Krieg', 'eine neue Gesandtschaft', 'neue Gesetze', 'des neuen Gesetzes', 'mit einem neuen Gesetz', 'für das neue Gesetz'],
};
