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
  /* Provenance : utm_source > ref= (transmis par l'ancienne adresse GitHub) > site précédent */
  try {
    var qs = new URLSearchParams(location.search);
    var src = qs.get("utm_source") || qs.get("ref") || "";
    if (!src && d.referrer) { var rh = new URL(d.referrer).hostname; if (rh && rh !== location.hostname) src = rh; }
    if (src) {
      if (/facebook|fb\.com|fb\.me/i.test(src)) src = "facebook";
      else if (/instagram/i.test(src)) src = "instagram";
      else if (/pinterest|pin\.it/i.test(src)) src = "pinterest";
      w.clarity("set", "source", src.slice(0, 40));
    }
  } catch (e) {}

  /* 4) Événements clés : clic "Acheter" et clic "Ressource gratuite" (session gardée en priorité) */
  d.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-buy],[data-free],[data-lang],[data-ck],[data-ck-open],[data-ck-more],[data-ev]") : null;
    if (!t) return;
    if (t.hasAttribute("data-buy")) { w.clarity("event", "clic_acheter"); w.clarity("upgrade", "clic_acheter"); }
    else if (t.hasAttribute("data-ev")) { w.clarity("event", t.getAttribute("data-ev")); }
    else if (t.hasAttribute("data-ck-more")) { e.preventDefault(); if (banner) banner.classList.toggle("open"); }
    else if (t.hasAttribute("data-free")) { w.clarity("event", "clic_ressource_gratuite"); w.clarity("upgrade", "clic_ressource_gratuite"); }
    else if (t.hasAttribute("data-lang")) { w.clarity("set", "langue", t.getAttribute("data-lang")); }
    else if (t.hasAttribute("data-ck")) { var v = t.getAttribute("data-ck"); saveChoice(v); sendConsent(v); closeBanner(); }
    else if (t.hasAttribute("data-ck-open")) { e.preventDefault(); openBanner(); }
  }, true);

  /* 5) Bandeau compact (FR/EN suit la langue de la page).
        Il ne s'affiche qu'après un premier défilement ou 10 secondes, pour ne jamais cacher le titre
        ni les boutons d'achat à l'arrivée. Tant que le visiteur n'a pas accepté, Clarity reste sans cookie. */
  var css = "#jl-ck{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:50;max-width:560px;margin:0 auto;background:#fff;color:#1B2438;border:1px solid #c9cfdb;border-radius:12px;padding:9px 12px;box-shadow:0 6px 22px rgba(20,33,61,.22);font:13px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;animation:jlck .25s ease-out}" +
    "@keyframes jlck{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}" +
    "#jl-ck.above-cta{bottom:calc(74px + env(safe-area-inset-bottom,0px))}" +
    "#jl-ck p{margin:0}#jl-ck .more{display:none;margin-top:6px;color:#5b6478}#jl-ck.open .more{display:block}" +
    "#jl-ck .b{display:flex;gap:8px;align-items:center;margin-top:7px}" +
    "#jl-ck .b .sp{flex:1}" +
    "#jl-ck button{font:inherit;font-weight:800;border-radius:8px;padding:6px 14px;cursor:pointer;border:1.5px solid #14213D}" +
    "#jl-ck [data-ck=no]{background:#fff;color:#14213D}#jl-ck [data-ck=yes]{background:#14213D;color:#F5F0E1}" +
    "#jl-ck [data-ck-more]{border:0;background:none;padding:6px 0;font-weight:600;text-decoration:underline;color:#5b6478}" +
    ".jl-ck-link{background:none;border:0;padding:0;color:inherit;text-decoration:underline;font:inherit;cursor:pointer}";
  var banner = null;
  function openBanner() {
    if (banner) return;
    if (!d.getElementById("jl-ck-css")) { var s = d.createElement("style"); s.id = "jl-ck-css"; s.textContent = css; d.head.appendChild(s); }
    banner = d.createElement("div");
    banner.id = "jl-ck"; banner.setAttribute("role", "region"); banner.setAttribute("aria-label", "Cookies");
    if (d.querySelector(".cta")) banner.className = "above-cta";
    banner.innerHTML =
      '<p><span class="fr">Mesure d\'audience anonyme avec Microsoft Clarity pour améliorer cette page. Pas de publicité, pas de revente.</span>' +
      '<span class="en">Anonymous visit analytics with Microsoft Clarity to improve this page. No ads, no resale.</span></p>' +
      '<p class="more"><span class="fr">Clarity enregistre les clics, le défilement et une relecture anonymisée de la visite. Vous pouvez changer d\'avis via « Cookies » en bas de page.</span>' +
      '<span class="en">Clarity records clicks, scrolling and an anonymised replay of the visit. You can change your mind via “Cookies” at the bottom of the page.</span></p>' +
      '<div class="b"><button type="button" data-ck-more><span class="fr">Détails</span><span class="en">Details</span></button><span class="sp"></span>' +
      '<button type="button" data-ck="no"><span class="fr">Refuser</span><span class="en">Decline</span></button>' +
      '<button type="button" data-ck="yes"><span class="fr">Accepter</span><span class="en">Accept</span></button></div>';
    d.body.appendChild(banner);
  }
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }
  /* Affichage différé : premier défilement (> 200 px) ou 10 s, le premier des deux */
  function openLater() {
    var done = false, timer;
    function go() { if (done) return; done = true; clearTimeout(timer); w.removeEventListener("scroll", onScroll); if (!getChoice()) openBanner(); }
    function onScroll() { if ((w.scrollY || d.documentElement.scrollTop) > 200) go(); }
    w.addEventListener("scroll", onScroll, { passive: true });
    timer = setTimeout(go, 10000);
  }

  function addFooterLink() {
    var f = d.querySelector("footer");
    if (!f || f.querySelector("[data-ck-open]")) return;
    var p = d.createElement("p");
    p.innerHTML = '<button type="button" class="jl-ck-link" data-ck-open>Cookies</button>';
    f.appendChild(p);
  }

  function init() { addFooterLink(); if (!choice) openLater(); else if (!d.getElementById("jl-ck-css")) { var s = d.createElement("style"); s.id = "jl-ck-css"; s.textContent = css; d.head.appendChild(s); } }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
