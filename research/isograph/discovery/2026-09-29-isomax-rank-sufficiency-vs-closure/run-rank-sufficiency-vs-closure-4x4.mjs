import fs from 'node:fs';
import assert from 'node:assert/strict';

const W=4,H=4,K=4,N=W*H;

function winMasks(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    const ec=c+(K-1)*dc,er=r+(K-1)*dr;
    if(ec<0||ec>=W||er<0||er>=H)continue;
    let m=0;
    for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);
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
  const out=[];
  for(const l of L){
    if(l&opp)continue;
    const r=(l&~self)>>>0;
    if(r)out.push(r);
  }
  return norm(out);
}
function bits(m){
  const out=[];
  for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
  return out;
}
function popcount(m){return bits(m).length;}

const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
function keyBoard(p0,p1){return p0+':'+p1;}
function enumerate(p0,p1,h,rank){
  const key=keyBoard(p0,p1);
  if(memo.has(key))return key;
  const w0=won(p0),w1=won(p1);
  assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N;
  const rec={key,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  memo.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){
    const bit=1<<(h[c]*W+c);
    h[c]++;
    const child=(rank&1)?enumerate(p0,p1|bit,h,rank+1):enumerate(p0|bit,p1,h,rank+1);
    h[c]--;
    rec.children.push({col:c,key:child});
  }
  return key;
}
enumerate(0,0,new Uint8Array(W),0);
assert.equal(memo.size,161029);

function qo(rec){return {h:[...rec.h],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};}
function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function counts(q){
  const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
  return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
}
function releases(mask,h){
  return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
}
function releaseFeasible(mask,h,player){
  const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);
  let slot=player===c.m?1:2;
  for(const need of rs){
    while(slot<need)slot+=2;
    if(slot>c.rem)return false;
    slot+=2;
  }
  return true;
}
function R(q){
  return {h:q.h,r0:q.r0.filter(x=>releaseFeasible(x,q.h,0)),r1:q.r1.filter(x=>releaseFeasible(x,q.h,1))};
}
function F(q){
  const c=counts(q),own=c.m?q.r1:q.r0;
  let frontier=0;
  for(let col=0;col<W;col++)if(q.h[col]<H){
    const bit=1<<(q.h[col]*W+col),immediate=own.some(x=>x===bit);
    if(!immediate)frontier|=bit;
  }
  return c.m?
    {h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}:
    {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
}
function C(q){
  const c=counts(q);
  if(c.rem<=0||(c.rem&1))return q;
  let caps=0;
  for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
  if(c.m)return {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)};
  return {h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
}
const applySeq=(q,seq)=>{
  for(const ch of seq)q=ch==='R'?R(q):ch==='F'?F(q):ch==='C'?C(q):q;
  return q;
};

const nonterminal=[...memo.values()].filter(r=>!r.terminal);
const qBy=new Map(nonterminal.map(r=>[r.key,qo(r)]));

const futureClass=new Map(),futureSigToId=new Map();let nextFuture=0;
for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
  let sig;
  if(r.terminal){
    sig='T:'+(r.winner===0?'P0':r.winner===1?'P1':'D');
  }else{
    const arr=Array(W).fill('I');
    for(const e of r.children)arr[e.col]='C:'+futureClass.get(e.key);
    sig='N:'+rank+':'+(rank&1)+':['+arr.join('|')+']';
  }
  let id=futureSigToId.get(sig);
  if(id===undefined){id=nextFuture++;futureSigToId.set(sig,id);}
  futureClass.set(r.key,id);
}

const value=new Map(),actionValues=new Map();
for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
  if(r.terminal){value.set(r.key,r.winner===0?1:r.winner===1?-1:0);continue;}
  const av=Array(W).fill('I');
  for(const e of r.children)av[e.col]=value.get(e.key);
  actionValues.set(r.key,av);
  const xs=r.children.map(e=>value.get(e.key));
  value.set(r.key,(rank&1)?Math.min(...xs):Math.max(...xs));
}

const candidates=[
  {id:'QO',seq:''},
  {id:'R',seq:'R'},
  {id:'F',seq:'F'},
  {id:'RF',seq:'RF'},
  {id:'C',seq:'C'},
  {id:'RC',seq:'RC'},
  {id:'FC',seq:'FC'},
  {id:'RFC',seq:'RFC'}
];

