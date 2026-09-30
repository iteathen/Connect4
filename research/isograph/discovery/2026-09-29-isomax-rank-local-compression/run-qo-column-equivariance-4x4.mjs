import fs from 'node:fs';
import assert from 'node:assert/strict';

const W=4,H=4,K=4,N=W*H;
function lines(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;
    let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);out.push(m>>>0);
  }
  return [...new Set(out)];
}
const L=lines(),won=b=>L.some(m=>((b&m)>>>0)===m);
function norm(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
}
function residuals(self,opp){
  const out=[];for(const l of L){if(l&opp)continue;const r=(l&~self)>>>0;if(r)out.push(r);}return norm(out);
}
const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
function sk(p0,p1){return p0+':'+p1;}
function enumState(p0,p1,h,rank){
  const key=sk(p0,p1);if(memo.has(key))return key;
  const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N,rec={key,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  memo.set(key,rec);byRank[rank].push(rec);if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){const b=1<<(h[c]*W+c);h[c]++;const child=(rank&1)?enumState(p0,p1|b,h,rank+1):enumState(p0|b,p1,h,rank+1);h[c]--;rec.children.push({col:c,key:child});}
  return key;
}
enumState(0,0,new Uint8Array(W),0);
assert.equal(memo.size,161029);

function qOf(r){return {h:[...r.h],r0:residuals(r.p0,r.p1),r1:residuals(r.p1,r.p0)};}
function qKey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function qTransition(q,col){
  const rank=q.h.reduce((a,b)=>a+b,0),m=rank&1;
  if(q.h[col]>=H)return {illegal:true};
  const bit=1<<(q.h[col]*W+col),own=m?q.r1:q.r0,opp=m?q.r0:q.r1,next=[];
  for(const r of own){
    if(r&bit){
      const z=(r&~bit)>>>0;
      if(z===0)return {terminal:true,token:m?'P1':'P0'};
      next.push(z);
    }else next.push(r);
  }
  const h=[...q.h];h[col]++;
  if(rank+1===N)return {terminal:true,token:'D'};
  const on=norm(next),op=norm(opp.filter(r=>(r&bit)===0));
  return {terminal:false,q:m?{h,r0:op,r1:on}:{h,r0:on,r1:op}};
}
function bits(m){const out=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));return out;}
function permutations(n){const out=[],a=[...Array(n).keys()];function f(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return out;}
const P=permutations(W);
function pMask(m,p){let z=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;z|=1<<(row*W+p[col]);}return z>>>0;}
function pQ(q,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];return {h,r0:q.r0.map(m=>pMask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>pMask(m,p)).sort((a,b)=>a-b)};}
function sameTransition(a,b){
  if(!!a.illegal!==!!b.illegal)return false;if(a.illegal)return true;
  if(!!a.terminal!==!!b.terminal)return false;
  if(a.terminal)return a.token===b.token;
  return qKey(a.q)===qKey(b.q);
}
function physicalToken(r){return r.winner===0?'P0':r.winner===1?'P1':'D';}

let physicalControlChecks=0,equivarianceChecks=0,legalTransportChecks=0,mismatches=[];
const orbitKeys=new Set();
for(const r of memo.values())if(!r.terminal){
  const q=qOf(r);
  let best=null;
  for(const p of P){const z=qKey(pQ(q,p));if(best===null||z<best)best=z;}
  orbitKeys.add(best);

  const byCol=new Map(r.children.map(e=>[e.col,e.key]));
  for(let c=0;c<W;c++){
    const a=qTransition(q,c);
    if(q.h[c]>=H){assert.equal(a.illegal,true);continue;}
    physicalControlChecks++;
    const child=memo.get(byCol.get(c));
    if(child.terminal){
      assert.equal(a.terminal,true);assert.equal(a.token,physicalToken(child));
    }else{
      assert.equal(a.terminal,false);assert.equal(qKey(a.q),qKey(qOf(child)));
    }
  }

  for(const p of P){
    const qp=pQ(q,p);
    for(let c=0;c<W;c++){
      const pc=p[c],a=qTransition(q,c),b=qTransition(qp,pc);
      legalTransportChecks++;
      if(!!a.illegal!==!!b.illegal){
        mismatches.push({kind:'legal',state:r.key,p,c,pc,a,b});continue;
      }
      if(a.illegal)continue;
      equivarianceChecks++;
      let expected=a;
      if(!a.terminal)expected={terminal:false,q:pQ(a.q,p)};
      if(!sameTransition(expected,b)){
        mismatches.push({kind:'transition',state:r.key,p,c,pc,expected,b});
        if(mismatches.length>=32)break;
      }
    }
    if(mismatches.length>=32)break;
  }
  if(mismatches.length>=32)break;
}
assert.equal(mismatches.length,0);

const theorem={
  schema:'connect4.isomax.qo_column_permutation_equivariance_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete physical 4x4 connect-4 first-win carrier plus abstract transported q_o states generated from it',
  group:{name:'S_4',size:P.length,action:'permute columns in support and every residual cell; action c transports to p(c)'},
  controls:{
    physicalStates:memo.size,
    physicalControlChecks,
    legalTransportChecks,
    equivarianceChecks,
    mismatches:mismatches.length,
    orbitClasses:orbitKeys.size
  },
  result:'EXACT_FINITE_EQUIVARIANCE',
  equation:'T(p·q,p(c)) = p·T(q,c), with identical terminal token when terminal',
  consequences:[
    'column permutation preserves rank and legal-action structure of the abstract q_o transition algebra',
    'terminal tokens are preserved',
    'nonterminal successors commute exactly with the permutation action',
    'the S_4 orbit quotient is a rank-local transporter-aware future-game quotient on this complete bounded carrier',
    'this is an automorphism of the compiled q_o transition algebra, not a claim that every column permutation is a physical board automorphism'
  ],
  noSolvedValueUsed:true,
  interpretationGuard:'Finite 4x4 confirmation of an algebraic equivariance law. Generalization requires a symbolic proof from the qualified q_o transition contract and fresh qualification before changing Connect4 authority.'
};
fs.writeFileSync(new URL('./QO_COLUMN_PERMUTATION_EQUIVARIANCE_4X4_0_1.json',import.meta.url),JSON.stringify(theorem,null,2)+'\n');
console.log(JSON.stringify({status:'QO_COLUMN_PERMUTATION_EQUIVARIANCE_COMPLETE',controls:theorem.controls,result:theorem.result},null,2));