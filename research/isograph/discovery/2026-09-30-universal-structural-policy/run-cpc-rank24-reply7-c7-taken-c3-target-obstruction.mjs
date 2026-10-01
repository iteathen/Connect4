#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const C5=4,TARGET_COLUMN=2,TARGET_ROW=4,TARGET=TARGET_ROW*g.columns+TARGET_COLUMN;
const X=4*g.columns+4; // c5r5
const Y=TARGET;
const parentSequence='4444415666662322224233';
const ing=connect4RbaFromMoves(Array.from(parentSequence,c=>Number(c)-1),{geometry:g,canonical:false});
const parent={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(parent.words[g.metaOffset]>>>2,22);
assert.equal((parent.words[g.metaOffset]>>>2)&1,P1);
assert.equal(parent.terminal,0);

function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function shapeEqualsPair(id,a,b){
  if(g.shapeSize[id]!==2)return false;
  const base=id*4,x=g.shapeCells[base],y=g.shapeCells[base+1];
  return (x===a&&y===b)||(x===b&&y===a);
}
function hasMinimalPair(q,player,a,b){
  return minimalIds(q,player).some(id=>shapeEqualsPair(id,a,b));
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
}
function kindName(k){
  if(k===CPC_NONE)return 'CPC_NONE';
  if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';
  if(k===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}
function cpc(q,frontierResponse){
  const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:false});
  const k=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
  return {
    kind:kindName(k),
    interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],
    preemptionMask32:s.preemptionMask32[0]>>>0,
  };
}

function literalOnlyC5AvoidsImmediateWin(q){
  const rows=[];
  let avoidingMask=0;
  for(let d=0;d<7;d++){
    if(q.words[d]>=6)continue;
    const reply=step(q,d);
    let avoids=false,nextP1C5Terminal=null;
    if(reply.terminal===P2_WIN||reply.terminal===2)avoids=true;
    else if(reply.terminal)avoids=true;
    else if(reply.words[C5]>=6)avoids=true;
    else{
      const next=step(reply,C5);
      nextP1C5Terminal=next.terminal;
      avoids=next.terminal!==P1_WIN;
    }
    if(avoids)avoidingMask|=1<<d;
    rows.push({replyColumn:d+1,replyTerminal:reply.terminal,nextP1C5Terminal,avoidsImmediateP1C5Win:avoids});
  }
  return {
    rows,
    avoidingMask:avoidingMask>>>0,
    avoidingColumns:Array.from({length:7},(_,c)=>c+1).filter((_,c)=>avoidingMask&(1<<c)),
    onlyC5:avoidingMask===(1<<C5),
  };
}

function coverageWitness(q,id,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===TARGET_COLUMN&&r>TARGET_ROW)return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
  }
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)
      return {kind:'vertical-response',cell,column:c+1,row:r+1};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))
        return {kind:'cross-pair',cells:[cell,mate],columns:[c+1,p+1],depth,L};
    }
  }
  return null;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*7+c,b=(hp+d)*7+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*7+c,hi=(h+d+1)*7+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function findTargetTemplate(q){
  if(!hasActiveSingleton(q,P1,TARGET))return null;
  const targetDepth=TARGET_ROW-q.words[TARGET_COLUMN];
  if(targetDepth<=0)return null;
  if(playableSingletons(q,P2).length)return null;

  const capacity=new Uint32Array(7),odd=[];
  let total=0;
  for(let c=0;c<7;c++){
    const cap=c===TARGET_COLUMN?TARGET_ROW-q.words[c]+1:6-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(7);partner.fill(-1);
  const length=new Uint32Array(7);
  let found=null;

  function evaluate(){
    const targetL=partner[TARGET_COLUMN]>=0?length[TARGET_COLUMN]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,partner,length);
      if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],witness});
    }
    const pairs=[];
    for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      capacity:Array.from(capacity),totalRelevant:total,oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,targetIsResponse,targetDepth,targetPrefixLength:targetL,
      defenderResidualCount:defenderIds.length,coverage,
      mate:Array.from(map.mate),role:Array.from(map.role),
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}
function validateTemplate(q,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(((state.words[g.metaOffset]>>>2)&1)!==P2){
      failures.push({kind:'wrong-mover',support:support(state)});return;
    }
    let legal=0;
    for(let c=0;c<7;c++){
      if(state.words[c]>=6)continue;
      legal++;
      const row=state.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;}
      if(d.terminal){failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;}
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){p1Terminals++;if(m===TARGET)targetTerminals++;continue;}
      if(a.terminal){failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;}
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {pass:failures.length===0,defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,failures:failures.slice(0,20)};
}

