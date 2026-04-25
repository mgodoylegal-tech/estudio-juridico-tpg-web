(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const closeButton = document.getElementById('mobileNavClose');
  let lastFocused = null;

  const setMenuState = (open) => {
    if (!toggle || !mobileNav || !backdrop) return;

    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileNav.hidden = !open;
    backdrop.hidden = !open;
    document.body.classList.toggle('nav-open', open);

    if (open) {
      lastFocused = document.activeElement;
      const firstAction = mobileNav.querySelector('a, button');
      if (firstAction) firstAction.focus();
    } else if (lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  };

  if (toggle && mobileNav && backdrop) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!open);
    });

    if (closeButton) {
      closeButton.addEventListener('click', () => setMenuState(false));
    }

    backdrop.addEventListener('click', () => setMenuState(false));

    mobileNav.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) {
        setMenuState(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 980 && toggle.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
      }
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  document.querySelectorAll('.faq details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const clearFieldState = (field) => {
    field.removeAttribute('aria-invalid');
  };

  const markInvalid = (field) => {
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  };

  if (form && status) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    fields.forEach((field) => {
      field.addEventListener('input', () => clearFieldState(field));
      field.addEventListener('change', () => clearFieldState(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.textContent = '';
      status.className = 'form-status';
      fields.forEach(clearFieldState);

      const data = new FormData(form);
      const nombre = String(data.get('nombre') || '').trim();
      const tel = String(data.get('telefono') || '').trim();
      const email = String(data.get('email') || '').trim();
      const tipo = String(data.get('tipo') || '').trim();
      const mensaje = String(data.get('mensaje') || '').trim();

      const requiredChecks = [
        { value: nombre, field: document.getElementById('f-nombre'), message: 'Completá tu nombre y apellido.' },
        { value: tel, field: document.getElementById('f-tel'), message: 'Completá un teléfono de contacto.' },
        { value: email, field: document.getElementById('f-email'), message: 'Completá un email válido.' },
        { value: tipo, field: document.getElementById('f-tipo'), message: 'Seleccioná el tipo de consulta.' },
        { value: mensaje, field: document.getElementById('f-msg'), message: 'Describí brevemente tu consulta.' }
      ];

      const missing = requiredChecks.find((item) => !item.value);
      if (missing && missing.field) {
        markInvalid(missing.field);
        status.textContent = missing.message;
        status.classList.add('err');
        return;
      }

      const emailField = document.getElementById('f-email');
      if (!/^\S+@\S+\.\S+$/.test(email) && emailField) {
        markInvalid(emailField);
        status.textContent = 'Revisá el email ingresado.';
        status.classList.add('err');
        return;
      }

      const phoneByType = {
        'Empresa / PYME': '5491155857623',
        'Fraude bancario': '5491155857623',
        'Despido / laboral': '5491154845455',
        'ART': '5491154845455',
        'Accidente de tránsito': '5491154845455',
        'Daños y perjuicios': '5491154845455',
        'Sucesión': '5491160231009',
        'Usucapión': '5491160231009',
        'Amparo de salud': '5491155857623',
        'Obra social / prepaga': '5491155857623',
        'Defensa del consumidor': '5491155857623',
        'Otro': '5491155857623'
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
