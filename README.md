# Actus Vale

Site do movimento Actus Vale. Vale do Taquari, RS.

Site estático, sem build. HTML, CSS e um arquivo de JS.

## Estrutura

```
index.html                    página inicial (hero, manifesto, princípios, atuação, projetos, convite)
sobre.html                     manifesto completo — atualmente fora da navegação (ver nota abaixo)
projetos/index.html            lista aberta de projetos apoiados
projetos/modelo.html           modelo de página de projeto, duplicar para cada lançamento
assets/css/style.css           sistema visual completo
assets/js/main.js              progresso de rolagem, revelações, filtros, envio do formulário
assets/img/mark.svg            símbolo do pico (favicon e rail)
assets/img/logo-horizontal-light.png   logotipo da navbar, versão clara
assets/img/vale-do-taquari.svg         malha dos 36 municípios, fundo da seção de projetos
worker/                        Cloudflare Worker que recebe o formulário de contato
docs/formulario-contato.md     passo a passo para configurar o formulário
CNAME                          domínio próprio (actusvale.com.br) para o GitHub Pages
```

### Página "Sobre" fora do ar

O conteúdo completo (manifesto, princípios, atuação) está em `sobre.html`,
mas os links para ela estão comentados em `index.html` e nas páginas de
`projetos/` (busque por "fora do ar por enquanto"). Para reativar, descomente
os blocos marcados nesses arquivos.

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

## Publicar um projeto novo

1. Duplique `projetos/modelo.html` com um nome descritivo (ex.: `projetos/horta-comunitaria-estrela.html`).
2. Preencha tudo que está entre colchetes e apague os comentários do topo do arquivo.
3. Remova a linha `<meta name="robots" content="noindex">`.
4. Adicione a entrada correspondente em `projetos/index.html`, dentro de uma
   `<div class="entries">`, e apague de lá o bloco `<div class="empty">` (só existe
   enquanto não há nenhum projeto lançado).

## Formulário de contato

O formulário "Traga o projeto" (seção `#convite` em `index.html`) cria uma issue
no GitHub via um Cloudflare Worker — o GitHub notifica por e-mail automaticamente.
Configuração em [`docs/formulario-contato.md`](docs/formulario-contato.md).
Enquanto não for configurado, o formulário orienta a pessoa a escrever direto por
e-mail (link logo abaixo dele, sempre funciona).

## Pendências conhecidas

- **Formulário de contato precisa da configuração do Worker.** Ver seção acima.
  Sem isso, mostra aviso e sugere e-mail direto — não perde o contato, só não
  gera issue automática.

## Desenvolvimento

Sem dependências. Abra `index.html` no navegador, ou sirva a pasta:

```bash
python -m http.server 8000
```

## Domínio e deploy

Publicado automaticamente via GitHub Actions (`.github/workflows/pages.yml`) a
cada push na `main`, em `jeferson-scheibler.github.io/actus-vale`.

O domínio próprio `actusvale.com.br` está declarado em `CNAME`, mas ainda não foi
registrado — o DNS precisa ser configurado no registrador assim que a compra for
feita (ver conversa/histórico do projeto para os registros A e CNAME exatos).
