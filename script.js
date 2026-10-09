// ====== CHANGE THIS to your real email ======
const EMAIL = 'your.email@example.com';

// ====== Theme toggle ======
const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ====== Mobile menu ======
const links = document.getElementById('links');
document.getElementById('menu').addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// ====== Contact form -> opens email app ======
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const msg = document.getElementById('fmsg').value;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Portfolio message from ' + name)}&body=${encodeURIComponent(msg)}`;
});

// ====== Nav shadow + back-to-top ======
const nav = document.querySelector('.nav');
const topBtn = document.getElementById('top-btn');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 20);
  topBtn.classList.toggle('show', scrollY > 600);
});

// ====== Hidden photo: revealed only around the mouse ======
(function () {
  const photo = document.getElementById('photo');
  if (!photo) return;

  const hint = document.getElementById('hint');
  if (matchMedia('(hover: none)').matches) hint.textContent = 'Touch & drag here';

  const RADIUS = () => (innerWidth < 700 ? 95 : 150);
  let tx = 0, ty = 0, x = 0, y = 0, tr = 0, r = 0, running = false;

  function draw() {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    r += (tr - r) * 0.12;
    photo.style.setProperty('--x', x + 'px');
    photo.style.setProperty('--y', y + 'px');
    photo.style.setProperty('--r', r + 'px');
    if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || Math.abs(tr - r) > 0.3) {
      requestAnimationFrame(draw);
    } else {
      running = false;
    }
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(draw); } }

  function setPos(e) {
    const b = photo.getBoundingClientRect();
    tx = e.clientX - b.left;
    ty = e.clientY - b.top;
  }

  photo.addEventListener('pointerenter', e => {
    setPos(e);
    if (r < 1) { x = tx; y = ty; }   // start from the cursor, no jump
    tr = RADIUS();
    photo.classList.add('on');
    kick();
  });
  photo.addEventListener('pointermove', e => { setPos(e); tr = RADIUS(); kick(); });
  const hide = () => { tr = 0; photo.classList.remove('on'); kick(); };
  photo.addEventListener('pointerleave', hide);
  photo.addEventListener('pointercancel', hide);
})();

// ====== GSAP animations ======
const canAnimate =
  window.gsap && window.ScrollTrigger &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canAnimate) {
  root.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);

  // --- Hero intro (starts immediately) ---
  gsap.set('.hero .rv', { y: 24 });
  gsap.timeline({ delay: 0.15 })
    .to('.hero .line > span', { y: 0, yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' })
    .to('.hero .rv', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, '-=0.6');

  // --- Rotating role text ---
  const roles = ['Frontend Developer', 'React Developer', 'UI Developer', 'JavaScript Developer'];
  const roleEl = document.getElementById('role');
  let ri = 0;
  setInterval(() => {
    gsap.to(roleEl, {
      yPercent: -100, opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        ri = (ri + 1) % roles.length;
        roleEl.textContent = roles[ri];
        gsap.fromTo(roleEl, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      },
    });
  }, 2400);

  // --- Scroll progress bar ---
  gsap.to('#bar', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: 0.3, start: 0, end: 'max' } });

  // --- Generic reveal on scroll ---
  gsap.utils.toArray('section .rv').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // --- Projects: reveal, 3D tilt, spotlight ---
  gsap.utils.toArray('.proj').forEach(el => {
    gsap.from(el, { opacity: 0, y: 60, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    el.style.perspective = '900px';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
      gsap.to(el, { rotateY: x * 3, rotateX: -y * 3, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' }));
  });

  // --- Skills pop-in ---
  gsap.from('.sk', {
    opacity: 0, y: 30, scale: 0.9, duration: 0.6, stagger: 0.05, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '#skills', start: 'top 75%' },
  });

  // --- Count-up numbers ---
  gsap.utils.toArray('[data-n]').forEach(el => {
    const target = +el.dataset.n, c = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(c, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(c.v)) }),
    });
  });

  // --- Hero text parallax ---
  gsap.to('.hero-text', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // --- Scroll-spy (highlight active nav link) ---
  ['about', 'work', 'skills', 'contact'].forEach(id => {
    const link = document.querySelector(`.links a[href="#${id}"]`);
    ScrollTrigger.create({
      trigger: '#' + id, start: 'top 50%', end: 'bottom 50%',
      onToggle: self => link.classList.toggle('active', self.isActive),
    });
  });

  // --- Mouse-follow blobs + custom cursor ---
  const mk = (sel, prop, d) => gsap.quickTo(sel, prop, { duration: d, ease: 'power3' });
  const b1x = mk('.b1', 'x', 1.4), b1y = mk('.b1', 'y', 1.4);
  const b2x = mk('.b2', 'x', 2.2), b2y = mk('.b2', 'y', 2.2);
  const cx = mk('#cur', 'x', 0.25), cy = mk('#cur', 'y', 0.25);
  b1x(innerWidth * 0.2); b1y(80); b2x(innerWidth * 0.6); b2y(innerHeight * 0.4);

  addEventListener('mousemove', e => {
    b1x(e.clientX - 260); b1y(e.clientY - 260);
    b2x(e.clientX - 80);  b2y(e.clientY - 120);
    cx(e.clientX - 17);   cy(e.clientY - 17);
  });

  document.querySelectorAll('a, button, .sk').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to('#cur', { scale: 1.8, duration: 0.3 }));
    el.addEventListener('mouseleave', () => gsap.to('#cur', { scale: 1, duration: 0.3 }));
  });

  // --- Magnetic buttons ---
  document.querySelectorAll('.mag').forEach(m => {
    m.addEventListener('mousemove', e => {
      const r = m.getBoundingClientRect();
      gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.5, duration: 0.3 });
    });
    m.addEventListener('mouseleave', () => gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' }));
  });
}