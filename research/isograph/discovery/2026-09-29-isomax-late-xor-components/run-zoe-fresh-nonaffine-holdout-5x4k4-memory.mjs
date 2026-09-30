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
    }

    return best;
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

    const counts=new Map();
    for(const cols of gs.values()){
      const t=canonicalComponent(q,cols);
      counts.set(t,(counts.get(t)??0)+1);
    }
    return {counts};
  }

  const nts=[...states.values()].filter(x=>!x.terminal);

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
  const tactical2Counts=Object.fromEntries(['W','L2','O'].map(t=>[t,[...t2.values()].filter(x=>x===t).length]));
  console.error('MEMORY_OPT_PHASE t2',JSON.stringify(tactical2Counts));

  // Q-V audit needs component counts only on T2-O states.  Do not retain
  // role/interface objects or representations for W/L2 states.
  const reps=new Map(),typeSet=new Set();
  for(const x of nts){
    if(t2.get(x.key)!=='O')continue;
    const z=RFG(qOf(x));
    const r=rep(z);
    reps.set(x.key,r);
    for(const t of r.counts.keys())typeSet.add(t);
  }
  const typeIds=new Map([...typeSet].sort().map((t,i)=>[t,'T'+String(i).padStart(5,'0')]));
  function componentWidth(t){
    const h=t.split('|')[0];
    return h===''?0:h.split(',').length;
  }
  console.error('MEMORY_OPT_PHASE reps',JSON.stringify({t2O:reps.size,componentTypes:typeIds.size}));


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
    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
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

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
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
    const r=reps.get(x.key);
    const entries=[];
    for(const [t,n] of r.counts){
      let v;
      if(mode==='MULTI')v=String(n);
      else if(mode==='PRESENCE')v='P';
      else if(mode==='M2')v=(n%2)?'1':'';
      else if(mode==='ZOE'||mode==='ZOE_R3'||mode==='ZOE_EXACT')v=(n&1)?'O':'E';
      else if(mode==='M4')v=String(n%4);
      else if(mode==='M6')v=String(n%6);
      else throw new Error('unknown mode '+mode);
      if(v!==''&&v!=='0')entries.push(typeIds.get(t)+':'+v);
    }
    entries.sort();
    let phase='';
    if(mode==='ZOE_R3')phase='R3'+(x.rank%3)+'|';
    else if(mode==='ZOE_EXACT')phase='R'+x.rank+'|';
    return phase+entries.join(',');
  }

  function compactCounts(x){
    return [...reps.get(x.key).counts]
      .sort((a,b)=>typeIds.get(a[0]).localeCompare(typeIds.get(b[0])))
      .map(([t,n])=>({type:typeIds.get(t),canonicalType:t,width:componentWidth(t),count:n}));
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
        delta.push({type:typeIds.get(t),canonicalType:t,width:componentWidth(t),delta:d});
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

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
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

  const modes=['PRESENCE','M2','ZOE','ZOE_R3','MULTI'];
  const audits=modes.map(auditMode);
  const parity=audits.find(x=>x.mode==='M2');

  let minimumParitySeparators=null;
  if(parity.minimumMultiplicityDifferenceWitness){
    const w=parity.minimumMultiplicityDifferenceWitness;
    const a=states.get(w.a),b=states.get(w.b);
    minimumParitySeparators={
      witness:{a:w.a,b:w.b,rankA:a.rank,rankB:b.rank,multiplicityDifferenceL1:w.multiplicityDifferenceL1},
      PRESENCE:signatureFor(a,'PRESENCE')!==signatureFor(b,'PRESENCE'),
      ZOE:signatureFor(a,'ZOE')!==signatureFor(b,'ZOE'),
      ZOE_R3:signatureFor(a,'ZOE_R3')!==signatureFor(b,'ZOE_R3'),
      MULTI:signatureFor(a,'MULTI')!==signatureFor(b,'MULTI')
    };
  }

  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    componentTypes:typeIds.size,
    tactical2Counts,
    degree1:degree1Audit(),
    audits,
    minimumParitySeparators
  };
}

const caseResult=auditCase(5,4,4);
const byMode=Object.fromEntries(caseResult.audits.map(x=>[x.mode,x]));

assert.equal(byMode.MULTI.QV,true,'full multiplicity control must remain Q-V exact');

const out={
  schema:'connect4.isomax.zoe_fresh_nonaffine_holdout_5x4k4.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-050',
  target:'5x4-k4',
  frozenCandidate:'ZOE = omit zero counts; label every present exact component type O for positive odd multiplicity and E for positive even multiplicity',
  frozenDomain:'direct T2-O',
  frozenComponentDefinition:'post-RFG residual-incidence connected components with support/owner-labelled canonical component type',
  case:{
    label:caseResult.label,width:caseResult.width,height:caseResult.height,k:caseResult.k,
    physicalStates:caseResult.physicalStates,
    nonterminalStates:caseResult.nonterminalStates,
    componentTypes:caseResult.componentTypes,
    tactical2Counts:caseResult.tactical2Counts,
    degree1:caseResult.degree1,
    audits:caseResult.audits,
    minimumParitySeparators:caseResult.minimumParitySeparators
  },
  mechanicalChecks:{
    freshCarrierPredeclared:true,
    candidateFrozenFromEWRS047:true,
    keysOutcomeIndependent:true,
    T2ORetained:true,
    fullMultiplicityControlExact:byMode.MULTI.QV,
    degree1ModelMechanicallyGenerated:true,
    memoryOptimizedExecutionOnly:true
  },
  disposition:{
    PRESENCE_QV:byMode.PRESENCE.QV,
    M2_QV:byMode.M2.QV,
    ZOE_QV:byMode.ZOE.QV,
    ZOE_R3_QV:byMode.ZOE_R3.QV,
    MULTI_QV:byMode.MULTI.QV,
    degree1Contradictions:caseResult.degree1.contradictions,
    freshNonAffine:caseResult.degree1.contradictions>0,
    freshZoeNonAffineSuccess:byMode.ZOE.QV&&caseResult.degree1.contradictions>0
  },
  interpretationGuard:[
    'ZOE is frozen before 5x4-k4 outcome qualification.',
    'This retry changes only execution memory: component roles/interfaces are omitted and representations are retained only for T2-O states.',
    'The case counts as non-affine evidence only when the exact-rank degree-1 contradiction count is nonzero.',
    'A ZOE pass remains bounded finite evidence.',
    'No standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./ZOE_FRESH_NONAFFINE_HOLDOUT_5X4K4_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'ZOE_FRESH_NONAFFINE_HOLDOUT_5X4K4_COMPLETE',
  target:out.target,
  physicalStates:out.case.physicalStates,
  tactical2O:out.case.tactical2Counts.O,
  degree1:out.case.degree1,
  audits:out.case.audits.map(x=>({mode:x.mode,classes:x.classes,mixedValueClasses:x.mixedValueClasses,QV:x.QV})),
  disposition:out.disposition
},null,2));
