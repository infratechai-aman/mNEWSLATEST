const fs = require('fs');
let panelJs = fs.readFileSync('assets/js/panel-suite.js', 'utf8');

// Find the login form logic using regex to avoid exact string matching issues
// From: const email = root.querySelector("#adminEmail").value.trim();
// To: await showDashboard();

let loginMatch = panelJs.match(/const email = root\.querySelector\("#adminEmail"\)\.value\.trim\(\);\s*const pass = root\.querySelector\("#adminPassword"\)\.value\.trim\(\);[\s\S]*?await showDashboard\(\);\s*\}/);

if (loginMatch) {
    let replacement = `const email = root.querySelector("#adminEmail").value.trim();
      const pass = root.querySelector("#adminPassword").value.trim();
      if (!email || !pass) {
        err.textContent = "Email and password required.";
        err.classList.remove("panel-hidden");
        return;
      }
      try {
        if (window.initFirebase) await window.initFirebase();
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        await write("maithili_admin_session", { role: "admin", email, at: Date.now() });
        await showDashboard();
      } catch (error) {
        err.textContent = error.message.replace('Firebase:', '').trim();
        err.classList.remove("panel-hidden");
      }`;
    panelJs = panelJs.replace(loginMatch[0], replacement);
    console.log("Replaced login block.");
} else {
    console.log("Login block not found.");
}

let logoutMatch = panelJs.match(/root\.querySelector\("#adminLogout"\)\.addEventListener\("click",\s*async\s*\(\)\s*=>\s*\{\s*localStorage\.removeItem\("maithili_admin_session"\);\s*showLogin\(\);\s*\}\);/);
if (logoutMatch) {
    let logoutReplacement = `root.querySelector("#adminLogout").addEventListener("click", async () => {
      localStorage.removeItem("maithili_admin_session");
      try {
        if (window.initFirebase) await window.initFirebase();
        await firebase.auth().signOut();
      } catch (e) {}
      showLogin();
    });`;
    panelJs = panelJs.replace(logoutMatch[0], logoutReplacement);
    console.log("Replaced logout block.");
} else {
    console.log("Logout block not found.");
}

fs.writeFileSync('assets/js/panel-suite.js', panelJs);
