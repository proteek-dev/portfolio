/* Shared motion helpers. Load before app.js and index.js.
   Decorative effects check these so they respect reduced motion, touch screens
   and hidden tabs. Both media queries are live. */
(function () {
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarseMq = window.matchMedia("(pointer: coarse)");
  const noHoverMq = window.matchMedia("(hover: none)");
  const changeFns = [];

  function onMqChange(mq) {
    const fire = () => changeFns.forEach(fn => fn());
    if (mq.addEventListener) mq.addEventListener("change", fire);
    else if (mq.addListener) mq.addListener(fire); // older Safari
  }
  [reducedMq, coarseMq, noHoverMq].forEach(onMqChange);

  window.Motion = {
    reduced: () => reducedMq.matches,
    coarse: () => coarseMq.matches || noHoverMq.matches,
    // fn() runs whenever reduced() or coarse() may have changed
    onChange: fn => { changeFns.push(fn); },
    onVisibility: fn => {
      document.addEventListener("visibilitychange", () => fn(document.hidden));
    },
    seen: key => {
      try { return sessionStorage.getItem("seen:" + key) === "1"; }
      catch (e) { return false; }
    },
    markSeen: key => {
      try { sessionStorage.setItem("seen:" + key, "1"); }
      catch (e) { /* storage unavailable: behave as a first visit */ }
    },
    clearSeen: key => {
      try { sessionStorage.removeItem("seen:" + key); }
      catch (e) { /* storage unavailable */ }
    },
  };
})();
