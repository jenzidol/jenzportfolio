// Jenny Faye Alipen — Portfolio interactions

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky nav shadow on scroll
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('navBurger');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav__links a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// Scroll-reveal animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Safety net: never leave content hidden if the observer misbehaves
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('is-visible');
  });
}, 1500);

// Animated stat counters
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('.stat__num').forEach((el) => statObserver.observe(el));

// Contact form → POST /api/contact (Cloudflare Pages Function)
const form = document.getElementById('contactForm');
const status = document.getElementById('contactStatus');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('.contact-form__submit');
  status.className = 'contact-form__status';

  const payload = Object.fromEntries(new FormData(form));
  if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
    status.textContent = 'Please fill in your name, email, and message.';
    status.classList.add('is-error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.ok) {
      form.reset();
      status.textContent = "Thank you! Your message is on its way — I'll get back to you soon.";
      status.classList.add('is-ok');
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    status.textContent =
      (err && err.message && !err.message.includes('fetch') ? err.message : '') ||
      'Something went wrong. Please email me directly at jennyfaye.alipen@gmail.com.';
    status.classList.add('is-error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});
