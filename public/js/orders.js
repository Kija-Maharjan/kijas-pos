// ══════════════════════════════════════
// orders.js  —  Order management
// ══════════════════════════════════════

let history = [];
let orderNum = 1000;

// ── Place order ───────────────────────
function placeOrder() {
  if (!cart.length) { alert('Please add items first!'); return; }

  const name  = document.getElementById('custName').value.trim()
              || document.getElementById('custNameM').value.trim()
              || 'Guest';
  const table = document.getElementById('tableNo').value
              || document.getElementById('tableNoM').value
              || '—';
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  // Track table occupancy
  const cartSnap = [...cart];
  if (table && table !== '—') {
    if (!tableOrders[table]) tableOrders[table] = [];
    tableOrders[table].push({ items: cartSnap, total, name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  }

  // POST to API
  fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: name, table_no: table, items: cartSnap, total }),
  })
  .then(r => r.json())
  .then(data => {
    const oid = data.id ? '#' + String(data.id).padStart(4, '0') : '#' + String(++orderNum).padStart(4, '0');
    history.unshift({ id: data.id || orderNum, customer_name: name, table_no: table, total, created_at: new Date().toISOString(), items: cartSnap });
    updateHistoryStats();
    resetSession();
    showOrderToast(oid, name, table, total);
  })
  .catch(() => {
    const oid = '#' + String(++orderNum).padStart(4, '0');
    history.unshift({ id: orderNum, customer_name: name, table_no: table, total, created_at: new Date().toISOString(), items: cartSnap });
    updateHistoryStats();
    resetSession();
    showOrderToast(oid, name, table, total);
  });
}

