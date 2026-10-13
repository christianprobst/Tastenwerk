/* Tastenwerk – Programmlogik. Benötigt js/data.js */

'use strict';

const $ = s => document.querySelector(s);
const R = n => Math.floor(Math.random() * n);
const pick = a => a[R(a.length)];

/* ---------- storage ---------- */
const store = {
  get(){ try { return JSON.parse(localStorage.getItem('tastenwerk') || '{}'); } catch(e){ return {}; } },
  set(v){ try { localStorage.setItem('tastenwerk', JSON.stringify(v)); } catch(e){} }
};
const saved = store.get();
const settings = Object.assign({layout:'ch', block:true, colors:true, sound:false}, saved.settings || {});
let results = saved.results || {};
let tempoLog = saved.tempo || [];
let chronik = saved.chronik || [];
const persist = () => store.set({settings, results, tempo: tempoLog, chronik, mode: S.mode, lesson: S.lesson});

/* ---------- keyboard ---------- */
let charMap = {};
function buildCharMap(){
  charMap = {' ': {space:true, finger:4}};
  LAYOUTS[settings.layout].forEach((row, r) => row.forEach((p, i) => {
    const [b, s] = [...p];
    const f = ROW_FINGERS[r][i];
    if (!charMap[b]) charMap[b] = {r, i, shift:false, finger:f};
    if (s && !charMap[s]) charMap[s] = {r, i, shift:true, finger:f};
  }));
}

function buildKeyboard(){
  const kb = $('#kbd'); kb.innerHTML = '';
  const rows = LAYOUTS[settings.layout];
  const mk = (cls, html, grow, attrs = {}) => {
    const d = document.createElement('div');
    d.className = 'k ' + cls; d.innerHTML = html; d.style.flexGrow = grow;
    for (const a in attrs) d.setAttribute(a, attrs[a]);
    return d;
  };
  const keyHtml = p => {
    const [b, s] = [...p];
    const letter = /\p{L}/u.test(b) && b.toUpperCase() === s;
    return letter ? b.toUpperCase() : `<small>${s}</small>${b}`;
  };
  const pre = [null, ['Tab', 1.5], ['Feststell', 1.8], ['⇧', 1.3, 'shiftL']];
  const post = [['⌫', 2], ['↵', 1.5], ['', 1.2], ['⇧', 2.7, 'shiftR']];
  rows.forEach((row, r) => {
    const line = document.createElement('div'); line.className = 'krow';
    if (pre[r]) line.append(mk('fn', pre[r][0], pre[r][1], pre[r][2] ? {id: pre[r][2], 'data-f': pre[r][2] === 'shiftL' ? 0 : 9} : {}));
    row.forEach((p, i) => {
      const bump = r === 2 && (i === 3 || i === 6) ? ' bump' : '';
      line.append(mk('key' + bump, keyHtml(p), 1, {id: `k-${r}-${i}`, 'data-f': ROW_FINGERS[r][i]}));
    });
    const po = post[r];
    line.append(mk('fn', po[0], po[1], po[2] ? {id: po[2], 'data-f': 9} : {}));
    kb.append(line);
  });
  const last = document.createElement('div'); last.className = 'krow';
  last.append(mk('fn', 'Strg', 1.4), mk('fn', 'Alt', 1.4), mk('', 'Leertaste', 7.2, {id: 'k-space', 'data-f': 4}), mk('fn', 'AltGr', 1.4), mk('fn', 'Strg', 1.4));
  kb.append(last);
  kb.classList.toggle('plain', !settings.colors);
}

function buildLegend(){
  const items = [['--f-pinky','kleiner Finger'],['--f-ring','Ringfinger'],['--f-middle','Mittelfinger'],['--f-index','Zeigefinger'],['--f-thumb','Daumen']];
  $('#legend').innerHTML = settings.colors ? items.map(([v, n]) => `<span><i style="background:var(${v})"></i>${n}</span>`).join('') : '';
}

