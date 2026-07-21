/* ============================================================
   Presentation Deck — JavaScript
   Scroll-snap navigation, keyboard control, dot nav, progress,
   reveal-on-scroll, and lightbox for images.
   ============================================================ */
(function () {
  'use strict';

  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('dots');
  const progressBar = document.getElementById('progress');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let current = 0;

  // --- Build dot navigation ---
  slides.forEach((slide, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', slide.dataset.title || `Slide ${i + 1}`);
    const tip = document.createElement('span');
    tip.textContent = slide.dataset.title || `Slide ${i + 1}`;
    btn.appendChild(tip);
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
  });
  const dots = Array.from(dotsContainer.children);

  // --- Observe slides for in-view ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          if (idx !== -1) setCurrent(idx);
          entry.target.classList.add('in-view');
        }
      });
    },
    { root: deck, threshold: 0.55 }
  );
  slides.forEach((s) => observer.observe(s));

  function setCurrent(idx) {
    current = idx;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    progressBar.style.width = `${((idx + 1) / slides.length) * 100}%`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === slides.length - 1;
  }

  function goTo(idx) {
    idx = Math.max(0, Math.min(slides.length - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth' });
  }

  // --- Arrow buttons ---
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // --- Keyboard navigation ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(slides.length - 1);
    }
  });

  // --- Initial state ---
  setCurrent(0);
  slides[0].classList.add('in-view');

  // =================== LIGHTBOX ===================
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let lbItems = [];
  let lbIdx = 0;

  // Collect all lightbox-able images (gallery tiles + certificate)
  document.querySelectorAll('.media-grid .tile img, .award-cert img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lbItems = Array.from(document.querySelectorAll('.media-grid .tile img, .award-cert img'));
      lbIdx = lbItems.indexOf(img);
      openLb();
    });
  });

  function openLb() {
    lbImg.src = lbItems[lbIdx].src;
    lbImg.alt = lbItems[lbIdx].alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbImg.src = lbItems[lbIdx].src; });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbIdx = (lbIdx + 1) % lbItems.length; lbImg.src = lbItems[lbIdx].src; });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbImg.src = lbItems[lbIdx].src; }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbItems.length; lbImg.src = lbItems[lbIdx].src; }
  });

})();
