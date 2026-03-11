const fs = require('fs');

let panelJs = fs.readFileSync('assets/js/panel-suite.js', 'utf8');

// The issue happens because `await seed();` is called before login checking, causing permissions errors
// Remove await seed() from async function reporterInit(root) {
panelJs = panelJs.replace(/async function reporterInit\(root\) \{\s*await seed\(\);/, 'async function reporterInit(root) {');

// Add await seed() before showDash() if logging in via session
panelJs = panelJs.replace(/if \(session && session\.role === "reporter"\) await showDash\(\);/, 'if (session && session.role === "reporter") {\n      await seed();\n      await showDash();\n    }');

// Add await seed() before showDash() in the submit handler
let reporterSubmitMatch = panelJs.match(/await write\("maithili_reporter_session", \{ role: "reporter", email: found\.email, name: found\.name, id: found\.id, at: Date\.now\(\) \}\);\s*await showDash\(\);/);
if (reporterSubmitMatch) {
    let repSubmitReplace = `await write("maithili_reporter_session", { role: "reporter", email: found.email, name: found.name, id: found.id, at: Date.now() });
      await seed();
      await showDash();`;
    panelJs = panelJs.replace(reporterSubmitMatch[0], repSubmitReplace);
}

fs.writeFileSync('assets/js/panel-suite.js', panelJs);
console.log('Fixed reporterInit seed logic');
