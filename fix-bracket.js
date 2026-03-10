const fs = require('fs');
let appJs = fs.readFileSync('assets/js/app.js', 'utf8');

// I will just locate the exact string and replace it.
const searchFor = `    if (!card.dataset.boundOpenArticle) {\r
      card.dataset.boundOpenArticle = '1';\r
      card.addEventListener('click', () => {\r
        window.location.href = \`/article-page/?id=\${encodeURIComponent(id)}\`;\r
      });\r
    }\r
  });\r
}`;

const replaceWith = `    if (!card.dataset.boundOpenArticle) {\n      card.dataset.boundOpenArticle = '1';\n      card.addEventListener('click', () => {\n        window.location.href = \`/article-page/?id=\${encodeURIComponent(id)}\`;\n      });\n    }\n    idx++;\n  }\n}`;

// Let's try to replace all \r\n with \n so matching is easier.
appJs = appJs.replace(/\r\n/g, '\n');

const searchUnix = `    if (!card.dataset.boundOpenArticle) {
      card.dataset.boundOpenArticle = '1';
      card.addEventListener('click', () => {
        window.location.href = \`/article-page/?id=\${encodeURIComponent(id)}\`;
      });
    }
  });
}`;

if (appJs.includes(searchUnix)) {
    appJs = appJs.replace(searchUnix, replaceWith);
    fs.writeFileSync('assets/js/app.js', appJs);
    console.log("Successfully replaced wireArticleLinks ending block.");
} else {
    console.log("Could not find the target string. Looking for partial match...");
    appJs = appJs.replace(/\}\);\n\}/g, '}'); // A bit risky but might work if we only do it around line 710
    fs.writeFileSync('assets/js/app.js', appJs);
    console.log("Ran fallback replacement.");
}
