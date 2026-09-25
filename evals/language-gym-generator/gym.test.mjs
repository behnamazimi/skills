// Run: node --test evals/language-gym-generator/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  validateOutput, validateSpec, validateExclude, validateList, validateGlossary, validateFindings,
  candidates, normalize, metrics, tokens, project, parseJson, ruleIdsFrom,
  requiredJobs, ipaCompare,
} from '../../skills/language-gym-generator/scripts/gym.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));
const gym = join(here, '../../skills/language-gym-generator/scripts/gym.mjs');
const rulesMd = readFileSync(join(here, '../../skills/language-gym-generator/refs/rules.md'), 'utf8');
const rules = (fs) => fs.filter((f) => f.severity === 'error').map((f) => f.rule);
const has = (fs, rule, pathPart = '') => fs.some((f) => f.rule === rule && f.path.includes(pathPart));

const esSpec = fx('spec-es.json');
const esDraft = fx('glossary-es.json');
const esOut = () => project(esDraft, esSpec);

test('every rule ID the script emits is defined in rules.md', () => {
  const src = readFileSync(gym, 'utf8');
  const defined = ruleIdsFrom(rulesMd);
  for (const id of ruleIdsFrom(src)) assert.ok(defined.has(id), `${id} is emitted by gym.mjs but missing from rules.md`);
});

test('valid fixtures pass every check', () => {
  assert.deepEqual(rules(validateSpec(esSpec)), []);
  assert.deepEqual(rules(validateOutput(esOut(), esSpec)), []);
  assert.deepEqual(rules(validateGlossary(esDraft, esSpec)), []);
  for (const [s, g] of [['spec-ar.json', 'glossary-ar.json'], ['spec-zh.json', 'glossary-zh.json']]) {
    assert.deepEqual(rules(validateSpec(fx(s))), [], s);
    assert.deepEqual(rules(validateGlossary(fx(g), fx(s))), [], g);
  }
});

test('project strips internal keys and keeps key order', () => {
  const out = esOut();
  assert.deepEqual(Object.keys(out), ['domain', 'description', 'terms', 'relationships']);
  assert.deepEqual(Object.keys(out.terms[0]), ['term', 'category', 'definition', 'example', 'anti_example']);
  assert.ok(!('id' in out.terms[0]) && !('batch' in out.terms[0]));
  const noRels = project({ ...esDraft, relationships: [] }, esSpec);
  assert.ok(!('relationships' in noRels), 'empty relationships are omitted');
});

test('output contract: structure', () => {
  const bad = esOut();
  bad.extra = 'x';
  bad.terms[0].id = 't01';
  delete bad.terms[1].category;
  bad.terms[2].example = '';
  bad.terms[3].discussion = null;
  const fs = validateOutput(bad, esSpec);
  assert.ok(has(fs, 'R-OUT-02', 'extra'));
  assert.ok(has(fs, 'R-OUT-02', 'terms[0].id'));
  assert.ok(has(fs, 'R-OUT-02', 'terms[1].category'));
  assert.ok(has(fs, 'R-OUT-03', 'terms[2].example'));
  assert.ok(has(fs, 'R-OUT-02', 'terms[3].discussion'));
  assert.ok(has(validateOutput({ domain: 'x', description: 'y', terms: [] }), 'R-OUT-04'));
  const big = { domain: 'x', description: 'y', terms: Array.from({ length: 101 }, (_, i) => ({ term: `w${i}`, category: 'Noun', definition: 'd' })) };
  assert.ok(has(validateOutput(big), 'R-OUT-04'));
});

test('output contract: text hygiene', () => {
  const bad = esOut();
  bad.terms[0].definition = ' padded';
  bad.terms[1].definition = 'two\nlines';
  bad.terms[2].definition = 'uses **bold**';
  bad.terms[3].definition = 'has <b>html</b>';
  bad.description = 'café';
  const fs = validateOutput(bad, esSpec);
  for (const i of [0, 1, 2, 3]) assert.ok(has(fs, 'R-OUT-03', `terms[${i}].definition`), `terms[${i}]`);
  assert.ok(has(fs, 'R-OUT-01', 'description'), 'non-NFC');
  assert.throws(() => parseJson('﻿{}'), (e) => e.findings[0].rule === 'R-OUT-01');
  assert.throws(() => parseJson('{"a":'), (e) => e.findings[0].rule === 'R-OUT-01');
});

