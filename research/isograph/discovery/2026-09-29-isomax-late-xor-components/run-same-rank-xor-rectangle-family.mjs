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

  function solveAffineXor(phaseMode){
    assert.equal(phaseMode,'GRADED_EXACT');
    const types=[...typeWidth.keys()].sort();
    const typeIndex=new Map(types.map((t,i)=>[t,i]));
    const offsetBase=types.length*(N+1);
    const pivots=new Map();
    const active=new Set();
    const equationRecords=[];
    const certificates=[];
    let equations=0,contradictions=0;
    const outcomeHistogram={loss:0,draw:0,win:0};

    function xorIndexSets(a,b){
      return xorSorted(a,b);
    }

    for(const x of nts){
      if(t2.get(x.key)!=='O')continue;
      const equationIndex=equations++;
      const code=relativeOutcomeCode(x);
      if(code===0)outcomeHistogram.loss++;
      else if(code===1)outcomeHistogram.draw++;
      else outcomeHistogram.win++;

      const coeff=[];
      const oddCanonical=[];
      for(const [t,n] of reps.get(x.key).counts){
        if((n&1)===0)continue;
        const baseIdx=typeIndex.get(t);
        const idx=x.rank*types.length+baseIdx;
        coeff.push(idx);
        oddCanonical.push({
          type:typeIds.get(t),
          canonicalType:t,
          width:typeWidth.get(t),
          columns:reps.get(x.key).comps.filter(c=>c.type===t).map(c=>c.cols)
        });
        active.add(idx);
      }

      const offset=offsetBase+x.rank;
      coeff.push(offset);
      active.add(offset);
      coeff.sort((a,b)=>a-b);

      const rec={
        equationIndex,
        key:x.key,
        rank:x.rank,
        mover:x.rank&1,
        h:[...x.h],
        a:x.a,
        b:x.b,
        relativeOutcome:code===0?'loss':code===1?'draw':'win',
        code,
        oddComponents:oddCanonical.sort((a,b)=>a.type.localeCompare(b.type)),
        coeff:[...coeff]
      };
      equationRecords.push(rec);

      let row=[...coeff];
      let rhs=code;
      let prov=[equationIndex];

      while(row.length){
        const p=row[row.length-1];
        const prior=pivots.get(p);
        if(!prior){
          pivots.set(p,{row,rhs,prov});
          break;
        }
        row=xorSorted(row,prior.row);
        rhs^=prior.rhs;
        prov=xorIndexSets(prov,prior.prov);
      }

      if(row.length===0&&rhs!==0){
        contradictions++;
        const rows=prov.map(i=>equationRecords[i]);
        let lhsCheck=[],rhsCheck=0;
        const rankSet=new Set();
        const typeParity=new Map();

        for(const q of rows){
          lhsCheck=xorSorted(lhsCheck,q.coeff);
          rhsCheck^=q.code;
          rankSet.add(q.rank);
          for(const oc of q.oddComponents){
            typeParity.set(oc.type,(typeParity.get(oc.type)??0)^1);
          }
        }

        assert.equal(lhsCheck.length,0,'certificate LHS must cancel');
        assert.equal(rhsCheck,rhs,'certificate RHS replay mismatch');
        assert.equal(rankSet.size,1,'exact-rank certificate crossed rank blocks');
        assert.equal(rows.length%2,0,'rank-offset cancellation requires even certificate cardinality');
        assert.ok([...typeParity.values()].every(v=>v===0),'component parity must cancel');

        certificates.push({
          reducedRhs:rhs,
          certificateSize:rows.length,
          rank:[...rankSet][0],
          equationIndices:[...prov],
          outcomeCodeXor:rhsCheck,
          lhsCancels:true,
          offsetCancels:true,
          componentParityCancels:true,
          rows:rows.map(q=>({
            equationIndex:q.equationIndex,
            key:q.key,
            rank:q.rank,
            mover:q.mover,
            h:q.h,
            a:q.a,
            b:q.b,
            relativeOutcome:q.relativeOutcome,
            code:q.code,
            oddComponents:q.oddComponents
          }))
        });
      }
    }

    certificates.sort((a,b)=>a.certificateSize-b.certificateSize||a.rank-b.rank||
      a.equationIndices.join(',').localeCompare(b.equationIndices.join(',')));

    const sizeHistogram={};
    for(const c of certificates)sizeHistogram[c.certificateSize]=(sizeHistogram[c.certificateSize]??0)+1;

    return {
      phaseMode,
      consistent:contradictions===0,
      equations,
      componentTypes:types.length,
      activeVariables:active.size,
      pivotRank:pivots.size,
      activeNullity:active.size-pivots.size,
      contradictions,
      outcomeHistogram,
      codeGauge:{loss:'00',draw:'01',win:'10'},
      certificateCount:certificates.length,
      certificateSizeHistogram:sizeHistogram,
      minimumCertificate:certificates[0]??null,
      minimumCertificates:certificates.length?certificates.filter(c=>c.certificateSize===certificates[0].certificateSize):[],
      certificateSummaries:certificates.slice(0,18).map(c=>({
        rank:c.rank,
        certificateSize:c.certificateSize,
        reducedRhs:c.reducedRhs,
        equationIndices:c.equationIndices,
        stateKeys:c.rows.map(r=>r.key)
      }))
    };
  }

  const affineXor={
    EXACT_RANK_GRADED:solveAffineXor('GRADED_EXACT')
  };

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
    affineXor,
    results
  };
}

