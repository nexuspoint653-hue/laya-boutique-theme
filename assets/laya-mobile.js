/* Laya mobile helpers: product gallery dots + counter. */
(function(){
  function initGallery(root){
    (root||document).querySelectorAll('.pdp-stage').forEach(function(st){
      if(st.dataset.dots) return; st.dataset.dots='1';
      var shots=st.querySelectorAll('.pdp-shot'); if(shots.length<2) return;
      var dots=document.createElement('div'); dots.className='pdp-dots'; dots.setAttribute('aria-hidden','true');
      shots.forEach(function(_,i){var d=document.createElement('i'); if(!i) d.className='on'; dots.appendChild(d);});
      st.insertAdjacentElement('afterend',dots);
      var t; st.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){
        var i=Math.round(st.scrollLeft/st.clientWidth);
        dots.querySelectorAll('i').forEach(function(d,k){d.classList.toggle('on',k===i)});
      },60);},{passive:true});
    });
  }
  if(document.readyState!=='loading') initGallery(); else document.addEventListener('DOMContentLoaded',function(){initGallery()});
  document.addEventListener('shopify:section:load',function(e){initGallery(e.target)});
})();