test('output contract: duplicates after NFC and locale case-folding', () => {
  const bad = esOut();
  bad.terms[1].term = 'ESTAR';
  assert.ok(has(validateOutput(bad, esSpec), 'R-OUT-05'));
  const nfd = esOut();
  nfd.terms[1].term = 'estár'; // "estár" decomposed vs other composed spelling
  nfd.terms[0].term = 'estár';
  assert.ok(has(validateOutput(nfd, esSpec), 'R-OUT-05'));
  const trSpec = { profile: { locale: 'tr', cased: true } };
  const tr = { domain: 'Turkish', description: 'd', terms: [{ term: 'İstanbul', category: 'Noun', definition: 'd' }, { term: 'istanbul', category: 'Noun', definition: 'e' }] };
  assert.ok(has(validateOutput(tr, trSpec), 'R-OUT-05'), 'Turkish dotted İ folds to i');
});

test('output contract: relationships', () => {
  const bad = esOut();
  bad.relationships.push({ source: 'estar', target: 'ser', relationship_type: 'contrasts with' });
  bad.relationships.push({ source: 'ser', target: 'Ser', relationship_type: 'x' });
  bad.relationships.push({ source: 'hay', target: 'hay', relationship_type: 'x' });
  const fs = validateOutput(bad, esSpec);
  assert.ok(has(fs, 'R-OUT-06', 'relationships[1]'), 'reversed duplicate pair');
  assert.ok(has(fs, 'R-OUT-06', 'relationships[2].target'), 'endpoint must match exactly');
  assert.ok(has(fs, 'R-OUT-06', 'relationships[3]'), 'self link');
  const many = esOut();
  many.relationships = Array.from({ length: 5 }, (_, i) => ({ source: 'ser', target: 'estar', relationship_type: `t${i}` }));
  assert.ok(has(validateOutput(many, esSpec), 'R-OUT-07'), 'more relationships than terms');
});

test('custom fields: rename and drop optional fields only', () => {
  const spec = { ...esSpec, fields: { rename: { anti_example: 'near_miss' }, drop: ['controversy'] } };
  assert.deepEqual(rules(validateSpec(spec)), []);
  const out = project(esDraft, spec);
  assert.ok('near_miss' in out.terms[0] && !('anti_example' in out.terms[0]));
  assert.deepEqual(rules(validateOutput(out, spec)), []);
  assert.ok(has(validateOutput(esOut(), spec), 'R-OUT-02'), 'old name rejected once renamed');
  assert.ok(has(validateSpec({ ...esSpec, fields: { drop: ['definition'] } }), 'R-SPEC-08'));
});

test('spec: defaults and contradictions are caught', () => {
  assert.ok(has(validateSpec({ ...esSpec, pronunciation: 'ipa' }), 'R-SPEC-04'), 'beginner default must be none');
  assert.ok(has(validateSpec({ ...esSpec, beginner_mode: false }), 'R-SPEC-03'));
  assert.ok(has(validateSpec({ ...esSpec, immersion: true }), 'R-SPEC-05'));
  assert.ok(has(validateSpec({ ...esSpec, learner: 'Spanish' }), 'R-SPEC-05'));
  assert.ok(has(validateSpec({ ...esSpec, count: 0 }), 'R-SPEC-02'));
  assert.ok(has(validateSpec({ ...esSpec, count: 150, path: 'full' }), 'R-SPEC-02'), 'series required above 100');
  assert.deepEqual(rules(validateSpec({ ...esSpec, count: 150, path: 'full', confirmed: true, series: { parts: 2, part: 1, part_count: 75 } })), []);
  assert.ok(has(validateSpec({ ...esSpec, count: 150, path: 'full', series: { parts: 2, part: 1, part_count: 75 } }), 'R-SPEC-02', 'confirmed'));
  assert.ok(has(validateSpec({ ...esSpec, path: 'full' }), 'R-SPEC-07'));
  assert.ok(has(validateSpec({ ...esSpec, profile: { ...esSpec.profile, locale: 'not a locale!' } }), 'R-SPEC-06'));
  assert.ok(has(validateSpec({ ...esSpec, level: { label: 'x', floor: 'B2', ceiling: 'A2' } }), 'R-SPEC-03'));
});

