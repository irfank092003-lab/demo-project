/* ══════════════════════════════════════════════════
   AURUM Fine Dining — script.js  v2.1 (fixed)
   ══════════════════════════════════════════════════ */

'use strict';

// ── AOS Init ──────────────────────────────────────
AOS.init({
  duration: 850,
  easing: 'ease-out-cubic',
  once: true,
  offset: 55,
});

// ── DOM References ────────────────────────────────
const navbar        = document.getElementById('navbar');
const hamburger     = document.getElementById('hamburger');
const navLinks      = document.getElementById('navLinks');
const navOverlay    = document.getElementById('navOverlay');
const navLinkEls    = document.querySelectorAll('.nav-link');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const galleryItems  = document.querySelectorAll('.gallery-item');
const numberEls     = document.querySelectorAll('.number');
const cartWidget    = document.getElementById('cartWidget');
const cartToggle    = document.getElementById('cartToggle');
const cartDropdown  = document.getElementById('cartDropdown');
const cartCountEl   = document.getElementById('cartCount');
const cartItemsEl   = document.getElementById('cartItems');
const cartTotalEl   = document.getElementById('cartTotal');
const cartClear     = document.getElementById('cartClear');
const cartCheckout  = document.getElementById('cartCheckout');

// ── BUG FIX 1: Custom Cursor — crash on mobile & missing null guard ────────
// cursorDot/cursorRing are null on pages that omit those divs, causing
// "Cannot read properties of null" crash on every mousemove. Also,
// touch devices don't fire mousemove at all — no point running the RAF loop.
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const isTouch    = () => window.matchMedia('(hover: none)').matches;

if (cursorDot && cursorRing && !isTouch()) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
  });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button, .gallery-item, .dish-card, .why-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── Sticky Navbar ─────────────────────────────────
let lastScroll = 0;
navbar.style.transition = 'transform 0.42s ease, background 0.42s ease, padding 0.42s ease, box-shadow 0.42s ease';

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 60);

  if (window.innerWidth > 900 && scrollY > 300 && scrollY > lastScroll) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScroll = scrollY;
  updateActiveLink();
}, { passive: true });

// ── Active Nav Link on Scroll ──────────────────────
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 130) current = sec.getAttribute('id');
  });
  navLinkEls.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ── Hamburger / Mobile Nav ────────────────────────
function closeNav() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  if (navOverlay) navOverlay.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinkEls.forEach(link => link.addEventListener('click', closeNav));

if (navOverlay) navOverlay.addEventListener('click', closeNav);

document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target) &&
    !(navOverlay && navOverlay.contains(e.target))
  ) closeNav();
});

// ── BUG FIX 2: Smooth Scroll — close mobile nav BEFORE scrolling ─────────
// Without a delay, the page tries to scroll while the nav panel is still
// sliding shut (transition 0.44s), causing the offset calculation to be wrong
// and the page jumping to the wrong position on mobile.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();

    const wasOpen = navLinks.classList.contains('open');
    closeNav();

    setTimeout(() => {
      const navH = navbar.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }, wasOpen ? 460 : 0);
  });
});

// ── Hero Particles ────────────────────────────────
(function spawnParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const count  = window.innerWidth < 768 ? 14 : 32;
  const shapes = ['50%', '0%', '30%'];

  for (let i = 0; i < count; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3.5 + 1;
    p.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${Math.random() * 100}%;
      bottom: ${Math.random() * -40}%;
      border-radius: ${shapes[Math.floor(Math.random() * shapes.length)]};
      animation-duration: ${9 + Math.random() * 16}s;
      animation-delay:    ${Math.random() * 12}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
})();

// ── BUG FIX 3: Lightbox — null guard prevents crash when elements missing ─
if (lightbox && lightboxImg && lightboxClose) {
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 400);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

