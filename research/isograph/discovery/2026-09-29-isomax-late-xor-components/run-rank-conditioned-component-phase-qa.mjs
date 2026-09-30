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
  const reps=new Map();

  for(const x of nts){
    const z=RFG(qOf(x));
    reps.set(x.key,rep(z));
  }

  const typeWidth=new Map();
  for(const r of reps.values())for(const c of r.comps)typeWidth.set(c.type,c.width);
  const typeIds=new Map([...typeWidth.keys()].sort().map((t,i)=>[t,'T'+String(i).padStart(5,'0')]));

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

  const maps={
    MULTI:new Map(nts.map(x=>[x.key,reps.get(x.key).multi])),
    MOD2_P:new Map(nts.map(x=>[
      x.key,
      reps.get(x.key).p+'|'+reps.get(x.key).mod2
    ])),
    MOD2_P_TACTICAL2:new Map(nts.map(x=>[
      x.key,
      reps.get(x.key).p+'|'+reps.get(x.key).mod2+'|T2'+t2.get(x.key)
    ])),
    MOD2_RANK:new Map(nts.map(x=>[
      x.key,
      reps.get(x.key).rank+'|'+reps.get(x.key).mod2
    ])),
    MOD2_RANK_TACTICAL2:new Map(nts.map(x=>[
      x.key,
      reps.get(x.key).rank+'|'+reps.get(x.key).mod2+'|T2'+t2.get(x.key)
    ])),
    MOD2_R3_TACTICAL2:new Map(nts.map(x=>[
      x.key,
      reps.get(x.key).p+'|R3'+(reps.get(x.key).rank%3)+'|'+reps.get(x.key).mod2+'|T2'+t2.get(x.key)
    ])),
    MOD2_R4_TACTICAL2:new Map(nts.map(x=>[
      x.key,
      'R4'+(reps.get(x.key).rank%4)+'|'+reps.get(x.key).mod2+'|T2'+t2.get(x.key)
    ]))
  };

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

  function token(x){return x.winner===0?'P0':x.winner===1?'P1':'D';}
  function role(k,c){return reps.get(k).roleByColumn.get(c);}

  function compactCounts(k){
    return [...reps.get(k).counts]
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([t,n])=>({type:typeIds.get(t),canonicalType:t,width:typeWidth.get(t),count:n}));
  }

  function evaluate(id){
    const map=maps[id],groups=new Map();
    for(const x of nts){
      const k=map.get(x.key);
      if(!groups.has(k))groups.set(k,[]);
      groups.get(k).push(x);
    }

    let qf=true,qa=true,qv=true,fFail=null,aFail=null,vFail=null,mixedValueGroups=0,mixedActionGroups=0,sameExactRankMixedValueGroups=0;
    let minPairUnits=null;
    const pairExamples=[],rankProfiles=[];

    for(const [k,rows] of groups){
      let fs0=null,as0=null,v0=null,id0=null;
      const vals=new Set(),actionSigs=new Set();
      const byRankValue=new Map();

      for(const x of rows){
        const fs=[];
        for(const e of x.children){
          const ch=states.get(e.key);
          fs.push(role(x.key,e.col)+'=>'+(ch.terminal?'T:'+token(ch):'N:'+map.get(ch.key)));
        }
        fs.sort();
        const fSig=fs.join('||'),v=values.get(x.key);
        const aSig=x.children.map(e=>role(x.key,e.col)+'=>'+values.get(e.key)).sort().join('||');
        vals.add(v);actionSigs.add(aSig);
        if(!byRankValue.has(x.rank))byRankValue.set(x.rank,new Set());
        byRankValue.get(x.rank).add(v);

        if(id0===null){id0=x.key;fs0=fSig;as0=aSig;v0=v;continue;}
        if(qf&&fSig!==fs0)qf=false,fFail={key:k,a:id0,b:x.key,aInterface:fs0,bInterface:fSig};
        if(qa&&aSig!==as0)qa=false,aFail={key:k,a:id0,b:x.key,aActionSignature:as0,bActionSignature:aSig};
        if(qv&&v!==v0)qv=false,vFail={key:k,a:id0,b:x.key,aValue:v0,bValue:v};
      }

      if([...byRankValue.values()].some(s=>s.size>1))sameExactRankMixedValueGroups++;
      if(actionSigs.size>1)mixedActionGroups++;

      if(vals.size>1){
        mixedValueGroups++;
        if(rankProfiles.length<12){
          rankProfiles.push({
            key:k,
            ranks:[...byRankValue.entries()].map(([rank,vs])=>({rank,values:[...vs].sort()})).sort((a,b)=>a.rank-b.rank)
          });
        }

        const byV=new Map();
        for(const x of rows)if(!byV.has(values.get(x.key)))byV.set(values.get(x.key),x);
        const xs=[...byV.values()];

        if(xs.length>=2){
          const a=xs[0],b=xs[1],A=reps.get(a.key).counts,B=reps.get(b.key).counts;
          const types=new Set([...A.keys(),...B.keys()]),delta=[];
          let l1=0;
          for(const t of types){
            const d=(B.get(t)??0)-(A.get(t)??0);
            if(d){
              if(id.startsWith('MOD2'))assert.equal(Math.abs(d)%2,0,'mod2 collision must differ by even counts');
              l1+=Math.abs(d);
              delta.push({type:typeIds.get(t),canonicalType:t,width:typeWidth.get(t),delta:d});
            }
          }
          const pairUnits=l1/2;
          if(minPairUnits===null||pairUnits<minPairUnits)minPairUnits=pairUnits;
          if(pairExamples.length<12){
            pairExamples.push({
              key:k,
              a:a.key,b:b.key,
              aRank:a.rank,bRank:b.rank,rankDelta:b.rank-a.rank,
              sameExactRank:a.rank===b.rank,
              aValue:values.get(a.key),bValue:values.get(b.key),
              aCounts:compactCounts(a.key),bCounts:compactCounts(b.key),
              delta,pairUnits
            });
          }
        }
      }
    }

    return {
      id,classes:groups.size,
      QF_component_transport:qf,QA_component_transport:qa,QV:qv,
      mixedValueGroups,mixedActionGroups,sameExactRankMixedValueGroups,
      minPairUnits,firstFutureFailure:fFail,firstActionFailure:aFail,firstValueFailure:vFail,
      rankProfiles,pairExamples
    };
  }

  const ids=[
    'MULTI',
    'MOD2_P',
    'MOD2_P_TACTICAL2',
    'MOD2_RANK',
    'MOD2_RANK_TACTICAL2',
    'MOD2_R3_TACTICAL2',
    'MOD2_R4_TACTICAL2'
  ];
  const results=ids.map(evaluate);

  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    componentTypes:typeWidth.size,
    tactical2Counts:Object.fromEntries(['W','L2','O'].map(t=>[t,[...t2.values()].filter(x=>x===t).length])),
    results
  };
}