test('exclude: every raw item must be accounted for', () => {
  const ex = fx('exclude-es.json');
  assert.deepEqual(rules(validateExclude(ex)), []);
  const bad = structuredClone(ex);
  bad.raw.push('comer');
  bad.items[0].scope = 'word';
  const fs = validateExclude(bad);
  assert.ok(has(fs, 'R-EX-02', 'raw[4]'));
  assert.ok(has(fs, 'R-EX-02', 'items[0].scope'));
});

test('list: exclusions, closed sets, level ceiling, count', () => {
  const ex = fx('exclude-es.json');
  const list = fx('list-es.json');
  const fs = validateList(list, esSpec, ex);
  assert.ok(!has(fs, 'R-EX-01', 'main[2]'), '"cuenta" is not an exact hit: "la cuenta" was excluded as a phrase');
  assert.ok(!has(fs, 'R-EX-01', 'main[3]'), '"si" (if) is a different word from excluded "sí" (yes)');
  assert.ok(has(fs, 'R-SEL-04'), 'weekday set opened with only lunes');
  const withTener = structuredClone(list);
  withTener.main.push({ id: 't06', term: 'Tengo', job: 'have', slot: 'spine', level: 'A1' });
  assert.ok(has(validateList(withTener, esSpec, ex), 'R-EX-01', 'main[5]'), 'inflected form of an excluded lemma');
  const high = structuredClone(list);
  high.main[0].level = 'C1';
  assert.ok(has(validateList(high, esSpec, ex), 'R-SEL-08'));
  const over = structuredClone(list);
  over.main = Array.from({ length: 11 }, (_, i) => ({ id: `x${i}`, term: `w${i}`, job: 'j', slot: 's', level: 'A1' }));
  assert.ok(has(validateList(over, esSpec, ex), 'R-SEL-09'));
  const scriptBad = structuredClone(list);
  scriptBad.main[0].term = 'эстар';
  assert.ok(has(validateList(scriptBad, esSpec, ex), 'R-TERM-06'));
});

test('closed set counts excluded members as present', () => {
  const ex = { raw: ['lunes', 'martes', 'miércoles'], ignored: [], items: ['lunes', 'martes', 'miércoles'].map((d) => ({ raw: d, term: d, lemma: d, job: null, forms: [], scope: 'lemma' })) };
  const list = { main: ['jueves', 'viernes', 'sábado', 'domingo'].map((d, i) => ({ id: `t${i}`, term: d, job: 'day', slot: 'noun', level: 'A1' })), spares: [], sets: [{ name: 'weekdays', members: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }] };
  assert.ok(!has(validateList(list, esSpec, ex), 'R-SEL-04'));
});

test('candidates: accents, articles and spelling variants go to an agent, not auto-blocked', () => {
  const pairs = candidates(fx('list-es.json'), fx('exclude-es.json'), esSpec);
  const find = (t) => pairs.find((p) => p.term === t);
  assert.match(find('cuenta').reason, /articles|whole word/);
  assert.match(find('si').reason, /accents/);
});

