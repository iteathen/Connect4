import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FROZEN='aea692af800f524569ea1c2fda722087cd9bca39';
const root='research/isograph/successor';
const gen=root+'/generated';
const inv=JSON.parse(fs.readFileSync(root+'/CONNECT4_LOGIC_CORPUS_INVENTORY_1_1_CANDIDATE.json','utf8'));
const man=JSON.parse(fs.readFileSync(gen+'/CONNECT4_LOGIC_GENERATED_MANIFEST_1_1_CANDIDATE.json','utf8'));
const lineage=JSON.parse(fs.readFileSync(root+'/EVIDENCE_LINEAGE_GRAPH_1_1_CANDIDATE.json','utf8'));
const errors=[];
function err(s){errors.push(s);}
function decode(group){return Buffer.from((group.match(/#\d+/g)||[]).map(x=>Number(x.slice(1))));}
function allFiles(dir,suffix='.isg'){return fs.readdirSync(dir).filter(x=>x.endsWith(suffix)).sort().map(x=>dir+'/'+x);}
function show(p){return execFileSync('git',['show',FROZEN+':'+p],{maxBuffer:256*1024*1024});}
function rev(p){return execFileSync('git',['rev-parse',FROZEN+':'+p],{encoding:'utf8'}).trim();}

if(inv.dependency_closure?.status!=='PASS'||inv.dependency_closure?.missing_dependency_targets!==0) err('inventory dependency closure not PASS/zero');
if(inv.entries.length!==432) err('inventory expected 432 objects got '+inv.entries.length);
if(inv.unresolved_classifications?.length) err('unresolved classifications remain '+inv.unresolved_classifications.length);
if(man.corpus_objects!==432) err('manifest corpus count '+man.corpus_objects);
if(man.native_image_objects!==234) err('manifest native image count '+man.native_image_objects);
if(man.content_addressed_only_objects!==198) err('manifest addressed-only count '+man.content_addressed_only_objects);
if(man.semantic_items!==29650) err('manifest semantic item count '+man.semantic_items);

const sorted=[...inv.entries].sort((a,b)=>a.path.localeCompare(b.path));
const expectedBySI=new Map(sorted.map((e,i)=>[3000001+i,e]));
const corpus=fs.readFileSync(gen+'/CONNECT4_LOGIC_CORPUS_1_1_CANDIDATE.isg','utf8');
const actualObjects=new Map();
for(const m of corpus.matchAll(/\(\^97401\s+(\d+)\)/g)){
  const si=Number(m[1]);
  if(actualObjects.has(si)) err('duplicate corpus SI '+si);
  actualObjects.set(si,{});
}
for(const [si,e] of expectedBySI){
  if(!actualObjects.has(si)){err('missing corpus SI '+si+' '+e.path);continue;}
  const pathM=corpus.match(new RegExp('\\(\\^97402\\s+'+si+'\\s+\\(([^)]*)\\)\\)'));
  const shaM=corpus.match(new RegExp('\\(\\^97403\\s+'+si+'\\s+\\(([^)]*)\\)\\)'));
  const roleM=corpus.match(new RegExp('\\(\\^97405\\s+'+si+'\\s+(\\^\\d+)\\)'));
  if(!pathM||decode(pathM[1]).toString('utf8')!==e.path) err('path mismatch '+si+' '+e.path);
  if(!shaM||decode(shaM[1]).toString('utf8')!==rev(e.path)) err('sha mismatch '+e.path);
  const roleLabel={
    current_logic:'^97406',current_policy_or_routing:'^97407',source_native_unresolved_logic:'^97408',
    normalized_evidence:'^97409',raw_evidence_or_provenance:'^97410',historical_only:'^97411',
    implementation_qualification:'^97412',non_logic_implementation:'^97413',classification_unresolved:'^97414'
  }[e.role];
  if(!roleM||roleM[1]!==roleLabel) err('role mismatch '+e.path);
}
if(actualObjects.size!==432) err('actual corpus SIs '+actualObjects.size);

const sourceByObject=new Map();
let nativeCount=0;
for(const p of allFiles(gen+'/source')){
  const text=fs.readFileSync(p,'utf8');
  const imageMap=new Map([...text.matchAll(/\(\^97415\s+(\d+)\s+(\d+)\)/g)].map(m=>[Number(m[1]),Number(m[2])]));
  for(const m of text.matchAll(/\(\^97416\s+(\d+)\s+\(([^)]*)\)\)/g)){
    const image=Number(m[1]),object=imageMap.get(image);
    if(!object){err('source image missing object '+image);continue;}
    if(sourceByObject.has(object)) err('duplicate native source image object '+object);
    const e=expectedBySI.get(object);
    if(!e){err('unknown native object '+object);continue;}
    const got=decode(m[2]),exp=show(e.path);
    if(!got.equals(exp)) err('source roundtrip mismatch '+e.path);
    sourceByObject.set(object,got);nativeCount++;
  }
}
if(nativeCount!==234) err('native images actual '+nativeCount);

const actualItems=new Map();
for(const p of allFiles(gen+'/items')){
  const text=fs.readFileSync(p,'utf8');
  for(const m of text.matchAll(/\(\^97420\s+(\d+)\)/g)){
    const id=Number(m[1]);
    if(actualItems.has(id)){err('duplicate item '+id);continue;}
    const om=text.match(new RegExp('\\(\\^97421\\s+'+id+'\\s+(\\d+)\\)'));
    const lm=text.match(new RegExp('\\(\\^97422\\s+'+id+'\\s+#(\\d+)\\)'));
    const sm=text.match(new RegExp('\\(\\^97423\\s+'+id+'\\s+#(\\d+)\\s+#(\\d+)\\)'));
    if(!om||!lm||!sm){err('incomplete item '+id);continue;}
    actualItems.set(id,{object:Number(om[1]),line:Number(lm[1]),start:Number(sm[1]),end:Number(sm[2])});
  }
}
const expectedItemKeys=new Set();
for(const [object,buf] of sourceByObject){
  let start=0,line=0;
  for(let i=0;i<=buf.length;i++){
    if(i!==buf.length&&buf[i]!==10) continue;
    const end=i,slice=buf.subarray(start,end);
    const nonempty=[...slice].some(b=>![9,13,32].includes(b));
    if(nonempty) expectedItemKeys.add(object+':'+line+':'+start+':'+end);
    line++;start=i+1;
  }
}
const actualItemKeys=new Set([...actualItems.values()].map(x=>x.object+':'+x.line+':'+x.start+':'+x.end));
for(const k of expectedItemKeys) if(!actualItemKeys.has(k)) err('missing item span '+k);
for(const k of actualItemKeys) if(!expectedItemKeys.has(k)) err('extra item span '+k);
if(actualItems.size!==29650) err('actual items '+actualItems.size);
if(expectedItemKeys.size!==29650) err('expected items '+expectedItemKeys.size);

const invByPath=new Map(sorted.map((e,i)=>[e.path,3000001+i]));
for(const l of lineage.lineages){
  for(const a of l.artifacts){
    const expected=invByPath.get(a.path);
    if(!expected) err('lineage artifact outside inventory '+a.path);
    if(a.object_si!==expected) err('lineage object SI mismatch '+a.path);
  }
}
const r44=lineage.lineages.find(x=>x.id==='L-BSFP-OQS-RESIDUAL-REUSE-20260911');
if(!r44) err('missing R0044 lineage');
else {
  const c=r44.motivating_counts||{};
  if(c.claim_citation_occurrences!==2||c.distinct_artifacts!==2||c.independently_countable_lineages!==1) err('R0044 2/2/1 invariant failed');
}
const r45=lineage.lineages.filter(x=>x.claims.includes('C4-R0045'));
if(r45.length!==2||r45.some(x=>!x.independence_status.includes('unknown'))) err('R0045 unknown cross-lineage independence not preserved');
for(const id of ['L-REALIZABILITY-DERIVATION-20260916','L-STRUCTURAL-SELECTION-DERIVATION-20260916']){
  const l=lineage.lineages.find(x=>x.id===id);
  if(!l||l.independence_status!=='not_applicable_deductive') err('deductive independence status wrong '+id);
}


const inheritedUncertainty=fs.readFileSync('research/isograph/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg','utf8');
const addedUncertainty=fs.readFileSync(root+'/CONNECT4_LOGIC_UNCERTAINTY_1_1_CANDIDATE.isg','utf8');
const inheritedIncomplete=new Set([...inheritedUncertainty.matchAll(/\(\^95014\s+(\d+)\)/g)].map(m=>Number(m[1])));
const addedIncomplete=new Set([...addedUncertainty.matchAll(/\(\^95014\s+(\d+)\)/g)].map(m=>Number(m[1])));
const addedSourceNative=new Set([...addedUncertainty.matchAll(/\(\^97068\s+(\d+)\)/g)].map(m=>Number(m[1])));
const addedLimit=new Set([...addedUncertainty.matchAll(/\(\^97081\s+(\d+)\)/g)].map(m=>Number(m[1])));
const addedRendering=[...addedUncertainty.matchAll(/\(\^97069\s+(\d+)\)/g)];
const addedRenderingLimit=[...addedUncertainty.matchAll(/\(\^97082\s+(\d+)\)/g)];
const addedSubjects=new Map([...addedUncertainty.matchAll(/\(\^95002\s+(\d+)\s+(\d+)\)/g)].map(m=>[Number(m[1]),Number(m[2])]));
if(inheritedIncomplete.size!==27) err('inherited INCOMPLETE_SCOPE expected 27 got '+inheritedIncomplete.size);
if(addedIncomplete.size!==4) err('added INCOMPLETE_SCOPE expected 4 got '+addedIncomplete.size);
for(const q of addedIncomplete){
  if(!addedSourceNative.has(q)||!addedLimit.has(q)) err('added QU record missing source-native/limitation '+q);
}
if(addedRendering.length||addedRenderingLimit.length) err('rendering-created uncertainty present in added records');
const expectedAddedObjects=new Set([3000328,3000344,3000372,3000374]);
const actualAddedObjects=new Set([...addedSubjects.values()]);
if(actualAddedObjects.size!==expectedAddedObjects.size||[...expectedAddedObjects].some(x=>!actualAddedObjects.has(x))) err('added QU subjects mismatch');

const result={
  schema:1,
  candidate:'connect4-isograph-logic-1.1',
  frozen_revision:FROZEN,
  dependency_closure:{objects:432,reference_edges:568,missing:0},
  corpus_objects:actualObjects.size,
  native_source_images:nativeCount,
  content_addressed_only:432-nativeCount,
  semantic_items:actualItems.size,
  expected_semantic_items:expectedItemKeys.size,
  source_roundtrip_mismatches:errors.filter(x=>x.startsWith('source roundtrip')).length,
  item_span_mismatches:errors.filter(x=>/item span/.test(x)).length,
  evidence_lineages:lineage.lineages.length,
  evidence_events:lineage.lineages.reduce((n,x)=>n+x.events.length,0),
  evidence_artifact_relations:lineage.lineages.reduce((n,x)=>n+x.artifacts.length,0),
  inherited_incomplete_scope:inheritedIncomplete.size,
  added_incomplete_scope:addedIncomplete.size,
  total_incomplete_scope:inheritedIncomplete.size+addedIncomplete.size,
  rendering_uncertainty_added:addedRendering.length,
  rendering_limitations_added:addedRenderingLimit.length,
  r0044_counts:r44?.motivating_counts??null,
  errors,
  result:errors.length?'FAIL':'PASS'
};
fs.mkdirSync('out/isograph-1-1',{recursive:true});
fs.writeFileSync('out/isograph-1-1/DETERMINISTIC_QUALIFICATION.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(errors.length) process.exit(1);
