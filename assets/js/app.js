const routes = [
  ['Home', '/home/'],
  ['Politics', '/politics/'],
  ['India', '/india/'],
  ['Bihar', '/bihar/'],
  ['World', '/world/'],
  ['Business', '/business/'],
  ['Technology', '/technology/'],
  ['Sports', '/sports/'],
  ['Entertainment', '/entertainment/'],
  ['Lifestyle', '/lifestyle/'],
  ['Videos', '/videos/'],
  ['Live TV', '/live-tv/'],
  ['Photos', '/photos/'],
  ['About', '/about/'],
  ['Contact', '/contact/']
];

const tickerItems = [
  'Parliament session today: finance debate expected to dominate proceedings',
  'Bihar monsoon readiness plan announced with district-level dashboards',
  'India tech exports cross new milestone as AI demand rises globally',
  'Global markets watch US jobs data and energy prices this week',
  'Breaking: Sports ministry confirms new grassroots funding framework'
];

const weatherByLang = {
  en: 'Patna 28 C, Haze',
  hi: 'पटना 28 C, धुंध',
  mai: 'पटना 28 C, धुंध'
};

function readPanelData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHttpUrl(url) {
  try {
    const u = new URL(String(url || ''), window.location.origin);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch (_) {
    return '';
  }
  return '';
}

function ytToEmbed(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const short = url.match(/youtu\.be\/([^?&]+)/i);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const normal = url.match(/[?&]v=([^&]+)/i);
  if (normal) return `https://www.youtube.com/embed/${normal[1]}`;
  const live = url.match(/youtube\.com\/live\/([^?&]+)/i);
  if (live) return `https://www.youtube.com/embed/${live[1]}`;
  return url;
}

function normalize(path) {
  let p = path.replace(/index\.html$/i, '');
  if (!p.endsWith('/')) p += '/';
  return p;
}

function initLayout() {
  const path = normalize(window.location.pathname);
  const primaryLinks = routes
    .slice(0, 9)
    .map(([label, href]) => `<a href="${href}" class="${path === href ? 'active' : ''}">${label}</a>`)
    .join('');
  const utilityLinks = routes
    .slice(9)
    .map(([label, href]) => `<a href="${href}" class="${path === href ? 'active' : ''}">${label}</a>`)
    .join('');
  const categoryMega = routes
    .filter(([, href]) => ['/politics/', '/india/', '/bihar/', '/world/', '/business/', '/technology/', '/sports/', '/entertainment/', '/lifestyle/'].includes(href))
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join('');

  const shell = document.getElementById('site-shell');
  if (!shell) return;

  shell.innerHTML = `
    <div class="site-top">
      <div class="container top-wrap">
        <div class="top-meta">
          <span class="pill pill-live">LIVE UPDATES</span>
          <span id="dateDisplay"></span>
          <span id="weatherWidget">${weatherByLang.en}</span>
        </div>
        <div class="marquee-list">
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="X">X</a>
          <a href="#" aria-label="YouTube">YouTube</a>
          <a href="#" aria-label="Instagram">Instagram</a>
        </div>
      </div>
    </div>
    <header class="site-header">
      <div class="container header-wrap">
        <button class="nav-toggle" aria-expanded="false" aria-controls="mainNav">Menu</button>
        <a class="brand" href="/home/">Maithili <span>News</span></a>
        <nav id="mainNav" class="main-nav" aria-label="Primary">
          ${primaryLinks}
          <div class="mega-wrap">
            <button class="mega-toggle control-btn" id="megaToggle" type="button" aria-expanded="false" aria-controls="megaMenu">More</button>
            <div id="megaMenu" class="mega-menu" role="menu">
              <div>
                <strong class="kicker">Categories</strong>
                <div class="mega-links">${categoryMega}</div>
              </div>
              <div>
                <strong class="kicker">Platforms</strong>
                <div class="mega-links">
                  <a href="/videos/">Video News</a>
                  <a href="/live-tv/">Live TV</a>
                  <a href="/photos/">Photo Gallery</a>
                  <a href="/search/">Search</a>
                </div>
              </div>
            </div>
          </div>
          ${utilityLinks}
        </nav>
        <div class="controls">
          <select class="lang-select" id="languageSelect" aria-label="Language switcher">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mai">Maithili</option>
          </select>
          <button class="control-btn" id="themeToggle" aria-label="Toggle color theme">Theme</button>
        </div>
      </div>
    </header>
    <div class="breaking-bar" role="status" aria-live="polite">
      <div class="container breaking-wrap">
        <span class="breaking-label">BREAKING</span>
        <div class="ticker" id="ticker"></div>
      </div>
    </div>
  `;

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="ad-slot" style="margin-top:1rem;">Footer Ad Banner</div>
          <div class="footer-grid">
            <div>
              <h3 class="footer-title">Maithili News</h3>
              <p class="muted">Independent digital newsroom delivering fast and deep reporting from Bihar, India, and the world.</p>
            </div>
            <div>
              <h4 class="footer-title">Sections</h4>
              <ul class="footer-list">
                <li><a href="/politics/">Politics</a></li>
                <li><a href="/india/">India</a></li>
                <li><a href="/bihar/">Bihar</a></li>
                <li><a href="/world/">World</a></li>
                <li><a href="/business/">Business</a></li>
                <li><a href="/lifestyle/">Lifestyle</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-title">Company</h4>
              <ul class="footer-list">
                <li><a href="/about/">About</a></li>
                <li><a href="/contact/">Contact</a></li>
                <li><a href="/admin-login/">Admin Login</a></li>
                <li><a href="/admin-panel/">Admin Panel</a></li>
                <li><a href="/reporter-panel/">Reporter Panel</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-title">Products</h4>
              <ul class="footer-list">
                <li><a href="/videos/">Video News</a></li>
                <li><a href="/live-tv/">Live TV</a></li>
                <li><a href="/photos/">Photo Gallery</a></li>
                <li><a href="/search/">Search</a></li>
              </ul>
            </div>
          </div>
          <p class="muted" style="padding-bottom:1rem; margin:0;">Copyright ${new Date().getFullYear()} Maithili News. All rights reserved.</p>
        </div>
      </footer>
    `;
  }

  wireShell();
  applyFrontendControls(path);
  optimizeMediaAndLayout();
  wireArticleLinks(path);
  renderArticlePage(path);
}

function optimizeMediaAndLayout() {
  const imgs = [...document.querySelectorAll('img')];
  imgs.forEach((img, idx) => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', idx < 2 ? 'eager' : 'lazy');
    if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (!img.getAttribute('referrerpolicy')) img.setAttribute('referrerpolicy', 'no-referrer');
  });

  document.querySelectorAll('.card, .sidebar-widget, .surface').forEach((el) => {
    if (!el.style.contentVisibility) {
      el.style.contentVisibility = 'auto';
      el.style.containIntrinsicSize = '1px 400px';
    }
  });
}

function applyFrontendControls(path) {
  applyTickerControl();
  applyAdsControl();
  applyLiveTvControl(path);
  applyBusinessControl(path);
  applyClassifiedControl(path);
  applyENewspaperControl(path);
}

function applyTickerControl() {
  const bar = document.querySelector('.breaking-bar');
  const ticker = document.getElementById('ticker');
  if (!bar || !ticker) return;

  const breaking = readPanelData('maithili_breaking', { enabled: true, text: '', selectedNewsIds: [] });
  const news = readPanelData('maithili_news', []);
  const approved = news.filter((n) => n.status === 'approved');
  const picked = approved.filter((n) => (breaking.selectedNewsIds || []).includes(n.id)).map((n) => n.title);
  const selected = (picked.length ? picked : approved.slice(0, 4).map((n) => n.title)).filter(Boolean);
  const list = [];
  if (breaking.text) list.push(breaking.text);
  list.push(...selected);
  const base = list.length ? list : tickerItems;

  if (!breaking.enabled) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = '';
  ticker.innerHTML = [...base, ...base].map((x) => `<span>${x}</span>`).join('');
}

function applyAdsControl() {
  const ads = readPanelData('maithili_ads', { headerEnabled: true, headerImage: '', headerLink: '#', sidebarEnabled: true });
  const slots = [...document.querySelectorAll('.ad-slot')];
  slots.forEach((slot) => {
    const text = (slot.textContent || '').toLowerCase();
    const isSidebar = text.includes('sidebar');
    const isTop = text.includes('top') || text.includes('leaderboard') || text.includes('header');
    const isFooter = text.includes('footer');

    if ((isTop && !ads.headerEnabled) || (isSidebar && !ads.sidebarEnabled)) {
      slot.style.display = 'none';
      return;
    }
    slot.style.display = '';

    if (isTop && ads.headerImage) {
      const link = ads.headerLink || '#';
      slot.innerHTML = `<a href="${link}" target="_blank" rel="noopener"><img src="${ads.headerImage}" alt="Header Advertisement" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px;"></a>`;
    } else if (isFooter && ads.headerImage) {
      slot.innerHTML = `<a href="${ads.headerLink || '#'}" target="_blank" rel="noopener"><img src="${ads.headerImage}" alt="Footer Advertisement" style="width:100%;max-height:120px;object-fit:cover;border-radius:10px;"></a>`;
    }
  });
}

