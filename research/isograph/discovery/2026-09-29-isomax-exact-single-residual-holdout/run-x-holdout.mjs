import fs from 'node:fs';
import assert from 'node:assert/strict';

const CASES=[
  {width:3,height:3,k:3},
  {width:3,height:4,k:3},
  {width:4,height:3,k:3},
  {width:4,height:4,k:3},
];

function auditCase({width:W,height:H,k:K}){
  const N=W*H;
  function winMasks(){
    const out=[];
    for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);out.push(m>>>0);
    }
    return [...new Set(out)];
  }
  const L=winMasks(),won=b=>L.some(m=>((b&m)>>>0)===m);
  function norm(xs){
    xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
    return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
  }
  function residuals(self,opp){
    const out=[];for(const l of L){if(l&opp)continue;const r=(l&~self)>>>0;if(r)out.push(r);}return norm(out);
  }
  function bits(m){const out=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));return out;}
  function popcount(m){return bits(m).length;}

  const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
  function bkey(p0,p1){return p0+':'+p1;}
  function enumerate(p0,p1,h,rank){
    const key=bkey(p0,p1);if(memo.has(key))return key;
    const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
    const terminal=w0||w1||rank===N,rec={key,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
    memo.set(key,rec);byRank[rank].push(rec);if(terminal)return key;
    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);h[c]++;
      const child=(rank&1)?enumerate(p0,p1|bit,h,rank+1):enumerate(p0|bit,p1,h,rank+1);
      h[c]--;rec.children.push({col:c,key:child});
    }
    return key;
  }
  enumerate(0,0,new Uint8Array(W),0);

  function qo(r){return {h:[...r.h],r0:residuals(r.p0,r.p1),r1:residuals(r.p1,r.p0)};}
  function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
  function rank(q){return q.h.reduce((a,b)=>a+b,0);}
  function counts(q){
    const r=rank(q),rem=N-r,m=r&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {r,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
  }
  function releases(mask,h){return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);}
  function releaseFeasible(mask,h,player){
    const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);let slot=player===c.m?1:2;
    for(const need of rs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;
  }
  function R(q){return {h:q.h,r0:q.r0.filter(x=>releaseFeasible(x,q.h,0)),r1:q.r1.filter(x=>releaseFeasible(x,q.h,1))};}
  function F(q){
    const c=counts(q),own=c.m?q.r1:q.r0;let frontier=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const bit=1<<(q.h[col]*W+col),immediate=own.some(x=>x===bit);
      if(!immediate)frontier|=bit;
    }
    return c.m?{h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
  }
  function G(q){
    const finalMover=(N-1)&1,deadOwner=1-finalMover;let caps=0;
    for(let c=0;c<W;c++)if(q.h[c]<H)caps|=1<<((H-1)*W+c);
    if(!caps)return q;
    return deadOwner===0?{h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)};
  }

  const feasibilityCache=new Map();
  function covered(mask,h){for(const b of bits(mask))if(Math.floor(b/W)>=h[b%W])return false;return true;}
  function Xfeasible(mask,h0,owner){
    const root=h0.join(',')+'|'+owner+'|'+(mask>>>0),known=feasibilityCache.get(root);
    if(known!==undefined)return known;
    const q=[[...h0]],seen=new Set([h0.join(',')]);
    for(let qi=0;qi<q.length;qi++){
      const h=q[qi];
      if(covered(mask,h)){feasibilityCache.set(root,true);return true;}
      const mover=h.reduce((a,b)=>a+b,0)&1;
      for(let c=0;c<W;c++)if(h[c]<H){
        const bit=1<<(h[c]*W+c);
        if((mask&bit)&&mover!==owner)continue;
        const n=[...h];n[c]++;const k=n.join(',');
        if(!seen.has(k)){seen.add(k);q.push(n);}
      }
    }
    feasibilityCache.set(root,false);return false;
  }
  function X(q){return {h:q.h,r0:q.r0.filter(x=>Xfeasible(x,q.h,0)),r1:q.r1.filter(x=>Xfeasible(x,q.h,1))};}
  function apply(q,seq){for(const ch of seq)q=ch==='R'?R(q):ch==='F'?F(q):ch==='G'?G(q):ch==='X'?X(q):q;return q;}

  function qTransition(q,col){
    const r=rank(q),m=r&1;if(q.h[col]>=H)return {illegal:true};
    const bit=1<<(q.h[col]*W+col),own=m?q.r1:q.r0,opp=m?q.r0:q.r1,next=[];
    for(const req of own){
      if(req&bit){const z=(req&~bit)>>>0;if(!z)return {terminal:true,token:m?'P1':'P0'};next.push(z);}
      else next.push(req);
    }
    const h=[...q.h];h[col]++;if(r+1===N)return {terminal:true,token:'D'};
    const on=norm(next),op=norm(opp.filter(x=>(x&bit)===0));
    return {terminal:false,q:m?{h,r0:op,r1:on}:{h,r0:on,r1:op}};
  }

  const nonterminal=[...memo.values()].filter(x=>!x.terminal),qBy=new Map(nonterminal.map(r=>[r.key,qo(r)]));
  let rNotX=0,gNotX=0,idempotenceFail=0,commuteFail=0,factorXFail=0,factorXFFail=0;
  for(const r of nonterminal){
    const q=qBy.get(r.key),x=X(q),rx=R(q),gx=G(q);
    for(const m of q.r0)if(!rx.r0.includes(m)&&x.r0.includes(m))rNotX++;
    for(const m of q.r1)if(!rx.r1.includes(m)&&x.r1.includes(m))rNotX++;
    for(const m of q.r0)if(!gx.r0.includes(m)&&x.r0.includes(m))gNotX++;
    for(const m of q.r1)if(!gx.r1.includes(m)&&x.r1.includes(m))gNotX++;
    if(qkey(X(x))!==qkey(x))idempotenceFail++;
    if(qkey(X(F(q)))!==qkey(F(X(q))))commuteFail++;
    for(const e of r.children){
      const child=memo.get(e.key);if(child.terminal)continue;
      const a=qTransition(q,e.col),b=qTransition(x,e.col);
      assert.ok(!a.terminal&&!b.terminal);
      if(qkey(X(a.q))!==qkey(X(b.q)))factorXFail++;
      const xf=X(F(q)),bx=qTransition(xf,e.col);
      if(bx.terminal!==a.terminal){factorXFFail++;continue;}
      if(!a.terminal&&qkey(X(F(a.q)))!==qkey(X(F(bx.q))))factorXFFail++;
    }
  }
  assert.equal(rNotX,0);assert.equal(gNotX,0);assert.equal(idempotenceFail,0);assert.equal(commuteFail,0);assert.equal(factorXFail,0);assert.equal(factorXFFail,0);

  const candidates=[{id:'QO',seq:''},{id:'RFG',seq:'RFG'},{id:'X',seq:'X'},{id:'XF',seq:'XF'}];
  function token(r){return r.winner===0?'P0':r.winner===1?'P1':'D';}
  const direct=[];
  for(const c of candidates){
    const km=new Map(nonterminal.map(r=>[r.key,qkey(apply(qBy.get(r.key),c.seq))])),groups=new Map();
    for(const r of nonterminal){const k=km.get(r.key);let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push(r);}
    let pass=true,fail=null;
    for(const [k,rs] of groups){
      const a=rs[0],t0=Array(W).fill('I');
      for(const e of a.children){const ch=memo.get(e.key);t0[e.col]=ch.terminal?'T:'+token(ch):'N:'+km.get(ch.key);}
      const s0=t0.join('|');
      for(let i=1;i<rs.length&&pass;i++){
        const r=rs[i],t=Array(W).fill('I');
        for(const e of r.children){const ch=memo.get(e.key);t[e.col]=ch.terminal?'T:'+token(ch):'N:'+km.get(ch.key);}
        const s=t.join('|');if(s!==s0){pass=false;fail={key:k,a:a.key,b:r.key};}
      }
      if(!pass)break;
    }
    direct.push({id:c.id,classes:groups.size,QF:pass,fail});
  }
  assert.ok(direct.find(x=>x.id==='X').QF&&direct.find(x=>x.id==='XF').QF);

  function permutations(n){const out=[],a=[...Array(n).keys()];function f(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return out;}
  const P=permutations(W);
  function pMask(m,p){let z=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;z|=1<<(row*W+p[col]);}return z>>>0;}
  function pQ(q,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];return {h,r0:q.r0.map(m=>pMask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>pMask(m,p)).sort((a,b)=>a-b)};}
  let covarianceChecks=0,covarianceFail=0;
  for(const r of nonterminal){
    const q=qBy.get(r.key),x=X(q);
    for(const p of P){
      covarianceChecks++;
      if(qkey(X(pQ(q,p)))!==qkey(pQ(x,p))){covarianceFail++;break;}
    }
    if(covarianceFail)break;
  }
  assert.equal(covarianceFail,0);

  function orbitCount(seq){
    const set=new Set();
    for(const r of nonterminal){
      const q=apply(qBy.get(r.key),seq);let best=null;
      for(const p of P){const k=qkey(pQ(q,p));if(best===null||k<best)best=k;}
      set.add(best);
    }
    return set.size;
  }
  const orbit={QO:orbitCount(''),RFG:orbitCount('RFG'),X:orbitCount('X'),XF:orbitCount('XF')};

  return {
    width:W,height:H,k:K,physicalStates:memo.size,nonterminalStates:nonterminal.length,
    feasibilityCache:feasibilityCache.size,
    obligations:{RDeletedButXKept:rNotX,GDeletedButXKept:gNotX,idempotenceFail,commuteFail,factorXFail,factorXFFail,covarianceChecks,covarianceFail},
    direct,orbit
  };
}