const caseResult=auditCase(5,3,3);
const ax=caseResult.affineXor.EXACT_RANK_GRADED;
assert.equal(ax.contradictions,18);
assert.equal(ax.minimumCertificates.length,12);
assert.ok(ax.minimumCertificates.every(c=>c.certificateSize===4));

function sortedUnique(xs){return [...new Set(xs)].sort();}
function xorSet(a,b){
  a=sortedUnique(a);b=sortedUnique(b);
  const out=[];let i=0,j=0;
  while(i<a.length||j<b.length){
    if(i>=a.length){out.push(...b.slice(j));break;}
    if(j>=b.length){out.push(...a.slice(i));break;}
    if(a[i]===b[j]){i++;j++;continue;}
    if(a[i]<b[j])out.push(a[i++]); else out.push(b[j++]);
  }
  return out;
}
function intersect(a,b){
  const B=new Set(b);
  return sortedUnique(a.filter(x=>B.has(x)));
}
function sameArray(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
function rowSig(row){return sortedUnique(row.oddComponents.map(x=>x.type));}
function typeDictionary(rows){
  const m=new Map();
  for(const row of rows)for(const c of row.oddComponents)m.set(c.type,{canonicalType:c.canonicalType,width:c.width});
  return Object.fromEntries([...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])));
}

const pairings=[
  [[0,1],[2,3]],
  [[0,2],[1,3]],
  [[0,3],[1,2]]
];

