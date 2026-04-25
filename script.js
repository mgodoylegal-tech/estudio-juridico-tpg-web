(function () {
  'use strict';

  const PHONE_BY_TYPE = {
    'Fraude bancario': '5491155857623',
    'Empresas / PYMES': '5491155857623',
    'Empresa / PYME': '5491155857623',
    'Despidos / laboral / ART': '5491154845455',
    'Despido / laboral': '5491154845455',
    'Laboral / ART': '5491154845455',
    'ART': '5491154845455',
    'Daños / accidentes': '5491154845455',
    'Daños y perjuicios': '5491154845455',
    'Accidente de tránsito': '5491154845455',
    'Sucesiones / civil patrimonial': '5491160231009',
    'Sucesión': '5491160231009',
    'Usucapión / inmuebles': '5491160231009',
    'Usucapión': '5491160231009',
    'Familia / divorcios': '5491160231009',
    'Familia': '5491160231009',
    'Divorcio': '5491160231009',
    'Alimentos': '5491160231009',
    'Amparos de salud': '5491155857623',
    'Obra social / prepaga': '5491155857623',
    'Defensa del consumidor': '5491155857623',
    'Otro': '5491155857623'
  };

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
    }, { threshold: 0.14, rootMargin: '0px 0px -24px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  document.querySelectorAll('.faq details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      const scope = detail.closest('.faq');
      if (!scope) return;
      scope.querySelectorAll('details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const clearFieldState = (field) => {
    field.removeAttribute('aria-invalid');
  };

  const markInvalid = (field) => {
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  };

  const getPhoneByType = (tipo) => PHONE_BY_TYPE[tipo] || '5491155857623';

  document.querySelectorAll('.js-contact-form').forEach((form) => {
    const status = form.querySelector('.form-status');
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    fields.forEach((field) => {
      field.addEventListener('input', () => clearFieldState(field));
      field.addEventListener('change', () => clearFieldState(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }
      fields.forEach(clearFieldState);

      const data = new FormData(form);
      const nombre = String(data.get('nombre') || '').trim();
      const tel = String(data.get('telefono') || '').trim();
      const email = String(data.get('email') || '').trim();
      const tipo = String(data.get('tipo') || '').trim();
      const mensaje = String(data.get('mensaje') || '').trim();
      const origen = String(data.get('origen') || form.getAttribute('data-origin') || '').trim();
      const requireEmail = form.getAttribute('data-require-email') === 'true';
      const requireMessage = form.getAttribute('data-require-message') === 'true';

      const requiredChecks = [
        { value: nombre, field: form.querySelector('[name="nombre"]'), message: 'Completá tu nombre y apellido.' },
        { value: tel, field: form.querySelector('[name="telefono"]'), message: 'Completá un teléfono de contacto.' },
        { value: tipo, field: form.querySelector('[name="tipo"]'), message: 'Seleccioná el tipo de consulta.' }
      ];

      if (requireEmail) {
        requiredChecks.push({ value: email, field: form.querySelector('[name="email"]'), message: 'Completá un email válido.' });
      }

      if (requireMessage) {
        requiredChecks.push({ value: mensaje, field: form.querySelector('[name="mensaje"]'), message: 'Describí brevemente tu consulta.' });
      }

      const missing = requiredChecks.find((item) => !item.value);
      if (missing && missing.field) {
        markInvalid(missing.field);
        if (status) {
          status.textContent = missing.message;
          status.classList.add('err');
        }
        return;
      }

      const emailField = form.querySelector('[name="email"]');
      if (email && !/^\S+@\S+\.\S+$/.test(email) && emailField) {
        markInvalid(emailField);
        if (status) {
          status.textContent = 'Revisá el email ingresado.';
          status.classList.add('err');
        }
        return;
      }

      const consentField = form.querySelector('[name="consentimiento"]');
      if (consentField instanceof HTMLInputElement && !consentField.checked) {
        markInvalid(consentField);
        if (status) {
          status.textContent = 'Necesitamos tu conformidad para tratar los datos según la política de privacidad.';
          status.classList.add('err');
        }
        return;
      }

      const phone = getPhoneByType(tipo);
      const detailText = mensaje || 'Quiero recibir una orientación inicial sobre mi caso.';
      const lines = [
        `Hola, soy ${nombre}.`,
        'Te escribo desde el sitio de Estudio Jurídico TPG.',
        '',
        `Tipo de consulta: ${tipo}`,
        `Teléfono: ${tel}`
      ];

      if (email) lines.push(`Email: ${email}`);
      if (origen) lines.push(`Origen: ${origen}`);
      lines.push('', `Detalle: ${detailText}`);

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');

      if (status) {
        status.textContent = 'Abrimos WhatsApp con tu mensaje precargado. Confirmá el envío desde la aplicación.';
        status.classList.add('ok');
      }
      form.reset();
    });
  });
})();
