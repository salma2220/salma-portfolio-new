
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
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  // Highlight the current navigation link
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => {
              const active =
                link.getAttribute("href") === `#${entry.target.id}`;

              link.classList.toggle("active", active);
            });
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Animated technology background
  const canvas = document.getElementById("tech-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationFrame = null;
  let points = [];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(
      65,
      Math.max(20, Math.floor((width * height) / 22000))
    );

    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.5
    }));

    if (reduceMotion) drawFrame(false);
  }

  function drawFrame(movePoints = true) {
    ctx.clearRect(0, 0, width, height);

    points.forEach((point) => {
      if (movePoints) {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(66, 217, 245, 0.7)";
      ctx.fill();
    });

    points.forEach((point, index) => {
      for (let j = index + 1; j < points.length; j++) {
        const other = points[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 130) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);

          const opacity = (1 - distance / 130) * 0.22;

          ctx.strokeStyle = `rgba(66, 217, 245, ${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    });
  }

  function animate() {
    drawFrame(true);
    animationFrame = window.requestAnimationFrame(animate);
  }

  resizeCanvas();

  if (!reduceMotion) {
    animate();
  }

  window.addEventListener("resize", () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    resizeCanvas();

    if (!reduceMotion) {
      animate();
    }
  });
});
