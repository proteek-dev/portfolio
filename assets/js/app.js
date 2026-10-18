(function () {
  const M = window.Motion;

  // Arriving from a cube click: cross-fade <main> in once
  if (M.seen("lens-arrive")) {
    M.clearSeen("lens-arrive");
    const main = document.querySelector("main");
    if (main && !M.reduced() && document.body.dataset.mode) main.classList.add("lens-arrive");
  }
})();
