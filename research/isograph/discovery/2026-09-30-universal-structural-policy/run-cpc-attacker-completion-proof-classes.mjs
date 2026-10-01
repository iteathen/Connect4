#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-attacker-completion-proof-classes.mjs <JSMinSys checkout>');

const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
const moves=s=>Array.from(s,c=>Number(c)-1);

function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const mover=q=>rank(q)&1;
const terminal=q=>q.words[g.metaOffset]&3;
function legal(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function attackerTerminalCode(attacker){return attacker===0?3:1;}
function defenderTerminalCode(attacker){return attacker===0?1:3;}
function terminalPolarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  if(code===attackerTerminalCode(attacker))return 'ATTACKER';
  if(code===defenderTerminalCode(attacker))return 'DEFENDER';
  throw new Error('unknown terminal code '+code);
}
function absInterval(s){return [s.interval[0]-2,s.interval[1]-2];}
function attackerValue(attacker){return attacker===0?1:-1;}
function bitMarked(bits,cell){return (bits[cell>>>5]&(1<<(cell&31)))!==0;}
function bitCells(bits){
  const out=[];
  for(let cell=0;cell<g.cellCount;cell++)if(bitMarked(bits,cell))
    out.push({cell,column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1});
  return out;
}
function maskColumns(mask,q){
  const out=[];
  for(let c=0;c<g.columns;c++)
    if((mask&(1<<c))!==0 && q.words[c]<g.rows)out.push(c);
  return out;
}

