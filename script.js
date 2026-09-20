/**
 * CJ TECH — Creative Technology Studio
 * Interactive Client Logic, Cursor Physics, Parallax, Modal & Project Inquiry Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Drawer Handlers
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
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

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  const drawerClose = document.getElementById('drawer-close');
  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

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

  // 8. Start a Project Form Handler (/contact & #project-inquiry-form)
  const inquiryForm = document.getElementById('project-inquiry-form');
  const formAlert = document.getElementById('form-alert');
  const alertText = document.getElementById('alert-text');
  const submitButton = document.getElementById('submit-button');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const successCard = document.getElementById('form-success-card');

  if (inquiryForm) {
    const nameInput = document.getElementById('field-name') || document.getElementById('contact-name');
    const companyInput = document.getElementById('field-company') || document.getElementById('contact-company');
    const emailInput = document.getElementById('field-email') || document.getElementById('contact-email');
    const phoneInput = document.getElementById('field-phone');
    const serviceSelect = document.getElementById('field-service');
    const budgetSelect = document.getElementById('field-budget');
    const messageInput = document.getElementById('field-message') || document.getElementById('contact-message');

    const errorName = document.getElementById('error-name');
    const errorEmail = document.getElementById('error-email');
    const errorPhone = document.getElementById('error-phone');
    const errorService = document.getElementById('error-service');
    const errorMessage = document.getElementById('error-message');

    function clearErrors() {
      [nameInput, emailInput, phoneInput, serviceSelect, messageInput].forEach(el => {
        if (el) el.classList.remove('is-invalid');
      });
      [errorName, errorEmail, errorPhone, errorService, errorMessage].forEach(el => {
        if (el) el.textContent = '';
      });
      if (formAlert) formAlert.style.display = 'none';
    }

    // Clear individual field errors on input
    if (nameInput) nameInput.addEventListener('input', () => { nameInput.classList.remove('is-invalid'); if (errorName) errorName.textContent = ''; });
    if (emailInput) emailInput.addEventListener('input', () => { emailInput.classList.remove('is-invalid'); if (errorEmail) errorEmail.textContent = ''; });
    if (phoneInput) phoneInput.addEventListener('input', () => { phoneInput.classList.remove('is-invalid'); if (errorPhone) errorPhone.textContent = ''; });
    if (serviceSelect) serviceSelect.addEventListener('change', () => { serviceSelect.classList.remove('is-invalid'); if (errorService) errorService.textContent = ''; });
    if (messageInput) messageInput.addEventListener('input', () => { messageInput.classList.remove('is-invalid'); if (errorMessage) errorMessage.textContent = ''; });

    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const company = companyInput ? companyInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const service = serviceSelect ? serviceSelect.value.trim() : (document.getElementById('contact-timeline')?.value || 'Website Development');
      const budget = budgetSelect ? budgetSelect.value.trim() : 'Not sure yet';
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

      // 3. Validate Phone (Optional, but if provided must be sensible: 7 to 15 digits)
      if (phone) {
        const cleanDigits = phone.replace(/\D/g, '');
        const phoneRegex = /^(\+?\d{1,4}[-\s.]?)?(\(?\d{1,5}\)?[-\s.]?)?\d{3,5}[-\s.]?\d{3,5}$/;
        if (cleanDigits.length < 7 || cleanDigits.length > 15 || !phoneRegex.test(phone)) {
          if (phoneInput) phoneInput.classList.add('is-invalid');
          if (errorPhone) errorPhone.textContent = 'Please enter a valid phone number (7-15 digits).';
          hasError = true;
        }
      }

      // 4. Validate Service
      if (serviceSelect && !service) {
        serviceSelect.classList.add('is-invalid');
        if (errorService) errorService.textContent = 'Please select a service.';
        hasError = true;
      }

      // 4. Validate Message
      if (!message || message.length < 5) {
        if (messageInput) messageInput.classList.add('is-invalid');
        if (errorMessage) errorMessage.textContent = 'Please provide brief details about your project.';
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
      if (submitText) submitText.textContent = 'SENDING...';
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
            company,
            email,
            phone,
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
            alert('PROJECT REQUEST RECEIVED ✓\n\nThanks for reaching out to CJ Tech. We\'ll review your project details and get back to you soon.');
            inquiryForm.reset();
            if (submitButton) submitButton.disabled = false;
            if (submitText) submitText.textContent = 'SEND PROJECT REQUEST →';
            if (submitSpinner) submitSpinner.style.display = 'none';
          }
        } else {
          throw new Error(result.error || 'Failed to submit inquiry. Please try again.');
        }
      } catch (err) {
        console.error('Contact submission error:', err);
        if (formAlert && alertText) {
          alertText.textContent = err.message || 'Something went wrong. Please check your connection and try again.';
          formAlert.style.display = 'flex';
        } else {
          alert(err.message || 'Something went wrong. Please try again.');
        }
        if (submitButton) submitButton.disabled = false;
        if (submitText) submitText.textContent = 'SEND PROJECT REQUEST →';
        if (submitSpinner) submitSpinner.style.display = 'none';
      }
    });
  }
});
