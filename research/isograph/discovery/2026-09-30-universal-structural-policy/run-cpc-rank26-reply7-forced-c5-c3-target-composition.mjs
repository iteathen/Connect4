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
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
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
const C1=0,C5=4;
const TARGET_COLUMN=2,TARGET_ROW=4,TARGET=TARGET_ROW*g.columns+TARGET_COLUMN; // c3r5
const sequence='44444156666623222242331775';

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
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
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
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
    rows.push({
      replyColumn:d+1,
      replyTerminal:reply.terminal,
      nextP1C5Terminal,
      avoidsImmediateP1C5Win:avoids,
    });
  }
  return {
    rows,
    avoidingMask:avoidingMask>>>0,
    avoidingColumns:rows.filter(x=>x.avoidsImmediateP1C5Win).map(x=>x.replyColumn),
    onlyC5:avoidingMask===(1<<C5),
  };
}

function coverageWitness(q,id,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===TARGET_COLUMN&&r>TARGET_ROW)
      return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
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
  if(connect4CpcTargetOwner32(g,q.words,0,TARGET)!==P1)return null;
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
      coverage.push({residualId:id,size:g.shapeSize[id],containsTarget:shapeHasCell(id,TARGET),witness});
    }
    const pairs=[];
    for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,
      targetIsResponse,
      targetDepth,
      targetPrefixLength:targetL,
      defenderResidualCount:defenderIds.length,
      coverage,
      mate:Array.from(map.mate),
      role:Array.from(map.role),
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
function validateTargetTemplate(q,template){
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
      if(d.terminal===P2_WIN){
        failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;
      }
      if(d.terminal){
        failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===TARGET)targetTerminals++;
        continue;
      }
      if(a.terminal){
        failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;
      }
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,20),
  };
}

const state=fromSequence(sequence);
assert.equal(state.terminal,0);
assert.equal(state.words[g.metaOffset]>>>2,26);
assert.equal((state.words[g.metaOffset]>>>2)&1,P1);
assert.deepEqual(support(state),[2,6,3,6,2,5,2]);

const afterP1c5=step(state,C5);
const baseline=afterP1c5.terminal===0?cpc(afterP1c5,false):null;
const frontier=afterP1c5.terminal===0?cpc(afterP1c5,true):null;
const literal=afterP1c5.terminal===0?literalOnlyC5AvoidsImmediateWin(afterP1c5):{
  rows:[],avoidingMask:0,avoidingColumns:[],onlyC5:false
};
const nativeCpcForcesC5=
  !!baseline&&!!frontier&&
  baseline.forcedColumn===5&&frontier.forcedColumn===5&&
  baseline.preemptionCount===1&&frontier.preemptionCount===1&&
  baseline.preemptionMask32===(1<<C5)&&frontier.preemptionMask32===(1<<C5);

const forcedP2c5=afterP1c5.terminal===0?step(afterP1c5,C5):null;
const afterP1c1=
  !!forcedP2c5&&forcedP2c5.terminal===0&&forcedP2c5.words[C1]<6
    ?step(forcedP2c5,C1)
    :null;

const c3r5Singleton=
  !!afterP1c1&&afterP1c1.terminal===0&&hasActiveSingleton(afterP1c1,P1,TARGET);
const c3r5ProjectedOwner=
  !!afterP1c1&&afterP1c1.terminal===0
    ?connect4CpcTargetOwner32(g,afterP1c1.words,0,TARGET)+1
    :null;
const defenderPlayableSingletons=
  !!afterP1c1&&afterP1c1.terminal===0?playableSingletons(afterP1c1,P2):[];
const template=
  !!afterP1c1&&afterP1c1.terminal===0&&c3r5Singleton&&c3r5ProjectedOwner===1&&defenderPlayableSingletons.length===0
    ?findTargetTemplate(afterP1c1)
    :null;
const validation=template?validateTargetTemplate(afterP1c1,template):null;

const accept=
  afterP1c5.terminal===0&&
  nativeCpcForcesC5&&literal.onlyC5&&
  !!forcedP2c5&&forcedP2c5.terminal===0&&
  !!afterP1c1&&afterP1c1.terminal===0&&
  c3r5Singleton&&c3r5ProjectedOwner===1&&
  defenderPlayableSingletons.length===0&&
  !!template&&template.targetIsResponse===true&&
  !!validation?.pass;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank26_reply7_forced_c5_c3_target_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  theoremCandidate:'CPC_RANK26_REPLY7_FORCED_C5_C3_TARGET_COMPOSITION_THEOREM.md',
  state:{
    sequence,
    rank:26,
    mover:1,
    support:support(state),
  },
  p1c5:{
    terminal:afterP1c5.terminal,
    support:support(afterP1c5),
    nativeCpc:{baseline,frontier},
    nativeCpcForcesC5,
    literal,
    literalOnlyC5:literal.onlyC5,
  },
  forcedP2c5:{
    terminal:forcedP2c5?.terminal??null,
    support:forcedP2c5?support(forcedP2c5):null,
  },
  p1c1:{
    terminal:afterP1c1?.terminal??null,
    support:afterP1c1?support(afterP1c1):null,
    c3r5Singleton,
    c3r5ProjectedOwner,
    defenderPlayableSingletons,
    targetTemplate:template?{
      target:{column:3,row:5,cell:TARGET},
      capacity:template.capacity,
      oddColumns:template.oddColumns,
      synchronizedPairs:template.synchronizedPairs,
      targetIsResponse:template.targetIsResponse,
      defenderResidualCount:template.defenderResidualCount,
      coverage:template.coverage,
    }:null,
    validation,
  },
  accept,
  conclusion:accept?[
    'The exact rank-26 reply-7 state is a Player-1 win by column 5.',
    'P1:c5 gives a uniquely forced P2:c5 response under both production CPC and literal exact cofactors.',
    'The forced rank-28 child then admits P1:c1, contracting to an active Player-1 c3r5 singleton with no playable defender singleton.',
    'A freshly synthesized finite c3r5 target-reservoir certificate exhaustively reaches only Player-1 first wins.'
  ]:[
    'At least one frozen forced-c5 / c3-target premise failed; the theorem is rejected or requires narrowing.'
  ],
  boundary:[
    'The rank-26 move selection is justified only by current-state CPC/RBA facts inside this theorem; no local value file is loaded.',
    'All transitions use exact RBA cofactors and the c5 restriction is independently cross-checked by literal defender replies.',
    'The c3r5 target-reservoir template is freshly synthesized and exhaustively traversed on the exact post-c1 state.',
    'No oracle, Pons, solved W/D/L input, ordinary game-tree search, minimax, best-move table, BSFP solved frontier, physical identity, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
