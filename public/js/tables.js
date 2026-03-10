// ══════════════════════════════════════
// tables.js  —  Floor map & table mgmt
// ══════════════════════════════════════

const TABLES_DEF = [
  { id:'1',  label:'Table 1',       seats:6,  type:'regular' },
  { id:'2',  label:'Table 2',       seats:6,  type:'regular' },
  { id:'3',  label:'Table 3',       seats:4,  type:'regular' },
  { id:'4',  label:'Table 4',       seats:4,  type:'regular' },
  { id:'5',  label:'Table 5',       seats:4,  type:'regular' },
  { id:'6',  label:'Table 6',       seats:4,  type:'regular' },
  { id:'7',  label:'Table 7',       seats:4,  type:'regular' },
  { id:'8',  label:'Table 8',       seats:2,  type:'regular' },
  { id:'9',  label:'Table 9',       seats:2,  type:'regular' },
  { id:'10', label:'Table 10',      seats:2,  type:'regular' },
  { id:'11', label:'Table 11',      seats:2,  type:'regular' },
  { id:'12', label:'The Long Table',seats:10, type:'large'   },
];

// tableOrders[tableId] = [ { items, total, name, time }, ... ]
let tableOrders = {};

// ── Open / close ──────────────────────
function openTables() {
  renderFloorMap();
  document.getElementById('tablesOverlay').classList.add('show');
}

function closeTables() {
  document.getElementById('tablesOverlay').classList.remove('show');
}

function closeTableDetail() {
  document.getElementById('tableDetailOverlay').classList.remove('show');
}

// ── Floor map render ──────────────────
function renderFloorMap() {
  document.getElementById('floorMap').innerHTML = TABLES_DEF.map(t => {
    const orders   = tableOrders[t.id] || [];
    const occupied = orders.length > 0;
    const isLarge  = t.type === 'large';
    const total    = orders.reduce((s, o) => s + (o.total || 0), 0);
    const preview  = occupied
      ? orders[0].items.slice(0, 2).map(c => `${c.emoji || ''} ${c.name}`).join(', ')
        + (orders[0].items.length > 2 ? '…' : '')
      : '';

    return `<div class="floor-table${occupied ? ' occupied' : ''}${isLarge ? ' long-table' : ''}" onclick="openTableDetail('${t.id}')">
      <div class="ft-top">
        <div>
          <div class="ft-name">${isLarge ? '🪑 ' : '🍽️ '}${t.label}</div>
          <div class="ft-seats">up to ${t.seats} seats</div>
        </div>
        <span class="ft-badge ${occupied ? 'occ' : 'avail'}">${occupied ? 'Occupied' : 'Available'}</span>
      </div>
      ${occupied
        ? `<div class="ft-preview">${preview}</div>
           <div class="ft-total">Rs. ${total} · ${orders.length} order${orders.length > 1 ? 's' : ''}</div>`
        : `<div class="ft-empty">🌿</div>`
      }
    </div>`;
  }).join('');
}

// ── Table detail panel ────────────────
function openTableDetail(tableId) {
  const t      = TABLES_DEF.find(x => x.id === tableId);
  const orders = tableOrders[tableId] || [];

  document.getElementById('tableDetailTitle').textContent = `🍽️ ${t.label}`;

  const body = document.getElementById('tableDetailBody');
  if (!orders.length) {
    body.innerHTML = `<div style="text-align:center;padding:2.5rem;color:var(--muted);opacity:0.5;">
      <div style="font-size:2rem;margin-bottom:8px;">🌿</div>
      <div>Table is available</div>
    </div>`;
  } else {
    const totalAll = orders.reduce((s, o) => s + (o.total || 0), 0);
    body.innerHTML = `
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);font-weight:600;margin-bottom:12px;">
        ${orders.length} order${orders.length > 1 ? 's' : ''} · Total Rs. ${totalAll}
      </div>
      ${orders.map(o => `
        <div class="td-order-card">
          <div class="td-order-meta">
            <span>👤 ${o.name || 'Guest'}</span>
            <span>🕐 ${o.time || ''}</span>
          </div>
          ${o.items.map(c => `
            <div class="td-item-row">
              <span>${c.emoji || '🍽️'}</span>
              <span style="flex:1">${c.name}</span>
              <span style="color:var(--muted)">×${c.qty || 1}</span>
              <span style="color:var(--sage-dark);font-weight:600">Rs.${c.price * (c.qty || 1)}</span>
            </div>`).join('')}
          <div class="td-total">Rs. ${o.total}</div>
        </div>`).join('')}
      <button class="td-clear-btn" onclick="clearTable('${tableId}')">✓ Mark Table as Unoccupied</button>`;
  }
  document.getElementById('tableDetailOverlay').classList.add('show');
}

function clearTable(tableId) {
  if (!confirm('Mark this table as unoccupied?')) return;
  delete tableOrders[tableId];
  closeTableDetail();
  renderFloorMap();
}
