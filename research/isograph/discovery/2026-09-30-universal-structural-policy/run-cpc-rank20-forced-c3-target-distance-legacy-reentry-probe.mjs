#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_RANK20_C5_REPLY5_POST_CONTRACTION_CPC_REENTRY_DIAGNOSTIC_0_1.json';
const LEGACY_REPAIR='CPC_RANK20_LEGACY_REPAIR_ROUTE_REENTRY_PROBE_0_1.json';
const DESIGN='CPC_RANK20_FORCED_C3_TARGET_DISTANCE_LEGACY_REENTRY_PROBE_DESIGN_0_1.md';
const IDS=[
  'SECOND_D1_C5_CONTRACTION',
  'SECOND_D6_C5_CONTRACTION',
  'SECOND_D7_C5_CONTRACTION'
];
const PROOF_CAP=100000;
const root=resolve(import.meta.dirname,'../../../..');

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const loadJs=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await loadJs('rba-connect4-geometry');
const {connect4RbaFromMoves}=await loadJs('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await loadJs('rba-connect4-profile');
const {connect4RbaCofactor}=await loadJs('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
}=await loadJs('cpc-connect4');

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const targetDistanceMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createTargetDistanceLexicographicProofEngine}=targetDistanceMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1;
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

function makeSemanticKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();
  return kernel;
}
function semanticReplay(kernel,sequence){
  let id=kernel.rootId;
  for(const digit of sequence){
    const next=kernel.advance(id,Number(digit)-1);
    assert(next!==domain.QN_TERMINAL_WIN,'semantic replay terminal before end: '+sequence);
    assert(Number.isSafeInteger(next)&&next>=0,'bad semantic replay '+sequence);
    id=next;
  }
  return id;
}
function semanticRank(kernel,id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function semanticSupport(kernel,id){
  const out=[];
  for(let c=0;c<7;c++){
    const cell=kernel.supportAccess.landingAt(kernel.states.supportAt(id),c);
    out.push(cell===0xff?6:Math.floor(cell/7));
  }
  return out;
}
function hasBit(term,cell){
  const lo=term[0],hi=term[1];
  return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);
}
function termCells(term){
  const out=[];
  for(let cell=0;cell<42;cell++)if(hasBit(term,cell))out.push(cell);
  return out;
}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function isStrictSubsetKey(a,b){
  const aa=keyArray(a),bb=new Set(keyArray(b));
  return aa.length<bb.size&&aa.every(x=>bb.has(x));
}
function normalizeResidualKeys(keys){
  const unique=[...new Set(keys)];
  return unique.filter(k=>!unique.some(other=>other!==k&&isStrictSubsetKey(other,k))).sort();
}
function semanticResidualKeys(kernel,id,player){
  const classId=player===0?kernel.states.p0At(id):kernel.states.p1At(id);
  return normalizeResidualKeys(kernel.classes.terms(classId).map(termCells).map(keyCells));
}

