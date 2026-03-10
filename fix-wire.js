const fs = require('fs');
let appJs = fs.readFileSync('assets/js/app.js', 'utf8');

// 1. replace function signature
appJs = appJs.replace('function wireArticleLinks(path) {', 'async function wireArticleLinks(path) {');

// 2. replace cards.forEach((card, idx) => {
appJs = appJs.replace('cards.forEach((card, idx) => {', 'let idx = 0;\n  for (const card of cards) {');

// 3. remove the closing }); of forEach
appJs = appJs.replace('    }\n  });\n}', '    }\n    idx++;\n  }\n}');

// 4. change the return inside the loop to continue
appJs = appJs.replace('if (!title) return;', 'if (!title) { idx++; continue; }');

fs.writeFileSync('assets/js/app.js', appJs);
console.log('Fixed wireArticleLinks');
