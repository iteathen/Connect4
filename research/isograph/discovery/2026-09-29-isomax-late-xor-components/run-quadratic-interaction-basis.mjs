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
    results
  };
}

const specs=[
  [5,3,3],
  [4,4,4],
  [6,3,3]
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
  schema:'connect4.isomax.quadratic_interaction_basis.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-034',
  frozenComponentDefinition:'post-RFG residual-incidence connected components with support/owner-labelled canonical component type',
  frozenTacticalReduction:'direct rank-local T2 = W immediate win; L2 universal one-move release loss; O unresolved',
  basisRule:'canonical linear-first GF(2) pivot basis for degree-2 structural column space modulo affine degree-1 columns',
  cases:cases.map(c=>({
    label:c.label,width:c.width,height:c.height,k:c.k,
    physicalStates:c.physicalStates,nonterminalStates:c.nonterminalStates,
    componentTypes:c.componentTypes,tactical2Counts:c.tactical2Counts,
    degree1:{
      activeVariables:c.polynomial.DEGREE1.activeVariables,
      pivotRank:c.polynomial.DEGREE1.pivotRank,
      contradictions:c.polynomial.DEGREE1.contradictions
    },
    degree2:{
      activeVariables:c.polynomial.DEGREE2.activeVariables,
      quadraticCatalog:c.polynomial.DEGREE2.variableFamilyCounts.quadratic,
      pivotRank:c.polynomial.DEGREE2.pivotRank,
      contradictions:c.polynomial.DEGREE2.contradictions
    },
    interaction:c.interaction
  })),
  mechanicalChecks:{
    outcomeIndependentBasisSelection:true,
    basisCountEqualsRankGain:cases.every(c=>c.interaction.quadraticQuotientBasisCount===c.polynomial.DEGREE2.pivotRank-c.polynomial.DEGREE1.pivotRank),
    reducedColumnRankPreserved:cases.every(c=>c.interaction.reducedPivotRank===c.polynomial.DEGREE2.pivotRank),
    reducedDecoderExact:cases.every(c=>c.interaction.reducedContradictions===0)
  },
  interpretationGuard:[
    'The quotient basis is selected from structural incidence only; W/D/L labels are used only after selection to verify exact decoding.',
    'The basis is minimal for spanning the full observed quadratic feature column space modulo the affine columns under GF(2) linear dependence, not necessarily minimal for scalar-value decoding alone.',
    'Individual pivot pair terms are coordinate choices; the invariant object is the quotient subspace dimension by exact rank.',
    'No standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./QUADRATIC_INTERACTION_BASIS_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'QUADRATIC_INTERACTION_BASIS_COMPLETE',
  cases:out.cases.map(c=>({
    label:c.label,
    degree1Contradictions:c.degree1.contradictions,
    pairCatalog:c.interaction.quadraticCatalog,
    quotientBasis:c.interaction.quadraticQuotientBasisCount,
    basisFraction:c.interaction.quadraticBasisFraction,
    rankGain:c.interaction.quadraticRankGain,
    reducedContradictions:c.interaction.reducedContradictions,
    byRank:c.interaction.byRank
  }))
},null,2));
