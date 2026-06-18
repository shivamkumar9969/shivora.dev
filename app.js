/* ═══════════════════════════════════════════════════════════════
   NEXUS OS — Futuristic Developer Portfolio
   Complete JavaScript — Interactions, Terminal, Command Palette,
   Easter Eggs, Animations, Cursor, and more.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM References ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ─── State ───
  const state = {
    booted: false,
    activeSection: 'section-identity',
    terminalOpen: false,
    cmdPaletteOpen: false,
    shortcutsOpen: false,
    terminalHistory: [],
    terminalHistoryIdx: -1,
    terminalCmdHistory: [],
    konamiProgress: 0,
    matrixActive: false,
    bgMatrixInitialized: false,
    companionDragOffset: null,
  };

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // ═══════════════════════════════════════════════════════════════
  // BOOT SEQUENCE
  // ═══════════════════════════════════════════════════════════════
  function initBootSequence() {
    const canvas = $('#boot-canvas');
    const ctx = canvas.getContext('2d');
    const content = $('#boot-content');
    const nameEl = $('#boot-name');
    const roleEl = $('#boot-role');
    const progressEl = $('#boot-progress');
    const progressBar = $('#boot-progress-bar');
    const statusEl = $('#boot-status');
    const skipBtn = $('#boot-skip');

    let particles = [];
    let animFrame;
    let booted = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      if (!booted) animFrame = requestAnimationFrame(drawParticles);
    }

    drawParticles();

    // Boot sequence timeline
    async function runBoot() {
      await sleep(500);
      content.classList.add('visible');
      nameEl.textContent = 'SHIVAM KUMAR';
      await sleep(400);
      roleEl.textContent = 'SENIOR FULL-STACK DEVELOPER';
      roleEl.classList.add('visible');
      await sleep(600);
      progressEl.classList.add('visible');
      statusEl.classList.add('visible');

      const statuses = [
        'Initializing NEXUS OS...',
        'Loading neural modules...',
        'Compiling portfolio data...',
        'Establishing connections...',
        'System ready.',
      ];

      for (let i = 0; i <= 100; i += 2) {
        progressBar.style.width = i + '%';
        if (i % 20 === 0) {
          statusEl.textContent = statuses[Math.floor(i / 25)] || statuses[statuses.length - 1];
        }
        await sleep(20);
        if (booted) return;
      }

      await sleep(400);
      finishBoot();
    }

    function finishBoot() {
      if (booted) return;
      booted = true;
      state.booted = true;
      const bootScreen = $('#boot-screen');
      bootScreen.classList.add('fade-out');
      cancelAnimationFrame(animFrame);
      setTimeout(() => {
        bootScreen.style.display = 'none';
        showApp();
      }, 800);
    }

    // Skip
    skipBtn.addEventListener('click', finishBoot);
    document.addEventListener('keydown', function bootKey(e) {
      if (!state.booted) {
        finishBoot();
        document.removeEventListener('keydown', bootKey);
      }
    }, { once: false });

    runBoot();
  }

  function showApp() {
    const app = $('#app');
    app.style.opacity = '1';
    app.style.visibility = 'visible';
    app.classList.add('visible');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      $('#dock').classList.add('visible');
      $('#reading-progress').classList.add('visible');
      initScrollObserver();
      initDock();
      initScrollProgress();
      initCompanionDraggable();
    }, 300);
  }

  // ═══════════════════════════════════════════════════════════════
  // BACKGROUND CANVAS (Neural Network Ambient)
  // ═══════════════════════════════════════════════════════════════
  function initBgCanvas() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += dx * 0.02;
          p.y += dy * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fill();

        // Connect nearby
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - d / 150) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  // ═══════════════════════════════════════════════════════════════
  // AMBIENT BACKGROUND MATRIX RAIN (Runs continuously, every 20s)
  // ═══════════════════════════════════════════════════════════════
  function initBgMatrixCanvas() {
    if (state.bgMatrixInitialized) return;
    state.bgMatrixInitialized = true;

    const canvas = $('#bg-matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:<>?シヴァムクマル';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = [];

    function resetDrops() {
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns);
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -25); // staggered starts off-screen
      }
    }
    resetDrops();

    window.addEventListener('resize', () => {
      resetDrops();
    });

    let lastReset = Date.now();

    function draw() {
      const now = Date.now();
      const elapsed = now - lastReset;

      if (elapsed >= 20000) {
        // Clear canvas before starting the new wave to ensure no ghost text remains
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Restart wave
        lastReset = now;
        resetDrops();
      }

      if (elapsed < 4000) {
        // Use destination-out to fade previous frames transparently (no dark background box!)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // controls trail fade out speed
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = fontSize + 'px monospace';

        drops.forEach((y, i) => {
          if (y >= 0 && y * fontSize <= canvas.height) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            // Exact same teal-cyan color scheme as terminal matrix rain
            ctx.fillStyle = Math.random() > 0.98 ? '#fff' : `hsl(${160 + Math.random() * 40}, 100%, ${50 + Math.random() * 30}%)`;
            ctx.fillText(char, i * fontSize, y * fontSize);
          }
          drops[i]++; // Increments every single frame for exact matching speed!
        });
      } else {
        // Clear canvas completely on every frame during the pause state to remove all text remnants
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  // ═══════════════════════════════════════════════════════════════
  // CUSTOM CURSOR
  // ═══════════════════════════════════════════════════════════════
  function initCursor() {
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    // Check if touch device
    if ('ontouchstart' in window) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const hoverables = 'a, button, input, textarea, .dock-item, .project-card-inner, .skill-node, .timeline-card, .award-card, .cert-card, .social-orb, .filter-btn, .signal-link, .cta-button, .cyber-character, .cyber-skateboard, .avatar-bubble';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SCROLL OBSERVER (Reveal Animations)
  // ═══════════════════════════════════════════════════════════════
  function initScrollObserver() {
    const scrollContainer = $('#scroll-container');
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || '0');
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
          }
        });
      },
      {
        root: scrollContainer,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    $$('.reveal-item').forEach(el => observer.observe(el));

    // Skill node progress bars
    const skillObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const level = entry.target.dataset.level;
            entry.target.style.setProperty('--level-pct', level + '%');
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        root: scrollContainer,
        threshold: 0.1,
      }
    );

    $$('.skill-node').forEach(el => skillObserver.observe(el));

    // Section tracking for dock
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            updateActiveSection(entry.target.id);
          }
        });
      },
      {
        root: scrollContainer,
        threshold: [0.3, 0.6],
      }
    );

    $$('.section').forEach(el => sectionObserver.observe(el));

  }

  const companionMessages = {
    identity: () => {
      const hours = new Date().getHours();
      let greeting = 'Good Morning';
      if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
      else if (hours >= 17 && hours < 22) greeting = 'Good Evening';
      else if (hours >= 22 || hours < 5) greeting = 'Good Late Night';
      return `${greeting}! I'm Shivora, Shivam's companion bot. Scroll down and I'll skate along with you!`;
    },
    skills: () => "SHIVORA // COGNITIVE_SCAN: Node core active. Skills listed: Laravel, PHP, JS, SQL. 100% database integrity.",
    experience: () => "SHIVORA // TIMELINE_LOG: Experience logs active. Verifying GKU & Rackron developer roles... verified.",
    projects: () => "SHIVORA // PROJECTS_LAB: Indexing portfolio builds. Reviewing gkuonline.in & admissions portal codebases.",
    achievements: () => "SHIVORA // HONORS_VAULT: Cyber-accolades loaded. Hackathons, certifications, and awards verified.",
    contact: () => "SHIVORA // COM_LINK: Signal open. Feed variables to form input nodes to send transmission directly."
  };

  let typewriterInterval;
  function updateCompanionMessage(sectionId) {
    const bubbleText = document.querySelector('#scroll-companion-avatar .bubble-text');
    if (bubbleText) {
      const shortName = sectionId.replace('section-', '');
      if (companionMessages[shortName]) {
        const messageText = companionMessages[shortName]();
        
        // Character typewriter printing animation (terminal/movie style)
        clearInterval(typewriterInterval);
        bubbleText.textContent = '';
        let i = 0;
        typewriterInterval = setInterval(() => {
          if (i < messageText.length) {
            bubbleText.textContent += messageText.charAt(i);
            i++;
          } else {
            clearInterval(typewriterInterval);
          }
        }, 15); // Fast and snappy character typing speed
      }
    }
  }

  function updateCompanionPosition(sectionId, animate = true) {
    const container = $('#scroll-container');
    const target = document.querySelector(`#${sectionId} .avatar-target`);
    const companion = $('#scroll-companion-avatar');
    if (target && companion && container) {
      const targetRect = target.getBoundingClientRect();
      
      // Calculate coordinates relative to the viewport (fixed position)
      let targetLeft, targetTop;
      let minLeft = 80;
      let minTop = 140;

      if (state.companionDragOffset) {
        targetLeft = targetRect.left + state.companionDragOffset.x;
        targetTop = targetRect.top + state.companionDragOffset.y;
        minLeft = 50; // more permissive when user customized it
        minTop = 100;
      } else {
        targetTop = targetRect.top - 90;
        targetLeft = targetRect.left - 40;
        
        // Custom offset for Identity section to sit neatly to the right of "Shivam Kumar" name
        if (sectionId === 'section-identity') {
          targetLeft += 80;
          targetTop += 12;
        }
      }
      
      // Clamp targetLeft to ensure the speech bubble (190px width) does not get cut off
      if (targetLeft < minLeft) {
        targetLeft = minLeft;
      }
      
      // Clamp targetTop to prevent skateboarder from scrolling off-screen vertically.
      const maxTop = window.innerHeight * 0.85;
      if (targetTop < minTop) targetTop = minTop;
      if (targetTop > maxTop) targetTop = maxTop;
      
      const currentTop = parseFloat(companion.style.top) || 0;
      const direction = targetTop > currentTop ? 'down' : 'up';
      
      if (!animate) {
        companion.style.transition = 'none';
        companion.style.top = targetTop + 'px';
        companion.style.left = targetLeft + 'px';
        companion.offsetHeight; // force reflow
        companion.style.transition = '';
        return;
      }
      
      companion.style.top = targetTop + 'px';
      companion.style.left = targetLeft + 'px';
      
      companion.classList.add('is-skating');
      if (direction === 'down') {
        companion.classList.add('direction-down');
        companion.classList.remove('direction-up');
      } else {
        companion.classList.add('direction-up');
        companion.classList.remove('direction-down');
      }
      
      clearTimeout(companion.skateTimeout);
      companion.skateTimeout = setTimeout(() => {
        companion.classList.remove('is-skating');
        companion.classList.remove('direction-down');
        companion.classList.remove('direction-up');
      }, 900); // matches transition duration
    }
  }

  function updateActiveSection(sectionId) {
    if (state.activeSection === sectionId) return;
    state.activeSection = sectionId;
    $$('.dock-item').forEach(item => {
      item.classList.toggle('active', item.dataset.target === sectionId);
    });

    updateCompanionPosition(sectionId, true);
  }

  // ═══════════════════════════════════════════════════════════════
  // SCROLL PROGRESS BAR & TIMELINE SCROLL HANDLER
  // ═══════════════════════════════════════════════════════════════
  function initScrollProgress() {
    const container = $('#scroll-container');
    const fill = $('#reading-progress-fill');
    if (!container || !fill) return;

    let isScrollingTimeout;

    // Initial position and greeting on load after layout settles
    setTimeout(() => {
      updateCompanionPosition(state.activeSection, false);
      updateCompanionMessage(state.activeSection);
    }, 600);

    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progressRatio = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
      
      fill.style.width = (progressRatio * 100) + '%';

      // Temporarily disable hover pointer events on scroll to prevent hover z-index hijacking
      document.body.classList.add('is-scrolling');
      clearTimeout(isScrollingTimeout);
      isScrollingTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
        // Scrolling has stopped! Now trigger the typewriter message for the current active section
        updateCompanionMessage(state.activeSection);
      }, 150);

      // Lock companion position to target on scroll when NOT transitioning between sections
      const companion = $('#scroll-companion-avatar');
      if (companion && !companion.classList.contains('is-skating')) {
        updateCompanionPosition(state.activeSection, false);
      }
    });

    // Handle resize
    window.addEventListener('resize', () => {
      updateCompanionPosition(state.activeSection, false);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // DRAGGABLE ROBOT COMPANION
  // ═══════════════════════════════════════════════════════════════
  function initCompanionDraggable() {
    const companion = $('#scroll-companion-avatar');
    if (!companion) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const dragTargets = companion.querySelectorAll('.cyber-character, .cyber-skateboard, .avatar-bubble');
    dragTargets.forEach(el => {
      el.addEventListener('mousedown', dragStart);
      el.addEventListener('touchstart', dragStart, { passive: false });
    });

    function dragStart(e) {
      if (e.type === 'mousedown' && e.button !== 0) return;
      
      e.preventDefault();
      isDragging = true;
      companion.classList.add('is-dragging');

      const rect = companion.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;

      document.addEventListener('mousemove', dragMove, { passive: false });
      document.addEventListener('touchmove', dragMove, { passive: false });
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      // safety clamping
      const minLeft = 50;
      const maxLeft = window.innerWidth - 100;
      const minTop = 100;
      const maxTop = window.innerHeight - 120;

      if (newLeft < minLeft) newLeft = minLeft;
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newTop < minTop) newTop = minTop;
      if (newTop > maxTop) newTop = maxTop;

      companion.style.top = newTop + 'px';
      companion.style.left = newLeft + 'px';

      const target = document.querySelector(`#${state.activeSection} .avatar-target`);
      if (target) {
        const targetRect = target.getBoundingClientRect();
        state.companionDragOffset = {
          x: newLeft - targetRect.left,
          y: newTop - targetRect.top
        };
      }
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      companion.classList.remove('is-dragging');

      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('touchmove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchend', dragEnd);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ORBITAL DOCK
  // ═══════════════════════════════════════════════════════════════
  function initDock() {
    const dockItems = $$('.dock-item');
    const dockContainer = $('#dock-items');

    // Navigation click
    dockItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.target;
        const section = $('#' + target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Magnetic magnification effect
    dockContainer.addEventListener('mousemove', e => {
      dockItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - itemCenter);
        const maxDist = 100;

        item.classList.remove('neighbor');

        if (dist < maxDist) {
          const scale = 1 + (1 - dist / maxDist) * 0.25;
          const translateY = -(1 - dist / maxDist) * 10;
          item.style.transform = `translateY(${translateY}px) scale(${scale})`;
        } else {
          item.style.transform = '';
        }
      });
    });

    dockContainer.addEventListener('mouseleave', () => {
      dockItems.forEach(item => {
        item.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 3D TILT EFFECT (Identity Card)
  // ═══════════════════════════════════════════════════════════════
  function initCardTilt() {
    const card = $('#identity-card');
    if (!card) return;
    const content = card.querySelector('.identity-card-content');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * -8;
      const rotateY = (x - 0.5) * 8;

      content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      content.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PROJECT FILTERS
  // ═══════════════════════════════════════════════════════════════
  function initProjectFilters() {
    const filterBtns = $$('.filter-btn');
    const cards = $$('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
            card.style.display = '';
          } else {
            card.classList.add('hidden');
            setTimeout(() => { card.style.display = 'none'; }, 500);
          }
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PROJECT CARD TILT
  // ═══════════════════════════════════════════════════════════════
  function initProjectCardTilt() {
    $$('.project-card-inner').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -6;
        const rotateY = (x - 0.5) * 6;
        card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CONTACT FORM
  // ═══════════════════════════════════════════════════════════════
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = $('#contact-submit');
      submitBtn.classList.add('loading');

      // Simulate sending (since we don't have emailjs in vanilla)
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        form.style.display = 'none';
        const success = $('#form-success');
        success.style.display = 'flex';

        setTimeout(() => {
          form.reset();
          form.style.display = 'flex';
          success.style.display = 'none';
        }, 4000);
      }, 1500);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // COMMAND PALETTE
  // ═══════════════════════════════════════════════════════════════
  const CP_COMMANDS = [
    { id: 'identity', label: 'Go to Identity (About)', icon: '👤', category: 'Navigation', shortcut: '1', action: () => scrollTo('section-identity') },
    { id: 'skills', label: 'Go to Neural Map (Skills)', icon: '🧠', category: 'Navigation', shortcut: '2', action: () => scrollTo('section-skills') },
    { id: 'experience', label: 'Go to Timeline (Experience)', icon: '⏱️', category: 'Navigation', shortcut: '3', action: () => scrollTo('section-experience') },
    { id: 'projects', label: 'Go to Projects Lab', icon: '💻', category: 'Navigation', shortcut: '4', action: () => scrollTo('section-projects') },
    { id: 'achievements', label: 'Go to Achievements Vault', icon: '🏆', category: 'Navigation', shortcut: '5', action: () => scrollTo('section-achievements') },
    { id: 'contact', label: 'Go to Transmission (Contact)', icon: '📡', category: 'Navigation', shortcut: '6', action: () => scrollTo('section-contact') },
    { id: 'terminal', label: 'Toggle Terminal', icon: '⌨️', category: 'View', shortcut: '`', action: toggleTerminal },
    { id: 'shortcuts', label: 'Show Keyboard Shortcuts', icon: '⌨️', category: 'Help', shortcut: '?', action: toggleShortcuts },
    { id: 'github', label: 'Open GitHub Profile', icon: '🐙', category: 'Links', action: () => window.open('https://github.com/shivamkumar9969', '_blank') },
    { id: 'linkedin', label: 'Open LinkedIn Profile', icon: '💼', category: 'Links', action: () => window.open('https://www.linkedin.com/in/shivam-kumar-7b896a254/', '_blank') },
    { id: 'email', label: 'Send Email', icon: '📧', category: 'Links', action: () => window.open('mailto:shivamkumar9969@gmail.com') },
    { id: 'matrix', label: 'Toggle Matrix Rain ☔', icon: '🕹️', category: 'Easter Egg', action: toggleMatrix },
    { id: 'top', label: 'Scroll to Top', icon: '⬆️', category: 'Navigation', action: () => scrollTo('section-identity') },
  ];

  function initCommandPalette() {
    const palette = $('#command-palette');
    const input = $('#cp-input');
    const results = $('#cp-results');
    const backdrop = palette.querySelector('.cp-backdrop');
    let selectedIdx = 0;
    let filtered = [...CP_COMMANDS];

    function open() {
      state.cmdPaletteOpen = true;
      palette.style.display = 'flex';
      input.value = '';
      selectedIdx = 0;
      filtered = [...CP_COMMANDS];
      renderResults();
      setTimeout(() => input.focus(), 50);
    }

    function close() {
      state.cmdPaletteOpen = false;
      palette.style.display = 'none';
    }

    function renderResults() {
      if (filtered.length === 0) {
        results.innerHTML = '<div class="cp-empty">No matching commands</div>';
        return;
      }

      results.innerHTML = filtered.map((cmd, i) => `
        <div class="cp-item${i === selectedIdx ? ' active' : ''}" data-index="${i}">
          <span class="cp-item-icon">${cmd.icon}</span>
          <span class="cp-item-label">${cmd.label}</span>
          ${cmd.shortcut ? `<span class="cp-item-shortcut">${cmd.shortcut}</span>` : ''}
          <span class="cp-item-cat">${cmd.category}</span>
        </div>
      `).join('');

      // Scroll active into view
      const active = results.querySelector('.cp-item.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function execute(cmd) {
      close();
      if (cmd.action) cmd.action();
    }

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      filtered = q
        ? CP_COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
        : [...CP_COMMANDS];
      selectedIdx = 0;
      renderResults();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, filtered.length - 1); renderResults(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, 0); renderResults(); }
      if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIdx]) execute(filtered[selectedIdx]); }
    });

    results.addEventListener('click', e => {
      const item = e.target.closest('.cp-item');
      if (item) execute(filtered[parseInt(item.dataset.index)]);
    });

    results.addEventListener('mousemove', e => {
      const item = e.target.closest('.cp-item');
      if (item) {
        selectedIdx = parseInt(item.dataset.index);
        renderResults();
      }
    });

    backdrop.addEventListener('click', close);

    // Global shortcut
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (state.cmdPaletteOpen) close(); else open();
      }
    });
  }

  function scrollTo(sectionId) {
    const section = $('#' + sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ═══════════════════════════════════════════════════════════════
  // TERMINAL
  // ═══════════════════════════════════════════════════════════════
  const TERMINAL_COMMANDS = {
    help: () => [
      'Available commands:',
      '',
      '  whoami          — Who am I?',
      '  about           — About me',
      '  skills          — List my tech skills',
      '  ls projects     — List all projects',
      '  experience      — Work experience',
      '  contact         — Contact info',
      '  open <section>  — Navigate to section',
      '  clear           — Clear terminal',
      '  echo <text>     — Echo text',
      '  date            — Current date/time',
      '  neofetch        — System info',
      '  sudo hire-me    — 🤫',
      '  matrix          — Toggle Matrix rain',
      '  help            — Show this message',
      '',
      '  Tip: Use ↑↓ for command history, Tab for autocomplete',
    ],

    whoami: () => [
      '',
      '  ┌──────────────────────────────────────┐',
      '  │  Shivam Kumar                        │',
      '  │  Senior Full-Stack Developer           │',
      '  │  Full-Stack | MERN | Laravel | AWS   │',
      '  │  github.com/shivamkumar9969         │',
      '  └──────────────────────────────────────┘',
      '',
    ],

    about: () => [
      '',
      '  Hi! I\'m Shivam Kumar 👋',
      '',
      '  I specialize in building high-performance',
      '  backend systems with Node.js, Next.js, and Laravel.',
      '  I design secure REST APIs, optimize database ops,',
      '  and deliver architectures that scale effortlessly.',
      '',
      '  I believe in writing code that\'s not just functional',
      '  — but maintainable, efficient, and built to scale.',
      '',
    ],

    skills: () => [
      '',
      '  ┌──────────────────┬───────────────────┐',
      '  │ Languages        │ JS, PHP, Python,  │',
      '  │                  │ C++, TS, Java     │',
      '  ├──────────────────┼───────────────────┤',
      '  │ Frontend         │ React, HTML, CSS  │',
      '  ├──────────────────┼───────────────────┤',
      '  │ Backend          │ Laravel, Node,    │',
      '  │                  │ Express, Next.js  │',
      '  ├──────────────────┼───────────────────┤',
      '  │ Database         │ SQL, MongoDB      │',
      '  ├──────────────────┼───────────────────┤',
      '  │ Tools            │ Git, Linux, AWS,  │',
      '  │                  │ DevOps, REST API  │',
      '  └──────────────────┴───────────────────┘',
      '',
    ],

    experience: () => [
      '',
      '  🏢 Guru Kashi University',
      '     Senior Full-Stack Developer │ Dec 2025 — Present',
      '     → React, Node.js, Laravel, PHP, Databases',
      '',
      '  🏢 Rackron Technologies Pvt Ltd',
      '     Backend Developer │ June 2024 — Dec 2025',
      '     → Node.js, Laravel, MERN, AWS',
      '',
      '  🎓 DevTown',
      '     Full Stack Intern │ Sep — Nov 2023',
      '     → React.js, Node.js, MongoDB',
      '',
    ],

    contact: () => [
      '',
      '  📧 Email:    shivamkumar9969@gmail.com',
      '  🐙 GitHub:   github.com/shivamkumar9969',
      '  💼 LinkedIn: linkedin.com/in/shivam-kumar-7b896a254',
      '  🐦 Twitter:  @shivamkumar9969',
      '',
    ],

    'ls projects': () => [
      '',
      '  drwxr-xr-x  gku-portal/',
      '  drwxr-xr-x  gku-online/',
      '  drwxr-xr-x  gku-admission/',
      '  drwxr-xr-x  flax-collective/',
      '  drwxr-xr-x  amazon-repricer/',
      '  drwxr-xr-x  crypto-automation/',
      '  drwxr-xr-x  easy-peasy/',
      '  drwxr-xr-x  invoice-generator/',
      '  drwxr-xr-x  e-commerce/',
      '  drwxr-xr-x  drive-buddy/',
      '  drwxr-xr-x  defiance-system/',
      '  drwxr-xr-x  education-admin/',
      '',
      '  12 directories',
      '',
    ],

    ls: () => TERMINAL_COMMANDS['ls projects'](),

    date: () => [
      '  ' + new Date().toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
    ],

    neofetch: () => [
      '',
      '  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗',
      '  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝',
      '  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗',
      '  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║',
      '  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║',
      '  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
      '',
      '  OS:      NEXUS OS v1.0',
      '  Host:    Shivam Kumar',
      '  Kernel:  Vanilla JS (Pure)',
      '  Shell:   NEXUS Terminal',
      '  Theme:   Cybernetic Dark',
      '  Icons:   Inline SVG',
      '  Font:    Inter / JetBrains Mono',
      '  CPU:     requestAnimationFrame()',
      '  GPU:     CSS transform3d',
      '  Memory:  Zero Dependencies',
      '',
    ],

    'sudo hire-me': () => [
      '',
      '  🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉',
      '  🚀 CONGRATULATIONS! You\'ve unlocked:',
      '  ',
      '  ╔═══════════════════════════════════════╗',
      '  ║   ✅ A highly motivated developer     ║',
      '  ║   ✅ Full-stack expertise              ║',
      '  ║   ✅ Clean code enthusiast             ║',
      '  ║   ✅ Team player & fast learner        ║',
      '  ║   ✅ Available for exciting roles!     ║',
      '  ╚═══════════════════════════════════════╝',
      '  ',
      '  📩 Let\'s connect: shivamkumar9969@gmail.com',
      '  🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉',
      '',
    ],

    matrix: () => {
      toggleMatrix();
      return ['  Matrix rain ' + (state.matrixActive ? 'activated' : 'deactivated') + '! 🕹️'];
    },
  };

  const SECTION_MAP = {
    identity: 'section-identity',
    about: 'section-identity',
    skills: 'section-skills',
    experience: 'section-experience',
    projects: 'section-projects',
    achievements: 'section-achievements',
    contact: 'section-contact',
  };

  function initTerminal() {
    const terminal = $('#terminal');
    const output = $('#terminal-output');
    const form = $('#terminal-form');
    const input = $('#terminal-input');
    const closeBtn = $('#terminal-close');
    const minBtn = $('#terminal-minimize');

    // Initial messages
    state.terminalHistory = [
      { type: 'system', text: 'Welcome to NEXUS Terminal v1.0' },
      { type: 'system', text: 'Type "help" for available commands.\n' },
    ];

    function renderOutput() {
      output.innerHTML = state.terminalHistory.map(entry => {
        if (entry.type === 'input') {
          return `<div class="t-input"><span class="prompt-user">shivam</span><span class="prompt-at">@</span><span class="prompt-host">nexus</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-dollar">$ </span>${escapeHtml(entry.text)}</div>`;
        }
        return `<div class="t-${entry.type}" style="white-space: pre;">${escapeHtml(entry.text)}</div>`;
      }).join('');
      output.scrollTop = output.scrollHeight;
    }

    function processCommand(cmd) {
      const trimmed = cmd.trim().toLowerCase();
      const entries = [{ type: 'input', text: cmd.trim() }];

      if (!trimmed) {
        state.terminalHistory.push(...entries);
        renderOutput();
        return;
      }

      if (trimmed === 'clear') {
        state.terminalHistory = [];
        renderOutput();
        return;
      }

      if (trimmed.startsWith('echo ')) {
        entries.push({ type: 'output', text: cmd.trim().slice(5) });
        state.terminalHistory.push(...entries);
        renderOutput();
        return;
      }

      if (trimmed.startsWith('open ')) {
        const target = trimmed.slice(5).trim();
        const sectionId = SECTION_MAP[target];
        if (sectionId) {
          entries.push({ type: 'success', text: `Opening ${target}...` });
          state.terminalHistory.push(...entries);
          renderOutput();
          setTimeout(() => scrollTo(sectionId), 300);
          return;
        } else {
          entries.push({ type: 'error', text: `Section not found: ${target}` });
          entries.push({ type: 'system', text: 'Available: identity, skills, experience, projects, achievements, contact' });
          state.terminalHistory.push(...entries);
          renderOutput();
          return;
        }
      }

      if (TERMINAL_COMMANDS[trimmed]) {
        const result = TERMINAL_COMMANDS[trimmed]();
        entries.push(...result.map(t => ({ type: 'output', text: t })));
      } else {
        entries.push({ type: 'error', text: `command not found: ${cmd.trim()}` });
        entries.push({ type: 'system', text: 'Type "help" for available commands.' });
      }

      state.terminalHistory.push(...entries);
      renderOutput();
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const cmd = input.value;
      processCommand(cmd);
      if (cmd.trim()) {
        state.terminalCmdHistory.unshift(cmd.trim());
      }
      input.value = '';
      state.terminalHistoryIdx = -1;
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.terminalHistoryIdx < state.terminalCmdHistory.length - 1) {
          state.terminalHistoryIdx++;
          input.value = state.terminalCmdHistory[state.terminalHistoryIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.terminalHistoryIdx > 0) {
          state.terminalHistoryIdx--;
          input.value = state.terminalCmdHistory[state.terminalHistoryIdx];
        } else {
          state.terminalHistoryIdx = -1;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const cmds = ['help', 'whoami', 'about', 'skills', 'experience', 'contact', 'date', 'clear', 'echo', 'open', 'ls projects', 'sudo hire-me', 'neofetch', 'matrix'];
        const match = cmds.find(c => c.startsWith(input.value.toLowerCase()));
        if (match) input.value = match;
      }
    });

    closeBtn.addEventListener('click', toggleTerminal);
    minBtn.addEventListener('click', toggleTerminal);

    renderOutput();
  }

  function toggleTerminal() {
    const terminal = $('#terminal');
    state.terminalOpen = !state.terminalOpen;
    terminal.style.display = state.terminalOpen ? 'block' : 'none';
    if (state.terminalOpen) {
      setTimeout(() => $('#terminal-input').focus(), 100);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Don't fire shortcuts when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Escape — close overlays
      if (e.key === 'Escape') {
        if (state.cmdPaletteOpen) {
          state.cmdPaletteOpen = false;
          $('#command-palette').style.display = 'none';
        }
        if (state.terminalOpen) toggleTerminal();
        if (state.shortcutsOpen) toggleShortcuts();
        if (state.matrixActive) toggleMatrix();
        return;
      }

      // Backtick — terminal
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // ? — shortcuts
      if (e.key === '?' && !e.ctrlKey) {
        toggleShortcuts();
        return;
      }

      // Number keys — navigate
      if (!e.ctrlKey && !e.metaKey) {
        const sections = ['section-identity', 'section-skills', 'section-experience', 'section-projects', 'section-achievements', 'section-contact'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
          scrollTo(sections[num - 1]);
          return;
        }
      }

      // Konami code
      if (e.key === KONAMI[state.konamiProgress]) {
        state.konamiProgress++;
        if (state.konamiProgress === KONAMI.length) {
          state.konamiProgress = 0;
          toggleMatrix();
        }
      } else {
        state.konamiProgress = 0;
      }
    });
  }

  function toggleShortcuts() {
    const modal = $('#shortcuts-modal');
    state.shortcutsOpen = !state.shortcutsOpen;
    modal.style.display = state.shortcutsOpen ? 'flex' : 'none';
  }

  // ═══════════════════════════════════════════════════════════════
  // MATRIX RAIN (Easter Egg)
  // ═══════════════════════════════════════════════════════════════
  let matrixAnim;

  function toggleMatrix() {
    const canvas = $('#matrix-canvas');
    state.matrixActive = !state.matrixActive;

    if (state.matrixActive) {
      canvas.style.display = 'block';
      startMatrix(canvas);
    } else {
      canvas.style.display = 'none';
      if (matrixAnim) cancelAnimationFrame(matrixAnim);
    }
  }

  function startMatrix(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:<>?シヴァムクマル';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0fa';
      ctx.font = fontSize + 'px monospace';

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? '#fff' : `hsl(${160 + Math.random() * 40}, 100%, ${50 + Math.random() * 30}%)`;
        ctx.fillText(char, i * fontSize, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });

      if (state.matrixActive) matrixAnim = requestAnimationFrame(draw);
    }

    draw();
  }

  // ═══════════════════════════════════════════════════════════════
  // SHORTCUTS MODAL
  // ═══════════════════════════════════════════════════════════════
  function initShortcutsModal() {
    const closeBtn = $('#shortcuts-close');
    const backdrop = $('#shortcuts-modal .shortcuts-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', toggleShortcuts);
    if (backdrop) backdrop.addEventListener('click', toggleShortcuts);
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════════════
  // FUTURISTIC 3D SKILLS NEURAL VISUALIZER
  // ═══════════════════════════════════════════════════════════════
  function initSkillsCanvas() {
    const canvas = $('#skills-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SKILLS_DATA = [
      // Languages
      { name: 'JavaScript', category: 'languages', level: 90, color: '#f7df1e', connection: 98, latency: 12 },
      { name: 'PHP', category: 'languages', level: 90, color: '#777bb4', connection: 94, latency: 8 },
      { name: 'Python', category: 'languages', level: 75, color: '#3776ab', connection: 88, latency: 15 },
      { name: 'C++', category: 'languages', level: 75, color: '#00599c', connection: 82, latency: 22 },
      { name: 'TypeScript', category: 'languages', level: 80, color: '#3178c6', connection: 91, latency: 18 },
      { name: 'Java', category: 'languages', level: 55, color: '#ed8b00', connection: 79, latency: 26 },
      // Frontend
      { name: 'React', category: 'frontend', level: 75, color: '#61dafb', connection: 96, latency: 14 },
      { name: 'HTML5', category: 'frontend', level: 90, color: '#e34f26', connection: 99, latency: 5 },
      { name: 'CSS3', category: 'frontend', level: 85, color: '#1572b6', connection: 97, latency: 6 },
      // Backend
      { name: 'Laravel', category: 'backend', level: 90, color: '#ff2d20', connection: 95, latency: 10 },
      { name: 'Node.js', category: 'backend', level: 75, color: '#339933', connection: 93, latency: 11 },
      { name: 'Express.js', category: 'backend', level: 70, color: '#000000', connection: 89, latency: 13 },
      { name: 'Next.js', category: 'backend', level: 85, color: '#ffffff', connection: 92, latency: 16 },
      // Database
      { name: 'SQL', category: 'database', level: 90, color: '#336791', connection: 96, latency: 9 },
      { name: 'MongoDB', category: 'database', level: 85, color: '#47a248', connection: 90, latency: 12 },
      // Tools
      { name: 'Git', category: 'tools', level: 90, color: '#f05032', connection: 99, latency: 4 },
      { name: 'AWS', category: 'tools', level: 70, color: '#ff9900', connection: 85, latency: 25 },
      { name: 'Linux', category: 'tools', level: 75, color: '#fcc624', connection: 84, latency: 19 },
      { name: 'DevOps', category: 'tools', level: 75, color: '#0db7ed', connection: 86, latency: 20 },
      { name: 'REST API', category: 'tools', level: 85, color: '#6ba539', connection: 94, latency: 7 }
    ];

    // Setup 3D positions in a sphere distribution
    let nodes = SKILLS_DATA.map((skill, i) => {
      const theta = Math.acos(-1 + (2 * i) / SKILLS_DATA.length);
      const phi = Math.sqrt(SKILLS_DATA.length * Math.PI) * theta;
      const radius = 180;

      return {
        ...skill,
        x3d: radius * Math.sin(theta) * Math.cos(phi),
        y3d: radius * Math.sin(theta) * Math.sin(phi),
        z3d: radius * Math.cos(theta),
        x2d: 0,
        y2d: 0,
        scale: 1,
        hovered: false
      };
    });

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Auto-rotation speeds
    let angleX = 0.002;
    let angleY = 0.002;

    // Mouse interaction states
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouse = { x: -1000, y: -1000 };
    let activeNode = null;

    // Track sizing
    window.addEventListener('resize', () => {
      if (canvas.offsetWidth) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    });

    // Rotation helpers
    function rotateX(node, angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = node.y3d * cos - node.z3d * sin;
      const z1 = node.z3d * cos + node.y3d * sin;
      node.y3d = y1;
      node.z3d = z1;
    }

    function rotateY(node, angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = node.x3d * cos - node.z3d * sin;
      const z1 = node.z3d * cos + node.x3d * sin;
      node.x3d = x1;
      node.z3d = z1;
    }

    // Diagnostics UI update
    const skillNameEl = $('.diagnostics-skill-name');
    const skillCatEl = $('.diagnostics-skill-category');
    const skillLevelVal = $('#diagnostics-level-value');
    const skillLevelBar = $('#diagnostics-level-bar');
    const metricStrength = $('#metric-strength');
    const metricLatency = $('#metric-latency');
    const consoleLogs = $('#console-logs');

    function updateDiagnostics(node) {
      if (!node) return;
      skillNameEl.textContent = node.name;
      skillCatEl.textContent = `SUB-ROUTINE // CATEGORY: ${node.category}`;
      skillLevelVal.textContent = `${node.level}%`;
      skillLevelBar.style.width = `${node.level}%`;
      metricStrength.textContent = `${node.connection}%`;
      metricLatency.textContent = `${node.latency}ms`;

      // Add log line
      addLog(`SYNAPSE ESTABLISHED // Extracted metadata for [${node.name.toUpperCase()}]. Connection strength: ${node.connection}%.`, 'success');
    }

    function addLog(text, type = '') {
      if (!consoleLogs) return;
      const logLine = document.createElement('div');
      logLine.className = `log-line ${type}`;
      logLine.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      consoleLogs.appendChild(logLine);
      consoleLogs.scrollTop = consoleLogs.scrollHeight;

      // Limit to 6 logs
      while (consoleLogs.children.length > 6) {
        consoleLogs.removeChild(consoleLogs.firstChild);
      }
    }

    // Pre-populate with first skill diagnostics
    setTimeout(() => {
      updateDiagnostics(nodes[0]);
    }, 1000);

    function getNodeAt(x, y) {
      let closestNode = null;
      let minDistance = Infinity;

      nodes.forEach(node => {
        const dist = Math.hypot(node.x2d - x, node.y2d - y);
        const baseRadius = 8;
        const radius = baseRadius * node.scale;
        // Increase touch target size slightly for mobile tapping ease (18px padding)
        const touchRadius = radius + 18; 
        
        if (dist < touchRadius && dist < minDistance) {
          minDistance = dist;
          closestNode = node;
        }
      });
      return closestNode;
    }

    // Event listeners for dragging / rotating
    const visualizerPanel = $('.skills-visualizer-panel');
    if (visualizerPanel) {
      visualizerPanel.addEventListener('mousedown', e => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        previousMousePosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });

      document.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const currentMouse = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };

        if (isDragging) {
          const deltaX = currentMouse.x - previousMousePosition.x;
          const deltaY = currentMouse.y - previousMousePosition.y;

          // Update rotation angles based on drag delta
          nodes.forEach(node => {
            rotateY(node, deltaX * 0.005);
            rotateX(node, deltaY * 0.005);
          });

          previousMousePosition = currentMouse;
        } else {
          // Track hover coords
          mouse.x = currentMouse.x;
          mouse.y = currentMouse.y;
        }
      });

      let touchStartPos = { x: 0, y: 0 };
      let touchStartTime = 0;
      let hasDragged = false;

      // Touch support for mobile
      visualizerPanel.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          isDragging = true;
          hasDragged = false;
          const rect = canvas.getBoundingClientRect();
          const touchX = e.touches[0].clientX - rect.left;
          const touchY = e.touches[0].clientY - rect.top;
          
          touchStartPos = { x: touchX, y: touchY };
          touchStartTime = Date.now();
          previousMousePosition = { x: touchX, y: touchY };

          // Set hover coords so the glow shows up immediately under the finger
          mouse.x = touchX;
          mouse.y = touchY;

          // Highlight the node under the finger instantly on touch start
          const touchedNode = getNodeAt(touchX, touchY);
          if (touchedNode) {
            activeNode = touchedNode;
            nodes.forEach(n => n.hovered = (n === touchedNode));
            updateDiagnostics(touchedNode);
          }
        }
      }, { passive: true });

      visualizerPanel.addEventListener('touchmove', e => {
        if (!isDragging || e.touches.length !== 1) return;
        const rect = canvas.getBoundingClientRect();
        const currentMouse = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
        const deltaX = currentMouse.x - previousMousePosition.x;
        const deltaY = currentMouse.y - previousMousePosition.y;

        // Check if the user has dragged beyond a tiny threshold (8 pixels)
        if (Math.hypot(currentMouse.x - touchStartPos.x, currentMouse.y - touchStartPos.y) > 8) {
          hasDragged = true;
        }

        nodes.forEach(node => {
          rotateY(node, deltaX * 0.008);
          rotateX(node, deltaY * 0.008);
        });

        previousMousePosition = currentMouse;

        // Keep updating mouse coords so hover effect follows their finger
        mouse.x = currentMouse.x;
        mouse.y = currentMouse.y;
      }, { passive: true });

      document.addEventListener('touchend', () => {
        isDragging = false;
        // Reset hover coordinates so the node glows fade away once finger is lifted
        mouse.x = -1000;
        mouse.y = -1000;
      });

      visualizerPanel.addEventListener('click', () => {
        if (activeNode) {
          updateDiagnostics(activeNode);
        }
      });
    }

    // Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height);

      // Auto-spin if not dragging
      if (!isDragging) {
        nodes.forEach(node => {
          rotateY(node, angleY);
          rotateX(node, angleX);
        });
      }

      // Sort nodes by Z depth so front ones render on top of back ones
      nodes.sort((a, b) => b.z3d - a.z3d);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 400; // perspective focal depth

      // 1. Calculate projected 2D coordinates
      nodes.forEach(node => {
        const perspective = fov / (fov + node.z3d);
        node.x2d = centerX + node.x3d * perspective;
        node.y2d = centerY + node.y3d * perspective;
        node.scale = perspective;
      });

      // 2. Draw connections/lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x3d - nodes[j].x3d, nodes[i].y3d - nodes[j].y3d, nodes[i].z3d - nodes[j].z3d);
          // Only connect nodes close to each other
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x2d, nodes[i].y2d);
            ctx.lineTo(nodes[j].x2d, nodes[j].y2d);

            // Highlight connections for active node
            if (nodes[i].hovered || nodes[j].hovered) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 150) * 0.45})`;
              ctx.lineWidth = 1.0;
            } else {
              ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - dist / 150) * 0.12})`;
              ctx.lineWidth = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      // 3. Draw nodes and check hover
      activeNode = null;
      nodes.forEach(node => {
        // Hover collision detection
        const hoverDist = Math.hypot(node.x2d - mouse.x, node.y2d - mouse.y);
        const baseRadius = 8;
        const radius = baseRadius * node.scale * (node.hovered ? 1.5 : 1);

        node.hovered = hoverDist < radius + 8;
        if (node.hovered) {
          activeNode = node;
        }

        // Draw outer glow ring if hovered
        if (node.hovered) {
          ctx.beginPath();
          ctx.arc(node.x2d, node.y2d, radius * 1.8, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw core node sphere
        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, radius, 0, Math.PI * 2);

        // Spherical gradient shading
        const grad = ctx.createRadialGradient(
          node.x2d - radius * 0.3,
          node.y2d - radius * 0.3,
          radius * 0.1,
          node.x2d,
          node.y2d,
          radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, node.color);
        grad.addColorStop(1, '#0e0e18');

        ctx.fillStyle = grad;
        ctx.fill();

        // Node text label
        if (node.scale > 0.6) {
          ctx.font = `${node.hovered ? 'bold 11px' : '9px'} var(--font-mono)`;
          ctx.fillStyle = node.hovered ? '#ffffff' : 'rgba(232, 232, 239, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x2d, node.y2d - radius - 6);
        }
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  function init() {
    initCursor();
    initBgCanvas();
    initBgMatrixCanvas();
    initBootSequence();
    initCardTilt();
    initProjectFilters();
    initProjectCardTilt();
    initContactForm();
    initCommandPalette();
    initTerminal();
    initKeyboardShortcuts();
    initShortcutsModal();
    initSkillsCanvas();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
