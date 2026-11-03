(function () {
  'use strict';
  window.__swarmOK = true;

  /* ---------- contact: copy button (works with or without motion) ---------- */
  var copyBtn = document.getElementById('copy'), addr = document.getElementById('addr');
  copyBtn.addEventListener('click', function () {
    var done = function (msg) { copyBtn.textContent = msg; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600); };
    var select = function () {
      var r = document.createRange(); r.selectNodeContents(addr);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Press Ctrl+C');
    };
    try { navigator.clipboard.writeText(addr.textContent.trim()).then(function () { done('Copied'); }, select); }
    catch (e) { select(); }
  });

  /* ---------- hero typing line (reads like a terminal prompt) ---------- */
  (function () {
    var el = document.getElementById('typer'), hero = document.querySelector('.p-title');
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var LINES = ["Hey, I'm P. Shanmuka Sai Prabhath", 'Mind behind the machine', 'Developer | Automation Enthusiast', 'AI Explorer | Obito Tobi (online)'];
    var li = 0, ci = 0, del = false;
    function tick() {
      var full = LINES[li];
      if (!del) {
        ci++; el.textContent = full.slice(0, ci);
        if (ci === full.length) { del = true; return setTimeout(tick, 1900); }
        return setTimeout(tick, 55 + Math.random() * 50);
      }
      ci--; el.textContent = full.slice(0, ci);
      if (ci === 0) { del = false; li = (li + 1) % LINES.length; return setTimeout(tick, 350); }
      setTimeout(tick, 28);
    }
    el.textContent = '';
    var waited = 0, w = setInterval(function () {
      waited += 150;
      if (hero.classList.contains('built') || waited > 6000) { clearInterval(w); tick(); }
    }, 150);
  })();

  if (!document.documentElement.classList.contains('js')) return; // reduced motion: page stays fully drawn

  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var dist = function (ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ---------- split typed text into letters (layout never changes) ---------- */
  $$('[data-type]').forEach(function (el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var words = text.split(' ');
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el._chars = [];
    words.forEach(function (w, wi) {
      var ws = document.createElement('span');
      ws.className = 'w'; ws.setAttribute('aria-hidden', 'true');
      Array.from(w).forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'ch'; s.textContent = c;
        ws.appendChild(s); el._chars.push(s);
      });
      el.appendChild(ws);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  var revealAll = function (panel) {
    $$('.ch', panel).forEach(function (c) { c.classList.add('on'); });
  };

  /* ---------- cursors ---------- */
  var layer = document.getElementById('swarm');
  var W = function () { return innerWidth; }, H = function () { return innerHeight; };
  var ROLES = ['mangaka', 'assistant', 'editor', 'inker', 'toner', 'letterer'];
  var count = innerWidth < 700 ? 4 : 6;

  var SVG_ARROW = '<svg class="a" width="18" height="22" viewBox="0 0 18 22"><path d="M1 1v16l4.2-3.8 3 6.8 2.8-1.2-3-6.6H14z" fill="var(--c)" stroke="#f4f3ee" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var SVG_IBEAM = '<svg class="i" width="12" height="20" viewBox="0 0 12 20"><path d="M2 1h8M6 1v18M2 19h8" fill="none" stroke="#f4f3ee" stroke-width="4" stroke-linecap="round"/><path d="M2 1h8M6 1v18M2 19h8" fill="none" stroke="var(--c)" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var SVG_CROSS = '<svg class="x" width="20" height="20" viewBox="0 0 20 20"><path d="M10 1v18M1 10h18" fill="none" stroke="#f4f3ee" stroke-width="4" stroke-linecap="round"/><path d="M10 1v18M1 10h18" fill="none" stroke="var(--c)" stroke-width="1.8" stroke-linecap="round"/></svg>';

  var pointer = { x: W() / 2, y: H() / 2, on: false, last: 0 };
  var now = 0;
  var cursors = [];
  var queue = [];

  function Cursor(i, name) {
    this.i = i;
    this.x = W() * (.3 + .4 * Math.random());
    this.y = H() + 60 + Math.random() * 80;
    this.vx = 0; this.vy = 0;
    this.phase = 'idle'; this.t = 0; this.mode = '';
    this.task = null;
    this.el = document.createElement('div');
    this.el.className = 'cur' + (i === 0 ? ' red' : '');
    this.el.innerHTML = SVG_ARROW + SVG_IBEAM + SVG_CROSS + '<span class="tag"></span>';
    this.el.querySelector('.tag').textContent = name;
    layer.appendChild(this.el);
    this.ghost = document.createElement('div');
    this.ghost.className = 'ghost';
    this.ghost.innerHTML = '<span></span>';
    this.badge = this.ghost.firstChild;
    layer.appendChild(this.ghost);
    this.setMode('arrow');
  }
  Cursor.prototype.setMode = function (m) {
    if (this.mode === m) return;
    this.mode = m; this.el.setAttribute('data-mode', m);
  };
  Cursor.prototype.seek = function (tx, ty, dt, k, c) {
    this.vx += ((tx - this.x) * k - this.vx * c) * dt;
    this.vy += ((ty - this.y) * k - this.vy * c) * dt;
    var sp = Math.hypot(this.vx, this.vy), max = 2400;
    if (sp > max) { this.vx *= max / sp; this.vy *= max / sp; }
    this.x += this.vx * dt; this.y += this.vy * dt;
  };
  Cursor.prototype.follow = function (tx, ty, dt, rate) {
    var f = 1 - Math.exp(-rate * dt), nx = this.x + (tx - this.x) * f, ny = this.y + (ty - this.y) * f;
    this.vx = (nx - this.x) / dt; this.vy = (ny - this.y) / dt;
    this.x = nx; this.y = ny;
  };
  Cursor.prototype.start = function (panel) {
    this.task = { panel: panel };
    this.phase = 'travel'; this.t = 0;
    this.setMode('cross');
  };
  Cursor.prototype.finish = function () {
    this.task = null; this.phase = 'idle';
    this.ghost.style.display = 'none';
    this.el.classList.remove('press');
    this.setMode('arrow');
  };
  Cursor.prototype.idle = function (dt) {
    var t = now / 1000, bx, by, n = cursors.length;
    if (pointer.on && now - pointer.last < 6000) { bx = pointer.x; by = pointer.y; }
    else { bx = W() * (.5 + .32 * Math.sin(t * .31 + 1)); by = H() * (.5 + .26 * Math.sin(t * .23)); }
    var ang = this.i / n * Math.PI * 2 + t * .35, r = 62 + (this.i % 3) * 24;
    var tx = bx + Math.cos(ang) * r, ty = by + Math.sin(ang) * r * .75;
    var ax = (tx - this.x) * 7 - this.vx * 3.6, ay = (ty - this.y) * 7 - this.vy * 3.6;
    for (var j = 0; j < n; j++) {
      var o = cursors[j]; if (o === this) continue;
      var dx = this.x - o.x, dy = this.y - o.y, d = Math.hypot(dx, dy);
      if (d < 54 && d > .01) { var f = (54 - d) / 54 * 900; ax += dx / d * f; ay += dy / d * f; }
    }
    this.vx += ax * dt; this.vy += ay * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
  };
  Cursor.prototype.update = function (dt) {
    var task = this.task, p = task && task.panel;
    if (p && p._forced) this.finish();
    switch (this.phase) {
      case 'idle':
        this.idle(dt); break;

      case 'travel': {
        var r = p.getBoundingClientRect();
        this.seek(r.left, r.top, dt, 45, 12);
        if (dist(this.x, this.y, r.left, r.top) < 6) { this.phase = 'press'; this.t = 0; this.vx = this.vy = 0; }
        break;
      }
      case 'press':
        this.t += dt; this.el.classList.add('press');
        if (this.t > .14) {
          var rr = p.getBoundingClientRect();
          this.el.classList.remove('press');
          this.dur = clamp(.7 + rr.width * rr.height / 500000, .8, 1.7);
          this.phase = 'drag'; this.t = 0;
          this.ghost.style.display = 'block';
        }
        break;

      case 'drag': {
        this.t += dt;
        var k = clamp(this.t / this.dur, 0, 1), e = ease(k), b = p.getBoundingClientRect();
        var w = b.width * e, h = b.height * e;
        this.follow(b.left + w, b.top + h, dt, 40);
        p.style.clipPath = 'inset(0 ' + (1 - e) * 100 + '% ' + (1 - e) * 100 + '% 0)';
        var g = this.ghost.style;
        g.left = b.left + 'px'; g.top = b.top + 'px'; g.width = w + 'px'; g.height = h + 'px';
        this.badge.textContent = Math.round(w) + ' × ' + Math.round(h);
        if (k >= 1) {
          p.classList.add('built'); p.style.clipPath = '';
          g.display = 'none';
          task.typed = $$('[data-type]', p); task.ti = 0;
          this.setMode('ibeam'); this.phase = 'nextType';
        }
        break;
      }
      case 'nextType': {
        if (task.ti >= task.typed.length) { this.finish(); break; }
        var el = task.typed[task.ti], eb = el.getBoundingClientRect();
        if (eb.bottom < 0 || eb.top > H()) { el._chars.forEach(function (c) { c.classList.add('on'); }); task.ti++; break; }
        task.ci = 0; this.acc = 0; this.cd = .03;
        this.phase = 'goType';
        break;
      }
      case 'goType': {
        var first = task.typed[task.ti]._chars[0].getBoundingClientRect();
        this.seek(first.left, first.top + first.height / 2, dt, 50, 13);
        if (dist(this.x, this.y, first.left, first.top + first.height / 2) < 8) { this.phase = 'type'; }
        break;
      }
      case 'type': {
        var tel = task.typed[task.ti], chars = tel._chars, tb = tel.getBoundingClientRect();
        if (tb.bottom < 0 || tb.top > H()) { chars.forEach(function (c) { c.classList.add('on'); }); task.ci = chars.length; }
        this.acc += dt;
        while (this.acc >= this.cd && task.ci < chars.length) {
          chars[task.ci].classList.add('on');
          this.acc -= this.cd;
          this.cd = .024 + Math.random() * .034 + (chars[task.ci].textContent === ',' ? .12 : 0);
          task.ci++;
        }
        var cur = chars[Math.max(0, task.ci - 1)].getBoundingClientRect();
        this.follow(task.ci === 0 ? cur.left : cur.right + 2, cur.top + cur.height / 2, dt, 28);
        if (task.ci >= chars.length) { task.ti++; this.phase = 'nextType'; }
        break;
      }
    }
  };
  Cursor.prototype.draw = function () {
    this.el.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px,0)';
    this.el.classList.toggle('flip', this.x > W() - 120);
  };

  for (var i = 0; i < count; i++) cursors.push(new Cursor(i, ROLES[i]));

  /* ---------- panels enter the queue as they scroll into view ---------- */
  var force = function (p) {
    if (p.classList.contains('built')) return;
    p._forced = true;
    p.classList.add('built'); p.style.clipPath = '';
    revealAll(p);
    var qi = queue.indexOf(p); if (qi > -1) queue.splice(qi, 1);
  };
  /* IntersectionObserver ignores fully clipped elements, so check positions directly. */
  var waiting = $$('[data-build]');
  function scan() {
    for (var i = waiting.length - 1; i >= 0; i--) {
      var p = waiting[i], r = p.getBoundingClientRect();
      var seen = Math.min(r.bottom, H()) - Math.max(r.top, 0);
      if (seen > Math.min(r.height, H()) * .15 && r.top < H() * .94) {
        waiting.splice(i, 1);
        if (p.classList.contains('built')) continue;
        queue.unshift(p);
        (function (q) { setTimeout(function () { force(q); }, 9000); })(p); // safety net if the swarm is busy
      }
    }
    queue.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
  }

  function assign() {
    while (queue.length) {
      var idle = cursors.filter(function (c) { return c.phase === 'idle'; });
      if (!idle.length) return;
      var p = queue.shift();
      if (p.classList.contains('built')) continue;
      var r = p.getBoundingClientRect();
      idle.sort(function (a, b) { return dist(a.x, a.y, r.left, r.top) - dist(b.x, b.y, r.left, r.top); });
      idle[0].start(p);
    }
  }

  /* ---------- pointer ---------- */
  addEventListener('pointermove', function (e) {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true; pointer.last = performance.now();
  }, { passive: true });
  addEventListener('pointerdown', function (e) {
    var ring = document.createElement('div');
    ring.className = 'pop'; ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
    layer.appendChild(ring);
    ring.addEventListener('animationend', function () { ring.remove(); });
    cursors.forEach(function (c) {
      if (c.phase !== 'idle') return;
      var dx = e.clientX - c.x, dy = e.clientY - c.y, d = Math.hypot(dx, dy) || 1;
      c.vx += dx / d * 520; c.vy += dy / d * 520;
    });
  }, { passive: true });

  /* ---------- loop ---------- */
  var last = performance.now();
  function frame(t) {
    var dt = clamp((t - last) / 1000, .001, .05);
    last = t; now = t;
    if (waiting.length) scan();
    assign();
    for (var i = 0; i < cursors.length; i++) { cursors[i].update(dt); cursors[i].draw(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
