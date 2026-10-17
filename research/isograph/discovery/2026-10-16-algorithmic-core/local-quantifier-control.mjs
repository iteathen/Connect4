#!/usr/bin/env node
// Independent physical bounded/full suffix WDL + action-labelled vector controls.
// GAME HISTORY EXPANSION OCCURS ONLY IN THIS QUALIFICATION HARNESS.
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
import {projectLocallyQuantifiedFirstActionVector as projectFirstActionVector,composeOptimalActionVector} from './guarded-action-qbf-local-quantifier.mjs';
import {projectActionQBFLiveCompact} from './guarded-action-qbf-project-live-compact.mjs';
const thresholds=['Wlo','Nlo','Whi','Nhi'];
const boards=[{width:4,height:3,connect:3},{width:4,height:4,connect:4},{width:7,height:6,connect:4}];
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function geometry({width:W,height:H,connect:K}){
  const lines=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of dirs){
    if(c+(K-1)*dx<0||c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
    lines.push(Array.from({length:K},(_,j)=>(r+j*dy)*W+c+j*dx));
  }
  function initial(){return {b:Array(W*H).fill(-1),h:Array(W).fill(0),rank:0,history:''};}
  function step(s,c){
    if(!Number.isInteger(c)||c<0||c>=W||s.h[c]===H)throw Error('illegal physical step');
    const b=s.b.slice(),h=s.h.slice(),p=s.rank%2;
    b[h[c]*W+c]=p;h[c]++;
    const term=lines.some(line=>line.every(i=>b[i]===p))?p:
      s.rank+1===W*H?2:null;
    return {state:{b,h,rank:s.rank+1,history:s.history+String(c+1)},term};
  }
  function replay(history){let s=initial();for(const ch of history){const n=step(s,Number(ch)-1);if(n.term!==null)throw Error('terminal prefix: '+history);s=n.state;}return s;}
  function fromPhysical(s){
    const R=[0,1].map(p=>{
      const raw=lines.filter(line=>!line.some(i=>s.b[i]===1-p)).map(line=>
        line.filter(i=>s.b[i]===-1).reduce((x,i)=>x|(1n<<BigInt(i)),0n));
      const uniq=[...new Set(raw.map(String))].map(BigInt);
      return uniq.filter(a=>!uniq.some(b=>a!==b&&(a&b)===b));
    });
    return {h:s.h.slice(),R0:R[0],R1:R[1]};
  }
  function exactBoundedActionValues(s,k,z){
    const cutoff=[false,false,true,true][z];
    let physicalMoves=0,terminals=0;
    function recurse(st,d){
      if(d===k)return cutoff;
      const p=st.rank%2;
      let val=p===0?false:true;
      for(let c=0;c<W;c++)if(st.h[c]<H){
        const {state,term}=step(st,c);physicalMoves++;
        const x=term===0?true:term===1?false:term===2?(z===1||z===3):recurse(state,d+1);
        if(term!==null)terminals++;
        val=p===0?val||x:val&&x;
      }
      return val;
    }
    const out=[];
    for(let c=0;c<W;c++)if(s.h[c]<H){
      const {state,term}=step(s,c);physicalMoves++;
      out.push({column:c,truth:term===0?true:term===1?false:term===2?(z===1||z===3):recurse(state,1)});
    }
    return {out,physicalMoves,terminals};
  }
  function gatherSuffix(rank,count){
    const output=[],seen=new Set();let visits=0;
    function visit(s){
      if(output.length>=count||visits++>200000)return;
      if(s.rank===rank){
        const legal=s.h.filter(v=>v<H).length;
        const id=s.b.join('');
        if(legal>=2&&!seen.has(id)){output.push(s.history);seen.add(id);}return;
      }
      for(let c=0;c<W;c++)if(s.h[c]<H){
        const {state,term}=step(s,c);
        if(term===null)visit(state);
        if(output.length>=count)return;
      }
    }
    visit(initial());
    if(output.length<count)throw Error('not enough deterministic nonterminal suffix controls '+rank+'; found '+output.length);
    return {histories:output,visits};
  }
  function terminalCheck(s){return lines.some(line=>line.every(i=>s.b[i]===0)||line.every(i=>s.b[i]===1));}
  return {replay,step,fromPhysical,exactBoundedActionValues,gatherSuffix,terminalCheck};
}
const g4x3=geometry(boards[0]),g4x4=geometry(boards[1]),g7x6=geometry(boards[2]);
const fixedCases=[
 {geometry:boards[0],g:g4x3,sequence:'223',horizons:[1,2,3,4,5]},
 {geometry:boards[0],g:g4x3,sequence:'1212',horizons:[1,2,3,4]},
 {geometry:boards[1],g:g4x4,sequence:'223',horizons:[1,2,3,4]},
 {geometry:boards[2],g:g7x6,sequence:'44444',horizons:[1,2,3,4,5,6]},
 {geometry:boards[2],g:g7x6,sequence:'444444',horizons:[1,2,3,4]}
];
const suffixSelections=[];
for(const [geometrySpec,g] of [[boards[0],g4x3],[boards[1],g4x4]]){
 for(const missing of [5,4,3]){
  const rank=geometrySpec.width*geometrySpec.height-missing;
  const selected=g.gatherSuffix(rank,4);
  suffixSelections.push({profile:geometrySpec,rank, ...selected});
  for(const sequence of selected.histories)fixedCases.push({geometry:geometrySpec,g,sequence,horizons:[missing],fullGame:true});
 }
}
const results={schema:'connect4.shared-first-action-quantifier-control.v0_1',status:'PASS',
  runtime:process.version,sourceCompilations:0,projectedThresholds:0,
  exactlyCheckedActionThresholds:0,actualPhysicalValidationMoves:0,
  mismatches:0,completeOptimalSetChecks:0,completeOptimalSetTies:0,completeOptimalSetSingletons:0,
  completeOptimalSetOther:0,suffixSelections,sourceGameContinuations:0,
  budget:{nodes:60000,nontrivialOps:300000,supportReps:10000,maxMs:15000},
  cases:[],comparativeBaselines:[]};
