'use strict';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEART = '<svg viewBox="0 0 24 24"><use href="#h"/></svg>';

/* ---------- 1. Living background: stars, fireflies, rose petals ---------- */
const cv = $('#bg'), c2 = cv.getContext('2d');
let W, H, nextPetal = 0;
const stars = [], bugs = [], petals = [];
function resize() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d;
  c2.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', resize); resize();
for (let i = 0; i < (W < 600 ? 70 : 140); i++) stars.push({ x: Math.random(), y: Math.random(), r: rnd(.4, 1.5), p: rnd(0, 6.3), v: rnd(.6, 1.8) });
for (let i = 0; i < 24; i++) bugs.push({ x: Math.random(), y: Math.random(), a: rnd(0, 6.3), v: rnd(.1, .35), p: rnd(0, 6.3) });

function petal(x, y, burst) {
  petals.push({ x, y, vx: burst ? rnd(-1.8, 1.8) : rnd(-.4, .4), vy: rnd(.6, 1.5), r: rnd(5, 11), a: rnd(0, 6.3), va: rnd(-.03, .03), s: rnd(0, 6.3), c: Math.random() < .5 ? '345,72%,68%' : '340,65%,42%' });
}
function frame(ms) {
  const t = ms / 1000;
  c2.clearRect(0, 0, W, H);
  c2.fillStyle = '#fff4f8';
  for (const s of stars) {
    c2.globalAlpha = RM ? .6 : .3 + .7 * Math.abs(Math.sin(t * s.v * .6 + s.p));
    c2.beginPath(); c2.arc(s.x * W, s.y * H, s.r, 0, 6.283); c2.fill();
  }
  if (!RM) {
    for (const b of bugs) {
      b.a += .01 * Math.sin(t + b.p);
      b.x = (b.x + Math.cos(b.a) * b.v / W + 1) % 1;
      b.y = (b.y + Math.sin(b.a) * b.v / H + 1) % 1;
      const al = .5 + .5 * Math.sin(t * 2 + b.p);
      c2.fillStyle = '#ff9cc0'; c2.globalAlpha = al * .18;
      c2.beginPath(); c2.arc(b.x * W, b.y * H, 8, 0, 6.283); c2.fill();
      c2.fillStyle = '#fff'; c2.globalAlpha = al * .8;
      c2.beginPath(); c2.arc(b.x * W, b.y * H, 1.6, 0, 6.283); c2.fill();
    }
    for (let i = petals.length; i--;) {
      const p = petals[i];
      p.y += p.vy; p.x += p.vx + Math.sin(t * 1.5 + p.s) * .5; p.a += p.va;
      if (p.y > H + 20) { petals.splice(i, 1); continue; }
      c2.save(); c2.translate(p.x, p.y); c2.rotate(p.a);
      c2.globalAlpha = .8; c2.fillStyle = `hsl(${p.c})`;
      c2.beginPath(); c2.ellipse(0, 0, p.r, p.r * .6, 0, 0, 6.283); c2.fill();
      c2.restore();
    }
    if (ms > nextPetal && petals.length < 24) { petal(rnd(0, W), -20); nextPetal = ms + rnd(900, 1900); }
  }
  c2.globalAlpha = 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener('pointerdown', e => {
  if (RM || $('#world').hidden) return;
  for (let i = 0; i < 9; i++) petal(e.clientX, e.clientY, true);
});

/* ---------- 2. Garden drawn with SVG ---------- */
const rose = (H, S, L) => {
  let o = '';
  [[7, 1], [5, .7], [4, .46]].forEach(([n, s], i) => {
    o += `<g class="ring" style="--i:${i}">`;
    for (let a = 0; a < n; a++)
      o += `<path transform="rotate(${a * 360 / n + i * 25}) scale(${s})" d="M0 0C-14-3-15-17 0-16C15-17 14-3 0 0Z" fill="hsl(${H} ${S}% ${L - i * 7}%)" stroke="hsl(${H} ${S}% ${L - i * 7 - 14}%)" stroke-width=".6"/>`;
    o += '</g>';
  });
  return o + `<path d="M0 0c3-1 4 3 0 4s-6-2-3-6 9 0 8 6" fill="none" stroke="hsl(${H} ${S}% ${L - 30}%)" stroke-width=".8"/>`;
};
const tulip = (H, S, L) => {
  const f = l => `hsl(${H} ${S}% ${l}%)`;
  return `<g class="ring" style="--i:0"><path d="M0 4C-18-2-20-30-9-44-6-30-2-12 0 4Z" fill="${f(L - 8)}"/><path d="M0 4C18-2 20-30 9-44 6-30 2-12 0 4Z" fill="${f(L - 8)}"/><path d="M0 4C-14-4-15-30 0-46 15-30 14-4 0 4Z" fill="${f(L)}" stroke="${f(L - 16)}" stroke-width=".6"/></g>`;
};
const daisy = (H, S, L) => {
  let o = '<g class="ring" style="--i:0">';
  for (let a = 0; a < 10; a++) o += `<ellipse cy="-7" rx="2.6" ry="7" transform="rotate(${a * 36})" fill="hsl(${H} ${S}% ${L}%)"/>`;
  return o + '<circle r="3.2" fill="#f7c55b"/></g>';
};
const KIND = { r: rose, t: tulip, d: daisy };
const FLOWERS = [
  { t: 'r', x: 105, h: 150, c: [346, 72, 60], d: 0, s: 1.5 },
  { t: 't', x: 200, h: 200, c: [333, 82, 74], d: .3, s: 1.25 },
  { t: 'r', x: 292, h: 135, c: [352, 68, 34], d: .6, s: 1.5 },
  { t: 't', x: 355, h: 105, c: [340, 78, 82], d: 1.1, s: 1 },
  { t: 't', x: 45, h: 95, c: [285, 50, 66], d: .9, s: 1 },
  { t: 'r', x: 248, h: 105, c: [335, 75, 70], d: .8, s: 1.2 },
  { t: 'r', x: 152, h: 95, c: [28, 85, 88], d: .5, s: 1.15 },
  { t: 't', x: 322, h: 72, c: [20, 85, 78], d: 1.2, s: .95 },
  { t: 'r', x: 72, h: 68, c: [350, 80, 76], d: 1, s: 1.05 },
  { t: 'd', x: 15, h: 52, c: [340, 60, 93], d: 1.3, s: 1.4 },
  { t: 'd', x: 128, h: 48, c: [40, 85, 92], d: 1.4, s: 1.3 },
  { t: 'd', x: 178, h: 40, c: [270, 55, 82], d: 1.5, s: 1.3 },
  { t: 'd', x: 226, h: 50, c: [340, 60, 93], d: 1.6, s: 1.4 },
  { t: 'd', x: 272, h: 44, c: [40, 85, 92], d: 1.5, s: 1.3 },
  { t: 'd', x: 384, h: 58, c: [270, 55, 82], d: 1.7, s: 1.4 }
].sort((a, b) => b.h - a.h);
function flower(f, k) {
  const y0 = 296, bend = (k % 2 ? 1 : -1) * 14, x = f.x, qx = x + bend, qy = y0 - f.h / 2, tx = x + bend / 2, ty = y0 - f.h;
  const pt = u => [(1 - u) ** 2 * x + 2 * (1 - u) * u * qx + u * u * tx, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * qy + u * u * ty];
  let s = `<g class="sway" style="transform-origin:${x}px ${y0}px;animation-delay:-${k * .9}s;--d:${f.d}s">`;
  s += `<path class="stem" pathLength="1" d="M${x} ${y0}Q${qx} ${qy} ${tx} ${ty}" style="transition-delay:${f.d}s"/>`;
  [[.3, 1], [.58, -1]].forEach(([u, side], j) => {
    const [lx, ly] = pt(u);
    s += `<g transform="translate(${lx} ${ly}) scale(${side} 1) rotate(-20)"><path class="lf" style="--i:${j}" d="M0 0C10-8 26-6 34-18C22-22 6-18 0 0Z"/></g>`;
  });
  s += `<g transform="translate(${tx} ${ty})"><g class="head"><g transform="scale(${f.s})">${KIND[f.t](...f.c)}</g></g></g></g>`;
  return s;
}
let grass = '';
for (let i = 0; i < 60; i++) { const gx = rnd(-10, 410), gh = rnd(10, 24); grass += `<path class="bl" d="M${gx} 299q${rnd(-3, 3)} -${gh / 2} ${rnd(-7, 7)} -${gh}"/>`; }
$('#g').innerHTML =
  '<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1550"/><stop offset="1" stop-color="#1b0a2f"/></linearGradient></defs>' +
  '<ellipse cx="200" cy="296" rx="230" ry="14" fill="#ff7fb0" opacity=".12"/>' +
  FLOWERS.map(flower).join('') +
  '<path d="M-20 300Q90 280 200 292T420 288V304H-20Z" fill="url(#gr)"/>' + grass;

/* ---------- 3. I love you in many languages ---------- */
const LANGS = [['Английский', 'I love you'], ['Русский', 'Я тебя люблю'], ['Французский', "Je t'aime"], ['Итальянский', 'Ti amo'], ['Испанский', 'Te amo'], ['Немецкий', 'Ich liebe dich'], ['Турецкий', 'Seni seviyorum'], ['Корейский', '사랑해'], ['Японский', '愛してる'], ['Китайский', '我爱你'], ['Арабский', 'أحبك'], ['Португальский', 'Eu te amo'], ['Казахский', 'Мен сені сүйемін'], ['Украинский', 'Я тебе кохаю']];
let li = 0;
function addTo(box, cls, html, css, life) {
  const e = document.createElement('span');
  e.className = cls; e.innerHTML = html; e.style.cssText = css;
  box.append(e); setTimeout(() => e.remove(), life);
}
function nextLang() {
  const [name, text] = LANGS[li++ % LANGS.length], t = $('#ltext');
  $('#lname').textContent = name; t.textContent = text; t.dir = name === 'Арабский' ? 'rtl' : 'ltr';
  t.classList.remove('sw'); void t.offsetWidth; t.classList.add('sw');
  for (let i = 0; i < 5; i++) addTo($('#langs'), 'fh', HEART, `left:${rnd(20, 80)}%;top:${rnd(40, 75)}%;--s:${rnd(12, 26)}px;--t:${rnd(2.5, 4)}s;animation-delay:${rnd(0, 1)}s`, 5000);
}
function drift() {
  if (document.hidden) return;
  addTo($('#langs'), 'dr', LANGS[Math.random() * LANGS.length | 0][1], `left:${rnd(4, 78)}%;top:${rnd(8, 88)}%`, 8200);
}

/* ---------- 4. 100 reasons (3D flip card) ---------- */
const REASONS = ['Как твой смех делает комнату мягче.', 'Ты слушаешь так, будто всё, что я говорю, важно.', 'Ты добрая, даже когда никто не видит.', 'Твоя улыбка — моё любимое место, где отдыхают глаза.', 'Ты превращаешь обычные вторники в маленькие праздники.', 'Ты веришь в меня в те дни, когда я сам забываю.', 'Ты замечаешь мелочи, которых не видит никто другой.', 'Твоя рука ложится в мою, как будто так и было задумано.', 'Ты смелая — тихо и очень красиво.', 'С тобой дом — это человек, а не место.', 'Твой голос — мой любимый звук по утрам.', 'Ты так глубоко заботишься, и это видно во всём, что ты делаешь.', 'Ты заставляешь меня хотеть быть лучше.', 'Ты прекрасна, а сама почему-то этого не знаешь.', 'Наши глупые шутки, понятные только нам.', 'Ты мечтаешь вслух, и мир становится шире.', 'Ты терпелива со мной, даже когда со мной непросто.', 'В твоих глазах целая галактика, и я не устаю на неё смотреть.', 'С тобой каждый конец похож на начало.', 'Потому что любить тебя — самое лёгкое и настоящее, что я делал в жизни.'];
let deck = [], rot = 0;
const nextReason = () => { if (!deck.length) deck = [...REASONS].sort(() => Math.random() - .5); return deck.pop(); };
$('#flip').onclick = () => {
  const face = $(rot / 180 % 2 === 0 ? '.face.b .txt' : '.face.f .txt');
  face.textContent = nextReason();
  rot += 180; $('#fi').style.transform = `rotateY(${rot}deg)`;
};

/* ---------- 5. Envelope ---------- */
const env = $('#env'), paper = $('.paper');
function toggleLetter() {
  const open = env.classList.toggle('open');
  env.setAttribute('aria-expanded', open);
  $('#ew').style.paddingTop = open ? paper.scrollHeight - 30 + 'px' : '0';
  if (open) setTimeout(() => paper.scrollIntoView({ behavior: 'smooth', block: 'center' }), 1100);
}
env.onclick = toggleLetter;
env.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLetter(); } };

