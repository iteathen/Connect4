import fs from 'node:fs';
import assert from 'node:assert/strict';

const W=4,H=4,K=4,N=W*H;

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
const L=winMasks();
assert.equal(L.length,10);
const won=b=>L.some(m=>((b&m)>>>0)===m);

function normalize(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
}
function residuals(self,opp){
  const raw=[];
  for(const line of L){
    if(line&opp)continue;
    const r=(line&~self)>>>0;
    if(r)raw.push(r);
  }
  return normalize(raw);
}
function popcount(m){let n=0;for(let v=m>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
function bits(m){const out=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v);out.push(b);}return out;}

const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
const stateKey=(p0,p1)=>p0+':'+p1;
function enumerate(p0,p1,heights,rank){
  const key=stateKey(p0,p1);
  if(memo.has(key))return key;
  const w0=won(p0),w1=won(p1);
  assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N;
  const rec={key,p0,p1,heights:[...heights],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  memo.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(heights[c]<H){
    const bit=1<<(heights[c]*W+c);heights[c]++;
    const child=(rank&1)?enumerate(p0,p1|bit,heights,rank+1):enumerate(p0|bit,p1,heights,rank+1);
    heights[c]--;rec.children.push({col:c,key:child});
  }
  return key;
}
enumerate(0,0,new Uint8Array(W),0);
assert.equal(memo.size,161029,'must reproduce frozen 4x4 physical first-win carrier');

function qo(rec){
  return {h:[...rec.heights],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};
}
function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function counts(q){
  const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
  return {rank,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
}
function remaining(q){
  const c=counts(q);
  return {h:q.h,r0:q.r0.filter(x=>popcount(x)<=c.p0),r1:q.r1.filter(x=>popcount(x)<=c.p1)};
}
function releases(mask,h){return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);}
function releaseFeasible(mask,h,player){
  const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);let slot=player===c.m?1:2;
  for(const need of rs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;
}
function release(q){return {h:q.h,r0:q.r0.filter(x=>releaseFeasible(x,q.h,0)),r1:q.r1.filter(x=>releaseFeasible(x,q.h,1))};}
function frontier(q){
  const c=counts(q),own=c.m?q.r1:q.r0;let F=0;
  for(let col=0;col<W;col++)if(q.h[col]<H){
    const bit=1<<(q.h[col]*W+col),immediate=own.some(x=>x===bit);
    if(!immediate)F|=bit;
  }
  return c.m?{h:q.h,r0:q.r0.filter(x=>(x&F)!==F),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&F)!==F)};
}
function finalCap(q){
  const c=counts(q);if(c.rem<=0||(c.rem&1))return q;
  let C=0;for(let col=0;col<W;col++)if(q.h[col]<H)C|=1<<((H-1)*W+col);
  return c.m?{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&C)!==C)}:{h:q.h,r0:q.r0.filter(x=>(x&C)!==C),r1:q.r1};
}
function allClosures(q){return release(finalCap(frontier(q)));}

function hist(rs){const h=Array(K+1).fill(0);for(const m of rs)h[popcount(m)]++;return h.join(',');}
function incidence(rs){const a=Array(N).fill(0);for(const m of rs)for(const b of bits(m))a[b]++;return a.join(',');}
function xo(rs){let x=0,o=0;for(const m of rs){x^=m;o|=m;}return [(x>>>0),(o>>>0),rs.length,hist(rs)].join(':');}
function unionOwned(q){return [...new Set([...q.r0,...q.r1])].sort((a,b)=>a-b).join('.');}

const candidates=[
  {id:'QO',desc:'full q_o',key:q=>qkey(q)},
  {id:'SUPPORT_ONLY',desc:'support heights only',key:q=>q.h.join(',')},
  {id:'RESIDUALS_PLUS_RANK',desc:'owned exact residuals + rank, no support vector',key:q=>q.h.reduce((a,b)=>a+b,0)+'|'+q.r0.join('.')+'|'+q.r1.join('.')},
  {id:'SUPPORT_COUNTS',desc:'support + owned residual counts',key:q=>q.h.join(',')+'|'+q.r0.length+'|'+q.r1.length},
  {id:'SUPPORT_SIZE_HIST',desc:'support + owned residual size histograms',key:q=>q.h.join(',')+'|'+hist(q.r0)+'|'+hist(q.r1)},
  {id:'SUPPORT_INCIDENCE',desc:'support + per-cell owned residual incidence counts',key:q=>q.h.join(',')+'|'+incidence(q.r0)+'|'+incidence(q.r1)},
  {id:'SUPPORT_INCIDENCE_HIST',desc:'support + incidence counts + residual size histograms',key:q=>q.h.join(',')+'|'+incidence(q.r0)+'|'+incidence(q.r1)+'|'+hist(q.r0)+'|'+hist(q.r1)},
  {id:'SUPPORT_XOR_OR_HIST',desc:'support + XOR/OR/count/size-hist summaries by owner',key:q=>q.h.join(',')+'|'+xo(q.r0)+'|'+xo(q.r1)},
  {id:'SUPPORT_UNOWNED_EXACT',desc:'support + exact residual union with ownership erased',key:q=>q.h.join(',')+'|'+unionOwned(q)},
  {id:'Q_REMAINING',desc:'support + exact owned residuals after remaining-move capacity',key:q=>qkey(remaining(q))},
  {id:'Q_RELEASE',desc:'support + exact owned residuals after support-release/turn capacity',key:q=>qkey(release(q))},
  {id:'Q_FRONTIER',desc:'support + exact owned residuals after nonterminal frontier blocker',key:q=>qkey(frontier(q))},
  {id:'Q_FINAL_CAP',desc:'support + exact owned residuals after mover final-cap parity closure',key:q=>qkey(finalCap(q))},
  {id:'Q_ALL_CLOSURES',desc:'support + exact owned residuals after frontier+final-cap+release',key:q=>qkey(allClosures(q))}
];