const derivationSpecs=[
  [3,3,3],
  [3,4,3],
  [4,3,3],
  [4,4,4],
  [4,4,3],
  [3,5,3],
  [5,3,3]
];

const freshSpecs=[
  [3,6,3]
];

const derivationCases=derivationSpecs.map(x=>auditCase(...x));
const freshCases=freshSpecs.map(x=>auditCase(...x));
const all=[...derivationCases,...freshCases];

function row(c,id){return c.results.find(x=>x.id===id);}

const out={
  schema:'connect4.isomax.rank_conditioned_component_phase_qa.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-024',
  frozenComponentDefinition:'post-RFG residual-incidence connected components with support/owner-labelled canonical component type',
  frozenTacticalReduction:'T2 = W immediate win; L2 universal one-move release loss; O unresolved; direct current-rank equivalence independently established by EW-RS-022',
  derivationCases,
  freshCases,
  crossCase:{
    exactRankT2QAAll:all.every(c=>row(c,'MOD2_RANK_TACTICAL2').QA_component_transport),
    rankMod3T2QAAll:all.every(c=>row(c,'MOD2_R3_TACTICAL2').QA_component_transport),
    baselineT2QAAll:all.every(c=>row(c,'MOD2_P_TACTICAL2').QA_component_transport),
    exactRankT2QVAll:all.every(c=>row(c,'MOD2_RANK_TACTICAL2').QV),
    rankMod3T2QVAll:all.every(c=>row(c,'MOD2_R3_TACTICAL2').QV),
    rankMod4T2QVAll:all.every(c=>row(c,'MOD2_R4_TACTICAL2').QV),
    exactRankNoT2QVAll:all.every(c=>row(c,'MOD2_RANK').QV),
    baselineT2SameExactRankMixedAllZero:all.every(c=>row(c,'MOD2_P_TACTICAL2').sameExactRankMixedValueGroups===0),
    baselineT2Failures:all.filter(c=>!row(c,'MOD2_P_TACTICAL2').QV).map(c=>c.label),
    exactRankT2Failures:all.filter(c=>!row(c,'MOD2_RANK_TACTICAL2').QV).map(c=>c.label),
    rankMod3T2Failures:all.filter(c=>!row(c,'MOD2_R3_TACTICAL2').QV).map(c=>c.label),
    rankMod4T2Failures:all.filter(c=>!row(c,'MOD2_R4_TACTICAL2').QV).map(c=>c.label),
    exactRankNoT2Failures:all.filter(c=>!row(c,'MOD2_RANK').QV).map(c=>c.label),
    baselineT2QAFailures:all.filter(c=>!row(c,'MOD2_P_TACTICAL2').QA_component_transport).map(c=>c.label),
    exactRankT2QAFailures:all.filter(c=>!row(c,'MOD2_RANK_TACTICAL2').QA_component_transport).map(c=>c.label),
    rankMod3T2QAFailures:all.filter(c=>!row(c,'MOD2_R3_TACTICAL2').QA_component_transport).map(c=>c.label)
  },
  interpretationGuard:[
    'This audit adds transporter-aware action-value sufficiency as an independent target; Q-V success does not imply Q-A.',
    'Current rank is explicitly admissible under the governing rank-local objective; it is tested here as global phase context, not as a new component valuation.',
    'Exact-rank success can only localize prior failures to cross-rank aliasing after the frozen T2 reduction; it does not prove pair cancellation inside a fixed rank.',
    'RANK_MOD3 retains existing turn parity, so its combined phase is rank modulo 6.',
    'RANK_MOD4 is a falsification control and is not preferred by size if it fails.',
    'RANK_EXACT_NO_T2 tests complementarity: rank must not be credited with tactical distinctions supplied only by T2.',
    'The 3x6-k3 carrier is a fresh holdout and contributes no rule definitions.',
    'Action signatures are multisets of canonical parent-component action role => exact child scalar value, preserving duplicate equivalent actions.',
    'No standard-7x6 theorem, nimber interpretation, or universal XOR claim follows from bounded passes.'
  ]
};

fs.writeFileSync(
  new URL('./RANK_CONDITIONED_COMPONENT_PHASE_QA_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'RANK_CONDITIONED_COMPONENT_PHASE_QA_COMPLETE',
  crossCase:out.crossCase,
  cases:all.map(c=>({
    label:c.label,
    states:c.physicalStates,
    results:c.results.map(x=>({
      id:x.id,
      classes:x.classes,
      QF:x.QF_component_transport,
      QA:x.QA_component_transport,
      QV:x.QV,
      mixed:x.mixedValueGroups,
      mixedAction:x.mixedActionGroups,
      sameRankMixed:x.sameExactRankMixedValueGroups
    }))
  }))
},null,2));
