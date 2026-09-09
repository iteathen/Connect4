import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const median=a=>{const b=a.toSorted((x,y)=>x-y);return b.length%2?b[b.length>>1]:(b[b.length/2-1]+b[b.length/2])/2;};
const output=[];
for(const path of process.argv.slice(2)){
  const all=readFileSync(path,'utf8').trim().split('\n').map(JSON.parse),env=all.find(x=>x.kind==='environment'),end=all.at(-1);assert.equal(end.kind,'complete');assert.equal(end.limited,0);
  const rows=all.filter(x=>x.kind==='trial'),groups=new Map();
  for(const r of rows){const k=`${r.cohort}/${r.mode}`;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
  const summaries=[];
  for(const [id,rs] of groups){const [cohort,mode]=id.split('/'),rounds=[];
    for(let i=0;i<env.repeats;i++){const a=rs.filter(r=>r.rep===i);const sum=f=>a.reduce((v,r)=>v+r[f],0);rounds.push({rep:i,cases:a.length,nodes:sum('nodes'),hits:sum('hits'),writes:sum('writes'),totalMs:sum('totalMs'),searchMs:sum('searchMs'),compileMs:sum('compileMs'),clearMs:sum('clearMs')});}
    assert(rounds.every(r=>r.nodes===rounds[0].nodes));
    const compare=groups.get(`${cohort}/base`),ratios=rounds.map(r=>r.totalMs/compare.filter(x=>x.rep===r.rep).reduce((s,x)=>s+x.totalMs,0));
    const unique=rs.filter(r=>r.rep===0),baseCases=compare.filter(r=>r.rep===0),byid=new Map(baseCases.map(r=>[r.id,r]));
    summaries.push({cohort,mode,cases:rounds[0].cases,nodes:rounds[0].nodes,nodeReduction:1-rounds[0].nodes/baseCases.reduce((s,x)=>s+x.nodes,0),hits:rounds[0].hits,medianTotalMs:median(rounds.map(r=>r.totalMs)),medianSearchMs:median(rounds.map(r=>r.searchMs)),medianCompileMs:median(rounds.map(r=>r.compileMs)),medianClearMs:median(rounds.map(r=>r.clearMs)),medianPairedTimeRatio:median(ratios),minPairedTimeRatio:Math.min(...ratios),maxPairedTimeRatio:Math.max(...ratios),fewerNodeCases:unique.filter(r=>r.nodes<byid.get(r.id).nodes).length,moreNodeCases:unique.filter(r=>r.nodes>byid.get(r.id).nodes).length,rounds});
  }
  output.push({path,env,completed:end,cohorts:summaries});
  for(const s of summaries)console.log(JSON.stringify({path:path.split('/').at(-1),...s,rounds:undefined}));
}
writeFileSync(new URL('../../../docs/research/evidence/2026-09-09-structural-quotient/summary.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
