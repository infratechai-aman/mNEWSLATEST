const fs = require('fs');
let appJs = fs.readFileSync('assets/js/app.js', 'utf8');

appJs = appJs.replace('function doSearch(query) {', 'async function doSearch(query) {');
appJs = appJs.replace('wireArticleLinks(path);', 'await wireArticleLinks(path);');
appJs = appJs.replace("button.addEventListener('click', () => doSearch(input.value));", "button.addEventListener('click', async () => await doSearch(input.value));");
appJs = appJs.replace("form.addEventListener('submit', (e) => {\n    e.preventDefault();\n    doSearch(input.value);", "form.addEventListener('submit', async (e) => {\n    e.preventDefault();\n    await doSearch(input.value);");

fs.writeFileSync('assets/js/app.js', appJs);
console.log('Fixed doSearch');