// ── Animated Number Counter ───────────────────────
function animateCounters() {
  numberEls.forEach(el => {
    const target = +el.getAttribute('data-target');
    if (isNaN(target)) return;   // BUG FIX 4: skip elements without data-target
    const step      = 16;
    const increment = target / (2000 / step);
    let   current   = 0;
    const timer     = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, step);
  });
}

const numbersSection = document.querySelector('.numbers-section');
let countersTriggered = false;

if (numbersSection) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersTriggered) {
        countersTriggered = true;
        animateCounters();
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 }).observe(numbersSection);
}

// ── BUG FIX 5: Toast and animateDishBtn defined BEFORE cart code calls them ─
// In the original, animateDishBtn (line 351) and showToast (line 361) were
// defined AFTER the dishBtns forEach (line 282) that calls them.
// With 'use strict' + const/let this isn't hoisted — calling before definition
// throws ReferenceError. Both are moved up here.

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(14px)';
    setTimeout(() => toast.remove(), 400);
  }, 2600);
}

function animateDishBtn(btn) {
  btn.style.transform  = 'rotate(90deg) scale(1.3)';
  btn.style.background = 'linear-gradient(135deg, var(--gold-light), var(--gold))';
  setTimeout(() => {
    btn.style.transform  = '';
    btn.style.background = '';
  }, 350);
}

// ── Cart System ───────────────────────────────────
let cart     = [];
let cartOpen = false;

const dishData = [
  { name: 'Wagyu Ribeye Steak',        price: 10999 },
  { name: 'Lobster Thermidor',          price: 7999  },
  { name: 'Black Truffle Tagliatelle',  price: 5999  },
  { name: 'Pan-Seared Salmon',          price: 4999  },
  { name: 'Gold Leaf Soufflé',          price: 2999  },
  { name: 'Tasting Menu',               price: 15999 },
];

document.querySelectorAll('.dish-btn').forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dish = dishData[index] || { name: `Dish ${index + 1}`, price: 0 };
    addToCart(dish);
    animateDishBtn(btn);
    showToast(`${dish.name} added ✦`);
  });
});

