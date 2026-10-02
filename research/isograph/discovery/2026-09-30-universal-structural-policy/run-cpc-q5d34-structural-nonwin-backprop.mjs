#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {predecessorInterval} from './rlc-proof-library-catalog.mjs';

const library=process.argv[2];assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT_SEQUENCE='4444415666662322224255115153113777';
const ROOT_Q='5d34e24395b9d801';
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');

const kernelMod=await import('../../../semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs');
const {createSlot64ResidualQuotientKernel}=kernelMod;

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const P0=0,P1=1;

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
    '|p0:'+semResidualKeys(k,id,P0).join(';')+
    '|p1:'+semResidualKeys(k,id,P1).join(';');
}
function qClass(k,id){return createHash('sha256').update(semKey(k,id)).digest('hex').slice(0,16);}
function jsFromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function jsRank(q){return q.words[g.metaOffset]>>>2;}
function jsSupport(q){return Array.from(q.words.slice(0,7));}
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
function exactBridge(sequence,expectedQ,expectedRank,expectedSupport,k){
  const sid=semReplay(k,sequence);
  const jsq=jsFromSequence(sequence);
  const checks={
    semanticQ:qClass(k,sid)===expectedQ,
    rank:semRank(k,sid)===expectedRank&&jsRank(jsq)===expectedRank,
    support:JSON.stringify(semSupport(k,sid))===JSON.stringify(expectedSupport)&&
      JSON.stringify(jsSupport(jsq))===JSON.stringify(expectedSupport),
    p0Residuals:JSON.stringify(semResidualKeys(k,sid,P0))===JSON.stringify(jsResidualKeys(jsq,P0)),
    p1Residuals:JSON.stringify(semResidualKeys(k,sid,P1))===JSON.stringify(jsResidualKeys(jsq,P1)),
  };
  return {pass:Object.values(checks).every(Boolean),checks,exactQClass:qClass(k,sid)};
}
function read(name){return JSON.parse(readFileSync(resolve(import.meta.dirname,name),'utf8'));}
function unknown(){return [-1,1];}
function nonwin(){return [-1,0];}
function draw(){return [0,0];}
function loss(){return [-1,-1];}

const rootEvidence=read('CPC_Q966_G_BRANCH_FORCED_SAFETY_0_1.json');
const efEvidence=read('CPC_Q5D34_EF_NONWIN_CONVERGENCE_0_1.json');
const g4Evidence=read('CPC_Q5D34_G4_FOUR_REPLY_FORCED_SAFETY_0_1.json');
const g5Evidence=read('CPC_Q5D34_G4_EF_REPLY_G5_SURVIVOR_0_1.json');
const tailQualification=read('CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json');

assert.equal(rootEvidence.schema,'connect4.cpc_q966_g_branch_forced_safety.v1');
assert.equal(efEvidence.schema,'connect4.cpc_q5d34_ef_nonwin_convergence.v1');
assert.equal(g4Evidence.schema,'connect4.cpc_q5d34_g4_four_reply_forced_safety.v1');
assert.equal(g5Evidence.schema,'connect4.cpc_q5d34_g4_ef_reply_g5_survivor.v1');
assert.equal(tailQualification.schema,'connect4.cpc_3plus1_deferred_singleton_tail_qualification.v1');
assert.equal(tailQualification.accept,true);

const k=makeKernel();
const rootLast=rootEvidence.steps.at(-1);
assert(rootLast);
assert.equal(rootLast.exactQClass,ROOT_Q);
assert.equal(rootLast.sequence,ROOT_SEQUENCE);
assert.equal(rootLast.rank,34);
assert.deepEqual(rootLast.support,[6,6,3,6,5,5,3]);
assert.deepEqual(rootLast.legalActions,[3,5,6,7]);
assert.deepEqual(rootLast.safeActions,[5,6,7]);
const rootBridge=exactBridge(ROOT_SEQUENCE,ROOT_Q,34,[6,6,3,6,5,5,3],k);
assert(rootBridge.pass);

