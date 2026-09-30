import fs from 'node:fs';
import assert from 'node:assert/strict';

const cases=[
 {width:4,height:4,k:4,label:'4x4-k4'},
 {width:4,height:4,k:3,label:'4x4-k3'},
 {width:3,height:4,k:3,label:'3x4-k3'},
 {width:4,height:3,k:3,label:'4x3-k3'},
];
const CANDS=['QO','REMAINING','RELEASE','FRONTIER','FINALCAP','FRONTIER_CAP','ALL_LOCAL'];

function analyze({width:W,height:H,k:K,label}){
 const N=W*H,span=2**N;
 function winMasks(){const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);}return [...new Set(o)].sort((a,b)=>a-b);}
 const lines=winMasks(),won=b=>lines.some(m=>(b&m)===m);
 function pc(x){let n=0;for(let v=x>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
 function bitCells(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const q=31-Math.clz32(v&-v);a.push({bit:q,col:q%W,row:Math.floor(q/W)});}return a;}
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function residuals(self,opp){const raw=[];for(const m of lines){if(m&opp)continue;const r=(m&~self)>>>0;if(r)raw.push(r);}return norm(raw);}
 const nodes=new Map(),byRank=Array.from({length:N+1},()=>[]);
 const keyOf=(a,b)=>a*span+b;
 function visit(p0,p1,h,rank){
  const key=keyOf(p0,p1);if(nodes.has(key))return key;
  const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N,winner=w0?0:w1?1:null,rec={key,p0,p1,h:[...h],rank,terminal,winner,children:[]};
  nodes.set(key,rec);byRank[rank].push(rec);if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const ch=(rank&1)?visit(p0,p1|bit,h,rank+1):visit(p0|bit,p1,h,rank+1);h[c]--;rec.children.push({col:c,key:ch});}
  return key;
 }
 visit(0,0,Array(W).fill(0),0);

 const fClass=new Map(),sigId=new Map(),value=new Map();let nextId=0;
 for(let rank=N;rank>=0;rank--)for(const rec of byRank[rank]){
  let sig,v;if(rec.terminal){const t=rec.winner===0?'P0':rec.winner===1?'P1':'D';sig='T:'+t;v=rec.winner===0?1:rec.winner===1?-1:0;}
  else{const slots=Array(W).fill('I'),vals=[];for(const ch of rec.children){const cr=nodes.get(ch.key);slots[ch.col]=cr.terminal?'T:'+(cr.winner===0?'P0':cr.winner===1?'P1':'D'):'C:'+fClass.get(ch.key);vals.push(value.get(ch.key));}sig='N:'+slots.join('|');v=(rank&1)?Math.min(...vals):Math.max(...vals);}
  let id=sigId.get(sig);if(id===undefined){id=nextId++;sigId.set(sig,id);}fClass.set(rec.key,id);value.set(rec.key,v);
 }

 function qOf(rec){if(rec.terminal)return {terminal:true,kind:rec.winner===0?'P0':rec.winner===1?'P1':'D'};return {terminal:false,h:[...rec.h],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};}
 function qKey(q){return q.terminal?'T:'+q.kind:q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
 function counts(h){const rank=h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return {rank,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function remaining(q){if(q.terminal)return q;const c=counts(q.h);return {...q,r0:q.r0.filter(m=>pc(m)<=c.p0),r1:q.r1.filter(m=>pc(m)<=c.p1)};}
 function feasible(mask,h,p){const c=counts(h),rs=bitCells(mask).map(x=>x.row-h[x.col]+1).sort((a,b)=>a-b);if(rs.some(x=>x<=0))return false;let slot=p===c.m?1:2;for(const r of rs){while(slot<r)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;}
 function release(q){if(q.terminal)return q;return {...q,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};}
 function frontier(q){if(q.terminal)return q;const c=counts(q.h),own=c.m?q.r1:q.r0;let F=0;for(let col=0;col<W;col++)if(q.h[col]<H){const b=1<<(q.h[col]*W+col),immediate=own.some(r=>r===b);if(!immediate)F|=b;}if(c.m)return {...q,r0:q.r0.filter(r=>(r&F)!==F)};return {...q,r1:q.r1.filter(r=>(r&F)!==F)};}
 function finalcap(q){if(q.terminal)return q;const c=counts(q.h);if(c.rem<=0||(c.rem&1))return q;let C=0;for(let col=0;col<W;col++)if(q.h[col]<H)C|=1<<((H-1)*W+col);if(c.m)return {...q,r1:q.r1.filter(r=>(r&C)!==C)};return {...q,r0:q.r0.filter(r=>(r&C)!==C)};}
 function apply(q,id){if(id==='QO')return q;if(id==='REMAINING')return remaining(q);if(id==='RELEASE')return release(q);if(id==='FRONTIER')return frontier(q);if(id==='FINALCAP')return finalcap(q);if(id==='FRONTIER_CAP')return finalcap(frontier(q));if(id==='ALL_LOCAL')return finalcap(frontier(release(q)));throw new Error(id);}
 function symdiff(a,b){const A=new Set(a),B=new Set(b);return [...A].filter(x=>!B.has(x)).length+[...B].filter(x=>!A.has(x)).length;}
 function diff(a,b){return {support:a.h.reduce((n,x,i)=>n+(x!==b.h[i]),0),r0:symdiff(a.r0,b.r0),r1:symdiff(a.r1,b.r1)};}
 function explainMask(mask,h,p){
  const c=counts(h),rels=bitCells(mask).map(x=>({...x,release:x.row-h[x.col]+1})).sort((a,b)=>a.release-b.release);
  let caps=0;for(let col=0;col<W;col++)if(h[col]<H)caps|=1<<((H-1)*W+col);
  return {mask,p,size:pc(mask),remainingMoves:p?c.p1:c.p0,remainingCapacity:pc(mask)<= (p?c.p1:c.p0),releaseFeasible:feasible(mask,h,p),isAllOpenCaps:(mask>>>0)===(caps>>>0),cells:rels};
 }

 const qRecords=new Map(),futureToQ=new Map(),groups=Object.fromEntries(CANDS.map(c=>[c,new Map()]));
 for(const rec of nodes.values()){
  const q=qOf(rec),qk=qKey(q),f=fClass.get(rec.key),v=value.get(rec.key);
  if(!qRecords.has(qk))qRecords.set(qk,{q,f,v,physical:rec.key});
  else{assert.equal(qRecords.get(qk).f,f);assert.equal(qRecords.get(qk).v,v);}
  let fs=futureToQ.get(f);if(!fs){fs=new Set();futureToQ.set(f,fs);}fs.add(qk);
  for(const c of CANDS){const ck=qKey(apply(q,c));let g=groups[c].get(ck);if(!g){g={f:new Set(),v:new Set(),states:0,examples:[]};groups[c].set(ck,g);}g.f.add(f);g.v.add(v);g.states++;if(g.examples.length<4)g.examples.push({physical:rec.key,q:qk,f,v});}
 }

 const census={};
 for(const c of CANDS){let fc=0,vc=0;const fe=[],ve=[];for(const [key,g] of groups[c]){if(g.f.size>1){fc++;if(fe.length<6)fe.push({key,f:[...g.f],v:[...g.v],examples:g.examples});}if(g.v.size>1){vc++;if(ve.length<6)ve.push({key,f:[...g.f],v:[...g.v],examples:g.examples});}}census[c]={groups:groups[c].size,futureSufficient:fc===0,valueSufficient:vc===0,futureCollisionGroups:fc,valueCollisionGroups:vc,futureExamples:fe,valueExamples:ve};}

 let redundantFutureClasses=0,sameSupportRedundantClasses=0,minPair=null;
 const minExamples=[];
 const closureErase={REMAINING:0,RELEASE:0,FRONTIER:0,FINALCAP:0,FRONTIER_CAP:0,ALL_LOCAL:0}; let sameSupportPairsChecked=0;
 for(const [f,set] of futureToQ){
  const qs=[...set].map(k=>qRecords.get(k));
  if(qs.length<2)continue;redundantFutureClasses++;
  const bySupport=new Map();for(const x of qs){const sk=x.q.terminal?'T':x.q.h.join(',');let a=bySupport.get(sk);if(!a){a=[];bySupport.set(sk,a);}a.push(x);}
  let hasSame=false;
  for(const a of bySupport.values())if(a.length>1){
   hasSame=true;
   for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
    sameSupportPairsChecked++;const d=diff(a[i].q,a[j].q),score=d.r0+d.r1;
    for(const c of Object.keys(closureErase))if(qKey(apply(a[i].q,c))===qKey(apply(a[j].q,c)))closureErase[c]++;
    if(!minPair||score<minPair.score){
     minPair={score,future:f,a:a[i],b:a[j],d};
    }
   }
  }
  if(hasSame)sameSupportRedundantClasses++;
 }
 if(minPair){
  const changed=[];
  for(const [p,key] of [[0,'r0'],[1,'r1']]){
   const A=new Set(minPair.a.q[key]),B=new Set(minPair.b.q[key]);
   for(const m of A)if(!B.has(m))changed.push({side:'A_only',...explainMask(m,minPair.a.q.h,p)});
   for(const m of B)if(!A.has(m))changed.push({side:'B_only',...explainMask(m,minPair.a.q.h,p)});
  }
  minExamples.push({score:minPair.score,future:minPair.future,diff:minPair.d,qA:qKey(minPair.a.q),qB:qKey(minPair.b.q),value:minPair.a.v,changed});
 }

 return {
  label,width:W,height:H,k:K,physicalStates:nodes.size,qRepresentations:qRecords.size,futureClasses:nextId,
  redundancy:{redundantFutureClasses,sameSupportRedundantClasses,sameSupportPairsChecked,minExamples,closureErasePairCounts:closureErase},
  compressionCensus:census
 };
}
const results=[];for(const c of cases){console.log('redundancy',c.label);results.push(analyze(c));}
const cross={};for(const c of CANDS)cross[c]={futureAll:results.every(r=>r.compressionCensus[c].futureSufficient),valueAll:results.every(r=>r.compressionCensus[c].valueSufficient),failedFuture:results.filter(r=>!r.compressionCensus[c].futureSufficient).map(r=>r.label),failedValue:results.filter(r=>!r.compressionCensus[c].valueSufficient).map(r=>r.label)};
const out={schema:'connect4.rank_sufficient_qg_dg.qo_redundancy_audit.v1',date_author_local:'2026-09-29',warrant:'QGDG-EW-002',cases:results,crossCase:cross,interpretation_guard:'Closures are current-rank candidate compressions. Finite positive sufficiency is scoped; redundancy pairs are discovered by future equivalence but closure rules themselves are predeclared and future-blind.'};
fs.writeFileSync(new URL('./QO_REDUNDANCY_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'QGDG_EW002_COMPLETE',crossCase:cross,cases:results.map(r=>({label:r.label,redundancy:r.redundancy,census:Object.fromEntries(Object.entries(r.compressionCensus).map(([k,v])=>[k,{groups:v.groups,future:v.futureSufficient,value:v.valueSufficient,fc:v.futureCollisionGroups,vc:v.valueCollisionGroups}]))}))},null,2));