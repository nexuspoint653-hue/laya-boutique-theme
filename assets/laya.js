/* Laya Boutique — theme behaviours */
(function(){
"use strict";
var CAN_HOVER = matchMedia("(hover:hover) and (pointer:fine)").matches;
var REDUCED   = matchMedia("(prefers-reduced-motion:reduce)").matches;
var SLOW=0.22, FULL=1.0, RAMP_UP=1500, RAMP_DOWN=700, FADE_OUT=750;

/* ---------- hover video: slow ramp up, fade + slow down on leave ---------- */
function wireCard(cardEl){
  if(cardEl.dataset.wired) return; cardEl.dataset.wired="1";
  if(!CAN_HOVER || REDUCED) return;
  var v = cardEl.querySelector("video"); if(!v) return;
  v.muted=true; v.loop=true; v.playsInline=true; v.removeAttribute("controls");
  var raf=null, leaveT=null, loaded=false;
  function ramp(from,to,dur){
    cancelAnimationFrame(raf); var t0=performance.now();
    (function step(now){
      var t=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-t,3);
      try{ v.playbackRate=from+(to-from)*e; }catch(err){}
      if(t<1) raf=requestAnimationFrame(step);
    })(t0);
  }
  cardEl.addEventListener("pointerenter",function(){
    clearTimeout(leaveT);
    if(!loaded){ v.load(); loaded=true; }
    try{ v.currentTime=0; v.playbackRate=SLOW; }catch(e){}
    var p=v.play(); if(p&&p.catch) p.catch(function(){});
    cardEl.classList.add("playing"); ramp(SLOW,FULL,RAMP_UP);
  });
  cardEl.addEventListener("pointerleave",function(){
    cardEl.classList.remove("playing");
    ramp(v.playbackRate||FULL,0.3,RAMP_DOWN);
    leaveT=setTimeout(function(){
      cancelAnimationFrame(raf);
      try{ v.pause(); v.currentTime=0; v.playbackRate=SLOW; }catch(e){}
    },FADE_OUT);
  });
}
function wireAllCards(root){ (root||document).querySelectorAll(".card").forEach(wireCard); }

/* ---------- header + mega menu ---------- */
function initHeader(){
  var hdr=document.getElementById("hdr"); if(!hdr) return;
  var mega=hdr.querySelector(".mega"), scrim=document.getElementById("scrim"), closeT=null;
  var onHero = document.body.classList.contains("has-hero");
  function state(){
    if(hdr.classList.contains("menu-open")) return;
    var top = scrollY < 40;
    hdr.classList.toggle("on-hero", onHero && top);
    hdr.classList.toggle("solid", !(onHero && top));
  }
  function close(){
    if(mega) mega.classList.remove("show");
    hdr.querySelectorAll(".mega-in").forEach(function(m){m.classList.remove("show");});
    hdr.querySelectorAll(".nav-l .nav-a").forEach(function(a){a.classList.remove("open");});
    hdr.classList.remove("menu-open"); if(scrim) scrim.classList.remove("on"); state();
  }
  hdr.querySelectorAll(".nav-l .nav-a[data-menu]").forEach(function(a){
    function open(){
      clearTimeout(closeT);
      if(!mega) return;
      mega.classList.add("show");
      hdr.querySelectorAll(".mega-in").forEach(function(m){ m.classList.toggle("show", m.id===a.dataset.menu); });
      hdr.querySelectorAll(".nav-l .nav-a").forEach(function(x){ x.classList.toggle("open", x===a); });
      hdr.classList.add("menu-open"); hdr.classList.remove("on-hero");
      if(scrim) scrim.classList.add("on");
    }
    a.addEventListener("pointerenter",function(){ if(CAN_HOVER) open(); });
    a.addEventListener("focus",open);
  });
  hdr.addEventListener("pointerleave",function(){ closeT=setTimeout(close,140); });
  hdr.addEventListener("pointerenter",function(){ clearTimeout(closeT); });
  if(scrim) scrim.addEventListener("click",close);
  addEventListener("scroll",state,{passive:true});
  addEventListener("keydown",function(e){ if(e.key==="Escape"){ close(); closeDrawer(); closeSearch(); } });
  state();
}

/* ---------- drawer + search ---------- */
function closeDrawer(){ var d=document.getElementById("drawer"); if(d) d.classList.remove("on"); }
function closeSearch(){ var s=document.getElementById("search"); if(s) s.classList.remove("on"); }
function initPanels(){
  var b=document.getElementById("burger"), d=document.getElementById("drawer");
  if(b&&d) b.addEventListener("click",function(){ d.classList.add("on"); });
  var dx=document.getElementById("drawerX"); if(dx) dx.addEventListener("click",closeDrawer);
  var sb=document.getElementById("searchBtn"), s=document.getElementById("search");
  if(sb&&s) sb.addEventListener("click",function(){
    s.classList.add("on");
    setTimeout(function(){ var i=s.querySelector("input"); if(i) i.focus(); },420);
  });
  var sx=document.getElementById("searchX"); if(sx) sx.addEventListener("click",closeSearch);
  document.querySelectorAll("[data-sub]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var el=document.getElementById(btn.dataset.sub); if(!el) return;
      var open = el.style.maxHeight && el.style.maxHeight!=="0px";
      el.style.maxHeight = open ? "0px" : el.scrollHeight+"px";
      var sp=btn.querySelector("span"); if(sp) sp.textContent = open ? "+" : "–";
    });
  });
}

