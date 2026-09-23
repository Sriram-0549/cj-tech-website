/**
 * CJ TECH — Creative Technology Studio
 * Interactive Client Logic, Cursor Physics, Parallax, Modal & Project Inquiry Handlers
 */

function initCJTech() {
  // 1. Mobile Navigation Drawer Handlers
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.classList.add('is-active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (drawerOverlay) {
      drawerOverlay.classList.add('is-open');
      drawerOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.classList.remove('is-active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (drawerOverlay) {
      drawerOverlay.classList.remove('is-open');
      drawerOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function handleToggle(e) {
    if (e) {
      e.stopPropagation();
      if (e.cancelable && e.type === 'touchend') e.preventDefault();
    }
    const isOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  function handleClose(e) {
    if (e) {
      e.stopPropagation();
      if (e.cancelable && e.type === 'touchend') e.preventDefault();
    }
    closeDrawer();
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', handleToggle);
    mobileToggle.addEventListener('touchend', handleToggle);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', handleClose);
    drawerOverlay.addEventListener('touchend', handleClose);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', handleClose);
    drawerClose.addEventListener('touchend', handleClose);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', handleClose);
    link.addEventListener('touchend', handleClose);
  });

  // Tapping outside drawer to close
  document.addEventListener('click', (e) => {
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      if (!mobileDrawer.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
        closeDrawer();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  }, { passive: true });

  // 2. Header Scroll Blur & Shadow
  const siteHeader = document.getElementById('header');
  function handleHeaderScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // 3. Active Nav Link Tracking on Scroll (for single page hash anchors)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function handleScrollSpy() {
    if (!sections.length) return;
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === `/#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  if (sections.length > 0) {
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
  }

  // 4. Subtle Custom Desktop Cursor Physics
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (cursorDot && cursorOutline && !prefersReducedMotion && window.innerWidth > 1024) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth Lerp animation loop for outline
    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state on links, inputs, and interactive cards
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .service-card-interactive, .velora-editorial-stage, .story-col-card, .principle-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // 5. Hero Interactive Mouse Parallax (Home page only)
  const heroSection = document.getElementById('home');
  const gradientOrb = document.getElementById('gradient-orb');
  const visualWrap = document.getElementById('creative-visual-wrap');

  if (heroSection && gradientOrb && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const xPos = (e.clientX - rect.left) / rect.width - 0.5;
      const yPos = (e.clientY - rect.top) / rect.height - 0.5;

      gradientOrb.style.transform = `scale(1.04) translate(${xPos * 36}px, ${yPos * 36}px)`;
      if (visualWrap) {
        visualWrap.style.transform = `perspective(1000px) rotateY(${xPos * 6}deg) rotateX(${-yPos * 6}deg)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      gradientOrb.style.transform = 'scale(1) translate(0px, 0px)';
      if (visualWrap) {
        visualWrap.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      }
    });
  }

  // 6. Project Case Study Modal Details (VELORA)
  const projectData = {
    velora: {
      title: 'VELORA — E-COMMERCE PLATFORM',
      statusText: 'PRODUCTION // LIVE',
      type: 'FASHION & LIFESTYLE STOREFRONT',
      description: 'A complete, high-velocity e-commerce platform engineered from scratch with instantaneous client-side taxonomy filtering, resilient persistent cart state, frictionless checkout, and an administrative fulfillment control center.',
      techStack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'API Routes'],
      highlights: [
        'Instantaneous client-side product filtering, taxonomy navigation, and sub-second full-text search.',
        'Persistent cart state synchronization with cross-session local storage and cloud database persistence.',
        'Optimized multi-step checkout funnel designed for zero-friction user conversion.',
        'Administrative merchant portal with order fulfillment status pipelines and real-time inventory triggers.',
        'Relational schema on Supabase with Row Level Security (RLS) guaranteeing strict customer data integrity.'
      ]
    }
  };

  const projectModal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openProjectModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalBadge.innerHTML = `<span class="badge-dot"></span><span>${data.statusText}</span>`;

    const techChips = data.techStack.map(t => `<span class="stack-chip">${t}</span>`).join(' ');
    const highlightItems = data.highlights.map(h => `<li style="margin-bottom:0.75rem; color:#CBD5E1; font-size:0.95rem; line-height:1.65;">${h}</li>`).join('');

    modalContent.innerHTML = `
      <div style="margin-bottom: 1.75rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--c-cyan); margin-bottom: 0.5rem;">Project Overview</h4>
        <p style="font-size: 1.05rem; color: #CBD5E1; line-height: 1.68;">${data.description}</p>
      </div>

      <div style="margin-bottom: 1.85rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--c-cyan); margin-bottom: 0.75rem;">Production Stack</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${techChips}</div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--c-cyan); margin-bottom: 0.75rem;">Key Architecture Highlights</h4>
        <ul style="padding-left: 1.25rem;">
          ${highlightItems}
        </ul>
      </div>

      <div style="padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end;">
        <button class="btn btn-sm btn-electric" id="modal-action-close">
          <span>Close Case Study</span>
        </button>
      </div>
    `;

    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const actionClose = document.getElementById('modal-action-close');
    if (actionClose) {
      actionClose.addEventListener('click', closeProjectModal);
    }
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project');
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  // 7. Scroll Reveal Animation for Section Cards
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.service-card-interactive, .story-col-card, .principle-card, .proof-card, .process-step-node');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersectObserver ? entry.isIntersecting : entry.intersectionRatio > 0.1) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 4) * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 4) * 0.08}s`;
      revealObserver.observe(el);
    });
  }

  // 8. High-Velocity Intake Form Handler & Pricing Plan Selectors
  let currentSelectedPlan = 'The Core Accelerator';

  // Smooth scroll and focus for Hero CTA & Pricing plan CTAs
  document.querySelectorAll('.pricing-cta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const plan = btn.getAttribute('data-plan');
      if (plan) currentSelectedPlan = plan;
      const target = document.getElementById('contact') || document.getElementById('contact-form-container');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nInput = document.getElementById('field-name');
        if (nInput) setTimeout(() => nInput.focus(), 600);
      }
    });
  });

  const heroCTA = document.getElementById('hero-primary-cta');
  if (heroCTA) {
    heroCTA.addEventListener('click', (e) => {
      const target = document.getElementById('contact') || document.getElementById('contact-form-container');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nInput = document.getElementById('field-name');
        if (nInput) setTimeout(() => nInput.focus(), 600);
      }
    });
  }

  const inquiryForm = document.getElementById('project-inquiry-form');
  const formAlert = document.getElementById('form-alert');
  const alertText = document.getElementById('alert-text');
  const submitButton = document.getElementById('submit-button');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const successCard = document.getElementById('form-success-card');

  if (inquiryForm) {
    const nameInput = document.getElementById('field-name') || document.getElementById('contact-name');
    const emailInput = document.getElementById('field-email') || document.getElementById('contact-email');
    const phoneInput = document.getElementById('field-phone');
    const websiteInput = document.getElementById('field-website');
    const companyInput = document.getElementById('field-company') || document.getElementById('contact-company');
    const serviceSelect = document.getElementById('field-service');
    const budgetSelect = document.getElementById('field-budget');
    const messageInput = document.getElementById('field-message') || document.getElementById('contact-message');

    const errorName = document.getElementById('error-name');
    const errorEmail = document.getElementById('error-email');
    const errorPhone = document.getElementById('error-phone');
    const errorWebsite = document.getElementById('error-website');
    const errorService = document.getElementById('error-service');
    const errorMessage = document.getElementById('error-message');

    // Custom Dropdown Controller (for backward compatibility if select elements exist)
    function setupCustomSelect(wrapperId, triggerId, valueId, dropdownId, selectEl, errorEl) {
      const wrapper = document.getElementById(wrapperId);
      const trigger = document.getElementById(triggerId);
      const valueSpan = document.getElementById(valueId);
      const dropdown = document.getElementById(dropdownId);
      if (!wrapper || !trigger || !valueSpan || !dropdown || !selectEl) return null;

      function openSelect() {
        document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('is-open');
            const trig = w.querySelector('.custom-select-trigger');
            if (trig) trig.setAttribute('aria-expanded', 'false');
          }
        });
        wrapper.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closeSelect() {
        wrapper.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains('is-open')) {
          closeSelect();
        } else {
          openSelect();
        }
      });

      const options = dropdown.querySelectorAll('.custom-select-option');
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value') || '';
          selectEl.value = val;
          valueSpan.textContent = opt.textContent.replace('✓', '').trim();
          valueSpan.classList.remove('is-placeholder');
          trigger.classList.remove('is-invalid');
          if (errorEl) errorEl.textContent = '';

          options.forEach(o => o.classList.remove('is-selected'));
          opt.classList.add('is-selected');

          closeSelect();
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });

      selectEl.addEventListener('change', () => {
        const currentVal = selectEl.value;
        if (!currentVal) {
          valueSpan.textContent = selectEl.options[0]?.textContent || 'Select a service';
          valueSpan.classList.add('is-placeholder');
          options.forEach(o => o.classList.remove('is-selected'));
        } else {
          options.forEach(o => {
            if (o.getAttribute('data-value') === currentVal) {
              o.classList.add('is-selected');
              valueSpan.textContent = o.textContent.replace('✓', '').trim();
              valueSpan.classList.remove('is-placeholder');
            } else {
              o.classList.remove('is-selected');
            }
          });
        }
      });

      return { trigger, closeSelect };
    }

    const serviceCustom = setupCustomSelect('wrapper-service', 'trigger-service', 'value-service', 'dropdown-service', serviceSelect, errorService);
    const budgetCustom = setupCustomSelect('wrapper-budget', 'trigger-budget', 'value-budget', 'dropdown-budget', budgetSelect, null);

    // Close custom selects on outside tap or Escape
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        if (!w.contains(e.target)) {
          w.classList.remove('is-open');
          const trig = w.querySelector('.custom-select-trigger');
          if (trig) trig.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
          w.classList.remove('is-open');
          const trig = w.querySelector('.custom-select-trigger');
          if (trig) trig.setAttribute('aria-expanded', 'false');
        });
      }
    });

    function clearErrors() {
      [nameInput, emailInput, phoneInput, websiteInput, companyInput, serviceSelect, messageInput].forEach(el => {
        if (el) el.classList.remove('is-invalid');
      });
      if (serviceCustom && serviceCustom.trigger) serviceCustom.trigger.classList.remove('is-invalid');
      if (budgetCustom && budgetCustom.trigger) budgetCustom.trigger.classList.remove('is-invalid');
      [errorName, errorEmail, errorPhone, errorWebsite, errorService, errorMessage].forEach(el => {
        if (el) el.textContent = '';
      });
      if (formAlert) formAlert.style.display = 'none';
    }

    // Clear individual field errors on input & sync state
    if (nameInput) nameInput.addEventListener('input', () => { nameInput.classList.remove('is-invalid'); if (errorName) errorName.textContent = ''; });
    if (emailInput) emailInput.addEventListener('input', () => { emailInput.classList.remove('is-invalid'); if (errorEmail) errorEmail.textContent = ''; });
    if (phoneInput) phoneInput.addEventListener('input', () => { phoneInput.classList.remove('is-invalid'); if (errorPhone) errorPhone.textContent = ''; });
    if (websiteInput) websiteInput.addEventListener('input', () => { websiteInput.classList.remove('is-invalid'); if (errorWebsite) errorWebsite.textContent = ''; });
    if (messageInput) messageInput.addEventListener('input', () => { messageInput.classList.remove('is-invalid'); if (errorMessage) errorMessage.textContent = ''; });

    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const website = websiteInput ? websiteInput.value.trim() : (companyInput ? companyInput.value.trim() : '');
      const company = website;
      const service = (serviceSelect && serviceSelect.value.trim()) || currentSelectedPlan || 'The Core Accelerator';
      const budget = (budgetSelect && budgetSelect.value.trim()) || 'Flat Rate / Zero Upfront';
      const message = messageInput ? messageInput.value.trim() : '';

      let hasError = false;

      // 1. Validate Name
      if (!name || name.length < 2) {
        if (nameInput) nameInput.classList.add('is-invalid');
        if (errorName) errorName.textContent = 'Please enter your name.';
        hasError = true;
      }

      // 2. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (errorEmail) errorEmail.textContent = 'Please enter a valid email address.';
        hasError = true;
      }

      // 3. Validate WhatsApp / Phone Number
      const cleanDigits = phone.replace(/\D/g, '');
      const phoneRegex = /^(\+?\d{1,4}[-\s.]?)?(\(?\d{1,5}\)?[-\s.]?)?\d{3,5}[-\s.]?\d{3,5}$/;
      if (!phone || cleanDigits.length < 7 || cleanDigits.length > 15 || !phoneRegex.test(phone)) {
        if (phoneInput) phoneInput.classList.add('is-invalid');
        if (errorPhone) errorPhone.textContent = 'Please enter a valid WhatsApp number (7-15 digits).';
        hasError = true;
      }

      // 4. Validate What They Sell / Description
      if (!message || message.length < 3) {
        if (messageInput) messageInput.classList.add('is-invalid');
        if (errorMessage) errorMessage.textContent = 'Please briefly describe what your business sells or offers.';
        hasError = true;
      }

      if (hasError) {
        if (formAlert && alertText) {
          alertText.textContent = 'Please fill in all required fields marked with an asterisk (*).';
          formAlert.style.display = 'flex';
        }
        return;
      }

      // UI: Submitting Loading State
      if (submitButton) submitButton.disabled = true;
      if (submitText) submitText.textContent = 'DISPATCHING PROTOTYPE REQUEST...';
      if (submitSpinner) submitSpinner.style.display = 'inline-block';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            website,
            company,
            service,
            budget,
            message
          })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          // Success State Transition
          inquiryForm.style.display = 'none';
          if (successCard) {
            successCard.style.display = 'flex';
            successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            alert('PROTOTYPE REQUEST RECEIVED ✓\n\nThanks for reaching out to CJ Tech. We\'ll analyze your presence and send your 24-hour prototype soon.');
            inquiryForm.reset();
            if (submitButton) submitButton.disabled = false;
            if (submitText) submitText.textContent = 'CLAIM YOUR FREE 24-HOUR PROTOTYPE →';
            if (submitSpinner) submitSpinner.style.display = 'none';
          }
        } else {
          throw new Error(result.error || 'Failed to submit request. Please try again or message us on WhatsApp.');
        }
      } catch (err) {
        console.error('Contact submission error:', err);
        if (formAlert && alertText) {
          alertText.textContent = err.message || 'Something went wrong. Please check your connection or reach us on WhatsApp.';
          formAlert.style.display = 'flex';
        } else {
          alert(err.message || 'Something went wrong. Please reach us on WhatsApp.');
        }
        if (submitButton) submitButton.disabled = false;
        if (submitText) submitText.textContent = 'CLAIM YOUR FREE 24-HOUR PROTOTYPE →';
        if (submitSpinner) submitSpinner.style.display = 'none';
      }
    });
  }
}

// Run init whether DOM is still loading or already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCJTech);
} else {
  initCJTech();
}