function applyLiveTvControl(path) {
  if (!path.startsWith('/live-tv/')) return;
  const live = readPanelData('maithili_live_tv', { enabled: true, streams: [] });
  const iframe = document.querySelector('.video-embed');
  if (!iframe) return;
  const onAir = document.querySelector('.surface .kicker');
  const primary = (live.streams || []).find((s) => s.isLive) || (live.streams || [])[0];

  if (!live.enabled) {
    iframe.replaceWith(Object.assign(document.createElement('div'), {
      className: 'ad-slot',
      textContent: 'Live TV is currently disabled by admin'
    }));
    return;
  }
  if (primary && primary.url) {
    iframe.src = ytToEmbed(primary.url);
    iframe.title = primary.title || 'Live TV stream';
    if (onAir) onAir.textContent = `On Air: ${primary.title || 'Live Stream'}`;
  }
}

function applyBusinessControl(path) {
  if (!path.startsWith('/business/')) return;
  const businesses = readPanelData('maithili_businesses', []).filter((b) => b.status === 'approved');
  if (!businesses.length) return;
  const main = document.querySelector('.split > div');
  if (!main) return;
  const old = document.querySelector('[data-business-directory]');
  old?.remove();
  const section = document.createElement('section');
  section.setAttribute('data-business-directory', '1');
  section.innerHTML = `
    <div class="section-title"><h2>Business Directory (Admin Managed)</h2></div>
    <div class="news-grid-2">
      ${businesses.slice(0, 8).map((b) => `
        <article class="card">
          <div class="card-content">
            <span class="kicker">${b.category || 'Business'}</span>
            <h3 class="headline-md">${b.name}</h3>
            <p class="muted">${b.city || ''}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
  main.insertBefore(section, main.children[2] || null);
}

