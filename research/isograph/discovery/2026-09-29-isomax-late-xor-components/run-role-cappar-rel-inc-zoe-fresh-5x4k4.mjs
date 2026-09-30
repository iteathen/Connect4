import fs from 'node:fs';
import assert from 'node:assert/strict';

function auditCase(W,H,K){
  const N=W*H;

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

  const L=winMasks();
  const won=b=>L.some(m=>((b&m)>>>0)===m);

  function bits(m){
    const out=[];
    for(let v=m>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
    return out;
  }

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

  const states=new Map();
  const byRank=Array.from({length:N+1},()=>[]);

  function sk(a,b){return a+':'+b;}

  function visit(a,b,h,rank){
    const key=sk(a,b);
    if(states.has(key))return key;
    const A=won(a),B=won(b);
    assert.equal(A&&B,false);
    const terminal=A||B||rank===N;
    const rec={key,a,b,h:[...h],rank,terminal,winner:A?0:B?1:null,children:[]};
    states.set(key,rec);
    byRank[rank].push(rec);
    if(terminal)return key;

    for(let c=0;c<W;c++)if(h[c]<H){
      const bit=1<<(h[c]*W+c);
      h[c]++;
      const child=(rank&1)?visit(a,b|bit,h,rank+1):visit(a|bit,b,h,rank+1);
      h[c]--;
      rec.children.push({col:c,key:child});
    }
    return key;
  }

  visit(0,0,new Uint8Array(W),0);

  function qOf(x){
    return {h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};
  }

  function cnt(q){
    const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,mover=rank&1;
    const mm=Math.ceil(rem/2),oo=Math.floor(rem/2);
    return {rank,rem,mover,p0:mover===0?mm:oo,p1:mover===1?mm:oo};
  }

  function feasible(mask,h,p){
    const c=cnt({h,r0:[],r1:[]});
    const needs=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);
    if(needs.some(x=>x<=0))return false;
    let slot=p===c.mover?1:2;
    for(const need of needs){
      while(slot<need)slot+=2;
      if(slot>c.rem)return false;
      slot+=2;
    }
    return true;
  }

  function R(q){
    return {h:q.h,r0:q.r0.filter(m=>feasible(m,q.h,0)),r1:q.r1.filter(m=>feasible(m,q.h,1))};
  }

  function F(q){
    const c=cnt(q),own=c.mover?q.r1:q.r0;
    let frontier=0;
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const b=1<<(q.h[col]*W+col);
      if(!own.some(x=>x===b))frontier|=b;
    }
    return c.mover
      ? {h:q.h,r0:q.r0.filter(x=>(x&frontier)!==frontier),r1:q.r1}
      : {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&frontier)!==frontier)};
  }

  function G(q){
    let caps=0;
    for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);
    if(!caps)return q;
    const nonFinal=1-((N-1)&1);
    return nonFinal
      ? {h:q.h,r0:q.r0,r1:q.r1.filter(x=>(x&caps)!==caps)}
      : {h:q.h,r0:q.r0.filter(x=>(x&caps)!==caps),r1:q.r1};
  }

  const RFG=q=>G(F(R(q)));

  function permutations(n){
    const out=[],a=[...Array(n).keys()];
    function rec(i){
      if(i===n){out.push([...a]);return;}
      for(let j=i;j<n;j++){
        [a[i],a[j]]=[a[j],a[i]];
        rec(i+1);
        [a[i],a[j]]=[a[j],a[i]];
      }
    }
    rec(0);
    return out;
  }

  const pmemo=new Map();
  function Ps(n){
    if(!pmemo.has(n))pmemo.set(n,permutations(n));
    return pmemo.get(n);
  }

  function resCols(m){
    return [...new Set(bits(m).map(b=>b%W))].sort((a,b)=>a-b);
  }

  function canonicalComponent(q,cols){
    const n=cols.length;
    const loc=new Map(cols.map((c,i)=>[c,i]));
    const owned=[q.r0,q.r1].map(rs=>rs.filter(m=>resCols(m).every(c=>loc.has(c))));
    const local=owned.map(rs=>rs.map(m=>{
      let z=0;
      for(const b of bits(m)){
        const row=Math.floor(b/W),li=loc.get(b%W);
        z|=1<<(row*n+li);
      }
      return z>>>0;
    }).sort((a,b)=>a-b));

    let best=null;
    const roles=Array(n).fill(null);

    for(const p of Ps(n)){
      const h=Array(n);
      for(let i=0;i<n;i++)h[p[i]]=q.h[cols[i]];
      const rr=local.map(rs=>rs.map(m=>{
        let z=0;
        for(let v=m>>>0;v;v=(v&(v-1))>>>0){
          const b=31-Math.clz32(v&-v),row=Math.floor(b/n),lc=b%n;
          z|=1<<(row*n+p[lc]);
        }
        return z>>>0;
      }).sort((a,b)=>a-b));
      const base=h.join(',')+'|'+rr[0].join('.')+'|'+rr[1].join('.');
      if(best===null||base<best)best=base;
      for(let mark=0;mark<n;mark++){
        const s='m'+p[mark]+'|'+base;
        if(roles[mark]===null||s<roles[mark])roles[mark]=s;
      }
    }

    return {type:best,width:n,cols:[...cols],roles:new Map(cols.map((c,i)=>[c,roles[i]]))};
  }

  function rep(q){
    const parent=[...Array(W).keys()];
    function find(x){
      while(parent[x]!==x){
        parent[x]=parent[parent[x]];
        x=parent[x];
      }
      return x;
    }
    function union(a,b){
      a=find(a);b=find(b);
      if(a!==b)parent[b]=a;
    }

    for(const m of [...q.r0,...q.r1]){
      const cs=resCols(m);
      for(let i=1;i<cs.length;i++)union(cs[0],cs[i]);
    }

    const gs=new Map();
    for(let c=0;c<W;c++){
      const r=find(c);
      if(!gs.has(r))gs.set(r,[]);
      gs.get(r).push(c);
    }

    const comps=[...gs.values()].map(cols=>canonicalComponent(q,cols)).sort((a,b)=>a.type.localeCompare(b.type));
    const counts=new Map(),roleByColumn=new Map();
    for(const c of comps){
      counts.set(c.type,(counts.get(c.type)??0)+1);
      for(const col of c.cols)roleByColumn.set(col,c.roles.get(col));
    }

    const rank=cnt(q).rank,p=rank&1;
    function modKey(mod){
      return [...counts]
        .map(([t,n])=>[t,n%mod])
        .filter(([,n])=>n)
        .sort((a,b)=>a[0].localeCompare(b[0]))
        .map(([t,n])=>n+'*'+t)
        .join('||');
    }

    return {
      comps,counts,roleByColumn,rank,p,
      multi:comps.map(c=>c.type).sort().join('||'),
      mod2:modKey(2)
    };
  }

  const nts=[...states.values()].filter(x=>!x.terminal);

  /*
   * EW-RS-050 resource-preserving realization:
   * T2 is structural and does not depend on component canonicalization.
   * Classify it first, then materialize post-RFG component representations
   * only for T2-O, the frozen algebra domain. This changes no semantic key.
   */
  function immediateWinningColumns(q,player){
    const rs=player?q.r1:q.r0,out=[];
    for(let col=0;col<W;col++)if(q.h[col]<H){
      const bit=1<<(q.h[col]*W+col);
      if(rs.some(x=>x===bit))out.push(col);
    }
    return out;
  }

  function tacticalStatus2(x){
    const q=qOf(x),c=cnt(q),own=immediateWinningColumns(q,c.mover);
    if(own.length>0)return 'W';

    let hasLegal=false;
    for(const e of x.children){
      hasLegal=true;
      const child=states.get(e.key);
      if(child.terminal){
        if(child.winner===null)return 'O';
        if(child.winner===c.mover)return 'W';
        return 'O';
      }
      const cq=qOf(child),cc=cnt(cq);
      if(immediateWinningColumns(cq,cc.mover).length===0)return 'O';
    }
    return hasLegal?'L2':'O';
  }

  const t2=new Map(nts.map(x=>[x.key,tacticalStatus2(x)]));
  const ots=nts.filter(x=>t2.get(x.key)==='O');
  const reps=new Map();

  for(const x of ots){
    const z=RFG(qOf(x));
    reps.set(x.key,rep(z));
  }

  const typeWidth=new Map();
  for(const r of reps.values())for(const c of r.comps)typeWidth.set(c.type,c.width);
  const typeIds=new Map([...typeWidth.keys()].sort().map((t,i)=>[t,'T'+String(i).padStart(5,'0')]));

  const parsedTypeCache=new Map(),roleCapParCache=new Map(),roleCap3Cache=new Map(),roleCapExactCache=new Map();
  function parseCanonicalType(t){
    if(parsedTypeCache.has(t))return parsedTypeCache.get(t);
    const p=t.split('|');
    assert.equal(p.length,3,'canonical component type must have h|r0|r1');
    const h=p[0]===''?[]:p[0].split(',').map(Number);
    const masks=z=>z===''?[]:z.split('.').filter(Boolean).map(Number);
    const out={h,r0:masks(p[1]),r1:masks(p[2]),width:h.length};
    parsedTypeCache.set(t,out);
    return out;
  }
  function roleCapacityRelativeDescriptor(t,mode){
    const cache=mode==='ROLE_CAPPAR_REL_INC_ZOE'
      ? roleCapParCache
      : mode==='ROLE_CAP3_REL_INC_ZOE'
        ? roleCap3Cache
        : roleCapExactCache;
    if(cache.has(t))return cache.get(t);
    const z=parseCanonicalType(t),h=z.h,n=z.width;
    function label(cap){
      if(mode==='ROLE_CAPPAR_REL_INC_ZOE')return String(cap&1);
      if(mode==='ROLE_CAP3_REL_INC_ZOE')return cap===0?'Z':((cap&1)?'O':'E');
      if(mode==='ROLE_CAP_EXACT_REL_INC_ZOE')return String(cap);
      throw new Error('unknown role capacity mode '+mode);
    }
    let best=null;
    for(const p of Ps(n)){
      const caps=Array(n);
      for(let col=0;col<n;col++)caps[p[col]]=label(H-h[col]);
      function encodeOwner(rs){
        return rs.map(mask=>{
          const cells=[];
          for(let v=mask>>>0;v;v=(v&(v-1))>>>0){
            const low=(v&-v)>>>0;
            const bit=31-Math.clz32(low);
            const row=Math.floor(bit/n),col=bit%n,d=row-h[col];
            assert.ok(d>=0,'residual cell must not lie below frontier');
            cells.push(d+':'+p[col]);
          }
          cells.sort();
          return cells.join(',');
        }).sort().join(';');
      }
      const key='w'+n+'|cap='+caps.join('.')+'|r0='+encodeOwner(z.r0)+'|r1='+encodeOwner(z.r1);
      if(best===null||key<best)best=key;
    }
    cache.set(t,best);
    return best;
  }
  function aggregatedCounts(r,mode){
    if(mode==='EXACT_ZOE'||mode==='MULTI')return r.counts;
    const out=new Map();
    for(const [t,n] of r.counts){
      const d=roleCapacityRelativeDescriptor(t,mode);
      out.set(d,(out.get(d)??0)+n);
    }
    return out;
  }


  /* Freeze all structural keys before deriving exact values. */
  const values=new Map();
  for(let rank=N;rank>=0;rank--)for(const x of byRank[rank]){
    if(x.terminal){
      values.set(x.key,x.winner===0?1:x.winner===1?-1:0);
      continue;
    }
    const vs=x.children.map(e=>values.get(e.key));
    values.set(x.key,(rank&1)?Math.min(...vs):Math.max(...vs));
  }

  function relativeOutcomeCode(x){
    const v=values.get(x.key);
    const u=(x.rank&1)?-v:v;
    return u<0?0:u===0?1:2;
  }

  function outcomeName(code){
    return code===0?'loss':code===1?'draw':'win';
  }
  function xorSorted(a,b){
    const out=[];
    let i=0,j=0;
    while(i<a.length||j<b.length){
      if(i>=a.length){out.push(...b.slice(j));break;}
      if(j>=b.length){out.push(...a.slice(i));break;}
      if(a[i]===b[j]){i++;j++;continue;}
      if(a[i]<b[j])out.push(a[i++]);
      else out.push(b[j++]);
    }
    return out;
  }

  function degree1Audit(){
    const variableKeys=new Set();
    let equations=0;
    for(const x of ots){
      equations++;
      variableKeys.add('B|'+x.rank);
      for(const [t,n] of reps.get(x.key).counts){
        if((n&1)!==0)variableKeys.add('L|'+x.rank+'|'+typeIds.get(t));
      }
    }

    const ordered=[...variableKeys].sort();
    const index=new Map(ordered.map((k,i)=>[k,i]));
    const pivots=new Map();
    let contradictions=0,firstContradiction=null;

    for(const x of ots){
      const keys=['B|'+x.rank];
      const oddTypes=[];
      for(const [t,n] of reps.get(x.key).counts){
        if((n&1)===0)continue;
        const id=typeIds.get(t);
        keys.push('L|'+x.rank+'|'+id);
        oddTypes.push(id);
      }
      keys.sort();
      let row=keys.map(k=>index.get(k)).sort((a,b)=>a-b);
      let rhs=relativeOutcomeCode(x);
      while(row.length){
        const p=row[row.length-1],prior=pivots.get(p);
        if(!prior){pivots.set(p,{row,rhs});break;}
        row=xorSorted(row,prior.row);
        rhs^=prior.rhs;
      }
      if(row.length===0&&rhs!==0){
        contradictions++;
        if(firstContradiction===null){
          firstContradiction={
            key:x.key,rank:x.rank,h:[...x.h],oddTypes:oddTypes.sort(),
            relativeOutcome:outcomeName(relativeOutcomeCode(x)),
            code:relativeOutcomeCode(x),reducedRhs:rhs
          };
        }
      }
    }

    return {
      model:'exact-rank affine GF(2)^2 over exact component multiplicity parity',
      equations,
      activeVariables:ordered.length,
      pivotRank:pivots.size,
      activeNullity:ordered.length-pivots.size,
      contradictions,
      firstContradiction,
      codeGauge:{loss:'00',draw:'01',win:'10'}
    };
  }


  function signatureFor(x,mode){
    const r=reps.get(x.key),counts=aggregatedCounts(r,mode);
    const entries=[];
    for(const [id,n] of counts){
      if(mode==='MULTI'){
        const label=typeIds.get(id);
        entries.push(JSON.stringify([label,n]));
      }else{
        const state=(n&1)?'O':'E';
        const label=mode==='EXACT_ZOE'?typeIds.get(id):id;
        entries.push(JSON.stringify([label,state]));
      }
    }
    entries.sort();
    return entries.join('||');
  }

  function compactCounts(x){
    return [...reps.get(x.key).counts]
      .sort((a,b)=>typeIds.get(a[0]).localeCompare(typeIds.get(b[0])))
      .map(([t,n])=>({type:typeIds.get(t),canonicalType:t,width:typeWidth.get(t),count:n}));
  }

  function witness(a,b,mode,key){
    const A=reps.get(a.key).counts,B=reps.get(b.key).counts;
    const types=[...new Set([...A.keys(),...B.keys()])].sort((x,y)=>typeIds.get(x).localeCompare(typeIds.get(y)));
    const delta=[];
    let l1=0;
    for(const t of types){
      const d=(B.get(t)??0)-(A.get(t)??0);
      if(d!==0){
        l1+=Math.abs(d);
        delta.push({type:typeIds.get(t),canonicalType:t,width:typeWidth.get(t),delta:d});
      }
    }
    return {
      mode,key,rank:a.rank,
      a:a.key,b:b.key,
      aOutcome:outcomeName(relativeOutcomeCode(a)),
      bOutcome:outcomeName(relativeOutcomeCode(b)),
      aCode:relativeOutcomeCode(a),
      bCode:relativeOutcomeCode(b),
      multiplicityDifferenceL1:l1,
      parityPairUnits:mode==='M2'?l1/2:null,
      aCounts:compactCounts(a),
      bCounts:compactCounts(b),
      delta
    };
  }

  function auditMode(mode){
    const seen=new Map(),mixed=new Set();
    let statesAudited=0,firstMixed=null,minimumWitness=null;

    for(const x of ots){
      statesAudited++;
      const key=signatureFor(x,mode);
      const code=relativeOutcomeCode(x);
      const prior=seen.get(key);
      if(!prior){
        seen.set(key,{key:x.key,code});
        continue;
      }
      if(prior.code===code)continue;

      mixed.add(key);
      const a=states.get(prior.key);
      const w=witness(a,x,mode,key);
      if(firstMixed===null)firstMixed=w;
      if(minimumWitness===null||
         w.multiplicityDifferenceL1<minimumWitness.multiplicityDifferenceL1||
         (w.multiplicityDifferenceL1===minimumWitness.multiplicityDifferenceL1&&String(w.key)<String(minimumWitness.key))){
        minimumWitness=w;
      }
    }

    const result={
      mode,
      statesAudited,
      classes:seen.size,
      mixedValueClasses:mixed.size,
      QV:mixed.size===0,
      firstMixedValueWitness:firstMixed,
      minimumMultiplicityDifferenceWitness:minimumWitness
    };
    seen.clear();
    mixed.clear();
    return result;
  }

  const modes=['EXACT_ZOE','ROLE_CAPPAR_REL_INC_ZOE','ROLE_CAP3_REL_INC_ZOE','ROLE_CAP_EXACT_REL_INC_ZOE','MULTI'];
  const audits=modes.map(auditMode);

  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    componentTypes:typeWidth.size,
    tactical2Counts:Object.fromEntries(['W','L2','O'].map(t=>[t,[...t2.values()].filter(x=>x===t).length])),
    degree1:degree1Audit(),
    audits
  };
}