/* ---------- lessons ---------- */
let LESSONS = [];
function buildLessons(){
  let letters = '', punct = '', shift = false, digits = false;
  LESSONS = DEFS.map(d => {
    const add = (d.add || '') + (settings.layout === 'de' && d.addDE ? d.addDE : '');
    letters += add;
    if (d.punct) punct += d.punct;
    if (d.shift) shift = true;
    if (d.digits) digits = true;
    const kind = d.shift ? 'shift' : d.digits ? 'digits' : d.punct ? 'punct' : 'letters';
    const neu = kind === 'shift' ? [] : kind === 'digits' ? [...'1234567890'] : kind === 'punct' ? [...d.punct] : [...add];
    return {title: (settings.layout === 'ch' && d.tCH) || d.t, letters, punct, shift, digits, kind, neu};
  });
}
function allowed(L){
  const A = new Set([' ', ...L.letters, ...L.punct]);
  if (L.shift) for (const c of L.letters) { const C = c.toUpperCase(); if (C !== c && charMap[C]) A.add(C); }
  if (L.digits) for (const c of '1234567890') A.add(c);
  return A;
}


function wordPool(L){
  const A = allowed(L), out = new Set();
  for (let w of WORDS) {
    if (settings.layout === 'ch') w = w.replace(/ß/g, 'ss');
    if (!L.shift) w = w.toLowerCase();
    if ([...w].every(c => A.has(c) && charMap[c])) out.add(w);
  }
  return [...out];
}
function stream(gen, len){
  const out = []; let n = 0, guard = 0;
  while (n < len && guard++ < 400) { const t = gen(); if (!t) break; out.push(t); n += t.length + 1; }
  return out.join(' ');
}
const capFirst = w => { const C = w[0].toUpperCase(); return charMap[C] ? C + w.slice(1) : w; };

function sentences(L, pool, pref, len){
  const A = allowed(L);
  const w = () => (pref.length && Math.random() < .45) ? pick(pref) : pick(pool);
  if (!A.has('.')) return stream(w, len);
  const out = []; let n = 0;
  while (n < len) {
    const k = 4 + R(4), ws = [];
    for (let i = 0; i < k; i++) ws.push(w());
    if (L.digits && Math.random() < .6) ws.splice(1 + R(k - 1), 0, String(1 + R(250)));
    if (A.has(':') && Math.random() < .2) ws[0] += ':';
    else if (A.has(',') && k > 4 && Math.random() < .5) ws[2] += ',';
    if (A.has('-') && Math.random() < .2) { ws[k - 2] += '-' + ws[k - 1]; ws.pop(); }
    if (L.shift) ws[0] = capFirst(ws[0]);
    const s = ws.join(' ') + (A.has('?') && Math.random() < .25 ? '?' : '.');
    out.push(s); n += s.length + 1;
  }
  return out.join(' ');
}

