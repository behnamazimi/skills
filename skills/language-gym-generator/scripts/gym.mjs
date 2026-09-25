#!/usr/bin/env node
// Mechanical checks and transforms for the language-gym-generator pipeline.
// Zero dependencies (Node >= 20, full ICU). Never branches on language names:
// everything language-specific comes from spec.profile / spec.learner_profile.
//
// Usage: node gym.mjs <command> [file] [--flag value ...]
//   validate spec      <spec.json>
//   validate exclude   <exclude.json>
//   validate list      <list.json>     --spec <spec.json> [--exclude <exclude.json>]
//   validate batch     <batch.json>    --spec <spec.json> [--style <style.json>]
//   validate glossary  <draft.json>    --spec <spec.json> [--exclude ..] [--style ..]
//   validate findings  <findings.json> --draft <draft.json | list.json> [--rules <rules.md>]
//   validate output    <glossary.json> [--spec <spec.json>]
//   normalize          <draft.json>    --spec <spec.json> [--style ..] [--out <file>]
//   metrics            <draft.json>    --spec <spec.json> [--plan <plan.json>]
//   candidates         <list.json>     --spec <spec.json> [--exclude <exclude.json>]
//   tokens             <draft.json>    --spec <spec.json> [--exclude ..] [--levellist <file>]
//   ipa                <draft.json>    [--against <ipa-check.json>]
//   emit               <draft.json>    --spec <spec.json> [--out <file>]
// Output: JSON on stdout. Exit 0 = ok, 1 = findings (errors), 2 = usage/IO error.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const TERM_FIELDS = ['term', 'category', 'definition', 'example', 'mental_model', 'discussion', 'anti_example', 'controversy'];
export const REQUIRED_TERM_FIELDS = ['term', 'category', 'definition'];
export const OPTIONAL_TERM_FIELDS = ['example', 'mental_model', 'discussion', 'anti_example', 'controversy'];
export const REL_FIELDS = ['source', 'target', 'relationship_type', 'description'];
export const TOP_FIELDS = ['domain', 'description', 'terms', 'relationships'];
export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const MAX_TERMS = 100;
export const MAX_RELATIONSHIPS = 100;
const DEFAULT_EXAMPLE_MARKERS_EN = ['e.g.', 'for example', 'for instance', 'such as'];
const QUOTED = /“([^”]+)”|"([^"]+)"|«([^»]+)»|„([^“”]+)[“”]|「([^」]+)」|『([^』]+)』|‘([^’]+)’|(?<!\p{L})'([^']+)'(?!\p{L})/gu;
const DEFAULT_BANNED_EN = ["it's important to note", "in today's fast-paced world", 'leverage', 'utilize', 'robust', 'seamless', 'delve into', 'unlock', 'game-changer', 'cutting-edge'];
const IPA_TAIL = /\s\/[^/\s][^/]*\/\.?$/u;
const IPA_SPAN = /\/[^/\s][^/]*\//gu;
const IPA_MARKS = /[ˈˌːʔʃʒθðŋɲɾɹʁχɣɛɔəɪʊʌæɑɒøœɐɨʉɯɤʏʎʋɟɕʑ˥˦˧˨˩]/u;

// ---------- small helpers ----------

const finding = (rule, path, message, severity = 'error') => ({ rule, severity, path, message });
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const nfc = (s) => s.normalize('NFC');

export function fold(s, profile = {}) {
  let out = nfc(String(s)).trim().replace(/\s+/gu, ' ');
  if (profile.cased !== false) out = out.toLocaleLowerCase(profile.locale || undefined);
  return out;
}

export function stripMarks(s) {
  return s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
}

function segmenter(locale, granularity) {
  try { return new Intl.Segmenter(locale || undefined, { granularity }); }
  catch { return new Intl.Segmenter(undefined, { granularity }); }
}

export function words(text, locale) {
  const seg = segmenter(locale, 'word');
  return [...seg.segment(text)].filter((s) => s.isWordLike).map((s) => s.segment);
}

export function sentences(text, locale) {
  const seg = segmenter(locale, 'sentence');
  return [...seg.segment(text)].map((s) => s.segment.trim()).filter(Boolean);
}

function stripIpa(text) { return text.replace(IPA_TAIL, '').trim(); }

function levelIndex(l) { return CEFR.indexOf(String(l || '').toUpperCase()); }

// Standard slot markers in patterns (V不了, N + を, estar + gerundio) are not a script violation.
const SLOT_MARKERS = /(?<!\p{Script=Latin})(?:V|N|A|X|Y|S|O|Adj|Adv|NP|VP)(?!\p{Script=Latin})/gu;

function scriptsOf(text) {
  const found = new Set();
  text = text.replace(SLOT_MARKERS, '');
  for (const ch of text) {
    if (!/\p{L}/u.test(ch)) continue;
    for (const sc of ['Latn', 'Cyrl', 'Grek', 'Arab', 'Hebr', 'Deva', 'Beng', 'Guru', 'Gujr', 'Taml', 'Telu', 'Knda', 'Mlym', 'Sinh', 'Thai', 'Lao', 'Khmr', 'Mymr', 'Tibt', 'Geor', 'Armn', 'Ethi', 'Hang', 'Hira', 'Kana', 'Hani', 'Bopo', 'Thaa', 'Syrc', 'Mong', 'Cher', 'Cans', 'Tfng']) {
      if (new RegExp(`\\p{Script=${sc}}`, 'u').test(ch)) { found.add(sc); break; }
    }
  }
  return found;
}

// Latin letters used by IPA transcriptions; allowed in definitions when pronunciation is on.
function allowedScripts(profile, extra = []) {
  const set = new Set([...(profile?.scripts || []), ...extra]);
  // Japanese writing mixes these; a profile listing any of them implies the others are fine.
  if (['Hira', 'Kana', 'Hani'].some((s) => set.has(s)) && profile?.scripts?.includes('Jpan')) ['Hira', 'Kana', 'Hani'].forEach((s) => set.add(s));
  if (set.has('Jpan')) ['Hira', 'Kana', 'Hani'].forEach((s) => set.add(s));
  if (set.has('Kore')) ['Hang', 'Hani'].forEach((s) => set.add(s));
  if (set.has('Hans') || set.has('Hant')) set.add('Hani');
  return set;
}

function readJson(path, label = path) {
  let raw;
  try { raw = readFileSync(path, 'utf8'); } catch (e) { throw new UsageError(`cannot read ${label}: ${e.message}`); }
  return parseJson(raw, label);
}

export function parseJson(raw, label = 'input') {
  if (raw.charCodeAt(0) === 0xfeff) throw new ContractError([finding('R-OUT-01', '', `${label} starts with a byte-order mark`)]);
  try { return JSON.parse(raw); } catch (e) { throw new ContractError([finding('R-OUT-01', '', `${label} is not valid JSON: ${e.message}`)]); }
}

class UsageError extends Error {}
class ContractError extends Error { constructor(findings) { super('contract'); this.findings = findings; } }

