import {initCart} from './cart.js';
import {setAddToCartHandler} from './carousel.js';

export function initOrder() {
  const $ = id => document.getElementById(id);
  const countEl = $('cartCount'), totalEl = $('cartTotal'), orderOpen = $('orderOpen');
  const modal = $('orderModal'), closeBtn = $('orderClose'), formPane = $('orderFormPane'), successPane = $('orderSuccessPane');
  const form = $('orderForm'), errorEl = $('orderError'), itemsEl = $('orderItems');

  let cart;
  const btnMap = new Map();
  function updateButtons() {
    for (const [id, btn] of btnMap) {
      if (!btn.isConnected) { btnMap.delete(id); continue; }
      const e = cart.entries().find(x => x.id === id);
      if (e) { btn.textContent = `В корзине: ${e.qty}`; btn.classList.add('added'); }
      else { btn.textContent = 'В корзину'; btn.classList.remove('added'); }
    }
  }
  function render(summary) {
    if (!cart) return;
    countEl.textContent = String(summary.count);
    totalEl.textContent = `на ${cart.price(summary.total)}`;
    orderOpen.disabled = summary.count === 0;
    updateButtons();
  }
  cart = initCart(render);
  setAddToCartHandler((id, btn) => {
    if (btn) btnMap.set(id, btn);
    cart.add(id);
  });

  function renderItems() {
    itemsEl.innerHTML = '';
    for (const e of cart.entries()) {
      const li = document.createElement('li');
      li.className = 'order-item';
      li.innerHTML = `<span class="oi-title">${e.title}</span>
        <span class="oi-qty"><button type="button" class="oi-btn" data-act="dec" data-id="${e.id}" aria-label="Убрать одну ${e.title}">−</button>
        <b>${e.qty}</b>
        <button type="button" class="oi-btn" data-act="inc" data-id="${e.id}" aria-label="Добавить одну ${e.title}">+</button></span>
        <span class="oi-sum">${cart.price(e.sum)}</span>`;
      itemsEl.append(li);
    }
    const total = cart.summary().total;
    const li = document.createElement('li');
    li.className = 'order-total-row';
    li.innerHTML = `<span>Итого</span><b>${cart.price(total)}</b>`;
    itemsEl.append(li);
  }

  itemsEl.addEventListener('click', ev => {
    const btn = ev.target.closest('.oi-btn');
    if (!btn) return;
    const entry = cart.entries().find(e => e.id === btn.dataset.id);
    if (!entry) return;
    cart.setQty(btn.dataset.id, btn.dataset.act === 'inc' ? entry.qty + 1 : entry.qty - 1);
    renderItems();
    if (cart.summary().count === 0) closeModal();
  });

  function openModal() {
    renderItems();
    formPane.hidden = false; successPane.hidden = true; errorEl.hidden = true;
    modal.hidden = false;
    modal.setAttribute('aria-open', 'true');
    document.body.style.overflow = 'hidden';
    $('orderName').focus();
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-open', 'false');
    document.body.style.overflow = '';
  }

  orderOpen.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  $('orderDone').addEventListener('click', () => { cart.clear(); closeModal(); });
  modal.addEventListener('click', ev => { if (ev.target === modal) closeModal(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !modal.hidden) closeModal(); });

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    if (name.length < 2 || !/^[0-9+()\- ]{7,}$/.test(phone)) { errorEl.hidden = false; return; }
    // Учебный проект: заказ сохраняется локально, сервер не требуется.
    try {
      const orders = JSON.parse(localStorage.getItem('red-square-orders') || '[]');
      orders.push({ name, phone, items: cart.entries(), date: new Date().toISOString() });
      localStorage.setItem('red-square-orders', JSON.stringify(orders));
    } catch { /* нет доступа к localStorage — просто показываем подтверждение */ }
    formPane.hidden = true; successPane.hidden = false;
    $('orderDone').focus();
  });

  render(cart.summary());
}