test('glossary: pronunciation modes', () => {
  const ipa = structuredClone(esDraft);
  ipa.terms[0].definition = 'Says where something is right now. /esˈtaɾ/';
  const fs = validateGlossary(ipa, esSpec);
  assert.ok(has(fs, 'R-PRON-02', 'terms[0]'), 'none mode forbids IPA');
  const spec = { ...esSpec, level: { label: 'B2', floor: 'B2', ceiling: 'B2' }, beginner_mode: false, pronunciation: 'ipa' };
  const fs2 = validateGlossary(ipa, spec);
  assert.ok(!has(fs2, 'R-PRON-01', 'terms[0]'));
  assert.ok(has(fs2, 'R-PRON-01', 'terms[1]'), 'ipa mode needs IPA on every definition');
  const inExample = structuredClone(ipa);
  inExample.terms[0].example = 'Estoy aquí /esˈtoi̯/';
  assert.ok(has(validateGlossary(inExample, spec), 'R-PRON-03'));
  const plain = structuredClone(esDraft);
  plain.terms[0].definition = 'Says where and/or how something is right now.';
  assert.ok(!has(validateGlossary(plain, esSpec), 'R-PRON-02'), '"and/or" is not IPA');
});

test('glossary: definition openers, restating, categories, banned phrases', () => {
  const d = structuredClone(esDraft);
  d.terms[1].definition = 'Says what someone is.';
  assert.ok(has(validateGlossary(d, esSpec), 'R-FLD-04', 'terms[1]'), 'same opener twice in a row');
  const four = structuredClone(esDraft);
  four.terms.forEach((t, i) => { t.definition = i % 2 ? `Shows thing ${i}.` : `Used for thing ${i}.`; });
  four.terms.push({ id: 't05', batch: 1, term: 'pero', category: 'Connector', definition: 'Used for contrast.' }, { id: 't06', batch: 1, term: 'porque', category: 'Connector', definition: 'Shows a reason.' }, { id: 't07', batch: 1, term: 'también', category: 'Adverb', definition: 'Used for adding.' });
  assert.ok(has(validateGlossary(four, esSpec), 'R-FLD-04'), 'opener used more than 3 times');
  const restate = structuredClone(esDraft);
  restate.terms[1].definition = 'Ser is the verb for identity.';
  assert.ok(has(validateGlossary(restate, esSpec), 'R-FLD-03', 'terms[1]'));
  const cats = structuredClone(esDraft);
  cats.terms[1].category = 'Verbs';
  assert.ok(has(validateGlossary(cats, esSpec), 'R-FLD-05', 'terms[1]'));
  assert.ok(has(validateGlossary(esDraft, esSpec, { style: { categories: ['Verb'] } }), 'R-FLD-05', 'terms[3]'), 'Grammar not in style list');
  const cliche = structuredClone(esDraft);
  cliche.terms[2].discussion = 'Learners should leverage this early.';
  assert.ok(has(validateGlossary(cliche, esSpec), 'R-TONE-02'));
});

test('glossary: beginner-mode shape and style limits', () => {
  const d = structuredClone(esDraft);
  d.terms[0].definition = 'Says where something is. Also how you feel. And more. Even more.';
  d.terms[1].controversy = 'Some say this. Others say that.';
  const fs = validateGlossary(d, esSpec);
  assert.ok(has(fs, 'R-FLD-07', 'terms[0]'));
  assert.ok(has(fs, 'R-LVL-05', 'terms[1]'));
  assert.ok(has(validateGlossary(esDraft, esSpec, { style: { limits: { definition: 4 } } }), 'R-FLD-06'));
});

test('glossary: exclusions and relationship rules', () => {
  const ex = fx('exclude-es.json');
  const d = structuredClone(esDraft);
  d.terms[2].term = 'tiene';
  assert.ok(has(validateGlossary(d, esSpec, { ex }), 'R-EX-01', 'terms[2]'));
  const noAnti = structuredClone(esDraft);
  delete noAnti.terms[0].anti_example;
  assert.ok(has(validateGlossary(noAnti, esSpec), 'R-REL-03'));
  const sameType = structuredClone(esDraft);
  sameType.relationships = [
    { source: 'ser', target: 'estar', relationship_type: 'builds on' },
    { source: 'hay', target: 'estar', relationship_type: 'builds on' },
    { source: 'ir a + infinitivo', target: 'ser', relationship_type: 'contrasts with' },
  ];
  assert.ok(has(validateGlossary(sameType, esSpec), 'R-REL-02'));
});

