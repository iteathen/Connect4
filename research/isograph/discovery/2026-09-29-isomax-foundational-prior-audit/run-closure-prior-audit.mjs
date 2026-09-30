import fs from 'node:fs';
import assert from 'node:assert/strict';

const I=JSON.parse(fs.readFileSync(new URL('./AUDIT_INPUT_0_1.json',import.meta.url),'utf8')),W=5,H=4,N=20;
function parse(k){const [h,a,b]=k.slice(2).split('|');return {key:k,heights:h.split(',').map(Number),r0:a?a.split('.').filter(Boolean).map(Number):[],r1:b?b.split('.').filter(Boolean).map(Number):[]};}
const rank=h=>h.reduce((a,b)=>a+b,0);
function bits(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const q=31-Math.clz32(v&-v);a.push({bit:q,col:q%W,row:Math.floor(q/W)});}return a;}
function pop(m){return bits(m).length;}
function counts(h){const r=rank(h),rem=N-r,m=r&1,mm=Math.ceil(rem/2),om=Math.floor(rem/2);return {r,rem,m,p0:m===0?mm:om,p1:m===1?mm:om};}
function remainingCapacity(m,h,p){const c=counts(h);return pop(m)<=(p===0?c.p0:c.p1);}
function releaseGreedy(m,h,p){const c=counts(h),rs=bits(m).map(x=>x.row-h[x.col]+1).sort((a,b)=>a-b);let slot=p===c.m?1:2;for(const q of rs){if(q<=0)return false;while(slot<q)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;}
function exactSupportTurnSchedule(mask,heights,owner){
  const startRank=rank(heights),memo=new Map();
  function dfs(h,remaining,depth){
    if(remaining===0)return true;
    const k=h.join(',')+'|'+remaining+'|'+depth;
    if(memo.has(k))return memo.get(k);
    const player=(startRank+depth)&1;
    for(let c=0;c<W;c++)if(h[c]<H){
      const b=1<<(h[c]*W+c);
      if((remaining&b)&&player!==owner)continue;
      const nh=[...h];nh[c]++;
      const nr=(remaining&b)?(remaining&~b)>>>0:remaining;
      if(dfs(nh,nr,depth+1)){memo.set(k,true);return true;}
    }
    memo.set(k,false);return false;
  }
  return dfs([...heights],mask>>>0,0);
}
const states=new Map;
for(const rr of I.routeRows)for(const st of rr.steps){states.set(st.parentStateKey,parse(st.parentStateKey));states.set(st.childStateKey,parse(st.childStateKey));}
const rows=[];
for(const s of [...states.values()].sort((a,b)=>a.key.localeCompare(b.key))){
  for(const [p,rs] of [[0,s.r0],[1,s.r1]])for(const m of rs){
    const rem=remainingCapacity(m,s.heights,p),rel=releaseGreedy(m,s.heights,p),exact=exactSupportTurnSchedule(m,s.heights,p);
    rows.push({state:s.key,rank:rank(s.heights),owner:p,mask:m,cellCount:pop(m),remainingCapacity:rem,supportReleaseTurnCapacity:rel,exactIsolatedSupportTurnSchedule:exact});
  }
}
const mismatches=rows.filter(x=>x.supportReleaseTurnCapacity!==x.exactIsolatedSupportTurnSchedule);
const weakerFalsePositives=rows.filter(x=>x.remainingCapacity&&!x.exactIsolatedSupportTurnSchedule);
const out={
  schema:'connect4.isomax.foundational_prior_audit.closures.v1',
  date_author_local:'2026-09-29',
  scope:'all residuals appearing in exact states on the repair-surviving witness routes',
  rows,
  results:{
    residualsAudited:rows.length,
    supportReleaseMatchesExactIsolatedSchedule:mismatches.length===0,
    supportReleaseMismatchCount:mismatches.length,
    remainingCapacityFalsePositiveCount:weakerFalsePositives.length,
    allStoredResidualsPassSupportRelease:rows.every(x=>x.supportReleaseTurnCapacity)
  },
  mismatches,
  remainingCapacityFalsePositiveExamples:weakerFalsePositives.slice(0,32),
  semantics:{
    remainingMoveCapacity:'necessary cardinality bound only',
    supportReleaseTurnCapacity:'on this audited witness set, agrees with exhaustive alternating-turn/gravity realizability of each residual considered in isolation',
    limitation:'isolated residual realizability does not include first-win termination, simultaneous competing residuals, or proof/resource context; it must not be called complete game realizability',
    finalCapParity:'logical pruning: when remaining cells are positive and even, the current mover cannot own every open top cap because the opponent owns the final fill ply',
    nonterminalFrontierBlocker:'logical pruning: every nonterminal legal next move occupies one non-immediate-winning frontier cell, so the other player cannot retain a residual requiring all such cells'
  }
};
fs.writeFileSync(new URL('./CLOSURE_PRIOR_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'CLOSURE_PRIOR_AUDIT_COMPLETE',results:out.results,mismatches:out.mismatches,remainingCapacityFalsePositiveExamples:out.remainingCapacityFalsePositiveExamples},null,2));
