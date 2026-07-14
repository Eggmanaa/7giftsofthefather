/* Assessment wizard v2: 3 sections, autosave, official scoring, adaptive tiebreaker */
(function () {
  var Q = window.QUESTIONS, GIFTS = window.GIFTS, ORDER = window.GIFT_ORDER;
  var KEY_A = 'sg7_answers_v1', KEY_R = 'sg7_results_v1';
  var app = document.getElementById('quiz-app');

  var state = load() || { likert: {}, fc: {}, sjt: {}, profile: {} };
  if (!state.profile) state.profile = {};
  var LIKERT_LABELS = ['Not at all like me', 'Rarely like me', 'Sometimes like me', 'Often like me', 'Very much like me'];

  /* ---- paging plan ---- */
  var pages = [];
  for (var i = 0; i < Q.likert.length; i += 7) pages.push({ type: 'likert', items: Q.likert.slice(i, i + 7) });
  for (var j = 0; j < Q.forcedChoice.length; j += 7) pages.push({ type: 'fc', items: Q.forcedChoice.slice(j, j + 7) });
  Q.scenarios.forEach(function (s) { pages.push({ type: 'sjt', items: [s] }); });
  var sectionOf = function (p) { return p.type === 'likert' ? 1 : p.type === 'fc' ? 2 : 3; };

  var page = -1; // -1 = intro

  function load() { try { return JSON.parse(localStorage.getItem(KEY_A)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY_A, JSON.stringify(state)); } catch (e) {} }
  function answeredCount() {
    var n = Object.keys(state.likert).length + Object.keys(state.fc).length;
    Object.keys(state.sjt).forEach(function (k) { var v = state.sjt[k]; if (v && v.most != null && v.least != null) n++; });
    return n;
  }
  var TOTAL = Q.likert.length + Q.forcedChoice.length + Q.scenarios.length;

  /* ---------------- render ---------------- */
  function render() {
    if (page === -1) return renderIntro();
    var p = pages[page];
    var sec = sectionOf(p);
    var pct = Math.round(answeredCount() / TOTAL * 100);
    var secTitles = { 1: 'Section 1 of 3 · Your Core Profile', 2: 'Section 2 of 3 · Your Priorities', 3: 'Section 3 of 3 · Your Gifts in Action' };

    var html = '<div class="progress-rail"><div class="progress-meta"><span>' + secTitles[sec] +
      '</span><span>' + answeredCount() + ' / ' + TOTAL + '</span></div>' +
      '<div class="progress-bar"><i style="width:' + pct + '%"></i></div></div>';

    if (p.type === 'likert') {
      if (p.items[0].id === 1) html += secIntro('Rate how well each statement describes you.', true);
      html += p.items.map(likertBlock).join('');
    } else if (p.type === 'fc') {
      if (p.items[0].id === 50) html += secIntro('In each pair, choose the statement that is <strong>more</strong> like you—even if both apply to some degree.', false);
      html += p.items.map(fcBlock).join('');
    } else {
      if (p.items[0].id === 1) html += secIntro('For each scenario, choose the action you would <strong>most</strong> likely take and the action you would <strong>least</strong> likely take.', false);
      html += p.items.map(sjtBlock).join('');
    }

    html += '<div class="quiz-nav">' +
      '<button class="btn btn-quiet" id="qz-back">' + (page === 0 ? 'Intro' : '← Back') + '</button>' +
      '<button class="btn btn-primary" id="qz-next">' + (page === pages.length - 1 ? 'See My Results' : 'Continue →') + '</button></div>';

    app.innerHTML = html;
    bind(p);
    window.scrollTo(0, 0);
  }

  function secIntro(text, showScale) {
    return '<div class="card sec-intro-card" style="margin-bottom:18px"><p style="margin:0;font-size:1.04rem;color:var(--ink)">' + text + '</p>' +
      (showScale ? '<div class="scale-hint">' + LIKERT_LABELS.map(function (l, i) { return '<div><b>' + (i + 1) + '</b><span>' + l + '</span></div>'; }).join('') + '</div>' : '') + '</div>';
  }

  function likertBlock(q) {
    var sel = state.likert[q.id];
    return '<div class="q-block" data-q="' + q.id + '"><div class="q-num">QUESTION ' + q.id + '</div>' +
      '<div class="q-text">' + q.text + '</div><div class="likert">' +
      [1, 2, 3, 4, 5].map(function (v) {
        return '<button data-l="' + q.id + '" data-v="' + v + '" class="' + (sel === v ? 'sel' : '') + '" aria-pressed="' + (sel === v) + '"><b>' + v + '</b><small>' + LIKERT_LABELS[v - 1] + '</small></button>';
      }).join('') + '</div></div>';
  }

  function fcBlock(q) {
    var sel = state.fc[q.id];
    return '<div class="q-block" data-q="' + q.id + '"><div class="q-num">QUESTION ' + q.id + '</div>' +
      '<div class="q-text">' + q.stem + '</div><div class="ab-grid">' +
      '<button data-fc="' + q.id + '" data-v="a" class="' + (sel === 'a' ? 'sel' : '') + '"><span class="tag">A</span><span>' + q.a + '</span></button>' +
      '<button data-fc="' + q.id + '" data-v="b" class="' + (sel === 'b' ? 'sel' : '') + '"><span class="tag">B</span><span>' + q.b + '</span></button>' +
      '</div></div>';
  }

  function sjtBlock(s) {
    var st = state.sjt[s.id] || {};
    return '<div class="q-block" data-q="s' + s.id + '"><div class="q-num">SCENARIO ' + s.id + ' OF ' + Q.scenarios.length + '</div>' +
      '<div class="q-text">' + s.stem + '</div>' +
      '<p style="font-size:.84rem;color:var(--muted);margin:-8px 0 10px">Mark one action <strong style="color:var(--host)">most</strong> likely and a different one <strong style="color:var(--catalyst)">least</strong> likely.</p>' +
      s.options.map(function (opt, idx) {
        return '<div class="sjt-opt"><div class="txt">' + opt + '</div><div class="sjt-btns">' +
          '<button class="most ' + (st.most === idx ? 'on' : '') + '" data-s="' + s.id + '" data-i="' + idx + '" data-k="most">MOST</button>' +
          '<button class="least ' + (st.least === idx ? 'on' : '') + '" data-s="' + s.id + '" data-i="' + idx + '" data-k="least">LEAST</button>' +
          '</div></div>';
      }).join('') + '</div>';
  }

  /* ---------------- events ---------------- */
  function bind(p) {
    app.querySelectorAll('[data-l]').forEach(function (b) {
      b.onclick = function () {
        state.likert[b.dataset.l] = +b.dataset.v; save();
        var blk = b.closest('.q-block');
        blk.querySelectorAll('[data-l]').forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('sel'); b.setAttribute('aria-pressed', 'true');
        blk.classList.remove('q-missing'); tick();
      };
    });
    app.querySelectorAll('[data-fc]').forEach(function (b) {
      b.onclick = function () {
        state.fc[b.dataset.fc] = b.dataset.v; save();
        var blk = b.closest('.q-block');
        blk.querySelectorAll('[data-fc]').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel'); blk.classList.remove('q-missing'); tick();
      };
    });
    app.querySelectorAll('[data-s]').forEach(function (b) {
      b.onclick = function () {
        var sid = b.dataset.s, idx = +b.dataset.i, k = b.dataset.k;
        var st = state.sjt[sid] = state.sjt[sid] || {};
        var other = k === 'most' ? 'least' : 'most';
        if (st[other] === idx) st[other] = null;
        st[k] = (st[k] === idx) ? null : idx;
        save();
        var blk = b.closest('.q-block'); blk.classList.remove('q-missing');
        blk.querySelectorAll('button.most').forEach(function (x) { x.classList.toggle('on', +x.dataset.i === st.most && st.most != null); });
        blk.querySelectorAll('button.least').forEach(function (x) { x.classList.toggle('on', +x.dataset.i === st.least && st.least != null); });
        tick();
      };
    });
    var back = document.getElementById('qz-back'), next = document.getElementById('qz-next');
    if (back) back.onclick = function () { page--; render(); };
    if (next) next.onclick = function () {
      var missing = validate(p);
      if (missing.length) {
        missing.forEach(function (el) { el.classList.add('q-missing'); });
        missing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (page === pages.length - 1) return finish();
      page++; render();
    };
  }

  function tick() {
    var pct = Math.round(answeredCount() / TOTAL * 100);
    var bar = app.querySelector('.progress-bar i');
    var meta = app.querySelector('.progress-meta span:last-child');
    if (bar) bar.style.width = pct + '%';
    if (meta) meta.textContent = answeredCount() + ' / ' + TOTAL;
  }

  function validate(p) {
    var missing = [];
    p.items.forEach(function (it) {
      if (p.type === 'likert' && !state.likert[it.id]) missing.push(app.querySelector('[data-q="' + it.id + '"]'));
      if (p.type === 'fc' && !state.fc[it.id]) missing.push(app.querySelector('[data-q="' + it.id + '"]'));
      if (p.type === 'sjt') {
        var st = state.sjt[it.id] || {};
        if (st.most == null || st.least == null) missing.push(app.querySelector('[data-q="s' + it.id + '"]'));
      }
    });
    return missing.filter(Boolean);
  }

  /* ---------------- finish + adaptive tiebreaker ---------------- */
  function finish() {
    var res = window.computeScores(state);
    if (res.tieAtCut) return renderDuel(res);
    complete(res);
  }

  function complete(res) {
    res.profile = state.profile || {};
    try { localStorage.setItem(KEY_R, JSON.stringify(res)); } catch (e) {}
    location.href = '/results';
  }

  /* When gifts tie exactly at the rank-3 boundary, ask one direct question
     to decide which belongs in the top three. Scores are not changed. */
  function renderDuel(res) {
    var cutScore = res.scores[res.ranked[2]];
    var tied = res.ranked.filter(function (g) { return res.scores[g] === cutScore; });
    var above = res.ranked.filter(function (g) { return res.scores[g] > cutScore; });
    var slots = 3 - above.length; // how many of the tied gifts make the top 3
    var pickedOrder = [];

    function step() {
      var remaining = tied.filter(function (g) { return pickedOrder.indexOf(g) === -1; });
      if (pickedOrder.length >= slots || remaining.length <= 1) return resolve();
      var opts = remaining.map(function (slug) {
        var g = GIFTS[slug];
        return '<button data-duel="' + slug + '"><b>' + g.coreFramework.drive + '</b>' + g.coreFramework.driveDescription + '</button>';
      }).join('');
      app.innerHTML =
        '<div class="card duel-card">' +
        '<div class="kicker center bare" style="justify-content:center">One More Question</div>' +
        '<h2>Your gifts are neck and neck</h2>' +
        '<p class="hint">Several gifts scored identically at the edge of your top three. Choose the statement that feels <strong>most deeply true</strong> of you.</p>' +
        '<div class="duel-opts">' + opts + '</div></div>';
      app.querySelectorAll('[data-duel]').forEach(function (b) {
        b.onclick = function () { pickedOrder.push(b.dataset.duel); step(); };
      });
      window.scrollTo(0, 0);
    }

    function resolve() {
      var remaining = tied.filter(function (g) { return pickedOrder.indexOf(g) === -1; });
      var orderedTied = pickedOrder.concat(remaining);
      var ranked = above.concat(orderedTied, res.ranked.filter(function (g) { return res.scores[g] < cutScore; }));
      res.ranked = ranked;
      res.top3 = ranked.slice(0, 3);
      var arch = window.ARCHETYPES.find(function (a) {
        return a.gifts.slice().sort().join() === res.top3.slice().sort().join();
      });
      res.archetype = arch ? arch.slug : null;
      res.tieAtCut = false;
      res.tieResolved = true;
      complete(res);
    }

    step();
  }

  /* ---------------- intro ---------------- */
  function renderIntake() {
    var p = state.profile || {};
    function field(id, label, val, type, ph) {
      return '<label class="pf-field"><span>' + label + '</span>' +
        '<input id="' + id + '" type="' + (type || 'text') + '" value="' + (val ? String(val).replace(/"/g, '&quot;') : '') + '" placeholder="' + (ph || '') + '"></label>';
    }
    var opts = ['', 'Single', 'Married', 'Engaged', 'Divorced', 'Widowed', 'Prefer not to say'];
    var msel = opts.map(function (o) { return '<option value="' + o + '"' + ((p.marital || '') === o ? ' selected' : '') + '>' + (o || 'Select…') + '</option>'; }).join('');
    app.innerHTML =
      '<div class="card sec-intro-card rv in">' +
      '<div class="kicker center" style="justify-content:center">A Few Details First</div>' +
      '<h2>Tell Us About Yourself</h2>' +
      '<p style="max-width:560px;margin:0 auto 24px;color:var(--ink-soft)">These personalize your results and appear on the PDF you can save at the end. They stay in your browser and are never sent to a server.</p>' +
      '<div class="intake-form">' +
      field('pf-name', 'Full name', p.name, 'text', 'Your name') +
      field('pf-age', 'Age', p.age, 'number', 'e.g. 34') +
      '<label class="pf-field"><span>Marital status</span><select id="pf-marital">' + msel + '</select></label>' +
      field('pf-title', 'Job title', p.title, 'text', 'e.g. Dean of Students') +
      field('pf-location', 'Job location', p.location, 'text', 'e.g. Santa Barbara, CA') +
      '</div>' +
      '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:30px">' +
      '<button class="btn btn-quiet" id="pf-back">← Back</button>' +
      '<button class="btn btn-primary" id="pf-continue">Continue to Section 1 →</button>' +
      '</div></div>';
    document.getElementById('pf-back').onclick = function () { page = -1; render(); };
    document.getElementById('pf-continue').onclick = function () {
      function v(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
      state.profile = { name: v('pf-name'), age: v('pf-age'), marital: v('pf-marital'), title: v('pf-title'), location: v('pf-location') };
      save();
      page = 0; render();
    };
  }

  function renderIntro() {
    var n = answeredCount();
    var hasProgress = n > 0 && n < TOTAL;
    var hasResults = false;
    try { hasResults = !!localStorage.getItem(KEY_R); } catch (e) {}
    app.innerHTML =
      '<div class="card sec-intro-card rv in">' +
      '<h2>Before You Begin</h2>' +
      '<p style="max-width:600px;margin:0 auto 8px;color:var(--ink-soft)">This assessment provides a comprehensive and nuanced picture of your unique motivational design—a grace-gift from the Father (Romans 12:6–8). By answering questions about your tendencies, priorities, and actions, you will receive an accurate profile of your God-given motivational personality gifts.</p>' +
      '<p style="max-width:600px;margin:0 auto;color:var(--muted)">Answer thoughtfully and honestly. There are no right or wrong answers.</p>' +
      '<div class="facts-row">' +
      '<div><b>' + Q.likert.length + '</b><span>statements</span></div>' +
      '<div><b>' + Q.forcedChoice.length + '</b><span>either / or</span></div>' +
      '<div><b>' + Q.scenarios.length + '</b><span>scenarios</span></div>' +
      '<div><b>~15</b><span>minutes</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:32px">' +
      (hasProgress ? '<button class="btn btn-primary" id="qz-resume">Resume — ' + n + ' of ' + TOTAL + ' answered</button><button class="btn btn-quiet" id="qz-fresh">Start Fresh</button>'
        : '<button class="btn btn-primary" id="qz-start">Begin Section 1</button>') +
      (hasResults ? '<a class="btn btn-quiet" href="/results">View My Last Results</a>' : '') +
      '</div>' +
      '<p style="margin:22px 0 0;font-size:.8rem;color:var(--faint)">Your answers save automatically in this browser—nothing is sent to a server.</p>' +
      '</div>';
    var s = document.getElementById('qz-start'), r = document.getElementById('qz-resume'), f = document.getElementById('qz-fresh');
    if (s) s.onclick = function () { renderIntake(); };
    if (r) r.onclick = function () { page = firstIncomplete(); render(); };
    if (f) f.onclick = function () { state = { likert: {}, fc: {}, sjt: {}, profile: {} }; save(); renderIntake(); };
  }

  function firstIncomplete() {
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i], done = true;
      p.items.forEach(function (it) {
        if (p.type === 'likert' && !state.likert[it.id]) done = false;
        if (p.type === 'fc' && !state.fc[it.id]) done = false;
        if (p.type === 'sjt') { var st = state.sjt[it.id] || {}; if (st.most == null || st.least == null) done = false; }
      });
      if (!done) return i;
    }
    return pages.length - 1;
  }

  render();
})();
