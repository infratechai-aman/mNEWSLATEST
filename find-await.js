const fs = require('fs');
const content = fs.readFileSync('assets/js/app.js', 'utf8');
const lines = content.split('\n');
let inAsync = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('async function') || line.includes('async () =>')) {
        inAsync = true;
    }
    if (inAsync) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        if (braceCount === 0) {
            inAsync = false;
        }
    }

    if (!inAsync && line.includes('await ')) {
        console.log(`Found await outside async at line ${i + 1}: ${line}`);
    }
}
