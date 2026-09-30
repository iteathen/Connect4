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
assert.equal(L.length,10);

function bits(m){
  const out=[];
  for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
  return out;
}
function popcount(m){return bits(m).length;}
function normalize(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
}
function residuals(self,opp){
  const out=[];
  for(const line of L){
    if(line&opp)continue;
    const r=(line&~self)>>>0;
    if(r)out.push(r);
  }
  return normalize(out);
}

const states=new Map(),byRank=Array.from({length:N+1},()=>[]);
function stateKey(a,b){return a+':'+b;}
function visit(a,b,h,rank){
  const key=stateKey(a,b);
  if(states.has(key))return key;
  const w0=won(a),w1=won(b);assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N;
  const rec={key,a,b,h:[...h],rank,terminal,winner:w0?0:w1?1:null,children:[]};
  states.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(h[c]<H){
    const bit=1<<(h[c]*W+c);h[c]++;
    const child=(rank&1)?visit(a,b|bit,h,rank+1):visit(a|bit,b,h,rank+1);
    h[c]--;rec.children.push({col:c,key:child});
  }
  return key;
}
visit(0,0,new Uint8Array(W),0);
assert.equal(states.size,161029);

function qOf(rec){return {h:[...rec.h],r0:residuals(rec.a,rec.b),r1:residuals(rec.b,rec.a)};}
function qKey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
function counts(q){
  const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,mover=rank&1,
    mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
  return {rank,rem,mover,p0:mover===0?mm:oo,p1:mover===1?mm:oo};
}
function feasible(mask,h,player){
  const c=counts({h,r0:[],r1:[]}),
    needs=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
  if(needs.some(x=>x<=0))return false;
  let slot=player===c.mover?1:2;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>c.rem)return false;
    slot+=2;
  }
  return true;
}
function R(q){return {h:q.h,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};}
function F(q){
  const c=counts(q),own=c.mover?q.r1:q.r0;let frontier=0;
  for(let col=0;col<W;col++)if(q.h[col]<H){
    const bit=1<<(q.h[col]*W+col);
    if(!own.some(x=>x===bit))frontier|=bit;
  }
  return c.mover?
    {h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}:
    {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
}
function G(q){
  let caps=0;
  for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
  if(!caps)return q;
  const finalPlayer=(N-1)&1,nonFinal=1-finalPlayer;
  return nonFinal?
    {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)}:
    {h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
}
function RFG(q){return G(F(R(q)));}

function permutations(n){
  const out=[],a=[...Array(n).keys()];
  function rec(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){
      [a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];
    }
  }
  rec(0);return out;
}
const permsByN=new Map();
function P(n){if(!permsByN.has(n))permsByN.set(n,permutations(n));return permsByN.get(n);}
const fullP=P(W);

function permMaskGlobal(m,p){
  let out=0;
  for(const b of bits(m)){
    const row=Math.floor(b/W),col=b%W;
    out|=1<<(row*W+p[col]);
  }
  return out>>>0;
}
function permQ(q,p){
  const h=Array(W);
  for(let c=0;c<W;c++)h[p[c]]=q.h[c];
  return {h,r0:q.r0.map(m=>permMaskGlobal(m,p)).sort((a,b)=>a-b),r1:q.r1.map(m=>permMaskGlobal(m,p)).sort((a,b)=>a-b)};
}
function orbitKey(q){
  let best=null;
  for(const p of fullP){
    const k=qKey(permQ(q,p));
    if(best===null||k<best)best=k;
  }
  return best;
}

