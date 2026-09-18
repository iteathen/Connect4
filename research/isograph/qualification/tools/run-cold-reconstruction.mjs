import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SHA=process.env.GITHUB_SHA;
const MODEL=process.env.GEMINI_MODEL||'gemini-3.5-flash';
const DRY=process.env.ISOGRAPH_COLD_DRY_RUN==='1';
if(!SHA) throw new Error('GITHUB_SHA unavailable');

const root='research/isograph';
const authority=[
  [root+'/authority/ISOGRAPH_CORE_0_17_QUALIFIED.md','fb47f8de1bd70d6f9fe1d4cf5181a52018ce8e04'],
  [root+'/authority/QU_0_1_CANDIDATE.md','745173425a647609db99ddb11530c28cc279ada8'],
  [root+'/authority/QU_NATIVE_VOCAB_0_1.md','ed592ac491a291c061098e8a4392c194ad05b565'],
  [root+'/authority/QU_VOCAB_0_1.isg','714fc68b5a264c90749bc94a8efd2a9c2d17b22d']
];
const sourceParts=Array.from({length:6},(_,i)=>root+'/source/CONNECT4_LOGIC_SOURCE_IMAGE_0_1_PART_'+String(i+1).padStart(2,'0')+'.isg');
const itemParts=Array.from({length:6},(_,i)=>root+'/items/CONNECT4_LOGIC_ITEMS_0_1_PART_'+String(i+1).padStart(2,'0')+'.isg');
const candidate=[
  root+'/CONNECT4_LOGIC_PROFILE_0_1.md',
  root+'/CONNECT4_LOGIC_NATIVE_VOCAB_0_1.md',
  root+'/CONNECT4_LOGIC_VOCAB_0_1.isg',
  root+'/CONNECT4_LOGIC_BUNDLE_0_1.isg',
  root+'/CONNECT4_LOGIC_QUALIFICATION_0_1.isg',
  root+'/CONNECT4_LOGIC_CLAIMS_0_1.isg',
  root+'/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg',
  root+'/CONNECT4_LOGIC_SOURCES_0_1.isg',
  ...sourceParts,...itemParts
];
const promptPath=root+'/qualification/COLD_RECONSTRUCTION_PROMPT_0_1.md';
const forbidden=[
  root+'/qualification/COLD_ASSERTIONS_0_1.json',
  'research/canonical/','docs/specs/','STATUS.md','AGENT_LOCAL.md','next_step.yaml'
];
function frozen(p){
  if(forbidden.some(x=>p===x||p.startsWith(x))) throw new Error('forbidden cold input '+p);
  return execFileSync('git',['show',SHA+':'+p],{encoding:'utf8',maxBuffer:128*1024*1024});
}
function hashObject(text){
  return execFileSync('git',['hash-object','--stdin'],{input:text,encoding:'utf8'}).trim();
}
function sha256(text){return crypto.createHash('sha256').update(text).digest('hex');}
function decodeBytes(group){
  const a=(group.match(/#\d+/g)||[]).map(x=>Number(x.slice(1)));
  return Buffer.from(a).toString('utf8');
}
function rec(pattern,text){
  const out=[]; let m; pattern.lastIndex=0;
  while((m=pattern.exec(text))) out.push(m);
  return out;
}

for(const [p,expected] of authority){
  const text=frozen(p); const got=hashObject(text);
  if(got!==expected) throw new Error('authority mirror mismatch '+p+' '+got);
}

const sources=frozen(root+'/CONNECT4_LOGIC_SOURCES_0_1.isg');
const sourcePath=new Map(rec(/\(\^97010\s+(\d+)\s+\(([^)]*)\)\)/g,sources).map(m=>[Number(m[1]),decodeBytes(m[2])]));

const docToSource=new Map(), docText=new Map();
for(const p of sourceParts){
  const s=frozen(p);
  for(const m of rec(/\(\^97089\s+(\d+)\s+(\d+)\)/g,s)) docToSource.set(Number(m[1]),Number(m[2]));
  for(const m of rec(/\(\^97090\s+(\d+)\s+\(([^)]*)\)\)/g,s)) docText.set(Number(m[1]),decodeBytes(m[2]));
}
if(docText.size!==77) throw new Error('expected 77 native source images, got '+docText.size);

const claimsText=frozen(root+'/CONNECT4_LOGIC_CLAIMS_0_1.isg');
const claims=rec(/\(\^97064\s+(\d+)\s+\(([^)]*)\)\)/g,claimsText)
  .map(m=>JSON.parse(decodeBytes(m[2])))
  .sort((a,b)=>a.id.localeCompare(b.id));
