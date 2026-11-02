/** Authored practice sentences, not quotations from ancient authors.
 * Each target is an exact lemma in vocabulary.json. Meaning and construction
 * answers belong to this context, never to the lemma's merged meaning set.
 */
export interface DetectiveCase {
  lemma: string; form: string; context: string; meanings: string[]; analysis: string;
}
export const detectiveCases: DetectiveCase[] = [
  { lemma: 'capere', form: 'cēpērunt', context: 'Mīlitēs urbem cēpērunt.', meanings: ['sie eroberten', 'sie nahmen ein', 'sie haben erobert', 'sie haben eingenommen'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. cēp- ist der Perfektstamm von capere.' },
  { lemma: 'ferre', form: 'tulissent', context: 'Sī auxilium tulissent, amīcī laetī fuissent.', meanings: ['sie hätten gebracht', 'gebracht hätten', 'sie hätten geleistet', 'geleistet hätten'], analysis: '3. Person Plural, Konjunktiv Plusquamperfekt Aktiv. tul- gehört zu ferre; auxilium ferre bedeutet Hilfe bringen oder leisten.' },
  { lemma: 'tollere', form: 'sustulērunt', context: 'Mīlitēs signa sustulērunt.', meanings: ['sie hoben hoch', 'sie hoben empor', 'sie haben hochgehoben', 'sie hoben auf'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. sustul- gehört zu tollere, tul- zu ferre.' },
  { lemma: 'dūcere', form: 'dūxērunt', context: 'Ducēs exercitum ad urbem dūxērunt.', meanings: ['sie führten', 'sie haben geführt'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. dūx- verbindet die Form mit dūcere.' },
  { lemma: 'mittere', form: 'mīsērunt', context: 'Rōmānī lēgātōs mīsērunt.', meanings: ['sie schickten', 'sie haben geschickt', 'sie sandten', 'sie entsandten'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. mīs- ist der Perfektstamm von mittere.' },
  { lemma: 'venīre', form: 'vēnērunt', context: 'Lēgātī ad Caesarem vēnērunt.', meanings: ['sie kamen', 'sie sind gekommen'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. Der lange Stammvokal kennzeichnet hier den Perfektstamm.' },
  { lemma: 'esse', form: 'fuissent', context: 'Sī amīcī adfuissent, laetī fuissent.', meanings: ['sie wären gewesen', 'gewesen wären'], analysis: '3. Person Plural, Konjunktiv Plusquamperfekt. fu- gehört zu esse; eine Supinumfrage wird nicht gestellt.' },
  { lemma: 'sequī', form: 'secūtī sunt', context: 'Mīlitēs ducem secūtī sunt.', meanings: ['sie folgten', 'sie sind gefolgt'], analysis: '3. Person Plural, Indikativ Perfekt des Deponens sequī: passive Form mit aktiver Bedeutung.' },
  { lemma: 'facere', form: 'fēcērunt', context: 'Mīlitēs pontem fēcērunt.', meanings: ['sie bauten', 'sie haben gebaut', 'sie errichteten', 'sie haben errichtet'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. fēc- gehört zu facere; mit pontem bedeutet es hier bauen.' },
  { lemma: 'perdere', form: 'perdidērunt', context: 'Mercātōrēs pecūniam perdidērunt.', meanings: ['sie verloren', 'sie haben verloren', 'sie verschwendeten', 'sie haben verschwendet'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. perdid- gehört zu perdere.' },
  { lemma: 'dare', form: 'dedērunt', context: 'Cīvēs auxilium dedērunt.', meanings: ['sie gaben', 'sie haben gegeben', 'sie leisteten', 'sie haben geleistet'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. ded- ist der reduplizierte Perfektstamm von dare.' },
  { lemma: 'posse', form: 'potuērunt', context: 'Cīvēs urbem dēfendere potuērunt.', meanings: ['sie konnten', 'sie haben gekonnt'], analysis: '3. Person Plural, Indikativ Perfekt. potu- gehört zu posse.' },
  { lemma: 'auferre', form: 'abstulērunt', context: 'Hostēs pecūniam abstulērunt.', meanings: ['sie raubten', 'sie haben geraubt', 'sie brachten weg', 'sie haben weggebracht'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. auferre bildet das Perfekt mit abstul-.' },
  { lemma: 'referre', form: 'rettulērunt', context: 'Lēgātī verba cōnsulis rettulērunt.', meanings: ['sie berichteten', 'sie haben berichtet', 'sie überbrachten', 'sie haben überbracht'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. rettul- gehört zu referre.' },
  { lemma: 'incipere', form: 'coepērunt', context: 'Mīlitēs pontem facere coepērunt.', meanings: ['sie begannen', 'sie haben begonnen', 'sie fingen an', 'sie haben angefangen'], analysis: '3. Person Plural, Indikativ Perfekt Aktiv. coepī ist im Datensatz neben incēpī als Perfekt zu incipere hinterlegt.' },
];

export interface MissionCase {
  id: string; mission: string; passage: string; lemma: string; target: string;
  partOfSpeech?: string;
  meanings: string[]; explanation: string; construction?: { question: string; answers: string[] };
}
const bridge = 'Caesar pontem facere cōnstituit. Mīlitēs ad flūmen contendunt. Pontem ab hostibus dēfendunt.';
const peace = 'Lēgātī pācem petunt. Cōnsul cōnsilium capit. Senātus lēgātīs respondet.';
const trust = 'Dux cum amīcīs venit. Amīcī in urbe manent. Dux amīcīs crēdit.';
const debate = 'Ōrātor dē lēge dīcit. Cīvēs fidem servant. Senātus novam lēgem probat.';
export const missionCases: MissionCase[] = [
  { id: 'bridge-build', mission: 'Die Brücke sichern', passage: bridge, lemma: 'facere', target: 'pontem facere', meanings: ['eine Brücke bauen', 'eine Brücke errichten', 'die Brücke bauen', 'die Brücke errichten'], explanation: 'Das Objekt pontem legt die Bedeutung bauen oder errichten nahe. Die allgemeine Bedeutung tun reicht hier nicht aus.' },
  { id: 'bridge-to', mission: 'Die Brücke sichern', passage: bridge, lemma: 'ad', target: 'ad flūmen', meanings: ['zum Fluss', 'an den Fluss', 'zu dem Fluss'], explanation: 'Die Bewegung zum Fluss wird mit ad und Akkusativ ausgedrückt.', construction: { question: 'Welchen Kasus verlangt ad?', answers: ['Akkusativ'] } },
  { id: 'bridge-defend', mission: 'Die Brücke sichern', passage: bridge, lemma: 'dēfendere', target: 'Pontem ab hostibus dēfendunt.', meanings: ['sie verteidigen die Brücke gegen die Feinde', 'sie verteidigen die Brücke vor den Feinden', 'sie schützen die Brücke vor den Feinden'], explanation: 'Bei dēfendere bezeichnet ab mit Ablativ hier die Gegner, vor denen etwas verteidigt wird.' },
  { id: 'peace-ask', mission: 'Eine Friedensgesandtschaft', passage: peace, lemma: 'petere', target: 'pācem petunt', meanings: ['sie bitten um Frieden', 'sie verlangen Frieden', 'sie ersuchen um Frieden'], explanation: 'Mit pācem bedeutet petere hier um Frieden bitten oder Frieden verlangen; angreifen passt nicht.' },
  { id: 'peace-plan', mission: 'Eine Friedensgesandtschaft', passage: peace, lemma: 'cōnsilium', target: 'cōnsilium capit', meanings: ['er fasst einen Plan', 'er fasst einen Beschluss', 'er trifft eine Entscheidung'], explanation: 'Die Verbindung cōnsilium capere bedeutet einen Plan oder Beschluss fassen. Beratung nehmen wäre hier unpassend.' },
  { id: 'peace-answer', mission: 'Eine Friedensgesandtschaft', passage: peace, lemma: 'respondēre', target: 'lēgātīs respondet', meanings: ['er antwortet den Gesandten', 'er antwortet den Abgesandten', 'antwortet den Gesandten'], explanation: 'lēgātīs ist Dativ: respondēre bezeichnet hier jemandem antworten.', construction: { question: 'In welchem Kasus steht die Person, der geantwortet wird?', answers: ['Dativ'] } },
  { id: 'trust-with', mission: 'Vertrauen in der Stadt', passage: trust, lemma: 'cum', partOfSpeech: 'Präposition', target: 'cum amīcīs', meanings: ['mit Freunden', 'mit den Freunden', 'zusammen mit Freunden', 'zusammen mit den Freunden'], explanation: 'Vor amīcīs steht cum als Präposition mit Ablativ. Die Konjunktionsbedeutungen weil oder obwohl passen hier nicht.', construction: { question: 'Welchen Kasus verlangt cum als Präposition?', answers: ['Ablativ'] } },
  { id: 'trust-place', mission: 'Vertrauen in der Stadt', passage: trust, lemma: 'in', target: 'in urbe', meanings: ['in der Stadt', 'innerhalb der Stadt'], explanation: 'manēre bezeichnet das Bleiben an einem Ort. Deshalb steht in mit Ablativ, nicht mit Richtungsakkusativ.', construction: { question: 'Welcher Kasus steht hier nach in?', answers: ['Ablativ'] } },
  { id: 'trust-believe', mission: 'Vertrauen in der Stadt', passage: trust, lemma: 'crēdere', target: 'amīcīs crēdit', meanings: ['er glaubt den Freunden', 'er vertraut den Freunden', 'er glaubt seinen Freunden', 'er vertraut seinen Freunden'], explanation: 'crēdere mit einer Person im Dativ bedeutet jemandem glauben oder vertrauen.', construction: { question: 'Welchen Kasus hat amīcīs hier?', answers: ['Dativ'] } },
  { id: 'debate-speak', mission: 'Eine Debatte im Senat', passage: debate, lemma: 'dīcere', target: 'dē lēge dīcit', meanings: ['er spricht über das Gesetz', 'er redet über das Gesetz'], explanation: 'dē mit Ablativ gibt das Thema an. dīcere bedeutet hier über etwas sprechen.' },
  { id: 'debate-trust', mission: 'Eine Debatte im Senat', passage: debate, lemma: 'fidēs', target: 'fidem servant', meanings: ['sie halten die Treue', 'sie bewahren die Treue', 'sie halten ihr Wort', 'sie halten Wort'], explanation: 'fidem servāre bedeutet Treue oder sein Wort halten. fidēs besitzt mehrere kontextabhängige Bedeutungen.' },
  { id: 'debate-law', mission: 'Eine Debatte im Senat', passage: debate, lemma: 'lēx', target: 'novam lēgem', meanings: ['ein neues Gesetz', 'das neue Gesetz'], explanation: 'Im politischen Zusammenhang ist lēx hier ein Gesetz. Die ebenfalls hinterlegte Bedeutung Bedingung passt nicht.' },
];

export interface HuntCase {
  id: string; lemma: string; claim: string; verdict: 'Fehler enthalten' | 'Alles richtig';
  partOfSpeech?: string;
  correction?: { label: string; answers: string[]; skill: string; latin?: boolean };
  explanation: string;
}
export const huntCases: HuntCase[] = [
  { id: 'tollere-ferre', lemma: 'tollere', claim: 'tollere – tollō – tulī – sublātum', verdict: 'Fehler enthalten', correction: { label: 'Nenne die richtige Perfektform.', answers: ['sustulī'], skill: 'perfekt_1sg', latin: true }, explanation: 'tollere hat sustulī. tulī gehört zu ferre – ferō – tulī – lātum.' },
  { id: 'ferre-tollere', lemma: 'ferre', claim: 'ferre – ferō – sustulī – lātum', verdict: 'Fehler enthalten', correction: { label: 'Nenne die richtige Perfektform.', answers: ['tulī'], skill: 'perfekt_1sg', latin: true }, explanation: 'ferre hat tulī; sustulī gehört zu tollere.' },
  { id: 'capere-correct', lemma: 'capere', claim: 'capere – capiō – cēpī – captum', verdict: 'Alles richtig', correction: { label: 'Nenne die richtige Perfektform.', answers: ['cēpī'], skill: 'perfekt_1sg', latin: true }, explanation: 'Die Reihe stimmt. Der Perfektstamm cēp- unterscheidet sich vom Präsensstamm cap-.' },
  { id: 'mittere-perfect', lemma: 'mittere', claim: 'mittere – mittō – mittī – missum', verdict: 'Fehler enthalten', correction: { label: 'Nenne die richtige Perfektform.', answers: ['mīsī'], skill: 'perfekt_1sg', latin: true }, explanation: 'Das Perfekt lautet mīsī; mittī ist der Infinitiv Präsens Passiv.' },
  { id: 'sequi-active', lemma: 'sequī', claim: 'sequī bedeutet „gefolgt werden“.', verdict: 'Fehler enthalten', correction: { label: 'Welche deutsche Bedeutung hat sequī?', answers: ['folgen', 'nachfolgen'], skill: 'meaning' }, explanation: 'sequī ist ein Deponens: passive Formen, aktive Bedeutung folgen.' },
  { id: 'cum-case', lemma: 'cum', partOfSpeech: 'Präposition', claim: 'cum amīcīs: cum steht hier mit Akkusativ.', verdict: 'Fehler enthalten', correction: { label: 'Welcher Kasus ist richtig?', answers: ['Ablativ'], skill: 'construction' }, explanation: 'cum als Präposition verlangt den Ablativ. Hier bedeutet es mit den Freunden.' },
  { id: 'ad-correct', lemma: 'ad', claim: 'ad urbem: ad verlangt Akkusativ; die Wortgruppe bedeutet „zur Stadt“.', verdict: 'Alles richtig', correction: { label: 'Welchen Kasus verlangt ad?', answers: ['Akkusativ'], skill: 'construction' }, explanation: 'ad steht mit Akkusativ und bezeichnet hier ein Bewegungsziel.' },
  { id: 'lex-gender', lemma: 'lēx', claim: 'lēx – lēgis: Genus männlich', verdict: 'Fehler enthalten', correction: { label: 'Welches Genus hat lēx?', answers: ['weiblich', 'feminin', 'f'], skill: 'geschlecht' }, explanation: 'lēx ist feminin: lēx, lēgis f. – das Gesetz. Deutsches und lateinisches Genus stimmen hier nicht überein.' },
  { id: 'pulcher-forms', lemma: 'pulcher', claim: 'pulcher – pulchera – pulcherum', verdict: 'Fehler enthalten', correction: { label: 'Nenne die weibliche und die sächliche Form (mit Komma getrennt).', answers: ['pulchra, pulchrum', 'pulchra pulchrum'], skill: 'adjective', latin: true }, explanation: 'Die Formen lauten pulcher, pulchra, pulchrum. Das e entfällt in den weiteren Grundformen.' },
  { id: 'constituere-correct', lemma: 'cōnstituere', claim: 'cōnstituere – cōnstituō – cōnstituī – cōnstitūtum', verdict: 'Alles richtig', correction: { label: 'Nenne die richtige Perfektform.', answers: ['cōnstituī'], skill: 'perfekt_1sg', latin: true }, explanation: 'Die Reihe stimmt. Perfekt und Supinum haben unterschiedliche Stämme: cōnstitu- und cōnstitūt-.' },
];

/** Small, explicit memberships. Unlisted vocabulary is never classified by guesswork. */
export const thematicGroups: Record<string, { label: string; lemmas: string[] }> = {
  politics: { label: 'Staat und Recht', lemmas: ['lēx', 'cōnsul', 'senātus', 'cīvis', 'cīvitās', 'rēs pūblica', 'populus', 'imperium', 'potestās', 'iūs', 'rēx', 'cōnsilium', 'pāx'] },
  conflict: { label: 'Krieg und Frieden', lemmas: ['pāx', 'bellum', 'hostis', 'mīles', 'exercitus', 'arma', 'dux', 'vincere', 'capere', 'dēfendere', 'petere', 'dūcere', 'mittere', 'auxilium', 'victōria'] },
  thought: { label: 'Denken und Reden', lemmas: ['cōgitāre', 'putāre', 'scīre', 'crēdere', 'sentīre', 'dīcere', 'respondēre', 'quaerere', 'intellegere', 'cōnsilium', 'verbum', 'ōrātiō', 'memoria'] },
  feelings: { label: 'Gefühle und Beziehungen', lemmas: ['amor', 'amāre', 'amīcus', 'fidēs', 'timor', 'timēre', 'spēs', 'gaudēre', 'laetus', 'dolor', 'odium', 'miser', 'īra'] },
  movement: { label: 'Bewegung und Handlung', lemmas: ['īre', 'venīre', 'currere', 'contendere', 'dūcere', 'ferre', 'auferre', 'referre', 'afferre', 'sequī', 'tollere', 'facere', 'incipere', 'suscipere'] },
  society: { label: 'Mensch und Gesellschaft', lemmas: ['homō', 'vir', 'fēmina', 'puer', 'puella', 'pater', 'māter', 'fīlius', 'fīlia', 'servus', 'dominus', 'amīcus', 'līberī', 'familia', 'cīvis'] },
};
export const wordFamilies: Record<string, { label: string; lemmas: string[] }> = {
  ferre: { label: 'ferre und Komposita', lemmas: ['ferre', 'auferre', 'referre', 'afferre', 'cōnferre', 'offerre'] },
  capere: { label: 'capere und Komposita', lemmas: ['capere', 'suscipere', 'incipere', 'accipere', 'recipere'] },
  mittere: { label: 'mittere und Komposita', lemmas: ['mittere', 'āmittere', 'dīmittere', 'committere'] },
  love: { label: 'amāre und amor', lemmas: ['amāre', 'amor'] },
};

export const formationGroups: Record<string, { label: string; lemmas: string[] }> = {
  sx: { label: 's- und x-Perfekt', lemmas: ['dūcere', 'dīcere', 'mittere', 'āmittere', 'scrībere', 'regere', 'trahere', 'sentīre'] },
  reduplication: { label: 'Reduplikationsperfekt', lemmas: ['dare', 'perdere', 'crēdere', 'currere', 'cadere', 'tangere'] },
  change: { label: 'Auffällige Stammwechsel', lemmas: ['capere', 'facere', 'ferre', 'tollere', 'esse', 'posse', 'venīre', 'auferre', 'referre', 'afferre', 'cōnferre'] },
};
