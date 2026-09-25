#!/usr/bin/env node
// Score one eval run: node evals/language-gym-generator/score.mjs results/<run> [--compare results/<compare>.json]
// Layout: results/<run>/<case-id>/messages.json = the skill's chat replies, in order (array of strings).
// Optional: results/<run>/judgments.json = { "<case-id>": { "<criterion>": { "pass": true, "note": "..." } } }
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateOutput, validateGlossary, fold, words, stripMarks } from '../../skills/language-gym-generator/scripts/gym.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const runDir = args[0];
if (!runDir) { console.error('usage: score.mjs <run dir> [--compare <file>]'); process.exit(2); }
const compareFile = args.includes('--compare') ? args[args.indexOf('--compare') + 1] : null;
const { cases } = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));
const judgments = existsSync(join(runDir, 'judgments.json')) ? JSON.parse(readFileSync(join(runDir, 'judgments.json'), 'utf8')) : {};

// Mechanical rules that need a style sheet or plan are not scored here.
const STYLE_ONLY = new Set(['R-FLD-06']);

function parseGlossary(text) {
  try { const d = JSON.parse(text.trim()); return d && typeof d === 'object' && !Array.isArray(d) ? d : null; } catch { return null; }
}

// A non-JSON reply is a "question" if it asks something (a question mark anywhere, any script), else plain "text".
function classify(msg) {
  if (parseGlossary(msg)) return 'json';
  return /[?？؟]/u.test(msg) ? 'question' : 'text';
}

function scriptShare(text, allowed) {
  let ok = 0, all = 0;
  for (const ch of text) {
    if (!/\p{L}/u.test(ch)) continue;
    all++;
    if (allowed.some((sc) => new RegExp(`\\p{Script=${({ Jpan: 'Han', Hans: 'Han', Hant: 'Han' })[sc] || sc}}`, 'u').test(ch))) ok++;
  }
  return all ? ok / all : 1;
}

function termScripts(term) {
  const found = new Set();
  for (const ch of term) for (const sc of ['Latin', 'Cyrillic', 'Arabic', 'Han', 'Hiragana', 'Katakana', 'Greek', 'Hebrew', 'Devanagari']) if (new RegExp(`\\p{Script=${sc}}`, 'u').test(ch)) found.add(sc);
  return found;
}

const outputs = new Map();
const rows = [];
const detail = {};

