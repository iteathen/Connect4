#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const SOURCE='CPC_Q5D34_G5_SURVIVOR_RANK38_MONOTONE_COMPOSITION_0_1.json';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const TARGETS=Object.freeze([
  '4f5444dc55bb5371',
  '60fba7c1d1c84a97',
  'e7eb0902f1f7984c',
]);

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
}=await load('cpc-connect4');

const kernelMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
const domain=await import('../../../semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs');
const repairMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs');
const {createSlot64ResidualQuotientKernel}=kernelMod;
const {createRepairCapacityProofEngine}=repairMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P0=0,P1=1,P0_WIN=3,P1_WIN=1,DRAW=2;
const CPC_NAMES=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

function makeKernel(){
  const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
    cacheEdges:true,prefixClasses:4096,responseClosure:true,
    searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
  });
  kernel.prepareSearchStorage();
  return kernel;
}
function semReplay(k,sequence){
  let id=k.rootId;
  for(const d of sequence){
    const n=k.advance(id,Number(d)-1);
    assert(Number.isSafeInteger(n)&&n>=0,'semantic replay terminal/illegal '+sequence);
    id=n;
  }
  return id;
}
function semRank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function semSupport(k,id){
  const s=k.states.supportAt(id),out=[];
  for(let c=0;c<7;c++){
    const x=k.supportAccess.landingAt(s,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let cell=0;cell<42;cell++)if(hasBit(term,cell))out.push(cell);return out;}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){const aa=keyArray(a),bb=new Set(keyArray(b));return aa.length<bb.size&&aa.every(x=>bb.has(x));}
function normalize(keys){const u=[...new Set(keys)];return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();}
function semResidualKeys(k,id,p){
  const cid=p===0?k.states.p0At(id):k.states.p1At(id);
  return normalize(k.classes.terms(cid).map(termCells).map(keyCells));
}
function semKey(k,id){
  return 'r'+semRank(k,id)+'|h'+semSupport(k,id).join(',')+
    '|p0:'+semResidualKeys(k,id,0).join(';')+
    '|p1:'+semResidualKeys(k,id,1).join(';');
}
function qClass(k,id){return createHash('sha256').update(semKey(k,id)).digest('hex').slice(0,16);}

