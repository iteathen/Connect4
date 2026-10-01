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

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const parentSequence='4444415666662322224233';
const ingress=connect4RbaFromMoves(Array.from(parentSequence,c=>Number(c)-1),{geometry:g,canonical:false});
const parent={words:ingress.words,basis:ingress.basis,n:ingress.basis.length,terminal:ingress.words[g.metaOffset]&3};
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
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,g.columns));}
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
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push(cell);
  }
  return out;
}
function coverageWitness(q,id,targetColumn,targetRow,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===targetColumn&&r>targetRow)return {kind:'post-target-deferral',cell};
  }
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)return {kind:'vertical-response',cell};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))return {kind:'cross-pair',cells:[cell,mate]};
    }
  }
  return null;
}

function findPairing(q,target){
  const targetColumn=g.cellColumn[target],targetRow=g.cellRow[target],
    targetDepth=targetRow-q.words[targetColumn];
  if(targetDepth<=0)return null;
  if(playableSingletons(q,P2).length)return null;

  const capacity=new Uint32Array(g.columns);
  let total=0;
  const odd=[];
  for(let c=0;c<g.columns;c++){
    const cap=c===targetColumn?targetRow-q.words[c]+1:g.rows-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;
    if(cap&1)odd.push(c);
  }
  if(total&1||odd.length&1)return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let found=null;

  function check(){
    const L=partner[targetColumn]>=0?length[targetColumn]:0;
    const targetIsResponse=targetDepth>=L+1&&((targetDepth-(L+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,targetColumn,targetRow,partner,length);
      if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],witness});
    }
    const pairs=[];
    for(let c=0;c<g.columns;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    return {
      targetIsResponse,
      totalRelevant:total,
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,
      partner:Array.from(partner,x=>x<0?0:x+1),
      prefixLength:Array.from(length),
      defenderResidualCount:defenderIds.length,
      coverage,
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=check();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===targetColumn||b===targetColumn)&&L>=capacity[targetColumn])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}

function scanWinningMoves(q){
  assert.equal((q.words[g.metaOffset]>>>2)&1,P1);
  const out=[];
  for(let move=0;move<g.columns;move++){
    if(q.words[move]>=g.rows)continue;
    const child=step(q,move);
    if(child.terminal===P1_WIN){
      out.push({column:move+1,kind:'immediate-terminal'});
      continue;
    }
    if(child.terminal)continue;
    const singletonTargets=[];
    for(const id of activeIds(child,P1)){
      if(g.shapeSize[id]!==1)continue;
      const target=g.shapeCells[id*4];
      if(singletonTargets.includes(target))continue;
      singletonTargets.push(target);
    }
    const certificates=[];
    for(const target of singletonTargets){
      const template=findPairing(child,target);
      if(!template)continue;
      certificates.push({
        target:{cell:target,column:g.cellColumn[target]+1,row:g.cellRow[target]+1},
        template,
      });
    }
    if(certificates.length)out.push({
      column:move+1,
      kind:'truncated-target-reservoir',
      certificates,
    });
  }
  return out;
}

const attack=step(parent,0); // P1 column 1
assert.equal(attack.terminal,0);
const rows=[];
for(let reply=0;reply<g.columns;reply++){
  if(attack.words[reply]>=g.rows)continue;
  const child=step(attack,reply);
  assert.equal(child.terminal,0);
  const knownRank24=reply===0;
  const certificates=scanWinningMoves(child);
  rows.push({
    defenderReplyColumn:reply+1,
    rank:child.words[g.metaOffset]>>>2,
    support:support(child),
    knownQualifiedRank24State:knownRank24,
    structuralWinningMoves:certificates,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank22_c1_reply_target_scan.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{sequence:parentSequence,rank:22,support:support(parent),candidateMoveColumn:1},
  legalDefenderReplies:rows.map(x=>x.defenderReplyColumn),
  rows,
  conclusion:[
    'This discovery scan applies the qualified truncated target-reservoir theorem after one candidate Player-1 move in each rank-24 reply state.',
    'The reply-1 child is separately known to be an exact Player-1 win from the qualified rank-24 zugzwang theorem.',
    'structuralWinningMoves lists only immediate terminals or one-ply moves whose child carries a finite truncated target-reservoir certificate.',
    'Failure to list a move is not a loss/draw result; it means this structural certificate class did not close that reply state in one move.',
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, best-move table, minimax, or sealed holdout is used.',
    'This is a discovery scan, not yet a rank-22 theorem composition.',
    'Production CPC is unchanged.',
  ],
},null,2));
