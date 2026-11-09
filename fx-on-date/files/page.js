// The Exchange rate on a date page. core.js (the same file the server uses) supplies the currency
// list, the sources and the wording for dates; the rate itself always comes from the server
// through Endwise.run.
import { CURRENCIES, FIRST_FIXING, SOURCES, SOURCE_IDS, fixingNote, longDate, isRealDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fx-on-date';
const NAMES = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.name]));

// The page in other languages (page.<code>.html, at /<code>/fx-on-date/) is <html lang="<code>">:
// there this script shows its own words from WORDS. English reads exactly the strings in EN.
// Text that the server or core.js produces (source names, publication titles, "INR per 1 USD",
// the code panel) stays in English everywhere: they are the names the publishers use.
const L = document.documentElement.lang.slice(0, 2);
const EN = {
  hint_ecb: "The European Central Bank's daily euro reference rate.",
  date_ecb: 'From 4 January 1999. Weekends and bank holidays use the last fixing before them.',
  hint_treasury: "Treasury's quarterly rate, in units per US dollar. One side must be USD.",
  date_treasury: 'The report in effect on that day, from the report as of 31 March 2001.',
  hint_irs: 'The IRS average for the year of your date, in units per US dollar. One side must be USD.',
  date_irs: 'Only the year of the date counts.',
  hint_hmrc: "HMRC's rate for the month of your date, in units per pound. One side must be GBP.",
  date_hmrc: 'Only the month of the date counts, from January 2021.',
  which: 'Which rate to use',
  errPick: 'Pick a date.',
  errReal: 'That is not a real calendar date.',
  errEcb: 'The ECB has no rates before 4 January 1999.',
  head_ecb: 'ECB reference rate',
  head_treasury: 'US Treasury reporting rate',
  head_irs: 'IRS yearly average',
  head_hmrc: 'HMRC monthly rate',
  waiting: 'Waiting',
  pickTwo: 'Pick two currencies and a date',
  idle: 'The rate, its inverse and the date or period used appear here.',
  sourceLine: (name) => `Source: ${name}.`,
  sourceLead: 'Source: ',
  pairSep: ' to ',
  pairNames: (a, b) => ` · ${a} to ${b}`,
  span: (a, b) => `${a} to ${b}`,
  fixing: (d) => `Fixing ${d}`,
  effective: (d) => `Effective ${d}`,
  from: (d) => `From ${d}`,
  exampleTag: 'Example',
  buys: (base) => `1 ${base} buys`,
  inverseLead: 'The other way round: 1 ',
  diffDay: 'Different day',
  fixNote: (req, fix) => `No ECB fixing on ${req}, so this uses ${fix}.`,
  asked: 'You asked for',
  fixUsed: 'Fixing used',
  publication: 'Publication',
  covers: 'Rate covers',
  asPublished: 'As published',
  noRate: 'No rate',
  noRateMsg: (m) => `${m} You were not charged for this run.`,
  charged: (d, b) => `Charged ${d}. Your balance is ${b}.`,
  freeLeft: (n) => `Free run. You have ${n} free ${n === 1 ? 'run' : 'runs'} left today.`,
  signIn: 'Sign in',
  openAccount: 'Open your account',
  priceAccount: (p) => `${p} a run, from your balance · a day with no rate costs nothing`,
  priceAnon: (p) => `${p} a run · 5 free runs a day, no card needed · also works over an API`,
  runNote: '5 free runs a day, no account needed.',
  exampleCost: 'A worked example from the ECB file, not your own lookup. Press "Get the rate" to run it for real.',
  askLine: (base, quote, date) => `Press "Get the rate" for ${base} to ${quote} on ${date}.`,
  loading: 'Loading the worked example.',
};
const WORDS = {
  de: {
    hint_ecb: 'Der tägliche Euro-Referenzkurs der Europäischen Zentralbank.',
    date_ecb: 'Ab 4. Januar 1999. An Wochenenden und Feiertagen gilt der letzte Kurs davor.',
    hint_treasury: 'Der Quartalskurs des US-Finanzministeriums, in Einheiten pro US-Dollar. Eine Seite muss USD sein.',
    date_treasury: 'Es gilt der Bericht, der an diesem Tag in Kraft war, ab dem Bericht zum 31. März 2001.',
    hint_irs: 'Der Jahresdurchschnitt der US-Steuerbehörde IRS für das Jahr Ihres Datums, in Einheiten pro US-Dollar. Eine Seite muss USD sein.',
    date_irs: 'Nur das Jahr des Datums zählt.',
    hint_hmrc: 'Der Kurs der britischen Steuerbehörde HMRC für den Monat Ihres Datums, in Einheiten pro Pfund. Eine Seite muss GBP sein.',
    date_hmrc: 'Nur der Monat des Datums zählt, ab Januar 2021.',
    which: 'Welcher Kurs passt',
    errPick: 'Bitte wählen Sie ein Datum.',
    errReal: 'Das ist kein gültiges Kalenderdatum.',
    errEcb: 'Die EZB hat keine Kurse vor dem 4. Januar 1999.',
    head_ecb: 'EZB-Referenzkurs',
    head_treasury: 'Umrechnungskurs US-Finanzministerium',
    head_irs: 'IRS-Jahresdurchschnitt',
    head_hmrc: 'HMRC-Monatskurs',
    waiting: 'Wartet',
    pickTwo: 'Wählen Sie zwei Währungen und ein Datum',
    idle: 'Hier erscheinen der Kurs, sein Kehrwert und das verwendete Datum oder der Zeitraum.',
    sourceLine: (name) => `Quelle: ${name}.`,
    sourceLead: 'Quelle: ',
    pairSep: ' in ',
    pairNames: (a, b) => ` · ${a} in ${b}`,
    span: (a, b) => `${a} bis ${b}`,
    fixing: (d) => `Fixing ${d}`,
    effective: (d) => `Gültig ab ${d}`,
    from: (d) => `Ab ${d}`,
    exampleTag: 'Rechenbeispiel',
    buys: (base) => `1 ${base} ergibt`,
    inverseLead: 'Umgekehrt: 1 ',
    diffDay: 'Anderer Tag',
    fixNote: (req, fix) => `Am ${req} gibt es keinen EZB-Kurs, daher gilt der Kurs vom ${fix}.`,
    asked: 'Ihr Datum',
    fixUsed: 'Verwendeter Kurs vom',
    publication: 'Veröffentlichung',
    covers: 'Der Kurs gilt für',
    asPublished: 'Wie veröffentlicht',
    noRate: 'Kein Kurs',
    noRateMsg: () => 'Für diese Angaben gibt es bei der gewählten Quelle keinen Kurs: Das Datum liegt vor dem Beginn der Daten, in der Zukunft oder (bei der EZB) mehr als 7 Tage nach dem letzten Kurs; der Kurs des heutigen Tages erscheint erst nach der Veröffentlichung um etwa 16:00 Uhr. Für diesen Abruf wurde nichts berechnet.',
    charged: (d, b) => `Berechnet: ${d}. Ihr Guthaben beträgt ${b}.`,
    freeLeft: (n) => `Kostenloser Abruf. Heute bleiben Ihnen noch ${n} kostenlose ${n === 1 ? 'Abruf' : 'Abrufe'}.`,
    signIn: 'Anmelden',
    openAccount: 'Konto öffnen',
    priceAccount: (p) => `${p} pro Abruf, vom Guthaben · ein Tag ohne Kurs kostet nichts`,
    priceAnon: (p) => `${p} pro Abruf · 5 kostenlose Abrufe pro Tag ohne Konto · auch per API`,
    runNote: '5 kostenlose Abrufe pro Tag, ohne Konto.',
    exampleCost: 'Ein Rechenbeispiel aus der EZB-Datei, nicht Ihre eigene Abfrage. Klicken Sie auf „Kurs abrufen“, um es wirklich auszuführen.',
    askLine: (base, quote, date) => `Klicken Sie auf „Kurs abrufen“ für ${base} in ${quote} am ${date}.`,
    loading: 'Das Rechenbeispiel wird geladen.',
  },
  fr: {
    hint_ecb: 'Le taux de change de référence quotidien de l’euro, publié par la Banque centrale européenne.',
    date_ecb: 'À partir du 4 janvier 1999. Un week-end ou un jour férié, le dernier taux publié avant est utilisé.',
    hint_treasury: 'Le taux trimestriel du Trésor américain, en unités par dollar américain. L’une des deux monnaies doit être USD.',
    date_treasury: 'Le rapport en vigueur ce jour-là, à partir du rapport au 31 mars 2001.',
    hint_irs: 'La moyenne annuelle de l’IRS (administration fiscale américaine) pour l’année de votre date, en unités par dollar américain. L’une des deux monnaies doit être USD.',
    date_irs: 'Seule l’année de la date compte.',
    hint_hmrc: 'Le taux de la HMRC (administration fiscale britannique) pour le mois de votre date, en unités par livre. L’une des deux monnaies doit être GBP.',
    date_hmrc: 'Seul le mois de la date compte, à partir de janvier 2021.',
    which: 'Quel taux choisir',
    errPick: 'Choisissez une date.',
    errReal: 'Cette date n’existe pas au calendrier.',
    errEcb: 'La BCE n’a pas de taux avant le 4 janvier 1999.',
    head_ecb: 'Taux de référence BCE',
    head_treasury: 'Taux du Trésor américain',
    head_irs: 'Moyenne annuelle IRS',
    head_hmrc: 'Taux mensuel HMRC',
    waiting: 'En attente',
    pickTwo: 'Choisissez deux monnaies et une date',
    idle: 'Le taux, son inverse et la date ou la période utilisée apparaissent ici.',
    sourceLine: (name) => `Source : ${name}.`,
    sourceLead: 'Source : ',
    pairSep: ' en ',
    pairNames: (a, b) => ` · ${a} en ${b}`,
    span: (a, b) => `du ${a} au ${b}`,
    fixing: (d) => `Taux du ${d}`,
    effective: (d) => `En vigueur le ${d}`,
    from: (d) => `Depuis le ${d}`,
    exampleTag: 'Exemple calculé',
    buys: (base) => `1 ${base} vaut`,
    inverseLead: 'Dans l’autre sens : 1 ',
    diffDay: 'Autre jour',
    fixNote: (req, fix) => `Pas de taux de référence BCE le ${req} : le taux du ${fix} est utilisé.`,
    asked: 'Date demandée',
    fixUsed: 'Taux utilisé du',
    publication: 'Publication',
    covers: 'Le taux couvre',
    asPublished: 'Tel que publié',
    noRate: 'Pas de taux',
    noRateMsg: () => 'Il n’y a pas de taux pour cette demande dans la source choisie : la date est antérieure au début des données, dans le futur ou (pour la BCE) à plus de 7 jours après le dernier taux publié ; le taux du jour n’apparaît qu’après la publication, vers 16 h. Cette recherche ne vous a rien coûté.',
    charged: (d, b) => `Facturé : ${d}. Votre solde est de ${b}.`,
    freeLeft: (n) => `Recherche gratuite. Il vous reste ${n} ${n <= 1 ? 'recherche gratuite' : 'recherches gratuites'} aujourd’hui.`,
    signIn: 'Se connecter',
    openAccount: 'Ouvrir votre compte',
    priceAccount: (p) => `${p} la recherche, prélevé sur votre solde · un jour sans taux ne coûte rien`,
    priceAnon: (p) => `${p} la recherche · 5 recherches gratuites par jour sans compte · aussi par API`,
    runNote: '5 recherches gratuites par jour, sans compte.',
    exampleCost: 'Un exemple calculé à partir du fichier de la BCE, pas votre propre recherche. Cliquez sur « Obtenir le taux » pour le lancer vraiment.',
    askLine: (base, quote, date) => `Cliquez sur « Obtenir le taux » pour ${base} en ${quote} le ${date}.`,
    loading: 'Chargement de l’exemple calculé.',
  },
  pt: {
    hint_ecb: 'A cotação de referência diária do euro, publicada pelo Banco Central Europeu.',
    date_ecb: 'A partir de 4 de janeiro de 1999. Em fins de semana e feriados vale a última cotação anterior.',
    hint_treasury: 'A taxa trimestral do Tesouro dos EUA, em unidades por dólar americano. Um dos lados precisa ser USD.',
    date_treasury: 'O relatório em vigor naquele dia, a partir do relatório de 31 de março de 2001.',
    hint_irs: 'A média anual do IRS (a Receita Federal dos EUA) para o ano da sua data, em unidades por dólar americano. Um dos lados precisa ser USD.',
    date_irs: 'Só o ano da data conta.',
    hint_hmrc: 'A taxa da HMRC (a Receita do Reino Unido) para o mês da sua data, em unidades por libra. Um dos lados precisa ser GBP.',
    date_hmrc: 'Só o mês da data conta, a partir de janeiro de 2021.',
    which: 'Qual taxa usar',
    errPick: 'Escolha uma data.',
    errReal: 'Essa não é uma data válida do calendário.',
    errEcb: 'O BCE não tem cotações antes de 4 de janeiro de 1999.',
    head_ecb: 'Cotação de referência do BCE',
    head_treasury: 'Taxa do Tesouro dos EUA',
    head_irs: 'Média anual do IRS',
    head_hmrc: 'Taxa mensal da HMRC',
    waiting: 'Aguardando',
    pickTwo: 'Escolha duas moedas e uma data',
    idle: 'A cotação, o inverso e a data ou o período usado aparecem aqui.',
    sourceLine: (name) => `Fonte: ${name}.`,
    sourceLead: 'Fonte: ',
    pairSep: ' para ',
    pairNames: (a, b) => ` · ${a} para ${b}`,
    span: (a, b) => `de ${a} a ${b}`,
    fixing: (d) => `Cotação de ${d}`,
    effective: (d) => `Em vigor em ${d}`,
    from: (d) => `A partir de ${d}`,
    exampleTag: 'Exemplo calculado',
    buys: (base) => `1 ${base} vale`,
    inverseLead: 'No sentido contrário: 1 ',
    diffDay: 'Outro dia',
    fixNote: (req, fix) => `Não há cotação de referência do BCE em ${req}; foi usada a de ${fix}.`,
    asked: 'Data pedida',
    fixUsed: 'Cotação usada de',
    publication: 'Publicação',
    covers: 'A taxa cobre',
    asPublished: 'Como publicada',
    noRate: 'Sem cotação',
    noRateMsg: () => 'Não há cotação para esse pedido na fonte escolhida: a data é anterior ao início dos dados, está no futuro ou (no caso do BCE) fica mais de 7 dias depois da última cotação publicada; a cotação de hoje só aparece depois da publicação, por volta das 16h (horário da Europa Central). Esta consulta não foi cobrada.',
    charged: (d, b) => `Cobrado: ${d}. Seu saldo é ${b}.`,
    freeLeft: (n) => `Consulta grátis. Você ainda tem ${n} ${n === 1 ? 'consulta grátis' : 'consultas grátis'} hoje.`,
    signIn: 'Entrar',
    openAccount: 'Abrir sua conta',
    priceAccount: (p) => `${p} por consulta, descontado do seu saldo · um dia sem cotação não custa nada`,
    priceAnon: (p) => `${p} por consulta · 5 consultas grátis por dia sem conta · também por API`,
    runNote: '5 consultas grátis por dia, sem conta.',
    exampleCost: 'Um exemplo calculado a partir do arquivo do BCE, não a sua consulta. Clique em “Ver a cotação” para executá-lo de verdade.',
    askLine: (base, quote, date) => `Clique em “Ver a cotação” para ${base} para ${quote} em ${date}.`,
    loading: 'Carregando o exemplo calculado.',
  },
  hi: {
    hint_ecb: 'यूरोपीय सेंट्रल बैंक (ECB) का रोज़ाना जारी होने वाला यूरो रेफरेंस रेट।',
    date_ecb: '4 जनवरी 1999 से। शनिवार-रविवार और छुट्टी पर उससे पहले का आख़िरी रेट इस्तेमाल होता है।',
    hint_treasury: 'अमेरिकी ट्रेज़री का तिमाही रेट, प्रति US डॉलर इकाइयों में। एक तरफ USD होना ज़रूरी है।',
    date_treasury: 'उस दिन लागू रिपोर्ट, 31 मार्च 2001 की रिपोर्ट से शुरू।',
    hint_irs: 'आपकी तारीख़ के साल के लिए अमेरिकी कर विभाग IRS का सालाना औसत, प्रति US डॉलर इकाइयों में। एक तरफ USD होना ज़रूरी है।',
    date_irs: 'सिर्फ़ तारीख़ का साल गिना जाता है।',
    hint_hmrc: 'आपकी तारीख़ के महीने के लिए ब्रिटेन के कर विभाग HMRC का रेट, प्रति पाउंड इकाइयों में। एक तरफ GBP होना ज़रूरी है।',
    date_hmrc: 'सिर्फ़ तारीख़ का महीना गिना जाता है, जनवरी 2021 से।',
    which: 'कौन सा रेट चुनें',
    errPick: 'तारीख़ चुनें।',
    errReal: 'यह कैलेंडर की सही तारीख़ नहीं है।',
    errEcb: 'ECB के पास 4 जनवरी 1999 से पहले के रेट नहीं हैं।',
    head_ecb: 'ECB रेफरेंस रेट',
    head_treasury: 'अमेरिकी ट्रेज़री रिपोर्टिंग रेट',
    head_irs: 'IRS सालाना औसत',
    head_hmrc: 'HMRC मासिक रेट',
    waiting: 'इंतज़ार',
    pickTwo: 'दो मुद्राएँ और एक तारीख़ चुनें',
    idle: 'रेट, उसका उल्टा और इस्तेमाल हुई तारीख़ या अवधि यहाँ दिखेगी।',
    sourceLine: (name) => `स्रोत: ${name}।`,
    sourceLead: 'स्रोत: ',
    pairSep: ' से ',
    pairNames: (a, b) => ` · ${a} से ${b}`,
    span: (a, b) => `${a} से ${b} तक`,
    fixing: (d) => `फ़िक्सिंग ${d}`,
    effective: (d) => `${d} से लागू`,
    from: (d) => `${d} से`,
    exampleTag: 'हल किया हुआ उदाहरण',
    buys: (base) => `1 ${base} बराबर`,
    inverseLead: 'उल्टी तरफ़: 1 ',
    diffDay: 'दूसरा दिन',
    fixNote: (req, fix) => `${req} को ECB का कोई रेट जारी नहीं हुआ, इसलिए ${fix} का रेट इस्तेमाल हुआ है।`,
    asked: 'आपने पूछा',
    fixUsed: 'इस्तेमाल हुई फ़िक्सिंग',
    publication: 'प्रकाशन',
    covers: 'रेट किस अवधि का है',
    asPublished: 'जैसा छपा है',
    noRate: 'रेट नहीं मिला',
    noRateMsg: () => 'चुने हुए स्रोत में इस पूछताछ के लिए रेट नहीं है: तारीख़ डेटा शुरू होने से पहले की है, भविष्य की है, या (ECB के मामले में) आख़िरी जारी रेट के 7 दिन से ज़्यादा बाद की है। आज का रेट सेंट्रल यूरोपीय समय के हिसाब से लगभग शाम 4 बजे के प्रकाशन के बाद ही आता है। इस बार आपसे कुछ चार्ज नहीं हुआ।',
    charged: (d, b) => `चार्ज हुआ: ${d}। आपका बैलेंस ${b} है।`,
    freeLeft: (n) => `मुफ़्त रन। आज आपके ${n} मुफ़्त रन बचे हैं।`,
    signIn: 'साइन इन करें',
    openAccount: 'अपना खाता खोलें',
    priceAccount: (p) => `${p} प्रति रन, आपके बैलेंस से · जिस दिन रेट नहीं मिलता, उस दिन कुछ नहीं कटता`,
    priceAnon: (p) => `${p} प्रति रन · खाते के बिना रोज़ 5 मुफ़्त रन · API से भी`,
    runNote: 'रोज़ 5 मुफ़्त रन, खाते की ज़रूरत नहीं।',
    exampleCost: 'ECB की फ़ाइल से हल किया हुआ उदाहरण, आपकी अपनी खोज नहीं। असली रन के लिए “रेट पाएँ” दबाएँ।',
    askLine: (base, quote, date) => `${date} को ${base} से ${quote} के लिए “रेट पाएँ” दबाएँ।`,
    loading: 'हल किया हुआ उदाहरण लोड हो रहा है।',
  },
  ja: {
    hint_ecb: '欧州中央銀行(ECB)が毎日公表するユーロの参照レートです。',
    date_ecb: '1999年1月4日から。土日・祝日は、その前の最後のレートを使います。',
    hint_treasury: '米国財務省の四半期レート(米ドル1ドルあたりの通貨単位)。どちらかがUSDである必要があります。',
    date_treasury: 'その日に有効だった報告書を使います。2001年3月31日付の報告書から対応しています。',
    hint_irs: '米国内国歳入庁(IRS)が公表する、日付の年の年間平均レート(米ドル1ドルあたりの通貨単位)。どちらかがUSDである必要があります。',
    date_irs: '日付の「年」だけが使われます。',
    hint_hmrc: '英国歳入関税庁(HMRC)が公表する、日付の月の月次レート(1ポンドあたりの通貨単位)。どちらかがGBPである必要があります。',
    date_hmrc: '日付の「月」だけが使われます。2021年1月から対応しています。',
    which: 'どのレートを使うか',
    errPick: '日付を選んでください。',
    errReal: '存在しない日付です。',
    errEcb: 'ECBのレートは1999年1月4日以前にはありません。',
    head_ecb: 'ECB参照レート',
    head_treasury: '米国財務省の報告レート',
    head_irs: 'IRS年間平均レート',
    head_hmrc: 'HMRC月次レート',
    waiting: '待機中',
    pickTwo: '通貨を2つと日付を選んでください',
    idle: 'ここにレート、その逆数、使用した日付または期間が表示されます。',
    sourceLine: (name) => `出典: ${name}`,
    sourceLead: '出典: ',
    pairSep: ' → ',
    pairNames: (a, b) => ` · ${a} → ${b}`,
    span: (a, b) => `${a}から${b}まで`,
    fixing: (d) => `公表日 ${d}`,
    effective: (d) => `${d}から有効`,
    from: (d) => `${d}から`,
    exampleTag: '計算例',
    buys: (base) => `1 ${base} は`,
    inverseLead: '逆方向: 1 ',
    diffDay: '別の日',
    fixNote: (req, fix) => `${req}にはECBのレートの公表がないため、${fix}のレートを使っています。`,
    asked: '指定した日付',
    fixUsed: '使用したレートの日付',
    publication: '資料名',
    covers: 'レートの対象期間',
    asPublished: '公表されたとおりの値',
    noRate: 'レートなし',
    noRateMsg: () => '選んだ出典には、この条件のレートがありません。データの開始前の日付、未来の日付、または(ECBの場合)最後に公表されたレートから7日を超えて先の日付です。当日分は、中央ヨーロッパ時間で16時ごろの公表後に出ます。今回の実行に料金はかかっていません。',
    charged: (d, b) => `料金: ${d}。残高は${b}です。`,
    freeLeft: (n) => `無料の実行です。本日はあと${n}回、無料で実行できます。`,
    signIn: 'ログイン',
    openAccount: 'アカウントを開く',
    priceAccount: (p) => `1回${p}、残高から引かれます · レートがなかった日は無料`,
    priceAnon: (p) => `1回${p} · アカウントなしで1日5回まで無料 · APIでも利用可`,
    runNote: '1日5回まで無料、アカウント不要。',
    exampleCost: 'ECBのファイルから計算した例で、あなた自身の検索ではありません。実際に実行するには「レートを調べる」を押してください。',
    askLine: (base, quote, date) => `${date}の${base}→${quote}は「レートを調べる」を押してください。`,
    loading: '計算例を読み込んでいます。',
  },
};
const t = (key, ...args) => {
  const v = (WORDS[L] ?? {})[key] ?? EN[key];
  return typeof v === 'function' ? v(...args) : v;
};
const NUM_LOCALE = { de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR' }[L] ?? 'en-US';
const DATE_LOCALE = { de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR', hi: 'hi-IN', ja: 'ja-JP' }[L];
// The weekday and date in the page's language ("Saturday 24 Oct 2026" in English, from core.js).
const dateLong = (iso) => (!DATE_LOCALE ? longDate(iso)
  : new Date(`${iso}T00:00:00Z`).toLocaleDateString(DATE_LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }));
let displayNames = null;
try { if (L !== 'en') displayNames = new Intl.DisplayNames([L], { type: 'currency' }); } catch { displayNames = null; }
// A currency's name in the page's language, from the browser's own data; English if it has none.
const nameOf = (code) => { try { return displayNames?.of(code) || NAMES[code] || code; } catch { return NAMES[code] || code; } };
const QUICK = [['USD', 'INR'], ['EUR', 'USD'], ['GBP', 'USD'], ['EUR', 'INR'], ['USD', 'JPY'], ['GBP', 'INR']];

const $ = (id) => document.getElementById(id);
const FIELD_ERRORS = { base: 'fx-base-err', quote: 'fx-quote-err', date: 'fx-date-err' };

// What the selector's hint and the date hint say for each source.
const HINTS = Object.fromEntries(SOURCE_IDS.map((id) => [id, () => [t(`hint_${id}`), t(`date_${id}`)]]));
const sourceOf = () => (SOURCE_IDS.includes($('fx-source').value) ? $('fx-source').value : 'ecb');

function syncSource() {
  const [what, when] = HINTS[sourceOf()]();
  const hint = $('fx-source-hint');
  hint.textContent = `${what} `;
  hint.appendChild(h('a', { href: '#fx-which' }, t('which')));
  $('fx-date-hint').textContent = when;
}

// 1.113 -> "1.1130", 20193.16 -> "20,193.1600", 95.269093 -> "95.269093"
// Set once the visitor changes the form or runs it, so the worked example, which arrives
// after a fetch, never overwrites their own input or result.
let touched = false;
const touch = () => { touched = true; };

const fmt = (n) => n.toLocaleString(NUM_LOCALE, { minimumFractionDigits: 4, maximumFractionDigits: 6 });

// ---------- form ----------

function fillSelect(select, value) {
  for (const c of CURRENCIES) select.appendChild(h('option', { value: c.code }, `${c.code}  ${nameOf(c.code)}`));
  select.value = value;
}

function clearErrors() {
  $('fx-error').textContent = '';
  for (const id of Object.values(FIELD_ERRORS)) $(id).textContent = '';
}

function showFieldErrors(fields) {
  const known = Object.keys(fields).filter((k) => FIELD_ERRORS[k]);
  for (const k of known) $(FIELD_ERRORS[k]).textContent = fields[k];
  return known.length === Object.keys(fields).length;
}

// { input } for a good form, or { errors } for a bad one, so a typo never spends a run.
function readForm() {
  const source = sourceOf();
  const input = { base: $('fx-base').value, quote: $('fx-quote').value, date: $('fx-date').value.trim() };
  // The default source is left out, so the request is the same one the API always took.
  if (source !== 'ecb') input.source = source;
  const errors = {};
  if (!input.date) errors.date = t('errPick');
  else if (!isRealDate(input.date)) errors.date = t('errReal');
  else if (source === 'ecb' && input.date < FIRST_FIXING) errors.date = t('errEcb');
  return Object.keys(errors).length ? { errors } : { input };
}

function syncQuick() {
  const base = $('fx-base').value;
  const quote = $('fx-quote').value;
  for (const b of document.querySelectorAll('.fx-chip')) {
    b.setAttribute('aria-pressed', String(b.dataset.base === base && b.dataset.quote === quote));
  }
}

function setPair(base, quote) {
  $('fx-base').value = base;
  $('fx-quote').value = quote;
  syncQuick();
}

// ---------- the ticket ----------


function head(right, source = 'ecb') {
  return h('div', { class: 'fx-ticket-head' }, [h('span', {}, t(`head_${source}`)), h('span', {}, right)]);
}

// The source id of an answer, from its source name.
const idOf = (r) => SOURCE_IDS.find((id) => SOURCES[id].name === r.source) || 'ecb';

function tear() {
  return h('div', { class: 'fx-tear', 'aria-hidden': 'true' }, [h('i')]);
}

function pairName(base, quote) {
  return h('p', { class: 'fx-pair-name' }, [h('b', {}, base), t('pairSep'), h('b', {}, quote), t('pairNames', nameOf(base), nameOf(quote))]);
}

function show(node) {
  const board = $('fx-board');
  board.textContent = '';
  board.appendChild(node);
}

function idleTicket(line = t('idle')) {
  const source = sourceOf();
  show(h('article', { class: 'fx-ticket idle' }, [
    head(t('waiting'), source),
    h('div', { class: 'fx-ticket-body' }, [
      h('p', { class: 'fx-pair-name' }, t('pickTwo')),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-inverse' }, line),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [h('p', { class: 'fx-source' }, t('sourceLine', SOURCES[source].name))]),
  ]));
}

// "Wednesday 31 Dec 2025 to Monday 30 Mar 2026"
const span = (from, to) => t('span', dateLong(from), dateLong(to));

// The Example tag over a worked example, and on the English page its inputs line.
function exampleTag(r) {
  return h('p', { class: 'fx-example-tag' }, [
    h('span', { class: 'ex-tag' }, t('exampleTag')),
    L === 'en' ? h('span', { class: 'tf-exin' }, `Example: ${NAMES[r.base] ?? r.base} to ${NAMES[r.quote] ?? r.quote} on ${dateLong(r.requestedDate)}`) : null,
  ]);
}

// example: true labels the ticket as a worked example (the tool's first real example), so it is
// never mistaken for the visitor's own lookup.
function resultTicket(r, costLine, { example = false } = {}) {
  if (!r.fixingDate) {
    otherTicket(r, costLine, { example });
    return;
  }
  const note = r.requestedDate === r.fixingDate ? null : (L === 'en' ? fixingNote(r.requestedDate, r.fixingDate) : t('fixNote', dateLong(r.requestedDate), dateLong(r.fixingDate)));
  show(h('article', { class: example ? 'fx-ticket example' : 'fx-ticket' }, [
    head(t('fixing', r.fixingDate)),
    h('div', { class: 'fx-ticket-body' }, [
      example ? exampleTag(r) : null,
      pairName(r.base, r.quote),
      h('p', { class: 'fx-rate-line' }, t('buys', r.base)),
      h('span', { class: 'fx-rate' }, [fmt(r.rate), ' ', h('small', {}, r.quote)]),
      h('p', { class: 'fx-inverse' }, [t('inverseLead'), r.quote, ' = ', h('b', {}, fmt(r.inverse)), ` ${r.base}`]),
      note ? h('p', { class: 'fx-note' }, [h('span', { class: 'fx-note-tag' }, t('diffDay')), note]) : null,
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('dl', { class: 'fx-facts' }, [
        h('dt', {}, t('asked')), h('dd', {}, dateLong(r.requestedDate)),
        h('dt', {}, t('fixUsed')), h('dd', {}, dateLong(r.fixingDate)),
      ]),
      h('p', { class: 'fx-source' }, t('sourceLine', r.source)),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
  $('fx-board').setAttribute('aria-busy', 'false');
}

// An answer from Treasury, the IRS or HMRC: the publication and period used, and the rate as published.
function otherTicket(r, costLine, { example = false } = {}) {
  const id = idOf(r);
  show(h('article', { class: example ? 'fx-ticket example' : 'fx-ticket' }, [
    head(r.effectiveDate ? t('effective', r.effectiveDate) : t('from', r.periodStart), id),
    h('div', { class: 'fx-ticket-body' }, [
      example ? exampleTag(r) : null,
      pairName(r.base, r.quote),
      h('p', { class: 'fx-rate-line' }, t('buys', r.base)),
      h('span', { class: 'fx-rate' }, [fmt(r.rate), ' ', h('small', {}, r.quote)]),
      h('p', { class: 'fx-inverse' }, [t('inverseLead'), r.quote, ' = ', h('b', {}, fmt(r.inverse)), ` ${r.base}`]),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('dl', { class: 'fx-facts' }, [
        h('dt', {}, t('asked')), h('dd', {}, dateLong(r.requestedDate)),
        h('dt', {}, t('publication')), h('dd', {}, r.publication),
        h('dt', {}, t('covers')), h('dd', {}, span(r.periodStart, r.periodEnd)),
        h('dt', {}, t('asPublished')), h('dd', {}, `${r.publishedRate} ${r.publishedAs}`),
      ]),
      h('p', { class: 'fx-source' }, [t('sourceLead'), h('a', { href: r.sourceUrl, rel: 'noopener' }, r.source), '.']),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
  $('fx-board').setAttribute('aria-busy', 'false');
}

// The source has no rate for this pair and date. The run was free, and the ticket says so.
function noRateTicket(input, message, costLine) {
  const source = input.source || 'ecb';
  show(h('article', { class: 'fx-ticket none' }, [
    head(t('noRate'), source),
    h('div', { class: 'fx-ticket-body' }, [
      pairName(input.base, input.quote),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-none-msg' }, t('noRateMsg', message)),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('p', { class: 'fx-source' }, t('sourceLine', SOURCES[source].name)),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return t('charged', json.charged.display, json.balance.display);
  if (typeof json.freeRunsLeft === 'number') {
    return t('freeLeft', json.freeRunsLeft);
  }
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  const allShown = showFieldErrors(fields);
  if (allShown && Object.keys(fields).length) return;
  const box = $('fx-error');
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, t('signIn')));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, t('openAccount')));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const read = readForm();
  if (read.errors) {
    showFieldErrors(read.errors);
    return;
  }
  const button = $('fx-run');
  button.disabled = true;
  $('fx-board').setAttribute('aria-busy', 'true');
  try {
    const json = await T.run(SLUG, read.input);
    resultTicket(json.result, costNote(json));
  } catch (e) {
    $('fx-board').setAttribute('aria-busy', 'false');
    if (e.code === 'not_available') noRateTicket(read.input, e.message, null);
    else showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- price line and worked example ----------

function showPrice(tool, account) {
  const price = tool.price.display;
  const el = $('fx-price');
  if (account) {
    el.textContent = t('priceAccount', T.money(price));
    $('fx-run-note').textContent = '';
  } else {
    el.textContent = t('priceAnon', T.money(price));
    $('fx-run-note').textContent = t('runNote');
  }
}

// The tool's first example is a real input and the real answer from the ECB file. Showing it
// costs nothing: it comes from the tool listing, not from a run. The form is filled with the
// same input, so pressing the button runs it for real.
function showExample(tool) {
  const ex = (tool.examples || [])[0];
  if (touched) return;
  if (!ex || !ex.output) {
    idleTicket();
    return;
  }
  setPair(ex.input.base, ex.input.quote);
  $('fx-source').value = ex.input.source || 'ecb';
  syncSource();
  $('fx-date').value = ex.input.date;
  resultTicket(ex.output, t('exampleCost'), { example: true });
}

function loadTool() {
  T.api(`/api/v1/tools/${SLUG}`).then((json) => {
    showExample(json.tool);
    T.me().then((account) => showPrice(json.tool, account), () => showPrice(json.tool, null));
  }).catch(() => idleTicket());
}

// ---------- inputs from the address ----------

// A link may carry the inputs (?base=USD&quote=INR&date=2026-10-23, plus &source=treasury): the form opens with them
// filled in, ready to run. The rate itself costs a run, so nothing is run until the visitor asks.
// Anything unusable is ignored and the worked example shows instead.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const base = (q.get('base') || '').toUpperCase();
  const quote = (q.get('quote') || '').toUpperCase();
  const date = (q.get('date') || '').trim();
  const source = (q.get('source') || 'ecb').toLowerCase();
  if (!SOURCE_IDS.includes(source)) return null;
  if (!NAMES[base] || !NAMES[quote] || !isRealDate(date) || (source === 'ecb' && date < FIRST_FIXING)) return null;
  return { base, quote, date, source };
}

// ---------- start ----------

// "Which rate to use" is folded on the English page: a link to it opens it.
function openWhich() {
  const el = document.getElementById('fx-which');
  if (el && el.tagName === 'DETAILS' && location.hash === '#fx-which') el.open = true;
}

function start() {
  openWhich();
  window.addEventListener('hashchange', openWhich);
  fillSelect($('fx-base'), 'USD');
  fillSelect($('fx-quote'), 'EUR');
  // Today in UTC, as plain text. The server decides which fixing applies.
  $('fx-date').value = new Date().toISOString().slice(0, 10);

  const row = $('fx-quick');
  for (const [base, quote] of QUICK) {
    row.appendChild(h('button', {
      type: 'button', class: 'fx-chip', 'data-base': base, 'data-quote': quote, 'aria-pressed': 'false',
      onclick: () => { touch(); setPair(base, quote); },
    }, `${base} → ${quote}`));
  }
  $('fx-swap').addEventListener('click', () => { touch(); setPair($('fx-quote').value, $('fx-base').value); });
  $('fx-form').addEventListener('input', touch);
  $('fx-form').addEventListener('change', touch);
  $('fx-base').addEventListener('change', syncQuick);
  $('fx-quote').addEventListener('change', syncQuick);
  $('fx-source').addEventListener('change', syncSource);
  $('fx-form').addEventListener('submit', (ev) => { touch(); onSubmit(ev); });
  syncQuick();
  syncSource();

  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('fx-code'), SLUG);
  const asked = fromQuery();
  if (asked) {
    touch();
    setPair(asked.base, asked.quote);
    $('fx-source').value = asked.source;
    syncSource();
    $('fx-date').value = asked.date;
    idleTicket(t('askLine', asked.base, asked.quote, dateLong(asked.date)));
    if (T.takeRunFlag()) $('fx-form').requestSubmit();
    T.api(`/api/v1/tools/${SLUG}`).then((json) => {
      T.me().then((account) => showPrice(json.tool, account), () => showPrice(json.tool, null));
    }).catch(() => {});
    return;
  }
  idleTicket(t('loading'));
  loadTool();
}

start();
