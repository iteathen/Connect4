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
const {connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const TARGET_COLUMN=2,TARGET_ROW=4,TARGET=TARGET_ROW*7+TARGET_COLUMN; // c3r5
const sequence='444441566666232222423317771';
const ing=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
const q={words:ing.words,basis:ing.basis,n:ing.basis.length,terminal:ing.words[g.metaOffset]&3};
assert.equal(q.words[g.metaOffset]>>>2,27);
assert.equal((q.words[g.metaOffset]>>>2)&1,P2);
assert.equal(q.terminal,0);
assert.deepEqual(Array.from(q.words.slice(0,7)),[3,6,3,6,1,5,3]);

function step(s,column){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(g,profile,s.words,0,s.basis,0,s.n,column,words,0,basis,0,seen,sizes,0);
  return {words,basis,n:sizes[0],terminal};
}
function support(s){return Array.from(s.words.slice(0,7));}
function coordHas(s,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (s.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(s,player){
  const out=[];for(let i=0;i<s.n;i++)if(coordHas(s,player,i))out.push(s.basis[i]);return out;
}
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;return false;
}
function hasActiveSingleton(s,player,cell){
  return activeIds(s,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function playableSingletons(s,player){
  const out=[];
  for(const id of activeIds(s,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(s.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
}
function coverageWitness(s,id,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===TARGET_COLUMN&&r>TARGET_ROW)return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
  }
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-s.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)
      return {kind:'vertical-response',cell,column:c+1,row:r+1};
    if(p>=0&&depth<L){
      const mate=(s.words[p]+depth)*7+p;
      if(shapeHasCell(id,mate))
        return {kind:'cross-pair',cells:[cell,mate],columns:[c+1,p+1],depth,L};
    }
  }
  return null;
}
function buildPairMap(s,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<7;c++){
    const h=s.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=s.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*7+c,b=(hp+d)*7+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd tail');
      const lo=(h+d)*7+c,hi=(h+d+1)*7+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function findTemplate(s){
  if(!hasActiveSingleton(s,P1,TARGET))return null;
  if(playableSingletons(s,P2).length)return null;
  const targetDepth=TARGET_ROW-s.words[TARGET_COLUMN];
  if(targetDepth<=0)return null;

  const capacity=new Uint32Array(7),odd=[];let total=0;
  for(let c=0;c<7;c++){
    const cap=c===TARGET_COLUMN?TARGET_ROW-s.words[c]+1:6-s.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(s,P2),partner=new Int32Array(7),length=new Uint32Array(7);partner.fill(-1);
  let found=null;
  function evalTemplate(){
    const targetL=partner[TARGET_COLUMN]>=0?length[TARGET_COLUMN]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(s,id,partner,length);if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],witness});
    }
    const pairs=[];
    for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(s,capacity,partner,length);
    return {capacity:Array.from(capacity),totalRelevant:total,oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,targetIsResponse,targetDepth,targetPrefixLength:targetL,
      defenderResidualCount:defenderIds.length,coverage,mate:Array.from(map.mate),role:Array.from(map.role)};
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evalTemplate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);return found;
}
function validate(s,t){
  const mate=Int32Array.from(t.mate),role=Uint8Array.from(t.role),failures=[];
  let nodes=0,pairs=0,maxDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(x,depth){
    nodes++;maxDepth=Math.max(maxDepth,depth);
    if(((x.words[g.metaOffset]>>>2)&1)!==P2){failures.push({kind:'wrong-mover'});return;}
    let legal=0;
    for(let c=0;c<7;c++){
      if(x.words[c]>=6)continue;legal++;
      const row=x.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){failures.push({kind:'unmapped',column:c+1,row:row+1});continue;}
      const d=step(x,c);
      if(d.terminal===P2_WIN){failures.push({kind:'p2-terminal',column:c+1,row:row+1});continue;}
      if(d.terminal){failures.push({kind:'other-terminal',terminal:d.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){failures.push({kind:'response-illegal',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;}
      const a=step(d,rc);pairs++;
      if(a.terminal===P1_WIN){p1Terminals++;if(m===TARGET)targetTerminals++;continue;}
      if(a.terminal){failures.push({kind:'response-terminal',terminal:a.terminal});continue;}
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(s,0);
  return {pass:failures.length===0,defenderNodes:nodes,responsePairs:pairs,maxPairDepth:maxDepth,p1Terminals,targetTerminals,failures:failures.slice(0,20)};
}

const active=hasActiveSingleton(q,P1,TARGET);
const owner=connect4CpcTargetOwner32(g,q.words,0,TARGET);
const distance=connect4CpcTargetSupportDistance32(g,q.words,0,TARGET);
const p2Playable=playableSingletons(q,P2);
const template=active&&owner===P1&&!p2Playable.length?findTemplate(q):null;
const validation=template?validate(q,template):null;
const accept=active&&owner===P1&&!p2Playable.length&&!!template&&!!validation?.pass;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank24_reply7_c7_taken_c3r5_target.v1',
  jsMinSysSha:EXPECTED,oracleUsed:false,solvedInputsUsed:false,
  sourceHypothesis:'CPC_RANK24_REPLY7_C7_DUAL_OBLIGATION_HYPOTHESIS.md',
  qualifiedTheorem:'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
  state:{sequence,rank:27,mover:2,support:support(q)},
  target:{column:3,row:5,cell:TARGET,activeP1Singleton:active,projectedOwner:owner+1,supportDistance:distance},
  defenderPlayableSingletons:p2Playable,
  template:template?{
    capacity:template.capacity,oddColumns:template.oddColumns,synchronizedPairs:template.synchronizedPairs,
    targetIsResponse:template.targetIsResponse,defenderResidualCount:template.defenderResidualCount,coverage:template.coverage
  }:null,
  validation,
  accept,
  conclusion:accept?[
    'The P2:c7 branch after the structural P1:c7 candidate closes by P1:c1 contraction to singleton c3r5 followed by the qualified truncated target-reservoir theorem.'
  ]:[
    'The c3r5 singleton branch does not satisfy the existing truncated target-reservoir certificate.'
  ],
  boundary:[
    'This is a fresh qualification instance of the already-qualified generic truncated target-reservoir theorem.',
    'No oracle/Pons value, solved W/D/L input, minimax result, best-move table, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
