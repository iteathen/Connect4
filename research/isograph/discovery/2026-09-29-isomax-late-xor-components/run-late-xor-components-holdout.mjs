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
  function normalize(xs){
    xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
    return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
  }
  function residuals(self,opp){
    const out=[];for(const l of L){if(l&opp)continue;const z=(l&~self)>>>0;if(z)out.push(z);}return normalize(out);
  }

  const states=new Map(),byRank=Array.from({length:N+1},()=>[]);
  function sk(a,b){return a+':'+b;}
  function visit(a,b,h,rank){
    const key=sk(a,b);if(states.has(key))return key;
    const A=won(a),B=won(b);assert.equal(A&&B,false);
    const terminal=A||B||rank===N,rec={key,a,b,h:[...h],rank,terminal,winner:A?0:B?1:null,children:[]};
    states.set(key,rec);byRank[rank].push(rec);if(terminal)return key;
    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);h[c]++;
      const child=(rank&1)?visit(a,b|bit,h,rank+1):visit(a|bit,b,h,rank+1);
      h[c]--;rec.children.push({col:c,key:child});
    }
    return key;
  }
  visit(0,0,new Uint8Array(W),0);

  function qOf(x){return {h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};}
  function qKey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
  function cnt(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,mover=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,mover,p0:mover===0?mm:oo,p1:mover===1?mm:oo};
  }
  function feasible(mask,h,p){
    const c=cnt({h,r0:[],r1:[]}),needs=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
    if(needs.some(x=>x<=0))return false;
    let slot=p===c.mover?1:2;
    for(const need of needs){while(slot<need)slot+=2;if(slot>c.rem)return false;slot+=2;}
    return true;
  }
  function R(q){return {h:q.h,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};}
  function F(q){
    const c=cnt(q),own=c.mover?q.r1:q.r0;let frontier=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const b=1<<(q.h[col]*W+col);if(!own.some(x=>x===b))frontier|=b;
    }
    return c.mover?{h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
  }
  function G(q){
    let caps=0;for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
    if(!caps)return q;
    const nonFinal=1-((N-1)&1);
    return nonFinal?{h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)}:{h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
  }
  const RFG=q=>G(F(R(q)));
  function permutations(n){const out=[],a=[...Array(n).keys()];function rec(i){if(i===n){out.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];rec(i+1);[a[i],a[j]]=[a[j],a[i]];}}rec(0);return out;}
  const pmemo=new Map();function Ps(n){if(!pmemo.has(n))pmemo.set(n,permutations(n));return pmemo.get(n);}
  function resCols(m){return [...new Set(bits(m).map(b=>b%W))].sort((a,b)=>a-b);}

  function canonicalComponent(q,cols){
    const n=cols.length,loc=new Map(cols.map((c,i)=>[c,i])),
      owned=[q.r0,q.r1].map(rs=>rs.filter(m=>resCols(m).every(c=>loc.has(c)))),
      local=owned.map(rs=>rs.map(m=>{
        let z=0;for(const b of bits(m)){const row=Math.floor(b/W),li=loc.get(b%W);z|=1<<(row*n+li);}return z>>>0;
      }).sort((a,b)=>a-b));
    let best=null,roles=Array(n).fill(null);
    for(const p of Ps(n)){
      const h=Array(n);for(let i=0;i<n;i++)h[p[i]]=q.h[cols[i]];
      const rr=local.map(rs=>rs.map(m=>{
        let z=0;for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v),row=Math.floor(b/n),lc=b%n;z|=1<<(row*n+p[lc]);}return z>>>0;
      }).sort((a,b)=>a-b));
      const base=h.join(',')+'|'+rr[0].join('.')+'|'+rr[1].join('.');
      if(best===null||base<best)best=base;
      for(let mark=0;mark<n;mark++){
        const s='m'+p[mark]+'|'+base;if(roles[mark]===null||s<roles[mark])roles[mark]=s;
      }
    }
    return {type:best,width:n,cols:[...cols],roles:new Map(cols.map((c,i)=>[c,roles[i]]))};
  }
  function rep(q){
    const parent=[...Array(W).keys()];
    function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
    function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
    for(const m of [...q.r0,...q.r1]){const cs=resCols(m);for(let i=1;i<cs.length;i++)union(cs[0],cs[i]);}
    const gs=new Map();for(let c=0;c<W;c++){const r=find(c);if(!gs.has(r))gs.set(r,[]);gs.get(r).push(c);}
    const comps=[...gs.values()].map(cols=>canonicalComponent(q,cols)).sort((a,b)=>a.type.localeCompare(b.type));
    const counts=new Map(),roleByColumn=new Map();
    for(const c of comps){counts.set(c.type,(counts.get(c.type)??0)+1);for(const col of c.cols)roleByColumn.set(col,c.roles.get(col));}
    const p=cnt(q).rank&1;
    function modKey(mod){
      return p+'|'+[...counts].map(([t,n])=>[t,n%mod]).filter(([,n])=>n).sort((a,b)=>a[0].localeCompare(b[0])).map(([t,n])=>n+'*'+t).join('||');
    }
    return {
      comps,counts,roleByColumn,p,
      multi:comps.map(c=>c.type).sort().join('||'),
      mod2P:modKey(2),mod3P:modKey(3),mod4P:modKey(4)
    };
  }

  const nts=[...states.values()].filter(x=>!x.terminal),qstar=new Map(),reps=new Map();
  for(const x of nts){const z=RFG(qOf(x));qstar.set(x.key,z);reps.set(x.key,rep(z));}
  const typeWidth=new Map();
  for(const r of reps.values())for(const c of r.comps)typeWidth.set(c.type,c.width);
  const typeIds=new Map([...typeWidth.keys()].sort().map((t,i)=>[t,'T'+String(i).padStart(5,'0')]));
  const keyFns={
    MULTI:r=>r.multi,
    MOD2_P:r=>r.mod2P,
    MOD3_P:r=>r.mod3P,
    MOD4_P:r=>r.mod4P
  };
  const maps=Object.fromEntries(Object.entries(keyFns).map(([id,f])=>[id,new Map(nts.map(x=>[x.key,f(reps.get(x.key))]))]));

  /* Freeze structural keys before deriving values. */
  const values=new Map();
  for(let rank=N;rank>=0;rank--)for(const x of byRank[rank]){
    if(x.terminal){values.set(x.key,x.winner===0?1:x.winner===1?-1:0);continue;}
    const vs=x.children.map(e=>values.get(e.key));
    values.set(x.key,(rank&1)?Math.min(...vs):Math.max(...vs));
  }
  function token(x){return x.winner===0?'P0':x.winner===1?'P1':'D';}
  function role(k,c){return reps.get(k).roleByColumn.get(c);}

  function compactCounts(k){
    return [...reps.get(k).counts].sort((a,b)=>a[0].localeCompare(b[0])).map(([t,n])=>({type:typeIds.get(t),width:typeWidth.get(t),count:n}));
  }
  function evaluate(id){
    const map=maps[id],groups=new Map();
    for(const x of nts){const k=map.get(x.key);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x);}
    let qf=true,qv=true,fFail=null,vFail=null,mixedValueGroups=0,minPairUnits=null,pairExamples=[];
    for(const [k,rows] of groups){
      let fs0=null,v0=null,id0=null;
      const vals=new Set();
      for(const x of rows){
        const fs=[];
        for(const e of x.children){
          const ch=states.get(e.key);
          fs.push(role(x.key,e.col)+'=>'+(ch.terminal?'T:'+token(ch):'N:'+map.get(ch.key)));
        }
        fs.sort();const fSig=fs.join('||'),v=values.get(x.key);vals.add(v);
        if(id0===null){id0=x.key;fs0=fSig;v0=v;continue;}
        if(qf&&fSig!==fs0)qf=false,fFail={key:k,a:id0,b:x.key,aInterface:fs0,bInterface:fSig};
        if(qv&&v!==v0)qv=false,vFail={key:k,a:id0,b:x.key,aValue:v0,bValue:v0===v?v0:v};
      }
      if(vals.size>1){
        mixedValueGroups++;
        const byV=new Map();for(const x of rows)if(!byV.has(values.get(x.key)))byV.set(values.get(x.key),x);
        const xs=[...byV.values()];
        if(xs.length>=2){
          const a=xs[0],b=xs[1],A=reps.get(a.key).counts,B=reps.get(b.key).counts,
            types=new Set([...A.keys(),...B.keys()]),delta=[];
          let l1=0;
          for(const t of types){const d=(B.get(t)??0)-(A.get(t)??0);if(d){if(id==='MOD2_P')assert.equal(Math.abs(d)%2,0,'mod2 collision must differ by even counts');l1+=Math.abs(d);delta.push({type:typeIds.get(t),width:typeWidth.get(t),delta:d});}}
          const pairUnits=l1/2;
          if(minPairUnits===null||pairUnits<minPairUnits)minPairUnits=pairUnits;
          if(pairExamples.length<12)pairExamples.push({key:k,a:a.key,b:b.key,aValue:values.get(a.key),bValue:values.get(b.key),aCounts:compactCounts(a.key),bCounts:compactCounts(b.key),delta,pairUnits});
        }
      }
    }
    return {id,classes:groups.size,QF_component_transport:qf,QV:qv,mixedValueGroups,minPairUnits,firstFutureFailure:fFail,firstValueFailure:vFail,pairExamples};
  }
  const results=['MULTI','MOD2_P','MOD3_P','MOD4_P'].map(evaluate);

  const compHist={},multHist={};let maxComps=0,maxSame=0;
  for(const r of reps.values()){
    const n=r.comps.length;compHist[n]=(compHist[n]??0)+1;maxComps=Math.max(maxComps,n);
    for(const m of r.counts.values()){multHist[m]=(multHist[m]??0)+1;maxSame=Math.max(maxSame,m);}
  }
  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    componentTypes:typeWidth.size,componentHistogram:compHist,
    componentMultiplicityHistogram:multHist,maxComponents:maxComps,maxSameTypeMultiplicity:maxSame,
    results
  };
}

