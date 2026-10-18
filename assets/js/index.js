(function () {
  const warp = document.getElementById("portalWarp");
  const fx = document.getElementById("cubeFx");
  const M = window.Motion;
  const SCRIPT_SRC = document.currentScript && document.currentScript.src;

  if (!fx) return;

  // ----- Three.js burst: loaded on first intent, never on page load -----
  let burst = null;      // cube-burst.js module, once loaded and WebGL works
  let burstLoading = false;
  function loadBurst() {
    if (burstLoading || M.reduced() || !SCRIPT_SRC) return;
    burstLoading = true;
    import(new URL("cube-burst.js", SCRIPT_SRC).href)
      .then(mod => { if (mod.supported()) burst = mod; })
      .catch(() => { /* offline or blocked: the 2D burst covers it */ });
  }

  // "#00796b" (light theme) or "rgba(120,255,210,.92)" (dark theme) -> [r, g, b]
  function rgbOf(accent) {
    const hex = accent.match(/^#([0-9a-f]{6})$/i);
    if (hex) return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16));
    const m = accent.match(/rgba?\(([^)]+)\)/);
    return m ? m[1].split(/[ ,/]+/).filter(Boolean).slice(0, 3).map(Number) : [130, 170, 255];
  }
  const accentOf = (el) => getComputedStyle(el).getPropertyValue("--accent").trim();

  function tint(accent, alpha) {
    const [r, g, b] = rgbOf(accent);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // First visit: pulse 0–120ms, burst 120–520ms, warp 400ms, navigate 620ms.
  // Repeat visits: no pulse, smaller grid, navigate 220ms.
  function playBurst(btn, face, repeat, href, fallback) {
    const cube = btn.querySelector(".cube");
    const accent = accentOf(btn);
    const edge = getComputedStyle(document.documentElement).getPropertyValue("--fx-edge").trim();
    warp.style.setProperty("--warp-tint", tint(accent, 0.22));
    warp.classList.add("quick");

    const start = (scale) => {
      try {
        burst.play({ cubeEl: cube, accent: tint(accent, 1), edge, face, n: repeat ? 3 : 4, scale, duration: repeat ? 220 : 400 });
      } catch (err) {
        btn.classList.remove("pulsing");
        fallback();
        return;
      }
      btn.classList.add("burst-hidden");
      btn.classList.remove("pulsing");
    };

    if (repeat) {
      start(1);
      setTimeout(() => warp.classList.add("on"), 60);
      setTimeout(() => { location.href = href; }, 220);
    } else {
      btn.classList.add("pulsing");
      setTimeout(() => start(1.08), 120);
      setTimeout(() => warp.classList.add("on"), 400);
      setTimeout(() => { location.href = href; }, 620);
    }
  }

  // Back button from a lens page: undo the click state so the portal works again
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    if (burst) burst.dispose();
    document.querySelectorAll(".lens").forEach(l => l.classList.remove("pulsing", "burst-hidden", "disintegrating"));
    warp.classList.remove("on", "quick");
    particles.length = 0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  });

  const ctx = fx.getContext("2d", { alpha: true });

  // ----- Canvas sizing -----
  function resizeFx() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    fx.width = Math.floor(window.innerWidth * dpr);
    fx.height = Math.floor(window.innerHeight * dpr);
    fx.style.width = "100vw";
    fx.style.height = "100vh";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeFx();
  window.addEventListener("resize", resizeFx, { passive: true });

  // ----- Particle system -----
  const particles = [];
  const MAX_PARTICLES = 1400;

  // Face “normal” mapped to 2D screen bias (sells the 3D face illusion)
  const faceBias = {
    front:  { x: 0.0, y: 0.0 },
    back:   { x: 0.0, y: 0.0 },
    right:  { x: 1.0, y: 0.0 },
    left:   { x: -1.0, y: 0.0 },
    top:    { x: 0.0, y: -1.0 },
    bottom: { x: 0.0, y: 1.0 },
  };

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  // Draw a tiny isometric cube made of 3 faces (top/left/right)
  function drawIsoCube(ctx, x, y, s, a, tiltX, tiltY, rgb) {
    const ink = rgb.join(",");
    // tiltX/tiltY are in [-1..1], derived from velocity direction to sell “3D”
    const tx = tiltX * 0.55;
    const ty = tiltY * 0.55;

    // isometric-ish offsets
    const hx = s * (0.9 + tx * 0.2);
    const hy = s * (0.55 + ty * 0.2);
    const vz = s * 0.9; // vertical edge length

    // Points (screen space)
    // Top diamond
    const p0 = { x: x,       y: y - vz };
    const p1 = { x: x + hx,  y: y - vz + hy };
    const p2 = { x: x,       y: y - vz + hy * 2 };
    const p3 = { x: x - hx,  y: y - vz + hy };

    // Bottom diamond (shifted down)
    const q0 = { x: x,       y: y };
    const q1 = { x: x + hx,  y: y + hy };
    const q2 = { x: x,       y: y + hy * 2 };
    const q3 = { x: x - hx,  y: y + hy };

    // Face alphas (keep subtle)
    const topA   = 0.80 * a;
    const leftA  = 0.55 * a;
    const rightA = 0.70 * a;
    const edgeA  = 0.35 * a;


    // TOP face p0-p1-p2-p3
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${ink},${topA})`;
    ctx.fill();

    // RIGHT face p1-q1-q2-p2
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(q1.x, q1.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${ink},${rightA})`;
    ctx.fill();

    // LEFT face p3-p2-q2-q3
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.lineTo(q3.x, q3.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${ink},${leftA})`;
    ctx.fill();

    // Edges
    ctx.strokeStyle = `rgba(${ink},${edgeA})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // top outline
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
    // verticals
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(q1.x, q1.y);
    ctx.moveTo(p2.x, p2.y); ctx.lineTo(q2.x, q2.y);
    ctx.moveTo(p3.x, p3.y); ctx.lineTo(q3.x, q3.y);
    // bottom partial outline
    ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y);
    ctx.stroke();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnCubelets(x, y, face, amount, strength, rgb) {
    const b = faceBias[face] || faceBias.front;

    for (let i = 0; i < amount; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();

      // Direction: random + face bias
      let vx = rand(-1, 1) * 0.7 + b.x * 1.3;
      let vy = rand(-1, 1) * 0.7 + b.y * 1.3;

      const dirLen = Math.hypot(vx, vy) || 1;
      const tx = vx / dirLen;  // -1..1
      const ty = vy / dirLen;  // -1..1

      // Back face feels “pulled inward” instead of blown out
      if (face === "back") {
        vx *= 0.55;
        vy *= 0.55;
      }

      const speed = strength * rand(0.6, 1.25);

      const size = rand(6, 12);
      const life = rand(35, 70); // frames-ish feel, we’ll decrement by dt
      const rot = rand(0, Math.PI * 2);
      const spin = rand(-0.18, 0.18);

      particles.push({
        x, y,
        vx: vx * speed,
        vy: vy * speed,
        size,
        life,
        maxLife: life,
        rot,
        spin,
        shrink: (face === "back") ? rand(0.015, 0.03) : rand(0.004, 0.014),
        tx, ty, rgb
      });
    }
  }

  function draw(dt) {
    // Clear
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Update + draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.life -= dt;
      if (p.life <= 0 || p.size <= 0.2) {
        particles.splice(i, 1);
        continue;
      }

      // Movement with a little drag
      p.vx *= (1 - 0.018 * dt);
      p.vy *= (1 - 0.018 * dt);

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Float up a touch (vapor feel) unless it’s bottom face
      p.vy -= 0.012 * dt;

      // Size decay
      p.size -= p.shrink * (dt * 16);

      // Fade
      const a = Math.max(0, Math.min(1, p.life / p.maxLife));

      p.rot += p.spin * dt;

      // Slight “billow” wobble
      const wobble = Math.sin((p.maxLife - p.life) * 0.35 + p.rot) * 0.18;
      const tiltX = clamp01((p.tx + 1) * 0.5) * 2 - 1; // normalize back to -1..1
      const tiltY = clamp01((p.ty + 1) * 0.5) * 2 - 1;

      drawIsoCube(ctx, p.x, p.y, p.size, a, tiltX + wobble, tiltY - wobble, p.rgb);

    }
  }

  // ----- Hover tracking per lens -----
  let lastT = performance.now();
  let ticking = false;

  // store per-lens hover state
  const hoverState = new Map(); // lensEl -> {x,y,face,active}

  function getFaceFromEl(el) {
    if (!el || !el.classList) return "front";
    for (const name of ["front","back","right","left","top","bottom"]) {
      if (el.classList.contains(name)) return name;
    }
    return "front";
  }

  function ensureRunning() {
    if (ticking) return;
    ticking = true;
    lastT = performance.now();
    requestAnimationFrame(tick);
  }

  function anyHoverActive() {
    for (const st of hoverState.values()) {
      if (st.active) return true;
    }
    return false;
  }

  function tick(now) {
    const dtMs = now - lastT;
    lastT = now;

    // dt in “frames” (1 ~= 16ms)
    const dt = Math.max(0.5, Math.min(2.2, dtMs / 16.67));

    // Emit hover particles
    for (const st of hoverState.values()) {
      if (!st.active) continue;
      // emission: small continuous stream
      spawnCubelets(st.x, st.y, st.face, 10, 0.9, st.rgb);
    }

    draw(dt);

    // stop loop if nothing to do
    if (particles.length === 0 && !anyHoverActive()) {
      ticking = false;
      return;
    }
    requestAnimationFrame(tick);
  }

  // Hidden tab: stop emitting and drop particles; the running tick ends itself
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    for (const st of hoverState.values()) st.active = false;
    particles.length = 0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  });

  // ----- Wire up faces + click -----
  document.querySelectorAll(".lens").forEach(btn => {
    const faces = btn.querySelectorAll(".cube .face");
    hoverState.set(btn, { x: 0, y: 0, face: "front", active: false, rgb: [130, 170, 255] });
    btn.addEventListener("pointerenter", loadBurst, { once: true });
    btn.addEventListener("focus", loadBurst, { once: true });

    // Pointer movement on each face = true “3D-ish” hotspot origin
    faces.forEach(faceEl => {
      faceEl.addEventListener("pointerenter", (e) => {
        if (M.reduced() || M.coarse()) return;
        const st = hoverState.get(btn);
        st.active = true;
        st.face = getFaceFromEl(faceEl);
        st.rgb = rgbOf(accentOf(btn));  // read on entry so it follows a theme change
        st.x = e.clientX;
        st.y = e.clientY;
        ensureRunning();
      }, { passive: true });

      faceEl.addEventListener("pointermove", (e) => {
        if (M.reduced() || M.coarse()) return;
        const st = hoverState.get(btn);
        st.active = true;
        st.face = getFaceFromEl(faceEl);
        st.x = e.clientX;
        st.y = e.clientY;
        ensureRunning();
      }, { passive: true });

      faceEl.addEventListener("pointerleave", () => {
        const st = hoverState.get(btn);
        st.active = false;
      }, { passive: true });
    });

    // Click = burst + vapor + warp navigation (keeps your timing vibe)
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("data-href");
      if (!href) return;

      if (M.reduced()) {
        location.href = href;
        return;
      }

      const st = hoverState.get(btn);
      let cx = st?.x, cy = st?.y, face = st?.face || "front";

      // Keyboard (Enter/Space fire click with detail 0): cube centre and front face
      if (e.detail === 0) face = "front";
      if (e.detail === 0 || !cx || !cy) {
        const cube = btn.querySelector(".cube");
        const r = cube?.getBoundingClientRect();
        if (r) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
        else { cx = window.innerWidth / 2; cy = window.innerHeight / 2; }
      }

      // The click takes over from the hover stream
      for (const s of hoverState.values()) s.active = false;

      // First warp of the session gets the full burst; repeats are shorter
      const repeat = M.seen("portal-warp");
      M.markSeen("portal-warp");
      M.markSeen("lens-arrive"); // the lens page fades its <main> in once

      // Today's 2D burst and warp: used when Three.js isn't ready or WebGL fails
      const fallback = () => {
        btn.classList.add("disintegrating");
        spawnCubelets(cx, cy, face, repeat ? 80 : 320, 3.0, rgbOf(accentOf(btn)));
        ensureRunning();
        warp.classList.add("on");
        setTimeout(() => { location.href = href; }, repeat ? 180 : 520);
      };

      if (burst) playBurst(btn, face, repeat, href, fallback);
      else fallback();
    });
  });
})();
