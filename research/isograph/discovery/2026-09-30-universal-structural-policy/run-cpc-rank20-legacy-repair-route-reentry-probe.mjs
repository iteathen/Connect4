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

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const repairMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createRepairCapacityProofEngine}=repairMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P1_WIN=3,P2_WIN=1;
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
  for(const d of sequence){
    const next=kernel.advance(id,Number(d)-1);
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
function semanticResidualKeys(kernel,id,player){
  const classId=player===0?kernel.states.p0At(id):kernel.states.p1At(id);
  return kernel.classes.terms(classId).map(termCells).map(keyCells).sort();
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
  return out.sort();
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
function errorKind(error){
  const m=String(error?.message??error);
  if(m.includes('reserved quotient state capacity exhausted'))return 'state_capacity_exhausted';
  if(m.includes('reserved quotient class capacity exhausted'))return 'class_capacity_exhausted';
  if(m.includes('repair proof-state cap exceeded'))return 'proof_state_cap_exceeded';
  return 'unexpected_error';
}
function proveFresh(sequence,target){
  const k=makeSemanticKernel();
  const state=semanticReplay(k,sequence);
  const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:PROOF_CAP});
  let result=null,error=null;
  try{result=e.prove(state,target);}
  catch(err){error={kind:errorKind(err),message:String(err?.message??err)};}
  return {
    completed:error===null,
    proved:result?.proved??false,
    proofKind:result?.kind??null,
    witness:result?.witness??null,
    witnessKind:result?.witnessKind??null,
    mu:result?.mu??e.mu(state),
    winningActions:(result?.winningActions??[]).map(x=>({column:x.column,kind:x.kind})),
    rejected:result?.rejected??[],
    exactCertificateKey:result?.exactCertificateKey??e.exactStateTargetKey(state,target),
    stats:e.stats(),
    error
  };
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_c5_reply5_post_contraction_cpc_reentry_diagnostic.v1');
assert.equal(source.jsMinSysSha,EXPECTED);
assert.equal(source.oracleUsed,false);
assert.equal(source.solvedInputsUsed,false);
assert.equal(source.ordinaryGameTreeSearchUsed,false);
assert.equal(source.productionCpcModified,false);
assert.equal(source.jsMinSysModified,false);
assert.equal(source.bsfpModified,false);
assert.equal(source.states.length,5);

const sourceStates=[];
let resourceFailureCount=0,logicalRepairRejectionCount=0,proofAttemptCount=0,provedTargetCount=0;
for(const src of source.states){
  const jsSource=jsFromSequence(src.sequence);
  assert.equal(jsSource.terminal,0,src.id+' source terminal drift');
  assert.equal(jsRank(jsSource),src.rank,src.id+' source rank drift');
  assert.deepEqual(jsSupport(jsSource),src.support,src.id+' source support drift');
  assert.equal(jsMover(jsSource),1,src.id+' must be defender to move');

  const inspectKernel=makeSemanticKernel();
  const semanticSource=semanticReplay(inspectKernel,src.sequence);
  const sourceExactBridge=exactBridge(src.sequence,jsSource,inspectKernel,semanticSource);
  assert(sourceExactBridge.pass,src.id+' exact source bridge failed');

  const defenderReplies=[];
  for(let c=0;c<7;c++){
    if(jsSource.words[c]>=g.rows)continue;
    const replySequence=src.sequence+String(c+1);
    const jsChild=jsStep(jsSource,c);
    const semNext=inspectKernel.advance(semanticSource,c);
    const defenderTerminal=jsChild.terminal===P2_WIN;
    if(defenderTerminal){
      assert.equal(semNext,domain.QN_TERMINAL_WIN,src.id+' defender terminal bridge mismatch c'+(c+1));
      defenderReplies.push({
        defenderColumn:c+1,
        terminal:true,
        terminalFor:'P2',
        closed:false,
        closedBy:'DEFENDER_TERMINAL',
        childSequence:replySequence,
        childExactBridge:null,
        immediateP0WinningColumns:[],
        activeP0SingletonTargets:[],
        invariantCompatibleTargets:[],
        proofAttempts:[],
        provedTargets:[],
        resourceFailures:[]
      });
      continue;
    }
    assert.equal(jsChild.terminal,0,src.id+' unexpected terminal code');
    assert(Number.isSafeInteger(semNext)&&semNext>=0,src.id+' semantic child invalid');
    const childExactBridge=exactBridge(replySequence,jsChild,inspectKernel,semNext);
    assert(childExactBridge.pass,src.id+' exact child bridge failed c'+(c+1));

    const inspectEngine=createRepairCapacityProofEngine(inspectKernel,{collectAllWinningActions:true,maxProofStates:1});
    const immediate=inspectEngine.terminalActions(semNext,0).map(x=>x.column+1);
    const activeP0SingletonTargets=inspectEngine.terms(semNext,0)
      .filter(t=>t.length===1).map(t=>t[0]).sort((a,b)=>a-b);
    const invariantCompatibleTargets=activeP0SingletonTargets
      .filter(target=>inspectEngine.invariant(semNext,target));

    const proofAttempts=[];
    const provedTargets=[];
    const resourceFailures=[];
    if(!immediate.length){
      for(const target of invariantCompatibleTargets){
        proofAttemptCount++;
        const p=proveFresh(replySequence,target);
        const attempt={targetCell:target,targetColumn:(target%7)+1,targetRow:Math.floor(target/7)+1,...p};
        proofAttempts.push(attempt);
        if(p.proved){provedTargets.push(target);provedTargetCount++;}
        else if(!p.completed){resourceFailures.push({targetCell:target,error:p.error});resourceFailureCount++;}
        else logicalRepairRejectionCount++;
      }
    }
    const closed=immediate.length>0||provedTargets.length>0;
    defenderReplies.push({
      defenderColumn:c+1,
      terminal:false,
      childSequence:replySequence,
      childRank:jsRank(jsChild),
      childSupport:jsSupport(jsChild),
      childExactBridge,
      immediateP0WinningColumns:immediate,
      activeP0SingletonTargets,
      invariantCompatibleTargets,
      proofAttempts,
      provedTargets,
      resourceFailures,
      closed,
      closedBy:immediate.length?'IMMEDIATE_P0_TERMINAL':provedTargets.length?'LEGACY_REPAIR_CAPACITY':resourceFailures.length?'RESOURCE_FAILURE':'NO_LEGACY_REPAIR_ROUTE'
    });
  }

  const legacyRepairClosed=defenderReplies.every(x=>x.closed);
  sourceStates.push({
    id:src.id,
    sequence:src.sequence,
    rank:src.rank,
    support:src.support,
    sourceTarget:src.target,
    sourceTargetReservoirTemplateExists:src.targetReservoirTemplateExists,
    sourceCpcReentryPromising:src.cpcReentryPromising,
    sourceExactBridge,
    defenderReplies,
    legacyRepairClosed,
    unresolvedDefenderColumns:defenderReplies.filter(x=>!x.closed).map(x=>x.defenderColumn)
  });
}

const legacyRepairClosedIds=sourceStates.filter(x=>x.legacyRepairClosed).map(x=>x.id);
const newlyRecoveredByLegacyRepairIds=sourceStates
  .filter(x=>x.legacyRepairClosed&&x.sourceTargetReservoirTemplateExists===false)
  .map(x=>x.id);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_legacy_repair_route_reentry_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  design:'CPC_RANK20_LEGACY_REPAIR_ROUTE_REENTRY_PROBE_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  proofEngine:{
    kind:'standard7x6-repair-capacity-exact-certificate-v1',
    path:'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs',
    maxProofStatesPerAttempt:PROOF_CAP
  },
  sourceStates,
  summary:{
    sourceStateCount:sourceStates.length,
    exactBridgePassCount:sourceStates.filter(x=>x.sourceExactBridge.pass).length,
    legacyRepairClosedCount:legacyRepairClosedIds.length,
    legacyRepairClosedIds,
    newlyRecoveredByLegacyRepairIds,
    proofAttemptCount,
    provedTargetCount,
    logicalRepairRejectionCount,
    resourceFailureCount
  },
  conclusion:[
    'This probe queries the older adaptive repair-capacity certificate family before treating the live post-contraction RCIC states as new obstructions.',
    'Every admitted route requires exact support plus complete normalized P0/P1 residual-antichain equality between JSMinSys RBA and the older semantic-quotient kernel; support equality alone is never used.',
    'A LEGACY_REPAIR_CAPACITY closure reuses the already-qualified decreasing-mu repair theorem and is not ordinary free-branch minimax.',
    'Any source state closed here but rejected by deterministic target-reservoir routing is direct evidence of an incomplete unified proof-routing catalog.',
    'Logical rejection and resource exhaustion are reported separately.'
  ],
  boundary:[
    'This is research-side integration evidence only and does not by itself certify the rank-20 root.',
    'No oracle, Pons score, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.',
    'An exact legacy closure is a proof route for that exact state; broader class reuse still requires a sound adapter/congruence theorem.'
  ]
},null,2));
