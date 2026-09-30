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


  function repairedDecoderAudit(){
    const descriptorIds=new Map();
    const activeRaw=new Set([0]);
    const classRows=new Map();
    let mixedClasses=0;

    function descriptorId(d){
      let id=descriptorIds.get(d);
      if(id===undefined){
        id=descriptorIds.size;
        descriptorIds.set(d,id);
      }
      return id;
    }

    for(const x of ots){
      const counts=aggregatedCounts(reps.get(x.key),'ROLE_CAPPAR_REL_INC_ZOE');
      const items=[...counts].sort((a,b)=>a[0].localeCompare(b[0]));
      const feats=[0];
      const parts=[];
      for(const [d,n] of items){
        const id=descriptorId(d);
        const p=1+2*id, o=2+2*id;
        feats.push(p);
        activeRaw.add(p);
        if(n&1){
          feats.push(o);
          activeRaw.add(o);
          parts.push([id,'O']);
        }else{
          parts.push([id,'E']);
        }
      }
      feats.sort((a,b)=>a-b);
      parts.sort((a,b)=>a[0]-b[0]);
      const sig=parts.map(([id,z])=>id+':'+z).join(',');
      const code=relativeOutcomeCode(x);
      const prior=classRows.get(sig);
      if(prior){
        if(prior.code!==code)mixedClasses++;
      }else{
        classRows.set(sig,{sig,raw:feats,code});
      }
    }

    assert.equal(mixedClasses,0,'ROLE_CAPPAR structural classes must remain scalar-pure');

    const rows=[...classRows.values()];
    const active=[...activeRaw].sort((a,b)=>a-b);
    const affineIndex=new Map(active.map((v,i)=>[v,i]));
    const affineCount=active.length;

    function xorRow(a,b){
      const out=[];let i=0,j=0;
      while(i<a.length||j<b.length){
        if(i>=a.length){out.push(...b.slice(j));break;}
        if(j>=b.length){out.push(...a.slice(i));break;}
        if(a[i]===b[j]){i++;j++;continue;}
        if(a[i]<b[j])out.push(a[i++]);else out.push(b[j++]);
      }
      return out;
    }

    function rankWithOutcome(which){
      const pivots=new Map();
      for(const rec of rows){
        const row=rec.raw.map(v=>affineIndex.get(v));
        if(which==='Y0'&&(rec.code&1))row.push(affineCount);
        else if(which==='Y1'&&((rec.code>>>1)&1))row.push(affineCount);
        else if(which==='BOTH'){
          if(rec.code&1)row.push(affineCount);
          if((rec.code>>>1)&1)row.push(affineCount+1);
        }
        row.sort((a,b)=>a-b);
        let z=row;
        while(z.length){
          const p=z[z.length-1],prior=pivots.get(p);
          if(!prior){pivots.set(p,z);break;}
          z=xorRow(z,prior);
        }
      }
      return pivots.size;
    }

    function auditAffine(){
      const pivots=new Map();
      let contradictions=0,firstContradiction=null;
      for(const rec of rows){
        let row=rec.raw.map(v=>affineIndex.get(v)).sort((a,b)=>a-b);
        let rhs=rec.code;
        while(row.length){
          const p=row[row.length-1],prior=pivots.get(p);
          if(!prior){pivots.set(p,{row,rhs});break;}
          row=xorRow(row,prior.row);rhs^=prior.rhs;
        }
        if(row.length===0&&rhs!==0){
          contradictions++;
          if(firstContradiction===null)firstContradiction={classKey:rec.sig,code:rec.code,reducedRhs:rhs};
        }
      }
      return {pivotRank:pivots.size,contradictions,firstContradiction};
    }

    const affine=auditAffine();
    const rankA=rankWithOutcome('NONE');
    assert.equal(rankA,affine.pivotRank,'affine rank mismatch');
    const rankY0=rankWithOutcome('Y0');
    const rankY1=rankWithOutcome('Y1');
    const rankBoth=rankWithOutcome('BOTH');

    const maxRaw=active[active.length-1]??0;
    const pairBase=maxRaw+1;
    const pairSet=new Set();
    for(const rec of rows){
      const bs=rec.raw.filter(v=>v!==0);
      for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
        pairSet.add(bs[i]*pairBase+bs[j]);
      }
    }
    const pairKeys=[...pairSet].sort((a,b)=>a-b);
    const pairIndex=new Map(pairKeys.map((k,i)=>[k,affineCount+i]));

    const tripleSet=new Set();
    for(const rec of rows){
      const bs=rec.raw.filter(v=>v!==0);
      for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++)for(let k=j+1;k<bs.length;k++){
        tripleSet.add((bs[i]*pairBase+bs[j])*pairBase+bs[k]);
      }
    }
    const tripleKeys=[...tripleSet].sort((a,b)=>a-b);
    const tripleOffset=affineCount+pairKeys.length;
    const tripleIndex=new Map(tripleKeys.map((k,i)=>[k,tripleOffset+i]));

    function degree2Row(rec){
      const row=rec.raw.map(v=>affineIndex.get(v));
      const bs=rec.raw.filter(v=>v!==0);
      for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
        row.push(pairIndex.get(bs[i]*pairBase+bs[j]));
      }
      row.sort((a,b)=>a-b);
      return row;
    }

    function degree3Row(rec){
      const row=degree2Row(rec);
      const bs=rec.raw.filter(v=>v!==0);
      for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++)for(let k=j+1;k<bs.length;k++){
        row.push(tripleIndex.get((bs[i]*pairBase+bs[j])*pairBase+bs[k]));
      }
      row.sort((a,b)=>a-b);
      return row;
    }

    function auditRows(rowFn){
      const pivots=new Map();
      let contradictions=0,firstContradiction=null;
      for(const rec of rows){
        let row=rowFn(rec),rhs=rec.code;
        while(row.length){
          const p=row[row.length-1],prior=pivots.get(p);
          if(!prior){pivots.set(p,{row,rhs});break;}
          row=xorRow(row,prior.row);rhs^=prior.rhs;
        }
        if(row.length===0&&rhs!==0){
          contradictions++;
          if(firstContradiction===null)firstContradiction={classKey:rec.sig,code:rec.code,reducedRhs:rhs};
        }
      }
      return {pivotRank:pivots.size,contradictions,firstContradiction};
    }

    const degree2=auditRows(degree2Row);
    const degree3=auditRows(degree3Row);
    const activePresence=[...activeRaw].filter(v=>v>0&&(v&1)===1).length;
    const activeOddness=[...activeRaw].filter(v=>v>0&&(v&1)===0).length;

    return {
      structuralClasses:rows.length,
      scalarMixedClasses:mixedClasses,
      descriptorIdentities:descriptorIds.size,
      activeAffineVariables:affineCount,
      activePresenceVariables:activePresence,
      activeOddnessVariables:activeOddness,
      affine:{
        pivotRank:affine.pivotRank,
        contradictions:affine.contradictions,
        firstContradiction:affine.firstContradiction,
        y0RankGain:rankY0-rankA,
        y1RankGain:rankY1-rankA,
        jointScalarTargetDimension:rankBoth-rankA
      },
      degree2:{
        pairCatalog:pairKeys.length,
        pivotRank:degree2.pivotRank,
        rankGainOverAffine:degree2.pivotRank-affine.pivotRank,
        contradictions:degree2.contradictions,
        firstContradiction:degree2.firstContradiction
      },
      degree3:{
        tripleCatalog:tripleKeys.length,
        pivotRank:degree3.pivotRank,
        rankGainOverDegree2:degree3.pivotRank-degree2.pivotRank,
        rankGainOverAffine:degree3.pivotRank-affine.pivotRank,
        contradictions:degree3.contradictions,
        firstContradiction:degree3.firstContradiction
      },
      codeGauge:{loss:'00',draw:'01',win:'10'}
    };
  }

  const decoder=repairedDecoderAudit();

  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,
    physicalStates:states.size,nonterminalStates:nts.length,
    componentTypes:typeWidth.size,
    tactical2Counts:Object.fromEntries(['W','L2','O'].map(t=>[t,[...t2.values()].filter(x=>x===t).length])),
    legacyDegree1:degree1Audit(),
    decoder
  };
}

