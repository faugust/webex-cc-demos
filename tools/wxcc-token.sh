#!/usr/bin/env bash
# Gera o refresh token do Webex CC para o fluxo de callback do portal.
# Rode no SEU terminal: os segredos ficam só na sua máquina e no Webex Connect.
set -euo pipefail

REDIRECT_URI="https://faugust.github.io/webex-cc-demos/tools/oauth.html"
SCOPES="cjp:config cjp:config_read cjp:config_write cjp:user spark:people_read"

echo "== Token do Webex CC para o callback do portal =="
echo "Redirect URI que deve estar cadastrada na integração:"
echo "  $REDIRECT_URI"
echo
read -r -p "Client ID da integração: " CLIENT_ID
read -r -s -p "Client Secret (não aparece na tela): " CLIENT_SECRET; echo

ENC_REDIRECT=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$REDIRECT_URI")
ENC_SCOPES=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$SCOPES")
STATE=$(python3 -c "import secrets;print(secrets.token_hex(8))")
AUTH_URL="https://webexapis.com/v1/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${ENC_REDIRECT}&scope=${ENC_SCOPES}&state=${STATE}"

echo
echo "Abrindo o navegador para você autorizar com a conta admin do Webex CC..."
open "$AUTH_URL" 2>/dev/null || echo "Abra este link: $AUTH_URL"
echo
read -r -p "Cole aqui o código exibido na página: " CODE

RESP=$(curl -s -X POST https://webexapis.com/v1/access_token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode "code=${CODE}" \
  --data-urlencode "redirect_uri=${REDIRECT_URI}")

REFRESH=$(printf '%s' "$RESP" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('refresh_token',''))" 2>/dev/null || true)
if [ -z "$REFRESH" ]; then
  echo "Não veio refresh token. Resposta do Webex:"; printf '%s\n' "$RESP" | sed -E 's/"access_token":"[^"]+"/"access_token":"***"/'
  exit 1
fi
DAYS=$(printf '%s' "$RESP" | python3 -c "import sys,json;print(int(json.load(sys.stdin).get('refresh_token_expires_in',0))//86400)")

echo
echo "Pronto. Cole estes 3 valores nas Custom Variables do fluxo WEB_Callback_Portal (Webex Connect):"
echo "  wxcc_client_id      = $CLIENT_ID"
echo "  wxcc_client_secret  = (o Client Secret que você digitou)"
echo "  wxcc_refresh_token  = $REFRESH"
echo
echo "O refresh token vale ~${DAYS} dias. Depois disso, rode este script de novo."
