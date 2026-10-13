/* ============================================
   Soujanya Veginati — Portfolio Script
   Vanilla JS + Three.js
   ============================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = () =>
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  const isMobile = () => window.innerWidth < 768;

  /* ---------- Init on DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (isTouchDevice()) {
      document.body.classList.add("touch-device");
    }

    initNavbar();
    initSmoothScroll();
    initActiveNav();
    initScrollReveal();
    initTiltCards();
    initCounters();
    initTimeline();
    initProjectModals();
    initContactForm();
    initBackToTop();
    initParticles();

    if (!prefersReducedMotion && typeof THREE !== "undefined") {
      initHero3D();
    } else {
      showHeroFallback();
    }

    if (!prefersReducedMotion && !isTouchDevice()) {
      initCustomCursor();
    }
  });

  /* ========== NAVBAR ========== */
  function initNavbar() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Close mobile menu on link click
    const navLinks = nav.querySelectorAll(".nav-link, .btn-accent");
    const collapse = document.getElementById("navMenu");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (collapse && collapse.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getInstance(collapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* ========== SMOOTH SCROLL ========== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ========== ACTIVE NAV SECTION ========== */
  function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ========== SCROLL REVEAL ========== */
  function initScrollReveal() {
    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .scale-reveal"
    );

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ========== 3D CARD TILT ========== */
  function initTiltCards() {
    if (prefersReducedMotion || isTouchDevice()) return;

    const cards = document.querySelectorAll(
      ".tilt-card, .project-card, .cert-card"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

        // Gradient follow cursor
        const mx = (x / rect.width) * 100;
        const my = (y / rect.height) * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ========== ANIMATED COUNTERS ========== */
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1500;
      const start = performance.now();

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* ========== TIMELINE ANIMATION ========== */
  function initTimeline() {
    const timeline = document.getElementById("timeline");
    const line = document.getElementById("timelineLine");
    const items = document.querySelectorAll(".timeline-item");

    if (!timeline || !line) return;

    const updateLine = () => {
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const timelineTop = rect.top;
      const timelineHeight = rect.height;

      let progress = (windowHeight * 0.6 - timelineTop) / timelineHeight;
      progress = Math.max(0, Math.min(1, progress));
      line.style.height = `${progress * 100}%`;
    };

    window.addEventListener("scroll", updateLine, { passive: true });
    updateLine();

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add("visible"));
      line.style.height = "100%";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.25 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ========== PROJECT MODALS ========== */
  function initProjectModals() {
    const modalEl = document.getElementById("projectModal");
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    const titleEl = document.getElementById("projectModalTitle");
    const categoryEl = document.getElementById("projectModalCategory");
    const descEl = document.getElementById("projectModalDesc");
    const techEl = document.getElementById("projectModalTech");
    const featuresEl = document.getElementById("projectModalFeatures");
    const previewEl = document.getElementById("projectModalPreview");
    const githubEl = document.getElementById("projectModalGithub");

    document.querySelectorAll(".project-modal-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".project-card");
        if (!card) return;

        titleEl.textContent = card.dataset.title || "";
        categoryEl.textContent = card.dataset.category || "";
        descEl.textContent = card.dataset.desc || "";

        techEl.innerHTML = "";
        (card.dataset.tech || "").split(",").forEach((t) => {
          const s = t.trim();
          if (!s) return;
          const span = document.createElement("span");
          span.textContent = s;
          techEl.appendChild(span);
        });

        featuresEl.innerHTML = "";
        (card.dataset.features || "").split(",").forEach((f) => {
          const s = f.trim();
          if (!s) return;
          const li = document.createElement("li");
          li.textContent = s;
          featuresEl.appendChild(li);
        });

        const preview = card.querySelector(".project-preview");
        previewEl.innerHTML = "";
        if (preview) {
          const clone = preview.cloneNode(true);
          const glow = clone.querySelector(".project-glow");
          if (glow) glow.remove();
          previewEl.appendChild(clone.firstElementChild || clone);
        }

        if (githubEl) {
          githubEl.href = card.dataset.github || "https://github.com/Soujanya809";
        }

        modal.show();
      });
    });
  }

  /* ========== CONTACT FORM → WhatsApp ========== */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    const feedback = document.getElementById("formFeedback");
    if (!form) return;

    const WHATSAPP_NUMBER = "918096701549";

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector("#contactName");
      const email = form.querySelector("#contactEmail");
      const subject = form.querySelector("#contactSubject");
      const message = form.querySelector("#contactMessage");

      let valid = true;

      [name, email, subject, message].forEach((field) => {
        field.classList.remove("is-invalid");
        if (!field.value.trim()) {
          field.classList.add("is-invalid");
          valid = false;
        }
      });

      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("is-invalid");
        valid = false;
      }

      if (!valid) {
        feedback.className = "form-feedback show error";
        feedback.textContent = "Please fill in all fields correctly.";
        return;
      }

      const template =
        `Hi Soujanya,\n\n` +
        `My name is ${name.value.trim()}.\n` +
        `Email: ${email.value.trim()}\n` +
        `Subject: ${subject.value.trim()}\n\n` +
        `${message.value.trim()}\n\n` +
        `Looking forward to connecting with you.\n\nThanks!`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(template)}`;

      feedback.className = "form-feedback show success";
      feedback.textContent = "Opening WhatsApp with your message…";

      window.open(waUrl, "_blank", "noopener,noreferrer");
      form.reset();
    });
  }

  /* ========== BACK TO TOP ========== */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("visible", window.scrollY > 500);
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ========== CUSTOM CURSOR ========== */
  function initCustomCursor() {
    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId = null;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    });

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const interactive = "a, button, .btn, .project-card, .skill-card, .social-link, .nav-link, input, textarea";

    document.querySelectorAll(interactive).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("expand");
        if (el.classList.contains("project-card")) {
          cursor.classList.add("project-hover");
        }
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("expand", "project-hover");
      });
    });

    // Pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });
  }

  /* ========== BACKGROUND PARTICLES ========== */
  function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas || prefersReducedMotion) {
      if (canvas) canvas.style.display = "none";
      return;
    }

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId = null;
    let visible = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = () => {
      const count = isMobile() ? 25 : 60;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const draw = () => {
      if (!visible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 192, ${p.alpha})`;
        ctx.fill();
      });

      // Subtle connections on desktop
      if (!isMobile()) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 229, 192, ${0.08 * (1 - dist / 120)})`;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
    });

    resize();
    draw();
  }

  /* ========== HERO 3D (Three.js) ========== */
  function showHeroFallback() {
    const fallback = document.getElementById("hero3dFallback");
    const canvas = document.getElementById("hero3d");
    if (fallback) fallback.classList.add("show");
    if (canvas) canvas.style.display = "none";
  }

  function initHero3D() {
    const container = document.getElementById("hero3d");
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    if (width === 0 || height === 0) {
      showHeroFallback();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0x00e5c0, 1.2, 20);
    pointLight.position.set(2, 2, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x3aa0ff, 0.8, 20);
    pointLight2.position.set(-2, -1, 3);
    scene.add(pointLight2);

    // Central glowing sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.1, 2);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x00e5c0,
      emissive: 0x00e5c0,
      emissiveIntensity: 0.3,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Wireframe overlay
    const wireGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x7cf5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireSphere);

    // Orbit ring
    const ringGeo = new THREE.TorusGeometry(1.55, 0.012, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3aa0ff,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.008, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x00e5c0, transparent: true, opacity: 0.25 })
    );
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = 0.5;
    scene.add(ring2);

    // Tech labels as sprites
    const techLabels = [
      "HTML5", "CSS3", "JavaScript", "React", "TypeScript",
      "PHP", "Spring Boot", "MySQL", "Git", "API",
    ];

    const labelCount = isMobile() ? 6 : techLabels.length;
    const labelSprites = [];

    function createTextSprite(text) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 256;
      canvas.height = 64;

      ctx.fillStyle = "rgba(18, 24, 38, 0.85)";
      roundRect(ctx, 8, 8, 240, 48, 10);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 229, 192, 0.5)";
      ctx.lineWidth = 2;
      roundRect(ctx, 8, 8, 240, 48, 10);
      ctx.stroke();

      ctx.fillStyle = "#7CF5D4";
      ctx.font = "bold 22px Space Grotesk, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 34);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1.0, 0.25, 1);
      return sprite;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    for (let i = 0; i < labelCount; i++) {
      const sprite = createTextSprite(techLabels[i]);
      const angle = (i / labelCount) * Math.PI * 2;
      const radius = 2.05;
      const yOffset = ((i % 5) - 2) * 0.28;
      sprite.userData = {
        angle,
        radius,
        yOffset,
        speed: 0.12 + Math.random() * 0.08,
      };
      sprite.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );
      scene.add(sprite);
      labelSprites.push(sprite);
    }

    // Particles around sphere
    const particleCount = isMobile() ? 40 : 100;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00e5c0,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let isVisible = true;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = mouseX * 0.18;
      targetRotX = mouseY * 0.12;
    };

    container.addEventListener("mousemove", onMouseMove);

    // Visibility pause
    const heroObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    heroObserver.observe(container);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) isVisible = false;
    });

    // Animation loop
    let clock = 0;
    let animId = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      clock += 0.01;

      sphere.rotation.y += 0.005;
      sphere.rotation.x = Math.sin(clock * 0.5) * 0.1;
      wireSphere.rotation.y -= 0.003;
      wireSphere.rotation.z += 0.002;

      ring.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;

      particleSystem.rotation.y += 0.001;

      // Float labels — keep within safe bounds so they do not clip
      labelSprites.forEach((sprite) => {
        sprite.userData.angle += 0.002 * sprite.userData.speed;
        sprite.position.x = Math.cos(sprite.userData.angle) * sprite.userData.radius;
        sprite.position.z = Math.sin(sprite.userData.angle) * sprite.userData.radius;
        sprite.position.y =
          sprite.userData.yOffset + Math.sin(clock + sprite.userData.angle) * 0.08;
      });

      // Mouse follow — limited so labels stay in frame
      scene.rotation.y += (targetRotY * 0.7 - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotX * 0.5 - scene.rotation.x) * 0.05;

      // Pulse glow
      sphereMat.emissiveIntensity = 0.25 + Math.sin(clock * 2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    // Cleanup hint for SPA-like scenarios (not needed for static, but good practice)
    window.__hero3dCleanup = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
    };
  }
})();
