import fs from 'node:fs';
import assert from 'node:assert/strict';
const CASES=[
 {W:4,H:4,K:4,label:'4x4-k4'},
 {W:3,H:3,K:3,label:'3x3-k3'},
 {W:3,H:4,K:3,label:'3x4-k3'},
 {W:4,H:3,K:3,label:'4x3-k3'},
 {W:4,H:4,K:3,label:'4x4-k3'},
];
function audit({W,H,K,label}){
 const N=W*H;
 function lines(){const o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr]of[[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);}return[...new Set(o)];}
 const L=lines(),won=b=>L.some(m=>(m&b)===m);
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function res(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
 function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}
 const nodes=new Map();
 function en(a,b,h,r){const key=a+':'+b;if(nodes.has(key))return key;const A=won(a),B=won(b),t=A||B||r===N,x={key,a,b,h:[...h],r,t,ch:[]};nodes.set(key,x);if(t)return key;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?en(a,b|bit,h,r+1):en(a|bit,b,h,r+1);h[c]--;x.ch.push({c,key:y});}return key;}en(0,0,Array(W).fill(0),0);
 const nts=[...nodes.values()].filter(x=>!x.t);
 function q(x){return{h:[...x.h],r0:res(x.a,x.b),r1:res(x.b,x.a)};}
 const exactMemo=new Map();
 function covered(mask,h){for(const b of bits(mask))if(Math.floor(b/W)>=h[b%W])return false;return true;}
 function E1(mask,h0,owner){const k=h0.join(',')+'|'+owner+'|'+mask,known=exactMemo.get(k);if(known!==undefined)return known;const qq=[[...h0]],seen=new Set([h0.join(',')]);for(let i=0;i<qq.length;i++){const h=qq[i];if(covered(mask,h)){exactMemo.set(k,true);return true;}const mover=h.reduce((a,b)=>a+b,0)&1;for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);if((mask&bit)&&mover!==owner)continue;const n=[...h];n[c]++;const sk=n.join(',');if(!seen.has(sk)){seen.add(sk);qq.push(n);}}}exactMemo.set(k,false);return false;}
 function tasks(mask,h,owner){
   const rank=h.reduce((a,b)=>a+b,0),rem=N-rank,rows=[];
   for(const b of bits(mask)){const col=b%W,row=Math.floor(b/W),depth=row-h[col]+1,Rc=H-h[col],deadline=depth+(rem-Rc);rows.push({b,col,row,depth,release:depth,deadline});}
   rows.sort((a,b)=>a.deadline-b.deadline||a.release-b.release||a.col-b.col||a.row-b.row);
   return{rank,rem,owner,rows};
 }
 function ownerAt(rank,t){return (rank+t-1)&1;}
 function intervalFeasible(mask,h,owner){
   const T=tasks(mask,h,owner),slots=[];for(let t=1;t<=T.rem;t++)if(ownerAt(T.rank,t)===owner)slots.push(t);
   const used=Array(slots.length).fill(false);
   function dfs(i){if(i===T.rows.length)return true;const z=T.rows[i];for(let j=0;j<slots.length;j++)if(!used[j]&&slots[j]>=z.release&&slots[j]<=z.deadline){used[j]=true;if(dfs(i+1))return true;used[j]=false;}return false;}
   return dfs(0);
 }
 function prefixLoadFeasible(mask,h,owner){
   const T=tasks(mask,h,owner);for(let t=1;t<=T.rem;t++){const depth=Array(W).fill(0);for(const z of T.rows)if(z.deadline<=t)depth[z.col]=Math.max(depth[z.col],z.depth);if(depth.reduce((a,b)=>a+b,0)>t)return false;}return true;
 }
 function intervalGreedy(mask,h,owner){
   const T=tasks(mask,h,owner),slots=[];for(let t=1;t<=T.rem;t++)if(ownerAt(T.rank,t)===owner)slots.push(t);
   const rows=[...T.rows].sort((a,b)=>a.deadline-b.deadline||a.release-b.release),avail=[...slots];
   for(const z of rows){const j=avail.findIndex(t=>t>=z.release&&t<=z.deadline);if(j<0)return false;avail.splice(j,1);}return true;
 }
 let occurrences=0,unique=new Map(),exactTrue=0,intervalTrue=0,intervalPrefixTrue=0,falsePos=0,falseNeg=0,prefixFalsePos=0,prefixFalseNeg=0,greedyMismatch=0;
 const examples=[];
 for(const n of nts){const qq=q(n);for(const[owner,rs]of[[0,qq.r0],[1,qq.r1]])for(const mask of rs){occurrences++;const k=qq.h.join(',')+'|'+owner+'|'+mask;if(unique.has(k))continue;const ex=E1(mask,qq.h,owner),iv=intervalFeasible(mask,qq.h,owner),gr=intervalGreedy(mask,qq.h,owner),pf=iv&&prefixLoadFeasible(mask,qq.h,owner);unique.set(k,{ex,iv,pf});if(ex)exactTrue++;if(iv)intervalTrue++;if(pf)intervalPrefixTrue++;if(gr!==iv)greedyMismatch++;if(iv&&!ex){falsePos++;if(examples.length<24)examples.push({kind:'INTERVAL_FALSE_POSITIVE',support:qq.h,owner,mask,tasks:tasks(mask,qq.h,owner).rows});}if(ex&&!iv){falseNeg++;if(examples.length<24)examples.push({kind:'INTERVAL_FALSE_NEGATIVE',support:qq.h,owner,mask,tasks:tasks(mask,qq.h,owner).rows});}if(pf&&!ex){prefixFalsePos++;if(examples.length<24)examples.push({kind:'PREFIX_FALSE_POSITIVE',support:qq.h,owner,mask,tasks:tasks(mask,qq.h,owner).rows});}if(ex&&!pf){prefixFalseNeg++;if(examples.length<24)examples.push({kind:'PREFIX_FALSE_NEGATIVE',support:qq.h,owner,mask,tasks:tasks(mask,qq.h,owner).rows});}}}
 assert.equal(falseNeg,0,'interval criterion must be necessary if deadlines are valid');
 assert.equal(prefixFalseNeg,0,'prefix strengthening must remain necessary');
 assert.equal(greedyMismatch,0,'interval greedy must agree with matching on interval tasks');
 return{label,width:W,height:H,k:K,physicalStates:nodes.size,nonterminalStates:nts.length,occurrences,uniqueContexts:unique.size,exactTrue,intervalTrue,intervalPrefixTrue,falsePos,falseNeg,prefixFalsePos,prefixFalseNeg,greedyMismatch,exactMemo:exactMemo.size,examples};
}
const cases=CASES.map(audit);
const out={schema:'connect4.isomax.residual_slot_interval.v1',date_author_local:'2026-09-29',warrant:'EW-RS-010',cases,result:{
 intervalExactEveryCase:cases.every(c=>c.falsePos===0&&c.falseNeg===0),
 intervalPlusPrefixExactEveryCase:cases.every(c=>c.prefixFalsePos===0&&c.prefixFalseNeg===0),
 intervalIsNecessaryEveryCase:cases.every(c=>c.falseNeg===0),
 prefixIsNecessaryEveryCase:cases.every(c=>c.prefixFalseNeg===0)
},interpretationGuard:'Bounded exact structural feasibility controls. False positives preserve the missing interaction needed beyond independent cell intervals; no game-value evidence is used.'};
fs.writeFileSync(new URL('./RESIDUAL_SLOT_INTERVAL_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'RESIDUAL_SLOT_INTERVAL_COMPLETE',result:out.result,cases:cases.map(c=>({label:c.label,unique:c.uniqueContexts,exactTrue:c.exactTrue,intervalTrue:c.intervalTrue,falsePos:c.falsePos,prefixFalsePos:c.prefixFalsePos,examples:c.examples.slice(0,3)}))},null,2));