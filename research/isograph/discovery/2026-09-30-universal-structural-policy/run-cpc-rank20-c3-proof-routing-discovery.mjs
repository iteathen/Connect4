#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT='44444156666623222242';
const KNOWN={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
};

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
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0;

function fromSequence(s){
  const q=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis,n:q.basis.length,terminal:q.words[g.metaOffset]&3};
}
function step(q,column){
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
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function exactEqual(a,b){
  if(a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeMinimal(q,player){
  const active=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function residualDesc(q,id,player){
  const size=g.shapeSize[id],base=id*4,cells=[];
  let aligned=true;
  for(let i=0;i<size;i++){
    const cell=g.shapeCells[base+i];
    const owner=connect4CpcTargetOwner32(g,q.words,0,cell);
    if(owner!==player)aligned=false;
    cells.push({
      cell,
      column:g.cellColumn[cell]+1,
      row:g.cellRow[cell]+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell)
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
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
      preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],
      projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks),
    };
  }
  return out;
}
function stateProfile(q){
  const mover=moverOf(q);
  return {
    rank:rankOf(q),
    mover:mover+1,
    terminal:q.terminal,
    support:support(q),
    cpc:q.terminal?null:cpc(q),
    moverMinimal:q.terminal?[]:activeMinimal(q,mover).map(id=>residualDesc(q,id,mover)),
    p1Aligned:q.terminal?[]:activeMinimal(q,P1).map(id=>residualDesc(q,id,P1)).filter(x=>x.fullyAligned),
  };
}

const knownStates=Object.fromEntries(Object.entries(KNOWN).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRootMatch(q,allowed){
  if(!q||q.terminal)return null;
  for(const name of allowed)if(exactEqual(q,knownStates[name]))return name;
  return null;
}

const q20=fromSequence(ROOT);
assert.equal(q20.terminal,0);
assert.equal(rankOf(q20),20);
assert.equal(moverOf(q20),P1);
assert.deepEqual(support(q20),[1,6,1,6,1,5,0]);

const afterP1=step(q20,2);
assert.equal(afterP1.terminal,0);
assert.equal(rankOf(afterP1),21);
assert.deepEqual(support(afterP1),[1,6,2,6,1,5,0]);

const legalDefenderReplies=[];
const rows=[];
for(let d=0;d<g.columns;d++){
  if(afterP1.words[d]>=g.rows)continue;
  legalDefenderReplies.push(d+1);
  const reply=step(afterP1,d);
  const direct=reply.terminal===0?knownRootMatch(reply,['RANK22_ROUTED']):null;
  const row={
    defenderColumn:d+1,
    replyTerminal:reply.terminal,
    replyRank:rankOf(reply),
    replySupport:support(reply),
    directRank22Handoff:direct==='RANK22_ROUTED',
    closedByKnownRoot:direct!==null,
    knownRoot:direct,
    state:reply.terminal?null:stateProfile(reply),
    p1Candidates:[]
  };

  if(reply.terminal===0&&direct===null){
    for(let p1=0;p1<g.columns;p1++){
      if(reply.words[p1]>=g.rows)continue;
      const a=step(reply,p1);
      const candidate={
        p1Column:p1+1,
        terminal:a.terminal,
        afterP1Rank:rankOf(a),
        afterP1Support:support(a),
        cpc:a.terminal?null:cpc(a),
        forcedMacro:null
      };
      if(a.terminal===0){
        const ca=candidate.cpc, b=ca.baseline, f=ca.frontier;
        const agree=
          b.kind==='CPC_RESTRICT'&&f.kind==='CPC_RESTRICT'&&
          b.preemptionCount===1&&f.preemptionCount===1&&
          b.forcedColumn!==null&&b.forcedColumn===f.forcedColumn;
        if(agree){
          const forced=b.forcedColumn-1;
          if(a.words[forced]<g.rows){
            const child=step(a,forced);
            candidate.forcedMacro={
              baselineFrontierAgree:true,
              defenderColumn:forced+1,
              defenderTerminal:child.terminal,
              afterForcedRank:rankOf(child),
              afterForcedSupport:support(child),
              knownRoot:child.terminal===0?knownRootMatch(child,['RANK24_ZUGZWANG','RANK24_SINGLETON','RANK24_ROUTED']):null,
              state:child.terminal?null:stateProfile(child)
            };
          }
        }
      }
      row.p1Candidates.push(candidate);
    }
  }
  rows.push(row);
}
assert.deepEqual(legalDefenderReplies,[1,3,5,6,7]);
const c3=rows.find(x=>x.defenderColumn===3);
assert(c3?.directRank22Handoff);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_c3_proof_routing_discovery.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  design:'CPC_RANK20_C3_PROOF_ROUTING_DISCOVERY_DESIGN_0_1.md',
  rank20:{
    sequence:ROOT,
    rank:rankOf(q20),
    mover:moverOf(q20)+1,
    support:support(q20)
  },
  p1Column:3,
  afterP1:{terminal:afterP1.terminal,rank:rankOf(afterP1),support:support(afterP1)},
  knownRoots:KNOWN,
  legalDefenderReplies,
  rows,
  conclusion:[
    'This is a structural proof-routing discovery probe for the exact rank-20 predecessor candidate P1:c3.',
    'Defender c3 is required to hand off exactly to the newly qualified rank-22 routed-win root; other defender children are scanned only for current-state CPC restrictions and exact one-macro handoffs to qualified rank-24 roots.',
    'No unclosed branch is assigned a value, and the probe stops after at most one CPC-forced defender macro-step.'
  ],
  boundary:[
    'This is discovery evidence only; it does not certify the rank-20 state as a win.',
    'No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Known-root reuse requires exact full-RBA equality; support equality alone is not accepted.',
    'Residual IDs are diagnostic only; exact cell attachment and current-state CPC projections carry the recorded structural meaning.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
