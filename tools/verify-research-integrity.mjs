#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonicalDir = path.join(root, 'research', 'canonical');
const indexPath = path.join(canonicalDir, 'CLAIM_INDEX.json');
const allowedStatuses = new Set([
  'research_model','deductive_exact','guarded_exact','accepted_contract',
  'empirically_supported','hypothesis','candidate_rule','open_question',
  'missing_law','disproven','rejected','deferred','superseded',
  'historical_only','untriaged'
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function mustExist(file, label=file) {
  if (!fs.existsSync(file)) throw new Error(`missing ${label}: ${file}`);
}

mustExist(indexPath, 'claim index');
const index = readJson(indexPath);
if (!Array.isArray(index.registries) || index.registries.length === 0) {
  throw new Error('CLAIM_INDEX.json has no registries');
}
if (!Array.isArray(index.human_ledgers) || index.human_ledgers.length === 0) {
  throw new Error('CLAIM_INDEX.json has no human ledgers');
}

for (const ledger of index.human_ledgers) {
  mustExist(path.join(canonicalDir, ledger), `human ledger ${ledger}`);
}

const claims = new Map();
const relationTargets = [];
for (const registryName of index.registries) {
  const registryPath = path.join(canonicalDir, registryName);
  mustExist(registryPath, `registry ${registryName}`);
  const registry = readJson(registryPath);
  if (!Array.isArray(registry.claims)) throw new Error(`${registryName} has no claims array`);

  for (const claim of registry.claims) {
    if (!/^C4-R\d{4}$/.test(claim.id ?? '')) {
      throw new Error(`invalid claim id in ${registryName}: ${claim.id}`);
    }
    if (claims.has(claim.id)) {
      throw new Error(`duplicate claim id ${claim.id} in ${registryName} and ${claims.get(claim.id)}`);
    }
    if (!allowedStatuses.has(claim.status)) {
      throw new Error(`unknown status for ${claim.id}: ${claim.status}`);
    }
    if (typeof claim.statement !== 'string' || claim.statement.trim() === '') {
      throw new Error(`missing statement for ${claim.id}`);
    }
    claims.set(claim.id, registryName);

    if (Array.isArray(claim.sources)) {
      for (const source of claim.sources) {
        if (typeof source !== 'string' || source.startsWith('http://') || source.startsWith('https://')) continue;
        mustExist(path.join(root, source), `source for ${claim.id}`);
      }
    }

    if (Array.isArray(claim.relations)) {
      for (const relation of claim.relations) {
        if (typeof relation?.target === 'string' && /^C4-R\d{4}$/.test(relation.target)) {
          relationTargets.push({from:claim.id,to:relation.target});
        }
      }
    }
  }
}

for (const {from,to} of relationTargets) {
  if (!claims.has(to)) throw new Error(`claim relation ${from} -> ${to} has no target claim`);
}

// Canonical research validates its branch-local authority surfaces. The repository-wide
// REPOSITORY_STRUCTURE.md router is owned on main and is not a dependency of this branch.
// Canonical research validates its branch-local authority surfaces. The repository-wide
// REPOSITORY_STRUCTURE.md router is owned on main and is not a dependency of this branch.
const authorityFiles = [
  'AGENT_LOCAL.md',
  'research/AGENTS.md',
  'research/README.md',
  'STATUS.md',
  'docs/decisions/2026-09-17-single-research-owner.md'
];
for (const relative of authorityFiles) {
  const file = path.join(root, relative);
  mustExist(file, `research authority ${relative}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('research/semantic-quotient')) {
    throw new Error(`${relative} does not name canonical research owner`);
  }
  if (/research\/unified-knowledge/.test(text) && !relative.startsWith('docs/decisions/')) {
    throw new Error(`${relative} contains superseded research/unified-knowledge routing`);
  }
}

console.log(JSON.stringify({
  researchOwner:'research/semantic-quotient',
  registryShards:index.registries.length,
  claims:claims.size,
  checkedRelations:relationTargets.length,
  humanLedgers:index.human_ledgers.length,
  authorityFiles:authorityFiles.length
}, null, 2));