function contractAndCertify(start,mode){
  assert.equal((start.words[g.metaOffset]>>>2)&1,P1);
  assert(hasMinimalPair(start,P1,X,Y),'missing attached {c5r5,c7r3} minimal pair');
  assert.equal(connect4CpcTargetOwner32(g,start.words,0,X),P1);
  assert.equal(connect4CpcTargetOwner32(g,start.words,0,Y),P1);

  if(mode==='height2'){
    assert.equal(start.words[C5],2);
    const first=step(start,C5);
    assert.equal(first.terminal,0);
    const base=cpc(first,false),frontier=cpc(first,true),literal=literalOnlyC5AvoidsImmediateWin(first);
    const cpcForced=base.forcedColumn===5&&frontier.forcedColumn===5&&base.preemptionCount===1&&frontier.preemptionCount===1;
    const forced=step(first,C5);
    const beforeConsumePair=hasMinimalPair(forced,P1,X,Y);
    const consume=forced.terminal?forced:step(forced,C5);
    const singleton=!consume.terminal&&hasActiveSingleton(consume,P1,Y);
    const template=singleton?findTargetTemplate(consume):null;
    const validation=template?validateTemplate(consume,template):null;
    return {
      mode,firstSupport:support(first),nativeCpc:{baseline:base,frontier},literal,cpcForced,
      forcedReplyTerminal:forced.terminal,forcedReplySupport:support(forced),
      pairBeforeConsume:beforeConsumePair,
      consumeTerminal:consume.terminal,consumeSupport:support(consume),
      singletonAfterConsume:singleton,
      targetTemplate:template?{
        capacity:template.capacity,oddColumns:template.oddColumns,synchronizedPairs:template.synchronizedPairs,
        targetIsResponse:template.targetIsResponse,defenderResidualCount:template.defenderResidualCount,
        coverage:template.coverage,
      }:null,
      validation,
      accept:cpcForced&&literal.onlyC5&&forced.terminal===0&&beforeConsumePair&&consume.terminal===0&&singleton&&!!template&&!!validation?.pass,
    };
  }

  assert.equal(mode,'height1');
  assert.equal(start.words[C5],1);
  const first=step(start,C5);
  assert.equal(first.terminal,0);
  const branches=[];
  let accept=true;
  for(let d=0;d<7;d++){
    if(first.words[d]>=6)continue;
    const reply=step(first,d);
    const row={replyColumn:d+1,replyTerminal:reply.terminal};
    if(reply.terminal){row.accept=false;accept=false;branches.push(row);continue;}
    if(d===C5){
      const win=step(reply,C5);
      row.kind='direct-c5-reply';
      row.nextC5Terminal=win.terminal;
      row.accept=win.terminal===P1_WIN;
      if(!row.accept)accept=false;
      branches.push(row);continue;
    }
    const second=step(reply,C5);
    row.kind='off-column-compression';
    row.secondC5Terminal=second.terminal;
    if(second.terminal){row.accept=false;accept=false;branches.push(row);continue;}
    const base=cpc(second,false),frontier=cpc(second,true),literal=literalOnlyC5AvoidsImmediateWin(second);
    const cpcForced=base.forcedColumn===5&&frontier.forcedColumn===5&&base.preemptionCount===1&&frontier.preemptionCount===1;
    const forced=step(second,C5);
    const beforeConsumePair=!forced.terminal&&hasMinimalPair(forced,P1,X,Y);
    const consume=forced.terminal?forced:step(forced,C5);
    const singleton=!consume.terminal&&hasActiveSingleton(consume,P1,Y);
    const template=singleton?findTargetTemplate(consume):null;
    const validation=template?validateTemplate(consume,template):null;
    row.nativeCpc={baseline:base,frontier};
    row.literal=literal;
    row.cpcForced=cpcForced;
    row.forcedReplyTerminal=forced.terminal;
    row.pairBeforeConsume=beforeConsumePair;
    row.consumeTerminal=consume.terminal;
    row.consumeSupport=support(consume);
    row.singletonAfterConsume=singleton;
    row.targetTemplate=template?{
      capacity:template.capacity,oddColumns:template.oddColumns,synchronizedPairs:template.synchronizedPairs,
      targetIsResponse:template.targetIsResponse,defenderResidualCount:template.defenderResidualCount,
      coverage:template.coverage,
    }:null;
    row.validation=validation;
    row.accept=second.terminal===0&&cpcForced&&literal.onlyC5&&forced.terminal===0&&beforeConsumePair&&consume.terminal===0&&singleton&&!!template&&!!validation?.pass;
    if(!row.accept)accept=false;
    branches.push(row);
  }
  return {mode,firstSupport:support(first),branches,accept};
}