function addToCart(dish) {
  const existing = cart.find(d => d.name === dish.name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...dish, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((sum, d) => sum + d.price * d.qty, 0);
  const count = cart.reduce((sum, d) => sum + d.qty, 0);

  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.classList.add('bump');
    setTimeout(() => cartCountEl.classList.remove('bump'), 300);
  }
  if (cartTotalEl) cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}` ;
  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.length === 0
      ? '<p class="cart-empty">Your order is empty</p>'
      : cart.map(item => `
          <div class="cart-item-row">
            <span>${item.qty}× ${item.name}</span>
            <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
          </div>`).join('');
  }
}

if (cartToggle) {
  cartToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    cartOpen = !cartOpen;
    if (cartDropdown) cartDropdown.classList.toggle('open', cartOpen);
  });
}

document.addEventListener('click', (e) => {
  if (cartOpen && cartWidget && !cartWidget.contains(e.target)) {
    cartOpen = false;
    if (cartDropdown) cartDropdown.classList.remove('open');
  }
});

if (cartClear)    cartClear.addEventListener('click',    () => { cart = []; updateCartUI(); });
if (cartCheckout) cartCheckout.addEventListener('click', () => { cartOpen = false; if (cartDropdown) cartDropdown.classList.remove('open'); });

// ── Dish Card Tilt (desktop only) ────────────────
if (!isTouch()) {
  document.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform  = `translateY(-10px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      card.style.boxShadow  = `${-x * 16}px ${-y * 16}px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.14)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// ── Why Card Spotlight (desktop only) ────────────
if (!isTouch()) {
  document.querySelectorAll('.why-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(201,168,76,0.09) 0%, var(--black-card) 60%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}

// ── About Image Parallax (desktop only) ──────────
const aboutImg   = document.querySelector('.about-img-frame img');
const aboutFrame = document.querySelector('.about-img-frame');
if (aboutImg && aboutFrame && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const rect     = aboutFrame.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    aboutImg.style.transform = `scale(1.1) translateY(${(progress - 0.5) * 45}px)`;
  }, { passive: true });
}

// ── Marquee pause on mobile touch ─────────────────
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('touchstart', () => { marqueeTrack.style.animationPlayState = 'paused';  }, { passive: true });
  marqueeTrack.addEventListener('touchend',   () => { marqueeTrack.style.animationPlayState = 'running'; }, { passive: true });
}

// ── Gold shimmer on section titles (desktop only) ─
if (!isTouch()) {
  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => { title.style.textShadow = '0 0 60px rgba(201,168,76,0.22)'; });
    title.addEventListener('mouseleave', () => { title.style.textShadow = ''; });
  });
}

// ── Scroll progress bar ───────────────────────────
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
Object.assign(progressBar.style, {
  position: 'fixed', top: '0', left: '0', height: '2px', width: '0%',
  background: 'linear-gradient(to right, var(--gold-dark), var(--gold-light))',
  zIndex: '9999', transition: 'width 0.1s ease', pointerEvents: 'none',
});
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const docH    = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
}, { passive: true });

// ── BUG FIX 6: Dish card stagger — wrong index in IntersectionObserver ────
// entries.forEach((entry, i) => ...) resets i to 0 on every observer callback
// batch, so ALL cards that enter the viewport at the same time get delay 0.
// Fix: pre-map each card to its real DOM index before observing.
const dishCards = document.querySelectorAll('.dish-card');
if ('IntersectionObserver' in window && dishCards.length) {
  const cardIndexMap = new Map();
  dishCards.forEach((card, i) => cardIndexMap.set(card, i));

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const i = cardIndexMap.get(entry.target) ?? 0;
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 80 * i);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  dishCards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(30px)';
    card.style.transition = 'opacity 0.7s ease, transform 0.7s ease, box-shadow 0.38s ease, border-color 0.38s ease';
    cardObserver.observe(card);
  });
}

// ── Reserve Now — Success Modal ───────────────────
const reserveNowBtn         = document.getElementById('reserveNowBtn');
const reservationModal      = document.getElementById('reservationModal');
const reservationModalClose = document.getElementById('reservationModalClose');
const reservationDetails    = document.getElementById('reservationDetails');

if (reserveNowBtn && reservationModal) {
  reserveNowBtn.addEventListener('click', () => {
    const nameInput = document.querySelector('.cta-field input[type="text"]');
    const guestSel  = document.querySelector('.cta-field select');
    const dateInput = document.querySelector('.cta-field input[type="date"]');

    const name   = nameInput?.value.trim()  || null;
    const guests = guestSel?.value          || null;
    const date   = dateInput?.value         || null;

    if (reservationDetails) {
      if (name || guests || date) {
        let rows = '';
        if (name)   rows += `<div class="detail-row"><i class="fas fa-user"></i> Name <strong>${name}</strong></div>`;
        if (guests) rows += `<div class="detail-row"><i class="fas fa-users"></i> Guests <strong>${guests}</strong></div>`;
        if (date) {
          const fmt = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
          rows += `<div class="detail-row"><i class="fas fa-calendar-alt"></i> Date <strong>${fmt}</strong></div>`;
        }
        reservationDetails.innerHTML = rows;
        reservationDetails.classList.add('visible');
      } else {
        reservationDetails.classList.remove('visible');
      }
    }

    reservationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

function closeReservationModal() {
  if (!reservationModal) return;
  reservationModal.classList.remove('active');
  document.body.style.overflow = '';
}

if (reservationModalClose) reservationModalClose.addEventListener('click', closeReservationModal);
if (reservationModal)      reservationModal.addEventListener('click', (e) => { if (e.target === reservationModal) closeReservationModal(); });

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (reservationModal?.classList.contains('active')) closeReservationModal();
});