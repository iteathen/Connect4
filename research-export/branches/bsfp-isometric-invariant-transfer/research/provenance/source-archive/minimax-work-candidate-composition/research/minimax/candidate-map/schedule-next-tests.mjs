import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const signed=JSON.parse(fs.readFileSync(path.join(root,'docs/research/evidence/2026-09-09-signed-interaction-graph-terminalization-v2.json'),'utf8'));
const post=JSON.parse(fs.readFileSync(path.join(root,'research/minimax/candidate-map/post-ledger-forms.json'),'utf8'));
const ext=JSON.parse(fs.readFileSync(path.join(root,'research/minimax/candidate-map/campaign-form-extensions.json'),'utf8'));

// Deliberately do not load adoption-metadata.json. Scheduling must be blind to promotion/adoption state.
const observed=[...(post.observed_relations??[]),...(ext.observed_relations??[])];
const observedPairs=new Set(observed.map(e=>`${e.source}->${e.target}`));
const stageOrder=new Map([
  ['RWS',0],['RID',0],['SUP',0],['INC',0],['FW',0],
  ['IWIN',1],['DTH',1],['FBLK',1],['FMAC',1],
  ['CARD',2],['SEWB',2],['EXH',2],['BEXH',2],['ZPAR',2],
  ['A1',3],['A2',3],['A3',3],['A4',3],['A5',3],['A6',3],['A7',3],['A8',3],['A9',3],['A10',3],['IMPL',3],
  ['DEAD',4],['AUTO',4],
  ['E1',5],['E2',5],['E3',5],['E4',5],['P1',5],['MHINT',5],
  ['RANK',6],['CTT',6],['PH',6],['CAP',6],['CPR',6],
  ['STT',7],['YBWC',7],['AFF',7],['JOIN',7],
]);
function stage(id){return stageOrder.get(id)??8;}
function numeric(v,fallback=-99){return typeof v==='number'?v:fallback;}
const unobserved=[];
for(const e of signed.edges){
  const key=`${e.source}->${e.target}`;
  if(e.observed_value!==null&&e.observed_value!==undefined)continue;
  if(observedPairs.has(key))continue;
  unobserved.push({source:e.source,target:e.target,stage:Math.max(stage(e.source),stage(e.target)),projected_value:e.projected_value??null,projected_confidence:e.projected_confidence??null,scope:e.scope??null,regime:e.regime??null,proof_goal_scope:e.proof_goal_scope??null,relation_kind:e.relation_kind??[],mechanism:e.mechanism??null,evidence_basis:e.evidence_basis??null});
}
unobserved.sort((a,b)=>a.stage-b.stage||numeric(b.projected_confidence)-numeric(a.projected_confidence)||Math.abs(numeric(b.projected_value,0))-Math.abs(numeric(a.projected_value,0))||a.source.localeCompare(b.source)||a.target.localeCompare(b.target));
const byStage={};for(const e of unobserved)(byStage[e.stage]??=[]).push(e);
const activeForms=[...post.forms,...ext.forms].filter(f=>/active|unfinished|open/i.test(f.test_state??'')).map(f=>({id:f.id,mechanism:f.mechanism,label:f.label,test_state:f.test_state}));
const out={schema:'connect4-minimax-promotion-blind-test-schedule-v1',policy:{adoption_metadata_loaded:false,ordering:'stage asc, projected confidence desc, projected magnitude desc; no composite candidate score',missing_edge_semantics:'unassessed-not-neutral',negative_edges:'retain as saturation/interference hypotheses; do not treat as candidate rejection'},counts:{signed_edges:signed.edges.length,post_observed_relations:observed.length,projected_unobserved_edges:unobserved.length,active_forms:activeForms.length},active_forms:activeForms,by_stage:byStage};
assert.equal(out.policy.adoption_metadata_loaded,false);
console.log(JSON.stringify(out,null,2));