function residualColumns(mask){
  return [...new Set(bits(mask).map(b=>b%W))].sort((a,b)=>a-b);
}
function componentize(q){
  const parent=[...Array(W).keys()];
  function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
  for(const m of [...q.r0,...q.r1]){
    const cs=residualColumns(m);
    for(let i=1;i<cs.length;i++)union(cs[0],cs[i]);
  }
  const groups=new Map();
  for(let c=0;c<W;c++){
    const r=find(c);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(c);
  }
  const comps=[...groups.values()].map(cols=>canonicalComponent(q,cols));
  comps.sort((a,b)=>a.type.localeCompare(b.type));
  return comps;
}
function canonicalComponent(q,cols){
  const n=cols.length,loc=new Map(cols.map((c,i)=>[c,i]));
  const owned=[q.r0,q.r1].map(rs=>rs.filter(m=>residualColumns(m).every(c=>loc.has(c))));
  const localMasks=owned.map(rs=>rs.map(m=>{
    let z=0;
    for(const b of bits(m)){
      const row=Math.floor(b/W),gc=b%W,li=loc.get(gc);
      assert.notEqual(li,undefined);
      z|=1<<(row*n+li);
    }
    return z>>>0;
  }).sort((a,b)=>a-b));
  let best=null,roleBest=Array(n).fill(null);
  for(const p of P(n)){
    const h=Array(n);
    for(let i=0;i<n;i++)h[p[i]]=q.h[cols[i]];
    const rsets=localMasks.map(rs=>rs.map(m=>{
      let z=0;
      for(const b of bitsLocal(m,n)){
        const row=Math.floor(b/n),lc=b%n;
        z|=1<<(row*n+p[lc]);
      }
      return z>>>0;
    }).sort((a,b)=>a-b));
    const base=h.join(',')+'|'+rsets[0].join('.')+'|'+rsets[1].join('.');
    if(best===null||base<best)best=base;
    for(let marked=0;marked<n;marked++){
      const mk='m'+p[marked]+'|'+base;
      if(roleBest[marked]===null||mk<roleBest[marked])roleBest[marked]=mk;
    }
  }
  const roles=new Map(cols.map((c,i)=>[c,roleBest[i]]));
  return {cols:[...cols],type:best,roles};
}
function bitsLocal(m,n){
  const out=[];
  for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
  return out;
}
function componentRepresentation(q){
  const comps=componentize(q),types=comps.map(c=>c.type).sort(),count=new Map();
  for(const t of types)count.set(t,(count.get(t)??0)+1);
  const parityTypes=[...count].filter(([,n])=>n&1).map(([t])=>t).sort();
  const mod4=[...count].map(([t,n])=>[t,n&3]).filter(([,n])=>n!==0).sort((a,b)=>a[0].localeCompare(b[0]));
  const p=counts(q).rank&1;
  const roleByColumn=new Map();
  for(const c of comps)for(const col of c.cols)roleByColumn.set(col,c.roles.get(col));
  return {
    comps,types,count,roleByColumn,p,
    multi:types.join('||'),
    multiP:p+'|'+types.join('||'),
    mod4P:p+'|'+mod4.map(([t,n])=>n+'*'+t).join('||'),
    parityP:p+'|'+parityTypes.join('||'),
    parity:parityTypes.join('||')
  };
}

const nts=[...states.values()].filter(x=>!x.terminal);
const qMap=new Map(),qStarMap=new Map(),repMap=new Map(),orbitMap=new Map();
for(const x of nts){
  const q=qOf(x),qs=RFG(q),rep=componentRepresentation(qs);
  qMap.set(x.key,q);qStarMap.set(x.key,qs);repMap.set(x.key,rep);orbitMap.set(x.key,orbitKey(qs));
}

/* Candidate structural keys are now frozen. Exact values are derived only below. */
const values=new Map(),actionValues=new Map();
for(let rank=N;rank>=0;rank--)for(const x of byRank[rank]){
  if(x.terminal){values.set(x.key,x.winner===0?1:x.winner===1?-1:0);continue;}
  const av=Array(W).fill('I');
  for(const e of x.children)av[e.col]=values.get(e.key);
  actionValues.set(x.key,av);
  const vs=x.children.map(e=>values.get(e.key));
  values.set(x.key,(rank&1)?Math.min(...vs):Math.max(...vs));
}
function token(x){return x.winner===0?'P0':x.winner===1?'P1':'D';}

const candidates=[
  {id:'C_MULTI',key:r=>r.multi},
  {id:'C_MULTI_P',key:r=>r.multiP},
  {id:'C_MOD4_P',key:r=>r.mod4P},
  {id:'C_PARITY_P',key:r=>r.parityP},
  {id:'C_PARITY',key:r=>r.parity}
];
const maps=new Map(candidates.map(c=>[c.id,new Map(nts.map(x=>[x.key,c.key(repMap.get(x.key))]))]));

function actionRole(stateKey,col){
  const r=repMap.get(stateKey);
  return r.roleByColumn.get(col);
}
function evalCandidate(c){
  const map=maps.get(c.id),groups=new Map();
  for(const x of nts){
    const k=map.get(x.key);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x);
  }
  let qf=true,qa=true,qv=true,fFail=null,aFail=null,vFail=null;
  for(const [k,rows] of groups){
    let fs0=null,as0=null,v0=null,id0=null;
    for(const x of rows){
      const fs=[],as=[];
      for(const e of x.children){
        const child=states.get(e.key),role=actionRole(x.key,e.col);
        fs.push(role+'=>'+(child.terminal?'T:'+token(child):'N:'+map.get(child.key)));
        as.push(role+'=>'+values.get(child.key));
      }
      fs.sort();as.sort();
      const fSig=fs.join('||'),aSig=as.join('||'),v=values.get(x.key);
      if(id0===null){id0=x.key;fs0=fSig;as0=aSig;v0=v;continue;}
      if(qf&&fSig!==fs0){qf=false;fFail={key:k,a:id0,b:x.key,aInterface:fs0,bInterface:fSig};}
      if(qa&&aSig!==as0){qa=false;aFail={key:k,a:id0,b:x.key,aActionSignature:as0,bActionSignature:aSig};}
      if(qv&&v!==v0){qv=false;vFail={key:k,a:id0,b:x.key,aValue:v0,bValue:v};}
    }
  }
  return {id:c.id,classes:groups.size,QF_component_transport:qf,QA_component_transport:qa,QV:qv,firstFutureFailure:fFail,firstActionFailure:aFail,firstValueFailure:vFail};
}
const results=candidates.map(evalCandidate);

