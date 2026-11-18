(function () {
  "use strict";

  var EVENT = new Date("2026-12-10T20:00:00+02:00");
  var EVENT_END = new Date("2026-12-10T23:59:00+02:00");
  var TITLE = "Mohamed & Engy's Wedding";
  var PLACE = "Rotana High Class, Tanta - Mit Ghamr Road, Tanta, Egypt";
  var MAPS = "https://maps.app.goo.gl/eje6Pfkq78yAWoio6";

  var $ = function (id) { return document.getElementById(id); };
  var envelope = $("envelope"), seal = $("seal"), invite = $("invite");
  var song = $("song"), musicBtn = $("music");

  /* ---------- envelope ---------- */
  var opened = false;
  function openInvite() {
    if (opened) return;
    opened = true;
    playMusic();
    envelope.classList.add("open");
    setTimeout(function () {
      document.body.classList.remove("locked");
      invite.setAttribute("aria-hidden", "false");
      musicBtn.hidden = false;
      startPetals();
      revealVisible();
    }, 900);
    setTimeout(function () { envelope.remove(); }, 2300);
  }
  seal.addEventListener("click", openInvite);
  envelope.addEventListener("click", function (e) { if (e.target !== seal) openInvite(); });

  /* ---------- music ---------- */
  function playMusic() {
    song.volume = 0.6;
    var p = song.play();
    if (p && p.then) {
      p.then(function () { musicBtn.classList.add("playing"); musicBtn.setAttribute("aria-label", "Pause music"); })
       .catch(function () { musicBtn.classList.remove("playing"); });
    }
  }
  musicBtn.addEventListener("click", function () {
    if (song.paused) { playMusic(); }
    else { song.pause(); musicBtn.classList.remove("playing"); musicBtn.setAttribute("aria-label", "Play music"); }
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function revealVisible() {
    if (!("IntersectionObserver" in window)) { reveals.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (el.closest(".hero") ? i * 0.12 : 0) + "s";
      io.observe(el);
    });
  }

  /* ---------- petals ---------- */
  function startPetals() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = $("petals"), cols = ["#F1C6C1,#D98F8F", "#F6DAD3,#E7B1AB", "#E9A7A7,#B8646A", "#F8E8DE,#E5C3B5"];
    for (var i = 0; i < 14; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      var s = 8 + Math.random() * 10;
      p.style.left = Math.random() * 100 + "%";
      p.style.width = s + "px";
      p.style.height = s * 0.85 + "px";
      p.style.background = "linear-gradient(135deg," + cols[i % 4] + ")";
      p.style.animationDuration = 9 + Math.random() * 9 + "s";
      p.style.animationDelay = -Math.random() * 16 + "s";
      box.appendChild(p);
    }
  }

  /* ---------- countdown + clock ---------- */
  var dEl = $("d"), hEl = $("h"), mEl = $("m"), sEl = $("s"), togo = $("togo");
  var hh = $("hh"), mm = $("mm"), ss = $("ss");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var now = new Date();
    var diff = Math.max(0, EVENT - now);
    var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    dEl.textContent = pad(d); hEl.textContent = pad(h); mEl.textContent = pad(m); sEl.textContent = pad(s);
    if (diff === 0) togo.textContent = now < EVENT_END ? "Today is the day!" : "Happily ever after";
    else if (d === 0) togo.textContent = "Tonight we say “I do”";
    else togo.textContent = d === 1 ? "Just one day to go" : "until we say “I do”";

    var sec = now.getSeconds(), min = now.getMinutes() + sec / 60, hr = (now.getHours() % 12) + min / 60;
    ss.style.transform = "rotate(" + sec * 6 + "deg)";
    mm.style.transform = "rotate(" + min * 6 + "deg)";
    hh.style.transform = "rotate(" + hr * 30 + "deg)";
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- calendar ---------- */
  (function buildCal() {
    var grid = $("calGrid"), html = "";
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (w) { html += '<span class="wd">' + w + "</span>"; });
    var first = new Date(2026, 11, 1).getDay();
    for (var i = 0; i < first; i++) html += "<span></span>";
    for (var day = 1; day <= 31; day++) {
      if (day === 10) {
        html += '<span class="d mark"><svg viewBox="0 0 32 30" aria-hidden="true"><path d="M16 28S2 19.5 2 10.2C2 5.6 5.5 2 9.8 2c2.6 0 4.9 1.3 6.2 3.4C17.3 3.3 19.6 2 22.2 2 26.5 2 30 5.6 30 10.2 30 19.5 16 28 16 28z" fill="#B8505D"/></svg><em>10</em></span>';
      } else {
        html += '<span class="d">' + day + "</span>";
      }
    }
    grid.innerHTML = html;
  })();

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------- add to calendar ---------- */
  function utc(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  $("calBtn").addEventListener("click", function () {
    var isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
    if (isApple) {
      var ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ME Wedding//EN", "BEGIN:VEVENT",
        "UID:mohamed-engy-20261210@invite", "DTSTAMP:" + utc(new Date()),
        "DTSTART:" + utc(EVENT), "DTEND:" + utc(EVENT_END),
        "SUMMARY:" + TITLE, "LOCATION:" + PLACE, "DESCRIPTION:Map: " + MAPS,
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:" + TITLE + " tomorrow", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      var a = document.createElement("a");
      a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
      a.download = "Mohamed-Engy-Wedding.ics";
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(TITLE) +
        "&dates=" + utc(EVENT) + "/" + utc(EVENT_END) +
        "&location=" + encodeURIComponent(PLACE) +
        "&details=" + encodeURIComponent("Map: " + MAPS);
      window.open(url, "_blank", "noopener");
    }
  });

  /* ---------- share ---------- */
  $("shareBtn").addEventListener("click", function () {
    var data = { title: "Mohamed & Engy", text: "You're invited to the wedding of Mohamed & Engy 💍 — 10.12.2026", url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var done = function () { toast("Link copied"); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () { prompt("Copy this link:", location.href); });
    else prompt("Copy this link:", location.href);
  });
})();
