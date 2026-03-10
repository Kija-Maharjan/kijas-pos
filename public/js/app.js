// ══════════════════════════════════════
// app.js  —  Bootstrap & mobile nav
// ══════════════════════════════════════

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : '';

// ── Clock ─────────────────────────────
function tickClock() {
  document.getElementById('clk').textContent =
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
tickClock();
setInterval(tickClock, 1000);

// ── Mobile nav ────────────────────────
function mobileTab(tab) {
  document.querySelectorAll('.mnb').forEach(b => b.classList.remove('active'));
  if (tab === 'menu') {
    document.getElementById('mnbMenu').classList.add('active');
    closeMobileCart();
  } else if (tab === 'cart') {
    document.getElementById('mnbCart').classList.add('active');
    openMobileCart();
  }
}

function openMobileCart() {
  syncMobileCart();
  document.getElementById('mobileCartSheet').classList.add('open');
}

function closeMobileCart() {
  document.getElementById('mobileCartSheet').classList.remove('open');
  document.getElementById('mnbMenu').classList.add('active');
  document.getElementById('mnbCart').classList.remove('active');
}

// ── Init ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGrid(MENU.breakfast.items);
});
