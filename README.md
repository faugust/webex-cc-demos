# Demo Hub · Webex Contact Center

Portal estático (GitHub Pages) com demos de Webex CC por vertical de negócio.
Cada vertical é um site fictício do cliente com os canais ligados ao Webex
(chat com agente de IA, voz, callback e WhatsApp) e um **painel de roteiro**
para o vendedor conduzir a apresentação.

```
index.html              ← hub com as verticais
assets/css/base.css     ← estilos compartilhados
assets/js/demo-kit.js   ← canais Webex + painel do vendedor (compartilhado)
saude/
  index.html            ← site do Hospital Vida Plena
  saude.css             ← tema da vertical
  config.js             ← ⚙️ TUDO que se configura na demo de saúde
```

Não tem build: é HTML/CSS/JS puro.

---

## 1. Publicar no GitHub Pages

1. Crie um repositório (ex.: `webex-cc-demos`) e envie os arquivos:
   ```bash
   git init && git add . && git commit -m "Demo hub Webex CC"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/webex-cc-demos.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `/ (root)`**.
3. Em ~1 minuto o portal fica em `https://SEU-USUARIO.github.io/webex-cc-demos/`.

> GitHub Pages é público, mesmo com repositório privado em planos pagos (exceto
> GitHub Enterprise com Pages privado). Os sites têm `noindex`, mas **não
> coloque dados reais nem segredos no `config.js`**: tudo nele fica visível no navegador.

## 2. Configurar a vertical Saúde (`saude/config.js`)

### Chat: agente de IA (Webex Connect Live Chat)
1. No Webex Connect, abra o app de Live Chat ligado ao fluxo do agente de IA e copie o **snippet de instalação do widget**.
2. Cole o snippet inteiro em `canais.chat.embedHtml`, entre as crases.
3. No app de Live Chat, adicione o domínio `https://SEU-USUARIO.github.io` na lista de domínios permitidos.
4. *(Opcional)* Para os botões do site abrirem o chat sozinhos, inspecione o balão do widget
   (botão direito → Inspecionar) e coloque um seletor CSS dele em `launcherSelector`.
   Sem isso, o site copia a mensagem sugerida e orienta a clicar no balão.

> Se o widget não carregar via config (alguns snippets dependem da ordem exata dos scripts),
> cole o snippet direto no `saude/index.html`, logo antes de `</body>`, e deixe `embedHtml` vazio.
> Nesse caso o status “Chat” aparece como *pendente* no painel, mas o widget funciona.

### Voz
`canais.telefone.numero` (como exibir) e `canais.telefone.discagem` (com DDI) do número de
entrada mapeado no Webex CC. O site mostra o número e um QR code `tel:` para o cliente ligar pelo celular.

### Callback
1. No Webex Connect, crie um fluxo com gatilho **Inbound Webhook** e copie a URL.
2. Cole em `canais.callback.webhookUrl`.
3. O site faz `POST` com este JSON:
   ```json
   {
     "canalOrigem": "portal-web",
     "nome": "Maria Oliveira",
     "telefone": "(11) 90000-0000",
     "telefoneE164": "+5511900000000",
     "documento": "123.456.789-09",
     "motivo": "autorizacao",
     "motivoDescricao": "Autorização de procedimento",
     "observacao": "",
     "contexto": { "Operadora": "Saúde+ (demo)", "Carteirinha": "..." },
     "vertical": "saude",
     "marca": "Hospital Vida Plena",
     "origem": "https://.../saude/",
     "enviadoEm": "2026-11-06T13:00:00.000Z"
   }
   ```
4. No fluxo, mapeie esses campos e dispare o callback no Webex CC (ex.: nó HTTP para a API de tarefas
   do Webex CC ou o mecanismo de callback que vocês já usam no fluxo da operadora).

Se o webhook não liberar CORS para o domínio do GitHub Pages, o site reenvia automaticamente
como `text/plain` em modo `no-cors`. O fluxo recebe o mesmo JSON, mas o site não consegue
confirmar a resposta. Para desligar isso: `fallbackNoCors: false`.

### WhatsApp
`canais.whatsapp.numero` só com dígitos e DDI (ex.: `5511900000000`). O site gera link `wa.me`
e QR code já com a mensagem sugerida da jornada.

### Persona e jornadas
- `persona`: dados que o vendedor usa na demo. Use os mesmos que existem no mock/CRM dos fluxos.
  Coloque em `telefone` o celular de quem vai receber o callback.
- `jornadas`: cada item vira um card no site e um roteiro no painel. Ajuste `roteiro`
  e `mensagemSugerida` para baterem com o que o agente de IA de vocês realmente responde.

## 3. Usar na demo (vendedor)

- Abra `.../saude/` e clique em **Roteiro da demo** (canto inferior esquerdo).
- O painel mostra a persona (com botão copiar), quais canais estão configurados e o
  passo a passo de cada jornada, com o que falar para o cliente.
- **Iniciar esta jornada** abre o seletor de canais já no assunto certo.
- `Alt + D` esconde ou mostra o botão do roteiro. Abra com `?apresentacao` na URL
  (ex.: `.../saude/?apresentacao`) para começar com ele oculto.

## 4. Adicionar uma nova vertical

1. Copie a pasta `saude/` (ex.: `financeiro/`).
2. Troque marca, cores (`financeiro.css`), textos do `index.html` e o `config.js`.
   Os atributos `data-jornada`, `data-canal`, `data-jornadas-grid` e `data-callback-inline`
   funcionam em qualquer página que carregue o `demo-kit.js`.
3. No `index.html` da raiz, troque o card “em breve” por um link `<a class="vcard" href="financeiro/">`.