function checkText(value, path, out) {
  if (typeof value !== 'string') { out.push(finding('R-OUT-02', path, `must be a string, got ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`)); return false; }
  if (value.length === 0) { out.push(finding('R-OUT-03', path, 'empty string; omit optional fields instead')); return false; }
  if (value !== value.trim()) out.push(finding('R-OUT-03', path, 'leading or trailing whitespace'));
  if (/[\u0000-\u001f\u007f\u2028\u2029]/u.test(value)) out.push(finding('R-OUT-03', path, 'contains a line break or control character'));
  if (/\*\*|__|`|\[[^\]]+\]\([^)]+\)|^#{1,6}\s/u.test(value)) out.push(finding('R-OUT-03', path, 'contains Markdown'));
  if (/<\/?[a-zA-Z][^>]*>/u.test(value)) out.push(finding('R-OUT-03', path, 'contains HTML'));
  if (value !== nfc(value)) out.push(finding('R-OUT-01', path, 'not Unicode NFC-normalized'));
  return true;
}

// ---------- field mapping (spec.fields: rename/drop optional fields) ----------

export function outputFieldMap(spec) {
  const rename = spec?.fields?.rename || {};
  const drop = new Set(spec?.fields?.drop || []);
  const map = [];
  for (const f of TERM_FIELDS) {
    if (drop.has(f) && !REQUIRED_TERM_FIELDS.includes(f)) continue;
    map.push([f, REQUIRED_TERM_FIELDS.includes(f) ? f : (rename[f] || f)]);
  }
  return map; // [internalName, outputName]
}

// ---------- validate output (the Jargon Gym import contract) ----------

export function validateOutput(doc, spec = null) {
  const out = [];
  if (!isObj(doc)) return [finding('R-OUT-02', '', 'top level must be an object')];
  for (const k of Object.keys(doc)) if (!TOP_FIELDS.includes(k)) out.push(finding('R-OUT-02', k, 'unknown top-level key'));
  for (const k of ['domain', 'description']) {
    if (!(k in doc)) out.push(finding('R-OUT-02', k, 'missing required key'));
    else checkText(doc[k], k, out);
  }
  const profile = spec?.profile || {};
  const fieldMap = outputFieldMap(spec);
  const allowed = new Set(fieldMap.map(([, o]) => o));
  const required = REQUIRED_TERM_FIELDS;
  const names = new Map();
  if (!Array.isArray(doc.terms)) out.push(finding('R-OUT-02', 'terms', 'missing or not an array'));
  else {
    if (doc.terms.length < 1) out.push(finding('R-OUT-04', 'terms', 'must contain at least one term'));
    if (doc.terms.length > MAX_TERMS) out.push(finding('R-OUT-04', 'terms', `has ${doc.terms.length} terms; max ${MAX_TERMS} per glossary`));
    doc.terms.forEach((t, i) => {
      const p = `terms[${i}]`;
      if (!isObj(t)) { out.push(finding('R-OUT-02', p, 'must be an object')); return; }
      for (const k of Object.keys(t)) if (!allowed.has(k)) out.push(finding('R-OUT-02', `${p}.${k}`, 'unknown key'));
      for (const k of required) if (!(k in t)) out.push(finding('R-OUT-02', `${p}.${k}`, 'missing required field'));
      for (const [k, v] of Object.entries(t)) if (allowed.has(k)) checkText(v, `${p}.${k}`, out);
      if (typeof t.term === 'string' && t.term) {
        const key = fold(t.term, profile);
        if (names.has(key)) out.push(finding('R-OUT-05', `${p}.term`, `duplicate of terms[${names.get(key)}] "${t.term}"`));
        else names.set(key, i);
      }
    });
  }
  if ('relationships' in doc) {
    if (!Array.isArray(doc.relationships)) out.push(finding('R-OUT-02', 'relationships', 'must be an array'));
    else {
      const termCount = Array.isArray(doc.terms) ? doc.terms.length : 0;
      const cap = Math.min(MAX_RELATIONSHIPS, Math.max(termCount, 0));
      if (doc.relationships.length > cap) out.push(finding('R-OUT-07', 'relationships', `has ${doc.relationships.length}; max min(100, terms.length) = ${cap}`));
      const exact = new Set(Array.isArray(doc.terms) ? doc.terms.map((t) => t?.term) : []);
      const pairs = new Map();
      doc.relationships.forEach((r, i) => {
        const p = `relationships[${i}]`;
        if (!isObj(r)) { out.push(finding('R-OUT-02', p, 'must be an object')); return; }
        for (const k of Object.keys(r)) if (!REL_FIELDS.includes(k)) out.push(finding('R-OUT-02', `${p}.${k}`, 'unknown key'));
        for (const k of ['source', 'target', 'relationship_type']) if (!(k in r)) out.push(finding('R-OUT-02', `${p}.${k}`, 'missing required field'));
        for (const [k, v] of Object.entries(r)) if (REL_FIELDS.includes(k)) checkText(v, `${p}.${k}`, out);
        for (const k of ['source', 'target']) if (typeof r[k] === 'string' && !exact.has(r[k])) out.push(finding('R-OUT-06', `${p}.${k}`, `"${r[k]}" does not exactly match any term`));
        if (r.source === r.target) out.push(finding('R-OUT-06', p, 'relationship links a term to itself'));
        const key = [r.source, r.target].sort().join('\u0000');
        if (pairs.has(key)) out.push(finding('R-OUT-06', p, `duplicate pair (same as relationships[${pairs.get(key)}], either direction)`));
        else pairs.set(key, i);
      });
    }
  }
  return out;
}

// ---------- validate spec ----------

export function validateSpec(spec) {
  const out = [];
  if (!isObj(spec)) return [finding('R-SPEC-01', '', 'spec must be an object')];
  const req = ['domain', 'language', 'slice_type', 'count', 'learner', 'level', 'beginner_mode', 'immersion', 'pronunciation', 'dialect', 'path', 'profile', 'learner_profile', 'sources'];
  for (const k of req) if (!(k in spec)) out.push(finding('R-SPEC-01', k, 'missing'));
  if (out.length) return out;
  if (!['bare', 'usage', 'grammar', 'reading'].includes(spec.slice_type)) out.push(finding('R-SPEC-01', 'slice_type', 'must be bare | usage | grammar | reading'));
  if (!Number.isInteger(spec.count) || spec.count < 1) out.push(finding('R-SPEC-02', 'count', 'must be a positive integer'));
  if (spec.count > MAX_TERMS) {
    const s = spec.series;
    if (!isObj(s) || !Number.isInteger(s.parts) || !Number.isInteger(s.part) || !Number.isInteger(s.part_count)) out.push(finding('R-SPEC-02', 'series', 'count > 100 requires series {parts, part, part_count}'));
    else {
      if (s.part_count > MAX_TERMS) out.push(finding('R-SPEC-02', 'series.part_count', 'a part may hold at most 100 terms'));
      if (s.parts !== Math.ceil(spec.count / MAX_TERMS)) out.push(finding('R-SPEC-02', 'series.parts', `expected ${Math.ceil(spec.count / MAX_TERMS)} parts for count ${spec.count}`));
      if (spec.confirmed !== true) out.push(finding('R-SPEC-02', 'confirmed', 'count > 100 must be confirmed by the user before generating'));
    }
  }
  const lv = spec.level;
  if (!isObj(lv) || levelIndex(lv.floor) < 0 || levelIndex(lv.ceiling) < 0) out.push(finding('R-SPEC-03', 'level', 'level must be {label, floor, ceiling} with CEFR bands A1–C2'));
  else {
    if (levelIndex(lv.floor) > levelIndex(lv.ceiling)) out.push(finding('R-SPEC-03', 'level', 'floor is above ceiling'));
    const beginner = levelIndex(lv.ceiling) <= levelIndex('B1');
    if (spec.beginner_mode !== beginner) out.push(finding('R-SPEC-03', 'beginner_mode', `must be ${beginner} for ceiling ${lv.ceiling} (on iff ceiling ≤ B1)`));
  }
  if (!['ipa', 'spoken', 'none'].includes(spec.pronunciation)) out.push(finding('R-SPEC-04', 'pronunciation', 'must be ipa | spoken | none'));
  else if (spec.sources?.pronunciation === 'default') {
    const expected = spec.beginner_mode ? 'none' : 'ipa';
    if (spec.pronunciation !== expected) out.push(finding('R-SPEC-04', 'pronunciation', `default must be "${expected}" when beginner_mode is ${spec.beginner_mode}`));
  }
  if (typeof spec.immersion !== 'boolean') out.push(finding('R-SPEC-05', 'immersion', 'must be boolean'));
  else if (spec.immersion && fold(spec.learner) !== fold(spec.language)) out.push(finding('R-SPEC-05', 'learner', 'immersion requires learner = the target language'));
  else if (!spec.immersion && fold(spec.learner) === fold(spec.language)) out.push(finding('R-SPEC-05', 'immersion', 'learner language equals target language, so immersion must be true'));
  for (const [k, p] of [['profile', spec.profile], ['learner_profile', spec.learner_profile]]) {
    if (!isObj(p)) { out.push(finding('R-SPEC-06', k, 'must be an object')); continue; }
    try { Intl.getCanonicalLocales(p.locale); } catch { out.push(finding('R-SPEC-06', `${k}.locale`, `"${p.locale}" is not a valid BCP 47 tag`)); }
    if (!Array.isArray(p.scripts) || !p.scripts.length || p.scripts.some((s) => !/^[A-Z][a-z]{3}$/.test(s))) out.push(finding('R-SPEC-06', `${k}.scripts`, 'must be a non-empty list of ISO 15924 codes (e.g. Latn, Arab, Jpan)'));
    if (typeof p.cased !== 'boolean') out.push(finding('R-SPEC-06', `${k}.cased`, 'must be boolean'));
  }
  const expectedPath = spec.series ? 'full' : (spec.count <= 15 ? 'lite' : 'full');
  if (spec.path !== expectedPath) out.push(finding('R-SPEC-07', 'path', `must be "${expectedPath}" (lite iff count ≤ 15)`));
  if (spec.fields) {
    for (const f of spec.fields.drop || []) if (REQUIRED_TERM_FIELDS.includes(f)) out.push(finding('R-SPEC-08', 'fields.drop', `required field "${f}" cannot be dropped`));
    for (const [f, to] of Object.entries(spec.fields.rename || {})) {
      if (REQUIRED_TERM_FIELDS.includes(f)) out.push(finding('R-SPEC-08', 'fields.rename', `required field "${f}" cannot be renamed`));
      if (!OPTIONAL_TERM_FIELDS.includes(f)) out.push(finding('R-SPEC-08', 'fields.rename', `unknown field "${f}"`));
      if (TERM_FIELDS.includes(to)) out.push(finding('R-SPEC-08', 'fields.rename', `"${to}" collides with an existing field`));
    }
  }
  if (!isObj(spec.sources)) out.push(finding('R-SPEC-01', 'sources', 'must map each setting to "user" | "default" | "inferred"'));
  return out;
}

// ---------- validate exclude ----------

export function validateExclude(ex) {
  const out = [];
  if (!isObj(ex) || !Array.isArray(ex.raw) || !Array.isArray(ex.items) || !Array.isArray(ex.ignored)) return [finding('R-EX-02', '', 'exclude must be {raw[], items[], ignored[]}')];
  const seen = new Set();
  ex.items.forEach((it, i) => {
    const p = `items[${i}]`;
    for (const k of ['raw', 'term', 'lemma']) if (typeof it[k] !== 'string' || !it[k].trim()) out.push(finding('R-EX-02', `${p}.${k}`, 'must be a non-empty string'));
    if (!Array.isArray(it.forms)) out.push(finding('R-EX-02', `${p}.forms`, 'must be an array (may be empty)'));
    if (!['lemma', 'phrase'].includes(it.scope)) out.push(finding('R-EX-02', `${p}.scope`, 'must be "lemma" (blocks every job) or "phrase" (blocks only this phrase/pattern)'));
    if (typeof it.raw === 'string') seen.add(nfc(it.raw.trim()));
  });
  ex.ignored.forEach((it) => { if (typeof it?.raw === 'string') seen.add(nfc(it.raw.trim())); });
  ex.raw.forEach((r, i) => {
    if (typeof r !== 'string') return;
    if (!seen.has(nfc(r.trim()))) out.push(finding('R-EX-02', `raw[${i}]`, `"${r}" is neither expanded in items[] nor listed in ignored[]`));
  });
  return out;
}

function excludeKeys(ex, profile) {
  const keys = new Map();
  for (const it of ex?.items || []) {
    const forms = it.scope === 'phrase' ? [it.term, ...(it.forms || [])] : [it.term, it.lemma, ...(it.forms || [])];
    for (const f of forms) if (typeof f === 'string' && f.trim()) keys.set(fold(f, profile), it.raw);
  }
  return keys;
}

// ---------- required jobs (R-SEL-12) ----------

export function requiredJobs(spec) {
  const ceiling = levelIndex(spec?.level?.ceiling);
  const jobs = ['identity', 'existence', 'location', 'negation', 'questions'];
  if (spec?.profile?.politeness_marked) jobs.push('politeness');
  if (ceiling >= levelIndex('A2')) jobs.push('past');
  jobs.push('want', 'can', 'go', 'must');
  if (ceiling >= levelIndex('B1')) jobs.push('future');
  return jobs;
}

function checkJobs(list, spec, exKeys, out) {
  // Required jobs apply up to B1; at B2+ the basics are assumed and slots go to traps and register (R-SEL-06).
  if (spec?.slice_type !== 'bare' || levelIndex(spec?.level?.ceiling) > levelIndex('B1')) return;
  const profile = spec.profile || {};
  const jobs = list.shape?.jobs;
  const required = requiredJobs(spec);
  if (!isObj(jobs)) { out.push(finding('R-SEL-12', 'shape.jobs', `a bare glossary must map every required job: ${required.join(', ')}`)); return; }
  const mainTerms = new Set(list.main.map((t) => t.term));
  const count = spec.series ? spec.series.part_count : spec.count;
  const full = list.main.length >= count;
  let lastCovered = -1, firstDeferred = Infinity;
  required.forEach((job, i) => {
    const v = jobs[job];
    const p = `shape.jobs.${job}`;
    if (typeof v !== 'string' || !v.trim()) { out.push(finding('R-SEL-12', p, `required job "${job}" is not mapped`)); return; }
    if (v === 'deferred') { firstDeferred = Math.min(firstDeferred, i); if (!full) out.push(finding('R-SEL-12', p, `"${job}" deferred while the list has free slots`)); return; }
    if (v.startsWith('n/a:')) { if (v.length < 8) out.push(finding('R-SEL-12', p, 'n/a needs a reason')); lastCovered = i; return; }
    if (v.startsWith('known:')) {
      const item = v.slice(6).trim();
      if (!exKeys.has(fold(item, profile))) out.push(finding('R-SEL-12', p, `"${item}" is not an excluded item`));
      lastCovered = i; return;
    }
    if (!mainTerms.has(v)) out.push(finding('R-SEL-12', p, `"${v}" is not a term in main (write it exactly, or use known: / n/a: / deferred)`));
    lastCovered = i;
  });
  if (firstDeferred < lastCovered) out.push(finding('R-SEL-12', 'shape.jobs', `"${required[firstDeferred]}" is deferred but lower-priority "${required[lastCovered]}" is covered; defer from the end of the list`));
}

// ---------- validate list ----------

export function validateList(list, spec, ex = null) {
  const out = [];
  const profile = spec?.profile || {};
  if (!isObj(list) || !Array.isArray(list.main) || !Array.isArray(list.spares)) return [finding('R-SEL-01', '', 'list must be {main[], spares[], sets[]}')];
  const count = spec.series ? spec.series.part_count : spec.count;
  if (list.main.length > count) out.push(finding('R-SEL-09', 'main', `${list.main.length} terms > count ${count}`));
  const exKeys = excludeKeys(ex, profile);
  const ids = new Set(); const names = new Map();
  const ceiling = levelIndex(spec?.level?.ceiling);
  [['main', list.main], ['spares', list.spares]].forEach(([which, arr]) => arr.forEach((t, i) => {
    const p = `${which}[${i}]`;
    for (const k of ['id', 'term', 'job', 'slot', 'level']) if (typeof t[k] !== 'string' || !t[k].trim()) out.push(finding('R-SEL-01', `${p}.${k}`, 'must be a non-empty string'));
    if (ids.has(t.id)) out.push(finding('R-SEL-01', `${p}.id`, `duplicate id "${t.id}"`)); ids.add(t.id);
    if (typeof t.term === 'string') {
      const k = fold(t.term, profile);
      if (names.has(k)) out.push(finding('R-OUT-05', `${p}.term`, `duplicate of ${names.get(k)}`)); else names.set(k, p);
      if (exKeys.has(k)) out.push(finding('R-EX-01', `${p}.term`, `"${t.term}" matches excluded "${exKeys.get(k)}"`));
      const bad = [...scriptsOf(t.term)].filter((s) => !allowedScripts(profile).has(s));
      if (bad.length) out.push(finding('R-TERM-06', `${p}.term`, `uses script(s) ${bad.join(', ')} not in profile.scripts`));
    }
    if (ceiling >= 0 && levelIndex(t.level) > ceiling) out.push(finding('R-SEL-08', `${p}.level`, `level ${t.level} is above the ceiling ${spec.level.ceiling}`));
  }));
  // Closed sets: all-or-nothing, counting excluded (known) members as present.
  for (const [i, set] of (list.sets || []).entries()) {
    if (!Array.isArray(set.members) || !set.members.length) { out.push(finding('R-SEL-01', `sets[${i}]`, 'set needs a members[] list')); continue; }
    const mainKeys = new Set(list.main.map((t) => fold(t.term, profile)));
    const status = set.members.map((m) => ({ m, inMain: mainKeys.has(fold(m, profile)), known: exKeys.has(fold(m, profile)) }));
    const used = status.filter((s) => s.inMain).length;
    const missing = status.filter((s) => !s.inMain && !s.known).map((s) => s.m);
    if (used > 0 && missing.length) out.push(finding('R-SEL-04', `sets[${i}]`, `closed set "${set.name}" is incomplete; missing: ${missing.join(', ')}`));
  }
  if (list.main.length) checkJobs(list, spec, exKeys, out);
  return out;
}

// ---------- candidates (possible exclude matches for an agent to judge) ----------

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function loose(s, profile) {
  let t = stripMarks(fold(s, profile)).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
  const articles = (profile.articles || []).map((a) => stripMarks(fold(a, profile)));
  if (articles.length) {
    const parts = t.split(' ');
    while (parts.length > 1 && articles.includes(parts[0])) parts.shift();
    t = parts.join(' ');
  }
  return t;
}

export function candidates(list, ex, spec) {
  const profile = spec?.profile || {};
  const pairs = [];
  const exact = excludeKeys(ex, profile);
  const pool = [];
  for (const it of ex?.items || []) for (const f of [it.term, it.lemma, ...(it.forms || [])]) if (typeof f === 'string' && f.trim()) pool.push({ raw: it.raw, form: f });
  const all = [...(list.main || []).map((t) => ({ ...t, from: 'main' })), ...(list.spares || []).map((t) => ({ ...t, from: 'spares' }))];
  for (const t of all) {
    if (exact.has(fold(t.term, profile))) continue; // exact hits are errors in validate list, not candidates
    const lt = loose(t.term, profile);
    const ltWords = new Set(words(lt, profile.locale));
    const seen = new Set();
    for (const { raw, form } of pool) {
      if (seen.has(raw)) continue;
      const lf = loose(form, profile);
      let reason = null;
      if (lt === lf) reason = 'equal after removing accents, marks, punctuation and articles';
      else if (lf.length >= 3 && (ltWords.has(lf) || new Set(words(lf, profile.locale)).has(lt))) reason = 'one contains the other as a whole word';
      else if (Math.min(lt.length, lf.length) >= 4 && editDistance(lt, lf) <= (Math.min(lt.length, lf.length) >= 7 ? 2 : 1)) reason = 'near-identical spelling';
      if (reason) { pairs.push({ id: t.id, from: t.from, term: t.term, excluded: raw, form, reason }); seen.add(raw); }
    }
  }
  // Near-duplicates inside the list itself.
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = loose(all[i].term, profile), b = loose(all[j].term, profile);
    if (a === b) pairs.push({ id: all[i].id, from: all[i].from, term: all[i].term, other_id: all[j].id, other: all[j].term, reason: 'two list items equal after removing accents, marks and articles' });
  }
  return pairs;
}

// ---------- draft helpers ----------

function draftTerms(draft) { return Array.isArray(draft?.terms) ? draft.terms : []; }

function targetLangFields(spec) {
  return spec.immersion ? TERM_FIELDS.filter((f) => f !== 'term' && f !== 'category') : ['example'];
}

function targetPart(field, text, spec, style) {
  if (field === 'example' && !spec.immersion) {
    const sep = style?.gloss_separator || ' — ';
    const idx = text.indexOf(sep);
    const paren = text.search(/\s\([^)]*\)\s*$/u);
    if (idx >= 0) return text.slice(0, idx);
    if (paren >= 0) return text.slice(0, paren);
  }
  if (field === 'definition') return stripIpa(text);
  return text;
}

// ---------- validate batch / glossary (mechanical rules) ----------

export function validateGlossary(draft, spec, { ex = null, style = null, partial = false } = {}) {
  const out = [];
  const profile = spec.profile || {};
  const lp = spec.learner_profile || {};
  const terms = draftTerms(draft);
  if (!Array.isArray(draft?.terms)) return [finding('R-OUT-02', 'terms', 'missing or not an array')];
  // Structural contract, checked on the projected output (internal keys stripped).
  if (!partial) out.push(...validateOutput(project(draft, spec), spec));
  else terms.forEach((t, i) => {
    if (typeof t.id !== 'string' || !t.id) out.push(finding('R-OUT-02', `terms[${i}].id`, 'every draft entry needs an id'));
    for (const k of REQUIRED_TERM_FIELDS) if (!(k in t)) out.push(finding('R-OUT-02', `terms[${i}].${k}`, 'missing required field'));
    for (const k of TERM_FIELDS) if (k in t) checkText(t[k], `terms[${i}].${k}`, out);
  });
  const count = spec.series ? spec.series.part_count : spec.count;
  if (!partial && terms.length > count) out.push(finding('R-SEL-09', 'terms', `${terms.length} terms > requested ${count}`));
  const exKeys = excludeKeys(ex, profile);
  const categories = style?.categories ? new Set(style.categories) : null;
  const catSeen = new Map();
  const openers = new Map();
  let prevOpener = null;
  const banned = [...(style?.banned_phrases || []), ...(String(lp.locale || '').toLowerCase().startsWith('en') ? DEFAULT_BANNED_EN : [])];
  const limits = style?.limits || {};
  // Vocabularies for telling a quoted target phrase from a quoted learner-language gloss (R-FLD-18).
  const sameScript = [...allowedScripts(profile)].some((sc) => allowedScripts(lp).has(sc));
  const targetVocab = new Set(), learnerVocab = new Set();
  for (const t of terms) {
    for (const w of words(String(t.term || ''), profile.locale)) targetVocab.add(fold(w, profile));
    if (typeof t.example === 'string') for (const w of words(targetPart('example', t.example, spec, style), profile.locale)) targetVocab.add(fold(w, profile));
    if (typeof t.definition === 'string') for (const w of words(stripIpa(t.definition).replace(QUOTED, ' '), lp.locale)) learnerVocab.add(fold(w, lp));
  }
  const looksTarget = (span) => {
    if (spec.immersion) return true;
    if (!sameScript) return false; // different scripts: the script check above covers target text
    const ws = words(span, profile.locale).map((w) => fold(w, profile));
    const inTarget = ws.filter((w) => targetVocab.has(w)).length / ws.length;
    const inLearner = ws.filter((w) => learnerVocab.has(w)).length / ws.length;
    return inTarget >= 0.5 && inLearner < 0.5;
  };
  terms.forEach((t, i) => {
    const p = `terms[${i}]`;
    if (typeof t.term !== 'string' || typeof t.definition !== 'string') return;
    // Exclusions.
    if (exKeys.has(fold(t.term, profile))) out.push(finding('R-EX-01', `${p}.term`, `"${t.term}" matches excluded "${exKeys.get(fold(t.term, profile))}"`));
    // Term script.
    const badTermScripts = [...scriptsOf(t.term)].filter((s) => !allowedScripts(profile).has(s));
    if (badTermScripts.length) out.push(finding('R-TERM-06', `${p}.term`, `uses script(s) ${badTermScripts.join(', ')} not in profile.scripts`));
    // Pronunciation.
    const hasTailIpa = IPA_TAIL.test(t.definition);
    if (spec.pronunciation === 'ipa' && !hasTailIpa) out.push(finding('R-PRON-01', `${p}.definition`, 'pronunciation=ipa but the definition does not end with /…/'));
    for (const f of TERM_FIELDS) {
      if (typeof t[f] !== 'string') continue;
      const spans = t[f].match(IPA_SPAN) || [];
      const phonetic = spans.filter((s) => IPA_MARKS.test(s) || /[ˈˌ]/u.test(s));
      if (spec.pronunciation !== 'ipa' && phonetic.length) out.push(finding('R-PRON-02', `${p}.${f}`, `pronunciation=${spec.pronunciation} but found IPA ${phonetic[0]}`));
      if (spec.pronunciation === 'ipa' && f !== 'definition' && phonetic.length) out.push(finding('R-PRON-03', `${p}.${f}`, 'IPA belongs only at the end of definition'));
    }
    // Category.
    if (typeof t.category === 'string') {
      if (categories && !categories.has(t.category)) out.push(finding('R-FLD-05', `${p}.category`, `"${t.category}" is not in style.categories`));
      const ck = fold(t.category, lp).replace(/s$/u, '');
      if (catSeen.has(ck) && catSeen.get(ck) !== t.category) out.push(finding('R-FLD-05', `${p}.category`, `"${t.category}" vs "${catSeen.get(ck)}": use one label`));
      else catSeen.set(ck, t.category);
    }
    // Definition opening.
    const def = stripIpa(t.definition);
    const defWords = words(def, lp.locale);
    const termWords = words(t.term, profile.locale).map((w) => fold(w, profile));
    const head = defWords.slice(0, termWords.length + 1).map((w) => fold(w, profile));
    if (termWords.length && (termWords.every((w, k) => head[k] === w) || termWords.every((w, k) => head[k + 1] === w))) out.push(finding('R-FLD-03', `${p}.definition`, 'definition restates the term as its own subject'));
    const op = defWords[0] ? fold(defWords[0], lp) : null;
    if (op) {
      openers.set(op, [...(openers.get(op) || []), i]);
      if (op === prevOpener) out.push(finding('R-FLD-04', `${p}.definition`, `same opening word "${defWords[0]}" as the previous definition`));
      prevOpener = op;
    }
    // Optional field repeating the definition (R-FLD-17).
    const defSet = new Set(words(def, lp.locale).map((w) => fold(w, lp)));
    for (const f of ['mental_model', 'discussion', 'anti_example', 'controversy']) {
      if (typeof t[f] !== 'string') continue;
      const ws = new Set(words(t[f], lp.locale).map((w) => fold(w, lp)));
      const small = Math.min(ws.size, defSet.size);
      if (small < 4) continue;
      const shared = [...ws].filter((w) => defSet.has(w)).length;
      if (shared / small >= 0.7) out.push(finding('R-FLD-17', `${p}.${f}`, `shares ${shared} of ${small} words with the definition; it may just repeat it`, 'warning'));
    }
    // Examples inside the definition (R-FLD-18).
    if (!spec.immersion) {
      const learnerScripts = allowedScripts(lp);
      const targetOnly = [...scriptsOf(def)].filter((sc) => !learnerScripts.has(sc) && allowedScripts(profile).has(sc));
      if (targetOnly.length) out.push(finding('R-FLD-18', `${p}.definition`, `contains target-language text (${targetOnly.join(', ')}); examples belong in example`, 'warning'));
    }
    for (const m of def.matchAll(QUOTED)) {
      const span = m.slice(1).find(Boolean) || '';
      if (words(span, profile.locale).length >= 2 && looksTarget(span)) { out.push(finding('R-FLD-18', `${p}.definition`, `quoted phrase "${span}"; examples belong in example`, 'warning')); break; }
    }
    const markers = style?.example_markers || (String(lp.locale || '').toLowerCase().startsWith('en') ? DEFAULT_EXAMPLE_MARKERS_EN : []);
    const lowDef = ` ${fold(def, lp)} `;
    for (const mk of markers) {
      const k = fold(mk, lp);
      const re = new RegExp(`(^|[^\\p{L}])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, 'u');
      if (re.test(lowDef)) { out.push(finding('R-FLD-18', `${p}.definition`, `uses the example marker "${mk}"; examples belong in example`, 'warning')); break; }
    }
    // Beginner mode shape.
    if (spec.beginner_mode) {
      const n = sentences(def, lp.locale).length;
      if (n > 2) out.push(finding('R-FLD-07', `${p}.definition`, `${n} sentences; beginner mode allows 1–2`));
      if (typeof t.controversy === 'string' && sentences(t.controversy, lp.locale).length > 1) out.push(finding('R-LVL-05', `${p}.controversy`, 'beginner mode: controversy must be omitted or one short sentence'));
      const maxWords = style?.limits?.sentence || 10;
      for (const f of targetLangFields(spec)) {
        if (typeof t[f] !== 'string') continue;
        const sents = sentences(targetPart(f, t[f], spec, style), profile.locale);
        if (f === 'example' && sents.length > 2) out.push(finding('R-LVL-07', `${p}.${f}`, `${sents.length} sentences; beginner examples have at most 2`));
        for (const snt of sents) {
          const seps = (snt.match(/[,;:、，،؛]/gu) || []).length;
          const n = words(snt, profile.locale).length;
          if (seps > 1) out.push(finding('R-LVL-07', `${p}.${f}`, `"${snt}" has ${seps} clause separators; beginner sentences have one clause`));
          else if (n > maxWords) out.push(finding('R-LVL-07', `${p}.${f}`, `"${snt}" has ${n} words; beginner limit is ${maxWords}`));
        }
      }
    }
    // Style-sheet length limits (words per field).
    for (const [f, max] of Object.entries(limits)) {
      if (typeof t[f] !== 'string' || !Number.isFinite(max)) continue;
      const loc = f === 'example' ? profile.locale : lp.locale;
      // The example limit is for the target sentence; a learner-language gloss after the separator doesn't count.
      const n = words(f === 'definition' ? def : f === 'example' ? targetPart('example', t[f], spec, style) : t[f], loc).length;
      if (n > max * 1.25) out.push(finding('R-FLD-06', `${p}.${f}`, `${n} words; style limit is ${max}`));
    }
    // Banned phrases.
    for (const f of TERM_FIELDS) {
      if (typeof t[f] !== 'string') continue;
      const low = fold(t[f], lp);
      for (const b of banned) if (low.includes(fold(b, lp))) out.push(finding('R-TONE-02', `${p}.${f}`, `banned phrase "${b}"`));
    }
    // Immersion: nothing outside the target language's scripts (+ Latin for IPA/spoken hints at the end of definition).
    if (spec.immersion) {
      for (const f of TERM_FIELDS) {
        if (typeof t[f] !== 'string' || f === 'term') continue;
        const text = f === 'definition' ? def : t[f];
        const bad = [...scriptsOf(text)].filter((s) => !allowedScripts(profile).has(s));
        if (bad.length) out.push(finding('R-IMM-02', `${p}.${f}`, `immersion: contains script(s) ${bad.join(', ')} outside the target language`));
      }
    }
  });
  for (const [op, idx] of openers) if (idx.length > 3) out.push(finding('R-FLD-04', `terms[${idx[3]}].definition`, `opening word "${op}" used ${idx.length} times (max 3)`));
  // Optional fields are a per-term judgment (R-FLD-16). Warnings: an agent decides which fields to drop.
  if (!partial && terms.length >= 8) {
    const counts = terms.map((t) => OPTIONAL_TERM_FIELDS.filter((f) => t[f]).length);
    if (counts.every((c) => c === counts[0])) out.push(finding('R-FLD-16', 'terms', `every term has exactly ${counts[0]} optional field(s); fields should follow each term's needs`, 'warning'));
    for (const f of OPTIONAL_TERM_FIELDS) {
      const n = terms.filter((t) => t[f]).length;
      if (n / terms.length > 0.8) out.push(finding('R-FLD-16', 'terms', `${f} is on ${n} of ${terms.length} terms (> 80%)`, 'warning'));
    }
    if (!counts.includes(0)) out.push(finding('R-FLD-16', 'terms', 'no term is definition-only', 'warning'));
  }
  // Relationships.
  const rels = Array.isArray(draft.relationships) ? draft.relationships : [];
  if (rels.length >= 3) {
    const byType = new Map();
    for (const r of rels) byType.set(fold(r.relationship_type || '', lp), (byType.get(fold(r.relationship_type || '', lp)) || 0) + 1);
    for (const [ty, n] of byType) if (n > rels.length / 2) out.push(finding('R-REL-02', 'relationships', `type "${ty}" covers ${n}/${rels.length} (> half)`));
  }
  const confusion = new Set((style?.confusion_types || ['often confused with']).map((s) => fold(s, lp)));
  const byName = new Map(terms.map((t) => [t.term, t]));
  rels.forEach((r, i) => {
    if (!confusion.has(fold(r.relationship_type || '', lp))) return;
    const a = byName.get(r.source), b = byName.get(r.target);
    if (a && b && !a.anti_example && !b.anti_example) out.push(finding('R-REL-03', `relationships[${i}]`, 'names a confusion but neither term has an anti_example'));
  });
  return out;
}

