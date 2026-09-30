import fs from 'node:fs';
import assert from 'node:assert/strict';

function analyze(W,H,K){
  const N=W*H;
  function lines(){const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr]of[[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);}return[...new Set(o)];}
  const L=lines(),won=b=>L.some(m=>(b&m)===m);
  function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&(a&b)===b));}
  function res(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
  const memo=new Map();
  function en(a,b,h,r){const k=a+':'+b;if(memo.has(k))return k;const A=won(a),B=won(b),t=A||B||r===N,x={k,a,b,h:[...h],r,t,w:A?0:B?1:null,ch:[]};memo.set(k,x);if(t)return k;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?en(a,b|bit,h,r+1):en(a|bit,b,h,r+1);h[c]--;x.ch.push({c,k:y});}return k;}
  en(0,0,new Uint8Array(W),0);
  const nts=[...memo.values()].filter(x=>!x.t);
  function q(x){return{h:[...x.h],r0:res(x.a,x.b),r1:res(x.b,x.a)};}function key(x){return x.h.join(',')+'|'+x.r0.join('.')+'|'+x.r1.join('.');}
  function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}
  function cnt(x){const r=x.h.reduce((a,b)=>a+b,0),n=N-r,m=r&1;return{r,n,m};}
  function feasible(mask,h,p){const c=cnt({h,r0:[],r1:[]}),ds=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);let s=p===c.m?1:2;for(const d of ds){while(s<d)s+=2;if(s>c.n)return false;s+=2;}return true;}
  function R(x){return{h:x.h,r0:x.r0.filter(z=>feasible(z,x.h,0)),r1:x.r1.filter(z=>feasible(z,x.h,1))};}
  function F(x){const c=cnt(x),own=c.m?x.r1:x.r0;let f=0;for(let col=0;col<W;col++)if(x.h[col]<H){const b=1<<(x.h[col]*W+col);if(!own.some(z=>z===b))f|=b;}return c.m?{h:x.h,r0:x.r0.filter(z=>(z&f)!==f),r1:x.r1}:{h:x.h,r0:x.r0,r1:x.r1.filter(z=>(z&f)!==f)};}
  function RF(x){return F(R(x));}
  function tr(q0,c){const z=cnt(q0),m=z.m;if(q0.h[c]>=H)return{illegal:true};const bit=1<<(q0.h[c]*W+c),own=m?q0.r1:q0.r0,opp=m?q0.r0:q0.r1,next=[];for(const a of own){if(a&bit){const b=(a&~bit)>>>0;if(!b)return{terminal:true,token:m?'P1':'P0'};next.push(b);}else next.push(a);}const h=[...q0.h];h[c]++;if(z.r+1===N)return{terminal:true,token:'D'};const on=norm(next),op=norm(opp.filter(a=>(a&bit)===0));return{terminal:false,q:m?{h,r0:op,r1:on}:{h,r0:on,r1:op}};}
  function perms(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=perms(W);
  function pm(m,p){let o=0;for(const b of bits(m)){const r=Math.floor(b/W),c=b%W;o|=1<<(r*W+p[c]);}return o>>>0;}
  function pq(x,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=x.h[c];return{h,r0:x.r0.map(z=>pm(z,p)).sort((a,b)=>a-b),r1:x.r1.map(z=>pm(z,p)).sort((a,b)=>a-b)};}
  function orb(x){let b=null,bp=null;for(const p of P){const z=key(pq(x,p));if(b===null||z<b){b=z;bp=p;}}return{key:b,p:bp};}
  function tok(x){return x.w===0?'P0':x.w===1?'P1':'D';}

  const qm=new Map(nts.map(x=>[x.k,q(x)])),rfm=new Map(nts.map(x=>[x.k,RF(qm.get(x.k))]));
  function directCong(map){
    const groups=new Map();for(const x of nts){const k=key(map.get(x.k));let a=groups.get(k);if(!a){a=[];groups.set(k,a);}a.push(x);}
    let pass=true,fail=null;for(const[k,a]of groups){let s0=null,id=null;for(const x of a){const z=Array(W).fill('I');for(const e of x.ch){const y=memo.get(e.k);z[e.c]=y.t?'T:'+tok(y):'N:'+key(map.get(y.k));}const s=z.join('|');if(s0===null){s0=s;id=x.k;}else if(s!==s0){pass=false;fail={key:k,a:id,b:x.k,aInterface:s0,bInterface:s};break;}}if(!pass)break;}return{classes:groups.size,pass,fail};
  }
  const qoDirect=directCong(qm),rfDirect=directCong(rfm);

  function orbitCong(map){
    const om=new Map(nts.map(x=>[x.k,orb(map.get(x.k))])),groups=new Map();
    for(const x of nts){const z=om.get(x.k);let a=groups.get(z.key);if(!a){a=[];groups.set(z.key,a);}a.push({x,z});}
    let pass=true,fail=null;for(const[k,a]of groups){let s0=null,id=null;for(const{x,z}of a){const v=Array(W).fill('I');for(const e of x.ch){const c=z.p[e.c],y=memo.get(e.k);v[c]=y.t?'T:'+tok(y):'N:'+om.get(y.k).key;}const s=v.join('|');if(s0===null){s0=s;id=x.k;}else if(s!==s0){pass=false;fail={key:k,a:id,b:x.k,aInterface:s0,bInterface:s};break;}}if(!pass)break;}return{classes:groups.size,pass,fail};
  }
  const qoOrbit=orbitCong(qm),rfOrbit=orbitCong(rfm);

  let equiv=0,mismatch=0;
  outer:for(const x of nts){const q0=qm.get(x.k);for(const p of P)for(let c=0;c<W;c++){const a=tr(q0,c),b=tr(pq(q0,p),p[c]);if(a.illegal||b.illegal){if(!!a.illegal!==!!b.illegal){mismatch++;break outer;}continue;}equiv++;if(!!a.terminal!==!!b.terminal){mismatch++;break outer;}if(a.terminal){if(a.token!==b.token){mismatch++;break outer;}}else if(key(pq(a.q,p))!==key(b.q)){mismatch++;break outer;}}}
  return{width:W,height:H,k:K,physicalStates:memo.size,nonterminalStates:nts.length,winningLines:L.length,permutations:P.length,
    q_o:{classes:qoDirect.classes,QF:qoDirect.pass},
    q_RF:{classes:rfDirect.classes,QF:rfDirect.pass,fail:rfDirect.fail},
    q_Sigma:{classes:qoOrbit.classes,QF_transported:qoOrbit.pass,fail:qoOrbit.fail},
    q_SigmaRF:{classes:rfOrbit.classes,QF_transported:rfOrbit.pass,fail:rfOrbit.fail},
    equivariance:{checks:equiv,mismatches:mismatch,pass:mismatch===0}};
}
const cases=[[3,3,3],[3,4,3],[4,3,3],[4,4,3]].map(x=>analyze(...x));
assert.ok(cases.every(x=>x.q_o.QF&&x.q_RF.QF&&x.q_Sigma.QF_transported&&x.q_SigmaRF.QF_transported&&x.equivariance.pass));
const out={schema:'connect4.isomax.rank_local_cross_case_holdout.v1',date_author_local:'2026-09-29',warrant:'EW-RS-004',cases,
 result:'ALL_FRESH_CASES_PASS_QRF_QSIGMA_QSIGMARF_TRANSITION_CONGRUENCE_AND_COLUMN_EQUIVARIANCE',
 interpretationGuard:'Fresh bounded cases selected before observation. These support but do not replace the general proof/qualification burden.'};
fs.writeFileSync(new URL('./RANK_LOCAL_CROSS_CASE_HOLDOUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'RANK_LOCAL_CROSS_CASE_HOLDOUT_COMPLETE',cases:cases.map(x=>({case:x.width+'x'+x.height+'k'+x.k,states:x.physicalStates,qo:x.q_o.classes,qRF:x.q_RF.classes,qSigma:x.q_Sigma.classes,qSigmaRF:x.q_SigmaRF.classes,equiv:x.equivariance.checks}))},null,2));