/* ---------- 6. Surprises ---------- */
let tt;
function toast(msg, big) {
  const e = $('#toast'); e.textContent = msg; e.className = 'show' + (big ? ' big' : '');
  clearTimeout(tt); tt = setTimeout(() => e.className = '', big ? 5200 : 2800);
}
function rain(n) {
  for (let i = 0; i < n; i++)
    addTo($('#rain'), 'rh', HEART, `left:${rnd(0, 100)}%;--s:${rnd(14, 40)}px;--r:${rnd(-40, 40)}deg;animation-delay:${rnd(0, 1.6)}s;animation-duration:${rnd(3, 5.5)}s`, 7500);
}
$('#hug').onclick = () => { rain(RM ? 12 : 80); toast('Обнимаю тебя крепко-крепко ♡'); };
const MSG = ['Нажми, чтобы узнать…', 'Вот настолько ♡ (руки широко раскрыты)', 'Больше. Гораздо больше.', 'Больше, чем звёзд в этом небе.', 'Ошибка: любовь.переполнение = ∞'];
let mi = 0;
$('#how').onclick = () => {
  mi = (mi + 1) % MSG.length;
  $('#mtext').textContent = MSG[mi];
  $('#mh').style.transform = `scale(${1 + mi * .6})`;
  if (mi === MSG.length - 1) { rain(RM ? 10 : 50); if (!RM) for (let i = 0; i < 30; i++) petal(rnd(0, W), rnd(-120, 0)); }
};
let found = 0;
$$('.find').forEach(b => b.onclick = () => {
  if (b.classList.contains('found') && !b.dataset.s) return;
  if (b.dataset.s) { toast('Ты нашла мой маленький секрет. Я люблю тебя!', true); rain(RM ? 10 : 50); }
  else toast(`Найдено сердечко ♡ ${++found}/3`);
  b.classList.add('found');
});

