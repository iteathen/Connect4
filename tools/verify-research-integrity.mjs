#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const authorityRoot='research/isograph/CONNECT4_LOGIC_AUTHORITY_1_0.md';
const nativeAuthorityRoot='research/isograph/CONNECT4_LOGIC_AUTHORITY_1_0.isg';
const manifestPath='research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_0.json';
const expectedManifestBlob='ef155699dd083ee3b24da7b7639ed7824c28281b';
const legacyDir=path.join(root,'research','canonical');
const legacyIndexPath=path.join(legacyDir,'CLAIM_INDEX.json');

function mustExist(file,label=file){
  if(!fs.existsSync(file)) throw new Error('missing '+label+': '+file);
}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function blobOf(relative){
  return execFileSync('git',['hash-object',relative],{cwd:root,encoding:'utf8'}).trim();
}

for(const p of [authorityRoot,nativeAuthorityRoot,manifestPath,'docs/decisions/2026-09-18-isograph-logic-authority.md','research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_0.md','research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md']){
  mustExist(path.join(root,p),'IsoGraph authority surface '+p);
}
if(blobOf(manifestPath)!==expectedManifestBlob) throw new Error('authority manifest mutated without a new authority revision');

const manifest=readJson(path.join(root,manifestPath));
if(manifest.authority_id!=='connect4-isograph-logic-1.0'||manifest.status!=='qualified_authority') throw new Error('unexpected IsoGraph authority manifest identity/status');
if(manifest.source_revision!=='aea692af800f524569ea1c2fda722087cd9bca39') throw new Error('unexpected frozen source revision');
if(manifest.frozen_candidate_revision!=='82366fbf406dcab11f7926ee5a9487e538003cd3') throw new Error('unexpected frozen candidate revision');
if(manifest.counts?.current_logic_documents!==77||manifest.counts?.source_objects!==125||manifest.counts?.canonical_claims!==74||manifest.counts?.semantic_items!==8517||manifest.counts?.source_native_incomplete_scope_records!==27){
  throw new Error('authority manifest count contract changed');
}

for(const entry of manifest.semantic_authority_files??[]){
  const absolute=path.join(root,entry.path);
  mustExist(absolute,'semantic authority file '+entry.path);
  const actual=blobOf(entry.path);
  if(actual!==entry.git_blob) throw new Error('qualified semantic authority file mutated: '+entry.path+' expected '+entry.git_blob+' got '+actual);
}
for(const entry of manifest.qualification_evidence??[]){
  const absolute=path.join(root,entry.path);
  mustExist(absolute,'qualification evidence '+entry.path);
  const actual=blobOf(entry.path);
  if(actual!==entry.git_blob) throw new Error('qualified evidence file mutated: '+entry.path+' expected '+entry.git_blob+' got '+actual);
}

const rootMd=fs.readFileSync(path.join(root,authorityRoot),'utf8');
if(!rootMd.includes(expectedManifestBlob)||!rootMd.includes('qualified current logic authority')) throw new Error('authority root does not pin the qualified manifest');
const rootIsg=fs.readFileSync(path.join(root,nativeAuthorityRoot),'utf8');
if(!rootIsg.includes('^97050')||!rootIsg.includes('^97059')) throw new Error('native authority root lacks qualified/promotion roles');

const bridgeText=fs.readFileSync(path.join(root,'research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md'),'utf8');
if(!bridgeText.includes('**Status:** qualified local semantic bridge')||!bridgeText.includes('35367102877')) throw new Error('local INCOMPLETE_SCOPE bridge is not qualified');

const routerFiles=['AGENT_LOCAL.md','research/AGENTS.md','research/README.md','STATUS.md','research/canonical/README.md','next_step.yaml','docs/decisions/2026-09-18-isograph-logic-authority.md'];
for(const relative of routerFiles){
  const file=path.join(root,relative);
  mustExist(file,'authority router '+relative);
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes('CONNECT4_LOGIC_AUTHORITY_1_0')) throw new Error(relative+' does not route to IsoGraph authority 1.0');
}

mustExist(legacyIndexPath,'legacy claim bridge');
const index=readJson(legacyIndexPath);
if(index.authority!=='legacy_bridge'||index.superseded_by!==authorityRoot) throw new Error('legacy claim index still presents as current authority');
if(!Array.isArray(index.registries)||index.registries.length===0) throw new Error('legacy claim bridge has no registries');
if(!Array.isArray(index.human_ledgers)||index.human_ledgers.length===0) throw new Error('legacy claim bridge has no human ledgers');
for(const ledger of index.human_ledgers) mustExist(path.join(legacyDir,ledger),'legacy human ledger '+ledger);

const allowedStatuses=new Set(['research_model','deductive_exact','guarded_exact','accepted_contract','empirically_supported','hypothesis','candidate_rule','open_question','missing_law','disproven','rejected','deferred','superseded','historical_only','untriaged']);
const claims=new Map();
const relationTargets=[];
for(const registryName of index.registries){
  const registryPath=path.join(legacyDir,registryName);
  mustExist(registryPath,'legacy registry '+registryName);
  const registry=readJson(registryPath);
  if(!Array.isArray(registry.claims)) throw new Error(registryName+' has no claims array');
  for(const claim of registry.claims){
    if(!/^C4-R\d{4}$/.test(claim.id??'')) throw new Error('invalid legacy claim id '+claim.id);
    if(claims.has(claim.id)) throw new Error('duplicate legacy claim '+claim.id);
    if(!allowedStatuses.has(claim.status)) throw new Error('unknown legacy status '+claim.id+' '+claim.status);
    if(typeof claim.statement!=='string'||claim.statement.trim()==='') throw new Error('missing legacy statement '+claim.id);
    claims.set(claim.id,registryName);
    for(const source of Array.isArray(claim.sources)?claim.sources:[]){
      if(typeof source!=='string'||source.startsWith('http://')||source.startsWith('https://')) continue;
      mustExist(path.join(root,source),'legacy claim source '+claim.id);
    }
    for(const relation of Array.isArray(claim.relations)?claim.relations:[]){
      if(typeof relation?.target==='string'&&/^C4-R\d{4}$/.test(relation.target)) relationTargets.push({from:claim.id,to:relation.target});
    }
  }
}
for(const {from,to} of relationTargets) if(!claims.has(to)) throw new Error('legacy relation '+from+' -> '+to+' has no target');

console.log(JSON.stringify({
  logicAuthority:'connect4-isograph-logic-1.0',
  researchOwner:'research/semantic-quotient',
  manifestBlob:expectedManifestBlob,
  semanticAuthorityFiles:manifest.semantic_authority_files.length,
  qualificationEvidenceFiles:manifest.qualification_evidence.length,
  frozenSourceObjects:manifest.counts.source_objects,
  frozenClaims:manifest.counts.canonical_claims,
  frozenSemanticItems:manifest.counts.semantic_items,
  sourceNativeIncompleteScope:manifest.counts.source_native_incomplete_scope_records,
  legacyRegistryShards:index.registries.length,
  legacyClaims:claims.size,
  legacyRelationsChecked:relationTargets.length
},null,2));
