import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  analyzeDirectResidualOrbitGraph,
} from '../2026-09-29-center-proof-cycle/control-algebra-dimensions.mjs';
import {
  analyzeStandardCenterControlAlgebra,
  analyzeOptimalBranchCollapse4x4,
} from '../2026-09-29-center-proof-cycle/control-algebra.mjs';

const here=path.dirname(new URL(import.meta.url).pathname);
const read=name=>fs.readFileSync(path.join(here,name),'utf8');
const json=name=>JSON.parse(read(name));

const sourceAdmission=json('COMPLETE_SOURCE_ADMISSION_0_1.json');
const iaAdmission=json('COMPLETE_IA_ADMISSION_0_2.json');
const obligation=json('COMPLETE_PRIMITIVE_OBLIGATION_0_1.json');
const sourceScope=read('SOURCE_SCOPE_CORE020_0_1.isg');
const aggregateControl=read('AGGREGATE_CONTROL_CORE020_0_2.isg');
const aggregateWitness=read('AGGREGATE_WITNESS_CORE020_0_1.isg');
const completeIa=read('COMPLETE_IA_CORE020_0_2.isg');
const loopControl=read('LOOP_RECURSION_CORE020_0_1.isg');
const completeSource=read('COMPLETE_SOURCE_CORE020_0_1.isg');
const graphControl=read('AGGREGATE_GRAPH_CONTROL_CORE020_0_1.isg');
const profileControl=read('AGGREGATE_PROFILE_CONTROL_CORE020_0_1.isg');
const gf2Control=read('AGGREGATE_GF2_CONTROL_CORE020_0_1.isg');
const directProducer=read('DIRECT_RESIDUAL_PRODUCER_CORE020_0_1.isg');
const physicalProducer=read('PARTIAL2_PHYSICAL_PRODUCER_CORE020_0_1.isg');
const producerSchema=read('PRODUCER_WITNESS_SCHEMA_CORE020_0_1.isg');
const width4Permutations=read('WIDTH4_PERMUTATIONS_CORE020_0_1.isg');
const width5Permutations=read('WIDTH5_PERMUTATIONS_CORE020_0_1.isg');
const stateSerialization=read('PRIMITIVE_STATE_SERIALIZATION_CORE020_0_1.isg');
const residualProducer1=read('RESIDUAL_PRODUCER_CONTROL_CORE020_0_1.isg');
const residualProducer2=read('RESIDUAL_PRODUCER_CONTROL_CORE020_0_2.isg');
const residualProducer3=read('RESIDUAL_PRODUCER_CONTROL_CORE020_0_3.isg');
const round15=json('ROUND_15_COMPLETE_0_1.json');
const quRound15=json('QU_LEDGER_ROUND15_0_5.json');
const round16=json('COMPLETE_ROUND_16_FIXED_POINT_0_1.json');
const quFinal=json('QU_LEDGER_FINAL_0_6.json');
const fixedPointReport=read('FIXED_POINT_REPORT_0_4_COMPLETE_PRIMITIVE.md');

function delimiterAudit(text){
  let par=0,br=0,minPar=0,minBr=0;
  for(const ch of text){
    if(ch==='(')par++;
    else if(ch===')')par--;
    else if(ch==='[')br++;
    else if(ch===']')br--;
    minPar=Math.min(minPar,par);minBr=Math.min(minBr,br);
  }
  return {par,br,minPar,minBr};
}
for(const [name,text] of [
  ['sourceScope',sourceScope],['aggregateControl',aggregateControl],
  ['aggregateWitness',aggregateWitness],['completeIa',completeIa],
  ['loopControl',loopControl],
  ['completeSource',completeSource],['graphControl',graphControl],
  ['profileControl',profileControl],['gf2Control',gf2Control],
  ['directProducer',directProducer],['physicalProducer',physicalProducer],
  ['producerSchema',producerSchema],
  ['width4Permutations',width4Permutations],['width5Permutations',width5Permutations],['stateSerialization',stateSerialization],
  ['residualProducer1',residualProducer1],['residualProducer2',residualProducer2],
  ['residualProducer3',residualProducer3],
]){
  assert.deepEqual(delimiterAudit(text),{par:0,br:0,minPar:0,minBr:0},name+' delimiter balance');
}

assert.equal(sourceAdmission.count,31);
assert.equal(sourceAdmission.admitted.length,31);
assert.equal(new Set(sourceAdmission.admitted.map(x=>x.id)).size,31);
for(let i=0;i<31;i++){
  const id='SC-E'+String(i+1).padStart(3,'0'),root=212001+i;
  const a=sourceAdmission.admitted.find(x=>x.id===id);
  assert.ok(a,id);
  assert.equal(a.status,'PRIMITIVE_EXPANDED_ASSERTION',id);
  assert.equal(a.complete_closure_eligible,true,id);
  assert.equal(a.native_root,root,id+' native root');
  assert.equal(a.native_root_file,'COMPLETE_SOURCE_CORE020_0_1.isg',id);
  assert.ok(completeSource.includes('^150019 '+root),id+' root missing');
}
assert.equal(sourceAdmission.completion_gate.null_native_roots,0);
assert.equal(sourceAdmission.completion_gate.source_assertions_with_native_root,31);