// ---------- findings ----------

export function validateFindings(fnd, draft, ruleIds = null) {
  const out = [];
  if (!isObj(fnd) || !Array.isArray(fnd.findings)) return [finding('R-FIND-02', '', 'findings file must be {findings: []}')];
  // Works on a draft (terms[]) or on list.json (main[] + spares[], where the only field is `term`).
  const entries = Array.isArray(draft?.terms) ? draft.terms : [...(draft?.main || []), ...(draft?.spares || [])];
  const byId = new Map(entries.map((t) => [t.id, t]));
  fnd.findings.forEach((f, i) => {
    const p = `findings[${i}]`;
    for (const k of ['term_id', 'field', 'rule', 'severity', 'quote', 'problem']) if (typeof f[k] !== 'string' || !f[k].trim()) out.push(finding('R-FIND-02', `${p}.${k}`, 'must be a non-empty string'));
    if (typeof f.rule === 'string' && !/^R-[A-Z]+-\d{2}$/.test(f.rule)) out.push(finding('R-FIND-02', `${p}.rule`, `"${f.rule}" is not a rule ID`));
    if (ruleIds && typeof f.rule === 'string' && !ruleIds.has(f.rule)) out.push(finding('R-FIND-02', `${p}.rule`, `"${f.rule}" is not defined in rules.md`));
    if (!['must_fix', 'should_fix'].includes(f.severity)) out.push(finding('R-FIND-02', `${p}.severity`, 'must be must_fix | should_fix'));
    const rel = /^relationships\[(\d+)\]$/.exec(f.term_id || '');
    const t = rel ? draft?.relationships?.[Number(rel[1])] : byId.get(f.term_id);
    if (!t) { out.push(finding('R-FIND-01', `${p}.term_id`, `no draft entry or relationship "${f.term_id}"`)); return; }
    const text = t[f.field];
    if (typeof text !== 'string') out.push(finding('R-FIND-01', `${p}.field`, `entry "${f.term_id}" has no field "${f.field}"`));
    else if (typeof f.quote === 'string' && !nfc(text).includes(nfc(f.quote))) out.push(finding('R-FIND-01', `${p}.quote`, 'quote does not appear in that field'));
  });
  return out;
}