const cAction=rootLast.actionAudit.find(x=>x.column===3);
assert(cAction&&!cAction.safe);
assert.deepEqual(cAction.opponentImmediateTerminals,[{column:3,cell:'C5'}]);

assert.equal(efEvidence.classification,'EF_NONWIN_G_SURVIVES');
assert.equal(g4Evidence.sourceQ,ROOT_Q);
assert.equal(g4Evidence.p0Action,7);
assert.equal(g5Evidence.classification,'G4_STILL_UNRESOLVED');

const drawQ=new Set(tailQualification.states.filter(x=>x.accept&&x.exactDraw).map(x=>x.exactQClass));
assert.deepEqual([...drawQ].sort(),[
  '4f5444dc55bb5371',
  '60fba7c1d1c84a97',
  'e7eb0902f1f7984c',
].sort());

const rank37Survivors=[];
const rank37ByQ=new Map();
for(const row of g5Evidence.cases){
  const bridge=exactBridge(row.survivorSequence,row.survivorQ,37,row.startSupport,k);
  assert(bridge.pass);
  const step=row.steps[0];assert(step);
  assert.equal(step.exactQClass,row.survivorQ);
  const childIntervals=[];
  const drawReplyQClasses=[];
  for(const a of step.actionAudit){
    if(drawQ.has(a.childQ)){
      childIntervals.push(draw());
      drawReplyQClasses.push(a.childQ);
    }else childIntervals.push(unknown());
  }
  assert(drawReplyQClasses.length>=1);
  const interval=predecessorInterval(1,childIntervals);
  assert(interval[1]<=0);
  const out={
    exactQClass:row.survivorQ,
    sequence:row.survivorSequence,
    support:row.startSupport,
    bridge,
    legalP1Columns:step.legalActions,
    drawReplyQClasses:[...new Set(drawReplyQClasses)].sort(),
    replyIntervals:step.actionAudit.map((a,i)=>({column:a.column,childQ:a.childQ,interval:childIntervals[i]})),
    interval:{lower:interval[0],upper:interval[1]},
  };
  rank37Survivors.push(out);
  rank37ByQ.set(out.exactQClass,out);
}
assert.equal(rank37Survivors.length,2);

const rank36Predecessors=[];
const rank36ByQ=new Map();
for(const row of g5Evidence.cases){
  const g4Reply=g4Evidence.replies.find(x=>x.startQ===row.predecessorQ);
  assert(g4Reply,'rank36 predecessor not found');
  const bridge=exactBridge(g4Reply.startSequence,row.predecessorQ,36,g4Reply.startSupport,k);
  assert(bridge.pass);
  const step=g4Reply.steps[0];assert(step);
  const legal=step.legalActions;
  const eliminated=row.alreadyEliminatedAction.column;
  const drawAction=row.knownNonwinAction.column;
  const survivorAction=row.survivorAction;
  assert.deepEqual([...legal].sort((a,b)=>a-b),[eliminated,drawAction,survivorAction].sort((a,b)=>a-b));
  assert.equal(row.knownNonwinAction.reason,'EXACT_Q649_DRAW_HANDOFF');
  const survivor=rank37ByQ.get(row.survivorQ);assert(survivor);
  const actionIntervals=legal.map(column=>{
    if(column===eliminated)return {column,kind:'IMMEDIATE_P1_TERMINAL_EXPOSURE',interval:loss()};
    if(column===drawAction)return {column,kind:'EXACT_Q649_DRAW_HANDOFF',interval:draw()};
    if(column===survivorAction)return {column,kind:'G5_TO_RANK37_NONWIN',interval:[survivor.interval.lower,survivor.interval.upper]};
    throw new Error('uncovered rank36 action '+column);
  });
  const interval=predecessorInterval(0,actionIntervals.map(x=>x.interval));
  assert.deepEqual(interval,[0,0]);
  const out={
    exactQClass:row.predecessorQ,
    sequence:g4Reply.startSequence,
    support:g4Reply.startSupport,
    bridge,
    actionIntervals,
    interval:{lower:interval[0],upper:interval[1]},
    exactDraw:true,
  };
  rank36Predecessors.push(out);
  rank36ByQ.set(out.exactQClass,out);
}
assert.equal(rank36Predecessors.length,2);

