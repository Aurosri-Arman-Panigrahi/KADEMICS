/**
 * KADEMICS — api.js
 * Smart API client:
 *   • If C backend is reachable on same origin → uses real REST API
 *   • If not (Live Server / file:// mode) → uses rich local mock data
 *   Mode is auto-detected once on first call.
 */

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK = {
  courses: [
    { id:1, name:'B.Tech Computer Science & Engineering', desc:'4-year undergraduate program' },
    { id:2, name:'B.Tech Electronics & Communication',    desc:'4-year undergraduate program' },
    { id:3, name:'B.Tech Mechanical Engineering',         desc:'4-year undergraduate program' },
    { id:4, name:'B.Tech Civil Engineering',              desc:'4-year undergraduate program' },
  ],
  branches: {
    1: [
      { id:1, name:'CSE (Core)',               desc:'Core Computer Science' },
      { id:2, name:'CSE (AI & ML)',             desc:'Artificial Intelligence & Machine Learning' },
      { id:3, name:'CSE (Data Science)',        desc:'Data Science Specialisation' },
      { id:4, name:'CSE (Cyber Security)',      desc:'Information Security focus' },
    ],
    2: [
      { id:5, name:'ECE (VLSI)',    desc:'Very Large Scale Integration' },
      { id:6, name:'ECE (Comm)',    desc:'Communication Systems' },
    ],
    3: [{ id:7, name:'MECH (General)', desc:'General Mechanical' }],
    4: [{ id:8, name:'CIVIL (General)',desc:'General Civil' }],
  },
  years: {
    1: [{id:1,name:'1st Year'},{id:2,name:'2nd Year'},{id:3,name:'3rd Year'},{id:4,name:'4th Year'}],
    2: [{id:1,name:'1st Year'},{id:2,name:'2nd Year'},{id:3,name:'3rd Year'},{id:4,name:'4th Year'}],
    3: [{id:1,name:'1st Year'},{id:2,name:'2nd Year'},{id:3,name:'3rd Year'},{id:4,name:'4th Year'}],
    4: [{id:1,name:'1st Year'},{id:2,name:'2nd Year'},{id:3,name:'3rd Year'},{id:4,name:'4th Year'}],
  },
  subjects: {
    1: [
      { id:1, name:'Programming & Problem Solving Using C' },
      { id:2, name:'Engineering Mathematics - I' },
      { id:3, name:'Physics' },
      { id:4, name:'Basic Electrical Engineering' },
      { id:5, name:'Engineering Mechanics' },
    ],
    2: [
      { id:6,  name:'Data Structures & Algorithms' },
      { id:7,  name:'Object Oriented Programming (Java)' },
      { id:8,  name:'Discrete Mathematics' },
      { id:9,  name:'Computer Organisation & Architecture' },
      { id:10, name:'Database Management Systems' },
    ],
    3: [
      { id:11, name:'Operating Systems' },
      { id:12, name:'Computer Networks' },
      { id:13, name:'Algorithm Design & Analysis' },
      { id:14, name:'Software Engineering' },
    ],
    4: [
      { id:15, name:'Machine Learning' },
      { id:16, name:'Deep Learning' },
      { id:17, name:'Cloud Computing' },
      { id:18, name:'Capstone Project' },
    ],
  },
  teachers: {
    1:  [{ id:1, name:'Dr. A. Mohanty' }, { id:2, name:'Prof. S. Das' }, { id:3, name:'Dr. P. Mishra' }],
    2:  [{ id:4, name:'Dr. B. Kumar' },   { id:5, name:'Prof. R. Singh' }],
    3:  [{ id:6, name:'Dr. K. Nair' },    { id:7, name:'Prof. M. Jena' }],
    4:  [{ id:8, name:'Dr. L. Patra' }],
    5:  [{ id:9, name:'Dr. S. Panda' },   { id:10, name:'Prof. T. Roy' }],
    6:  [{ id:11, name:'Dr. N. Sahu' }],
    7:  [{ id:12, name:'Dr. V. Misra' }],
    8:  [{ id:13, name:'Prof. C. Ghosh' }],
    9:  [{ id:14, name:'Dr. D. Rout' }],
    10: [{ id:15, name:'Prof. A. Swain' }],
    11: [{ id:16, name:'Dr. R. Behera' }],
    12: [{ id:17, name:'Prof. S. Tripathy' }],
    13: [{ id:18, name:'Dr. M. Senapati' }],
    14: [{ id:19, name:'Prof. P. Satpathy' }],
    15: [{ id:20, name:'Dr. A. Mahapatra' }],
    16: [{ id:21, name:'Prof. B. Choudhury' }],
    17: [{ id:22, name:'Dr. S. Parida' }],
    18: [{ id:23, name:'Prof. K. Das' }],
  },
  notes: {
    1:  [
      { id:1, title:'C Programming - Unit 1: Basics & Variables',    uploader:'Arman P.', date:'2025-09-10', url:'' },
      { id:2, title:'C Programming - Unit 2: Arrays & Strings',       uploader:'Rahul K.',  date:'2025-09-18', url:'' },
      { id:3, title:'C Programming - Unit 3: Pointers Deep Dive',     uploader:'Priya S.',  date:'2025-10-01', url:'' },
      { id:4, title:'C Programming - Unit 4: File Handling & Structs', uploader:'Amit J.',  date:'2025-10-12', url:'' },
      { id:5, title:'C Lab Experiments - All 12 Weeks',               uploader:'Sanya M.',  date:'2025-11-02', url:'' },
    ],
    2:  [
      { id:6,  title:'Matrices & Determinants - Full Notes', uploader:'Rohit D.', date:'2025-09-15', url:'' },
      { id:7,  title:'Calculus - Limits & Derivatives',      uploader:'Ananya B.', date:'2025-10-05', url:'' },
    ],
    3:  [
      { id:10, title:'PPS C Course Handout',                 uploader:'Admin',    date:'2025-08-10', url:'' },
      { id:11, title:'Strings Mid Sem Questions',            uploader:'Aryan P.', date:'2025-10-09', url:'' },
    ],
    4:  [
      { id:12, title:'Math 1 Integration Formulas Cheat Sheet',uploader:'Rahul S.', date:'2025-01-05', url:'' },
      { id:13, title:'Differential Equations Chapter 3',       uploader:'Sunil Y.', date:'2025-02-12', url:'' },
    ],
    5:  [
      { id:14, title:'Electrical Engineering Kirchhoff Laws',  uploader:'Meera P.', date:'2025-04-03', url:'' },
    ],
    20: [
      { id:8,  title:'CNN Architectures - ResNet, VGG, YOLO', uploader:'Dev T.', date:'2026-01-10', url:'' },
      { id:9,  title:'Transformers & Attention Mechanism',     uploader:'Mira K.', date:'2026-01-22', url:'' },
    ],
  },
  oracleTeachers: [
    { id:1,  name:'Dr. A. Mohanty',   avg_rating:4.6, bio:'PhD IIT Bombay. 16+ years teaching C, OS, COA. Known for structured notes and live coding sessions.', photo:'', qualification:'PhD Computer Science, IIT Bombay' },
    { id:2,  name:'Prof. S. Das',     avg_rating:3.8, bio:'Specialises in algorithms and competitive programming. Runs weekly coding contests.', photo:'', qualification:'M.Tech, NIT Rourkela' },
    { id:3,  name:'Dr. P. Mishra',    avg_rating:4.2, bio:'Extensive research in distributed systems. Highly recommended for cloud computing elective.', photo:'', qualification:'PhD, IIT Kharagpur' },
    { id:4,  name:'Dr. B. Kumar',     avg_rating:4.9, bio:'National award-winning professor. Makes complex mathematics approachable through real-world applications.', photo:'', qualification:'PhD Mathematics, IIT Delhi' },
    { id:5,  name:'Prof. R. Singh',   avg_rating:4.4, bio:'Industry veteran turned academic. 12 years at Infosys before joining KIIT.', photo:'', qualification:'M.Tech + MBA, XLRI' },
    { id:6,  name:'Dr. K. Nair',      avg_rating:3.5, bio:'Physics specialist. Has published 30+ papers on quantum computing.', photo:'', qualification:'PhD Physics, IISc Bangalore' },
    { id:7,  name:'Prof. M. Jena',    avg_rating:4.1, bio:'Passionate about Mechanics and Robotics. Faculty advisor to the KIIT Robotics Club.', photo:'', qualification:'M.Tech Mechanical, IIT Kanpur' },
  ],
  quizzes: [
    { id:1, title:'C Programming Mid-Sem Blast',        subject:'PPS Using C',     host_roll:'2405001', status:'LIVE',      start_time:'2026-04-02T10:00:00', password:'clab2024' },
    { id:2, title:'DSA Weekly Challenge — Week 8',       subject:'Data Structures', host_roll:'2405020', status:'OPEN',      start_time:'2026-04-01T09:00:00', password:'dsa@kiit' },
    { id:3, title:'Math Olympiad Qualifier',             subject:'Engineering Maths',host_roll:'2405055', status:'UPCOMING', start_time:'2026-04-05T14:00:00', password:'math2026' },
    { id:4, title:'DBMS Mock Test — Internal 2',         subject:'DBMS',            host_roll:'2405010', status:'COMPLETED', start_time:'2026-03-28T11:00:00', password:'dbms123' },
    { id:5, title:'Networks Fundamentals Quiz',          subject:'Computer Networks',host_roll:'2405032', status:'OPEN',     start_time:'2026-04-01T08:00:00', password:'net@kiit' },
  ],
  questions: {
    1: [
      { id:1, question_text:'What is the output of: printf("%d", sizeof(char));', option_a:'1', option_b:'2', option_c:'4', option_d:'8', marks:1 },
      { id:2, question_text:'Which operator is used to access value at address stored in a pointer?', option_a:'&', option_b:'*', option_c:'->', option_d:'.', marks:1 },
      { id:3, question_text:'What is the default return type of a function in C if not specified?', option_a:'void', option_b:'int', option_c:'float', option_d:'char', marks:1 },
      { id:4, question_text:'Which of the following is NOT a valid storage class in C?', option_a:'auto', option_b:'static', option_c:'extern', option_d:'dynamic', marks:1 },
      { id:5, question_text:'What does fseek(fp, 0, SEEK_END) do?', option_a:'Moves to file start', option_b:'Moves to file end', option_c:'Resets file pointer', option_d:'Closes the file', marks:1 },
    ],
    2: [
      { id:6, question_text:'What is the time complexity of Binary Search?', option_a:'O(n)', option_b:'O(log n)', option_c:'O(n²)', option_d:'O(1)', marks:2 },
      { id:7, question_text:'Which data structure uses LIFO order?', option_a:'Queue', option_b:'Array', option_c:'Stack', option_d:'Linked List', marks:1 },
      { id:8, question_text:'Height of a balanced BST with n nodes is?', option_a:'O(n)', option_b:'O(n²)', option_c:'O(log n)', option_d:'O(1)', marks:2 },
    ],
    3: [
      { id:9,  question_text:'∫x² dx = ?', option_a:'x³', option_b:'x³/3 + C', option_c:'2x', option_d:'x²/2 + C', marks:1 },
      { id:10, question_text:'The rank of a matrix is the maximum number of linearly independent ___:', option_a:'Columns only', option_b:'Rows only', option_c:'Rows or Columns', option_d:'Diagonals', marks:1 },
    ],
    5: [
      { id:11, question_text:'Which protocol operates at the Transport Layer?', option_a:'HTTP', option_b:'IP', option_c:'TCP', option_d:'ARP', marks:1 },
      { id:12, question_text:'What does DNS stand for?', option_a:'Data Network System', option_b:'Domain Name System', option_c:'Dynamic Node Server', option_d:'Distributed Network Service', marks:1 },
      { id:13, question_text:'Which topology has all nodes connected to a central hub?', option_a:'Ring', option_b:'Bus', option_c:'Mesh', option_d:'Star', marks:1 },
    ],
  },
  correctAnswers: { 1:'A', 2:'B', 3:'B', 4:'D', 5:'B', 6:'B', 7:'C', 8:'C', 9:'B', 10:'C', 11:'C', 12:'B', 13:'D' },
  nexusRooms: [
    { room:'cse-1st-year',  teacher:'1st Year CSE',            subject:'All 1st Year Subjects' },
    { room:'pps-c-lab',     teacher:'PPS / C Lab Discussion',  subject:'Programming & Problem Solving' },
    { room:'dsa-lovers',    teacher:'DSA Zone',                subject:'Data Structures & Algorithms' },
    { room:'math-help',     teacher:'Math Help Desk',          subject:'Engineering Mathematics' },
    { room:'placement-prep',teacher:'Placement Preparation',   subject:'DSA · OS · DBMS · Networks' },
    { room:'kiit-general',  teacher:'KIIT General',            subject:'Off-topic & Announcements' },
  ],
  chatHistory: {
    'pps-c-lab': [
      { roll:'2405001', sender_name:'Arjun Sharma',   content:'Does anyone have notes for File Handling chapter?' },
      { roll:'2405045', sender_name:'Priya Mehta',    content:'Yeah! Check the archive — Sanya uploaded a full PDF.' },
      { roll:'2405099', sender_name:'Karthik Nair',   content:'The C lab quiz tomorrow is on pointers and structs 👀' },
      { roll:'2405001', sender_name:'Arjun Sharma',   content:'Thanks! Any tips for the file I/O questions?' },
      { roll:'2405078', sender_name:'Aisha Khan',     content:'Just remember: fopen returns NULL on failure. Always check that!' },
    ],
    'dsa-lovers': [
      { roll:'2405022', sender_name:'Dev Tripathy',   content:'Binary trees or AVL trees — which is more important for placements?' },
      { roll:'2405033', sender_name:'Sneha Roy',      content:'Both! But focus on traversals, BST, and graph BFS/DFS first.' },
      { roll:'2405011', sender_name:'Rahul Das',      content:'Dynamic programming is the real boss. Leetcode medium daily 💪' },
    ],
    'general': [
      { roll:'2405001', sender_name:'System',         content:'Welcome to the KADEMICS NEXUS! 🛸 Keep discussions on-topic and respectful.' },
      { roll:'2405050', sender_name:'Meera Singh',    content:'Anyone going to the tech fest next week?' },
      { roll:'2405087', sender_name:'Aryan Patel',    content:'Yes! The hackathon looks amazing this year.' },
    ],
  },
  sections: {
    1: [
      { id:1, section_name:'Section A (Morning)' },
      { id:2, section_name:'Section B (Afternoon)' },
      { id:3, section_name:'Section C (Evening)' },
    ],
    2: [
      { id:4, section_name:'Section A' },
      { id:5, section_name:'Section B' },
    ],
  },
  comments: {
    1: [
      { roll:'2405010', commenter_name:'Rahul K.',  content:'Best professor for C lab. Explains pointers with visuals.', created_at:'2025-11-05' },
      { roll:'2405020', commenter_name:'Priya S.',  content:'Very helpful during office hours. Highly recommend his section.', created_at:'2025-11-08' },
      { roll:'2405030', commenter_name:'Amit J.',   content:'Exam paper was fair. He teaches exactly what he tests.', created_at:'2025-11-12' },
    ],
    2: [
      { roll:'2405015', commenter_name:'Ananya B.', content:'Section B timing is a bit hard but sir is great.', created_at:'2025-11-09' },
    ],
    4: [
      { roll:'2405040', commenter_name:'Dev T.',    content:'Amazing for Maths. Complex concepts made simple!', created_at:'2026-01-15' },
    ],
  },
};