export function ruleIdsFrom(markdown) {
  return new Set([...markdown.matchAll(/\bR-[A-Z]+-\d{2}\b/g)].map((m) => m[0]));
}

// ---------- normalize ----------

export function normalize(draft, spec, style = null) {
  const lp = spec.learner_profile || {};
  const canon = new Map((style?.categories || []).map((c) => [fold(c, lp).replace(/s$/u, ''), c]));
  const clean = (s) => nfc(String(s))
    .replace(/[\r\n\t\u2028\u2029]+/gu, ' ')
    .replace(/\*\*|__|`/gu, '')
    // Only , and . lose a preceding space: French and others put a space before ; : ! ? and keep it.
    .replace(/\s+([,.])(?!\d)/gu, '$1')
    .replace(/ (?:--|–|-) (?=\S)/gu, ' — ')
    .replace(/\s{2,}/gu, ' ')
    .trim();
  const walk = (obj, keys) => {
    for (const k of keys) {
      if (!(k in obj)) continue;
      if (typeof obj[k] !== 'string') continue;
      const v = clean(obj[k]);
      if (v) obj[k] = v; else delete obj[k];
    }
  };
  const d = structuredClone(draft);
  for (const k of ['domain', 'description']) if (typeof d[k] === 'string') d[k] = clean(d[k]);
  for (const t of draftTerms(d)) {
    walk(t, TERM_FIELDS);
    if (typeof t.category === 'string' && canon.size) {
      const c = canon.get(fold(t.category, lp).replace(/s$/u, ''));
      if (c) t.category = c;
    }
    if (typeof t.definition === 'string') t.definition = t.definition.replace(/\s*(\/[^/\s][^/]*\/)\.?$/u, ' $1');
  }
  if (Array.isArray(d.relationships)) for (const r of d.relationships) walk(r, REL_FIELDS);
  return d;
}

// ---------- metrics (consistency across batches) ----------

export function metrics(draft, spec, plan = null) {
  const lp = spec.learner_profile || {};
  const profile = spec.profile || {};
  const planById = new Map((plan?.terms || []).map((p) => [p.id, p]));
  const batches = new Map();
  for (const t of draftTerms(draft)) {
    const b = String(t.batch ?? 'all');
    if (!batches.has(b)) batches.set(b, []);
    batches.get(b).push(t);
  }
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const per = [];
  for (const [b, ts] of batches) {
    const defW = ts.map((t) => words(stripIpa(t.definition || ''), lp.locale).length);
    const exW = ts.filter((t) => t.example).map((t) => words(t.example, profile.locale).length);
    const sentLen = ts.map((t) => { const s = sentences(stripIpa(t.definition || ''), lp.locale); return s.length ? defW[ts.indexOf(t)] / s.length : 0; });
    const optional = ts.map((t) => OPTIONAL_TERM_FIELDS.filter((f) => t[f]).length);
    let planMismatch = 0;
    for (const t of ts) {
      const pl = planById.get(t.id);
      if (!pl?.fields) continue;
      const want = new Set(pl.fields), have = new Set(OPTIONAL_TERM_FIELDS.filter((f) => t[f]));
      for (const f of OPTIONAL_TERM_FIELDS) if (want.has(f) !== have.has(f)) planMismatch++;
    }
    per.push({ batch: b, terms: ts.length, def_words: +mean(defW).toFixed(1), example_words: +mean(exW).toFixed(1), def_sentence_words: +mean(sentLen).toFixed(1), optional_fields: +mean(optional).toFixed(2), plan_mismatches: planMismatch });
  }
  const outliers = [];
  if (per.length >= 3) {
    for (const key of ['def_words', 'example_words', 'def_sentence_words', 'optional_fields']) {
      const vals = per.map((x) => x[key]).sort((a, b) => a - b);
      const median = vals[Math.floor(vals.length / 2)];
      for (const x of per) if (median > 0 && Math.abs(x[key] - median) / median > 0.4) outliers.push({ batch: x.batch, metric: key, value: x[key], median });
    }
  }
  for (const x of per) if (x.plan_mismatches > 0) outliers.push({ batch: x.batch, metric: 'plan_mismatches', value: x.plan_mismatches, median: 0 });
  const scenes = new Map();
  // Only entries that get an example have a real scene; others may carry a placeholder like "none".
  for (const p of plan?.terms || []) if (p.scene && (!Array.isArray(p.fields) || p.fields.includes('example'))) scenes.set(fold(p.scene, lp), [...(scenes.get(fold(p.scene, lp)) || []), p.id]);
  const repeatedScenes = [...scenes].filter(([, ids]) => ids.length > 2).map(([scene, ids]) => ({ scene, ids }));
  const all = draftTerms(draft);
  const fill = Object.fromEntries(OPTIONAL_TERM_FIELDS.map((f) => [f, all.length ? +(all.filter((t) => t[f]).length / all.length).toFixed(2) : 0]));
  const distribution = {};
  for (const t of all) { const n = OPTIONAL_TERM_FIELDS.filter((f) => t[f]).length; distribution[n] = (distribution[n] || 0) + 1; }
  return { batches: per, outliers, repeated_scenes: repeatedScenes, fill_rates: fill, optional_field_counts: distribution };
}

// ---------- tokens (input for the level check) ----------

export function tokens(draft, spec, { ex = null, levellist = null, style = null } = {}) {
  const profile = spec.profile || {};
  const known = new Set();
  const addKnown = (s) => { for (const w of words(String(s), profile.locale)) known.add(fold(w, profile)); };
  for (const t of draftTerms(draft)) addKnown(t.term);
  for (const it of ex?.items || []) for (const f of [it.term, it.lemma, ...(it.forms || [])]) if (f) addKnown(f);
  const levels = new Map();
  if (levellist) for (const line of levellist.split(/\r?\n/u)) {
    const [w, lv] = line.split(/\t|,/u).map((s) => s?.trim());
    if (w) levels.set(fold(w, profile), lv || null);
  }
  const ceiling = levelIndex(spec.level?.ceiling);
  const map = new Map();
  const fields = targetLangFields(spec);
  for (const t of draftTerms(draft)) {
    for (const f of fields) {
      if (typeof t[f] !== 'string') continue;
      for (const w of words(targetPart(f, t[f], spec, style), profile.locale)) {
        const k = fold(w, profile);
        if (known.has(k) || /^\p{N}+$/u.test(k)) continue;
        if (!map.has(k)) map.set(k, { token: k, occurrences: [] });
        map.get(k).occurrences.push({ term_id: t.id, field: f });
      }
    }
    if (spec.immersion) for (const r of draft.relationships || []) for (const f of ['relationship_type', 'description']) {
      if (typeof r[f] !== 'string') continue;
      for (const w of words(r[f], profile.locale)) {
        const k = fold(w, profile);
        if (known.has(k)) continue;
        if (!map.has(k)) map.set(k, { token: k, occurrences: [] });
        map.get(k).occurrences.push({ relationship: `${r.source} → ${r.target}`, field: f });
      }
    }
  }
  const list = [...map.values()];
  if (levels.size) for (const x of list) {
    const lv = levels.get(x.token);
    x.list_level = lv ?? null;
    x.over_ceiling = lv ? levelIndex(lv) - ceiling : null;
  }
  return { ceiling: spec.level?.ceiling, fields, count: list.length, tokens: list };
}

// ---------- ipa (independent transcription check, R-PRON-04) ----------

function ipaOf(def) {
  const m = typeof def === 'string' ? def.match(/\/([^/\s][^/]*)\/\.?$/u) : null;
  return m ? m[1] : null;
}

const strictIpa = (s) => nfc(s).replace(/[\s.‿]/gu, '');
const looseIpa = (s) => strictIpa(s).replace(/[ˈˌːˑ]/gu, '');

export function ipaList(draft) {
  return draftTerms(draft).map((t) => ({ term_id: t.id, term: t.term, ipa: ipaOf(t.definition) }));
}

export function ipaCompare(draft, check) {
  const out = [];
  const theirs = new Map((check?.answers || []).map((a) => [a.term_id, a]));
  for (const { term_id, term, ipa } of ipaList(draft)) {
    const a = theirs.get(term_id);
    if (!ipa) continue;
    if (!a || typeof a.ipa !== 'string' || !a.ipa.trim()) { out.push({ term_id, term, status: 'unchecked' }); continue; }
    const other = a.ipa.replace(/^\/|\/$/gu, '');
    if (looseIpa(ipa) !== looseIpa(other)) out.push({ term_id, term, status: 'mismatch', rule: 'R-PRON-04', severity: 'must_fix', writer: ipa, checker: other });
    else if (strictIpa(ipa) !== strictIpa(other)) out.push({ term_id, term, status: 'stress_or_length', rule: 'R-PRON-04', severity: 'should_fix', writer: ipa, checker: other });
  }
  return out;
}

// ---------- emit (projection to the import contract) ----------

export function project(draft, spec = null) {
  const fieldMap = outputFieldMap(spec);
  const out = {};
  if (draft.domain !== undefined) out.domain = draft.domain;
  if (draft.description !== undefined) out.description = draft.description;
  out.terms = draftTerms(draft).map((t) => {
    const o = {};
    for (const [from, to] of fieldMap) if (t[from] !== undefined && t[from] !== '') o[to] = t[from];
    return o;
  });
  const rels = (Array.isArray(draft.relationships) ? draft.relationships : []).map((r) => {
    const o = {};
    for (const k of REL_FIELDS) if (r[k] !== undefined && r[k] !== '') o[k] = r[k];
    return o;
  });
  if (rels.length) out.relationships = rels;
  return out;
}

// ---------- CLI ----------

function parseArgs(argv) {
  const pos = []; const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { flags[argv[i].slice(2)] = argv[i + 1]; i++; }
    else pos.push(argv[i]);
  }
  return { pos, flags };
}

function need(flags, k) {
  if (!flags[k]) throw new UsageError(`--${k} is required`);
  return readJson(flags[k], `--${k}`);
}

function report(findings, extra = {}) {
  const errors = findings.filter((f) => f.severity === 'error');
  process.stdout.write(JSON.stringify({ ok: errors.length === 0, errors: errors.length, findings, ...extra }, null, 2) + '\n');
  process.exitCode = errors.length ? 1 : 0;
}

function main(argv) {
  const { pos, flags } = parseArgs(argv);
  const [cmd, a, b] = pos;
  const opt = (k) => (flags[k] ? readJson(flags[k], `--${k}`) : null);
  switch (cmd) {
    case 'validate': {
      if (!b) throw new UsageError('validate <kind> <file>');
      let doc;
      try { doc = readJson(b); } catch (e) { if (e instanceof ContractError) return report(e.findings); throw e; }
      switch (a) {
        case 'spec': return report(validateSpec(doc));
        case 'exclude': return report(validateExclude(doc));
        case 'list': return report(validateList(doc, need(flags, 'spec'), opt('exclude')));
        case 'batch': return report(validateGlossary(doc, need(flags, 'spec'), { style: opt('style'), ex: opt('exclude'), partial: true }));
        case 'glossary': return report(validateGlossary(doc, need(flags, 'spec'), { ex: opt('exclude'), style: opt('style') }));
        case 'findings': return report(validateFindings(doc, need(flags, 'draft'), flags.rules ? ruleIdsFrom(readFileSync(flags.rules, 'utf8')) : null));
        case 'output': return report(validateOutput(doc, opt('spec')));
        default: throw new UsageError(`unknown kind "${a}"`);
      }
    }
    case 'normalize': {
      const res = normalize(readJson(a), need(flags, 'spec'), opt('style'));
      const text = JSON.stringify(res, null, 2) + '\n';
      if (flags.out) writeFileSync(flags.out, text); else process.stdout.write(text);
      return;
    }
    case 'metrics': return report([], metrics(readJson(a), need(flags, 'spec'), opt('plan')));
    case 'candidates': return report([], { pairs: candidates(readJson(a), opt('exclude') || { items: [] }, need(flags, 'spec')) });
    case 'ipa': {
      const draft = readJson(a);
      if (!flags.against) return report([], { terms: ipaList(draft) });
      const res = ipaCompare(draft, readJson(flags.against));
      return report(res.filter((r) => r.severity === 'must_fix').map((r) => finding('R-PRON-04', r.term_id, `IPA /${r.writer}/ vs independent /${r.checker}/`)), { comparisons: res });
    }
    case 'tokens': return report([], tokens(readJson(a), need(flags, 'spec'), { ex: opt('exclude'), style: opt('style'), levellist: flags.levellist ? readFileSync(flags.levellist, 'utf8') : null }));
    case 'emit': {
      const spec = need(flags, 'spec');
      const res = project(readJson(a), spec);
      const problems = validateOutput(res, spec);
      if (problems.length) return report(problems);
      const text = JSON.stringify(res, null, 2) + '\n';
      if (flags.out) writeFileSync(flags.out, text);
      process.stdout.write(text);
      return;
    }
    default: throw new UsageError('commands: validate <spec|exclude|list|batch|glossary|findings|output> | normalize | metrics | candidates | tokens | ipa | emit');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { main(process.argv.slice(2)); }
  catch (e) {
    if (e instanceof ContractError) report(e.findings);
    else { process.stderr.write(`gym: ${e.message}\n`); process.exitCode = 2; }
  }
}
