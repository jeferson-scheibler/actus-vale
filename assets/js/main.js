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

    const setStatus = (texto, estado) => {
      if (!status) return;
      status.textContent = texto;
      if (estado) status.setAttribute('data-state', estado);
      else status.removeAttribute('data-state');
    };

    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // O campo-armadilha vai junto no envio e quem decide o que fazer
      // com ele é o Worker. Não descarta aqui no cliente: autofill de
      // navegador/gerenciador de senha já preencheu esse campo por engano
      // uma vez, e descartar cedo demais faz perder contato de verdade.

      const workerUrl = projForm.dataset.workerUrl;
      if (!workerUrl) {
        setStatus('Formulário ainda não está conectado. Escreva direto pelo e-mail abaixo.', 'erro');
        return;
      }

      // o campo-armadilha vai junto de propósito — é o Worker que decide
      // o que fazer com ele, ver comentário acima
      const dados = Object.fromEntries(new FormData(projForm).entries());

      submitBtn.disabled = true;
      setStatus('Enviando…');

      // erros de validação que a pessoa consegue corrigir sozinha —
      // mostra o motivo específico em vez da mensagem genérica
      const ERROS_CORRIGIVEIS = {
        'campos obrigatórios faltando': 'Preenche nome, e-mail e a mensagem antes de enviar.',
        'mensagem muito curta': 'Escreve um pouco mais na mensagem — só isso falta.',
      };

      try {
        const resp = await fetch(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        });

        if (!resp.ok) {
          let payload = null;
          try { payload = await resp.json(); } catch { /* corpo não era JSON */ }
          const amigavel = payload && ERROS_CORRIGIVEIS[payload.error];
          setStatus(
            amigavel || 'Não deu para enviar agora. Tenta de novo ou escreve direto pelo e-mail abaixo.',
            'erro'
          );
          return;
        }

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