let cofactorCount=0,cpcCount=0;
function cofactor(q,column){
  assert.equal(terminal(q),0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords);
  const basisBuf=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,
    q.words,0,q.basis,0,q.basis.length,
    column,q.words[column],
    words,0,basisBuf,0,
    seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function evalCpc(q){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  cpcCount++;
  return {q,scratch,kind,kindName:KIND.get(kind),interval:absInterval(scratch)};
}
function aggregateProfile(e,attacker){
  const attackerBits=attacker===0?e.scratch.activeSingletonCells:e.scratch.activeSingletonCellsOther;
  const defenderBits=attacker===0?e.scratch.activeSingletonCellsOther:e.scratch.activeSingletonCells;
  const attackerCells=bitCells(attackerBits);
  const defenderCells=bitCells(defenderBits);
  const playableAttacker=attackerCells.filter(x=>e.q.words[g.cellColumn[x.cell]]===g.cellRow[x.cell]);
  const playableDefender=defenderCells.filter(x=>e.q.words[g.cellColumn[x.cell]]===g.cellRow[x.cell]);
  return {attackerBits,defenderBits,attackerCells,defenderCells,playableAttacker,playableDefender};
}

// Sound only when the defender is the current mover and CPC is exact for attacker.
// Return null rather than guessing when exactness came from another CPC route that
// has no independently qualified strong-distance upper.
function nativeDefenderLossUpper(e,attacker){
  if(terminal(e.q)!==0 || mover(e.q)===attacker)return null;
  const av=attackerValue(attacker);
  if(e.kind!==CPC_EXACT || e.interval[0]!==av || e.interval[1]!==av)return null;

  const p=aggregateProfile(e,attacker);
  if(p.playableAttacker.length>=2){
    return {
      upper:2,
      route:'MULTIPLE_PLAYABLE_SINGLETONS',
      targets:p.playableAttacker.map(x=>({column:x.column,row:x.row}))
    };
  }

  if(p.playableAttacker.length===1){
    const target=p.playableAttacker[0],c=target.column-1,h=e.q.words[c],aboveRow=h+1;
    if(aboveRow<g.rows&&bitMarked(p.attackerBits,aboveRow*g.columns+c)){
      return {
        upper:2,
        route:'STACKED_SINGLETON_RELEASE',
        target:{column:target.column,row:target.row},
        released:{column:c+1,row:aboveRow+1}
      };
    }
  }

  if(p.playableAttacker.length===0&&p.attackerCells.length){
    const ls=legal(e.q),lifted=[];
    let allLift=ls.length>0;
    for(const c of ls){
      const h=e.q.words[c],aboveRow=h+1;
      if(aboveRow>=g.rows||!bitMarked(p.attackerBits,aboveRow*g.columns+c)){
        allLift=false;break;
      }
      lifted.push({column:c+1,row:aboveRow+1});
    }
    if(allLift)return {upper:2,route:'ALL_LEGAL_MOVES_SINGLETON_LIFT',targets:lifted};
  }

  if(e.scratch.precursorCount[0]>0&&e.scratch.preemptionCount[0]===0){
    return {upper:4,route:'FORK_PRECURSOR_DEFICIENCY',precursorCount:e.scratch.precursorCount[0]};
  }

  return null;
}

function semanticKey(q,attacker,layers){
  // q is exact semantic state; basis ids plus key words form a sufficient execution identity here.
  return attacker+'|'+layers+'|'+Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');
}

let proofCalls=0,memoHits=0;
const memo=new Map();

function proveAttacker(q,attacker,layers=4){
  proofCalls++;
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const key=semanticKey(q,attacker,layers);
  if(memo.has(key)){memoHits++;return memo.get(key);}

  let best=null;

  for(const a of legal(q)){
    const first=cofactor(q,a);
    const pol=terminalPolarity(first.term,attacker);
    if(pol==='ATTACKER'){
      const cert={upper:1,constructor:'IMMEDIATE_TERMINAL',setupColumn:a+1};
      if(!best||cert.upper<best.upper)best=cert;
      continue;
    }
    if(pol!=='NONTERMINAL')continue;

    const post=evalCpc(first.q);
    const tactical=nativeDefenderLossUpper(post,attacker);
    if(tactical){
      const cert={
        upper:1+tactical.upper,
        constructor:'SETUP_NATIVE_CPC',
        setupColumn:a+1,
        postSetup:{kind:post.kindName,interval:post.interval,tactical}
      };
      if(!best||cert.upper<best.upper)best=cert;
      continue;
    }

    if(layers<=0||post.kind!==CPC_RESTRICT||post.scratch.preemptionCount[0]===0)continue;

    const allowed=maskColumns(post.scratch.preemptionMask32[0]>>>0,first.q);
    if(!allowed.length)continue;

    const children=[];
    let valid=true,maxChild=0;
    for(const r of allowed){
      const second=cofactor(first.q,r);
      const p=terminalPolarity(second.term,attacker);
      if(p!=='NONTERMINAL'){valid=false;break;}
      assert.equal(mover(second.q),attacker);
      const child=proveAttacker(second.q,attacker,layers-1);
      if(!child){valid=false;break;}
      maxChild=Math.max(maxChild,child.upper);
      children.push({responseColumn:r+1,upper:child.upper,certificate:child});
    }
    if(!valid)continue;

    // From post-setup Q: noncompliant defender actions lose within <=4;
    // compliant action costs one ply then enters a child certificate.
    const postUpper=Math.max(4,1+maxChild);
    const cert={
      upper:1+postUpper,
      constructor:'SETUP_CPC_RESTRICTION',
      setupColumn:a+1,
      postSetup:{
        kind:post.kindName,
        interval:post.interval,
        preemptionColumns:allowed.map(c=>c+1),
        noncompliantUpper:4
      },
      children
    };
    if(!best||cert.upper<best.upper)best=cert;
  }

  memo.set(key,best);
  return best;
}

function summarize(sequence,layers=4){
  const q=ingress(sequence);
  assert.equal(terminal(q),0);
  const attacker=mover(q);
  const certificate=proveAttacker(q,attacker,layers);
  return {
    sequence,
    rank:rank(q),
    attacker:attacker+1,
    layers,
    finiteUpper:certificate?.upper??null,
    certificate
  };
}

export { ingress, rank, mover, terminal, legal, cofactor, proveAttacker, summarize };

if(import.meta.url===pathToFileURL(process.argv[1]).href){
const controls=[
  {id:'hallFork',sequence:'2232',expected:3},
  {id:'forcedRestrictionChain',sequence:'32612636',expected:5},
].map(x=>{
  const r=summarize(x.sequence,4);
  assert.equal(r.finiteUpper,x.expected,x.id+' upper mismatch');
  return {...x,...r};
});

const v4=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
].map(x=>({...x,...summarize(x.sequence,4)}));

assert(v4.every(x=>x.finiteUpper===null),'consumed v4 boundary unexpectedly closed');

console.log(JSON.stringify({
  schema:'connect4.cpc_attacker_completion_proof_classes.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  transitionAuthority:'exact RBA cofactors plus native CPC exact/restriction outputs only',
  theoremVersion:'0.1',
  controls,
  v4ConsumedBoundary:v4,
  work:{cofactorCount,cpcCount,proofCalls,memoHits,memoStates:memo.size},
  conclusion:'The attacker proof-class automaton recovers the qualified A3 Hall-fork and A5 forced-restriction controls while stopping at CPC_NONE. All three consumed v4 children remain without a finite upper certificate under this grammar.',
  boundary:[
    'The recursion follows only exact CPC_RESTRICT response sets; CPC_NONE is never expanded.',
    'Native CPC exact attacker wins receive a distance only when the already-qualified tactical route can be identified as <=2 or <=4.',
    'This is proof-hypergraph closure, not ordinary W/D/L search and not a move-ranking heuristic.'
  ]
},null,2));
}
