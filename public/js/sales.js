// ══════════════════════════════════════
// sales.js  —  Sales dashboard & print
// ══════════════════════════════════════

let _lastCheckedDate = new Date().toDateString();

function openSales() {
  switchSalesTab('today');
  document.getElementById('salesOverlay').classList.add('show');
  checkMidnightRollover();
}

function closeSales() {
  document.getElementById('salesOverlay').classList.remove('show');
}

function switchSalesTab(tab) {
  document.querySelectorAll('.sales-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('stab-' + tab).classList.add('active');
  document.getElementById('sales-today-panel').style.display   = tab === 'today'   ? '' : 'none';
  document.getElementById('sales-history-panel').style.display = tab === 'history' ? '' : 'none';
  if (tab === 'today')   renderTodaySales();
  if (tab === 'history') renderPastDays();
}

// ── Analyse orders array ──────────────
function analyzeOrders(orders) {
  const totalRev  = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrder  = orders.length ? Math.round(totalRev / orders.length) : 0;

  const itemMap = {};
  orders.forEach(o => (o.items || []).forEach(it => {
    if (!itemMap[it.name]) itemMap[it.name] = { qty: 0, rev: 0 };
    itemMap[it.name].qty += (it.qty || 1);
    itemMap[it.name].rev += it.price * (it.qty || 1);
  }));
  const topItems = Object.entries(itemMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);

  const catMap = {};
  orders.forEach(o => (o.items || []).forEach(it => {
    const cat = it.category || 'Other';
    if (!catMap[cat]) catMap[cat] = { rev: 0, qty: 0 };
    catMap[cat].rev += it.price * (it.qty || 1);
    catMap[cat].qty += (it.qty || 1);
  }));

  const tableMap = {};
  orders.forEach(o => {
    const tbl = o.table_no || o.table || '—';
    if (!tableMap[tbl]) tableMap[tbl] = { rev: 0, orders: 0 };
    tableMap[tbl].rev += (o.total || 0);
    tableMap[tbl].orders++;
  });

  return { totalRev, avgOrder, topItems, catMap, tableMap, count: orders.length };
}

// ── Today panel ───────────────────────
function renderTodaySales() {
  fetch(`${API_BASE}/api/orders`)
    .then(r => r.json())
    .then(orders => {
      const d = analyzeOrders(orders);
      window._todayAnalysis = { orders, ...d };

      // KPI cards
      document.getElementById('salesStats').innerHTML = [
        { icon: '💰', label: "Today's Revenue", value: 'Rs. ' + d.totalRev },
        { icon: '📋', label: 'Orders Placed',   value: d.count },
        { icon: '📈', label: 'Avg Order',        value: 'Rs. ' + d.avgOrder },
        { icon: '⭐', label: 'Top Item',          value: d.topItems[0] ? d.topItems[0][0] : '—' },
      ].map(s => `<div class="stat-card">
        <div class="stat-icon">${s.icon}</div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
      </div>`).join('');

      // Category breakdown
      const cats = Object.entries(d.catMap).sort((a, b) => b[1].rev - a[1].rev);
      document.getElementById('salesCatBreakdown').innerHTML = cats.length
        ? cats.map(([cat, v]) => `<div class="cat-card">
            <div class="cat-card-name">${cat}</div>
            <div class="cat-card-val">Rs. ${v.rev}</div>
            <div class="cat-card-sub">${v.qty} items sold</div>
          </div>`).join('')
        : '<div class="no-data" style="padding:1rem">No data yet</div>';

      // Top items
      const maxQty = d.topItems[0] ? d.topItems[0][1].qty : 1;
      document.getElementById('salesTopItems').innerHTML = d.topItems.length
        ? d.topItems.map(([name, v], i) => `<div class="top-item-row">
            <div class="ti-rank">${i + 1}</div>
            <div class="ti-name">${name}</div>
            <div class="ti-bar-wrap"><div class="ti-bar" style="width:${Math.round(v.qty / maxQty * 100)}%"></div></div>
            <div class="ti-qty">×${v.qty}</div>
            <div class="ti-rev">Rs. ${v.rev}</div>
          </div>`).join('')
        : '<div class="no-data" style="padding:1rem">No data yet</div>';

      // Table breakdown
      const tables = Object.entries(d.tableMap).sort((a, b) => b[1].rev - a[1].rev);
      document.getElementById('salesTableBreakdown').innerHTML = tables.length
        ? tables.map(([tbl, v]) => `<div class="tbl-breakdown-row">
            <span style="flex:1;font-weight:600">Table ${tbl}</span>
            <span style="color:var(--muted);font-size:0.75rem">${v.orders} order${v.orders > 1 ? 's' : ''}</span>
            <span style="font-weight:700;color:var(--sage-dark);min-width:80px;text-align:right">Rs. ${v.rev}</span>
          </div>`).join('')
        : '<div class="no-data" style="padding:1rem">No table data yet</div>';
    })
    .catch(() => {
      document.getElementById('salesStats').innerHTML = '<div class="no-data">Could not load data</div>';
    });
}

// ── Past days panel ───────────────────
function renderPastDays() {
  fetch(`${API_BASE}/api/daily`)
    .then(r => r.json())
    .then(days => {
      if (!days.length) {
        document.getElementById('salesHistoryList').innerHTML = '<div class="no-data" style="padding:3rem">No past day records yet.<br><small>Data saves automatically at midnight.</small></div>';
        return;
      }
      document.getElementById('salesHistoryList').innerHTML = days.map(day => {
        const cats    = day.category_totals
          ? Object.entries(day.category_totals).sort((a, b) => b[1].rev - a[1].rev).slice(0, 3).map(([c, v]) => `${c}: Rs.${v.rev}`).join(' · ')
          : '';
        const dateStr = new Date(day.date + 'T00:00:00').toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return `<div class="day-summary-card" onclick="printDailyReport(${JSON.stringify(day).replace(/"/g, '&quot;')}, '${dateStr}')">
          <div class="day-card-head">
            <div class="day-card-date">📅 ${dateStr}</div>
            <div class="day-card-rev">Rs. ${day.total_revenue}</div>
          </div>
          <div class="day-card-meta">
            <span>📋 ${day.total_orders} orders</span>
            ${day.top_items && day.top_items[0] ? `<span>⭐ ${day.top_items[0][0]}</span>` : ''}
            ${cats ? `<span>${cats}</span>` : ''}
          </div>
        </div>`;
      }).join('');
    })
    .catch(() => {
      document.getElementById('salesHistoryList').innerHTML = '<div class="no-data">Could not load history</div>';
    });
}

// ── Midnight rollover ─────────────────
function checkMidnightRollover() {
  const todayStr = new Date().toDateString();
  if (todayStr === _lastCheckedDate) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  saveDailySummary(yesterday);
  _lastCheckedDate = todayStr;
}

function saveDailySummary(dateStr) {
  fetch(`${API_BASE}/api/orders`)
    .then(r => r.json())
    .then(orders => {
      if (!orders.length) return;
      const d = analyzeOrders(orders);
      fetch(`${API_BASE}/api/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          total_revenue: d.totalRev,
          total_orders:  d.count,
          top_items:     d.topItems,
          category_totals: d.catMap,
          table_totals:  d.tableMap,
        }),
      }).then(() => {
        fetch(`${API_BASE}/api/orders`, { method: 'DELETE' });
        history.length = 0;
      });
    });
}

setInterval(checkMidnightRollover, 60000);

// ── Print report ──────────────────────
function printDailyReport(day, dateStr) {
  const isToday = !day;
  const data    = isToday ? window._todayAnalysis : null;
  const todayFmt = new Date().toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const revenue    = isToday ? (data?.totalRev || 0)   : (day?.total_revenue || 0);
  const orderCount = isToday ? (data?.count || 0)       : (day?.total_orders || 0);
  const avgOrder   = orderCount ? Math.round(revenue / orderCount) : 0;
  const topItems   = isToday ? (data?.topItems || [])   : (day?.top_items || []);
  const catMap     = isToday ? (data?.catMap || {})     : (day?.category_totals || {});
  const tableMap   = isToday ? (data?.tableMap || {})   : (day?.table_totals || {});

  const catRows   = Object.entries(catMap).sort((a, b) => b[1].rev - a[1].rev)
    .map(([cat, v]) => `<tr><td>${cat}</td><td>${v.qty} items</td><td style="text-align:right;font-weight:bold">Rs. ${v.rev}</td></tr>`).join('');
  const topRows   = topItems.slice(0, 10)
    .map(([name, v], i) => `<tr><td>${i + 1}</td><td>${name}</td><td>${v.qty}</td><td style="text-align:right;font-weight:bold">Rs. ${v.rev}</td></tr>`).join('');
  const tblRows   = Object.entries(tableMap).sort((a, b) => b[1].rev - a[1].rev)
    .map(([tbl, v]) => `<tr><td>Table ${tbl}</td><td>${v.orders} order${v.orders > 1 ? 's' : ''}</td><td style="text-align:right;font-weight:bold">Rs. ${v.rev}</td></tr>`).join('');

  document.getElementById('printReport').innerHTML = `
    <div class="print-section">
      <div class="print-title">☕ Nepal Food Factory — Sales Report</div>
      <div class="print-subtitle">${isToday ? todayFmt : dateStr} · Printed: ${new Date().toLocaleString()}</div>
      <table class="print-table"><tr><th>Total Revenue</th><th>Orders</th><th>Avg Order</th></tr>
        <tr><td><strong>Rs. ${revenue}</strong></td><td>${orderCount}</td><td>Rs. ${avgOrder}</td></tr></table>
    </div>
    <div class="print-section">
      <div class="print-h2">📂 Category Breakdown</div>
      <table class="print-table"><thead><tr><th>Category</th><th>Items Sold</th><th>Revenue</th></tr></thead>
        <tbody>${catRows || '<tr><td colspan="3">No data</td></tr>'}</tbody></table>
    </div>
    <div class="print-section">
      <div class="print-h2">⭐ Top Selling Items</div>
      <table class="print-table"><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead>
        <tbody>${topRows || '<tr><td colspan="4">No data</td></tr>'}</tbody></table>
    </div>
    <div class="print-section">
      <div class="print-h2">🪑 Table Breakdown</div>
      <table class="print-table"><thead><tr><th>Table</th><th>Orders</th><th>Revenue</th></tr></thead>
        <tbody>${tblRows || '<tr><td colspan="3">No data</td></tr>'}</tbody></table>
    </div>`;
  window.print();
}
