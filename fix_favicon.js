const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (f === 'node_modules' || f.startsWith('.')) continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.html')) {
            let content = fs.readFileSync(p, 'utf-8');
            if (!content.includes('favicon')) {
                // Insert the favicon right before the closing head tag
                content = content.replace('</head>', '  <link rel="icon" href="/assets/img/maithili_logo.png" type="image/png">\n</head>');
                fs.writeFileSync(p, content);
                console.log('Added favicon to', p);
            }
        }
    }
}

walk(__dirname);
console.log('Favicon update complete.');
