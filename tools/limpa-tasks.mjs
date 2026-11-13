#!/usr/bin/env node
// Limpeza de tasks presas no Webex Contact Center.
//
// Encerra (End Task) as tasks digitais que ficaram em "created", sem fila e sem
// agente, há mais de MIN_AGE_MIN minutos. É o estado que sobra quando o Webex
// Connect pede a transferência e a task nunca chega à fila.
//
// Nunca mexe em tasks "queued" (esperando agente livre), "assigned" ou "connected".
//
// Variáveis de ambiente:
//   WXCC_CLIENT_ID, WXCC_CLIENT_SECRET, WXCC_REFRESH_TOKEN  (obrigatórias, segredos)
//   WXCC_ORG_ID        id da organização (obrigatória)
//   MIN_AGE_MIN        idade mínima em minutos (padrão 10)
//   LOOKBACK_HOURS     janela de busca em horas (padrão 72)
//   DRY_RUN            "true" só lista, não encerra (padrão false)
//   WXCC_API_BASE      padrão https://api.wxcc-us1.cisco.com
//   WEBEX_TOKEN_URL    padrão https://webexapis.com/v1/access_token
//
// Uso local:  DRY_RUN=true node tools/limpa-tasks.mjs

// Valores colados em secrets costumam vir com espaço, quebra de linha ou aspas.
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/^(['"])(.*)\1$/s, '$2').trim() : v);
const env = Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k, clean(v)]));
const API = (env.WXCC_API_BASE || 'https://api.wxcc-us1.cisco.com').replace(/\/$/, '');
const TOKEN_URL = env.WEBEX_TOKEN_URL || 'https://webexapis.com/v1/access_token';
const ORG = env.WXCC_ORG_ID;
const MIN_AGE_MIN = Number(env.MIN_AGE_MIN || 10);
const LOOKBACK_HOURS = Number(env.LOOKBACK_HOURS || 72);
const DRY_RUN = String(env.DRY_RUN || '').toLowerCase() === 'true';
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

function fail(msg) {
  console.error('ERRO: ' + msg);
  process.exit(1);
}

for (const k of ['WXCC_CLIENT_ID', 'WXCC_CLIENT_SECRET', 'WXCC_REFRESH_TOKEN', 'WXCC_ORG_ID']) {
  if (!env[k]) fail(`variável ${k} não definida`);
}
if (!(MIN_AGE_MIN >= 5)) fail('MIN_AGE_MIN precisa ser 5 ou mais (proteção contra encerrar transferências em andamento)');

async function accessToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.WXCC_CLIENT_ID,
    client_secret: env.WXCC_CLIENT_SECRET,
    refresh_token: env.WXCC_REFRESH_TOKEN,
  });
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    // Nunca imprime o corpo inteiro nem os valores: pode conter tokens.
    console.log('Formato dos secrets (sem os valores): ' + describeSecrets());
    fail(`não consegui renovar o token (HTTP ${r.status}: ${j.error || 'sem código'}${j.error_description ? ' - ' + j.error_description : ''}). ` +
      'Se o refresh token expirou, rode tools/wxcc-token.sh de novo e atualize o secret WXCC_REFRESH_TOKEN.');
  }
  if (j.refresh_token_expires_in) {
    const dias = Math.floor(Number(j.refresh_token_expires_in) / 86400);
    console.log(`Token renovado. Refresh token válido por mais ~${dias} dias.`);
    if (dias <= 14) console.log(`::warning::O refresh token do Webex vence em ~${dias} dias. Rode tools/wxcc-token.sh e atualize o secret WXCC_REFRESH_TOKEN.`);
  }
  return j.access_token;
}

// Diz só o formato de cada secret (tamanho e se parece válido), nunca o valor.
function describeSecrets() {
  const id = env.WXCC_CLIENT_ID, sec = env.WXCC_CLIENT_SECRET, rt = env.WXCC_REFRESH_TOKEN;
  const odd = (v) => (/\s|=|:/.test(v) ? ', tem espaço, "=" ou ":" no meio' : '');
  return [
    `WXCC_CLIENT_ID ${id.length} caracteres${/^C[0-9a-f]{64}$/.test(id) ? ' (formato ok)' : ' (esperado: C + 64 hexadecimais)'}`,
    `WXCC_CLIENT_SECRET ${sec.length} caracteres${/^[0-9a-f]{64}$/.test(sec) ? ' (formato ok)' : odd(sec) || ' (esperado: 64 hexadecimais)'}`,
    `WXCC_REFRESH_TOKEN ${rt.length} caracteres${odd(rt)}`,
  ].join('; ');
}

async function listTasks(token, from) {
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const u = new URL(API + '/v1/tasks');
    u.searchParams.set('orgId', ORG);
    u.searchParams.set('from', String(from));
    u.searchParams.set('pageSize', String(PAGE_SIZE));
    u.searchParams.set('page', String(page));
    const r = await fetch(u, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
    if (!r.ok) fail(`Get Tasks respondeu HTTP ${r.status}`);
    const j = await r.json();
    const data = j.data || [];
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return all;
}

export function isStuck(t, now, minAgeMin) {
  const a = t.attributes || {};
  const age = now - Number(a.createdTime || now);
  return a.status === 'created' && !(a.queue && a.queue.id) && !(a.owner && a.owner.id) && age >= minAgeMin * 60000;
}

async function endTask(token, id) {
  const r = await fetch(`${API}/v1/tasks/${encodeURIComponent(id)}/end`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: '{}',
  });
  return r.status;
}

async function main() {
  const now = Date.now();
  const token = await accessToken();
  const tasks = await listTasks(token, now - LOOKBACK_HOURS * 3600000);
  const stuck = tasks.filter((t) => isStuck(t, now, MIN_AGE_MIN));
  console.log(`${tasks.length} tasks nas últimas ${LOOKBACK_HOURS} h; ${stuck.length} presas em "created" há mais de ${MIN_AGE_MIN} min.`);

  let falhas = 0;
  for (const t of stuck) {
    const a = t.attributes || {};
    const idadeMin = Math.round((now - Number(a.createdTime)) / 60000);
    const desc = `${t.id} (${a.channelType || '?'}, criada ${new Date(Number(a.createdTime)).toISOString()}, ${idadeMin} min)`;
    if (DRY_RUN) {
      console.log(`[simulação] encerraria ${desc}`);
      continue;
    }
    const status = await endTask(token, t.id);
    if (status >= 200 && status < 300) console.log(`encerrada ${desc} → HTTP ${status}`);
    else { falhas++; console.log(`::warning::falhou ao encerrar ${desc} → HTTP ${status}`); }
  }
  if (falhas) process.exitCode = 1;
}

// Só executa quando chamado direto (permite importar isStuck nos testes).
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => fail(e && e.message ? e.message : String(e)));
}
