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

function normalize(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
}
function residuals(self,opp){
  const out=[];
  for(const l of L){
    if(l&opp)continue;
    const z=(l&~self)>>>0;
    if(z)out.push(z);
  }
  return normalize(out);
}
function bits(m){
  const out=[];
  for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
  return out;
}
function popcount(m){return bits(m).length;}

const states=new Map(),byRank=Array.from({length:N+1},()=>[]);
function pkey(p0,p1){return p0+':'+p1;}
function visit(p0,p1,h,rank){
  const key=pkey(p0,p1);
  if(states.has(key))return key;
  const w0=won(p0),w1=won(p1);
  assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N,
    rec={key,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  states.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){
    const b=1<<(h[c]*W+c);h[c]++;
    const child=(rank&1)?visit(p0,p1|b,h,rank+1):visit(p0|b,p1,h,rank+1);
    h[c]--;rec.children.push({col:c,key:child});
  }
  return key;
}
visit(0,0,new Uint8Array(W),0);
assert.equal(states.size,161029);

function qo(r){return {h:[...r.h],r0:residuals(r.p0,r.p1),r1:residuals(r.p1,r.p0)};}
function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function counts(q){
  const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,
    mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
  return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
}
function remaining(q){
  const c=counts(q);
  return {h:q.h,r0:q.r0.filter(x=>popcount(x)<=c.p0),r1:q.r1.filter(x=>popcount(x)<=c.p1)};
}
function releases(mask,h){
  return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
}
function releaseFeasible(mask,h,player){
  const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);
  let slot=player===c.m?1:2;
  for(const need of rs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}
  return true;
}
function release(q){
  return {h:q.h,r0:q.r0.filter(x=>releaseFeasible(x,q.h,0)),r1:q.r1.filter(x=>releaseFeasible(x,q.h,1))};
}
function frontier(q){
  const c=counts(q),own=c.m?q.r1:q.r0;
  let F=0;
  for(let col=0;col<W;col++)if(q.h[col]<H){
    const b=1<<(q.h[col]*W+col),immediate=own.some(x=>x===b);
    if(!immediate)F|=b;
  }
  return c.m?{h:q.h,r0:q.r0.filter(x=>(x&F)!==F),r1:q.r1}:
    {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&F)!==F)};
}
const OPS={R:remaining,S:release,F:frontier};

function permutations(n){
  const out=[],a=[...Array(n).keys()];
  function rec(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];}
  }
  rec(0);return out;
}
const P=permutations(W);
function pmask(m,p){
  let z=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;z|=1<<(row*W+p[col]);}
  return z>>>0;
}
function pq(q,p){
  const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];
  return {h,r0:q.r0.map(m=>pmask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>pmask(m,p)).sort((a,b)=>a-b)};
}
function orbit(q){
  let best=null,bp=null;
  for(const p of P){
    const k=qkey(pq(q,p));
    if(best===null||k<best){best=k;bp=p;}
  }
  return {key:best,perm:bp};
}

const sequences=[[]];
for(const a of Object.keys(OPS))sequences.push([a]);
for(const a of Object.keys(OPS))for(const b of Object.keys(OPS))if(b!==a)sequences.push([a,b]);
for(const a of Object.keys(OPS))for(const b of Object.keys(OPS))for(const c of Object.keys(OPS))
  if(new Set([a,b,c]).size===3)sequences.push([a,b,c]);
assert.equal(sequences.length,16);
function applySeq(q,seq){let z=q;for(const op of seq)z=OPS[op](z);return z;}

const nonterminal=[...states.values()].filter(r=>!r.terminal),
  qByState=new Map(nonterminal.map(r=>[r.key,qo(r)])),
  uniqueQ=new Map();
for(const q of qByState.values())uniqueQ.set(qkey(q),q);
assert.equal(uniqueQ.size,34094);

const covariance=[];
for(const [name,op] of Object.entries(OPS)){
  let checks=0,mismatch=null;
  outer: for(const q of uniqueQ.values())for(const p of P){
    checks++;
    if(qkey(op(pq(q,p)))!==qkey(pq(op(q),p))){
      mismatch={q:qkey(q),p,a:qkey(op(pq(q,p))),b:qkey(pq(op(q),p))};break outer;
    }
  }
  covariance.push({op:name,checks,mismatch,covariant:mismatch===null});
}
assert.ok(covariance.every(x=>x.covariant));

const values=new Map(),actionValues=new Map();
for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
  if(r.terminal){values.set(r.key,r.winner===0?1:r.winner===1?-1:0);continue;}
  const av=Array(W).fill('I');
  for(const e of r.children)av[e.col]=values.get(e.key);
  actionValues.set(r.key,av);
  const xs=r.children.map(e=>values.get(e.key));
  values.set(r.key,(rank&1)?Math.min(...xs):Math.max(...xs));
}
const token=r=>r.winner===0?'P0':r.winner===1?'P1':'D';