// ── Toast notification ────────────────
function showOrderToast(oid, name, table, total) {
  const toast = document.getElementById('orderToast');
  document.getElementById('orderToastMsg').textContent = `Order ${oid} placed! Table ${table} · Rs. ${total}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 3000);
  closeMobileCart();
  mobileTab('menu');
}

// ── History stats ─────────────────────
function updateHistoryStats() {
  const rev = history.reduce((s, o) => s + (o.total || 0), 0);
  document.getElementById('hOrders').textContent  = history.length;
  document.getElementById('hRevenue').textContent = 'Rs. ' + rev;
}

// ── Open / close history overlay ─────
function openHistory() {
  fetch(`${API_BASE}/api/orders`)
    .then(r => r.json())
    .then(rows => {
      history = rows || history;
      updateHistoryStats();
      renderOrderList(history, document.getElementById('histBody'));
      document.getElementById('histOverlay').classList.add('show');
    })
    .catch(() => {
      updateHistoryStats();
      renderOrderList(history, document.getElementById('histBody'));
      document.getElementById('histOverlay').classList.add('show');
    });
}

function closeHistory() {
  document.getElementById('histOverlay').classList.remove('show');
}

// ── Render order rows ─────────────────
function renderOrderList(orders, body) {
  if (!orders.length) {
    body.innerHTML = `<div class="no-orders">No orders placed yet today.</div>`;
    return;
  }
  body.innerHTML = orders.map((o, i) => {
    const name  = o.customer_name || 'Guest';
    const table = o.table_no || '—';
    const items = o.items || [];
    const total = o.total || 0;
    const oid   = '#' + String(o.id).padStart(4, '0');
    const time  = o.created_at
      ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';
    return `
      <div class="order-block" id="ob${i}" data-dbid="${o.id || ''}">
        <div class="order-block-head" style="grid-template-columns:28px 72px 1fr 50px 70px 55px 95px 32px;">
          <div onclick="event.stopPropagation()">
            <input type="checkbox" class="order-cb" data-dbid="${o.id || ''}" data-idx="${i}"
              onchange="onOrderCheckChange()" style="cursor:pointer;width:13px;height:13px;accent-color:var(--sage-dark)">
          </div>
          <div class="ob-id"   onclick="toggleBlock(${i})">${oid}</div>
          <div class="ob-name" onclick="toggleBlock(${i})">${name}</div>
          <div class="ob-table"onclick="toggleBlock(${i})">${table}</div>
          <div class="ob-count"onclick="toggleBlock(${i})" style="font-size:0.72rem;color:var(--muted)">${time}</div>
          <div class="ob-count"onclick="toggleBlock(${i})">${items.reduce((s, c) => s + (c.qty || 1), 0)} items</div>
          <div class="ob-total"onclick="toggleBlock(${i})">Rs. ${total}</div>
          <div onclick="event.stopPropagation();deleteSingleOrder(${o.id || 'null'},${i})"
            style="cursor:pointer;text-align:center;color:var(--red);font-size:1rem;padding:2px 4px;border-radius:6px;transition:background 0.15s;"
            onmouseover="this.style.background='#fdecea'" onmouseout="this.style.background='none'">🗑️</div>
        </div>
        <div class="order-items-detail">
          <div class="detail-section-title">Order Items — ${time}</div>
          ${items.map(c => `
            <div class="detail-row">
              <div class="de">${c.emoji || '🍽️'}</div>
              <div class="dn">${c.name}</div>
              <div class="dq">×${c.qty || 1}</div>
              <div class="du">Rs.${c.price} each</div>
              <div class="dp">Rs. ${c.price * (c.qty || 1)}</div>
            </div>`).join('')}
          <div class="detail-totals">
            <div class="dt-item">
              <div class="dt-label">Total Paid</div>
              <div class="dt-val grand">Rs. ${total}</div>
            </div>
          </div>
          <div class="detail-meta">
            <span>🕐 ${time}</span>
            <span>🪑 Table ${table}</span>
            <span>👤 ${name}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleBlock(i) {
  document.getElementById('ob' + i).classList.toggle('expanded');
}

// ── Bulk select ───────────────────────
function onOrderCheckChange() {
  const cbs     = document.querySelectorAll('.order-cb');
  const checked = document.querySelectorAll('.order-cb:checked');
  const bar     = document.getElementById('bulkDeleteBar');
  document.getElementById('bulkCount').textContent = checked.length + ' order' + (checked.length > 1 ? 's' : '') + ' selected';
  bar.style.display = checked.length > 0 ? 'flex' : 'none';
  document.getElementById('selectAllOrders').checked = checked.length === cbs.length;
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.order-cb').forEach(c => c.checked = cb.checked);
  onOrderCheckChange();
}

function clearBulkSelection() {
  document.querySelectorAll('.order-cb').forEach(c => c.checked = false);
  document.getElementById('selectAllOrders').checked = false;
  document.getElementById('bulkDeleteBar').style.display = 'none';
}

function deleteSingleOrder(dbId, idx) {
  if (!confirm('Delete this order?')) return;
  const doDelete = () => { history.splice(idx, 1); refreshHistoryPanel(); };
  if (dbId && dbId !== 'null') {
    fetch(`${API_BASE}/api/orders?id=${dbId}`, { method: 'DELETE' }).then(doDelete).catch(doDelete);
  } else {
    doDelete();
  }
}

function deleteSelectedOrders() {
  const checked = document.querySelectorAll('.order-cb:checked');
  if (!checked.length) return;
  if (!confirm(`Delete ${checked.length} selected order(s)?`)) return;
  const ids  = [...checked].map(cb => cb.getAttribute('data-dbid')).filter(Boolean);
  const idxs = [...checked].map(cb => parseInt(cb.getAttribute('data-idx'))).sort((a, b) => b - a);
  Promise.all(ids.map(id => fetch(`${API_BASE}/api/orders?id=${id}`, { method: 'DELETE' }).catch(() => {}))).finally(() => {
    idxs.forEach(i => history.splice(i, 1));
    clearBulkSelection();
    refreshHistoryPanel();
  });
}

function refreshHistoryPanel() {
  updateHistoryStats();
  renderOrderList(history, document.getElementById('histBody'));
}

// ── Clear all ─────────────────────────
function confirmClearHistory() {
  if (!confirm('⚠️ Clear ALL order history? This cannot be undone.')) return;
  fetch(`${API_BASE}/api/orders`, { method: 'DELETE' })
    .then(() => {
      history = [];
      updateHistoryStats();
      document.getElementById('histBody').innerHTML = '<div class="no-orders">No orders placed yet today.</div>';
    })
    .catch(() => alert('Error clearing history. Please try again.'));
}