const caseResult=auditCase(5,4,4);
const byMode=Object.fromEntries(caseResult.audits.map(x=>[x.mode,x]));

assert.equal(byMode.MULTI.QV,true,'full multiplicity control must remain Q-V exact');
assert.equal(byMode.EXACT_ZOE.QV,true,'exact-type ZOE control must remain Q-V exact');
assert.equal(byMode.ROLE_CAP_EXACT_REL_INC_ZOE.QV,true,'exact role-aligned capacity reconstruction control must remain Q-V exact');
assert.equal(byMode.ROLE_CAP_EXACT_REL_INC_ZOE.classes,byMode.EXACT_ZOE.classes,'exact role-aligned capacity partition must match exact-type ZOE on this holdout');

const out={
  schema:'connect4.isomax.role_cappar_rel_inc_zoe_transfer_5x4k4.v1',
  date_author_local:'2026-09-30',
  warrant:'EW-RS-055',
  target:'5x4-k4',
  frozenCandidate:'ROLE_CAPPAR_REL_INC_ZOE = jointly canonicalized REL_INC with per-column remaining-capacity parity attached to each local incidence role, followed by ZOE count aggregation',
  frozenDomain:'direct T2-O',
  frozenComponentDefinition:'post-RFG residual-incidence connected components with support/owner-labelled canonical component type',
  case:{
    label:caseResult.label,width:caseResult.width,height:caseResult.height,k:caseResult.k,
    physicalStates:caseResult.physicalStates,
    nonterminalStates:caseResult.nonterminalStates,
    componentTypes:caseResult.componentTypes,
    tactical2Counts:caseResult.tactical2Counts,
    degree1:caseResult.degree1,
    audits:caseResult.audits
  },
  mechanicalChecks:{
    outcomeBlindFresh:false,
    heldOutFromDescriptorDerivation:true,
    candidateFrozenFromEWRS054:true,
    keysOutcomeIndependent:true,
    roleCapacityJointlyCanonicalized:true,
    noRankGrade:true,
    T2ORetained:true,
    exactZoeControlExact:byMode.EXACT_ZOE.QV,
    exactRoleCapacityControlExact:byMode.ROLE_CAP_EXACT_REL_INC_ZOE.QV,
    exactRoleCapacityPartitionMatchesExactZoe:byMode.ROLE_CAP_EXACT_REL_INC_ZOE.classes===byMode.EXACT_ZOE.classes,
    fullMultiplicityControlExact:byMode.MULTI.QV,
    degree1ModelMechanicallyGenerated:true,
    componentRepresentationsMaterializedOnlyForT2O:true
  },
  disposition:{
    EXACT_ZOE_QV:byMode.EXACT_ZOE.QV,
    ROLE_CAPPAR_REL_INC_ZOE_QV:byMode.ROLE_CAPPAR_REL_INC_ZOE.QV,
    ROLE_CAP3_REL_INC_ZOE_QV:byMode.ROLE_CAP3_REL_INC_ZOE.QV,
    ROLE_CAP_EXACT_REL_INC_ZOE_QV:byMode.ROLE_CAP_EXACT_REL_INC_ZOE.QV,
    MULTI_QV:byMode.MULTI.QV,
    exactZoeClasses:byMode.EXACT_ZOE.classes,
    roleCapparClasses:byMode.ROLE_CAPPAR_REL_INC_ZOE.classes,
    roleCap3Classes:byMode.ROLE_CAP3_REL_INC_ZOE.classes,
    roleCapExactClasses:byMode.ROLE_CAP_EXACT_REL_INC_ZOE.classes,
    multiClasses:byMode.MULTI.classes,
    degree1Contradictions:caseResult.degree1.contradictions,
    nonAffineTransferCarrier:caseResult.degree1.contradictions>0,
    roleCapparNonAffineTransferSuccess:byMode.ROLE_CAPPAR_REL_INC_ZOE.QV&&caseResult.degree1.contradictions>0
  },
  interpretationGuard:[
    'ROLE_CAPPAR_REL_INC_ZOE was frozen before this transfer under EW-RS-054 and selected by the predeclared coarsest-passing rule.',
    '5x4-k4 was held out from descriptor derivation but its solved outcomes were already observed under EW-RS-050, so this is not outcome-blind fresh evidence.',
    'Passing establishes bounded non-affine Q-V transfer evidence only and does not prove minimality.',
    'No Q-A/Q-F or standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./ROLE_CAPPAR_REL_INC_ZOE_TRANSFER_5X4K4_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'ROLE_CAPPAR_REL_INC_ZOE_TRANSFER_5X4K4_COMPLETE',
  target:out.target,
  physicalStates:out.case.physicalStates,
  tactical2O:out.case.tactical2Counts.O,
  degree1Contradictions:out.case.degree1.contradictions,
  audits:out.case.audits.map(x=>({mode:x.mode,classes:x.classes,mixedValueClasses:x.mixedValueClasses,QV:x.QV})),
  disposition:out.disposition
},null,2));
