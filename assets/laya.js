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

/* ---------- motion budget ----------
   Anything animating off screen is pure cost: pause the hero pan and stop
   decoding video the moment it leaves the viewport, restart on the way back. */
var restIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function(en){
  en.forEach(function(e){
    var el = e.target;
    el.classList.toggle("rest", !e.isIntersecting);
    el.querySelectorAll("video").forEach(function(v){
      if(e.isIntersecting){ if(v.autoplay && v.paused){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); } }
      else if(!v.paused){ v.pause(); }
    });
  });
}, {rootMargin:"120px"}) : null;
function initRest(root){
  if(!restIO) return;
  (root||document).querySelectorAll(".hero-media,.media:not([data-rest]),.card-media:not([data-rest])").forEach(function(el){
    el.setAttribute("data-rest","1"); restIO.observe(el);
  });
}
function boot(root){ wireAllCards(root); initAcc(root); initRails(root); initProduct(root); initLooks(root); observe(root); initRest(root); }
document.addEventListener("DOMContentLoaded",function(){
  initHeader(); initPanels(); initAnno(); boot(document);
});
/* re-init when the theme editor re-renders a section */
document.addEventListener("shopify:section:load",function(e){ boot(e.target); initHeader(); initPanels(); });
})();

/* ============================ COOKIE NOTICE + WELCOME OFFER ============================ */
(function(){
  /* ---------------------------------------------------------------
     Popups. Every knob comes from the section's data- attributes so
     the theme editor drives behaviour without touching this file.
  --------------------------------------------------------------- */
  var host = document.querySelector("[data-popups]");
  if(!host) return;

  var design = (typeof Shopify !== "undefined" && Shopify.designMode);
  var fresh  = design || location.search.indexOf("fresh") > -1;

  var store = {
    get:function(k){ try{ return fresh ? null : localStorage.getItem(k); }catch(e){ return null; } },
    set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
    ses:function(k){ try{ return fresh ? null : sessionStorage.getItem(k); }catch(e){ return null; } },
    setSes:function(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
  };

  var d = host.dataset;
  var TRIGGER  = d.offerTrigger || "delay";
  var DELAY    = (parseFloat(d.offerDelay) || 0) * 1000;
  var SCROLL   = parseFloat(d.offerScroll) || 40;
  var FREQ     = d.offerFreq || "days";
  var DAYS     = parseFloat(d.offerDays) || 14;
  var DEVICES  = d.offerDevices || "all";
  var ESC      = d.offerEsc === "1";
  var BACKDROP = d.offerBackdrop === "1";
  var LOCK     = d.offerLock === "1";
  var OKEY     = "laya-offer-" + (d.offerKey || "v1");
  var CKEY     = "laya-cookie-" + (d.cookieKey || "v1");
  var COOKIE_MS = (parseFloat(d.cookieDelay) || 0) * 1000;

  var note  = document.getElementById("layaCookie");
  var offer = document.getElementById("layaOffer");
  var noteHeld = false;
  var armed = false;

  function narrow(){ return window.matchMedia("(max-width:760px)").matches; }
  function deviceOk(){
    if(DEVICES === "desktop") return !narrow();
    if(DEVICES === "mobile")  return narrow();
    return true;
  }

  /* ------------------------------ cookie notice ------------------------------ */
  function showNote(){
    if(!note) return;
    note.hidden = false;
    requestAnimationFrame(function(){ note.classList.add("on"); });
  }
  function closeNote(accepted){
    if(!note) return;
    note.classList.remove("on");
    store.set(CKEY, accepted ? "accepted" : "dismissed");
    setTimeout(function(){ note.hidden = true; }, 800);
  }
  if(note && !store.get(CKEY)){
    setTimeout(showNote, COOKIE_MS);
    var ok = document.getElementById("cnoteOk");
    var cx = document.getElementById("cnoteX");
    var cn = document.getElementById("cnoteNo");
    if(ok) ok.addEventListener("click", function(){ closeNote(true); });
    if(cx) cx.addEventListener("click", function(){ closeNote(false); });
    if(cn) cn.addEventListener("click", function(){ closeNote(false); });
  }

  /* ------------------------------ welcome offer ------------------------------ */
  function seen(){
    if(fresh) return false;
    if(FREQ === "always")  return false;
    if(FREQ === "session") return !!store.ses(OKEY);
    if(FREQ === "once")    return !!store.get(OKEY);
    var t = parseFloat(store.get(OKEY));            /* days */
    if(!t) return false;
    return (Date.now() - t) < DAYS * 864e5;
  }
  function remember(){
    if(FREQ === "session") store.setSes(OKEY, "1");
    else store.set(OKEY, FREQ === "once" ? "1" : String(Date.now()));
  }

  function openOffer(){
    if(!offer || !offer.hidden) return;
    if(note && !note.hidden){ note.classList.remove("on"); noteHeld = true; }
    offer.hidden = false;
    if(LOCK) document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ offer.classList.add("on"); });
    var f = offer.querySelector("input[type=email],input[type=text]");
    if(f) setTimeout(function(){ try{ f.focus({preventScroll:true}); }catch(e){} }, 500);
  }
  function closeOffer(){
    if(!offer || offer.hidden) return;
    offer.classList.remove("on");
    document.body.style.overflow = "";
    remember();
    setTimeout(function(){
      offer.hidden = true;
      if(noteHeld && note){ note.classList.add("on"); noteHeld = false; }
    }, 650);
  }

  function arm(){
    if(armed || !offer) return;
    armed = true;
    if(TRIGGER === "immediate"){ openOffer(); return; }
    if(TRIGGER === "delay"){ setTimeout(openOffer, DELAY); return; }
    if(TRIGGER === "scroll"){
      var onScroll = function(){
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h) * 100 : 100;
        if(pct >= SCROLL){ window.removeEventListener("scroll", onScroll); openOffer(); }
      };
      window.addEventListener("scroll", onScroll, {passive:true});
      onScroll();
      return;
    }
    /* exit intent — pointer leaving the top of the viewport, or a hard
       back-swipe on touch where there is no cursor to track */
    var exit = function(e){
      if(e.clientY > 0) return;
      document.removeEventListener("mouseout", exit);
      openOffer();
    };
    document.addEventListener("mouseout", exit);
    if(narrow()) setTimeout(openOffer, Math.max(DELAY, 20000));
  }

  if(offer && deviceOk() && !seen()) arm();

  if(offer){
    var ox = document.getElementById("offerX");
    var on = document.getElementById("offerNo");
    var of = document.getElementById("offerForm");
    if(ox) ox.addEventListener("click", closeOffer);
    if(on) on.addEventListener("click", closeOffer);
    if(BACKDROP) offer.addEventListener("click", function(e){ if(e.target === offer) closeOffer(); });
    if(ESC) document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && !offer.hidden) closeOffer();
    });
    if(of) of.addEventListener("submit", function(e){
      var msg = document.getElementById("offerOk");
      var code = offer.querySelector(".offer-code");
      remember();
      if(code){                                  /* hold it open so the code can be copied */
        e.preventDefault();
        if(msg) msg.hidden = false;
        return;
      }
      e.preventDefault();
      if(msg) msg.hidden = false;
      setTimeout(closeOffer, 1800);
    });
    offer.addEventListener("click", function(e){
      var b = e.target.closest ? e.target.closest(".offer-code") : null;
      if(!b) return;
      var v = b.dataset.code || "";
      var tag = b.querySelector("em");
      var revert = tag ? tag.textContent : "";
      var done = function(){ if(tag){ tag.textContent = "Copied"; setTimeout(function(){ tag.textContent = revert; }, 1600); } };
      if(navigator.clipboard) navigator.clipboard.writeText(v).then(done, done);
      else done();
    });
  }

  /* theme editor: selecting the section previews the popup */
  if(design){
    document.addEventListener("shopify:section:select", function(e){
      if(e.target.querySelector && e.target.querySelector("[data-popups]")) openOffer();
    });
    document.addEventListener("shopify:section:deselect", function(e){
      if(e.target.querySelector && e.target.querySelector("[data-popups]")) closeOffer();
    });
  }
})();

