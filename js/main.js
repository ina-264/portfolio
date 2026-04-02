/* ==============================================
   MAIN JS — Motion System, Interactions, Modals
   ============================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --- Hero staged entrance ---
  const hero = document.querySelector('.hero');
  if (hero) {
    if (prefersReducedMotion.matches) {
      hero.classList.add('hero--revealed');
    } else {
      requestAnimationFrame(() => {
        hero.classList.add('hero--revealed');
      });
    }
  }

  // --- Scroll-triggered entrance animations ---
  const animateElements = document.querySelectorAll('.animate-in');

  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in--visible');
        animateObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  });

  if (prefersReducedMotion.matches) {
    animateElements.forEach((el) => el.classList.add('animate-in--visible'));
  } else {
    animateElements.forEach((el) => animateObserver.observe(el));
  }

  // --- Section rule reveal on scroll ---
  const sectionRules = document.querySelectorAll('.section-rule');

  const ruleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-rule--visible');
        ruleObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1,
  });

  if (prefersReducedMotion.matches) {
    sectionRules.forEach((el) => el.classList.add('section-rule--visible'));
  } else {
    sectionRules.forEach((el) => ruleObserver.observe(el));
  }

  // --- Floating editorial elements — visibility on scroll ---
  const floaters = document.querySelectorAll('.floater');

  const floaterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('floater--visible');
      } else {
        entry.target.classList.remove('floater--visible');
      }
    });
  }, {
    rootMargin: '100px 0px -50px 0px',
    threshold: 0,
  });

  if (!prefersReducedMotion.matches) {
    floaters.forEach((el) => floaterObserver.observe(el));
  }

  // --- Floating elements — subtle pointer parallax (desktop only) ---
  let pointerX = 0;
  let pointerY = 0;
  let rafId = null;

  function updateFloaterPositions() {
    const cx = (pointerX / window.innerWidth - 0.5) * 2;
    const cy = (pointerY / window.innerHeight - 0.5) * 2;

    floaters.forEach((el) => {
      if (!el.classList.contains('floater--visible')) return;
      const speed = parseFloat(el.dataset.parallax || '0.3');
      const dx = cx * speed * 12;
      const dy = cy * speed * 8;
      el.style.setProperty('--px', dx + 'px');
      el.style.setProperty('--py', dy + 'px');
    });

    rafId = null;
  }

  if (!prefersReducedMotion.matches && window.innerWidth > 768) {
    document.addEventListener('pointermove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateFloaterPositions);
      }
    }, { passive: true });
  }

  // --- Navigation scroll effect ---
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isOpen);
    navOverlay.classList.toggle('nav__overlay--open');
    navOverlay.setAttribute('aria-hidden', isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navOverlay.classList.remove('nav__overlay--open');
      navOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- Case Study Modals ---
  const caseButtons = document.querySelectorAll('[data-case]');
  const modals = document.querySelectorAll('.modal');
  let activeModal = null;

  function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (!modal) return;

    activeModal = modal;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus();
    });
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const caseId = activeModal.id.replace('modal-', '');
    const trigger = document.querySelector('[data-case="' + caseId + '"]');
    if (trigger) trigger.focus();

    activeModal = null;
  }

  caseButtons.forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.case));
  });

  modals.forEach((modal) => {
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) closeModal();
  });

  // --- Trap focus within modal ---
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !activeModal) return;

    const focusableEls = activeModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });

  // --- Atmospheric stains — scroll-based vertical parallax drift ---
  const sunFloaters = document.querySelectorAll('.atm-bloom');
  let lastScrollY = window.scrollY;

  function updateSunParallax() {
    const scrollY = window.scrollY;
    sunFloaters.forEach((sun) => {
      if (!sun.classList.contains('floater--visible')) return;
      const rect = sun.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2 + scrollY;
      const relY = scrollY - centerY;
      const speed = parseFloat(sun.dataset.parallax || '0.3') * 0.5;
      const dy = relY * speed * 0.1;
      const currentPy = parseFloat(sun.style.getPropertyValue('--py') || '0');
      sun.style.setProperty('--py', (currentPy * 0.85 + dy * 0.15) + 'px');
    });
    lastScrollY = scrollY;
  }

  if (!prefersReducedMotion.matches) {
    window.addEventListener('scroll', updateSunParallax, { passive: true });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav__link[href^="#"]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinksAll.forEach((link) => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
})();
