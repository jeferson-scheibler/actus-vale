# Actus Vale

Site do movimento Actus Vale. Vale do Taquari, RS.

Site estático, sem build. HTML, CSS e um arquivo de JS.

## Estrutura

```
index.html                    página inicial (manifesto, princípios, atuação, blog, convite)
blog/index.html               índice de publicações, com filtro por categoria
blog/post.html                modelo de artigo, duplicar para cada publicação nova
assets/css/style.css          sistema visual completo
assets/js/main.js             progresso de rolagem, revelações, filtros
assets/img/mark.svg           símbolo do pico (favicon e rail)
assets/img/logo-horizontal-light.png   logotipo da navbar, versão clara
assets/img/vale-do-taquari.svg         malha dos 36 municípios, fundo da seção do blog
```

### O mapa do Vale

`assets/img/vale-do-taquari.svg` é gerado a partir das malhas municipais do IBGE
(API `servicodados.ibge.gov.br/api/v3/malhas`), um `<path>` por município. A região
é composta pelos 31 municípios da microrregião Lajeado-Estrela mais Anta Gorda,
Arvorezinha, Ilópolis, Putinga e São José do Herval, totalizando os 36 do Corede
Vale do Taquari.

O arquivo é estático e não precisa ser reconstruído, a menos que a composição da
região mude. Para regerar:

```bash
python tools/gerar-mapa.py assets/img/vale-do-taquari.svg
```

Precisa de rede (baixa do IBGE) e faz cache em `tools/cache/`, que não é versionado.

## Publicar um artigo novo

1. Duplique `blog/post.html` com um nome descritivo (ex.: `blog/tempo-abertura-empresa.html`).
2. Troque `<title>`, `<meta name="description">`, o cabeçalho e o corpo em `.prose`.
3. Adicione a linha correspondente em `blog/index.html`, dentro de `.entries`, com o
   `data-cat` certo para o filtro funcionar (`observatorio`, `manifesto`, `formacao`, `contas`).

## Pendências conhecidas

- **Formulário de e-mail não tem backend.** Hoje só limpa o campo. Precisa ser
  ligado a um serviço (Formspree, Buttondown, Mailchimp) antes de valer como captura.
- **Os artigos do blog são de exemplo.** Títulos, datas e textos existem para mostrar
  o formato. Substituir pelos reais antes de divulgar o site.

## Desenvolvimento

Sem dependências. Abra `index.html` no navegador, ou sirva a pasta:

```bash
python -m http.server 8000
```

## Deploy

Automático via GitHub Actions (`.github/workflows/pages.yml`) a cada push na `main`.
