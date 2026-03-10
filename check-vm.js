const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/js/app.js', 'utf8');

try {
    new vm.Script(code, { filename: 'app.js' });
    console.log('No syntax errors found.');
} catch (e) {
    console.log("EXACT ERROR:");
    console.log(e.stack.split('\n').slice(0, 3).join('\n'));
}
