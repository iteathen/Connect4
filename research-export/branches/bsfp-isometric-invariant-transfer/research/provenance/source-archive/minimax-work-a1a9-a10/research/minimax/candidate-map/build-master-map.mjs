import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, 'docs/research/2026-09-09-historical-107-theory-ledger.md');
const SIGNED = path.join(ROOT, 'docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json');
const FORMS = path.join(ROOT, 'research/minimax/candidate-map/post-ledger-forms.json');
const EXT = path.join(ROOT, 'research/minimax/candidate-map/campaign-form-extensions.json');
const HARNESS = path.join(ROOT, 'research/minimax/candidate-map/campaign-harness-only.json');
const ADOPTION = path.join(ROOT, 'research/minimax/candidate-map/adoption-metadata.json');
const CAMPAIGN = path.join(ROOT, 'research/minimax/composition-campaign');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function parseHistoricalLedger(md) {
  const rows = [];
  for (const line of md.split(/\r?\n/)) {
    if (!/^\|\s*\d+\s*\|/.test(line)) continue;
    const cells = line.slice(1, -1).split('|').map((x) => x.trim());
    if (cells.length < 10) continue;
    const numericId = Number(cells[0]);
    if (!Number.isInteger(numericId) || numericId < 1 || numericId > 107) continue;
    rows.push({
      id: `H${String(numericId).padStart(3, '0')}`,
      numeric_id: numericId,
      label: cells[1],
      origin: 'historical-107-ledger',
      kind: 'historical-candidate-form',
      assessment: {
        projected_effectiveness: cells[2], confidence: cells[3], evidence_summary: cells[4],
        compatibility: cells[5], synergy_overlap_summary: cells[6], leverage: cells[7],
        risk: cells[8], theoretical_assessment: cells[9]
      },
      source: 'docs/research/2026-09-09-historical-107-theory-ledger.md'
    });
  }
  rows.sort((a, b) => a.numeric_id - b.numeric_id);
  assert.equal(rows.length, 107, `expected 107 historical candidates, got ${rows.length}`);
  for (let i = 0; i < 107; i++) assert.equal(rows[i].numeric_id, i + 1, `missing historical candidate ${i + 1}`);
  return rows;
}

function relationEndpoints(edge) {
  return { source: edge.source ?? edge.from ?? edge.src ?? null, target: edge.target ?? edge.to ?? edge.dst ?? null };
}

function assertAssessmentBlind(record, where) {
  const forbidden = ['adoption', 'promotion', 'promoted', 'accepted_state', 'current_state'];
  for (const key of forbidden) assert(!(key in record), `${where} illegally embeds ${key}`);
  if (record.assessment) for (const key of forbidden) assert(!(key in record.assessment), `${where}.assessment illegally embeds ${key}`);
}

const historical = parseHistoricalLedger(fs.readFileSync(LEDGER, 'utf8'));
const signed = readJson(SIGNED);
const supplement = readJson(FORMS);
const extension = readJson(EXT);
const harnessOnly = readJson(HARNESS);
const adoption = readJson(ADOPTION);

assert.equal(signed.schema, 'signed-interaction-graph-terminalization-v2');
assert(Array.isArray(signed.nodes) && signed.nodes.length > 0, 'signed graph nodes missing');
assert(Array.isArray(signed.edges), 'signed graph edges missing');
assert(Array.isArray(supplement.forms), 'post-ledger forms missing');
assert(Array.isArray(supplement.observed_relations), 'post-ledger relations missing');
assert(Array.isArray(extension.forms), 'campaign extension forms missing');
assert(extension.evidence_augmentations && typeof extension.evidence_augmentations === 'object', 'campaign evidence augmentations missing');
assert(extension.observed_relations === undefined || Array.isArray(extension.observed_relations), 'campaign extension relations invalid');

const forms = [...supplement.forms, ...extension.forms].map((f) => structuredClone(f));
const byForm = new Map(forms.map((f) => [f.id, f]));
for (const [id, evidence] of Object.entries(extension.evidence_augmentations)) {
  const form = byForm.get(id);
  assert(form, `evidence augmentation target not found: ${id}`);
  form.evidence = [...(form.evidence ?? []), ...evidence];
}
const observedRelations = [...supplement.observed_relations, ...(extension.observed_relations ?? [])];

for (const x of historical) assertAssessmentBlind(x, x.id);
for (const x of forms) assertAssessmentBlind(x, x.id);

const historicalIds = new Set(historical.map((x) => x.id));
const strategicIds = new Set();
for (const node of signed.nodes) {
  assert(node.id && typeof node.id === 'string', 'signed graph node missing id');
  assert(!strategicIds.has(node.id), `duplicate signed graph node ${node.id}`);
  strategicIds.add(node.id);
}

const formIds = new Set();
for (const form of forms) {
  assert(form.id && form.mechanism && form.label, `invalid form ${JSON.stringify(form)}`);
  assert(!historicalIds.has(form.id) && !strategicIds.has(form.id), `form collides with existing id ${form.id}`);
  assert(!formIds.has(form.id), `duplicate form ${form.id}`);
  formIds.add(form.id);
}

const syntheticMechanisms = new Set();
for (const form of forms) if (!strategicIds.has(form.mechanism) && !historicalIds.has(form.mechanism) && !formIds.has(form.mechanism)) syntheticMechanisms.add(form.mechanism);
const allIds = new Set([...historicalIds, ...strategicIds, ...formIds, ...syntheticMechanisms]);

