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

  /* ---- under pressure ---- */
  var STAGE_TINT = { Strain: 'var(--servant-bar)', Distortion: 'var(--enthusiast-bar)', Captivity: 'var(--catalyst)' };

  function descentHtml(p, compact) {
    return p.descent.map(function (d, i) {
      return '<div class="descent" style="--stage:' + STAGE_TINT[d.stage] + '">' +
        '<div class="descent-rail"><span class="descent-num">' + (i + 1) + '</span></div>' +
        '<div class="descent-body">' +
        '<div class="descent-head"><span class="descent-stage">' + esc(d.stage) + '</span>' +
        '<span class="descent-verb">' + esc(d.verb) + '</span></div>' +
        '<p class="descent-tell">' + esc(d.tell) + '</p>' +
        '<p>' + esc(d.body) + '</p>' +
        (compact ? '' : '<p class="descent-cost"><span>What it costs</span> ' + esc(d.cost) + '</p>') +
        '</div></div>';
    }).join('');
  }

  function pressureBlock(slug) {
    var g = GIFTS[slug], p = g.pressure;
    if (!p) return '';
    return '<div class="res-h">Your Gift Under Pressure</div>' +
      '<div class="flare-strip" style="margin-bottom:30px">' +
      '<div class="flare-k">Your Flare Signature</div>' +
      '<div class="flare-verbs">' + p.flare.map(function (v) { return '<span>' + esc(v) + '</span>'; }).join('<i class="ar">→</i>') + '</div>' +
      '<p class="flare-trigger"><span>What sets it off</span> ' + esc(p.trigger) + '</p></div>' +
      '<div class="descent-list">' + descentHtml(p, false) + '</div>' +
      '<div class="chronic" style="margin-top:32px"><div class="g-label">If It Settles In</div>' +
      '<h3>' + esc(p.chronic.name) + '</h3><p>' + esc(p.chronic.body) + '</p></div>' +

      '<div class="res-h">Your Way Back</div>' +
      '<div class="grid g2 reentry-grid">' +
      '<div class="card say-yes"><div class="fw-k">What Others Should Say</div>' +
      '<blockquote class="say-line">“' + esc(p.sayThis) + '”</blockquote>' +
      '<p class="say-need"><span>What you actually need</span> ' + esc(p.needs) + '</p></div>' +
      '<div class="card say-no"><div class="fw-k">What Makes It Worse</div>' +
      '<blockquote class="say-line">“' + esc(p.notThis) + '”</blockquote>' +
      '<p class="say-need"><span>Why it escalates</span> ' + esc(p.notThisWhy) + '</p></div>' +
      '</div>' +
      '<div class="grid g2 reentry-grid" style="margin-top:0">' +
      '<div class="card"><div class="fw-k">Your Own Move Back</div><p>' + esc(p.ownMove) + '</p></div>' +
      '<div class="card restored"><div class="fw-k">What Returns</div>' +
      '<div class="fw-q">' + esc(p.restored) + '</div><p>' + esc(p.restoredBody) + '</p></div>' +
      '</div>';
  }

  /* ---- top-3 deep dives ---- */
  function giftPanel(slug, i) {
    var g = GIFTS[slug], sc = res.scores[slug], band = INT(sc);
    var ink = INKC[slug], bar = BAR[slug];
    var verses = g.foundationalVerses.map(function (v) {
      var m = String(v).match(/^([^-–]+?)\s*[-–]\s*(.*)$/);
      return m ? '<p>' + esc(m[2]) + ' <strong>— ' + esc(m[1].trim()).toUpperCase() + '</strong></p>' : '<p>' + esc(v) + '</p>';
    }).join('');
    return '<div class="tab-panel" data-p="' + slug + '" style="' + (i ? 'display:none;' : '') + '--g:' + bar + ';--g-dark:' + ink + '">' +
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

      pressureBlock(slug) +

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
  /* ---- your archetype under pressure: three parallel descents ---- */
  function archCascade() {
    if (!arch || !arch.pressure) return '';
    var e = arch.pressure, PM = window.PRESSURE_MODEL, AM = window.ARCH_PRESSURE_MODEL;
    var pat = (window.ARCH_PATTERNS || {})[e.pattern];

    var stages = PM.stages.map(function (stage, i) {
      var chips = arch.gifts.map(function (sl) {
        var g = GIFTS[sl];
        return '<a class="flare-chip ' + sl + '" href="/gifts/' + sl + '">' +
          '<span class="fc-gift">' + esc(g.name.replace(/^The /, '')) + '</span>' +
          '<span class="fc-verb">' + esc(g.pressure.flare[i]) + '</span></a>';
      }).join('');
      return '<div class="pstage" style="--stage:' + STAGE_TINT[stage.name] + '">' +
        '<div class="pstage-head"><span class="pstage-n">' + (i + 1) + '</span>' +
        '<div><div class="pstage-name">' + esc(stage.name) + '</div>' +
        '<div class="pstage-line">' + esc(stage.line) + '</div></div></div>' +
        '<div class="flare-row">' + chips + '</div>' +
        '<p class="pstage-text">' + esc(e.stages[i].text) + '</p></div>';
    }).join('');

    var mg = e.missing.gift, mgG = GIFTS[mg];
    var quiet = window.GIFT_ORDER.filter(function (s) { return arch.gifts.indexOf(s) === -1; });
    var chips = quiet.map(function (s) {
      return '<a class="g-tag ' + s + (s === mg ? ' primary' : '') + '" href="/gifts/' + s + '">' + esc(GIFTS[s].name.replace(/^The /, '')) + '</a>';
    }).join('');

    var syncHtml = pat ? (
      '<div class="section-head rv" style="margin-top:72px"><div class="kicker center">How Your Three Synchronise</div>' +
      '<h2>' + esc(pat.name) + '</h2><p>' + esc(AM.patternPremise) + '</p></div>' +
      '<div class="sync-card rv"><div class="sync-mix">' + esc(pat.mix) + '</div>' +
      '<p>' + esc(pat.body) + '</p><div class="sync-grid">' +
      '<div><span class="pg-k">From the outside</span><p>' + esc(pat.visibility) + '</p></div>' +
      '<div><span class="pg-k">How to catch it</span><p>' + esc(pat.catch) + '</p></div>' +
      '</div></div>') : '';

    return '<section class="section pressure-band arch-pressure"><div class="wrap">' +
      '<div class="section-head rv"><div class="kicker center">Your Archetype Under Pressure</div>' +
      '<h2>' + esc(e.name) + '</h2>' +
      '<p class="arch-pressure-line">' + esc(e.line) + '</p></div>' +
      '<div class="wrap narrow rv" style="padding:0"><p class="lead-prose">' + esc(AM.premise) + '</p></div>' +
      '<div class="pstage-list">' + stages + '</div>' +
      '<div class="tell-card rv"><div class="pg-k">Your earliest tell</div><p>' + esc(e.tell) + '</p></div>' +
      '<p class="cascade-note rv">' + esc(AM.note) + '</p>' +
      syncHtml +
      '<div class="section-head rv" style="margin-top:72px"><div class="kicker center">Your Missing Brake</div>' +
      '<h2>What Would Have Caught It</h2><p>' + esc(AM.missingPremise) + '</p></div>' +
      '<div class="missing-card rv" style="--g:' + BAR[mg] + '">' +
      '<div class="missing-head"><img src="/images/' + mg + '-thumb.webp" alt="" width="52" height="52">' +
      '<div><div class="pg-k">Primary missing check</div><h3>' + esc(mgG.name) + '</h3></div></div>' +
      '<p>' + esc(e.missing.text) + '</p>' +
      '<p class="missing-restored"><span>What it brings back</span> ' + esc(mgG.pressure.restored) + ' — ' + esc(mgG.pressure.restoredBody) + '</p>' +
      '<div class="missing-quiet"><span class="pg-k">All four quiet gifts</span><div class="combo">' + chips + '</div></div>' +
      '</div></div></section>';
  }

  /* ---- the collisions you carry: pair conflicts INSIDE your own top three ---- */
  function internalCollisions() {
    var pairs = window.PAIR_COLLISIONS || [], t3 = res.top3, out = [];
    pairs.forEach(function (p) {
      if (t3.indexOf(p.a) > -1 && t3.indexOf(p.b) > -1) out.push(p);
    });
    if (!out.length) return '';
    var cards = out.map(function (p) {
      var ga = GIFTS[p.a], gb = GIFTS[p.b];
      return '<article class="pair" style="--ga:' + BAR[p.a] + ';--gb:' + BAR[p.b] + '">' +
        '<div class="pair-top"><span class="g-tag ' + p.a + '">' + esc(ga.name.replace(/^The /, '')) + '</span>' +
        '<i class="pair-x">×</i><span class="g-tag ' + p.b + '">' + esc(gb.name.replace(/^The /, '')) + '</span></div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<div class="pair-sec"><span class="pg-k">The loop</span><p>' + esc(p.loop) + '</p></div>' +
        '<div class="pair-break"><span class="pg-k">What breaks the loop</span><p>' + esc(p.breaker) + '</p></div>' +
        '</article>';
    }).join('');
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head rv"><div class="kicker center">Inside Your Own Profile</div>' +
      '<h2>The Collisions You Carry</h2>' +
      '<p>These conflicts normally happen between two people. Because both gifts are in your top three, you run them internally—' +
      'which is why certain decisions leave you divided against yourself for reasons that are hard to name. ' +
      'The same move that resolves the conflict between two people resolves it inside one.</p></div>' +
      '<div class="pair-list rv">' + cards + '</div>' +
      '</div></section>';
  }

  /* ---- where you will be misread: your #1 vs their #7, and your #7 ---- */
  function blindSection() {
    var be = window.BLIND_EXCHANGE || [];
    if (!be.length) return '';
    var top = res.ranked[0], low = res.ranked[res.ranked.length - 1];
    var bTop = be.find(function (x) { return x.gift === top; });
    var bLow = be.find(function (x) { return x.gift === low; });
    if (!bTop || !bLow) return '';
    var gTop = GIFTS[top], gLow = GIFTS[low];
    return '<section class="section alt"><div class="wrap">' +
      '<div class="section-head rv"><div class="kicker center">The Blind Exchange</div>' +
      '<h2>Where You Will Be Misread</h2>' +
      '<p>The sharpest friction in any relationship sits where one person\'s first gift is the other\'s last. ' +
      'You have one of each—here is what both edges feel like from the inside and the outside.</p></div>' +
      '<div class="blind-list rv">' +

      '<div class="blind" style="--g:' + BAR[top] + '">' +
      '<h4><span class="g-tag ' + top + '">' + esc(gTop.name.replace(/^The /, '')) + '</span> is your strongest — meeting someone it is weakest in</h4>' +
      '<div class="blind-grid">' +
      '<div><span class="pg-k">You see</span><p>' + esc(bTop.youSee) + '</p></div>' +
      '<div><span class="pg-k">They receive</span><p>' + esc(bTop.theyGet) + '</p></div>' +
      '<div><span class="pg-k">You feel</span><p>' + esc(bTop.youFeel) + '</p></div>' +
      '<div><span class="pg-k">They feel</span><p>' + esc(bTop.theyFeel) + '</p></div>' +
      '</div></div>' +

      '<div class="blind" style="--g:' + BAR[low] + '">' +
      '<h4><span class="g-tag ' + low + '">' + esc(gLow.name.replace(/^The /, '')) + '</span> is your quietest — meeting someone who leads with it</h4>' +
      '<div class="blind-grid">' +
      '<div><span class="pg-k">They see</span><p>' + esc(bLow.youSee) + '</p></div>' +
      '<div><span class="pg-k">You receive</span><p>' + esc(bLow.theyGet) + '</p></div>' +
      '<div><span class="pg-k">They feel</span><p>' + esc(bLow.youFeel) + '</p></div>' +
      '<div><span class="pg-k">You feel</span><p>' + esc(bLow.theyFeel) + '</p></div>' +
      '</div></div>' +

      '</div>' +
      '<p style="text-align:center;margin-top:36px" class="no-print">' +
      '<a class="link-arrow" href="/how-gifts-meet">Measure the Gap between you and someone else <span class="ar">→</span></a></p>' +
      '</div></section>';
  }

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
  var topThreeHtml = '<div class="top3-summary rv">' +
    '<div class="kicker center" style="justify-content:center">Your Top Three Gifts</div>' +
    '<ol class="top3-rank">' + res.top3.map(function (slug, i) {
      return '<li style="--gc:var(--' + slug + ')">' +
        '<span class="t3-rank">' + (i + 1) + '</span>' +
        '<span class="t3-info"><span class="t3-name">' + esc(GIFTS[slug].name) + '</span>' +
        '<span class="t3-sub">' + esc(GIFTS[slug].subtitle) + '</span></span>' +
        '<span class="t3-score">' + res.scores[slug] + '</span></li>';
    }).join('') + '</ol>' +
    (arch ? '<p class="t3-arch">Together, these three form your archetype: <a href="/archetypes/' + arch.slug + '"><strong>' + esc(arch.name) + '</strong></a></p>' : '') +
    '</div>';
  var topThreeSection = '<section class="section" style="padding-top:10px;padding-bottom:10px"><div class="wrap narrow">' + topThreeHtml + '</div></section>';
  app.innerHTML =
    '<section class="section res-top" style="padding-bottom:8px"><div class="wrap narrow">' + profileHtml + topActions + '</div></section>' +
    topThreeSection +
    '<section class="section" style="padding-bottom:24px"><div class="wrap narrow">' +
    '<div class="section-head rv" style="margin-bottom:30px"><div class="kicker center">Completed ' + esc(dateStr) + '</div>' +
    '<h2>Your Intensity Profile</h2>' +
    '<p>You possess a unique blend of all seven gifts—like a sound equalizer with seven sliders set at different levels. Here is your motivational fingerprint, scored 0–100.</p></div>' +
    '<div class="chart-card rv">' + bars + '</div>' + tieNote +
    '</div></section>' +
    archHtml +
    archCascade() +
    '<section class="section alt"><div class="wrap">' +
    '<div class="section-head rv"><div class="kicker center">Your Top Three</div><h2>Deep Dive into Your Leading Gifts</h2>' +
    '<p>These three gifts carry the highest intensity in your profile. Together they form your archetype; individually, each deserves deep exploration.</p></div>' +
    '<div class="top3-tabs no-print">' + tabs + '</div>' + panels +
    '</div></section>' +
    internalCollisions() +
    blindSection() +
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
