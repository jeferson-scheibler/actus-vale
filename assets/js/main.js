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

  /* formulário "Traga o projeto": envia para o Worker, que cria uma
     issue no GitHub e — como efeito colateral automático do próprio
     GitHub — dispara e-mail de notificação para o dono do repositório. */
  const projForm = document.querySelector('#proj-form');
  if (projForm) {
    const status = projForm.querySelector('[data-role="status"]');
    const submitBtn = projForm.querySelector('.proj-submit');
    const textoOriginal = status ? status.textContent : '';

    const setStatus = (texto, estado) => {
      if (!status) return;
      status.textContent = texto;
      if (estado) status.setAttribute('data-state', estado);
      else status.removeAttribute('data-state');
    };

    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // campo-armadilha preenchido = robô. Finge sucesso e não envia nada.
      const honeypot = projForm.querySelector('#proj-empresa');
      if (honeypot && honeypot.value) {
        projForm.reset();
        setStatus('Recebido. A gente lê tudo e responde por e-mail.', 'ok');
        return;
      }

      const workerUrl = projForm.dataset.workerUrl;
      if (!workerUrl) {
        setStatus('Formulário ainda não está conectado. Escreva direto pelo e-mail abaixo.', 'erro');
        return;
      }

      const dados = Object.fromEntries(new FormData(projForm).entries());
      delete dados.empresa;

      submitBtn.disabled = true;
      setStatus('Enviando…');

      try {
        const resp = await fetch(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        });
        if (!resp.ok) throw new Error('resposta ' + resp.status);
        projForm.reset();
        setStatus('Recebido. A gente lê tudo e responde por e-mail.', 'ok');
      } catch (err) {
        setStatus('Não deu para enviar agora. Tenta de novo ou escreve direto pelo e-mail abaixo.', 'erro');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