const nonterminal=[...memo.values()].filter(x=>!x.terminal),qByState=new Map(nonterminal.map(r=>[r.key,qo(r)]));
const keysByCandidate=new Map(candidates.map(c=>[c.id,new Map]));
for(const c of candidates){const m=keysByCandidate.get(c.id);for(const r of nonterminal)m.set(r.key,c.key(qByState.get(r.key)));}

function terminalToken(rec){return rec.winner===0?'P0':rec.winner===1?'P1':'D';}
function structuralInterface(rec,cand,map){
  const out=Array(W).fill('I');
  for(const e of rec.children){
    const ch=memo.get(e.key);
    out[e.col]=ch.terminal?'T:'+terminalToken(ch):'N:'+map.get(ch.key);
  }
  return out.join('|');
}

const values=new Map(),actionValues=new Map();
for(let rank=N;rank>=0;rank--)for(const r of byRank[rank]){
  if(r.terminal){values.set(r.key,r.winner===0?1:r.winner===1?-1:0);continue;}
  const av=Array(W).fill('I');
  for(const e of r.children)av[e.col]=values.get(e.key);
  actionValues.set(r.key,av);
  const xs=r.children.map(e=>values.get(e.key));
  values.set(r.key,(rank&1)?Math.min(...xs):Math.max(...xs));
}

function evaluateCandidate(c){
  const map=keysByCandidate.get(c.id),groups=new Map();
  for(const r of nonterminal){const k=map.get(r.key);let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push(r);}
  let fPass=true,aPass=true,vPass=true,fFail=null,aFail=null,vFail=null;
  for(const [k,rs] of groups){
    let f0=null,a0=null,v0=null,first=null;
    for(const r of rs){
      const f=structuralInterface(r,c,map),a=JSON.stringify(actionValues.get(r.key)),v=values.get(r.key);
      if(first===null){first=r.key;f0=f;a0=a;v0=v;continue;}
      if(fPass&&f!==f0){fPass=false;fFail={candidateKey:k,aState:first,bState:r.key,aInterface:f0,bInterface:f};}
      if(aPass&&a!==a0){aPass=false;aFail={candidateKey:k,aState:first,bState:r.key,aActionValues:JSON.parse(a0),bActionValues:JSON.parse(a)};}
      if(vPass&&v!==v0){vPass=false;vFail={candidateKey:k,aState:first,bState:r.key,aValue:v0,bValue:v};}
    }
  }
  return {
    id:c.id,description:c.desc,rankLocal:true,futureSearchUsedToDefine:false,
    classes:groups.size,compressionVsPhysical:nonterminal.length/groups.size,
    QF_literal_transition_congruence:fPass,QA_literal_action_value_sufficiency:aPass,QV_value_sufficiency:vPass,
    firstFutureFailure:fFail,firstActionValueFailure:aFail,firstValueFailure:vFail
  };
}

