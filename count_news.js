const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

admin.initializeApp({
    credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
});

const db = admin.firestore();

async function check() {
    try {
        const snapshot = await db.collection('news_articles').get();
        let out = '';
        out += `Total articles in 'news_articles' collection: ${snapshot.size}\n`;

        let adminScrapedCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.author === "Admin (Scraped)") {
                adminScrapedCount++;
            }
        });

        out += `Articles with author "Admin (Scraped)": ${adminScrapedCount}\n`;
        
        if (snapshot.size > 0) {
            out += '\nSample article (first one found):\n';
            const sampleDoc = snapshot.docs.find(d => d.data().author === "Admin (Scraped)");
            if(sampleDoc) {
                out += JSON.stringify(sampleDoc.data(), null, 2);
            } else {
                 out += "No scraped articles found\n";
            }
        }

        fs.writeFileSync('verification.txt', out, 'utf8');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
