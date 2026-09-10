#!/usr/bin/env tsx
/** 从本地 /tmp/ti-cases 缓存打印 MS testcase 的 method/path/body。 */
import fs from 'node:fs';
import path from 'node:path';

const CASE_DIR = process.env.MS_CASE_DIR ?? '/tmp/ti-cases';
const needle = process.argv.slice(2).join(' ').trim();

if (!needle) {
  console.error('Usage: npx tsx scripts/ms-case-body.ts <case name or path fragment>');
  process.exit(1);
}

function parseCase(filePath: string): void {
  const outer = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
    data?: { name?: string; request?: string };
  };
  const data = outer.data;
  if (!data?.request) return;
  const req = JSON.parse(data.request) as {
    method?: string;
    path?: string;
    body?: { raw?: string | null };
  };
  const name = data.name ?? path.basename(filePath, '.json');
  const method = (req.method ?? 'GET').toUpperCase();
  const apiPath = (req.path ?? '').replace('/api/v1', '');
  const raw = req.body?.raw ?? '';
  console.log(`\n=== ${name} ===`);
  console.log(`${method} ${apiPath}`);
  if (raw) console.log(raw);
}

if (!fs.existsSync(CASE_DIR)) {
  console.error(`Case dir not found: ${CASE_DIR}`);
  process.exit(1);
}

let hits = 0;
for (const fn of fs.readdirSync(CASE_DIR)) {
  if (!fn.endsWith('.json')) continue;
  const filePath = path.join(CASE_DIR, fn);
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.includes(needle)) continue;
  parseCase(filePath);
  hits += 1;
}

if (hits === 0) {
  console.error(`No case matched: ${needle}`);
  process.exit(1);
}
