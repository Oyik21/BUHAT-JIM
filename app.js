document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const themeToggle = document.getElementById("themeToggle");
  const greetBtn = document.getElementById("greetBtn");
  const toast = document.getElementById("toast");
  const backToTop = document.getElementById("backToTop");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (navLinks.classList.contains("open") && !header.contains(event.target)) {
      setMenu(false);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const target = targetId.length > 1 ? document.querySelector(targetId) : null;
      if (!target) return;

      event.preventDefault();
      const offset = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset + 1;

      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
      history.replaceState(null, "", targetId);
      setMenu(false);
    });
  });

  function onScroll() {
    const scrollY = window.scrollY;

    header.classList.toggle("scrolled", scrollY > 40);
    backToTop.classList.toggle("show", scrollY > 600);

    let currentId = "home";
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - header.offsetHeight - 120) {
        currentId = section.id;
      }
    });
    if (window.innerHeight + scrollY >= document.body.scrollHeight - 2) {
      currentId = sections[sections.length - 1].id;
    }

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("buhat-theme") || "dark";
  } catch (error) {
    /* localStorage may be blocked; keep the default theme */
  }
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("light-mode") ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("buhat-theme", next);
    } catch (error) {
      /* ignore storage errors */
    }
    showToast(next === "light" ? "☀️ Light mode on" : "🌙 Dark mode on");
  });

  let toastTimer;

  function showToast(html, duration = 3500) {
    toast.innerHTML = html;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  greetBtn.addEventListener("click", () => {
    showToast(
      `💪 ${getGreeting()}! <strong>Welcome to TARA JIM</strong> — ` +
      "your strongest self starts today. Let's lift!",
      5000
    );
  });

  function animateCounter(element) {
    const target = Number(element.dataset.count);
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll("[data-count]").forEach((counter) => {
    if (prefersReducedMotion) {
      counter.textContent = Number(counter.dataset.count).toLocaleString();
    } else {
      animateCounter(counter);
    }
  });

  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  const form = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, message) {
    const group = input.closest(".form-group");
    group.classList.toggle("invalid", Boolean(message));
    group.querySelector(".error-msg").textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input.id === "fullName") {
      if (!value) return "Please enter your full name.";
      if (value.length < 2) return "Name must be at least 2 characters.";
    }
    if (input.id === "email") {
      if (!value) return "Please enter your email address.";
      if (!emailPattern.test(value)) return "Please enter a valid email address.";
    }
    if (input.id === "message") {
      if (!value) return "Please write a message.";
      if (value.length < 10) return "Message must be at least 10 characters.";
    }
    return "";
  }

  const fields = form.querySelectorAll("input, textarea");

  fields.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.closest(".form-group").classList.contains("invalid")) {
        setError(input, validateField(input));
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formSuccess.textContent = "";

    let firstInvalid = null;
    fields.forEach((input) => {
      const error = validateField(input);
      setError(input, error);
      if (error && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const firstName = form.fullName.value.trim().split(/\s+/)[0];
    const safeName = firstName.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
    formSuccess.textContent = `Thank you, ${firstName}! Your message has been received. We'll contact you soon.`;
    showToast(`✅ Message sent! See you at <strong>TARA JIM</strong>, ${safeName}.`);
    form.reset();
  });

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
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
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});