test('glossary: immersion and term scripts (any language)', () => {
  const ar = fx('glossary-ar.json');
  ar.terms[0].definition = 'نقولها when something exists.';
  assert.ok(has(validateGlossary(ar, fx('spec-ar.json')), 'R-IMM-02', 'terms[0]'));
  const zh = fx('glossary-zh.json');
  zh.terms[0].term = 'ba';
  assert.ok(has(validateGlossary(zh, fx('spec-zh.json')), 'R-TERM-06'), 'a romanized term is the wrong script for a Hans profile');
  const ja = { terms: [{ id: 't1', term: '食べてしまう', category: 'Grammar', definition: 'd' }] };
  const jaSpec = { ...fx('spec-zh.json'), profile: { ...fx('spec-zh.json').profile, locale: 'ja', scripts: ['Jpan'] }, pronunciation: 'none' };
  assert.ok(!has(validateGlossary(ja, jaSpec, { partial: true }), 'R-TERM-06'), 'Jpan covers kanji + kana');
});

test('batch validation checks ids and required fields without the count', () => {
  const b = { terms: [{ term: 'ser', category: 'Verb', definition: 'Names what someone is.' }] };
  assert.ok(has(validateGlossary(b, esSpec, { partial: true }), 'R-OUT-02', 'id'));
});

test('findings: quotes must exist and cite real rules', () => {
  const ok = { findings: [{ term_id: 't01', field: 'definition', rule: 'R-FLD-03', severity: 'must_fix', quote: 'how someone feels', problem: 'p' }] };
  assert.deepEqual(rules(validateFindings(ok, esDraft, ruleIdsFrom(rulesMd))), []);
  const bad = { findings: [
    { term_id: 't01', field: 'definition', rule: 'R-FLD-03', severity: 'must_fix', quote: 'not in the text', problem: 'p' },
    { term_id: 'nope', field: 'definition', rule: 'R-FLD-03', severity: 'must_fix', quote: 'x', problem: 'p' },
    { term_id: 't01', field: 'definition', rule: 'R-ZZZ-99', severity: 'minor', quote: 'Says', problem: 'p' },
  ] };
  const fs = validateFindings(bad, esDraft, ruleIdsFrom(rulesMd));
  assert.ok(has(fs, 'R-FIND-01', 'findings[0].quote'));
  assert.ok(has(fs, 'R-FIND-01', 'findings[1]'));
  assert.ok(has(fs, 'R-FIND-02', 'findings[2].rule'));
  assert.ok(has(fs, 'R-FIND-02', 'findings[2].severity'));
});

test('normalize fixes mechanical drift', () => {
  const d = structuredClone(esDraft);
  d.terms[0].definition = '  Says **where**\nsomething is  .';
  d.terms[0].example = 'Estoy en casa - I am home';
  d.terms[1].category = 'verbs';
  d.terms[2].discussion = '   ';
  const n = normalize(d, esSpec, { categories: ['Verb', 'Grammar'] });
  assert.equal(n.terms[0].definition, 'Says where something is.');
  assert.equal(n.terms[0].example, 'Estoy en casa — I am home');
  assert.equal(n.terms[1].category, 'Verb');
  assert.ok(!('discussion' in n.terms[2]));
});

test('metrics flag an outlier batch and plan mismatches', () => {
  const mk = (b, i, def) => ({ id: `b${b}t${i}`, batch: b, term: `w${b}${i}`, category: 'Verb', definition: def });
  const d = { terms: [
    ...[1, 2, 3].flatMap((b) => [0, 1].map((i) => mk(b, i, 'Short plain meaning here.'))),
    ...[0, 1].map((i) => mk(4, i, 'A much longer definition that keeps going with many extra words to show drift in this batch.')),
  ] };
  const plan = { terms: [{ id: 'b1t0', fields: ['example'] }] };
  const m = metrics(d, esSpec, plan);
  assert.ok(m.outliers.some((o) => o.batch === '4' && o.metric === 'def_words'));
  assert.ok(m.outliers.some((o) => o.batch === '1' && o.metric === 'plan_mismatches'));
});