for(const rel of [246108,246107])
  assert.ok(graphControl.includes('^150010 '+rel),'missing graph control '+rel);
for(const rel of [246206,246210,246211])
  assert.ok(profileControl.includes('^150010 '+rel),'missing profile control '+rel);
for(const rel of [246335,246336])
  assert.ok(gf2Control.includes('^150010 '+rel),'missing GF2 control '+rel);
assert.ok(directProducer.includes('^150010 246429'),'missing direct producer closure');
assert.ok(physicalProducer.includes('^150010 246517'),'missing physical producer closure');

for(const [name,text] of [
  ['completeSource',completeSource],['completeIa',completeIa],['graphControl',graphControl],
  ['profileControl',profileControl],['gf2Control',gf2Control],
  ['directProducer',directProducer],['physicalProducer',physicalProducer],
  ['width4Permutations',width4Permutations],['width5Permutations',width5Permutations],['stateSerialization',stateSerialization],
  ['residualProducer1',residualProducer1],['residualProducer2',residualProducer2],
  ['residualProducer3',residualProducer3],
]){
  assert.equal(text.includes('^150021'),false,name+' must not hide unresolved semantics behind QU');
}

assert.equal(iaAdmission.count,64);
assert.equal(iaAdmission.admitted.length,64);
for(const a of iaAdmission.admitted)
  assert.equal(a.status,'PRIMITIVE_EXPANDED_IMPLICIT_ASSERTION',a.id);
for(let id=211001;id<=211064;id++)
  assert.ok(completeIa.includes('^150019 '+id),'missing complete IA root '+id);
assert.equal(round15.new_assertions.length,4);
assert.equal(round15.qu_refinements.length,5);
assert.deepEqual(round15.new_assertions.map(x=>x.id),['SC-IA061','SC-IA062','SC-IA063','SC-IA064']);
assert.equal(quRound15.entries.length,6);
assert.equal(quRound15.no_probability_added,true);
assert.equal(round16.round,16);
assert.equal(round16.status,'COMPLETE_PRIMITIVE_OPERATIONAL_FIXED_POINT');
assert.equal(round16.input.source_assertions,31);
assert.equal(round16.input.admitted_implicit_assertions,64);
assert.equal(round16.input.total_assertion_bodies,95);
assert.deepEqual(round16.new_assertions,[]);
assert.deepEqual(round16.support_refinements,[]);
assert.deepEqual(round16.qu_refinements,[]);
assert.equal(round16.stop_rule_result.new_normalized_assertions,0);
assert.equal(round16.stop_rule_result.support_refinements,0);
assert.equal(round16.stop_rule_result.qu_refinements,0);
assert.equal(round16.stop_rule_result.result,'FIXED_POINT_REACHED');
assert.equal(round16.primitive_closure.omitted_assertions,0);
assert.equal(round16.primitive_closure.reducible_authoritative_leaves,0);
assert.equal(round16.primitive_closure.unresolved_termination_qu,0);
assert.equal(round16.forbidden_support_audit.discovery_protocol_used,false);
assert.equal(round16.forbidden_support_audit.natural_entropic_identity_used,false);
assert.equal(round16.forbidden_support_audit.dts_used,false);
assert.equal(round16.forbidden_support_audit.experimental_inquiry_used,false);
assert.equal(round16.forbidden_support_audit.production_isomax_modified,false);
assert.equal(round16.forbidden_support_audit.bsfp_modified,false);
assert.equal(round16.forbidden_support_audit.external_solved_wdl_used_by_structural_producer,false);

assert.equal(quFinal.status,'COMPLETE_PRIMITIVE_FIXED_POINT_QU_STATE');
assert.equal(quFinal.fixed_point_round,16);
assert.equal(quFinal.pending,null);
assert.equal(quFinal.no_probability_added,true);
assert.equal(quFinal.no_preferred_open_realization_selected,true);
assert.deepEqual(quFinal.entries,quRound15.entries);
assert.ok(quFinal.stop_disposition.includes('zero assertions'));
assert.ok(fixedPointReport.includes('COMPLETE FROZEN-PACKET OPERATIONAL FIXED POINT'));
assert.ok(fixedPointReport.includes('**PAUSE.**'));


assert.equal(obligation.counts?.frozen_source_assertions??31,31);
assert.equal(obligation.counts?.implicit_assertions??64,64);
for(const x of obligation.source_assertions)assert.equal(x.may_be_omitted,false,x.id);
for(const x of obligation.implicit_assertions)assert.equal(x.may_be_omitted,false,x.id);
assert.equal(obligation.source_assertions.length,31);
assert.equal(obligation.implicit_assertions.length,64);
for(let i=0;i<31;i++){
  const x=obligation.source_assertions[i];
  assert.equal(x.current_status,'PRIMITIVE_EXPANDED_ASSERTION',x.id);
  assert.equal(x.native_root,212001+i,x.id);
}
for(let i=0;i<64;i++){
  const x=obligation.implicit_assertions[i];
  assert.equal(x.current_disposition,'PRIMITIVE_EXPANDED_IMPLICIT_ASSERTION',x.id);
  assert.equal(x.native_root,211001+i,x.id);
}
assert.equal(obligation.fixed_point.round,16);
assert.equal(obligation.fixed_point.source_assertions,31);
assert.equal(obligation.fixed_point.implicit_assertions,64);
assert.equal(obligation.fixed_point.total_assertion_bodies,95);
assert.equal(obligation.fixed_point.new_assertions,0);
assert.equal(obligation.fixed_point.support_refinements,0);
assert.equal(obligation.fixed_point.qu_refinements,0);
assert.equal(obligation.fixed_point.result,'FIXED_POINT_REACHED');


