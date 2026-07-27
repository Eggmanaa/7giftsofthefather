/* POST /api/analyze — Connection analysis grounded in the 7 Gifts canon.
   Gemini key is read from the GEMINI_API_KEY secret; it is never sent to the browser. */
import { CANON } from './_canon.js';

const MAX_PEOPLE = 4;
const MAX_PDFS = 4;
const MAX_BODY = 9 * 1024 * 1024; // ~9MB

const RELATIONSHIPS = {
  spouse: 'spouses / life partners',
  dating: 'a dating or engaged couple',
  parentchild: 'a parent speaking about their child',
  childparent: 'an adult child speaking about their parent',
  sibling: 'siblings',
  friend: 'close friends',
  coworker: 'coworkers / peers on a team',
  managing: 'a leader and the person they supervise',
  reporting: 'a person and their supervisor',
  ministry: 'ministry or volunteer teammates',
  coaching: 'a coach/counselor and the person they serve',
  cofounder: 'co-founders or ministry partners',
  other: 'two people in an ongoing relationship'
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

function giftBrief(k) {
  const g = CANON.gifts[k];
  if (!g) return '';
  return `- ${g.name} (${g.gift}; ${g.axis} axis). Core question: ${g.coreQuestion}
  Strength: ${g.strength}
  Characterological challenge (${g.challengeName}): ${g.challenge}
  Growth discipline: ${g.discipline}
  When this gift is low: ${g.absence}`;
}

function contentionBrief(a, b) {
  const c = CANON.contentions.find(x => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  if (!c) return '';
  const A = CANON.gifts[c.a].name, B = CANON.gifts[c.b].name;
  return `- ${A} + ${B} — ${c.title}. At its best: ${c.atBest}. Left unbalanced: ${c.faultLine}.`;
}

function topGifts(scores, n = 3) {
  return CANON.order
    .map(k => ({ k, s: Number(scores[k]) || 0 }))
    .sort((x, y) => y.s - x.s)
    .slice(0, n)
    .map(x => x.k);
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) return json({ ok: false, error: 'The analyzer is not configured yet.' }, 503);

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, error: 'Upload too large. Please keep files under ~8MB total.' }, 413);

    let body;
    try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

    const people = Array.isArray(body.people) ? body.people.slice(0, MAX_PEOPLE) : [];
    const pdfs = Array.isArray(body.pdfs) ? body.pdfs.slice(0, MAX_PDFS) : [];
    const relKey = String(body.relationship || 'other');
    const rel = RELATIONSHIPS[relKey] || RELATIONSHIPS.other;
    const note = String(body.note || '').slice(0, 800);
    const flow = body.flow && typeof body.flow === 'object' ? body.flow : null;
    const flowMap = Array.isArray(body.flowMap) ? body.flowMap : null;

    if (!people.length && !pdfs.length) return json({ ok: false, error: 'Add at least one profile or upload a results PDF.' }, 400);

    // ---- grounding ----
    const involved = new Set();
    people.forEach(p => (p.scores ? topGifts(p.scores, 4) : []).forEach(k => involved.add(k)));
    if (!involved.size) CANON.order.forEach(k => involved.add(k));

    const giftLines = CANON.order.filter(k => involved.has(k)).map(giftBrief).join('\n');
    const inv = [...involved];
    const pairLines = [];
    for (let i = 0; i < inv.length; i++)
      for (let j = i + 1; j < inv.length; j++) {
        const line = contentionBrief(inv[i], inv[j]);
        if (line) pairLines.push(line);
      }

    const solo = people.length < 2 && pdfs.length < 2;

    const sys = `You are the Connection Guide for "The 7 Gifts of the Father" — a Romans 12 framework of seven motivational gifts: Catalyst (Prophecy), Servant of All (Service), Erudite (Teaching), Enthusiast (Encouragement), Host (Giving), Strategist (Leadership), Lover (Mercy). A person's top three gifts form one of 35 "archetypes of the soul."

Speak in the language of this framework ONLY. Never use Enneagram, MBTI, DISC, or Life Languages vocabulary. Be warm, direct, and practical — like a trusted pastor-coach who tells the truth kindly. Faith-aware but not preachy. Never diagnose, never label anyone as broken, and never speak about a person who did not consent as if you know their inner life — describe patterns, not verdicts.

THE GIFTS IN PLAY:
${giftLines}

DOCUMENTED POINTS OF CONTENTION (use these exact tensions — do not invent new ones):
${pairLines.join('\n') || '(none — the profiles share the same gifts)'}

RULES:
- Use the supplied Ease of Flow number and band exactly as given. Never invent a different score.
- Ground every claim about friction in the documented contentions above, and name each one by its exact
  documented title in bold (for example: **Brutal Honesty vs. Emotional Safety**) before explaining it.
- Write EVERY section requested. Do not stop early or merge sections.
- Name both the gift and the person when describing a pattern (e.g., "Aaron's Catalyst…").
- Give concrete, sayable language — actual sentences people can use — not abstractions.
- Be thorough and substantive. Develop every section fully — several sentences, or 3-5 rich bullets —
  with specific detail drawn from THESE profiles. Depth and usefulness are the goal, not brevity.
- Still earn every sentence: no filler, no flattery, and never restate the framework back to them.
- Length: aim for roughly 2,200-3,200 words for a two-or-more-person analysis, and 1,500-2,200 for a single
  profile. Reach that length with genuine specificity — more concrete examples, more sayable sentences,
  more of how this actually plays out day to day — never with padding or repetition.
- Output GitHub-flavored Markdown using only \`##\` headings and \`-\` bullets. No preamble.`;

    const nameOf = (p, i) => (p && p.name ? String(p.name).slice(0, 40) : `Person ${i + 1}`);
    const profileBlock = people.map((p, i) => {
      const t = p.scores ? topGifts(p.scores, 3).map(k => CANON.gifts[k].name) : [];
      const low = p.scores ? topGifts(p.scores, 7).slice(-2).map(k => CANON.gifts[k].name) : [];
      const arch = p.archetype ? ` — archetype: ${p.archetype}` : '';
      const sc = p.scores ? CANON.order.map(k => `${CANON.gifts[k].name} ${Math.round(Number(p.scores[k]) || 0)}`).join(', ') : 'from uploaded PDF';
      return `${nameOf(p, i)}${arch}\n  Top three: ${t.join(' · ') || 'see PDF'}\n  Lowest two: ${low.join(', ') || 'see PDF'}\n  Scores: ${sc}`;
    }).join('\n\n');

    let ask;
    if (solo) {
      const mapLines = flowMap
        ? flowMap.map(m => `- ${CANON.gifts[m.gift].name}: ${m.flow}/100 (${m.band})`).join('\n')
        : '(not supplied)';
      ask = `Analyze ONE profile: which kinds of people they naturally flow with, and where they will have to work.

PROFILE:
${profileBlock || '(see attached PDF)'}

EASE OF FLOW WITH EACH GIFT (computed — use these numbers):
${mapLines}

${note ? `Their note: ${note}\n` : ''}
Write these sections:
## How You Connect
(how this specific chord meets other people)
## Who You Flow With Naturally
(name the gifts and the archetypes, and say why it is easy)
## Who Will Stretch You
(name the documented tensions by title and what they will feel like)
## What You Bring That Others Need
## What You'll Need From Others
(be concrete about what to ask for)
## Your Blind Spots in Relationship
(from the lowest gifts — what you will consistently miss)
## Scripts That Will Serve You
(6-8 sentences you can actually say, and when)
## Three Moves This Week`;
    } else {
      const f = flow || {};
      const shared = (f.sharedTop || []).map(k => CANON.gifts[k].name);
      const fp = (f.frictionPairs || []).map(p => `- ${CANON.gifts[p.a].name} + ${CANON.gifts[p.b].name} — ${p.title} (intensity ${p.w}/100)`).join('\n');
      ask = `Analyze the connection between these people, who are ${rel}.

PROFILES:
${profileBlock || '(see attached PDFs — extract each person\'s seven gift scores and top three)'}

COMPUTED (use exactly):
- Ease of Flow: ${f.flow ?? '?'}/100 — ${f.band ?? ''}
- Shared language (resonance): ${f.resonance ?? '?'}/100
- Complementarity: ${f.complement ?? '?'}/100
- Friction load: ${f.friction ?? '?'}/100
- Shared top gifts: ${shared.join(', ') || 'none'}
${fp ? `- Sharpest documented tensions:\n${fp}` : ''}

${note ? `Context they gave: ${note}\n` : ''}
Write these sections:
## The Read
(2-3 sentences interpreting the Ease of Flow score for ${rel}. Say plainly what is easy and what will cost them.)
## Where You Connect
(the real bridges between these specific gifts — not generic compatibility)
## What Each of You Naturally Brings
(a developed paragraph or bullet set per person, gift by gift)
## Where Friction Lives
(name each documented tension by its exact title, then explain how it actually shows up between ${rel})
## How It Shows Up Day to Day
(4-6 concrete recurring scenes this pairing repeats — the argument you keep having, the moment that stalls)
## Shared Blind Spots
(what they are BOTH low in, and what that costs them together that neither will notice)
## How to Bridge It
(specific practices, each tied back to a named tension)
## Scripts for the Hard Moments
(6-8 actual sentences, labeled with who says them and when)
## A Word for Each of You
(a substantial, direct paragraph addressed to each person by name)
## The Next 30 Days
(a short, specific plan they could actually run together)`;
    }

    const parts = [{ text: ask }];
    for (const f of pdfs) {
      if (!f || !f.data) continue;
      parts.push({ inlineData: { mimeType: f.mime || 'application/pdf', data: String(f.data) } });
    }

    const primary  = env.GEMINI_MODEL || 'gemini-3.5-flash';
    const fallback = env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';

    const payload = JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 32000, thinkingConfig: { thinkingBudget: 20000 } },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    });

    const call = (m) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload }
    );

    // Primary model first; if it is rate-limited or erroring, fall back so visitors are never blocked.
    let model = primary;
    let upstream = await call(model);
    if (!upstream.ok && (upstream.status === 429 || upstream.status >= 500) && fallback && fallback !== primary) {
      model = fallback;
      upstream = await call(model);
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      const msg = upstream.status === 429
        ? 'The analyzer has reached its daily limit. Please try again tomorrow, or let Aaron know it needs more capacity.'
        : 'The analyzer could not complete that request.';
      return json({ ok: false, error: msg, status: upstream.status, detail: detail.slice(0, 300) }, 502);
    }

    const { readable, writable } = new TransformStream();
    (async () => {
      const w = writable.getWriter();
      const enc = new TextEncoder(), dec = new TextDecoder();
      const reader = upstream.body.getReader();
      let buf = '', any = false;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const j = JSON.parse(payload);
              const t = (j?.candidates?.[0]?.content?.parts || []).map(x => x.text || '').join('');
              if (t) { any = true; await w.write(enc.encode(t)); }
            } catch (_) {}
          }
        }
        if (!any) await w.write(enc.encode('\n\n_No analysis was returned. Please try again._'));
      } catch (_) {
        await w.write(enc.encode('\n\n_The analysis was interrupted. Please try again._'));
      } finally {
        try { await w.close(); } catch (_) {}
      }
    })();

    return new Response(readable, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-model': model }
    });
  } catch (err) {
    return json({ ok: false, error: 'Something went wrong running the analysis.', detail: String(err).slice(0, 200) }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, service: 'connection-analyzer', ready: true });
}
