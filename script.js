(() => {
  'use strict';

  // --- Nav scroll effect ---
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile menu ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });

  // --- Smooth reveal on scroll ---
  const revealElements = document.querySelectorAll(
    '.timeline-item, .project-card, .pub-card, .skill-category, .edu-card, .about-grid, .contact-grid'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  // --- Counter animation ---
  const counters = document.querySelectorAll('.stat-num');
  let countersDone = false;

  const animateCounters = () => {
    if (countersDone) return;
    countersDone = true;

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1600;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    });
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObserver.observe(statsSection);

  // --- Active nav link highlight ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const highlightNav = () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // --- Stagger reveal for grid items ---
  const staggerContainers = document.querySelectorAll(
    '.projects-grid, .skills-grid, .education-grid, .publications-list, .gallery-grid'
  );

  staggerContainers.forEach(container => {
    const children = container.querySelectorAll('.reveal');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // --- Gallery filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let visibleItems = [];

  const getVisibleItems = () => {
    return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
  };

  const openLightbox = (index) => {
    visibleItems = getVisibleItems();
    currentIndex = index;
    showLightboxItem();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    const video = lightboxContent.querySelector('video');
    if (video) video.pause();
  };

  const showLightboxItem = () => {
    const item = visibleItems[currentIndex];
    const caption = item.querySelector('.gallery-caption').textContent;
    const isVideo = item.classList.contains('gallery-video');

    const oldVideo = lightboxContent.querySelector('video');
    if (oldVideo) oldVideo.pause();

    if (isVideo) {
      const src = item.querySelector('source').getAttribute('src');
      lightboxContent.innerHTML = `<video controls autoplay><source src="${src}" type="video/mp4"></video>`;
    } else {
      const src = item.querySelector('img').getAttribute('src');
      const alt = item.querySelector('img').getAttribute('alt');
      lightboxContent.innerHTML = `<img src="${src}" alt="${alt}">`;
    }

    lightboxCaption.textContent = caption;
  };

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      const vis = getVisibleItems();
      const idx = vis.indexOf(item);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showLightboxItem();
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showLightboxItem();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      showLightboxItem();
    }
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % visibleItems.length;
      showLightboxItem();
    }
  });
})();
