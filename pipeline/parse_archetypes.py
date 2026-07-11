import re, json, io

md = open('content/archetypes.md', encoding='utf-8').read()

def clean(s):
    s = s.replace("\\'", "'").replace('\\"', '"').replace('\\...', '...').replace('\\-', '-')
    s = re.sub(r'\.\^\d+\^', '.', s)          # .^1^ -> .
    s = re.sub(r'\^\d+\^', '', s)             # ^1^  -> ''
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def para_join(block):
    """Split a markdown block into cleaned paragraphs."""
    paras = [clean(p) for p in re.split(r'\n\s*\n', block) if clean(p)]
    return [p for p in paras if p]

GIFTS = ['Catalyst','Servant','Erudite','Enthusiast','Host','Strategist','Lover']

# ---------- master table: essence per archetype ----------
essences = {}
table_re = re.compile(r'^\s{2}\*\*(.+?)\*\*\s{2,}((?:[A-Za-z ]+,\s*)+[A-Za-z ]+?)\s{2,}(To .+)$', re.M)
for m in table_re.finditer(md):
    essences[clean(m.group(1))] = clean(m.group(3))
print('essences parsed:', len(essences))

# ---------- sections ----------
sec_re = re.compile(r'^### (Section \d+): (.+?)$', re.M)
sections = []
for m in sec_re.finditer(md):
    sections.append({'num': m.group(1), 'title': clean(m.group(2)), 'start': m.end()})
# capture each section's intro (text until first ####)
for i, s in enumerate(sections):
    end = md.find('####', s['start'])
    s['intro'] = ' '.join(para_join(md[s['start']:end]))

# ---------- archetypes ----------
arch_re = re.compile(r'^#### (\d+)\. (.+?)$', re.M)
matches = list(arch_re.finditer(md))
archetypes = []
for i, m in enumerate(matches):
    num = int(m.group(1)); name = clean(m.group(2))
    end = matches[i+1].start() if i+1 < len(matches) else md.find('### Embracing')
    body = md[m.end():end]
    # constituent gifts bullet
    gm = re.search(r'\*\*Constituent Gifts:\*\*(.+?)(?:\n\s*\n)', body, re.S)
    gifts_raw = clean(gm.group(1)) if gm else ''
    gifts = [g for g in GIFTS if re.search(r'\b'+g+r'\b', gifts_raw)]
    body_wo = body[gm.end():] if gm else body
    paras = para_join(body_wo)
    # section membership
    sec = None
    for s in sections:
        if m.start() > s['start']: sec = s['num'] + ': ' + s['title']
    archetypes.append({
        'num': num, 'name': name, 'gifts': gifts, 'giftsRaw': gifts_raw,
        'essence': essences.get(name, ''), 'section': sec, 'paragraphs': paras
    })

# ---------- overture + closing content for index page ----------
def grab(h, stop):
    a = md.find(h)
    b = md.find(stop)
    return ' '.join(para_join(md[a+len(h):b]))

overture = {
    'foundation': grab('### The Foundation of Grace', '### From Single Gifts'),
    'chord': grab('### From Single Gifts to a Motivational Chord', '### The Three Axes'),
    'axes': grab('### The Three Axes of Contribution: Why, How, and Who', '### How to Use This Guide'),
    'howto': grab('### How to Use This Guide', '### Master Reference Table'),
}
closing = {
    'harmony': grab('### Embracing Your Unique Harmony', '### Minding the Dissonance'),
    'dissonance': grab('### Minding the Dissonance: Navigating Your Archetype\\\'s Shadows', '### Playing in an Orchestra') or grab("### Minding the Dissonance", '### Playing in an Orchestra'),
    'orchestra': grab('### Playing in an Orchestra: Your Archetype in Relationships', '### A Final Commission'),
    'commission': grab('### A Final Commission', '#### Works cited'),
}

out = {'archetypes': archetypes, 'sections': [{k: s[k] for k in ('num','title','intro')} for s in sections],
       'overture': overture, 'closing': closing}
json.dump(out, open('content/archetypes.json','w', encoding='utf-8'), indent=1, ensure_ascii=False)

# ---- validation ----
print('archetypes:', len(archetypes))
bad = [a['name'] for a in archetypes if len(a['gifts']) != 3]
print('bad gift triples:', bad)
noess = [a['name'] for a in archetypes if not a['essence']]
print('missing essence:', noess)
short = [(a['num'], a['name'], len(' '.join(a['paragraphs']))) for a in archetypes if len(' '.join(a['paragraphs'])) < 1200]
print('suspiciously short:', short)
combos = set(tuple(sorted(a['gifts'])) for a in archetypes)
print('unique combos:', len(combos))
import itertools
allc = set(tuple(sorted(c)) for c in itertools.combinations(GIFTS,3))
print('missing combos:', allc - combos)
