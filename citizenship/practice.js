// Sourced Prep citizenship practice interview. Reads questions.json (2025) or questions-2008.json (2008): the public USCIS lists only.
// With ?lang=es it also reads es128.json (Sourced Prep's own Spanish study help for the 2025 list) or es2008.json (USCIS's Spanish translation of the 2008 list).
// Scoring follows the 2025 civics test as USCIS describes it: up to 20 questions, pass at 12 correct, stop at 12 correct or 9 wrong.
// 2008 test (filed before 20 October 2025): 10 questions from 100, pass at 6, stop at 6 correct or 5 wrong (USCIS Policy Manual vol 12 part E ch 2).
// 65/20 list (either test): 10 of the 20 starred questions, pass at 6. "All" mode goes through the whole list in order.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var mode = params.get("list") === "6520" ? "6520" : (params.get("mode") === "all" ? "all" : "standard");
  var v2008 = params.get("test") === "2008";
  var es = params.get("lang") === "es";
  var total = v2008 ? 100 : 128;
  var T = es ? {
    test: v2008 ? "examen de 2008" : "examen de 2025",
    t_std: "Entrevista de práctica: " + (v2008 ? "examen de 2008" : "examen de 2025"),
    t_6520: "Práctica 65/20, " + (v2008 ? "examen de 2008" : "examen de 2025") + " (10 preguntas)",
    t_all: "Las " + total + " preguntas, " + (v2008 ? "examen de 2008" : "examen de 2025"),
    lede_std: v2008 ? "Para solicitudes presentadas antes del 20 de octubre de 2025. El oficial le hace hasta 10 de las 100 preguntas en inglés; usted necesita 6 correctas. Diga su respuesta en voz alta, muestre las respuestas y califíquese con honestidad. El español es solo una ayuda para entender."
                    : "El oficial le hace hasta 20 preguntas en inglés. Diga su respuesta en voz alta, muestre las respuestas y califíquese con honestidad. El español es solo una ayuda para entender.",
    lede_6520: "El oficial le hace 10 de las 20 preguntas marcadas 65/20 y usted necesita al menos 6 correctas. Puede tomar este examen en el idioma de su elección con un intérprete.",
    lede_all: "Las " + total + " preguntas en el orden de USCIS. Diga su respuesta, muestre las respuestas y califíquese.",
    q: "Pregunta", of: "de", right: "correctas", wrong: "incorrectas",
    show: "Mostrar las respuestas", ok: "La respondí bien", bad: "La respondí mal", hear: "Escuchar la pregunta",
    ans: "Respuestas de la lista de USCIS:",
    done: "Terminado: ", rightOf: " correctas de ",
    reviewAll: "Repase las preguntas que marcó como incorrectas y luego haga una entrevista de práctica.",
    passed: "Aprobó esta práctica: ", notyet: "Todavía no: ",
    stopOfficer: "El oficial se detendría aquí: ", stopDecided: "La práctica termina aquí porque el resultado ya está decidido: ",
    reached: function (n) { return "llegó a " + n + " respuestas correctas. "; },
    cannot: function (w, n) { return w + " respuestas incorrectas significan que ya no puede llegar a " + n + ". "; },
    only: "Esto es solo práctica; el examen real es oral y lo decide el oficial.",
    none: "Ninguna marcada como incorrecta.", again: "Practicar otra vez", back: "Volver a la lista",
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
    lede_all: "All " + total + " questions in USCIS order. Say your answer, show the answers, mark yourself.",
    q: "Question", of: "of", right: "right", wrong: "wrong",
    show: "Show the answers", ok: "I got it right", bad: "I got it wrong", hear: "Hear the question",
    ans: "Answers on the USCIS list:",
    done: "Done: ", rightOf: " right of ",
    reviewAll: "Review the questions you marked wrong, then try a practice interview.",
    passed: "Passed this practice: ", notyet: "Not yet: ",
    stopOfficer: "The officer would stop here: ", stopDecided: "The practice stops here because the result is decided: ",
    reached: function (n) { return "you reached " + n + " correct answers. "; },
    cannot: function (w, n) { return w + " wrong answers means you cannot reach " + n + ". "; },
    only: "This is practice only; the real test is spoken, and the officer decides.",
    none: "None marked wrong.", again: "Practice again", back: "Back to the question list",
    fail: "The questions could not be loaded. The full list is on the question list page.",
    review: "Questions to review",
    listed: function (d) { return "As listed by USCIS, read on " + d + ": "; },
    own: "This answer depends on where you live. Say your own answer, then check it at: "
  };
  var rules = {
    standard: v2008 ? { ask: 10, pass: 6, failAt: 5, title: T.t_std } : { ask: 20, pass: 12, failAt: 9, title: T.t_std },
    "6520": { ask: 10, pass: 6, failAt: 5, title: T.t_6520 },
    all: { ask: total, pass: null, failAt: null, title: T.t_all }
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
    var i = 0, right = 0, wrong = 0, missed = [], started = false;
    document.documentElement.lang = es ? "es" : "en";
    document.querySelector("h1").textContent = rules.title;
    $("lede").textContent = mode === "6520" ? T.lede_6520 : mode === "all" ? T.lede_all : T.lede_std;
    $("show").textContent = T.show; $("right").textContent = T.ok; $("wrong").textContent = T.bad; $("speak").textContent = T.hear;
    $("answers").querySelector("p.small").textContent = T.ans;
    var again = $("result").querySelector("a.btn:not(.alt)"); if (again) again.textContent = T.again;
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
      if (src2) src2.appendChild(document.createTextNode(" Spanish: Sourced Prep's own translation, for study help only."));
    }
    $("app").hidden = false;

    function addSpan(el, text) {
      if (!text) return;
      var s = document.createElement("span"); s.className = "es"; s.style.display = "block"; s.lang = "es"; s.textContent = text; el.appendChild(s);
    }
    function show() {
      var q = order[i], s = ES[q.n];
      var tally = mode === "all" ? "" : " | " + T.right + " " + right + ", " + T.wrong + " " + wrong;
      $("progress").textContent = T.q + " " + (i + 1) + " " + T.of + " " + order.length + tally;
      var qt = $("qtext"); qt.textContent = q.n + ". " + q.q;
      if (s) addSpan(qt, s.q_es);
      var ul = $("alist"); ul.textContent = "";
      q.answers.forEach(function (a, k) {
        var li = document.createElement("li"); li.textContent = a;
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
      if (started) $("show").focus();
      started = true;
    }

    function finish(reason) {
      $("app").querySelector(".card").classList.add("hidden");
      $("result").classList.remove("hidden");
      var asked = right + wrong;
      if (mode === "all") {
        $("rtitle").textContent = T.done + right + T.rightOf + asked;
        $("rtext").textContent = T.reviewAll;
      } else {
        var passed = right >= rules.pass;
        $("rtitle").textContent = (passed ? T.passed : T.notyet) + right + T.rightOf + asked;
        var stopWord = mode === "standard" ? T.stopOfficer : T.stopDecided;
        $("rtext").textContent = (reason === "pass" ? stopWord + T.reached(rules.pass)
          : reason === "fail" ? stopWord + T.cannot(rules.failAt, rules.pass) : "") + T.only;
      }
      var ol = $("rlist"); ol.textContent = "";
      if (!missed.length) { var li = document.createElement("li"); li.textContent = T.none; ol.appendChild(li); }
      missed.forEach(function (q) {
        var li = document.createElement("li"); var a = document.createElement("a");
        a.href = listUrl + "#q" + q.n; a.textContent = q.n + ". " + q.q; li.appendChild(a); ol.appendChild(li);
      });
      $("rtitle").setAttribute("tabindex", "-1"); $("rtitle").focus();
    }

    function next(ok) {
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