// ── Mode Detection ─────────────────────────────────────────────────────────
let _serverMode = null;  // null=unknown, true=C backend, false=demo

async function isServerUp() {
  if (_serverMode !== null) return _serverMode;
  try {
    const res = await fetch('/api/ping', { signal: AbortSignal.timeout(800) });
    const text = await res.text();
    _serverMode = !!JSON.parse(text).success;
  } catch {
    _serverMode = false;
  }
  return _serverMode;
}

// Generic mock response helper with realistic delay
function mockDelay(data, ms = 120) {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}

/**
 * getApprovedItems(storeKey)
 * Reads admin-approved items from localStorage and returns them.
 * C equivalent: db_query("SELECT * FROM approved WHERE type=?", storeKey)
 */
function getApprovedItems(storeKey) {
  try {
    const store = JSON.parse(localStorage.getItem('kademics_approved_store') || '{}');
    return store[storeKey] || [];
  } catch { return []; }
}

/**
 * getUserRequests(roll)
 * Returns all requests submitted by a specific student.
 * C equivalent: filter(g_requests, r => strcmp(r->submitter.roll, roll)==0)
 */
export function getUserRequests(roll) {
  try {
    const all = JSON.parse(localStorage.getItem('kademics_requests') || '[]');
    return all.filter(r => r.submitter?.roll === roll).reverse();
  } catch { return []; }
}

