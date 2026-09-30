import fs from 'node:fs';
import assert from 'node:assert/strict';
const CASES=[{width:4,height:4,k:4,label:'4x4-k4'},{width:4,height:4,k:3,label:'4x4-k3'}];

function analyze({width:W,height:H,k:K,label}){
 const N=W*H,span=2**N;
 function pc(x){let n=0;for(let v=x>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
 function bits(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v);a.push({bit:b,col:b%W,row:Math.floor(b/W)});}return a;}
 function masks(){const a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);a.push(m>>>0);}return [...new Set(a)].sort((x,y)=>x-y);}
 const lines=masks(),won=b=>lines.some(m=>(m&b)===m);
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function residuals(self,opp){const a=[];for(const m of lines){if(m&opp)continue;const r=(m&~self)>>>0;if(r)a.push(r);}return norm(a);}
 const nodes=new Map(),keyOf=(a,b)=>a*span+b;
 function visit(p0,p1,h,r){const key=keyOf(p0,p1);if(nodes.has(key))return key;const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);const terminal=w0||w1||r===N,winner=w0?0:w1?1:null,rec={key,p0,p1,h:[...h],r,terminal,winner,ch:[]};nodes.set(key,rec);if(terminal)return key;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const k=(r&1)?visit(p0,p1|bit,h,r+1):visit(p0|bit,p1,h,r+1);h[c]--;rec.ch.push({c,key:k});}return key;}visit(0,0,Array(W).fill(0),0);
 function qOf(rec){if(rec.terminal)return {t:true,k:rec.winner===0?'P0':rec.winner===1?'P1':'D'};return {t:false,h:[...rec.h],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};}
 function key(q){return q.t?'T:'+q.k:q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
 function parse(k){if(k.startsWith('T:'))return {t:true,k:k.slice(2)};const [h,a,b]=k.split('|');return {t:false,h:h.split(',').map(Number),r0:a?a.split('.').filter(Boolean).map(Number):[],r1:b?b.split('.').filter(Boolean).map(Number):[]};}
 function counts(h){const rank=h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return {rank,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function M(q){if(q.t)return q;const x=counts(q.h);return {...q,r0:q.r0.filter(m=>pc(m)<=x.p0),r1:q.r1.filter(m=>pc(m)<=x.p1)};}
 function releaseSimple(mask,h,p){const x=counts(h),rs=bits(mask).map(z=>z.row-h[z.col]+1).sort((a,b)=>a-b);if(rs.some(r=>r<=0))return false;let slot=p===x.m?1:2;for(const r of rs){while(slot<r)slot+=2;if(slot>x.rem)return false;slot+=2;}return true;}
 function R(q){if(q.t)return q;return {...q,r0:q.r0.filter(m=>releaseSimple(m,q.h,0)),r1:q.r1.filter(m=>releaseSimple(m,q.h,1))};}
 function F(q){if(q.t)return q;const x=counts(q.h),own=x.m?q.r1:q.r0;let f=0;for(let c=0;c<W;c++)if(q.h[c]<H){const b=1<<(q.h[c]*W+c);if(!own.some(r=>r===b))f|=b;}return x.m?{...q,r0:q.r0.filter(r=>(r&f)!==f)}:{...q,r1:q.r1.filter(r=>(r&f)!==f)};}
 function C(q){if(q.t)return q;const x=counts(q.h);if(x.rem<=0||(x.rem&1))return q;let c=0;for(let col=0;col<W;col++)if(q.h[col]<H)c|=1<<((H-1)*W+col);return x.m?{...q,r1:q.r1.filter(r=>(r&c)!==c)}:{...q,r0:q.r0.filter(r=>(r&c)!==c)};}
 function normal(q){return C(F(R(M(q))));}
 const nk=new Map();for(const rec of nodes.values())nk.set(rec.key,key(normal(qOf(rec))));
 const groups=new Map();for(const rec of nodes.values())if(!rec.terminal){const k=nk.get(rec.key);let a=groups.get(k);if(!a){a=[];groups.set(k,a);}a.push(rec);}
 function exactSchedule(mask,h,target){
  const required=bits(mask),memo=new Map(),startRank=h.reduce((a,b)=>a+b,0);
  function done(x){return required.every(z=>z.row<x[z.col]);}
  function f(x){
   if(done(x))return true;
   const k=x.join(',');if(memo.has(k))return memo.get(k);
   const depth=x.reduce((a,b)=>a+b,0)-startRank,player=(startRank+depth)&1;
   for(let c=0;c<W;c++)if(x[c]<H){
    const row=x[c],bit=1<<(row*W+c);
    if((mask&bit)&&player!==target)continue;
    const y=[...x];y[c]++;
    if(f(y)){memo.set(k,true);return true;}
   }
   memo.set(k,false);return false;
  }
  return f([...h]);
 }
 function openCaps(h){let c=0;for(let col=0;col<W;col++)if(h[col]<H)c|=1<<((H-1)*W+col);return c>>>0;}
 function sym(a,b){const A=new Set(a),B=new Set(b);return {aOnly:[...A].filter(x=>!B.has(x)),bOnly:[...B].filter(x=>!A.has(x))};}
 const occurrence=[],unique=new Map();let failures=0;
 for(const [pk,parents] of groups){
  const legal=parents[0].ch.map(x=>x.c);
  for(const col of legal){
   const outs=new Map();
   for(const p of parents){const cr=nodes.get(p.ch.find(x=>x.c===col).key),out=cr.terminal?'T:'+(cr.winner===0?'P0':cr.winner===1?'P1':'D'):'Q:'+nk.get(cr.key);let a=outs.get(out);if(!a){a=[];outs.set(out,a);}a.push(p.key);}
   if(outs.size<2)continue;failures++;
   const qs=[...outs.keys()].filter(x=>x.startsWith('Q:')).map(x=>parse(x.slice(2)));
   for(let i=0;i<qs.length;i++)for(let j=i+1;j<qs.length;j++){
    assert.deepEqual(qs[i].h,qs[j].h);
    for(const [player,k] of [[0,'r0'],[1,'r1']]){
     const d=sym(qs[i][k],qs[j][k]);
     for(const [side,ms] of [['A_ONLY',d.aOnly],['B_ONLY',d.bOnly]])for(const mask of ms){
      const c=counts(qs[i].h),row={parentNormal:pk,col,player,relativeToMover:player===c.m?'MOVER':'OPPONENT',side,mask,size:pc(mask),support:[...qs[i].h],simpleRelease:releaseSimple(mask,qs[i].h,player),exactSchedule:exactSchedule(mask,qs[i].h,player),allOpenCaps:(mask>>>0)===openCaps(qs[i].h)};
      occurrence.push(row);const uk=[player,mask,qs[i].h.join(',')].join('|');if(!unique.has(uk))unique.set(uk,row);
     }
    }
   }
  }
 }
 const rows=[...unique.values()];
 function count(pred){return rows.filter(pred).length;}
 const patterns={};
 for(const x of rows){const k=[x.relativeToMover,x.simpleRelease?'simpleY':'simpleN',x.exactSchedule?'exactY':'exactN',x.allOpenCaps?'capsY':'capsN',x.size].join('|');patterns[k]=(patterns[k]??0)+1;}
 return {label,width:W,height:H,k:K,congruenceFailures:failures,differenceOccurrences:occurrence.length,uniqueResidualContexts:rows.length,
  classification:{simpleReleaseTrue:count(x=>x.simpleRelease),exactScheduleTrue:count(x=>x.exactSchedule),simpleTrueExactFalse:count(x=>x.simpleRelease&&!x.exactSchedule),allOpenCaps:count(x=>x.allOpenCaps),opponentOwned:count(x=>x.relativeToMover==='OPPONENT'),moverOwned:count(x=>x.relativeToMover==='MOVER')},
  patterns,examples:rows.slice(0,64)};
}
const results=[];for(const c of CASES){console.log('realizability-anatomy',c.label);results.push(analyze(c));}
const out={schema:'connect4.rank_sufficient_qg_dg.ambiguity_realizability.v1',date_author_local:'2026-09-29',warrant:'QGDG-EW-005',cases:results,crossCase:{uniqueContexts:results.reduce((n,x)=>n+x.uniqueResidualContexts,0),exactScheduleTrue:results.reduce((n,x)=>n+x.classification.exactScheduleTrue,0),simpleTrueExactFalse:results.reduce((n,x)=>n+x.classification.simpleTrueExactFalse,0),allOpenCaps:results.reduce((n,x)=>n+x.classification.allOpenCaps,0)},interpretation_guard:'Exact isolated schedule is a structural analysis oracle that ignores wins/other residual objectives. It is not adopted as the final Q rule and its current DP implementation does not satisfy the desired direct-construction standard by itself.'};
fs.writeFileSync(new URL('./AMBIGUITY_REALIZABILITY_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'QGDG_EW005_COMPLETE',crossCase:out.crossCase,cases:results.map(x=>({label:x.label,failures:x.congruenceFailures,contexts:x.uniqueResidualContexts,classification:x.classification,patterns:x.patterns}))},null,2));