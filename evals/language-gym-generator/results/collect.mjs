// Rebuild <case>/messages.json from reply-N.txt files for a run: node results/collect.mjs results/<run>
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const run = process.argv[2];
for (const c of readdirSync(run, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const d = join(run, c.name);
  const files = readdirSync(d).filter((x) => /^reply-\d+\.txt$/.test(x)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6)));
  if (!files.length) continue;
  writeFileSync(join(d, 'messages.json'), JSON.stringify(files.map((f) => readFileSync(join(d, f), 'utf8'))));
}
