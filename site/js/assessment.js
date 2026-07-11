/* Assessment wizard: 3 sections, autosave, official scoring */
(function () {
  var Q = window.QUESTIONS, GIFTS = window.GIFTS, ORDER = window.GIFT_ORDER;
  var KEY_A = 'sg7_answers_v1', KEY_R = 'sg7_results_v1';
  var app = document.getElementById('quiz-app');

  var state = load() || { likert: {}, fc: {}, sjt: {} };
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
  var TOTAL = 49 + 21 + 4;

  /* ---------------- render ---------------- */
  function render() {
    if (page === -1) return renderIntro();
    var p = pages[page];
    var sec = sectionOf(p);
    var pct = Math.round(answeredCount() / TOTAL * 100);
    var secTitles = { 1: 'Section 1 of 3 · Your Core Profile', 2: 'Section 2 of 3 · Your Priorities', 3: 'Section 3 of 3 · Your Gifts in Action' };

    var html = '<div class="progress-rail"><div class="progress-meta"><span>' + secTitles[sec] +
      '</span><span>' + answeredCount() + ' / ' + TOTAL + ' answered</span></div>' +
      '<div class="progress-bar"><i style="width:' + pct + '%"></i></div></div>';

    if (p.type === 'likert') {
      if (p.items[0].id === 1) html += secIntro('Rate how well each statement describes you.', true);
      html += p.items.map(likertBlock).join('');
    } else if (p.type === 'fc') {
      if (p.items[0].id === 50) html += secIntro('In each pair, choose the statement that is <strong>MORE</strong> like you—even if both apply to some degree.', false);
      html += p.items.map(fcBlock).join('');
    } else {
      if (p.items[0].id === 1) html += secIntro('For each scenario, choose the action you would <strong>MOST</strong> likely take and the action you would <strong>LEAST</strong> likely take.', false);
      html += p.items.map(sjtBlock).join('');
    }

    html += '<div class="quiz-nav">' +
      '<button class="btn btn-outline" id="qz-back">' + (page === 0 ? 'Intro' : '← Back') + '</button>' +
      '<button class="btn btn-gold" id="qz-next">' + (page === pages.length - 1 ? 'See My Results ✦' : 'Continue →') + '</button></div>';

    app.innerHTML = html;
    bind(p);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function secIntro(text, showScale) {
    return '<div class="card sec-intro-card" style="margin-bottom:20px"><p style="margin:0;font-size:1.02rem">' + text + '</p>' +
      (showScale ? '<div class="scale-hint">' + LIKERT_LABELS.map(function (l, i) { return '<span><strong>' + (i + 1) + '</strong> — ' + l + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }

  function likertBlock(q) {
    var sel = state.likert[q.id];
    return '<div class="q-block" data-q="' + q.id + '"><div class="q-num">QUESTION ' + q.id + '</div>' +
      '<div class="q-text">' + q.text + '</div><div class="likert">' +
      [1, 2, 3, 4, 5].map(function (v) {
        return '<button data-l="' + q.id + '" data-v="' + v + '" class="' + (sel === v ? 'sel' : '') + '"><b>' + v + '</b><small>' + LIKERT_LABELS[v - 1] + '</small></button>';
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
    return '<div class="q-block" data-q="s' + s.id + '"><div class="q-num">SCENARIO ' + s.id + ' OF 4</div>' +
      '<div class="q-text">' + s.stem + '</div>' +
      '<p style="font-size:.85rem;color:var(--muted);margin:-6px 0 14px">Mark one action <strong style="color:var(--host-dark)">MOST</strong> likely and a different one <strong style="color:var(--catalyst-dark)">LEAST</strong> likely.</p>' +
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
        blk.querySelectorAll('[data-l]').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel'); blk.classList.remove('q-missing'); tick();
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
        if (st[other] === idx) st[other] = null; // can't be both
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
    if (meta) meta.textContent = answeredCount() + ' / ' + TOTAL + ' answered';
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

  function finish() {
    var res = window.computeScores(state);
    try { localStorage.setItem(KEY_R, JSON.stringify(res)); } catch (e) {}
    location.href = '/results';
  }

  /* ---------------- intro ---------------- */
  function renderIntro() {
    var n = answeredCount();
    var hasProgress = n > 0 && n < TOTAL;
    var hasResults = !!localStorage.getItem(KEY_R);
    app.innerHTML =
      '<div class="card sec-intro-card rv in">' +
      '<h2 style="font-size:1.8rem">Before You Begin</h2>' +
      '<p style="max-width:640px;margin:0 auto 8px">This assessment provides a comprehensive and nuanced picture of your unique motivational design—a grace-gift from the Father (Romans 12:6–8). By answering questions about your tendencies, priorities, and actions, you will receive an accurate profile of your God-given motivational personality gifts.</p>' +
      '<p style="max-width:640px;margin:0 auto;color:var(--muted)">Please answer all questions thoughtfully and honestly to receive the most accurate reflection of your unique design. There are no right or wrong answers.</p>' +
      '<div class="scale-hint"><span><strong>49</strong> rating statements</span><span><strong>21</strong> either/or choices</span><span><strong>4</strong> real-life scenarios</span><span>≈ 10–15 minutes</span></div>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px">' +
      (hasProgress ? '<button class="btn btn-gold" id="qz-resume">Resume (' + n + '/' + TOTAL + ' answered)</button><button class="btn btn-outline" id="qz-fresh">Start Fresh</button>'
        : '<button class="btn btn-gold" id="qz-start">✦ Begin Section 1</button>') +
      (hasResults ? '<a class="btn btn-ink" href="/results">View My Last Results</a>' : '') +
      '</div>' +
      '<p style="margin:18px 0 0;font-size:.83rem;color:var(--muted)">Your answers are saved automatically in this browser—nothing is sent to a server.</p>' +
      '</div>';
    var s = document.getElementById('qz-start'), r = document.getElementById('qz-resume'), f = document.getElementById('qz-fresh');
    if (s) s.onclick = function () { page = 0; render(); };
    if (r) r.onclick = function () { page = firstIncomplete(); render(); };
    if (f) f.onclick = function () { state = { likert: {}, fc: {}, sjt: {} }; save(); page = 0; render(); };
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
