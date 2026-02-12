(() => {
  'use strict';

  // ========================================
  // Router
  // ========================================

  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const nav = document.querySelector('.nav');
  const scrollTrack = document.getElementById('scroll-track');
  const scrollViewport = document.querySelector('.scroll-viewport');
  const allPages = Array.from(scrollTrack.querySelectorAll('.page'));

  // Active page order (matches DOM order of .page sections)
  const pageOrder = ['about', 'research', 'projects', 'experience',
    /* 'blog', 'gallery', 'favorites', */ 'contact'];

  // Build index map: pageId -> panel index in DOM
  const pageIndexMap = {};
  allPages.forEach((page, i) => {
    const id = page.id.replace('page-', '');
    pageIndexMap[id] = i;
  });

  // Map active tabs to painting position (evenly distributed 0%–100%)
  const bgPositions = {};
  pageOrder.forEach((id, i) => {
    bgPositions[id] = (i / (pageOrder.length - 1)) * 100 + '%';
  });

  let currentPageId = null;

  function getPageId(hash) {
    const id = hash.replace('#', '') || 'about';
    return pageOrder.includes(id) ? id : 'about';
  }

  function navigateTo(pageId, pushState) {
    if (pageId === currentPageId) return;

    const index = pageIndexMap[pageId];
    if (index === undefined) return;

    // Slide the track (content) and shift the painting
    scrollTrack.style.transform = 'translateX(-' + (index * 100) + 'vw)';
    scrollViewport.style.backgroundPositionX = bgPositions[pageId];

    // Reset scroll position of target panel
    allPages[index].scrollTop = 0;

    // Update nav links
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href').replace('#', '');
      const isActive = linkPage === pageId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-selected', isActive);
    });

    // Trigger stagger animations on the target page
    animateStaggerElements(allPages[index]);

    // Close mobile nav
    closeMobileNav();

    // Update hash
    if (pushState !== false) {
      history.replaceState(null, '', '#' + pageId);
    }

    currentPageId = pageId;
  }

  // ========================================
  // Stagger Animations
  // ========================================

  function animateStaggerElements(container) {
    const elements = container.querySelectorAll('.stagger');
    elements.forEach((el, i) => {
      el.classList.remove('animate-in');
      setTimeout(() => {
        el.classList.add('animate-in');
      }, 200 + i * 80);
    });
  }

  // ========================================
  // Mobile Navigation
  // ========================================

  function toggleMobileNav() {
    const isOpen = navLinksContainer.classList.contains('open');
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function openMobileNav() {
    navLinksContainer.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    navLinksContainer.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', toggleMobileNav);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeMobileNav();
    }
  });

  // ========================================
  // Nav scroll shadow
  // ========================================

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', lastScrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ========================================
  // Hash Navigation
  // ========================================

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('href').replace('#', '');
      navigateTo(pageId);
    });
  });

  window.addEventListener('hashchange', () => {
    const pageId = getPageId(window.location.hash);
    navigateTo(pageId, false);
  });

  // ========================================
  // Gallery Lightbox
  // ========================================

  const lightbox = document.getElementById('lightbox');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightboxContent();
    lightbox.hidden = false;
    requestAnimationFrame(() => {
      lightbox.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }, 300);
  }

  function updateLightboxContent() {
    const item = galleryItems[currentGalleryIndex];
    if (!item) return;

    const imgEl = item.querySelector('.gallery-img');
    const caption = item.querySelector('.gallery-caption');

    lightboxImg.innerHTML = imgEl.innerHTML;
    lightboxImg.style.backgroundColor = window.getComputedStyle(imgEl).backgroundColor;
    lightboxImg.style.aspectRatio = window.getComputedStyle(imgEl).aspectRatio;
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  function nextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  function prevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // ========================================
  // Keyboard Navigation for Tabs
  // ========================================

  navLinksContainer.addEventListener('keydown', (e) => {
    const links = Array.from(navLinks);
    const currentIndex = links.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let newIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % links.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + links.length) % links.length;
    }

    if (newIndex !== undefined) {
      links[newIndex].focus();
    }
  });

  // ========================================
  // Initial Load
  // ========================================

  // No transition on first load
  scrollTrack.style.transition = 'none';
  scrollViewport.style.transition = 'none';
  const initialPage = getPageId(window.location.hash);
  navigateTo(initialPage, false);
  // Re-enable transitions after first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollTrack.style.transition = '';
      scrollViewport.style.transition = '';
    });
  });

})();
