/**
 * KADEMICS — auth.js
 * KIIT login flow:
 *  - Validates @kiit.ac.in email format (no external API key needed)
 *  - Extracts roll number (mirrors C sscanf logic)
 *  - Stores session in localStorage
 *  - Works fully in demo mode (no C backend required)
 */
import { API } from './api.js';

/**
 * extractRollNumber() — mirrors C: sscanf(email, "%[^@]", out)
 * "2405123@kiit.ac.in" → "2405123"
 */
export function extractRollNumber(email) {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[0];
}

/**
 * validateKiitEmail() — only @kiit.ac.in allowed
 */
export function validateKiitEmail(email) {
  return email && email.toLowerCase().endsWith('@kiit.ac.in');
}

/**
 * navTo(page) — safe navigation regardless of server type
 */
function navTo(page) {
  const base = window.location.href.replace(/[^/]*$/, '');
  window.location.href = base + page;
}

/**
 * initLoginPage() — called on index.html
 */
export function initLoginPage() {
  // Already logged in → go straight to dashboard
  const user = getStoredUser();
  if (user) { navTo('dashboard.html'); return; }

  const loginBtn  = document.getElementById('btn-initiate-uplink');
  const emailInput= document.getElementById('login-email');
  const nameInput = document.getElementById('login-name');
  const errorEl   = document.getElementById('login-error');
  const loadingEl = document.getElementById('login-loading');

  if (!loginBtn) return;

  loginBtn.addEventListener('click', () => doLogin(emailInput, nameInput, errorEl, loadingEl, loginBtn));

  // Also allow Enter key
  [emailInput, nameInput].forEach(el => {
    el?.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin(emailInput, nameInput, errorEl, loadingEl, loginBtn);
    });
  });

  // Real-time email border validation
  emailInput?.addEventListener('input', () => {
    const v = emailInput.value.trim();
    emailInput.style.borderColor = v.length < 3 ? ''
      : validateKiitEmail(v) ? 'var(--neon-green)' : 'var(--laser-red)';
  });
}

async function doLogin(emailInput, nameInput, errorEl, loadingEl, loginBtn) {
  const email = emailInput?.value.trim() || '';
  const name  = nameInput?.value.trim()  || '';
  errorEl.textContent = '';

  if (!validateKiitEmail(email)) {
    errorEl.textContent = '[ERROR]: USE YOUR @kiit.ac.in EMAIL TO PROCEED.';
    emailInput.style.borderColor = 'var(--laser-red)';
    emailInput.focus();
    return;
  }
  if (!name) {
    errorEl.textContent = '[ERROR]: IDENTITY DESIGNATION (Name) REQUIRED.';
    nameInput.style.borderColor = 'var(--laser-red)';
    nameInput.focus();
    return;
  }

  loginBtn.disabled = true;
  if (loadingEl) loadingEl.style.display = 'flex';
  loginBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> &nbsp;ESTABLISHING UPLINK...';

  try {
    const data = await API.login(email, name);
    if (data.success) {
      localStorage.setItem('kademics_token', data.token || '');
      localStorage.setItem('kademics_user', JSON.stringify({
        roll:  data.roll  || extractRollNumber(email),
        name:  data.name  || name,
        rank:  data.rank  || 'RECRUIT',
        email: email,
        avatar: ''
      }));
      navTo('dashboard.html');
    } else {
      errorEl.textContent = data.error || '[ERROR]: UPLINK FAILED.';
    }
  } catch (err) {
    errorEl.textContent = '[ERROR]: CONNECTION DROPPED. CHECK YOUR NEXUS LINK.';
  } finally {
    loginBtn.disabled = false;
    if (loadingEl) loadingEl.style.display = 'none';
    loginBtn.innerHTML = '<i class="fa fa-bolt"></i> INITIATE UPLINK';
  }
}

/**
 * getStoredUser() — returns parsed user from localStorage or null
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('kademics_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * requireAuth() — call on every protected page; redirects to login if not authed
 */
export async function requireAuth() {
  const user = getStoredUser();
  if (!user) { navTo('index.html'); return null; }
  return user;
}

/**
 * initProfileUI(user) — populates nav profile disk + dropdown
 * FIX: Clicking avatar/disk now navigates to profile.html
 * Also shows admin badge if admin session is active
 * ESC key returns admin to admin-dashboard.html
 */
export function initProfileUI(user) {
  if (!user) return;

  const navAvatar = document.getElementById('nav-avatar');
  const dropAvatar= document.getElementById('drop-avatar');
  const nameEl    = document.getElementById('drop-name');
  const rollEl    = document.getElementById('drop-roll');
  const rankEl    = document.getElementById('drop-rank');

  if (navAvatar)  { navAvatar.src  = user.avatar || 'assets/avatar-default.png'; navAvatar.alt = user.name; }
  if (dropAvatar) { dropAvatar.src = user.avatar || 'assets/avatar-default.png'; dropAvatar.alt = user.name; }
  if (nameEl) nameEl.textContent = user.name;
  if (rollEl) rollEl.textContent = user.roll;
  if (rankEl) rankEl.textContent = `[ ${user.rank || 'RECRUIT'} ]`;

  // FIX: Profile disk click → navigate to profile.html
  const disk     = document.getElementById('profile-disk');
  const dropdown = document.getElementById('profile-dropdown');
  if (disk) {
    disk.style.cursor = 'pointer';
    disk.title = 'View your profile';
    disk.addEventListener('click', e => {
      e.stopPropagation();
      navTo('profile.html');
    });
    // Prevent dropdown link clicks from double-navigating
    dropdown?.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => dropdown?.classList.remove('open'));
  }

  // ESC key: if admin session active, go back to admin dashboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      try {
        const s = JSON.parse(sessionStorage.getItem('kademics_admin') || 'null');
        if (s?.roll) navTo('admin-dashboard.html');
      } catch {}
    }
  });

  // Show admin badge in nav if admin session active
  try {
    const s = JSON.parse(sessionStorage.getItem('kademics_admin') || 'null');
    if (s?.roll) {
      const badge = document.createElement('a');
      badge.href = 'admin-dashboard.html';
      badge.setAttribute('title', 'Admin Dashboard — Press ESC anytime to return');
      badge.style.cssText = 'font-size:0.68rem;color:rgba(255,0,60,0.85);background:rgba(255,0,60,0.08);border:1px solid rgba(255,0,60,0.3);border-radius:4px;padding:5px 11px;text-decoration:none;letter-spacing:0.14em;transition:all 0.2s;display:flex;align-items:center;gap:6px';
      badge.innerHTML = '<i class="fa fa-shield-halved"></i> ADMIN';
      badge.addEventListener('mouseenter', () => { badge.style.background='rgba(255,0,60,0.18)'; badge.style.color='#ff003c'; });
      badge.addEventListener('mouseleave', () => { badge.style.background='rgba(255,0,60,0.08)'; badge.style.color='rgba(255,0,60,0.85)'; });
      const navRight = document.querySelector('.nav-right');
      if (navRight) navRight.insertBefore(badge, navRight.firstChild);
    }
  } catch {}

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => API.logout());
}