test('tokens: target-language words minus known words, any script', () => {
  const t = tokens(esDraft, esSpec, { ex: fx('exclude-es.json') });
  const toks = t.tokens.map((x) => x.token);
  assert.ok(toks.includes('casa'));
  assert.ok(!toks.includes('estar') && !toks.includes('am'), 'known terms and the English gloss are skipped');
  const zh = tokens(fx('glossary-zh.json'), fx('spec-zh.json'));
  assert.ok(zh.tokens.some((x) => x.token === '门'), 'segments text without spaces');
  const withList = tokens(esDraft, esSpec, { levellist: 'casa\tA1\nesquina\tB1\n' });
  assert.equal(withList.tokens.find((x) => x.token === 'casa').over_ceiling, -2);
});

test('CLI: emit prints only valid import JSON; validate exits 1 on errors', () => {
  const spec = join(here, 'fixtures/spec-es.json');
  const out = execFileSync('node', [gym, 'emit', join(here, 'fixtures/glossary-es.json'), '--spec', spec], { encoding: 'utf8' });
  const doc = JSON.parse(out);
  assert.deepEqual(rules(validateOutput(doc, esSpec)), []);
  let code = 0;
  try { execFileSync('node', [gym, 'validate', 'list', join(here, 'fixtures/list-es.json'), '--spec', spec], { encoding: 'utf8' }); } catch (e) { code = e.status; }
  assert.equal(code, 1);
});

test('findings can target list.json, and candidates work without an exclude file', () => {
  const list = fx('list-es.json');
  const ok = { findings: [{ term_id: 't03', field: 'term', rule: 'R-EX-01', severity: 'must_fix', quote: 'cuenta', problem: 'p' }] };
  assert.deepEqual(rules(validateFindings(ok, list, ruleIdsFrom(rulesMd))), []);
  const out = execFileSync('node', [gym, 'candidates', join(here, 'fixtures/list-es.json'), '--spec', join(here, 'fixtures/spec-es.json')], { encoding: 'utf8' });
  assert.ok(Array.isArray(JSON.parse(out).pairs));
});

test('required jobs depend on the ceiling and on grammatical politeness', () => {
  assert.deepEqual(requiredJobs({ level: { ceiling: 'A1' }, profile: {} }), ['identity', 'existence', 'location', 'negation', 'questions', 'want', 'can', 'go', 'must']);
  assert.ok(requiredJobs({ level: { ceiling: 'A2' }, profile: {} }).includes('past'));
  assert.equal(requiredJobs({ level: { ceiling: 'B1' }, profile: {} }).at(-1), 'future');
  assert.ok(requiredJobs({ level: { ceiling: 'A2' }, profile: { politeness_marked: true } }).includes('politeness'));
});

