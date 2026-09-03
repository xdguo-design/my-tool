const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = primaryNav?.classList.toggle('is-open') ?? false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.primary-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const currentLocale = document.documentElement.lang.toLowerCase();
localStorage.setItem('balenda-locale', currentLocale);

document.querySelectorAll('.language-link').forEach((link) => {
  link.addEventListener('click', () => {
    const locale = link.getAttribute('hreflang')?.toLowerCase();
    if (locale) localStorage.setItem('balenda-locale', locale);
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
revealItems.forEach((item, index) => item.style.setProperty('--reveal-index', String(index % 6)));
document.documentElement.classList.add('reveal-ready');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const carousel = document.querySelector('.hero-carousel[data-carousel]');
const slides = [...(carousel?.querySelectorAll('[data-carousel-slide]') ?? [])];
const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentSlide = 0;
let autoPlayTimer;

const showSlide = (index) => {
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentSlide;
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });
};

const stopAutoPlay = () => {
  if (autoPlayTimer) window.clearInterval(autoPlayTimer);
  autoPlayTimer = undefined;
};

const startAutoPlay = () => {
  if (!carousel || !motionAllowed || document.visibilityState === 'hidden') return;
  stopAutoPlay();
  autoPlayTimer = window.setInterval(() => showSlide(currentSlide + 1), 7000);
};

if (carousel && slides.length) {
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);
  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoPlay();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') stopAutoPlay();
    else startAutoPlay();
  });

  if (motionAllowed && 'IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        carousel.classList.add('is-ready');
        startAutoPlay();
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    carouselObserver.observe(carousel);
  } else {
    carousel.classList.add('is-static');
  }
}
