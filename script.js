(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');

  const closeMenu = (restoreFocus = false) => {
    if (!header.classList.contains('menu-open')) return;
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  };

  if (header && menuToggle && nav) {
    menuToggle.hidden = false;
    menuToggle.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu(true);
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
      if (event.matches) closeMenu();
    });
  }

  const filters = document.querySelector('[data-project-filters]');
  const projects = [...document.querySelectorAll('[data-project]')];
  const projectCount = document.querySelector('#project-count');
  const moreProjectsHeading = document.querySelector('#more-projects-heading');
  const moreProjects = [...document.querySelectorAll('#more-projects [data-project]')];

  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button || !filters.contains(button)) return;
      const filter = button.dataset.filter;
      filters.querySelectorAll('[data-filter]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      projects.forEach((project) => {
        project.hidden = filter !== 'all' && project.dataset.category !== filter;
      });
      const count = projects.filter((project) => !project.hidden).length;
      if (projectCount) projectCount.textContent = `${count} project${count === 1 ? '' : 's'}`;
      if (moreProjectsHeading) {
        moreProjectsHeading.hidden = !moreProjects.some((project) => !project.hidden);
      }
    });

    const revealLinkedProject = (hash) => {
      const project = document.getElementById(hash.slice(1))?.closest('[data-project]');
      if (project?.hidden) filters.querySelector('[data-filter="all"]').click();
    };
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (link) revealLinkedProject(link.hash);
    });
    revealLinkedProject(window.location.hash);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = document.querySelectorAll('.section-heading[data-reveal], article[data-project][data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    if (!reducedMotion.matches) {
      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        revealObserver.observe(element);
        element.classList.add('reveal-pending');
      });
    }
    reducedMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      revealObserver.disconnect();
      revealElements.forEach((element) => element.classList.remove('reveal-pending'));
    });

    const navLinks = document.querySelectorAll('[data-nav]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('#home, #projects, #stack, #about, #contact')
      .forEach((section) => sectionObserver.observe(section));
  }


  const stage = document.querySelector('[data-showcase-stage]');
  const slides = [...document.querySelectorAll('[data-showcase-slide]')];
  const showcaseControls = document.querySelector('[data-showcase-controls]');
  let slideIndex = 0;
  let drag = null;
  const pointerEffects = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 761px) and (prefers-reduced-motion: no-preference)'
  );

  function showSlide(index, animate = true) {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== slideIndex;
      slide.classList.toggle('is-entering', i === slideIndex && animate);
    });
    const selected = slides[slideIndex];
    document.querySelector('[data-showcase-title]').textContent = selected.dataset.title;
    document.querySelector('[data-showcase-description]').textContent = 'Interface concept · ' + selected.dataset.status;
    document.querySelector('[data-showcase-count]').textContent = String(slideIndex + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    const link = document.querySelector('[data-showcase-link]');
    link.href = selected.dataset.target;
    link.setAttribute('aria-label', 'Explore ' + selected.dataset.title);
  }

  function cancelDrag() {
    if (!stage || !drag) return;
    const pointerId = drag.pointerId;
    drag = null;
    stage.classList.remove('is-dragging');
    stage.style.removeProperty('--drag-x');
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
  }

  if (stage && slides.length > 1 && showcaseControls) {
    showcaseControls.hidden = false;
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', 'Project previews. Use the left and right arrow keys, or drag to change project.');
    showSlide(0, false);
    showcaseControls.addEventListener('click', (event) => {
      const button = event.target.closest('[data-showcase-step]');
      if (button) showSlide(slideIndex + Number(button.dataset.showcaseStep));
    });
    stage.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(slideIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    stage.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('a, button')) return;
      drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
      if (event.pointerType === 'mouse') {
        event.preventDefault();
        stage.focus({ preventScroll: true });
      }
    });
    stage.addEventListener('pointermove', (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (pointerEffects.matches && event.pointerType === 'mouse') {
        const shift = Math.max(-14, Math.min(14, (event.clientX - drag.x) * .12));
        stage.style.setProperty('--drag-x', shift + 'px');
      }
    });
    stage.addEventListener('pointerup', (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      cancelDrag();
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        showSlide(slideIndex + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', cancelDrag);
    stage.addEventListener('lostpointercapture', cancelDrag);
  }

  document.documentElement.classList.add('project-interactions-ready');
  document.querySelectorAll('article.featured-project, article.project-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.target.closest('a, button, summary, .detail-body')) return;
      if (window.getSelection()?.toString().trim()) return;
      const details = card.querySelector('details');
      if (details) {
        details.open = true;
        details.querySelector('summary').focus({ preventScroll: true });
      }
    });
  });

  const cursor = document.querySelector('#action-cursor');
  const cursorLabel = cursor?.querySelector('.cursor-label');
  const magneticButton = document.querySelector('[data-magnetic]');
  const magneticBoundary = document.querySelector('[data-magnet-boundary]');
  let pointer = null;
  let frame = 0;
  let activeSurface = null;
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
  const tiltProperties = ['--tilt-x', '--tilt-y', '--shift-x', '--shift-y', '--preview-scale'];

  function clearSurface() {
    if (activeSurface) tiltProperties.forEach((property) => activeSurface.style.removeProperty(property));
    activeSurface = null;
  }

  function hidePointer() {
    pointer = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (cursor) cursor.hidden = true;
    document.documentElement.classList.remove('custom-cursor-active');
    clearSurface();
    if (magneticButton) {
      ['--magnet-x', '--magnet-y', '--entry-x', '--entry-y'].forEach((property) => magneticButton.style.removeProperty(property));
    }
  }

  function updatePointer() {
    frame = 0;
    if (!pointerEffects.matches || !pointer || !cursor || !cursorLabel) return;
    const target = document.elementFromPoint(pointer.x, pointer.y);
    if (!target) { hidePointer(); return; }
    cursor.hidden = false;
    cursor.style.transform = 'translate3d(' + pointer.x + 'px, ' + pointer.y + 'px, 0)';
    document.documentElement.classList.add('custom-cursor-active');
    let state = 'default';
    if (drag || target.closest('[data-showcase-stage]')) state = 'drag';
    else if (target.closest('a, button')) state = 'link';
    else if (target.closest('article.featured-project, article.project-card') && !target.closest('.detail-body')) state = 'view';
    else if (target.closest('summary')) state = 'link';
    cursor.dataset.state = state;
    cursorLabel.textContent = { default: '', link: '\u2197', view: 'VIEW \u2197', drag: 'DRAG \u2194' }[state];

    const surface = target.closest('.project-visual, [data-showcase-stage]');
    if (surface !== activeSurface) clearSurface();
    if (surface && !drag) {
      activeSurface = surface;
      const rect = surface.getBoundingClientRect();
      const x = clamp((pointer.x - rect.left) / rect.width * 2 - 1, 1);
      const y = clamp((pointer.y - rect.top) / rect.height * 2 - 1, 1);
      surface.style.setProperty('--tilt-x', (-y * 1.7).toFixed(2) + 'deg');
      surface.style.setProperty('--tilt-y', (x * 1.7).toFixed(2) + 'deg');
      surface.style.setProperty('--shift-x', (x * 4).toFixed(2) + 'px');
      surface.style.setProperty('--shift-y', (y * 4).toFixed(2) + 'px');
      surface.style.setProperty('--preview-scale', '1.015');
    } else if (drag) clearSurface();

    if (magneticButton && magneticBoundary) {
      const rect = magneticBoundary.getBoundingClientRect();
      const nearby = pointer.x >= rect.left - 48 && pointer.x <= rect.right + 48 && pointer.y >= rect.top - 48 && pointer.y <= rect.bottom + 48;
      magneticButton.style.setProperty('--magnet-x', (nearby ? clamp((pointer.x - rect.left - rect.width / 2) * .08, 6) : 0).toFixed(2) + 'px');
      magneticButton.style.setProperty('--magnet-y', (nearby ? clamp((pointer.y - rect.top - rect.height / 2) * .08, 6) : 0).toFixed(2) + 'px');
    }
  }

  function schedulePointer() {
    if (pointer && !frame) frame = requestAnimationFrame(updatePointer);
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !pointerEffects.matches) { hidePointer(); return; }
    pointer = { x: event.clientX, y: event.clientY };
    schedulePointer();
  }, { passive: true });
  window.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') hidePointer();
  }, { passive: true });
  window.addEventListener('scroll', schedulePointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', hidePointer);
  window.addEventListener('blur', () => { hidePointer(); cancelDrag(); });
  document.addEventListener('keydown', (event) => {
    hidePointer();
    if (event.key === 'Escape') cancelDrag();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hidePointer(); cancelDrag(); }
  });
  pointerEffects.addEventListener('change', () => { hidePointer(); cancelDrag(); });
  if (magneticButton) {
    magneticButton.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !pointerEffects.matches) return;
      const rect = magneticButton.getBoundingClientRect();
      magneticButton.style.setProperty('--entry-x', (event.clientX - rect.left).toFixed(1) + 'px');
      magneticButton.style.setProperty('--entry-y', (event.clientY - rect.top).toFixed(1) + 'px');
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
