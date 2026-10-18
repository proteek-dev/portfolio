/* Landing: opening a lens.
   The tapped card grows from where it sits to fill the screen on a critically
   damped spring, while the landing page recedes behind it, like opening an app
   on iOS. The lens page then fades in (app.js). With reduced motion it's a
   short cross-fade instead. */
(function () {
  const M = window.Motion;
  const main = document.getElementById("main");
  const DURATION = 520;
  let sheet = null;
  let pageAnim = null;

  // The spring curve from base.css; older engines that can't parse linear() get a close cubic-bezier
  function easing() {
    const spring = getComputedStyle(document.documentElement).getPropertyValue("--spring").trim();
    try {
      document.body.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, easing: spring }).cancel();
      return spring;
    } catch (e) {
      return "cubic-bezier(.25, 1, .5, 1)";
    }
  }

  function open(btn) {
    const href = btn.getAttribute("data-href");
    if (!href || sheet) return;
    M.markSeen("lens-arrive"); // the lens page fades its <main> in once

    sheet = document.createElement("div");
    sheet.className = "lens-sheet";
    sheet.setAttribute("aria-hidden", "true");
    sheet.dataset.mode = btn.dataset.mode;
    document.body.appendChild(sheet);
    const go = () => { location.href = href; };

    if (M.reduced()) {
      sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: "forwards" }).finished.then(go, go);
      return;
    }

    // Start from the card's exact on-screen rect and corner radius, end at the full viewport
    const r = btn.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    const radius = getComputedStyle(btn).borderTopLeftRadius;
    const from = `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round ${radius})`;
    const ease = easing();

    // Card colour at the start, the lens page's background at the end
    const card = getComputedStyle(btn).backgroundColor;
    const page = getComputedStyle(document.body).backgroundColor;
    sheet.animate(
      [{ clipPath: from, backgroundColor: card }, { clipPath: "inset(0px 0px 0px 0px round 0px)", backgroundColor: page }],
      { duration: DURATION, easing: ease, fill: "forwards" }
    );
    // The page behind is pushed back and dimmed, anchored on the tapped card
    const m = main.getBoundingClientRect();
    main.style.transformOrigin = `${r.left - m.left + r.width / 2}px ${r.top - m.top + r.height / 2}px`;
    pageAnim = main.animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.94)", opacity: .35 }],
      { duration: DURATION, easing: ease, fill: "forwards" }
    );
    // Navigate once the sheet has nearly settled; the tail of the spring is invisible
    setTimeout(go, DURATION * 0.8);
  }

  // Back button from a lens page: put the landing page back as it was
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    if (sheet) { sheet.remove(); sheet = null; }
    if (pageAnim) { pageAnim.cancel(); pageAnim = null; }
  });

  document.querySelectorAll(".lens").forEach(btn => {
    btn.addEventListener("click", () => open(btn));
  });
})();