/* ---------- 7. Finale stars ---------- */
for (let i = 0; i < 46; i++)
  addTo($('#end'), 'es', '', `left:${rnd(2, 98)}%;top:${rnd(2, 98)}%;--dl:${rnd(0, 6)}s;transform:scale(${rnd(.6, 1.6)})`, 9e9);
new IntersectionObserver(([e]) => e.isIntersecting && $('#end').classList.add('in'), { threshold: .3 }).observe($('#end'));

/* ---------- 8. Soft generative music (Web Audio, no files) ---------- */
let ac, master, timer, step = 0, playing = false;
const CHORDS = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]];
const PENT = [0, 2, 4, 7, 9, 12, 14, 16];
function tone(f, dur, type, vol, att) {
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .1);
}
function tick() {
  if (step % 8 === 0) CHORDS[(step / 8) % 4].forEach(s => tone(130.81 * 2 ** (s / 12), 5, 'sine', .07, 1.4));
  else if (Math.random() < .55) tone(261.63 * 2 ** (PENT[Math.random() * PENT.length | 0] / 12), 1.8, 'triangle', .05, .01);
  step++;
}
function setMusic(on) {
  playing = on; $('#music').setAttribute('aria-pressed', on);
  if (on) {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
      master = ac.createGain(); master.gain.value = .6; master.connect(lp); lp.connect(ac.destination);
    }
    ac.resume(); tick(); timer = setInterval(tick, 520);
  } else { clearInterval(timer); ac && ac.suspend(); }
}
$('#music').onclick = () => setMusic(!playing);

