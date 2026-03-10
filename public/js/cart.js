// ══════════════════════════════════════
// cart.js  —  Cart state & rendering
// ══════════════════════════════════════

let cart = [];
let currentCat = 'breakfast';

// ── Render menu grid ──────────────────
function renderGrid(items) {
  const g = document.getElementById('grid');
  if (!items.length) {
    g.innerHTML = `<div style="color:var(--muted);padding:2rem;opacity:0.5;font-size:0.82rem;">No items found</div>`;
    return;
  }
  g.innerHTML = items.map(item => {
    const inc = cart.find(c => c.id === item.id);
    return `<div class="item-card fade${inc ? ' in-cart' : ''}" onclick="addItem(${item.id})">
      <span class="item-emoji">${item.emoji}</span>
      <div class="item-name">${item.name}</div>
      ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
      <div class="item-price">Rs. ${item.price}${inc ? `<span class="u"> · ×${inc.qty}</span>` : ''}</div>
      <button class="plus-btn">+</button>
    </div>`;
  }).join('');
}

function switchCat(btn, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = cat;
  document.getElementById('menuHeading').textContent = MENU[cat].label;
  document.getElementById('menuSearch').value = '';
  renderGrid(MENU[cat].items);
}

function switchCatMobile(btn, cat) {
  document.querySelectorAll('.mcat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + cat + "'"));
  });
  currentCat = cat;
  document.getElementById('menuHeading').textContent = MENU[cat].label;
  document.getElementById('menuSearch').value = '';
  renderGrid(MENU[cat].items);
}

function doSearch(q) {
  if (!q) { renderGrid(MENU[currentCat].items); return; }
  renderGrid(getAllItems().filter(i => i.name.toLowerCase().includes(q.toLowerCase())));
}

// ── Cart operations ───────────────────
function addItem(id) {
  const item = getAllItems().find(i => i.id === id);
  const ex = cart.find(c => c.id === id);
  if (ex) ex.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  renderGrid(MENU[currentCat].items);
}

function changeQty(id, d) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx < 0) return;
  cart[idx].qty += d;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
  renderGrid(MENU[currentCat].items);
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
  renderGrid(MENU[currentCat].items);
}

function clearCart() {
  cart = [];
  renderCart();
  renderGrid(MENU[currentCat].items);
}

// ── Render 50% live order view ────────
function renderOrderView() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const stats = document.getElementById('ovStats');
  const body  = document.getElementById('ovBody');
  const totalRow = document.getElementById('ovTotalRow');
  const ovTotal  = document.getElementById('ovTotal');

  if (!cart.length) {
    stats.textContent = '—';
    body.innerHTML = '<div class="ov-empty">Cart is empty</div>';
    totalRow.style.display = 'none';
    return;
  }

  stats.textContent = count + ' item' + (count !== 1 ? 's' : '');
  body.innerHTML = cart.map(c => `
    <div class="ov-item">
      <div class="ov-emoji">${c.emoji}</div>
      <div class="ov-name">${c.name}</div>
      <div class="ov-qty">${c.qty}</div>
      <div class="ov-price">Rs. ${c.price * c.qty}</div>
    </div>`).join('');
  totalRow.style.display = 'flex';
  ovTotal.textContent = 'Rs. ' + total;
}

// ── Render cart panel ─────────────────
function renderCart() {
  const sub   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  document.getElementById('cartPill').textContent = count + ' item' + (count !== 1 ? 's' : '');

  if (!cart.length) {
    document.getElementById('cartList').innerHTML = `<div class="empty-cart">
      <div class="big">🛒</div><div>Cart is empty</div>
      <div style="font-size:0.7rem;margin-top:2px">Tap any item to add</div>
    </div>`;
    document.getElementById('tTotal').textContent = 'Rs. 0';
    syncMobileCart();
    renderOrderView();
    return;
  }

  document.getElementById('cartList').innerHTML = cart.map(c => `
    <div class="cart-row">
      <div class="cr-info">
        <div class="cr-name">${c.emoji} ${c.name}</div>
        <div class="cr-unit">Rs. ${c.price} × ${c.qty}</div>
      </div>
      <div class="qty-box">
        <button class="qb" onclick="changeQty(${c.id},-1)">−</button>
        <div class="qn">${c.qty}</div>
        <button class="qb" onclick="changeQty(${c.id},1)">+</button>
      </div>
      <div class="cr-price">Rs. ${c.price * c.qty}</div>
      <button class="cr-del" onclick="removeItem(${c.id})">✕</button>
    </div>`).join('');

  document.getElementById('tTotal').textContent = 'Rs. ' + sub;
  syncMobileCart();
  renderOrderView();
}

// ── Mobile cart sync ──────────────────
function syncMobileCart() {
  const sub   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('mobileCartBadge');
  badge.textContent   = count;
  badge.style.display = count > 0 ? 'block' : 'none';
  document.getElementById('mTTotal').textContent = 'Rs. ' + sub;

  if (!cart.length) {
    document.getElementById('mobileCartList').innerHTML = `<div class="empty-cart">
      <div class="big">🛒</div><div>Cart is empty</div>
    </div>`;
    return;
  }
  document.getElementById('mobileCartList').innerHTML = cart.map(c => `
    <div class="cart-row">
      <div class="cr-info">
        <div class="cr-name">${c.emoji} ${c.name}</div>
        <div class="cr-unit">Rs. ${c.price} × ${c.qty}</div>
      </div>
      <div class="qty-box">
        <button class="qb" onclick="changeQty(${c.id},-1)">−</button>
        <div class="qn">${c.qty}</div>
        <button class="qb" onclick="changeQty(${c.id},1)">+</button>
      </div>
      <div class="cr-price">Rs. ${c.price * c.qty}</div>
      <button class="cr-del" onclick="removeItem(${c.id})">✕</button>
    </div>`).join('');
}

function syncInputs(master, mirror) {
  document.getElementById(master).value = document.getElementById(mirror).value;
}

function resetSession() {
  clearCart();
  ['custName', 'tableNo', 'custNameM', 'tableNoM'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
