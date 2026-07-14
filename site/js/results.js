/* Results v2: bar chart, archetype reveal, top-3 deep dives — light editorial */
(function () {
  var app = document.getElementById('results-app');
  var GIFTS = window.GIFTS, INT = window.INTENSITY;
  var res = null;
  try { res = JSON.parse(localStorage.getItem('sg7_results_v1')); } catch (e) {}

  if (!res || !res.scores) {
    app.innerHTML = '<section class="empty-state"><div class="wrap narrow">' +
      '<h2>No results yet</h2><p style="color:var(--muted)">Take the assessment to reveal your intensity profile, your top three gifts, and your archetype of the soul.</p>' +
      '<a class="btn btn-primary" href="/assessment">Take the Assessment</a></div></section>';
    return;
  }

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var rn = ['I', 'II', 'III'];
  var arch = window.ARCHETYPES.find(function (a) { return a.slug === res.archetype; });
  var dateStr = new Date(res.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  var BAR = { catalyst: 'var(--catalyst-bar)', servant: 'var(--servant-bar)', erudite: 'var(--erudite-bar)', enthusiast: 'var(--enthusiast-bar)', host: 'var(--host-bar)', strategist: 'var(--strategist-bar)', lover: 'var(--lover-bar)' };
  var INKC = { catalyst: 'var(--catalyst)', servant: 'var(--servant)', erudite: 'var(--erudite)', enthusiast: 'var(--enthusiast)', host: 'var(--host)', strategist: 'var(--strategist)', lover: 'var(--lover)' };

  /* ---- bar chart ---- */
  var bars = res.ranked.map(function (slug, i) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc);
    return '<div class="bar-row">' +
      '<div class="b-name"><b>' + (i < 3 ? '<span class="rank-n">' + rn[i] + '</span>' : '') + esc(g.name) + '</b><small>' + esc(g.subtitle) + '</small></div>' +
      '<div class="bar-track"><div class="bar-fill" data-w="' + sc + '" style="background:linear-gradient(90deg,' + INKC[slug] + ',' + BAR[slug] + ')"></div></div>' +
      '<div class="b-val"><b class="count" data-n="' + sc + '">0</b><span class="intensity ' + band.cls + '">' + band.label + '</span></div>' +
      '</div>';
  }).join('');

  /* ---- archetype ---- */
  var archHtml = '';
  if (arch) {
    archHtml = '<section class="section" style="padding-top:64px"><div class="wrap narrow">' +
      '<div class="arch-reveal rv">' +
      '<div class="arch-medal lg"><img src="/images/archetypes/' + arch.slug + '.webp" alt="' + esc(arch.name) + ' emblem" width="150" height="150"></div>' +
      '<div class="kicker">Your Archetype of the Soul · No. ' + arch.num + ' of 35</div>' +
      '<h2>' + esc(arch.name) + '</h2>' +
      '<p class="essence">“' + esc(arch.essence) + '”</p>' +
      '<div class="combo">' + arch.gifts.map(function (s) {
        return '<a class="g-tag ' + s + '" href="/gifts/' + s + '">' + esc(GIFTS[s].name.replace('The ', '')) + '</a>';
      }).join('') + '</div>' +
      '<p class="lead-prose big" style="max-width:740px;margin:0 auto">' + esc(arch.websiteSummary || arch.essence) + '</p>' +
      '<div class="grid g2" style="max-width:820px;margin:24px auto 0;text-align:left">' +
        '<div class="card"><div class="fw-k">Signature Strength</div><p class="canon-name">' + esc(arch.sigStrengthName) + '</p><p>' + esc(arch.sigStrengthDesc) + '</p></div>' +
        '<div class="card"><div class="fw-k">Signature Paradox</div><p>' + esc(arch.sigParadox) + '</p></div></div>' +
      ((arch.formationPractices && arch.formationPractices.length) ? '<div class="growth-callout" style="max-width:820px;margin:16px auto 0;text-align:left"><div class="fw-k">Formation Practices</div><ul class="canon-list">' + arch.formationPractices.slice(0, 5).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<p style="text-align:center;margin:22px 0 0" class="no-print"><a class="link-arrow" href="/archetypes/' + arch.slug + '">View the full archetype page <span class="ar">→</span></a></p>' +
      '</div></div></section>';
  }

  /* ---- top-3 deep dives ---- */
  function giftPanel(slug, i) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc);
    var ink = INKC[slug], bar = BAR[slug];
    var verses = g.foundationalVerses.map(function (v) {
      var m = String(v).match(/^([^-–]+?)\s*[-–]\s*(.*)$/);
      return m ? '<p>' + esc(m[2]) + ' <strong>— ' + esc(m[1].trim()).toUpperCase() + '</strong></p>' : '<p>' + esc(v) + '</p>';
    }).join('');
    return '<div class="tab-panel" data-p="' + slug + '" style="' + (i ? 'display:none' : '') + '--g:' + bar + ';--g-dark:' + ink + '">' +
      '<div class="card" style="padding:44px">' +

      '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin-bottom:10px">' +
      '<img src="/images/' + slug + '.webp" alt="" style="width:100px;height:100px;border-radius:18px">' +
      '<div><div style="font-size:.69rem;letter-spacing:.26em;text-transform:uppercase;font-weight:700;color:' + ink + '">Gift ' + rn[i] + ' · Score ' + sc + ' · <span class="intensity ' + band.cls + '">' + band.label + '</span></div>' +
      '<h3 style="font-size:2.2rem;margin:4px 0 0">' + esc(g.name) + '</h3>' +
      '<div style="font-family:var(--serif);font-style:italic;color:' + ink + ';font-size:1.2rem">' + esc(g.subtitle) + '</div></div></div>' +

      '<p class="words-inline">' + g.descriptiveWords.map(esc).join('<span class="sep">·</span>') + '</p>' +

      '<div class="res-h">Deep Description</div>' +
      '<p style="font-size:1.05rem;line-height:1.8;color:var(--ink-soft)">' + esc(g.profileSummary) + '</p>' +
      '<p style="color:var(--muted)"><em>Your core metaphor is <strong style="color:var(--ink)">' + esc(g.metaphor.title) + '</strong>.</em> ' + esc(g.metaphor.description) + '</p>' +

      '<div class="res-h">Your Core Motivational Framework</div>' +
      '<div class="grid g3 framework-grid">' +
      '<div class="card"><div class="fw-k">Core Question</div><div class="fw-q">“' + esc(g.coreFramework.question) + '”</div><p>' + esc(g.coreFramework.questionDescription) + '</p></div>' +
      '<div class="card"><div class="fw-k">Core Energizer</div><div class="fw-q">' + esc(g.coreFramework.energizer) + '</div><p>' + esc(g.coreFramework.energizerDescription) + '</p></div>' +
      '<div class="card"><div class="fw-k">Core Drive</div><div class="fw-q">' + esc(g.coreFramework.drive) + '</div><p>' + esc(g.coreFramework.driveDescription) + '</p></div></div>' +

      '<div class="res-h">Your God-Given Strengths</div>' +
      '<div class="s-list">' + g.strengths.map(function (s) {
        return '<div class="s-item"><span class="dot"></span><div><h4>' + esc(s.title) + '</h4><p>' + esc(s.description) + '</p></div></div>';
      }).join('') + '</div>' +

      '<div class="res-h">Your Leadership Style: ' + esc(g.leadershipStyle.title) + '</div>' +
      '<p style="color:var(--ink-soft)">' + esc(g.leadershipStyle.description) + '</p>' +
      '<p class="traits-inline">' + g.leadershipStyle.characteristics.map(esc).join('<span class="sep">·</span>') + '</p>' +

      '<div class="res-h">A Practical Guide to Growth: Potential Challenges</div>' +
      '<div class="s-list">' + g.challenges.map(function (c) {
        return '<div class="s-item"><span class="dot" style="background:var(--strategist-bar)"></span><div><h4>' + esc(c.title) + '</h4><p>' + esc(c.description) + '</p></div></div>';
      }).join('') + '</div>' +

      '<div class="res-h">How Others Can Love You Well</div>' +
      '<ul class="interact-list">' + g.interactions.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +

      '<div class="res-h">Foundational Verses</div>' +
      '<div class="verse-card">' + verses + '</div>' +

      '<p style="margin:30px 0 0" class="no-print"><a class="link-arrow" href="/gifts/' + slug + '">Explore the full ' + esc(g.name) + ' page <span class="ar">→</span></a></p>' +
      '</div></div>';
  }

  var tabs = res.top3.map(function (slug, i) {
    var g = GIFTS[slug];
    return '<button data-t="' + slug + '" class="' + (i === 0 ? 'on' : '') + '">' +
      '<img src="/images/' + slug + '-thumb.webp" alt=""><span class="rk">' + rn[i] + '</span>' + esc(g.name) + '</button>';
  }).join('');
  var panels = res.top3.map(giftPanel).join('');

  function lowPanel(slug) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc), lg = window.LOW_GIFTS[slug];
    if (!lg) return '';
    var ink = INKC[slug];
    return '<div class="card low-card rv" style="--g:' + BAR[slug] + ';--g-dark:' + ink + '">' +
      '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:6px">' +
      '<img src="/images/' + slug + '-thumb.webp" alt="" style="width:64px;height:64px;border-radius:12px">' +
      '<div><div style="font-size:.67rem;letter-spacing:.24em;text-transform:uppercase;font-weight:700;color:' + ink + '">Score ' + sc + ' · <span class="intensity ' + band.cls + '">' + band.label + '</span></div>' +
      '<h3 style="font-size:1.6rem;margin:2px 0 0">' + esc(g.name) + '</h3>' +
      '<div style="font-family:var(--serif);font-style:italic;color:' + ink + ';font-size:1.05rem">' + esc(g.subtitle) + '</div></div></div>' +
      '<div class="res-h">Where Life May Feel Harder</div>' +
      '<p style="color:var(--ink-soft)">' + esc(lg.struggle) + '</p>' +
      '<div class="res-h">Relating to ' + esc(g.name) + 's</div>' +
      '<p style="color:var(--ink-soft)">' + esc(lg.friction) + '</p>' +
      '<div class="res-h">Building the Bridge</div>' +
      '<ul class="interact-list">' + lg.bridges.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<p style="margin:22px 0 0" class="no-print"><a class="link-arrow" href="/gifts/' + slug + '">Learn the language of ' + esc(g.name) + ' <span class="ar">→</span></a></p>' +
      '</div>';
  }
  var bottom2 = res.ranked.slice(-2).reverse();
  var quieterHtml = '<section class="section"><div class="wrap narrow">' +
    '<div class="section-head rv"><div class="kicker center">Your Quieter Gifts</div><h2>Where Grace Must Be Borrowed</h2>' +
    '<p>Your two lowest gifts are not flaws—they are the places where you were designed to need other people. Knowing them prevents your blind spots from becoming wounds, and turns the people who carry these gifts from irritations into allies.</p></div>' +
    '<div class="grid" style="gap:26px">' + bottom2.map(lowPanel).join('') + '</div>' +
    '</div></section>';

  var tieNote = res.tieResolved ? '<p style="text-align:center;color:var(--muted);font-size:.87rem;max-width:600px;margin:16px auto 0">Two or more gifts tied at the edge of your top three; your tiebreaker answer decided the blend. If the alternate combination resonates more, explore it in the <a href="/archetypes/">archetype library</a>.</p>' : '';

  var pf = res.profile || {};
  var pfMeta = [];
  if (pf.age) pfMeta.push('Age ' + esc(String(pf.age)));
  if (pf.marital) pfMeta.push(esc(pf.marital));
  if (pf.title) pfMeta.push(esc(pf.title));
  if (pf.location) pfMeta.push(esc(pf.location));
  var profileHtml = (pf.name || pfMeta.length) ?
    '<div class="res-profile rv">' +
    (pf.name ? '<div class="res-profile-name">' + esc(pf.name) + '</div>' : '') +
    (pfMeta.length ? '<div class="res-profile-meta">' + pfMeta.join('  ·  ') + '</div>' : '') +
    '</div>' : '';
  var topActions = '<div class="res-actions res-actions-top no-print">' +
    '<button class="btn btn-primary" onclick="window.print()">⤓ Save as PDF</button>' +
    '<a class="btn btn-quiet" href="/assessment">Retake</a></div>';
  app.innerHTML =
    '<section class="section res-top" style="padding-bottom:8px"><div class="wrap narrow">' + profileHtml + topActions + '</div></section>' +
    '<section class="section" style="padding-bottom:24px"><div class="wrap narrow">' +
    '<div class="section-head rv" style="margin-bottom:30px"><div class="kicker center">Completed ' + esc(dateStr) + '</div>' +
    '<h2>Your Intensity Profile</h2>' +
    '<p>You possess a unique blend of all seven gifts—like a sound equalizer with seven sliders set at different levels. Here is your motivational fingerprint, scored 0–100.</p></div>' +
    '<div class="chart-card rv">' + bars + '</div>' + tieNote +
    '</div></section>' +
    archHtml +
    '<section class="section alt"><div class="wrap">' +
    '<div class="section-head rv"><div class="kicker center">Your Top Three</div><h2>Deep Dive into Your Leading Gifts</h2>' +
    '<p>These three gifts carry the highest intensity in your profile. Together they form your archetype; individually, each deserves deep exploration.</p></div>' +
    '<div class="top3-tabs no-print">' + tabs + '</div>' + panels +
    '</div></section>' +
    quieterHtml +
    '<section class="section" style="padding:56px 0"><div class="res-actions no-print">' +
    '<a class="btn btn-quiet" href="/assessment">Retake the Assessment</a>' +
    '<a class="btn btn-quiet" href="/archetypes/">Browse All 35 Archetypes</a>' +
    '</div></section>';

  /* tab switching */
  app.querySelectorAll('.top3-tabs button').forEach(function (b) {
    b.onclick = function () {
      app.querySelectorAll('.top3-tabs button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      app.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = p.dataset.p === b.dataset.t ? '' : 'none'; });
    };
  });

  /* animate: reveal, bars, count-up */
  requestAnimationFrame(function () {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    setTimeout(function () {
      app.querySelectorAll('.bar-fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; });
      app.querySelectorAll('.count').forEach(function (el) {
        var target = +el.dataset.n, t0 = null;
        function stepFn(t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1100, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(stepFn);
        }
        requestAnimationFrame(stepFn);
      });
    }, 180);
  });
})();