function genExercise(L, ex){
  const letters = [...L.letters];
  const neu = L.neu.length ? L.neu : letters;
  const known = letters.filter(c => !neu.includes(c));
  const K = known.length ? known : neu;
  const syll = () => { const n = 3 + R(3); let s = ''; for (let i = 0; i < n; i++) s += Math.random() < .45 ? pick(neu) : pick(letters); return s; };
  let pool = wordPool(L);
  if (pool.length < 4) pool = Array.from({length: 20}, () => syll().replace(/[^a-zäöüß]/g, '') || 'asdf');
  const lower = [...new Set(pool.map(w => w.toLowerCase()))];
  const neuWords = pool.filter(w => neu.some(c => w.toLowerCase().includes(c)));

  if (L.kind === 'shift') {
    if (ex === 0) return stream(() => { const c = pick(letters), C = c.toUpperCase(); return charMap[C] ? C + c + c : c + c + c; }, 60);
    if (ex === 1) return stream(() => capFirst(pick(lower)), 70);
    if (ex === 2) { const caps = pool.filter(w => /^\p{Lu}/u.test(w)); return stream(() => pick(caps.length > 3 ? caps : pool), 90); }
    return sentences(L, pool, pool.filter(w => /^\p{Lu}/u.test(w)), 160);
  }
  if (L.kind === 'digits') {
    if (ex === 0) return stream(() => { const x = pick(neu), y = pick(neu); return pick([x + x + x, x + y + x, x + x + y]); }, 60);
    if (ex === 1) return stream(() => String(R(10000)), 70);
    if (ex === 2) { const nouns = pool.filter(w => /^\p{Lu}/u.test(w)); return stream(() => (2 + R(98)) + ' ' + pick(nouns.length ? nouns : pool), 90); }
    return sentences(L, pool, [], 160);
  }
  if (L.kind === 'punct') {
    const punc = (w) => {
      const p = pick(neu);
      if (p === '-') return w + '-' + pick(pool);
      return w + p;
    };
    if (ex === 0) return stream(() => { const p = pick(neu); const c = pick(K); return p === '-' ? c + '-' + c : c + c + p; }, 60);
    if (ex === 1) return stream(() => punc(pick(lower)), 70);
    if (ex === 2) return stream(() => Math.random() < .5 ? punc(pick(pool)) : pick(pool), 90);
    return sentences(L, pool, [], 160);
  }
  if (ex === 0) return stream(() => { const x = pick(neu), y = pick(K); return pick([x + x + x, x + y + x, y + x + y, x + x + y]); }, 60);
  if (ex === 1) return stream(syll, 70);
  if (ex === 2) return stream(() => (neuWords.length > 3 && Math.random() < .6) ? pick(neuWords) : pick(pool), 90);
  return sentences(L, pool, neuWords, 160);
}

/* ---------- tempo and custom texts ---------- */
const fixLayout = t => settings.layout === 'ch' ? t.replace(/ß/g, 'ss') : t;
function tempoText(){
  const order = [...PASSAGES].sort(() => Math.random() - .5);
  let t = ''; let i = 0;
  while (t.length < 2600) { t += (t ? ' ' : '') + order[i % order.length]; i++; }
  return fixLayout(t);
}
function cleanCustom(t){
  return t.replace(/[„“”«»]/g, '"').replace(/[‚‘’‹›]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ').trim();
}

/* ---------- state ---------- */
const S = {mode: saved.mode || 'lesson', lesson: saved.lesson || 0, ex: 0, tempoDur: 60, custom: SAMPLE_CUSTOM,
  text:'', pos:0, keys:0, errors:0, errAt:new Set(), start:0, done:false, tick:null, spans:[], lastTop:-1, wrongNow:false};

/* ---------- sound ---------- */
let actx = null;
function sound(type){
  if (!settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, g = actx.createGain(); g.connect(actx.destination);
    if (type === 'bell') {
      const o = actx.createOscillator(); o.frequency.value = 1760; o.connect(g);
      g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.2); o.start(t); o.stop(t + 1.2);
      return;
    }
    const len = type === 'err' ? .09 : .03;
    const buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = actx.createBufferSource(); src.buffer = buf;
    const f = actx.createBiquadFilter(); f.type = type === 'err' ? 'lowpass' : 'highpass'; f.frequency.value = type === 'err' ? 400 : 1800;
    src.connect(f); f.connect(g); g.gain.value = type === 'err' ? .6 : .35; src.start(t);
  } catch(e){}
}

/* ---------- rendering ---------- */
const keyOf = (L, e) => `${settings.layout}-${L}-${e}`;
const starsOf = (L, e) => (results[keyOf(L, e)] || {}).stars || 0;

