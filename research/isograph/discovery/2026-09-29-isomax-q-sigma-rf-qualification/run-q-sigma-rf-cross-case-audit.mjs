import fs from 'node:fs';
import assert from 'node:assert/strict';

function auditCase(W,H,K){
  const N=W*H;
  function winMasks(){
    const out=[];
    for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const ec=c+(K-1)*dc,er=r+(K-1)*dr;
      if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);
      out.push(m>>>0);
    }
    return [...new Set(out)];
  }
  const L=winMasks(),won=b=>L.some(m=>((b&m)>>>0)===m);
  function bits(m){const out=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));return out;}
  function norm(xs){
    xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
    return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
  }
  function residuals(self,opp){
    const out=[];for(const l of L){if(l&opp)continue;const z=(l&~self)>>>0;if(z)out.push(z);}return norm(out);
  }

  const states=new Map(),byRank=Array.from({length:N+1},()=>[]);
  function pk(a,b){return a+':'+b;}
  function visit(a,b,h,r){
    const key=pk(a,b);if(states.has(key))return key;
    const A=won(a),B=won(b);assert.equal(A&&B,false);
    const t=A||B||r===N,x={key,a,b,h:[...h],r,t,w:A?0:B?1:null,ch:[]};
    states.set(key,x);byRank[r].push(x);if(t)return key;
    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);h[c]++;
      const y=(r&1)?visit(a,b|bit,h,r+1):visit(a|bit,b,h,r+1);
      h[c]--;x.ch.push({c,key:y});
    }
    return key;
  }
  visit(0,0,new Uint8Array(W),0);

  function qOf(x){return {h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};}
  function qKey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
  function cnt(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,
      mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
  }
  function matchingFeasible(mask,h,player){
    const c=cnt({h,r0:[],r1:[]}),
      needs=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b),
      slots=[];
    if(needs.some(x=>x<=0))return false;
    for(let p=player===c.m?1:2;p<=c.rem;p+=2)slots.push(p);
    const used=Array(slots.length).fill(false);
    function dfs(i){
      if(i===needs.length)return true;
      for(let j=0;j<slots.length;j++)if(!used[j]&&slots[j]>=needs[i]){
        used[j]=true;if(dfs(i+1))return true;used[j]=false;
      }
      return false;
    }
    return dfs(0);
  }
  function R(q){return {h:q.h,r0:q.r0.filter(m=>matchingFeasible(m,q.h,0)),r1:q.r1.filter(m=>matchingFeasible(m,q.h,1))};}
  function F(q){
    const c=cnt(q),own=c.m?q.r1:q.r0;let frontier=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const b=1<<(q.h[col]*W+col);
      if(!own.some(x=>x===b))frontier|=b;
    }
    return c.m?{h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}:
      {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
  }
  function RF(q){return F(R(q));}
  function M(q){
    const c=cnt(q),pc=m=>bits(m).length;
    return {h:q.h,r0:q.r0.filter(x=>pc(x)<=c.p0),r1:q.r1.filter(x=>pc(x)<=c.p1)};
  }

  function T(q,col){
    const c=cnt(q);
    if(q.h[col]>=H)return {illegal:true};
    const bit=1<<(q.h[col]*W+col),own=c.m?q.r1:q.r0,opp=c.m?q.r0:q.r1,next=[];
    for(const r of own){
      if(r&bit){
        const z=(r&~bit)>>>0;
        if(z===0)return {terminal:true,token:c.m?'P1':'P0'};
        next.push(z);
      }else next.push(r);
    }
    const h=[...q.h];h[col]++;
    if(c.rank+1===N)return {terminal:true,token:'D'};
    const on=norm(next),op=norm(opp.filter(r=>(r&bit)===0));
    return {terminal:false,q:c.m?{h,r0:op,r1:on}:{h,r0:on,r1:op}};
  }

  function permutations(n){
    const out=[],a=[...Array(n).keys()];
    function rec(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];}}
    rec(0);return out;
  }
  const P=permutations(W);
  function pmask(m,p){let z=0;for(const b of bits(m)){const r=Math.floor(b/W),c=b%W;z|=1<<(r*W+p[c]);}return z>>>0;}
  function pQ(q,p){
    const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];
    return {h,r0:q.r0.map(m=>pmask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>pmask(m,p)).sort((a,b)=>a-b)};
  }
  function sameTransition(a,b){
    if(!!a.illegal!==!!b.illegal)return false;if(a.illegal)return true;
    if(!!a.terminal!==!!b.terminal)return false;
    if(a.terminal)return a.token===b.token;
    return qKey(a.q)===qKey(b.q);
  }
  function factor(C,q,col){
    const a=T(q,col),b=T(C(q),col);
    if(!!a.illegal!==!!b.illegal)return false;if(a.illegal)return true;
    if(!!a.terminal!==!!b.terminal)return false;
    if(a.terminal)return a.token===b.token;
    return qKey(C(a.q))===qKey(C(b.q));
  }

  const nt=[...states.values()].filter(x=>!x.t),unique=new Map();
  for(const x of nt){const q=qOf(x);unique.set(qKey(q),q);}

  let physicalTransitionChecks=0,rfFactorChecks=0,
    equivarianceChecks=0,transportedRFFactorChecks=0,
    rCovarianceChecks=0,fCovarianceChecks=0,rfCovarianceChecks=0;
  const failures=[];

  for(const x of nt){
    const q=qOf(x),children=new Map(x.ch.map(e=>[e.c,e.key]));
    for(let c=0;c<W;c++){
      const z=T(q,c);
      if(q.h[c]>=H){assert.equal(z.illegal,true);continue;}
      physicalTransitionChecks++;
      const child=states.get(children.get(c));
      if(child.t){
        const token=child.w===0?'P0':child.w===1?'P1':'D';
        if(!(z.terminal&&z.token===token))failures.push({kind:'physical-terminal',state:x.key,c});
      }else if(z.terminal||qKey(z.q)!==qKey(qOf(child)))failures.push({kind:'physical-successor',state:x.key,c});
      rfFactorChecks++;
      if(!factor(RF,q,c))failures.push({kind:'RF-factor',state:x.key,c});
    }
  }

  for(const q of unique.values()){
    assert.equal(qKey(R(R(q))),qKey(R(q)));
    assert.equal(qKey(F(F(q))),qKey(F(q)));
    assert.equal(qKey(R(F(q))),qKey(F(R(q))));
    assert.equal(qKey(R(M(q))),qKey(R(q)));
    assert.equal(qKey(M(R(q))),qKey(R(q)));

    for(const p of P){
      rCovarianceChecks++;fCovarianceChecks++;rfCovarianceChecks++;
      if(qKey(R(pQ(q,p)))!==qKey(pQ(R(q),p)))failures.push({kind:'R-covariance',q:qKey(q),p});
      if(qKey(F(pQ(q,p)))!==qKey(pQ(F(q),p)))failures.push({kind:'F-covariance',q:qKey(q),p});
      if(qKey(RF(pQ(q,p)))!==qKey(pQ(RF(q),p)))failures.push({kind:'RF-covariance',q:qKey(q),p});

      const tq=pQ(q,p);
      for(let c=0;c<W;c++){
        const a=T(q,c),b=T(tq,p[c]);
        equivarianceChecks++;
        let expected=a;
        if(!a.illegal&&!a.terminal)expected={terminal:false,q:pQ(a.q,p)};
        if(!sameTransition(expected,b))failures.push({kind:'T-equivariance',q:qKey(q),p,c});
        transportedRFFactorChecks++;
        if(!factor(RF,tq,p[c]))failures.push({kind:'RF-factor-transported',q:qKey(q),p,c});
        if(failures.length>=16)break;
      }
      if(failures.length>=16)break;
    }
    if(failures.length>=16)break;
  }

  assert.equal(failures.length,0);
  return {
    width:W,height:H,k:K,
    physicalStates:states.size,
    nonterminalStates:nt.length,
    qClasses:unique.size,
    permutations:P.length,
    checks:{
      physicalTransitionChecks,rfFactorChecks,equivarianceChecks,
      transportedRFFactorChecks,rCovarianceChecks,fCovarianceChecks,rfCovarianceChecks
    },
    results:{
      physicalQTransitionMatches:true,
      R_idempotent:true,F_idempotent:true,RF_commutes:true,R_absorbs_M:true,
      R_covariant:true,F_covariant:true,RF_covariant:true,
      T_column_equivariant:true,RF_transition_factorization:true,
      transported_RF_transition_factorization:true
    }
  };
}

const cases=[
  auditCase(3,3,3),
  auditCase(3,4,3),
  auditCase(4,3,3),
  auditCase(4,4,4)
];
const out={
  schema:'connect4.isomax.q_sigma_rf_cross_case_qualification.v1',
  date_author_local:'2026-09-29',
  cases,
  result:'ALL_CROSS_CASE_PROOF_OBLIGATION_CONTROLS_PASS',
  theoremScopeCandidate:'finite gravity Connect-K q-style transition algebra under normalized residual-antichain semantics',
  qualificationBoundary:'These exhaustive bounded controls validate the independent implementation of the symbolic proof obligations. Standard-7x6 authority promotion still requires semantic review of the general proof and identity/action-transporter scope.',
  noSolvedValueUsed:true
};
fs.writeFileSync(new URL('./Q_SIGMA_RF_CROSS_CASE_AUDIT_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+String.fromCharCode(10));
console.log(JSON.stringify({status:out.result,cases:cases.map(x=>({case:x.width+'x'+x.height+'k'+x.k,states:x.physicalStates,q:x.qClasses,perms:x.permutations,checks:x.checks}))},null,2));