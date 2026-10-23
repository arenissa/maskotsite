export function initReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(el => { el.classList.add('is-visible'); el.classList.remove('reveal'); });
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      el.classList.add('is-visible');
      io.unobserve(el);
      const delay = (parseFloat(getComputedStyle(el).transitionDelay) || 0) * 1000;
      setTimeout(() => { el.classList.remove('reveal'); el.style.transitionDelay = ''; }, delay + 900);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el, i) => { el.style.transitionDelay = `${Math.min((i % 6) * 80, 400)}ms`; io.observe(el); });
}