(function () {
  'use strict';

  const LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzhxkHbPiPVxMDHLWGuMomh0h_XfMXcSDgqZS_-kR4CByTXBpsAEzHira-Ku5Yb-yv4Pg/exec';

  const LAWYERS = {
    matias: { name: 'Matías Godoy', phone: '5491155857623' },
    inaki: { name: 'Iñaki Pericoli', phone: '5491160231009' },
    pablo: { name: 'Pablo Tuozzo', phone: '5491154825455' }
  };

  const ASSIGNMENT_BY_TYPE = {
    'Fraude bancario': LAWYERS.matias,
    'Empresas / PYMES': LAWYERS.matias,
    'Empresa / PYME': LAWYERS.matias,
    'Despidos / laboral / ART': LAWYERS.pablo,
    'Despido / laboral': LAWYERS.pablo,
    'Laboral / ART': LAWYERS.pablo,
    'ART': LAWYERS.pablo,
    'Daños / accidentes': LAWYERS.pablo,
    'Daños y perjuicios': LAWYERS.pablo,
    'Accidente de tránsito': LAWYERS.pablo,
    'Sucesiones / civil patrimonial': LAWYERS.inaki,
    'Sucesión': LAWYERS.inaki,
    'Usucapión / inmuebles': LAWYERS.inaki,
    'Usucapión': LAWYERS.inaki,
    'Familia / divorcios': LAWYERS.inaki,
    'Familia': LAWYERS.inaki,
    'Divorcio': LAWYERS.inaki,
    'Alimentos': LAWYERS.inaki,
    'Amparos de salud': LAWYERS.matias,
    'Obra social / prepaga': LAWYERS.matias,
    'Defensa del consumidor': LAWYERS.matias,
    'Otro': LAWYERS.matias
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
    const getFocusableMenuItems = () => Array.from(
      mobileNav.querySelectorAll('a[href], button:not([disabled])')
    ).filter((item) => item instanceof HTMLElement && item.offsetParent !== null);

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
      if (toggle.getAttribute('aria-expanded') !== 'true') return;

      if (event.key === 'Escape') {
        setMenuState(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusable = getFocusableMenuItems();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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

  const endpointConfigured = () => (
    LEADS_ENDPOINT &&
    LEADS_ENDPOINT !== 'PEGAR_URL_DE_APPS_SCRIPT' &&
    /^https:\/\/script\.google\.com\/macros\/s\//.test(LEADS_ENDPOINT)
  );

  const getAssignmentByType = (tipo) => ASSIGNMENT_BY_TYPE[tipo] || LAWYERS.matias;

  const createLeadId = () => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TPG-${timestamp}-${random}`;
  };

  const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const openWhatsApp = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    const webUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    if (isMobileDevice()) window.location.href = webUrl;
    else window.open(webUrl, '_blank', 'noopener');
  };

  const queueLeadSave = (payload) => {
    if (!endpointConfigured()) return false;

    const body = JSON.stringify(payload);
    if ('sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
      return navigator.sendBeacon(LEADS_ENDPOINT, blob);
    }

    fetch(LEADS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body
    }).catch(() => {});

    return true;
  };

  const submitLead = async (payload) => {
    if (!endpointConfigured()) {
      return { ok: false, skipped: true };
    }

    const response = await fetch(LEADS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return { ok: response.type === 'opaque' || response.ok };
  };

  document.querySelectorAll('.js-contact-form').forEach((form) => {
    const status = form.querySelector('.form-status');
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    fields.forEach((field) => {
      field.addEventListener('input', () => clearFieldState(field));
      field.addEventListener('change', () => clearFieldState(field));
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }
      fields.forEach(clearFieldState);

      const submitButton = form.querySelector('[type="submit"]');

      const data = new FormData(form);
      const nombre = String(data.get('nombre') || '').trim();
      const tel = String(data.get('telefono') || '').trim();
      const email = String(data.get('email') || '').trim();
      const tipo = String(data.get('tipo') || '').trim();
      const mensaje = String(data.get('mensaje') || '').trim();
      const origen = String(data.get('origen') || form.getAttribute('data-origin') || '').trim();
      const requireEmail = form.getAttribute('data-require-email') === 'true';

      const requiredChecks = [
        { value: nombre, field: form.querySelector('[name="nombre"]'), message: 'Completá tu nombre y apellido.' },
        { value: tel, field: form.querySelector('[name="telefono"]'), message: 'Completá un teléfono de contacto.' },
        { value: tipo, field: form.querySelector('[name="tipo"]'), message: 'Seleccioná el tipo de consulta.' },
        { value: mensaje, field: form.querySelector('[name="mensaje"]'), message: 'Describí brevemente tu consulta.' }
      ];

      if (requireEmail) {
        requiredChecks.push({ value: email, field: form.querySelector('[name="email"]'), message: 'Completá un email válido.' });
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

      const assignment = getAssignmentByType(tipo);
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

      const leadPayload = {
        lead_id: createLeadId(),
        fecha_hora: new Date().toISOString(),
        nombre,
        telefono: tel,
        email,
        tipo_consulta: tipo,
        mensaje: detailText,
        abogado_asignado: assignment.name,
        numero_whatsapp_asignado: assignment.phone,
        origen: origen || 'Web estudiojuridicotpg.com.ar',
        estado: 'Nuevo',
        pagina_origen: window.location.href,
        user_agent: navigator.userAgent
      };

      const whatsappMessage = lines.join('\n');

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent || '';
        submitButton.textContent = 'Registrando consulta...';
      }

      if (status) {
        status.textContent = 'Registrando consulta...';
        status.classList.add('ok');
      }

      if (isMobileDevice()) {
        queueLeadSave(leadPayload);
        if (status) {
          status.className = 'form-status ok';
          status.textContent = 'Redirigiendo a WhatsApp...';
        }
        window.setTimeout(() => form.reset(), 700);
        openWhatsApp(assignment.phone, whatsappMessage);
        return;
      }

      try {
        const result = await submitLead(leadPayload);

        if (status) {
          status.className = 'form-status';
          if (result.ok) {
            status.textContent = 'Consulta registrada. Redirigiendo a WhatsApp...';
            status.classList.add('ok');
          } else {
            status.textContent = 'No pudimos registrar la consulta, pero podés continuar por WhatsApp.';
            status.classList.add('err');
          }
        }
      } catch (error) {
        if (status) {
          status.className = 'form-status err';
          status.textContent = 'No pudimos registrar la consulta, pero podés continuar por WhatsApp.';
        }
      } finally {
        openWhatsApp(assignment.phone, whatsappMessage);

        window.setTimeout(() => {
          if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'Enviar consulta';
          }
          form.reset();
        }, 900);
      }
    });
  });
})();