/* ---------- accordions ---------- */
function initAcc(root){
  (root||document).querySelectorAll(".acc").forEach(function(acc){
    if(acc.dataset.wired) return; acc.dataset.wired="1";
    var h=acc.querySelector(".acc-h"), b=acc.querySelector(".acc-b"); if(!h||!b) return;
    h.addEventListener("click",function(){
      var on=acc.classList.toggle("on");
      b.style.maxHeight = on ? b.scrollHeight+"px" : "0px";
    });
  });
}

/* ---------- rails ---------- */
function initRails(root){
  (root||document).querySelectorAll("[data-nav]").forEach(function(nav){
    if(nav.dataset.wired) return; nav.dataset.wired="1";
    var rail=document.querySelector('[data-rail="'+nav.dataset.nav+'"]'); if(!rail) return;
    nav.querySelectorAll(".rnav").forEach(function(b){
      b.addEventListener("click",function(){
        rail.scrollBy({left: rail.clientWidth*0.72*parseInt(b.dataset.dir,10), behavior:"smooth"});
      });
    });
  });
}

/* ---------- reveal ---------- */
var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(en){
  en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
},{rootMargin:"0px 0px -6% 0px",threshold:0}) : null;
function observe(root){
  if(!io) return;
  (root||document).querySelectorAll("[data-rv]:not(.in), .stag:not(.in)").forEach(function(el){ io.observe(el); });
}

/* ---------- announcement rotator ---------- */
function initAnno(){
  var items=document.querySelectorAll("#anno .anno-item"); if(items.length<2) return;
  var i=0;
  setInterval(function(){
    items[i].classList.remove("on"); items[i].classList.add("off");
    var prev=i; i=(i+1)%items.length;
    items[i].classList.remove("off"); items[i].classList.add("on");
    setTimeout(function(){ items[prev].classList.remove("off"); },700);
  },4600);
}

/* ---------- product page ---------- */
function initProduct(root){
  (root||document).querySelectorAll("[data-variant-picker]").forEach(function(form){
    if(form.dataset.wired) return; form.dataset.wired="1";
    form.querySelectorAll(".opt-row").forEach(function(row){
      row.addEventListener("click",function(e){
        var b=e.target.closest(".opt"); if(!b||b.disabled) return;
        row.querySelectorAll(".opt").forEach(function(x){x.classList.remove("on");});
        b.classList.add("on"); sync(form);
      });
    });
    sync(form);
  });
  function sync(form){
    var chosen=[];
    form.querySelectorAll(".opt-row").forEach(function(row){
      var on=row.querySelector(".opt.on"); chosen.push(on?on.dataset.value:null);
    });
    var data=form.querySelector("[data-variants]");
    if(!data) return;
    var variants=JSON.parse(data.textContent), match=null;
    for(var i=0;i<variants.length;i++){
      var v=variants[i], ok=true;
      for(var j=0;j<chosen.length;j++){ if(chosen[j]!==null && v.options[j]!==chosen[j]) ok=false; }
      if(ok){ match=v; break; }
    }
    var idEl=form.querySelector('input[name="id"]'),
        btn=form.querySelector("[data-add]"),
        price=document.querySelector("[data-price]"),
        label=document.querySelector("[data-colour-label]");
    if(match){
      if(idEl) idEl.value=match.id;
      if(price && match.price_formatted) price.innerHTML=match.price_formatted;
      if(btn){ btn.disabled=!match.available; btn.textContent=match.available?"Add to Bag":"Sold Out"; }
    } else if(btn){ btn.disabled=true; btn.textContent="Unavailable"; }
    if(label && chosen[0]) label.textContent=chosen[0];
  }
}