// ── API client ─────────────────────────────────────────────────────────────
export const API = {

  /* ── Auth ─────────────────────────────────────────────── */
  async login(email, name) {
    if (await isServerUp()) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      return res.json();
    }
    // Demo mode: generate token locally
    const roll = email.split('@')[0];
    const token = btoa(`${roll}:${Date.now()}`);
    return mockDelay({
      success: true,
      token,
      roll,
      name: name || `Student_${roll}`,
      rank: determineRank(roll),
      email
    });
  },

  async logout() {
    try { await fetch('/api/auth/logout', { method:'POST' }); } catch {}
    localStorage.removeItem('kademics_token');
    localStorage.removeItem('kademics_user');
    window.location.href = 'index.html';
  },

  /* ── Notes Hierarchy ──────────────────────────────────── */
  async getCourses() {
    if (await isServerUp()) return (await fetch('/api/notes/courses')).json();
    // Merge mock + admin-approved courses
    return mockDelay([...MOCK.courses, ...getApprovedItems('courses')]);
  },
  async getBranches(course_id) {
    if (await isServerUp()) return (await fetch(`/api/notes/branches?course_id=${course_id}`)).json();
    const approved = getApprovedItems('branches').filter(b => String(b.course_id) === String(course_id));
    return mockDelay([...(MOCK.branches[course_id] || []), ...approved]);
  },
  async getYears(branch_id) {
    if (await isServerUp()) return (await fetch(`/api/notes/years?branch_id=${branch_id}`)).json();
    const approved = getApprovedItems('years').filter(y => String(y.branch_id) === String(branch_id));
    return mockDelay([...(MOCK.years[branch_id] || MOCK.years[1]), ...approved]);
  },
  async getSubjects(year_id) {
    if (await isServerUp()) return (await fetch(`/api/notes/subjects?year_id=${year_id}`)).json();
    const approved = getApprovedItems('subjects').filter(s => String(s.year_id) === String(year_id));
    return mockDelay([...(MOCK.subjects[year_id] || MOCK.subjects[1]), ...approved]);
  },
  async getTeachers(subject_id) {
    if (await isServerUp()) return (await fetch(`/api/notes/teachers?subject_id=${subject_id}`)).json();
    const approved = getApprovedItems('teachers').filter(t => String(t.subject_id) === String(subject_id));
    return mockDelay([...(MOCK.teachers[subject_id] || []), ...approved]);
  },
  async getNotes(teacher_id) {
    if (await isServerUp()) return (await fetch(`/api/notes/files?teacher_id=${teacher_id}`)).json();
    // Approved notes: match by teacher_id OR by approver adding them directly
    const approved = getApprovedItems('notes').filter(n => String(n.teacher_id) === String(teacher_id));
    return mockDelay([...(MOCK.notes[teacher_id] || []), ...approved]);
  },
  async addCourse(data)   { if (await isServerUp()) return _post('/api/notes/add-course',  data); return mockDelay({success:true, message:'[DEMO] Course recorded locally.'}); },
  async addBranch(data)   { if (await isServerUp()) return _post('/api/notes/add-branch',  data); return mockDelay({success:true, message:'[DEMO] Branch recorded locally.'}); },
  async addYear(data)     { if (await isServerUp()) return _post('/api/notes/add-year',    data); return mockDelay({success:true, message:'[DEMO] Year recorded locally.'}); },
  async addSubject(data)  { if (await isServerUp()) return _post('/api/notes/add-subject', data); return mockDelay({success:true, message:'[DEMO] Subject recorded locally.'}); },
  async addTeacher(data)  { if (await isServerUp()) return _post('/api/notes/add-teacher', data); return mockDelay({success:true, message:'[DEMO] Teacher recorded locally.'}); },

  /* ── Oracle ───────────────────────────────────────────── */
  async getOracleTeachers() {
    if (await isServerUp()) return (await fetch('/api/oracle/teachers')).json();
    // Merge mock + admin-approved oracle teachers
    return mockDelay([...MOCK.oracleTeachers, ...getApprovedItems('oracle_teachers')]);
  },
  async getTeacherDossier(id) {
    if (await isServerUp()) return (await fetch(`/api/oracle/teacher?id=${id}`)).json();
    const teacher = MOCK.oracleTeachers.find(t => t.id === parseInt(id)) || {};
    return mockDelay({ ...teacher, sections: MOCK.sections[id] || MOCK.sections[1] });
  },
  async getSections(teacher_id) {
    if (await isServerUp()) return (await fetch(`/api/oracle/sections?teacher_id=${teacher_id}`)).json();
    return mockDelay(MOCK.sections[teacher_id] || MOCK.sections[1]);
  },
  async getComments(section_id) {
    if (await isServerUp()) return (await fetch(`/api/oracle/comments?section_id=${section_id}`)).json();
    return mockDelay(MOCK.comments[section_id] || []);
  },
  async addOracleTeacher(data) {
    if (await isServerUp()) return _post('/api/oracle/add-teacher', data);
    const newTeacher = { id: MOCK.oracleTeachers.length+1, avg_rating:0, ...data };
    MOCK.oracleTeachers.push(newTeacher);
    return mockDelay({success:true, message:'[DEMO] Teacher added! (session only)'});
  },
  async addSection(data) {
    if (await isServerUp()) return _post('/api/oracle/add-section', data);
    return mockDelay({success:true});
  },
  async addComment(data) {
    if (await isServerUp()) return _post('/api/oracle/comment', data);
    if (!MOCK.comments[data.section_id]) MOCK.comments[data.section_id] = [];
    MOCK.comments[data.section_id].push({ roll:data.roll, commenter_name:'You', content:data.message, created_at: new Date().toISOString().substring(0,10) });
    return mockDelay({success:true});
  },
  async rateTeacher(data) {
    if (await isServerUp()) return _post('/api/oracle/rate', data);
    const t = MOCK.oracleTeachers.find(x => x.id === data.teacher_id);
    if (t) t.avg_rating = Math.min(5, ((t.avg_rating * 10) + data.score * 2) / 12);
    return mockDelay({ success:true, new_avg: t?.avg_rating || data.score });
  },

  /* ── Gauntlet ─────────────────────────────────────────── */
  async getQuizzes() {
    if (await isServerUp()) return (await fetch('/api/gauntlet/quizzes')).json();
    // Merge mock quizzes + admin-created quizzes
    return mockDelay([...MOCK.quizzes, ...getApprovedItems('quizzes')]);
  },
  async verifyQuiz(data) {
    if (await isServerUp()) return _post('/api/gauntlet/verify', data);
    const allQuizzes = [...MOCK.quizzes, ...getApprovedItems('quizzes')];
    const quiz = allQuizzes.find(q => q.id === data.quiz_id || String(q.id) === String(data.quiz_id));
    if (!quiz) return mockDelay({success:false, message:'[NEXUS]: QUIZ ID NOT FOUND IN DATABASE.'});
    if (quiz.password !== data.password) return mockDelay({success:false, message:'[AUTH FAILED]: INCORRECT AUTHENTICATION KEY.'});
    return mockDelay({success:true, quiz_id: quiz.id, title: quiz.title});
  },
  async getQuestions(quiz_id) {
    if (await isServerUp()) return (await fetch(`/api/gauntlet/questions?quiz_id=${quiz_id}`)).json();
    const mockQs = MOCK.questions[quiz_id] || MOCK.questions[1];
    const adminQs = getApprovedItems('questions').filter(q => String(q.quiz_id) === String(quiz_id));
    return mockDelay([...mockQs, ...adminQs]);
  },
  async submitQuiz(data) {
    if (await isServerUp()) return _post('/api/gauntlet/submit', data);
    const mockQs = MOCK.questions[data.quiz_id] || MOCK.questions[1];
    const adminQs = getApprovedItems('questions').filter(q => String(q.quiz_id) === String(data.quiz_id));
    const qs = [...mockQs, ...adminQs];
    
    const answers = (data.answers || '').split(',');
    let score = 0, total = 0;
    qs.forEach((q, i) => {
      total += (q.marks || 1);
      const correctAns = q.correct || MOCK.correctAnswers[q.id];
      if (answers[i] && correctAns && correctAns.includes(answers[i])) {
        score += (q.marks || 1);
      }
    });
    return mockDelay({ success:true, score, total, class_avg:(total*0.67).toFixed(1), percentage:((score/total)*100).toFixed(1) });
  },
  async getResults(quiz_id, roll) {
    if (await isServerUp()) return (await fetch(`/api/gauntlet/results?quiz_id=${quiz_id}&roll=${roll}`)).json();
    return mockDelay({ results:[{roll, score:7, total:10}], class_avg:'6.2' });
  },
  async logSwitch(data)       { try { if (await isServerUp()) return _post('/api/gauntlet/proctor/switch', data); } catch {} return {}; },
  async exportCSV(quiz_id)    { if (await isServerUp()) { window.location = `/api/gauntlet/export?quiz_id=${quiz_id}`; } else { alert('[DEMO] CSV export requires the C backend server.'); } },
  async createQuiz(data)      { if (await isServerUp()) return _post('/api/gauntlet/create-quiz',  data); return mockDelay({success:true}); },
  async addQuestion(data)     { if (await isServerUp()) return _post('/api/gauntlet/add-question', data); return mockDelay({success:true}); },
  async updateQuizStatus(data){ if (await isServerUp()) return _post('/api/gauntlet/update-status',data); return mockDelay({success:true}); },

  /* ── Nexus ────────────────────────────────────────────── */
  async getNexusRooms() {
    if (await isServerUp()) return (await fetch('/api/nexus/rooms')).json();
    // Merge mock rooms + admin-created rooms
    return mockDelay([...MOCK.nexusRooms, ...getApprovedItems('nexus_rooms')]);
  },
  async getChatHistory(room) {
    if (await isServerUp()) return (await fetch(`/api/nexus/history?room=${encodeURIComponent(room)}`)).json();
    return mockDelay(MOCK.chatHistory[room] || []);
  },

  /* ── Search ───────────────────────────────────────────── */
  async search(query) {
    if (await isServerUp()) return (await fetch(`/api/search?q=${encodeURIComponent(query)}`)).json();
    const q = query.toLowerCase();
    
    // Create new structure matching what the C backend would return
    const archive = [];
    const oracle = [];
    const gauntlet = [];
    const nexus = [];
    
    MOCK.oracleTeachers.filter(t => t.name.toLowerCase().includes(q)).forEach(t =>
      oracle.push({ section:'oracle', name:t.name, id:t.id }));
    MOCK.quizzes.filter(qz => qz.title.toLowerCase().includes(q) || qz.subject.toLowerCase().includes(q)).forEach(qz =>
      gauntlet.push({ section:'gauntlet', name:qz.title, status:qz.status }));
    MOCK.nexusRooms.filter(r => r.teacher.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)).forEach(r =>
      nexus.push({ section:'nexus', name:r.teacher, subject:r.subject }));
    Object.values(MOCK.notes).flat().filter(n => n.title.toLowerCase().includes(q)).forEach(n =>
      archive.push({ section:'archive', type:'note', name:n.title }));
      
    return mockDelay({ archive, oracle, gauntlet, nexus });
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
async function _post(url, data) {
  const token = localStorage.getItem('kademics_token') || '';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

function determineRank(roll) {
  const n = parseInt(roll) || 0;
  if (n >  2500000) return 'FRESHER';
  if (n >  2400000) return 'RECRUIT';
  if (n >  2300000) return 'AGENT';
  if (n >  2200000) return 'SPECIALIST';
  return 'VETERAN';
}
