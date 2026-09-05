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
  const revealElements = document.querySelectorAll('[data-reveal]');

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

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
