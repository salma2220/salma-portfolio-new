"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================
     1. ANIMATED TECHNOLOGY BACKGROUND
     Canvas animation — no background image
  ====================================== */

  const canvas = document.getElementById("tech-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (canvas && ctx && !prefersReducedMotion) {
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = null;
    let isRunning = false;

    const mouse = {
      x: -1000,
      y: -1000
    };

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );

      // Fewer particles on small screens for better performance.
      const particleCount = Math.min(
        75,
        Math.max(30, Math.floor((width * height) / 20000))
      );

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.2 + 0.6,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function renderBackground() {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      const connectionDistance = width < 600 ? 90 : 125;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Move each point slowly.
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += 0.015;

        // Reappear on the opposite edge.
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw a softly glowing cyan point.
        const glow =
          0.35 + (Math.sin(particle.phase) + 1) * 0.18;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(86, 220, 255, ${glow})`;
        ctx.fill();

        // Connect nearby points with thin blue lines.
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];

          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity =
              (1 - distance / connectionDistance) * 0.18;

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);

            ctx.strokeStyle =
              `rgba(57, 139, 255, ${opacity})`;

            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Gently connect points near the mouse.
        if (width > 800) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 115) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouse.x, mouse.y);

            ctx.strokeStyle =
              `rgba(86, 220, 255, ${(1 - distance / 115) * 0.25})`;

            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrame = window.requestAnimationFrame(renderBackground);
    }

    function startAnimation() {
      if (isRunning || document.hidden) return;

      isRunning = true;
      animationFrame = window.requestAnimationFrame(renderBackground);
    }

    function stopAnimation() {
      isRunning = false;

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }

    window.addEventListener("resize", resizeCanvas, {
      passive: true
    });

    window.addEventListener("pointermove", (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    });

    resizeCanvas();
    startAnimation();
  }

  /* =====================================
     2. MOBILE NAVIGATION MENU
  ====================================== */

  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("nav-links");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    // Close the menu after selecting a section.
    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });

    // Close the mobile menu when clicking outside it.
    document.addEventListener("click", (event) => {
      const clickedInsideMenu = navigation.contains(event.target);
      const clickedButton = menuButton.contains(event.target);

      if (!clickedInsideMenu && !clickedButton) {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* =====================================
     3. HIGHLIGHT THE CURRENT SECTION
  ====================================== */

  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(
    '#nav-links a[href^="#"]'
  );

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const matches =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", matches);
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px"
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* =====================================
     4. FOOTER YEAR
  ====================================== */

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
