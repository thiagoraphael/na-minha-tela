// Build estático do Na Minha Tela: renderiza src/index.mjs em HTML puro, junta CSS e JS
// com hash no nome e grava tudo em dist/. Sem dependências: só Node 18+.
//   node build.mjs
// Mesmo modelo do build do meu-site, reduzido a uma página só.
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { toString } from './src/lib/html.mjs';
import { pixPayload, semAcento } from './src/pix/brcode.mjs';
import { qrSvg } from './src/pix/qr.mjs';

// fileURLToPath (e não URL.pathname) pra funcionar no Windows e com espaço no caminho.
const ROOT = fileURLToPath(new URL('.', import.meta.url));
// OUT_DIR troca a pasta de saída (útil fora do Google Drive, que às vezes trava arquivos de dist/).
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : join(ROOT, 'dist');
const read = (p) => readFile(join(ROOT, p), 'utf8');
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);
const avisos = [];

// ---------- Configuração (content/site.json; SITE_JSON aponta pra outro arquivo, útil em teste) ----------
const site = JSON.parse(process.env.SITE_JSON ? await readFile(process.env.SITE_JSON, 'utf8') : await read('content/site.json'));
const dominio = (site.dominio || '').trim();
if (!dominio) avisos.push('site.json → "dominio" vazio: o rodapé da imagem sai só com o logo.');

// Pix com valor livre: payload fixo e QR em SVG estático (spec 8). Sem chave, nome e cidade, a faixa e a folha do café não entram.
let pix = null;
const { chave = '', nome = '', cidade = '' } = site.pix || {};
if (chave.trim() && nome.trim() && cidade.trim()) {
  // Regra 8: nome até 25 e cidade até 15 caracteres, sem acento. Cortar daria um nome diferente do da conta.
  if (semAcento(nome.trim()).length > 25) throw new Error(`site.json → pix.nome tem mais de 25 caracteres: "${nome}"`);
  if (semAcento(cidade.trim()).length > 15) throw new Error(`site.json → pix.cidade tem mais de 15 caracteres: "${cidade}"`);
  const payload = pixPayload({ chave: chave.trim(), nome: nome.trim(), cidade: cidade.trim() });
  pix = { payload, svg: qrSvg(payload, { label: 'QR code do Pix' }) };
} else avisos.push('site.json → "pix" incompleto (chave, nome e cidade): a faixa e a folha do café ficam fora da página.');

// Tentativas extras: a sincronização do Google Drive às vezes segura arquivos de dist/ por um instante.
await rm(OUT, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
await mkdir(join(OUT, 'assets'), { recursive: true });
if (existsSync(join(ROOT, 'public'))) await cp(join(ROOT, 'public'), OUT, { recursive: true });

// CSS: tokens, site e a base do app, nessa ordem.
const cssFiles = ['src/styles/tokens.css', 'src/styles/site.css', 'src/shared/shared.css'];
let css = '';
for (const f of cssFiles) css += `/* ${f} */\n${await read(f)}\n`;

// JS: configuração + base comum + café + app, no mesmo escopo, dentro de uma IIFE (igual aos apps do meu-site).
const jsFiles = ['src/shared/shared.js', 'src/app/cafe.js', 'src/app/app.js'];
let body = `const CONFIG = ${JSON.stringify({ dominio })};\n`;
for (const f of jsFiles) body += `\n// ${f}\n${await read(f)}`;
const js = `(() => {\n'use strict';\n${body}\n})();\n`;

const assets = { css: `/assets/site.${hash(css)}.css`, js: `/assets/app.${hash(js)}.js` };
await writeFile(join(OUT, assets.css), css);
await writeFile(join(OUT, assets.js), js);

// Página única.
const { default: page } = await import(pathToFileURL(join(ROOT, 'src/index.mjs')).href);
const out = toString(page({ assets, pix }));
const h1 = (out.match(/<h1[\s>]/g) || []).length;
if (h1 !== 1) throw new Error(`index.html: precisa de exatamente um <h1> (achei ${h1})`);
const semAlt = out.match(/<img(?![^>]*\balt=)[^>]*>/g);
if (semAlt) throw new Error(`index.html: <img> sem alt → ${semAlt[0]}`);
await writeFile(join(OUT, 'index.html'), out);

console.log(`ok: dist/index.html · ${assets.css} · ${assets.js}${pix ? ' · Pix ligado' : ''}`);
avisos.forEach((a) => console.warn(`! ${a}`));
