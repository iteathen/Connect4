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

  function relativeOutcomeCode(x){
    const v=values.get(x.key);
    const u=(x.rank&1)?-v:v;
    return u<0?0:u===0?1:2;
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

  function solveExactRankPolynomial(maxDegree){
    assert.ok(maxDegree===1||maxDegree===2);

    const structuralRows=[];
    const variableKeys=new Set();

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;

      const oddTypes=[...reps.get(x.key).counts]
        .filter(([,n])=>(n&1)!==0)
        .map(([t])=>typeIds.get(t))
        .sort();

      const keys=['B|'+x.rank];
      for(const t of oddTypes)keys.push('L|'+x.rank+'|'+t);

      if(maxDegree>=2){
        for(let i=0;i<oddTypes.length;i++){
          for(let j=i+1;j<oddTypes.length;j++){
            keys.push('Q|'+x.rank+'|'+oddTypes[i]+'|'+oddTypes[j]);
          }
        }
      }

      keys.sort();
      for(const k of keys)variableKeys.add(k);
      structuralRows.push({
        key:x.key,
        rank:x.rank,
        h:[...x.h],
        a:x.a,
        b:x.b,
        oddTypes,
        variableKeys:keys
      });
    }

    const orderedVariables=[...variableKeys].sort();
    const variableIndex=new Map(orderedVariables.map((k,i)=>[k,i]));
    const pivots=new Map();
    let contradictions=0,firstContradiction=null;
    const outcomeHistogram={loss:0,draw:0,win:0};

    for(const rec of structuralRows){
      const x=states.get(rec.key);
      const code=relativeOutcomeCode(x);
      if(code===0)outcomeHistogram.loss++;
      else if(code===1)outcomeHistogram.draw++;
      else outcomeHistogram.win++;

      let row=rec.variableKeys.map(k=>variableIndex.get(k)).sort((a,b)=>a-b);
      let rhs=code;

      while(row.length){
        const p=row[row.length-1];
        const prior=pivots.get(p);
        if(!prior){
          pivots.set(p,{row,rhs});
          break;
        }
        row=xorSorted(row,prior.row);
        rhs^=prior.rhs;
      }

      if(row.length===0&&rhs!==0){
        contradictions++;
        if(firstContradiction===null){
          firstContradiction={
            key:rec.key,
            rank:rec.rank,
            h:rec.h,
            oddTypes:rec.oddTypes,
            relativeOutcome:code===0?'loss':code===1?'draw':'win',
            code,
            reducedRhs:rhs
          };
        }
      }
    }

    const familyCounts={
      offset:orderedVariables.filter(k=>k.startsWith('B|')).length,
      linear:orderedVariables.filter(k=>k.startsWith('L|')).length,
      quadratic:orderedVariables.filter(k=>k.startsWith('Q|')).length
    };

    return {
      degree:maxDegree,
      consistent:contradictions===0,
      equations:structuralRows.length,
      activeVariables:orderedVariables.length,
      variableFamilyCounts:familyCounts,
      pivotRank:pivots.size,
      activeNullity:orderedVariables.length-pivots.size,
      contradictions,
      firstContradiction,
      outcomeHistogram,
      codeGauge:{loss:'00',draw:'01',win:'10'}
    };
  }

  const polynomial={
    DEGREE1:solveExactRankPolynomial(1),
    DEGREE2:solveExactRankPolynomial(2)
  };

  function interactionBasis(){
    const structuralRows=[];
    const linearSet=new Set(),quadraticSet=new Set();

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
      const oddTypes=[...reps.get(x.key).counts]
        .filter(([,n])=>(n&1)!==0)
        .map(([t])=>typeIds.get(t))
        .sort();
      const linearKeys=['B|'+x.rank,...oddTypes.map(t=>'L|'+x.rank+'|'+t)].sort();
      const quadraticKeys=[];
      for(let i=0;i<oddTypes.length;i++)for(let j=i+1;j<oddTypes.length;j++)
        quadraticKeys.push('Q|'+x.rank+'|'+oddTypes[i]+'|'+oddTypes[j]);
      quadraticKeys.sort();
      for(const k of linearKeys)linearSet.add(k);
      for(const k of quadraticKeys)quadraticSet.add(k);
      structuralRows.push({key:x.key,rank:x.rank,linearKeys,quadraticKeys});
    }

    const linearVars=[...linearSet].sort();
    const quadraticVars=[...quadraticSet].sort();
    /* Highest-index pivots are preferred, so place affine columns after quadratic
       columns to exhaust the affine span before admitting interaction directions. */
    const ordered=[...quadraticVars,...linearVars];
    const index=new Map(ordered.map((k,i)=>[k,i]));
    const pivots=new Map();

    for(const rec of structuralRows){
      let row=[...rec.quadraticKeys,...rec.linearKeys].map(k=>index.get(k)).sort((a,b)=>a-b);
      while(row.length){
        const p=row[row.length-1],prior=pivots.get(p);
        if(!prior){pivots.set(p,row);break;}
        row=xorSorted(row,prior);
      }
    }

    const pivotKeys=[...pivots.keys()].map(i=>ordered[i]).sort();
    const quadraticBasis=pivotKeys.filter(k=>k.startsWith('Q|'));
    const fullRank=pivots.size;
    const degree1Rank=polynomial.DEGREE1.pivotRank;
    const expectedGain=polynomial.DEGREE2.pivotRank-degree1Rank;
    assert.equal(fullRank,polynomial.DEGREE2.pivotRank,'priority elimination must preserve full degree-2 rank');
    assert.equal(quadraticBasis.length,expectedGain,'quadratic pivot basis must equal rank gain over degree one');

    const selectedQuadratic=new Set(quadraticBasis);
    const reducedOrdered=[...quadraticBasis,...linearVars];
    const reducedIndex=new Map(reducedOrdered.map((k,i)=>[k,i]));
    const reducedPivots=new Map();
    let contradictions=0,firstContradiction=null;

    for(const rec of structuralRows){
      const x=states.get(rec.key);
      const code=relativeOutcomeCode(x);
      const selected=rec.quadraticKeys.filter(k=>selectedQuadratic.has(k));
      let row=[...selected,...rec.linearKeys].map(k=>reducedIndex.get(k)).sort((a,b)=>a-b);
      let rhs=code;
      while(row.length){
        const p=row[row.length-1],prior=reducedPivots.get(p);
        if(!prior){reducedPivots.set(p,{row,rhs});break;}
        row=xorSorted(row,prior.row);
        rhs^=prior.rhs;
      }
      if(row.length===0&&rhs!==0){
        contradictions++;
        if(firstContradiction===null)firstContradiction={key:rec.key,rank:rec.rank,code,reducedRhs:rhs};
      }
    }

    assert.equal(reducedPivots.size,fullRank,'reduced basis must preserve full degree-2 column rank');
    assert.equal(contradictions,polynomial.DEGREE2.contradictions,'reduced basis must preserve degree-2 consistency');

    const rankStats=new Map();
    function stat(rank){
      if(!rankStats.has(rank))rankStats.set(rank,{
        rank,equations:0,linearCatalog:0,quadraticCatalog:0,
        affinePivotBasis:0,quadraticQuotientBasis:0,fullPivotRank:0
      });
      return rankStats.get(rank);
    }
    for(const rec of structuralRows)stat(rec.rank).equations++;
    for(const k of linearVars)stat(Number(k.split('|')[1])).linearCatalog++;
    for(const k of quadraticVars)stat(Number(k.split('|')[1])).quadraticCatalog++;
    for(const k of pivotKeys){
      const s=stat(Number(k.split('|')[1]));
      if(k.startsWith('Q|'))s.quadraticQuotientBasis++;
      else s.affinePivotBasis++;
      s.fullPivotRank++;
    }
    const byRank=[...rankStats.values()].sort((a,b)=>a.rank-b.rank).map(s=>({
      ...s,
      compression:s.quadraticCatalog===0?null:{
        catalog:s.quadraticCatalog,
        basis:s.quadraticQuotientBasis,
        eliminated:s.quadraticCatalog-s.quadraticQuotientBasis,
        ratio:s.quadraticQuotientBasis/s.quadraticCatalog
      }
    }));

    return {
      structuralSelectionOnly:true,
      equations:structuralRows.length,
      linearCatalog:linearVars.length,
      quadraticCatalog:quadraticVars.length,
      degree1Rank,
      fullDegree2Rank:fullRank,
      quadraticRankGain:expectedGain,
      quadraticQuotientBasisCount:quadraticBasis.length,
      quadraticCatalogEliminated:quadraticVars.length-quadraticBasis.length,
      quadraticBasisFraction:quadraticVars.length?quadraticBasis.length/quadraticVars.length:0,
      reducedActiveVariables:linearVars.length+quadraticBasis.length,
      reducedPivotRank:reducedPivots.size,
      reducedContradictions:contradictions,
      firstReducedContradiction:firstContradiction,
      byRank,
      quadraticBasis
    };
  }



  const interaction=interactionBasis();


  /*
   * EW-RS-036: outcome-independent structural descriptor ladder for the
   * quadratic interaction terms.  Exact affine/linear component identities
   * remain frozen; only the pair-product coordinate is quotiented.
   *
   * The central hypothesis is that disconnected post-RFG components couple
   * through global timing/release structure rather than arbitrary type IDs.
   */
  const parsedTypeCache=new Map();
  function popcount32(x){
    x=x>>>0;
    let n=0;
    while(x){x=(x&(x-1))>>>0;n++;}
    return n;
  }
  function parseCanonicalType(t){
    if(parsedTypeCache.has(t))return parsedTypeCache.get(t);
    const p=t.split('|');
    assert.equal(p.length,3,'canonical component type must have h|r0|r1');
    const h=p[0]===''?[]:p[0].split(',').map(Number);
    const masks=s=>s===''?[]:s.split('.').filter(Boolean).map(Number);
    const z={h,r0:masks(p[1]),r1:masks(p[2]),width:h.length};
    parsedTypeCache.set(t,z);
    return z;
  }
  function histogram(xs){
    const m=new Map();
    for(const x of xs)m.set(x,(m.get(x)??0)+1);
    return [...m].sort((a,b)=>String(a[0]).localeCompare(String(b[0])))
      .map(([k,n])=>String(k)+':'+n).join(',');
  }
  function residualDelaySignature(mask,h,n){
    const ds=[];
    for(let v=mask>>>0;v;v=(v&(v-1))>>>0){
      const low=(v&-v)>>>0;
      const b=31-Math.clz32(low);
      const row=Math.floor(b/n),col=b%n;
      const d=row-h[col];
      assert.ok(d>=0,'RFG residual cell must not lie below the current frontier');
      ds.push(d);
    }
    ds.sort((a,b)=>a-b);
    return ds.join('.');
  }
  function relativeIncidenceDescriptor(t){
    const z=parseCanonicalType(t),h=z.h,n=z.width;
    let best=null;
    for(const p of Ps(n)){
      function encodeOwner(rs){
        const edges=rs.map(mask=>{
          const cells=[];
          for(let v=mask>>>0;v;v=(v&(v-1))>>>0){
            const low=(v&-v)>>>0;
            const b=31-Math.clz32(low);
            const row=Math.floor(b/n),col=b%n;
            const d=row-h[col];
            assert.ok(d>=0,'relative incidence cell must not lie below frontier');
            cells.push([d,p[col]]);
          }
          cells.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
          return cells.map(([d,c])=>d+':'+c).join(',');
        }).sort();
        return edges.join(';');
      }
      const s='w'+n+'|r0='+encodeOwner(z.r0)+'|r1='+encodeOwner(z.r1);
      if(best===null||s<best)best=s;
    }
    return best;
  }

  function componentDescriptor(t,mode){
    if(mode==='EXACT')return t;
    const z=parseCanonicalType(t),h=z.h,n=z.width;
    const cap=h.reduce((s,v)=>s+(H-v),0);
    const cap6='w'+n+';c6='+((cap%6)+6)%6;
    if(mode==='CAP6')return cap6;
    const capExact='w'+n+';c='+cap;
    if(mode==='CAP_EXACT')return capExact;
    const ar0=histogram(z.r0.map(popcount32));
    const ar1=histogram(z.r1.map(popcount32));
    const arity=capExact+';a0='+ar0+';a1='+ar1;
    if(mode==='ARITY')return arity;
    const d0=histogram(z.r0.map(m=>residualDelaySignature(m,h,n)));
    const d1=histogram(z.r1.map(m=>residualDelaySignature(m,h,n)));
    const delay=arity+';d0='+d0+';d1='+d1;
    if(mode==='DELAY')return delay;
    if(mode==='HEIGHT_DELAY'){
      return delay+';h='+[...h].sort((a,b)=>a-b).join('.');
    }
    const rel=relativeIncidenceDescriptor(t);
    if(mode==='REL_INC')return rel;
    if(mode==='CAP6_REL_INC')return cap6+';'+rel;
    if(mode==='CAP_REL_INC')return capExact+';'+rel;
    throw new Error('unknown descriptor mode '+mode);
  }

  function descriptorInteractionAudit(mode){
    const structuralRows=[];
    const linearSet=new Set(),pairSet=new Set();

    function toggle(set,k){
      if(set.has(k))set.delete(k);
      else set.add(k);
    }

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
      const oddCanonical=[...reps.get(x.key).counts]
        .filter(([,n])=>(n&1)!==0)
        .map(([t])=>t)
        .sort();

      const oddIds=oddCanonical.map(t=>typeIds.get(t)).sort();
      const linearKeys=['B|'+x.rank,...oddIds.map(t=>'L|'+x.rank+'|'+t)].sort();
      const pairKeys=new Set();

      for(let i=0;i<oddCanonical.length;i++)for(let j=i+1;j<oddCanonical.length;j++){
        let a=componentDescriptor(oddCanonical[i],mode);
        let b=componentDescriptor(oddCanonical[j],mode);
        if(b<a)[a,b]=[b,a];
        toggle(pairKeys,JSON.stringify([x.rank,a,b]));
      }

      const pairs=[...pairKeys].sort();
      for(const k of linearKeys)linearSet.add(k);
      for(const k of pairs)pairSet.add(k);
      structuralRows.push({key:x.key,rank:x.rank,linearKeys,pairKeys:pairs});
    }

    const linearVars=[...linearSet].sort();
    const pairVars=[...pairSet].sort();
    /* As in EW-RS-034, affine columns receive pivot priority. */
    const ordered=[...pairVars,...linearVars];
    const index=new Map(ordered.map((k,i)=>[k,i]));
    const pivots=new Map();

    for(const rec of structuralRows){
      let row=[...rec.pairKeys,...rec.linearKeys].map(k=>index.get(k)).sort((a,b)=>a-b);
      while(row.length){
        const p=row[row.length-1],prior=pivots.get(p);
        if(!prior){pivots.set(p,row);break;}
        row=xorSorted(row,prior);
      }
    }

    const structuralRank=pivots.size;
    let contradictions=0,firstContradiction=null;
    const outcomePivots=new Map();

    for(const rec of structuralRows){
      const x=states.get(rec.key);
      let row=[...rec.pairKeys,...rec.linearKeys].map(k=>index.get(k)).sort((a,b)=>a-b);
      let rhs=relativeOutcomeCode(x);
      while(row.length){
        const p=row[row.length-1],prior=outcomePivots.get(p);
        if(!prior){outcomePivots.set(p,{row,rhs});break;}
        row=xorSorted(row,prior.row);
        rhs^=prior.rhs;
      }
      if(row.length===0&&rhs!==0){
        contradictions++;
        if(firstContradiction===null)firstContradiction={key:rec.key,rank:rec.rank,reducedRhs:rhs};
      }
    }

    return {
      mode,
      equations:structuralRows.length,
      exactLinearVariables:linearVars.length,
      descriptorPairVariables:pairVars.length,
      structuralRank,
      structuralRankGainOverDegree1:structuralRank-polynomial.DEGREE1.pivotRank,
      fullQuadraticRank:interaction.fullDegree2Rank,
      fullQuadraticRankGain:interaction.quadraticRankGain,
      structuralSpanPreserved:structuralRank===interaction.fullDegree2Rank,
      contradictions,
      decoderExact:contradictions===0,
      firstContradiction,
      pairCatalogCompressionAgainstExact:
        interaction.quadraticCatalog===0?null:1-(pairVars.length/interaction.quadraticCatalog)
    };
  }

  const descriptorModes=[
    'CAP6',
    'CAP_EXACT',
    'ARITY',
    'DELAY',
    'HEIGHT_DELAY',
    'REL_INC',
    'CAP6_REL_INC',
    'CAP_REL_INC',
    'EXACT'
  ];
  const descriptorLadder=descriptorModes.map(descriptorInteractionAudit);


  function scalarInteractionSyndromeAudit(){
    const rows=[];
    const linearSet=new Set(),pairSet=new Set();

    function toggle(set,k){
      if(set.has(k))set.delete(k);
      else set.add(k);
    }

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
      const oddCanonical=[...reps.get(x.key).counts]
        .filter(([,n])=>(n&1)!==0)
        .map(([t])=>t)
        .sort();
      const oddIds=oddCanonical.map(t=>typeIds.get(t)).sort();
      const linearKeys=['B|'+x.rank,...oddIds.map(t=>'L|'+x.rank+'|'+t)].sort();
      const pairKeys=new Set();

      for(let i=0;i<oddCanonical.length;i++)for(let j=i+1;j<oddCanonical.length;j++){
        let a=componentDescriptor(oddCanonical[i],'REL_INC');
        let b=componentDescriptor(oddCanonical[j],'REL_INC');
        if(b<a)[a,b]=[b,a];
        toggle(pairKeys,JSON.stringify([x.rank,a,b]));
      }

      const pairs=[...pairKeys].sort();
      const code=relativeOutcomeCode(x);
      for(const k of linearKeys)linearSet.add(k);
      for(const k of pairs)pairSet.add(k);
      rows.push({
        linearKeys,
        pairKeys:pairs,
        y0:(code&1)!==0,
        y1:(code&2)!==0
      });
    }

    const linearVars=[...linearSet].sort();
    const pairVars=[...pairSet].sort();

    function matrixRank(includePairs,targetMask){
      const vars=[
        ...(includePairs?pairVars:[]),
        ...linearVars,
        ...(targetMask&1?['@Y0']:[]),
        ...(targetMask&2?['@Y1']:[])
      ];
      const index=new Map(vars.map((k,i)=>[k,i]));
      const pivots=new Map();

      for(const rec of rows){
        const keys=[
          ...(includePairs?rec.pairKeys:[]),
          ...rec.linearKeys
        ];
        if((targetMask&1)&&rec.y0)keys.push('@Y0');
        if((targetMask&2)&&rec.y1)keys.push('@Y1');

        let row=keys.map(k=>index.get(k)).sort((a,b)=>a-b);
        while(row.length){
          const p=row[row.length-1],prior=pivots.get(p);
          if(!prior){pivots.set(p,row);break;}
          row=xorSorted(row,prior);
        }
      }
      return pivots.size;
    }

    const affineRank=matrixRank(false,0);
    const affineY0=matrixRank(false,1);
    const affineY1=matrixRank(false,2);
    const affineY01=matrixRank(false,3);
    const relIncRank=matrixRank(true,0);
    const relIncY01=matrixRank(true,3);

    return {
      equations:rows.length,
      affineRank,
      relIncPairVariables:pairVars.length,
      relIncModelRank:relIncRank,
      relIncInteractionRankGain:relIncRank-affineRank,
      outcomeBits:{
        y0:'low outcome-code bit: draw indicator under loss=00, draw=01, win=10',
        y1:'high outcome-code bit: win indicator under loss=00, draw=01, win=10',
        y0Affine:affineY0===affineRank,
        y1Affine:affineY1===affineRank,
        y0RankGain:affineY0-affineRank,
        y1RankGain:affineY1-affineRank,
        jointRankGain:affineY01-affineRank
      },
      targetInteractionSyndromeDimension:affineY01-affineRank,
      relIncSpansTarget:relIncY01===relIncRank
    };
  }

  const scalarInteractionSyndrome=scalarInteractionSyndromeAudit();


  const simpleFeatureNames=[
    'ONE','WIDTH1','CAP1','CAP2',
    'R0_N','R1_N','R0_CELLS','R1_CELLS',
    'R0_MULTI','R1_MULTI','R0_FRONT_EDGE','R1_FRONT_EDGE',
    'R0_ODD_DELAY','R1_ODD_DELAY','R0_MAX_ODD','R1_MAX_ODD',
    'R0_FRONT_COL','R1_FRONT_COL','R0_TOUCH_COL','R1_TOUCH_COL',
    'BOTH_TOUCH_COL','BOTH_FRONT_COL',
    'R0_D0','R1_D0','R0_D1','R1_D1','R0_D2P','R1_D2P'
  ];
  const simpleBitsCache=new Map();

  function simpleComponentBits(t){
    if(simpleBitsCache.has(t))return simpleBitsCache.get(t);
    const z=parseCanonicalType(t),h=z.h,n=z.width;
    const cap=h.reduce((s,v)=>s+(H-v),0);

    function ownerStats(rs){
      let cells=0,multi=0,frontEdge=0,oddDelay=0,maxOdd=0,d0=0,d1=0,d2p=0;
      const frontCols=new Set(),touchCols=new Set();

      for(const mask of rs){
        const cols=new Set();
        let hasFront=false,maxDelay=0;
        for(let v=mask>>>0;v;v=(v&(v-1))>>>0){
          const low=(v&-v)>>>0;
          const b=31-Math.clz32(low);
          const row=Math.floor(b/n),col=b%n;
          const d=row-h[col];
          assert.ok(d>=0);
          cells++;
          cols.add(col);
          touchCols.add(col);
          if(d===0){d0++;hasFront=true;frontCols.add(col);}
          else if(d===1)d1++;
          else d2p++;
          if(d&1)oddDelay++;
          if(d>maxDelay)maxDelay=d;
        }
        if(cols.size>1)multi++;
        if(hasFront)frontEdge++;
        if(maxDelay&1)maxOdd++;
      }
      return {n:rs.length,cells,multi,frontEdge,oddDelay,maxOdd,d0,d1,d2p,frontCols,touchCols};
    }

    const a=ownerStats(z.r0),b=ownerStats(z.r1);
    let bothTouch=0,bothFront=0;
    for(let c=0;c<n;c++){
      if(a.touchCols.has(c)&&b.touchCols.has(c))bothTouch++;
      if(a.frontCols.has(c)&&b.frontCols.has(c))bothFront++;
    }

    const raw={
      ONE:1,
      WIDTH1:n,
      CAP1:cap,
      CAP2:cap>>1,
      R0_N:a.n,R1_N:b.n,
      R0_CELLS:a.cells,R1_CELLS:b.cells,
      R0_MULTI:a.multi,R1_MULTI:b.multi,
      R0_FRONT_EDGE:a.frontEdge,R1_FRONT_EDGE:b.frontEdge,
      R0_ODD_DELAY:a.oddDelay,R1_ODD_DELAY:b.oddDelay,
      R0_MAX_ODD:a.maxOdd,R1_MAX_ODD:b.maxOdd,
      R0_FRONT_COL:a.frontCols.size,R1_FRONT_COL:b.frontCols.size,
      R0_TOUCH_COL:a.touchCols.size,R1_TOUCH_COL:b.touchCols.size,
      BOTH_TOUCH_COL:bothTouch,BOTH_FRONT_COL:bothFront,
      R0_D0:a.d0,R1_D0:b.d0,
      R0_D1:a.d1,R1_D1:b.d1,
      R0_D2P:a.d2p,R1_D2P:b.d2p
    };
    const active=simpleFeatureNames.filter(k=>(raw[k]&1)!==0);
    simpleBitsCache.set(t,active);
    return active;
  }

  function simpleSyndromeAudit(phaseMode){
    const variableSet=new Set(),rows=[];

    function phase(rank){
      if(phaseMode==='GLOBAL')return 'G';
      if(phaseMode==='R3')return 'R3'+(rank%3);
      if(phaseMode==='R6')return 'R6'+(rank%6);
      if(phaseMode==='EXACT')return 'R'+rank;
      throw new Error('unknown phase mode '+phaseMode);
    }
    function toggle(set,k){
      if(set.has(k))set.delete(k);
      else set.add(k);
    }

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
      const oddCanonical=[...reps.get(x.key).counts]
        .filter(([,n])=>(n&1)!==0)
        .map(([t])=>t)
        .sort();
      const oddIds=oddCanonical.map(t=>typeIds.get(t)).sort();
      const keys=['B|'+x.rank,...oddIds.map(t=>'L|'+x.rank+'|'+t)];
      const pairFeatures=new Set();
      const ph=phase(x.rank);

      for(let i=0;i<oddCanonical.length;i++)for(let j=i+1;j<oddCanonical.length;j++){
        const A=simpleComponentBits(oddCanonical[i]);
        const B=simpleComponentBits(oddCanonical[j]);
        for(const a of A)for(const b of B){
          const lo=a<b?a:b,hi=a<b?b:a;
          toggle(pairFeatures,'S|'+ph+'|'+lo+'|'+hi);
        }
      }

      keys.push(...pairFeatures);
      keys.sort();
      for(const k of keys)variableSet.add(k);
      rows.push({x,keys});
    }

    const variables=[...variableSet].sort();
    const index=new Map(variables.map((k,i)=>[k,i]));
    const pivots=new Map();
    let contradictions=0,firstContradiction=null;

    for(const rec of rows){
      let row=rec.keys.map(k=>index.get(k)).sort((a,b)=>a-b);
      let rhs=relativeOutcomeCode(rec.x);
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
            key:rec.x.key,
            rank:rec.x.rank,
            relativeOutcome:relativeOutcomeCode(rec.x),
            reducedRhs:rhs
          };
        }
      }
    }

    return {
      phaseMode,
      componentBinaryFeatures:simpleFeatureNames.length,
      symmetricBilinearFeatureUpperBound:
        (simpleFeatureNames.length*(simpleFeatureNames.length+1))/2,
      activeVariables:variables.length,
      activeSyndromeVariables:variables.filter(k=>k.startsWith('S|')).length,
      pivotRank:pivots.size,
      contradictions,
      exact:contradictions===0,
      firstContradiction
    };
  }

  const simpleSyndromeBank=[
    simpleSyndromeAudit('GLOBAL'),
    simpleSyndromeAudit('R3'),
    simpleSyndromeAudit('R6'),
    simpleSyndromeAudit('EXACT')
  ];
  const exactDescriptorControl=descriptorLadder.find(x=>x.mode==='EXACT');
  assert.equal(
    exactDescriptorControl.structuralRank,
    interaction.fullDegree2Rank,
    'exact component descriptor must reproduce the full degree-2 structural rank'
  );
  assert.equal(
    exactDescriptorControl.contradictions,
    0,
    'exact component descriptor control must retain exact decoding'
  );

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

    let qf=true,qv=true,fFail=null,vFail=null,mixedValueGroups=0,sameExactRankMixedValueGroups=0;
    let minPairUnits=null;
    const pairExamples=[],rankProfiles=[];

    for(const [k,rows] of groups){
      let fs0=null,v0=null,id0=null;
      const vals=new Set();
      const byRankValue=new Map();

      for(const x of rows){
        const fs=[];
        for(const e of x.children){
          const ch=states.get(e.key);
          fs.push(role(x.key,e.col)+'=>'+(ch.terminal?'T:'+token(ch):'N:'+map.get(ch.key)));
        }
        fs.sort();
        const fSig=fs.join('||'),v=values.get(x.key);
        vals.add(v);
        if(!byRankValue.has(x.rank))byRankValue.set(x.rank,new Set());
        byRankValue.get(x.rank).add(v);

        if(id0===null){id0=x.key;fs0=fSig;v0=v;continue;}
        if(qf&&fSig!==fs0)qf=false,fFail={key:k,a:id0,b:x.key,aInterface:fs0,bInterface:fSig};
        if(qv&&v!==v0)qv=false,vFail={key:k,a:id0,b:x.key,aValue:v0,bValue:v};
      }

      if([...byRankValue.values()].some(s=>s.size>1))sameExactRankMixedValueGroups++;

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
      QF_component_transport:qf,QV:qv,
      mixedValueGroups,sameExactRankMixedValueGroups,
      minPairUnits,firstFutureFailure:fFail,firstValueFailure:vFail,
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
    polynomial,
    interaction,
    descriptorLadder,
    scalarInteractionSyndrome,
    simpleSyndromeBank,
    results
  };
}

