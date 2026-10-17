#!/usr/bin/env node
// Rule-independent validation of oracle-blind exact-q constructive WDL core.
// The physical reference uses last-move direct connected-run counting, NOT
// q residual/cofactor operations, WDL databases or solved action vectors.
import {performance} from 'node:perf_hooks';
import {createExactQCore,CoreBudgetError} from './exact-q-core.mjs';

const CONTROLS=[{width:4,height:3,connect:3},{width:4,height:4,connect:4}];
const SMALL_MAX_STATES=200000,SMALL_MAX_EDGES=800000,SMALL_BUDGET_MS=30000;
const LATE_RANDOM_SEED=0x4c2a3026,LATE_ATTEMPTS=4000,LATE_TARGET=12,LATE_MIN_RANK=35;
const LATE_BUDGET_MS=30000,LATE_Q_LIMIT=50000;
let random=LATE_RANDOM_SEED;
function nextWord(){random^=random<<13;random^=random>>>17;random^=random<<5;return random>>>0;}
function sampleIndex(n){
  const threshold=Math.floor(0x100000000/n)*n;
  let word;do{word=nextWord();}while(word>=threshold);
  return word%n;
}
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function physicalRules({width:W,height:H,connect:K}){
  const bit=(c,r)=>1n<<BigInt(r*W+c),N=W*H;
  function empty(){return {h:Array(W).fill(0),p0:0n,p1:0n,rank:0,sequence:''};}
  function legal(s){const out=[];for(let c=0;c<W;c++)if(s.h[c]<H)out.push(c);return out;}
  const key=s=>s.p0.toString(16)+':'+s.p1.toString(16);
  function occupied(s,c,r,who){
    if(c<0||c>=W||r<0||r>=H)return false;
    return (((who===0?s.p0:s.p1)&bit(c,r))!==0n);
  }
  function move(s,c){
    if(!Number.isInteger(c)||c<0||c>=W||s.h[c]===H)
      throw Error('invalid physical action');
    const row=s.h[c],mover=s.rank&1,stone=bit(c,row);
    const h=s.h.slice();h[c]++;
    const child={h,p0:mover===0?s.p0|stone:s.p0,
      p1:mover===1?s.p1|stone:s.p1,rank:s.rank+1,
      sequence:s.sequence+String(c+1)};
    // Check a new winning line by counting consecutive owned stones extending
    // outward from the newly placed stone; does not use q's line basis.
    for(const [dx,dy] of dirs){
      let length=1;
      for(const sign of [-1,1]){
        for(let d=1;d<K;d++){
          if(!occupied(child,c+sign*d*dx,row+sign*d*dy,mover))break;
          length++;
        }
      }
      if(length>=K)return {terminal:mover===0?1:-1,child};
    }
    if(child.rank===N)return {terminal:0,child};
    return {child};
  }
  function solveAll({maxStates, maxEdges, deadlineAt}){
    const memo=new Map(),states=new Map();
    const stats={uniqueStates:0,edges:0,terminalEdges:0,memoHits:0,maxDepth:0};
    function rec(s,depth){
      stats.maxDepth=Math.max(stats.maxDepth,depth);
      const k=key(s);
      if(memo.has(k)){stats.memoHits++;return memo.get(k);}
      if(stats.uniqueStates>=maxStates||stats.edges>=maxEdges||Date.now()>=deadlineAt)
        throw new CoreBudgetError('physical control budget exhausted',{...stats});
      stats.uniqueStates++;states.set(k,s);
      const acts=legal(s),mover=s.rank&1;
      if(acts.length===0){
        const a={value:0,bestMoves:[],actionValues:[]};memo.set(k,a);return a;
      }
      let best=mover===0?-Infinity:Infinity;
      const av=[];
      for(const c of acts){
        if(stats.edges>=maxEdges||Date.now()>=deadlineAt)
          throw new CoreBudgetError('physical control edge/time budget exhausted',{...stats});
        const t=move(s,c);stats.edges++;
        let v;
        if(t.terminal!==undefined){v=t.terminal;stats.terminalEdges++;}
        else v=rec(t.child,depth+1).value;
        av.push([c,v]);
        best=mover===0?Math.max(best,v):Math.min(best,v);
      }
      const a={value:best,bestMoves:av.filter(x=>x[1]===best).map(x=>x[0]),actionValues:av};
      memo.set(k,a);return a;
    }
    const root=rec(empty(),0);
    return {root,memo,states,stats,key,legal,move,empty};
  }
  return {empty,legal,move,key,solveAll};
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function oneBoard(cfg){
  const start=performance.now(),deadline=Date.now()+SMALL_BUDGET_MS;
  const core=createExactQCore(cfg),qMemo=new Map(),ref=physicalRules(cfg);
  const result={board:cfg,status:'UNSTARTED',source:'independent q-only recursion vs direct physical run-length rules',
    lineCount:core.lineCount,errors:[],coverage:{}};
  try{
    const startQ=performance.now();
    const qRoot=core.solve(core.createEmpty(),{sharedMemo:qMemo,maxStates:SMALL_MAX_STATES,
      maxTransitions:SMALL_MAX_EDGES,deadlineAt:deadline});
    result.qSolverMs=+(performance.now()-startQ).toFixed(3);
    result.qSolver=qRoot.stats;
    const startPhysical=performance.now();
    const full=ref.solveAll({maxStates:SMALL_MAX_STATES,maxEdges:SMALL_MAX_EDGES,
      deadlineAt:deadline});
    result.physicalSolverMs=+(performance.now()-startPhysical).toFixed(3);
    result.physicalSolver=full.stats;
    if(!same(qRoot.answer,full.root))throw Error('empty root result differs');
    let parentChecks=0,actionChecks=0,terminalChecks=0,childQChecks=0;
    let tiedPositions=0,wins=0,draws=0,losses=0;
    let reflectionChecks=0;
    const compareStart=performance.now();
    for(const [key,s] of full.states){
      if(Date.now()>=deadline)throw new CoreBudgetError('full state comparison timed out',{parentChecks,actionChecks,childQChecks});
      const physicalResult=full.memo.get(key);
      const q=core.fromPhysical(s);
      const qResult=core.solve(q,{sharedMemo:qMemo,maxStates:SMALL_MAX_STATES,
        maxTransitions:SMALL_MAX_EDGES,deadlineAt:deadline}).answer;
      if(!same(qResult,physicalResult))throw Error('WDL/action mismatch at '+s.sequence);
      parentChecks++;
      tiedPositions+=Number(qResult.bestMoves.length>1);
      if(qResult.value>0)wins++;else if(qResult.value<0)losses++;else draws++;
      for(const c of ref.legal(s)){
        const actual=ref.move(s,c),fromQ=core.next(q,c);
        if((actual.terminal!==undefined)!==(fromQ.terminal!==undefined)||
           (actual.terminal!==undefined&&actual.terminal!==fromQ.terminal))
          throw Error('terminal transition disagrees at '+s.sequence+'/'+(c+1));
        if(actual.terminal!==undefined)terminalChecks++;
        else{
          const expected=core.fromPhysical(actual.child);
          if(core.key(fromQ.q)!==core.key(expected))
            throw Error('nonterminal q cofactor mismatch at '+s.sequence+'/'+(c+1));
          childQChecks++;
        }
        actionChecks++;
      }
      // A first-touch reflection control at a small deterministic subset.
      if(reflectionChecks<32){
        const mirror={h:s.h.slice().reverse(),p0:0n,p1:0n,rank:s.rank};
        for(let c=0;c<cfg.width;c++)for(let row=0;row<cfg.height;row++){
          const src=1n<<BigInt(row*cfg.width+c);
          const dest=1n<<BigInt(row*cfg.width+(cfg.width-1-c));
          if(s.p0&src)mirror.p0|=dest;
          if(s.p1&src)mirror.p1|=dest;
        }
        const mirroredQ=core.fromPhysical(mirror);
        const mirroredResult=core.solve(mirroredQ,{sharedMemo:qMemo,
          maxStates:SMALL_MAX_STATES,maxTransitions:SMALL_MAX_EDGES,deadlineAt:deadline}).answer;
        if(qResult.value!==mirroredResult.value||
           !same(qResult.bestMoves.map(c=>cfg.width-1-c).sort((a,b)=>a-b),mirroredResult.bestMoves))
          throw Error('reflection action transport failed at '+s.sequence);
        reflectionChecks++;
      }
    }
    result.compareMs=+(performance.now()-compareStart).toFixed(3);
    result.status='PASS';
    result.coverage={physicalNonterminalStates:parentChecks,
      physicalLegalOneStepActions:actionChecks,
      terminalEdgeChecks:terminalChecks,nonterminalQTransitionChecks:childQChecks,
      reflectionCases:reflectionChecks,statesWithMultipleWLDEquivalentBestActions:tiedPositions,
      physicalStateValues:{P0Wins:wins,draws,P1Wins:losses},
      qCacheEntries:qMemo.size,
      parentValueMismatches:0,actionValueMismatches:0,
      bestMoveSetMismatches:0,terminalMismatches:0,qTransitionMismatches:0};
  }catch(e){
    result.status=e instanceof CoreBudgetError?'BUDGET_EXHAUSTED':'FAIL';
    result.error=String(e);
    result.partialMetrics=e.metrics??null;
  }
  result.totalMs=+(performance.now()-start).toFixed(3);
  return result;
}
function lateSeven(){
  const cfg={width:7,height:6,connect:4},core=createExactQCore(cfg),rules=physicalRules(cfg);
  const start=performance.now(),deadline=Date.now()+LATE_BUDGET_MS;
  const found=[],seen=new Set();
  let attempts=0,near=0;
  while(attempts<LATE_ATTEMPTS&&found.length<LATE_TARGET&&Date.now()<deadline){
    attempts++;
    let s=rules.empty();
    // Oracle-blind terminal-avoiding fixture generator. It only refuses an
    // immediate move that itself forms four, not opponent strategy reasoning.
    while(s.rank<LATE_MIN_RANK){
      const safe=[];
      for(const c of rules.legal(s)){
        const t=rules.move(s,c);
        if(t.terminal===undefined)safe.push(t.child);
      }
      if(safe.length===0)break;
      s=safe[sampleIndex(safe.length)];
    }
    if(s.rank<LATE_MIN_RANK)continue;
    near++;
    const k=rules.key(s);
    if(seen.has(k))continue;
    seen.add(k);found.push(s);
  }
  const sample=[],counts={checks:0,rootMismatches:0,actionMismatches:0,budgetExhausted:0,qMemoStates:0};
  for(const s of found){
    if(Date.now()>=deadline){counts.budgetExhausted++;break;}
    let qAnswer,refAnswer;
    try{
      const q=core.fromPhysical(s),qSolve=core.solve(q,{maxStates:LATE_Q_LIMIT,
        maxTransitions:800000,deadlineAt:deadline});
      // The physical late-suffix reference starts only at this sampled state.
      // Exact physical comparison restricted to descendants of this late s.
      const memo=new Map(),local={states:0,edges:0};
      function rec(state){
        const key=rules.key(state);
        if(memo.has(key))return memo.get(key);
        if(local.states>=LATE_Q_LIMIT||Date.now()>=deadline)
          throw new CoreBudgetError('physical late suffix exceeds budget',local);
        local.states++;
        const moves=rules.legal(state),p=state.rank&1,av=[];
        let best=p===0?-Infinity:Infinity;
        for(const c of moves){
          local.edges++;
          const e=rules.move(state,c);
          const v=e.terminal!==undefined?e.terminal:rec(e.child).value;
          av.push([c,v]);best=p===0?Math.max(v,best):Math.min(v,best);
        }
        const out={value:best,bestMoves:av.filter(([,v])=>v===best).map(([c])=>c),
          actionValues:av};
        memo.set(key,out);return out;
      }
      qAnswer=qSolve.answer;refAnswer=rec(s);
      counts.checks++;counts.qMemoStates+=qSolve.stats.uniqueStates;
      if(!same(qAnswer,refAnswer)){
        counts.rootMismatches++;
        sample.push({sequence:s.sequence,rank:s.rank,mismatch:true,qAnswer,refAnswer});
        break;
      }
      sample.push({sequence:s.sequence,rank:s.rank,value:qAnswer.value,
        optimalWDLColumns:qAnswer.bestMoves.map(x=>x+1),
        physicalSuffixStates:local.states,qSuffixStates:qSolve.stats.uniqueStates,
        qSuffixTransitions:qSolve.stats.transitions,matching:true});
    }catch(e){
      counts.budgetExhausted++;
      sample.push({sequence:s.sequence,rank:s.rank,error:String(e)});
      break;
    }
  }
  return {board:cfg,status:counts.rootMismatches?'FAIL':
    counts.budgetExhausted?'PARTIAL':'PASS',
    seed:'0x'+LATE_RANDOM_SEED.toString(16),
    fixtureGeneration:'seeded first-win-avoiding legal random playouts, no oracle',
    attempts,lateRankAtLeast35Reached:near,uniquePositionsFound:found.length,
    comparison:counts,samples:sample,
    totalMs:+(performance.now()-start).toFixed(3)};
}
export function runConstructiveCoreQualification(){
  const small=CONTROLS.map(oneBoard);
  const late=lateSeven();
  const status=small.every(x=>x.status==='PASS')&&late.status==='PASS'?'PASS':
    small.some(x=>x.status==='FAIL')||late.status==='FAIL'?'FAIL':'PARTIAL';
  return {schema:'connect4.constructive-oracle-blind-core-qualification.v0_1',
    date:'2026-10-16',result:status,
    exactQCore:'support + two normalized residual antichains + owner-cofactor + first-win/draw + alternating extrema',
    valueConvention:'P0=-1/0/+1, mover returns all WDL-optimal columns; no distance tie-breaking',
    controls:small,standard7x6Late:late,
    oracleQueries:0,solvedFrontierLookupCalls:0,
    generalProof:'well-founded rank induction under exact q_o cofactor/terminal congruence; exhaustive finite controls are implementation checks, not the universal proof',
    independentBranchEliminationProved:false,
    recursionEliminationProved:false,
    minimalityProved:false};
}
if(process.argv[1]?.endsWith('constructive-core-control.mjs')){
  const x=runConstructiveCoreQualification();
  console.log(JSON.stringify(x,null,2));
  if(x.result==='FAIL')process.exitCode=1;
}

// Pure direct-physical reference, exported for independent research controls.
export {physicalRules};
