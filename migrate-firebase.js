const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file.startsWith('.')) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (file === 'index.html' || file.endsWith('.html')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const htmlFiles = findHtmlFiles(baseDir);
console.log(`Found ${htmlFiles.length} HTML files.`);

for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Insert before app.js or panel-suite.js
    if (content.includes('src="/assets/js/app.js"') && !content.includes('firebase-db.js')) {
        content = content.replace(
            '<script src="/assets/js/app.js" defer></script>',
            '<script src="/assets/js/firebase-db.js" defer></script>\n  <script src="/assets/js/app.js" defer></script>'
        );
        changed = true;
    }
    if (content.includes('src="/assets/js/panel-suite.js"') && !content.includes('firebase-db.js')) {
        content = content.replace(
            '<script src="/assets/js/panel-suite.js" defer></script>',
            '<script src="/assets/js/firebase-db.js" defer></script>\n  <script src="/assets/js/panel-suite.js" defer></script>'
        );
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.relative(baseDir, filePath)}`);
    }
}

// 2. Update app.js
const appJsPath = path.join(baseDir, 'assets/js/app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

appJs = appJs.replace(/function readPanelData\(key, fallback\) {[\s\S]*?return fallback;\s*}\s*}/,
    `async function readPanelData(key, fallback) {
  if (typeof window.dbRead === 'function') {
    return await window.dbRead(key, fallback);
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}`);

// Add async to all these functions in app.js
const asyncFuncs = [
    'applyHeroCarousel', 'applyTickerControl', 'applyAdsControl',
    'applyLatestUpdates', 'applyDynamicHomeSections', 'applySearchLogic',
    'applyBusinessControl', 'applyClassifiedControl', 'applyENewspaperControl',
    'applyLiveTvControl', 'storeStaticArticle', 'renderArticlePage',
    'applyFrontendControls', 'initLayout'
];

for (const func of asyncFuncs) {
    appJs = appJs.replace(new RegExp(`function ${func}\\(`, 'g'), `async function ${func}(`);
}

// Replace readPanelData calls with await readPanelData
appJs = appJs.replace(/const\s+(\w+)\s*=\s*readPanelData/g, 'const $1 = await readPanelData');
appJs = appJs.replace(/let\s+(\w+)\s*=\s*readPanelData/g, 'let $1 = await readPanelData');
appJs = appJs.replace(/storeStaticArticle\(/g, 'await storeStaticArticle(');
appJs = appJs.replace(/\bstoreStaticArticle\(/g, 'await storeStaticArticle(');

appJs = appJs.replace(/applyFrontendControls\(/g, 'await applyFrontendControls(');
appJs = appJs.replace(/applyHeroCarousel\(/g, 'await applyHeroCarousel(');
appJs = appJs.replace(/applyTickerControl\(/g, 'await applyTickerControl(');
appJs = appJs.replace(/applyAdsControl\(/g, 'await applyAdsControl(');
appJs = appJs.replace(/applyLatestUpdates\(/g, 'await applyLatestUpdates(');
appJs = appJs.replace(/applyDynamicHomeSections\(/g, 'await applyDynamicHomeSections(');
appJs = appJs.replace(/applySearchLogic\(/g, 'await applySearchLogic(');
appJs = appJs.replace(/applyBusinessControl\(/g, 'await applyBusinessControl(');
appJs = appJs.replace(/applyClassifiedControl\(/g, 'await applyClassifiedControl(');
appJs = appJs.replace(/applyENewspaperControl\(/g, 'await applyENewspaperControl(');
appJs = appJs.replace(/applyLiveTvControl\(/g, 'await applyLiveTvControl(');
appJs = appJs.replace(/renderArticlePage\(/g, 'await renderArticlePage(');

// Clean up duplicate awaits
appJs = appJs.replace(/await\s+await/g, 'await');

appJs = appJs.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*{/, "document.addEventListener('DOMContentLoaded', async () => {");
appJs = appJs.replace(/initLayout\(/g, 'await initLayout(');

fs.writeFileSync(appJsPath, appJs);
console.log('Updated app.js');

// 3. Update panel-suite.js
const panelJsPath = path.join(baseDir, 'assets/js/panel-suite.js');
let panelJs = fs.readFileSync(panelJsPath, 'utf8');

panelJs = panelJs.replace(/function read\(key, fallback\) {[\s\S]*?return fallback;\s*}\s*}/,
    `async function read(key, fallback) {
    if (typeof window.dbRead === 'function') return await window.dbRead(key, fallback);
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }`);

panelJs = panelJs.replace(/function write\(key, value\) {[\s\S]*?}/,
    `async function write(key, value) {
    if (typeof window.dbWrite === 'function') { await window.dbWrite(key, value); return; }
    localStorage.setItem(key, JSON.stringify(value));
  }`);

// Add async to functions
panelJs = panelJs.replace(/function seed\(/g, "async function seed(");
panelJs = panelJs.replace(/function adminInit\(/g, "async function adminInit(");
panelJs = panelJs.replace(/function reporterInit\(/g, "async function reporterInit(");
panelJs = panelJs.replace(/function renderAdmin\(/g, "async function renderAdmin(");
panelJs = panelJs.replace(/function renderReporter\(/g, "async function renderReporter(");
panelJs = panelJs.replace(/function showDashboard\(/g, "async function showDashboard(");
panelJs = panelJs.replace(/function showDash\(/g, "async function showDash(");

// Fix awaits for read/write/render/seed
panelJs = panelJs.replace(/read\(/g, "await read(");
panelJs = panelJs.replace(/write\(/g, "await write(");
panelJs = panelJs.replace(/seed\(/g, "await seed(");
panelJs = panelJs.replace(/renderAdmin\(/g, "await renderAdmin(");
panelJs = panelJs.replace(/renderReporter\(/g, "await renderReporter(");
panelJs = panelJs.replace(/adminInit\(/g, "await adminInit(");
panelJs = panelJs.replace(/reporterInit\(/g, "await reporterInit(");
panelJs = panelJs.replace(/showDashboard\(/g, "await showDashboard(");
panelJs = panelJs.replace(/showDash\(/g, "await showDash(");

// Make event listeners async
panelJs = panelJs.replace(/\.addEventListener\("submit",\s*\(e\)\s*=>/g, '.addEventListener("submit", async (e) =>');
panelJs = panelJs.replace(/\.addEventListener\("click",\s*\(\)\s*=>/g, '.addEventListener("click", async () =>');
panelJs = panelJs.replace(/\.addEventListener\("click",\s*\(e\)\s*=>/g, '.addEventListener("click", async (e) =>');
panelJs = panelJs.replace(/document\.addEventListener\("DOMContentLoaded",\s*\(\)\s*=>/g, 'document.addEventListener("DOMContentLoaded", async () =>');

panelJs = panelJs.replace(/await\s+await/g, "await");

fs.writeFileSync(panelJsPath, panelJs);
console.log('Updated panel-suite.js');