function renderSummary(){
  let passed = 0;
  LESSONS.forEach((_, l) => EX_NAMES.forEach((_, e) => { if (starsOf(l, e) > 0) passed++; }));
  const best = tempoLog.filter(t => t.layout === settings.layout).reduce((m, t) => Math.max(m, t.kpm), 0);
  $('#summary').innerHTML = `<strong>${passed}</strong> von ${LESSONS.length * 4} Übungen bestanden${best ? ` · Tempo-Bestwert <strong>${best}</strong> A/Min` : ''}`;
}

function renderNav(){
  const side = $('#side');
  let h = '<h2>Lektionen</h2>';
  LESSONS.forEach((L, i) => {
    const on = S.mode === 'lesson' && S.lesson === i ? ' active' : '';
    const dots = EX_NAMES.map((_, e) => `<i class="s${starsOf(i, e)}"></i>`).join('');
    h += `<button class="nav${on}" data-lesson="${i}"><span class="num">${i + 1}</span><span class="lbl">${L.title}</span><span class="dots">${dots}</span></button>`;
  });
  h += '<h2>Training</h2>';
  h += `<button class="nav${S.mode === 'tempo' ? ' active' : ''}" data-mode="tempo"><span class="num">⏱</span><span class="lbl">Tempotest</span><span></span></button>`;
  h += `<button class="nav${S.mode === 'custom' ? ' active' : ''}" data-mode="custom"><span class="num">✎</span><span class="lbl">Eigener Text</span><span></span></button>`;
  h += `<button class="nav${S.mode === 'chronik' ? ' active' : ''}" data-mode="chronik"><span class="num">☰</span><span class="lbl">Chronik</span><span></span></button>`;
  side.innerHTML = h;
  const act = side.querySelector('.active');
  if (act && side.scrollWidth > side.clientWidth) side.scrollLeft = act.offsetLeft - 16;
}

function renderCtx(){
  const c = $('#ctx');
  $('#history').hidden = S.mode !== 'tempo';
  $('#chronik').hidden = S.mode !== 'chronik';
  document.querySelector('main').classList.toggle('only-ctx', S.mode === 'chronik');
  if (S.mode === 'lesson') {
    const L = LESSONS[S.lesson];
    const keys = L.kind === 'shift' ? ['⇧'] : L.neu;
    const tabs = EX_NAMES.map((n, e) => {
      const st = starsOf(S.lesson, e);
      return `<button data-ex="${e}" class="${e === S.ex ? 'on' : ''}">${e + 1} · ${n}${st ? `<span class="st">${'★'.repeat(st)}</span>` : ''}</button>`;
    }).join('');
    c.innerHTML = `<div class="head"><div class="eyebrow">Lektion ${S.lesson + 1} von ${LESSONS.length}</div>
      <h1>${L.title}<span class="newkeys">${keys.map(k => `<kbd>${k === ' ' ? '␣' : k.toUpperCase() === k ? k : k.toUpperCase()}</kbd>`).join('')}</span></h1></div>
      <div class="seg" role="tablist" aria-label="Übungen">${tabs}</div>`;
  } else if (S.mode === 'tempo') {
    const durs = [[60,'1 Min'],[180,'3 Min'],[300,'5 Min']];
    c.innerHTML = `<div class="head"><div class="eyebrow">Training</div><h1>Tempotest</h1></div>
      <div class="seg">${durs.map(([d, n]) => `<button data-dur="${d}" class="${d === S.tempoDur ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    renderHistory();
  } else if (S.mode === 'chronik') {
    c.innerHTML = `<div class="head"><div class="eyebrow">Training</div><h1>Chronik</h1></div>`;
    renderChronik();
  } else {
    c.innerHTML = `<div class="head"><div class="eyebrow">Training</div><h1>Eigener Text</h1></div>
      <div class="custom"><textarea id="customText" aria-label="Eigener Text"></textarea>
      <div class="row"><button class="btn" id="useCustom">Diesen Text üben</button><span class="note">Zeilenumbrüche werden zu Leerzeichen.</span></div></div>`;
    $('#customText').value = S.custom;
  }
}