if(claims.length!==74) throw new Error('expected 74 native claims, got '+claims.length);

const itemById=new Map(), classById=new Map(), claimLinks=new Map(), quLinks=new Map(), sectionCounts=new Map();
for(const p of itemParts){
  const s=frozen(p);
  for(const m of rec(/\(\^97111\s+(\d+)\s+(\d+)\)/g,s)) itemById.set(Number(m[1]),Number(m[2]));
  for(const m of rec(/\(\^97114\s+(\d+)\s+(\^\d+)\)/g,s)) classById.set(Number(m[1]),m[2]);
  for(const m of rec(/\(\^97112\s+(\d+)\s+(\d+)\)/g,s)){
    const id=Number(m[1]); const a=claimLinks.get(id)||[]; a.push(Number(m[2])); claimLinks.set(id,a);
  }
  for(const m of rec(/\(\^97113\s+(\d+)\s+(\d+)\)/g,s)){
    const id=Number(m[1]); const a=quLinks.get(id)||[]; a.push(Number(m[2])); quLinks.set(id,a);
  }
  for(const m of rec(/\(\^97120\s+\d+\s+(\d+)\s+#\d+\)/g,s)) sectionCounts.set(Number(m[1]),(sectionCounts.get(Number(m[1]))||0)+1);
}
if(itemById.size!==8517) throw new Error('expected 8517 native items, got '+itemById.size);

const classNames={'^97115':'heading','^97116':'code','^97117':'list','^97118':'table','^97119':'prose_or_data'};
const docSummary=new Map();
for(const [item,doc] of itemById){
  const d=docSummary.get(doc)||{items:0,sections:0,classes:{},claim_sis:new Set(),qu_sis:new Set()};
  d.items++;
  const c=classNames[classById.get(item)]||classById.get(item)||'unknown';
  d.classes[c]=(d.classes[c]||0)+1;
  for(const x of claimLinks.get(item)||[]) d.claim_sis.add(x);
  for(const x of quLinks.get(item)||[]) d.qu_sis.add(x);
  docSummary.set(doc,d);
}
for(const [doc,n] of sectionCounts){const d=docSummary.get(doc); if(d)d.sections=n;}

const uncertainty=frozen(root+'/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg');
const reasons=new Map(rec(/\(\^97067\s+(\d+)\s+\(([^)]*)\)\)/g,uncertainty).map(m=>[Number(m[1]),decodeBytes(m[2])]));
const quClaim=new Map(rec(/\(\^97046\s+(\d+)\s+(\d+)\)/g,uncertainty).map(m=>[Number(m[2]),Number(m[1])]));
const incomplete=new Set(rec(/\(\^95014\s+(\d+)\)/g,uncertainty).map(m=>Number(m[1])));
const uncertaintySummary=[...incomplete].sort((a,b)=>a-b).map(q=>({qu_si:q,claim_si:quClaim.get(q)||null,reason:reasons.get(q)||null}));

const docs=[...docText.keys()].sort((a,b)=>a-b).map(doc=>{
  const src=docToSource.get(doc), d=docSummary.get(doc)||{items:0,sections:0,classes:{},claim_sis:new Set(),qu_sis:new Set()};
  return {
    document_si:doc,source_si:src,path:sourcePath.get(src)||null,
    item_count:d.items,section_count:d.sections,classes:d.classes,
    claim_sis:[...d.claim_sis].sort((a,b)=>a-b),qu_sis:[...d.qu_sis].sort((a,b)=>a-b),
    reconstructed_text:docText.get(doc)
  };
});

const manifest=[];
for(const p of [...authority.map(x=>x[0]),...candidate,promptPath]){
  const t=frozen(p); manifest.push({path:p,git_blob:hashObject(t),sha256:sha256(t),bytes:Buffer.byteLength(t)});
}
const nativeView={
  frozen_candidate_sha:SHA,
  source_revision:'aea692af800f524569ea1c2fda722087cd9bca39',
  authority_state:'AUTHORITY_CANDIDATE',
  counts:{current_logic_documents:docs.length,source_objects:125,canonical_claims:claims.length,semantic_items:itemById.size},
  canonical_claims:claims,
  native_uncertainty:uncertaintySummary,
  item_topology:docs.map(({reconstructed_text,...x})=>x),
  reconstructed_documents:docs.map(x=>({document_si:x.document_si,path:x.path,text:x.reconstructed_text}))
};

const chunks=[
  'CONNECT4 ISOGRAPH — ISOLATED COLD RECONSTRUCTION\n',
  'Frozen candidate SHA: '+SHA+'\nModel: '+MODEL+'\n\n',
  'ISOLATION: This packet was built only from the native IsoGraph candidate and pinned authority mirrors. Do not browse or use prior Connect4 knowledge.\n'
];
for(const [p] of authority) chunks.push('\n===== BEGIN PINNED AUTHORITY '+p+' =====\n'+frozen(p)+'\n===== END PINNED AUTHORITY =====\n');
for(const p of [root+'/CONNECT4_LOGIC_PROFILE_0_1.md',root+'/CONNECT4_LOGIC_NATIVE_VOCAB_0_1.md']){
  chunks.push('\n===== BEGIN CANDIDATE PROFILE '+p+' =====\n'+frozen(p)+'\n===== END CANDIDATE PROFILE =====\n');
}
chunks.push('\n===== BEGIN DETERMINISTIC NATIVE-DECODED VIEW =====\n'+JSON.stringify(nativeView,null,2)+'\n===== END DETERMINISTIC NATIVE-DECODED VIEW =====\n');
chunks.push('\n===== BEGIN GOVERNING PROMPT =====\n'+frozen(promptPath)+'\n===== END GOVERNING PROMPT =====\n');
const packet=chunks.join('');

fs.mkdirSync('out/isograph-cold',{recursive:true});
fs.writeFileSync('out/isograph-cold/PACKET.txt',packet);
fs.writeFileSync('out/isograph-cold/INPUT_MANIFEST.json',JSON.stringify(manifest,null,2)+'\n');
const packetHash=sha256(packet);
if(DRY){
  console.log(JSON.stringify({dry_run:true,packet_sha256:packetHash,packet_bytes:Buffer.byteLength(packet),claims:claims.length,docs:docs.length,items:itemById.size,uncertainty_records:uncertaintySummary.length}));
  process.exit(0);
}

const API_KEY=process.env.GEMINI_API_KEY;
if(!API_KEY) throw new Error('GEMINI_API_KEY unavailable');
const request={contents:[{role:'user',parts:[{text:packet}]}],generationConfig:{candidateCount:1,maxOutputTokens:49152,temperature:0.1,thinkingConfig:{thinkingLevel:'HIGH'}}};
const url='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent';
let status=0,responseText='',attempts=0;
for(let i=0;i<2;i++){
  attempts=i+1;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':API_KEY},body:JSON.stringify(request)});
  status=res.status; responseText=await res.text();
  if(res.ok) break;
  if(status===429) break;
  if(i===0 && [500,502,503,504].includes(status)){await new Promise(r=>setTimeout(r,20000));continue;}
  break;
}
fs.writeFileSync('out/isograph-cold/API_RESPONSE.json',responseText);
const baseMeta={model:MODEL,candidate_sha:SHA,packet_sha256:packetHash,packet_bytes:Buffer.byteLength(packet),api_attempts:attempts,http_status:status,workflow_run_id:process.env.GITHUB_RUN_ID||null,input_manifest:manifest};
if(!(status>=200&&status<300)){
  fs.writeFileSync('out/isograph-cold/METADATA.json',JSON.stringify({...baseMeta,semantic_status:'PROVIDER_FAILURE'},null,2)+'\n');
  throw new Error('Gemini failed HTTP '+status);
}
const data=JSON.parse(responseText);
const raw=(data.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
fs.writeFileSync('out/isograph-cold/COLD_REPORT_RAW.txt',raw+'\n');
let jt=raw.replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'');
const a=jt.indexOf('{'),b=jt.lastIndexOf('}'); if(a>=0&&b>=a) jt=jt.slice(a,b+1);
let parsed;
try{parsed=JSON.parse(jt);}catch(e){
  fs.writeFileSync('out/isograph-cold/METADATA.json',JSON.stringify({...baseMeta,semantic_status:'MALFORMED_OUTPUT',report_sha256:sha256(raw)},null,2)+'\n');
  throw e;
}
fs.writeFileSync('out/isograph-cold/PARSED_REPORT.json',JSON.stringify(parsed,null,2)+'\n');
fs.writeFileSync('out/isograph-cold/METADATA.json',JSON.stringify({...baseMeta,semantic_status:'FROZEN',report_sha256:sha256(raw),finish_reason:data.candidates?.[0]?.finishReason??null,usage:data.usageMetadata??null},null,2)+'\n');
console.log(JSON.stringify({status:'FROZEN',packet_sha256:packetHash,report_sha256:sha256(raw),attempts}));