function optimalFromPhysical(s,allThresholds){
  const legal=allThresholds[0].out.map(v=>v.column);
  const actionV=legal.map((column,i)=>{
    const [wl,nl,wu,nu]=allThresholds.map(t=>t.out[i].truth);
    const l=wl?1:nl?0:-1,u=wu?1:nu?0:-1;
    if(l>u)throw Error('physical threshold monotonicity failure');
    return {column,lower:l,upper:u};
  });
  const p=s.rank&1,merge=p?Math.min:Math.max;
  const lo=merge(...actionV.map(x=>x.lower)),hi=merge(...actionV.map(x=>x.upper));
  const exact=actionV.every(x=>x.lower===x.upper);
  return {actionV,rootInterval:[lo,hi],exact,rootValue:lo===hi?lo:null,
    bestMoves:exact?actionV.filter(x=>x.lower===lo).map(x=>x.column):null};
}
for(const item of fixedCases){
  const st=item.g.replay(item.sequence),q=item.g.fromPhysical(st),legal=q.h.flatMap((h,c)=>h<item.geometry.height?[c]:[]);
  for(const k of item.horizons){
    if(k>item.geometry.width*item.geometry.height-st.rank)continue;
    const projected=[],physical=[];
    const row={profile:item.geometry,sequence:item.sequence,k,fullGame:!!item.fullGame,sourceRank:st.rank,
      legal,BooleanWork:0,gcWork:0,peak:0,stat:[]};
    for(let z=0;z<4;z++){
      const f=compileGuardedActionQBF(item.geometry,q,{horizon:k});
      results.sourceCompilations++;
      const cnf=f.makeCNF(thresholds[z],{auxMode:'staged'});
      const got=projectFirstActionVector(cnf,{legalColumns:legal});
      results.projectedThresholds++;
      if(got.status!=='EXACT_ACTION_VECTOR')throw Error('source vector projection hit budget: '+JSON.stringify({sequence:item.sequence,k,z,got}));
      const expected=item.g.exactBoundedActionValues(st,k,z);
      results.actualPhysicalValidationMoves+=expected.physicalMoves;
      results.exactlyCheckedActionThresholds+=expected.out.length;
      for(let j=0;j<expected.out.length;j++){
        if(got.actionValues[j].column!==expected.out[j].column||got.actionValues[j].threshold!==expected.out[j].truth)
          throw Error('action vector mismatch '+JSON.stringify({seq:item.sequence,k,z,got:got.actionValues,expected:expected.out}));
      }
      projected.push(got);physical.push(expected);
      row.BooleanWork+=got.stats.nontrivialOperations+f.records.stats.operations;
      row.gcWork+=got.stats.compactionWorkUnits;
      row.peak=Math.max(row.peak,got.stats.peakRetainedNodes);
      row.stat.push({z:thresholds[z],projOps:got.stats.nontrivialOperations,sourceOps:f.records.stats.operations,
        gcWork:got.stats.compactionWorkUnits,peakNodes:got.stats.peakRetainedNodes,
        futureQuantifiedBits:got.stats.quantifiedActionBits});
    }
    const ours=composeOptimalActionVector(item.geometry,q,projected);
    const ref=optimalFromPhysical(st,physical);
    if(JSON.stringify(ours.rootInterval)!==JSON.stringify(ref.rootInterval))throw Error('wrong root interval '+JSON.stringify({seq:item.sequence,k,ours,ref}));
    if(item.fullGame){
      results.completeOptimalSetChecks++;
      if(ours.status!=='EXACT_OPTIMAL_SET'||ours.value!==ref.rootValue||JSON.stringify(ours.bestMoves)!==JSON.stringify(ref.bestMoves))
        throw Error('full game bestMoves mismatch '+JSON.stringify({seq:item.sequence,k,ours,ref}));
      if(ours.bestMoves.length===1)results.completeOptimalSetSingletons++;
      else if(ours.bestMoves.length>1)results.completeOptimalSetTies++;
      else results.completeOptimalSetOther++;
    }
    row.result={status:ours.status,rootInterval:ours.rootInterval,value:ours.value,bestMoves:ours.bestMoves,
      actionIntervals:ours.actionIntervals};
    results.cases.push(row);
  }
}
// Independent-separate-root baseline (expensive): same QBF semantics,
// intentionally recompile and fully quantify the value for each legal action.
for(const [profile,g,seq,k] of [
 [boards[0],g4x3,'223',3],[boards[0],g4x3,'223',4],
 [boards[1],g4x4,'223',4],[boards[2],g7x6,'44444',3],[boards[2],g7x6,'44444',4]
]){
  const state=g.replay(seq),q=g.fromPhysical(state),leg=q.h.flatMap((v,c)=>v<profile.height?[c]:[]);
  const shared=results.cases.find(x=>x.profile.width===profile.width&&x.profile.height===profile.height&&x.sequence===seq&&x.k===k);
  let sumOps=0,sumGC=0,peak=0,compiles=0,completions=0;
  for(const z of ['Wlo','Whi'])for(const c of leg){
    const f=compileGuardedActionQBF(profile,q,{horizon:k,fixedFirstAction:c});
    const cnf=f.makeCNF(z,{auxMode:'staged'});
    const done=projectActionQBFLiveCompact(cnf,{maxMs:15000});
    sumOps+=f.records.stats.operations+done.stats.nontrivialOperations;
    sumGC+=done.stats.compactionWorkUnits;
    peak=Math.max(peak,done.stats.peakRetainedNodes);compiles++;
    if(done.status!=='EXACT')throw Error('baseline hit cap '+JSON.stringify({seq,k,z,c}));
    const expected=shared.result.actionIntervals.find(x=>x.column===c)[z==='Wlo'?'lower':'upper'];
    // value of Boolean WIN lower/upper: this direct comparison uses threshold not WDL scalar.
    const truth=shared.stat.find(x=>x.z===z);
    if(!truth)throw Error('missing shared baseline reference');
    const f2=compileGuardedActionQBF(profile,q,{horizon:k});
    const cnf2=f2.makeCNF(z,{auxMode:'staged'});
    const got=projectFirstActionVector(cnf2,{legalColumns:[c]});
    if(got.status!=='EXACT_ACTION_VECTOR'||got.actionValues[0].threshold!==done.value)
      throw Error('baseline mismatch '+JSON.stringify({seq,k,z,c,got:got.actionValues,done:done.value}));
    completions++;
  }
  const sharedWork=shared.stat.filter(x=>x.z==='Wlo'||x.z==='Whi').reduce((s,x)=>s+x.projOps+x.sourceOps,0);
  const sharedGC=shared.stat.filter(x=>x.z==='Wlo'||x.z==='Whi').reduce((s,x)=>s+x.gcWork,0);
  results.comparativeBaselines.push({profile,seq,k,legalActionCount:leg.length,
    independentThresholdCompiles:compiles,completed:completions,sharedThresholdCompiles:2,
    independentBooleanWork:sumOps,sharedBooleanWork:sharedWork,
    independentExtraCompactionWork:sumGC,sharedExtraCompactionWork:sharedGC,
    relativeBooleanWorkReduction:1-sharedWork/sumOps,
    peakIndependent:peak,peakShared:Math.max(...shared.stat.filter(x=>x.z==='Wlo'||x.z==='Whi').map(x=>x.peakNodes))});
}
console.log(JSON.stringify(results,null,2));
