const fs = require('fs');

const appJsPath = 'assets/js/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

// The issue is: await readPanelData('something', []).filter(...)
// Because of operator precedence, the .filter runs on the Promise.
// We should replace `await readPanelData(XXX).filter` with `(await readPanelData(XXX)).filter`
// Wait, regex might be tricky because of nested parens.
// Let's just do a string replacement that captures everything between readPanelData and .filter

appJs = appJs.replace(/await readPanelData\([^)]+\)\.filter/g, match => {
    // e.g. "await readPanelData('maithili_buildings', []).filter"
    // becomes "(await readPanelData('maithili_buildings', [])).filter"
    return '(' + match.replace('.filter', ').filter');
});

// Do the same for other methods like .slice, .map, .find just in case
const methods = ['.filter', '.map', '.slice', '.find', '.sort'];
for (const method of methods) {
    const regex = new RegExp(`await readPanelData\\([^)]+\\)\\${method}`, 'g');
    appJs = appJs.replace(regex, match => {
        return '(' + match.replace(method, `)${method}`);
    });
}

// Write back
fs.writeFileSync(appJsPath, appJs);
console.log('Fixed await precedence in app.js');

const panelJsPath = 'assets/js/panel-suite.js';
let panelJs = fs.readFileSync(panelJsPath, 'utf8');

for (const method of methods) {
    const regex = new RegExp(`await read\\([^)]+\\)\\${method}`, 'g');
    panelJs = panelJs.replace(regex, match => {
        return '(' + match.replace(method, `)${method}`);
    });
}

fs.writeFileSync(panelJsPath, panelJs);
console.log('Fixed await precedence in panel-suite.js');