for (const c of cases) {
  const file = join(runDir, c.id, 'messages.json');
  const r = { id: c.id, ran: false, reply: null, schema: null, hard: [], mechanical: {}, judge: [] };
  detail[c.id] = r;
  rows.push(r);
  if (!existsSync(file)) continue;
  r.ran = true;
  const messages = JSON.parse(readFileSync(file, 'utf8'));
  const e = c.expect;
  const kinds = messages.map(classify);
  let glossaries = [];
  if (e.reply === 'series') {
    const firstOk = kinds[0] === 'question';
    glossaries = messages.filter((m, i) => kinds[i] === 'json').map(parseGlossary);
    r.reply = firstOk && glossaries.length === e.parts ? 'series' : `got ${kinds.join(',')}`;
    r.hard.push({ name: 'asks before generating > 100', pass: firstOk });
    r.hard.push({ name: `${e.parts} parts`, pass: glossaries.length === e.parts, value: glossaries.length });
  } else {
    const last = messages[messages.length - 1] || '';
    const kind = classify(last);
    r.reply = kind;
    const allowed = [].concat(e.reply).flatMap((x) => (x === 'reject' || x === 'nothing_left' ? ['text', 'question'] : [x]));
    r.hard.push({ name: `reply is ${[].concat(e.reply).join(' | ')}`, pass: allowed.includes(kind), value: kind });
    if (kind === 'json') glossaries = [parseGlossary(last)];
  }
  outputs.set(c.id, glossaries);
  if (!glossaries.length || !c.spec) continue;

  const spec = { ...c.spec, count: e.max_terms ?? 100, series: null };
  const allTerms = glossaries.flatMap((g) => (Array.isArray(g.terms) ? g.terms : []));
  const schemaErrors = glossaries.flatMap((g) => validateOutput(g, spec).filter((f) => f.severity === 'error'));
  r.schema = schemaErrors.length === 0;
  r.hard.push({ name: 'matches import schema', pass: r.schema, value: schemaErrors.slice(0, 5).map((f) => `${f.rule} ${f.path}: ${f.message}`) });
  for (const g of glossaries) {
    for (const f of validateGlossary(g, spec)) {
      if (f.rule.startsWith('R-OUT') || STYLE_ONLY.has(f.rule) || f.severity !== 'error') continue;
      r.mechanical[f.rule] = (r.mechanical[f.rule] || 0) + 1;
    }
  }
  const n = e.reply === 'series' ? allTerms.length : allTerms.length;
  if (e.max_terms !== undefined && e.reply !== 'series') r.hard.push({ name: `≤ ${e.max_terms} terms`, pass: n <= e.max_terms, value: n });
  if (e.min_terms !== undefined) r.hard.push({ name: `≥ ${e.min_terms} terms`, pass: n >= e.min_terms, value: n });
  if (e.max_terms_total !== undefined) {
    r.hard.push({ name: `≤ ${e.max_terms_total} terms in total`, pass: n <= e.max_terms_total, value: n });
    r.hard.push({ name: 'each part ≤ 100', pass: glossaries.every((g) => g.terms.length <= 100) });
    const seen = new Set(); let dup = 0;
    for (const t of allTerms) { const k = fold(t.term, spec.profile); if (seen.has(k)) dup++; seen.add(k); }
    r.hard.push({ name: 'no term repeated across parts', pass: dup === 0, value: dup });
  }
  const profile = spec.profile;
  if (e.banned) {
    const banned = new Set(e.banned.map((b) => fold(b, profile)));
    const hits = allTerms.filter((t) => {
      const whole = fold(t.term, profile);
      if (banned.has(whole)) return true;
      return words(whole, profile.locale).some((w) => banned.has(w));
    }).map((t) => t.term);
    r.hard.push({ name: 'no excluded item or its forms', pass: hits.length === 0, value: hits });
  }
  if (e.banned_regex) {
    const hits = allTerms.filter((t) => e.banned_regex.some((re) => new RegExp(re, 'iu').test(stripMarks(fold(t.term, profile))))).map((t) => t.term);
    r.hard.push({ name: 'no other spelling of excluded patterns', pass: hits.length === 0, value: hits });
  }
  if (e.closed_set) {
    const have = e.closed_set.filter((m) => allTerms.some((t) => fold(t.term, profile) === fold(m, profile)));
    r.hard.push({ name: 'closed set all-or-nothing', pass: have.length === 0 || have.length === e.closed_set.length, value: have });
  }
  if (e.single_script_terms) {
    const scripts = new Set(allTerms.flatMap((t) => [...termScripts(t.term)]));
    r.hard.push({ name: 'terms use one script', pass: scripts.size <= 1, value: [...scripts] });
  }
  if (e.field_scripts) for (const [field, allowed] of Object.entries(e.field_scripts)) {
    const shares = allTerms.filter((t) => t[field]).map((t) => scriptShare(t[field].replace(/\s\/[^/]+\/\.?$/u, ''), allowed));
    const low = shares.filter((s) => s < 0.6).length;
    r.hard.push({ name: `${field} written in ${allowed.join('/')}`, pass: low === 0, value: `${low} of ${shares.length} below 60%` });
  }
  // Optional fields only where they add value (R-FLD-16/18). Grammar slices legitimately give most terms an example.
  const OPT = ['example', 'mental_model', 'discussion', 'anti_example', 'controversy'];
  if (spec.slice_type !== 'grammar') for (const g of glossaries) {
    const ts = g.terms || [];
    if (ts.length < 8) continue;
    const counts = ts.map((t) => OPT.filter((f) => t[f]).length);
    r.hard.push({ name: 'optional fields vary by term', pass: !counts.every((x) => x === counts[0]) && counts.includes(0), value: counts.join(',') });
    const ex = ts.filter((t) => t.example).length / ts.length;
    r.hard.push({ name: 'example on ≤ 80% of terms', pass: ex <= 0.8, value: +ex.toFixed(2) });
  }
  const inDef = glossaries.flatMap((g) => validateGlossary(g, spec).filter((f) => f.rule === 'R-FLD-18').map((f) => `${f.path}: ${f.message}`));
  r.hard.push({ name: 'no example inside a definition', pass: inDef.length === 0, value: inDef.slice(0, 3) });
  r.terms = n;
  r.optional_fields = +(allTerms.reduce((a, t) => a + ['example', 'mental_model', 'discussion', 'anti_example', 'controversy'].filter((f) => t[f]).length, 0) / Math.max(n, 1)).toFixed(2);
  r.categories = [...new Set(allTerms.map((t) => t.category))];
}

