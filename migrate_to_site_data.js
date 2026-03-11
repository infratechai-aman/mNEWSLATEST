const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}
const db = admin.firestore();

async function migrate() {
    try {
        console.log('Fetching scraped articles from news_articles collection...');
        const snapshot = await db.collection('news_articles').where('author', '==', 'Admin (Scraped)').get();
        if (snapshot.empty) {
            console.log('No scraped articles found in news_articles.');
            process.exit(0);
        }

        const scrapedNews = [];
        snapshot.forEach(doc => {
            scrapedNews.push(doc.data());
        });
        console.log(`Found ${scrapedNews.length} scraped articles.`);

        console.log('Fetching existing news array from site_data/maithili_news...');
        const docRef = db.collection('site_data').doc('maithili_news');
        const doc = await docRef.get();
        
        let existingNews = [];
        if (doc.exists) {
            const data = doc.data();
            existingNews = data.items || [];
        }

        console.log(`Existing news count: ${existingNews.length}`);
        
        // Append historical scraped news to existing array. 
        // We will add them to the array. 
        // To avoid duplicates, filter out any already existing IDs.
        const existingIds = new Set(existingNews.map(n => n.id));
        const newArticles = scrapedNews.filter(n => !existingIds.has(n.id));
        
        const combined = [...existingNews, ...newArticles];
        
        console.log(`Adding ${newArticles.length} new articles. New total will be: ${combined.length}`);
        
        await docRef.set({
            items: combined,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Successfully updated site_data/maithili_news!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

migrate();