const specs=[
  [6,3,3],
  [4,5,4],
  [6,3,4]
];
const expectedClasses=new Map([
  ['6x3-k3',16732],
  ['4x5-k4',79309],
  ['6x3-k4',17550]
]);
const expectedLegacyDegree1=new Map([
  ['6x3-k3',520],
  ['4x5-k4',23918],
  ['6x3-k4',3543]
]);
const expectedAffineDecoderContradictions=new Map([
  ['6x3-k3',1454],
  ['4x5-k4',2918],
  ['6x3-k4',459]
]);
const expectedDegree2Contradictions=new Map([
  ['6x3-k3',24],
  ['4x5-k4',24],
  ['6x3-k4',5]
]);

const cases=[];
for(const spec of specs){
  const c=auditCase(...spec);
  assert.equal(c.decoder.structuralClasses,expectedClasses.get(c.label),c.label+' ROLE_CAPPAR class count drift');
  assert.equal(c.legacyDegree1.contradictions,expectedLegacyDegree1.get(c.label),c.label+' legacy degree-1 control drift');
  assert.equal(c.decoder.affine.contradictions,expectedAffineDecoderContradictions.get(c.label),c.label+' repaired affine contradiction count drift');
  assert.equal(c.decoder.degree2.contradictions,expectedDegree2Contradictions.get(c.label),c.label+' degree-2 contradiction count drift');
  cases.push(c);
  if(global.gc)global.gc();
}

