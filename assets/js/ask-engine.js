/* Ask Me rule engine. Matches a question to an entry in persona.json.
   Works in the browser (window.AskEngine) and in Node (module.exports). */
(function (root) {
  const norm = t =>
    t.toLowerCase().replace(/['']/g, "'").replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const GREET_WORDS = new Set(['hi', 'hello', 'hey', 'howdy', 'greetings', 'yo', 'sup', 'hiya']);
  const YES_WORDS = new Set(['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'please']);

  // Scoring: an exact trigger phrase scores 3 per word in it; otherwise each
  // shared word longer than 3 letters scores 1. So any exact trigger, even a
  // one-word one, scores at least 3. Below 3 means the question only shares one
  // or two loose words with an entry, which is too weak to answer with.
  const MIN_SCORE = 3;

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function answer(qa) {
    const r = qa.response;
    return Array.isArray(r) ? pick(r) : r;
  }

  function score(P, n) {
    const words = new Set(n.split(' '));
    let best = 0, winner = null;
    for (const qa of P.qa) {
      let s = 0;
      for (const trigger of qa.triggers) {
        const nt = norm(trigger);
        if (n.includes(nt)) {
          s += nt.split(' ').length * 3; // exact phrase match, weighted by length
        } else {
          // partial: count shared tokens
          const tt = new Set(nt.split(' '));
          for (const w of tt) if (words.has(w) && w.length > 3) s += 1;
        }
      }
      if (s > best) { best = s; winner = qa; }
    }
    return { best, winner };
  }

  // Returns { kind, id, score, response }. kind is greeting, answer, weak or fallback.
  // state is optional: pass the same object each turn so a short "yes" after a
  // weak match answers the topic that was offered.
  function match(P, raw, state) {
    const n = norm(raw);
    const words = n.split(' ');

    if (state && state.pending) {
      const offered = state.pending;
      state.pending = null;
      if (words.length <= 3 && words.some(w => YES_WORDS.has(w))) {
        return { kind: 'answer', id: offered.id, score: null, response: answer(offered) };
      }
    }

    // Greeting shortcut (≤4 words and contains a greeting word)
    if (raw.trim().split(/\s+/).length <= 4 && words.some(w => GREET_WORDS.has(w))) {
      return { kind: 'greeting', id: null, score: null, response: pick(P.greeting) };
    }

    const { best, winner } = score(P, n);
    if (best < 1) return { kind: 'fallback', id: null, score: 0, response: pick(P.fallback) };
    if (best < MIN_SCORE) {
      if (state) state.pending = winner;
      return {
        kind: 'weak', id: winner.id, score: best,
        response: P.lowConfidence.replace('<topic>', winner.topic),
      };
    }
    return { kind: 'answer', id: winner.id, score: best, response: answer(winner) };
  }

  function findResponse(P, raw, state) {
    return match(P, raw, state).response;
  }

  const AskEngine = { norm, pick, match, findResponse, MIN_SCORE };
  if (typeof module !== 'undefined' && module.exports) module.exports = AskEngine;
  else root.AskEngine = AskEngine;
})(typeof window !== 'undefined' ? window : this);
