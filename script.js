
/* ========================================
   SALMA AWIWE — PORTFOLIO INTERACTIONS
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // 1. AUTOMATIC FOOTER YEAR
  // ========================================

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ========================================
  // 2. MOBILE NAVIGATION
  // ========================================

  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    function closeMenu() {
      navLinks.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.textContent = "☰";
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  // ========================================
  // 3. ACTIVE NAVIGATION LINK
  // ========================================

  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(
    '#nav-links a[href^="#"]'
  );

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const isActive =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isActive);
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // ========================================
  // 4. ANIMATED CANVAS BACKGROUND
  // ========================================

  const canvas = document.getElementById("tech-canvas");

  if (!canvas) return;

  const context = canvas.getContext("2d");

  if (!context) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const particles = [];

  const MAX_PARTICLES = 45;
  const CONNECTION_DISTANCE = 125;

  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationFrame = null;
  let resizeTimeout = null;

  // ----------------------------------------
  // Create background particles
  // ----------------------------------------

  function createParticles() {
    particles.length = 0;

    const calculatedCount = Math.floor(
      (canvasWidth * canvasHeight) / 25000
    );

    const particleCount = Math.min(
      MAX_PARTICLES,
      Math.max(18, calculatedCount)
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        radius: Math.random() * 1.7 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35
      });
    }
  }

  // ----------------------------------------
  // Draw lines and particles
  // ----------------------------------------

  function drawScene() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const first = particles[i];
        const second = particles[j];

        const dx = first.x - second.x;
        const dy = first.y - second.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONNECTION_DISTANCE) {
          const opacity =
            (1 - distance / CONNECTION_DISTANCE) * 0.17;

          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);

          context.strokeStyle =
            `rgba(66, 217, 245, ${opacity})`;

          context.lineWidth = 0.7;
          context.stroke();
        }
      }
    }

    // Particle points
    particles.forEach((particle) => {
      context.beginPath();

      context.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      context.fillStyle = "rgba(92, 206, 245, 0.55)";
      context.fill();
    });
  }

  // ----------------------------------------
  // Resize canvas for screen and Retina
  // ----------------------------------------

  function resizeCanvas() {
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * pixelRatio);
    canvas.height = Math.round(canvasHeight * pixelRatio);

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );

    createParticles();
    drawScene();

    stopAnimation();

    if (!reducedMotion.matches) {
      startAnimation();
    }
  }

  // ----------------------------------------
  // Animate particles
  // ----------------------------------------

  function animate() {
    animationFrame = null;

    if (reducedMotion.matches) {
      drawScene();
      return;
    }

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce at horizontal edges
      if (particle.x < 0 || particle.x > canvasWidth) {
        particle.speedX *= -1;
      }

      // Bounce at vertical edges
      if (particle.y < 0 || particle.y > canvasHeight) {
        particle.speedY *= -1;
      }

      particle.x = Math.max(
        0,
        Math.min(canvasWidth, particle.x)
      );

      particle.y = Math.max(
        0,
        Math.min(canvasHeight, particle.y)
      );
    });

    drawScene();
    startAnimation();
  }

  // ----------------------------------------
  // Start and stop animation safely
  // ----------------------------------------

  function startAnimation() {
    if (animationFrame !== null || reducedMotion.matches) {
      return;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  // ----------------------------------------
  // Handle window resize
  // ----------------------------------------

  window.addEventListener("resize", () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      resizeTimeout = null;
      resizeCanvas();
    }, 120);
  });

  // ----------------------------------------
  // Respect reduced-motion preferences
  // ----------------------------------------

  function handleMotionPreferenceChange() {
    stopAnimation();
    drawScene();

    if (!reducedMotion.matches) {
      startAnimation();
    }
  }

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener(
      "change",
      handleMotionPreferenceChange
    );
  } else if (typeof reducedMotion.addListener === "function") {
    // Compatibility with older browsers
    reducedMotion.addListener(handleMotionPreferenceChange);
  }

  // Initialize the canvas
  resizeCanvas();
});
