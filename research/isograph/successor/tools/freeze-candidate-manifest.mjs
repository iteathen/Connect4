import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const root='research/isograph';
const successor=root+'/successor';
const exact=[
  root+'/authority/ISOGRAPH_CORE_0_17_QUALIFIED.md',
  root+'/authority/QU_0_1_CANDIDATE.md',
  root+'/authority/QU_NATIVE_VOCAB_0_1.md',
  root+'/authority/QU_VOCAB_0_1.isg',
  root+'/CONNECT4_LOGIC_NATIVE_VOCAB_0_1.md',
  root+'/CONNECT4_LOGIC_VOCAB_0_1.isg',
  root+'/CONNECT4_LOGIC_CLAIMS_0_1.isg',
  root+'/CONNECT4_LOGIC_UNCERTAINTY_0_1.isg',
  root+'/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md',
  successor+'/CONNECT4_LOGIC_PROFILE_1_1_CANDIDATE.md',
  successor+'/CONNECT4_LOGIC_NATIVE_VOCAB_1_1_CANDIDATE.md',
  successor+'/CONNECT4_LOGIC_VOCAB_1_1_CANDIDATE.isg',
  successor+'/CONNECT4_LOGIC_CORPUS_INVENTORY_1_1_CANDIDATE.json',
  successor+'/CONNECT4_LOGIC_UNCERTAINTY_1_1_CANDIDATE.isg',
  successor+'/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1_CANDIDATE.md',
  successor+'/EVIDENCE_LINEAGE_MODEL_0_1_CANDIDATE.md',
  successor+'/EVIDENCE_LINEAGE_MODEL_0_1_CANDIDATE.isg',
  successor+'/EVIDENCE_LINEAGE_VOCAB_0_1.md',
  successor+'/EVIDENCE_LINEAGE_GRAPH_1_1_CANDIDATE.json',
  successor+'/EVIDENCE_LINEAGE_GRAPH_1_1_CANDIDATE.isg'
];

function walk(dir){
  const out=[];
  for(const name of fs.readdirSync(dir).sort()){
    const p=dir+'/'+name,st=fs.statSync(p);
    if(st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
exact.push(...walk(successor+'/generated'));

function blob(p){return execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();}
const files=exact.map(p=>({path:p,git_blob:blob(p),bytes:fs.statSync(p).size}));
const manifest={
  schema:1,
  candidate_id:'connect4-isograph-logic-1.1-candidate',
  source_revision:'aea692af800f524569ea1c2fda722087cd9bca39',
  dependency_closure:{objects:432,edges:568,missing:0,run:35369868624,job:105681035330},
  counts:{corpus_objects:432,native_images:234,semantic_items:29650,incomplete_scope_records:31,evidence_lineages:10,evidence_events:13},
  files
};
const out=successor+'/CONNECT4_LOGIC_CANDIDATE_MANIFEST_1_1.json';
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({path:out,files:files.length,bytes:files.reduce((n,x)=>n+x.bytes,0)},null,2));
