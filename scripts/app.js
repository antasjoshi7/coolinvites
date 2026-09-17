/* ==========================================================================
   The Cool Shaadi Invites — Main Application & Scroll-Scaling Engine
   ========================================================================== */

(function () {
  'use strict';

  // Config
  const WHATSAPP_LEAD_NUMBER = "919818673111"; // Direct business WhatsApp line

  function initApp() {
    initScrollScalingVideo();
    initVideoPlayerControls();
    initLeadInquiryForm();
    initFaqAccordion();
    initStickyMobileBar();
    initSmoothAnchors();
  }

  // 1. Scroll-Driven Scaling Video Frame (Scales smoothly up to 90% of screen size)
  function initScrollScalingVideo() {
    const track = document.getElementById('showcase-track');
    const scalingWrapper = document.getElementById('device-scaling-wrapper');
    const progressEl = document.getElementById('scale-progress-percent');

    if (!track || !scalingWrapper) return;

    function handleScroll() {
      const rect = track.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Total scrollable distance within this section
      const totalScrollable = track.offsetHeight - windowHeight;
      if (totalScrollable <= 0) return;

      // Calculate progress from 0 (at entry) to 1 (when reached full expansion)
      const scrolled = -rect.top;
      let progress = scrolled / (totalScrollable * 0.85); // Reach max at ~85% of track for comfortable lock
      progress = Math.min(Math.max(progress, 0), 1);

      // Starting width: 360px on desktop (or 75vw on small mobile)
      const minWidth = Math.min(360, windowWidth * 0.78);
      // Maximum width: exactly 90% of screen width (capped at 1150px for ultra-wide monitors)
      const maxWidth = Math.min(windowWidth * 0.90, 1150);

      // Smooth cubic interpolation
      const easeProgress = easeOutCubic(progress);
      const currentWidth = minWidth + (maxWidth - minWidth) * easeProgress;

      scalingWrapper.style.width = `${currentWidth}px`;

      // Update badge indicator
      if (progressEl) {
        const percent = Math.round(progress * 100);
        progressEl.textContent = `${percent}% VIEW`;
      }
    }

    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Video Player Native Controls (Play/Pause, Mute/Unmute)
  function initVideoPlayerControls() {
    const video = document.getElementById('preview-recording-video');
    const playBtn = document.getElementById('video-toggle-play');
    const muteBtn = document.getElementById('video-toggle-mute');

    if (!video) return;

    function tryPlayVideo() {
      if (video.paused) {
        video.play().then(() => {
          if (playBtn) {
            playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
            playBtn.setAttribute('title', 'Pause Video');
          }
        }).catch(() => {});
      }
    }

    // Try playing immediately
    tryPlayVideo();

    // Also trigger on first interaction anywhere
    document.addEventListener('click', tryPlayVideo, { once: true });
    document.addEventListener('touchstart', tryPlayVideo, { once: true });

    // Clicking the video screen directly toggles play/pause
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      } else {
        video.pause();
        if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      }
    });

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play();
          playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
          playBtn.setAttribute('title', 'Pause Video');
        } else {
          video.pause();
          playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
          playBtn.setAttribute('title', 'Play Video');
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (video.muted) {
          muteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
          muteBtn.setAttribute('title', 'Unmute Sound');
        } else {
          muteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
          muteBtn.setAttribute('title', 'Mute Sound');
        }
      });
    }

    // Pause when scrolled completely out of view to preserve resources
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(video);
    }
  }

  // 3. Lead Capture & E-commerce Flow
  function initLeadInquiryForm() {
    const form = document.getElementById('inquiry-form');
    const modal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalWaBtn = document.getElementById('modal-whatsapp-direct');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const coupleNames = (document.getElementById('lead-couple-names') || {}).value || 'Couple';
      const phone = (document.getElementById('lead-phone') || {}).value || '';
      const email = (document.getElementById('lead-email') || {}).value || '';
      const insta = (document.getElementById('lead-insta') || {}).value || '';
      const city = (document.getElementById('lead-city') || {}).value || '';
      const weddingMonth = (document.getElementById('lead-month') || {}).value || 'Upcoming';

      // Validation
      if (!phone || phone.trim().length < 8) {
        alert("Please enter a valid WhatsApp Mobile Number so we can share samples!");
        return;
      }

      // 1. Store lead locally
      const leadData = {
        coupleNames,
        phone,
        email,
        insta,
        city,
        weddingMonth,
        timestamp: new Date().toISOString()
      };

      try {
        const storedLeads = JSON.parse(localStorage.getItem('cool_shaadi_leads') || '[]');
        storedLeads.push(leadData);
        localStorage.setItem('cool_shaadi_leads', JSON.stringify(storedLeads));
      } catch (err) {
        console.error("Local save error:", err);
      }

      // 2. Prepare pre-filled WhatsApp message
      const msg = `Namaste! I'm interested in getting a modern wedding website invite from The Cool Shaadi Invites.\n\n` +
                  `👤 Couple / Name: ${coupleNames}\n` +
                  `📱 Mobile (WhatsApp): ${phone}\n` +
                  `📧 Email: ${email || 'N/A'}\n` +
                  `📸 Instagram: ${insta || 'N/A'}\n` +
                  `📍 Wedding Location: ${city}\n` +
                  `🗓️ Wedding Month: ${weddingMonth}\n\n` +
                  `Please share package details, samples & availability!`;

      const waUrl = `https://wa.me/${WHATSAPP_LEAD_NUMBER}?text=${encodeURIComponent(msg)}`;

      // 3. Open Success Modal
      if (modal) {
        const modalMsg = document.getElementById('modal-summary-text');
        if (modalMsg) {
          modalMsg.textContent = `Thank you ${coupleNames}! We've saved your inquiry for ${city}. Connect instantly on WhatsApp to review live samples:`;
        }
        if (modalWaBtn) {
          modalWaBtn.setAttribute('href', waUrl);
        }
        modal.classList.add('open');
      } else {
        // Fallback directly to WhatsApp
        window.open(waUrl, '_blank');
      }

      form.reset();
    });

    if (modalCloseBtn && modal) {
      modalCloseBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  }

  // 4. FAQ Accordion Toggle
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      item.addEventListener('click', function () {
        const wasActive = this.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!wasActive) {
          this.classList.add('active');
        }
      });
    });
  }

  // 5. Sticky Mobile Bottom CTA Bar
  function initStickyMobileBar() {
    const stickyBar = document.getElementById('sticky-mobile-cta');
    const heroSection = document.querySelector('.hero-section');

    if (!stickyBar || !heroSection) return;

    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // 6. Smooth Scroll Anchors
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initApp);
})();
