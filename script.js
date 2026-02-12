(() => {
  'use strict';

  // ========================================
  // Router
  // ========================================

  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const nav = document.querySelector('.nav');

  function getPageId(hash) {
    const id = hash.replace('#', '') || 'about';
    const validPages = ['about', 'research', 'projects', 'experience', 'blog', 'gallery', 'favorites', 'contact'];
    return validPages.includes(id) ? id : 'about';
  }

  function navigateTo(pageId, pushState) {
    // Hide current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
      currentPage.classList.remove('visible');
      // Wait for fade-out, then switch
      setTimeout(() => {
        currentPage.classList.remove('active');
        showPage(pageId);
      }, 200);
    } else {
      showPage(pageId);
    }

    // Update nav links
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href').replace('#', '');
      const isActive = linkPage === pageId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-selected', isActive);
    });

    // Close mobile nav
    closeMobileNav();

    // Update hash
    if (pushState !== false) {
      history.replaceState(null, '', '#' + pageId);
    }
  }

  function showPage(pageId) {
    const page = document.getElementById('page-' + pageId);
    if (!page) return;

    page.classList.add('active');

    // Trigger reflow for transition
    page.offsetHeight;

    requestAnimationFrame(() => {
      page.classList.add('visible');
      animateStaggerElements(page);
    });

    // Scroll to top
    window.scrollTo(0, 0);
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
      }, 100 + i * 80);
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

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Close mobile nav on outside click
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

    // Clone the placeholder content for the lightbox
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

  // Keyboard navigation for lightbox
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

  // Close lightbox on backdrop click
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

  const initialPage = getPageId(window.location.hash);
  navigateTo(initialPage, false);

})();
