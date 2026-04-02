/**
 * KADEMICS — admin.js
 * Admin authentication and request queue management.
 *
 * C LOGIC MIRROR:
 *   validate_admin()     → strcmp(email, ADMIN_EMAIL) && strcmp(pass, ADMIN_PASS)
 *   queue_request()      → linked_list_append(&g_requests, req)
 *   approve_request()    → db_insert(req.table, req.data); req.status = APPROVED
 *   deny_request()       → req.status = DENIED
 *   get_pending()        → filter(g_requests, status == PENDING)
 */

// ── Admin Credentials (hardcoded; in C backend these are #define constants) ──
const ADMIN_EMAIL    = '2505022@kiit.ac.in';
const ADMIN_PASSWORD = 'Kademics20180704';

const ADMIN_KEY      = 'kademics_admin';
const REQUESTS_KEY   = 'kademics_requests';

// ── Admin Auth ─────────────────────────────────────────────────────────────

/**
 * adminLogin(email, password) → { success, error }
 * C equivalent: validate_admin(email, password) in auth.c
 */
export function adminLogin(email, password) {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = btoa(`ADMIN:${Date.now()}:KADEMICS`);
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify({
      email: ADMIN_EMAIL,
      roll:  '2505022',
      name:  'System Administrator',
      token,
      loginAt: Date.now()
    }));
    return { success: true, token };
  }
  return { success: false, error: '[ACCESS DENIED]: INVALID ADMIN CREDENTIALS.' };
}

/**
 * getAdminSession() → admin object or null
 */
export function getAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    const admin = JSON.parse(raw);
    // Token expires in 2 hours (7200000ms)
    if (Date.now() - admin.loginAt > 7200000) {
      sessionStorage.removeItem(ADMIN_KEY);
      return null;
    }
    return admin;
  } catch { return null; }
}

/**
 * requireAdmin() — redirect to admin.html if not logged in as admin
 */
export function requireAdmin() {
  const admin = getAdminSession();
  if (!admin) {
    const base = window.location.href.replace(/[^/]*$/, '');
    window.location.href = base + 'admin.html';
    return null;
  }
  return admin;
}

/**
 * adminLogout()
 */
export function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
  const base = window.location.href.replace(/[^/]*$/, '');
  window.location.href = base + 'admin.html';
}

// ── Request Queue (localStorage) ──────────────────────────────────────────

/**
 * queueRequest(type, data, submitter)
 * Adds a pending request — mirrors C: linked_list_append(&g_requests, new_req)
 * Called when a regular user submits a "+" form.
 */
export function queueRequest(type, data, submitter) {
  const requests = getAllRequests();
  const req = {
    id:        generateId(),
    type,      // e.g. 'ADD_COURSE', 'ADD_NOTE', 'ADD_ORACLE_TEACHER'
    data,      // the actual payload
    submitter, // { roll, name }
    status:    'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    reviewedBy: null,
    adminNote: ''
  };
  requests.push(req);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return req;
}

/**
 * getAllRequests() → array of all requests (all statuses)
 */
export function getAllRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  } catch { return []; }
}

/**
 * getPendingRequests() → only PENDING ones
 * C equivalent: filter(g_requests, r => r.status == STATUS_PENDING)
 */
export function getPendingRequests() {
  return getAllRequests().filter(r => r.status === 'PENDING');
}

/**
 * approveRequest(id, admin) → applies the request's data to mock store
 * C equivalent: db_insert(req->table, req->data); req->status = STATUS_APPROVED
 */
export function approveRequest(id, admin) {
  const requests = getAllRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return false;

  requests[idx].status     = 'APPROVED';
  requests[idx].updatedAt  = new Date().toISOString();
  requests[idx].reviewedBy = admin.roll;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

  // Apply to approved data store
  applyApprovedRequest(requests[idx]);
  return true;
}

/**
 * denyRequest(id, admin, note) → marks DENIED
 * C equivalent: req->status = STATUS_DENIED; strncpy(req->admin_note, note, 255)
 */
export function denyRequest(id, admin, note = '') {
  const requests = getAllRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return false;

  requests[idx].status     = 'DENIED';
  requests[idx].updatedAt  = new Date().toISOString();
  requests[idx].reviewedBy = admin.roll;
  requests[idx].adminNote  = note;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return true;
}

// ── Approved Data Store (admin-added items; persists via localStorage) ─────

const STORE_KEY = 'kademics_approved_store';

export function getApprovedStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch { return {}; }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/**
 * adminDirectAdd(type, data)
 * Admin bypasses request queue and adds directly.
 * C equivalent: db_insert(table, data) called from admin_handler() in main.c
 */
export function adminDirectAdd(type, data) {
  const store = getApprovedStore();
  const typeMap = {
    ADD_COURSE:         'courses',
    ADD_BRANCH:         'branches',
    ADD_YEAR:           'years',
    ADD_SUBJECT:        'subjects',
    ADD_TEACHER:        'teachers',
    ADD_NOTE:           'notes',
    ADD_ORACLE_TEACHER: 'oracle_teachers',
    ADD_QUIZ:           'quizzes',
    ADD_NEXUS_ROOM:     'nexus_rooms',
    ADD_QUESTION:       'questions'
  };
  const key = typeMap[type] || type;
  if (!store[key]) store[key] = [];
  const item = { ...data, id: generateId(), adminAdded: true, addedAt: new Date().toISOString() };
  store[key].push(item);
  saveStore(store);
  return item;
}

export function getAdminItems(type) {
  const store = getApprovedStore();
  return store[type] || [];
}

function applyApprovedRequest(req) {
  const store = getApprovedStore();
  const typeMap = {
    ADD_COURSE:         'courses',
    ADD_BRANCH:         'branches',
    ADD_YEAR:           'years',
    ADD_SUBJECT:        'subjects',
    ADD_TEACHER:        'teachers',
    ADD_NOTE:           'notes',
    ADD_ORACLE_TEACHER: 'oracle_teachers',
    ADD_QUIZ:           'quizzes',
    ADD_NEXUS_ROOM:     'nexus_rooms',
  };
  const key = typeMap[req.type];
  if (key) {
    if (!store[key]) store[key] = [];
    store[key].push({ ...req.data, id: generateId(), approvedAt: new Date().toISOString() });
    saveStore(store);
  }
}

// ── Utility ────────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function typeLabel(type) {
  const map = {
    ADD_COURSE:         '📚 New Course',
    ADD_BRANCH:         '🔀 New Branch',
    ADD_YEAR:           '📅 New Year',
    ADD_SUBJECT:        '📖 New Subject',
    ADD_TEACHER:        '👤 New Teacher (Archive)',
    ADD_NOTE:           '📄 Note Upload',
    ADD_ORACLE_TEACHER: '⭐ Oracle Teacher',
    ADD_QUIZ:           '⚔️ New Quiz',
    ADD_NEXUS_ROOM:     '💬 Nexus Room',
  };
  return map[type] || type;
}
