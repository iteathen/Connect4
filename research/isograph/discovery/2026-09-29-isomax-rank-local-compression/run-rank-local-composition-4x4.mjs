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
const T={M,R,F};function apply(x,s){for(const a of s)x=T[a](x);return x;}
const seqs=['','M','R','F','MR','RM','MF','FM','RF','FR','MRF','MFR','RMF','RFM','FMR','FRM'];
const qmap=new Map(nts.map(x=>[x.k,q(x)]));
function tok(x){return x.w===0?'P0':x.w===1?'P1':'D';}
function evalDirect(s){
  const m=new Map(nts.map(x=>[x.k,key(apply(qmap.get(x.k),s))])),g=new Map();
  for(const x of nts){const k=m.get(x.k);let a=g.get(k);if(!a){a=[];g.set(k,a);}a.push(x);}
  let pass=true,fail=null;
  for(const[k,a]of g){let z0=null,id0=null;for(const x of a){const z=Array(W).fill('I');for(const e of x.ch){const y=memo.get(e.k);z[e.c]=y.t?'T:'+tok(y):'N:'+m.get(y.k);}const s0=z.join('|');if(z0===null){z0=s0;id0=x.k;}else if(s0!==z0){pass=false;fail={key:k,a:id0,b:x.k,aInterface:z0,bInterface:s0};break;}}if(!pass)break;}
  return{seq:s||'QO',classes:g.size,QF:pass,firstFailure:fail};
}
const direct=seqs.map(evalDirect);

function ps(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=ps(W);
function pm(m,p){let o=0;for(const b of bits(m)){const r=Math.floor(b/W),c=b%W;o|=1<<(r*W+p[c]);}return o>>>0;}
function pq(x,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=x.h[c];return{h,r0:x.r0.map(z=>pm(z,p)).sort((a,b)=>a-b),r1:x.r1.map(z=>pm(z,p)).sort((a,b)=>a-b)};}
function orb(x){let b=null,bp=null;for(const p of P){const z=key(pq(x,p));if(b===null||z<b){b=z;bp=p;}}return{key:b,p:bp};}
function evalOrbit(s){
  const om=new Map(nts.map(x=>[x.k,orb(apply(qmap.get(x.k),s))])),g=new Map();
  for(const x of nts){const z=om.get(x.k);let a=g.get(z.key);if(!a){a=[];g.set(z.key,a);}a.push({x,z});}
  let pass=true,fail=null;
  for(const[k,a]of g){let z0=null,id0=null;for(const{x,z}of a){const v=Array(W).fill('I');for(const e of x.ch){const c=z.p[e.c],y=memo.get(e.k);v[c]=y.t?'T:'+tok(y):'N:'+om.get(y.k).key;}const s0=v.join('|');if(z0===null){z0=s0;id0=x.k;}else if(s0!==z0){pass=false;fail={key:k,a:id0,b:x.k,aInterface:z0,bInterface:s0};break;}}if(!pass)break;}
  return{seq:s||'QO',classes:g.size,QF_transported:pass,firstFailure:fail};
}
const orbit=seqs.map(evalOrbit);

const identities={},commutation={};
for(const a of ['M','R','F']){
  identities[a]=nts.every(x=>key(T[a](T[a](qmap.get(x.k))))===key(T[a](qmap.get(x.k))));
}
for(const [a,b] of [['M','R'],['M','F'],['R','F']]){
  commutation[a+b]=nts.every(x=>key(T[b](T[a](qmap.get(x.k))))===key(T[a](T[b](qmap.get(x.k))));
}
const passingDirect=direct.filter(x=>x.QF).sort((a,b)=>a.classes-b.classes);
const passingOrbit=orbit.filter(x=>x.QF_transported).sort((a,b)=>a.classes-b.classes);
const out={
 schema:'connect4.isomax.rank_local_composition_4x4.v1',date_author_local:'2026-09-29',
 scope:'complete physical 4x4 connect-4 first-win carrier',
 transforms:{M:'remaining-move capacity',R:'support-release/turn capacity',F:'nonterminal frontier blocker'},
 algebra:{idempotent:identities,pairwiseCommutation:commutation},
 direct,orbit,
 minima:{directQF:passingDirect[0],transporterOrbitQF:passingOrbit[0]},
 interpretationGuard:'Exact finite 4x4 transition-congruence evidence only. Sequence order is part of each tested rank-local representation.'
};
fs.writeFileSync(new URL('./RANK_LOCAL_COMPOSITION_4X4_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'RANK_LOCAL_COMPOSITION_COMPLETE',algebra:out.algebra,minima:out.minima,direct:direct.map(x=>({seq:x.seq,classes:x.classes,QF:x.QF})),orbit:orbit.map(x=>({seq:x.seq,classes:x.classes,QF:x.QF_transported}))},null,2));