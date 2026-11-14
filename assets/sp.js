// Sourced Prep site script (first-party). Powers: the home "Try one question" card, the "Which test is mine?" checker,
// and the scored free Texas and California checks. Progress is kept only in this browser (localStorage); nothing is sent anywhere.
// Every feature degrades to plain links and lists when this script does not run.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("sp:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("sp:" + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem("sp:" + k); } catch (e) {} }
  };
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (a) { if (a === "class") e.className = attrs[a]; else e.setAttribute(a, attrs[a]); });
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function data(id) { var n = document.getElementById(id); try { return n ? JSON.parse(n.textContent) : null; } catch (e) { return null; } }
  var L = "ABCD";
  function forgetAll() { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("sp:") === 0) localStorage.removeItem(k); }); } catch (e) {} }
  // larger text, one tap, remembered (shared with the citizenship practice: sp:large)
  if (store.get("large", false)) document.documentElement.classList.add("sp-large");
  $$(".sp-big").forEach(function (b) {
    b.setAttribute("aria-pressed", document.documentElement.classList.contains("sp-large") ? "true" : "false");
    b.addEventListener("click", function () { var on = document.documentElement.classList.toggle("sp-large"); if (on) store.set("large", 1); else store.del("large"); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  });
  $$(".sp-forget").forEach(function (b) { if (b.id === "dx-forget") return; var lab = b.textContent; b.addEventListener("click", function () { forgetAll(); b.textContent = lab + " \u2713"; }); });

  // ---------- one question, revealed in place (home hero and article checks) ----------
  function renderQuestion(box, q, after) {
    box.textContent = "";
    var head = el("p", { "class": "tq-q" }, q.q);
    box.appendChild(head);
    if (q.options) {
      var ol = el("ol", { "class": "tq-opts" });
      q.options.forEach(function (o, i) {
        var li = el("li"); var b = el("button", { type: "button", "class": "tq-opt" });
        b.appendChild(el("b", null, L[i])); b.appendChild(document.createTextNode(" " + o));
        b.addEventListener("click", function () { reveal(i); });
        li.appendChild(b); ol.appendChild(li);
      });
      box.appendChild(ol);
    } else {
      var sb = el("button", { type: "button", "class": "btn" }, q.show || "Show the answer");
      sb.addEventListener("click", function () { reveal(null); });
      box.appendChild(sb);
    }
    function reveal(pick) {
      $$(".tq-opt", box).forEach(function (b, i) {
        b.disabled = true;
        if (i === q.answer) b.classList.add("ok");
        else if (i === pick) b.classList.add("miss");
      });
      var a = el("div", { "class": "tq-ans", tabindex: "-1" });
      if (q.options) {
        a.appendChild(el("p", { "class": "tq-right" }, (pick === q.answer ? (q.yes || "Right. ") : (q.no || "Not quite. ")) + L[q.answer] + ". " + q.options[q.answer]));
      } else {
        var ul = el("ul"); q.answers.forEach(function (x) { ul.appendChild(el("li", null, x)); }); a.appendChild(ul);
      }
      if (q.explain) a.appendChild(el("p", null, q.explain));
      if (q.trap) a.appendChild(el("p", { "class": "tq-why" }, "Watch out: " + q.trap));
      a.appendChild(el("p", { "class": "cite" }, q.source));
      var sbtn = $("button.btn", box); if (sbtn) sbtn.remove();
      box.appendChild(a); a.focus();
      if (after) after(pick === q.answer, a, pick);
    }
  }

  // ---------- home: "Try one question from your exam" ----------
  var tq = $("#tryq");
  if (tq) {
    var bank = data("tryq-data");
    var picks = $$(".tq-pick", tq), slot = $("#tq-slot", tq), next = $("#tq-next", tq);
    var idx = {};
    function show(exam) {
      picks.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-exam") === exam ? "true" : "false"); });
      tq.classList.add("asked");
      var list = bank[exam]; idx[exam] = ((idx[exam] === undefined ? -1 : idx[exam]) + 1) % list.questions.length;
      renderQuestion(slot, list.questions[idx[exam]], function () {
        next.textContent = ""; next.hidden = false;
        var go = el("a", { "class": "btn", href: list.start }, list.startLabel); next.appendChild(go);
        var nb = el("button", { type: "button", "class": "btn alt" }, list.nextLabel || "Next question");
        nb.addEventListener("click", function () { show(exam); }); next.appendChild(nb);
        if (list.extra) { var x = el("p", { "class": "small" }); var xa = el("a", { href: list.extra[0] }, list.extra[1]); x.appendChild(xa); next.appendChild(x); }
      });
      next.hidden = true;
      if (tq.getBoundingClientRect().top < 0 || tq.getBoundingClientRect().top > 120) tq.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    picks.forEach(function (p) {
      p.addEventListener("click", function (e) { e.preventDefault(); show(p.getAttribute("data-exam")); });
    });
  }

  // ---------- "Which test is mine?" ----------
  var ck = $("#checker");
  if (ck) {
    var T = data("checker-text");
    var ans = {};
    var steps = $$(".ck-step", ck), res = $("#ck-result", ck);
    function go(n) { steps.forEach(function (s, i) { s.hidden = i !== n; }); res.hidden = true; var h = steps[n] && $("h2", steps[n]); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); } }
    $$("button[data-q]", ck).forEach(function (b) {
      b.addEventListener("click", function () {
        ans[b.getAttribute("data-q")] = b.getAttribute("data-v");
        if (b.getAttribute("data-q") === "filed") go(1);
        else if (b.getAttribute("data-q") === "age") { if (ans.age === "u50") result(); else go(2); }
        else result();
      });
    });
    function result() {
      steps.forEach(function (s) { s.hidden = true; });
      var test = ans.filed === "before" ? "2008" : "2025";
      var yrs = ans.years || "0";
      var g = "standard";
      if (ans.age === "65" && yrs === "20") g = "6520";
      else if ((ans.age === "50" || ans.age === "55" || ans.age === "65") && yrs === "20") g = "5020";
      else if ((ans.age === "55" || ans.age === "65") && (yrs === "15" || yrs === "20")) g = "5515";
      var r = T.results[test + "_" + g];
      res.textContent = "";
      res.appendChild(el("h2", { tabindex: "-1" }, r.title));
      r.lines.forEach(function (ln) { var p = el("p"); p.appendChild(document.createTextNode(ln[0] + " ")); p.appendChild(el("span", { "class": "small" }, ln[1])); res.appendChild(p); });
      var act = el("p"); act.appendChild(el("a", { "class": "btn", href: r.go[0] }, r.go[1]));
      res.appendChild(act);
      res.appendChild(el("p", { "class": "small" }, T.fine));
      var again = el("button", { type: "button", "class": "btn alt" }, T.again); again.addEventListener("click", function () { ans = {}; go(0); });
      res.appendChild(again);
      res.hidden = false; $("h2", res).focus();
    }
    go(0);
  }

  // ---------- scored free check (Texas, California) ----------
  var dx = $("#diag");
  if (dx) {
    var D = data("diag-data"), key = "diag:" + D.id;
    var st = store.get(key, null) || { i: 0, picks: [], where: null };
    var stage = $("#dx-stage", dx), prog = $("#dx-prog"), bar = $("#dx-bar span");
    function save() { store.set(key, st); }
    function setProg() {
      var n = st.picks.length, set = Math.min(4, Math.floor(n / 5) + 1);
      prog.textContent = n >= D.items.length ? D.t.doneProg : D.t.setLabel.replace("{s}", set).replace("{q}", (n % 5) + 1);
      bar.style.width = Math.round(100 * n / D.items.length) + "%";
    }
    function askWhere() {
      stage.textContent = "";
      stage.appendChild(el("h2", { tabindex: "-1" }, D.t.whereQ));
      D.t.where.forEach(function (w) {
        var b = el("button", { type: "button", "class": "btn alt wide" }, w[1]);
        b.addEventListener("click", function () { st.where = w[0]; save(); step(); });
        stage.appendChild(b);
      });
      $("h2", stage).focus();
    }
    function step() {
      setProg();
      if (!st.where) return askWhere();
      var n = st.picks.length;
      if (n >= D.items.length) return result();
      if (n > 0 && n % 5 === 0 && !st.paused) {
        st.paused = true; save();
        stage.textContent = "";
        stage.appendChild(el("h2", { tabindex: "-1" }, D.t.setDone.replace("{s}", n / 5)));
        var k = el("button", { type: "button", "class": "btn" }, D.t.keepGoing); k.addEventListener("click", function () { step(); });
        var r = el("button", { type: "button", "class": "btn alt" }, D.t.soFar); r.addEventListener("click", function () { result(); });
        stage.appendChild(k); stage.appendChild(r); $("h2", stage).focus();
        return;
      }
      st.paused = false;
      document.body.classList.add("dx-going");
      var q = D.items[n];
      stage.textContent = "";
      var box = el("div", { "class": "tq-box" }); stage.appendChild(box);
      renderQuestion(box, q, function (ok, ansEl, pick) {
        st.picks.push({ id: q.id, ok: ok, a: pick }); save(); setProg();
        var nb = el("button", { type: "button", "class": "btn" }, D.t.next); nb.addEventListener("click", step);
        box.appendChild(nb); nb.focus();
      });
      if (n > 0 || st.where) { var top = $("#dx-bar"); if (top && top.getBoundingClientRect().top < 0 || (top && top.getBoundingClientRect().top > 160)) top.scrollIntoView({ block: "start" }); }
    }
    function result() {
      stage.textContent = "";
      var byPart = {};
      D.parts.forEach(function (p) { byPart[p.id] = { n: 0, ok: 0, name: p.name, guides: p.guides }; });
      var tot = 0;
      st.picks.forEach(function (pk) {
        var it = D.items.filter(function (x) { return x.id === pk.id; })[0]; if (!it) return;
        var b = byPart[it.part]; b.n++; if (pk.ok) { b.ok++; tot++; }
      });
      stage.appendChild(el("h2", { tabindex: "-1" }, D.t.result.replace("{k}", tot).replace("{n}", st.picks.length)));
      var lastRec = store.get("diaglast:" + D.id, null), shownLast = st.saved ? (lastRec && lastRec.prev) : lastRec;
      if (st.picks.length >= D.items.length && shownLast && D.t.lastT) stage.appendChild(el("p", { "class": "small" }, D.t.lastT.replace("{k}", shownLast.k).replace("{n}", shownLast.n).replace("{d}", shownLast.d)));
      var ul = el("ul", { "class": "dx-parts" }), low = null;
      D.parts.forEach(function (p) {
        var b = byPart[p.id], li = el("li");
        li.appendChild(el("b", null, b.name + ": "));
        if (b.n < 4) li.appendChild(document.createTextNode(b.n ? b.ok + " of " + b.n + " (" + D.t.tooFew + ")" : D.t.tooFew));
        else {
          li.appendChild(document.createTextNode(b.ok + " of " + b.n));
          var r = b.ok / b.n; if (low === null || r < low.r) low = { r: r, p: b };
        }
        ul.appendChild(li);
      });
      stage.appendChild(ul);
      var lows = [], scorable = D.parts.filter(function (p) { return byPart[p.id].n >= 4; }).length;
      if (low) D.parts.forEach(function (p) { var b = byPart[p.id]; if (b.n >= 4 && b.ok / b.n === low.r) lows.push(b); });
      if (st.picks.length < D.items.length) stage.appendChild(el("p", null, D.t.partial));
      else if (low && low.r === 1) stage.appendChild(el("p", null, D.t.perfect));
      else if (low && lows.length === scorable && scorable > 1) stage.appendChild(el("p", null, D.t.even));
      else if (low) {
        var line = lows.length > 1 ? D.t.tie.replace("{a}", lows[0].name).replace("{b}", lows[1].name) + ((D.t.tieAdd || {})[st.where] || "")
          : D.t.lines[st.where || "course"].replace("{part}", lows[0].name);
        stage.appendChild(el("p", null, line));
        var g = el("ul"), seenG = {};
        lows.forEach(function (b) { b.guides.forEach(function (x) { if (seenG[x[0]]) return; seenG[x[0]] = 1; var li = el("li"); li.appendChild(el("a", { href: x[0] }, x[1])); g.appendChild(li); }); });
        if (g.children.length) { stage.appendChild(el("h3", null, D.t.guidesH)); stage.appendChild(g); }
      }
      // the questions missed, with the right answer and its source
      var done = st.picks.length >= D.items.length;
      var miss = st.picks.filter(function (pk) { return !pk.ok; });
      var mbox = el("details", { "class": "dx-missbox" }); mbox.appendChild(el("summary", { "class": "btn alt" }, D.t.missH + " (" + miss.length + ")"));
      stage.appendChild(mbox); var stage0 = stage; stage = mbox;
      if (!miss.length) stage.appendChild(el("p", null, D.t.missNone));
      else {
        var ml = el("ol", { "class": "dx-miss" });
        miss.forEach(function (pk) {
          var it = D.items.filter(function (x) { return x.id === pk.id; })[0]; if (!it) return;
          var li = el("li"); li.appendChild(el("b", null, it.q));
          if (typeof pk.a === "number") li.appendChild(el("span", { "class": "small" }, D.t.yourA + " " + L[pk.a] + ". " + it.options[pk.a]));
          li.appendChild(el("span", { "class": "small dx-right" }, D.t.rightA + " " + L[it.answer] + ". " + it.options[it.answer]));
          li.appendChild(el("span", { "class": "small" }, it.explain)); if (it.trap) li.appendChild(el("span", { "class": "small tq-why" }, (D.t.watch || "Watch out:") + " " + it.trap));
          li.appendChild(el("span", { "class": "small cite" }, it.source)); ml.appendChild(li);
        });
        stage.appendChild(ml);
      }
      stage = stage0;
      {
      }
      // last finished result, kept on this device
      if (done && !st.saved) { var rec0 = store.get("diaglast:" + D.id, null); store.set("diaglast:" + D.id, { k: tot, n: st.picks.length, d: new Date().toLocaleDateString(), prev: rec0 ? { k: rec0.k, n: rec0.n, d: rec0.d } : null }); st.saved = true; save(); }
      // plan with an optional exam date, downloadable as a calendar file built in the browser
      var plan = el("div", { "class": "card" });
      plan.appendChild(el("h3", null, D.t.planH));
      var lab = el("label", null, D.t.dateLabel + " "); var inp = el("input", { type: "date" }); var saved = store.get("examdate:" + D.id, ""); if (saved) inp.value = saved;
      lab.appendChild(inp); plan.appendChild(lab);
      var ol = el("ol"); D.t.plan.forEach(function (s) { ol.appendChild(el("li", null, s)); }); plan.appendChild(ol);
      var ics = el("button", { type: "button", "class": "btn alt" }, D.t.ics);
      ics.addEventListener("click", function () {
        var d = inp.value; store.set("examdate:" + D.id, d);
        var now = new Date(); var ev = [];
        function p2(n) { return (n < 10 ? "0" : "") + n; }
        function ymd(dt) { return dt.getFullYear() + p2(dt.getMonth() + 1) + p2(dt.getDate()); }
        function add(days, title) { var dt = new Date(now.getTime() + days * 86400000); ev.push([ymd(dt), title]); }
        add(1, D.t.ev[0]); add(3, D.t.ev[1]); add(7, D.t.ev[2]);
        if (d) ev.push([d.replace(/-/g, ""), D.t.ev[3]]);
        var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sourced Prep//study plan//EN"];
        ev.forEach(function (e, i) { lines.push("BEGIN:VEVENT", "UID:sp-" + D.id + "-" + i + "-" + e[0] + "@sourcedprep.com", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", "DTSTART;VALUE=DATE:" + e[0], "SUMMARY:" + e[1], "END:VEVENT"); });
        lines.push("END:VCALENDAR");
        var a = el("a", { href: "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n")), download: "sourced-prep-plan.ics" }); document.body.appendChild(a); a.click(); a.remove();
      });
      plan.appendChild(ics); stage.appendChild(plan);
      stage.appendChild(el("p", { "class": "small" }, D.t.fine));
      if (D.t.offer) { var o = el("p", { "class": "pickl" }); o.appendChild(el("a", { href: D.t.offer[0] }, D.t.offer[1])); o.appendChild(document.createTextNode(" " + D.t.offer[2])); stage.appendChild(o); }
      var again = el("button", { type: "button", "class": "btn alt" }, D.t.again);
      again.addEventListener("click", function () { st = { i: 0, picks: [], where: null }; save(); step(); });
      stage.appendChild(again);
      $("h2", stage).focus();
    }
    var fg = $("#dx-forget"); if (fg) fg.addEventListener("click", function () { forgetAll(); st = { i: 0, picks: [], where: null }; step(); });
    if (!store.set("probe", 1)) { var w = el("p", { "class": "small" }, D.t.noStore); dx.insertBefore(w, dx.firstChild); }
    dx.hidden = false; var fb = $("#dx-fallback"); if (fb) fb.hidden = true;
    step();
  }
})();