function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsSupport(q){return Array.from(q.words.slice(0,7));}
function jsStep(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<7&&q.words[column]<6);
  const words=new Uint32Array(g.keyWords);
  const basis=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,q.words,0,q.basis,0,q.n,column,words,0,basis,0,seen,sizes,0);
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function exactBridge(sequence,jsq,k,sid){
  const checks={
    rank:jsRank(jsq)===semRank(k,sid)&&jsRank(jsq)===sequence.length,
    support:JSON.stringify(jsSupport(jsq))===JSON.stringify(semSupport(k,sid)),
    p0Residuals:JSON.stringify(jsResidualKeys(jsq,P0))===JSON.stringify(semResidualKeys(k,sid,P0)),
    p1Residuals:JSON.stringify(jsResidualKeys(jsq,P1))===JSON.stringify(semResidualKeys(k,sid,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,semanticQClass:qClass(k,sid)};
}
function coordHas(q,p,index){
  const base=p?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,p){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);
  return out;
}
function shapeCells(id){
  const out=[],b=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[b+i]);
  return out;
}
function jsResidualKeys(q,p){return normalize(activeIds(q,p).map(id=>keyCells(shapeCells(id))));}
function legalColumns(q){
  const out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6)out.push(c);
  return out;
}
function cpcState(q){
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:CPC_NAMES.get(kind),
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
    };
  }
  return out;
}
function outcomeOfTerminal(code){
  if(code===P0_WIN)return 'P0_WIN';
  if(code===P1_WIN)return 'P1_WIN';
  if(code===DRAW)return 'DRAW';
  return null;
}
function eventCoord(cell){
  return {
    cell,
    column:(cell%7)+1,
    row:Math.floor(cell/7)+1,
  };
}
function eventMapFromSupport(support){
  const open=support.map((h,c)=>({c,h,remaining:6-h})).filter(x=>x.remaining>0);
  assert.equal(open.length,2,'3+1 tail must have two open columns');
  const chain=open.find(x=>x.remaining===3);
  const singleton=open.find(x=>x.remaining===1);
  assert(chain&&singleton,'expected one 3-chain and one singleton');
  const cells={
    A1:chain.h*7+chain.c,
    A2:(chain.h+1)*7+chain.c,
    A3:(chain.h+2)*7+chain.c,
    B:singleton.h*7+singleton.c,
  };
  return {
    chainColumn:chain.c+1,
    singletonColumn:singleton.c+1,
    cells,
    events:Object.fromEntries(Object.entries(cells).map(([name,cell])=>[name,eventCoord(cell)])),
  };
}
const EXTENSIONS=Object.freeze([
  Object.freeze(['B','A1','A2','A3']),
  Object.freeze(['A1','B','A2','A3']),
  Object.freeze(['A1','A2','B','A3']),
  Object.freeze(['A1','A2','A3','B']),
]);
function incidence(residualKeys,eventCells){
  const byCell=new Map(Object.entries(eventCells).map(([name,cell])=>[cell,name]));
  return residualKeys.map(key=>{
    const cells=keyArray(key);
    const events=cells.filter(x=>byCell.has(x)).map(x=>byCell.get(x));
    return {
      residualCells:cells,
      remainingEvents:events,
      remainingEventCount:events.length,
      allResidualCellsRemaining:events.length===cells.length,
    };
  });
}
function semanticSnapshot(k,e,state){
  const rank=e.rank(state);
  return {
    exactQClass:qClass(k,state),
    rank,
    mover:(rank&1)?'P1':'P0',
    support:semSupport(k,state),
    legalColumns:e.legal(state).map(c=>c+1),
    residuals:{
      P0:semResidualKeys(k,state,P0).map(keyArray),
      P1:semResidualKeys(k,state,P1).map(keyArray),
    },
    enabledSingletons:{
      P0:e.enabledSingletons(state,P0).map(e.coord),
      P1:e.enabledSingletons(state,P1).map(e.coord),
    },
  };
}
function actionDisposition(outcomes){
  if(outcomes.every(x=>x==='P0_WIN'))return 'P0_WIN_ALL_EXTENSIONS';
  if(outcomes.every(x=>x!=='P0_WIN'))return 'P0_NONWIN_ALL_EXTENSIONS';
  return 'MIXED_EXTENSION_OUTCOMES';
}
function compactProfile(state){
  return {
    A1:state.rootActions.find(x=>x.firstEvent==='A1')?.disposition??null,
    B:state.rootActions.find(x=>x.firstEvent==='B')?.disposition??null,
  };
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_q5d34_g5_survivor_rank38_monotone_composition.v1');
assert.equal(source.uniqueQClassCount,5);
const sourceByQ=new Map(source.qClassifications.map(x=>[x.exactQClass,x]));

const k=makeKernel();
const e=createRepairCapacityProofEngine(k,{maxProofStates:1});
const states=[];

for(const exactQClass of TARGETS){
  const src=sourceByQ.get(exactQClass);assert(src,'source q missing '+exactQClass);
  assert.equal(src.rank,38);
  assert.equal(src.disposition,'UNKNOWN');
  const sequence=src.representativeSequence;
  const jsRoot=jsFromSequence(sequence);
  const semRoot=semReplay(k,sequence);
  const bridge=exactBridge(sequence,jsRoot,k,semRoot);
  assert(bridge.pass);
  assert.equal(bridge.semanticQClass,exactQClass);
  assert.equal(jsRank(jsRoot),38);
  const support=jsSupport(jsRoot);
  assert.deepEqual(support,src.support);

  const eventMap=eventMapFromSupport(support);
  const rootResiduals={
    P0:semResidualKeys(k,semRoot,P0),
    P1:semResidualKeys(k,semRoot,P1),
  };
  const residualIncidence={
    P0:incidence(rootResiduals.P0,eventMap.cells),
    P1:incidence(rootResiduals.P1,eventMap.cells),
  };

  const linearExtensions=[];
  for(const events of EXTENSIONS){
    let js=jsRoot;
    let sem=semRoot;
    let seq=sequence;
    const prefixes=[];
    let outcome=null;
    for(let index=0;index<events.length;index++){
      const event=events[index];
      const cell=eventMap.cells[event];
      const column=cell%7;
      const beforeRank=jsRank(js);
      const mover=(beforeRank&1)?'P1':'P0';
      const accessible=legalColumns(js).map(c=>c+1);
      assert(accessible.includes(column+1),'event not accessible in extension');
      assert.equal(js.words[column],Math.floor(cell/7),'event row not current frontier');

      const beforeQ=qClass(k,sem);
      const jsNext=jsStep(js,column);
      const semNext=k.advance(sem,column);
      const terminal=outcomeOfTerminal(jsNext.terminal);
      if(terminal){
        if(terminal==='P0_WIN'||terminal==='P1_WIN')assert.equal(semNext,domain.QN_TERMINAL_WIN,'semantic terminal mismatch');
        prefixes.push({
          index:index+1,
          event,
          cell:eventCoord(cell),
          mover,
          beforeQ,
          beforeSupport:jsSupport(js),
          accessibleColumns:accessible,
          afterSupport:jsSupport(jsNext),
          terminal,
          eventProduct:{
            E:{played:event,accessibleColumns:accessible,afterSupport:jsSupport(jsNext)},
            P:{mover,ply:beforeRank+1},
            R:null,
            C:null,
            N:{terminal},
          },
        });
        outcome=terminal;
        break;
      }
      assert(semNext>=0,'semantic/js nonterminal mismatch');
      seq+=String(column+1);
      js=jsNext;
      sem=semNext;
      const snap=semanticSnapshot(k,e,sem);
      assert.equal(snap.exactQClass,qClass(k,sem));
      prefixes.push({
        index:index+1,
        event,
        cell:eventCoord(cell),
        mover,
        beforeQ,
        beforeSupport:null,
        accessibleColumns:accessible,
        afterSupport:snap.support,
        terminal:null,
        eventProduct:{
          E:{played:event,accessibleColumns:accessible,afterSupport:snap.support},
          P:{mover,nextMover:snap.mover,ply:snap.rank},
          R:snap.residuals,
          C:{enabledSingletons:snap.enabledSingletons},
          N:{terminal:null,exactQClass:snap.exactQClass},
        },
        cpc:cpcState(js),
      });
    }
    if(!outcome){
      assert.equal(jsRank(js),42);
      outcome='DRAW';
    }
    linearExtensions.push({
      events:[...events],
      firstEvent:events[0],
      firstColumn:eventMap.events[events[0]].column,
      outcome,
      prefixes,
    });
  }

  const firstEvents=['A1','B'];
  const rootActions=firstEvents.map(firstEvent=>{
    const rows=linearExtensions.filter(x=>x.firstEvent===firstEvent);
    const outcomes=rows.map(x=>x.outcome);
    return {
      firstEvent,
      column:eventMap.events[firstEvent].column,
      extensionCount:rows.length,
      outcomes,
      disposition:actionDisposition(outcomes),
    };
  });

  const outcomeCounts={P0_WIN:0,P1_WIN:0,DRAW:0};
  for(const x of linearExtensions)outcomeCounts[x.outcome]++;

  states.push({
    exactQClass,
    sequence,
    rank:38,
    support,
    exactBridge:bridge,
    remainingEventCount:4,
    remainingEvents:eventMap.events,
    poset:{
      kind:'THREE_CHAIN_PLUS_SINGLETON',
      chain:['A1','A2','A3'],
      singleton:'B',
      edges:[['A1','A2'],['A2','A3']],
      chainColumn:eventMap.chainColumn,
      singletonColumn:eventMap.singletonColumn,
    },
    rootCpc:cpcState(jsRoot),
    rootEnabledSingletons:{
      P0:e.enabledSingletons(semRoot,P0).map(e.coord),
      P1:e.enabledSingletons(semRoot,P1).map(e.coord),
    },
    residualIncidence,
    linearExtensions,
    rootActions,
    outcomeCounts,
  });
}

const byFingerprint=new Map();
for(const s of states){
  const fingerprint=JSON.stringify({
    P0:s.residualIncidence.P0.map(x=>x.remainingEvents),
    P1:s.residualIncidence.P1.map(x=>x.remainingEvents),
  });
  if(!byFingerprint.has(fingerprint))byFingerprint.set(fingerprint,[]);
  byFingerprint.get(fingerprint).push(s);
}
const fingerprintGroups=[...byFingerprint.entries()].map(([fingerprint,members])=>({
  fingerprint,
  qClasses:members.map(x=>x.exactQClass),
  actionProfiles:members.map(x=>({q:x.exactQClass,profile:compactProfile(x)})),
  sameActionProfile:new Set(members.map(x=>JSON.stringify(compactProfile(x)))).size===1,
}));
const sameIncidenceImpliesSameActionProfile=fingerprintGroups.every(x=>x.sameActionProfile);
const structurallyClosedActions=states.flatMap(s=>s.rootActions.filter(a=>a.disposition!=='MIXED_EXTENSION_OUTCOMES').map(a=>({
  exactQClass:s.exactQClass,
  firstEvent:a.firstEvent,
  column:a.column,
  disposition:a.disposition,
})));

const totalOutcomeCounts={P0_WIN:0,P1_WIN:0,DRAW:0};
for(const s of states)for(const [k0,v] of Object.entries(s.outcomeCounts))totalOutcomeCounts[k0]+=v;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank38_3plus1_tail_event_product.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_RANK38_3PLUS1_TAIL_EVENT_PRODUCT_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  states,
  crossStateComparison:{
    fingerprintGroupCount:fingerprintGroups.length,
    fingerprintGroups,
    sameIncidenceImpliesSameActionProfile,
    structuralCandidate: sameIncidenceImpliesSameActionProfile
      ? 'Within the observed 3+1-tail family, identical residual-incidence signatures imply identical root-action extension dispositions.'
      : 'Residual-incidence equality is falsified as a sufficient decoder by at least one observed 3+1-tail pair.',
    generalizationStatus:'OBSERVED_FAMILY_ONLY_NOT_YET_QUALIFIED',
  },
  summary:{
    stateCount:states.length,
    totalLinearExtensions:states.length*4,
    totalOutcomeCounts,
    structurallyClosedActionCount:structurallyClosedActions.length,
    structurallyClosedActions,
    mixedActionCount:states.flatMap(s=>s.rootActions).filter(x=>x.disposition==='MIXED_EXTENSION_OUTCOMES').length,
    resourceFailureCount:0,
  },
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'Each exact rank-38 state is reduced to the four linear extensions of its already-present 3+1 remaining-event partial order, with exact first-win stopping on every prefix.',
    'The result is an exact finite current-state event-product certificate; no solved-game value is consumed.',
    'Root actions are classified only from all compatible extensions of the fixed event poset, and residual-incidence signatures are compared separately before any theorem generalization.',
  ],
  boundary:[
    'This experiment qualifies only the three exact rank-38 states and their 3+1 event-product certificates.',
    'A reusable theorem beyond the observed family requires a separate frozen qualification and falsification campaign.',
    'No oracle, solved W/D/L, minimax database, opening book, best-move table, unrestricted game-tree search, BSFP solved frontier, or support-only exact-state merge is used.',
    'Production CPC, JSMinSys, and BSFP are unchanged.',
  ],
},null,2));