const out={
  schema:'connect4.isomax.repaired_coordinate_cubic_decoder.v1',
  date_author_local:'2026-09-30',
  warrant:'EW-RS-058',
  frozenCoordinate:'ROLE_CAPPAR_REL_INC_ZOE',
  binaryZoeEncoding:{
    P:'aggregate multiplicity > 0',
    O:'aggregate multiplicity mod 2',
    zero:[0,0],
    positive_even:[1,0],
    positive_odd:[1,1]
  },
  polynomialFamily:'complete observed square-free P/O monomials through degree 3',
  outcomeCode:{loss:'00',draw:'01',win:'10'},
  cases:cases.map(c=>({
    label:c.label,width:c.width,height:c.height,k:c.k,
    physicalStates:c.physicalStates,
    nonterminalStates:c.nonterminalStates,
    componentTypes:c.componentTypes,
    tactical2Counts:c.tactical2Counts,
    legacyDegree1:c.legacyDegree1,
    decoder:c.decoder
  })),
  mechanicalChecks:{
    roleCapparClassPurityRetained:cases.every(c=>c.decoder.scalarMixedClasses===0),
    classCountControlsReproduced:cases.every(c=>c.decoder.structuralClasses===expectedClasses.get(c.label)),
    legacyDegree1ControlsReproduced:cases.every(c=>c.legacyDegree1.contradictions===expectedLegacyDegree1.get(c.label)),
    repairedAffineControlsReproduced:cases.every(c=>c.decoder.affine.contradictions===expectedAffineDecoderContradictions.get(c.label)),
    degree2ControlsReproduced:cases.every(c=>c.decoder.degree2.contradictions===expectedDegree2Contradictions.get(c.label)),
    cubicFeaturesMechanicallyGenerated:true,
    binaryZoeEncodingOutcomeIndependent:true,
    duplicateStructuralRowsCollapsedBeforeDecoderAlgebra:true
  },
  interpretationGuard:[
    'Every observed square-free triple of distinct active repaired-coordinate P/O bits is included; no cubic monomial is outcome-selected.',
    'A zero degree-3 contradiction count establishes bounded decoder existence only, not a closed-form or universal law.',
    'The scalar target dimension remains two in the frozen EW-RS-057 evidence even if the structural polynomial degree required for realization is three.',
    'Any degree-3 contradiction must be frozen before degree-4 escalation.',
    'No Q-A/Q-F or standard-7x6 claim follows.'
  ]
};

fs.writeFileSync(
  new URL('./REPAIRED_COORDINATE_CUBIC_DECODER_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n'
);

console.log(JSON.stringify({
  status:'REPAIRED_COORDINATE_CUBIC_DECODER_COMPLETE',
  cases:out.cases.map(c=>({
    label:c.label,
    classes:c.decoder.structuralClasses,
    affineContradictions:c.decoder.affine.contradictions,
    degree2:{
      pairCatalog:c.decoder.degree2.pairCatalog,
      contradictions:c.decoder.degree2.contradictions
    },
    degree3:{
      tripleCatalog:c.decoder.degree3.tripleCatalog,
      rankGainOverDegree2:c.decoder.degree3.rankGainOverDegree2,
      contradictions:c.decoder.degree3.contradictions
    }
  }))
},null,2));
