
document.addEventListener("DOMContentLoaded", () => {
  // Automatically update the footer year
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Mobile navigation
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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  // Highlight the current navigation section
  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(
    '#nav-links a[href^="#"]'
  );

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navItems.forEach((link) => {
            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", active);
          });
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Animated network background
  const canvas = document.getElementById("tech-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  if (!canvas || !ctx) return;

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = null;

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createParticles();
    draw();

    if (!motionPreference.matches) {
      startAnimation();
    }
  }

  function createParticles() {
    particles.length = 0;

    const count = Math.min(
      55,
      Math.max(20, Math.floor((width * height) / 22000))
    );

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 125) {
          const opacity = (1 - distance / 125) * 0.18;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(54, 216, 243, ${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "rgba(93, 213, 248, 0.65)";
      ctx.fill();
    });
  }

  function animate() {
    if (motionPreference.matches) {
      animationFrame = null;
      draw();
      return;
    }

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
      }

      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
    });

    draw();
    animationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrame !== null || motionPreference.matches) {
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

  window.addEventListener("resize", resizeCanvas);

  motionPreference.addEventListener("change", () => {
    stopAnimation();
    draw();
    startAnimation();
  });

  resizeCanvas();
});
