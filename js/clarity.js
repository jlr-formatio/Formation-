/* Microsoft Clarity + bandeau de consentement FR/EN — JL digital store
   SEUL RÉGLAGE : CLARITY_ID = l'ID du projet (Clarity > Settings > Overview > Project ID).
   ID vide ou invalide = rien ne se charge, aucun bandeau. */
(function () {
  var CLARITY_ID = "zjkr9e39mg";  // projet Clarity « JL digital store »
  var KEY = "jl-consent";       // choix du visiteur : "yes" ou "no", redemandé après 6 mois
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182;

  if (!/^[a-z0-9]{6,14}$/i.test(CLARITY_ID)) return;
  var w = window, d = document;

  /* 1) Script officiel Clarity */
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(w, d, "clarity", "script", CLARITY_ID);

  /* 2) Consentement : refusé par défaut (mesure sans cookie) tant que le visiteur n'a pas accepté.
        La publicité Microsoft reste toujours refusée : les données ne servent qu'à améliorer le site. */
  function getChoice() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (o && (o.v === "yes" || o.v === "no") && Date.now() - o.t < MAX_AGE) return o.v;
    } catch (e) {}
    return null;
  }
  function saveChoice(v) { try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }
  function sendConsent(v) {
    w.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: v === "yes" ? "granted" : "denied" });
  }
  var choice = getChoice();
  sendConsent(choice || "no");

  /* 3) Étiquettes pour filtrer les sessions dans Clarity */
  var html = d.documentElement;
  w.clarity("set", "langue", html.getAttribute("data-l") || "fr");
  w.clarity("set", "page", location.pathname.indexOf("/ressources") === 0 ? "ressources" : "vente");
  try {
    var src = new URLSearchParams(location.search).get("utm_source");
    if (src) w.clarity("set", "source", src.slice(0, 40));
  } catch (e) {}

  /* 4) Événements clés : clic "Acheter" et clic "Ressource gratuite" (session gardée en priorité) */
  d.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-buy],[data-free],[data-lang],[data-ck],[data-ck-open]") : null;
    if (!t) return;
    if (t.hasAttribute("data-buy")) { w.clarity("event", "clic_acheter"); w.clarity("upgrade", "clic_acheter"); }
    else if (t.hasAttribute("data-free")) { w.clarity("event", "clic_ressource_gratuite"); w.clarity("upgrade", "clic_ressource_gratuite"); }
    else if (t.hasAttribute("data-lang")) { w.clarity("set", "langue", t.getAttribute("data-lang")); }
    else if (t.hasAttribute("data-ck")) { var v = t.getAttribute("data-ck"); saveChoice(v); sendConsent(v); closeBanner(); }
    else if (t.hasAttribute("data-ck-open")) { e.preventDefault(); openBanner(); }
  }, true);

  /* 5) Bandeau (FR/EN suit la langue de la page) */
  var css = "#jl-ck{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:50;max-width:560px;margin:0 auto;background:#fff;color:#1B2438;border:2px solid #14213D;border-radius:14px;padding:14px 16px;box-shadow:0 8px 30px rgba(20,33,61,.25);font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    "#jl-ck.above-cta{bottom:calc(84px + env(safe-area-inset-bottom,0px))}" +
    "#jl-ck p{margin:0 0 12px}#jl-ck .b{display:flex;gap:10px}" +
    "#jl-ck button{flex:1;font:inherit;font-weight:800;border-radius:10px;padding:11px 12px;cursor:pointer;border:2px solid #14213D}" +
    "#jl-ck [data-ck=no]{background:#fff;color:#14213D}#jl-ck [data-ck=yes]{background:#14213D;color:#F5F0E1}" +
    ".jl-ck-link{background:none;border:0;padding:0;color:inherit;text-decoration:underline;font:inherit;cursor:pointer}";
  var banner = null;
  function openBanner() {
    if (banner) return;
    if (!d.getElementById("jl-ck-css")) { var s = d.createElement("style"); s.id = "jl-ck-css"; s.textContent = css; d.head.appendChild(s); }
    banner = d.createElement("div");
    banner.id = "jl-ck"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Cookies");
    if (d.querySelector(".cta")) banner.className = "above-cta";
    banner.innerHTML =
      '<p><span class="fr">Pour améliorer ce site, nous mesurons les visites (clics, défilement, enregistrement de navigation anonymisé) avec Microsoft Clarity. Pas de publicité, pas de revente. Vous pouvez changer d\'avis via « Cookies » en bas de page.</span>' +
      '<span class="en">To improve this site, we measure visits (clicks, scrolling, anonymised browsing recording) with Microsoft Clarity. No advertising, no resale. You can change your mind via “Cookies” at the bottom of the page.</span></p>' +
      '<div class="b"><button type="button" data-ck="no"><span class="fr">Refuser</span><span class="en">Decline</span></button>' +
      '<button type="button" data-ck="yes"><span class="fr">Accepter</span><span class="en">Accept</span></button></div>';
    d.body.appendChild(banner);
  }
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }

  function addFooterLink() {
    var f = d.querySelector("footer");
    if (!f || f.querySelector("[data-ck-open]")) return;
    var p = d.createElement("p");
    p.innerHTML = '<button type="button" class="jl-ck-link" data-ck-open>Cookies</button>';
    f.appendChild(p);
  }

  function init() { addFooterLink(); if (!choice) openBanner(); else if (!d.getElementById("jl-ck-css")) { var s = d.createElement("style"); s.id = "jl-ck-css"; s.textContent = css; d.head.appendChild(s); } }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
