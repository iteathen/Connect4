import fs from 'node:fs';
import assert from 'node:assert/strict';
const W=4,H=4,K=4,N=16;
function masks(){const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[d,e]of[[1,0],[0,1],[1,1],[1,-1]]){const x=c+3*d,y=r+3*e;if(x<0||x>=W||y<0||y>=H)continue;let m=0;for(let i=0;i<4;i++)m|=1<<((r+i*e)*W+c+i*d);o.push(m>>>0);}return[...new Set(o)];}
const L=masks(),won=b=>L.some(m=>(b&m)===m);
function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&(a&b)===b));}
function res(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
function en(a,b,h,r){const k=a+':'+b;if(memo.has(k))return k;const A=won(a),B=won(b),t=A||B||r===N,x={k,a,b,h:[...h],r,t,w:A?0:B?1:null,ch:[]};memo.set(k,x);byRank[r].push(x);if(t)return k;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?en(a,b|bit,h,r+1):en(a|bit,b,h,r+1);h[c]--;x.ch.push({c,k:y});}return k;}en(0,0,new Uint8Array(W),0);assert.equal(memo.size,161029);
const nts=[...memo.values()].filter(x=>!x.t);
function q(x){return{h:[...x.h],r0:res(x.a,x.b),r1:res(x.b,x.a)};}function key(x){return x.h.join(',')+'|'+x.r0.join('.')+'|'+x.r1.join('.');}
function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}function pc(m){return bits(m).length;}
function cnt(x){const r=x.h.reduce((a,b)=>a+b,0),n=N-r,m=r&1;return{r,n,m,p0:m?Math.floor(n/2):Math.ceil(n/2),p1:m?Math.ceil(n/2):Math.floor(n/2)};}
function M(x){const c=cnt(x);return{h:x.h,r0:x.r0.filter(z=>pc(z)<=c.p0),r1:x.r1.filter(z=>pc(z)<=c.p1)};}
function feasible(mask,h,p){const c=cnt({h,r0:[],r1:[]}),ds=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);let s=p===c.m?1:2;for(const d of ds){while(s<d)s+=2;if(s>c.n)return false;s+=2;}return true;}
function R(x){return{h:x.h,r0:x.r0.filter(z=>feasible(z,x.h,0)),r1:x.r1.filter(z=>feasible(z,x.h,1))};}
function F(x){const c=cnt(x),own=c.m?x.r1:x.r0;let f=0;for(let col=0;col<W;col++)if(x.h[col]<H){const b=1<<(x.h[col]*W+col);if(!own.some(z=>z===b))f|=b;}return c.m?{h:x.h,r0:x.r0.filter(z=>(z&f)!==f),r1:x.r1}:{h:x.h,r0:x.r0,r1:x.r1.filter(z=>(z&f)!==f)};}
function G(x){let caps=0;for(let col=0;col<W;col++)if(x.h[col]<H)caps|=1<<((H-1)*W+col);if(!caps)return x;const finalPlayer=(N-1)&1,nonFinal=1-finalPlayer;return nonFinal?{h:x.h,r0:x.r0,r1:x.r1.filter(z=>(z&caps)!==caps)}:{h:x.h,r0:x.r0.filter(z=>(z&caps)!==caps),r1:x.r1};}
const exactMemo=new Map();
function exactIsolatedFeasible(mask,h,owner){
  const k=h.join(',')+'|'+owner+'|'+(mask>>>0),known=exactMemo.get(k);
  if(known!==undefined)return known;
  if(!mask){exactMemo.set(k,true);return true;}
  const rank=h.reduce((a,b)=>a+b,0),mover=rank&1;
  for(let col=0;col<W;col++)if(h[col]<H){
    const bit=1<<(h[col]*W+col),required=(mask&bit)!==0;
    if(required&&mover!==owner)continue;
    const h2=[...h];h2[col]++;
    const next=required?(mask&~bit)>>>0:mask>>>0;
    if(exactIsolatedFeasible(next,h2,owner)){exactMemo.set(k,true);return true;}
  }
  exactMemo.set(k,false);return false;
}
function E(x){return{h:x.h,r0:x.r0.filter(z=>exactIsolatedFeasible(z,x.h,0)),r1:x.r1.filter(z=>exactIsolatedFeasible(z,x.h,1))};}
const T={R,F,G,E};function apply(x,s){for(const a of s)x=T[a](x);return x;}
const seqs=['','RFG','E','EF','FE'];
const qmap=new Map(nts.map(x=>[x.k,q(x)]));
function tok(x){return x.w===0?'P0':x.w===1?'P1':'D';}
const values=new Map(),actionValues=new Map();
for(let rank=N;rank>=0;rank--)for(const x of byRank[rank]){
  if(x.t){values.set(x.k,x.w===0?1:x.w===1?-1:0);continue;}
  const av=Array(W).fill('I');for(const e of x.ch)av[e.c]=values.get(e.k);
  actionValues.set(x.k,av);
  const vs=x.ch.map(e=>values.get(e.k));
  values.set(x.k,(rank&1)?Math.min(...vs):Math.max(...vs));
}
function evalDirect(s){
  const m=new Map(nts.map(x=>[x.k,key(apply(qmap.get(x.k),s))])),g=new Map();
  for(const x of nts){const k=m.get(x.k);let a=g.get(k);if(!a){a=[];g.set(k,a);}a.push(x);}
  let qf=true,qa=true,qv=true,fFail=null,aFail=null,vFail=null;
  for(const[k,a]of g){let z0=null,av0=null,v0=null,id0=null;for(const x of a){
    const z=Array(W).fill('I');for(const e of x.ch){const y=memo.get(e.k);z[e.c]=y.t?'T:'+tok(y):'N:'+m.get(y.k);}
    const s0=z.join('|'),av=JSON.stringify(actionValues.get(x.k)),v=values.get(x.k);
    if(z0===null){z0=s0;av0=av;v0=v;id0=x.k;continue;}
    if(qf&&s0!==z0){qf=false;fFail={key:k,a:id0,b:x.k,aInterface:z0,bInterface:s0};}
    if(qa&&av!==av0){qa=false;aFail={key:k,a:id0,b:x.k,aActionValues:JSON.parse(av0),bActionValues:JSON.parse(av)};}
    if(qv&&v!==v0){qv=false;vFail={key:k,a:id0,b:x.k,aValue:v0,bValue:v};}
  }}
  return{seq:s||'QO',classes:g.size,QF:qf,QA:qa,QV:qv,firstFutureFailure:fFail,firstActionFailure:aFail,firstValueFailure:vFail};
}
const direct=seqs.map(evalDirect);

