/**
 * KADEMICS — proctor.js
 * Anti-Cheat System: Tab/Window Switch Detection
 * Mirrors the C backend's QuizSession.switch_count tracking.
 *
 * How it works:
 * - Monitors document.visibilitychange event
 * - Each time user hides the tab → sends POST to /api/gauntlet/proctor/switch
 * - C backend increments switches column in submissions table
 * - Switch count is shown in quiz results and the host's spreadsheet
 */
import { API } from './api.js';

let proctorActive   = false;
let proctorQuizId   = null;
let proctorRoll     = null;
let localSwitchCount = 0;

/**
 * startProctoring()
 * Call when the student enters the quiz room.
 * @param {number} quizId  - Active quiz ID
 * @param {string} roll    - Student roll number
 */
export function startProctoring(quizId, roll) {
  proctorActive  = true;
  proctorQuizId  = quizId;
  proctorRoll    = roll;
  localSwitchCount = 0;

  // Attach listener
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onWindowBlur);
  console.log('[PROCTOR] Monitoring active. Quiz:', quizId, '| Roll:', roll);
}

/**
 * stopProctoring()
 * Call when quiz is submitted or time expires.
 */
export function stopProctoring() {
  proctorActive = false;
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('blur', onWindowBlur);
  console.log('[PROCTOR] Monitoring stopped. Total switches:', localSwitchCount);
}

/**
 * getSwitchCount()
 * Returns the current local switch count (for display in UI).
 */
export function getSwitchCount() {
  return localSwitchCount;
}

/* ── Event Handler: Tab Hidden ──────────────────────────── */
function onVisibilityChange() {
  if (!proctorActive) return;
  if (document.hidden) {
    logSwitch('TAB_SWITCH');
  }
}

/* ── Event Handler: Window Blur ─────────────────────────── */
function onWindowBlur() {
  if (!proctorActive) return;
  logSwitch('WINDOW_BLUR');
}

/* ── Log Switch to C Backend ────────────────────────────── */
async function logSwitch(reason) {
  localSwitchCount++;
  updateSwitchDisplay();

  try {
    await API.logSwitch({
      quiz_id: proctorQuizId,
      roll:    proctorRoll,
      reason:  reason
    });
    console.warn(`[PROCTOR] Nexus break logged #${localSwitchCount} (${reason})`);
  } catch (err) {
    console.error('[PROCTOR] Failed to log switch:', err);
  }
}

/* ── Update UI Counter ───────────────────────────────────── */
function updateSwitchDisplay() {
  const el = document.getElementById('switch-count');
  if (el) {
    el.textContent = localSwitchCount;
    el.style.color = localSwitchCount > 0 ? 'var(--laser-red)' : 'var(--text-dim)';

    // Flash effect
    el.parentElement?.classList.add('flash-red');
    setTimeout(() => el.parentElement?.classList.remove('flash-red'), 500);
  }

  // Show warning on high switch count
  if (localSwitchCount >= 3) {
    const warning = document.getElementById('proctor-warning');
    if (warning) {
      warning.style.display = 'flex';
      warning.textContent   = `[ANTI-CHEAT WARNING]: ${localSwitchCount} TAB SWITCHES DETECTED — VISIBLE TO HOST`;
    }
  }
}