/* ---------- shop the look ---------- */
function initLooks(root){
  (root||document).querySelectorAll("[data-look-section]").forEach(function(sec){
    if(sec.dataset.wired) return; sec.dataset.wired="1";
    var panels=sec.querySelectorAll("[data-look-panel]");
    if(panels.length<2) return;
    var label=sec.querySelector("[data-look-label]"), i=0;
    function pad(n){ return n<10 ? "0"+n : ""+n; }
    function show(n){
      i=(n+panels.length)%panels.length;
      panels.forEach(function(p,idx){ p.classList.toggle("is-hidden", idx!==i); });
      if(label) label.textContent="Look "+pad(i+1)+" / "+pad(panels.length);
      wireAllCards(panels[i]);
    }
    var prev=sec.querySelector("[data-look-prev]"), next=sec.querySelector("[data-look-next]");
    if(prev) prev.addEventListener("click",function(){ show(i-1); });
    if(next) next.addEventListener("click",function(){ show(i+1); });
    show(0);
  });
}

function boot(root){ wireAllCards(root); initAcc(root); initRails(root); initProduct(root); initLooks(root); observe(root); }
document.addEventListener("DOMContentLoaded",function(){
  initHeader(); initPanels(); initAnno(); boot(document);
});
/* re-init when the theme editor re-renders a section */
document.addEventListener("shopify:section:load",function(e){ boot(e.target); initHeader(); initPanels(); });
})();

/* ============================ COOKIE NOTICE + WELCOME OFFER ============================ */
(function(){
  var fresh = location.search.indexOf("fresh") > -1 ||
             (typeof Shopify !== "undefined" && Shopify.designMode);
  var store = {
    get:function(k){ try{ return fresh ? null : localStorage.getItem(k); }catch(e){ return null; } },
    set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  };

  var host = document.querySelector("[data-popups]");
  var COOKIE_MS = host ? (parseFloat(host.dataset.cookieDelay) || 0) * 1000 : 2000;
  var OFFER_MS  = host ? (parseFloat(host.dataset.offerDelay)  || 15) * 1000 : 15000;

  var note = document.getElementById("layaCookie");
  var offer = document.getElementById("layaOffer");
  var noteHidden = false;          /* held back while the offer is open */

  /* ---- cookie notice ---- */
  function showNote(){
    if(!note) return;
    note.hidden = false;
    requestAnimationFrame(function(){ note.classList.add("on"); });
  }
  function closeNote(accepted){
    if(!note) return;
    note.classList.remove("on");
    store.set("laya-cookie", accepted ? "accepted" : "dismissed");
    setTimeout(function(){ note.hidden = true; }, 800);
  }
  if(note && !store.get("laya-cookie")){
    setTimeout(showNote, COOKIE_MS);
    var ok = document.getElementById("cnoteOk");
    var cx = document.getElementById("cnoteX");
    if(ok) ok.addEventListener("click", function(){ closeNote(true); });
    if(cx) cx.addEventListener("click", function(){ closeNote(false); });
  }

  /* ---- welcome offer ---- */
  function openOffer(){
    if(!offer) return;
    /* step the cookie notice out of the way rather than stacking the two */
    if(note && !note.hidden){ note.classList.remove("on"); noteHidden = true; }
    offer.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ offer.classList.add("on"); });
    var f = offer.querySelector("input[type=email]");
    if(f) setTimeout(function(){ try{ f.focus({preventScroll:true}); }catch(e){} }, 700);
  }
  function closeOffer(){
    if(!offer) return;
    offer.classList.remove("on");
    document.body.style.overflow = "";
    store.set("laya-offer", "seen");
    setTimeout(function(){
      offer.hidden = true;
      if(noteHidden && note && !note.hidden){ note.classList.add("on"); noteHidden = false; }
    }, 700);
  }
  if(offer && !store.get("laya-offer")){
    setTimeout(openOffer, OFFER_MS);
    var ox = document.getElementById("offerX");
    var on = document.getElementById("offerNo");
    var of = document.getElementById("offerForm");
    if(ox) ox.addEventListener("click", closeOffer);
    if(on) on.addEventListener("click", closeOffer);
    offer.addEventListener("click", function(e){ if(e.target === offer) closeOffer(); });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && offer && !offer.hidden) closeOffer();
    });
    if(of) of.addEventListener("submit", function(e){
      e.preventDefault();
      var msg = document.getElementById("offerOk");
      if(msg) msg.hidden = false;
      store.set("laya-offer", "joined");
      setTimeout(closeOffer, 1800);
    });
  }
})();

