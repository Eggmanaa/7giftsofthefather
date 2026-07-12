/* Build script v2: generates the static site from content JSON — light editorial design */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'site');
const gifts = JSON.parse(fs.readFileSync(__dirname + '/content/gifts.json', 'utf8'));
const archData = JSON.parse(fs.readFileSync(__dirname + '/content/archetypes.json', 'utf8'));
const questions = JSON.parse(fs.readFileSync(__dirname + '/content/questions.json', 'utf8'));

const V = Date.now().toString(36);
const QCOUNT = questions.likert.length + questions.forcedChoice.length + questions.scenarios.length;

const ORDER = ['catalyst', 'servant', 'erudite', 'enthusiast', 'host', 'strategist', 'lover'];
const META = {
  catalyst:   { ink: 'var(--catalyst)',   bar: 'var(--catalyst-bar)',   metaphorColor: 'Lava Red' },
  servant:    { ink: 'var(--servant)',    bar: 'var(--servant-bar)',    metaphorColor: 'Construction Yellow' },
  erudite:    { ink: 'var(--erudite)',    bar: 'var(--erudite-bar)',    metaphorColor: 'Rich Brown' },
  enthusiast: { ink: 'var(--enthusiast)', bar: 'var(--enthusiast-bar)', metaphorColor: 'Rose Gold' },
  host:       { ink: 'var(--host)',       bar: 'var(--host-bar)',       metaphorColor: 'Emerald Green' },
  strategist: { ink: 'var(--strategist)', bar: 'var(--strategist-bar)', metaphorColor: 'Platinum' },
  lover:      { ink: 'var(--lover)',      bar: 'var(--lover-bar)',      metaphorColor: 'Soft Lavender' },
};
const NAME2SLUG = { Catalyst: 'catalyst', Servant: 'servant', Erudite: 'erudite', Enthusiast: 'enthusiast', Host: 'host', Strategist: 'strategist', Lover: 'lover' };

const slugify = s => s.toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const firstSentence = s => { const m = s.match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : s; };

archData.archetypes.forEach(a => { a.slug = slugify(a.name); });

