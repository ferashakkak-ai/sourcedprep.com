// Sourced Prep citizenship practice interview. Reads questions.json (2025) or questions-2008.json (2008): the public USCIS lists only.
// With ?lang=es it also reads es128.json (Sourced Prep's own Spanish study help for the 2025 list) or es2008.json (USCIS's Spanish translation of the 2008 list).
// Scoring follows the 2025 civics test as USCIS describes it: up to 20 questions, pass at 12 correct, stop at 12 correct or 9 wrong.
// 2008 test (filed before 20 October 2025): 10 questions from 100, pass at 6, stop at 6 correct or 5 wrong (USCIS Policy Manual vol 12 part E ch 2).
// 65/20 list (either test): 10 of the 20 starred questions, pass at 6. "All" mode goes through the whole list in order.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var mode = params.get("list") === "6520" ? "6520" : (params.get("mode") === "all" ? "all" : "standard");   // "review" is set below
  var v2008 = params.get("test") === "2008";
  var es = params.get("lang") === "es" || document.documentElement.lang === "es";
  var only = (params.get("only") || "").split(",").map(Number).filter(function (n) { return n > 0; });
  if (only.length) mode = "review";
  var total = v2008 ? 100 : 128;
  var T = es ? {
    test: v2008 ? "examen de 2008" : "examen de 2025",
    t_std: "Entrevista de práctica: " + (v2008 ? "examen de 2008" : "examen de 2025"),
    t_6520: "Práctica 65/20, " + (v2008 ? "examen de 2008" : "examen de 2025") + " (10 preguntas)",
    t_all: "Las " + total + " preguntas, " + (v2008 ? "examen de 2008" : "examen de 2025"),
    lede_std: v2008 ? "Para solicitudes presentadas antes del 20 de octubre de 2025. El oficial le hace hasta 10 de las 100 preguntas en inglés; usted necesita 6 correctas. Diga su respuesta en voz alta, muestre las respuestas y marque con honestidad si la sabía. El español es solo una ayuda para entender."
                    : "El oficial le hace hasta 20 preguntas en inglés. Diga su respuesta en voz alta, muestre las respuestas y marque con honestidad si la sabía. El español es solo una ayuda para entender.",
    t_review: "Práctica de las preguntas por repasar",
    lede_6520: "El oficial le hace 10 de las 20 preguntas marcadas 65/20 y usted necesita al menos 6 correctas. Puede tomar este examen en el idioma de su elección con un intérprete.",
    lede_all: "Las " + total + " preguntas en el orden de USCIS. Diga su respuesta, muestre las respuestas y marque si la sabía.",
    lede_review: "Solo las preguntas que marcó para repasar. Tómese su tiempo.",
    doneT: function (n, r) { return "Terminado. Practicó " + n + " preguntas y sabía " + r + "."; },
    passedT: function (n, r) { return "Muy bien. Practicó " + n + " preguntas y sabía " + r + "."; },
    notyetT: function (n, m) { return "Practicó " + n + " preguntas. Siga adelante: " + m + " por repasar."; },
    rulePass: function (p) { return "En la entrevista, el oficial se detiene después de " + p + " respuestas correctas. En esta ronda llegó a " + p + ". "; },
    ruleFail: function (f, p) { return "En la entrevista, el oficial se detiene después de " + f + " respuestas no correctas. En esta ronda tiene " + f + " por repasar. "; },
    fin: "Ronda terminada",
    primaryMissed: function (m) { return m === 1 ? "Practique otra vez esta pregunta" : "Practique otra vez estas " + m; },
    newRound: "Nueva ronda", nextPass: "Siguiente: el examen de lectura y escritura (artículo en inglés)", nextUrl: "/citizenship/reading-writing-test/",
    undo: "Deshacer la última marca",
    tally: function (r, w) { return " · " + r + " que sabía, " + w + " por repasar"; },
    hearEn: "Escuchar la pregunta (en inglés)",
    q: "Pregunta", of: "de", right: "sabidas", wrong: "por repasar",
    show: "Mostrar las respuestas", ok: "La sabía", bad: "La voy a repasar", hear: "Escuchar la pregunta",
    ans: "Respuestas de la lista de USCIS:",
    done: "Terminado. Sabía ", rightOf: " de ",
    reviewAll: "Siguiente paso: repase las preguntas de abajo y luego haga una entrevista de práctica.",
    passed: "Muy bien. Sabía ", notyet: "Siga practicando. Sabía ",
    stopOfficer: "El oficial se detendría aquí: ", stopDecided: "La práctica termina aquí porque el resultado ya está decidido: ",
    reached: function (n) { return "llegó a " + n + " respuestas correctas. "; },
    cannot: function (w, n) { return "con " + w + " preguntas por repasar, esta ronda ya no llega a " + n + ". Están abajo: practíquelas y vuelva a intentarlo. "; },
    only: "Esto es solo práctica; el examen real es oral y lo decide el oficial.",
    calm: "No hay límite de tiempo, y nada de lo que marque se guarda ni se envía. Es normal sentir nervios: tómese su tiempo.",
    none: "Nada que repasar esta vez.", again: "Practicar otra vez", back: "Volver a la lista",
    fail: "No se pudieron cargar las preguntas. La lista completa está en la página de preguntas.",
    review: "Preguntas para repasar",
    listed: function (d) { return "Según la página de USCIS, leída el " + d + ": "; },
    own: "Esta respuesta depende de dónde vive. Diga la respuesta de su estado y compruébela en: "
  } : {
    test: v2008 ? "2008 civics test" : "2025 civics test",
    t_std: "Practice interview: " + (v2008 ? "2008 civics test" : "2025 civics test"),
    t_6520: "65/20 practice, " + (v2008 ? "2008 civics test" : "2025 civics test") + " (10 questions)",
    t_all: "All " + total + " questions, " + (v2008 ? "2008 civics test" : "2025 civics test"),
    lede_std: v2008 ? "For applications filed before 20 October 2025. The officer asks up to 10 of the 100 questions; you need 6 correct. Say your answer out loud, then show the USCIS answers and mark yourself honestly."
                    : "2025 civics test: the officer asks up to 20 questions. Say your answer out loud, then show the USCIS answers and mark yourself honestly.",
    lede_6520: "The officer asks 10 of the 20 questions marked 65/20, and you need at least 6 correct. You may take this test in the language of your choice with an interpreter.",
    lede_all: "All " + total + " questions in USCIS order. Say your answer, show the answers, mark whether you knew it.",
    lede_review: "Only the questions you marked to review. Take your time.",
    t_review: "Practice the questions to review",
    doneT: function (n, r) { return "Done. You practiced " + n + " questions and knew " + r + "."; },
    passedT: function (n, r) { return "Well done. You practiced " + n + " questions and knew " + r + "."; },
    notyetT: function (n, m) { return "You practiced " + n + " questions. Keep going: " + m + " to review."; },
    rulePass: function (p) { return "In the interview, the officer stops after " + p + " correct answers. In this round you reached " + p + ". "; },
    ruleFail: function (f, p) { return "In the interview, the officer stops after " + f + " answers that are not correct. In this round you have " + f + " to review. "; },
    fin: "Round complete",
    primaryMissed: function (m) { return m === 1 ? "Practice this question again" : "Practice these " + m + " again"; },
    newRound: "New round", nextPass: "Next: the reading and writing test", nextUrl: "/citizenship/reading-writing-test/",
    undo: "Undo last mark",
    tally: function (r, w) { return " · " + r + " known, " + w + " to review"; },
    hearEn: "Hear the question",
    q: "Question", of: "of", right: "known", wrong: "to review",
    show: "Show the answers", ok: "I knew it", bad: "I will review it", hear: "Hear the question",
    ans: "Answers on the USCIS list:",
    done: "Done. You knew ", rightOf: " of ",
    reviewAll: "Next step: review the questions below, then try a practice interview.",
    passed: "Well done. You knew ", notyet: "Keep going. You knew ",
    stopOfficer: "The officer would stop here: ", stopDecided: "The practice stops here because the result is decided: ",
    reached: function (n) { return "you reached " + n + " correct answers. "; },
    cannot: function (w, n) { return "with " + w + " to review, this round cannot reach " + n + ". They are listed below: practice them, then try again. "; },
    only: "This is practice only; the real test is spoken, and the officer decides.",
    calm: "There is no time limit, and nothing you mark is saved or sent. Feeling nervous is normal, so take your time.",
    none: "Nothing to review this time.", again: "Practice again", back: "Back to the question list",
    fail: "The questions could not be loaded. The full list is on the question list page.",
    review: "Questions to review",
    listed: function (d) { return "As listed by USCIS, read on " + d + ": "; },
    own: "This answer depends on where you live. Say your own answer, then check it at: "
  };
  var rules = {
    standard: v2008 ? { ask: 10, pass: 6, failAt: 5, title: T.t_std } : { ask: 20, pass: 12, failAt: 9, title: T.t_std },
    "6520": { ask: 10, pass: 6, failAt: 5, title: T.t_6520 },
    all: { ask: total, pass: null, failAt: null, title: T.t_all },
    review: { ask: only.length, pass: null, failAt: null, title: T.t_review }
  }[mode];
  var listUrl = es ? (v2008 ? "/es/ciudadania/2008/" : "/es/ciudadania/") : (v2008 ? "/citizenship/2008/" : "/citizenship/");

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function getJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(function () {}); }
  var files = [getJSON(v2008 ? "/citizenship/questions-2008.json" : "/citizenship/questions.json")];
  if (es) files.push(getJSON(v2008 ? "/citizenship/es2008.json" : "/citizenship/es128.json"));
  var namesP = getJSON("/citizenship/current-names.json").catch(function () { return null; });
  Promise.all(files.concat([namesP])).then(function (res) {
    var NAMES = res[res.length - 1];
    var ES = {};
    if (es) res[1].questions.forEach(function (s) { ES[s.n] = s; });
    var pool = res[0].questions;
    if (mode === "6520") pool = pool.filter(function (q) { return q.star; });
    if (mode === "review") pool = pool.filter(function (q) { return only.indexOf(q.n) >= 0; });
    // Questions whose answer depends on where you live or on who holds office stay in every mode (the officer asks them too):
    // federal names are shown as USCIS lists them, with the date read; state answers get a "say your own, then check" prompt.
    var varies = function (q) { var a = (q.answers[0] || ""); return /^Answers will vary/.test(a) || /^Visit uscis\.gov/.test(a); };
    var current = function (q) { return NAMES && NAMES[v2008 ? "2008" : "2025"] && NAMES[v2008 ? "2008" : "2025"][String(q.n)]; };
    var lookup = function (q) {
      var t = (q.q + " " + (q.answers.join(" "))).toLowerCase();
      if (!NAMES) return "";
      if (/senator/.test(t)) return NAMES.state_lookup.senators;
      if (/representative/.test(t) && !/house of representatives now/.test(t)) return NAMES.state_lookup.representative;
      if (/governor/.test(t)) return NAMES.state_lookup.governor;
      return "";
    };
    var order = mode === "all" ? pool.slice() : shuffle(pool.slice()).slice(0, rules.ask);
    var i = 0, right = 0, wrong = 0, missed = [], started = false, hist = [];
    document.documentElement.lang = es ? "es" : "en";
    document.querySelector("h1").textContent = rules.title;
    $("lede").textContent = mode === "6520" ? T.lede_6520 : mode === "all" ? T.lede_all : mode === "review" ? T.lede_review : T.lede_std;
    if ($("calm")) $("calm").textContent = T.calm;
    $("show").textContent = T.show; $("right").textContent = T.ok; $("wrong").textContent = T.bad; $("speak").textContent = (es && mode !== "6520") ? T.hearEn : T.hear;
    if ($("undo")) $("undo").textContent = T.undo;
    $("answers").querySelector("p.small").textContent = T.ans;

    $("back").textContent = T.back; $("back").setAttribute("href", listUrl);
    var h3 = $("result").querySelector("h3"); if (h3) h3.textContent = T.review;
    if (v2008) {
      var src = $("src");
      if (src) src.innerHTML = 'Questions and answers: USCIS, <a href="https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.pdf" rel="noopener">Civics (History and Government) Questions for the Naturalization Test (rev. 01/19)</a>, the 2008 civics test' + (es ? ", with USCIS's Spanish translation" : "") + '. Some answers change with elections and appointments: check <a href="https://www.uscis.gov/citizenship/testupdates" rel="noopener">uscis.gov/citizenship/testupdates</a> before your interview.';
      var fl = $("footlist");
      if (fl) fl.textContent = es ? "The 100 civics questions and answers of the 2008 test, in English and in USCIS's Spanish translation, are from USCIS's public lists (rev. 01/19); all other text on these pages is Sourced Prep's own."
                                  : "The 100 civics questions and answers of the 2008 test are from USCIS's public list (rev. 01/19); all other text on these pages is Sourced Prep's own.";
    } else if (es) {
      var src2 = $("src");
      if (src2) src2.innerHTML = 'Preguntas y respuestas: lista pública de USCIS, <a href="https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf" rel="noopener" lang="en">128 Civics Questions and Answers (2025 version), M-1778 (09/25)</a>. Sourced Prep la comprobó por última vez el 10 de noviembre de 2026. Algunas respuestas cambian con las elecciones y los nombramientos: consulte <a href="https://www.uscis.gov/es/ciudadania/actualizacionesalexamen" rel="noopener">uscis.gov/es/ciudadania/actualizacionesalexamen</a> antes de su entrevista. El español es una traducción propia de Sourced Prep, solo como ayuda de estudio.';
    }
    $("app").hidden = false;

    function addSpan(el, text) {
      if (!text) return;
      var s = document.createElement("span"); s.className = "es"; s.style.display = "block"; s.lang = "es"; s.textContent = text; el.appendChild(s);
    }
    function show() {
      var q = order[i], s = ES[q.n];
      var tally = mode === "all" ? "" : T.tally(right, wrong);
      $("progress").textContent = T.q + " " + (i + 1) + " " + T.of + " " + order.length + tally;
      if ($("pbar")) $("pbar").style.width = Math.round(100 * (i + 1) / order.length) + "%";
      var qt = $("qtext"); qt.textContent = "";
      var en = document.createElement("span"); en.textContent = q.n + ". " + q.q; if (es) en.lang = "en"; qt.appendChild(en);
      if (s) addSpan(qt, s.q_es);
      var ul = $("alist"); ul.textContent = "";
      q.answers.forEach(function (a, k) {
        var li = document.createElement("li"); li.textContent = a; if (es) li.lang = "en";
        if (s && s.answers_es && s.answers_es.length === q.answers.length) addSpan(li, s.answers_es[k]);
        ul.appendChild(li);
      });
      if (s && s.answers_es && s.answers_es.length !== q.answers.length) {
        s.answers_es.forEach(function (b) { var li = document.createElement("li"); addSpan(li, b); ul.appendChild(li); });
      }
      var an = $("anote"); an.textContent = q.note || ""; if (s) addSpan(an, s.note_es);
      if (varies(q)) {
        var cur = current(q), p = document.createElement("span"); p.style.display = "block";
        if (cur) { var j = cur.join("; "); p.textContent = T.listed(es && NAMES.read_es ? NAMES.read_es : NAMES.read) + j + (/\.$/.test(j) ? "" : "."); }
        else if (lookup(q)) p.textContent = T.own + lookup(q) + ".";
        if (p.textContent) an.appendChild(p);
      }
      $("answers").classList.remove("show");
      $("controls").classList.remove("hidden");
      $("mark").classList.add("hidden");
      if ($("undo")) $("undo").classList.toggle("hidden", !hist.length);
      if (started) { $("show").focus(); document.body.classList.add("going"); }
      started = true;
    }

    function finish(reason) {
      $("app").querySelector(".card").classList.add("hidden");
      $("result").classList.remove("hidden");
      var asked = right + wrong;
      if (mode === "all" || mode === "review") {
        $("rtitle").textContent = T.doneT(asked, right);
        $("rtext").textContent = (missed.length ? T.reviewAll + " " : "") + T.only;
      } else {
        var passed = right >= rules.pass;
        $("rtitle").textContent = passed ? T.passedT(asked, right) : T.notyetT(asked, missed.length);
        $("rtext").textContent = (reason === "pass" ? T.rulePass(rules.pass) : reason === "fail" ? T.ruleFail(rules.failAt, rules.pass) : "") + T.only;
      }
      var keep = new URLSearchParams(location.search); keep.delete("only");
      var base = location.pathname + (keep.toString() ? "?" + keep.toString() : "");
      var pr = $("primary"), nr = $("newround");
      if (missed.length) {
        var k = new URLSearchParams(keep.toString()); k.set("only", missed.map(function (q) { return q.n; }).join(","));
        pr.href = location.pathname + "?" + k.toString(); pr.textContent = T.primaryMissed(missed.length);
      } else { pr.href = T.nextUrl; pr.textContent = T.nextPass; }
      nr.href = base; nr.textContent = T.newRound;
      var ol = $("rlist"); ol.textContent = "";
      if ($("finword")) $("finword").textContent = T.fin;
      var rh3 = $("result").querySelector("h3");
      if (rh3) rh3.classList.toggle("hidden", !missed.length); ol.classList.toggle("hidden", !missed.length);
      if (!missed.length) $("rtext").textContent = T.none + " " + $("rtext").textContent;
      missed.forEach(function (q) {
        var li = document.createElement("li"); var a = document.createElement("a");
        a.href = listUrl + "#q" + q.n; a.textContent = q.n + ". " + q.q; li.appendChild(a); ol.appendChild(li);
      });
      $("rtitle").setAttribute("tabindex", "-1"); $("rtitle").focus();
    }

    function next(ok) {
      hist.push({ i: i, right: right, wrong: wrong, missed: missed.length });
      if (ok) right++; else { wrong++; missed.push(order[i]); }
      i++;
      if (rules.pass && right >= rules.pass) return finish("pass");
      if (rules.failAt && wrong >= rules.failAt) return finish("fail");
      if (i >= order.length) return finish("end");
      show();
    }

    $("show").addEventListener("click", function () {
      $("answers").classList.add("show");
      $("controls").classList.add("hidden");
      $("mark").classList.remove("hidden");
      $("answers").setAttribute("tabindex", "-1"); $("answers").focus();   // screen readers hear the answers first
      setTimeout(function () { $("mark").scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 60);
    });
    if ($("undo")) $("undo").addEventListener("click", function () {
      var h = hist.pop(); if (!h) return;
      i = h.i; right = h.right; wrong = h.wrong; missed.length = h.missed; show();
    });
    $("right").addEventListener("click", function () { next(true); });
    $("wrong").addEventListener("click", function () { next(false); });
    if ("speechSynthesis" in window) {
      $("speak").addEventListener("click", function () {
        window.speechSynthesis.cancel();
        var q = order[i], s = ES[q.n];
        var useEs = es && mode === "6520" && s;   // 65/20 applicants may be tested in their own language
        var u = new SpeechSynthesisUtterance(useEs ? s.q_es : q.q); u.lang = useEs ? "es-US" : "en-US"; u.rate = 0.9;
        window.speechSynthesis.speak(u);
      });
    } else { $("speak").classList.add("hidden"); }
    show();
  }).catch(function () {
    $("lede").textContent = T.fail;
  });
})();