function token(r){return r.winner===0?'P0':r.winner===1?'P1':'D';}
function analyze(c){
  const keyMap=new Map(nonterminal.map(r=>[r.key,qkey(applySeq(qBy.get(r.key),c.seq))])),groups=new Map();
  for(const r of nonterminal){
    const k=keyMap.get(r.key);let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push(r);
  }
  let futureSufficient=true,transitionClosed=true,actionSufficient=true,valueSufficient=true;
  let futureFail=null,transitionFail=null,actionFail=null,valueFail=null;
  for(const [k,rs] of groups){
    const first=rs[0],f0=futureClass.get(first.key),a0=JSON.stringify(actionValues.get(first.key)),v0=value.get(first.key);
    const t0=Array(W).fill('I');
    for(const e of first.children){
      const ch=memo.get(e.key);
      t0[e.col]=ch.terminal?'T:'+token(ch):'N:'+keyMap.get(ch.key);
    }
    const ts0=t0.join('|');
    for(let i=1;i<rs.length;i++){
      const r=rs[i],f=futureClass.get(r.key),a=JSON.stringify(actionValues.get(r.key)),v=value.get(r.key);
      if(futureSufficient&&f!==f0){
        futureSufficient=false;futureFail={candidateKey:k,aState:first.key,bState:r.key,aFuture:f0,bFuture:f};
      }
      if(actionSufficient&&a!==a0){
        actionSufficient=false;actionFail={candidateKey:k,aState:first.key,bState:r.key,aAction:JSON.parse(a0),bAction:JSON.parse(a)};
      }
      if(valueSufficient&&v!==v0){
        valueSufficient=false;valueFail={candidateKey:k,aState:first.key,bState:r.key,aValue:v0,bValue:v};
      }
      if(transitionClosed){
        const t=Array(W).fill('I');
        for(const e of r.children){
          const ch=memo.get(e.key);
          t[e.col]=ch.terminal?'T:'+token(ch):'N:'+keyMap.get(ch.key);
        }
        const ts=t.join('|');
        if(ts!==ts0){
          transitionClosed=false;transitionFail={candidateKey:k,aState:first.key,bState:r.key,aInterface:ts0,bInterface:ts};
        }
      }
    }
  }
  return {
    id:c.id,seq:c.seq,classes:groups.size,
    futureBehaviorSufficient:futureSufficient,
    recursivelyClosedUnderDirectRecomputation:transitionClosed,
    literalActionValueSufficient:actionSufficient,
    scalarValueSufficient:valueSufficient,
    firstFutureFailure:futureFail,firstClosureFailure:transitionFail,
    firstActionFailure:actionFail,firstValueFailure:valueFail
  };
}
const rows=candidates.map(analyze);
assert.equal(rows.find(x=>x.id==='QO').futureBehaviorSufficient,true);
assert.equal(rows.find(x=>x.id==='QO').recursivelyClosedUnderDirectRecomputation,true);

const out={
  schema:'connect4.isomax.rank_sufficiency_vs_recursive_closure_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete physical 4x4 connect-4 first-win carrier',
  counts:{physical:memo.size,nonterminal:nonterminal.length,futureBehaviorClasses:nextFuture},
  definitions:{
    futureBehaviorSufficient:'same direct candidate key implies same complete literal-action-labelled physical future-game class',
    recursivelyClosedUnderDirectRecomputation:'same direct candidate key implies identical per-literal-action terminal/candidate-successor interface when the candidate is recomputed from each physical child',
    note:'recursive closure is sufficient for a state update F(Q,a), but is strictly stronger than rank sufficiency itself'
  },
  rows,
  result:{
    futureSufficientButNotClosed:rows.filter(x=>x.futureBehaviorSufficient&&!x.recursivelyClosedUnderDirectRecomputation).map(x=>x.id),
    futureAndClosed:rows.filter(x=>x.futureBehaviorSufficient&&x.recursivelyClosedUnderDirectRecomputation).map(x=>x.id),
    actionValueButNotFuture:rows.filter(x=>x.literalActionValueSufficient&&!x.futureBehaviorSufficient).map(x=>x.id),
    valueButNotFuture:rows.filter(x=>x.scalarValueSufficient&&!x.futureBehaviorSufficient).map(x=>x.id)
  },
  interpretationGuard:'Finite exact 4x4 result. This audit corrects terminology if direct semantic sufficiency and recursive representational closure diverge; no standard-7x6 theorem follows automatically.'
};
fs.writeFileSync(new URL('./RANK_SUFFICIENCY_VS_CLOSURE_4X4_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'RANK_SUFFICIENCY_VS_CLOSURE_COMPLETE',counts:out.counts,result:out.result,rows:rows.map(x=>({id:x.id,classes:x.classes,future:x.futureBehaviorSufficient,closed:x.recursivelyClosedUnderDirectRecomputation,QA:x.literalActionValueSufficient,QV:x.scalarValueSufficient}))},null,2));