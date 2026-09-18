import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SHA=process.env.GITHUB_SHA;
const MODEL=process.env.GEMINI_MODEL||'gemini-3.5-flash';
const DRY=process.env.ISOGRAPH_COLD_DRY_RUN==='1';
const MANIFEST_BLOB='0b3c54f193b084e2e5dd2eb7f4fb641b1052491a';
const manifestPath='research/isograph/successor/CONNECT4_LOGIC_CANDIDATE_MANIFEST_1_1.json';
const promptPath='research/isograph/successor/qualification/COLD_RECONSTRUCTION_PROMPT_1_1.md';
if(!SHA) throw new Error('GITHUB_SHA unavailable');
function blob(p){return execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();}
function sha256(x){return crypto.createHash('sha256').update(x).digest('hex');}
function decode(group){return Buffer.from((group.match(/#\d+/g)||[]).map(x=>Number(x.slice(1)))).toString('utf8');}
function rec(re,s){return [...s.matchAll(re)];}
if(blob(manifestPath)!==MANIFEST_BLOB) throw new Error('candidate manifest blob mismatch');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
for(const f of manifest.files){
  if(!fs.existsSync(f.path)) throw new Error('manifest file missing '+f.path);
  const got=blob(f.path);
  if(got!==f.git_blob) throw new Error('manifest file mutated '+f.path+' '+got+' != '+f.git_blob);
}
if(!fs.existsSync(promptPath)) throw new Error('prompt missing');

const generated='research/isograph/successor/generated';
const corpus=fs.readFileSync(generated+'/CONNECT4_LOGIC_CORPUS_1_1_CANDIDATE.isg','utf8');
const pathByObject=new Map(rec(/\(\^97402\s+(\d+)\s+\(([^)]*)\)\)/g,corpus).map(m=>[Number(m[1]),decode(m[2])]));
const roleByObject=new Map(rec(/\(\^97405\s+(\d+)\s+(\^\d+)\)/g,corpus).map(m=>[Number(m[1]),m[2]]));
const roleNames={'^97406':'current_logic','^97407':'current_policy_or_routing','^97408':'source_native_unresolved_logic','^97409':'normalized_evidence','^97410':'raw_evidence_or_provenance','^97411':'historical_only','^97412':'implementation_qualification','^97413':'non_logic_implementation','^97414':'classification_unresolved'};

const genManifest=JSON.parse(fs.readFileSync(generated+'/CONNECT4_LOGIC_GENERATED_MANIFEST_1_1_CANDIDATE.json','utf8'));
const textByObject=new Map();
for(const name of fs.readdirSync(generated+'/source').filter(x=>x.endsWith('.isg')).sort()){
  const s=fs.readFileSync(generated+'/source/'+name,'utf8');
  const objByImage=new Map(rec(/\(\^97415\s+(\d+)\s+(\d+)\)/g,s).map(m=>[Number(m[1]),Number(m[2])]));
  for(const m of rec(/\(\^97416\s+(\d+)\s+\(([^)]*)\)\)/g,s)){
    const image=Number(m[1]),obj=objByImage.get(image);
    if(!obj) throw new Error('native image has no object '+image);
    textByObject.set(obj,decode(m[2]));
  }
}
if(textByObject.size!==234) throw new Error('native image decode count '+textByObject.size);

const claimText=fs.readFileSync('research/isograph/CONNECT4_LOGIC_CLAIMS_0_1.isg','utf8');
const claims=rec(/\(\^97064\s+(\d+)\s+\(([^)]*)\)\)/g,claimText).map(m=>JSON.parse(decode(m[2]))).sort((a,b)=>a.id.localeCompare(b.id));
if(claims.length!==74) throw new Error('claim count '+claims.length);

function countRole(text,label){return rec(new RegExp('\\(\\'+label+'\\s+(\\d+)\\)','g'),text).length;}
const inheritedU=fs.readFileSync('research/isograph/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg','utf8');
const addedU=fs.readFileSync('research/isograph/successor/CONNECT4_LOGIC_UNCERTAINTY_1_1_CANDIDATE.isg','utf8');
const uncertainty={
  inherited_incomplete_scope:countRole(inheritedU,'^95014'),
  added_incomplete_scope:countRole(addedU,'^95014'),
  total_incomplete_scope:countRole(inheritedU,'^95014')+countRole(addedU,'^95014'),
  rendering_created_uncertainty:countRole(inheritedU,'^97069')+countRole(addedU,'^97069')
};

const lineage=JSON.parse(fs.readFileSync('research/isograph/successor/EVIDENCE_LINEAGE_GRAPH_1_1_CANDIDATE.json','utf8'));
const inventory=JSON.parse(fs.readFileSync('research/isograph/successor/CONNECT4_LOGIC_CORPUS_INVENTORY_1_1_CANDIDATE.json','utf8'));

const docs=genManifest.documents.map(d=>({
  path:d.path,
  role:d.role,
  semantic_items:d.semantic_items,
  text:textByObject.get(d.object_si)
}));
const addressed=inventory.entries.filter(e=>!textByObject.has(3000001+[...inventory.entries].sort((a,b)=>a.path.localeCompare(b.path)).findIndex(x=>x.path===e.path))).map(e=>({path:e.path,role:e.role,sha:e.sha,type:e.type}));

const view={
  candidate_manifest_blob:MANIFEST_BLOB,
  source_revision:manifest.source_revision,
  authority_state:'SUCCESSOR_CANDIDATE',
  existing_authority:'1.0',
  counts:{
    corpus_objects:genManifest.corpus_objects,
    native_images:genManifest.native_image_objects,
    content_addressed_only:genManifest.content_addressed_only_objects,
    semantic_items:genManifest.semantic_items,
    dependency_edges:manifest.dependency_closure.edges,
    missing_dependency_targets:manifest.dependency_closure.missing
  },
  role_counts:genManifest.roles,
  canonical_claims:claims,
  uncertainty,
  evidence_lineage_graph:lineage,
  native_documents:docs,
  content_addressed_objects:addressed
};

const permitted=[
  'research/isograph/authority/ISOGRAPH_CORE_0_17_QUALIFIED.md',
  'research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md',
  'research/isograph/successor/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1_CANDIDATE.md',
  'research/isograph/successor/CONNECT4_LOGIC_PROFILE_1_1_CANDIDATE.md',
  'research/isograph/successor/CONNECT4_LOGIC_NATIVE_VOCAB_1_1_CANDIDATE.md',
  'research/isograph/successor/EVIDENCE_LINEAGE_MODEL_0_1_CANDIDATE.md',
  promptPath
];
const forbidden=['COLD_ASSERTIONS_1_1','AUTHORITY_1_0_REOPEN_AUDIT','FINAL_QUALIFICATION','COLD_RECONSTRUCTION_REVIEW'];
for(const p of permitted) if(forbidden.some(x=>p.includes(x))) throw new Error('forbidden input '+p);

const chunks=[
  'CONNECT4 ISOGRAPH AUTHORITY 1.1 — ISOLATED COLD RECONSTRUCTION\n',
  'Candidate manifest blob: '+MANIFEST_BLOB+'\nWorkflow SHA: '+SHA+'\nModel: '+MODEL+'\n',
  'ISOLATION: use only this packet. Do not browse or use prior Connect4/IsoGraph migration knowledge.\n'
];
for(const p of permitted.filter(x=>x!==promptPath)) chunks.push('\n===== BEGIN PERMITTED AUTHORITY/PROFILE '+p+' =====\n'+fs.readFileSync(p,'utf8')+'\n===== END =====\n');
chunks.push('\n===== BEGIN DETERMINISTIC NATIVE-DECODED CANDIDATE =====\n'+JSON.stringify(view,null,2)+'\n===== END NATIVE-DECODED CANDIDATE =====\n');
chunks.push('\n===== BEGIN GOVERNING PROMPT =====\n'+fs.readFileSync(promptPath,'utf8')+'\n===== END GOVERNING PROMPT =====\n');
const packet=chunks.join('');

fs.mkdirSync('out/isograph-1-1-cold',{recursive:true});
fs.writeFileSync('out/isograph-1-1-cold/PACKET.txt',packet);
const packetHash=sha256(packet);
if(DRY){
  console.log(JSON.stringify({dry_run:true,manifest_blob:MANIFEST_BLOB,packet_sha256:packetHash,packet_bytes:Buffer.byteLength(packet),docs:docs.length,claims:claims.length,items:genManifest.semantic_items,lineages:lineage.lineages.length}));
  process.exit(0);
}
const key=process.env.GEMINI_API_KEY;
if(!key) throw new Error('GEMINI_API_KEY unavailable');
const request={contents:[{role:'user',parts:[{text:packet}]}],generationConfig:{candidateCount:1,maxOutputTokens:49152,temperature:0.1,thinkingConfig:{thinkingLevel:'HIGH'}}};
const url='https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent';
let status=0,responseText='',attempts=0;
for(let i=0;i<2;i++){
  attempts=i+1;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(request)});
  status=res.status;responseText=await res.text();
  if(res.ok) break;
  if(status===429) break;
  if(i===0&&[500,502,503,504].includes(status)){await new Promise(r=>setTimeout(r,20000));continue;}
  break;
}
fs.writeFileSync('out/isograph-1-1-cold/API_RESPONSE.json',responseText);
const meta={candidate_manifest_blob:MANIFEST_BLOB,workflow_sha:SHA,model:MODEL,packet_sha256:packetHash,packet_bytes:Buffer.byteLength(packet),api_attempts:attempts,http_status:status,workflow_run_id:process.env.GITHUB_RUN_ID||null};
if(!(status>=200&&status<300)){
  fs.writeFileSync('out/isograph-1-1-cold/METADATA.json',JSON.stringify({...meta,semantic_status:'PROVIDER_FAILURE'},null,2)+'\n');
  throw new Error('Gemini failed HTTP '+status);
}
const data=JSON.parse(responseText);
const raw=(data.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
fs.writeFileSync('out/isograph-1-1-cold/COLD_REPORT_RAW.txt',raw+'\n');
let jt=raw.replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'');
const a=jt.indexOf('{'),b=jt.lastIndexOf('}');if(a>=0&&b>=a)jt=jt.slice(a,b+1);
let parsed;
try{parsed=JSON.parse(jt);}catch(e){
  fs.writeFileSync('out/isograph-1-1-cold/METADATA.json',JSON.stringify({...meta,semantic_status:'MALFORMED_OUTPUT',report_sha256:sha256(raw)},null,2)+'\n');
  throw e;
}
fs.writeFileSync('out/isograph-1-1-cold/PARSED_REPORT.json',JSON.stringify(parsed,null,2)+'\n');
fs.writeFileSync('out/isograph-1-1-cold/METADATA.json',JSON.stringify({...meta,semantic_status:'FROZEN',report_sha256:sha256(raw),finish_reason:data.candidates?.[0]?.finishReason??null,usage:data.usageMetadata??null},null,2)+'\n');
console.log(JSON.stringify({status:'FROZEN',manifest_blob:MANIFEST_BLOB,packet_sha256:packetHash,report_sha256:sha256(raw),attempts}));