for (const edge of [...signed.edges, ...observedRelations]) {
  const { source, target } = relationEndpoints(edge);
  if (source !== null) assert(allIds.has(source), `relation source not found: ${source}`);
  if (target !== null) assert(allIds.has(target), `relation target not found: ${target}`);
}
for (const key of Object.keys(adoption.entries ?? {})) assert(allIds.has(key), `adoption metadata refers to unknown candidate ${key}`);

const referencedCampaign = new Set();
for (const form of forms) for (const ev of form.evidence ?? []) if (ev.path?.startsWith('research/minimax/composition-campaign/')) referencedCampaign.add(ev.path);
const allowedHarness = new Set(harnessOnly.paths ?? []);
const campaignSources = fs.existsSync(CAMPAIGN)
  ? fs.readdirSync(CAMPAIGN).filter((name) => name.endsWith('.mjs')).map((name) => `research/minimax/composition-campaign/${name}`).sort()
  : [];
const unmappedCampaign = campaignSources.filter((p) => !referencedCampaign.has(p) && !allowedHarness.has(p));
const staleHarness = [...allowedHarness].filter((p) => !campaignSources.includes(p));
assert.deepEqual(unmappedCampaign, [], `unmapped active campaign sources:\n${unmappedCampaign.join('\n')}`);
assert.deepEqual(staleHarness, [], `stale campaign harness allowlist entries:\n${staleHarness.join('\n')}`);

const evidenceMap = {
  schema: 'connect4-minimax-master-candidate-map-v1',
  generated_at: new Date().toISOString(),
  bias_policy: supplement.bias_policy,
  source_layers: {
    historical_ledger: 'docs/research/2026-09-09-historical-107-theory-ledger.md',
    signed_interaction_graph: 'docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json',
    post_ledger_forms: 'research/minimax/candidate-map/post-ledger-forms.json',
    campaign_form_extensions: 'research/minimax/candidate-map/campaign-form-extensions.json',
    campaign_harness_only: 'research/minimax/candidate-map/campaign-harness-only.json'
  },
  historical_candidates: historical,
  strategic_mechanisms: signed.nodes,
  synthetic_mechanisms: [...syntheticMechanisms].sort().map((id) => ({ id, origin: 'post-ledger-derived-mechanism' })),
  post_ledger_forms: forms,
  relations: {
    inherited_signed_graph: signed.edges,
    post_ledger_observed: observedRelations,
    missing_edge_semantics: 'unassessed-not-neutral'
  },
  noncandidate_harness_sources: harnessOnly
};

const joined = structuredClone(evidenceMap);
joined.adoption_metadata = { governing_rule: adoption.governing_rule, default: adoption.default, entries: adoption.entries };

function testBucket(state = '') {
  const s = String(state).toLowerCase();
  if (s.includes('active') || s.includes('unfinished') || s.includes('open')) return 'active-or-open';
  if (s.includes('invalid')) return 'invalid-form';
  if (s.includes('qualified')) return 'qualified';
  if (s.includes('crossed')) return 'crossed';
  if (!s) return 'unspecified';
  return 'other';
}
const testBuckets = {};
for (const f of forms) testBuckets[testBucket(f.test_state)] = (testBuckets[testBucket(f.test_state)] ?? 0) + 1;
const openForms = forms.filter((f) => testBucket(f.test_state) === 'active-or-open').map((f) => ({ id: f.id, label: f.label, test_state: f.test_state }));
const adoptedOpenForms = openForms.filter((f) => (adoption.entries?.[f.id]?.state ?? adoption.default?.state ?? 'unclassified') !== 'unclassified');

const coverage = {
  schema: 'connect4-minimax-candidate-map-coverage-v1',
  historical_candidate_count: historical.length,
  historical_ids_complete: true,
  signed_graph_node_count: signed.nodes.length,
  signed_graph_edge_count: signed.edges.length,
  post_ledger_form_count: forms.length,
  post_ledger_relation_count: observedRelations.length,
  synthetic_mechanism_count: syntheticMechanisms.size,
  total_unique_ids: allIds.size,
  campaign_source_count: campaignSources.length,
  campaign_candidate_evidence_source_count: campaignSources.filter((p) => referencedCampaign.has(p)).length,
  campaign_harness_only_source_count: campaignSources.filter((p) => allowedHarness.has(p)).length,
  unmapped_campaign_sources: unmappedCampaign,
  test_state_buckets: testBuckets,
  open_or_active_forms: openForms,
  adopted_but_open_or_active_forms: adoptedOpenForms,
  adoption_is_excluded_from_assessment: true,
  missing_relation_semantics: 'unassessed-not-neutral',
  completeness_statement: 'Complete over all 107 historical rows, all signed-v2 nodes/edges, all enumerated post-ledger forms/relations, and every current composition-campaign executable source classified as candidate evidence or harness-only.'
};

const args = new Set(process.argv.slice(2));
if (args.has('--write')) {
  const outDir = process.env.CANDIDATE_MAP_OUT ?? path.join(ROOT, 'research/minimax/candidate-map/generated');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'master-candidate-map.json'), JSON.stringify(joined, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'coverage-report.json'), JSON.stringify(coverage, null, 2) + '\n');
}
console.log(JSON.stringify(coverage, null, 2));
