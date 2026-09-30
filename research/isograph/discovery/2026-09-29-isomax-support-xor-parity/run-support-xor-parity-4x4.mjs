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
const L=winMasks(),won=b=>L.some(m=>((b&m)>>>0)===m);

function norm(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
}
function residuals(self,opp){
  const out=[];
  for(const l of L){if(l&opp)continue;const r=(l&~self)>>>0;if(r)out.push(r);}
  return norm(out);
}
function bits(m){const out=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));return out;}
function popcount(m){return bits(m).length;}

const memo=new Map(),byRank=Array.from({length:N+1},()=>[]);
function bkey(p0,p1){return p0+':'+p1;}
function enumerate(p0,p1,h,rank){
  const key=bkey(p0,p1);if(memo.has(key))return key;
  const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N;
  const rec={key,p0,p1,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  memo.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){
    const bit=1<<(h[c]*W+c);h[c]++;
    const child=(rank&1)?enumerate(p0,p1|bit,h,rank+1):enumerate(p0|bit,p1,h,rank+1);
    h[c]--;rec.children.push({col:c,key:child});
  }
  return key;
}
enumerate(0,0,new Uint8Array(W),0);
assert.equal(memo.size,161029);

function qo(r){return {h:[...r.h],r0:residuals(r.p0,r.p1),r1:residuals(r.p1,r.p0)};}
function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function rank(q){return q.h.reduce((a,b)=>a+b,0);}
function supportFeatures(h){
  const sum=h.reduce((a,b)=>a+b,0);
  let xh=0,thresholdXor=0,heightParitySpectrum=0,e2=0;
  for(let i=0;i<h.length;i++){
    xh^=h[i];
    thresholdXor^=(1<<h[i])-1;
    heightParitySpectrum^=1<<h[i];
    for(let j=i+1;j<h.length;j++)e2+=h[i]*h[j];
  }
  return {
    X_h:xh>>>0,
    p:sum&1,
    sumMod3:sum%3,
    sumMod4:sum%4,
    thresholdXor:thresholdXor>>>0,
    heightParitySpectrum:heightParitySpectrum>>>0,
    e2Mod2:e2&1,
    e2Mod4:e2&3,
    nonfull:h.filter(x=>x<H).length,
    multiset:[...h].sort((a,b)=>a-b).join(',')
  };
}
function featureKey(f,id){
  if(id==='P')return String(f.p);
  if(id==='XH')return String(f.X_h);
  if(id==='XH_P')return f.X_h+'|'+f.p;
  if(id==='THRESH')return String(f.thresholdXor);
  if(id==='HEIGHT_PARITY_SPECTRUM')return String(f.heightParitySpectrum);
  if(id==='SUM_MOD4')return String(f.sumMod4);
  if(id==='E2_MOD4')return String(f.e2Mod4);
  if(id==='XH_E2_MOD4')return f.X_h+'|'+f.e2Mod4;
  if(id==='MULTISET')return f.multiset;
  if(id==='XH_NONFULL')return f.X_h+'|'+f.nonfull;
  throw new Error('unknown feature '+id);
}

const nonterminal=[...memo.values()].filter(r=>!r.terminal),
  qBy=new Map(nonterminal.map(r=>[r.key,qo(r)])),
  featBy=new Map(nonterminal.map(r=>[r.key,supportFeatures(r.h)]));

let parityIdentityFailures=0;
for(const r of nonterminal){
  const f=featBy.get(r.key);
  if(f.p!==(f.X_h&1))parityIdentityFailures++;
}
assert.equal(parityIdentityFailures,0);

const values=new Map(),actionValues=new Map(),futureClass=new Map(),futureSigId=new Map();
let nextFuture=0;
function token(r){return r.winner===0?'P0':r.winner===1?'P1':'D';}
for(let rr=N;rr>=0;rr--)for(const r of byRank[rr]){
  if(r.terminal){
    const v=r.winner===0?1:r.winner===1?-1:0;
    values.set(r.key,v);
    const sig='T:'+token(r);
    let id=futureSigId.get(sig);if(id===undefined){id=nextFuture++;futureSigId.set(sig,id);}
    futureClass.set(r.key,id);
    continue;
  }
  const av=Array(W).fill('I'),fs=Array(W).fill('I');
  for(const e of r.children){
    av[e.col]=values.get(e.key);
    fs[e.col]='C:'+futureClass.get(e.key);
  }
  actionValues.set(r.key,av);
  const xs=r.children.map(e=>values.get(e.key));
  values.set(r.key,(rr&1)?Math.min(...xs):Math.max(...xs));
  const sig='N:'+rr+':'+(rr&1)+':['+fs.join('|')+']';
  let id=futureSigId.get(sig);if(id===undefined){id=nextFuture++;futureSigId.set(sig,id);}
  futureClass.set(r.key,id);
}