// Complete pairing census for the P2:c7 branch after P1:c1 contracts
// {c1r3,c3r5} to singleton c3r5.
let targetState=step(parent,0); // rank22 P1:c1
assert.equal(targetState.terminal,0);
targetState=step(targetState,6); // P2:c7 -> rank24 unresolved state
assert.equal(targetState.terminal,0);
targetState=step(targetState,6); // P1:c7
assert.equal(targetState.terminal,0);
targetState=step(targetState,6); // P2:c7 takes c7r3
assert.equal(targetState.terminal,0);
targetState=step(targetState,0); // P1:c1 -> singleton c3r5
assert.equal(targetState.terminal,0);
assert.equal(targetState.words[g.metaOffset]>>>2,27);
assert.equal((targetState.words[g.metaOffset]>>>2)&1,P2);
assert.deepEqual(support(targetState),[3,6,3,6,1,5,3]);

const singleton=hasActiveSingleton(targetState,P1,TARGET);
const defenderPlayable=playableSingletons(targetState,P2);
const projectedOwner=connect4CpcTargetOwner32(g,targetState.words,0,TARGET);

const capacity=new Uint32Array(7),odd=[];
let total=0;
for(let c=0;c<7;c++){
  const cap=c===TARGET_COLUMN?TARGET_ROW-targetState.words[c]+1:6-targetState.words[c];
  assert(cap>=0);
  capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
}
const defenderIds=activeIds(targetState,P2);
const partner=new Int32Array(7);partner.fill(-1);
const length=new Uint32Array(7);
const candidates=[];
let examined=0,targetRoleTemplates=0;

function cellsOf(id){
  const n=g.shapeSize[id],base=id*4,out=[];
  for(let i=0;i<n;i++){
    const cell=g.shapeCells[base+i];
    out.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  }
  return out;
}
function evaluate(){
  examined++;
  const targetDepth=TARGET_ROW-targetState.words[TARGET_COLUMN];
  const targetL=partner[TARGET_COLUMN]>=0?length[TARGET_COLUMN]:0;
  const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
  if(!targetIsResponse)return;
  targetRoleTemplates++;
  const covered=[],uncovered=[];
  for(const id of defenderIds){
    const witness=coverageWitness(targetState,id,partner,length);
    if(witness)covered.push({residualId:id,size:g.shapeSize[id],witness});
    else uncovered.push({residualId:id,size:g.shapeSize[id],cells:cellsOf(id)});
  }
  const pairs=[];
  for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
    pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
  candidates.push({synchronizedPairs:pairs,uncoveredCount:uncovered.length,coveredCount:covered.length,uncovered,covered});
}
function rec(pending){
  if(!pending.length){evaluate();return;}
  const a=pending[0];
  for(let j=1;j<pending.length;j++){
    const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
      max=Math.min(capacity[a],capacity[b]);
    partner[a]=b;partner[b]=a;
    for(let L=1;L<=max;L+=2){
      length[a]=L;length[b]=L;
      if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
      rec(rest);
    }
    partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
  }
}
if(!(total&1)&&!(odd.length&1))rec(odd);
candidates.sort((a,b)=>a.uncoveredCount-b.uncoveredCount||
  JSON.stringify(a.synchronizedPairs).localeCompare(JSON.stringify(b.synchronizedPairs)));
const bestCount=candidates.length?candidates[0].uncoveredCount:null;
const best=candidates.filter(x=>x.uncoveredCount===bestCount).slice(0,12);
const obstructionIds=[...new Set(best.flatMap(x=>x.uncovered.map(u=>u.residualId)))];

console.log(JSON.stringify({
  schema:'connect4.cpc_rank24_reply7_c7_taken_c3_target_obstruction.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  oracleValuesUsed:false,
  sourceHypothesis:'CPC_RANK24_REPLY7_C7_DUAL_OBLIGATION_HYPOTHESIS.md',
  state:{
    rank:targetState.words[g.metaOffset]>>>2,
    mover:((targetState.words[g.metaOffset]>>>2)&1)+1,
    support:support(targetState),
    target:{column:3,row:5,activeP1Singleton:singleton,projectedOwner:projectedOwner+1},
    defenderPlayableSingletons:defenderPlayable,
    truncatedCapacity:Array.from(capacity),
    oddColumns:odd.map(c=>c+1),
    activeDefenderResidualCount:defenderIds.length
  },
  search:{examinedTemplates:examined,targetRoleTemplates,bestUncoveredCount:bestCount,obstructionResidualIds:obstructionIds,bestTemplates:best},
  conclusion:[
    'This is a complete current-theorem pairing census for the c7-taken c3r5 singleton branch.',
    'No W/D/L value is inferred from the obstruction count.'
  ],
  boundary:[
    'No Pons result, oracle value, local game-tree value, solved W/D/L, minimax, best-move table, opening book, physical-position identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are unchanged.',
    'Residual IDs are diagnostic only; exact cell attachment is recorded.'
  ]
},null,2));
