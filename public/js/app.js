// ══════════════════════════════════════
// app.js  —  Bootstrap, sound, mobile nav
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

// ── Notification Sound (Web Audio API) ─
function playOrderSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Three rising chime tones
    [[880, 0, 0.4], [1100, 0.2, 0.7], [1320, 0.45, 1.1]].forEach(([freq, start, stop]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + stop);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + stop);
    });
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

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
  renderGrid(MENU.momo.items);
  document.getElementById('menuHeading').textContent = MENU.momo.label;
});