function evaluateKey(id,keyFn){
  const groups=new Map();
  for(const r of nonterminal){
    const k=keyFn(r);let xs=groups.get(k);if(!xs){xs=[];groups.set(k,xs);}xs.push(r);
  }
  let qf=true,qa=true,qv=true,ff=null,af=null,vf=null;
  for(const [k,rs] of groups){
    const a=rs[0],f0=futureClass.get(a.key),a0=JSON.stringify(actionValues.get(a.key)),v0=values.get(a.key);
    for(let i=1;i<rs.length;i++){
      const r=rs[i],f=futureClass.get(r.key),av=JSON.stringify(actionValues.get(r.key)),v=values.get(r.key);
      if(qf&&f!==f0){qf=false;ff={key:k,a:a.key,b:r.key,aFuture:f0,bFuture:f};}
      if(qa&&av!==a0){qa=false;af={key:k,a:a.key,b:r.key,aAction:JSON.parse(a0),bAction:JSON.parse(av)};}
      if(qv&&v!==v0){qv=false;vf={key:k,a:a.key,b:r.key,aValue:v0,bValue:v};}
    }
  }
  return {id,classes:groups.size,QF:qf,QA:qa,QV:qv,firstFutureFailure:ff,firstActionFailure:af,firstValueFailure:vf};
}

const supportIds=['P','XH','XH_P','THRESH','HEIGHT_PARITY_SPECTRUM','SUM_MOD4','E2_MOD4','XH_E2_MOD4','MULTISET','XH_NONFULL'];
const supportCandidates=supportIds.map(id=>evaluateKey(id,r=>featureKey(featBy.get(r.key),id)));
assert.equal(supportCandidates.find(x=>x.id==='XH').classes,supportCandidates.find(x=>x.id==='XH_P').classes);

const residualCandidates=[
  evaluateKey('RES_PLUS_XH',r=>{const q=qBy.get(r.key),f=featBy.get(r.key);return f.X_h+'|'+q.r0.join('.')+'|'+q.r1.join('.');}),
  evaluateKey('RES_PLUS_P',r=>{const q=qBy.get(r.key),f=featBy.get(r.key);return f.p+'|'+q.r0.join('.')+'|'+q.r1.join('.');}),
  evaluateKey('RES_PLUS_THRESH',r=>{const q=qBy.get(r.key),f=featBy.get(r.key);return f.thresholdXor+'|'+q.r0.join('.')+'|'+q.r1.join('.');}),
  evaluateKey('RES_PLUS_MULTISET',r=>{const q=qBy.get(r.key),f=featBy.get(r.key);return f.multiset+'|'+q.r0.join('.')+'|'+q.r1.join('.');}),
  evaluateKey('RES_PLUS_XH_THRESH',r=>{const q=qBy.get(r.key),f=featBy.get(r.key);return f.X_h+'|'+f.thresholdXor+'|'+q.r0.join('.')+'|'+q.r1.join('.');}),
  evaluateKey('QO',r=>qkey(qBy.get(r.key)))
];

function counts(q){
  const rr=rank(q),rem=N-rr,m=rr&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
  return {r:rr,rem,m,p0:m===0?mm:oo,p1:m===1?mm:oo};
}
function releases(mask,h){return bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);}
function releaseFeasible(mask,h,player){
  const c=counts({h,r0:[],r1:[]}),rs=releases(mask,h);let slot=player===c.m?1:2;
  for(const need of rs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;
}
function ruleDecisions(q,owner,mask){
  const c=counts(q),m=c.m,own=m?q.r1:q.r0;
  let frontier=0,caps=0;
  for(let col=0;col<W;col++)if(q.h[col]<H){
    const bit=1<<(q.h[col]*W+col),immediate=own.some(x=>x===bit);
    if(!immediate)frontier|=bit;
    caps|=1<<((H-1)*W+col);
  }
  const finalMover=(N-1)&1,deadOwner=1-finalMover;
  return {
    R:!releaseFeasible(mask,q.h,owner),
    F:owner===(1-m)&&((mask&frontier)>>>0)===(frontier>>>0),
    G:owner===deadOwner&&caps!==0&&((mask&caps)>>>0)===(caps>>>0)
  };
}

const feasCache=new Map();
function covered(mask,h){for(const b of bits(mask))if(Math.floor(b/W)>=h[b%W])return false;return true;}
function exactFeasible(mask,h0,owner){
  const root=h0.join(',')+'|'+owner+'|'+(mask>>>0);
  if(feasCache.has(root))return feasCache.get(root);
  const q=[[...h0]],seen=new Set([h0.join(',')]);
  for(let i=0;i<q.length;i++){
    const h=q[i];
    if(covered(mask,h)){feasCache.set(root,true);return true;}
    const mover=h.reduce((a,b)=>a+b,0)&1;
    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);
      if((mask&bit)&&mover!==owner)continue;
      const n=[...h];n[c]++;const k=n.join(',');
      if(!seen.has(k)){seen.add(k);q.push(n);}
    }
  }
  feasCache.set(root,false);return false;
}