function applyClassifiedControl(path) {
  if (!path.startsWith('/home/') && !path.startsWith('/business/')) return;
  const classifieds = readPanelData('maithili_classifieds', []).filter((c) => c.status === 'approved');
  if (!classifieds.length) return;
  const side = document.querySelector('.split aside') || document.querySelector('.grid');
  if (!side) return;
  const old = document.querySelector('[data-classified-widget]');
  old?.remove();
  const widget = document.createElement('div');
  widget.className = 'sidebar-widget';
  widget.setAttribute('data-classified-widget', '1');
  widget.innerHTML = `
    <h3 class="headline-md">Classifieds (Admin Managed)</h3>
    <ul class="list">
      ${classifieds.slice(0, 6).map((c) => `<li><strong>${c.title}</strong><br><span class="muted">${c.type || 'Listing'} • ${c.contact || ''}</span></li>`).join('')}
    </ul>
  `;
  side.prepend(widget);
}

function applyENewspaperControl(path) {
  if (!path.startsWith('/home/') && !path.startsWith('/about/') && !path.startsWith('/india/')) return;
  const papers = readPanelData('maithili_enewspapers', []);
  if (!papers.length) return;
  const side = document.querySelector('.split aside') || document.querySelector('.grid');
  if (!side) return;
  const latest = papers[0];
  const old = document.querySelector('[data-epaper-widget]');
  old?.remove();
  const widget = document.createElement('div');
  widget.className = 'sidebar-widget';
  widget.setAttribute('data-epaper-widget', '1');
  widget.innerHTML = `
    <h3 class="headline-md">E-Newspaper</h3>
    <p class="muted">${latest.title || 'Latest Edition'} (${latest.editionDate || 'N/A'})</p>
    <a class="control-btn" href="${latest.pdfUrl}" target="_blank" rel="noopener">Open PDF</a>
  `;
  side.prepend(widget);
}

