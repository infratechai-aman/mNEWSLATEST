(function () {
  async function read(key, fallback) {
    if (typeof window.dbRead === 'function') return await window.dbRead(key, fallback);
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }

  async function write(key, value) {
    if (typeof window.dbWrite === 'function') { await window.dbWrite(key, value); return; }
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function nowDate() {
    return new Date().toLocaleString("en-IN");
  }

  async function seed() {
    if (!await read("maithili_news")) {
      await write("maithili_news", [
        { id: uid("news"), title: "Patna civic works review begins", category: "Bihar", status: "approved", author: "Desk", featured: false, createdAt: nowDate() },
        { id: uid("news"), title: "Education budget hearing starts", category: "India", status: "pending", author: "Desk", featured: false, createdAt: nowDate() }
      ]);
    }
    if (!await read("maithili_ads")) await write("maithili_ads", {
      headerEnabled: true, headerSlides: [
        { image: "https://picsum.photos/seed/ad1/1200/200", link: "https://example.com/ad1" },
        { image: "https://picsum.photos/seed/ad2/1200/200", link: "https://example.com/ad2" },
        { image: "https://picsum.photos/seed/ad3/1200/200", link: "https://example.com/ad3" },
        { image: "https://picsum.photos/seed/ad4/1200/200", link: "https://example.com/ad4" }
      ], sidebarEnabled: true, sidebarImage: "", sidebarLink: "#", sidebar2Enabled: true, sidebar2Image: "", sidebar2Link: "#", footerEnabled: true, footerImage: "", footerLink: "#"
    });
    if (!await read("maithili_breaking")) await write("maithili_breaking", { enabled: true, text: "", selectedNewsIds: [] });
    if (!await read("maithili_businesses")) await write("maithili_businesses", []);
    if (!await read("maithili_classifieds")) await write("maithili_classifieds", []);
    if (!await read("maithili_reporters")) {
      await write("maithili_reporters", [
        { id: uid("rep"), name: "Aman Reporter", email: "aman@maithili.news", password: "reporter123", status: "active", joinedAt: nowDate() }
      ]);
    }
    if (!await read("maithili_reporter_apps")) await write("maithili_reporter_apps", []);
    if (!await read("maithili_enewspapers")) await write("maithili_enewspapers", []);
    if (!await read("maithili_live_tv")) await write("maithili_live_tv", { enabled: true, streams: [] });
    if (!await read("maithili_admin_users")) {
      await write("maithili_admin_users", [
        { email: "admin@maithili.news", password: "admin123", role: "admin" }
      ]);
    }
  }

  function setTab(container, tabId) {
    container.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tabBtn === tabId);
    });
    container.querySelectorAll("[data-tab]").forEach((sec) => {
      sec.classList.toggle("panel-hidden", sec.dataset.tab !== tabId);
    });
  }

  async function adminInit(root) {
    await seed();
    const loginView = root.querySelector("#adminLoginView");
    const dashView = root.querySelector("#adminDashView");
    const err = root.querySelector("#adminError");

    async function showDashboard() {
      loginView.classList.add("panel-hidden");
      dashView.classList.remove("panel-hidden");
      await renderAdmin();
    }

    function showLogin() {
      dashView.classList.add("panel-hidden");
      loginView.classList.remove("panel-hidden");
    }

    const session = await read("maithili_admin_session");
    if (session && session.role === "admin") await showDashboard();

    root.querySelector("#adminLoginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      err.classList.add("panel-hidden");
      const email = root.querySelector("#adminEmail").value.trim();
      const pass = root.querySelector("#adminPassword").value.trim();
      if (!email || !pass) {
        err.textContent = "Email and password required.";
        err.classList.remove("panel-hidden");
        return;
      }
      const admins = await read("maithili_admin_users", []);
      const valid = admins.find((a) => String(a.email || '').toLowerCase() === email.toLowerCase() && a.password === pass);
      if (!valid) {
        err.textContent = "Invalid admin credentials.";
        err.classList.remove("panel-hidden");
        return;
      }
      await write("maithili_admin_session", { role: "admin", email, at: Date.now() });
      await showDashboard();
    });

    root.querySelector("#adminLogout").addEventListener("click", async () => {
      localStorage.removeItem("maithili_admin_session");
      showLogin();
    });
    root.querySelector("#adminRefresh")?.addEventListener("click", async () => window.location.reload());

    root.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.addEventListener("click", async () => setTab(root, btn.dataset.tabBtn));
    });

    async function renderAdmin() {
      const news = await read("maithili_news", []);
      const ads = await read("maithili_ads", {});
      const breaking = await read("maithili_breaking", {});
      const businesses = await read("maithili_businesses", []);
      const classifieds = await read("maithili_classifieds", []);
      const reporters = await read("maithili_reporters", []);
      const reporterApps = await read("maithili_reporter_apps", []);
      const papers = await read("maithili_enewspapers", []);
      const liveTv = await read("maithili_live_tv", { enabled: true, streams: [] });

      root.querySelector("#statPendingNews").textContent = String(news.filter((n) => n.status === "pending").length);
      root.querySelector("#statPendingReporters").textContent = String(reporterApps.length);
      root.querySelector("#statPendingAds").textContent = String(ads.headerEnabled ? 1 : 0);
      root.querySelector("#statPendingItems").textContent = String(news.filter((n) => n.status === "pending").length + reporterApps.length);

      const newsList = root.querySelector("#newsList");
      newsList.innerHTML = news.map((n) => `
        <li>
          <div class="panel-row" style="justify-content:space-between;">
            <div>
              <strong>${n.title}</strong>
              <div class="panel-item-meta">${n.category}${n.city ? ` (${n.city})` : ''} | ${n.author} | ${n.createdAt}</div>
            </div>
            <div>
              <span class="panel-badge ${n.status === "approved" ? "badge-approved" : "badge-pending"}">${n.status}</span>
              ${n.featured ? '<span class="panel-badge badge-live">featured</span>' : ""}
            </div>
          </div>
          <div class="panel-row" style="margin-top:0.5rem;">
            <button class="panel-btn green" data-action="approveNews" data-id="${n.id}">Approve</button>
            <button class="panel-btn red" data-action="rejectNews" data-id="${n.id}">Reject</button>
            <button class="panel-btn slate" data-action="toggleFeature" data-id="${n.id}">Toggle Featured</button>
          </div>
        </li>
      `).join("") || "<li>No news yet.</li>";

      root.querySelector("#breakingEnabled").checked = !!breaking.enabled;
      root.querySelector("#breakingText").value = breaking.text || "";
      const approvedNews = news.filter((n) => n.status === "approved");
      root.querySelector("#breakingNewsPick").innerHTML = approvedNews.map((n) => `
        <label class="panel-row">
          <input type="checkbox" data-break-id="${n.id}" ${breaking.selectedNewsIds?.includes(n.id) ? "checked" : ""} />
          <span>${n.title}</span>
        </label>
      `).join("") || "<p class='panel-item-meta'>No approved news available.</p>";

      root.querySelector("#adHeaderEnabled").checked = !!ads.headerEnabled;
      const slides = ads.headerSlides || [];
      for (let i = 1; i <= 4; i++) {
        const s = slides[i - 1] || {};
        const imgEl = root.querySelector(`#adSlide${i}Image`);
        const linkEl = root.querySelector(`#adSlide${i}Link`);
        if (imgEl) imgEl.value = s.image || "";
        if (linkEl) linkEl.value = s.link || "#";
      }
      root.querySelector("#adSidebarEnabled").checked = !!ads.sidebarEnabled;
      root.querySelector("#adSidebarImage").value = ads.sidebarImage || "";
      root.querySelector("#adSidebarLink").value = ads.sidebarLink || "#";
      root.querySelector("#adSidebar2Enabled").checked = !!ads.sidebar2Enabled;
      root.querySelector("#adSidebar2Image").value = ads.sidebar2Image || "";
      root.querySelector("#adSidebar2Link").value = ads.sidebar2Link || "#";
      root.querySelector("#adFooterEnabled").checked = !!ads.footerEnabled;
      root.querySelector("#adFooterImage").value = ads.footerImage || "";
      root.querySelector("#adFooterLink").value = ads.footerLink || "#";

      root.querySelector("#businessList").innerHTML = businesses.map((b) => `
        <li>
          <strong>${b.name}</strong>
          <div class="panel-item-meta">${b.category} | ${b.city} | ${b.status}</div>
          <div class="panel-row" style="margin-top:0.5rem;">
            <button class="panel-btn green" data-action="approveBusiness" data-id="${b.id}">Approve</button>
            <button class="panel-btn red" data-action="deleteBusiness" data-id="${b.id}">Delete</button>
          </div>
        </li>
      `).join("") || "<li>No business listings.</li>";

      root.querySelector("#classifiedList").innerHTML = classifieds.map((c) => `
        <li>
          <strong>${c.title}</strong>
          <div class="panel-item-meta">${c.type} | ${c.contact} | ${c.status}</div>
          <div class="panel-row" style="margin-top:0.5rem;">
            <button class="panel-btn green" data-action="approveClassified" data-id="${c.id}">Approve</button>
            <button class="panel-btn red" data-action="deleteClassified" data-id="${c.id}">Delete</button>
          </div>
        </li>
      `).join("") || "<li>No classifieds.</li>";

      root.querySelector("#reporterApps").innerHTML = reporterApps.map((a) => `
        <li>
          <strong>${a.name}</strong>
          <div class="panel-item-meta">${a.email} | ${a.phone || "-"} | requested ${a.createdAt}</div>
          <div class="panel-row" style="margin-top:0.5rem;">
            <button class="panel-btn green" data-action="approveReporterApp" data-id="${a.id}">Approve</button>
            <button class="panel-btn red" data-action="rejectReporterApp" data-id="${a.id}">Reject</button>
          </div>
        </li>
      `).join("") || "<li>No pending reporter applications.</li>";

      root.querySelector("#reporterList").innerHTML = reporters.map((r) => `
        <li>
          <strong>${r.name}</strong>
          <div class="panel-item-meta">${r.email} | ${r.status} | joined ${r.joinedAt}</div>
        </li>
      `).join("") || "<li>No reporter accounts.</li>";

      root.querySelector("#paperList").innerHTML = papers.map((p) => `
        <li>
          <strong>${p.title}</strong>
          <div class="panel-item-meta">${p.editionDate} | <a href="${p.pdfUrl}" target="_blank" rel="noopener">View PDF</a></div>
        </li>
      `).join("") || "<li>No e-newspapers uploaded.</li>";

      root.querySelector("#liveEnabled").checked = !!liveTv.enabled;
      root.querySelector("#liveList").innerHTML = (liveTv.streams || []).map((s) => `
        <li>
          <strong>${s.title}</strong>
          <div class="panel-item-meta">${s.url}</div>
          <div class="panel-row" style="margin-top:0.5rem;">
            ${s.isLive ? '<span class="panel-badge badge-live">LIVE</span>' : ""}
            <button class="panel-btn red" data-action="deleteLive" data-id="${s.id}">Delete</button>
          </div>
        </li>
      `).join("") || "<li>No streams added.</li>";
    }

    root.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      let news = await read("maithili_news", []);
      let businesses = await read("maithili_businesses", []);
      let classifieds = await read("maithili_classifieds", []);
      let apps = await read("maithili_reporter_apps", []);
      let reps = await read("maithili_reporters", []);
      let live = await read("maithili_live_tv", { enabled: true, streams: [] });

      if (action === "approveNews") news = news.map((n) => n.id === id ? { ...n, status: "approved" } : n);
      if (action === "rejectNews") news = news.map((n) => n.id === id ? { ...n, status: "rejected" } : n);
      if (action === "toggleFeature") news = news.map((n) => n.id === id ? { ...n, featured: !n.featured } : n);
      if (action === "approveBusiness") businesses = businesses.map((b) => b.id === id ? { ...b, status: "approved" } : b);
      if (action === "deleteBusiness") businesses = businesses.filter((b) => b.id !== id);
      if (action === "approveClassified") classifieds = classifieds.map((c) => c.id === id ? { ...c, status: "approved" } : c);
      if (action === "deleteClassified") classifieds = classifieds.filter((c) => c.id !== id);
      if (action === "approveReporterApp") {
        const app = apps.find((a) => a.id === id);
        if (app) reps.push({ id: uid("rep"), name: app.name, email: app.email, password: app.password || "reporter123", status: "active", joinedAt: nowDate() });
        apps = apps.filter((a) => a.id !== id);
      }
      if (action === "rejectReporterApp") apps = apps.filter((a) => a.id !== id);
      if (action === "deleteLive") live.streams = live.streams.filter((s) => s.id !== id);

      await write("maithili_news", news);
      await write("maithili_businesses", businesses);
      await write("maithili_classifieds", classifieds);
      await write("maithili_reporter_apps", apps);
      await write("maithili_reporters", reps);
      await write("maithili_live_tv", live);
      await renderAdmin();
    });

    root.querySelector("#newsForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = root.querySelector("#newsTitle").value.trim();
      const c = root.querySelector("#newsCategory").value.trim() || "General";
      if (!t) return;
      const news = await read("maithili_news", []);
      news.unshift({ id: uid("news"), title: t, category: c, status: "pending", author: "Admin", featured: false, createdAt: nowDate() });
      await write("maithili_news", news);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#breakingSave").addEventListener("click", async () => {
      const picks = [...root.querySelectorAll("[data-break-id]:checked")].map((x) => x.dataset.breakId);
      await write("maithili_breaking", {
        enabled: root.querySelector("#breakingEnabled").checked,
        text: root.querySelector("#breakingText").value.trim(),
        selectedNewsIds: picks
      });
      await renderAdmin();
    });

    root.querySelector("#adsSave").addEventListener("click", async () => {
      const headerSlides = [];
      for (let i = 1; i <= 4; i++) {
        const img = (root.querySelector(`#adSlide${i}Image`)?.value || "").trim();
        const lnk = (root.querySelector(`#adSlide${i}Link`)?.value || "#").trim();
        headerSlides.push({ image: img, link: lnk });
      }
      await write("maithili_ads", {
        headerEnabled: root.querySelector("#adHeaderEnabled").checked,
        headerSlides,
        sidebarEnabled: root.querySelector("#adSidebarEnabled").checked,
        sidebarImage: root.querySelector("#adSidebarImage").value.trim(),
        sidebarLink: root.querySelector("#adSidebarLink").value.trim(),
        sidebar2Enabled: root.querySelector("#adSidebar2Enabled").checked,
        sidebar2Image: root.querySelector("#adSidebar2Image").value.trim(),
        sidebar2Link: root.querySelector("#adSidebar2Link").value.trim(),
        footerEnabled: root.querySelector("#adFooterEnabled").checked,
        footerImage: root.querySelector("#adFooterImage").value.trim(),
        footerLink: root.querySelector("#adFooterLink").value.trim()
      });
      await renderAdmin();
    });

    root.querySelector("#businessForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const list = await read("maithili_businesses", []);
      list.unshift({
        id: uid("biz"),
        name: root.querySelector("#bizName").value.trim(),
        category: root.querySelector("#bizCategory").value.trim(),
        city: root.querySelector("#bizCity").value.trim(),
        status: "pending"
      });
      await write("maithili_businesses", list);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#classifiedForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const list = await read("maithili_classifieds", []);
      list.unshift({
        id: uid("cls"),
        title: root.querySelector("#clsTitle").value.trim(),
        type: root.querySelector("#clsType").value.trim(),
        contact: root.querySelector("#clsContact").value.trim(),
        status: "pending"
      });
      await write("maithili_classifieds", list);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#createReporterForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const reps = await read("maithili_reporters", []);
      reps.unshift({
        id: uid("rep"),
        name: root.querySelector("#repName").value.trim(),
        email: root.querySelector("#repEmail").value.trim(),
        password: root.querySelector("#repPassword").value.trim() || "reporter123",
        status: "active",
        joinedAt: nowDate()
      });
      await write("maithili_reporters", reps);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#paperForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const list = await read("maithili_enewspapers", []);
      list.unshift({
        id: uid("paper"),
        title: root.querySelector("#paperTitle").value.trim(),
        editionDate: root.querySelector("#paperDate").value,
        pdfUrl: root.querySelector("#paperUrl").value.trim()
      });
      await write("maithili_enewspapers", list);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#liveForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const live = await read("maithili_live_tv", { enabled: true, streams: [] });
      live.enabled = root.querySelector("#liveEnabled").checked;
      live.streams.unshift({
        id: uid("live"),
        title: root.querySelector("#liveTitle").value.trim(),
        url: root.querySelector("#liveUrl").value.trim(),
        isLive: root.querySelector("#liveMark").checked
      });
      await write("maithili_live_tv", live);
      e.target.reset();
      await renderAdmin();
    });

    root.querySelector("#saveLiveToggle").addEventListener("click", async () => {
      const live = await read("maithili_live_tv", { enabled: true, streams: [] });
      live.enabled = root.querySelector("#liveEnabled").checked;
      await write("maithili_live_tv", live);
      await renderAdmin();
    });

    root.querySelector("#clearAllData").addEventListener("click", async () => {
      [
        "maithili_news", "maithili_ads", "maithili_breaking", "maithili_businesses", "maithili_classifieds",
        "maithili_reporters", "maithili_reporter_apps", "maithili_enewspapers", "maithili_live_tv"
      ].forEach((k) => localStorage.removeItem(k));
      await seed();
      await renderAdmin();
    });
  }

  async function reporterInit(root) {
    await seed();
    const loginView = root.querySelector("#reporterLoginView");
    const dashView = root.querySelector("#reporterDashView");
    const err = root.querySelector("#reporterError");

    async function showDash() {
      loginView.classList.add("panel-hidden");
      dashView.classList.remove("panel-hidden");
      await renderReporter();
    }

    function showLogin() {
      dashView.classList.add("panel-hidden");
      loginView.classList.remove("panel-hidden");
    }

    const session = await read("maithili_reporter_session");
    if (session && session.role === "reporter") await showDash();

    root.querySelector("#reporterLoginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      err.classList.add("panel-hidden");
      const email = root.querySelector("#reporterEmail").value.trim();
      const pass = root.querySelector("#reporterPassword").value.trim();
      const reps = await read("maithili_reporters", []);
      const found = reps.find((r) => r.email.toLowerCase() === email.toLowerCase() && r.password === pass);
      if (!found) {
        err.textContent = "Invalid reporter credentials.";
        err.classList.remove("panel-hidden");
        return;
      }
      await write("maithili_reporter_session", { role: "reporter", email: found.email, name: found.name });
      await showDash();
    });

    root.querySelector("#applyReporterForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const apps = await read("maithili_reporter_apps", []);
      apps.unshift({
        id: uid("app"),
        name: root.querySelector("#applyName").value.trim(),
        email: root.querySelector("#applyEmail").value.trim(),
        password: root.querySelector("#applyPassword").value.trim(),
        phone: root.querySelector("#applyPhone").value.trim(),
        createdAt: nowDate()
      });
      await write("maithili_reporter_apps", apps);
      e.target.reset();
      err.textContent = "Application submitted. Wait for admin approval.";
      err.classList.remove("panel-hidden");
    });

    root.querySelector("#reporterLogout").addEventListener("click", async () => {
      localStorage.removeItem("maithili_reporter_session");
      showLogin();
    });
    root.querySelector("#reporterRefresh")?.addEventListener("click", async () => window.location.reload());

    root.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.addEventListener("click", async () => setTab(root, btn.dataset.tabBtn));
    });

    async function renderReporter() {
      const sessionData = await read("maithili_reporter_session", {});
      const reporterName = sessionData.name || "Reporter";
      root.querySelector("#reporterWelcome").textContent = `Welcome, ${reporterName}`;
      const news = await read("maithili_news", []).filter((n) =>
        n.ownerEmail === sessionData.email ||
        n.author === reporterName ||
        n.author === sessionData.email ||
        n.author === "Reporter"
      );
      root.querySelector("#myNewsCount").textContent = String(news.length);
      root.querySelector("#myPendingCount").textContent = String(news.filter((n) => n.status === "pending").length);
      root.querySelector("#myPublishedCount").textContent = String(news.filter((n) => n.status === "approved").length);
      root.querySelector("#myNewsList").innerHTML = news.map((n) => `
        <li>
          <strong>${n.title}</strong>${n.showOnHome ? ' <span class="panel-badge badge-live">home</span>' : ''}
          <div class="panel-item-meta">${n.category}${n.city ? ` (${n.city})` : ''} | ${n.status} | ${n.createdAt}</div>
          <div class="panel-row" style="margin-top:0.4rem;">
            <a class="panel-btn slate" href="/article-page/?id=${encodeURIComponent(n.id)}">Open Article</a>
          </div>
        </li>
      `).join("") || "<li>No submissions yet.</li>";
    }

    root.querySelector("#reporterNewsForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const sessionData = await read("maithili_reporter_session", {});
      const title = root.querySelector("#rNewsTitle").value.trim();
      const category = root.querySelector("#rNewsCategory").value.trim();
      const content = root.querySelector("#rNewsContent").value.trim();
      if (!title || !category || !content) return;
      const list = await read("maithili_news", []);
      list.unshift({
        id: uid("news"),
        title,
        category,
        city: root.querySelector("#rNewsCity").value.trim(),
        mainImage: root.querySelector("#rNewsMainImage").value.trim(),
        secondImage: root.querySelector("#rNewsSecondImage").value.trim(),
        videoUrl: root.querySelector("#rNewsVideoUrl").value.trim(),
        thumbnail: root.querySelector("#rNewsThumb").value.trim(),
        shortDescription: root.querySelector("#rNewsShort").value.trim(),
        content,
        tags: root.querySelector("#rNewsTags").value.trim().split(",").map((x) => x.trim()).filter(Boolean),
        status: "pending",
        author: root.querySelector("#rNewsAuthor").value.trim() || sessionData.name || sessionData.email || "Reporter",
        ownerEmail: sessionData.email || "",
        featured: root.querySelector("#rNewsFeatured").checked,
        showOnHome: root.querySelector("#rNewsShowHome").checked,
        createdAt: nowDate()
      });
      await write("maithili_news", list);
      e.target.reset();
      const showHome = root.querySelector("#rNewsShowHome");
      if (showHome) showHome.checked = true;
      await renderReporter();
    });

    root.querySelector("#reporterBreakingForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = root.querySelector("#rBreakingText").value.trim();
      if (!msg) return;
      const breaking = await read("maithili_breaking", { enabled: true, text: "", selectedNewsIds: [] });
      breaking.text = msg;
      await write("maithili_breaking", breaking);
      e.target.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.querySelector("[data-panel-app]");
    if (!root) return;
    const type = root.getAttribute("data-panel-app");
    if (type === "admin") await adminInit(root);
    if (type === "reporter") await reporterInit(root);
  });
})();
