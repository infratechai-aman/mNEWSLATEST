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

function decodeHtmlEntities(str) {
    if (!str || typeof str !== 'string') return str;
    // Named entities
    var result = str;
    result = result.replace(/&amp;/g, '&');
    result = result.replace(/&lt;/g, '<');
    result = result.replace(/&gt;/g, '>');
    result = result.replace(/&quot;/g, '"');
    result = result.replace(/&hellip;/g, '...');
    result = result.replace(/&ndash;/g, '-');
    result = result.replace(/&mdash;/g, '-');
    result = result.replace(/&nbsp;/g, ' ');
    result = result.replace(/&lsquo;/g, "'");
    result = result.replace(/&rsquo;/g, "'");
    result = result.replace(/&ldquo;/g, '"');
    result = result.replace(/&rdquo;/g, '"');
    // Numeric decimal entities
    result = result.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(parseInt(dec, 10));
    });
    // Numeric hex entities
    result = result.replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
    return result;
}

function stripHtml(str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/<[^>]*>?/gm, '').trim();
}

async function fixEntities() {
    try {
        console.log('Fixing HTML entities in site_data/maithili_news...');
        var docRef = db.collection('site_data').doc('maithili_news');
        var doc = await docRef.get();

        if (doc.exists) {
            var data = doc.data();
            var items = data.items || [];
            var fixedCount = 0;

            var fixedItems = items.map(function(item) {
                var origTitle = item.title;
                var origShort = item.shortDescription;

                var fixed = Object.assign({}, item, {
                    title: decodeHtmlEntities(item.title || ''),
                    shortDescription: decodeHtmlEntities(stripHtml(item.shortDescription || '')),
                    category: decodeHtmlEntities(item.category || ''),
                });

                if (fixed.title !== origTitle || fixed.shortDescription !== origShort) {
                    fixedCount++;
                    console.log('  Fixed: ' + fixed.title.substring(0, 60));
                }
                return fixed;
            });

            await docRef.set({ items: fixedItems, updatedAt: new Date().toISOString() }, { merge: true });
            console.log('Fixed ' + fixedCount + ' articles in site_data/maithili_news (total: ' + fixedItems.length + ')');
        }

        console.log('Fixing HTML entities in news_articles collection...');
        var snapshot = await db.collection('news_articles').get();
        var collFixedCount = 0;

        var batch = db.batch();
        snapshot.forEach(function(docSnap) {
            var d = docSnap.data();
            var newTitle = decodeHtmlEntities(d.title || '');
            var newShort = decodeHtmlEntities(stripHtml(d.shortDescription || ''));
            var newCat = decodeHtmlEntities(d.category || '');

            if (newTitle !== d.title || newShort !== d.shortDescription || newCat !== d.category) {
                batch.update(docSnap.ref, {
                    title: newTitle,
                    shortDescription: newShort,
                    category: newCat,
                });
                collFixedCount++;
            }
        });

        if (collFixedCount > 0) {
            await batch.commit();
        }
        console.log('Fixed ' + collFixedCount + ' articles in news_articles collection');

        console.log('\nHTML entity cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixEntities();