const componentHistogram={},typeSet=new Set();
let multiComponentStates=0,maxComponents=0;
for(const x of nts){
  const r=repMap.get(x.key),n=r.comps.length;
  componentHistogram[n]=(componentHistogram[n]??0)+1;
  if(n>1)multiComponentStates++;
  maxComponents=Math.max(maxComponents,n);
  for(const t of r.types)typeSet.add(t);
}
const qStarClasses=new Set([...qStarMap.values()].map(qKey)).size,
  qSigmaRFGClasses=new Set(orbitMap.values()).size;
assert.equal(qStarClasses,30046);
assert.equal(qSigmaRFGClasses,9308);

const byId=Object.fromEntries(results.map(x=>[x.id,x]));
let xorDisposition;
if(!byId.C_MULTI.QV)xorDisposition='COMPONENT_DECOMPOSITION_INSUFFICIENT_FOR_QV';
else if(!byId.C_PARITY_P.QV)xorDisposition='XOR_REJECTED_FOR_THIS_FIXED_COMPONENT_DEFINITION_QV';
else xorDisposition='XOR_EXISTENCE_SUPPORTED_FOR_THIS_FIXED_COMPONENT_DEFINITION_QV';

const out={
  schema:'connect4.isomax.late_xor_components_4x4.v1',
  date_author_local:'2026-09-29',
  scope:'complete physical 4x4 connect-4 first-win carrier after exact bounded R/F/G reduction',
  pipeline:'physical P -> q_o -> RFG -> residual-incidence connected components -> component valuation/composition candidate',
  componentDefinition:{
    vertices:'columns with support-height labels',
    hyperedges:'surviving owner-labelled RFG residuals',
    components:'connected components of the residual-incidence hypergraph, isolated columns included',
    type:'component support + owned residuals canonicalized under all internal column permutations',
    currentRankOnly:true,
    solvedValueUsed:false,
    futureClassUsed:false
  },
  universalXorLogic:'For this fixed component definition, any XOR valuation into an exponent-2 Abelian group depends only on component-type multiplicity parity. C_PARITY_P is therefore the finest universal collision test for all such valuations.',
  controls:{
    physicalStates:states.size,
    nonterminalStates:nts.length,
    qStarDirectClasses:qStarClasses,
    qSigmaRFGClasses,
    componentTypes:typeSet.size,
    componentHistogram,
    multiComponentStates,
    maxComponents
  },
  candidates:results,
  disposition:{
    componentMultisetQF:byId.C_MULTI.QF_component_transport,
    componentMultisetQA:byId.C_MULTI.QA_component_transport,
    componentMultisetQV:byId.C_MULTI.QV,
    componentParityQF:byId.C_PARITY_P.QF_component_transport,
    componentParityQA:byId.C_PARITY_P.QA_component_transport,
    componentParityQV:byId.C_PARITY_P.QV,
    componentMod4QF:byId.C_MOD4_P.QF_component_transport,
    componentMod4QA:byId.C_MOD4_P.QA_component_transport,
    componentMod4QV:byId.C_MOD4_P.QV,
    xorForFixedComponentsQV:xorDisposition
  },
  interpretationGuard:[
    'Failure of C_PARITY_P rejects XOR only for this frozen post-RFG component definition.',
    'Failure of C_MULTI rejects this component decomposition itself for the failed semantic target.',
    'Success of C_PARITY_P proves only existence of a nonminimal XOR realization via one-hot component basis; valuation minimization remains open.',
    'No standard-7x6 theorem follows from this bounded audit.'
  ]
};
fs.writeFileSync(new URL('./LATE_XOR_COMPONENTS_4X4_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'LATE_XOR_COMPONENTS_4X4_COMPLETE',controls:out.controls,candidates:results.map(x=>({id:x.id,classes:x.classes,QF:x.QF_component_transport,QA:x.QA_component_transport,QV:x.QV})),disposition:out.disposition},null,2));