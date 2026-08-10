# Formulário "Traga o projeto" — configuração

O formulário da seção de convite (`#convite`, em `index.html`) manda os
dados para uma função na Cloudflare (Worker) que cria uma **issue** no
repositório `jeferson-scheibler/actus-vale`. O GitHub avisa por e-mail
automaticamente o dono do repositório quando uma issue nova é criada —
por isso não precisa de um serviço de e-mail separado.

Sem essa configuração, o formulário mostra um aviso pedindo para
escrever direto pelo e-mail (o link "Prefere e-mail direto?" logo
abaixo do formulário continua funcionando sempre, mesmo sem isso).

Leva uns 20-30 minutos, só precisa fazer uma vez. Nenhum passo aqui
pode ser feito por outra pessoa — todos exigem acesso à sua conta do
GitHub e à sua conta da Cloudflare.

## 1. Criar o token do GitHub

1. No GitHub, vá em **Settings** (da sua conta, não do repositório) →
   **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Preencha:
   - **Token name:** `actus-vale-worker` (ou outro nome que ajude a
     identificar depois)
   - **Expiration:** escolha um prazo (90 dias, 1 ano — dá para
     renovar depois; expiração longa ou "no expiration" também é
     válido se preferir não renovar)
   - **Repository access:** **Only select repositories** → escolha
     `jeferson-scheibler/actus-vale`. **Não** dê acesso a todos os
     repositórios — isso limita o estrago se o token vazar algum dia.
   - **Permissions** → **Repository permissions** → **Issues** →
     **Read and write**. Todas as outras permissões ficam em "No
     access".
3. Gere o token e **copie agora** — o GitHub só mostra uma vez.

## 2. Conectar o Worker ao repositório na Cloudflare

O jeito mais simples é conectar direto no Git — a Cloudflare builda e
publica sozinha a cada push, no mesmo espírito do deploy automático que
o site já tem no GitHub Pages. Não precisa copiar e colar código à mão.

1. Crie uma conta grátis em [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
   (não precisa ter domínio nenhum cadastrado lá, é só para hospedar a
   função).
2. No painel, **Workers & Pages** → **Create** → procure a opção de
   **conectar um repositório do GitHub** (import/connect a repository),
   não "criar do zero".
3. Autorize a Cloudflare a acessar sua conta do GitHub e selecione
   `jeferson-scheibler/actus-vale`.
4. Na tela **"Set up your application"**:
   - **Project name:** `actus-vale-contato` (pra bater com o nome já
     definido em `worker/wrangler.toml`)
   - **Build command:** deixa vazio — não tem build, é JS puro
   - **Deploy command:** já vem `npx wrangler deploy`, não mexe
5. Abre **Advanced settings**:
   - **Path:** troca de `/` para `worker` — **esse é o campo que mais
     importa**. O código fica na subpasta `worker/` do repositório (o
     mesmo repo tem o site inteiro junto), e se deixar `/` a Cloudflare
     procura o `wrangler.toml` na raiz e não acha.
   - **API token:** deixa em "Create new token" — é um token da própria
     Cloudflare para ela publicar na sua conta, diferente do token do
     GitHub do passo 1.
6. Mais abaixo, em **Variable name / Variable value** (ainda na mesma
   tela): esse é o segredo que o Worker usa em tempo de execução —
   **preencha com o token do GitHub aqui**:
   - **Variable name:** `GITHUB_TOKEN` (exatamente assim — é o nome que
     o código em `worker/index.js` procura)
   - **Variable value:** cola o token gerado no passo 1
   - Clica em **Encrypt** antes de publicar

Segredos da Cloudflare ficam criptografados e nunca aparecem de volta
na tela nem no código — diferente de colocar o token direto no
JavaScript do site, que ficaria visível para qualquer visitante.

## 3. Pegar a URL do Worker e conectar no site

1. Depois do deploy, o log mostra a URL publicada, algo como
   `https://actus-vale-contato.SEU-USUARIO.workers.dev`.
2. Em [`index.html`](../index.html), procure por `id="proj-form"` e
   preencha o atributo `data-worker-url` com essa URL:

   ```html
   <form class="proj-form" id="proj-form" data-worker-url="https://actus-vale-contato.SEU-USUARIO.workers.dev">
   ```

3. Publique essa alteração (commit + push) — o site é servido pelo
   GitHub Pages, então esse deploy é separado do deploy do Worker.

## 4. Testar

1. Abra o site publicado e preencha o formulário com um teste.
2. Confira em `github.com/jeferson-scheibler/actus-vale/issues` se a
   issue apareceu.
3. Confira seu e-mail cadastrado no GitHub — a notificação chega
   sozinha, é o comportamento padrão do GitHub para issues abertas em
   repositório próprio (não precisa configurar nada a mais, mas se por
   algum motivo não chegar, verifique em **Settings → Notifications**
   na sua conta do GitHub se "Issues" está marcado para e-mail).

## Sobre o campo-armadilha (honeypot)

O formulário tem um campo invisível (`name="empresa"`) que uma pessoa
nunca vê nem preenche, mas que robôs de spam costumam preencher
automaticamente. Se ele vier preenchido, o Worker finge sucesso e não
cria issue nenhuma. Não é proteção perfeita contra spam avançado, mas
barra a maioria dos robôs simples sem pedir CAPTCHA de ninguém.

Se o spam virar um problema real depois, o próximo passo seria
adicionar [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
(CAPTCHA invisível, grátis) — não implementado agora para não
adicionar mais uma conta/chave antes de ser necessário.