const specs=[
  [5,3,3],
  [4,4,4],
  [6,3,3],
  [3,7,3]
];
const cases=specs.map(s=>auditCase(...s));
for(const c of cases){
  assert.equal(c.polynomial.DEGREE2.contradictions,0,c.label+' degree-2 control must remain exact');
  assert.equal(c.interaction.reducedContradictions,0,c.label+' structural quotient basis must remain exact');
  assert.equal(
    c.interaction.quadraticQuotientBasisCount,
    c.polynomial.DEGREE2.pivotRank-c.polynomial.DEGREE1.pivotRank,
    c.label+' quotient-basis count must equal degree-2 rank gain'
  );
}

const out={
  schema:'connect4.isomax.simple_bilinear_syndrome_bank.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-040',
  frozenRepresentation:'post-RFG component parity + direct T2 + exact-rank affine component coordinates',
  candidateBank:{
    componentBinaryFeatures:[
      'ONE','WIDTH1','CAP1','CAP2',
      'R0_N','R1_N','R0_CELLS','R1_CELLS',
      'R0_MULTI','R1_MULTI','R0_FRONT_EDGE','R1_FRONT_EDGE',
      'R0_ODD_DELAY','R1_ODD_DELAY','R0_MAX_ODD','R1_MAX_ODD',
      'R0_FRONT_COL','R1_FRONT_COL','R0_TOUCH_COL','R1_TOUCH_COL',
      'BOTH_TOUCH_COL','BOTH_FRONT_COL',
      'R0_D0','R1_D0','R0_D1','R1_D1','R0_D2P','R1_D2P'
    ],
    pairConstruction:'For each unordered pair of odd component types, XOR the symmetric products of active binary component features; aggregate identical pair-feature keys mod 2.',
    phaseModes:['GLOBAL','R3','R6','EXACT']
  },
  cases:cases.map(c=>({
    label:c.label,width:c.width,height:c.height,k:c.k,
    physicalStates:c.physicalStates,nonterminalStates:c.nonterminalStates,
    tactical2Counts:c.tactical2Counts,
    degree1Contradictions:c.polynomial.DEGREE1.contradictions,
    targetSyndromeDimension:c.scalarInteractionSyndrome.targetInteractionSyndromeDimension,
    simpleSyndromeBank:c.simpleSyndromeBank
  })),
  mechanicalChecks:{
    featureDefinitionsOutcomeIndependent:true,
    exactAffineCoordinatesFrozen:true,
    candidateBankFrozenBeforeOutcomeQualification:true
  },
  interpretationGuard:[
    'The candidate bank is generated solely from current component width, capacity, residual counts, frontier-relative delays, and column-incidence parities.',
    'Outcome labels do not define the binary component features or phase modes.',
    'Passing a phase mode establishes existence of a compact bilinear syndrome decoder over that frozen bank; it does not yet establish coefficient transfer across geometries.',
    'Failure rejects only this simple binary-feature bank, not REL_INC or quadratic GF(2) generally.',
    'No standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./SIMPLE_BILINEAR_SYNDROME_BANK_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'SIMPLE_BILINEAR_SYNDROME_BANK_COMPLETE',
  cases:out.cases.map(c=>({
    label:c.label,
    targetSyndromeDimension:c.targetSyndromeDimension,
    modes:c.simpleSyndromeBank.map(m=>({
      mode:m.phaseMode,
      syndromeVars:m.activeSyndromeVariables,
      contradictions:m.contradictions,
      exact:m.exact
    }))
  }))
},null,2));