function parseIsg(text,name){
  const toks=text.match(/\(|\)|\[|\]|[^\s()[\]]+/g)??[];
  let i=0;
  function node(){
    const t=toks[i++];
    assert.notEqual(t,undefined,name+' unexpected EOF');
    if(t==='('||t==='['){
      const close=t==='('?')':']',items=[];
      while(toks[i]!==close){
        assert.ok(i<toks.length,name+' missing '+close);
        items.push(node());
      }
      i++;
      return {kind:t==='('? 'paren':'bracket',items};
    }
    assert.ok(t!==')'&&t!==']',name+' unexpected '+t);
    return t;
  }
  const roots=[];
  while(i<toks.length)roots.push(node());
  return roots;
}
function assertNoFreeVariables(text,name){
  const roots=parseIsg(text,name),free=[];
  function walk(n,scope){
    if(typeof n==='string'){
      if(n.startsWith('?')&&!scope.has(n))free.push(n);
      return;
    }
    if(n.kind==='paren'&&typeof n.items[0]==='string'&&
       (n.items[0]==='^150006'||n.items[0]==='^150007')){
      assert.equal(n.items.length,4,name+' malformed quantifier');
      const v=n.items[1];
      assert.ok(typeof v==='string'&&v.startsWith('?'),name+' malformed binder');
      walk(n.items[2],scope);
      const next=new Set(scope);next.add(v);
      walk(n.items[3],next);
      return;
    }
    for(let j=0;j<n.items.length;j++){
      if(n.kind==='paren'&&j===0)continue;
      walk(n.items[j],scope);
    }
  }
  for(const root of roots)walk(root,new Set());
  assert.deepEqual([...new Set(free)],[],name+' free variables');
}
for(const [name,text] of [
  ['completeSource',completeSource],['graphControl',graphControl],
  ['profileControl',profileControl],['gf2Control',gf2Control],
  ['directProducer',directProducer],['physicalProducer',physicalProducer],
  ['width4Permutations',width4Permutations],['width5Permutations',width5Permutations],['stateSerialization',stateSerialization],
  ['residualProducer1',residualProducer1],['residualProducer2',residualProducer2],['residualProducer3',residualProducer3],
])assertNoFreeVariables(text,name);

assert.equal((width5Permutations.match(/\(\^150010 237000 238\d{3}\)/g)??[]).length,120,
  'width5 permutation carrier size');
assert.equal((width5Permutations.match(/\(\^150024 237001 238\d{3} 19730\d 19730\d\)/g)??[]).length,600,
  'width5 permutation map rows');
assert.equal((width5Permutations.match(/\(\^150024 237002 19730\d 19730\d\)/g)??[]).length,10,
  'width5 slot-pair rows');
for(const rel of ['246700','246702','246703','246706','246709','246710'])
  assert.ok(stateSerialization.includes('^150010 '+rel),'missing serialization relation '+rel);
for(const rel of ['246720','246721','246722','246723','246726','246727','246728','246732','246734','246735','246730'])
  assert.ok(residualProducer2.includes('^150010 '+rel),'missing corrected producer relation '+rel);
for(const rel of ['246740','246741','246742','246743'])
  assert.ok(residualProducer3.includes('^150010 '+rel),'missing exact-shape producer relation '+rel);

for(const [root,caseId] of [
  [212024,5899100],[212025,5899101],[212026,5899102],
  [212027,5899100],[212028,5899100],[212029,5899100],
]){
  const pos=completeSource.indexOf('^150019 '+root);
  assert.ok(pos>=0,'missing final source root '+root);
  assert.ok(completeSource.slice(pos,pos+2600).includes('^150010 246743 '+caseId),
    'root '+root+' must require corrected bounded producer '+caseId);
}
assert.equal((completeSource.match(/\^150010 246743 /g)??[]).length,6,
  'exact final-producer root bindings');
assert.equal((completeSource.match(/\^150010 246730 /g)??[]).length,0,
  'no provisional producer root bindings remain');

assert.equal(sourceAdmission.qualified_core_020_semantic_sha256,
  '9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7');
assert.equal(sourceAdmission.qualified_qu_01_semantic_sha256,
  '1f1510b41e4351726e4d9e714eb32ece0d5e69f0964255aabd7b4a6e94eee4cc');

function phaseCase(options,direct=false){
  return analyzeDirectResidualOrbitGraph({
    ...options,
    measureLocalBranchClosure:false,
    emitPrimitiveWitnessData:true,
    emitFullDirectCarrier:direct,
  });
}

const p44=phaseCase({width:4,height:4,k:4},true);
const p45=phaseCase({
  width:4,height:5,k:4,
  nonterminalFrontierBlocker:true,moverFinalCapParity:true,
});
const p54=phaseCase({
  width:5,height:4,k:4,
  nonterminalFrontierBlocker:true,moverFinalCapParity:true,
});
const response=analyzeStandardCenterControlAlgebra({emitPrimitiveWitnessData:true});
const partial=analyzeOptimalBranchCollapse4x4({emitPrimitiveWitnessData:true});

