// ProteinLab — vanilla JS games (Flask version)
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
      else if (k === "disabled") { if (v) e.setAttribute("disabled",""); }
      else e.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  };
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

  // ================== GAME LIST ==================
  const GAMES = [
    { key: "codon",         emoji: "🧩", title: "Kodon eşleştirme", desc: "mRNA kodonunu doğru amino asitle eşleştir", difficulty: "Kolay" },
    { key: "transcription", emoji: "✍️", title: "Transkripsiyon",   desc: "DNA'dan mRNA dizisi oluştur",              difficulty: "Orta" },
    { key: "replication",   emoji: "🔁", title: "Replikasyon",      desc: "DNA'nın yeni ipliğini oluştur (A↔T, G↔C)", difficulty: "Orta" },
    { key: "antikodon",     emoji: "🚕", title: "Antikodon bul",    desc: "mRNA kodonuna eşleşen tRNA antikodonu",     difficulty: "Orta" },
    { key: "sequence",      emoji: "🔢", title: "Adım sıralama",    desc: "Protein sentezi adımlarını sıraya koy",     difficulty: "Zor" },
  ];

  let active = "codon";
  const container = $("#game-container");
  const desc = $("#game-desc");
  const selector = $("#game-selector");

  function renderSelector() {
    selector.innerHTML = "";
    GAMES.forEach(g => {
      const isActive = g.key === active;
      const btn = el("button", {
        class: `p-4 rounded-2xl border-2 text-left transition-all ${
          isActive ? "bg-primary text-primary-foreground border-primary shadow-pop scale-[1.02]"
                   : "bg-card border-border hover:border-primary/50"}`,
        onclick: () => { active = g.key; renderAll(); }
      }, [
        el("div", { class: "text-2xl mb-1" }, g.emoji),
        el("div", { class: "font-bold text-sm" }, g.title),
        el("div", { class: `text-xs mt-1 ${isActive ? "opacity-80" : "text-muted-foreground"}` }, g.difficulty),
      ]);
      selector.appendChild(btn);
    });
  }

  function renderAll() {
    renderSelector();
    desc.textContent = GAMES.find(g => g.key === active).desc;
    container.innerHTML = "";
    GAMES_RENDER[active](container);
  }

  // ================== HELPERS ==================
  const cardWrap = (children) => el("div", { class: "rounded-3xl bg-card p-6 md:p-8 shadow-pop border border-border" }, children);
  const scoreBar = (round, score, extra) => {
    const row = el("div", { class: "flex justify-between mb-6 text-sm flex-wrap gap-2" }, [
      el("span", { class: "bg-muted px-3 py-1.5 rounded-full" }, [document.createTextNode("Tur "), el("strong", {}, String(round))]),
      el("span", { class: "bg-primary/10 text-primary px-3 py-1.5 rounded-full" }, [document.createTextNode("Skor "), el("strong", {}, String(score))]),
    ]);
    if (extra) row.appendChild(extra);
    return row;
  };

  // ================== 1) CODON ==================
  const CODON_TABLE = [
    { codon: "AUG", amino: "Metiyonin", short: "Met", emoji: "🚦" },
    { codon: "UUU", amino: "Fenilalanin", short: "Phe", emoji: "🌼" },
    { codon: "UUA", amino: "Lösin", short: "Leu", emoji: "🌿" },
    { codon: "GCU", amino: "Alanin", short: "Ala", emoji: "🍀" },
    { codon: "GGA", amino: "Glisin", short: "Gly", emoji: "🍃" },
    { codon: "CAU", amino: "Histidin", short: "His", emoji: "🌷" },
    { codon: "AAA", amino: "Lizin", short: "Lys", emoji: "🌻" },
    { codon: "GAA", amino: "Glutamik asit", short: "Glu", emoji: "🍇" },
    { codon: "UGG", amino: "Triptofan", short: "Trp", emoji: "🌽" },
    { codon: "UCU", amino: "Serin", short: "Ser", emoji: "🍒" },
    { codon: "UAA", amino: "DUR Kodonu", short: "STOP", emoji: "🛑" },
  ];

  function codonGame(root) {
    let state = { round: 1, score: 0, streak: 0, best: 0, current: rand(CODON_TABLE), feedback: null };
    state.options = makeOpts(state.current);

    function makeOpts(correct) {
      const others = CODON_TABLE.filter(c => c.codon !== correct.codon);
      return shuffle([correct, ...shuffle(others).slice(0, 3)]);
    }

    function render() {
      root.innerHTML = "";
      const wrap = cardWrap([]);
      wrap.appendChild(scoreBar(state.round, state.score,
        el("span", { class: "bg-accent/10 text-accent px-3 py-1.5 rounded-full" }, "🔥 " + state.streak)
      ));
      wrap.appendChild(el("p", { class: "text-center text-muted-foreground mb-2 text-sm" }, "Bu mRNA kodonu hangi amino asidi getirir?"));
      const codonBox = el("div", { class: `text-center my-6 ${state.feedback === "wrong" ? "animate-wiggle" : ""}` }, [
        el("div", { class: "inline-block bg-gradient-hero text-primary-foreground text-5xl md:text-6xl font-bold px-10 py-6 rounded-2xl tracking-widest shadow-soft" }, state.current.codon)
      ]);
      wrap.appendChild(codonBox);

      const grid = el("div", { class: "grid gap-3 grid-cols-2" });
      state.options.forEach(opt => {
        const btn = el("button", {
          class: "btn btn-outline h-auto py-4 px-3 flex-col gap-1 whitespace-normal",
          disabled: state.feedback !== null,
          onclick: () => pick(opt)
        }, [
          el("span", { class: "text-2xl" }, opt.emoji),
          el("span", { class: "text-sm font-semibold" }, opt.amino),
          el("span", { class: "text-xs text-muted-foreground" }, "(" + opt.short + ")"),
        ]);
        grid.appendChild(btn);
      });
      wrap.appendChild(grid);

      if (state.feedback === "correct") wrap.appendChild(el("p", { class: "text-center mt-4 text-primary font-semibold" }, "Aferin! Doğru bildin 🎉"));
      if (state.feedback === "wrong") wrap.appendChild(el("p", { class: "text-center mt-4 text-destructive font-semibold" }, "Doğrusu: " + state.current.amino + " " + state.current.emoji));

      root.appendChild(wrap);
    }

    function pick(opt) {
      if (opt.amino === state.current.amino) {
        state.score += 10; state.streak += 1; state.best = Math.max(state.best, state.streak);
        state.feedback = "correct";
      } else {
        state.streak = 0; state.feedback = "wrong";
      }
      render();
      setTimeout(() => {
        state.current = rand(CODON_TABLE);
        state.options = makeOpts(state.current);
        state.feedback = null; state.round += 1;
        render();
      }, 1000);
    }

    render();
  }

  // ================== 2) TRANSCRIPTION DNA->mRNA ==================
  function fillGame(root, opts) {
    // generic "fill bases" game used by transcription, replication
    const { len, sourceBases, answerBases, pair, sourceLabel, answerLabel, hint, points, sourceColorClass } = opts;
    let state = { round: 1, score: 0, source: "", answer: [], feedback: null };

    function newRound() {
      state.source = Array.from({ length: len }, () => rand(sourceBases)).join("");
      state.answer = Array(len).fill("");
      state.feedback = null;
    }
    function correct() { return state.source.split("").map(b => pair[b]).join(""); }

    function render() {
      root.innerHTML = "";
      const wrap = cardWrap([]);
      wrap.appendChild(scoreBar(state.round, state.score));
      wrap.appendChild(el("p", { class: "text-center text-muted-foreground mb-4 text-sm", html: hint }));

      wrap.appendChild(el("div", { class: "text-center mb-2 text-xs font-semibold text-muted-foreground" }, sourceLabel));
      const srcRow = el("div", { class: "flex justify-center gap-2 mb-6 flex-wrap" });
      state.source.split("").forEach(b => srcRow.appendChild(
        el("div", { class: `w-12 h-12 md:w-14 md:h-14 rounded-xl ${sourceColorClass} border-2 flex items-center justify-center font-mono font-bold text-xl` }, b)
      ));
      wrap.appendChild(srcRow);

      wrap.appendChild(el("div", { class: "text-center mb-2 text-xs font-semibold text-muted-foreground" }, "↓ " + answerLabel));
      const ansRow = el("div", { class: "flex justify-center gap-2 mb-6 flex-wrap" });
      const corr = correct();
      state.answer.forEach((b, i) => {
        let cls = "bg-muted border-border text-muted-foreground";
        if (state.feedback === "correct") cls = "bg-secondary/20 border-secondary text-secondary";
        else if (state.feedback === "wrong" && b !== corr[i]) cls = "bg-destructive/10 border-destructive text-destructive animate-wiggle";
        else if (b) cls = "bg-accent/10 border-accent text-accent";
        ansRow.appendChild(el("div", { class: `w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-xl ${cls}` }, b || "?"));
      });
      wrap.appendChild(ansRow);

      const baseGrid = el("div", { class: "grid grid-cols-4 gap-2 mb-4 max-w-sm mx-auto" });
      answerBases.forEach(b => {
        baseGrid.appendChild(el("button", {
          class: "btn btn-outline h-12 font-mono font-bold text-lg",
          disabled: !!state.feedback,
          onclick: () => {
            const idx = state.answer.findIndex(x => x === "");
            if (idx !== -1) { state.answer[idx] = b; render(); }
          }
        }, b));
      });
      wrap.appendChild(baseGrid);

      const isFull = state.answer.every(a => a !== "");
      const actions = el("div", { class: "flex gap-2 justify-center" }, [
        el("button", { class: "btn btn-ghost", disabled: !!state.feedback, onclick: () => { state.answer = Array(len).fill(""); render(); } }, "Temizle"),
        el("button", { class: "btn px-8", disabled: !isFull || !!state.feedback, onclick: check }, "Kontrol et"),
      ]);
      wrap.appendChild(actions);

      if (state.feedback === "correct") wrap.appendChild(el("p", { class: "text-center mt-4 text-primary font-semibold" }, "Mükemmel! 🎉"));
      if (state.feedback === "wrong") {
        const p = el("p", { class: "text-center mt-4 text-destructive font-semibold" }, "Doğrusu: ");
        p.appendChild(el("span", { class: "font-mono" }, corr));
        wrap.appendChild(p);
      }

      root.appendChild(wrap);
    }
    function check() {
      if (state.answer.join("") === correct()) { state.score += points; state.feedback = "correct"; }
      else state.feedback = "wrong";
      render();
      setTimeout(() => { state.round += 1; newRound(); render(); }, 1600);
    }

    newRound();
    render();
  }

  function transcriptionGame(root) {
    fillGame(root, {
      len: 6,
      sourceBases: ["A","T","G","C"],
      answerBases: ["A","U","G","C"],
      pair: { A:"U", T:"A", G:"C", C:"G" },
      sourceLabel: "DNA (kalıp)",
      answerLabel: "mRNA (sen yap)",
      hint: "DNA kalıp ipliğine göre <strong>mRNA dizisini</strong> oluştur.<br><span class='text-xs'>Hatırla: A→U, T→A, G→C, C→G</span>",
      points: 20,
      sourceColorClass: "bg-primary/10 text-primary border-primary/30",
    });
  }

  function replicationGame(root) {
    fillGame(root, {
      len: 8,
      sourceBases: ["A","T","G","C"],
      answerBases: ["A","T","G","C"],
      pair: { A:"T", T:"A", G:"C", C:"G" },
      sourceLabel: "Kalıp DNA ipliği",
      answerLabel: "Yeni iplik (sen yap)",
      hint: "DNA <strong>replikasyonu</strong>: kalıp ipliğe göre yeni ipliği oluştur.<br><span class='text-xs'>Hatırla: A↔T, G↔C</span>",
      points: 25,
      sourceColorClass: "bg-primary/10 text-primary border-primary/30",
    });
  }

  // ================== 4) ANTIKODON ==================
  function antikodonGame(root) {
    const PAIR = { A:"U", U:"A", G:"C", C:"G" };
    const BASES = ["A","U","G","C"];
    const randCodon = () => Array.from({length:3}, () => rand(BASES)).join("");
    let state = { round: 1, score: 0, streak: 0, codon: randCodon(), feedback: null };
    state.correct = state.codon.split("").map(b => PAIR[b]).join("");
    state.options = buildOptions();

    function buildOptions() {
      const set = new Set(); set.add(state.correct);
      while (set.size < 4) set.add(randCodon());
      return shuffle([...set]);
    }

    function render() {
      root.innerHTML = "";
      const wrap = cardWrap([]);
      wrap.appendChild(scoreBar(state.round, state.score,
        el("span", { class: "bg-accent/10 text-accent px-3 py-1.5 rounded-full" }, "🔥 " + state.streak)
      ));
      wrap.appendChild(el("p", { class: "text-center text-muted-foreground mb-4 text-sm",
        html: "Bu mRNA kodonuna eşleşen <strong>tRNA antikodonu</strong> hangisidir?<br><span class='text-xs'>A↔U, G↔C</span>" }));

      wrap.appendChild(el("div", { class: `text-center my-6 ${state.feedback === "wrong" ? "animate-wiggle" : ""}` }, [
        el("div", { class: "text-xs font-semibold text-muted-foreground mb-2" }, "mRNA kodonu"),
        el("div", { class: "inline-block bg-gradient-hero text-primary-foreground text-4xl md:text-5xl font-bold px-8 py-5 rounded-2xl tracking-widest shadow-soft" }, state.codon)
      ]));

      const grid = el("div", { class: "grid grid-cols-2 gap-3" });
      state.options.forEach(opt => {
        const isCorrect = state.feedback && opt === state.correct;
        grid.appendChild(el("button", {
          class: `btn btn-outline h-16 font-mono font-bold text-xl ${isCorrect ? "border-secondary bg-secondary/10 text-secondary" : ""}`,
          disabled: !!state.feedback,
          onclick: () => pick(opt)
        }, opt));
      });
      wrap.appendChild(grid);

      if (state.feedback === "correct") wrap.appendChild(el("p", { class: "text-center mt-4 text-primary font-semibold" }, "Doğru antikodon! 🎯"));
      if (state.feedback === "wrong") {
        const p = el("p", { class: "text-center mt-4 text-destructive font-semibold" }, "Doğrusu: ");
        p.appendChild(el("span", { class: "font-mono" }, state.correct));
        wrap.appendChild(p);
      }
      root.appendChild(wrap);
    }
    function pick(opt) {
      if (opt === state.correct) { state.score += 15; state.streak += 1; state.feedback = "correct"; }
      else { state.streak = 0; state.feedback = "wrong"; }
      render();
      setTimeout(() => {
        state.round += 1;
        state.codon = randCodon();
        state.correct = state.codon.split("").map(b => PAIR[b]).join("");
        state.options = buildOptions();
        state.feedback = null; render();
      }, 1100);
    }
    render();
  }

  // ================== 5) SEQUENCE ==================
  const STEPS = [
    { id:"1", label:"DNA çift sarmalı açılır", emoji:"🧬" },
    { id:"2", label:"RNA polimeraz mRNA'yı sentezler", emoji:"✍️" },
    { id:"3", label:"mRNA çekirdekten sitoplazmaya geçer", emoji:"📨" },
    { id:"4", label:"Ribozom mRNA'ya bağlanır", emoji:"🔗" },
    { id:"5", label:"tRNA amino asitleri taşır", emoji:"🚕" },
    { id:"6", label:"Amino asitler peptit bağıyla bağlanır", emoji:"⛓️" },
    { id:"7", label:"STOP kodonunda sentez biter, protein serbest kalır", emoji:"🛑" },
  ];
  function sequenceGame(root) {
    let state = { pool: shuffle(STEPS), picked: [], result: null };

    function render() {
      root.innerHTML = "";
      const wrap = cardWrap([]);
      wrap.appendChild(el("p", { class: "text-center text-muted-foreground mb-6 text-sm", html: "Protein sentezi adımlarını <strong>doğru sırayla</strong> tıkla." }));

      wrap.appendChild(el("div", { class: "text-xs font-semibold text-muted-foreground mb-2" }, "Sıralaman:"));
      const pickedBox = el("div", { class: "space-y-2 min-h-[60px] mb-6" });
      if (state.picked.length === 0) {
        pickedBox.appendChild(el("div", { class: "text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed border-border rounded-xl" }, "Aşağıdan adım seç ↓"));
      } else {
        state.picked.forEach((s, i) => {
          let cls = "bg-muted border-border";
          let mark = "";
          if (state.result) {
            if (s.id === STEPS[i].id) { cls = "bg-secondary/10 border-secondary"; mark = "✅"; }
            else { cls = "bg-destructive/10 border-destructive"; mark = "❌"; }
          }
          pickedBox.appendChild(el("div", { class: `flex items-center gap-3 p-3 rounded-xl border-2 ${cls}` }, [
            el("span", { class: "font-bold text-primary w-6" }, (i+1) + "."),
            el("span", { class: "text-2xl" }, s.emoji),
            el("span", { class: "text-sm flex-1" }, s.label),
            mark ? el("span", {}, mark) : null
          ]));
        });
      }
      wrap.appendChild(pickedBox);

      if (state.pool.length > 0 && !state.result) {
        wrap.appendChild(el("div", { class: "text-xs font-semibold text-muted-foreground mb-2" }, "Seçilebilir adımlar:"));
        const poolBox = el("div", { class: "grid gap-2 mb-4" });
        state.pool.forEach(s => {
          poolBox.appendChild(el("button", {
            class: "flex items-center gap-3 p-3 rounded-xl bg-background border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left",
            onclick: () => { state.picked.push(s); state.pool = state.pool.filter(x => x.id !== s.id); render(); }
          }, [
            el("span", { class: "text-2xl" }, s.emoji),
            el("span", { class: "text-sm flex-1" }, s.label),
          ]));
        });
        wrap.appendChild(poolBox);
      }

      const actions = el("div", { class: "flex flex-wrap gap-2 justify-center mt-6" });
      if (!state.result) {
        actions.appendChild(el("button", {
          class: "btn btn-ghost", disabled: state.picked.length === 0,
          onclick: () => {
            const last = state.picked.pop();
            if (last) state.pool.push(last);
            render();
          }
        }, "← Geri al"));
        actions.appendChild(el("button", {
          class: "btn", disabled: state.pool.length > 0,
          onclick: () => {
            let correct = 0;
            state.picked.forEach((s, i) => { if (s.id === STEPS[i].id) correct++; });
            state.result = { correct, total: STEPS.length };
            render();
          }
        }, "Kontrol et"));
      } else {
        actions.appendChild(el("button", { class: "btn", onclick: () => { state = { pool: shuffle(STEPS), picked: [], result: null }; render(); } }, "Tekrar oyna"));
      }
      wrap.appendChild(actions);

      if (state.result) {
        wrap.appendChild(el("div", { class: "mt-6 text-center" }, [
          el("div", { class: "text-3xl font-bold text-gradient mb-2" }, state.result.correct + " / " + state.result.total + " doğru"),
          el("p", { class: "text-sm text-muted-foreground" }, state.result.correct === state.result.total ? "Mükemmel! Sıralama tam isabet 🎯" : "Fena değil, tekrar deneyebilirsin 💪"),
        ]));
      }

      root.appendChild(wrap);
    }
    render();
  }

  const GAMES_RENDER = {
    codon: codonGame,
    transcription: transcriptionGame,
    replication: replicationGame,
    antikodon: antikodonGame,
    sequence: sequenceGame,
  };

  renderAll();
})();