/* ---------- 9. Opening the world ---------- */
$('#open').onclick = () => {
  $('#world').hidden = false; $('#music').hidden = false;
  document.body.classList.remove('lock'); scrollTo(0, 0);
  $('#intro').classList.add('go');
  try { setMusic(true); } catch (e) { /* audio unavailable */ }
  setTimeout(() => {
    new IntersectionObserver(([e]) => e.isIntersecting && $('#g').classList.add('grow'), { threshold: .25 }).observe($('#garden'));
    nextLang(); setInterval(nextLang, 3200); setInterval(drift, 1500);
  }, 900);
  setTimeout(() => $('#intro').remove(), 2200);
};

/* ---------- 10. Photo frames, dates and counter (see CONFIG at the top) ---------- */
const SHAPES = ['polaroid', 'oval', 'heart', 'arch', 'gild'], EXT = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'], MAX_PHOTOS = 12;
$('#gallery').hidden = true;
for (let n = 1; n <= MAX_PHOTOS; n++) {
  const info = (CONFIG.photos || [])[n - 1] || {};
  const fig = document.createElement('figure');
  fig.className = 'fr ' + SHAPES[(n - 1) % SHAPES.length]; fig.hidden = true;
  fig.innerHTML = `<div class="ph"><img alt="${info.cap || 'Наше фото'}"></div>` + (info.cap || info.date ? `<figcaption>${info.cap || ''}<small>${info.date || ''}</small></figcaption>` : '');
  $('#gal').append(fig);
  const img = fig.querySelector('img'); let k = 0;
  img.onload = () => { fig.hidden = false; fig.querySelector('.ph').classList.add('ok'); $('#gallery').hidden = false; };
  img.onerror = () => { if (++k < EXT.length) img.src = `photos/${n}.${EXT[k]}`; else fig.remove(); };
  img.src = `photos/${n}.${EXT[0]}`;
}
$('#tl').innerHTML = CONFIG.events.map(e => `<div class="ev">${HEART}<time>${e.date}</time><b>${e.title}</b><p>${e.text}</p></div>`).join('');
const UNITS = [['дней', 864e5, Infinity], ['часов', 36e5, 24], ['минут', 6e4, 60], ['секунд', 1e3, 60]];
function count() {
  const ms = Math.max(0, Date.now() - new Date(CONFIG.start));
  $('#cnt').innerHTML = UNITS.map(([n, u, m]) => `<div class="cn"><b>${Math.floor(ms / u) % m}</b><small>${n}</small></div>`).join('');
}
count(); setInterval(count, 1000);
