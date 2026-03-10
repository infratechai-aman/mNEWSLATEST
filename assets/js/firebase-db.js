/**
 * firebase-db.js — Firebase Firestore integration for Maithili News
 * Provides dbRead(key, fallback) and dbWrite(key, value) for shared persistent data.
 * Session keys stay in localStorage (per-browser).
 */
(function () {
    'use strict';

    const FIREBASE_CONFIG = {
        apiKey: 'AIzaSyDqf9Tptg9TpkeoywZz-md1rHAK--GhujE',
        authDomain: 'mnews-f3c52.firebaseapp.com',
        projectId: 'mnews-f3c52',
        storageBucket: 'mnews-f3c52.firebasestorage.app',
        messagingSenderId: '164231835013',
        appId: '1:164231835013:web:377a773f3b0ffb615828ec',
        measurementId: 'G-P0PPGG0DF4'
    };

    const COLLECTION = 'site_data';

    // Keys that wrap their data in { items: [...] } because Firestore documents need objects
    const ARRAY_KEYS = [
        'maithili_news', 'maithili_businesses', 'maithili_classifieds',
        'maithili_reporters', 'maithili_reporter_apps', 'maithili_enewspapers',
        'maithili_admin_users'
    ];

    // Keys that stay in localStorage (per-browser, not shared)
    const LOCAL_ONLY_KEYS = ['maithili_admin_session', 'maithili_reporter_session', 'theme', 'lang'];

    let db = null;
    let _initPromise = null;
    const _cache = {};

    /**
     * Dynamically load the Firebase compat SDK scripts
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function initFirebase() {
        if (db) return db;
        if (_initPromise) return _initPromise;
        _initPromise = (async () => {
            try {
                await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');
                if (!firebase.apps.length) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                db = firebase.firestore();
                console.log('[Firebase] Connected to Firestore and Auth');
                return db;
            } catch (err) {
                console.warn('[Firebase] Failed to init, falling back to localStorage:', err);
                return null;
            }
        })();
        return _initPromise;
    }

    /**
     * Read a key from Firestore. Falls back to localStorage on error.
     */
    async function dbRead(key, fallback) {
        // Session keys always stay local
        if (LOCAL_ONLY_KEYS.includes(key)) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (_) { return fallback; }
        }

        // Return cached value if available
        if (key in _cache) return _cache[key] !== undefined ? _cache[key] : fallback;

        try {
            const firestore = await initFirebase();
            if (!firestore) throw new Error('No Firestore');
            const doc = await firestore.collection(COLLECTION).doc(key).get();
            if (doc.exists) {
                const data = doc.data();
                // Unwrap array keys
                const value = ARRAY_KEYS.includes(key) ? (data.items || []) : data;
                _cache[key] = value;
                return value;
            }
            return fallback;
        } catch (err) {
            console.warn(`[Firebase] Read failed for ${key}, using localStorage:`, err);
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (_) { return fallback; }
        }
    }

    /**
     * Write data to Firestore. Also mirrors to localStorage as backup.
     */
    async function dbWrite(key, value) {
        // Session keys always stay local
        if (LOCAL_ONLY_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(value));
            return;
        }

        // Update cache
        _cache[key] = value;

        // Also write to localStorage as backup
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { }

        try {
            const firestore = await initFirebase();
            if (!firestore) return;
            // Wrap arrays in { items: [...] } since Firestore docs must be objects
            const docData = ARRAY_KEYS.includes(key) ? { items: value, updatedAt: new Date().toISOString() } : { ...value, updatedAt: new Date().toISOString() };
            await firestore.collection(COLLECTION).doc(key).set(docData, { merge: false });
        } catch (err) {
            console.warn(`[Firebase] Write failed for ${key}:`, err);
        }
    }

    /**
     * Check if a key exists in Firestore
     */
    async function dbExists(key) {
        if (LOCAL_ONLY_KEYS.includes(key)) {
            return localStorage.getItem(key) !== null;
        }
        try {
            const firestore = await initFirebase();
            if (!firestore) return localStorage.getItem(key) !== null;
            const doc = await firestore.collection(COLLECTION).doc(key).get();
            return doc.exists;
        } catch (_) {
            return localStorage.getItem(key) !== null;
        }
    }

    /**
     * Clear cache for a specific key or all keys
     */
    function dbClearCache(key) {
        if (key) { delete _cache[key]; }
        else { Object.keys(_cache).forEach(k => delete _cache[k]); }
    }

    // Expose globally
    window.dbRead = dbRead;
    window.dbWrite = dbWrite;
    window.dbExists = dbExists;
    window.dbClearCache = dbClearCache;
    window.initFirebase = initFirebase;

    // Pre-init Firebase on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initFirebase());
    } else {
        initFirebase();
    }
})();
