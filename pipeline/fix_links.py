"""Post-build: rewrite internal .html links to extensionless absolute URLs (Cloudflare Pages pretty URLs).
Run from the repo root after `node pipeline/build.js`: python3 pipeline/fix_links.py
"""
import re, glob, posixpath

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
print('done')