test('list: every required job is mapped, deferred only from the end when full', () => {
  const mk = (terms) => terms.map((t, i) => ({ id: `t${i}`, term: t, job: 'j', slot: 'spine', level: 'A1' }));
  const main = mk(['ser', 'hay', 'estar', 'no', '¿qué?', 'pretérito: -é/-ó', 'querer', 'poder', 'ir', 'tener que + infinitivo']);
  const jobs = { identity: 'ser', existence: 'hay', location: 'estar', negation: 'no', questions: '¿qué?', past: 'pretérito: -é/-ó', want: 'querer', can: 'poder', go: 'ir', must: 'tener que + infinitivo', future: 'deferred' };
  const list = { main, spares: [], sets: [], shape: { jobs } };
  assert.ok(!has(validateList(list, esSpec), 'R-SEL-12'), 'future deferred last with every slot used');
  const missing = structuredClone(list); delete missing.shape.jobs.questions;
  assert.ok(has(validateList(missing, esSpec), 'R-SEL-12', 'questions'));
  const wrongTerm = structuredClone(list); wrongTerm.shape.jobs.go = 'irse';
  assert.ok(has(validateList(wrongTerm, esSpec), 'R-SEL-12', 'go'));
  const earlyDefer = structuredClone(list); earlyDefer.shape.jobs.questions = 'deferred'; earlyDefer.shape.jobs.future = 'n/a: no separate future in this list';
  assert.ok(has(validateList(earlyDefer, esSpec), 'R-SEL-12', 'shape.jobs'), 'deferring a high-priority job while covering lower ones');
  const known = structuredClone(list); known.shape.jobs.want = 'known: tener';
  assert.ok(!has(validateList(known, esSpec, fx('exclude-es.json')), 'R-SEL-12'), 'known: resolves against the exclude list');
  const notKnown = structuredClone(list); notKnown.shape.jobs.want = 'known: comer';
  assert.ok(has(validateList(notKnown, esSpec, fx('exclude-es.json')), 'R-SEL-12', 'want'));
  const freeSlots = structuredClone(list); freeSlots.main.pop(); freeSlots.shape.jobs.must = 'deferred';
  assert.ok(has(validateList(freeSlots, esSpec), 'R-SEL-12', 'must'), 'cannot defer while slots are free');
  assert.ok(!has(validateList({ ...list, shape: {} }, { ...esSpec, slice_type: 'usage' }), 'R-SEL-12'), 'usage slices skip the job check');
});

test('beginner mode: one clause per sentence, short sentences, at most 2 in an example', () => {
  const d = structuredClone(esDraft);
  d.terms[0].example = 'No quiero nada más, gracias, ya comí mucho. — No more for me.';
  d.terms[1].example = 'Hoy mi hermana y yo vamos a comer en un restaurante nuevo del centro.';
  d.terms[2].example = 'Hola. Soy Ana. Soy de Lima.';
  const fs = validateGlossary(d, esSpec);
  assert.ok(has(fs, 'R-LVL-07', 'terms[0]'), 'two clause separators');
  assert.ok(has(fs, 'R-LVL-07', 'terms[1]'), 'over the word limit');
  assert.ok(has(fs, 'R-LVL-07', 'terms[2]'), 'three sentences');
  assert.ok(!has(validateGlossary(esDraft, esSpec), 'R-LVL-07'), 'the English gloss after — is not counted');
  const b2 = { ...esSpec, level: { label: 'B2', floor: 'B2', ceiling: 'B2' }, beginner_mode: false };
  assert.ok(!has(validateGlossary(d, b2), 'R-LVL-07'), 'only in beginner mode');
});

test('ipa: independent transcriptions are compared, tones count, stress is softer', () => {
  const zh = fx('glossary-zh.json');
  const same = ipaCompare(zh, { answers: [{ term_id: 't01', ipa: '/pa˨˩˦/' }, { term_id: 't02', ipa: 'lɤ' }] });
  assert.deepEqual(same, []);
  const tone = ipaCompare(zh, { answers: [{ term_id: 't01', ipa: 'pa˧˥' }, { term_id: 't02', ipa: 'lɤ' }] });
  assert.equal(tone[0].status, 'mismatch');
  const es = structuredClone(esDraft);
  es.terms[0].definition = 'Says where something is. /esˈtaɾ/';
  const stress = ipaCompare(es, { answers: [{ term_id: 't01', ipa: 'ˈestaɾ' }] });
  assert.equal(stress[0].status, 'stress_or_length');
  assert.equal(ipaCompare(es, { answers: [] })[0].status, 'unchecked');
});

test('findings can target a relationship by index', () => {
  const ok = { findings: [{ term_id: 'relationships[0]', field: 'description', rule: 'R-REL-01', severity: 'must_fix', quote: "translate English 'be'", problem: 'p' }] };
  assert.deepEqual(rules(validateFindings(ok, esDraft, ruleIdsFrom(rulesMd))), []);
  const bad = { findings: [{ term_id: 'relationships[5]', field: 'description', rule: 'R-REL-01', severity: 'must_fix', quote: 'x', problem: 'p' }] };
  assert.ok(has(validateFindings(bad, esDraft), 'R-FIND-01'));
});