const occurrenceRows=[];
for(const r of nonterminal){
  const q=qBy.get(r.key),f=featBy.get(r.key);
  for(const [owner,rs] of [[0,q.r0],[1,q.r1]])for(const mask of rs){
    const d=ruleDecisions(q,owner,mask);
    occurrenceRows.push({
      state:r.key,owner,mask,X_h:f.X_h,p:f.p,thresholdXor:f.thresholdXor,
      multiset:f.multiset,
      R:d.R,F:d.F,G:d.G,X_feas:!exactFeasible(mask,q.h,owner),
      heights:[...q.h]
    });
  }
}
function ambiguity(feature,rule){
  const groups=new Map();
  for(const row of occurrenceRows){
    const v=feature==='XH'?row.X_h:feature==='P'?row.p:feature==='XH_P'?row.X_h+'|'+row.p:
      feature==='THRESH'?row.thresholdXor:feature==='MULTISET'?row.multiset:null;
    const k=v+'|'+row.owner+'|'+row.mask;
    let g=groups.get(k);if(!g){g={vals:new Set(),rows:[]};groups.set(k,g);}
    g.vals.add(row[rule]);if(g.rows.length<4)g.rows.push(row);
  }
  const amb=[...groups.entries()].filter(([,g])=>g.vals.size>1);
  return {feature,rule,groups:groups.size,ambiguousGroups:amb.length,first:amb[0]?{key:amb[0][0],rows:amb[0][1].rows}:null};
}
const ruleAmbiguity=[];
for(const feature of ['P','XH','XH_P','THRESH','MULTISET'])
  for(const rule of ['R','F','G','X_feas'])ruleAmbiguity.push(ambiguity(feature,rule));

const transitionAmbiguity=[];
function nextSupport(h,c){const n=[...h];n[c]++;return n;}
for(const feature of ['P','XH','XH_P','THRESH','HEIGHT_PARITY_SPECTRUM','SUM_MOD4','E2_MOD4','XH_E2_MOD4','MULTISET']){
  const groups=new Map();
  for(const r of nonterminal){
    const f=featBy.get(r.key),cur=featureKey(f,feature);
    for(let c=0;c<W;c++)if(r.h[c]<H){
      const nf=supportFeatures(nextSupport(r.h,c)),nv=featureKey(nf,feature),k=cur+'|'+c;
      let g=groups.get(k);if(!g){g={next:new Set(),rows:[]};groups.set(k,g);}
      g.next.add(nv);if(g.rows.length<4)g.rows.push({state:r.key,heights:r.h,nextHeights:nextSupport(r.h,c),next:nv});
    }
  }
  const amb=[...groups.entries()].filter(([,g])=>g.next.size>1);
  transitionAmbiguity.push({feature,groups:groups.size,ambiguousGroups:amb.length,first:amb[0]?{key:amb[0][0],rows:amb[0][1].rows}:null});
}

let updateFormulaFailures=0;
for(const r of nonterminal){
  const x=featBy.get(r.key).X_h;
  for(let c=0;c<W;c++)if(r.h[c]<H){
    const nx=supportFeatures(nextSupport(r.h,c)).X_h,
      formula=(x^r.h[c]^(r.h[c]+1))>>>0;
    if(nx!==formula)updateFormulaFailures++;
  }
}
assert.equal(updateFormulaFailures,0);

const qoKeys=new Map(nonterminal.map(r=>[r.key,qkey(qBy.get(r.key))]));
const qoSet=new Set(qoKeys.values());
function splitOracle(feature){
  const futureToQo=new Map(),futureToFeat=new Map();
  const pair=new Set();
  for(const r of nonterminal){
    const f=futureClass.get(r.key),q=qoKeys.get(r.key),d=featureKey(featBy.get(r.key),feature);
    let qs=futureToQo.get(f);if(!qs){qs=new Set();futureToQo.set(f,qs);}qs.add(q);
    let ds=futureToFeat.get(f);if(!ds){ds=new Set();futureToFeat.set(f,ds);}ds.add(d);
    pair.add(f+'|'+d);
  }
  let fragmented=0,maxVariants=0;
  for(const ds of futureToFeat.values()){if(ds.size>1)fragmented++;maxVariants=Math.max(maxVariants,ds.size);}
  return {
    feature,
    futureClasses:new Set(nonterminal.map(r=>futureClass.get(r.key))).size,
    qoClasses:qoSet.size,
    futureDescriptorPairs:pair.size,
    qoExcessOverFuture:qoSet.size-new Set(nonterminal.map(r=>futureClass.get(r.key))).size,
    qoDistinctionsEliminableWhileRetainingDescriptor:qoSet.size-pair.size,
    futureClassesFragmentedByDescriptor:fragmented,
    maxDescriptorVariantsWithinOneFutureClass:maxVariants
  };
}
const splitOracleMetrics=['P','XH','XH_P','THRESH','HEIGHT_PARITY_SPECTRUM','SUM_MOD4','E2_MOD4','XH_E2_MOD4','MULTISET'].map(splitOracle);

