const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const MENU_ICONS = {
  templates: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="7" height="6" rx="2"/><rect x="13" y="5" width="7" height="6" rx="2"/><rect x="4" y="13" width="7" height="6" rx="2"/><rect x="13" y="13" width="7" height="6" rx="2"/></svg>`,
  features: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.1 4.9 5.3.4-4 3.4 1.2 5.1L12 14.1 7.4 16.8l1.2-5.1-4-3.4 5.3-.4L12 3z"/></svg>`,
  how: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`,
  free: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 4v6c0 5-3.5 8.4-7 10-3.5-1.6-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
  faq: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9.3a2.5 2.5 0 1 1 4.5 1.4c-.7.8-1.7 1.3-1.7 2.8"/><circle cx="12" cy="17.2" r="1"/></svg>`,
  contact: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>`
};

function initReveal() {
  const items = qsa('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.14 });
  items.forEach(el => io.observe(el));
}

function initSmoothScroll() {
  qsa('[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMenu();
    });
  });
}

const mobileMenu = qs('#mobileMenu');
const menuBackdrop = qs('.menu-backdrop');
function openMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  menuBackdrop.hidden = false;
  requestAnimationFrame(() => menuBackdrop.classList.add('show'));
  qs('.menu-btn')?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
}
function closeMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  menuBackdrop?.classList.remove('show');
  if (menuBackdrop) setTimeout(() => { menuBackdrop.hidden = true; }, 220);
  qs('.menu-btn')?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}
function initMenu() {
  qs('.menu-btn')?.addEventListener('click', () => mobileMenu?.classList.contains('open') ? closeMenu() : openMenu());
  qs('.mobile-close')?.addEventListener('click', closeMenu);
  menuBackdrop?.addEventListener('click', closeMenu);
  qsa('.mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));

  qsa('.mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const key = href.includes('templates') ? 'templates'
      : href.includes('features') ? 'features'
      : href.includes('how') ? 'how'
      : href.includes('free') ? 'free'
      : href.includes('faq') ? 'faq'
      : 'contact';
    a.innerHTML = `<span class="nav-ico">${MENU_ICONS[key]}</span><span>${a.textContent}</span>`;
  });
}

function initModal() {
  const modal = qs('#libraryModal');
  if (!modal) return;
  qs('#alreadyBtn')?.addEventListener('click', () => modal.showModal());
  qs('#alreadyTopBtn')?.addEventListener('click', () => modal.showModal());
  qs('.modal-close', modal)?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });
  qs('#magicForm')?.addEventListener('submit', e => {
    e.preventDefault();
    qs('.modal-status').textContent = 'Демо: ссылка на библиотеку отправлена.';
  });
}

function initContactForm() {
  qs('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = qs('button', e.currentTarget);
    const prev = btn.textContent;
    btn.textContent = 'Отправлено ✓';
    setTimeout(() => btn.textContent = prev, 2000);
    e.currentTarget.reset();
  });
}

function renderTemplateCard(tpl) {
  return `
    <article class="template-card ${tpl.theme}">
      <a href="templates.html?category=${encodeURIComponent(tpl.category[1] || 'all')}" aria-label="${tpl.title}">
        <div class="tpl-art ${tpl.theme}"><span>${tpl.title}</span></div>
        <div class="template-body">
          <h3>${tpl.title}</h3>
          <p>${tpl.subtitle}</p>
        </div>
      </a>
    </article>`;
}

let homeActiveCategory = 'all';
function renderHomeFilters() {
  const wrap = qs('#homeFilters');
  if (!wrap) return;
  wrap.innerHTML = window.templateCategories.map(cat => `<button class="chip ${cat.key === homeActiveCategory ? 'active' : ''}" type="button" data-cat="${cat.key}">${cat.label}</button>`).join('');
  qsa('.chip', wrap).forEach(btn => btn.addEventListener('click', () => {
    homeActiveCategory = btn.dataset.cat;
    renderHomeFilters();
    renderHomeTemplates();
  }));
}

function renderHomeTemplates() {
  const list = qs('#homeTemplateList');
  if (!list) return;
  const filtered = window.templatesData.filter(item => homeActiveCategory === 'all' || item.category.includes(homeActiveCategory));
  list.innerHTML = filtered.slice(0, 10).map(renderTemplateCard).join('');
  list.scrollTo({ left: 0, behavior: 'smooth' });
  qs('#carouselPrev')?.onclick = () => list.scrollBy({ left: -340, behavior: 'smooth' });
  qs('#carouselNext')?.onclick = () => list.scrollBy({ left: 340, behavior: 'smooth' });
}

function getCategoryFromUrl() {
  const p = new URLSearchParams(location.search);
  return p.get('category') || 'all';
}

function renderCatalogFilters(active) {
  const wrap = qs('#catalogFilters');
  if (!wrap) return;
  wrap.innerHTML = window.templateCategories.map(cat => `<button class="chip ${active === cat.key ? 'active' : ''}" data-cat="${cat.key}">${cat.label}</button>`).join('');
  qsa('.chip', wrap).forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    const url = new URL(location.href);
    url.searchParams.set('category', cat);
    history.pushState({}, '', url);
    initCatalog();
  }));
}

let catalogShown = 20;
function initCatalog(reset = true) {
  if (document.body.dataset.page !== 'catalog') return;
  const active = getCategoryFromUrl();
  if (reset) catalogShown = 20;
  renderCatalogFilters(active);
  const list = qs('#catalogList');
  const all = window.templatesData.filter(item => active === 'all' || item.category.includes(active));
  list.innerHTML = all.slice(0, catalogShown).map(renderTemplateCard).join('');
  qs('#loadMoreBtn').style.display = all.length > catalogShown ? 'inline-flex' : 'none';
  initReveal();
}

function initLoadMore() {
  qs('#loadMoreBtn')?.addEventListener('click', () => {
    catalogShown += 20;
    initCatalog(false);
  });
  window.addEventListener('popstate', () => initCatalog());
}

function initCounters() {
  qsa('[data-count]').forEach(el => {
    const parent = el.closest('.counter');
    const target = Number(el.dataset.count);
    if (!target || !parent) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const duration = 1200;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.disconnect();
    }, { threshold: .6 });
    io.observe(parent);
  });
}

function initFokiAnimation() {
  qsa('[data-foki-animated]').forEach(stack => {
    const imgs = qsa('img', stack);
    if (!imgs.length) return;
    let index = 0;
    imgs.forEach((img, idx) => img.classList.toggle('is-active', idx === 0));
    setInterval(() => {
      imgs[index].classList.remove('is-active');
      index = (index + 1) % imgs.length;
      imgs[index].classList.add('is-active');
      stack.classList.remove('is-blinking');
      void stack.offsetWidth;
      stack.classList.add('is-blinking');
    }, 2800);
  });
}

function initHeroParallax() {
  const stage = qs('.hero-stage');
  if (!stage || !matchMedia('(pointer:fine)').matches) return;
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 14;
    stage.style.setProperty('--x', `${x}px`);
    stage.style.setProperty('--y', `${y}px`);
  });
}

function initSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
}

initReveal();
initSmoothScroll();
initMenu();
initModal();
initContactForm();
renderHomeFilters();
renderHomeTemplates();
initCatalog();
initLoadMore();
initCounters();
initFokiAnimation();
initHeroParallax();
initSW();