const physicalFresh=partial.primitiveWitnessData?.physicalCarrier??[];
assert.equal(physicalFresh.length,161029);
let physicalSeen=0;
for(let shard=0;shard<5;shard++){
  const name='PARTIAL2_PHYSICAL_CARRIER_0_1_'+String(shard).padStart(2,'0')+'.json';
  const saved=json(name);
  assert.equal(saved.schema,'isomax.core020.partial2_physical_carrier_shard.v1');
  assert.equal(saved.start_index,physicalSeen);
  assert.equal(saved.rows.length,saved.count);
  for(let i=0;i<saved.rows.length;i++){
    const a=saved.rows[i],b=physicalFresh[physicalSeen+i];
    assert.deepEqual(a,b,'physical shard mismatch '+name+' row '+i);
  }
  physicalSeen+=saved.rows.length;
}
assert.equal(physicalSeen,physicalFresh.length);

function phaseSummary(r){
  const c=r.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit;
  return {
    cycleRank:c.cycleRank,zero:c.zeroCycleSyndromes,nonzero:c.nonzeroCycleSyndromes,
    contradictions:c.contradictoryReconvergences,
    binaryGroups:r.deeperContinuationPhaseAudit.binaryGroups,
    binaryEdges:r.deeperContinuationPhaseAudit.binaryContinuationEdges,
    nonbinary:r.deeperContinuationPhaseAudit.nonbinaryContinuationEdges,
    transporter:r.deeperContinuationPhaseAudit.childTransporterEdges,
    erasure:r.deeperContinuationPhaseAudit.childBranchErasureEdges,
    parity:r.lateActionParityAudit.parityWellDefinedFibers,
    pureDistinct:r.lateActionParityAudit.pureTransporterDistinctSlotFibers,
  };
}
assert.deepEqual(phaseSummary(p44),{
  cycleRank:1,zero:1,nonzero:0,contradictions:0,
  binaryGroups:61,binaryEdges:31,
  nonbinary:p44.deeperContinuationPhaseAudit.nonbinaryContinuationEdges,
  transporter:p44.deeperContinuationPhaseAudit.childTransporterEdges,
  erasure:p44.deeperContinuationPhaseAudit.childBranchErasureEdges,
  parity:38,pureDistinct:38,
});
assert.ok(p44.deeperContinuationPhaseAudit.nonbinaryContinuationEdges>0);
assert.ok(p44.deeperContinuationPhaseAudit.childTransporterEdges>0);
assert.ok(p44.deeperContinuationPhaseAudit.childBranchErasureEdges>0);
assert.equal(p44.residualOrbitStates,10507);
assert.equal(p44.recursiveUnlabelledClasses,8242);
assert.equal(p44.physicalBoardStatesEnumerated,false);
assert.equal(p44.outcomeLabelsUsedByProducer,false);

assert.equal(p45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.cycleRank,40);
assert.equal(p45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.zeroCycleSyndromes,40);
assert.equal(p45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,0);
assert.equal(p45.outcomeLabelsUsedByProducer,false);

assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.cycleRank,644);
assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.zeroCycleSyndromes,619);
assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,25);
assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.contradictoryReconvergences,12);
assert.equal(p54.outcomeLabelsUsedByProducer,false);

assert.equal(response.responsePairs,20);
assert.equal(response.responsePairRank,19);
assert.equal(response.responseRelationNullity,1);
assert.equal(response.unmatchedCenterIndependent,true);
assert.equal(response.rankWithUnmatchedCenter,20);
assert.equal(response.outcomeLabelsRead,false);

const ds=partial.equivalentSiblingDeltaSpace;
assert.equal(ds.allOptimalDistinctDeltas,176);
assert.equal(ds.allLegalDistinctDeltas,176);
assert.equal(ds.allOptimalDeltaRank,22);
assert.equal(ds.allLegalDeltaRank,22);
assert.equal(ds.optimalDeltaSetEqualsLegal,true);
assert.equal(ds.legalDeltasOutsideOptimalSpan,0);

assert.equal(p45.cells,20);
assert.equal(p54.cells,20);
assert.equal(p45.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,0);
assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,25);

const directClassSeen=new Map();
let directDuplicate=null;
for(const row of p44.primitiveWitnessData.directCarrier){
  const prior=directClassSeen.get(row.recursiveUnlabelledClass);
  if(prior&&prior.key!==row.key){directDuplicate=[prior,row];break;}
  directClassSeen.set(row.recursiveUnlabelledClass,row);
}
assert.ok(directDuplicate,'SC-IA062 requires distinct direct states in one recursive class');
assert.equal(p44.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.cycleRank,1);
assert.equal(p44.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.nonzeroCycleSyndromes,0);
assert.ok(p44.deeperContinuationPhaseAudit.nonbinaryContinuationEdges>0);
assert.ok(p44.deeperContinuationPhaseAudit.childTransporterEdges>0);
assert.ok(p44.deeperContinuationPhaseAudit.childBranchErasureEdges>0);
assert.equal(p54.outcomeLabelsUsedByProducer,false);
assert.equal(p54.deeperContinuationPhaseAudit.binaryPhaseCocycleAudit.contradictoryReconvergences,12);

