(function () {
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function nowDate() {
    return new Date().toLocaleString("en-IN");
  }

  function seed() {
    if (!read("maithili_news")) {
      write("maithili_news", [
        { id: uid("news"), title: "Patna civic works review begins", category: "Bihar", status: "approved", author: "Desk", featured: false, createdAt: nowDate() },
        { id: uid("news"), title: "Education budget hearing starts", category: "India", status: "pending", author: "Desk", featured: false, createdAt: nowDate() }
      ]);
    }
    if (!read("maithili_ads")) write("maithili_ads", { headerEnabled: true, headerImage: "", headerLink: "#", sidebarEnabled: true });
    if (!read("maithili_breaking")) write("maithili_breaking", { enabled: true, text: "", selectedNewsIds: [] });
    if (!read("maithili_businesses")) write("maithili_businesses", []);
    if (!read("maithili_classifieds")) write("maithili_classifieds", []);
    if (!read("maithili_reporters")) {
      write("maithili_reporters", [
        { id: uid("rep"), name: "Aman Reporter", email: "aman@maithili.news", password: "reporter123", status: "active", joinedAt: nowDate() }
      ]);
    }
    if (!read("maithili_reporter_apps")) write("maithili_reporter_apps", []);
    if (!read("maithili_enewspapers")) write("maithili_enewspapers", []);
    if (!read("maithili_live_tv")) write("maithili_live_tv", { enabled: true, streams: [] });
    if (!read("maithili_admin_users")) {
      write("maithili_admin_users", [
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

  function adminInit(root) {
    seed();
    const loginView = root.querySelector("#adminLoginView");
    const dashView = root.querySelector("#adminDashView");
    const err = root.querySelector("#adminError");

    function showDashboard() {
      loginView.classList.add("panel-hidden");
      dashView.classList.remove("panel-hidden");
      renderAdmin();
    }

    function showLogin() {
      dashView.classList.add("panel-hidden");
      loginView.classList.remove("panel-hidden");
    }

    const session = read("maithili_admin_session");
    if (session && session.role === "admin") showDashboard();

    root.querySelector("#adminLoginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      err.classList.add("panel-hidden");
      const email = root.querySelector("#adminEmail").value.trim();
      const pass = root.querySelector("#adminPassword").value.trim();
      if (!email || !pass) {
        err.textContent = "Email and password required.";
        err.classList.remove("panel-hidden");
        return;
      }
      const admins = read("maithili_admin_users", []);
      const valid = admins.find((a) => String(a.email || '').toLowerCase() === email.toLowerCase() && a.password === pass);
      if (!valid) {
        err.textContent = "Invalid admin credentials.";
        err.classList.remove("panel-hidden");
        return;
      }
      write("maithili_admin_session", { role: "admin", email, at: Date.now() });
      showDashboard();
    });

    root.querySelector("#adminLogout").addEventListener("click", () => {
      localStorage.removeItem("maithili_admin_session");
      showLogin();
    });
    root.querySelector("#adminRefresh")?.addEventListener("click", () => window.location.reload());

    root.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setTab(root, btn.dataset.tabBtn));
    });

    function renderAdmin() {
      const news = read("maithili_news", []);
      const ads = read("maithili_ads", {});
      const breaking = read("maithili_breaking", {});
      const businesses = read("maithili_businesses", []);
      const classifieds = read("maithili_classifieds", []);
      const reporters = read("maithili_reporters", []);
      const reporterApps = read("maithili_reporter_apps", []);
      const papers = read("maithili_enewspapers", []);
      const liveTv = read("maithili_live_tv", { enabled: true, streams: [] });

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
      root.querySelector("#adHeaderImage").value = ads.headerImage || "";
      root.querySelector("#adHeaderLink").value = ads.headerLink || "#";
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

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      let news = read("maithili_news", []);
      let businesses = read("maithili_businesses", []);
      let classifieds = read("maithili_classifieds", []);
      let apps = read("maithili_reporter_apps", []);
      let reps = read("maithili_reporters", []);
      let live = read("maithili_live_tv", { enabled: true, streams: [] });

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

      write("maithili_news", news);
      write("maithili_businesses", businesses);
      write("maithili_classifieds", classifieds);
      write("maithili_reporter_apps", apps);
      write("maithili_reporters", reps);
      write("maithili_live_tv", live);
      renderAdmin();
    });

    root.querySelector("#newsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const t = root.querySelector("#newsTitle").value.trim();
      const c = root.querySelector("#newsCategory").value.trim() || "General";
      if (!t) return;
      const news = read("maithili_news", []);
      news.unshift({ id: uid("news"), title: t, category: c, status: "pending", author: "Admin", featured: false, createdAt: nowDate() });
      write("maithili_news", news);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#breakingSave").addEventListener("click", () => {
      const picks = [...root.querySelectorAll("[data-break-id]:checked")].map((x) => x.dataset.breakId);
      write("maithili_breaking", {
        enabled: root.querySelector("#breakingEnabled").checked,
        text: root.querySelector("#breakingText").value.trim(),
        selectedNewsIds: picks
      });
      renderAdmin();
    });

    root.querySelector("#adsSave").addEventListener("click", () => {
      write("maithili_ads", {
        headerEnabled: root.querySelector("#adHeaderEnabled").checked,
        headerImage: root.querySelector("#adHeaderImage").value.trim(),
        headerLink: root.querySelector("#adHeaderLink").value.trim(),
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
      renderAdmin();
    });

    root.querySelector("#businessForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const list = read("maithili_businesses", []);
      list.unshift({
        id: uid("biz"),
        name: root.querySelector("#bizName").value.trim(),
        category: root.querySelector("#bizCategory").value.trim(),
        city: root.querySelector("#bizCity").value.trim(),
        status: "pending"
      });
      write("maithili_businesses", list);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#classifiedForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const list = read("maithili_classifieds", []);
      list.unshift({
        id: uid("cls"),
        title: root.querySelector("#clsTitle").value.trim(),
        type: root.querySelector("#clsType").value.trim(),
        contact: root.querySelector("#clsContact").value.trim(),
        status: "pending"
      });
      write("maithili_classifieds", list);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#createReporterForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const reps = read("maithili_reporters", []);
      reps.unshift({
        id: uid("rep"),
        name: root.querySelector("#repName").value.trim(),
        email: root.querySelector("#repEmail").value.trim(),
        password: root.querySelector("#repPassword").value.trim() || "reporter123",
        status: "active",
        joinedAt: nowDate()
      });
      write("maithili_reporters", reps);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#paperForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const list = read("maithili_enewspapers", []);
      list.unshift({
        id: uid("paper"),
        title: root.querySelector("#paperTitle").value.trim(),
        editionDate: root.querySelector("#paperDate").value,
        pdfUrl: root.querySelector("#paperUrl").value.trim()
      });
      write("maithili_enewspapers", list);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#liveForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const live = read("maithili_live_tv", { enabled: true, streams: [] });
      live.enabled = root.querySelector("#liveEnabled").checked;
      live.streams.unshift({
        id: uid("live"),
        title: root.querySelector("#liveTitle").value.trim(),
        url: root.querySelector("#liveUrl").value.trim(),
        isLive: root.querySelector("#liveMark").checked
      });
      write("maithili_live_tv", live);
      e.target.reset();
      renderAdmin();
    });

    root.querySelector("#saveLiveToggle").addEventListener("click", () => {
      const live = read("maithili_live_tv", { enabled: true, streams: [] });
      live.enabled = root.querySelector("#liveEnabled").checked;
      write("maithili_live_tv", live);
      renderAdmin();
    });

    root.querySelector("#clearAllData").addEventListener("click", () => {
      [
        "maithili_news", "maithili_ads", "maithili_breaking", "maithili_businesses", "maithili_classifieds",
        "maithili_reporters", "maithili_reporter_apps", "maithili_enewspapers", "maithili_live_tv"
      ].forEach((k) => localStorage.removeItem(k));
      seed();
      renderAdmin();
    });
  }

  function reporterInit(root) {
    seed();
    const loginView = root.querySelector("#reporterLoginView");
    const dashView = root.querySelector("#reporterDashView");
    const err = root.querySelector("#reporterError");

    function showDash() {
      loginView.classList.add("panel-hidden");
      dashView.classList.remove("panel-hidden");
      renderReporter();
    }

    function showLogin() {
      dashView.classList.add("panel-hidden");
      loginView.classList.remove("panel-hidden");
    }

    const session = read("maithili_reporter_session");
    if (session && session.role === "reporter") showDash();

    root.querySelector("#reporterLoginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      err.classList.add("panel-hidden");
      const email = root.querySelector("#reporterEmail").value.trim();
      const pass = root.querySelector("#reporterPassword").value.trim();
      const reps = read("maithili_reporters", []);
      const found = reps.find((r) => r.email.toLowerCase() === email.toLowerCase() && r.password === pass);
      if (!found) {
        err.textContent = "Invalid reporter credentials.";
        err.classList.remove("panel-hidden");
        return;
      }
      write("maithili_reporter_session", { role: "reporter", email: found.email, name: found.name });
      showDash();
    });

    root.querySelector("#applyReporterForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const apps = read("maithili_reporter_apps", []);
      apps.unshift({
        id: uid("app"),
        name: root.querySelector("#applyName").value.trim(),
        email: root.querySelector("#applyEmail").value.trim(),
        password: root.querySelector("#applyPassword").value.trim(),
        phone: root.querySelector("#applyPhone").value.trim(),
        createdAt: nowDate()
      });
      write("maithili_reporter_apps", apps);
      e.target.reset();
      err.textContent = "Application submitted. Wait for admin approval.";
      err.classList.remove("panel-hidden");
    });

    root.querySelector("#reporterLogout").addEventListener("click", () => {
      localStorage.removeItem("maithili_reporter_session");
      showLogin();
    });
    root.querySelector("#reporterRefresh")?.addEventListener("click", () => window.location.reload());

    root.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setTab(root, btn.dataset.tabBtn));
    });

    function renderReporter() {
      const sessionData = read("maithili_reporter_session", {});
      const reporterName = sessionData.name || "Reporter";
      root.querySelector("#reporterWelcome").textContent = `Welcome, ${reporterName}`;
      const news = read("maithili_news", []).filter((n) =>
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

    root.querySelector("#reporterNewsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const sessionData = read("maithili_reporter_session", {});
      const title = root.querySelector("#rNewsTitle").value.trim();
      const category = root.querySelector("#rNewsCategory").value.trim();
      const content = root.querySelector("#rNewsContent").value.trim();
      if (!title || !category || !content) return;
      const list = read("maithili_news", []);
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
      write("maithili_news", list);
      e.target.reset();
      const showHome = root.querySelector("#rNewsShowHome");
      if (showHome) showHome.checked = true;
      renderReporter();
    });

    root.querySelector("#reporterBreakingForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = root.querySelector("#rBreakingText").value.trim();
      if (!msg) return;
      const breaking = read("maithili_breaking", { enabled: true, text: "", selectedNewsIds: [] });
      breaking.text = msg;
      write("maithili_breaking", breaking);
      e.target.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-panel-app]");
    if (!root) return;
    const type = root.getAttribute("data-panel-app");
    if (type === "admin") adminInit(root);
    if (type === "reporter") reporterInit(root);
  });
})();
