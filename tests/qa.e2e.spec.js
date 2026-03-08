const { test, expect } = require('playwright/test');

const admin = {
  email: 'admin@maithili.news',
  password: 'admin123'
};

const reporter = {
  email: 'aman@maithili.news',
  password: 'reporter123'
};

async function clearStorage(page, route = '/home/') {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
}

async function adminLogin(page) {
  await page.goto('/admin-panel/', { waitUntil: 'domcontentloaded' });
  await page.fill('#adminEmail', admin.email);
  await page.fill('#adminPassword', admin.password);
  await page.click('#adminLoginForm button[type="submit"]');
  await expect(page.locator('#adminDashView')).not.toHaveClass(/panel-hidden/);
}

async function reporterLogin(page) {
  await page.goto('/reporter-panel/', { waitUntil: 'domcontentloaded' });
  await page.fill('#reporterEmail', reporter.email);
  await page.fill('#reporterPassword', reporter.password);
  await page.click('#reporterLoginForm button[type="submit"]');
  await expect(page.locator('#reporterDashView')).not.toHaveClass(/panel-hidden/);
}

test.describe('A. Auth & Session', () => {
  test('admin login success + logout to login view', async ({ page }) => {
    await clearStorage(page);
    await adminLogin(page);
    await page.click('#adminLogout');
    await expect(page.locator('#adminLoginView')).not.toHaveClass(/panel-hidden/);
  });

  test('admin login rejects empty credentials', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/admin-panel/', { waitUntil: 'domcontentloaded' });
    await page.click('#adminLoginForm button[type="submit"]');
    await expect(page.locator('#adminError')).toContainText('required');
  });

  test('reporter login success + fail invalid credentials', async ({ page }) => {
    await clearStorage(page);
    await reporterLogin(page);
    await page.click('#reporterLogout');
    await expect(page.locator('#reporterLoginView')).not.toHaveClass(/panel-hidden/);
    await page.fill('#reporterEmail', 'bad@maithili.news');
    await page.fill('#reporterPassword', 'wrong');
    await page.click('#reporterLoginForm button[type="submit"]');
    await expect(page.locator('#reporterError')).toContainText('Invalid reporter credentials');
  });
});

test.describe('B/C/D/E. End-to-End Functional Workflow', () => {
  test('reporter submit -> admin moderation -> frontend reflection -> article with YouTube', async ({ page }) => {
    await clearStorage(page);

    const unique = Date.now();
    const title = `QA Article ${unique}`;
    const shortDesc = `QA short description ${unique}`;
    const content = `QA content para one ${unique}\nQA content para two ${unique}`;
    const videoUrl = 'https://www.youtube.com/watch?v=21X5lGlDOfg';

    await reporterLogin(page);
    await page.click('[data-tab-btn="submit"]');
    await page.fill('#rNewsTitle', title);
    await page.selectOption('#rNewsCategory', 'Bihar');
    await page.fill('#rNewsCity', 'Patna');
    await page.fill('#rNewsMainImage', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop');
    await page.fill('#rNewsSecondImage', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop');
    await page.fill('#rNewsVideoUrl', videoUrl);
    await page.fill('#rNewsThumb', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=900&auto=format&fit=crop');
    await page.fill('#rNewsShort', shortDesc);
    await page.fill('#rNewsContent', content);
    await page.fill('#rNewsTags', 'bihar, qa, test');
    await page.fill('#rNewsAuthor', 'QA Reporter');
    await page.check('#rNewsFeatured');
    await page.check('#rNewsShowHome');
    await page.click('#reporterNewsForm button[type="submit"]');
    await page.click('[data-tab-btn="mynews"]');
    await expect(page.locator('#myNewsList')).toContainText(title);

    await adminLogin(page);
    await page.click('[data-tab-btn="news"]');
    const row = page.locator('#newsList li', { hasText: title }).first();
    await row.locator('[data-action="approveNews"]').click();
    await expect(row.locator('.panel-badge.badge-approved')).toContainText('approved');

    await page.click('[data-tab-btn="breaking"]');
    const breakingText = `QA BREAKING ${unique}`;
    await page.fill('#breakingText', breakingText);
    await page.click('#breakingSave');

    await page.click('[data-tab-btn="business"]');
    await page.fill('#bizName', `QA Biz ${unique}`);
    await page.fill('#bizCategory', 'Retail');
    await page.fill('#bizCity', 'Patna');
    await page.click('#businessForm button[type="submit"]');
    const bizRow = page.locator('#businessList li', { hasText: `QA Biz ${unique}` }).first();
    await bizRow.locator('[data-action="approveBusiness"]').click();

    await page.click('[data-tab-btn="classifieds"]');
    await page.fill('#clsTitle', `QA Classified ${unique}`);
    await page.fill('#clsType', 'sale');
    await page.fill('#clsContact', '9999999999');
    await page.click('#classifiedForm button[type="submit"]');
    const clsRow = page.locator('#classifiedList li', { hasText: `QA Classified ${unique}` }).first();
    await clsRow.locator('[data-action="approveClassified"]').click();

    await page.click('[data-tab-btn="epaper"]');
    await page.fill('#paperTitle', `QA Epaper ${unique}`);
    await page.fill('#paperDate', '2026-03-08');
    await page.fill('#paperUrl', `https://example.com/qa-${unique}.pdf`);
    await page.click('#paperForm button[type="submit"]');

    await page.click('[data-tab-btn="livetv"]');
    await page.fill('#liveTitle', `QA Live ${unique}`);
    await page.fill('#liveUrl', videoUrl);
    await page.check('#liveMark');
    await page.click('#liveForm button[type="submit"]');

    await page.goto('/home/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ticker')).toContainText(breakingText);
    await expect(page.locator('body')).toContainText('Classifieds (Admin Managed)');
    await expect(page.locator('body')).toContainText('E-Newspaper');

    await page.goto('/business/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('Business Directory (Admin Managed)');
    await expect(page.locator('body')).toContainText(`QA Biz ${unique}`);

    await page.goto('/live-tv/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('iframe.video-embed')).toHaveAttribute('src', /embed\/21X5lGlDOfg/);

    await page.goto('/article-page/', { waitUntil: 'domcontentloaded' });
    const id = await page.evaluate(() => {
      const all = JSON.parse(localStorage.getItem('maithili_news') || '[]');
      return all.find((x) => x.title && x.title.includes('QA Article'))?.id || '';
    });
    await page.goto(`/article-page/?id=${encodeURIComponent(id)}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#articlePageRoot .headline-xl')).toContainText('QA Article');
    await expect(page.locator('#articlePageRoot iframe.video-embed')).toHaveAttribute('src', /embed\/21X5lGlDOfg/);
    await expect(page.locator('#articlePageRoot article')).toContainText(`QA content para one ${unique}`);
    await expect(page.locator('#articlePageRoot .list')).toBeVisible();
  });
});