function storeStaticArticle(payload) {
  const all = readPanelData('maithili_static_articles', []);
  const exists = all.find((x) => x.id === payload.id || (x.title === payload.title && x.mainImage === payload.mainImage));
  if (!exists) {
    all.unshift(payload);
    localStorage.setItem('maithili_static_articles', JSON.stringify(all.slice(0, 80)));
  }
}

function firstText(el, selector) {
  return el.querySelector(selector)?.textContent?.trim() || '';
}

function wireArticleLinks(path) {
  if (path.startsWith('/admin-panel/') || path.startsWith('/reporter-panel/') || path.startsWith('/article-page/')) return;
  const cards = [...document.querySelectorAll('.card, .hero-story')];
  cards.forEach((card, idx) => {
    const title = firstText(card, '.headline-md, .headline-lg, .headline-xl, h3, h2') || card.textContent.trim().slice(0, 120);
    if (!title) return;
    const existing = card.getAttribute('data-news-id');
    const id = existing || `auto_${btoa(unescape(encodeURIComponent(`${title}_${idx}`))).replace(/=+$/g, '')}`;
    card.setAttribute('data-news-id', id);
    card.style.cursor = 'pointer';
    const img = card.querySelector('img');
    const summary = firstText(card, '.muted, p');
    const payload = {
      id,
      title,
      category: firstText(card, '.kicker') || 'News',
      author: 'Maithili Desk',
      mainImage: img?.getAttribute('src') || '',
      shortDescription: summary,
      content: summary || 'Detailed article will be updated by editorial desk.',
      createdAt: new Date().toLocaleString('en-IN')
    };
    storeStaticArticle(payload);
    if (!card.dataset.boundOpenArticle) {
      card.dataset.boundOpenArticle = '1';
      card.addEventListener('click', () => {
        window.location.href = `/article-page/?id=${encodeURIComponent(id)}`;
      });
    }
  });
}

