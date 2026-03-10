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
  if (!url || !String(url).trim()) return '';
  try {
    const u = new URL(String(url).trim(), window.location.origin);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch (_) {
    return '';
  }
  return '';
}

function ytToEmbed(url) {
  if (!url) return '';
  let embedUrl = url;
  if (url.includes('/embed/')) {
    embedUrl = url;
  } else {
    const short = url.match(/youtu\.be\/([^?&]+)/i);
    if (short) embedUrl = `https://www.youtube.com/embed/${short[1]}`;
    else {
      const normal = url.match(/[?&]v=([^&]+)/i);
      if (normal) embedUrl = `https://www.youtube.com/embed/${normal[1]}`;
      else {
        const live = url.match(/youtube\.com\/live\/([^?&]+)/i);
        if (live) embedUrl = `https://www.youtube.com/embed/${live[1]}`;
      }
    }
  }

  if (embedUrl !== url || embedUrl.includes('/embed/')) {
    if (embedUrl.includes('?')) {
      if (!embedUrl.includes('autoplay=')) embedUrl += '&autoplay=1&mute=1';
    } else {
      embedUrl += '?autoplay=1&mute=1';
    }
  }
  return embedUrl;
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
        <div class="marquee-list social-icons">
          <a href="#" aria-label="Facebook" title="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" aria-label="X" title="X (Twitter)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="#" aria-label="YouTube" title="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
          <a href="#" aria-label="Instagram" title="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
        </div>
      </div>
    </div>
    <header class="site-header">
      <div class="container header-wrap">
        <button class="nav-toggle" aria-expanded="false" aria-controls="mainNav">Menu</button>
        <a class="brand" href="/home/"><img src="/assets/img/maithili_logo.png" alt="Maithili News Logo" style="height: 45px; width: auto; object-fit: contain; margin: 0; padding: 0;" /></a>
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
        <div id="ticker"><div class="ticker-track"></div></div>
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
  applyHeroCarousel(path);
  applyTickerControl();
  applyAdsControl();
  applyLatestUpdates(path);
  applyDynamicHomeSections(path);
  applySearchLogic(path);
  applyLiveTvControl(path);
  applyBusinessControl(path);
  applyClassifiedControl(path);
  applyENewspaperControl(path);
}

