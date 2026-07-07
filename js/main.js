// Jenny Faye Alipen — Portfolio interactions
// Micro-interactions powered by Motion (the vanilla-JS build of Framer
// Motion, https://motion.dev), loaded as an ESM module. Every animation is
// transform/opacity only (compositor-friendly), ≤ 0.6s, and skipped entirely
// under prefers-reduced-motion or if the module fails to load.

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky nav shadow + stronger blur once scrolled
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

// Animated stat counters (self-contained rAF; no library needed)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initCounters = (instant) => {
  const els = document.querySelectorAll('.stat__num');
  if (instant) {
    els.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
    return;
  }
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
  els.forEach((el) => statObserver.observe(el));
};

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

// ---------------------------------------------------------------------------
// Motion micro-interactions
// ---------------------------------------------------------------------------
(async () => {
  let motion = null;
  if (!prefersReduced) {
    try {
      motion = await import('https://cdn.jsdelivr.net/npm/motion@11/+esm');
    } catch {
      /* CDN unreachable — fall through to static rendering */
    }
  }
  window.__motionOK = true; // cancel the head fallback timer's failure path

  if (!motion) {
    document.documentElement.classList.add('no-motion');
    initCounters(prefersReduced);
    return;
  }

  try {
    document.documentElement.classList.remove('no-motion');
    initCounters(false);

    const { animate, inView, stagger } = motion;
    const EASE = [0.22, 1, 0.36, 1];
    const targetOf = (x) => (x && x.target ? x.target : x);

    // Hero entrance: copy cascades up, portrait settles in, badges fade last
    animate(
      '[data-hero]',
      { opacity: [0, 1], y: [18, 0] },
      { duration: 0.55, ease: EASE, delay: stagger(0.08) }
    );
    animate(
      '[data-hero-photo]',
      { opacity: [0, 1], scale: [0.965, 1] },
      { duration: 0.6, ease: EASE, delay: 0.2 }
    );
    document.querySelectorAll('[data-hero-badge]').forEach((badge, i) => {
      // opacity only: transforms would fight the CSS float keyframes
      animate(badge, { opacity: [0, 1] }, { duration: 0.5, delay: 0.55 + i * 0.15 });
    });

    // Single-block scroll reveals (section heads, about, stats, contact)
    inView(
      '.reveal',
      (entry) => {
        animate(targetOf(entry), { opacity: [0, 1], y: [22, 0] }, { duration: 0.55, ease: EASE });
      },
      { margin: '0px 0px -10% 0px' }
    );

    // Staggered groups: cards, workflow steps, timeline, industries,
    // testimonials, chips, FAQ items
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const items = Array.from(group.children);
      inView(
        group,
        () => {
          animate(
            items,
            { opacity: [0, 1], y: [16, 0] },
            { duration: 0.5, ease: EASE, delay: stagger(0.06) }
          );
        },
        { margin: '0px 0px -8% 0px' }
      );
    });

    // Image reveal: about portrait settles from a gentle over-scale
    inView(
      '.about__media',
      (entry) => {
        const img = targetOf(entry).querySelector('img');
        if (img) animate(img, { scale: [1.06, 1] }, { duration: 0.6, ease: EASE });
      },
      { margin: '0px 0px -10% 0px' }
    );
  } catch {
    // Any runtime API mismatch: never leave content hidden
    document.documentElement.classList.add('no-motion');
  }
})();
