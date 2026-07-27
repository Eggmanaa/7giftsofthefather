/* connect.js — Connection Analyzer UI */
(function () {
  var C = window.CANON;
  if (!C) return;
  var COLOR = {
    catalyst: '#C6512D', servant: '#D5A214', erudite: '#A98D6C',
    enthusiast: '#C77E8B', host: '#3B9A6C', strategist: '#8593A3', lover: '#9A8BCB'
  };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var people = [], seq = 0;

  function saved() { try { return JSON.parse(localStorage.getItem('sg7_results_v1')); } catch (e) { return null; } }
  function blankScores() { var o = {}; C.order.forEach(function (k) { o[k] = 50; }); return o; }

  function chordOf(scores) {
    var a = C.archetypeFor(scores);
    var t3 = C.order.map(function (k) { return { k: k, s: scores[k] || 0 }; })
      .sort(function (x, y) { return y.s - x.s; }).slice(0, 3);
    return { arch: a, top3: t3.map(function (x) { return x.k; }) };
  }

  /* ---------- person cards ---------- */
  function addPerson(prefill) {
    if (people.length >= 4) return;
    var p = {
      id: ++seq,
      name: (prefill && prefill.name) || (people.length === 0 ? 'Me' : 'Person ' + (people.length + 1)),
      mode: (prefill && prefill.mode) || 'manual',
      scores: (prefill && prefill.scores) || blankScores(),
      pdf: null
    };
    people.push(p);
    render();
  }

  function personCard(p) {
    var info = chordOf(p.scores);
    var sliders = C.order.map(function (k) {
      var g = C.gifts[k];
      return '<div class="sl-row"><label style="color:' + COLOR[k] + '">' + esc(g.name) + '</label>' +
        '<input type="range" min="0" max="100" value="' + Math.round(p.scores[k] || 0) + '" data-p="' + p.id + '" data-g="' + k + '" style="accent-color:' + COLOR[k] + '">' +
        '<output>' + Math.round(p.scores[k] || 0) + '</output></div>';
    }).join('');

    var chips = info.top3.map(function (k) {
      return '<span class="chip" style="background:' + COLOR[k] + '1f;color:' + COLOR[k] + '">' + esc(C.gifts[k].name) + '</span>';
    }).join('');

    return '<div class="pcard" data-card="' + p.id + '">' +
      '<div class="pc-head">' +
      '<input class="pc-name" value="' + esc(p.name) + '" data-name="' + p.id + '" placeholder="Name">' +
      (people.length > 1 ? '<button class="pc-x" data-del="' + p.id + '" title="Remove">×</button>' : '') +
      '</div>' +
      '<div class="seg">' +
      '<button data-mode="manual" data-p="' + p.id + '" class="' + (p.mode === 'manual' ? 'on' : '') + '">Set gifts</button>' +
      '<button data-mode="saved" data-p="' + p.id + '" class="' + (p.mode === 'saved' ? 'on' : '') + '">My results</button>' +
      '<button data-mode="pdf" data-p="' + p.id + '" class="' + (p.mode === 'pdf' ? 'on' : '') + '">Upload PDF</button>' +
      '</div>' +
      (p.mode === 'manual' ? '<div class="sliders">' + sliders + '</div>' : '') +
      (p.mode === 'saved' ? '<div class="pc-note">' + (saved() ? 'Loaded from your saved assessment on this device.' : 'No saved results found on this device. Take the assessment, or use “Set gifts”.') + '</div>' : '') +
      (p.mode === 'pdf' ? '<div class="pc-note"><input type="file" accept="application/pdf" data-file="' + p.id + '">' +
        (p.pdf ? '<div class="ok">Attached: ' + esc(p.pdf.name) + '</div>' : '<div class="hint">Upload their results PDF — the analyzer will read the scores.</div>') + '</div>' : '') +
      '<div class="pc-foot">' + chips + (info.arch ? '<span class="arch">' + esc(info.arch.name) + '</span>' : '') + '</div>' +
      '</div>';
  }

  function render() {
    var host = $('#people');
    if (!host) return;
    host.innerHTML = people.map(personCard).join('');
    $('#addPerson').style.display = people.length >= 4 ? 'none' : '';
    updateMeters();
  }

  /* ---------- meters ---------- */
  function bar(label, val, color) {
    return '<div class="mini"><span>' + esc(label) + '</span><div class="mtrack"><i style="width:' + val + '%;background:' + color + '"></i></div><b>' + val + '</b></div>';
  }

  function meterBlock(a, b, r) {
    var hue = r.flow >= 70 ? '#3B9A6C' : r.flow >= 55 ? '#D5A214' : r.flow >= 42 ? '#C6512D' : '#A62B0F';
    return '<div class="meter">' +
      '<div class="m-top"><span class="m-who">' + esc(a.name) + ' <i>&harr;</i> ' + esc(b.name) + '</span>' +
      '<span class="m-band" style="color:' + hue + '">' + esc(r.band) + '</span></div>' +
      '<div class="m-num" style="color:' + hue + '">' + r.flow + '<small>/100 ease of flow</small></div>' +
      '<div class="mtrack big"><i style="width:' + r.flow + '%;background:linear-gradient(90deg,#C6512D,#D5A214,#3B9A6C)"></i></div>' +
      bar('Shared language', r.resonance, '#8593A3') +
      bar('Complementarity', r.complement, '#3B9A6C') +
      bar('Friction load', r.friction, '#C6512D') +
      (r.sharedTop.length ? '<div class="m-shared">Shared gifts: ' + r.sharedTop.map(function (k) { return '<span class="chip" style="background:' + COLOR[k] + '1f;color:' + COLOR[k] + '">' + esc(C.gifts[k].name) + '</span>'; }).join('') + '</div>' : '') +
      '</div>';
  }

  function scored() { return people.filter(function (p) { return p.mode !== 'pdf'; }); }

  function pairs() {
    var s = scored(), out = [];
    for (var i = 0; i < s.length; i++) for (var j = i + 1; j < s.length; j++)
      out.push({ a: s[i], b: s[j], r: C.flowScore(s[i], s[j]) });
    return out;
  }

  function updateMeters() {
    var host = $('#meters'); if (!host) return;
    var s = scored();
    if (s.length >= 2) {
      host.innerHTML = pairs().map(function (p) { return meterBlock(p.a, p.b, p.r); }).join('');
    } else if (s.length === 1) {
      var map = C.flowMap(s[0]);
      host.innerHTML = '<div class="meter"><div class="m-top"><span class="m-who">' + esc(s[0].name) + ' — natural flow by gift</span></div>' +
        map.map(function (m) { return bar(C.gifts[m.gift].name, m.flow, COLOR[m.gift]); }).join('') +
        '<div class="hint" style="margin-top:10px">Add a second person to compare two profiles.</div></div>';
    } else host.innerHTML = '';
  }

  /* ---------- markdown ---------- */
  function md(t) {
    var lines = String(t).split('\n'), out = [], list = null;
    function closeList() { if (list) { out.push('</' + list + '>'); list = null; } }
    lines.forEach(function (ln) {
      var s = ln.trim();
      if (!s) { closeList(); return; }
      s = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
      if (/^##\s+/.test(s)) { closeList(); out.push('<h3>' + s.replace(/^##\s+/, '') + '</h3>'); return; }
      if (/^#\s+/.test(s)) { closeList(); out.push('<h3>' + s.replace(/^#\s+/, '') + '</h3>'); return; }
      if (/^[-*]\s+/.test(s)) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + s.replace(/^[-*]\s+/, '') + '</li>'); return; }
      if (/^\d+\.\s+/.test(s)) { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + s.replace(/^\d+\.\s+/, '') + '</li>'); return; }
      closeList(); out.push('<p>' + s + '</p>');
    });
    closeList();
    return out.join('');
  }

  function fileToB64(f) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1]); };
      r.onerror = rej; r.readAsDataURL(f);
    });
  }

  /* ---------- run ---------- */
  async function run() {
    var btn = $('#run'), out = $('#out');
    var s = scored();
    var pdfPeople = people.filter(function (p) { return p.mode === 'pdf' && p.pdf; });
    if (!s.length && !pdfPeople.length) { out.innerHTML = '<div class="err">Add at least one profile, or upload a results PDF.</div>'; return; }

    btn.disabled = true; btn.textContent = 'Reading the chord…';
    out.innerHTML = '<div class="loading">Listening for where these gifts meet…</div>';

    var pl = {
      relationship: $('#rel').value,
      note: $('#note').value || '',
      people: s.map(function (p) {
        var a = C.archetypeFor(p.scores);
        return { name: p.name, scores: p.scores, archetype: a ? a.name : '' };
      }),
      pdfs: pdfPeople.map(function (p) { return { name: p.name, mime: p.pdf.mime, data: p.pdf.data }; })
    };
    var ps = pairs();
    if (ps.length) {
      pl.flow = ps[0].r;
      if (ps.length > 1) {
        pl.note = (pl.note ? pl.note + ' | ' : '') + 'All pairs: ' +
          ps.map(function (x) { return x.a.name + '/' + x.b.name + ' ' + x.r.flow; }).join(', ');
      }
    } else if (s.length === 1) pl.flowMap = C.flowMap(s[0]);

    try {
      var res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(pl)
      });
      var ct = res.headers.get('content-type') || '';
      if (ct.indexOf('application/json') > -1) {
        var data = await res.json();
        throw new Error(data.error || 'Analysis failed.');
      }
      out.innerHTML = '<div class="analysis"></div>';
      var target = out.querySelector('.analysis');
      var reader = res.body.getReader(), dec = new TextDecoder(), acc = '';
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        acc += dec.decode(chunk.value, { stream: true });
        target.innerHTML = md(acc);
      }
      if (!acc.trim()) out.innerHTML = '<div class="err">No analysis was returned. Please try again.</div>';
    } catch (e) {
      out.innerHTML = '<div class="err">' + esc(e.message || 'Something went wrong.') + ' Please try again.</div>';
    } finally {
      btn.disabled = false; btn.textContent = 'Analyze the connection';
    }
  }

  /* ---------- events ---------- */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.g) {
      var p = people.find(function (x) { return x.id == t.dataset.p; });
      if (p) { p.scores[t.dataset.g] = Number(t.value); var o = t.parentNode.querySelector('output'); if (o) o.textContent = t.value; updateMeters(); }
    }
    if (t.dataset && t.dataset.name) {
      var q = people.find(function (x) { return x.id == t.dataset.name; });
      if (q) { q.name = t.value; updateMeters(); }
    }
  });

  document.addEventListener('change', async function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.file) {
      var p = people.find(function (x) { return x.id == t.dataset.file; });
      var f = t.files && t.files[0];
      if (p && f) {
        if (f.size > 6 * 1024 * 1024) { alert('That PDF is larger than 6MB. Please upload a smaller file.'); return; }
        p.pdf = { name: f.name, mime: f.type || 'application/pdf', data: await fileToB64(f) };
        render();
      }
    }
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.mode) {
      var p = people.find(function (x) { return x.id == t.dataset.p; });
      if (p) {
        p.mode = t.dataset.mode;
        if (p.mode === 'saved') {
          var r = saved();
          if (r && r.scores) { p.scores = Object.assign(blankScores(), r.scores); }
        }
        render();
      }
    }
    if (t.dataset.del) { people = people.filter(function (x) { return x.id != t.dataset.del; }); render(); }
    if (t.id === 'addPerson') addPerson();
    if (t.id === 'run') run();
  });

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('#people')) return;
    var r = saved();
    addPerson(r && r.scores ? { name: 'Me', mode: 'saved', scores: Object.assign(blankScores(), r.scores) } : null);
    addPerson({ name: 'Them' });
  });
})();