function renderHistory(){
  const list = tempoLog.filter(t => t.layout === settings.layout).slice(-10).reverse();
  const h = $('#history');
  if (!list.length) { h.innerHTML = '<h2>Letzte Tempotests</h2><p class="note">Noch keine Ergebnisse. Starte den Test, indem du lostippst. Die Zeit läuft ab dem ersten Anschlag.</p>'; return; }
  h.innerHTML = `<h2>Letzte Tempotests</h2><div class="tablewrap"><table><thead><tr><th>Datum</th><th>Dauer</th><th>Anschläge/Min</th><th>Fehlerquote</th></tr></thead><tbody>${
    list.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('de-CH', {day:'2-digit', month:'2-digit', year:'numeric'})}</td><td>${t.dur / 60} Min</td><td>${t.kpm}</td><td>${fmtPct(t.pct)}</td></tr>`).join('')
  }</tbody></table></div>`;
}

const fmtDateTime = d => new Date(d).toLocaleString('de-CH', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
function renderChronik(){
  const h = $('#chronik');
  if (!chronik.length) { h.innerHTML = '<p class="note">Noch keine Einträge. Jede abgeschlossene Übung wird hier mit Anschlägen und Fehlern eingetragen.</p>'; return; }
  h.innerHTML = `<p class="note">${chronik.length} abgeschlossene Übungen, die neuesten zuerst.</p><div class="tablewrap"><table><thead><tr><th>Datum</th><th>Übung</th><th>Anschläge</th><th>Fehler</th></tr></thead><tbody>${
    chronik.slice().reverse().map(c => `<tr><td>${fmtDateTime(c.date)}</td><td>${c.name}</td><td>${c.keys}</td><td>${c.errors}</td></tr>`).join('')
  }</tbody></table></div>`;
}
function exerciseName(){
  if (S.mode === 'lesson') return `Lektion ${S.lesson + 1} · ${EX_NAMES[S.ex]}`;
  if (S.mode === 'tempo') return `Tempotest ${S.tempoDur / 60} Min`;
  return 'Eigener Text';
}

/* ---------- typing engine ---------- */
function loadText(text){
  clearInterval(S.tick);
  Object.assign(S, {text, pos:0, keys:0, errors:0, errAt:new Set(), start:0, done:false, lastTop:-1, wrongNow:false});
  const box = $('#text'); box.innerHTML = ''; box.scrollTop = 0;
  const frag = document.createDocumentFragment();
  S.spans = [...text].map(ch => { const s = document.createElement('span'); s.textContent = ch; frag.append(s); return s; });
  S.text = [...text];
  box.append(frag);
  $('#result').hidden = true;
  $('#starthint').hidden = false;
  $('#timeLbl').textContent = S.mode === 'tempo' ? 'Restzeit' : 'Zeit';
  updateStats();
  updateCursor();
}

function currentText(){
  if (S.mode === 'lesson') return genExercise(LESSONS[S.lesson], S.ex);
  if (S.mode === 'tempo') return tempoText();
  return cleanCustom(S.custom) || SAMPLE_CUSTOM;
}
function restart(){
  if (S.mode === 'chronik') { clearInterval(S.tick); highlight(null); return; }
  loadText(currentText());
}

function elapsed(){ return S.start ? (performance.now() - S.start) / 1000 : 0; }
const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtPct = p => p.toFixed(1).replace('.', ',') + ' %';
function metrics(){
  const t = S.mode === 'tempo' && S.done ? S.tempoDur : elapsed();
  const correct = S.pos - (settings.block ? 0 : [...S.errAt].length);
  const kpm = t > 0.5 ? Math.round(Math.max(0, correct) / (t / 60)) : 0;
  const pct = S.pos ? S.errors / S.pos * 100 : 0;
  return {t, kpm, pct};
}
function updateStats(){
  const m = metrics();
  $('#sTime').textContent = S.mode === 'tempo' ? fmtTime(S.tempoDur - m.t) : fmtTime(m.t);
  $('#sKpm').textContent = m.kpm;
  $('#sErr').textContent = S.errors;
  const pe = $('#sPct'); pe.textContent = fmtPct(m.pct); pe.classList.toggle('bad', m.pct > 2);
  const prog = S.mode === 'tempo' ? m.t / S.tempoDur : S.pos / S.text.length;
  $('#sBar').style.width = Math.min(100, prog * 100) + '%';
}

function updateCursor(){
  S.spans.forEach(s => s.classList.remove('cur', 'wrong'));
  const span = S.spans[S.pos];
  if (span) {
    span.classList.add('cur');
    const top = span.offsetTop;
    if (top !== S.lastTop) {
      S.lastTop = top;
      const box = $('#text'), lh = parseFloat(getComputedStyle(box).lineHeight) || 40;
      box.scrollTo({top: Math.max(0, top - lh), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  highlight(S.done ? null : S.text[S.pos]);
}

function highlight(ch){
  document.querySelectorAll('.k.next').forEach(k => k.classList.remove('next'));
  const hint = $('#hint');
  if (ch == null) { hint.innerHTML = ''; return; }
  const m = charMap[ch];
  if (!m) { hint.innerHTML = `Nächstes Zeichen: <kbd>${ch}</kbd> (nicht auf dieser Tastatur)`; return; }
  if (m.space) {
    $('#k-space').classList.add('next');
    hint.innerHTML = `<span class="dot" style="background:var(--f-thumb)"></span>Leertaste mit dem Daumen`;
    return;
  }
  const el = $(`#k-${m.r}-${m.i}`); if (el) el.classList.add('next');
  let txt = `<span class="dot" style="background:var(${FINGER_VAR[m.finger]})"></span><kbd>${ch}</kbd> mit dem ${FINGER[m.finger]}`;
  if (m.shift) {
    const right = m.finger < 5;
    $(right ? '#shiftR' : '#shiftL').classList.add('next');
    txt += ` · dazu ${right ? 'rechte' : 'linke'} Umschalttaste mit dem ${right ? 'rechten' : 'linken'} kleinen Finger`;
  }
  hint.innerHTML = txt;
}

