# Limpeza automática de tasks presas (Webex CC)

O workflow `.github/workflows/limpa-tasks.yml` roda a cada 15 minutos no GitHub Actions e
executa `tools/limpa-tasks.mjs`. Ele encerra (End Task) as tasks digitais que ficaram em
**"created", sem fila e sem agente, há mais de 10 minutos**: o estado que sobra quando o
Webex Connect pede a transferência e a task nunca chega à fila.

Ele **não** mexe em tasks `queued` (esperando um agente livre), `assigned` ou `connected`,
nem em nada com menos de 10 minutos.

## Configuração (uma vez)

### 1. Integração no Webex

Use uma integração OAuth do Webex (developer.webex.com → My Webex Apps). Pode ser a mesma
do callback do portal, se já existir. Ela precisa de:

- **Redirect URI:** `https://faugust.github.io/webex-cc-demos/tools/oauth.html`
- **Escopos:** `cjp:config_read` e `cjp:user` (o `tools/wxcc-token.sh` já pede esses e outros)

### 2. Refresh token

No seu terminal, na pasta do repositório:

```bash
./tools/wxcc-token.sh
```

Ele pede o Client ID e o Client Secret, abre o navegador para você autorizar com a conta
admin do Webex CC e imprime o refresh token. Os segredos ficam só na sua máquina.

### 3. Secrets do GitHub

No repositório (Settings → Secrets and variables → Actions → New repository secret), crie:

| Secret | Valor |
|---|---|
| `WXCC_CLIENT_ID` | Client ID da integração |
| `WXCC_CLIENT_SECRET` | Client Secret da integração |
| `WXCC_REFRESH_TOKEN` | refresh token impresso pelo script |

Ou pelo terminal, com o GitHub CLI (cada comando pede o valor sem mostrar na tela):

```bash
gh secret set WXCC_CLIENT_ID
gh secret set WXCC_CLIENT_SECRET
gh secret set WXCC_REFRESH_TOKEN
```

### 4. Primeiro teste

Em **Actions → Limpeza de tasks presas → Run workflow**, deixe "Só simular" marcado.
O log lista o que seria encerrado, sem encerrar nada. Depois disso, as execuções
agendadas encerram de verdade.

## Manutenção

- **Refresh token vence** (normalmente em ~90 dias). O log avisa quando faltar 14 dias ou
  menos. Para renovar, rode `./tools/wxcc-token.sh` de novo e atualize `WXCC_REFRESH_TOKEN`.
- **Repositório parado:** o GitHub desativa workflows agendados de repositórios públicos
  depois de 60 dias sem atividade. Se isso acontecer, reative em Actions.
- **Simular localmente:**

  ```bash
  DRY_RUN=true WXCC_ORG_ID=8d30aca0-28fb-4cf5-904a-a1ea4d14d254 \
  WXCC_CLIENT_ID=... WXCC_CLIENT_SECRET=... WXCC_REFRESH_TOKEN=... \
  node tools/limpa-tasks.mjs
  ```
