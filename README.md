# Actus Vale

Site do movimento Actus Vale. Vale do Taquari, RS.

Site estático, sem build. HTML, CSS e um arquivo de JS.

## Estrutura

```
index.html            página inicial (manifesto, princípios, atuação, observatório)
blog/index.html       índice de publicações, com filtro por categoria
blog/post.html        modelo de artigo, duplicar para cada publicação nova
assets/css/style.css  sistema visual completo
assets/js/main.js     progresso de rolagem, revelações, filtros
assets/img/mark.svg   símbolo do pico (usado como favicon e na rail)
```

## Publicar um artigo novo

1. Duplique `blog/post.html` com um nome descritivo (ex.: `blog/tempo-abertura-empresa.html`).
2. Troque `<title>`, `<meta name="description">`, o cabeçalho e o corpo em `.prose`.
3. Adicione a linha correspondente em `blog/index.html`, dentro de `.entries`, com o
   `data-cat` certo para o filtro funcionar (`observatorio`, `manifesto`, `formacao`, `contas`).

## Pendências conhecidas

- **Números do Observatório são ilustrativos.** Estão rotulados como tais na página
  (`index.html`, seção `#observatorio`). Substituir pelos valores reais quando o
  primeiro levantamento fechar.
- **Formulário de e-mail não tem backend.** Hoje só limpa o campo. Precisa ser
  ligado a um serviço (Formspree, Buttondown, Mailchimp) antes de valer como captura.

## Desenvolvimento

Sem dependências. Abra `index.html` no navegador, ou sirva a pasta:

```bash
python -m http.server 8000
```

## Deploy

Automático via GitHub Actions (`.github/workflows/pages.yml`) a cada push na `main`.