function handleChar(ch){
  if (S.done || S.pos >= S.text.length) return;
  S.keys++;
  if (!S.start) {
    S.start = performance.now();
    $('#starthint').hidden = true;
    S.tick = setInterval(() => {
      updateStats();
      if (S.mode === 'tempo' && elapsed() >= S.tempoDur) finish();
    }, 200);
  }
  const exp = S.text[S.pos];
  const span = S.spans[S.pos];
  if (ch === exp) {
    span.classList.add(S.errAt.has(S.pos) && !settings.block ? 'miss' : 'ok');
    if (S.errAt.has(S.pos)) span.classList.add('miss');
    S.pos++;
    sound('key');
    if (S.pos >= S.text.length) { finish(); return; }
  } else {
    S.errors++;
    S.errAt.add(S.pos);
    sound('err');
    const sh = $('#sheet'); sh.classList.remove('shake'); void sh.offsetWidth; sh.classList.add('shake');
    if (settings.block) {
      span.classList.add('miss');
      updateStats(); updateCursor(); span.classList.add('wrong');
      return;
    }
    span.classList.add('miss');
    S.pos++;
    if (S.pos >= S.text.length) { finish(); return; }
  }
  updateStats();
  updateCursor();
}

function finish(){
  if (S.done) return;
  S.done = true;
  clearInterval(S.tick);
  sound('bell');
  updateStats();
  updateCursor();
  const m = metrics();
  chronik.push({date: Date.now(), name: exerciseName(), keys: S.keys, errors: S.errors});
  chronik = chronik.slice(-500);
  persist();
  const res = $('#result');
  if (S.mode === 'lesson') {
    const stars = m.pct <= 0.5 ? 3 : m.pct <= 1 ? 2 : m.pct <= 2 ? 1 : 0;
    const k = keyOf(S.lesson, S.ex), prev = results[k];
    if (!prev || stars > prev.stars || (stars === prev.stars && m.kpm > prev.kpm)) results[k] = {stars, kpm: m.kpm, pct: m.pct, date: Date.now()};
    persist();
    const isLast = S.lesson === LESSONS.length - 1 && S.ex === 3;
    res.innerHTML = `<div class="verdict"><div class="stars">${'★'.repeat(stars)}<span class="off">${'★'.repeat(3 - stars)}</span></div>
      <h3>${stars ? 'Bestanden' : 'Noch nicht bestanden'}</h3>
      <p>${stars ? (stars === 3 ? 'Fast fehlerfrei. Weiter zur nächsten Übung.' : 'Gut gemacht. Für mehr Sterne: weniger Fehler.') : 'Zum Bestehen sind höchstens 2 % Fehler erlaubt. Lieber langsamer und genauer tippen.'}</p></div>
      <div class="figs"><div><small>A/Min</small><b>${m.kpm}</b></div><div><small>Fehler</small><b>${S.errors}</b></div><div><small>Quote</small><b>${fmtPct(m.pct)}</b></div><div><small>Zeit</small><b>${fmtTime(m.t)}</b></div></div>
      <div class="acts"><button class="btn ghost" data-act="again">Wiederholen<kbd>Esc</kbd></button>${isLast ? '' : `<button class="btn" data-act="next">${stars ? 'Nächste Übung' : 'Trotzdem weiter'}<kbd>↵</kbd></button>`}</div>`;
    renderNav(); renderCtx(); renderSummary();
  } else if (S.mode === 'tempo') {
    tempoLog.push({date: Date.now(), dur: S.tempoDur, kpm: m.kpm, pct: m.pct, layout: settings.layout});
    tempoLog = tempoLog.slice(-50);
    persist();
    res.innerHTML = `<div class="verdict"><h3>Zeit abgelaufen</h3><p>${m.kpm} Anschläge pro Minute bei ${fmtPct(m.pct)} Fehlern.</p></div>
      <div class="figs"><div><small>A/Min</small><b>${m.kpm}</b></div><div><small>Fehler</small><b>${S.errors}</b></div><div><small>Quote</small><b>${fmtPct(m.pct)}</b></div></div>
      <div class="acts"><button class="btn" data-act="again">Neuer Test<kbd>↵</kbd></button></div>`;
    renderHistory(); renderSummary();
  } else {
    res.innerHTML = `<div class="verdict"><h3>Text fertig</h3><p>${m.kpm} Anschläge pro Minute bei ${fmtPct(m.pct)} Fehlern.</p></div>
      <div class="figs"><div><small>A/Min</small><b>${m.kpm}</b></div><div><small>Fehler</small><b>${S.errors}</b></div><div><small>Zeit</small><b>${fmtTime(m.t)}</b></div></div>
      <div class="acts"><button class="btn" data-act="again">Nochmals<kbd>↵</kbd></button></div>`;
  }
  res.hidden = false;
}