// Cross-case properties.
for (const c of cases) {
  const r = detail[c.id];
  const e = c.expect;
  const mine = outputs.get(c.id) || [];
  if (!mine.length || !c.spec) continue;
  const profile = c.spec.profile;
  const terms = mine.flatMap((g) => g.terms || []);
  if (e.no_overlap_with) {
    const other = (outputs.get(e.no_overlap_with) || []).flatMap((g) => g.terms || []);
    const keys = new Set(other.map((t) => fold(t.term, profile)));
    const overlap = terms.filter((t) => keys.has(fold(t.term, profile))).map((t) => t.term);
    r.hard.push({ name: `no overlap with ${e.no_overlap_with}`, pass: other.length > 0 && overlap.length === 0, value: other.length ? overlap : 'other case missing' });
  }
  if (e.consistent_with) {
    const other = (outputs.get(e.consistent_with) || []).flatMap((g) => g.terms || []);
    const a = new Set(other.map((t) => t.category));
    const b = [...new Set(terms.map((t) => t.category))];
    const share = b.length ? b.filter((x) => a.has(x)).length / b.length : 0;
    r.hard.push({ name: `category labels consistent with ${e.consistent_with}`, pass: share >= 0.6, value: +share.toFixed(2) });
  }
}

for (const c of cases) {
  const r = detail[c.id];
  const j = judgments[c.id] || {};
  for (const crit of c.judge || []) r.judge.push({ name: crit, pass: j[crit]?.pass ?? null, note: j[crit]?.note });
}

// Report.
const line = (cells) => `| ${cells.join(' | ')} |`;
const out = [line(['case', 'reply', 'schema', 'hard', 'mechanical', 'judged', 'terms', 'opt/term'])];
out.push(line(['---', '---', '---', '---', '---', '---', '---', '---']));
const tot = { ran: 0, hardPass: 0, hardAll: 0, schemaOk: 0, schemaAll: 0, mech: 0, judgePass: 0, judgeAll: 0 };
for (const r of rows) {
  if (!r.ran) { out.push(line([r.id, 'not run', '', '', '', '', '', ''])); continue; }
  tot.ran++;
  const hp = r.hard.filter((h) => h.pass).length;
  tot.hardPass += hp; tot.hardAll += r.hard.length;
  if (r.schema !== null) { tot.schemaAll++; if (r.schema) tot.schemaOk++; }
  const mech = Object.values(r.mechanical).reduce((a, b) => a + b, 0);
  tot.mech += mech;
  const jd = r.judge.filter((x) => x.pass !== null);
  tot.judgePass += jd.filter((x) => x.pass).length; tot.judgeAll += jd.length;
  out.push(line([r.id, r.reply, r.schema === null ? '—' : r.schema ? 'ok' : 'FAIL', `${hp}/${r.hard.length}`, mech ? Object.entries(r.mechanical).map(([k, v]) => `${k}×${v}`).join(' ') : '0', jd.length ? `${jd.filter((x) => x.pass).length}/${jd.length}` : '—', r.terms ?? '', r.optional_fields ?? '']));
}
out.push('');
out.push(`**Totals:** ${tot.ran}/${rows.length} cases ran · schema ${tot.schemaOk}/${tot.schemaAll} · hard properties ${tot.hardPass}/${tot.hardAll} · mechanical violations ${tot.mech} · judged ${tot.judgePass}/${tot.judgeAll}`);
const failures = rows.flatMap((r) => r.hard.filter((h) => !h.pass).map((h) => `- ${r.id}: ${h.name}${h.value !== undefined ? ` → ${JSON.stringify(h.value)}` : ''}`));
if (failures.length) out.push('', '**Failed hard properties:**', ...failures);
const judgeFails = rows.flatMap((r) => r.judge.filter((j) => j.pass === false).map((j) => `- ${r.id}: ${j.name}${j.note ? ` (${j.note})` : ''}`));
if (judgeFails.length) out.push('', '**Failed judged criteria:**', ...judgeFails);
if (compareFile && existsSync(compareFile)) {
  const cmp = JSON.parse(readFileSync(compareFile, 'utf8'));
  const tally = {};
  for (const v of Object.values(cmp.results || {})) tally[v.winner] = (tally[v.winner] || 0) + 1;
  out.push('', `**Blind pairwise comparison (${cmp.a} vs ${cmp.b}):** ${Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
}
const text = out.join('\n') + '\n';
writeFileSync(join(runDir, 'score.md'), text);
writeFileSync(join(runDir, 'score.json'), JSON.stringify(detail, null, 2) + '\n');
process.stdout.write(text);