function permutations(n){const out=[],a=[...Array(n).keys()];function f(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return out;}
const P=permutations(W);
function pMask(m,p){let z=0;for(const b of bits(m)){const row=Math.floor(b/W),col=b%W;z|=1<<(row*W+p[col]);}return z>>>0;}
function pQ(q,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];return {h,r0:q.r0.map(m=>pMask(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>pMask(m,p)).sort((a,b)=>a-b)};}
function orbitKey(q){let best=null;for(const p of P){const k=qkey(pQ(q,p));if(best===null||k<best)best=k;}return best;}
const orbitSet=new Set(),orbitsByX=new Map();
let orbitXInvariantFailures=0;
for(const r of nonterminal){
  const q=qBy.get(r.key),o=orbitKey(q),x=featBy.get(r.key).X_h;orbitSet.add(o);
  let s=orbitsByX.get(x);if(!s){s=new Set();orbitsByX.set(x,s);}s.add(o);
  for(const p of P){
    const px=supportFeatures(pQ(q,p).h).X_h;
    if(px!==x){orbitXInvariantFailures++;break;}
  }
}
assert.equal(orbitXInvariantFailures,0);
const orbitBuckets=[...orbitsByX].map(([x,s])=>({X_h:x,orbitClasses:s.size})).sort((a,b)=>a.X_h-b.X_h);

const finalMover=(N-1)&1;
const result={
  schema:'connect4.isomax.support_xor_parity_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete physical 4x4 connect-4 first-win carrier',
  notation:{
    X_h:'bitwise XOR of integer column heights; named X_h to avoid collision with existing X_feas residual-feasibility operator',
    p:'stone-count parity'
  },
  algebraicFacts:{
    parityIsLowBitOfX:true,
    identity:'p = (sum h_c) mod 2 = X_h mod 2',
    finalBoardMoverAbsolute:finalMover,
    finalBoardMoverSource:'G alone: (W*H-1) mod 2',
    currentMoverFromParity:'current mover = p = X_h mod 2',
    XUpdate:'X_h(next)=X_h xor h_c xor (h_c+1)',
    parityUpdate:'p(next)=p xor 1',
    updateFormulaFailures
  },
  counts:{physicalStates:memo.size,nonterminalStates:nonterminal.length,qoClasses:qoSet.size,futureClasses:nextFuture,qSigmaOrbitClasses:orbitSet.size,residualOccurrences:occurrenceRows.length},
  supportCandidates,
  residualReplacementCandidates:residualCandidates,
  safeForgettingPredictability:ruleAmbiguity,
  recursiveSupportUpdate:transitionAmbiguity,
  futureSplitOracle:splitOracleMetrics,
  transporter:{
    X_hInvariantUnderAllColumnPermutations:true,
    pInvariantUnderAllColumnPermutations:true,
    qSigmaOrbitClasses:orbitSet.size,
    orbitClassesPerX:orbitBuckets,
    maxOrbitClassesSharingOneX:Math.max(...orbitBuckets.map(x=>x.orbitClasses)),
    canonicalRepresentativeConsequence:'X_h is constant over every column orbit, so it cannot choose among permutations inside an orbit; at most it can bucket distinct orbits.'
  },
  interpretationGuard:'Exact finite 4x4 evidence. Solved values are derived only after structural coordinates are frozen. X_h is tested as a discovery lens, not assumed fundamental.'
};
fs.writeFileSync(new URL('./SUPPORT_XOR_PARITY_4X4_0_1.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({
  status:'SUPPORT_XOR_PARITY_4X4_COMPLETE',
  algebraic:result.algebraicFacts,
  support:supportCandidates.map(x=>({id:x.id,classes:x.classes,QF:x.QF,QA:x.QA,QV:x.QV})),
  residual:residualCandidates.map(x=>({id:x.id,classes:x.classes,QF:x.QF,QA:x.QA,QV:x.QV})),
  ambiguous:ruleAmbiguity.map(x=>({feature:x.feature,rule:x.rule,ambiguous:x.ambiguousGroups})),
  split:splitOracleMetrics,
  transporter:result.transporter
},null,2));