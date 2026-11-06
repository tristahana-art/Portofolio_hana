// ==============================================================================
// PUSAT KENDALI PORTOFOLIO (BACKEND CMS) - CONTROLLER SCRIPT
// Author: Trista Hana Qonita Rahmawati
// Anti-Slop Compliant (R-02: Zero em dash, clean syntax)
// ==============================================================================

(function () {
  'use strict';

  let data = null;
  let isServerActive = false;
  let pendingItemPhoto = null;
  let pendingAvatarPhoto = null;

  // View titles map
  const viewTitles = {
    'view-layout': 'Tata Letak & Urutan Bagian',
    'view-cover': 'Cover & Identitas Utama',
    'view-intro': 'Intro & Sambutan Rekruter',
    'view-profile': 'Profil Akademik & Kompetensi',
    'view-metrics': 'Bilah Metrik Dampak',
    'view-chapters': 'Kelola Bab Pengalaman',
    'view-items': 'Daftar Portofolio & Proyek',
    'view-frontline': 'Work Experience',
    'view-contact': 'Saluran Kontak Langsung',
    'view-backup': 'Pencadangan Data & Server'
  };

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  async function init() {
    setupNav();
    setupDropzones();
    setupSaveButtons();
    await loadData();
    populateAllViews();
  }

  // --------------------------------------------------------------------------
  // Data Loading & Syncing
  // --------------------------------------------------------------------------
  async function loadData() {
    // 1. Try server
    try {
      const resp = await fetch('/api/data', { cache: 'no-store' });
      if (resp.ok) {
        data = await resp.json();
        isServerActive = true;
        updateServerBadge(true);
        localStorage.setItem('trista_portfolio_data', JSON.stringify(data));
        return;
      }
    } catch (e) {
      isServerActive = false;
      updateServerBadge(false);
    }

    // 2. Try localStorage
    const local = localStorage.getItem('trista_portfolio_data');
    if (local) {
      try {
        data = JSON.parse(local);
        return;
      } catch (e) {}
    }

    // 3. Bundled data
    try {
      const fb = await fetch('data/portfolio.json');
      if (fb.ok) {
        data = await fb.json();
        localStorage.setItem('trista_portfolio_data', JSON.stringify(data));
      }
    } catch (e) {
      showToast('Gagal memuat data default.', 'error');
    }
  }

  async function persistData() {
    if (!data) return;

    // Collect all active form values
    collectFormValues();

    // Save to LocalStorage
    localStorage.setItem('trista_portfolio_data', JSON.stringify(data));

    // Save to Server
    try {
      const resp = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 2)
      });
      if (resp.ok) {
        showToast('Seluruh perubahan berhasil disimpan secara permanen ke server.', 'success');
        updateServerBadge(true);
        return;
      }
    } catch (e) {
      updateServerBadge(false);
    }

    showToast('Perubahan tersimpan di memori browser (LocalStorage).', 'info');
  }

  function updateServerBadge(active) {
    const el = document.getElementById('cms-server-indicator');
    if (!el) return;
    const currentPort = window.location.port || '3000';
    if (active) {
      el.textContent = '● Terhubung ke Server (Port ' + currentPort + ')';
      el.style.color = 'var(--status-success)';
    } else {
      el.textContent = '○ Mode Mandiri Browser (LocalStorage)';
      el.style.color = 'var(--blue-light)';
    }
  }

  // --------------------------------------------------------------------------
  // Navigation & View Switching
  // --------------------------------------------------------------------------
  function setupNav() {
    const navButtons = document.querySelectorAll('.cms-nav-item button');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.section-view').forEach(view => {
          view.classList.toggle('active', view.id === viewId);
        });

        const titleEl = document.getElementById('cms-current-view-title');
        if (titleEl && viewTitles[viewId]) {
          titleEl.textContent = viewTitles[viewId];
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // --------------------------------------------------------------------------
  // Populate All Views
  // --------------------------------------------------------------------------
  function populateAllViews() {
    if (!data) return;

    populateLayoutView();
    populateCoverView();
    populateIntroView();
    populateProfileView();
    populateMetricsView();
    populateChaptersView();
    populateItemsView();
    populateFrontlineView();
    populateContactView();
  }

  // 1. Layout View
  function populateLayoutView() {
    const container = document.getElementById('layout-sections-list');
    if (!container) return;
    container.innerHTML = '';

    if (!data.layout || !data.layout.sections) {
      data.layout = {
        sections: [
          { id: 'cover', name: 'Cover & Hero', visible: true, order: 1 },
          { id: 'metrics', name: 'Bilah Metrik Utama', visible: true, order: 2 },
          { id: 'intro', name: 'Intro & Sambutan', visible: true, order: 3 },
          { id: 'profile', name: 'Profil & Akademik', visible: true, order: 4 },
          { id: 'experience', name: 'Bab Pengalaman (Chapters)', visible: true, order: 5 },
          { id: 'frontline', name: 'Work Experience', visible: true, order: 6 },
          { id: 'contact', name: 'Saluran Kontak Langsung', visible: true, order: 7 }
        ]
      };
    }

    const sections = [...data.layout.sections].sort((a, b) => a.order - b.order);

    sections.forEach((sec, idx) => {
      const row = document.createElement('div');
      row.className = 'order-item-row';
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <input type="checkbox" id="check-sec-${sec.id}" ${sec.visible !== false ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
          <div>
            <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${escapeHtml(sec.name)}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(ID: ${sec.id})</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn btn-outline btn-sm btn-move-up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity: 0.3;"' : ''}>▲ Naik</button>
          <button type="button" class="btn btn-outline btn-sm btn-move-down" data-idx="${idx}" ${idx === sections.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>▼ Turun</button>
        </div>
      `;

      row.querySelector(`#check-sec-${sec.id}`).addEventListener('change', e => {
        sec.visible = e.target.checked;
      });

      row.querySelector('.btn-move-up').addEventListener('click', () => {
        if (idx > 0) {
          const temp = sections[idx].order;
          sections[idx].order = sections[idx - 1].order;
          sections[idx - 1].order = temp;
          data.layout.sections = sections;
          populateLayoutView();
        }
      });

      row.querySelector('.btn-move-down').addEventListener('click', () => {
        if (idx < sections.length - 1) {
          const temp = sections[idx].order;
          sections[idx].order = sections[idx + 1].order;
          sections[idx + 1].order = temp;
          data.layout.sections = sections;
          populateLayoutView();
        }
      });

      container.appendChild(row);
    });
  }

  // 2. Cover View
  function populateCoverView() {
    const p = data.profile || {};
    setVal('cov-name', p.name);
    setVal('cov-status', 'Available for Internship & Full-time Roles');
    setVal('cov-title', p.title);
    setVal('cov-summary', p.bioSummary);
    setVal('cov-keywords', (p.keywords || []).join(', '));
    setVal('cov-avatar-url', p.avatar);

    if (p.avatar) {
      const box = document.getElementById('avatar-preview-box');
      const img = document.getElementById('avatar-preview-img');
      if (box && img) {
        img.src = p.avatar;
        box.style.display = 'flex';
      }
    }
  }

  // 3. Intro View
  function populateIntroView() {
    const p = data.profile || {};
    setVal('intro-greeting', p.introGreeting);
    setVal('intro-quote', p.workloadPitch);
  }

  // 4. Profile View
  function populateProfileView() {
    const p = data.profile || {};
    setVal('prof-gpa', p.gpa);
    setVal('prof-credits', p.credits);
    setVal('prof-cohort', p.cohort);
    setVal('prof-univ', p.university);
    setVal('prof-major', p.major);
    setVal('prof-school', p.highSchool);
    setVal('prof-loc', p.location);
    setVal('prof-skills-input', (p.relatedSkills || []).join(', '));
    setVal('prof-courses-input', (p.relatedCourses || []).join(', '));
    setVal('prof-tools-input', (p.tools || []).join(', '));
  }

  // 5. Metrics View
  function populateMetricsView() {
    const container = document.getElementById('metrics-editor-list');
    if (!container) return;
    container.innerHTML = '';

    const metrics = data.metrics || [];
    metrics.forEach((m, idx) => {
      const row = document.createElement('div');
      row.className = 'metric-row-editor';
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '120px 1.5fr 2fr auto';
      row.style.gap = '0.75rem';
      row.style.alignItems = 'center';
      row.style.backgroundColor = 'var(--bg-elevated)';
      row.style.padding = '0.85rem 1rem';
      row.style.borderRadius = 'var(--radius-sm)';
      row.style.border = '1px solid var(--border-subtle)';

      row.innerHTML = `
        <input type="text" class="form-control m-val" value="${escapeHtml(m.value)}" placeholder="220+">
        <input type="text" class="form-control m-lbl" value="${escapeHtml(m.label)}" placeholder="Label Metrik">
        <input type="text" class="form-control m-dsc" value="${escapeHtml(m.description)}" placeholder="Keterangan singkat">
        <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444;" title="Hapus Metrik">✕</button>
      `;

      row.querySelector('button').addEventListener('click', () => {
        metrics.splice(idx, 1);
        populateMetricsView();
      });

      container.appendChild(row);
    });

    const addBtn = document.getElementById('btn-add-metric-row');
    if (addBtn) {
      addBtn.onclick = () => {
        if (!data.metrics) data.metrics = [];
        data.metrics.push({ value: '100%', label: 'Label Baru', description: 'Keterangan dampak' });
        populateMetricsView();
      };
    }
  }

  // 6. Chapters View
  function populateChaptersView() {
    const container = document.getElementById('chapters-editor-list');
    if (!container) return;
    container.innerHTML = '';

    const chapters = data.chapters || [];
    chapters.forEach((ch, idx) => {
      const card = document.createElement('div');
      card.style.backgroundColor = 'var(--bg-elevated)';
      card.style.padding = '1rem 1.25rem';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.border = '1px solid var(--border-subtle)';

      card.innerHTML = `
        <div style="display: grid; grid-template-columns: 80px 1.5fr auto; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
          <input type="text" class="form-control ch-num" value="${escapeHtml(ch.number)}" placeholder="01">
          <input type="text" class="form-control ch-title" value="${escapeHtml(ch.title)}" placeholder="Judul Bab">
          <button type="button" class="btn btn-outline btn-sm btn-del-ch" style="color: #EF4444;">✕ Hapus</button>
        </div>
        <input type="text" class="form-control ch-desc" value="${escapeHtml(ch.shortDesc || '')}" placeholder="Deskripsi ringkas bab ini">
      `;

      card.querySelector('.btn-del-ch').addEventListener('click', () => {
        if (confirm(`Hapus bab "${ch.title}"?`)) {
          chapters.splice(idx, 1);
          populateChaptersView();
          populateItemChapterDropdown();
        }
      });

      container.appendChild(card);
    });

    const addBtn = document.getElementById('btn-add-chapter-row');
    if (addBtn) {
      addBtn.onclick = () => {
        const nextNum = (chapters.length + 1).toString().padStart(2, '0');
        chapters.push({
          id: `chapter-${Date.now()}`,
          number: nextNum,
          title: `Bab Baru ${nextNum}`,
          shortDesc: 'Deskripsi bab'
        });
        populateChaptersView();
        populateItemChapterDropdown();
      };
    }
  }

  // 7. Items View (Portofolio Projects)
  function populateItemsView() {
    const tbody = document.getElementById('cms-items-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const items = data.items || [];
    items.forEach(item => {
      const row = document.createElement('tr');
      const ch = (data.chapters || []).find(c => c.id === item.chapterId);
      const chLabel = ch ? `${ch.number}. ${ch.title}` : item.chapterId;
      const linksCount = (item.links || []).length;
      const stepsCount = (item.steppingStones || []).length;

      row.innerHTML = `
        <td style="font-weight: 600; color: var(--blue-light);">${escapeHtml(chLabel)}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.role || '')} (${escapeHtml(item.period || '')})</div>
        </td>
        <td>${escapeHtml(item.organization || '-')}</td>
        <td>
          <div style="font-size: 0.75rem;">
            <span>${item.image ? '✓ Ada Foto' : '○ Belum ada'}</span> • 
            <span>${linksCount} Link</span> • 
            <span>${stepsCount} Langkah</span>
          </div>
        </td>
        <td>
          <div class="admin-action-btn-group">
            <button class="btn btn-secondary btn-sm btn-edit-p" data-id="${item.id}">Edit</button>
            <button class="btn btn-outline btn-sm btn-del-p" data-id="${item.id}" style="color: #EF4444;">Hapus</button>
          </div>
        </td>
      `;

      row.querySelector('.btn-edit-p').addEventListener('click', () => openItemEditor(item.id));
      row.querySelector('.btn-del-p').addEventListener('click', () => deleteItem(item.id));

      tbody.appendChild(row);
    });

    populateItemChapterDropdown();
    setupItemEditorEvents();
  }

  function populateItemChapterDropdown() {
    const datalist = document.getElementById('chapter-suggestions-list');
    if (!datalist) return;
    datalist.innerHTML = '';

    const added = new Set();
    (data.chapters || []).forEach(ch => {
      if (ch.title && !added.has(ch.title.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = ch.title;
        datalist.appendChild(opt);
        added.add(ch.title.toLowerCase());
      }
      if (ch.id && !added.has(ch.id.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = ch.id;
        datalist.appendChild(opt);
        added.add(ch.id.toLowerCase());
      }
    });

    // Also suggest unique chapters from items
    (data.items || []).forEach(it => {
      if (it.chapterId && !added.has(it.chapterId.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = it.chapterId;
        datalist.appendChild(opt);
        added.add(it.chapterId.toLowerCase());
      }
    });
  }

  function openItemEditor(itemId = null) {
    const panel = document.getElementById('cms-item-editor-panel');
    const heading = document.getElementById('item-editor-title-heading');
    if (!panel) return;

    pendingItemPhoto = null;

    if (itemId) {
      const it = (data.items || []).find(i => i.id === itemId);
      if (!it) return;

      heading.textContent = `Edit Proyek: ${it.title}`;
      setVal('item-form-id', it.id);
      
      const chObj = (data.chapters || []).find(c => c.id === it.chapterId || c.title.toLowerCase() === (it.chapterId || '').toLowerCase());
      setVal('item-form-chapter', chObj ? chObj.title : (it.chapterId || ''));
      setVal('item-form-title', it.title);
      setVal('item-form-org', it.organization);
      setVal('item-form-role', it.role);
      setVal('item-form-period', it.period);
      setVal('item-form-desc', it.description);
      setVal('item-form-badges', (it.badges || []).join(', '));
      setVal('item-form-image-url', it.image || '');

      // Photo preview
      const previewBox = document.getElementById('item-preview-box');
      const previewImg = document.getElementById('item-preview-img');
      if (it.image && previewBox && previewImg) {
        previewImg.src = it.image;
        previewBox.style.display = 'flex';
      } else if (previewBox) {
        previewBox.style.display = 'none';
      }

      // Populate Links
      renderItemLinksEditor(it.links || []);

      // Populate Steps
      renderItemStepsEditor(it.steppingStones || []);
    } else {
      heading.textContent = 'Buat Proyek Portofolio Baru';
      setVal('item-form-id', '');
      document.getElementById('cms-item-form').reset();
      const previewBox = document.getElementById('item-preview-box');
      if (previewBox) previewBox.style.display = 'none';
      renderItemLinksEditor([]);
      renderItemStepsEditor([]);
    }

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
  }

  function renderItemLinksEditor(links) {
    const container = document.getElementById('item-links-editor-list');
    if (!container) return;
    container.innerHTML = '';

    links.forEach(lk => addItemLinkRow(lk.title, lk.url, lk.category));
    if (links.length === 0) addItemLinkRow();
  }

  function addItemLinkRow(title = '', url = '', cat = 'drive') {
    const container = document.getElementById('item-links-editor-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'item-link-row';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1.2fr 2fr 1fr auto';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'center';

    row.innerHTML = `
      <input type="text" class="form-control lk-t" placeholder="Judul (misal: Google Drive)" value="${escapeHtml(title)}">
      <input type="url" class="form-control lk-u" placeholder="https://drive.google.com/..." value="${escapeHtml(url)}">
      <select class="form-control lk-c">
        <option value="drive" ${cat === 'drive' ? 'selected' : ''}>Drive</option>
        <option value="sheet" ${cat === 'sheet' ? 'selected' : ''}>Sheets</option>
        <option value="doc" ${cat === 'doc' ? 'selected' : ''}>Docs</option>
        <option value="presentation" ${cat === 'presentation' ? 'selected' : ''}>PPT</option>
        <option value="certificate" ${cat === 'certificate' ? 'selected' : ''}>Sertifikat</option>
        <option value="other" ${cat === 'other' ? 'selected' : ''}>Lainnya</option>
      </select>
      <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444;" title="Hapus">✕</button>
    `;

    row.querySelector('button').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  function renderItemStepsEditor(steps) {
    const container = document.getElementById('item-steps-editor-list');
    if (!container) return;
    container.innerHTML = '';

    steps.forEach(st => addItemStepRow(st.stepNumber, st.title, st.detail, st.metric));
    if (steps.length === 0) addItemStepRow();
  }

  function addItemStepRow(num = '', title = '', detail = '', metric = '') {
    const container = document.getElementById('item-steps-editor-list');
    if (!container) return;

    const currentCount = container.querySelectorAll('.item-step-row').length + 1;
    const stepNum = num || currentCount;

    const row = document.createElement('div');
    row.className = 'item-step-row';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '60px 1.5fr 1fr auto';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'start';

    row.innerHTML = `
      <input type="number" class="form-control st-num" value="${stepNum}" placeholder="No">
      <div style="display: flex; flex-direction: column; gap: 0.35rem;">
        <input type="text" class="form-control st-t" placeholder="Nama Langkah (misal: Uji Portofolio)" value="${escapeHtml(title)}">
        <textarea class="form-control st-d" placeholder="Keterangan langkah..." rows="2">${escapeHtml(detail)}</textarea>
      </div>
      <input type="text" class="form-control st-m" placeholder="Metrik Capaian" value="${escapeHtml(metric)}">
      <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444; margin-top: 0.25rem;" title="Hapus">✕</button>
    `;

    row.querySelector('button').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  function setupItemEditorEvents() {
    const openCreateBtn = document.getElementById('btn-open-create-item-form');
    if (openCreateBtn) openCreateBtn.onclick = () => openItemEditor(null);

    const closeBtn = document.getElementById('btn-close-item-editor');
    const cancelBtn = document.getElementById('btn-cancel-item-form');
    const panel = document.getElementById('cms-item-editor-panel');

    if (closeBtn) closeBtn.onclick = () => { panel.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = () => { panel.style.display = 'none'; };

    const addLinkBtn = document.getElementById('btn-add-item-link');
    if (addLinkBtn) addLinkBtn.onclick = () => addItemLinkRow();

    const addStepBtn = document.getElementById('btn-add-item-step');
    if (addStepBtn) addStepBtn.onclick = () => addItemStepRow();

    const form = document.getElementById('cms-item-form');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        saveItemFromForm();
      };
    }
  }

  function saveItemFromForm() {
    const itemId = getVal('item-form-id') || (`item-${Date.now()}`);
    const typedChapter = (getVal('item-form-chapter') || '').trim();
    const matchCh = (data.chapters || []).find(c => 
      c.title.toLowerCase().trim() === typedChapter.toLowerCase() || 
      c.id.toLowerCase().trim() === typedChapter.toLowerCase()
    );
    const chapterId = matchCh ? matchCh.id : typedChapter;
    const title = getVal('item-form-title');
    const organization = getVal('item-form-org');
    const role = getVal('item-form-role');
    const period = getVal('item-form-period');
    const description = getVal('item-form-desc');
    const badges = getVal('item-form-badges').split(',').map(b => b.trim()).filter(Boolean);

    let image = getVal('item-form-image-url');
    if (pendingItemPhoto) image = pendingItemPhoto;

    // Links
    const links = [];
    document.querySelectorAll('#item-links-editor-list .item-link-row').forEach(row => {
      const t = row.querySelector('.lk-t').value.trim();
      const u = row.querySelector('.lk-u').value.trim();
      const c = row.querySelector('.lk-c').value;
      if (t && u) links.push({ title: t, url: u, category: c });
    });

    // Steps
    const steps = [];
    document.querySelectorAll('#item-steps-editor-list .item-step-row').forEach(row => {
      const n = parseInt(row.querySelector('.st-num').value, 10) || (steps.length + 1);
      const t = row.querySelector('.st-t').value.trim();
      const d = row.querySelector('.st-d').value.trim();
      const m = row.querySelector('.st-m').value.trim();
      if (t) steps.push({ stepNumber: n, title: t, detail: d, metric: m });
    });

    const itemObj = {
      id: itemId,
      chapterId: chapterId,
      title: title,
      organization: organization,
      role: role,
      period: period,
      location: 'Indonesia',
      image: image,
      description: description,
      badges: badges,
      steppingStones: steps,
      links: links
    };

    if (!data.items) data.items = [];
    const idx = data.items.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      data.items[idx] = itemObj;
      showToast(`Proyek "${title}" berhasil diperbarui.`, 'success');
    } else {
      data.items.unshift(itemObj);
      showToast(`Proyek baru "${title}" berhasil ditambahkan.`, 'success');
    }

    document.getElementById('cms-item-editor-panel').style.display = 'none';
    populateItemsView();
    persistData();
  }

  function deleteItem(itemId) {
    if (!confirm('Hapus proyek ini dari portofolio?')) return;
    data.items = (data.items || []).filter(i => i.id !== itemId);
    populateItemsView();
    persistData();
    showToast('Proyek berhasil dihapus.', 'info');
  }

  // 8. Frontline View
  function populateFrontlineView() {
    const f = data.frontlineExperience || {};
    setVal('front-title', f.title || 'Work Experience');
    setVal('front-sub', f.subtitle || '');

    // Pillars
    const pContainer = document.getElementById('frontline-pillars-editor');
    if (pContainer) {
      pContainer.innerHTML = '';
      (f.pillars || []).forEach((p, idx) => {
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '220px 1fr auto';
        row.style.gap = '0.5rem';
        row.style.backgroundColor = 'var(--bg-elevated)';
        row.style.padding = '0.65rem';
        row.style.borderRadius = 'var(--radius-sm)';

        row.innerHTML = `
          <input type="text" class="form-control pl-asp" value="${escapeHtml(p.aspect)}" placeholder="Nama Aspek">
          <input type="text" class="form-control pl-dsc" value="${escapeHtml(p.description)}" placeholder="Deskripsi">
          <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444;">✕</button>
        `;
        row.querySelector('button').addEventListener('click', () => {
          f.pillars.splice(idx, 1);
          populateFrontlineView();
        });
        pContainer.appendChild(row);
      });
    }

    const addPillarBtn = document.getElementById('btn-add-pillar');
    if (addPillarBtn) {
      addPillarBtn.onclick = () => {
        if (!f.pillars) f.pillars = [];
        f.pillars.push({ aspect: 'Aspek Baru', description: 'Keterangan' });
        populateFrontlineView();
      };
    }

    // Placements
    const pmContainer = document.getElementById('frontline-placements-editor');
    if (pmContainer) {
      pmContainer.innerHTML = '';
      (f.industryPlacemats || []).forEach((pm, idx) => {
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1.2fr 1fr 2fr auto';
        row.style.gap = '0.5rem';
        row.style.backgroundColor = 'var(--bg-elevated)';
        row.style.padding = '0.65rem';
        row.style.borderRadius = 'var(--radius-sm)';

        row.innerHTML = `
          <input type="text" class="form-control pm-n" value="${escapeHtml(pm.name)}" placeholder="Nama Lokasi">
          <input type="text" class="form-control pm-r" value="${escapeHtml(pm.role)}" placeholder="Peran">
          <input type="text" class="form-control pm-f" value="${escapeHtml(pm.focus)}" placeholder="Fokus & Tugas">
          <button type="button" class="btn btn-outline btn-sm" style="color: #EF4444;">✕</button>
        `;
        row.querySelector('button').addEventListener('click', () => {
          f.industryPlacemats.splice(idx, 1);
          populateFrontlineView();
        });
        pmContainer.appendChild(row);
      });
    }

    const addPmBtn = document.getElementById('btn-add-placement');
    if (addPmBtn) {
      addPmBtn.onclick = () => {
        if (!f.industryPlacemats) f.industryPlacemats = [];
        f.industryPlacemats.push({ name: 'Tempat Baru', role: 'Staff Operasional', focus: 'Tugas' });
        populateFrontlineView();
      };
    }
  }

  // 9. Contact View
  function populateContactView() {
    const p = data.profile || {};
    setVal('cnt-email', p.email);
    setVal('cnt-phone', p.phone);
    setVal('cnt-linkedin', p.linkedin);
    setVal('cnt-instagram', p.instagram);
  }

  // --------------------------------------------------------------------------
  // Collect Form Values on Save
  // --------------------------------------------------------------------------
  function collectFormValues() {
    if (!data.profile) data.profile = {};

    // Cover & Profile
    data.profile.name = getVal('cov-name') || data.profile.name;
    data.profile.title = getVal('cov-title') || data.profile.title;
    data.profile.bioSummary = getVal('cov-summary') || data.profile.bioSummary;
    data.profile.keywords = getVal('cov-keywords').split(',').map(k => k.trim()).filter(Boolean);
    if (pendingAvatarPhoto) data.profile.avatar = pendingAvatarPhoto;
    else if (getVal('cov-avatar-url')) data.profile.avatar = getVal('cov-avatar-url');

    // Intro
    data.profile.introGreeting = getVal('intro-greeting') || data.profile.introGreeting;
    data.profile.workloadPitch = getVal('intro-quote') || data.profile.workloadPitch;

    // Academic Profile
    data.profile.gpa = getVal('prof-gpa') || data.profile.gpa;
    data.profile.credits = getVal('prof-credits') || data.profile.credits;
    data.profile.cohort = getVal('prof-cohort') || data.profile.cohort;
    data.profile.university = getVal('prof-univ') || data.profile.university;
    data.profile.major = getVal('prof-major') || data.profile.major;
    data.profile.highSchool = getVal('prof-school') || data.profile.highSchool;
    data.profile.location = getVal('prof-loc') || data.profile.location;

    data.profile.relatedSkills = getVal('prof-skills-input').split(',').map(s => s.trim()).filter(Boolean);
    data.profile.relatedCourses = getVal('prof-courses-input').split(',').map(c => c.trim()).filter(Boolean);
    data.profile.tools = getVal('prof-tools-input').split(',').map(t => t.trim()).filter(Boolean);

    // Metrics
    const metricsArr = [];
    document.querySelectorAll('#metrics-editor-list .metric-row-editor').forEach(row => {
      const v = row.querySelector('.m-val').value.trim();
      const l = row.querySelector('.m-lbl').value.trim();
      const d = row.querySelector('.m-dsc').value.trim();
      if (v && l) metricsArr.push({ value: v, label: l, description: d });
    });
    if (metricsArr.length > 0) data.metrics = metricsArr;

    // Chapters
    const chaptersArr = [];
    document.querySelectorAll('#chapters-editor-list > div').forEach((card, idx) => {
      const n = card.querySelector('.ch-num').value.trim();
      const t = card.querySelector('.ch-title').value.trim();
      const d = card.querySelector('.ch-desc').value.trim();
      const origId = (data.chapters && data.chapters[idx] && data.chapters[idx].id) || `chapter-${idx}`;
      if (t) chaptersArr.push({ id: origId, number: n, title: t, shortDesc: d });
    });
    if (chaptersArr.length > 0) data.chapters = chaptersArr;

    // Frontline
    if (!data.frontlineExperience) data.frontlineExperience = {};
    data.frontlineExperience.title = getVal('front-title') || data.frontlineExperience.title;
    data.frontlineExperience.subtitle = getVal('front-sub') || data.frontlineExperience.subtitle;

    const pillarsArr = [];
    document.querySelectorAll('#frontline-pillars-editor > div').forEach(row => {
      const a = row.querySelector('.pl-asp').value.trim();
      const d = row.querySelector('.pl-dsc').value.trim();
      if (a) pillarsArr.push({ aspect: a, description: d });
    });
    data.frontlineExperience.pillars = pillarsArr;

    const pmArr = [];
    document.querySelectorAll('#frontline-placements-editor > div').forEach(row => {
      const n = row.querySelector('.pm-n').value.trim();
      const r = row.querySelector('.pm-r').value.trim();
      const f = row.querySelector('.pm-f').value.trim();
      if (n) pmArr.push({ name: n, role: r, focus: f });
    });
    data.frontlineExperience.industryPlacemats = pmArr;

    // Contact
    data.profile.email = getVal('cnt-email') || data.profile.email;
    data.profile.phone = getVal('cnt-phone') || data.profile.phone;
    data.profile.linkedin = getVal('cnt-linkedin') || data.profile.linkedin;
    data.profile.instagram = getVal('cnt-instagram') || data.profile.instagram;
  }

  // --------------------------------------------------------------------------
  // Dropzones & File Upload
  // --------------------------------------------------------------------------
  function setupDropzones() {
    // Avatar dropzone
    const avDrop = document.getElementById('avatar-dropzone');
    const avInput = document.getElementById('avatar-file-input');
    if (avDrop && avInput) {
      avDrop.onclick = () => avInput.click();
      avDrop.ondragover = e => { e.preventDefault(); avDrop.classList.add('dragover'); };
      avDrop.ondragleave = () => avDrop.classList.remove('dragover');
      avDrop.ondrop = e => {
        e.preventDefault();
        avDrop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processImageFile(e.dataTransfer.files[0], 'avatar');
        }
      };
      avInput.onchange = e => {
        if (e.target.files && e.target.files[0]) {
          processImageFile(e.target.files[0], 'avatar');
        }
      };
    }

    // Item photo dropzone
    const itDrop = document.getElementById('item-image-dropzone');
    const itInput = document.getElementById('item-file-input');
    if (itDrop && itInput) {
      itDrop.onclick = () => itInput.click();
      itDrop.ondragover = e => { e.preventDefault(); itDrop.classList.add('dragover'); };
      itDrop.ondragleave = () => itDrop.classList.remove('dragover');
      itDrop.ondrop = e => {
        e.preventDefault();
        itDrop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processImageFile(e.dataTransfer.files[0], 'item');
        }
      };
      itInput.onchange = e => {
        if (e.target.files && e.target.files[0]) {
          processImageFile(e.target.files[0], 'item');
        }
      };
    }
  }

  function processImageFile(file, type) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
      const b64 = e.target.result;

      if (type === 'avatar') {
        const previewBox = document.getElementById('avatar-preview-box');
        const previewImg = document.getElementById('avatar-preview-img');
        const statusSpan = document.getElementById('avatar-preview-status');
        if (previewImg) previewImg.src = b64;
        if (previewBox) previewBox.style.display = 'flex';

        if (isServerActive) {
          if (statusSpan) statusSpan.textContent = 'Mengunggah ke server...';
          const srvUrl = await uploadToServer(file.name, b64);
          if (srvUrl) {
            pendingAvatarPhoto = srvUrl;
            setVal('cov-avatar-url', srvUrl);
            if (statusSpan) statusSpan.textContent = '✓ Tersimpan di folder uploads/';
            showToast('Foto profil tersimpan ke server.', 'success');
            return;
          }
        }
        pendingAvatarPhoto = b64;
        showToast('Foto profil siap disimpan.', 'success');
      } else {
        const previewBox = document.getElementById('item-preview-box');
        const previewImg = document.getElementById('item-preview-img');
        const statusSpan = document.getElementById('item-preview-status');
        if (previewImg) previewImg.src = b64;
        if (previewBox) previewBox.style.display = 'flex';

        if (isServerActive) {
          if (statusSpan) statusSpan.textContent = 'Mengunggah ke server...';
          const srvUrl = await uploadToServer(file.name, b64);
          if (srvUrl) {
            pendingItemPhoto = srvUrl;
            setVal('item-form-image-url', srvUrl);
            if (statusSpan) statusSpan.textContent = '✓ Tersimpan di folder uploads/';
            showToast('Foto proyek tersimpan ke server.', 'success');
            return;
          }
        }
        pendingItemPhoto = b64;
        showToast('Foto proyek siap disimpan.', 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  async function uploadToServer(filename, dataUri) {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename, data: dataUri })
      });
      const json = await res.json();
      if (res.ok && json.success) return json.url;
    } catch (e) {
      console.warn('Upload API call failed', e);
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Save Buttons & Backup Actions
  // --------------------------------------------------------------------------
  function setupSaveButtons() {
    const saveAllBtn = document.getElementById('cms-btn-save-all');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', persistData);
    }

    // Export JSON
    const expBtn = document.getElementById('cms-btn-export-json');
    if (expBtn) {
      expBtn.onclick = () => {
        collectFormValues();
        const str = JSON.stringify(data, null, 2);
        const blob = new Blob([str], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File cadangan JSON berhasil diunduh.', 'success');
      };
    }

    // Import JSON
    const impInput = document.getElementById('cms-import-file');
    if (impInput) {
      impInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async evt => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (!parsed.profile || !parsed.items) {
              throw new Error('Format file JSON tidak sesuai.');
            }
            data = parsed;
            populateAllViews();
            await persistData();
            showToast('Data portofolio berhasil dipulihkan dari cadangan.', 'success');
          } catch (err) {
            showToast('Gagal memulihkan: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      };
    }

    // Reset default
    const resetBtn = document.getElementById('cms-btn-reset-default');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        if (!confirm('Apakah Anda yakin ingin mengatur ulang data ke format awal?')) return;
        try {
          const resp = await fetch('data/portfolio.json');
          if (resp.ok) {
            data = await resp.json();
            populateAllViews();
            await persistData();
            showToast('Data telah diatur ulang ke format awal.', 'info');
          }
        } catch (e) {
          showToast('Gagal memuat format awal.', 'error');
        }
      };
    }
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

