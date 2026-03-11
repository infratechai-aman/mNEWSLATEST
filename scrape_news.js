const admin = require('firebase-admin');
const path = require('path');
const axios = require('axios');

// Adjust this to point to the correct .env.local file if needed, or rely on existing environment variables.
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

// The script assumes FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY are set.
// Either run it where those are provided or ensure they exist in .env.

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase credentials in environment variables.');
    process.exit(1);
}

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

function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// Ensure the schema matches how the admin panel submits it
function mapWPPostToSchema(post) {
    // Attempt to extract title
    const title = post.title && post.title.rendered ? post.title.rendered : 'Untitled';
    
    // Attempt to extract category from embedded terms
    let category = 'General';
    if (post._embedded && post._embedded['wp:term']) {
        const terms = post._embedded['wp:term'];
        for (const termGroup of terms) {
            if (termGroup.length > 0 && termGroup[0].taxonomy === 'category') {
                category = termGroup[0].name;
                break;
            }
        }
    }

    // Determine images
    let mainImage = '';
    let thumbnail = '';
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
        const media = post._embedded['wp:featuredmedia'][0];
        mainImage = media.source_url || '';
        // If available, grab the thumbnail sizing
        if (media.media_details && media.media_details.sizes && media.media_details.sizes.thumbnail) {
            thumbnail = media.media_details.sizes.thumbnail.source_url;
        } else {
            thumbnail = mainImage; 
        }
    }

    // Extract text without HTML tags for short description if possible, or just keep raw excerpt
    let shortDescription = '';
    if (post.excerpt && post.excerpt.rendered) {
        shortDescription = post.excerpt.rendered.replace(/<[^>]*>?/gm, '').trim();
    }

    const content = post.content && post.content.rendered ? post.content.rendered : '';
    
    // Format date string
    const createdAt = new Date(post.date).toLocaleString("en-IN");
    
    return {
        id: uid("news"),
        title,
        category,
        city: '', // WP might not have 'city' directly unless configured
        mainImage,
        secondImage: '',
        videoUrl: '', // Could try to extract from content if needed
        thumbnail,
        shortDescription,
        content,
        tags: [],
        status: "approved",
        author: "Admin (Scraped)",
        ownerEmail: "admin@maithili.news", 
        featured: false,
        showOnHome: true,
        createdAt
    };
}

async function scrapeAndUpload() {
    console.log('Starting scrape process...');
    const baseUrl = 'https://maithilinews.com/wp-json/wp/v2/posts';
    let page = 1;
    let totalScraped = 0;
    let keepGoing = true;

    try {
        while (keepGoing) {
            console.log(`Fetching page ${page}...`);
            try {
                const response = await axios.get(`${baseUrl}?_embed=1&per_page=100&page=${page}`);
                
                const posts = response.data;
                if (!posts || posts.length === 0) {
                    console.log('No posts found on this page. Stopping.');
                    keepGoing = false;
                    break;
                }

                console.log(`Found ${posts.length} posts on page ${page}. Uploading to Firestore...`);
                
                // Upload in batches
                const batchSize = 50; 
                for (let i = 0; i < posts.length; i += batchSize) {
                    const batch = db.batch();
                    const chunk = posts.slice(i, i + batchSize);
                    
                    for (const post of chunk) {
                        const articleData = mapWPPostToSchema(post);
                        const docRef = db.collection('news_articles').doc(articleData.id);
                        batch.set(docRef, articleData);
                    }
                    
                    await batch.commit();
                    totalScraped += chunk.length;
                    console.log(`Successfully batch committed ${chunk.length} items (total for this page: ${i + chunk.length})`);
                }

                page++;
            } catch (err) {
                if (err.response && (err.response.status === 400 || err.response.status === 404)) {
                    console.log('Reached the end of the pages (400/404 received).');
                    keepGoing = false;
                    break;
                }
                throw err;
            }
        }
        
        console.log(`\n✅ Scraping and upload complete! Total articles added: ${totalScraped}`);
    } catch (e) {
        console.error('Error during scraping:', e);
    } finally {
        process.exit(0);
    }
}

scrapeAndUpload();
