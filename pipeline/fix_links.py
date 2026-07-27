"""Post-build: rewrite internal .html links to extensionless absolute URLs (Cloudflare Pages pretty URLs).
Run from the repo root after `node pipeline/build.js`: python3 pipeline/fix_links.py
"""
import re, glob, posixpath

SITE = 'https://7giftsofthefather.pages.dev'

def fix_canonical(path):
    """Canonical URL derived from the file's own location, so it can never drift."""
    rel = posixpath.relpath(path, 'site')
    if rel == '404.html':
        s = open(path, encoding='utf-8').read()
        s = re.sub(r'\s*<link rel="canonical"[^>]*>', '', s)   # a 404 must not canonicalise
        open(path, 'w', encoding='utf-8').write(s); return
    if rel.endswith('/index.html'): target = rel[:-10]
    elif rel == 'index.html':       target = ''
    elif rel.endswith('.html'):     target = rel[:-5]
    else:                           target = rel
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'<link rel="canonical" href="[^"]*">',
               f'<link rel="canonical" href="{SITE}/{target}">', s)
    open(path, 'w', encoding='utf-8').write(s)


def fix_html(path):
    base = posixpath.dirname(posixpath.relpath(path, 'site'))
    s = open(path, encoding='utf-8').read()
    def repl(m):
        attr, u = m.group(1), m.group(2)
        if u.startswith(('http', 'mailto', 'data:', '#')): return m.group(0)
        target = posixpath.normpath(posixpath.join('/', base, u)) if not u.startswith('/') else posixpath.normpath(u)
        if target.endswith('/index.html'): target = target[:-10] or '/'
        elif target.endswith('.html'): target = target[:-5]
        return f'{attr}="{target}"'
    s = re.sub(r'(href|action)="([^"]+?\.html(?:#[^"]*)?)"', repl, s)
    open(path, 'w', encoding='utf-8').write(s)

for f in glob.glob('site/**/*.html', recursive=True):
    fix_html(f)
    fix_canonical(f)
print('done')
