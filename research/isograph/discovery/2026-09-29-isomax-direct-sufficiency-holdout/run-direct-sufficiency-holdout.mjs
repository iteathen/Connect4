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
      let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);
      out.push(m>>>0);
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
  function counts(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
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
  function C(q){
    const c=counts(q);if(c.rem<=0||(c.rem&1))return q;
    let caps=0;for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
    return c.m?{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)}:{h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
  }
  function apply(q,seq){for(const ch of seq)q=ch==='R'?R(q):ch==='F'?F(q):ch==='C'?C(q):q;return q;}

  const futureClass=new Map(),sigId=new Map();let next=0;
  for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
    let sig;
    if(r.terminal)sig='T:'+(r.winner===0?'P0':r.winner===1?'P1':'D');
    else{
      const a=Array(W).fill('I');
      for(const e of r.children)a[e.col]='C:'+futureClass.get(e.key);
      sig='N:'+rank+':'+(rank&1)+':['+a.join('|')+']';
    }
    let id=sigId.get(sig);if(id===undefined){id=next++;sigId.set(sig,id);}futureClass.set(r.key,id);
  }

  const nonterminal=[...memo.values()].filter(x=>!x.terminal),qBy=new Map(nonterminal.map(r=>[r.key,qo(r)]));
  const candidates=[{id:'QO',seq:''},{id:'C',seq:'C'},{id:'RFC',seq:'RFC'}];

  function token(r){return r.winner===0?'P0':r.winner===1?'P1':'D';}
  const rows=[];
  for(const cand of candidates){
    const km=new Map(nonterminal.map(r=>[r.key,qkey(apply(qBy.get(r.key),cand.seq))])),groups=new Map();
    for(const r of nonterminal){const k=km.get(r.key);let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push(r);}
    let future=true,closed=true,ff=null,cf=null;
    for(const [k,rs] of groups){
      const a=rs[0],f0=futureClass.get(a.key),t0=Array(W).fill('I');
      for(const e of a.children){const ch=memo.get(e.key);t0[e.col]=ch.terminal?'T:'+token(ch):'N:'+km.get(ch.key);}
      const ts0=t0.join('|');
      for(let i=1;i<rs.length;i++){
        const r=rs[i];
        if(future&&futureClass.get(r.key)!==f0){future=false;ff={key:k,a:a.key,b:r.key};}
        if(closed){
          const t=Array(W).fill('I');
          for(const e of r.children){const ch=memo.get(e.key);t[e.col]=ch.terminal?'T:'+token(ch):'N:'+km.get(ch.key);}
          const ts=t.join('|');if(ts!==ts0){closed=false;cf={key:k,a:a.key,b:r.key,aInterface:ts0,bInterface:ts};}
        }
      }
    }
    rows.push({id:cand.id,classes:groups.size,futureBehaviorSufficient:future,recursiveClosure:closed,firstFutureFailure:ff,firstClosureFailure:cf});
  }
  return {width:W,height:H,k:K,physicalStates:memo.size,nonterminalStates:nonterminal.length,futureBehaviorClasses:next,rows};
}

const cases=CASES.map(auditCase);
const out={
  schema:'connect4.isomax.direct_sufficiency_holdout.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-006',
  candidateFrozenFrom:'complete 4x4 k4 EW-RS-005 result',
  cases,
  result:{
    C_futureSufficientEveryCase:cases.every(x=>x.rows.find(r=>r.id==='C').futureBehaviorSufficient),
    RFC_futureSufficientEveryCase:cases.every(x=>x.rows.find(r=>r.id==='RFC').futureBehaviorSufficient),
    C_recursiveClosureEveryCase:cases.every(x=>x.rows.find(r=>r.id==='C').recursiveClosure),
    RFC_recursiveClosureEveryCase:cases.every(x=>x.rows.find(r=>r.id==='RFC').recursiveClosure)
  },
  interpretationGuard:'Fresh bounded structural holdouts. They distinguish semantic future sufficiency from recursive representational closure; no standard-7x6 theorem is promoted.'
};
fs.writeFileSync(new URL('./DIRECT_SUFFICIENCY_HOLDOUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'DIRECT_SUFFICIENCY_HOLDOUT_COMPLETE',result:out.result,cases:cases.map(x=>({w:x.width,h:x.height,k:x.k,rows:x.rows.map(r=>({id:r.id,classes:r.classes,future:r.futureBehaviorSufficient,closed:r.recursiveClosure}))}))},null,2));