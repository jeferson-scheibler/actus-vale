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

  /* revelação em scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.rv').forEach((el, i) => {
    if (el.classList.contains('rv') && !el.style.getPropertyValue('--d')) {
      el.style.setProperty('--d', (i % 6) * 0.07 + 's');
    }
    io.observe(el);
  });

  /* captura de e-mail, ainda sem backend */
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
