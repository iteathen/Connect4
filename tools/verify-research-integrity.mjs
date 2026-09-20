#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();

const authorityRoot='research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md';
const nativeAuthorityRoot='research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.isg';
const manifestPath='research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json';
const expectedManifestBlob='5f401c93f8ea653fd3bc96e386b08ef7d92c519e';

const predecessorManifestPath='research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json';
const expectedPredecessorManifestBlob='986f10a0011059e4d19598de6c836272c102415d';
const historicalManifestPath='research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_0.json';
const expectedHistoricalManifestBlob='ef155699dd083ee3b24da7b7639ed7824c28281b';
const historicalAuthorityRoot='research/isograph/CONNECT4_LOGIC_AUTHORITY_1_0.md';

const hotLoopAuthority='research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md';
const neesRealizationAuthority='research/isograph/optimization/ISOMAX_HOT_LOOP_NEES_REALIZATION_AUTHORITY_0_1.md';
const neesRevision='0294f37909e9a5b7a2202d3a9367a9e2428d47b3';

const legacyDir=path.join(root,'research','canonical');
const legacyIndexPath=path.join(legacyDir,'CLAIM_INDEX.json');

function mustExist(file,label=file){
  if(!fs.existsSync(file)) throw new Error('missing '+label+': '+file);
}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function blobOf(relative){
  return execFileSync('git',['hash-object',relative],{cwd:root,encoding:'utf8'}).trim();
}
function verifyPinned(entry,label){
  const absolute=path.join(root,entry.path);
  mustExist(absolute,label+' '+entry.path);
  const actual=blobOf(entry.path);
  if(actual!==entry.git_blob) throw new Error(label+' mutated: '+entry.path+' expected '+entry.git_blob+' got '+actual);
}

for(const p of [
  authorityRoot,
  nativeAuthorityRoot,
  manifestPath,
  predecessorManifestPath,
  historicalManifestPath,
  historicalAuthorityRoot,
  'docs/decisions/2026-09-19-isograph-logic-authority-1-2.md',
  'research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md',
  hotLoopAuthority,
  neesRealizationAuthority,
]){
  mustExist(path.join(root,p),'IsoGraph authority surface '+p);
}

if(blobOf(manifestPath)!==expectedManifestBlob) throw new Error('current authority 1.2 manifest mutated without a new authority revision');
if(blobOf(predecessorManifestPath)!==expectedPredecessorManifestBlob) throw new Error('historical authority 1.1 manifest mutated');
if(blobOf(historicalManifestPath)!==expectedHistoricalManifestBlob) throw new Error('historical authority 1.0 manifest mutated');

const manifest=readJson(path.join(root,manifestPath));
if(manifest.authority_id!=='connect4-isograph-logic-1.2'||manifest.status!=='qualified_authority'){
  throw new Error('unexpected current IsoGraph authority manifest identity/status');
}
if(manifest.predecessor?.authority_id!=='connect4-isograph-logic-1.1'||
   manifest.predecessor?.manifest_blob!==expectedPredecessorManifestBlob||
   manifest.predecessor?.disposition!=='historical_qualified_authority'){
  throw new Error('authority 1.2 predecessor contract changed');
}
if(manifest.claim_coverage?.total!==93||manifest.claim_coverage?.uncovered!==0){
  throw new Error('authority 1.2 claim-coverage contract changed');
}
if(manifest.identity_model?.q_o!=='orientation_sensitive_ordinary_future_behavior_carrier'||
   manifest.identity_model?.q_r!=='horizontal_reflection_orbit_quotient'||
   manifest.identity_model?.proof_identity_from_q!==false){
  throw new Error('authority 1.2 identity boundary changed');
}

for(const entry of manifest.semantic_package??[]) verifyPinned(entry,'qualified semantic package file');
for(const entry of manifest.qualified_relations??[]) verifyPinned(entry,'qualified relation/evidence file');
verifyPinned(manifest.final_qualification,'final qualification file');
verifyPinned(manifest.separate_non_gameplay_authority,'separate non-gameplay hot-loop authority');

if(manifest.final_qualification?.disposition!=='QUALIFIES_FOR_AUTHORITY_PROMOTION'){
  throw new Error('authority 1.2 final qualification is not promotable');
}
if(manifest.separate_non_gameplay_authority?.path!==hotLoopAuthority||
   manifest.separate_non_gameplay_authority?.gameplay_authority_effect!=='none'){
  throw new Error('hot-loop authority no-gameplay boundary changed');
}

const rootMd=fs.readFileSync(path.join(root,authorityRoot),'utf8');
if(!rootMd.includes(expectedManifestBlob)||!rootMd.includes('qualified current game-theory / logic authority')){
  throw new Error('authority 1.2 root does not pin the qualified manifest/status');
}
const rootIsg=fs.readFileSync(path.join(root,nativeAuthorityRoot),'utf8');
if(!rootIsg.includes('^97050')||!rootIsg.includes('^97059')){
  throw new Error('native authority 1.2 root lacks qualified/promotion roles');
}

const neesText=fs.readFileSync(path.join(root,neesRealizationAuthority),'utf8');
if(!neesText.includes(neesRevision)||
   !neesText.includes('Gameplay authority: none')||
   !neesText.includes('Graph-semantic authority effect: none')){
  throw new Error('NEES hot-loop realization authority does not preserve the required non-gameplay boundary/pin');
}

const routerFiles=[
  'AGENT_LOCAL.md',
  'research/AGENTS.md',
  'research/README.md',
  'STATUS.md',
  'research/canonical/README.md',
  'next_step.yaml',
  'docs/decisions/2026-09-19-isograph-logic-authority-1-2.md',
];
for(const relative of routerFiles){
  const file=path.join(root,relative);
  mustExist(file,'authority router '+relative);
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes('CONNECT4_LOGIC_AUTHORITY_1_2')){
    throw new Error(relative+' does not route to current IsoGraph authority 1.2');
  }
}

mustExist(legacyIndexPath,'legacy claim bridge');
const index=readJson(legacyIndexPath);
if(index.authority!=='legacy_bridge'||index.superseded_by!==historicalAuthorityRoot){
  throw new Error('legacy claim index no longer preserves its historical 1.0 bridge disposition');
}
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
      if(typeof relation?.target==='string'&&/^C4-R\d{4}$/.test(relation.target)){
        relationTargets.push({from:claim.id,to:relation.target});
      }
    }
  }
}
for(const {from,to} of relationTargets){
  if(!claims.has(to)) throw new Error('legacy relation '+from+' -> '+to+' has no target');
}

console.log(JSON.stringify({
  logicAuthority:'connect4-isograph-logic-1.2',
  researchOwner:'research/semantic-quotient',
  manifestBlob:expectedManifestBlob,
  semanticPackageFiles:manifest.semantic_package.length,
  qualifiedRelations:manifest.qualified_relations.length,
  authorityClaims:manifest.claim_coverage.total,
  authorityUncoveredClaims:manifest.claim_coverage.uncovered,
  hotLoopAuthority:manifest.separate_non_gameplay_authority.path,
  neesRealizationAuthority,
  neesRevision,
  historicalAuthorityManifestsPreserved:['1.1','1.0'],
  legacyRegistryShards:index.registries.length,
  legacyClaims:claims.size,
  legacyRelationsChecked:relationTargets.length
},null,2));
