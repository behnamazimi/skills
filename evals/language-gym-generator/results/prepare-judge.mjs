// Prepare blind judging folders: node results/prepare-judge.mjs <runA> <runB> <outDir> [case ...]
// Writes <outDir>/<case>/{X.txt, Y.txt, brief.md} and <outDir>/mapping.json (kept away from judges).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const [runA, runB, out, ...only] = process.argv.slice(2);
const { cases } = JSON.parse(readFileSync('cases.json', 'utf8'));
const mapping = existsSync(join(out, 'mapping.json')) ? JSON.parse(readFileSync(join(out, 'mapping.json'), 'utf8')) : {};
const last = (run, id) => { const f = join(run, id, 'messages.json'); if (!existsSync(f)) return null; const m = JSON.parse(readFileSync(f, 'utf8')); return m.filter((x) => x.trim()).join('\n\n----- next message -----\n\n'); };
for (const c of cases) {
  if (only.length && !only.includes(c.id)) continue;
  if (!c.spec || c.expect.reply === 'reject' || c.expect.reply === 'question') continue;
  const a = last(runA, c.id), b = last(runB, c.id);
  if (!a || !b) continue;
  const flip = Math.random() < 0.5;
  mapping[c.id] = flip ? { X: runB, Y: runA } : { X: runA, Y: runB };
  const d = join(out, c.id); mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'X.txt'), flip ? b : a);
  writeFileSync(join(d, 'Y.txt'), flip ? a : b);
  const args = c.args.length > 300 ? c.args.slice(0, 300) + '… (an earlier glossary pasted as the exclude list)' : c.args;
  writeFileSync(join(d, 'brief.md'), [
    `# Case ${c.id}`, '', `User request (skill arguments): \`${args}\``, '',
    `Learner language: ${c.spec.learner_profile?.locale || 'en'} · target: ${c.spec.profile.locale} · level ceiling: ${c.spec.level.ceiling} · immersion: ${c.spec.immersion ? 'yes' : 'no'}`, '',
    'Case-specific criteria:', ...(c.judge.length ? c.judge.map((j) => `- ${j}`) : ['- (none beyond the general ones)']),
  ].join('\n') + '\n');
}
writeFileSync(join(out, 'mapping.json'), JSON.stringify(mapping, null, 2) + '\n');
console.log(Object.keys(mapping).length, 'cases prepared');
