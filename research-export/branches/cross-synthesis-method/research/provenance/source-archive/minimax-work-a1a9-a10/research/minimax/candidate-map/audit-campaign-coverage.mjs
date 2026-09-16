import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CAMPAIGN = path.join(ROOT, 'research/minimax/composition-campaign');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/minimax/candidate-map/post-ledger-forms.json'), 'utf8'));
const ext = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/minimax/candidate-map/campaign-form-extensions.json'), 'utf8'));
const allow = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/minimax/candidate-map/campaign-harness-only.json'), 'utf8'));

const forms = [...(base.forms ?? []), ...(ext.forms ?? [])].map((f) => structuredClone(f));
const byId = new Map(forms.map((f) => [f.id, f]));
for (const [id, evidence] of Object.entries(ext.evidence_augmentations ?? {})) {
  const f = byId.get(id);
  if (!f) throw new Error(`unknown evidence augmentation target ${id}`);
  f.evidence = [...(f.evidence ?? []), ...evidence];
}

const referenced = new Set();
for (const form of forms) for (const ev of form.evidence ?? []) if (ev.path?.startsWith('research/minimax/composition-campaign/')) referenced.add(ev.path);
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
