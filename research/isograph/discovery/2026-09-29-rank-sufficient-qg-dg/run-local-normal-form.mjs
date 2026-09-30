import fs from 'node:fs';
import assert from 'node:assert/strict';
const CASES=[{width:4,height:4,k:4,label:'4x4-k4'},{width:4,height:4,k:3,label:'4x4-k3'},{width:3,height:4,k:3,label:'3x4-k3'},{width:4,height:3,k:3,label:'4x3-k3'}];
const OPS=['M','R','F','C'];
function permutations(a){if(a.length<2)return [a];const out=[];for(let i=0;i<a.length;i++)for(const tail of permutations([...a.slice(0,i),...a.slice(i+1)]))out.push([a[i],...tail]);return out;}const ORDERS=permutations(OPS);

function analyze({width:W,height:H,k:K,label}){
 const N=W*H,span=2**N;
 function pc(x){let n=0;for(let v=x>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
 function cells(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v);a.push({bit:b,col:b%W,row:Math.floor(b/W)});}return a;}
 function masks(){const a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);a.push(m>>>0);}return [...new Set(a)].sort((x,y)=>x-y);}
 const lines=masks(),won=b=>lines.some(m=>(m&b)===m);
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function residuals(self,opp){const a=[];for(const m of lines){if(m&opp)continue;const r=(m&~self)>>>0;if(r)a.push(r);}return norm(a);}
 const nodes=new Map(),byRank=Array.from({length:N+1},()=>[]),keyOf=(a,b)=>a*span+b;
 function visit(p0,p1,h,r){const key=keyOf(p0,p1);if(nodes.has(key))return key;const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);const terminal=w0||w1||r===N,winner=w0?0:w1?1:null,rec={key,p0,p1,h:[...h],r,terminal,winner,ch:[]};nodes.set(key,rec);byRank[r].push(rec);if(terminal)return key;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const k=(r&1)?visit(p0,p1|bit,h,r+1):visit(p0|bit,p1,h,r+1);h[c]--;rec.ch.push({c,key:k});}return key;}visit(0,0,Array(W).fill(0),0);
 const fclass=new Map(),sigid=new Map(),value=new Map();let fid=0;
 for(let r=N;r>=0;r--)for(const rec of byRank[r]){let s,v;if(rec.terminal){const t=rec.winner===0?'P0':rec.winner===1?'P1':'D';s='T:'+t;v=rec.winner===0?1:rec.winner===1?-1:0;}else{const slots=Array(W).fill('I'),vs=[];for(const z of rec.ch){const cr=nodes.get(z.key);slots[z.c]=cr.terminal?'T:'+(cr.winner===0?'P0':cr.winner===1?'P1':'D'):'C:'+fclass.get(z.key);vs.push(value.get(z.key));}s='N:'+slots.join('|');v=(r&1)?Math.min(...vs):Math.max(...vs);}let id=sigid.get(s);if(id===undefined){id=fid++;sigid.set(s,id);}fclass.set(rec.key,id);value.set(rec.key,v);}

 function qOf(rec){if(rec.terminal)return {t:true,k:rec.winner===0?'P0':rec.winner===1?'P1':'D'};return {t:false,h:[...rec.h],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};}
 function key(q){return q.t?'T:'+q.k:q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
 function counts(h){const rank=h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return {rank,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function M(q){if(q.t)return q;const x=counts(q.h);return {...q,r0:q.r0.filter(m=>pc(m)<=x.p0),r1:q.r1.filter(m=>pc(m)<=x.p1)};}
 function feasible(mask,h,p){const x=counts(h),rs=cells(mask).map(z=>z.row-h[z.col]+1).sort((a,b)=>a-b);if(rs.some(r=>r<=0))return false;let slot=p===x.m?1:2;for(const r of rs){while(slot<r)slot+=2;if(slot>x.rem)return false;slot+=2;}return true;}
 function R(q){if(q.t)return q;return {...q,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};}
 function F(q){if(q.t)return q;const x=counts(q.h),own=x.m?q.r1:q.r0;let f=0;for(let c=0;c<W;c++)if(q.h[c]<H){const b=1<<(q.h[c]*W+c);if(!own.some(r=>r===b))f|=b;}return x.m?{...q,r0:q.r0.filter(r=>(r&f)!==f)}:{...q,r1:q.r1.filter(r=>(r&f)!==f)};}
 function C(q){if(q.t)return q;const x=counts(q.h);if(x.rem<=0||(x.rem&1))return q;let c=0;for(let col=0;col<W;col++)if(q.h[col]<H)c|=1<<((H-1)*W+col);return x.m?{...q,r1:q.r1.filter(r=>(r&c)!==c)}:{...q,r0:q.r0.filter(r=>(r&c)!==c)};}
 const FN={M,R,F,C},applyOrder=(q,o)=>o.reduce((x,id)=>FN[id](x),q);
 function fixed(q,o){let x=q;for(let i=0;i<12;i++){const y=applyOrder(x,o);if(key(y)===key(x))return {q:y,rounds:i+1};x=y;}throw new Error('closure did not stabilize');}
 function normal(q){return fixed(q,['M','R','F','C']).q;}

 let idempotence={M:0,R:0,F:0,C:0},states=0,pairwiseMismatch=0,onePassNonunique=0,fixedNonunique=0,maxRounds=0;
 const pairExamples=[],orderExamples=[];
 const normalRecords=new Map(),groups=new Map();
 for(const rec of nodes.values()){
  const q=qOf(rec);states++;
  for(const id of OPS)if(key(FN[id](FN[id](q)))!==key(FN[id](q)))idempotence[id]++;
  for(let i=0;i<OPS.length;i++)for(let j=i+1;j<OPS.length;j++){const a=key(FN[OPS[i]](FN[OPS[j]](q))),b=key(FN[OPS[j]](FN[OPS[i]](q)));if(a!==b){pairwiseMismatch++;if(pairExamples.length<12)pairExamples.push({q:key(q),a:OPS[i]+OPS[j],ka:a,b:OPS[j]+OPS[i],kb:b});}}
  const one=new Set(),fix=new Set();
  for(const o of ORDERS){one.add(key(applyOrder(q,o)));const z=fixed(q,o);fix.add(key(z.q));maxRounds=Math.max(maxRounds,z.rounds);}
  if(one.size>1){onePassNonunique++;if(orderExamples.length<8)orderExamples.push({q:key(q),onePassForms:one.size,fixedForms:fix.size});}
  if(fix.size>1)fixedNonunique++;
  const nq=normal(q),nk=key(nq);normalRecords.set(rec.key,nq);
  let g=groups.get(nk);if(!g){g={f:new Set(),v:new Set(),n:0};groups.set(nk,g);}g.f.add(fclass.get(rec.key));g.v.add(value.get(rec.key));g.n++;
 }
 let fc=0,vc=0;for(const g of groups.values()){if(g.f.size>1)fc++;if(g.v.size>1)vc++;}

 function step(q,col,r){
  if(q.t)return q;const b=1<<(q.h[col]*W+col),m=r&1,own=m?q.r1:q.r0,opp=m?q.r0:q.r1,next=[];let win=false;
  for(const req of own){if(req&b){const z=(req&~b)>>>0;if(!z){win=true;break;}next.push(z);}else next.push(req);}
  if(win)return {t:true,k:m?'P1':'P0'};const h=[...q.h];h[col]++;if(r+1===N)return {t:true,k:'D'};const on=norm(next),op=norm(opp.filter(x=>(x&b)===0));return m?{t:false,h,r0:op,r1:on}:{t:false,h,r0:on,r1:op};
 }
 let edges=0,transitionMismatches=0;const transitionExamples=[];
 for(const rec of nodes.values())if(!rec.terminal){const nq=normal(qOf(rec));for(const z of rec.ch){edges++;const derived=normal(step(nq,z.c,rec.r)),actual=normal(qOf(nodes.get(z.key)));if(key(derived)!==key(actual)){transitionMismatches++;if(transitionExamples.length<16)transitionExamples.push({state:rec.key,col:z.c,parent:key(nq),derived:key(derived),actual:key(actual)});}}}

 return {label,width:W,height:H,k:K,physicalStates:nodes.size,futureClasses:fid,
  rewrite:{idempotenceViolations:idempotence,pairwiseOrderMismatches:pairwiseMismatch,onePassNonuniqueStates:onePassNonunique,fixedPointNonuniqueStates:fixedNonunique,maxRounds,pairExamples,orderExamples,allFixedPointOrdersConfluent:fixedNonunique===0},
  normalForm:{groups:groups.size,futureSufficient:fc===0,valueSufficient:vc===0,futureCollisionGroups:fc,valueCollisionGroups:vc},
  recursiveUpdate:{edges,mismatches:transitionMismatches,closed:transitionMismatches===0,examples:transitionExamples}
 };
}
const results=[];for(const c of CASES){console.log('normal-form',c.label);results.push(analyze(c));}
const out={schema:'connect4.rank_sufficient_qg_dg.local_normal_form.v1',date_author_local:'2026-09-29',warrant:'QGDG-EW-003',cases:results,crossCase:{confluentAll:results.every(x=>x.rewrite.allFixedPointOrdersConfluent),futureSufficientAll:results.every(x=>x.normalForm.futureSufficient),valueSufficientAll:results.every(x=>x.normalForm.valueSufficient),recursiveUpdateClosedAll:results.every(x=>x.recursiveUpdate.closed)},interpretation_guard:'Finite exact controls. Confluence and update closure are bounded evidence for a rank-local normal form, not standard-7x6 proof.'};
fs.writeFileSync(new URL('./LOCAL_NORMAL_FORM_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'QGDG_EW003_COMPLETE',crossCase:out.crossCase,cases:results},null,2));