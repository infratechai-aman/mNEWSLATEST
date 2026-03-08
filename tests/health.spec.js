const { test, expect } = require('playwright/test');

const routes = [
  '/',
  '/home/',
  '/politics/',
  '/india/',
  '/bihar/',
  '/world/',
  '/business/',
  '/technology/',
  '/sports/',
  '/entertainment/',
  '/videos/',
  '/live-tv/',
  '/photos/',
  '/search/',
  '/article-page/',
  '/about/',
  '/contact/',
  '/admin-login/',
  '/admin-panel/',
  '/reporter-panel/'
];

const assets = [
  '/assets/css/styles.css',
  '/assets/css/panel-suite.css',
  '/assets/js/app.js',
  '/assets/js/panel.js',
  '/assets/js/panel-suite.js'
];

test.describe('F. Site Stability', () => {
  test('all major routes return 200', async ({ request }) => {
    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status(), `Route failed: ${route}`).toBe(200);
      const body = await res.text();
      expect(body.length, `Empty body: ${route}`).toBeGreaterThan(100);
    }
  });

  test('core assets load and are non-empty', async ({ request }) => {
    for (const asset of assets) {
      const res = await request.get(asset);
      expect(res.status(), `Asset failed: ${asset}`).toBe(200);
      const body = await res.text();
      expect(body.length, `Asset empty: ${asset}`).toBeGreaterThan(20);
    }
  });
});