const cases=CASES.map(auditCase);
const out={
  schema:'connect4.isomax.exact_single_residual_feasibility_holdout.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-008',
  candidateFrozenFrom:'EXACT_SINGLE_RESIDUAL_FEASIBILITY_4X4_0_1.json',
  cases,
  result:{
    allXQF:cases.every(c=>c.direct.find(x=>x.id==='X').QF),
    allXFQF:cases.every(c=>c.direct.find(x=>x.id==='XF').QF),
    allAlgebraObligationsPass:cases.every(c=>Object.entries(c.obligations).every(([k,v])=>k==='covarianceChecks'||v===0)),
    XFBeatsRFGDirectCases:cases.filter(c=>c.direct.find(x=>x.id==='XF').classes<c.direct.find(x=>x.id==='RFG').classes).map(c=>c.width+'x'+c.height+'k'+c.k),
    XFBeatsRFGOrbitCases:cases.filter(c=>c.orbit.XF<c.orbit.RFG).map(c=>c.width+'x'+c.height+'k'+c.k)
  },
  interpretationGuard:'Fresh bounded controls only. Support-lattice feasibility is outcome-blind and single-residual; general proof/standard-7x6 qualification remain separate.'
};
fs.writeFileSync(new URL('./EXACT_SINGLE_RESIDUAL_FEASIBILITY_HOLDOUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'X_HOLDOUT_COMPLETE',result:out.result,cases:cases.map(c=>({w:c.width,h:c.height,k:c.k,direct:c.direct,orbit:c.orbit,obligations:c.obligations,cache:c.feasibilityCache}))},null,2));