const wanted=new Set([
  5899200,5899202,5899206,5899207,5899211,5899212,5899221,5899222,5899223,5899224,5899225,
  5899230,5899231,5899232,5899240,5899241,5899242,5899243,5899244,5899245,5899246,5899247,
  5899250,5899251,5899252,5899253,5899254,5899255,5899256,5899257,
  5899261,5899263,5899264,5899267,
  5899280,5899281,5899282,5899283,5899284,5899285,5899286,5899287,
  5899290,5899291,
  5899400,5899401,5899410,5899411,5899412,5899413,
  5899420,5899421,
  5899430,5899431,5899432,5899433,5899434,5899435,5899436,
  5899440,5899441,5899442,
  5899450,5899451,5899452,5899453,5899454,
]);
const rows=new Map();
const tupleRe=/\[\(\^150024 (\d+)([^)]*)\)\]/g;
let m;
while((m=tupleRe.exec(aggregateWitness))){
  const rel=Number(m[1]);
  if(!wanted.has(rel))continue;
  const args=m[2].trim()?m[2].trim().split(/\s+/).map(Number):[];
  let xs=rows.get(rel);if(!xs){xs=[];rows.set(rel,xs);}xs.push(args);
}
const R=id=>rows.get(id)??[];
const nat=t=>t===7001?0:t-5000000;
const bit=t=>{assert.ok(t===196900||t===196901);return t===196901?1:0;};

const memberRows=R(5899400),enumRows=R(5899401);
const members=new Map(),enums=new Map();
for(const [s,x] of memberRows){let a=members.get(s);if(!a){a=[];members.set(s,a);}a.push(x);}
for(const [s,i,x] of enumRows){let a=enums.get(s);if(!a){a=[];enums.set(s,a);}a.push([nat(i),x]);}
function setValues(s){return members.get(s)??[];}
function sameSet(a,b){
  const A=[...new Set(a)].sort((x,y)=>x-y),B=[...new Set(b)].sort((x,y)=>x-y);
  assert.deepEqual(A,B);
}
function checkSet(s,n){
  const a=setValues(s),e=enums.get(s)??[];
  assert.equal(a.length,n,'set '+s+' member count');
  assert.equal(new Set(a).size,n,'set '+s+' unique members');
  assert.equal(e.length,n,'set '+s+' enum count');
  e.sort((x,y)=>x[0]-y[0]);
  assert.deepEqual(e.map(x=>x[0]),Array.from({length:n},(_,i)=>i),'set '+s+' prefix');
  sameSet(a,e.map(x=>x[1]));
}
for(const [s,n] of [
  [5901001,1],[5901002,1],[5901003,0],
  [5901011,40],[5901012,40],[5901013,0],
  [5901021,644],[5901022,619],[5901023,25],[5901024,12],
  [5901030,38],[5901031,38],[5901032,61],[5901033,31],
  [5901040,10507],[5901041,8242],
  [5901050,20],[5901051,12],[5901052,19],[5901053,20],[5901070,21],
  [5901060,176],[5901061,176],[5901062,22],[5901063,22],
])checkSet(s,n);

function mapRows(rel,keyfn){
  const out=new Map();
  for(const x of R(rel)){const k=keyfn(x);let a=out.get(k);if(!a){a=[];out.set(k,a);}a.push(x);}
  return out;
}

const reducedByCase=mapRows(5899202,x=>x[0]);
const closuresByCase=mapRows(5899206,x=>x[0]);
const treeByCase=mapRows(5899430,x=>x[0]);
const rootsByCase=mapRows(5899431,x=>x[0]);
const parentByCase=mapRows(5899432,x=>x[0]);
const depthByCase=mapRows(5899433,x=>x[0]);
const groupByCase=mapRows(5899200,x=>x[0]);
const pathNode=mapRows(5899434,x=>x[0]+':'+x[1]);
const pathEdge=mapRows(5899435,x=>x[0]+':'+x[1]);
const pathAcc=mapRows(5899436,x=>x[0]+':'+x[1]);

