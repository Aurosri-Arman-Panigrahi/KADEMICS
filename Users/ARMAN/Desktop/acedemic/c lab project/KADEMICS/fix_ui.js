const fs = require('fs');

// 1. profile.html - Disconnect button
let profile = fs.readFileSync('web/profile.html', 'utf8');
profile = profile.replace(
  "document.getElementById('btn-logout').addEventListener('click', () => API.logout());",
  "document.getElementById('btn-logout').addEventListener('click', () => { localStorage.removeItem('kademics_token'); localStorage.removeItem('kademics_user'); window.location.href = 'index.html'; });"
);
fs.writeFileSync('web/profile.html', profile);

// 2. oracle.html - Fix stars
let oracle = fs.readFileSync('web/oracle.html', 'utf8');
oracle = oracle.replace(/<i class="fa fa-diamond"><\/i>/g, '<i class="fa fa-star text-cyan" style="color:var(--cyan)"></i>');
fs.writeFileSync('web/oracle.html', oracle);

// 3. teacher-dossier.html - Fix corrupt stars
let teacher = fs.readFileSync('web/teacher-dossier.html', 'utf8');
// Fix the diamonds generator
teacher = teacher.replace(/innerHTML = diamonds\(avg\);/g, "innerHTML = diamonds(avg);");
teacher = teacher.replace(/<span style="color:\${i<=Math\.round\(avg\)\?'var\(--cyan\)':'var\(--text-dim\)'};font-size:1\.2rem">\uFFFD<\/span>/g,
  `<span style="color:\${i<=Math.round(avg)?'var(--cyan)':'var(--text-dim)'};font-size:1.2rem"><i class="fa fa-star"></i></span>`
);
// Fix the review picker
for (let i = 1; i <= 5; i++) {
  teacher = teacher.replace(
    new RegExp(`<span class="star-pick" onclick="setRating\\(${i}\\)" data-v="${i}">\uFFFD</span>`, 'g'),
    `<span class="star-pick" onclick="setRating(${i})" data-v="${i}"><i class="fa fa-star"></i></span>`
  );
}
// Fix fallbacks for textContent that turned into \uFFFD
teacher = teacher.replace(/\|\| '\uFFFD'/g, "|| '-'");

fs.writeFileSync('web/teacher-dossier.html', teacher);

// 4. archive.html - Expose functions to window
let archive = fs.readFileSync('web/archive.html', 'utf8');
if (!archive.includes('window.openAddModal = openAddModal;')) {
  archive = archive.replace('</script>', 
`window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.submitAdd = submitAdd;
</script>`);
}
fs.writeFileSync('web/archive.html', archive);

console.log("Fixes applied successfully.");
