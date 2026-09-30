import fs from 'node:fs';
import assert from 'node:assert/strict';
const CASES=[{width:4,height:4,k:4,label:'4x4-k4'},{width:4,height:4,k:3,label:'4x4-k3'},{width:3,height:4,k:3,label:'3x4-k3'},{width:4,height:3,k:3,label:'4x3-k3'}];

function analyze({width:W,height:H,k:K,label}){
 const N=W*H,span=2**N;
 function pc(x){let n=0;for(let v=x>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
 function cells(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v);a.push({col:b%W,row:Math.floor(b/W)});}return a;}
 function masks(){const a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);a.push(m>>>0);}return [...new Set(a)].sort((x,y)=>x-y);}
 const lines=masks(),won=b=>lines.some(m=>(m&b)===m);
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function residuals(self,opp){const a=[];for(const m of lines){if(m&opp)continue;const r=(m&~self)>>>0;if(r)a.push(r);}return norm(a);}
 const nodes=new Map(),byRank=Array.from({length:N+1},()=>[]),keyOf=(a,b)=>a*span+b;
 function visit(p0,p1,h,r){const key=keyOf(p0,p1);if(nodes.has(key))return key;const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);const terminal=w0||w1||r===N,winner=w0?0:w1?1:null,rec={key,p0,p1,h:[...h],r,terminal,winner,ch:[]};nodes.set(key,rec);byRank[r].push(rec);if(terminal)return key;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const k=(r&1)?visit(p0,p1|bit,h,r+1):visit(p0|bit,p1,h,r+1);h[c]--;rec.ch.push({c,key:k});}return key;}visit(0,0,Array(W).fill(0),0);
 const fclass=new Map(),sigid=new Map();let fid=0;
 for(let r=N;r>=0;r--)for(const rec of byRank[r]){let s;if(rec.terminal)s='T:'+(rec.winner===0?'P0':rec.winner===1?'P1':'D');else{const slots=Array(W).fill('I');for(const z of rec.ch){const cr=nodes.get(z.key);slots[z.c]=cr.terminal?'T:'+(cr.winner===0?'P0':cr.winner===1?'P1':'D'):'C:'+fclass.get(z.key);}s='N:'+slots.join('|');}let id=sigid.get(s);if(id===undefined){id=fid++;sigid.set(s,id);}fclass.set(rec.key,id);}
 function qOf(rec){if(rec.terminal)return {t:true,k:rec.winner===0?'P0':rec.winner===1?'P1':'D'};return {t:false,h:[...rec.h],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};}
 function key(q){return q.t?'T:'+q.k:q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
 function counts(h){const rank=h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return {rank,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function M(q){if(q.t)return q;const x=counts(q.h);return {...q,r0:q.r0.filter(m=>pc(m)<=x.p0),r1:q.r1.filter(m=>pc(m)<=x.p1)};}
 function feasible(mask,h,p){const x=counts(h),rs=cells(mask).map(z=>z.row-h[z.col]+1).sort((a,b)=>a-b);if(rs.some(r=>r<=0))return false;let slot=p===x.m?1:2;for(const r of rs){while(slot<r)slot+=2;if(slot>x.rem)return false;slot+=2;}return true;}
 function R(q){if(q.t)return q;return {...q,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};}
 function F(q){if(q.t)return q;const x=counts(q.h),own=x.m?q.r1:q.r0;let f=0;for(let c=0;c<W;c++)if(q.h[c]<H){const b=1<<(q.h[c]*W+c);if(!own.some(r=>r===b))f|=b;}return x.m?{...q,r0:q.r0.filter(r=>(r&f)!==f)}:{...q,r1:q.r1.filter(r=>(r&f)!==f)};}
 function C(q){if(q.t)return q;const x=counts(q.h);if(x.rem<=0||(x.rem&1))return q;let c=0;for(let col=0;col<W;col++)if(q.h[col]<H)c|=1<<((H-1)*W+col);return x.m?{...q,r1:q.r1.filter(r=>(r&c)!==c)}:{...q,r0:q.r0.filter(r=>(r&c)!==c)};}
 function normal(q){return C(F(R(M(q))));}
 const nkey=new Map();for(const rec of nodes.values())nkey.set(rec.key,key(normal(qOf(rec))));
 const parentGroups=new Map();
 for(const rec of nodes.values()){
  if(rec.terminal)continue;
  const pk=nkey.get(rec.key);let g=parentGroups.get(pk);if(!g){g=[];parentGroups.set(pk,g);}g.push(rec);
 }
 let multiPhysicalGroups=0,actionFibers=0,congruenceFailures=0,futureOnlyFailures=0,terminalDisagreements=0;
 const examples=[];
 for(const [pk,parents] of parentGroups){
  if(parents.length>1)multiPhysicalGroups++;
  const legal=parents[0].ch.map(x=>x.c).sort((a,b)=>a-b);
  for(const p of parents)assert.deepEqual(p.ch.map(x=>x.c).sort((a,b)=>a-b),legal,'same normalized support must have same legal columns');
  for(const col of legal){
   actionFibers++;
   const outcomes=new Map(),futureSet=new Set();
   for(const p of parents){
    const ch=p.ch.find(x=>x.c===col),cr=nodes.get(ch.key),out=cr.terminal?'T:'+(cr.winner===0?'P0':cr.winner===1?'P1':'D'):'Q:'+nkey.get(cr.key);
    let a=outcomes.get(out);if(!a){a=[];outcomes.set(out,a);}if(a.length<4)a.push({parent:p.key,child:cr.key,future:fclass.get(cr.key)});
    futureSet.add(fclass.get(cr.key));
   }
   if(outcomes.size>1){
    congruenceFailures++;
    if(futureSet.size===1)futureOnlyFailures++;
    if([...outcomes.keys()].some(x=>x.startsWith('T:'))&&outcomes.size>1)terminalDisagreements++;
    if(examples.length<24)examples.push({parentNormal:pk,col,outcomes:[...outcomes.entries()].map(([out,rows])=>({out,rows})),childFutureClasses:[...futureSet]});
   }
  }
 }
 return {label,width:W,height:H,k:K,physicalStates:nodes.size,normalGroups:parentGroups.size,multiPhysicalGroups,actionFibers,congruenceFailures,futureOnlyFailures,terminalDisagreements,transitionCongruent:congruenceFailures===0,examples};
}
const results=[];for(const c of CASES){console.log('congruence',c.label);results.push(analyze(c));}
const out={schema:'connect4.rank_sufficient_qg_dg.transition_congruence.v1',date_author_local:'2026-09-29',warrant:'QGDG-EW-004',cases:results,crossCase:{congruentAll:results.every(x=>x.transitionCongruent),failures:results.reduce((n,x)=>n+x.congruenceFailures,0),futureOnlyFailures:results.reduce((n,x)=>n+x.futureOnlyFailures,0),terminalDisagreements:results.reduce((n,x)=>n+x.terminalDisagreements,0)},interpretation_guard:'Failure means the exact chosen normal-form representative is not a deterministic Markov quotient. Future-only failures may still admit a coarser behavior-class recursive quotient; no future oracle is used to construct the tested Q.'};
fs.writeFileSync(new URL('./TRANSITION_CONGRUENCE_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'QGDG_EW004_COMPLETE',crossCase:out.crossCase,cases:results.map(x=>({label:x.label,normalGroups:x.normalGroups,multiPhysicalGroups:x.multiPhysicalGroups,actionFibers:x.actionFibers,failures:x.congruenceFailures,futureOnly:x.futureOnlyFailures,terminal:x.terminalDisagreements}))},null,2));