// shared: reveal-on-scroll
(function(){
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .08 }) : null;
  document.querySelectorAll('.rv').forEach(function(el){ io ? io.observe(el) : el.classList.add('in'); });
})();
// close mobile nav on link tap or outside click
(function(){
  var links = document.querySelector('.nav-links');
  if (!links) return;
  links.addEventListener('click', function(e){ if (e.target.closest('a')) links.classList.remove('open'); });
  document.addEventListener('click', function(e){ if (links.classList.contains('open') && !e.target.closest('.nav')) links.classList.remove('open'); });
})();
