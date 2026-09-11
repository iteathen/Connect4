import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CAMPAIGN = path.join(ROOT, 'research/minimax/composition-campaign');
const forms = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/minimax/candidate-map/post-ledger-forms.json'), 'utf8'));
const allowPath = path.join(ROOT, 'research/minimax/candidate-map/campaign-harness-only.json');
const allow = fs.existsSync(allowPath) ? JSON.parse(fs.readFileSync(allowPath, 'utf8')) : { paths: [] };

const referenced = new Set();
for (const form of forms.forms ?? []) {
  for (const ev of form.evidence ?? []) if (ev.path?.startsWith('research/minimax/composition-campaign/')) referenced.add(ev.path);
}
const allowed = new Set(allow.paths ?? []);
const sources = fs.existsSync(CAMPAIGN)
  ? fs.readdirSync(CAMPAIGN).filter((name) => name.endsWith('.mjs')).map((name) => `research/minimax/composition-campaign/${name}`).sort()
  : [];
const unmapped = sources.filter((p) => !referenced.has(p) && !allowed.has(p));
const staleAllow = [...allowed].filter((p) => !sources.includes(p));

const out = {
  schema: 'connect4-minimax-campaign-source-coverage-v1',
  source_count: sources.length,
  candidate_evidence_source_count: sources.filter((p) => referenced.has(p)).length,
  harness_only_source_count: sources.filter((p) => allowed.has(p)).length,
  unmapped_sources: unmapped,
  stale_harness_allowlist: staleAllow,
  complete: unmapped.length === 0 && staleAllow.length === 0
};
console.log(JSON.stringify(out, null, 2));
if (process.argv.includes('--strict') && !out.complete) process.exitCode = 1;