function next(){
  if (S.mode !== 'lesson') { restart(); return; }
  if (S.ex < 3) S.ex++;
  else if (S.lesson < LESSONS.length - 1) { S.lesson++; S.ex = 0; }
  openLesson(S.lesson, S.ex);
}

function openLesson(l, e){
  S.mode = 'lesson'; S.lesson = l;
  S.ex = e != null ? e : Math.max(0, EX_NAMES.findIndex((_, i) => !starsOf(l, i)));
  saveNav();
  renderNav(); renderCtx(); restart();
}
function openMode(m){ S.mode = m; saveNav(); renderNav(); renderCtx(); restart(); }
const saveNav = persist;

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.lesson != null) openLesson(+b.dataset.lesson);
  else if (b.dataset.mode) openMode(b.dataset.mode);
  else if (b.dataset.ex != null) { S.ex = +b.dataset.ex; renderCtx(); restart(); }
  else if (b.dataset.dur) { S.tempoDur = +b.dataset.dur; renderCtx(); restart(); }
  else if (b.dataset.act === 'again') restart();
  else if (b.dataset.act === 'next') next();
  else if (b.id === 'useCustom') { S.custom = $('#customText').value; restart(); }
  if (!b.closest('#settings') && b.id !== 'setBtn') b.blur();
});

