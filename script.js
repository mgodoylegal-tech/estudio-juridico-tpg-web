/* Estudio Jurídico TPG — Interacciones */
(function () {
  'use strict';

  // --------- Header con sombra al hacer scroll ---------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --------- Menú mobile ---------
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', !open ? 'Cerrar menú' : 'Abrir menú');
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        mobileNav.hidden = true;
      }
    });
  }

  // --------- Reveal on scroll ---------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // --------- FAQ: cerrar otros al abrir uno (acordeón suave) ---------
  document.querySelectorAll('.faq details').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        document.querySelectorAll('.faq details').forEach((other) => {
          if (other !== d) other.open = false;
        });
      }
    });
  });

  // --------- Año en footer ---------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --------- Formulario: envía el mensaje precargado a WhatsApp ---------
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      const data = new FormData(form);
      const nombre   = (data.get('nombre')   || '').toString().trim();
      const tel      = (data.get('telefono') || '').toString().trim();
      const email    = (data.get('email')    || '').toString().trim();
      const tipo     = (data.get('tipo')     || '').toString().trim();
      const mensaje  = (data.get('mensaje')  || '').toString().trim();

      if (!nombre || !tel || !email || !tipo || !mensaje) {
        status.textContent = 'Completá todos los campos para continuar.';
        status.classList.add('err');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        status.textContent = 'Revisá el email ingresado.';
        status.classList.add('err');
        return;
      }

      // Selección de profesional según el tipo de consulta
      const phoneByType = {
        'Empresa / PYME':         '5491155857623', // Matías
        'Fraude bancario':        '5491155857623', // Matías
        'Despido / laboral':      '5491154845455', // Pablo
        'ART':                    '5491154845455', // Pablo
        'Accidente de tránsito':  '5491154845455', // Pablo
        'Daños y perjuicios':     '5491154845455', // Pablo
        'Sucesión':               '5491160231009', // Iñaki
        'Usucapión':              '5491160231009', // Iñaki
        'Amparo de salud':        '5491155857623', // Matías
        'Obra social / prepaga':  '5491155857623', // Matías
        'Defensa del consumidor': '5491155857623', // Matías
        'Otro':                   '5491155857623'
      };
      const phone = phoneByType[tipo] || '5491155857623';

      const text =
        `Hola, soy ${nombre}.\n` +
        `Quiero hacer una consulta con Estudio Jurídico TPG.\n\n` +
        `Tipo de consulta: ${tipo}\n` +
        `Teléfono: ${tel}\n` +
        `Email: ${email}\n\n` +
        `Detalle:\n${mensaje}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');

      status.textContent = 'Abrimos WhatsApp con tu mensaje precargado. Confirmá el envío desde la aplicación.';
      status.classList.add('ok');
      form.reset();
    });
  }
})();
