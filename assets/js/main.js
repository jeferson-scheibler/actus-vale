document.addEventListener('DOMContentLoaded', () => {
  const head = document.querySelector('.head');
  const fill = document.querySelector('.rail-fill');

  /* cabeçalho + progresso da rail */
  const onScroll = () => {
    if (head) head.classList.toggle('stuck', window.scrollY > 40);
    if (fill) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.height = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu mobile */
  const burger = document.querySelector('.burger');
  const sheet = document.querySelector('.sheet');
  if (burger && sheet) {
    burger.addEventListener('click', () => {
      const open = sheet.classList.toggle('open');
      burger.classList.toggle('on', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      sheet.classList.remove('open');
      burger.classList.remove('on');
      document.body.style.overflow = '';
    }));
  }

  /* revelação em scroll (elementos .rv e barras .measure) */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.rv, .measure').forEach((el, i) => {
    if (el.classList.contains('rv') && !el.style.getPropertyValue('--d')) {
      el.style.setProperty('--d', (i % 6) * 0.07 + 's');
    }
    io.observe(el);
  });

  /* filtros do blog */
  const filters = document.querySelectorAll('.filters button');
  const entries = document.querySelectorAll('.entries .entry');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      filters.forEach(b => b.setAttribute('aria-pressed', b === btn));
      entries.forEach(en => {
        const show = cat === 'all' || en.dataset.cat === cat;
        en.style.display = show ? '' : 'none';
      });
    });
  });

  /* captura de e-mail — ainda sem backend */
  const field = document.querySelector('.field');
  if (field) {
    field.closest('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = field.querySelector('input');
      if (input && input.value) {
        input.value = '';
        input.placeholder = 'Recebido. Falamos em breve.';
      }
    });
  }
});