const rectangles=ax.minimumCertificates.map((cert,index)=>{
  const rows=cert.rows;
  const sigs=rows.map(rowSig);
  const candidates=pairings.map((pairs,pairingIndex)=>{
    const [[a,b],[c,d]]=pairs;
    const toggle1=xorSet(sigs[a],sigs[b]);
    const toggle2=xorSet(sigs[c],sigs[d]);
    assert.ok(sameArray(toggle1,toggle2),'four-row dependency must induce the same toggle under a pairing');
    const context1=intersect(sigs[a],sigs[b]);
    const context2=intersect(sigs[c],sigs[d]);
    const effect1=rows[a].code^rows[b].code;
    const effect2=rows[c].code^rows[d].code;
    return {
      pairingIndex,
      pairs,
      toggle:toggle1,
      toggleSize:toggle1.length,
      contexts:[context1,context2],
      contextDelta:xorSet(context1,context2),
      effects:[effect1,effect2],
      effectSyndrome:effect1^effect2,
      pairRows:[
        [rows[a].key,rows[b].key],
        [rows[c].key,rows[d].key]
      ],
      pairOutcomes:[
        [rows[a].relativeOutcome,rows[b].relativeOutcome],
        [rows[c].relativeOutcome,rows[d].relativeOutcome]
      ]
    };
  });
  const minSize=Math.min(...candidates.filter(x=>x.toggleSize>0).map(x=>x.toggleSize));
  const minimalPairings=candidates.filter(x=>x.toggleSize===minSize);
  assert.ok(minimalPairings.every(x=>x.effectSyndrome!==0),'certificate pairing must retain nonzero syndrome');
  return {
    id:'R'+String(index+1).padStart(2,'0'),
    rank:cert.rank,
    certificateSize:cert.certificateSize,
    stateKeys:rows.map(r=>r.key),
    outcomes:rows.map(r=>r.relativeOutcome),
    codes:rows.map(r=>r.code),
    typeDictionary:typeDictionary(rows),
    minimumToggleSize:minSize,
    minimalPairings,
    allPairings:candidates
  };
});

const toggleGroups=new Map();
for(const rect of rectangles){
  const seen=new Set();
  for(const p of rect.minimalPairings){
    const k=p.toggle.join('+');
    if(seen.has(k))continue;
    seen.add(k);
    if(!toggleGroups.has(k))toggleGroups.set(k,[]);
    toggleGroups.get(k).push(rect.id);
  }
}
const toggleGroupSummary=[...toggleGroups.entries()]
  .map(([toggle,ids])=>({toggle:toggle?toggle.split('+'):[],rectangles:ids,count:ids.length}))
  .sort((a,b)=>b.count-a.count||a.toggle.join('+').localeCompare(b.toggle.join('+')));

const unambiguous=rectangles.filter(r=>r.minimalPairings.length===1);
const ambiguous=rectangles.filter(r=>r.minimalPairings.length>1);

const out={
  schema:'connect4.isomax.same_rank_xor_rectangle_family.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-030',
  source:{
    commit:'93088eec6c228fd5c82c9e9c06b97c93536289d0',
    file:'SAME_RANK_XOR_CONTRADICTION_CERTIFICATE_0_1.json'
  },
  frozenModel:'5x3-k3 T2-O exact-rank independent affine GF(2)^2 component valuation',
  counts:{
    contradictions:ax.contradictions,
    fourRowRectangles:rectangles.length,
    unambiguousMinimumPairing:unambiguous.length,
    structurallyTiedMinimumPairing:ambiguous.length,
    distinctMinimumToggleSignatures:toggleGroupSummary.length
  },
  toggleGroupSummary,
  rectangles,
  interpretationGuard:[
    'Pairings are ranked only by component-parity symmetric-difference cardinality; outcomes do not select the pairing.',
    'A toggle signature is a candidate local substitution direction, not yet a fitted interaction term.',
    'Different contexts producing different code deltas under the same toggle certify contextual nonlinearity.',
    'Multiple toggle groups would reject a one-substitution explanation but would not by itself prove multiple algebra generators after further normalization.',
    'No standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./SAME_RANK_XOR_RECTANGLE_FAMILY_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'SAME_RANK_XOR_RECTANGLE_FAMILY_COMPLETE',
  counts:out.counts,
  toggleGroupSummary:out.toggleGroupSummary,
  rectangles:out.rectangles.map(r=>({
    id:r.id,rank:r.rank,minimumToggleSize:r.minimumToggleSize,
    minimalPairings:r.minimalPairings.map(p=>({
      toggle:p.toggle,contexts:p.contexts,effects:p.effects,effectSyndrome:p.effectSyndrome
    }))
  }))
},null,2));