/* ---------------- layout ---------------- */
function layout({ title, desc, body, root = '', active = '', bodyClass = '' }) {
  const nav = [
    ['index.html', 'Home', 'home'],
    ['gifts/index.html', 'The 7 Gifts', 'gifts'],
    ['archetypes/index.html', 'The 35 Archetypes', 'archetypes'],
    ['foundation.html', 'Foundation', 'foundation'],
    ['understanding.html', 'Your Profile', 'understanding'],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://7giftsofthefather.pages.dev/images/og.jpg">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="${root}images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}css/styles.css?v=${V}">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="${root}index.html"><img src="${root}images/crown-thumb.webp" alt="Crown logo"><span>The 7 Gifts of the Father</span></a>
    <button class="nav-burger" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
    <div class="nav-links">
      ${nav.map(([href, label, key]) => `<a href="${root}${href}"${active === key ? ' class="active"' : ''}>${label}</a>`).join('\n      ')}
      <a class="btn-assess" href="${root}assessment.html">Take the Assessment</a>
    </div>
  </div>
</nav>
${body}
<footer>
  <div class="foot-inner">
    <a class="brand" href="${root}index.html"><img src="${root}images/crown-thumb.webp" alt=""><span>The 7 Gifts of the Father</span></a>
    <div class="foot-links">
      ${ORDER.map(s => `<a href="${root}gifts/${s}.html">${gifts[s].name}</a>`).join('\n      ')}
    </div>
    <div class="foot-links">
      <a href="${root}assessment.html">Assessment</a>
      <a href="${root}archetypes/index.html">Archetypes</a>
      <a href="${root}foundation.html">Foundation</a>
      <a href="${root}understanding.html">Your Profile</a>
    </div>
    <p class="foot-verse">“Having gifts that differ according to the grace given to us, let us use them.” — Romans 12:6</p>
  </div>
</footer>
<script src="${root}js/main.js?v=${V}"></script>
</body>
</html>`;
}

const gemDivider = `<div class="gems" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
const gTags = (giftNames, root) => `<div class="combo">${giftNames.map(g => {
  const s = NAME2SLUG[g]; return `<a class="g-tag ${s}" href="${root}gifts/${s}.html">${g}</a>`;
}).join('')}</div>`;

/* refined inline SVG icons (stroke = currentColor) */
const IC = {
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 4-4 5.5-4 10a4 4 0 0 0 8 0c0-1.5-.6-2.6-1.3-3.7C13.7 10 12 11 12 12.6"/><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-2-5.5"/><path d="M5 15a7 7 0 0 0 7 7"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3v18M6 8h12"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 4L12 5l5.5 7L21 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>`,
};

/* ---------------- home ---------------- */
const trinity = [
  { title: 'The Gifts of the Holy Spirit', ref: '1 Corinthians 12:4–11', icon: IC.flame,
    text: 'Supernatural, power-based manifestations that operate through believers for miraculous works, divine revelation, and spiritual warfare. These include gifts like tongues, prophecy, healing, and words of knowledge—supernatural abilities that transcend natural human capacity.' },
  { title: 'The Gifts of Jesus', ref: 'Ephesians 4:11–16', icon: IC.cross,
    text: 'Ministry orientations and callings that equip the church for service and maturity. These include apostles, prophets, evangelists, pastors, and teachers—specific roles designed to build up the body of Christ and prepare believers for works of service.' },
  { title: 'The Gifts of the Father', ref: 'Romans 12:6–8', icon: IC.crown,
    text: 'Personality-based motivational drives that come wired into us at birth, forming the core of who we are and how we naturally operate in the world and the Church. These seven gifts shape our personalities, drive our decisions, and determine how we naturally approach life and relationships.' },
];
const trinityCards = root => trinity.map(t => `<div class="card trinity-card rv${t.title.includes('Father') ? ' father' : ''}">
        <div class="t-ic">${t.icon}</div>
        <h3>${t.title}</h3><div class="ref">${t.ref}</div><p>${t.text}</p>
      </div>`).join('\n');

function giftCard(slug, root) {
  const g = gifts[slug], m = META[slug];
  return `<a class="card gift-card rv" href="${root}gifts/${slug}.html" style="--g:${m.bar}">
      <img src="${root}images/${slug}-thumb.webp" alt="${esc(g.name)} logo" loading="lazy" width="86" height="86">
      <div><div class="g-sub" style="color:${m.ink}">${esc(g.subtitle)}</div><div class="g-name">${esc(g.name)}</div></div>
      <p>${esc(firstSentence(g.profileSummary))}</p>
      <span class="g-metaphor">Metaphor: ${esc(g.metaphor.title)} · ${m.metaphorColor}</span>
      <span class="g-link">Explore the gift <span class="ar" style="color:${m.ink}">→</span></span>
    </a>`;
}

function homePage() {
  const body = `
<header class="hero">
  <img class="crown" src="images/crown.webp" alt="The 7 Gifts of the Father crown with seven gemstones" fetchpriority="high">
  <div class="kicker center">Romans 12 · A Motivational Design</div>
  <h1>The Seven Motivational<br><em>Giftings of the Father</em></h1>
  <p class="lede">Discover the personality-based motivational drives that God the Father has wired into you from birth—and how your unique blend of all seven shapes your decisions, relationships, and calling in His kingdom.</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="assessment.html">Take the Assessment</a>
    <a class="link-arrow" href="gifts/index.html">Explore the 7 Gifts <span class="ar">→</span></a>
    <a class="link-arrow" href="archetypes/index.html">The 35 Archetypes <span class="ar">→</span></a>
  </div>
  <p class="verse">“For by the grace given me I say to every one of you: Do not think of yourself more highly than you ought, but rather think of yourself with sober judgment, in accordance with the <strong>faith God has distributed</strong> to each of you.”<cite>Romans 12:3</cite></p>
  ${gemDivider}
</header>

<section class="section">
  <div class="wrap">
    <div class="section-head rv">
      <div class="kicker center">Three Streams of Grace</div>
      <h2>The Gifts of the Trinity</h2>
      <p>Scripture reveals a beautiful triad of divine gifts operating in the life of every believer—each originating from a different person of the Trinity and serving a distinct purpose in God's kingdom.</p>
    </div>
    <div class="grid g3">
      ${trinityCards('')}
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head rv">
      <div class="kicker center">Seven Jewels in the Crown</div>
      <h2>Meet the Seven Gifts</h2>
      <p>Each gift is a foundational motivational drive—a lens through which you see the world, a question you are always asking, and a grace you are called to steward.</p>
    </div>
    <div class="grid g3">${ORDER.map(s => giftCard(s, '')).join('\n')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap narrow" style="text-align:center">
    <div class="rv">
      <div class="kicker center">Beyond a Single Gift</div>
      <h2 style="font-size:clamp(1.9rem,3.6vw,2.7rem)">Your Top Three Form Your <em style="color:var(--gold-ink)">Archetype of the Soul</em></h2>
      <p style="color:var(--muted);font-size:1.05rem;max-width:640px;margin:0 auto 30px">You are not just a single gifting. Each of us carries varying intensities of all seven motivations, and the unique chord struck by your <strong style="color:var(--ink)">top three</strong> gifts forms one of <strong style="color:var(--ink)">35 distinct personality archetypes</strong>—from the Apex Visionary to the Benevolent Leader.</p>
      ${gemDivider}
      <div style="margin-top:30px;display:flex;gap:22px;justify-content:center;align-items:center;flex-wrap:wrap">
        <a class="btn btn-quiet" href="archetypes/index.html">Browse the 35 Archetypes</a>
        <a class="link-arrow" href="understanding.html">How profiles work <span class="ar">→</span></a>
      </div>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="rv">
    <div class="kicker center">The Comprehensive Integrated Assessment</div>
    <h2>Discover Your Motivational Design</h2>
    <p>${QCOUNT} questions measuring the intensity of all seven gifts—revealing your top three, your soul's archetype, and a personalized profile of your God-given design.</p>
    <a class="btn btn-primary" href="assessment.html">Begin the Assessment</a>
    <p class="fine">About 15 minutes · Your results stay on your device</p>
  </div>
</section>`;

  return layout({ title: 'The 7 Motivational Giftings of the Father | Discover Your God-Given Design',
    desc: 'Discover the seven motivational gifts of Romans 12 — Prophecy, Service, Teaching, Encouragement, Giving, Leadership, and Mercy — and the 35 personality archetypes of the soul. Take the free assessment.',
    body, root: '', active: 'home' });
}

/* ---------------- gifts index ---------------- */
function giftsIndex() {
  const cards = ORDER.map(s => {
    const g = gifts[s], m = META[s];
    return `<a class="card gift-card rv" href="${s}.html" style="--g:${m.bar}">
      <img src="../images/${s}-thumb.webp" alt="${esc(g.name)} logo" loading="lazy" width="86" height="86">
      <div><div class="g-sub" style="color:${m.ink}">${esc(g.subtitle)}</div><div class="g-name">${esc(g.name)}</div></div>
      <p>${esc(firstSentence(g.profileSummary))}</p>
      <span class="g-metaphor">Core question: “${esc(g.coreFramework.question)}”</span>
      <span class="g-link">Explore the gift <span class="ar" style="color:${m.ink}">→</span></span>
    </a>`;
  }).join('\n');
  const body = `
<header class="page-hero">
  <img class="mark" src="../images/crown-thumb.webp" alt="">
  <h1>The Seven Gifts</h1>
  <p class="lede">Seven motivational drives, distributed by the Father's grace. Each carries its own core question, energizer, and drive—its own strengths, shadows, and leadership style.</p>
</header>
<section class="section"><div class="wrap"><div class="grid g3">${cards}</div></div></section>
<section class="cta-band"><div class="rv"><h2>Which gifts lead in you?</h2><p>Take the assessment to measure your intensity in all seven and unlock your archetype.</p><a class="btn btn-primary" href="../assessment.html">Take the Assessment</a></div></section>`;
  return layout({ title: 'The Seven Gifts | 7 Gifts of the Father', desc: 'Explore all seven motivational gifts of Romans 12: The Catalyst, The Servant of All, The Erudite, The Enthusiast, The Host, The Strategist, and The Lover.', body, root: '../', active: 'gifts' });
}

/* ---------------- individual gift page ---------------- */
function giftPage(slug) {
  const g = gifts[slug], m = META[slug];
  const idx = ORDER.indexOf(slug);
  const related = g.archetypes || [];

  const strengths = g.strengths.map(s => `<div class="s-item rv"><span class="dot"></span><div><h4>${esc(s.title)}</h4><p>${esc(s.description)}</p></div></div>`).join('\n');
  const challenges = g.challenges.map(s => `<div class="s-item rv"><span class="dot" style="background:var(--strategist-bar)"></span><div><h4>${esc(s.title)}</h4><p>${esc(s.description)}</p></div></div>`).join('\n');
  const contentions = g.contentions.map(c => {
    const os = NAME2SLUG[c.gift.replace('Servant of All', 'Servant').replace(/^The /, '')] || null;
    const chip = os ? `<a class="g-tag ${os}" href="${os}.html">${esc(c.gift)}</a>` : esc(c.gift);
    return `<div class="contention rv"><div class="vs"><span>with</span> ${chip}</div><h4>${esc(c.conflict)}</h4><p>${esc(c.description)}</p></div>`;
  }).join('\n');
  const interactions = g.interactions.map(i => `<li>${esc(i)}</li>`).join('\n');
  const words = g.descriptiveWords.map(w => `<b>${esc(w)}</b>`).join('<span class="sep">·</span>');
  const verses = g.foundationalVerses.map(v => {
    const mm = v.match(/^([^-–]+?)\s*[-–]\s*(.*)$/);
    return mm ? `<p>${esc(mm[2])} <strong>— ${esc(mm[1].trim()).toUpperCase()}</strong></p>` : `<p>${esc(v)}</p>`;
  }).join('\n');
  const relatedCards = related.map(r => {
    const cleanName = r.name.replace(/\s*\(.*\)\s*$/, '').trim();
    const a = archData.archetypes.find(x => x.name === cleanName) || null;
    const gl = a ? a.gifts : [];
    return `<a class="card arch-card rv" href="../archetypes/${a ? a.slug : slugify(cleanName)}.html">
      ${a ? `<span class="num">${a.num}</span>` : ''}
      <h3>${esc(cleanName)}</h3>
      <div class="combo">${gl.map(x => `<span class="g-tag ${NAME2SLUG[x]}">${x}</span>`).join('')}</div>
      <p>${esc(a ? a.essence : firstSentence(r.description || ''))}</p>
      <span class="g-link">Read the archetype <span class="ar">→</span></span>
    </a>`;
  }).join('\n');
  // commission is a string like: Jeremiah 1:10: "See, today I appoint..."
  const cm = String(g.commission || '').match(/^([1-3]?\s?[A-Za-z]+\s[\d:–\-]+)\s*:?\s*(.*)$/s);
  const commissionRef = cm ? cm[1].trim() : '';
  const commissionText = (cm ? cm[2] : String(g.commission || '')).replace(/^["“]|["”]$/g, '');

  const prevSlug = ORDER[(idx + 6) % 7], nextSlug = ORDER[(idx + 1) % 7];
  const prev = gifts[prevSlug], next = gifts[nextSlug];

  const body = `
<header class="gift-hero" style="--g:${m.bar};--g-dark:${m.ink}">
  <img src="../images/${slug}.webp" alt="${esc(g.name)} — ${esc(g.metaphor.title)} logo" fetchpriority="high" width="168" height="168">
  <div class="kicker">Gift ${idx + 1} of 7 · ${m.metaphorColor}</div>
  <h1>${esc(g.name)}</h1>
  <div class="sub">${esc(g.subtitle)}</div>
  <p class="words-line">${words}</p>
</header>

<section class="g-section" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap narrow rv">
    <div class="g-label">Profile Summary</div>
    <p class="lead-prose big">${esc(g.profileSummary)}</p>
  </div>
</section>

<section class="g-section alt" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="grid g2" style="gap:48px">
      <div class="metaphor-card rv">
        <div class="g-label">Core Metaphor</div>
        <h3>${esc(g.metaphor.title)}</h3>
        <p>${esc(g.metaphor.description)}</p>
      </div>
      <div class="verse-card rv">
        <div class="g-label" style="color:var(--gold-ink)">Foundational Verses</div>
        ${verses}
      </div>
    </div>
  </div>
</section>

<section class="g-section" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">What Fuels This Gift</div><h2>Core Motivational Framework</h2></div>
    <div class="grid g3 framework-grid">
      <div class="card rv"><div class="fw-k">Core Question</div><div class="fw-q">“${esc(g.coreFramework.question)}”</div><p>${esc(g.coreFramework.questionDescription)}</p></div>
      <div class="card rv"><div class="fw-k">Core Energizer</div><div class="fw-q">${esc(g.coreFramework.energizer)}</div><p>${esc(g.coreFramework.energizerDescription)}</p></div>
      <div class="card rv"><div class="fw-k">Core Drive</div><div class="fw-q">${esc(g.coreFramework.drive)}</div><p>${esc(g.coreFramework.driveDescription)}</p></div>
    </div>
  </div>
</section>

<section class="g-section alt" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="grid g2" style="gap:56px;align-items:start">
      <div>
        <div class="g-label rv">God-Given Strengths</div>
        <div class="s-list">${strengths}</div>
      </div>
      <div>
        <div class="g-label rv" style="color:var(--strategist)">Characterological Challenges</div>
        <div class="s-list">${challenges}</div>
      </div>
    </div>
  </div>
</section>

<section class="g-section" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="grid g2" style="gap:56px;align-items:start">
      <div class="lead-style rv">
        <div class="g-label">Leadership Style</div>
        <h3>${esc(g.leadershipStyle.title)}</h3>
        <p>${esc(g.leadershipStyle.description)}</p>
        <p class="traits">${g.leadershipStyle.characteristics.map(esc).join('<span class="sep">·</span>')}</p>
      </div>
      <div class="rv">
        <div class="g-label">How to Interact with ${esc(g.name.replace(/^The /, 'a '))}</div>
        <ul class="interact-list">${interactions}</ul>
      </div>
    </div>
  </div>
</section>

<section class="g-section alt" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">Where Friction Lives</div><h2>Points of Contention with Other Gifts</h2>
    <p>Every gift carries a holy conviction—and every conviction can collide with another's. Naming the clash is the first step toward honoring it.</p></div>
    <div class="grid g2" style="gap:0 56px">${contentions}</div>
  </div>
</section>

<section class="g-section" style="--g:${m.bar};--g-dark:${m.ink}">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">Your Gift in Combination</div><h2>Archetypes Featuring ${esc(g.name)}</h2>
    <p>${esc(g.name)} appears in 15 of the 35 archetypes of the soul. When it joins two other dominant gifts, it takes on a distinct expression.</p></div>
    <div class="grid g3">${relatedCards}</div>
  </div>
</section>

<section class="commission">
  <div class="rv">
    <div class="g-label" style="color:var(--gold-ink)">${esc(g.name)}'s Commission</div>
    <blockquote>“${esc(commissionText)}”</blockquote>
    <cite>${esc(commissionRef)}</cite>
  </div>
</section>

<section class="g-section" style="padding:44px 0 76px">
  <div class="wrap pager">
    <a href="${prevSlug}.html"><span class="lbl">← Previous Gift</span><span class="nm">${esc(prev.name)}</span></a>
    <a href="../assessment.html" style="text-align:center"><span class="lbl">Measure Your Intensity</span><span class="nm" style="color:var(--gold-ink)">Take the Assessment</span></a>
    <a href="${nextSlug}.html" style="text-align:right"><span class="lbl">Next Gift →</span><span class="nm">${esc(next.name)}</span></a>
  </div>
</section>`;

  return layout({
    title: `${g.name}: ${g.subtitle} | 7 Gifts of the Father`,
    desc: firstSentence(g.profileSummary),
    body, root: '../', active: 'gifts'
  });
}

/* ---------------- archetypes index ---------------- */
function archetypesIndex() {
  const o = archData.overture;
  const sections = archData.sections;
  const bySection = {};
  archData.archetypes.forEach(a => {
    const key = a.section || 'Other';
    (bySection[key] = bySection[key] || []).push(a);
  });

  const filterBtns = `<div class="filter-bar no-print">
    <button class="on" data-f="all">All 35</button>
    ${ORDER.map(s => `<button data-f="${s}">${gifts[s].name.replace('The ', '')}</button>`).join('')}
  </div>`;

  const sectionBlocks = sections.map(s => {
    const key = s.num + ': ' + s.title;
    const list = bySection[key] || [];
    const cards = list.map(a => `<a class="card arch-card rv" data-gifts="${a.gifts.map(g => NAME2SLUG[g]).join(' ')}" href="${a.slug}.html">
      <span class="num">${a.num}</span>
      <h3>${esc(a.name)}</h3>
      <div class="combo">${a.gifts.map(g => `<span class="g-tag ${NAME2SLUG[g]}">${g}</span>`).join('')}</div>
      <p>${esc(a.essence)}</p>
      <span class="g-link">Read the archetype <span class="ar">→</span></span>
    </a>`).join('\n');
    return `<div class="arch-section" data-section>
      <div class="sect-head rv"><span class="tag">${esc(s.num)}</span><h3>${esc(s.title)}</h3></div>
      <p class="sect-intro rv">${esc(s.intro)}</p>
      <div class="grid g3">${cards}</div>
    </div>`;
  }).join('\n');

  const body = `
<header class="page-hero">
  <img class="mark" src="../images/crown-thumb.webp" alt="">
  <h1>The 35 Archetypes of the Soul</h1>
  <p class="lede">The Motivational Symphony: when your three dominant gifts sound together, they strike a chord—one of thirty-five distinct personality archetypes.</p>
</header>

<section class="section">
  <div class="wrap narrow prose rv">
    <div class="kicker">Overture · The Harmony of Your Motivational Design</div>
    <h2 style="font-size:2rem">The Foundation of Grace</h2>
    <p>${esc(o.foundation)}</p>
    <h3>From Single Gifts to a Motivational Chord</h3>
    <p>${esc(o.chord)}</p>
    <h3>The Three Axes of Contribution: Why, How, and Who</h3>
    <p>${esc(o.axes)}</p>
    <h3>How to Use This Guide</h3>
    <p>${esc(o.howto)}</p>
  </div>
</section>

<section class="section alt" id="library">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">The Complete Library</div><h2>All 35 Archetypes</h2>
    <p>Filter by gift to see every archetype that carries it, or browse by family below.</p></div>
    ${filterBtns}
    ${sectionBlocks}
  </div>
</section>

<section class="section">
  <div class="wrap narrow prose rv">
    <h2 style="font-size:2rem">Living Your Archetype</h2>
    <h3>Embracing Your Unique Harmony</h3>
    <p>${esc(archData.closing.harmony)}</p>
    <h3>Minding the Dissonance: Navigating Your Archetype's Shadows</h3>
    <p>${esc(archData.closing.dissonance)}</p>
    <h3>Playing in an Orchestra: Your Archetype in Relationships</h3>
    <p>${esc(archData.closing.orchestra)}</p>
    <h3>A Final Commission</h3>
    <p>${esc(archData.closing.commission)}</p>
  </div>
</section>

<section class="cta-band">
  <div class="rv"><h2>Which chord do you strike?</h2>
  <p>Your top three gifts reveal your archetype. Take the assessment to discover yours.</p>
  <a class="btn btn-primary" href="../assessment.html">Find My Archetype</a></div>
</section>
<script>
document.querySelectorAll('.filter-bar button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.filter-bar button').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const f = b.dataset.f;
  document.querySelectorAll('.arch-card').forEach(c => {
    c.style.display = (f === 'all' || (c.dataset.gifts || '').includes(f)) ? '' : 'none';
  });
  document.querySelectorAll('[data-section]').forEach(sec => {
    const any = [...sec.querySelectorAll('.arch-card')].some(c => c.style.display !== 'none');
    sec.style.display = any ? '' : 'none';
  });
}));
</script>`;

  return layout({ title: 'The 35 Personality Archetypes of the Soul | 7 Gifts of the Father',
    desc: 'A guide to the 35 personality archetypes formed by every combination of three dominant motivational gifts — from the Apex Visionary to the Benevolent Leader.',
    body, root: '../', active: 'archetypes' });
}

/* ---------------- individual archetype page ---------------- */
function archetypePage(a) {
  const sect = archData.sections.find(s => a.section && a.section.startsWith(s.num));
  const siblings = archData.archetypes.filter(x => x.section === a.section && x.num !== a.num);
  const giftCards = a.gifts.map(gName => {
    const s = NAME2SLUG[gName], g = gifts[s], m = META[s];
    return `<a class="card gift-card rv" href="../gifts/${s}.html" style="--g:${m.bar}">
      <img src="../images/${s}-thumb.webp" alt="${esc(g.name)}" loading="lazy" width="86" height="86">
      <div><div class="g-sub" style="color:${m.ink}">${esc(g.subtitle)}</div><div class="g-name">${esc(g.name)}</div></div>
      <p>Core question: “${esc(g.coreFramework.question)}”</p>
      <span class="g-link">Explore the gift <span class="ar" style="color:${m.ink}">→</span></span>
    </a>`;
  }).join('\n');
  const sibCards = siblings.map(x => `<a class="card arch-card rv" href="${x.slug}.html">
      <span class="num">${x.num}</span><h3>${esc(x.name)}</h3>
      <div class="combo">${x.gifts.map(g => `<span class="g-tag ${NAME2SLUG[g]}">${g}</span>`).join('')}</div>
      <p>${esc(x.essence)}</p></a>`).join('\n');

  const body = `
<header class="page-hero">
  <div class="kicker center" style="justify-content:center">Archetype ${a.num} of 35${sect ? ' · ' + esc(sect.title) : ''}</div>
  <h1>${esc(a.name)}</h1>
  <p class="lede" style="font-family:var(--serif);font-style:italic;font-size:1.24rem">${esc(a.essence)}</p>
  <div style="display:flex;justify-content:center;margin-top:22px">${gTags(a.gifts, '../')}</div>
</header>

<section class="section">
  <div class="wrap narrow prose rv">
    ${a.paragraphs.map(p => `<p style="font-size:1.08rem;line-height:1.85">${esc(p)}</p>`).join('\n')}
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">The Chord Beneath the Name</div><h2>The Three Gifts of ${esc(a.name.replace(/^The /, 'the '))}</h2></div>
    <div class="grid g3">${giftCards}</div>
  </div>
</section>

${siblings.length ? `<section class="section">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">Same Family</div><h2>Related Archetypes</h2></div>
    <div class="grid g3">${sibCards}</div>
  </div>
</section>` : ''}

<section class="cta-band">
  <div class="rv"><h2>Is this your archetype?</h2>
  <p>Take the assessment to measure all seven gifts and confirm your soul's chord.</p>
  <a class="btn btn-primary" href="../assessment.html">Take the Assessment</a>
  <p style="margin-top:20px"><a class="link-arrow" href="index.html"><span class="ar">←</span> Back to all 35 archetypes</a></p></div>
</section>`;

  return layout({ title: `${a.name} | The 35 Archetypes of the Soul`,
    desc: a.essence, body, root: '../', active: 'archetypes' });
}

/* ---------------- foundation ---------------- */
function foundationPage() {
  const body = `
<header class="page-hero">
  <img class="mark" src="images/crown-thumb.webp" alt="">
  <h1>The Biblical Foundation</h1>
  <p class="lede">Understanding the scriptural basis for the Father's motivational gifts—and how they fit within the broader framework of divine gifts in the Trinity.</p>
</header>

<section class="section">
  <div class="wrap narrow prose rv">
    <h3 style="margin-top:0">The Father as Divine Architect</h3>
    <p>While other passages attribute spiritual gifts to the Holy Spirit (1 Corinthians 12) or to Jesus Christ (Ephesians 4), Romans 12 points uniquely to <strong>God the Father</strong> as the divine architect of our motivational design.</p>
    <blockquote>“For by the grace given me I say to every one of you: Do not think of yourself more highly than you ought, but rather think of yourself with sober judgment, in accordance with the <strong>faith God has distributed</strong> to each of you.”<cite>Romans 12:3</cite></blockquote>
    <p>The passage begins not with a list of gifts, but with a call to humility rooted in how we were made. In this context, the “faith God has distributed” can be understood as the specific measure of motivational grace apportioned to each of us.</p>
    <p>This is the key to “sober judgment.” Our motivational wiring is not an achievement we earned, but a portion of grace we were given by the Father. It is the foundational, operational style He hardwired into our being before we took our first breath.</p>

    <h3>The Body Metaphor: Beautiful Interdependence</h3>
    <p>This understanding leads directly to Paul's metaphor of the body. Because we each have a different measure and function, we are beautifully incomplete on our own.</p>
    <blockquote>“For just as each of us has one body with many members, and these members do not all have the same function, so in Christ we, though many, form one body, and each member belongs to all the others.”<cite>Romans 12:4–5</cite></blockquote>
    <p>Our gifts are not for us alone; they belong to the whole community, creating a necessary and beautiful interdependence. There is no room for pride in having one gift or insecurity in having another; we simply steward the portion we were given.</p>
    <p>Therefore, as we explore these seven gifts, we do so not just for self-discovery, but to learn how to love others more effectively. We learn to speak their motivational language, answer their core questions, and celebrate the unique way the Father has designed each person to contribute to His kingdom and our communities.</p>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head rv"><div class="kicker center">Three Streams of Grace</div><h2>The Gifts of the Trinity</h2></div>
    <div class="grid g3">
      ${trinityCards('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap narrow rv" style="text-align:center">
    <h2>The Seven Gifts of Romans 12:6–8</h2>
    <p style="color:var(--muted)">Prophecy · Service · Teaching · Encouragement · Giving · Leadership · Mercy</p>
    ${gemDivider}
    <p style="color:var(--muted);margin-top:24px;max-width:620px;margin-left:auto;margin-right:auto">Understanding the Father's gifts provides a biblical foundation for deeper relationships, more effective service, and greater unity in the body of Christ. These motivational frameworks help us understand not just what we do, but who we are at our core.</p>
    <div style="display:flex;gap:22px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:28px">
      <a class="btn btn-quiet" href="gifts/index.html">Explore the 7 Gifts</a>
      <a class="link-arrow" href="understanding.html">Understand your profile <span class="ar">→</span></a>
    </div>
  </div>
</section>

<section class="cta-band"><div class="rv"><h2>Steward the grace you were given</h2><p>Discover your unique measure with the full assessment.</p><a class="btn btn-primary" href="assessment.html">Take the Assessment</a></div></section>`;
  return layout({ title: 'The Biblical Foundation | 7 Gifts of the Father', desc: 'The scriptural basis for the Father\'s motivational gifts in Romans 12 — grace distributed by the divine architect of our motivational design.', body, root: '', active: 'foundation' });
}

/* ---------------- understanding ---------------- */
function understandingPage() {
  const bands = [
    ['85–100', 'Very High', 'vh', 'A defining, always-on drive. This gift shapes how you see nearly everything.'],
    ['61–84', 'High', 'h', 'A dominant motivation you reach for daily; a core part of your contribution.'],
    ['41–60', 'Medium', 'm', 'A supportive strength you can draw on with intention.'],
    ['16–40', 'Low', 'l', 'Present but quiet; usually expressed through your stronger gifts.'],
    ['0–15', 'Very Low', 'vl', 'Rarely your native language—an invitation to appreciate it in others.'],
  ];
  const body = `
<header class="page-hero">
  <img class="mark" src="images/crown-thumb.webp" alt="">
  <h1>Understanding Your Motivational Profile</h1>
  <p class="lede">You are not just a single gifting. Each of us carries varying intensity levels of all seven motivational languages, creating a unique blend that forms our overall personality.</p>
</header>

<section class="section">
  <div class="wrap">
    <div class="grid g2">
      <div class="card rv">
        <div class="kicker">The Sound Equalizer</div>
        <h3>One Design, Seven Sliders</h3>
        <p style="color:var(--ink-soft)">Think of it like a sound equalizer with seven sliders—some set high, others moderate, and some lower. This combination creates your distinctive motivational fingerprint.</p>
        <p style="color:var(--ink-soft);margin:0">Any gift that you have a very high or high intensity level in, as well as the gifts you have low or very low in, significantly affects how you will show up in the world and relate with others.</p>
      </div>
      <div class="card rv">
        <div class="kicker">The Core Framework</div>
        <h3>Questions Beneath the Words</h3>
        <p style="color:var(--ink-soft)">Each gift carries a core question that must be answered for that person to feel truly understood and valued. When we communicate with others, we unconsciously seek to have our highest-intensity core questions answered.</p>
        <p style="color:var(--ink-soft);margin:0">When these questions remain unanswered, relational strain occurs—not because of bad intentions, but because of unmet motivational needs.</p>
      </div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap narrow">
    <div class="section-head rv"><div class="kicker center">Reading Your Results</div><h2>The Five Intensity Levels</h2>
    <p>The assessment scores each gift from 0–100 and assigns one of five intensity bands.</p></div>
    <div class="card rv" style="padding:14px 34px">
      <table class="band-table">
        <thead><tr><th>Score</th><th>Intensity</th><th>What it means</th></tr></thead>
        <tbody>${bands.map(b => `<tr><td>${b[0]}</td><td><span class="intensity ${b[2]}">${b[1]}</span></td><td style="color:var(--ink-soft)">${b[3]}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head rv"><h2>To Grow in Love and Deepen Relationships</h2></div>
    <div class="grid g3">
      <div class="card rv" style="text-align:center"><div class="step-circle">1</div><h3 style="font-size:1.28rem">Answer the Core Question</h3><p style="color:var(--muted);margin:0">Answer the Core Question they are always asking.</p></div>
      <div class="card rv" style="text-align:center"><div class="step-circle">2</div><h3 style="font-size:1.28rem">Provide the Core Energizer</h3><p style="color:var(--muted);margin:0">Provide the Core Energizer that uniquely fuels their spirit.</p></div>
      <div class="card rv" style="text-align:center"><div class="step-circle">3</div><h3 style="font-size:1.28rem">Champion the Core Drive</h3><p style="color:var(--muted);margin:0">Champion the Core Drive that motivates their best contributions.</p></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap narrow">
    <div class="card rv" style="border-left:2px solid var(--gold);border-radius:0 16px 16px 0">
      <h3>The Communication Default</h3>
      <p style="color:var(--ink-soft)">In our interactions with others, we often unconsciously default to communicating through the motivational gift that represents the highest collective intensity between us and the other person.</p>
      <p style="color:var(--ink-soft);margin:0">For example, if you're high in Teaching and speaking with someone high in Mercy, you might find yourselves naturally gravitating toward the gift you both share at moderate levels—perhaps Service or Encouragement.</p>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="rv"><h2>Ready to explore the 7 gifts?</h2>
  <p>Now that you understand how the gifts work together, dive into each of the seven motivational giftings—or measure your own profile.</p>
  <div style="display:flex;gap:22px;justify-content:center;align-items:center;flex-wrap:wrap">
    <a class="btn btn-primary" href="assessment.html">Take the Assessment</a>
    <a class="link-arrow" href="gifts/catalyst.html">Start with The Catalyst <span class="ar">→</span></a>
  </div></div>
</section>`;
  return layout({ title: 'Understanding Your Motivational Profile | 7 Gifts of the Father', desc: 'How the seven motivational gifts combine: intensity levels, the sound equalizer concept, core questions, and the communication default.', body, root: '', active: 'understanding' });
}

/* ---------------- assessment shell ---------------- */
function assessmentPage() {
  const body = `
<header class="page-hero no-print">
  <img class="mark" src="images/crown-thumb.webp" alt="">
  <h1>The Comprehensive Integrated Assessment</h1>
  <p class="lede">A complete measure of your motivational design—${QCOUNT} questions across three sections, revealing the intensity of all seven gifts, your top three, and your archetype of the soul.</p>
</header>
<div class="quiz-shell">
  <div id="quiz-app"></div>
</div>
<script src="js/data.js?v=${V}"></script>
<script src="js/assessment.js?v=${V}"></script>`;
  return layout({ title: 'Take the Assessment | 7 Gifts of the Father', desc: `The Comprehensive Integrated Assessment: ${QCOUNT} questions measuring your intensity in all seven motivational gifts of the Father, plus your personality archetype of the soul.`, body, root: '', active: '' });
}

/* ---------------- results shell ---------------- */
function resultsPage() {
  const body = `
<header class="res-hero">
  <img src="images/crown-thumb.webp" alt="" style="width:58px;margin:0 auto 14px">
  <h1>Your Motivational Design</h1>
  <p class="lede">Welcome to your personalized profile of the 7 Motivational Giftings of the Father—a portrait of the unique motivational design God has woven into the core of your being.</p>
</header>
<div id="results-app"></div>
<script src="js/data.js?v=${V}"></script>
<script src="js/results.js?v=${V}"></script>`;
  return layout({ title: 'Your Results | 7 Gifts of the Father', desc: 'Your personal intensity profile across the seven motivational gifts, your top three, and your archetype of the soul.', body, root: '', active: '' });
}

/* ---------------- 404 ---------------- */
function notFoundPage() {
  const body = `<section class="empty-state"><div class="wrap narrow">
    <img src="/images/crown-thumb.webp" alt="" style="width:64px;margin:0 auto 20px">
    <h2>Page not found</h2>
    <p style="color:var(--muted)">The page you're looking for isn't here—but your gifts are.</p>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:24px">
      <a class="btn btn-quiet" href="/index.html">Go Home</a>
      <a class="btn btn-primary" href="/assessment.html">Take the Assessment</a>
    </div></div></section>`;
  return layout({ title: 'Page Not Found | 7 Gifts of the Father', desc: 'Page not found.', body, root: '/', active: '' });
}

/* ---------------- js/data.js (client data bundle) ---------------- */
function dataJs() {
  const clientGifts = {};
  for (const s of ORDER) {
    const g = gifts[s];
    clientGifts[s] = {
      slug: s, name: g.name, subtitle: g.subtitle,
      metaphor: g.metaphor, profileSummary: g.profileSummary,
      foundationalVerses: g.foundationalVerses, descriptiveWords: g.descriptiveWords,
      coreFramework: g.coreFramework, strengths: g.strengths, challenges: g.challenges,
      leadershipStyle: g.leadershipStyle, interactions: g.interactions, commission: g.commission,
    };
  }
  const clientArch = archData.archetypes.map(a => ({
    num: a.num, name: a.name, slug: a.slug, gifts: a.gifts.map(g => NAME2SLUG[g]),
    essence: a.essence, section: a.section, paragraphs: a.paragraphs,
  }));
  return `/* Generated data bundle */
window.GIFT_ORDER = ${JSON.stringify(ORDER)};
window.GIFTS = ${JSON.stringify(clientGifts)};
window.ARCHETYPES = ${JSON.stringify(clientArch)};
window.QUESTIONS = ${JSON.stringify(questions)};
window.INTENSITY = function(score){
  if (score >= 85) return { label: 'Very High', cls: 'vh' };
  if (score >= 61) return { label: 'High', cls: 'h' };
  if (score >= 41) return { label: 'Medium', cls: 'm' };
  if (score >= 16) return { label: 'Low', cls: 'l' };
  return { label: 'Very Low', cls: 'vl' };
};
/* Official scoring (Unified Scoring Instructions), normalized per gift maximum.
   state = { likert: {qid: 1..5}, fc: {qid: 'a'|'b'}, sjt: {sid: {most: idx, least: idx}} } */
window.computeScores = function(state){
  var Q = window.QUESTIONS, ORDER = window.GIFT_ORDER;
  var raw = {}, likertSub = {}, fcSub = {};
  ORDER.forEach(function(g){ raw[g]=0; likertSub[g]=0; fcSub[g]=0; });
  Q.likert.forEach(function(q){
    var r = state.likert[q.id] || 1;
    raw[q.gift] += (r-1); likertSub[q.gift] += (r-1);
  });
  Q.forcedChoice.forEach(function(q){
    var pick = state.fc[q.id];
    if (pick === 'a') { raw[q.giftA] += 4; fcSub[q.giftA] += 4; }
    if (pick === 'b') { raw[q.giftB] += 4; fcSub[q.giftB] += 4; }
  });
  Q.scenarios.forEach(function(s){
    var st = state.sjt[s.id] || {};
    s.gifts.forEach(function(g, idx){
      if (idx === st.most) raw[g] += 4;
      else if (idx === st.least) raw[g] += 0;
      else raw[g] += 1;
    });
  });
  var scores = {};
  ORDER.forEach(function(g){
    scores[g] = Math.max(0, Math.min(100, Math.round(raw[g] / Q.giftMax[g] * 100)));
  });
  var ranked = ORDER.slice().sort(function(a,b){
    return (scores[b]-scores[a]) || (likertSub[b]-likertSub[a]) || (fcSub[b]-fcSub[a]) || (ORDER.indexOf(a)-ORDER.indexOf(b));
  });
  var top3 = ranked.slice(0,3);
  var tieAtCut = scores[ranked[2]] === scores[ranked[3]];
  var arch = window.ARCHETYPES.find(function(a){
    return a.gifts.slice().sort().join() === top3.slice().sort().join();
  });
  return { scores: scores, raw: raw, ranked: ranked, top3: top3,
           archetype: arch ? arch.slug : null, tieAtCut: tieAtCut, date: new Date().toISOString() };
};
`;
}

/* ---------------- js/main.js ---------------- */
const mainJs = `// shared: reveal-on-scroll
(function(){
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .08 }) : null;
  document.querySelectorAll('.rv').forEach(function(el){ io ? io.observe(el) : el.classList.add('in'); });
})();
`;

/* ---------------- write everything ---------------- */
fs.mkdirSync(path.join(OUT, 'gifts'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'archetypes'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });

fs.writeFileSync(path.join(OUT, 'index.html'), homePage());
fs.writeFileSync(path.join(OUT, 'gifts', 'index.html'), giftsIndex());
for (const s of ORDER) fs.writeFileSync(path.join(OUT, 'gifts', `${s}.html`), giftPage(s));
fs.writeFileSync(path.join(OUT, 'archetypes', 'index.html'), archetypesIndex());
for (const a of archData.archetypes) fs.writeFileSync(path.join(OUT, 'archetypes', `${a.slug}.html`), archetypePage(a));
fs.writeFileSync(path.join(OUT, 'foundation.html'), foundationPage());
fs.writeFileSync(path.join(OUT, 'understanding.html'), understandingPage());
fs.writeFileSync(path.join(OUT, 'assessment.html'), assessmentPage());
fs.writeFileSync(path.join(OUT, 'results.html'), resultsPage());
fs.writeFileSync(path.join(OUT, '404.html'), notFoundPage());
fs.writeFileSync(path.join(OUT, 'js', 'data.js'), dataJs());
fs.writeFileSync(path.join(OUT, 'js', 'main.js'), mainJs);
fs.writeFileSync(path.join(OUT, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n/images/*\n  Cache-Control: public, max-age=604800\n/css/*\n  Cache-Control: public, max-age=86400\n/js/*\n  Cache-Control: public, max-age=86400\n`);

console.log('Built pages:', fs.readdirSync(OUT).filter(f => f.endsWith('.html')).length, 'root,',
  fs.readdirSync(path.join(OUT, 'gifts')).length, 'gifts,',
  fs.readdirSync(path.join(OUT, 'archetypes')).length, 'archetypes,', QCOUNT, 'questions');