function applyHeroCarousel(path) {
  if (!path.startsWith('/home/')) return;
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!track || !dotsWrap) return;

  const news = readPanelData('maithili_news', []);
  const featured = news.filter((n) => n.status === 'approved' && n.featured);

  const fallbackSlides = [
    { title: 'Bihar and India policy shifts redraw development priorities across key sectors', category: 'Main Headline', shortDescription: 'Detailed coverage from Patna and New Delhi with live inputs from bureaus, agencies, and field reporters.', mainImage: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1200&auto=format&fit=crop' },
    { title: 'Parliament debate heats up over federal finance reforms', category: 'Politics', shortDescription: 'Opposition and treasury benches clash over implementation timelines.', mainImage: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=1200&auto=format&fit=crop' },
    { title: 'India infrastructure projects accelerate in tier-2 cities', category: 'India', shortDescription: 'New highway and rail corridors to impact regional growth patterns.', mainImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop' },
    { title: 'Tech sector watches AI regulations after policy consultation', category: 'Technology', shortDescription: 'Founders seek clarity on compliance and innovation safeguards.', mainImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop' }
  ];

  const slides = featured.length >= 2 ? featured : fallbackSlides;

  track.innerHTML = slides.map((s) => {
    const img = safeHttpUrl(s.mainImage || s.thumbnail || '') || 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1200&auto=format&fit=crop';
    const id = s.id ? `onclick="window.location.href='/article-page/?id=${encodeURIComponent(s.id)}'" style="cursor:pointer;"` : '';
    return `
      <article class="carousel-slide hero-story" ${id}>
        <img src="${img}" alt="${escapeHtml(s.title)}" />
        <div class="story-content">
          <span class="kicker">${escapeHtml(s.category || 'Featured')}</span>
          <h2 class="headline-xl">${escapeHtml(s.title)}</h2>
          <p class="muted">${escapeHtml(s.shortDescription || '')}</p>
        </div>
      </article>
    `;
  }).join('');

  dotsWrap.innerHTML = slides.map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('');

  let current = 0;
  const total = slides.length;

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
  dotsWrap.addEventListener('click', (e) => {
    if (e.target.dataset.slide !== undefined) { goTo(+e.target.dataset.slide); resetTimer(); }
  });

  let timer = setInterval(() => goTo(current + 1), 5000);
  function resetTimer() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5000); }
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
  const track = ticker.querySelector('.ticker-track');
  if (track) track.innerHTML = [...base, ...base].map((x) => `<span>${x}</span>`).join('');
}

function applyAdsControl() {
  const ads = readPanelData('maithili_ads', {
    headerEnabled: true, headerImage: '', headerLink: '#',
    sidebarEnabled: true, sidebarImage: '', sidebarLink: '#',
    sidebar2Enabled: true, sidebar2Image: '', sidebar2Link: '#',
    footerEnabled: true, footerImage: '', footerLink: '#'
  });
  const slots = [...document.querySelectorAll('.ad-slot')];
  slots.forEach((slot) => {
    const text = (slot.textContent || '').toLowerCase();
    const isTop = text.includes('top') || text.includes('leaderboard') || text.includes('header');
    const isSidebar300 = text.includes('300');
    const isSidebar = !isSidebar300 && text.includes('sidebar');
    const isFooter = text.includes('footer');

    // Determine which config applies
    let enabled, image, link;
    if (isTop) { enabled = ads.headerEnabled; image = ads.headerImage; link = ads.headerLink; }
    else if (isSidebar300) { enabled = ads.sidebar2Enabled; image = ads.sidebar2Image; link = ads.sidebar2Link; }
    else if (isSidebar) { enabled = ads.sidebarEnabled; image = ads.sidebarImage; link = ads.sidebarLink; }
    else if (isFooter) { enabled = ads.footerEnabled; image = ads.footerImage; link = ads.footerLink; }
    else return;

    if (!enabled) { slot.style.display = 'none'; return; }
    slot.style.display = '';

    if (image) {
      const maxH = isTop ? '140px' : isFooter ? '120px' : '250px';
      slot.innerHTML = `<a href="${link || '#'}" target="_blank" rel="noopener"><img src="${image}" alt="Advertisement" style="width:100%;max-height:${maxH};object-fit:cover;border-radius:10px;"></a>`;
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
  if (!path.startsWith('/business/') && !path.startsWith('/home/')) return;
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

function applyDynamicHomeSections(path) {
  if (!path.startsWith('/home/')) return;
  const news = readPanelData('maithili_news', []);
  const approved = news.filter((n) => n.status === 'approved').sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
  });

  // Top Stories (3 latest)
  const topStoriesGrid = document.querySelector('.news-grid-3');
  if (topStoriesGrid && approved.length >= 3) {
    topStoriesGrid.innerHTML = approved.slice(0, 3).map(n => `
      <article class="card" data-news-id="${n.id}" style="cursor:pointer;">
        <img src="${safeHttpUrl(n.mainImage || n.thumbnail) || 'https://images.unsplash.com/photo-1555848962-6e79363ec58f'}" alt="${escapeHtml(n.title)}" />
        <div class="card-content">
          <h3 class="headline-md">${escapeHtml(n.title)}</h3>
          <p class="muted">${escapeHtml(n.shortDescription || '')}</p>
        </div>
      </article>
    `).join('');
  }

  // Category Highlights (4 categories)
  const highlightsGrid = document.querySelector('.news-grid-4');
  if (highlightsGrid) {
    const categories = ['Politics', 'World', 'Business', 'Sports'];
    const highlighted = categories.map(cat => approved.find(n => n.category === cat) || approved.find(n => n.category?.toLowerCase() === cat.toLowerCase())).filter(Boolean);
    if (highlighted.length >= 2) {
      highlightsGrid.innerHTML = highlighted.map(n => `
        <article class="card" data-news-id="${n.id}" style="cursor:pointer;">
          <div class="card-content">
            <span class="kicker">${escapeHtml(n.category)}</span>
            <h3 class="headline-md">${escapeHtml(n.title)}</h3>
          </div>
        </article>
      `).join('');
    }
  }

  // Video News
  const videoGrid = document.querySelectorAll('.news-grid-3')[1];
  if (videoGrid) {
    const videos = approved.filter(n => n.videoUrl || n.video_url).slice(0, 3);
    if (videos.length) {
      videoGrid.innerHTML = videos.map(v => `
        <article class="card" data-news-id="${v.id}" data-video-url="${v.videoUrl || v.video_url}" style="cursor:pointer;">
          <img src="${safeHttpUrl(v.mainImage || v.thumbnail) || 'https://images.unsplash.com/photo-1495020689067-958852a7765e'}" alt="${escapeHtml(v.title)}" />
          <div class="card-content">
            <h3 class="headline-md">${escapeHtml(v.title)}</h3>
          </div>
        </article>
      `).join('');
    }
  }
}

function applySearchLogic(path) {
  if (!path.startsWith('/search/')) return;
  const form = document.querySelector('.search-bar');
  const input = form?.querySelector('input');
  const button = form?.querySelector('button');
  const resultsGrid = document.querySelector('.news-grid-2');
  if (!form || !resultsGrid) return;

  function doSearch(query) {
    if (!query.trim()) return;
    const news = readPanelData('maithili_news', []);
    const staticArticles = readPanelData('maithili_static_articles', []);
    const all = [...news, ...staticArticles];
    const results = all.filter(n =>
      (n.title?.toLowerCase().includes(query.toLowerCase())) ||
      (n.content?.toLowerCase().includes(query.toLowerCase())) ||
      (n.category?.toLowerCase().includes(query.toLowerCase()))
    );

    if (results.length) {
      resultsGrid.innerHTML = results.map(n => `
        <article class="card" data-news-id="${n.id}" style="cursor:pointer;">
          <div class="card-content">
            <span class="kicker">${escapeHtml(n.category || 'News')}</span>
            <h3 class="headline-md">${escapeHtml(n.title)}</h3>
            <p class="muted">Published ${n.createdAt || 'recently'}</p>
          </div>
        </article>
      `).join('');
      wireArticleLinks(path);
    } else {
      resultsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No results found for "' + safeHttpUrl(query) + '"</p>';
    }
  }

  button.addEventListener('click', () => doSearch(input.value));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    doSearch(input.value);
  });
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

function applyLatestUpdates(path) {
  if (!path.startsWith('/home/')) return;
  const side = document.querySelector('aside');
  if (!side) return;
  const widget = side.querySelector('.sidebar-widget');
  if (!widget || !widget.querySelector('h3').textContent.includes('Latest Updates')) return;

  const news = readPanelData('maithili_news', []);
  const approved = news.filter((n) => n.status === 'approved').sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
  });
  const latest = approved.slice(0, 6);

  if (latest.length) {
    const list = widget.querySelector('ul');
    if (list) {
      list.innerHTML = latest.map((n) => {
        const d = new Date(n.createdAt);
        const time = isNaN(d) ? 'Recent' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return `<li>${time}: <a href="/article-page/?id=${encodeURIComponent(n.id)}">${escapeHtml(n.title)}</a></li>`;
      }).join('');
    }
  }
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
      author: card.getAttribute('data-author') || 'Maithili Desk',
      mainImage: img?.getAttribute('src') || '',
      secondImage: card.getAttribute('data-second-image') || '',
      videoUrl: card.getAttribute('data-video-url') || '',
      shortDescription: summary,
      content: card.getAttribute('data-content') || summary || 'Detailed article will be updated by editorial desk.',
      createdAt: new Date().toISOString()
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
        ${(videoEmbed ? `<iframe class="video-embed" style="margin:1rem 0;" src="${videoEmbed}" title="${safeTitle}" allow="autoplay; fullscreen" allowfullscreen></iframe>` : '')}
        ${(!videoEmbed && safeMainImage ? `<img src="${safeMainImage}" alt="${safeTitle}" style="margin:1rem 0;" />` : '')}
        ${(safeShortDescription ? `<blockquote style="margin:0.8rem 0; padding:0.8rem 1rem; border-left:4px solid #dc2626; background:#f8fafc; border-radius:10px;"><strong>${safeShortDescription}</strong></blockquote>` : '')}
        ${htmlParagraphs || '<p>No detailed content available.</p>'}
        ${(safeSecondImage ? `<img src="${safeSecondImage}" alt="Related visual" style="margin:1rem 0;" />` : '')}

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
    const track = ticker.querySelector('.ticker-track');
    const joined = [...tickerItems, ...tickerItems].map((x) => `<span>${x}</span>`).join('');
    if (track) track.innerHTML = joined;
  }

  const savedLang = localStorage.getItem('lang') || 'en';
  if (lang) {
    lang.value = savedLang;
    weather.textContent = weatherByLang[savedLang] || weatherByLang['en'];
    lang.addEventListener('change', () => {
      localStorage.setItem('lang', lang.value);
      if (weather) weather.textContent = weatherByLang[lang.value] || weatherByLang['en'];

      const gtSelect = document.querySelector('.goog-te-combo');
      if (gtSelect) {
        gtSelect.value = lang.value;
        gtSelect.dispatchEvent(new Event('change'));
      }
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

function injectGoogleTranslate() {
  if (document.getElementById('google_translate_element')) return;
  const div = document.createElement('div');
  div.id = 'google_translate_element';
  div.style.display = 'none';
  document.body.appendChild(div);

  window.googleTranslateElementInit = function () {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,mai',
      autoDisplay: false
    }, 'google_translate_element');

    setTimeout(() => {
      const savedLang = localStorage.getItem('lang') || 'en';
      if (savedLang !== 'en') {
        const gtSelect = document.querySelector('.goog-te-combo');
        if (gtSelect) {
          gtSelect.value = savedLang;
          gtSelect.dispatchEvent(new Event('change'));
        }
      }
    }, 1000);
  };

  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  injectGoogleTranslate();
});
