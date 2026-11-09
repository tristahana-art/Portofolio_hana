// ==============================================================================
// PORTOFOLIO PROFESIONAL - TRISTA HANA QONITA RAHMAWATI
// Frontend Engine & Lovable-Style Scroll Experience
// Anti-Slop Compliant (R-02: Zero em dash, clean geometry, authentic tone)
// ==============================================================================

(function () {
  'use strict';

  // Global State
  let portfolioData = null;
  let activeChapterId = 'hr-campaign';

  // Clear stale localStorage (bumped when data updated to English)
  const DATA_VERSION = 'v3';
  if (localStorage.getItem('trista_data_version') !== DATA_VERSION) {
    localStorage.removeItem('trista_portfolio_data');
    localStorage.setItem('trista_data_version', DATA_VERSION);
  }

  // DOM Elements Cache
  const elements = {
    // Flow & Scroll elements
    mainFlow: document.getElementById('main-content-flow'),
    scrollProgressBar: document.getElementById('scroll-progress-bar'),
    brandLogoTrigger: document.getElementById('brand-logo-trigger'),
    navLinks: document.querySelectorAll('#main-nav-links .nav-item'),
    
    // Display Containers
    metricsContainer: document.getElementById('metrics-container'),
    heroKeywordsContainer: document.getElementById('hero-keywords-container'),
    skillsListContainer: document.getElementById('skills-list-container'),
    coursesListContainer: document.getElementById('courses-list-container'),
    toolsListContainer: document.getElementById('tools-list-container'),
    chapterTabsBar: document.getElementById('chapter-tabs-bar'),
    portfolioItemsContainer: document.getElementById('portfolio-items-container'),
    portfolioSearchInput: document.getElementById('portfolio-search-input'),
    btnShowAllItems: document.getElementById('btn-show-all-items'),
    frontlinePillarsContainer: document.getElementById('frontline-pillars-container'),
    industryPlacematsContainer: document.getElementById('industry-placemats-container'),
    
    // Hero & Profile Displays
    heroNameDisplay: document.getElementById('hero-name-display'),
    heroStatusText: document.getElementById('hero-status-text'),
    profileTitleDisplay: document.getElementById('profile-title-display'),
    profileSummaryDisplay: document.getElementById('profile-summary-display'),
    profileAvatarDisplay: document.getElementById('profile-avatar-display'),
    profileGpaStat: document.getElementById('profile-gpa-stat'),
    profileCreditsStat: document.getElementById('profile-credits-stat'),
    introHeadingDisplay: document.getElementById('intro-heading-display'),
    profileIntroDisplay: document.getElementById('profile-intro-display'),
    profileWorkloadDisplay: document.getElementById('profile-workload-display'),
    profileSectionTitle: document.getElementById('profile-section-title'),
    profileSectionSubtitle: document.getElementById('profile-section-subtitle'),
    profilePhotoSecondary: document.getElementById('profile-photo-secondary'),
    profileShortName: document.getElementById('profile-short-name'),
    profileMajorDisplay: document.getElementById('profile-major-display'),
    profileUnivDisplay: document.getElementById('profile-univ-display'),
    profileGpaVal: document.getElementById('profile-gpa-val'),
    profileSksVal: document.getElementById('profile-sks-val'),
    profileCohortVal: document.getElementById('profile-cohort-val'),
    profileHighschoolVal: document.getElementById('profile-highschool-val'),
    profileLocationVal: document.getElementById('profile-location-val'),
    contactEmailVal: document.getElementById('contact-email-val'),
    contactPhoneVal: document.getElementById('contact-phone-val'),

    // Item Detail Modal
    itemDetailModal: document.getElementById('item-detail-modal'),
    btnCloseDetailModal: document.getElementById('btn-close-detail-modal'),
    modalItemChapter: document.getElementById('modal-item-chapter'),
    modalItemTitle: document.getElementById('modal-item-title'),
    modalItemOrgPeriod: document.getElementById('modal-item-org-period'),
    modalItemImage: document.getElementById('modal-item-image'),
    modalItemDescription: document.getElementById('modal-item-description'),
    modalItemBadges: document.getElementById('modal-item-badges'),
    modalSteppingTitleText: document.getElementById('modal-stepping-title-text'),
    modalSteppingStonesList: document.getElementById('modal-stepping-stones-list'),
    modalItemLinks: document.getElementById('modal-item-links'),
    toastContainer: document.getElementById('toast-container')
  };

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  async function init() {
    setupEventListeners();
    setupScrollAnimations();
    setupSecretAdminTriggers();
    await loadData();
    applyDynamicLayout();
    renderAll();
    observeRevealElements();
  }

  // --------------------------------------------------------------------------
  // Data Loading
  // --------------------------------------------------------------------------
  async function loadData() {
    // 1. Try backend server with cache-busting timestamp
    try {
      const response = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (response.ok) {
        portfolioData = await response.json();
        localStorage.setItem('trista_portfolio_data', JSON.stringify(portfolioData));
        return;
      }
    } catch (e) {
      // Offline / standalone fallback
    }

    // 2. Try LocalStorage
    const localSaved = localStorage.getItem('trista_portfolio_data');
    if (localSaved) {
      try {
        portfolioData = JSON.parse(localSaved);
        return;
      } catch (e) {
        console.warn('LocalStorage data parse failed.');
      }
    }

    // 3. Fallback to bundled data/portfolio.json
    try {
      const fallbackResp = await fetch('data/portfolio.json?t=' + Date.now());
      if (fallbackResp.ok) {
        portfolioData = await fallbackResp.json();
        localStorage.setItem('trista_portfolio_data', JSON.stringify(portfolioData));
        return;
      }
    } catch (e) {
      console.error('Failed to load data/portfolio.json', e);
    }
  }

  // --------------------------------------------------------------------------
  // Dynamic Layout Order & Visibility (Admin-Configurable Layout)
  // --------------------------------------------------------------------------
  function applyDynamicLayout() {
    if (!portfolioData || !portfolioData.layout || !portfolioData.layout.sections || !elements.mainFlow) return;

    const sectionsConfig = [...portfolioData.layout.sections].sort((a, b) => a.order - b.order);

    sectionsConfig.forEach(cfg => {
      const secEl = document.getElementById(cfg.id);
      if (secEl) {
        if (cfg.visible === false) {
          secEl.style.display = 'none';
        } else {
          secEl.style.display = '';
          elements.mainFlow.appendChild(secEl);
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------
  function renderAll() {
    if (!portfolioData) return;

    renderProfile();
    renderMetrics();
    renderChapters();
    renderItems();
    renderFrontline();
  }

  function renderProfile() {
    const p = portfolioData.profile || {};

    if (elements.heroNameDisplay) {
      elements.heroNameDisplay.innerHTML = `Trista Hana <span class="highlight">Qonita Rahmawati</span>`;
    }
    if (elements.profileTitleDisplay) elements.profileTitleDisplay.textContent = p.title || '';
    if (elements.profileSummaryDisplay) elements.profileSummaryDisplay.textContent = p.bioSummary || '';
    if (elements.introHeadingDisplay) elements.introHeadingDisplay.textContent = p.introHeading || "Hi! Get to know me, I'm Hana.";
    if (elements.profileWorkloadDisplay) elements.profileWorkloadDisplay.textContent = p.workloadPitch || '';
    
    if (elements.profileGpaStat) elements.profileGpaStat.textContent = p.gpa || '3.88';
    if (elements.profileCreditsStat) elements.profileCreditsStat.textContent = p.credits || '84 Credits';
    
    if (elements.profileShortName) elements.profileShortName.textContent = p.shortName ? `Trista ${p.shortName}` : 'Trista Hana';
    if (elements.profileMajorDisplay) elements.profileMajorDisplay.textContent = p.major || 'Bachelor of Management';
    if (elements.profileUnivDisplay) elements.profileUnivDisplay.textContent = p.university || 'UPN "Veteran" Yogyakarta';
    
    if (elements.profileGpaVal) elements.profileGpaVal.textContent = (p.gpa || '3.88') + ' / 4.00';
    if (elements.profileSksVal) elements.profileSksVal.textContent = p.credits || '84 Credits';
    if (elements.profileCohortVal) elements.profileCohortVal.textContent = p.cohort || '2023 - Present';
    if (elements.profileHighschoolVal) elements.profileHighschoolVal.textContent = p.highSchool || 'SMAN 7 Yogyakarta';
    if (elements.profileLocationVal) elements.profileLocationVal.textContent = p.location || 'Yogyakarta, Indonesia';

    if (elements.contactEmailVal) elements.contactEmailVal.textContent = p.email || 'tristahana@gmail.com';
    if (elements.contactPhoneVal) elements.contactPhoneVal.textContent = p.phone || '+62 812-2960-6200';

    if (p.avatar && elements.profileAvatarDisplay) {
      elements.profileAvatarDisplay.src = p.avatar;
    }
    if (p.avatar && elements.profilePhotoSecondary) {
      elements.profilePhotoSecondary.src = p.avatar;
    }

    // HR Keywords
    if (elements.heroKeywordsContainer) {
      elements.heroKeywordsContainer.innerHTML = '';
      const keywords = p.keywords || [
        'Talent Acquisition',
        'Project & Event Coordination',
        'Applicant Data Management',
        'SOP Standardization',
        'OKR Performance Tracking',
        'Member Engagement'
      ];
      keywords.forEach(kw => {
        const span = document.createElement('span');
        span.className = 'keyword-badge';
        span.textContent = kw;
        elements.heroKeywordsContainer.appendChild(span);
      });
    }

    // Skills
    if (elements.skillsListContainer) {
      elements.skillsListContainer.innerHTML = '';
      (p.relatedSkills || []).forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag accent';
        span.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${escapeHtml(skill)}</span>
        `;
        elements.skillsListContainer.appendChild(span);
      });
    }

    // Courses
    if (elements.coursesListContainer) {
      elements.coursesListContainer.innerHTML = '';
      (p.relatedCourses || []).forEach(course => {
        const div = document.createElement('div');
        div.className = 'course-item';
        div.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>${escapeHtml(course)}</span>
        `;
        elements.coursesListContainer.appendChild(div);
      });
    }

    // Tools
    if (elements.toolsListContainer) {
      elements.toolsListContainer.innerHTML = '';
      (p.tools || []).forEach(tool => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <span>${escapeHtml(tool)}</span>
        `;
        elements.toolsListContainer.appendChild(span);
      });
    }
  }

  function renderMetrics() {
    if (!elements.metricsContainer) return;
    elements.metricsContainer.innerHTML = '';
    const metrics = portfolioData.metrics || [];
    metrics.forEach((m, idx) => {
      const card = document.createElement('div');
      card.className = `metric-item reveal-on-scroll reveal-stagger-${(idx % 6) + 1}`;
      card.innerHTML = `
        <div class="metric-value">${escapeHtml(m.value)}</div>
        <div class="metric-label">${escapeHtml(m.label)}</div>
        <div class="metric-desc">${escapeHtml(m.description)}</div>
      `;
      elements.metricsContainer.appendChild(card);
    });
  }

  function renderChapters() {
    if (!elements.chapterTabsBar) return;
    elements.chapterTabsBar.innerHTML = '';
    
    // Gather defined chapters
    const chapters = [...(portfolioData.chapters || [])];
    const items = portfolioData.items || [];
    
    // Auto-discover any custom-typed chapters from items that are not in the chapters list
    items.forEach(it => {
      if (!it.chapterId) return;
      const exists = chapters.some(ch => 
        ch.id === it.chapterId || 
        ch.title.toLowerCase().trim() === it.chapterId.toLowerCase().trim()
      );
      if (!exists) {
        chapters.push({
          id: it.chapterId,
          number: String(chapters.length + 1).padStart(2, '0'),
          title: it.chapterId,
          shortDesc: ''
        });
      }
    });

    // Helper to count items in chapter
    function countForChapter(ch) {
      return items.filter(it => {
        if (!it.chapterId) return false;
        if (it.chapterId === ch.id) return true;
        if (it.chapterId.toLowerCase().trim() === ch.title.toLowerCase().trim()) return true;
        if (it.chapterId.toLowerCase().trim() === ch.id.toLowerCase().trim()) return true;
        return false;
      }).length;
    }

    // If current activeChapter has 0 items, auto-select the first chapter with > 0 items
    const activeObj = chapters.find(c => c.id === activeChapterId);
    if (!activeObj || countForChapter(activeObj) === 0) {
      const firstWithItems = chapters.find(c => countForChapter(c) > 0);
      if (firstWithItems) {
        activeChapterId = firstWithItems.id;
      }
    }

    chapters.forEach(ch => {
      const count = countForChapter(ch);
      const btn = document.createElement('button');
      btn.className = `chapter-tab-btn ${ch.id === activeChapterId ? 'active' : ''}`;
      btn.setAttribute('data-chapter-id', ch.id);
      btn.innerHTML = `
        <span class="tab-num">${escapeHtml(ch.number)}</span>
        <span class="tab-text">${escapeHtml(ch.title)} <small style="opacity: 0.65; font-size: 0.78em;">(${count})</small></span>
      `;
      btn.addEventListener('click', () => {
        activeChapterId = ch.id;
        document.querySelectorAll('.chapter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderItems();
        observeRevealElements();
      });
      elements.chapterTabsBar.appendChild(btn);
    });
  }

  function renderItems(searchQuery = '') {
    if (!elements.portfolioItemsContainer) return;
    elements.portfolioItemsContainer.innerHTML = '';

    let items = portfolioData.items || [];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      items = items.filter(it => {
        const text = [
          it.title,
          it.organization,
          it.role,
          it.description,
          (it.badges || []).join(' ')
        ].join(' ').toLowerCase();
        return text.includes(query);
      });
    } else if (activeChapterId !== 'all') {
      const activeObj = (portfolioData.chapters || []).find(c => c.id === activeChapterId);
      items = items.filter(it => {
        if (!it.chapterId) return false;
        if (it.chapterId === activeChapterId) return true;
        if (activeObj && it.chapterId.toLowerCase().trim() === activeObj.title.toLowerCase().trim()) return true;
        if (activeObj && it.chapterId.toLowerCase().trim() === activeObj.id.toLowerCase().trim()) return true;
        return false;
      });
    }

    if (items.length === 0) {
      elements.portfolioItemsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; background-color: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-sm);">
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">No portfolio items matched your search criteria.</p>
          <button id="btn-reset-filter" class="btn btn-outline btn-sm">Reset Chapter Filter</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeChapterId = 'hr-campaign';
          if (elements.portfolioSearchInput) elements.portfolioSearchInput.value = '';
          renderChapters();
          renderItems();
          observeRevealElements();
        });
      }
      return;
    }

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = `item-card reveal-on-scroll reveal-stagger-${(idx % 4) + 1}`;

      const chapterObj = (portfolioData.chapters || []).find(c => 
        c.id === item.chapterId || 
        c.title.toLowerCase().trim() === (item.chapterId || '').toLowerCase().trim()
      );
      const chapterLabel = chapterObj ? `${chapterObj.number}. ${chapterObj.title}` : item.chapterId;
      const mediaImg = item.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80';

      // Badges
      const badgesHtml = (item.badges || []).map(b => `<span class="badge-tag">${escapeHtml(b)}</span>`).join('');

      // External click links
      let linksHtml = '';
      if (item.links && item.links.length > 0) {
        linksHtml = item.links.slice(0, 2).map(lk => `
          <a href="${escapeHtml(lk.url)}" target="_blank" rel="noopener noreferrer" class="external-link-btn" title="Open link: ${escapeHtml(lk.title)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>${escapeHtml(lk.title)}</span>
          </a>
        `).join('');
      }

      card.innerHTML = `
        <div class="item-card-media">
          <img src="${escapeHtml(mediaImg)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="item-card-chapter-tag">${escapeHtml(chapterLabel)}</span>
        </div>
        <div class="item-card-body">
          <div class="item-card-header">
            <div class="item-card-org">${escapeHtml(item.organization || '')}</div>
            <h3 class="item-card-title">${escapeHtml(item.title)}</h3>
            <div class="item-card-meta">
              <span>${escapeHtml(item.role || '')}</span>
              <span>•</span>
              <span>${escapeHtml(item.period || '')}</span>
            </div>
          </div>
          <p class="item-card-desc">${escapeHtml(item.description || '')}</p>
          <div class="item-badges-list">${badgesHtml}</div>
          <div class="item-card-footer">
            <div class="link-pills-row">${linksHtml}</div>
            <button class="btn btn-secondary btn-sm btn-open-detail" data-item-id="${item.id}">
              <span>Details &amp; Process</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.btn-open-detail').addEventListener('click', () => {
        openDetailModal(item);
      });

      elements.portfolioItemsContainer.appendChild(card);
    });
  }

  function renderFrontline() {
    const frontline = portfolioData.frontlineExperience || {};

    const titleEl = document.getElementById('frontline-title-display');
    const subtitleEl = document.getElementById('frontline-subtitle-display');
    if (titleEl && frontline.title) titleEl.textContent = frontline.title;
    if (subtitleEl && frontline.subtitle) subtitleEl.textContent = frontline.subtitle;

    // Pillars
    if (elements.frontlinePillarsContainer) {
      elements.frontlinePillarsContainer.innerHTML = '';
      const pillars = frontline.pillars || [];
      pillars.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = `pillar-card reveal-on-scroll reveal-stagger-${idx + 1}`;
        card.innerHTML = `
          <div class="pillar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${escapeHtml(p.aspect)}</span>
          </div>
          <p class="pillar-desc">${escapeHtml(p.description)}</p>
        `;
        elements.frontlinePillarsContainer.appendChild(card);
      });
    }

    // Placemats
    if (elements.industryPlacematsContainer) {
      elements.industryPlacematsContainer.innerHTML = '';
      const placements = frontline.industryPlacemats || [];
      placements.forEach((pm, idx) => {
        const item = document.createElement('div');
        item.className = `placemat-item reveal-on-scroll reveal-stagger-${(idx % 4) + 1}`;
        item.innerHTML = `
          <div class="placemat-name">${escapeHtml(pm.name)}</div>
          <div class="placemat-role">${escapeHtml(pm.role)}</div>
          <div class="placemat-focus">${escapeHtml(pm.focus)}</div>
        `;
        elements.industryPlacematsContainer.appendChild(item);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Detail Modal (Stepping Stones & Clickable Links)
  // --------------------------------------------------------------------------
  function openDetailModal(item) {
    if (!elements.itemDetailModal) return;

    const chObj = (portfolioData.chapters || []).find(c => c.id === item.chapterId);
    elements.modalItemChapter.textContent = chObj ? `${chObj.number}. ${chObj.title}` : item.chapterId;
    elements.modalItemTitle.textContent = item.title;
    elements.modalItemOrgPeriod.textContent = `${item.organization || ''} | ${item.role || ''} | ${item.period || ''}`;
    
    if (item.image) {
      elements.modalItemImage.src = item.image;
      elements.modalItemImage.style.display = 'block';
    } else {
      elements.modalItemImage.style.display = 'none';
    }

    elements.modalItemDescription.textContent = item.description || '';

    // Badges
    elements.modalItemBadges.innerHTML = (item.badges || []).map(b => `<span class="badge-tag">${escapeHtml(b)}</span>`).join('');

    // Stepping Stones
    if (elements.modalSteppingStonesList) {
      elements.modalSteppingStonesList.innerHTML = '';
      const steps = item.steppingStones || [];

      if (steps.length > 0) {
        document.getElementById('modal-stepping-stones-section').style.display = 'block';
        if (item.chapterId === 'sertifikasi' || (item.chapterId && item.chapterId.toLowerCase().includes('cert'))) {
          elements.modalSteppingTitleText.textContent = 'How I Earned It & Official Verification Process';
        } else {
          elements.modalSteppingTitleText.textContent = 'Execution Process & Milestone Stepping Stones';
        }

        steps.forEach((st, idx) => {
          const stepDiv = document.createElement('div');
          stepDiv.className = 'step-card';
          stepDiv.innerHTML = `
            <div class="step-number-circle">${st.stepNumber || (idx + 1)}</div>
            <div class="step-content-box">
              <div class="step-header-row">
                <span class="step-title">${escapeHtml(st.title)}</span>
                ${st.metric ? `<span class="step-metric-pill">${escapeHtml(st.metric)}</span>` : ''}
              </div>
              <p class="step-detail">${escapeHtml(st.detail)}</p>
            </div>
          `;
          elements.modalSteppingStonesList.appendChild(stepDiv);
        });
      } else {
        document.getElementById('modal-stepping-stones-section').style.display = 'none';
      }
    }

    // Clickable External Links
    if (elements.modalItemLinks) {
      elements.modalItemLinks.innerHTML = '';
      const links = item.links || [];

      if (links.length > 0) {
        document.getElementById('modal-links-section').style.display = 'block';
        links.forEach(lk => {
          const linkCard = document.createElement('a');
          linkCard.href = lk.url;
          linkCard.target = '_blank';
          linkCard.rel = 'noopener noreferrer';
          linkCard.className = 'direct-channel-card';
          linkCard.style.padding = '1rem 1.25rem';
          linkCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="direct-channel-icon" style="width: 38px; height: 38px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </div>
              <div style="flex-grow: 1;">
                <div class="channel-label">Open Documentation (${escapeHtml(lk.category || 'External Link')})</div>
                <div class="channel-value" style="font-size: 0.95rem; color: var(--blue-light);">${escapeHtml(lk.title)}</div>
              </div>
              <div class="channel-action">&rarr;</div>
            </div>
          `;
          elements.modalItemLinks.appendChild(linkCard);
        });
      } else {
        document.getElementById('modal-links-section').style.display = 'none';
      }
    }

    elements.itemDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    if (elements.itemDetailModal) {
      elements.itemDetailModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --------------------------------------------------------------------------
  // Lovable / Maya Career Coaching Scroll Engine
  // --------------------------------------------------------------------------
  function setupScrollAnimations() {
    // 1. Reading Progress Bar
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (elements.scrollProgressBar) {
        elements.scrollProgressBar.style.width = `${scrollPercent}%`;
      }

      // Scrollspy active nav item
      updateActiveNavItem(scrollTop);
    }, { passive: true });
  }

  function updateActiveNavItem(scrollTop) {
    const sections = ['cover', 'intro', 'profile', 'experience', 'frontline', 'contact'];
    let currentSectionId = 'cover';

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop - 120;
        const height = el.offsetHeight;
        if (scrollTop >= top && scrollTop < top + height) {
          currentSectionId = id;
        }
      }
    });

    elements.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentSectionId}`);
    });
  }

  function observeRevealElements() {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealEls.forEach(el => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Discrete Admin Backend Access (Recruiter-Invisible)
  // --------------------------------------------------------------------------
  function setupSecretAdminTriggers() {
    // 1. Hotkey: Ctrl + Shift + A (or Alt + A)
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
          (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        window.location.href = '/admin';
      }
    });

    // 2. Hash #admin in URL
    if (window.location.hash === '#admin') {
      window.location.href = '/admin';
    }

    // 3. Triple-click on the "TH" logo in top navbar
    if (elements.brandLogoTrigger) {
      let clickCount = 0;
      let clickTimer = null;
      elements.brandLogoTrigger.addEventListener('click', e => {
        clickCount++;
        if (clickCount === 3) {
          e.preventDefault();
          window.location.href = '/admin';
        }
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Detail Modal Close
    if (elements.btnCloseDetailModal) elements.btnCloseDetailModal.addEventListener('click', closeDetailModal);
    if (elements.itemDetailModal) {
      elements.itemDetailModal.addEventListener('click', e => {
        if (e.target === elements.itemDetailModal) closeDetailModal();
      });
    }

    // Escape Key Handler
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
    });

    // Search and Filter
    if (elements.portfolioSearchInput) {
      elements.portfolioSearchInput.addEventListener('input', e => {
        renderItems(e.target.value);
        observeRevealElements();
      });
    }

    if (elements.btnShowAllItems) {
      elements.btnShowAllItems.addEventListener('click', () => {
        activeChapterId = 'all';
        document.querySelectorAll('.chapter-tab-btn').forEach(b => b.classList.remove('active'));
        if (elements.portfolioSearchInput) elements.portfolioSearchInput.value = '';
        renderItems();
        observeRevealElements();
      });
    }
  }

  // --------------------------------------------------------------------------
  // Utility Helpers
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
