(function () {
  const M = window.Motion;

  // Arriving from a cube click: fade <main> in once
  if (M.seen("lens-arrive")) {
    M.clearSeen("lens-arrive");
    const main = document.querySelector("main");
    if (main && !M.reduced() && document.body.dataset.mode) main.classList.add("lens-arrive");
  }

  // Cursor glow: fine pointers without reduced motion only, one style write per animation frame
  const glow = document.getElementById("cursorGlow");
  if (glow) {
    let gx = 0, gy = 0, glowFrame = 0;
    const writeGlow = () => {
      glowFrame = 0;
      glow.style.left = gx + "px";
      glow.style.top = gy + "px";
    };
    const onMove = (e) => {
      gx = e.clientX; gy = e.clientY;
      if (!glowFrame) glowFrame = requestAnimationFrame(writeGlow);
    };
    let listening = false;
    const applyGlow = () => {
      const off = M.coarse() || M.reduced();
      glow.classList.toggle("is-off", off);
      if (off && listening) { window.removeEventListener("pointermove", onMove); listening = false; }
      if (!off && !listening) { window.addEventListener("pointermove", onMove, { passive: true }); listening = true; }
    };
    applyGlow();
    M.onChange(applyGlow);
  }

  // Starfield (lightweight)
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", () => { resize(); if (!animating()) drawFrame(); });
  resize();

  const stars = [];
  const N = window.innerWidth < 640 ? 110 : 220;

  for (let i = 0; i < N; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      v: (Math.random() * 0.22 + 0.05) * (Math.random() > 0.5 ? 1 : -1)
    });
  }

  let t = 0;
  let frame = 0;

  function drawFrame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const s of stars) {
      const tw = Math.sin(t + s.x * 0.01) * 0.15;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.a + tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick() {
    t += 0.01;
    for (const s of stars) {
      s.y += s.v;
      if (s.y < -10) s.y = window.innerHeight + 10;
      if (s.y > window.innerHeight + 10) s.y = -10;
    }
    drawFrame();
    frame = requestAnimationFrame(tick);
  }

  const shouldAnimate = () => !M.reduced() && !M.coarse() && !document.hidden;
  const animating = () => frame !== 0;

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  // Animate when allowed; otherwise one static frame and no loop
  function apply() {
    if (shouldAnimate()) {
      if (!animating()) frame = requestAnimationFrame(tick);
    } else {
      stop();
      if (!document.hidden) drawFrame();
    }
  }

  apply();
  M.onChange(apply);
  M.onVisibility(apply);
})();
