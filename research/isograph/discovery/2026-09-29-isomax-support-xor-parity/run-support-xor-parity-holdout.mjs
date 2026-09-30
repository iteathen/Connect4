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

  const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
  function key(p0,p1){return p0+':'+p1;}
  function enumerate(p0,p1,h,rank){
    const k=key(p0,p1);if(memo.has(k))return k;
    const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
    const terminal=w0||w1||rank===N,rec={key:k,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
    memo.set(k,rec);byRank[rank].push(rec);if(terminal)return k;
    for(let c=0;c<W;c++)if(h[c]<H){
      const b=1<<(h[c]*W+c);h[c]++;
      const child=(rank&1)?enumerate(p0,p1|b,h,rank+1):enumerate(p0|b,p1,h,rank+1);
      h[c]--;rec.children.push({col:c,key:child});
    }
    return k;
  }
  enumerate(0,0,new Uint8Array(W),0);

  function qo(r){return {h:[...r.h],r0:residuals(r.p0,r.p1),r1:residuals(r.p1,r.p0)};}
  function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
  function feat(h){
    const sum=h.reduce((a,b)=>a+b,0);let x=0,t=0,e2=0;
    for(let i=0;i<h.length;i++){x^=h[i];t^=(1<<h[i])-1;for(let j=i+1;j<h.length;j++)e2+=h[i]*h[j];}
    return {X_h:x>>>0,p:sum&1,threshold:t>>>0,sumMod4:sum&3,e2Mod4:e2&3,multiset:[...h].sort((a,b)=>a-b).join(',')};
  }
  const nonterminal=[...memo.values()].filter(r=>!r.terminal),qBy=new Map(nonterminal.map(r=>[r.key,qo(r)])),fBy=new Map(nonterminal.map(r=>[r.key,feat(r.h)]));
  for(const r of nonterminal)assert.equal(fBy.get(r.key).p,fBy.get(r.key).X_h&1);

  const future=new Map(),sigId=new Map();let next=0;
  for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
    let sig;
    if(r.terminal)sig='T:'+(r.winner===0?'P0':r.winner===1?'P1':'D');
    else{const a=Array(W).fill('I');for(const e of r.children)a[e.col]='C:'+future.get(e.key);sig='N:'+rank+':'+(rank&1)+':['+a.join('|')+']';}
    let id=sigId.get(sig);if(id===undefined){id=next++;sigId.set(sig,id);}future.set(r.key,id);
  }
  const futureNonterminal=new Set(nonterminal.map(r=>future.get(r.key)));
  const qoSet=new Set(nonterminal.map(r=>qkey(qBy.get(r.key))));

  function descriptor(r,id){
    const f=fBy.get(r.key);
    if(id==='P')return String(f.p);
    if(id==='XH')return String(f.X_h);
    if(id==='THRESH')return String(f.threshold);
    if(id==='SUM_MOD4')return String(f.sumMod4);
    if(id==='E2_MOD4')return String(f.e2Mod4);
    if(id==='MULTISET')return f.multiset;
    throw new Error(id);
  }
  function futureSplit(id){
    const ds=new Map(),pairs=new Set();
    for(const r of nonterminal){
      const fc=future.get(r.key),d=descriptor(r,id);pairs.add(fc+'|'+d);
      let s=ds.get(fc);if(!s){s=new Set();ds.set(fc,s);}s.add(d);
    }
    let fragmented=0,max=0;for(const s of ds.values()){if(s.size>1)fragmented++;max=Math.max(max,s.size);}
    return {id,futureClasses:futureNonterminal.size,qoClasses:qoSet.size,pairs:pairs.size,fragmented,maxVariants:max,eliminableQoDistinctions:qoSet.size-pairs.size};
  }
  const splits=['P','XH','THRESH','SUM_MOD4','E2_MOD4','MULTISET'].map(futureSplit);

  let updateAmbiguousGroups=0;
  const ug=new Map();
  for(const r of nonterminal){
    const x=fBy.get(r.key).X_h;
    for(let c=0;c<W;c++)if(r.h[c]<H){
      const nh=[...r.h];nh[c]++;const nx=feat(nh).X_h,k=x+'|'+c;
      let s=ug.get(k);if(!s){s=new Set();ug.set(k,s);}s.add(nx);
    }
  }
  for(const s of ug.values())if(s.size>1)updateAmbiguousGroups++;

  function counts(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
  }
  function releases(mask,h){return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);}
  function rFeas(mask,h,owner){
    const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);let slot=owner===c.m?1:2;
    for(const need of rs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;
  }
  const xcache=new Map();
  function covered(mask,h){for(const b of bits(mask))if(Math.floor(b/W)>=h[b%W])return false;return true;}
  function xFeas(mask,h0,owner){
    const root=h0.join(',')+'|'+owner+'|'+mask;if(xcache.has(root))return xcache.get(root);
    const q=[[...h0]],seen=new Set([h0.join(',')]);
    for(let i=0;i<q.length;i++){
      const h=q[i];if(covered(mask,h)){xcache.set(root,true);return true;}
      const mover=h.reduce((a,b)=>a+b,0)&1;
      for(let c=0;c<W;c++)if(h[c]<H){
        const bit=1<<(h[c]*W+c);if((mask&bit)&&mover!==owner)continue;
        const n=[...h];n[c]++;const k=n.join(',');if(!seen.has(k)){seen.add(k);q.push(n);}
      }
    }
    xcache.set(root,false);return false;
  }
  const occurrences=[];
  for(const r of nonterminal){
    const q=qBy.get(r.key),f=fBy.get(r.key),c=counts(q),m=c.m,own=m?q.r1:q.r0;let frontier=0,caps=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const bit=1<<(q.h[col]*W+col),immediate=own.some(x=>x===bit);if(!immediate)frontier|=bit;caps|=1<<((H-1)*W+col);
    }
    const deadOwner=1-((N-1)&1);
    for(const [owner,rs] of [[0,q.r0],[1,q.r1]])for(const mask of rs)occurrences.push({
      x:f.X_h,p:f.p,owner,mask,
      R:!rFeas(mask,q.h,owner),
      F:owner===1-m&&((mask&frontier)>>>0)===(frontier>>>0),
      G:owner===deadOwner&&caps!==0&&((mask&caps)>>>0)===(caps>>>0),
      X_feas:!xFeas(mask,q.h,owner)
    });
  }
  function amb(rule){
    const g=new Map();
    for(const row of occurrences){
      const k=row.x+'|'+row.owner+'|'+row.mask;let s=g.get(k);if(!s){s=new Set();g.set(k,s);}s.add(row[rule]);
    }
    return [...g.values()].filter(s=>s.size>1).length;
  }

  return {
    width:W,height:H,k:K,physicalStates:memo.size,nonterminalStates:nonterminal.length,
    parityLowBitIdentity:true,
    splits,
    X_hUpdateAmbiguousGroups:updateAmbiguousGroups,
    X_hRuleAmbiguity:{R:amb('R'),F:amb('F'),G:amb('G'),X_feas:amb('X_feas')}
  };
}

const cases=CASES.map(auditCase);
const out={
  schema:'connect4.isomax.support_xor_parity_holdout.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-010',
  frozenCandidate:'X_h = XOR integer column heights; p = stone-count parity = low bit of X_h',
  cases,
  result:{
    X_hConstantWithinFutureEveryCase:cases.every(c=>c.splits.find(x=>x.id==='XH').fragmented===0),
    parityRedundantEveryCase:cases.every(c=>c.parityLowBitIdentity),
    X_hRecursivelyClosedEveryCase:cases.every(c=>c.X_hUpdateAmbiguousGroups===0),
    X_hPredictsAllRFGXfeasEveryCase:cases.every(c=>Object.values(c.X_hRuleAmbiguity).every(x=>x===0))
  },
  interpretationGuard:'Fresh bounded holdouts with no solved database. Exact future classes are validation/oracle only, not definitions of X_h.'
};
fs.writeFileSync(new URL('./SUPPORT_XOR_PARITY_HOLDOUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'SUPPORT_XOR_PARITY_HOLDOUT_COMPLETE',result:out.result,cases},null,2));