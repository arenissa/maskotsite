export function initLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  const img = overlay.querySelector('.lightbox-img');
  const titleEl = overlay.querySelector('.lightbox-title');
  const counter = overlay.querySelector('.lightbox-count');
  const prev = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  const closeBtn = document.getElementById('lightboxClose');
  const cards = [...document.querySelectorAll('.merch-card')];
  let index = 0;

  function show(i) {
    index = (i + cards.length) % cards.length;
    const card = cards[index];
    const photo = card.querySelector('img.merch-photo');
    const src = photo ? photo.src : card.dataset.image || '';
    const title = card.getAttribute('aria-label') || '';
    img.src = src;
    img.alt = title;
    titleEl.textContent = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
    counter.textContent = `${index + 1} / ${cards.length}`;
    overlay.hidden = false;
    overlay.setAttribute('aria-open', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }
  function hide() {
    overlay.hidden = true;
    overlay.setAttribute('aria-open', 'false');
    document.body.style.overflow = '';
    img.src = '';
  }

  for (const card of cards) {
    const visual = card.querySelector('.merch-visual');
    visual.addEventListener('click', () => show(cards.indexOf(card)));
    visual.setAttribute('role', 'button');
    visual.setAttribute('tabindex', '0');
    visual.setAttribute('aria-label', `Увеличить фото: ${card.querySelector('h3').textContent}`);
    visual.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(cards.indexOf(card)); } });
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
  closeBtn && closeBtn.addEventListener('click', hide);
  prev && prev.addEventListener('click', () => show(index - 1));
  next && next.addEventListener('click', () => show(index + 1));
  document.addEventListener('keydown', e => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}