const cap = $('#cap');
$('#sheet').addEventListener('click', e => { if (!e.target.closest('button')) cap.focus({preventScroll: true}); });
cap.addEventListener('input', () => { const v = cap.value; cap.value = ''; for (const c of v) handleChar(c); });

document.addEventListener('keydown', e => {
  const t = e.target;
  if (t.matches && t.matches('textarea, input:not(#cap), select')) return;
  if (t.closest && t.closest('#settings')) return;
  if (!$('#settings').hidden) return;
  if (S.mode === 'chronik') return;
  if (e.key === 'Escape') { e.preventDefault(); restart(); return; }
  if (S.done) { if (e.key === 'Enter' || (S.mode !== 'lesson' && e.key === ' ')) { e.preventDefault(); next(); } return; }
  if ((e.ctrlKey && !e.altKey) || e.metaKey) return;
  if (e.key.length === 1) { e.preventDefault(); handleChar(e.key); }
});

/* settings */
const setPanel = $('#settings');
$('#setBtn').addEventListener('click', () => {
  setPanel.hidden = !setPanel.hidden;
  $('#setBtn').setAttribute('aria-expanded', String(!setPanel.hidden));
  resetArm(false);
});
document.addEventListener('mousedown', e => {
  if (!setPanel.hidden && !e.target.closest('#settings') && !e.target.closest('#setBtn')) { setPanel.hidden = true; $('#setBtn').setAttribute('aria-expanded', 'false'); }
});
function syncSettingsUI(){
  document.querySelectorAll('#layoutSeg button').forEach(b => b.classList.toggle('on', b.dataset.l === settings.layout));
  $('#optBlock').checked = settings.block;
  $('#optColors').checked = settings.colors;
  $('#optSound').checked = settings.sound;
}
$('#layoutSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.dataset.l === settings.layout) return;
  settings.layout = b.dataset.l; persist(); syncSettingsUI(); applyLayout();
});
$('#optBlock').addEventListener('change', e => { settings.block = e.target.checked; persist(); restart(); });
$('#optColors').addEventListener('change', e => { settings.colors = e.target.checked; persist(); $('#kbd').classList.toggle('plain', !settings.colors); buildLegend(); });
$('#optSound').addEventListener('change', e => { settings.sound = e.target.checked; persist(); if (settings.sound) sound('key'); });
let armed = false;
function resetArm(on){ armed = on; const b = $('#resetBtn'); b.classList.toggle('arm', on); b.textContent = on ? 'Wirklich alles löschen?' : 'Fortschritt zurücksetzen'; }
$('#resetBtn').addEventListener('click', () => {
  if (!armed) { resetArm(true); return; }
  results = {}; tempoLog = []; chronik = []; persist(); resetArm(false);
  renderNav(); renderCtx(); renderSummary(); restart();
});

function applyLayout(){
  buildCharMap(); buildLessons(); buildKeyboard(); buildLegend();
  if (S.lesson >= LESSONS.length) S.lesson = 0;
  renderNav(); renderCtx(); renderSummary(); restart();
}

syncSettingsUI();
buildCharMap(); buildLessons(); buildKeyboard(); buildLegend();
if (S.mode === 'lesson') S.ex = Math.max(0, EX_NAMES.findIndex((_, i) => !starsOf(S.lesson, i)));
renderNav(); renderCtx(); renderSummary(); restart();