function buildCandidate(seq,useOrbit){
  const qClass=new Map();
  for(const [k,q] of uniqueQ){
    const z=applySeq(q,seq);
    qClass.set(k,useOrbit?orbit(z):{key:qkey(z),perm:[0,1,2,3]});
  }
  const stateMap=new Map();
  for(const r of nonterminal)stateMap.set(r.key,qClass.get(qkey(qByState.get(r.key))));
  return stateMap;
}
function evalCandidate(seq,useOrbit){
  const map=buildCandidate(seq,useOrbit),groups=new Map();
  for(const r of nonterminal){
    const z=map.get(r.key);let xs=groups.get(z.key);
    if(!xs){xs=[];groups.set(z.key,xs);}xs.push(r);
  }
  let qf=true,qa=true,qv=true,fFail=null,aFail=null,vFail=null;
  for(const [key,rs] of groups){
    let fi0=null,av0=null,v0=null,first=null;
    for(const r of rs){
      const z=map.get(r.key),fi=Array(W).fill('I'),av=Array(W).fill('I');
      for(const e of r.children){
        const cc=useOrbit?z.perm[e.col]:e.col,ch=states.get(e.key);
        fi[cc]=ch.terminal?'T:'+token(ch):'N:'+map.get(ch.key).key;
        av[cc]=values.get(e.key);
      }
      const fs=fi.join('|'),as=JSON.stringify(av),v=values.get(r.key);
      if(first===null){first=r.key;fi0=fs;av0=as;v0=v;continue;}
      if(qf&&fs!==fi0){qf=false;fFail={key,a:first,b:r.key,aInterface:fi0,bInterface:fs};}
      if(qa&&as!==av0){qa=false;aFail={key,a:first,b:r.key,aActionValues:JSON.parse(av0),bActionValues:av};}
      if(qv&&v!==v0){qv=false;vFail={key,a:first,b:r.key,aValue:v0,bValue:v};}
    }
  }
  return {
    id:(useOrbit?'SIGMA_':'DIRECT_')+(seq.length?seq.join(''):'ID'),
    sequence:seq,orbit:useOrbit,classes:groups.size,
    QF:qf,QA:qa,QV:qv,
    firstFutureFailure:fFail,firstActionFailure:aFail,firstValueFailure:vFail
  };
}

const rows=[];
for(const seq of sequences){rows.push(evalCandidate(seq,false));rows.push(evalCandidate(seq,true));}

const qf=rows.filter(x=>x.QF).sort((a,b)=>a.classes-b.classes||a.id.localeCompare(b.id)),
  qa=rows.filter(x=>x.QA).sort((a,b)=>a.classes-b.classes||a.id.localeCompare(b.id)),
  qv=rows.filter(x=>x.QV).sort((a,b)=>a.classes-b.classes||a.id.localeCompare(b.id));

const out={
  schema:'connect4.isomax.q_sigma_closure_composition_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete 4x4 first-win physical carrier',
  method:{
    candidates:'all 16 distinct-order sequences over R=remaining-capacity, S=support-release/turn-capacity, F=frontier, each with and without full S4 orbit canonicalization',
    candidateDefinitionsUseValues:false,
    valuesDerivedOnlyAfterCandidateDefinition:true,
    orbitSemantics:'canonical action slots use current-to-orbit transporter'
  },
  primitiveCovariance:covariance,
  rows,
  minima:{
    QF:qf.slice(0,8).map(x=>({id:x.id,sequence:x.sequence,orbit:x.orbit,classes:x.classes})),
    QA:qa.slice(0,8).map(x=>({id:x.id,sequence:x.sequence,orbit:x.orbit,classes:x.classes})),
    QV:qv.slice(0,8).map(x=>({id:x.id,sequence:x.sequence,orbit:x.orbit,classes:x.classes}))
  },
  best:{
    QF:qf[0],QA:qa[0],QV:qv[0]
  },
  orderSensitivity:{
    threeOpRows:rows.filter(x=>x.sequence.length===3).map(x=>({id:x.id,classes:x.classes,QF:x.QF,QA:x.QA,QV:x.QV}))
  },
  interpretationGuard:'Finite exact 4x4 evidence only. Closure covariance under S4 and bounded congruence do not by themselves prove standard-7x6 closure sufficiency.'
};
fs.writeFileSync(new URL('./Q_SIGMA_CLOSURE_COMPOSITION_4X4_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+String.fromCharCode(10));
console.log(JSON.stringify({
  status:'Q_SIGMA_CLOSURE_COMPOSITION_COMPLETE',
  covariance,
  best:{QF:out.best.QF.id+':'+out.best.QF.classes,QA:out.best.QA.id+':'+out.best.QA.classes,QV:out.best.QV.id+':'+out.best.QV.classes},
  minima:out.minima
},null,2));