function checkCycleCase(c,C,Z,N){
  const edges=reducedByCase.get(c)??[],closures=closuresByCase.get(c)??[];
  const edgeMap=new Map(edges.map(x=>[x[1],x]));
  const closureMap=new Map(closures.map(x=>[x[1],x]));
  const tree=new Set((treeByCase.get(c)??[]).map(x=>x[1]));
  sameSet(setValues(C),closures.map(x=>x[1]));
  sameSet(setValues(Z),closures.filter(x=>bit(x[2])===0).map(x=>x[1]));
  sameSet(setValues(N),closures.filter(x=>bit(x[2])===1).map(x=>x[1]));
  for(const e of edgeMap.keys())assert.notEqual(tree.has(e),closureMap.has(e),'tree/closure partition '+c+':'+e);
  assert.equal(tree.size+closureMap.size,edgeMap.size);

  const groups=new Set((groupByCase.get(c)??[]).map(x=>x[1]));
  const roots=new Set((rootsByCase.get(c)??[]).map(x=>x[1]));
  const parents=(parentByCase.get(c)??[]);
  const depths=new Map((depthByCase.get(c)??[]).map(x=>[x[1],nat(x[2])]));
  assert.equal(depths.size,groups.size);
  const byChild=new Map();
  for(const x of parents){assert.ok(!byChild.has(x[1]));byChild.set(x[1],x);}
  for(const g of groups){
    assert.notEqual(roots.has(g),byChild.has(g));
    if(roots.has(g))assert.equal(depths.get(g),0);
    else{
      const [,child,parent,e]=byChild.get(g);
      assert.ok(tree.has(e));assert.ok(groups.has(parent));
      assert.equal(depths.get(child),depths.get(parent)+1);
      const row=edgeMap.get(e);assert.ok(row);
      assert.ok((row[2]===child&&row[3]===parent)||(row[2]===parent&&row[3]===child));
    }
  }
  assert.equal(parents.length,tree.size);

  for(const [e,cl] of closureMap){
    const row=edgeMap.get(e);assert.ok(row);
    const nodes=(pathNode.get(c+':'+e)??[]).map(x=>[nat(x[2]),x[3]]).sort((a,b)=>a[0]-b[0]);
    const pedges=(pathEdge.get(c+':'+e)??[]).map(x=>[nat(x[2]),x[3]]).sort((a,b)=>a[0]-b[0]);
    const acc=(pathAcc.get(c+':'+e)??[]).map(x=>[nat(x[2]),bit(x[3])]).sort((a,b)=>a[0]-b[0]);
    assert.equal(nodes.length,pedges.length+1);
    assert.equal(acc.length,nodes.length);
    assert.deepEqual(nodes.map(x=>x[0]),Array.from({length:nodes.length},(_,i)=>i));
    assert.deepEqual(pedges.map(x=>x[0]),Array.from({length:pedges.length},(_,i)=>i));
    assert.deepEqual(acc.map(x=>x[0]),Array.from({length:acc.length},(_,i)=>i));
    assert.equal(nodes[0][1],row[2]);assert.equal(nodes.at(-1)[1],row[3]);assert.equal(acc[0][1],0);
    for(let i=0;i<pedges.length;i++){
      const pe=edgeMap.get(pedges[i][1]);assert.ok(pe);assert.ok(tree.has(pe[1]));
      assert.ok((pe[2]===nodes[i][1]&&pe[3]===nodes[i+1][1])||(pe[3]===nodes[i][1]&&pe[2]===nodes[i+1][1]));
      assert.equal(acc[i+1][1],acc[i][1]^bit(pe[4]));
    }
    assert.equal(acc.at(-1)[1]^bit(row[4]),bit(cl[2]));
  }
  assert.equal(closures.length,edges.length-groups.size+roots.size);
}
checkCycleCase(5899100,5901001,5901002,5901003);
checkCycleCase(5899101,5901011,5901012,5901013);
checkCycleCase(5899102,5901021,5901022,5901023);

const contradPairs=new Map(R(5899207).filter(x=>x[0]===5899102).map(x=>[x[1],x]));
sameSet(setValues(5901024),[...contradPairs.keys()]);
const cNodes=mapRows(5899440,x=>x[0]+':'+x[1]+':'+x[2]);
const cEdges=mapRows(5899441,x=>x[0]+':'+x[1]+':'+x[2]);
const cAcc=mapRows(5899442,x=>x[0]+':'+x[1]+':'+x[2]);
const e54=new Map((reducedByCase.get(5899102)??[]).map(x=>[x[1],x]));
for(const [p,row] of contradPairs)for(const pbTok of [196900,196901]){
  const k='5899102:'+p+':'+pbTok;
  const ns=(cNodes.get(k)??[]).map(x=>[nat(x[3]),x[4]]).sort((a,b)=>a[0]-b[0]);
  const es=(cEdges.get(k)??[]).map(x=>[nat(x[3]),x[4]]).sort((a,b)=>a[0]-b[0]);
  const as=(cAcc.get(k)??[]).map(x=>[nat(x[3]),bit(x[4])]).sort((a,b)=>a[0]-b[0]);
  assert.equal(ns.length,es.length+1);assert.equal(as.length,ns.length);
  assert.equal(ns[0][1],row[2]);assert.equal(ns.at(-1)[1],row[3]);
  assert.equal(as[0][1],0);assert.equal(as.at(-1)[1],bit(pbTok));
  for(let i=0;i<es.length;i++){
    const e=e54.get(es[i][1]);assert.ok(e);
    assert.equal(e[2],ns[i][1]);assert.equal(e[3],ns[i+1][1]);
    assert.equal(as[i+1][1],as[i][1]^bit(e[4]));
  }
}

