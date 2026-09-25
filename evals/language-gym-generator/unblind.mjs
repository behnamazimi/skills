// Map blind verdicts back to runs: node unblind.mjs <judgeDir> <outFile>
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
const [dir, outFile] = process.argv.slice(2);
const mapping = JSON.parse(readFileSync(join(dir, 'mapping.json'), 'utf8'));
const results = {}; const runs = new Set();
for (const [id, m] of Object.entries(mapping)) {
  const f = join(dir, id, 'verdict.json'); if (!existsSync(f)) continue;
  const v = JSON.parse(readFileSync(f, 'utf8'));
  const name = (k) => basename(m[k]); runs.add(name('X')); runs.add(name('Y'));
  const side = (k) => ({ run: name(k), ...v[k] });
  results[id] = { winner: v.winner === 'tie' ? 'tie' : name(v.winner), reason: v.reason, [name('X')]: side('X'), [name('Y')]: side('Y') };
}
const [a, b] = [...runs].sort();
writeFileSync(outFile, JSON.stringify({ a, b, results }, null, 2) + '\n');
const mean = (xs) => { const v = xs.filter((x) => typeof x === 'number'); return v.length ? (v.reduce((p, q) => p + q, 0) / v.length).toFixed(2) : '—'; };
const rows = [`| metric | ${a} | ${b} |`, '| --- | --- | --- |'];
const all = Object.values(results);
const wins = (r) => all.filter((x) => x.winner === r).length;
rows.push(`| blind wins (of ${all.length}; ties ${all.filter((x) => x.winner === 'tie').length}) | ${wins(a)} | ${wins(b)} |`);
for (const k of ['definition', 'example', 'optional_fields']) rows.push(`| ${k} score (1–4) | ${mean(all.map((x) => x[a].scores?.[k]))} | ${mean(all.map((x) => x[b].scores?.[k]))} |`);
rows.push(`| consistency (1–4) | ${mean(all.map((x) => x[a].consistency))} | ${mean(all.map((x) => x[b].consistency))} |`);
const count = (r, f) => all.reduce((s, x) => s + (f(x[r]) || 0), 0);
rows.push(`| words 1 level above ceiling | ${count(a, (s) => s.level?.over_by_1?.length)} | ${count(b, (s) => s.level?.over_by_1?.length)} |`);
rows.push(`| words 2+ levels above ceiling | ${count(a, (s) => s.level?.over_by_2plus?.length)} | ${count(b, (s) => s.level?.over_by_2plus?.length)} |`);
rows.push(`| factual/linguistic errors | ${count(a, (s) => s.errors?.length)} | ${count(b, (s) => s.errors?.length)} |`);
const crit = (r) => { let p = 0, n = 0; for (const x of all) for (const c of Object.values(x[r].criteria || {})) { n++; if (c.pass) p++; } return `${p}/${n}`; };
rows.push(`| case criteria passed | ${crit(a)} | ${crit(b)} |`);
rows.push('', '| case | winner | reason |', '| --- | --- | --- |');
for (const [id, x] of Object.entries(results)) rows.push(`| ${id} | ${x.winner} | ${String(x.reason).replace(/\|/g, '/').replace(/\n/g, ' ')} |`);
console.log(rows.join('\n'));