function reflectMask(m){let out=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;out|=1<<(row*W+(W-1-col));}return out>>>0;}
function reflectQ(q){return {h:[...q.h].reverse(),r0:q.r0.map(reflectMask).sort((a,b)=>a-b),r1:q.r1.map(reflectMask).sort((a,b)=>a-b)};}
function qr(q){const a=qkey(q),b=qkey(reflectQ(q));return b<a?{key:b,orientation:'R'}:{key:a,orientation:'I'};}
const qrMap=new Map(nonterminal.map(r=>[r.key,qr(qByState.get(r.key))]));
function evalOrbit(mapFn,label){
  const groups=new Map();
  for(const r of nonterminal){const z=mapFn(r),k=z.key;let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push({r,z});}
  let fPass=true,aTPass=true,aLiteralPass=true,vPass=true,fFail=null,aTFail=null,aLFail=null,vFail=null;
  for(const [k,rows] of groups){
    let f0=null,aT0=null,aL0=null,v0=null,first=null;
    for(const {r,z} of rows){
      const fi=Array(W).fill('I'),avt=Array(W).fill('I'),avl=actionValues.get(r.key);
      for(const e of r.children){
        const cc=z.perm?z.perm[e.col]:(z.orientation==='R'?W-1-e.col:e.col),
          ch=memo.get(e.key);
        fi[cc]=ch.terminal?'T:'+terminalToken(ch):'N:'+mapFn(ch).key;
        avt[cc]=values.get(e.key);
      }
      const fs=fi.join('|'),ats=JSON.stringify(avt),als=JSON.stringify(avl),v=values.get(r.key);
      if(first===null){first=r.key;f0=fs;aT0=ats;aL0=als;v0=v;continue;}
      if(fPass&&fs!==f0){fPass=false;fFail={key:k,a:first,b:r.key,aInterface:f0,bInterface:fs};}
      if(aTPass&&ats!==aT0){aTPass=false;aTFail={key:k,a:first,b:r.key};}
      if(aLiteralPass&&als!==aL0){aLiteralPass=false;aLFail={key:k,a:first,b:r.key};}
      if(vPass&&v!==v0){vPass=false;vFail={key:k,a:first,b:r.key,aValue:v0,bValue:v};}
    }
  }
  return {id:label,classes:groups.size,QF_transporter_congruence:fPass,QA_transported_action_values:aTPass,QA_literal_action_values:aLiteralPass,QV_value_sufficiency:vPass,firstFutureFailure:fFail,firstTransportedActionFailure:aTFail,firstLiteralActionFailure:aLFail,firstValueFailure:vFail};
}
const qrResult=evalOrbit(r=>qrMap.get(r.key),'Q_R_REFLECTION');

function permutations(n){const out=[],a=[...Array(n).keys()];function f(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return out;}
const perms=permutations(W);
function permMask(m,p){let out=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;out|=1<<(row*W+p[col]);}return out>>>0;}
function permQ(q,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];return {h,r0:q.r0.map(m=>permMask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>permMask(m,p)).sort((a,b)=>a-b)};}
function anyOrbit(q){let best=null,bp=null;for(const p of perms){const k=qkey(permQ(q,p));if(best===null||k<best){best=k;bp=p;}}return {key:best,perm:bp};}
const anyMap=new Map(nonterminal.map(r=>[r.key,anyOrbit(qByState.get(r.key))]));
const anyResult=evalOrbit(r=>anyMap.get(r.key),'Q_ANY_COLUMN_ORBIT');

const results=candidates.map(evaluateCandidate);
assert.equal(results.find(x=>x.id==='QO').QF_literal_transition_congruence,true);
assert.equal(results.find(x=>x.id==='QO').QA_literal_action_value_sufficiency,true);
assert.equal(results.find(x=>x.id==='QO').QV_value_sufficiency,true);
assert.equal(qrResult.QF_transporter_congruence,true);
assert.equal(qrResult.QA_transported_action_values,true);
assert.equal(qrResult.QV_value_sufficiency,true);

const out={
  schema:'connect4.isomax.rank_local_compression_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete physical 4x4 connect-4 first-win carrier',
  methodology:{
    structuralProducerUsesSolvedValues:false,
    candidateKeysFrozenBeforeValueDerivation:true,
    QFTest:'same candidate key must have identical literal terminal/candidate-successor interface',
    QATest:'post-freeze exact derived action-value vector homogeneity',
    QVTest:'post-freeze exact derived scalar value homogeneity',
    valueSource:'derived internally by backward rank recursion on enumerated physical carrier; no solved database'
  },
  counts:{physicalStates:memo.size,nonterminalStates:nonterminal.length,winningLines:L.length,qoClasses:new Set(keysByCandidate.get('QO').values()).size},
  directCandidates:results,
  transporterCandidates:[qrResult,anyResult],
  conclusions:{
    passingQF:results.filter(x=>x.QF_literal_transition_congruence).map(x=>x.id),
    passingQA:results.filter(x=>x.QA_literal_action_value_sufficiency).map(x=>x.id),
    passingQV:results.filter(x=>x.QV_value_sufficiency).map(x=>x.id),
    reflection:{QF:qrResult.QF_transporter_congruence,QA:qrResult.QA_transported_action_values,QV:qrResult.QV_value_sufficiency},
    arbitraryColumnOrbit:{QF:anyResult.QF_transporter_congruence,QA:anyResult.QA_transported_action_values,QV:anyResult.QV_value_sufficiency}
  },
  interpretationGuard:'Finite 4x4 exact evidence. Passing candidates are bounded exact controls, not unbounded or standard-7x6 theorems. Failed candidates provide exact counterexamples to the scoped compression.'
};
fs.writeFileSync(new URL('./RANK_LOCAL_COMPRESSION_4X4_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\\n');
console.log(JSON.stringify({status:'RANK_LOCAL_COMPRESSION_4X4_COMPLETE',counts:out.counts,conclusions:out.conclusions,direct:results.map(x=>({id:x.id,classes:x.classes,QF:x.QF_literal_transition_congruence,QA:x.QA_literal_action_value_sufficiency,QV:x.QV_value_sufficiency}))},null,2));