function ps(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=ps(W);
function pm(m,p){let o=0;for(const b of bits(m)){const r=Math.floor(b/W),c=b%W;o|=1<<(r*W+p[c]);}return o>>>0;}
function pq(x,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=x.h[c];return{h,r0:x.r0.map(z=>pm(z,p)).sort((a,b)=>a-b),r1:x.r1.map(z=>pm(z,p)).sort((a,b)=>a-b)};}
function orb(x){let b=null,bp=null;for(const p of P){const z=key(pq(x,p));if(b===null||z<b){b=z;bp=p;}}return{key:b,p:bp};}
function evalOrbit(s){
  const om=new Map(nts.map(x=>[x.k,orb(apply(qmap.get(x.k),s))])),g=new Map();
  for(const x of nts){const z=om.get(x.k);let a=g.get(z.key);if(!a){a=[];g.set(z.key,a);}a.push({x,z});}
  let qf=true,qa=true,qv=true,fFail=null,aFail=null,vFail=null;
  for(const[k,a]of g){let z0=null,av0=null,v0=null,id0=null;for(const{x,z}of a){
    const iv=Array(W).fill('I'),av=Array(W).fill('I');
    for(const e of x.ch){const c=z.p[e.c],y=memo.get(e.k);iv[c]=y.t?'T:'+tok(y):'N:'+om.get(y.k).key;av[c]=values.get(e.k);}
    const s0=iv.join('|'),avs=JSON.stringify(av),v=values.get(x.k);
    if(z0===null){z0=s0;av0=avs;v0=v;id0=x.k;continue;}
    if(qf&&s0!==z0){qf=false;fFail={key:k,a:id0,b:x.k,aInterface:z0,bInterface:s0};}
    if(qa&&avs!==av0){qa=false;aFail={key:k,a:id0,b:x.k};}
    if(qv&&v!==v0){qv=false;vFail={key:k,a:id0,b:x.k,aValue:v0,bValue:v};}
  }}
  return{seq:s||'QO',classes:g.size,QF_transported:qf,QA_transported:qa,QV:qv,firstFutureFailure:fFail,firstActionFailure:aFail,firstValueFailure:vFail};
}
const orbit=seqs.map(evalOrbit);

const identities={},commutation={};
for(const a of ['E','F']){
  identities[a]=nts.every(x=>key(T[a](T[a](qmap.get(x.k))))===key(T[a](qmap.get(x.k))));
}
for(const [a,b] of [['E','F']]){
  commutation[a+b]=nts.every(x=>key(T[b](T[a](qmap.get(x.k))))===key(T[a](T[b](qmap.get(x.k)))));
}
const passingDirectQF=direct.filter(x=>x.QF).sort((a,b)=>a.classes-b.classes);
const passingDirectQA=direct.filter(x=>x.QA).sort((a,b)=>a.classes-b.classes);
const passingDirectQV=direct.filter(x=>x.QV).sort((a,b)=>a.classes-b.classes);
const passingOrbitQF=orbit.filter(x=>x.QF_transported).sort((a,b)=>a.classes-b.classes);
const passingOrbitQA=orbit.filter(x=>x.QA_transported).sort((a,b)=>a.classes-b.classes);
const passingOrbitQV=orbit.filter(x=>x.QV).sort((a,b)=>a.classes-b.classes);
const gapExamples=[],containmentFailures=[],gapByOpenColumns={},gapByResidualSize={},gapByOwner={};
let residualOccurrences=0,oracleDeleted=0,rfgDeleted=0,oracleExtra=0,eEqualsRFG=0,eNotRFG=0,efEqualsRFG=0,efNotRFG=0,
  singleColumnForcedParityExplained=0;
for(const x of nts){
  const q0=qmap.get(x.k),e=E(q0),rfg=apply(q0,'RFG'),ef=apply(q0,'EF');
  residualOccurrences+=q0.r0.length+q0.r1.length;
  oracleDeleted+=(q0.r0.length-e.r0.length)+(q0.r1.length-e.r1.length);
  rfgDeleted+=(q0.r0.length-rfg.r0.length)+(q0.r1.length-rfg.r1.length);
  if(key(e)===key(rfg))eEqualsRFG++;else eNotRFG++;
  if(key(ef)===key(rfg))efEqualsRFG++;else efNotRFG++;
  for(const [owner,orig,ers,rfgs] of [[0,q0.r0,e.r0,rfg.r0],[1,q0.r1,e.r1,rfg.r1]]){
    const es=new Set(ers),rs=new Set(rfgs);
    for(const m of orig)if(!es.has(m)&&rs.has(m)){
      oracleExtra++;
      const open=q0.h.filter(v=>v<H).length,size=pc(m),rank=q0.h.reduce((a,b)=>a+b,0);
      gapByOpenColumns[open]=(gapByOpenColumns[open]??0)+1;
      gapByResidualSize[size]=(gapByResidualSize[size]??0)+1;
      gapByOwner[owner]=(gapByOwner[owner]??0)+1;
      let forcedSingle=false;
      if(open===1){
        const col=q0.h.findIndex(v=>v<H);
        forcedSingle=bits(m).some(b=>{
          if(b%W!==col)return false;
          const depth=Math.floor(b/W)-q0.h[col]+1;
          const forcedOwner=(rank+depth-1)&1;
          return forcedOwner!==owner;
        });
        if(forcedSingle)singleColumnForcedParityExplained++;
      }
      if(gapExamples.length<64)gapExamples.push({state:x.k,support:q0.h,owner,residual:m,cells:bits(m),openColumns:open,residualSize:size,forcedSingleColumnParity:forcedSingle,rank,rfgKey:key(rfg),eKey:key(e)});
    }
    for(const m of orig)if(es.has(m)&&!rs.has(m))containmentFailures.push({state:x.k,owner,residual:m});
  }
}
const out={
 schema:'connect4.isomax.residual_feasibility_oracle_4x4.v1',date_author_local:'2026-09-29',
 scope:'complete physical 4x4 connect-4 first-win carrier',
 oracle:{
   name:'E exact isolated residual schedule feasibility',
   definition:'future support-profile reachability with alternating owner parity; opponent may fill nonrequired cells but may not take required cells',
   admissibleFinalQ:false,
   reason:'E explores hypothetical future support schedules to define the current representation',
   role:'compression oracle for discovering additional rank-local necessary conditions'
 },
 comparison:{residualOccurrences,oracleDeleted,rfgDeleted,oracleExtra,eEqualsRFG,eNotRFG,efEqualsRFG,efNotRFG,containmentFailures:containmentFailures.length,exactMemoEntries:exactMemo.size,gapByOpenColumns,gapByResidualSize,gapByOwner,singleColumnForcedParityExplained},
 algebra:{E_idempotent:identities.E,EF_commutes:commutation.EF},
 direct,orbit,
 minima:{
   directQF:passingDirectQF[0],orbitQF:passingOrbitQF[0]
 },
 gapExamples,
 interpretationGuard:'E may validate safe forgetting but is not itself a permitted final rank-local Q definition. Any oracle-only deletion must be converted into an independently current-rank structural rule before promotion.'
};
fs.writeFileSync(new URL('./RESIDUAL_FEASIBILITY_ORACLE_4X4_0_1.json',import.meta.url),JSON.stringify(out,null,2)+String.fromCharCode(10));
console.log(JSON.stringify({status:'RESIDUAL_FEASIBILITY_ORACLE_COMPLETE',comparison:out.comparison,algebra:out.algebra,minima:out.minima,gapExamples:gapExamples.slice(0,12)},null,2));