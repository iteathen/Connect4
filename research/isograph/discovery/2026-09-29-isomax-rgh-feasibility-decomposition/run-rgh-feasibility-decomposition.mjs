import fs from 'node:fs';
import assert from 'node:assert/strict';

const CASES=[
 {W:4,H:4,K:4,label:'4x4-k4',role:'training'},
 {W:3,H:3,K:3,label:'3x3-k3',role:'holdout'},
 {W:3,H:4,K:3,label:'3x4-k3',role:'holdout'},
 {W:4,H:3,K:3,label:'4x3-k3',role:'holdout'},
 {W:4,H:4,K:3,label:'4x4-k3',role:'holdout'},
];

function audit({W,H,K,label,role}){
 const N=W*H;
 function masks(){const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr]of[[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);}return[...new Set(o)];}
 const L=masks(),won=b=>L.some(m=>(b&m)===m);
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function res(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
 function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}
 const nodes=new Map();
 function en(a,b,h,r){const key=a+':'+b;if(nodes.has(key))return key;const A=won(a),B=won(b),t=A||B||r===N,x={key,a,b,h:[...h],r,t,w:A?0:B?1:null,ch:[]};nodes.set(key,x);if(t)return key;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?en(a,b|bit,h,r+1):en(a|bit,b,h,r+1);h[c]--;x.ch.push({c,key:y});}return key;}en(0,0,Array(W).fill(0),0);
 const nts=[...nodes.values()].filter(x=>!x.t);
 function q(x){return{h:[...x.h],r0:res(x.a,x.b),r1:res(x.b,x.a)};}function key(x){return x.h.join(',')+'|'+x.r0.join('.')+'|'+x.r1.join('.');}
 function counts(x){const r=x.h.reduce((a,b)=>a+b,0),rem=N-r,m=r&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return{r,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function releases(mask,h){return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);}
 function feasible(mask,h,p){const c=counts({h,r0:[],r1:[]}),ds=releases(mask,h);let s=p===c.m?1:2;for(const d of ds){if(d<=0)return false;while(s<d)s+=2;if(s>c.rem)return false;s+=2;}return true;}
 function R(x){return{h:x.h,r0:x.r0.filter(m=>feasible(m,x.h,0)),r1:x.r1.filter(m=>feasible(m,x.h,1))};}
 function F(x){const c=counts(x),own=c.m?x.r1:x.r0;let f=0;for(let col=0;col<W;col++)if(x.h[col]<H){const b=1<<(x.h[col]*W+col);if(!own.some(m=>m===b))f|=b;}return c.m?{h:x.h,r0:x.r0.filter(m=>(m&f)!==f),r1:x.r1}:{h:x.h,r0:x.r0,r1:x.r1.filter(m=>(m&f)!==f)};}
 function G(x){let caps=0;for(let c=0;c<W;c++)if(x.h[c]<H)caps|=1<<((H-1)*W+c);if(!caps)return x;const final=(N-1)&1,dead=1-final;return dead?{h:x.h,r0:x.r0,r1:x.r1.filter(m=>(m&caps)!==caps)}:{h:x.h,r0:x.r0.filter(m=>(m&caps)!==caps),r1:x.r1};}
 function Hc(x){const open=[];for(let c=0;c<W;c++)if(x.h[c]<H)open.push(c);if(open.length!==1)return x;const c=open[0],rank=x.h.reduce((a,b)=>a+b,0);function keep(mask,owner){for(const b of bits(mask))if(b%W===c){const row=Math.floor(b/W),depth=row-x.h[c]+1;if(depth>0&&((rank+depth-1)&1)!==owner)return false;}return true;}return{h:x.h,r0:x.r0.filter(m=>keep(m,0)),r1:x.r1.filter(m=>keep(m,1))};}
 const cache=new Map();
 function covered(mask,h){for(const b of bits(mask))if(Math.floor(b/W)>=h[b%W])return false;return true;}
 function E1feasible(mask,h0,owner){const root=h0.join(',')+'|'+owner+'|'+mask,known=cache.get(root);if(known!==undefined)return known;const q=[...[]];q.push([...h0]);const seen=new Set([h0.join(',')]);for(let i=0;i<q.length;i++){const h=q[i];if(covered(mask,h)){cache.set(root,true);return true;}const mover=h.reduce((a,b)=>a+b,0)&1;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);if((mask&bit)&&mover!==owner)continue;const n=[...h];n[c]++;const k=n.join(',');if(!seen.has(k)){seen.add(k);q.push(n);}}}cache.set(root,false);return false;}
 function E1(x){return{h:x.h,r0:x.r0.filter(m=>E1feasible(m,x.h,0)),r1:x.r1.filter(m=>E1feasible(m,x.h,1))};}
 function seq(x,s){for(const z of s)x=z==='R'?R(x):z==='F'?F(x):z==='G'?G(x):z==='H'?Hc(x):x;return x;}

 let e1RghMismatch=0,fe1RfgHMismatch=0,hOwnerSimplificationMismatch=0,rDeletedButE1Kept=0,gDeletedButE1Kept=0,hDeletedButE1Kept=0;
 const examples=[];
 for(const n of nts){
   const q0=q(n),e=E1(q0),r=R(q0),g=G(q0),h=Hc(q0),rgh=seq(q0,'RGH'),fe=F(e),rfgh=seq(q0,'RFGH');
   if(key(e)!==key(rgh)){e1RghMismatch++;if(examples.length<16)examples.push({kind:'E1_vs_RGH',state:n.key,q:key(q0),E1:key(e),RGH:key(rgh)});}
   if(key(fe)!==key(rfgh)){fe1RfgHMismatch++;if(examples.length<16)examples.push({kind:'F_E1_vs_RFGH',state:n.key,FE1:key(fe),RFGH:key(rfgh)});}
   for(const [owner,rs] of [[0,q0.r0],[1,q0.r1]])for(const m of rs){
     const er=owner?e.r1:e.r0,rr=owner?r.r1:r.r0,gr=owner?g.r1:g.r0,hr=owner?h.r1:h.r0;
     if(!rr.includes(m)&&er.includes(m))rDeletedButE1Kept++;
     if(!gr.includes(m)&&er.includes(m))gDeletedButE1Kept++;
     if(!hr.includes(m)&&er.includes(m))hDeletedButE1Kept++;
   }
   const open=[];for(let c=0;c<W;c++)if(q0.h[c]<H)open.push(c);
   if(open.length===1){const c=open[0],rank=n.r;for(let row=q0.h[c];row<H;row++){const original=(rank+(row-q0.h[c]+1)-1)&1,simple=((W-1)*H+row)&1;if(original!==simple)hOwnerSimplificationMismatch++;}}
 }
 assert.equal(rDeletedButE1Kept,0);assert.equal(gDeletedButE1Kept,0);assert.equal(hDeletedButE1Kept,0);assert.equal(hOwnerSimplificationMismatch,0);

 function qf(candidate){
   const km=new Map(nts.map(n=>[n.key,key(candidate(q(n)))])),groups=new Map();for(const n of nts){const k=km.get(n.key);let a=groups.get(k);if(!a){a=[];groups.set(k,a);}a.push(n);}
   let pass=true,fail=null;for(const[k,a]of groups){let s0=null,id0=null;for(const n of a){const slots=Array(W).fill('I');for(const ch of n.ch){const y=nodes.get(ch.key);slots[ch.c]=y.t?'T:'+(y.w===0?'P0':y.w===1?'P1':'D'):'N:'+km.get(y.key);}const s=slots.join('|');if(s0===null){s0=s;id0=n.key;}else if(s!==s0){pass=false;fail={key:k,a:id0,b:n.key,aInterface:s0,bInterface:s};break;}}if(!pass)break;}return{classes:groups.size,QF:pass,fail};}
 const candidates={E1:qf(E1),RGH:qf(x=>seq(x,'RGH')),FE1:qf(x=>F(E1(x))),RFGH:qf(x=>seq(x,'RFGH'))};
 return{label,role,width:W,height:H,k:K,physicalStates:nodes.size,nonterminalStates:nts.length,checks:{e1RghMismatch,fe1RfgHMismatch,hOwnerSimplificationMismatch,rDeletedButE1Kept,gDeletedButE1Kept,hDeletedButE1Kept},candidates,feasibilityCache:cache.size,examples};
}

const cases=CASES.map(audit);
const out={
 schema:'connect4.isomax.rgh_feasibility_decomposition.v1',date_author_local:'2026-09-29',warrant:'EW-RS-009',
 notation:{E1:'exact single-residual support-lattice ownership feasibility; not height XOR X_h'},
 cases,
 result:{
   E1_equals_RGH_every_case:cases.every(c=>c.checks.e1RghMismatch===0),
   F_E1_equals_RFGH_every_case:cases.every(c=>c.checks.fe1RfgHMismatch===0),
   H_owner_formula_simplifies_every_case:cases.every(c=>c.checks.hOwnerSimplificationMismatch===0),
   allRepresentationsQF:cases.every(c=>Object.values(c.candidates).every(x=>x.QF)),
 },
 interpretationGuard:'Complete bounded exact evidence only. Equality with E1 is a structural decomposition result over tested cases; general symbolic proof and standard-7x6 qualification remain separate.'
};
fs.writeFileSync(new URL('./RGH_FEASIBILITY_DECOMPOSITION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'RGH_FEASIBILITY_DECOMPOSITION_COMPLETE',result:out.result,cases:cases.map(c=>({label:c.label,checks:c.checks,candidates:c.candidates}))},null,2));