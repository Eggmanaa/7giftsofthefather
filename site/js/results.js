/* Results: bar chart, archetype reveal, top-3 deep dives */
(function () {
  var app = document.getElementById('results-app');
  var GIFTS = window.GIFTS, ORDER = window.GIFT_ORDER, INT = window.INTENSITY;
  var res = null;
  try { res = JSON.parse(localStorage.getItem('sg7_results_v1')); } catch (e) {}

  if (!res || !res.scores) {
    app.innerHTML = '<section class="empty-state"><div class="wrap narrow">' +
      '<h2>No results yet</h2><p style="color:var(--muted)">Take the assessment to reveal your intensity profile, your top three gifts, and your archetype of the soul.</p>' +
      '<a class="btn btn-gold" href="/assessment">✦ Take the Assessment</a></div></section>';
    return;
  }

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var medals = ['🥇', '🥈', '🥉'];
  var arch = window.ARCHETYPES.find(function (a) { return a.slug === res.archetype; });
  var dateStr = new Date(res.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  /* ---- bar chart ---- */
  var bars = res.ranked.map(function (slug, i) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc);
    return '<div class="bar-row">' +
      '<div class="b-name">' + (i < 3 ? '<span class="rank-medal">' + medals[i] + '</span>' : '') +
      '<b>' + esc(g.name) + '</b><small>' + esc(g.subtitle) + '</small></div>' +
      '<div class="bar-track"><div class="bar-fill" data-w="' + sc + '" style="background:linear-gradient(90deg,' + g.dark + ',' + g.color + ')"></div></div>' +
      '<div class="b-val"><b>' + sc + '</b><span class="intensity ' + band.cls + '">' + band.label + '</span></div>' +
      '</div>';
  }).join('');

  /* ---- archetype ---- */
  var archHtml = '';
  if (arch) {
    archHtml = '<section class="section" style="padding-top:56px"><div class="wrap narrow">' +
      '<div class="arch-reveal rv">' +
      '<div class="kicker">Your Archetype of the Soul · No. ' + arch.num + ' of 35</div>' +
      '<h2>' + esc(arch.name) + '</h2>' +
      '<p class="essence">“' + esc(arch.essence) + '”</p>' +
      '<div class="combo">' + arch.gifts.map(function (s) {
        return '<a class="g-chip ' + s + '" href="/gifts/' + s + '">' + esc(GIFTS[s].name.replace('The ', '')) + '</a>';
      }).join('') + '</div>' +
      '<div class="prose">' + arch.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<p style="text-align:center;margin:18px 0 0"><a class="btn btn-ink no-print" href="/archetypes/' + arch.slug + '">View the Full Archetype Page →</a></p>' +
      '</div></div></section>';
  }

  /* ---- top-3 deep dives ---- */
  function giftPanel(slug, i) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc);
    var verses = g.foundationalVerses.map(function (v) { return '<p>' + esc(v) + '</p>'; }).join('');
    return '<div class="tab-panel" data-p="' + slug + '" style="' + (i ? 'display:none' : '') + '">' +
      '<div class="card" style="border-top:5px solid ' + g.color + ';padding:36px">' +
      '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:18px">' +
      '<img src="images/' + slug + '.webp" alt="" style="width:104px;height:104px;border-radius:16px;box-shadow:var(--shadow-sm)">' +
      '<div><div class="g-label" style="color:' + g.dark + '">' + medals[i] + ' Gift No. ' + (i + 1) + ' · Score ' + sc + ' · ' + band.label + '</div>' +
      '<h3 style="font-size:2rem;margin:0">' + esc(g.name) + '</h3>' +
      '<div style="font-family:var(--serif);font-style:italic;color:' + g.dark + ';font-size:1.15rem">' + esc(g.subtitle) + '</div></div></div>' +

      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">' + g.descriptiveWords.map(function (w) {
        return '<span style="border:1px solid var(--rule);border-radius:99px;padding:5px 14px;font-size:.82rem;color:var(--muted)">' + esc(w) + '</span>';
      }).join('') + '</div>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + '">Deep Description</h4>' +
      '<p style="font-size:1.05rem;line-height:1.75">' + esc(g.profileSummary) + '</p>' +
      '<p style="color:var(--muted)"><em>Your core metaphor is <strong>' + esc(g.metaphor.title) + '</strong>.</em> ' + esc(g.metaphor.description) + '</p>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">Your Core Motivational Framework</h4>' +
      '<div class="grid g3 framework-grid" style="--g:' + g.color + ';--g-dark:' + g.dark + '">' +
      '<div class="card"><div class="fw-k">Core Question</div><div class="fw-q">“' + esc(g.coreFramework.question) + '”</div><p>' + esc(g.coreFramework.questionDescription) + '</p></div>' +
      '<div class="card"><div class="fw-k">Core Energizer</div><div class="fw-q">' + esc(g.coreFramework.energizer) + '</div><p>' + esc(g.coreFramework.energizerDescription) + '</p></div>' +
      '<div class="card"><div class="fw-k">Core Drive</div><div class="fw-q">' + esc(g.coreFramework.drive) + '</div><p>' + esc(g.coreFramework.driveDescription) + '</p></div></div>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">Your God-Given Strengths</h4>' +
      '<div class="grid g2" style="--g:' + g.color + '">' + g.strengths.map(function (s) {
        return '<div class="s-item"><span class="dot" style="background:' + g.color + '"></span><div><h4 style="font-family:var(--sans);font-size:1rem;margin:0 0 4px">' + esc(s.title) + '</h4><p style="color:var(--muted);font-size:.94rem;margin:0">' + esc(s.description) + '</p></div></div>';
      }).join('') + '</div>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">Your Leadership Style: ' + esc(g.leadershipStyle.title) + '</h4>' +
      '<p>' + esc(g.leadershipStyle.description) + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + g.leadershipStyle.characteristics.map(function (c) {
        return '<span style="background:' + g.tint + ';color:' + g.dark + ';border-radius:99px;padding:6px 15px;font-size:.84rem;font-weight:600">' + esc(c) + '</span>';
      }).join('') + '</div>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">A Practical Guide to Growth: Potential Challenges</h4>' +
      '<div class="grid g2">' + g.challenges.map(function (c) {
        return '<div class="s-item"><span class="dot" style="background:var(--strategist)"></span><div><h4 style="font-family:var(--sans);font-size:1rem;margin:0 0 4px">' + esc(c.title) + '</h4><p style="color:var(--muted);font-size:.94rem;margin:0">' + esc(c.description) + '</p></div></div>';
      }).join('') + '</div>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">How Others Can Love You Well</h4>' +
      '<ul class="interact-list" style="--g:' + g.color + '">' + g.interactions.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +

      '<h4 style="font-family:var(--sans);font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:' + g.dark + ';margin-top:26px">Foundational Verses</h4>' +
      '<div class="verse-card">' + verses + '</div>' +

      '<p style="margin:26px 0 0" class="no-print"><a class="btn btn-outline" href="/gifts/' + slug + '">Explore the full ' + esc(g.name) + ' page →</a></p>' +
      '</div></div>';
  }

  var tabs = res.top3.map(function (slug, i) {
    var g = GIFTS[slug];
    return '<button data-t="' + slug + '" class="' + (i === 0 ? 'on' : '') + '" style="--tab-c:' + g.color + '">' +
      '<span class="medal">' + medals[i] + '</span><img src="images/' + slug + '-thumb.webp" alt="">' + esc(g.name) + '</button>';
  }).join('');
  var panels = res.top3.map(giftPanel).join('');

  var tieNote = res.tieAtCut ? '<p style="text-align:center;color:var(--muted);font-size:.88rem;max-width:640px;margin:14px auto 0">Note: your third and fourth gifts scored identically. Your archetype uses the tie-break shown above—if the alternate blend resonates more, explore it in the <a href="/archetypes/index">archetype library</a>.</p>' : '';

  app.innerHTML =
    '<section class="section" style="padding-bottom:20px"><div class="wrap narrow">' +
    '<div class="section-head rv" style="margin-bottom:26px"><div class="kicker">Completed ' + esc(dateStr) + '</div>' +
    '<h2>Your Intensity Profile</h2>' +
    '<p>You possess a unique blend of all seven gifts—like a sound equalizer with seven sliders set at different levels. Here is your motivational fingerprint, scored 0–100.</p></div>' +
    '<div class="chart-card rv">' + bars + '</div>' + tieNote +
    '</div></section>' +
    archHtml +
    '<section class="section alt"><div class="wrap">' +
    '<div class="section-head rv"><div class="kicker">Your Top Three</div><h2>Deep Dive into Your Leading Gifts</h2>' +
    '<p>These three gifts carry the highest intensity in your profile. Together they form your archetype; individually, each deserves deep exploration.</p></div>' +
    '<div class="top3-tabs no-print">' + tabs + '</div>' + panels +
    '</div></section>' +
    '<section class="section"><div class="res-actions no-print">' +
    '<button class="btn btn-ink" onclick="window.print()">🖨️ Print / Save as PDF</button>' +
    '<a class="btn btn-outline" href="/assessment">Retake the Assessment</a>' +
    '<a class="btn btn-outline" href="/archetypes/index">Browse All 35 Archetypes</a>' +
    '</div></section>';

  /* tab switching */
  app.querySelectorAll('.top3-tabs button').forEach(function (b) {
    b.onclick = function () {
      app.querySelectorAll('.top3-tabs button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      app.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = p.dataset.p === b.dataset.t ? '' : 'none'; });
    };
  });

  /* animate bars + reveal */
  requestAnimationFrame(function () {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    setTimeout(function () {
      app.querySelectorAll('.bar-fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; });
    }, 150);
  });
})();
