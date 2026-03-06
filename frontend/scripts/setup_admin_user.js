const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function cleanPrivateKey(key) {
  if (!key) return null;
  let cleaned = key.replace(/^['"](.*)['"]$/, '$1');
  cleaned = cleaned.replace(/\\n/g, '\n');
  return cleaned;
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase admin env vars.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function upsertSuperAdmin(email, password, name) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, {
      password,
      displayName: name,
      emailVerified: true,
      disabled: false,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: true,
      });
    } else {
      throw err;
    }
  }

  const now = new Date().toISOString();
  await db.collection('users').doc(userRecord.uid).set(
    {
      id: userRecord.uid,
      email,
      name,
      role: 'super_admin',
      status: 'active',
      requirePasswordChange: false,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  return userRecord.uid;
}

async function main() {
  const email = process.argv[2] || 'vijaychowdhary@maithilinews.com';
  const password = process.argv[3] || 'Macbook@MaithiliNews';
  const name = process.argv[4] || 'Vijay Chowdhary';

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const uid = await upsertSuperAdmin(email, password, name);
  console.log(`Super admin ready: ${email} (uid: ${uid})`);
}

main().catch((err) => {
  console.error('Failed to set up super admin:', err.message);
  process.exit(1);
});
