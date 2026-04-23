/**
 * Companhia do Conserto - Scripts Principais
 * Responsável por: Scroll Suave, Contadores, Galeria, Menu Mobile e Status de Funcionamento.
 */

// 1. Inicialização da biblioteca Lenis para Smooth Scrolling nativo
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Lógica de Scroll Suave para links internos (âncoras)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = this.getAttribute('href');
    lenis.scrollTo(target === '#' ? 0 : target, {
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  });
});

// 3. Utilidades de Formatação e Contagem
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function animateCount(element, target, suffix, duration) {
  const increment = target / (duration / 16);
  let current = 0;
  const isKilo = suffix.includes('k');

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    let displayValue;
    if (isKilo) {
      displayValue = Math.floor(current / 1000);
    } else if (target % 1 !== 0) {
      displayValue = current.toFixed(1).replace('.', ',');
    } else {
      displayValue = formatNumber(Math.floor(current));
    }
    element.innerText = displayValue + suffix;
  }, 16);
}

// 4. Intersection Observer para Contadores
const countUpElements = document.querySelectorAll('.count-up');
const countUpObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const target = parseFloat(element.dataset.target);
      const suffix = element.dataset.suffix || '';
      animateCount(element, target, suffix, 2000);
      observer.unobserve(element);
    }
  });
}, { threshold: 0.5 });

countUpElements.forEach(element => {
  element.innerText = '0' + (element.dataset.suffix || '');
  countUpObserver.observe(element);
});

// 5. Navegação de Avaliações
const prevBtn = document.getElementById('prev-review');
const nextBtn = document.getElementById('next-review');
const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');

if (nextBtn && prevBtn) {
  nextBtn.addEventListener('click', () => {
    page1.classList.remove('active');
    page2.classList.add('active');
    nextBtn.style.opacity = '0'; nextBtn.style.pointerEvents = 'none';
    prevBtn.style.opacity = '1'; prevBtn.style.pointerEvents = 'all';
    setTimeout(() => lenis.resize(), 500);
  });

  prevBtn.addEventListener('click', () => {
    page2.classList.remove('active');
    page1.classList.add('active');
    prevBtn.style.opacity = '0'; prevBtn.style.pointerEvents = 'none';
    nextBtn.style.opacity = '1'; nextBtn.style.pointerEvents = 'all';
    setTimeout(() => lenis.resize(), 500);
  });
}

// 6. Menu Mobile
const menuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}

// 7. Lógica do Portfólio (Antes/Depois)
document.querySelectorAll('.gallery').forEach((gallery) => {
  let position = 50;
  let direction = 0.15;
  
  function animate() {
    position += direction;
    if (position >= 90 || position <= 10) direction *= -1;
    gallery.style.setProperty('--exposure', `${position}%`);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});

// 8. Status de Funcionamento
function checkBusinessStatus() {
  const now = new Date();
  const day = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = 8 * 60;
  const closeTime = 17 * 60 + 30;

  const statusElement = document.getElementById('business-status');
  if (!statusElement) return;

  const isOpen = day >= 1 && day <= 5 && currentTime >= openTime && currentTime < closeTime;
  statusElement.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${isOpen ? 'Estamos Abertos' : 'Estamos Fechados'}`;
  statusElement.className = `status-badge ${isOpen ? 'status-open' : 'status-closed'}`;
}
checkBusinessStatus();
setInterval(checkBusinessStatus, 60000);

// 9. Infraestrutura Dots
const structureGrid = document.querySelector('.structure-grid');
const dotsContainer = document.querySelector('.structure-dots');
if (structureGrid && dotsContainer) {
  const items = structureGrid.querySelectorAll('.structure-item');
  items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.dot');
  structureGrid.addEventListener('scroll', () => {
    const index = Math.round(structureGrid.scrollLeft / (items[0].offsetWidth + 16));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }, { passive: true });
}

// 10. Forçar a reprodução dos vídeos do Hero (Correção para Mobile e Autoplay)
function forceHeroVideoPlay() {
  const videos = document.querySelectorAll('.hero-video');
  
  videos.forEach(video => {
    // Tenta reproduzir automaticamente
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Se o navegador bloquear (comum em mobile), tenta dar play no primeiro toque ou clique
        const playOnGesture = () => {
          video.play();
          ['click', 'touchstart'].forEach(evt => document.removeEventListener(evt, playOnGesture));
        };
        ['click', 'touchstart'].forEach(evt => document.addEventListener(evt, playOnGesture));
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', forceHeroVideoPlay);