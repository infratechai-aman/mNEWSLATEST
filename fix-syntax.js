const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const appJsPath = path.join(baseDir, 'assets/js/app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

appJs = appJs.replace(/async function await /g, 'async function ');
fs.writeFileSync(appJsPath, appJs);

const panelJsPath = path.join(baseDir, 'assets/js/panel-suite.js');
let panelJs = fs.readFileSync(panelJsPath, 'utf8');

panelJs = panelJs.replace(/async function await /g, 'async function ');
fs.writeFileSync(panelJsPath, panelJs);
