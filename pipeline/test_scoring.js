/* Tests the SHIPPED js/data.js computeScores against the official spec */
const fs = require('fs');
global.window = {};
eval(fs.readFileSync(__dirname + '/site/js/data.js', 'utf8'));
const W = global.window, Q = W.QUESTIONS, ORDER = W.GIFT_ORDER;
let fails = 0;
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); fails++; } };

/* helper to build a state */
function mkState(fn) {
  const s = { likert: {}, fc: {}, sjt: {} };
  Q.likert.forEach(q => s.likert[q.id] = 1);
  Q.forcedChoice.forEach(q => s.fc[q.id] = 'a');
  Q.scenarios.forEach(sc => s.sjt[sc.id] = { most: 0, least: 1 });
  fn && fn(s);
  return s;
}

/* T1: maximal single-gift profile → that gift scores 100, is rank 1 */
for (const g of ORDER) {
  const st = mkState(s => {
    Q.likert.forEach(q => s.likert[q.id] = q.gift === g ? 5 : 1);
    Q.forcedChoice.forEach(q => {
      if (q.giftA === g) s.fc[q.id] = 'a';
      else if (q.giftB === g) s.fc[q.id] = 'b';
      else s.fc[q.id] = 'a';
    });
    Q.scenarios.forEach(sc => {
      const i = sc.gifts.indexOf(g);
      s.sjt[sc.id] = i >= 0 ? { most: i, least: (i + 1) % 4 } : { most: 0, least: 1 };
    });
  });
  const r = W.computeScores(st);
  assert(r.scores[g] === 100, `${g} maximal profile should be 100, got ${r.scores[g]}`);
  assert(r.ranked[0] === g, `${g} should rank #1`);
  assert(r.top3.includes(g), `${g} should be in top3`);
  assert(r.archetype, `archetype resolves for ${g}-max profile`);
}

/* T2: minimal profile → all gifts low; archetype still resolves */
{
  const st = mkState(s => {
    Q.likert.forEach(q => s.likert[q.id] = 1);
  });
  const r = W.computeScores(st);
  ORDER.forEach(g => assert(r.scores[g] >= 0 && r.scores[g] <= 100, `bounds for ${g}`));
  assert(r.archetype, 'archetype resolves for flat profile');
}

/* T3: spec worked example — verify section arithmetic exactly.
   Likert rating r contributes (r-1); FC win = +4; SJT most=+4, least=0, others +1 */
{
  const st = mkState(s => {
    // catalyst: likert = all 3s → 7*2=14 ; fc: wins 3 of 6 ; sjt: most in S1, least in S4
    Q.likert.forEach(q => s.likert[q.id] = q.gift === 'catalyst' ? 3 : 1);
    let wins = 0;
    Q.forcedChoice.forEach(q => {
      if (q.giftA === 'catalyst') { s.fc[q.id] = wins < 3 ? 'a' : 'b'; wins++; }
      else if (q.giftB === 'catalyst') { s.fc[q.id] = 'a'; }
      else s.fc[q.id] = 'a';
    });
    // S1: catalyst idx = gifts.indexOf; set most there. S4: least on catalyst.
    Q.scenarios.forEach(sc => {
      const i = sc.gifts.indexOf('catalyst');
      if (sc.id === 1) s.sjt[sc.id] = { most: i, least: (i + 1) % 4 };
      else if (sc.id === 4) s.sjt[sc.id] = { most: (i + 1) % 4, least: i };
      else s.sjt[sc.id] = { most: 0, least: 1 };
    });
  });
  const r = W.computeScores(st);
  // expected raw catalyst = 14 (likert) + 12 (3 FC wins) + 4 (S1 most) + 0 (S4 least) = 30
  assert(r.raw.catalyst === 30, `spec arithmetic: expected raw 30, got ${r.raw.catalyst}`);
  assert(r.scores.catalyst === Math.round(30 / Q.giftMax.catalyst * 100), 'normalization uses gift max');
}

/* T4: 500 random profiles — bounds, archetype always found, top3 = 3 distinct */
{
  let rnd = 12345;
  const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 500; t++) {
    const st = mkState(s => {
      Q.likert.forEach(q => s.likert[q.id] = 1 + Math.floor(rand() * 5));
      Q.forcedChoice.forEach(q => s.fc[q.id] = rand() < .5 ? 'a' : 'b');
      Q.scenarios.forEach(sc => {
        const m = Math.floor(rand() * 4); let l = Math.floor(rand() * 4);
        if (l === m) l = (m + 1) % 4;
        s.sjt[sc.id] = { most: m, least: l };
      });
    });
    const r = W.computeScores(st);
    ORDER.forEach(g => assert(r.scores[g] >= 0 && r.scores[g] <= 100, `bounds t${t} ${g}=${r.scores[g]}`));
    assert(new Set(r.top3).size === 3, `distinct top3 t${t}`);
    assert(r.archetype, `archetype found t${t} top3=${r.top3}`);
    const arch = W.ARCHETYPES.find(a => a.slug === r.archetype);
    assert(arch.gifts.slice().sort().join() === r.top3.slice().sort().join(), `archetype matches top3 t${t}`);
  }
}

/* T5: every one of the 35 combos is reachable and resolves to a unique archetype */
{
  const combos = new Set();
  const list = W.ARCHETYPES.map(a => a.gifts.slice().sort().join());
  list.forEach(c => combos.add(c));
  assert(combos.size === 35, `35 unique combos, got ${combos.size}`);
  assert(W.ARCHETYPES.length === 35, '35 archetypes present');
  assert(W.ARCHETYPES.every(a => a.paragraphs.length >= 3), 'every archetype has full description (3+ paragraphs)');
}

console.log(fails === 0 ? 'ALL SCORING TESTS PASSED ✔ (7 max-profiles, flat, spec arithmetic, 500 random, 35 combos)' : fails + ' FAILURES');
process.exit(fails ? 1 : 0);