function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsMover(q){return jsRank(q)&1;}
function jsSupport(q){return Array.from(q.words.slice(0,g.columns));}
function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function jsCoordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function jsShapeCells(id){
  const out=[],base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);
  return out;
}
function jsResidualKeys(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(jsCoordHas(q,player,i))out.push(keyCells(jsShapeCells(q.basis[i])));
  return normalizeResidualKeys(out);
}
function exactBridge(sequence,jsq,kernel,sid){
  const jsP0=jsResidualKeys(jsq,P0),jsP1=jsResidualKeys(jsq,P1);
  const semP0=semanticResidualKeys(kernel,sid,P0),semP1=semanticResidualKeys(kernel,sid,P1);
  const supportJs=jsSupport(jsq),supportSemantic=semanticSupport(kernel,sid);
  const checks={
    rank:jsRank(jsq)===semanticRank(kernel,sid)&&jsRank(jsq)===sequence.length,
    mover:jsMover(jsq)===(semanticRank(kernel,sid)&1),
    support:JSON.stringify(supportJs)===JSON.stringify(supportSemantic),
    p0Residuals:JSON.stringify(jsP0)===JSON.stringify(semP0),
    p1Residuals:JSON.stringify(jsP1)===JSON.stringify(semP1),
  };
  return {
    pass:Object.values(checks).every(Boolean),
    checks,
    js:{rank:jsRank(jsq),support:supportJs,p0Residuals:jsP0,p1Residuals:jsP1},
    semantic:{rank:semanticRank(kernel,sid),support:supportSemantic,p0Residuals:semP0,p1Residuals:semP1}
  };
}
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),
      interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
      preemptionMask32:s.preemptionMask32[0]>>>0
    };
  }
  return out;
}
function agreedRestriction(cc){
  return (
    cc.baseline.kind==='CPC_RESTRICT'&&cc.frontier.kind==='CPC_RESTRICT'&&
    cc.baseline.preemptionCount===1&&cc.frontier.preemptionCount===1&&
    cc.baseline.forcedColumn!==null&&
    cc.baseline.forcedColumn===cc.frontier.forcedColumn
  )?cc.baseline.forcedColumn:null;
}
function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function immediateP0WinningColumns(q){
  if(q.terminal!==0||jsMover(q)!==P0)return [];
  const out=[];
  for(const c of legalColumns(q))if(jsStep(q,c).terminal===P0_WIN)out.push(c+1);
  return out;
}
function errorKind(error){
  const m=String(error?.message??error);
  if(m.includes('reserved quotient state capacity exhausted'))return 'state_capacity_exhausted';
  if(m.includes('reserved quotient class capacity exhausted'))return 'class_capacity_exhausted';
  if(m.includes('target-distance proof-state cap exceeded'))return 'proof_state_cap_exceeded';
  if(m.includes('resolved-tail proof-state cap exceeded'))return 'proof_state_cap_exceeded';
  if(m.includes('repair proof-state cap exceeded'))return 'proof_state_cap_exceeded';
  return 'unexpected_error';
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
const legacyRepair=JSON.parse(readFileSync(resolve(import.meta.dirname,LEGACY_REPAIR),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_c5_reply5_post_contraction_cpc_reentry_diagnostic.v1');
assert.equal(legacyRepair.schema,'connect4.cpc_rank20_legacy_repair_route_reentry_probe.v1');
assert.equal(source.jsMinSysSha,EXPECTED);
assert.equal(legacyRepair.jsMinSysSha,EXPECTED);
for(const x of [source,legacyRepair]){
  assert.equal(x.oracleUsed,false);
  assert.equal(x.solvedInputsUsed,false);
  assert.equal(x.productionCpcModified,false);
  assert.equal(x.jsMinSysModified,false);
  assert.equal(x.bsfpModified,false);
}

const sourceMap=new Map(source.states.map(x=>[x.id,x]));
const legacyMap=new Map(legacyRepair.sourceStates.map(x=>[x.id,x]));
const states=[];
let resourceFailureCount=0;

for(const id of IDS){
  const src=sourceMap.get(id);
  const legacy=legacyMap.get(id);
  assert(src&&legacy,'missing source state '+id);
  assert.equal(legacy.legacyRepairClosed,false,id+' unexpectedly closed by prior legacy repair audit');

  const jsSource=jsFromSequence(src.sequence);
  assert.equal(jsSource.terminal,0,id+' source terminal drift');
  assert.equal(jsRank(jsSource),src.rank,id+' source rank drift');
  assert.deepEqual(jsSupport(jsSource),src.support,id+' source support drift');
  assert.equal(jsMover(jsSource),P1,id+' source mover drift');

  const cc=cpc(jsSource);
  const forced=agreedRestriction(cc);
  assert.equal(forced,3,id+' CPC forced-column drift');

  const defenderBranches=[];
  let allNonC3Immediate=true;
  for(const c of legalColumns(jsSource)){
    const child=jsStep(jsSource,c);
    if(c===2){
      assert.equal(child.terminal,0,id+' c3 forced child terminal drift');
      defenderBranches.push({
        defenderColumn:3,
        terminal:0,
        immediateP0WinningColumns:immediateP0WinningColumns(child)
      });
      continue;
    }
    if(child.terminal===P1_WIN){
      allNonC3Immediate=false;
      defenderBranches.push({
        defenderColumn:c+1,
        terminal:P1_WIN,
        immediateP0WinningColumns:[]
      });
      continue;
    }
    assert.equal(child.terminal,0,id+' unexpected non-c3 terminal');
    const wins=immediateP0WinningColumns(child);
    if(!wins.length)allNonC3Immediate=false;
    defenderBranches.push({
      defenderColumn:c+1,
      terminal:0,
      immediateP0WinningColumns:wins
    });
  }
  assert(allNonC3Immediate,id+' non-c3 immediate closure drift');

  const childSequence=src.sequence+'3';
  const jsChild=jsFromSequence(childSequence);
  assert.equal(jsChild.terminal,0,id+' child terminal drift');
  assert.equal(jsRank(jsChild),src.rank+1,id+' child rank drift');
  assert.equal(jsMover(jsChild),P0,id+' child mover drift');

  const kernel=makeSemanticKernel();
  const semChild=semanticReplay(kernel,childSequence);
  const childExactBridge=exactBridge(childSequence,jsChild,kernel,semChild);
  if(!childExactBridge.pass)throw new Error(id+' exact child bridge failed '+JSON.stringify(childExactBridge));

  const engine=createTargetDistanceLexicographicProofEngine(kernel,{
    maxProofStates:PROOF_CAP,
    maxTargetDistance:2
  });
  const repair=engine.repair;
  const target=src.target.cell;
  assert.equal(repair.singleton(semChild,0,target),true,id+' target singleton not live');
  const targetDistance=repair.targetDistance(semChild,target);
  assert(targetDistance>=1&&targetDistance<=2,id+' target distance outside qualified range: '+targetDistance);

  let proof=null,resourceFailure=null;
  try{proof=engine.prove(semChild,target);}
  catch(err){
    resourceFailure={kind:errorKind(err),message:String(err?.message??err)};
    resourceFailureCount++;
  }
  const proofCompleted=resourceFailure===null;
  const proved=proof?.proved??false;
  const stats=engine.stats();
  const enclosingStateClosed=proved&&allNonC3Immediate;

  states.push({
    id,
    sourceSequence:src.sequence,
    sourceRank:src.rank,
    sourceSupport:src.support,
    sourceCpc:cc,
    sourceCpcForcedColumn:forced,
    defenderBranches,
    allNonC3DefenderRepliesImmediateP0Terminal:allNonC3Immediate,
    childSequence,
    childRank:jsRank(jsChild),
    childSupport:jsSupport(jsChild),
    childExactBridge,
    target:{
      cell:target,
      column:(target%7)+1,
      row:Math.floor(target/7)+1
    },
    targetDistance,
    proofCompleted,
    proved,
    proofKind:proof?.kind??null,
    witness:proof?.witness??null,
    witnessKind:proof?.witnessKind??null,
    measure:proof?.measure??engine.measure(semChild,target),
    obligations:proof?.obligations??[],
    rejected:(proof?.rejected??[]).slice(0,24),
    resourceFailure,
    stats,
    enclosingStateClosed,
    composition:enclosingStateClosed?{
      kind:'CPC_FORCED_C3_PLUS_LEGACY_TARGET_DISTANCE',
      forcedDefenderColumn:3,
      exactChildSequence:childSequence,
      childProofKind:proof.kind,
      childWitness:proof.witness??null,
      childWitnessKind:proof.witnessKind??null
    }:null
  });
}

const provedIds=states.filter(x=>x.proved).map(x=>x.id);
const enclosingStateClosedIds=states.filter(x=>x.enclosingStateClosed).map(x=>x.id);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_forced_c3_target_distance_legacy_reentry_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  design:DESIGN,
  sourceEvidence:{
    postContraction:SOURCE,
    legacyRepairAudit:LEGACY_REPAIR
  },
  proofEngine:{
    kind:'standard7x6-target-distance-lexicographic-proof',
    path:'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-target-distance-lexicographic-proof-lib.mjs',
    maxProofStates:PROOF_CAP,
    maxTargetDistance:2
  },
  states,
  summary:{
    stateCount:states.length,
    exactBridgePassCount:states.filter(x=>x.childExactBridge.pass).length,
    provedCount:provedIds.length,
    provedIds,
    enclosingStateClosedCount:enclosingStateClosedIds.length,
    enclosingStateClosedIds,
    logicalRejectionCount:states.filter(x=>x.proofCompleted&&!x.proved).length,
    resourceFailureCount
  },
  conclusion:[
    'This probe queries the older target-distance lexicographic theorem on the exact CPC-forced c3 children before introducing any new proof primitive.',
    'Every child is admitted only after exact support plus normalized P0/P1 residual-antichain equality between JSMinSys RBA and the older semantic-quotient kernel.',
    'All non-c3 defender replies are independently rechecked for immediate Player-1 terminal closure; the c3 child is the only branch delegated to the legacy target-distance theorem.',
    provedIds.length
      ? 'At least one exact rank-28 child is proved by the older target-distance family, demonstrating a concrete proof-routing integration omission in the newer RCIC catalog.'
      : 'None of the exact rank-28 children is proved by the older target-distance family; this legacy route does not close the remaining obstruction.',
    enclosingStateClosedIds.length
      ? 'For every listed enclosing state, universal defender discharge is complete: non-c3 replies are immediately losing for Player 2 and the forced c3 child is structurally proved.'
      : 'No enclosing post-contraction state is fully closed by this composition.'
  ],
  boundary:[
    'This is research-side proof-library integration evidence only and does not by itself certify the rank-20 root.',
    'No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.',
    'Resource exhaustion is kept separate from logical theorem rejection.'
  ]
},null,2));