const g4ReplyIntervals=[];
const g4DrawReplyQClasses=[];
for(const reply of g4Evidence.replies){
  const d=rank36ByQ.get(reply.startQ);
  if(d){
    g4ReplyIntervals.push(draw());
    g4DrawReplyQClasses.push(reply.startQ);
  }else g4ReplyIntervals.push(unknown());
}
assert(g4DrawReplyQClasses.length>=1);
const g4Interval=predecessorInterval(1,g4ReplyIntervals);
assert(g4Interval[1]<=0);
const g4Action={
  column:7,
  kind:'P1_REPLY_TO_EXACT_DRAW_CHILD',
  drawReplyQClasses:g4DrawReplyQClasses.sort(),
  replyIntervals:g4Evidence.replies.map((x,i)=>({p1Column:x.p1Action,childQ:x.startQ,interval:g4ReplyIntervals[i]})),
  interval:{lower:g4Interval[0],upper:g4Interval[1]},
};

const rootActions=[
  {column:3,kind:'IMMEDIATE_P1_TERMINAL_EXPOSURE',interval:loss()},
  {column:5,kind:'QUALIFIED_E_NONWIN',interval:nonwin()},
  {column:6,kind:'QUALIFIED_F_NONWIN',interval:nonwin()},
  {column:7,kind:'G4_TO_P1_DRAW_REPLY',interval:[g4Interval[0],g4Interval[1]]},
];
const rootInterval=predecessorInterval(0,rootActions.map(x=>x.interval));
assert.deepEqual(rootInterval,[-1,0]);

console.log(JSON.stringify({
  schema:'connect4.cpc_q5d34_structural_nonwin_backprop.v1',
  date:'2026-10-01',
  jsMinSysSha:EXPECTED,
  design:'CPC_Q5D34_STRUCTURAL_NONWIN_BACKPROP_DESIGN_0_1.md',
  exactQClass:ROOT_Q,
  sequence:ROOT_SEQUENCE,
  rank:34,
  support:[6,6,3,6,5,5,3],
  exactBridge:rootBridge,
  rank38DrawPremise:{
    theorem:'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md',
    qualification:'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json',
    exactQClasses:[...drawQ].sort(),
    accept:true,
    interval:{lower:0,upper:0},
  },
  rank37Survivors,
  rank36Predecessors,
  g4Action,
  rootActions,
  classification:'P0_NONWIN',
  interval:{lower:rootInterval[0],upper:rootInterval[1]},
  resourceFailureCount:0,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'The qualified 3+1 tail theorem upgrades three rank-38 consequence classes to exact draws.',
    'Each rank-37 G5 survivor is P0-nonwinning because P1 has at least one legal reply into an exact draw child.',
    'Each exact rank-36 E/F-reply predecessor is an exact draw: its immediate-exposure action loses, its q649 action draws, and its G5 action reaches a P0-nonwinning P1 state.',
    'After q5d:G4, P1 can choose E6 or F6 into one of those exact rank-36 draws, so G4 cannot force a P0 win.',
    'At q5d34, C4 admits immediate P1 terminal C5, E6 and F6 are already qualified nonwinning, and G4 is now nonwinning. Therefore q5d34 has the sound interval [-1,0].',
  ],
  boundary:[
    'This proves P0_NONWIN only. It does not silently upgrade q5d34 to loss or draw.',
    'Every handoff uses exact semantic-q identity. Unknown sibling replies remain [-1,1] and are narrowed only by monotone predecessor algebra.',
    'No oracle, solved W/D/L input, minimax, unrestricted game-tree value, opening book, best-move table or BSFP solved frontier is used.',
    'Production CPC, JSMinSys and BSFP are unchanged.',
  ],
},null,2));
