function textMatch(text, query) {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function showMessage(el, msg) {
  if (!el) return;
  if (!msg) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.textContent = msg;
}

function wireAdminAuth() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  const card = document.getElementById('adminAuthCard');
  const dash = document.getElementById('adminDashboard');
  const logout = document.getElementById('adminLogoutBtn');
  const errorEl = document.getElementById('adminError');
  const tokenKey = 'token';
  const userKey = 'adminUser';

  const showDashboard = () => {
    card.hidden = true;
    dash.hidden = false;
  };

  const showLogin = () => {
    card.hidden = false;
    dash.hidden = true;
  };

  try {
    const token = localStorage.getItem(tokenKey);
    const raw = localStorage.getItem(userKey);
    if (token && raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === 'super_admin') showDashboard();
    }
  } catch (_) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showMessage(errorEl, '');
    const email = (document.getElementById('adminEmail')?.value || '').trim();
    const password = (document.getElementById('adminPassword')?.value || '').trim();

    if (!email || !password) {
      showMessage(errorEl, 'Email and password are required.');
      return;
    }

    const fakeToken = `mock.admin.${Date.now()}`;
    const user = { email, role: 'super_admin', name: 'Admin User' };
    localStorage.setItem(tokenKey, fakeToken);
    localStorage.setItem(userKey, JSON.stringify(user));
    showDashboard();
  });

  logout?.addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    showLogin();
  });
}

function wireAdminPanel() {
  const search = document.getElementById('adminSearch');
  const status = document.getElementById('adminStatus');
  const items = [...document.querySelectorAll('[data-admin-item]')];
  if (!items.length) return;

  const apply = () => {
    const q = search ? search.value : '';
    const s = status ? status.value : 'all';
    items.forEach((item) => {
      const haystack = item.textContent || '';
      const itemStatus = item.getAttribute('data-status') || '';
      const okSearch = !q || textMatch(haystack, q);
      const okStatus = s === 'all' || s === itemStatus;
      item.style.display = okSearch && okStatus ? '' : 'none';
    });
  };

  search?.addEventListener('input', apply);
  status?.addEventListener('change', apply);
}

function wireReporterAuth() {
  const form = document.getElementById('reporterLoginForm');
  if (!form) return;

  const card = document.getElementById('reporterAuthCard');
  const dash = document.getElementById('reporterDashboard');
  const logout = document.getElementById('reporterLogoutBtn');
  const errorEl = document.getElementById('reporterError');
  const tokenKey = 'token';
  const userKey = 'reporterUser';

  const showDashboard = () => {
    card.hidden = true;
    dash.hidden = false;
  };

  const showLogin = () => {
    card.hidden = false;
    dash.hidden = true;
  };

  try {
    const token = localStorage.getItem(tokenKey);
    const raw = localStorage.getItem(userKey);
    if (token && raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === 'reporter' || parsed?.role === 'super_admin') showDashboard();
    }
  } catch (_) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showMessage(errorEl, '');
    const email = (document.getElementById('reporterEmail')?.value || '').trim();
    const password = (document.getElementById('reporterPassword')?.value || '').trim();

    if (!email || !password) {
      showMessage(errorEl, 'Email and password are required.');
      return;
    }

    const fakeToken = `mock.reporter.${Date.now()}`;
    const user = { email, role: 'reporter', name: 'Reporter User' };
    localStorage.setItem(tokenKey, fakeToken);
    localStorage.setItem(userKey, JSON.stringify(user));
    showDashboard();
  });

  logout?.addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    showLogin();
  });
}

function wireReporterPanel() {
  const form = document.getElementById('reporterDraftForm');
  if (!form) return;

  const saveNote = document.getElementById('draftSavedAt');
  const storageKey = 'maithili-news-reporter-draft';
  const fields = [...form.querySelectorAll('input, textarea, select')].filter((el) => el.name);

  const persist = () => {
    const payload = {};
    fields.forEach((field) => {
      payload[field.name] = field.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(payload));
    if (saveNote) {
      saveNote.textContent = `Saved at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const load = () => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      fields.forEach((field) => {
        if (typeof payload[field.name] === 'string') field.value = payload[field.name];
      });
      if (saveNote) saveNote.textContent = 'Restored your local draft';
    } catch (_) {
      localStorage.removeItem(storageKey);
    }
  };

  const clearBtn = document.getElementById('clearDraft');
  clearBtn?.addEventListener('click', () => {
    fields.forEach((field) => {
      field.value = '';
    });
    localStorage.removeItem(storageKey);
    if (saveNote) saveNote.textContent = 'Draft cleared';
  });

  fields.forEach((field) => field.addEventListener('input', persist));
  load();
}

document.addEventListener('DOMContentLoaded', () => {
  wireAdminAuth();
  wireAdminPanel();
  wireReporterAuth();
  wireReporterPanel();
});
