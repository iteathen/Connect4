import fs from 'node:fs';

const root='research/isograph';
const uncertainty=fs.readFileSync(root+'/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg','utf8');
const claimsText=fs.readFileSync(root+'/CONNECT4_LOGIC_CLAIMS_0_1.isg','utf8');
const sourcesText=fs.readFileSync(root+'/CONNECT4_LOGIC_SOURCES_0_1.isg','utf8');
const coverage=JSON.parse(fs.readFileSync(root+'/CONNECT4_LOGIC_COVERAGE_0_1.json','utf8'));

function matches(re,s=uncertainty){return [...s.matchAll(re)];}
function decode(group){
  const bytes=(group.match(/#\d+/g)||[]).map(x=>Number(x.slice(1)));
  return Buffer.from(bytes).toString('utf8');
}
function setOf(re,s=uncertainty){return new Set(matches(re,s).map(m=>Number(m[1])));}
function mapPair(re,s=uncertainty){return new Map(matches(re,s).map(m=>[Number(m[1]),Number(m[2])]));}

const allowedQuLabels=new Set(['^95001','^95002','^95003','^95004','^95014','^95028','^95032']);
const seenQuLabels=new Set(matches(/\^95\d{3}/g).map(m=>m[0]));
for(const label of seenQuLabels) if(!allowedQuLabels.has(label)) throw new Error('broader QU role used: '+label);
for(const label of allowedQuLabels) if(!seenQuLabels.has(label) && label!=='^95003') throw new Error('expected bridge role absent: '+label);

const qStates=setOf(/\(\^95001\s+(\d+)\)/g);
const incomplete=setOf(/\(\^95014\s+(\d+)\)/g);
const sourceNative=setOf(/\(\^97068\s+(\d+)\)/g);
const sourceLimit=setOf(/\(\^97081\s+(\d+)\)/g);
const rendering=setOf(/\(\^97069\s+(\d+)\)/g);
const renderingLimit=setOf(/\(\^97082\s+(\d+)\)/g);
const documentStates=setOf(/\(\^97083\s+(\d+)\)/g);
const subjects=mapPair(/\(\^95002\s+(\d+)\s+(\d+)\)/g);
const claimLinks=new Map(matches(/\(\^97046\s+(\d+)\s+(\d+)\)/g).map(m=>[Number(m[2]),Number(m[1])]));

function sameSet(a,b,label){
  if(a.size!==b.size||[...a].some(x=>!b.has(x))) throw new Error(label+' set mismatch');
}
if(qStates.size!==27) throw new Error('expected 27 QU states, got '+qStates.size);
sameSet(qStates,incomplete,'INCOMPLETE_SCOPE');
sameSet(qStates,sourceNative,'source-native uncertainty');
sameSet(qStates,sourceLimit,'source-native limitation');
if(rendering.size!==0||renderingLimit.size!==0) throw new Error('rendering-created uncertainty present');
if(claimLinks.size!==8) throw new Error('expected 8 claim QU links, got '+claimLinks.size);
if(documentStates.size!==19) throw new Error('expected 19 document QU states, got '+documentStates.size);

const claimBySi=new Map();
for(const m of matches(/\(\^97064\s+(\d+)\s+\(([^)]*)\)\)/g,claimsText)){
  claimBySi.set(Number(m[1]),JSON.parse(decode(m[2])));
}
if(claimBySi.size!==74) throw new Error('expected 74 claims, got '+claimBySi.size);
const unresolvedStatuses=new Set(['hypothesis','candidate_rule','open_question','missing_law','untriaged']);
for(const [q,claimSi] of claimLinks){
  if(!qStates.has(q)) throw new Error('claim link points outside QU state '+q);
  const c=claimBySi.get(claimSi);
  if(!c) throw new Error('claim QU subject missing '+claimSi);
  if(!unresolvedStatuses.has(c.status)) throw new Error('claim '+c.id+' has non-unresolved status '+c.status);
  if(subjects.get(q)!==claimSi) throw new Error('claim QU subject mismatch for '+c.id);
}

const pathBySourceSi=new Map();
for(const m of matches(/\(\^97010\s+(\d+)\s+\(([^)]*)\)\)/g,sourcesText)){
  pathBySourceSi.set(Number(m[1]),decode(m[2]));
}
const expectedDocs=new Set(coverage.source_native_unresolved_documents||[]);
if(expectedDocs.size!==19) throw new Error('coverage expected unresolved-doc set is not 19');
const actualDocs=new Set();
for(const q of documentStates){
  if(!qStates.has(q)) throw new Error('document state outside QU set '+q);
  const subject=subjects.get(q);
  const path=pathBySourceSi.get(subject);
  if(!path) throw new Error('document QU source path missing for '+q+' subject '+subject);
  if(!(path.startsWith('research/hypotheses/')||path.startsWith('research/open-questions/'))) throw new Error('document QU outside hypothesis/open-question tree: '+path);
  actualDocs.add(path);
}
sameSet(actualDocs,expectedDocs,'unresolved document');

const overlap=[...documentStates].filter(q=>claimLinks.has(q));
if(overlap.length) throw new Error('claim/document QU states overlap: '+overlap.join(','));

const result={
  schema:1,
  bridge:'Connect4 INCOMPLETE_SCOPE 0.1',
  candidate:'82366fbf406dcab11f7926ee5a9487e538003cd3',
  qu_states:qStates.size,
  incomplete_scope:incomplete.size,
  source_native:sourceNative.size,
  source_native_limitations:sourceLimit.size,
  claim_records:claimLinks.size,
  document_records:documentStates.size,
  rendering_uncertainty:rendering.size,
  rendering_limitations:renderingLimit.size,
  broader_qu_roles:[...seenQuLabels].filter(x=>!allowedQuLabels.has(x)),
  claim_statuses:[...claimLinks.values()].map(si=>claimBySi.get(si).status).sort(),
  result:'QUALIFIED_LOCAL_BRIDGE'
};
console.log(JSON.stringify(result,null,2));