// Exact reverse map for the complete 4x4 direct residual carrier.
const dc=p44.primitiveWitnessData.directCarrier;
assert.equal(dc.length,10507);
const stateTokByKey=new Map(dc.map((r,i)=>[r.key,6500000+i]));
const stateRank=new Map(R(5899281).filter(x=>x[0]===5899100).map(x=>[x[1],nat(x[2])]));
const stateClass=new Map(R(5899232).filter(x=>x[0]===5899100).map(x=>[x[1],x[2]]));
const stateHeights=mapRows(5899282,x=>x[0]+':'+x[1]);
const r0Rows=mapRows(5899284,x=>x[0]+':'+x[1]);
const r1Rows=mapRows(5899285,x=>x[0]+':'+x[1]);
const maskCells=mapRows(5899286,x=>x[0]);
const childRows=mapRows(5899287,x=>x[0]+':'+x[1]);
function maskValue(mt){
  let out=0;
  for(const x of maskCells.get(mt)??[]){
    const cell=x[1],row=Math.floor((cell-233000)/10),col=(cell-233000)%10;
    assert.ok(row>=0&&row<4&&col>=0&&col<4);
    out|=1<<(row*4+col);
  }
  return out>>>0;
}
const kindRows=R(5899283).filter(x=>x[0]===5899100);
const rawKindByState=new Map(kindRows.map(x=>[x[1],x[2]]));
const kindToken=new Map();
for(let i=0;i<dc.length;i++){
  const src=dc[i],st=6500000+i;
  assert.equal(stateRank.get(st),src.rank);
  assert.equal(stateClass.get(st),12000000+src.recursiveUnlabelledClass);
  if(src.heights){
    const hs=(stateHeights.get('5899100:'+st)??[]).map(x=>[x[2]-231000,nat(x[3])]).sort((a,b)=>a[0]-b[0]);
    assert.deepEqual(hs.map(x=>x[1]),src.heights);
    const rr0=(r0Rows.get('5899100:'+st)??[]).map(x=>maskValue(x[2])).sort((a,b)=>a-b);
    const rr1=(r1Rows.get('5899100:'+st)??[]).map(x=>maskValue(x[2])).sort((a,b)=>a-b);
    assert.deepEqual(rr0,[...src.p0Residuals].sort((a,b)=>a-b));
    assert.deepEqual(rr1,[...src.p1Residuals].sort((a,b)=>a-b));
  }
  if(src.kind!==null&&src.kind!==undefined){
    const kt=rawKindByState.get(st);assert.ok(kt!==undefined);
    if(kindToken.has(src.kind))assert.equal(kindToken.get(src.kind),kt);
    else kindToken.set(src.kind,kt);
  }else assert.equal(rawKindByState.has(st),false);
  const rawChildren=(childRows.get('5899100:'+st)??[]).map(x=>x[2]);
  const expected=src.children.map(k=>stateTokByKey.get(k));
  assert.deepEqual(rawChildren,expected);
}
sameSet(setValues(5901040),dc.map((_,i)=>6500000+i));
sameSet(setValues(5901041),[...new Set(dc.map(x=>12000000+x.recursiveUnlabelledClass))]);

const rootStates=R(5899280).filter(x=>x[0]===5899100).map(x=>x[1]);
assert.equal(rootStates.length,1);assert.equal(stateRank.get(rootStates[0]),0);
const seen=new Set(rootStates),queue=[...rootStates];
for(let qi=0;qi<queue.length;qi++){
  for(const x of childRows.get('5899100:'+queue[qi])??[])if(!seen.has(x[2])){seen.add(x[2]);queue.push(x[2]);}
}
assert.equal(seen.size,10507);

// Re-derive the 4x4 transporter/all-distinct/parity result from raw profiles and all 24 permutations.
const fiberLabels=mapRows(5899261,x=>x[0]+':'+x[1]);
const live=mapRows(5899263,x=>x[0]+':'+x[1]);
const inactive=mapRows(5899264,x=>x[0]+':'+x[1]);
function profile(label){
  const out=Array(4).fill(null);
  for(const x of inactive.get('5899100:'+label)??[])out[x[2]-231000]='I';
  for(const x of live.get('5899100:'+label)??[])out[x[2]-231000]='C'+x[3];
  assert.ok(out.every(x=>x!==null));return out;
}
function perms(a){
  const out=[];function rec(i){if(i===a.length){out.push([...a]);return;}for(let j=i;j<a.length;j++){[a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];}}rec(0);return out;
}
const p4=perms([0,1,2,3]);
function parity(p){let b=0;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])b^=1;return b;}
function moved(src,p){const dst=Array(4);for(let i=0;i<4;i++)dst[p[i]]=src[i];return dst;}
const pure=[],well=[];
for(const [k,rows0] of fiberLabels){
  if(!k.startsWith('5899100:'))continue;
  const f=Number(k.split(':')[1]),ps=rows0.map(x=>profile(x[2])),base=ps[0];
  const pureTransport=ps.every(q=>[...q].sort().join('|')===[...base].sort().join('|'));
  const distinct=new Set(base).size===4;
  if(pureTransport&&distinct)pure.push(f);
  if(pureTransport){
    const ok=ps.every(q=>{
      const parities=new Set(p4.filter(p=>moved(q,p).join('|')===base.join('|')).map(parity));
      return parities.size===1;
    });
    if(ok)well.push(f);
  }
}
sameSet(pure,setValues(5901030));sameSet(well,setValues(5901031));sameSet(pure,well);

