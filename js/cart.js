import {CONFIG} from './config.js';

const CATALOG = new Map(CONFIG.MERCH.map(m => [m.id, m]));
const KEY = CONFIG.ORDER.STORAGE_KEY;
const PRICE_FMT = new Intl.NumberFormat('ru-RU');

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); }
  catch { /* приватный режим — корзина в памяти */ }
}

export function initCart(onChange) {
  let items = load().filter(i => CATALOG.has(i.id));

  const api = {
    add(id) {
      const entry = items.find(i => i.id === id);
      if (entry) entry.qty++;
      else items.push({ id, qty: 1 });
      save(items); onChange && onChange(api.summary());
      return api.summary();
    },
    setQty(id, qty) {
      const entry = items.find(i => i.id === id);
      if (!entry) return api.summary();
      entry.qty = qty;
      if (entry.qty <= 0) items = items.filter(i => i.id !== id);
      save(items); onChange && onChange(api.summary());
      return api.summary();
    },
    clear() {
      items = []; save(items); onChange && onChange(api.summary());
      return api.summary();
    },
    entries() {
      return items.map(({ id, qty }) => ({ ...CATALOG.get(id), qty, sum: CATALOG.get(id).price * qty }));
    },
    summary() {
      const count = items.reduce((s, i) => s + i.qty, 0);
      const total = api.entries().reduce((s, e) => s + e.sum, 0);
      return { count, total };
    },
    price(n) { return PRICE_FMT.format(n) + ' ₽'; }
  };
  onChange && onChange(api.summary());
  return api;
}