function renderArticlePage(path) {
  if (!path.startsWith('/article-page/')) return;
  const root = document.getElementById('articlePageRoot');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const managed = readPanelData('maithili_news', []);
  const staticArticles = readPanelData('maithili_static_articles', []);
  const all = [...managed, ...staticArticles];
  const current = (id && all.find((x) => x.id === id)) || managed.find((x) => x.status === 'approved') || staticArticles[0] || all[0] || {
    id: 'fallback',
    title: 'Article Not Found',
    category: 'News',
    author: 'Desk',
    content: 'This article is not available yet.',
    createdAt: new Date().toLocaleString('en-IN')
  };

  const related = all.filter((x) => x.id !== current.id).slice(0, 5);
  const videoEmbed = safeHttpUrl(ytToEmbed(current.videoUrl || current.video_url || ''));
  const tags = Array.isArray(current.tags) ? current.tags : String(current.tags || '').split(',').map((x) => x.trim()).filter(Boolean);
  const htmlParagraphs = String(current.content || current.fullContent || current.shortDescription || '')
    .split('\n')
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const safeTitle = escapeHtml(current.title || 'Untitled');
  const safeAuthor = escapeHtml(current.author || 'Maithili Desk');
  const safeCreatedAt = escapeHtml(current.createdAt || new Date().toLocaleString('en-IN'));
  const safeCategory = escapeHtml(current.category || 'News');
  const safeShortDescription = escapeHtml(current.shortDescription || '');
  const safeMainImage = safeHttpUrl(current.mainImage || current.thumbnail || '');
  const safeSecondImage = safeHttpUrl(current.secondImage || '');

  root.innerHTML = `
    <section class="article-layout" style="margin-top:1rem;">
      <aside class="sticky-share" aria-label="Share article">
        <button class="share-btn" type="button">X</button>
        <button class="share-btn" type="button">f</button>
        <button class="share-btn" type="button">wa</button>
        <button class="share-btn" type="button">lnk</button>
      </aside>
      <article class="surface article-body">
        <a href="/home/" class="kicker" style="text-decoration:none;">Back to Home</a>
        <h1 class="headline-xl" style="margin-top:0.8rem;">${safeTitle}</h1>
        <div class="article-meta">
          <span>Written by ${safeAuthor}</span>
          <span>${safeCreatedAt}</span>
          <span>${safeCategory}</span>
        </div>
        ${(videoEmbed ? `<iframe class="video-embed" style="margin:1rem 0;" src="${videoEmbed}" title="${safeTitle}" allowfullscreen></iframe>` : '')}
        ${(!videoEmbed && safeMainImage ? `<img src="${safeMainImage}" alt="${safeTitle}" style="margin:1rem 0;" />` : '')}
        ${(safeShortDescription ? `<blockquote style="margin:0.8rem 0; padding:0.8rem 1rem; border-left:4px solid #dc2626; background:#f8fafc; border-radius:10px;"><strong>${safeShortDescription}</strong></blockquote>` : '')}
        ${htmlParagraphs || '<p>No detailed content available.</p>'}
        ${(safeSecondImage ? `<img src="${safeSecondImage}" alt="Related visual" style="margin:1rem 0;" />` : '')}
        ${(tags.length ? `<div>${tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>` : '')}
      </article>
      <aside class="grid">
        <div class="sidebar-widget">
          <h3 class="headline-md">Related Stories</h3>
          <ul class="list">
            ${related.map((r) => `<li><a href="/article-page/?id=${encodeURIComponent(r.id)}">${escapeHtml(r.title)}</a></li>`).join('') || '<li>No related stories</li>'}
          </ul>
        </div>
        <div class="ad-slot">Sidebar Ad</div>
      </aside>
    </section>
  `;
}

function wireShell() {
  const toggle = document.getElementById('themeToggle');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainNav');
  const ticker = document.getElementById('ticker');
  const lang = document.getElementById('languageSelect');
  const weather = document.getElementById('weatherWidget');
  const dateDisplay = document.getElementById('dateDisplay');
  const megaToggle = document.getElementById('megaToggle');
  const megaMenu = document.getElementById('megaMenu');

  const current = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', current);

  toggle?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  navToggle?.addEventListener('click', () => {
    nav?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(nav?.classList.contains('open')));
  });

  megaToggle?.addEventListener('click', () => {
    megaMenu?.classList.toggle('open');
    megaToggle.setAttribute('aria-expanded', String(megaMenu?.classList.contains('open')));
  });

  if (ticker) {
    const joined = [...tickerItems, ...tickerItems].map((x) => `<span>${x}</span>`).join('');
    ticker.innerHTML = joined;
  }

  const savedLang = localStorage.getItem('lang') || 'en';
  if (lang) {
    lang.value = savedLang;
    weather.textContent = weatherByLang[savedLang];
    lang.addEventListener('change', () => {
      localStorage.setItem('lang', lang.value);
      weather.textContent = weatherByLang[lang.value];
    });
  }

  if (dateDisplay) {
    dateDisplay.textContent = new Intl.DateTimeFormat('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date());
  }

  initLightbox();
}

function initLightbox() {
  const box = document.querySelector('.lightbox');
  if (!box) return;
  const boxImg = box.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach((img) => {
    img.addEventListener('click', () => {
      box.style.display = 'flex';
      boxImg.src = img.src;
      boxImg.alt = img.alt;
    });
  });
  box.addEventListener('click', () => {
    box.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', initLayout);
