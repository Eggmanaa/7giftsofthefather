import re, json

md = open('content/questions.md', encoding='utf-8').read()

def clean(s):
    s = s.replace("\\'", "'").replace('\\"', '"').replace('\\...', '...').replace('\\-','-').replace('\\#','#').replace('\\$','$')
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('shperes', 'spheres')  # typo fix
    return s

# ---------------- Section 1: Likert 1-49 ----------------
s1_start = md.find('**Section 1 of 3')
s2_start = md.find('**Section 2 of 3')
s3_start = md.find('**Section 3 of 3')
scoring_start = md.find('**Unified Scoring Instructions')

s1 = md[s1_start:s2_start]
item_re = re.compile(r'^(\d+)\.\s+(.*?)(?=^\d+\.|\Z)', re.M | re.S)
likert = []
for m in item_re.finditer(s1):
    n = int(m.group(1))
    likert.append({'id': n, 'text': clean(m.group(2))})
print('likert:', len(likert), 'ids', likert[0]['id'], '-', likert[-1]['id'])

# ---------------- Section 2: forced choice 50-70 ----------------
s2 = md[s2_start:s3_start]
fc = []
fc_re = re.compile(r'^(\d+)\.\s+(.*?)(?=^\d+\.|\Z)', re.M | re.S)
for m in fc_re.finditer(s2):
    n = int(m.group(1)); body = m.group(2)
    stem_m = re.match(r'(.*?)(?=-\s+\\?\(A\\?\))', body, re.S)
    stem = clean(stem_m.group(1)) if stem_m else 'I am more driven to...'
    a_m = re.search(r'\\?\(A\\?\)\s*(.*?)(?=-\s+\\?\(B\\?\))', body, re.S)
    b_m = re.search(r'\\?\(B\\?\)\s*(.*)', body, re.S)
    fc.append({'id': n, 'stem': stem, 'a': clean(a_m.group(1)), 'b': clean(b_m.group(1))})
print('forced-choice:', len(fc), 'ids', fc[0]['id'], '-', fc[-1]['id'])

# ---------------- Section 3: scenarios ----------------
s3 = md[s3_start:scoring_start]
scen_re = re.compile(r'\*\*Scenario \\?#(\d+)\*\*(.*?)(?=\*\*Scenario \\?#|\Z)', re.S)
scenarios = []
for m in scen_re.finditer(s3):
    n = int(m.group(1)); body = m.group(2)
    stem_m = re.match(r'(.*?)(?=-\s+\*\*MOST)', body, re.S)
    stem = clean(stem_m.group(1))
    opts = re.findall(r'^\s+(\d)\.\s+(.*?)(?=^\s+\d\.|\Z)', body, re.M | re.S)
    scenarios.append({'id': n, 'stem': stem, 'options': [clean(o[1]) for o in sorted(opts, key=lambda x:int(x[0]))]})
    print('scenario', n, 'options:', len(scenarios[-1]['options']))

# ---------------- scoring maps (from the Unified Scoring Instructions) ----------------
likert_map = {
 'catalyst':[2,9,16,23,30,37,44], 'servant':[3,10,17,24,31,38,45], 'enthusiast':[4,11,18,25,32,39,46],
 'lover':[5,12,19,26,33,40,47], 'strategist':[1,8,15,22,29,36,43], 'erudite':[6,13,20,27,34,41,48],
 'host':[7,14,21,28,35,42,49]}
fc_map = {  # qid: [giftA, giftB]
 50:['catalyst','servant'],51:['enthusiast','catalyst'],52:['catalyst','lover'],53:['strategist','catalyst'],
 54:['erudite','catalyst'],55:['catalyst','host'],56:['enthusiast','servant'],57:['servant','lover'],
 58:['strategist','servant'],59:['servant','erudite'],60:['servant','host'],61:['lover','enthusiast'],
 62:['lover','strategist'],63:['erudite','lover'],64:['lover','host'],65:['strategist','enthusiast'],
 66:['erudite','enthusiast'],67:['enthusiast','host'],68:['strategist','erudite'],69:['host','erudite'],
 70:['strategist','host']}
sjt_map = {1:['strategist','lover','servant','catalyst'], 2:['enthusiast','host','erudite','lover'],
           3:['host','enthusiast','strategist','servant'], 4:['catalyst','strategist','host','enthusiast']}

# validation: each gift 7 likert, 6 fc, and count sjt appearances
from collections import Counter
c = Counter()
for g, qs in likert_map.items():
    assert len(qs) == 7
all_l = sorted(q for qs in likert_map.values() for q in qs)
assert all_l == list(range(1,50)), 'likert map must cover 1..49'
for q,(a,b) in fc_map.items(): c[a]+=1; c[b]+=1
print('fc counts per gift:', dict(c))
sc = Counter()
for s,gl in sjt_map.items():
    assert len(gl)==4
    for g in gl: sc[g]+=1
print('sjt appearances:', dict(sc))
gift_max = {g: 7*4 + c[g]*4 + sc[g]*4 for g in likert_map}
print('true max per gift:', gift_max)

# attach gift to items for convenience
lk_lookup = {q: g for g, qs in likert_map.items() for q in qs}
for it in likert: it['gift'] = lk_lookup[it['id']]
for it in fc: it['giftA'], it['giftB'] = fc_map[it['id']]
for sn in scenarios: sn['gifts'] = sjt_map[sn['id']]

out = {'likert': likert, 'forcedChoice': fc, 'scenarios': scenarios, 'giftMax': gift_max}
json.dump(out, open('content/questions.json','w',encoding='utf-8'), indent=1, ensure_ascii=False)
print('WROTE questions.json')
