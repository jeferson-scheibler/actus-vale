// Cloudflare Worker — recebe o formulário "Traga o projeto" do site
// e cria uma issue no repositório GitHub. O GitHub notifica por e-mail
// automaticamente o dono do repositório quando uma issue é criada —
// é assim que isso vira "e-mail" sem precisar de um segundo serviço.
//
// Configuração (veja docs/formulario-contato.md para o passo a passo):
//   1. Crie um token do GitHub com permissão "Issues: Read and write"
//      restrita só a este repositório.
//   2. No painel do Worker, adicione o segredo GITHUB_TOKEN com esse token.
//   3. Depois de publicar, cole a URL do Worker no atributo
//      data-worker-url do <form id="proj-form"> em index.html.

const GITHUB_OWNER = 'jeferson-scheibler';
const GITHUB_REPO = 'actus-vale';

// origens que podem chamar este Worker — ajuste se o domínio mudar
const ALLOWED_ORIGINS = [
  'https://actusvale.com.br',
  'https://www.actusvale.com.br',
  'https://jeferson-scheibler.github.io',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function texto(v, max = 2000) {
  return String(v ?? '').trim().slice(0, max);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // DIAGNÓSTICO TEMPORÁRIO — remover depois de confirmar o segredo.
    // Nunca expõe o token inteiro, só formato/tamanho, pra achar erro de
    // nome de variável ou de ambiente (Production x Preview) na Cloudflare.
    if (request.method === 'GET') {
      const t = env.GITHUB_TOKEN;
      return json({
        temToken: typeof t !== 'undefined' && t !== null && t !== '',
        tipo: typeof t,
        tamanho: t ? t.length : 0,
        comeca: t ? t.slice(0, 8) : null,
        termina: t ? t.slice(-4) : null,
        temEspacoOuQuebra: t ? /\s/.test(t) : null,
      }, 200, headers);
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method not allowed' }, 405, headers);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid json' }, 400, headers);
    }

    // campo-armadilha: se veio preenchido, é robô. Responde sucesso
    // (não dá pista de que foi filtrado) e não cria nada.
    if (texto(body.empresa)) {
      return json({ ok: true }, 200, headers);
    }

    const nome = texto(body.nome, 200);
    const email = texto(body.email, 200);
    const mensagem = texto(body.mensagem, 4000);
    if (!nome || !email || !mensagem) {
      return json({ ok: false, error: 'campos obrigatórios faltando' }, 400, headers);
    }
    if (mensagem.length < 10) {
      return json({ ok: false, error: 'mensagem muito curta' }, 400, headers);
    }

    const municipio = texto(body.municipio, 120) || '—';
    const categoria = texto(body.categoria, 60) || '—';
    const telefone = texto(body.telefone, 40) || '—';

    const title = `[Projeto] ${nome} — ${municipio}`;
    const issueBody = [
      `**Município:** ${municipio}`,
      `**Categoria:** ${categoria}`,
      `**E-mail:** ${email}`,
      `**WhatsApp:** ${telefone}`,
      '',
      '---',
      '',
      mensagem,
    ].join('\n');

    const ghResp = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'actus-vale-worker',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body: issueBody,
          labels: ['contato'],
        }),
      }
    );

    if (!ghResp.ok) {
      const details = await ghResp.text();
      return json({ ok: false, error: `github ${ghResp.status}`, details }, 502, headers);
    }

    const issue = await ghResp.json();
    return json({ ok: true, issueUrl: issue.html_url }, 200, headers);
  },
};
