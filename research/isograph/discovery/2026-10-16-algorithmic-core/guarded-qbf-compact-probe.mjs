#!/usr/bin/env node
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
import {projectActionQBFLiveCompact as projectActionQBF} from './guarded-action-qbf-project-live-compact.mjs';
const W=7,H=6,K=4,seq='44444',q={h:[0,0,0,5,0,0,0]},
  board=Array(W*H).fill(-1),dirs=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
for(let t=0;t<seq.length;t++){let c=Number(seq[t])-1;board[t*W+c]=t&1;}
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
  if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  lines.push(Array.from({length:K},(_,i)=>(r+i*dr)*W+c+i*dc));
}
const R=[0,1].map(p=>{
 const raw=lines.filter(l=>!l.some(i=>board[i]===1-p)).map(l=>l.filter(i=>board[i]===-1).reduce((a,i)=>a|1n<<BigInt(i),0n));
 const all=[...new Set(raw.map(String))].map(BigInt);
 return all.filter(a=>!all.some(b=>a!==b&&(b&a)===b));
});q.R0=R[0];q.R1=R[1];
const report={schema:'connect4.qbf-project-live-compact-probe.v0_1',source:seq,
  sourceResiduals:[q.R0.length,q.R1.length],
  status:'LIVE_COMPACTION_EXPERIMENT',budgets:{nodes:60000,operations:300000,maxMs:15000},
  cases:[]};
for(const k of [6,7,8]){
 for(const name of ['Wlo','Whi']){
  const cnf=compileGuardedActionQBF({width:W,height:H,connect:K},q,{horizon:k}).makeCNF(name,{auxMode:'staged'});
  const out=projectActionQBF(cnf,{maxNodes:60000,maxOperations:300000,maxMs:15000});
  console.error(k,name,out.status,out.stats.nontrivialOperations,out.stats.peakRetainedNodes,out.stats.compactionWorkUnits);
  report.cases.push({k,threshold:name,status:out.status,value:out.value,
    retainedNodes:out.stats.peakRetainedNodes,quantifiedBits:out.stats.quantifiedActionBits,
    gcCycles:out.stats.gcCycles,compactionWorkUnits:out.stats.compactionWorkUnits,
    maxPostGcNodes:out.stats.peakAfterCompaction,
    operations:out.stats.nontrivialOperations,stages:out.stages});
 }
}
console.log(JSON.stringify(report,null,2));