// Re-derive binary continuation exit classification from raw profiles.
const groupMembers=mapRows(5899267,x=>x[0]+':'+x[1]);
const labelGroups=new Map();
for(const x of R(5899267).filter(x=>x[0]===5899100)){
  for(const l of [x[2]]){let a=labelGroups.get(l);if(!a){a=[];labelGroups.set(l,a);}a.push(x[1]);}
}
const binaryGroups=new Set(R(5899200).filter(x=>x[0]===5899100).map(x=>x[1]));
const propRows=R(5899270).filter(x=>x[0]===5899100);
const expectedKinds=new Map();
function profileMaybe(l){try{return profile(l);}catch{return null;}}
for(const x of propRows){
  const pt=x[1],l=x[4],r=x[5],lp=profileMaybe(l),rp=profileMaybe(r);
  let kind;
  if(!lp||!rp)kind=5899225;
  else if(lp.join('|')===rp.join('|')){
    const common=(labelGroups.get(l)??[]).find(g=>(labelGroups.get(r)??[]).includes(g));
    assert.ok(common!==undefined);
    kind=binaryGroups.has(common)?5899221:5899222;
  }else if([...lp].sort().join('|')===[...rp].sort().join('|'))kind=5899223;
  else kind=5899224;
  expectedKinds.set(pt,kind);
}
for(const [pt,kind] of expectedKinds){
  const actual=[5899221,5899222,5899223,5899224,5899225].filter(rel=>R(rel).some(x=>x[0]===5899100&&x[1]===pt));
  assert.deepEqual(actual,[kind]);
}
assert.equal(binaryGroups.size,61);
assert.equal(R(5899221).filter(x=>x[0]===5899100).length,31);
assert.ok(R(5899222).some(x=>x[0]===5899100));
assert.ok(R(5899223).some(x=>x[0]===5899100));
assert.ok(R(5899224).some(x=>x[0]===5899100));

// GF(2) reverse certificates.
function bitsFor(rel,objIndex,featureIndex,base){
  const m=new Map();
  for(const x of R(rel)){
    const obj=x[objIndex],f=x[featureIndex]-base;
    assert.ok(f>=0);
    m.set(obj,(m.get(obj)??0n)^(1n<<BigInt(f)));
  }
  return m;
}
function xorSelected(ids,map){let x=0n;for(const id of ids)x^=map.get(id)??0n;return x;}
function coeffMap(rel,leftIndex,rightIndex){
  const m=new Map();for(const x of R(rel)){let a=m.get(x[leftIndex]);if(!a){a=[];m.set(x[leftIndex],a);}a.push(x[rightIndex]);}return m;
}
const rv=bitsFor(5899241,0,1,6710000);
const rb=bitsFor(5899244,0,1,6710000);
const rab=bitsFor(5899246,0,1,6710000);
const rcoeff=coeffMap(5899411,0,1),racoeff=coeffMap(5899412,0,1);
const rbSource=coeffMap(5899450,0,1),rabSource=coeffMap(5899451,0,1);
for(const v of setValues(5901050))assert.equal(xorSelected(rcoeff.get(v)??[],rb),rv.get(v)??0n);
for(const b of setValues(5901052))assert.equal(xorSelected(rbSource.get(b)??[],rv),rb.get(b)??0n);
const unmatched=6740000,unmatchedBits=R(5899247).filter(x=>x[0]===5899103).reduce((z,x)=>z^(1n<<BigInt(x[1]-6710000)),0n);
const augInputs=new Map(rv);augInputs.set(unmatched,unmatchedBits);
for(const v of setValues(5901070))assert.equal(xorSelected(racoeff.get(v)??[],rab),augInputs.get(v)??0n);
for(const b of setValues(5901053))assert.equal(xorSelected(rabSource.get(b)??[],augInputs),rab.get(b)??0n);
let dep=0n;for(const v of setValues(5901051))dep^=rv.get(v)??0n;assert.equal(dep,0n);
for(const x of R(5899454).filter(x=>x[0]===5899103))assert.equal(bit(x[2]),0);

const pd=bitsFor(5899253,0,1,6810000);
const pob=bitsFor(5899255,0,1,6810000),plb=bitsFor(5899257,0,1,6810000);
const poc=coeffMap(5899420,0,1),plc=coeffMap(5899421,0,1);
const pos=coeffMap(5899452,0,1),pls=coeffMap(5899453,0,1);
sameSet(setValues(5901060),setValues(5901061));
for(const d of setValues(5901060))assert.equal(xorSelected(poc.get(d)??[],pob),pd.get(d)??0n);
for(const b of setValues(5901062))assert.equal(xorSelected(pos.get(b)??[],pd),pob.get(b)??0n);
for(const d of setValues(5901061))assert.equal(xorSelected(plc.get(d)??[],plb),pd.get(d)??0n);
for(const b of setValues(5901063))assert.equal(xorSelected(pls.get(b)??[],pd),plb.get(b)??0n);

console.log(JSON.stringify({
  status:'COMPLETE_PRIMITIVE_FIXED_POINT_PASS',
  sourceAssertions:31,
  admittedImplicitAssertions:64,
  phase:{
    '4x4':phaseSummary(p44),
    '4x5':phaseSummary(p45),
    '5x4':phaseSummary(p54),
  },
  direct4x4:{states:p44.residualOrbitStates,classes:p44.recursiveUnlabelledClasses},
  response:{pairs:response.responsePairs,rank:response.responsePairRank,augmentedRank:response.rankWithUnmatchedCenter},
  partial2:{distinct:ds.allLegalDistinctDeltas,rank:ds.allLegalDeltaRank,physicalStates:physicalSeen},
  finalNativeRoots:{source:31,implicit:64},
  boundedResidualProducer:{cases:3,width5Permutations:120,finalRootBindings:6,predicate:246743},
},null,2));