const cases=[
  auditCase(3,3,3),
  auditCase(3,4,3),
  auditCase(4,3,3),
  auditCase(4,4,3),
  auditCase(4,4,4)
];
const byLabel=Object.fromEntries(cases.map(c=>[c.label,c]));
const out={
  schema:'connect4.isomax.late_xor_components_holdout.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-012',
  frozenComponentDefinition:'post-RFG residual-incidence connected components with support/owner-labelled canonical component type',
  cases,
  crossCase:{
    multisetQFAll:cases.every(c=>c.results.find(x=>x.id==='MULTI').QF_component_transport),
    multisetQVAll:cases.every(c=>c.results.find(x=>x.id==='MULTI').QV),
    parityQVAll:cases.every(c=>c.results.find(x=>x.id==='MOD2_P').QV),
    mod3QVAll:cases.every(c=>c.results.find(x=>x.id==='MOD3_P').QV),
    parityFailures:cases.filter(c=>!c.results.find(x=>x.id==='MOD2_P').QV).map(c=>c.label),
    mod3Failures:cases.filter(c=>!c.results.find(x=>x.id==='MOD3_P').QV).map(c=>c.label)
  },
  interpretationGuard:[
    'Component definition was frozen from 4x4-k4 before observing these cross-case component results.',
    'MOD2_P failure rejects self-cancelling XOR only for this component definition and tested case.',
    'Cross-case variation is evidence about when multiplicity becomes load-bearing, not permission to patch the valuation by geometry-specific labels.'
  ]
};
fs.writeFileSync(new URL('./LATE_XOR_COMPONENTS_HOLDOUT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'LATE_XOR_COMPONENTS_HOLDOUT_COMPLETE',crossCase:out.crossCase,cases:cases.map(c=>({label:c.label,states:c.physicalStates,types:c.componentTypes,maxSame:c.maxSameTypeMultiplicity,results:c.results.map(x=>({id:x.id,classes:x.classes,QF:x.QF_component_transport,QV:x.QV,mixed:x.mixedValueGroups,minPairUnits:x.minPairUnits}))}))},null,2));