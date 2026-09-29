// Rule-only cross-dimension producer for action-unlabelled recursive quotients.
// Class construction consumes only geometry, gravity, turn order, first-win stopping,
// and the legal successor graph. Exact W/D/L is derived afterward only as validation.
import assert from 'node:assert/strict';

function popcount(x){
  let n=0;
  for(;x;x&=x-1)n++;
  return n;
}

function winMasks(width,height,k){
  assert.ok(Number.isInteger(width)&&width>=k&&k>=2);
  assert.ok(Number.isInteger(height)&&height>=k);
  const dirs=[[1,0],[0,1],[1,1],[1,-1]],masks=[];
  for(let row=0;row<height;row++)for(let col=0;col<width;col++)
    for(const [dc,dr] of dirs){
      const endCol=col+(k-1)*dc,endRow=row+(k-1)*dr;
      if(endCol<0||endCol>=width||endRow<0||endRow>=height)continue;
      let mask=0;
      for(let i=0;i<k;i++)mask|=1<<((row+i*dr)*width+col+i*dc);
      masks.push(mask);
    }
  return [...new Set(masks)];
}

function peakBy(frontier,key){
  return frontier.reduce((best,row)=>row[key]>best[key]?row:best,
    {rank:-1,states:0,classes:0});
}

function permutations(n){
  const out=[],a=Array.from({length:n},(_,i)=>i);
  function visit(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){
      [a[i],a[j]]=[a[j],a[i]];
      visit(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
  }
  visit(0);
  return out;
}

function normalizeMaskAntichain(raw){
  const unique=[...new Set(raw)].sort((a,b)=>a-b),out=[];
  for(let i=0;i<unique.length;i++){
    const a=unique[i];
    let absorbed=false;
    for(let j=0;j<unique.length;j++)if(i!==j){
      const b=unique[j];
      if(a!==b&&(a&b)===b){absorbed=true;break;}
    }
    if(!absorbed)out.push(a);
  }
  return out;
}

function normalizeResidualAntichain(winMasks,selfBits,opponentBits){
  const raw=[];
  for(const mask of winMasks){
    if(mask&opponentBits)continue;
    const residual=mask&~selfBits;
    if(residual)raw.push(residual);
  }
  return normalizeMaskAntichain(raw);
}

function heightsFromBits(p0,p1,width,height){
  const occ=p0|p1,h=new Uint8Array(width);
  for(let c=0;c<width;c++)
    while(h[c]<height&&(occ&(1<<(h[c]*width+c))))h[c]++;
  return h;
}

function columnPermutationData(width,height){
  return permutations(width).map(perm=>{
    const cellMap=new Uint8Array(width*height);
    for(let row=0;row<height;row++)for(let oldCol=0;oldCol<width;oldCol++)
      cellMap[row*width+oldCol]=row*width+perm[oldCol];
    return {perm,cellMap,maskCache:new Map([[0,0]])};
  });
}

function permuteMask(mask,pd){
  const known=pd.maskCache.get(mask);
  if(known!==undefined)return known;
  let rest=mask>>>0,out=0;
  while(rest){
    const low=rest&-rest,bit=31-Math.clz32(low);
    out|=1<<pd.cellMap[bit];
    rest=(rest^low)>>>0;
  }
  out>>>=0;
  pd.maskCache.set(mask,out);
  return out;
}

function serializeResidualQ(heights,r0,r1,permutationData){
  if(!permutationData)
    return Array.from(heights).join(',')+'|'+r0.join('.')+'|'+r1.join('.');
  const {perm}=permutationData,newHeights=new Uint8Array(heights.length);
  for(let oldCol=0;oldCol<heights.length;oldCol++)
    newHeights[perm[oldCol]]=heights[oldCol];
  const a=r0.map(mask=>permuteMask(mask,permutationData)).sort((x,y)=>x-y),
    b=r1.map(mask=>permuteMask(mask,permutationData)).sort((x,y)=>x-y);
  return Array.from(newHeights).join(',')+'|'+a.join('.')+'|'+b.join('.');
}

function canonicalResidualQState(heights,r0,r1,permutationData){
  let best=null,bestHeights=null,bestR0=null,bestR1=null;
  for(const pd of permutationData){
    const {perm}=pd,h=new Uint8Array(heights.length);
    for(let oldCol=0;oldCol<heights.length;oldCol++)
      h[perm[oldCol]]=heights[oldCol];
    const a=r0.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      b=r1.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      signature=Array.from(h).join(',')+'|'+a.join('.')+'|'+b.join('.');
    if(best===null||signature<best){
      best=signature;
      bestHeights=h;
      bestR0=a;
      bestR1=b;
    }
  }
  return {signature:best,heights:bestHeights,r0:bestR0,r1:bestR1};
}


function factorialSmall(n){
  let out=1;
  for(let i=2;i<=n;i++)out*=i;
  return out;
}

function refinementColumnSignatures(heights,r0,r1,width,height){
  let colors=Array.from(heights),iterations=0,signatures=[];
  const requirements=[
    ...r0.map(mask=>({player:0,mask})),
    ...r1.map(mask=>({player:1,mask})),
  ];

  for(let round=0;round<=width+height+requirements.length;round++){
    const contributions=Array.from({length:width},()=>[]);
    for(const {player,mask} of requirements){
      const cells=[];
      let rest=mask>>>0;
      while(rest){
        const low=rest&-rest,bit=31-Math.clz32(low),
          row=Math.floor(bit/width),col=bit%width;
        cells.push({row,col,color:colors[col]});
        rest=(rest^low)>>>0;
      }
      const reqSig=cells.map(x=>`${x.row}:${x.color}`).sort().join(',');
      for(const x of cells)
        contributions[x.col].push(`${player}:${x.row}:[${reqSig}]`);
    }
    signatures=Array.from({length:width},(_,col)=>
      `${heights[col]}|${contributions[col].sort().join(';')}`);
    const unique=[...new Set(signatures)].sort(),
      ids=new Map(unique.map((sig,index)=>[sig,index])),
      next=signatures.map(sig=>ids.get(sig));
    iterations=round+1;
    if(next.every((x,i)=>x===colors[i]))break;
    const samePartition=next.every((x,i)=>next.every((y,j)=>
      (x===y)===(colors[i]===colors[j])));
    colors=next;
    if(samePartition){
      // The partition is stable even if canonical numeric labels were renumbered.
      // Recompute once with the canonical labels and stop.
      const c2=Array.from({length:width},()=>[]);
      for(const {player,mask} of requirements){
        const cells=[];
        let rest=mask>>>0;
        while(rest){
          const low=rest&-rest,bit=31-Math.clz32(low),
            row=Math.floor(bit/width),col=bit%width;
          cells.push({row,col,color:colors[col]});
          rest=(rest^low)>>>0;
        }
        const reqSig=cells.map(x=>`${x.row}:${x.color}`).sort().join(',');
        for(const x of cells)c2[x.col].push(`${player}:${x.row}:[${reqSig}]`);
      }
      signatures=Array.from({length:width},(_,col)=>
        `${heights[col]}|${c2[col].sort().join(';')}`);
      break;
    }
  }
  return {colors,signatures,iterations};
}

function makeColumnPermutation(width,height,order){
  const perm=new Uint8Array(width);
  for(let newCol=0;newCol<width;newCol++)perm[order[newCol]]=newCol;
  const cellMap=new Uint8Array(width*height);
  for(let row=0;row<height;row++)for(let oldCol=0;oldCol<width;oldCol++)
    cellMap[row*width+oldCol]=row*width+perm[oldCol];
  return {perm,cellMap,maskCache:new Map([[0,0]])};
}

function auditRefinedColumnCanonicalization(heights,r0,r1,width,height){
  const {signatures,iterations}=refinementColumnSignatures(
      heights,r0,r1,width,height),
    groups=new Map();
  for(let col=0;col<width;col++){
    let xs=groups.get(signatures[col]);
    if(!xs){xs=[];groups.set(signatures[col],xs);}
    xs.push(col);
  }

  const original=serializeResidualQ(heights,r0,r1,null);
  let exactTies=true,maxTieClass=1,permutationSearchUpperBound=1;
  for(const cols of groups.values()){
    maxTieClass=Math.max(maxTieClass,cols.length);
    permutationSearchUpperBound*=factorialSmall(cols.length);
    if(cols.length<2)continue;
    for(let i=0;i<cols.length&&exactTies;i++)for(let j=i+1;j<cols.length;j++){
      const order=Array.from({length:width},(_,x)=>x);
      [order[cols[i]],order[cols[j]]]=[order[cols[j]],order[cols[i]]];
      const pd=makeColumnPermutation(width,height,order);
      if(serializeResidualQ(heights,r0,r1,pd)!==original){
        exactTies=false;break;
      }
    }
  }

  const order=Array.from({length:width},(_,col)=>col).sort((a,b)=>
    signatures[a].localeCompare(signatures[b])||a-b),
    pd=makeColumnPermutation(width,height,order),
    canonicalSignature=serializeResidualQ(heights,r0,r1,pd);

  return {
    iterations,
    colorClasses:groups.size,
    maxTieClass,
    permutationSearchUpperBound,
    searchFree:exactTies,
    canonicalSignature,
  };
}


function pairRefinementColumnSignatures(heights,r0,r1,width,height){
  const first=refinementColumnSignatures(heights,r0,r1,width,height),
    requirements=[
      ...r0.map(mask=>({player:0,mask})),
      ...r1.map(mask=>({player:1,mask})),
    ].map(({player,mask})=>{
      const rowsByCol=Array.from({length:width},()=>[]),global=[];
      let rest=mask>>>0;
      while(rest){
        const low=rest&-rest,bit=31-Math.clz32(low),
          row=Math.floor(bit/width),col=bit%width;
        rowsByCol[col].push(row);
        global.push(row+':'+first.colors[col]);
        rest=(rest^low)>>>0;
      }
      for(const rows of rowsByCol)rows.sort((a,b)=>a-b);
      global.sort();
      return {player,rowsByCol,globalSig:global.join(',')};
    });

  const pairCount=width*width;
  let pairColors=new Array(pairCount),iterations=0;
  {
    const sigs=new Array(pairCount);
    for(let i=0;i<width;i++)for(let j=0;j<width;j++){
      const rel=[];
      for(const req of requirements){
        const a=req.rowsByCol[i],b=req.rowsByCol[j];
        if(!a.length&&!b.length)continue;
        rel.push(
          req.player+':['+a.join(',')+']:['+b.join(',')+']:['+req.globalSig+']'
        );
      }
      rel.sort();
      sigs[i*width+j]=
        (i===j?1:0)+'|'+first.signatures[i]+'|'+first.signatures[j]+'|'+rel.join(';');
    }
    const unique=[...new Set(sigs)].sort(),
      ids=new Map(unique.map((sig,index)=>[sig,index]));
    pairColors=sigs.map(sig=>ids.get(sig));
  }

  for(let round=0;round<=width;round++){
    const sigs=new Array(pairCount);
    for(let i=0;i<width;i++)for(let j=0;j<width;j++){
      const links=[];
      for(let k=0;k<width;k++)
        links.push(pairColors[i*width+k]+','+pairColors[k*width+j]);
      links.sort();
      sigs[i*width+j]=pairColors[i*width+j]+'|'+links.join(';');
    }
    const unique=[...new Set(sigs)].sort(),
      ids=new Map(unique.map((sig,index)=>[sig,index])),
      next=sigs.map(sig=>ids.get(sig));
    iterations=round+1;
    const samePartition=next.every((x,i)=>next.every((y,j)=>
      (x===y)===(pairColors[i]===pairColors[j])));
    pairColors=next;
    if(samePartition)break;
  }

  const signatures=Array.from({length:width},(_,i)=>{
    const rel=[];
    for(let j=0;j<width;j++)
      rel.push(pairColors[i*width+j]+','+pairColors[j*width+i]);
    rel.sort();
    return first.signatures[i]+'|D'+pairColors[i*width+i]+'|'+rel.join(';');
  });
  return {
    signatures,
    iterations:first.iterations+iterations,
  };
}

function auditPairRefinedColumnCanonicalization(heights,r0,r1,width,height){
  const {signatures,iterations}=pairRefinementColumnSignatures(
      heights,r0,r1,width,height),
    groups=new Map();
  for(let col=0;col<width;col++){
    let xs=groups.get(signatures[col]);
    if(!xs){xs=[];groups.set(signatures[col],xs);}
    xs.push(col);
  }

  const original=serializeResidualQ(heights,r0,r1,null);
  let exactTies=true,maxTieClass=1,permutationSearchUpperBound=1;
  for(const cols of groups.values()){
    maxTieClass=Math.max(maxTieClass,cols.length);
    permutationSearchUpperBound*=factorialSmall(cols.length);
    if(cols.length<2)continue;
    for(let i=0;i<cols.length&&exactTies;i++)for(let j=i+1;j<cols.length;j++){
      const order=Array.from({length:width},(_,x)=>x);
      [order[cols[i]],order[cols[j]]]=[order[cols[j]],order[cols[i]]];
      const pd=makeColumnPermutation(width,height,order);
      if(serializeResidualQ(heights,r0,r1,pd)!==original){
        exactTies=false;break;
      }
    }
  }

  const order=Array.from({length:width},(_,col)=>col).sort((a,b)=>
      signatures[a].localeCompare(signatures[b])||a-b),
    pd=makeColumnPermutation(width,height,order),
    canonicalSignature=serializeResidualQ(heights,r0,r1,pd);

  return {
    iterations,
    colorClasses:groups.size,
    maxTieClass,
    permutationSearchUpperBound,
    searchFree:exactTies,
    canonicalSignature,
  };
}


function gf2ParitySmall(x){
  let p=0;
  for(let v=x>>>0;v;v=(v&(v-1))>>>0)p^=1;
  return p;
}

function gf2RowBasisSmall(rows,width){
  const basis=new Array(width).fill(0);
  for(const row0 of rows){
    let row=row0>>>0;
    for(let bit=width-1;bit>=0;bit--)if((row>>>bit)&1){
      if(basis[bit])row=(row^basis[bit])>>>0;
      else{basis[bit]=row;break;}
    }
  }
  return basis.filter(Boolean);
}

function gf2InSpanSmall(row0,basis,width){
  let row=row0>>>0;
  const pivots=new Array(width).fill(0);
  for(const b of basis){
    const bit=31-Math.clz32(b);
    pivots[bit]=b;
  }
  for(let bit=width-1;bit>=0;bit--)if((row>>>bit)&1){
    if(!pivots[bit])return false;
    row=(row^pivots[bit])>>>0;
  }
  return true;
}

function gf2NullspaceBasisSmall(rows,width){
  const matrix=[...new Set(rows.map(x=>x>>>0).filter(Boolean))],
    pivots=[];
  let r=0;
  for(let col=0;col<width&&r<matrix.length;col++){
    let pivot=r;
    while(pivot<matrix.length&&!((matrix[pivot]>>>col)&1))pivot++;
    if(pivot===matrix.length)continue;
    [matrix[r],matrix[pivot]]=[matrix[pivot],matrix[r]];
    for(let i=0;i<matrix.length;i++)if(i!==r&&((matrix[i]>>>col)&1))
      matrix[i]=(matrix[i]^matrix[r])>>>0;
    pivots.push(col);
    r++;
  }
  matrix.length=r;
  const pivotSet=new Set(pivots),out=[];
  for(let free=0;free<width;free++)if(!pivotSet.has(free)){
    let x=(1<<free)>>>0;
    for(let i=0;i<pivots.length;i++)
      if(gf2ParitySmall(matrix[i]&x))x|=1<<pivots[i];
    out.push(x>>>0);
  }
  return gf2RowBasisSmall(out,width);
}

function binaryTieStateEncoding(heights,r0,r1,width,height){
  const {signatures}=refinementColumnSignatures(heights,r0,r1,width,height),
    entries=[...new Set(signatures)].sort().map(signature=>({
      signature,
      cols:Array.from({length:width},(_,c)=>c)
        .filter(c=>signatures[c]===signature),
    }));
  if(entries.some(x=>x.cols.length>2))
    return {binary:false,entries,pairCount:0,blocks:[]};
  const pairEntries=entries.filter(x=>x.cols.length===2);
  if(!pairEntries.length)
    return {binary:true,entries,pairCount:0,blocks:[]};
  const pairIndex=new Map(pairEntries.map((x,i)=>[x.signature,i])),
    rowPattern=(mask,col)=>{
      let p=0;
      for(let row=0;row<height;row++)
        if(mask&(1<<(row*width+col)))p|=1<<row;
      return p;
    },
    blocks=new Map();

  for(const [player,requirements] of [[0,r0],[1,r1]])
    for(const mask of requirements){
      let activeMask=0,orientation=0;
      const parts=[];
      for(const entry of entries){
        if(entry.cols.length===1){
          const p=rowPattern(mask,entry.cols[0]);
          parts.push('S:'+entry.signature+':'+p);
        }else{
          const [ca,cb]=entry.cols,
            a=rowPattern(mask,ca),b=rowPattern(mask,cb),
            lo=Math.min(a,b),hi=Math.max(a,b),
            pi=pairIndex.get(entry.signature);
          parts.push('P:'+entry.signature+':'+lo+','+hi);
          if(a!==b){
            activeMask|=1<<pi;
            if(a>b)orientation|=1<<pi;
          }
        }
      }
      const key=player+'|'+parts.join('|');
      let block=blocks.get(key);
      if(!block){
        block={key,activeMask:activeMask>>>0,vectors:new Set()};
        blocks.set(key,block);
      }
      assert.equal(block.activeMask,activeMask>>>0,
        'requirements in one binary orientation orbit must share active coordinates');
      block.vectors.add((orientation&activeMask)>>>0);
    }
  return {
    binary:true,
    entries,
    pairCount:pairEntries.length,
    blocks:[...blocks.values()].map(block=>({
      key:block.key,
      activeMask:block.activeMask,
      vectors:[...block.vectors].sort((a,b)=>a-b),
    })).sort((a,b)=>a.key.localeCompare(b.key)),
  };
}

function deriveBinaryTieStabilizer(encoding){
  const m=encoding.pairCount;
  if(!encoding.binary)return null;
  if(m===0)return {pairCount:0,basis:[],parityChecks:[],dimension:0};
  const allMask=((1<<m)-1)>>>0,constraints=[];
  for(const block of encoding.blocks){
    const values=block.vectors,set=new Set(values),
      t0=values[0]??0,valid=[];
    for(const t of values){
      const h=((t^t0)&block.activeMask)>>>0;
      if(values.every(q=>set.has((q^h)>>>0)))valid.push(h);
    }
    const blockBasis=gf2RowBasisSmall(valid,m);
    for(let bit=0;bit<m;bit++)if(!((block.activeMask>>>bit)&1))
      blockBasis.push((1<<bit)>>>0);
    const normalizedBasis=gf2RowBasisSmall(blockBasis,m),
      parityChecks=gf2NullspaceBasisSmall(normalizedBasis,m);
    constraints.push(...parityChecks);
  }
  const parityChecks=gf2RowBasisSmall(constraints,m),
    basis=gf2NullspaceBasisSmall(parityChecks,m);
  return {pairCount:m,basis,parityChecks,dimension:basis.length,allMask};
}

function exactBinaryTieAutomorphisms(
  heights,r0,r1,width,height,encoding,permutationData
){
  if(!encoding?.binary)return null;
  const entries=encoding.entries,original=serializeResidualQ(heights,r0,r1,null),
    vectors=[],unrepresented=[];
  for(const pd of permutationData){
    if(serializeResidualQ(heights,r0,r1,pd)!==original)continue;
    let vector=0,pair=0,valid=true;
    for(const entry of entries){
      const cols=entry.cols;
      if(cols.length===1){
        if(pd.perm[cols[0]]!==cols[0]){valid=false;break;}
      }else{
        const [a,b]=cols,pa=pd.perm[a],pb=pd.perm[b];
        if(pa===a&&pb===b){}
        else if(pa===b&&pb===a)vector|=1<<pair;
        else{valid=false;break;}
        pair++;
      }
    }
    if(valid)vectors.push(vector>>>0);
    else unrepresented.push(Array.from(pd.perm));
  }
  return {
    vectors:[...new Set(vectors)].sort((a,b)=>a-b),
    unrepresented,
  };
}

function auditConstructiveBinaryTieStabilizer(
  heights,r0,r1,width,height,permutationData
){
  const encoding=binaryTieStateEncoding(heights,r0,r1,width,height);
  if(!encoding.binary||encoding.pairCount===0)return null;
  const derived=deriveBinaryTieStabilizer(encoding),
    exact=exactBinaryTieAutomorphisms(
      heights,r0,r1,width,height,encoding,permutationData);
  const allExactInDerived=
    exact.unrepresented.length===0&&
    exact.vectors.every(v=>gf2InSpanSmall(
      v,derived.basis,derived.pairCount));
  return {
    pairCount:derived.pairCount,
    dimension:derived.dimension,
    basis:derived.basis,
    parityChecks:derived.parityChecks,
    exactVectors:exact.vectors,
    exactUnrepresented:exact.unrepresented.length,
    constructiveMatchesExact:
      allExactInDerived&&
      exact.vectors.length===2**derived.dimension,
  };
}

function applyUniversalFrontierBlocker(
  heights,r0,r1,width,height,{nonterminalOnly=false}={}
){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    mover=rank&1,own=mover?r1:r0;
  let frontier=0;
  for(let col=0;col<width;col++)if(heights[col]<height){
    const bit=1<<(heights[col]*width+col),
      immediateWin=own.some(requirement=>requirement===bit);
    if(!nonterminalOnly||!immediateWin)frontier|=bit;
  }
  if(!nonterminalOnly&&frontier===0)return {r0,r1,removed:0};
  if(mover){
    const next=r0.filter(requirement=>(requirement&frontier)!==frontier);
    return {r0:next,r1,removed:r0.length-next.length};
  }
  const next=r1.filter(requirement=>(requirement&frontier)!==frontier);
  return {r0,r1:next,removed:r1.length-next.length};
}

function applyMoverFinalCapParity(heights,r0,r1,width,height){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    remaining=width*height-rank;
  if(remaining<=0||(remaining&1))return {r0,r1,removed:0};
  let caps=0;
  for(let col=0;col<width;col++)if(heights[col]<height)
    caps|=1<<((height-1)*width+col);
  if(caps===0)return {r0,r1,removed:0};
  if(rank&1){
    const next=r1.filter(requirement=>(requirement&caps)!==caps);
    return {r0,r1:next,removed:r1.length-next.length};
  }
  const next=r0.filter(requirement=>(requirement&caps)!==caps);
  return {r0:next,r1,removed:r0.length-next.length};
}

export function analyzeUnlabelledQuotientDimension({width,height,k,auditResidualOrbit=false}){
  const cells=width*height;
  assert.ok(cells<=20,'Number-key research harness is intentionally bounded to <=20 cells');
  const masks=winMasks(width,height,k),span=2**cells,memo=new Map(),
    byRank=Array.from({length:cells+1},()=>[]);

  const keyOf=(p0,p1)=>p0*span+p1;
  const won=bits=>masks.some(mask=>(bits&mask)===mask);

  function enumerate(p0,p1,heights,rank){
    const key=keyOf(p0,p1),known=memo.get(key);
    if(known)return key;

    const p0Won=won(p0),p1Won=won(p1);
    assert.equal(p0Won&&p1Won,false,'first-win graph cannot contain dual winners');
    const terminal=p0Won||p1Won||rank===cells;
    const winner=p0Won?0:p1Won?1:null;
    const rec={key,p0,p1,rank,terminal,winner,children:[]};
    memo.set(key,rec);
    byRank[rank].push(rec);
    if(terminal)return key;

    for(let col=0;col<width;col++)if(heights[col]<height){
      const cell=heights[col]*width+col,bit=1<<cell;
      heights[col]++;
      const childKey=(rank&1)?
        enumerate(p0,p1|bit,heights,rank+1):
        enumerate(p0|bit,p1,heights,rank+1);
      heights[col]--;
      rec.children.push(childKey);
    }
    return key;
  }

  const rootKey=enumerate(0,0,new Uint8Array(width),0);

  // Producer: recursive action-unlabelled quotient. No W/D/L values are read.
  const stateClass=new Map(),signatureClass=new Map(),
    classSize=new Map(),statesByRank=Array(cells+1).fill(0),
    classesByRank=Array(cells+1).fill(0);
  let nextId=0,successorEdgesProcessed=0,
    statesWithDuplicateEquivalentMoves=0,duplicateEquivalentMoveEdges=0,
    maxClassSize=0;

  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    statesByRank[rank]++;
    let signature;
    if(rec.terminal){
      const terminalKind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
      signature=`T:${rank}:${terminalKind}`;
    }else{
      successorEdgesProcessed+=rec.children.length;
      const ids=rec.children.map(key=>{
        const id=stateClass.get(key);
        assert.notEqual(id,undefined,'child class must exist before parent class');
        return id;
      });
      const unique=[...new Set(ids)].sort((a,b)=>a-b);
      if(unique.length<ids.length){
        statesWithDuplicateEquivalentMoves++;
        duplicateEquivalentMoveEdges+=ids.length-unique.length;
      }
      signature=`N:${rank}:${rank&1}:${unique.join('.')}`;
    }
    let id=signatureClass.get(signature);
    if(id===undefined){
      id=nextId++;
      signatureClass.set(signature,id);
      classesByRank[rank]++;
    }
    stateClass.set(rec.key,id);
    const size=(classSize.get(id)??0)+1;
    classSize.set(id,size);
    if(size>maxClassSize)maxClassSize=size;
  }


  let residualOrbitAudit=null;
  if(auditResidualOrbit){
    const permutationData=columnPermutationData(width,height),
      orientationSignatures=new Set(),orbitToClasses=new Map(),
      orbitStateCount=new Map(),classToOrbits=new Map();

    for(const rec of memo.values()){
      const classId=stateClass.get(rec.key);
      let orientation,orbit;
      if(rec.terminal){
        const kind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
        orientation='T:'+rec.rank+':'+kind;
        orbit=orientation;
      }else{
        const heights=heightsFromBits(rec.p0,rec.p1,width,height),
          r0=normalizeResidualAntichain(masks,rec.p0,rec.p1),
          r1=normalizeResidualAntichain(masks,rec.p1,rec.p0);
        orientation='Q:'+serializeResidualQ(heights,r0,r1,null);
        orbit=null;
        for(const pd of permutationData){
          const candidate='Q:'+serializeResidualQ(heights,r0,r1,pd);
          if(orbit===null||candidate<orbit)orbit=candidate;
        }
      }
      orientationSignatures.add(orientation);
      let classes=orbitToClasses.get(orbit);
      if(!classes){classes=new Set();orbitToClasses.set(orbit,classes);}
      classes.add(classId);
      orbitStateCount.set(orbit,(orbitStateCount.get(orbit)??0)+1);
      let orbits=classToOrbits.get(classId);
      if(!orbits){orbits=new Set();classToOrbits.set(classId,orbits);}
      orbits.add(orbit);
    }

    let splitOrbitSignatures=0,splitOrbitStates=0,
      recursiveClassesWithMultipleOrbitSignatures=0,
      maxOrbitSignaturesPerRecursiveClass=0;
    for(const [signature,classes] of orbitToClasses)if(classes.size>1){
      splitOrbitSignatures++;
      splitOrbitStates+=orbitStateCount.get(signature)??0;
    }
    for(const orbits of classToOrbits.values()){
      if(orbits.size>1)recursiveClassesWithMultipleOrbitSignatures++;
      if(orbits.size>maxOrbitSignaturesPerRecursiveClass)
        maxOrbitSignaturesPerRecursiveClass=orbits.size;
    }

    residualOrbitAudit={
      basis:'support + normalized P0/P1 residual antichains',
      canonicalization:'all column-label permutations',
      permutations:permutationData.length,
      orientationSensitiveClasses:orientationSignatures.size,
      columnOrbitClasses:orbitToClasses.size,
      recursiveClasses:nextId,
      splitOrbitSignatures,
      splitOrbitStates,
      soundAgainstRecursiveQuotient:splitOrbitSignatures===0,
      recursiveClassesWithMultipleOrbitSignatures,
      maxOrbitSignaturesPerRecursiveClass,
      exactMatch:
        splitOrbitSignatures===0&&
        recursiveClassesWithMultipleOrbitSignatures===0&&
        orbitToClasses.size===nextId,
    };
  }

  // Validation only: derive exact W/D/L after producer classes are frozen.
  const values=new Map();
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    let value;
    if(rec.winner===0)value=1;
    else if(rec.winner===1)value=-1;
    else if(rec.terminal)value=0;
    else{
      const childValues=rec.children.map(key=>values.get(key));
      assert.ok(childValues.every(value=>value!==undefined));
      value=(rank&1)?Math.min(...childValues):Math.max(...childValues);
    }
    values.set(rec.key,value);
  }

  const classValueMask=new Map(),splitStatesByClass=new Map();
  for(const rec of memo.values()){
    const id=stateClass.get(rec.key),value=values.get(rec.key),
      bit=value<0?1:value>0?4:2;
    classValueMask.set(id,(classValueMask.get(id)??0)|bit);
    splitStatesByClass.set(id,(splitStatesByClass.get(id)??0)+1);
  }
  let wdlSplitClasses=0,wdlSplitStates=0;
  for(const [id,mask] of classValueMask)if((mask&(mask-1))!==0){
    wdlSplitClasses++;
    wdlSplitStates+=splitStatesByClass.get(id)??0;
  }

  const frontier=statesByRank.map((states,rank)=>({
    rank,states,classes:classesByRank[rank],
  })),root=memo.get(rootKey);

  return {
    schema:'connect4.unlabelled-quotient.dimension.v1',
    inputs:'geometry/gravity/turn-order/first-win/legal-successors',
    producerUsesOutcomeLabels:false,
    validationUsesDerivedWdl:true,
    width,height,k,cells,
    winningLineCount:masks.length,
    states:memo.size,
    successorEdgesProcessed,
    classes:nextId,
    stateClassRatio:memo.size/nextId,
    wdlSplitClasses,
    wdlSplitStates,
    rootValue:values.get(rootKey),
    rootLegalMoves:root.children.length,
    rootDistinctChildClasses:new Set(root.children.map(key=>stateClass.get(key))).size,
    statesWithDuplicateEquivalentMoves,
    duplicateEquivalentMoveEdges,
    maxClassSize,
    residualOrbitAudit,
    peakStateFrontier:peakBy(frontier,'states'),
    peakClassFrontier:peakBy(frontier,'classes'),
    frontier,
  };
}


export function analyzeDirectResidualOrbitGraph({width,height,k,universalFrontierBlocker=false,nonterminalFrontierBlocker=false,moverFinalCapParity=false,remainingMoveCapacity=false,supportReleaseTurnCapacity=false,measureLocalBranchClosure=true,auditColumnRefinement=false,auditPairColumnRefinement=false,auditBinaryTieStabilizers=false,auditOpponentResidualDeletion=false,auditEarliestMergeParents=false}){
  const cells=width*height;
  assert.ok(cells<=30,'direct residual-orbit harness is intentionally bounded to <=30 cells');
  const masks=winMasks(width,height,k),
    permutationData=columnPermutationData(width,height),
    nodes=new Map(),byRank=Array.from({length:cells+1},()=>[]);
  let literalActionEdges=0,duplicateEquivalentActionEdges=0;

  function addTerminal(rank,kind){
    const key='T:'+rank+':'+kind;
    if(!nodes.has(key)){
      const rec={key,rank,terminal:true,kind,children:[]};
      nodes.set(key,rec);
      byRank[rank].push(rec);
    }
    return key;
  }

  function visit(state){
    const key='Q:'+state.signature,known=nodes.get(key);
    if(known)return key;
    const rank=Array.from(state.heights).reduce((a,b)=>a+b,0),
      rec={
        key,rank,terminal:false,kind:null,
        heights:state.heights,r0:state.r0,r1:state.r1,children:[],
      };
    nodes.set(key,rec);
    byRank[rank].push(rec);

    for(let col=0;col<width;col++)if(state.heights[col]<height){
      literalActionEdges++;
      const cell=state.heights[col]*width+col,bit=1<<cell,mover=rank&1,
        own=mover?state.r1:state.r0,opponent=mover?state.r0:state.r1,
        ownNext=[];
      let wins=false;
      for(const requirement of own){
        if(requirement&bit){
          const residual=requirement&~bit;
          if(residual===0){wins=true;break;}
          ownNext.push(residual);
        }else ownNext.push(requirement);
      }

      let childKey;
      if(wins){
        childKey=addTerminal(rank+1,mover?'P1':'P0');
      }else{
        const nextHeights=new Uint8Array(state.heights);
        nextHeights[col]++;
        if(rank+1===cells){
          childKey=addTerminal(rank+1,'D');
        }else{
          const opponentNext=opponent.filter(requirement=>(requirement&bit)===0),
            ownNormalized=normalizeMaskAntichain(ownNext),
            opponentNormalized=normalizeMaskAntichain(opponentNext),
            r0=mover?opponentNormalized:ownNormalized,
            r1=mover?ownNormalized:opponentNormalized,
            blocked=(universalFrontierBlocker||nonterminalFrontierBlocker)?
              applyUniversalFrontierBlocker(
                nextHeights,r0,r1,width,height,{nonterminalOnly:nonterminalFrontierBlocker}):
              {r0,r1,removed:0},
            closed=moverFinalCapParity?
              applyMoverFinalCapParity(
                nextHeights,blocked.r0,blocked.r1,width,height):
              blocked,
            capacityClosed=remainingMoveCapacity?
              applyRemainingMoveCapacity(
                nextHeights,closed.r0,closed.r1,width,height):
              closed,
            releaseClosed=supportReleaseTurnCapacity?
              applySupportReleaseTurnCapacity(
                nextHeights,capacityClosed.r0,capacityClosed.r1,width,height):
              capacityClosed,
            canonical=canonicalResidualQState(
              nextHeights,releaseClosed.r0,releaseClosed.r1,permutationData);
          childKey=visit(canonical);
        }
      }
      rec.children.push(childKey);
    }
    duplicateEquivalentActionEdges+=
      rec.children.length-new Set(rec.children).size;
    return key;
  }

  const initialResidual=normalizeMaskAntichain(masks),
    rootHeights=new Uint8Array(width),
    rootBlocked=(universalFrontierBlocker||nonterminalFrontierBlocker)?
      applyUniversalFrontierBlocker(
        rootHeights,initialResidual,initialResidual,width,height,{nonterminalOnly:nonterminalFrontierBlocker}):
      {r0:initialResidual,r1:initialResidual,removed:0},
    rootClosed=moverFinalCapParity?
      applyMoverFinalCapParity(
        rootHeights,rootBlocked.r0,rootBlocked.r1,width,height):
      rootBlocked,
    rootCapacityClosed=remainingMoveCapacity?
      applyRemainingMoveCapacity(
        rootHeights,rootClosed.r0,rootClosed.r1,width,height):
      rootClosed,
    rootReleaseClosed=supportReleaseTurnCapacity?
      applySupportReleaseTurnCapacity(
        rootHeights,rootCapacityClosed.r0,rootCapacityClosed.r1,width,height):
      rootCapacityClosed,
    root=canonicalResidualQState(
      rootHeights,rootReleaseClosed.r0,rootReleaseClosed.r1,permutationData),
    rootKey=visit(root);

  const stateClass=new Map(),signatureClass=new Map(),
    statesByRank=Array(cells+1).fill(0),classesByRank=Array(cells+1).fill(0);
  let nextId=0;
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    statesByRank[rank]++;
    let signature;
    if(rec.terminal)signature=rec.key;
    else{
      const ids=rec.children.map(child=>{
        const id=stateClass.get(child);
        assert.notEqual(id,undefined,'direct q child class must exist');
        return id;
      }),unique=[...new Set(ids)].sort((a,b)=>a-b);
      signature='N:'+rank+':'+(rank&1)+':'+unique.join('.');
    }
    let id=signatureClass.get(signature);
    if(id===undefined){
      id=nextId++;
      signatureClass.set(signature,id);
      classesByRank[rank]++;
    }
    stateClass.set(rec.key,id);
  }

  let localBranchClosureResult=null;
  if(measureLocalBranchClosure){
    function samePartition(candidate,reference){
      const aToB=new Map(),bToA=new Map();
      for(const key of nodes.keys()){
        const a=candidate.get(key),b=reference.get(key);
        if(aToB.has(a)&&aToB.get(a)!==b)return false;
        if(bToA.has(b)&&bToA.get(b)!==a)return false;
        aToB.set(a,b);bToA.set(b,a);
      }
      return true;
    }
  
    let localClass;
    {
      const terminalIds=new Map(),next=new Map();
      let id=0;
      for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
        if(rec.terminal){
          const sig='T:'+rec.rank+':'+rec.kind;
          let classId=terminalIds.get(sig);
          if(classId===undefined){classId=id++;terminalIds.set(sig,classId);}
          next.set(rec.key,classId);
        }else next.set(rec.key,id++);
      }
      localClass=next;
    }
  
    const localBranchClosure=[{
      round:0,
      classes:new Set(localClass.values()).size,
      matchesFull:samePartition(localClass,stateClass),
    }];
    let localRoundsToFull=localBranchClosure[0].matchesFull?0:null;
    for(let round=1;round<=cells&&localRoundsToFull===null;round++){
      const signatureToId=new Map(),next=new Map();
      let id=0;
      for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
        let sig;
        if(rec.terminal)sig='T:'+rec.rank+':'+rec.kind;
        else{
          const childIds=rec.children.map(child=>localClass.get(child));
          assert.ok(childIds.every(x=>x!==undefined));
          const unique=[...new Set(childIds)].sort((a,b)=>a-b);
          sig='N:'+rec.rank+':'+(rec.rank&1)+':'+unique.join('.');
        }
        let classId=signatureToId.get(sig);
        if(classId===undefined){classId=id++;signatureToId.set(sig,classId);}
        next.set(rec.key,classId);
      }
      localClass=next;
      const matchesFull=samePartition(localClass,stateClass);
      localBranchClosure.push({
        round,
        classes:new Set(localClass.values()).size,
        matchesFull,
      });
      if(matchesFull)localRoundsToFull=round;
    }
    assert.notEqual(localRoundsToFull,null,
      'iterated local branch closure must recover full recursive quotient');
  
  
    localBranchClosureResult={
      roundsToFull:localRoundsToFull,
      rounds:localBranchClosure,
    };
  }

  let columnRefinementAudit=null;
  if(auditColumnRefinement){
    let auditedStates=0,searchFreeStates=0,fallbackStates=0,
      maxIterations=0,maxTieClass=1,maxPermutationSearchUpperBound=1,
      canonicalCollisions=0;
    const seenCanonical=new Map(),fallbackExamples=[];
    for(const rec of nodes.values()){
      if(rec.terminal)continue;
      const a=auditRefinedColumnCanonicalization(
        rec.heights,rec.r0,rec.r1,width,height);
      auditedStates++;
      maxIterations=Math.max(maxIterations,a.iterations);
      maxTieClass=Math.max(maxTieClass,a.maxTieClass);
      maxPermutationSearchUpperBound=Math.max(
        maxPermutationSearchUpperBound,a.permutationSearchUpperBound);
      if(a.searchFree){
        searchFreeStates++;
        const prior=seenCanonical.get(a.canonicalSignature);
        if(prior!==undefined&&prior!==rec.key)canonicalCollisions++;
        else seenCanonical.set(a.canonicalSignature,rec.key);
      }else{
        fallbackStates++;
        if(fallbackExamples.length<32)fallbackExamples.push({
          support:Array.from(rec.heights),
          p0Residuals:[...rec.r0],
          p1Residuals:[...rec.r1],
          iterations:a.iterations,
          colorClasses:a.colorClasses,
          maxTieClass:a.maxTieClass,
          permutationSearchUpperBound:a.permutationSearchUpperBound,
        });
      }
    }
    columnRefinementAudit={
      method:'iterated column incidence color refinement + exact tie automorphism check',
      auditedStates,
      searchFreeStates,
      fallbackStates,
      searchFreeFraction:auditedStates?searchFreeStates/auditedStates:1,
      maxIterations,
      maxTieClass,
      maxPermutationSearchUpperBound,
      canonicalCollisions,
      exactOnSearchFreeStates:canonicalCollisions===0,
      fallbackExamples,
    };
  }

  let pairColumnRefinementAudit=null;
  if(auditPairColumnRefinement){
    let auditedStates=0,searchFreeStates=0,fallbackStates=0,
      maxIterations=0,maxTieClass=1,maxPermutationSearchUpperBound=1,
      canonicalCollisions=0;
    const seenCanonical=new Map(),fallbackExamples=[];
    for(const rec of nodes.values()){
      if(rec.terminal)continue;
      const a=auditPairRefinedColumnCanonicalization(
        rec.heights,rec.r0,rec.r1,width,height);
      auditedStates++;
      maxIterations=Math.max(maxIterations,a.iterations);
      maxTieClass=Math.max(maxTieClass,a.maxTieClass);
      maxPermutationSearchUpperBound=Math.max(
        maxPermutationSearchUpperBound,a.permutationSearchUpperBound);
      if(a.searchFree){
        searchFreeStates++;
        const prior=seenCanonical.get(a.canonicalSignature);
        if(prior!==undefined&&prior!==rec.key)canonicalCollisions++;
        else seenCanonical.set(a.canonicalSignature,rec.key);
      }else{
        fallbackStates++;
        if(fallbackExamples.length<32)fallbackExamples.push({
          support:Array.from(rec.heights),
          p0Residuals:[...rec.r0],
          p1Residuals:[...rec.r1],
          iterations:a.iterations,
          colorClasses:a.colorClasses,
          maxTieClass:a.maxTieClass,
          permutationSearchUpperBound:a.permutationSearchUpperBound,
        });
      }
    }
    pairColumnRefinementAudit={
      method:'second-order ordered column-pair refinement + exact tie automorphism check',
      auditedStates,
      searchFreeStates,
      fallbackStates,
      searchFreeFraction:auditedStates?searchFreeStates/auditedStates:1,
      maxIterations,
      maxTieClass,
      maxPermutationSearchUpperBound,
      canonicalCollisions,
      exactOnSearchFreeStates:canonicalCollisions===0,
      fallbackExamples,
    };
  }


  let binaryTieStabilizerAudit=null;
  if(auditBinaryTieStabilizers){
    const rows=[];
    for(const rec of nodes.values()){
      if(rec.terminal)continue;
      const refinement=auditRefinedColumnCanonicalization(
        rec.heights,rec.r0,rec.r1,width,height);
      if(refinement.searchFree)continue;
      const row=auditConstructiveBinaryTieStabilizer(
        rec.heights,rec.r0,rec.r1,width,height,permutationData);
      if(row)rows.push({
        support:Array.from(rec.heights),
        ...row,
      });
    }
    binaryTieStabilizerAudit={
      fallbackStates:rows.length,
      constructiveMatchesExact:
        rows.every(row=>row.constructiveMatchesExact),
      pairCounts:[...new Set(rows.map(row=>row.pairCount))].sort((a,b)=>a-b),
      dimensions:[...new Set(rows.map(row=>row.dimension))].sort((a,b)=>a-b),
      parityCheckSets:[...new Set(rows.map(row=>
        row.parityChecks.join(',')))].sort(),
      exactVectorSets:[...new Set(rows.map(row=>
        row.exactVectors.join(',')))].sort(),
      rows,
    };
  }

  let opponentResidualDeletionAudit=null;
  if(auditOpponentResidualDeletion){
    const rows=[],byRankAudit=Array.from({length:cells+1},(_,rank)=>({
      rank,
      testedDeletions:0,
      reachableDeletionStates:0,
      classPreservingDeletions:0,
    }));
    const bitCount=mask=>{
      let n=0;
      for(let v=mask>>>0;v;v=(v&(v-1))>>>0)n++;
      return n;
    };
    for(const rec of nodes.values()){
      if(rec.terminal)continue;
      const rank=rec.rank,mover=rank&1,
        opponent=mover?rec.r0:rec.r1,
        own=mover?rec.r1:rec.r0,
        frontierCells=[],
        capCells=[];
      let frontierMask=0,capMask=0;
      for(let col=0;col<width;col++)if(rec.heights[col]<height){
        const frontierBit=1<<(rec.heights[col]*width+col),
          capBit=1<<((height-1)*width+col);
        frontierMask|=frontierBit;
        capMask|=capBit;
        frontierCells.push(frontierBit>>>0);
        capCells.push(capBit>>>0);
      }
      frontierMask>>>=0;capMask>>>=0;

      for(let i=0;i<opponent.length;i++){
        const removed=opponent[i]>>>0,
          opponentNext=opponent.filter((_,j)=>j!==i),
          r0=mover?opponentNext:own,
          r1=mover?own:opponentNext,
          canonical=canonicalResidualQState(
            rec.heights,r0,r1,permutationData),
          candidateKey='Q:'+canonical.signature,
          candidate=nodes.get(candidateKey),
          audit=byRankAudit[rank];
        audit.testedDeletions++;
        if(!candidate)continue;
        audit.reachableDeletionStates++;
        const sameClass=stateClass.get(candidateKey)===stateClass.get(rec.key);
        if(!sameClass)continue;
        audit.classPreservingDeletions++;

        const depths=[];
        let rest=removed;
        while(rest){
          const low=rest&-rest,bit=31-Math.clz32(low),
            row=Math.floor(bit/width),col=bit%width;
          depths.push(row-rec.heights[col]+1);
          rest=(rest^low)>>>0;
        }
        depths.sort((a,b)=>a-b);
        rows.push({
          rank,
          support:Array.from(rec.heights),
          mover,
          removedResidual:removed,
          removedResidualSize:bitCount(removed),
          removedFrontierHits:bitCount(removed&frontierMask),
          removedCapHits:bitCount(removed&capMask),
          equalsOpenCaps:removed===capMask,
          containsAllOpenCaps:(removed&capMask)===capMask,
          frontierSubsetOfResidual:(frontierMask&removed)===frontierMask,
          supportDepths:depths,
          sourceP0Residuals:[...rec.r0],
          sourceP1Residuals:[...rec.r1],
          targetP0Residuals:[...canonical.r0],
          targetP1Residuals:[...canonical.r1],
          sourceClass:stateClass.get(rec.key),
          targetClass:stateClass.get(candidateKey),
        });
      }
    }
    opponentResidualDeletionAudit={
      testedDeletions:byRankAudit.reduce((n,x)=>n+x.testedDeletions,0),
      reachableDeletionStates:
        byRankAudit.reduce((n,x)=>n+x.reachableDeletionStates,0),
      classPreservingDeletions:
        byRankAudit.reduce((n,x)=>n+x.classPreservingDeletions,0),
      exactOpenCapDeletions:rows.filter(x=>x.equalsOpenCaps).length,
      containsAllOpenCapsDeletions:
        rows.filter(x=>x.containsAllOpenCaps).length,
      byRank:byRankAudit,
      examples:rows.slice(0,128),
    };
  }


  // Post-hoc exact W/D/L validation on the direct q-orbit graph.
  const values=new Map(),classValueMask=new Map();
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    let value;
    if(rec.terminal)
      value=rec.kind==='P0'?1:rec.kind==='P1'?-1:0;
    else{
      const childValues=rec.children.map(child=>values.get(child));
      assert.ok(childValues.every(x=>x!==undefined));
      value=(rank&1)?Math.min(...childValues):Math.max(...childValues);
    }
    values.set(rec.key,value);
    const id=stateClass.get(rec.key),bit=value<0?1:value>0?4:2;
    classValueMask.set(id,(classValueMask.get(id)??0)|bit);
  }
  let wdlSplitClasses=0;
  for(const mask of classValueMask.values())
    if((mask&(mask-1))!==0)wdlSplitClasses++;

  const frontier=statesByRank.map((states,rank)=>({
      rank,states,classes:classesByRank[rank],
    })),
    rootRec=nodes.get(rootKey),
    orbitIndex=new Map([...nodes.keys()].map((key,index)=>[key,index])),
    dynamicMergeByRank=[];
  let earliestDynamicMergeRank=null,earliestDynamicMergeGroups=[],
    earliestDynamicMergeRows=[];
  for(let rank=0;rank<=cells;rank++){
    const groups=new Map();
    for(const rec of byRank[rank]){
      const id=stateClass.get(rec.key);
      let rows=groups.get(id);
      if(!rows){rows=[];groups.set(id,rows);}
      rows.push(rec);
    }
    const merged=[...groups.entries()].filter(([,rows])=>rows.length>1);
    dynamicMergeByRank.push({
      rank,
      mergedRecursiveClasses:merged.length,
      orbitExcess:merged.reduce((n,[,rows])=>n+rows.length-1,0),
      maxOrbitStatesPerRecursiveClass:merged.reduce(
        (m,[,rows])=>Math.max(m,rows.length),1),
    });
    if(earliestDynamicMergeRank===null&&merged.length){
      earliestDynamicMergeRank=rank;
      earliestDynamicMergeRows=merged.slice(0,64);
      earliestDynamicMergeGroups=earliestDynamicMergeRows.map(([classId,rows])=>({
        classId,
        orbitStates:rows.map(rec=>({
          orbitIndex:orbitIndex.get(rec.key),
          support:rec.heights?Array.from(rec.heights):null,
          p0Residuals:rec.r0??null,
          p1Residuals:rec.r1??null,
          childOrbitIndices:rec.children.map(key=>orbitIndex.get(key)),
          childRecursiveClasses:[...new Set(
            rec.children.map(key=>stateClass.get(key)))].sort((a,b)=>a-b),
        })),
      }));
    }
  }


  let earliestDynamicMergeParentAudit=null;
  if(auditEarliestMergeParents&&earliestDynamicMergeRows.length){
    const parentsByChild=new Map();
    for(const parent of nodes.values()){
      if(parent.terminal)continue;
      const legalColumns=[];
      for(let col=0;col<width;col++)
        if(parent.heights[col]<height)legalColumns.push(col);
      assert.equal(legalColumns.length,parent.children.length);
      const columnsByChild=new Map();
      parent.children.forEach((child,index)=>{
        let cols=columnsByChild.get(child);
        if(!cols){cols=[];columnsByChild.set(child,cols);}
        cols.push(legalColumns[index]);
      });
      for(const [child,columns] of columnsByChild){
        let rows=parentsByChild.get(child);
        if(!rows){rows=[];parentsByChild.set(child,rows);}
        rows.push({parent,columns});
      }
    }

    const groups=earliestDynamicMergeRows.map(([classId,rows])=>{
      const childKeys=rows.map(rec=>rec.key),
        parentEntries=childKeys.map(key=>parentsByChild.get(key)??[]),
        parentMaps=parentEntries.map(entries=>new Map(
          entries.map(entry=>[entry.parent.key,entry]))),
        parentClassMaps=parentEntries.map(entries=>{
          const map=new Map();
          for(const entry of entries){
            const parentClass=stateClass.get(entry.parent.key);
            let xs=map.get(parentClass);
            if(!xs){xs=[];map.set(parentClass,xs);}
            xs.push(entry);
          }
          return map;
        }),
        commonParentKeys=parentMaps.length?
          [...parentMaps[0].keys()].filter(key=>
            parentMaps.every(map=>map.has(key))):[],
        commonParentClasses=parentClassMaps.length?
          [...parentClassMaps[0].keys()].filter(parentClass=>
            parentClassMaps.every(map=>map.has(parentClass))):[];
      return {
        classId,
        childOrbitIndices:rows.map(rec=>orbitIndex.get(rec.key)),
        commonParents:commonParentKeys.map(key=>{
          const parent=parentMaps[0].get(key).parent;
          return {
            parentOrbitIndex:orbitIndex.get(key),
            parentRank:parent.rank,
            parentClass:stateClass.get(key),
            parentSupport:Array.from(parent.heights),
            parentP0Residuals:[...parent.r0],
            parentP1Residuals:[...parent.r1],
            actionColumns:parentMaps.map(map=>map.get(key).columns),
          };
        }),
        commonParentClasses:commonParentClasses.map(parentClass=>({
          parentClass,
          perChild:parentClassMaps.map(map=>
            map.get(parentClass).map(entry=>({
              parentOrbitIndex:orbitIndex.get(entry.parent.key),
              parentRank:entry.parent.rank,
              parentSupport:Array.from(entry.parent.heights),
              parentP0Residuals:[...entry.parent.r0],
              parentP1Residuals:[...entry.parent.r1],
              actionColumns:entry.columns,
            }))),
        })),
      };
    });
    earliestDynamicMergeParentAudit={
      groups:groups.length,
      groupsWithCommonParent:
        groups.filter(group=>group.commonParents.length>0).length,
      groupsWithoutCommonParent:
        groups.filter(group=>group.commonParents.length===0).length,
      totalCommonParents:groups.reduce(
        (n,group)=>n+group.commonParents.length,0),
      groupsWithCommonParentClass:
        groups.filter(group=>group.commonParentClasses.length>0).length,
      groupsWithoutCommonParentClass:
        groups.filter(group=>group.commonParentClasses.length===0).length,
      totalCommonParentClasses:groups.reduce(
        (n,group)=>n+group.commonParentClasses.length,0),
      rows:groups,
    };
  }


  return {
    schema:'connect4.direct-residual-orbit-graph.v1',
    inputs:'root geometry + residual-antichain cofactor rules + support + action relabeling',
    physicalBoardStatesEnumerated:false,
    outcomeLabelsUsedByProducer:false,
    validationUsesDerivedWdl:true,
    width,height,k,cells,
    columnPermutations:permutationData.length,
    universalFrontierBlocker,
    nonterminalFrontierBlocker,
    moverFinalCapParity,
    remainingMoveCapacity,
    supportReleaseTurnCapacity,
    measureLocalBranchClosure,
    auditColumnRefinement,
    auditPairColumnRefinement,
    auditBinaryTieStabilizers,
    auditOpponentResidualDeletion,
    auditEarliestMergeParents,
    winningLineCount:masks.length,
    residualOrbitStates:nodes.size,
    literalActionEdges,
    duplicateEquivalentActionEdges,
    recursiveUnlabelledClasses:nextId,
    wdlSplitClasses,
    rootValue:values.get(rootKey),
    rootLegalActions:rootRec.children.length,
    rootDistinctOrbitChildren:new Set(rootRec.children).size,
    rootDistinctRecursiveChildren:
      new Set(rootRec.children.map(child=>stateClass.get(child))).size,
    earliestDynamicMergeRank,
    earliestDynamicMergeGroups,
    earliestDynamicMergeParentAudit,
    dynamicMergeByRank,
    columnRefinementAudit,
    pairColumnRefinementAudit,
    binaryTieStabilizerAudit,
    opponentResidualDeletionAudit,
    localBranchClosure:localBranchClosureResult,
    peakOrbitStateFrontier:peakBy(frontier,'states'),
    peakRecursiveClassFrontier:peakBy(frontier,'classes'),
    frontier,
  };
}



function applyRemainingMoveCapacity(heights,r0,r1,width,height){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    remaining=width*height-rank,
    mover=rank&1,
    moverMoves=Math.ceil(remaining/2),
    opponentMoves=Math.floor(remaining/2),
    p0Moves=mover===0?moverMoves:opponentMoves,
    p1Moves=mover===1?moverMoves:opponentMoves,
    popcount=mask=>{
      let n=0;
      for(let v=mask>>>0;v;v=(v&(v-1))>>>0)n++;
      return n;
    },
    next0=r0.filter(requirement=>popcount(requirement)<=p0Moves),
    next1=r1.filter(requirement=>popcount(requirement)<=p1Moves);
  return {
    r0:next0,
    r1:next1,
    removed:(r0.length-next0.length)+(r1.length-next1.length),
    p0Moves,
    p1Moves,
  };
}


function residualFitsSupportReleaseTurns(
  requirement,heights,width,height,player
){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    remaining=width*height-rank,
    mover=rank&1,
    releases=[];
  let rest=requirement>>>0;
  while(rest){
    const low=rest&-rest,bit=31-Math.clz32(low),
      row=Math.floor(bit/width),col=bit%width,
      release=row-heights[col]+1;
    assert.ok(release>0,
      'residual requirements must refer only to future cells');
    releases.push(release);
    rest=(rest^low)>>>0;
  }
  releases.sort((a,b)=>a-b);
  let slot=player===mover?1:2;
  for(const release of releases){
    while(slot<release)slot+=2;
    if(slot>remaining)return false;
    slot+=2;
  }
  return true;
}

function applySupportReleaseTurnCapacity(heights,r0,r1,width,height){
  const next0=r0.filter(requirement=>
      residualFitsSupportReleaseTurns(
        requirement,heights,width,height,0)),
    next1=r1.filter(requirement=>
      residualFitsSupportReleaseTurns(
        requirement,heights,width,height,1));
  return {
    r0:next0,
    r1:next1,
    removed:(r0.length-next0.length)+(r1.length-next1.length),
  };
}

function canonicalResidualQStateCompact(heights,r0,r1,permutationData){
  let best=null,bestHeights=null,bestR0=null,bestR1=null;
  for(const pd of permutationData){
    const {perm}=pd,h=new Uint8Array(heights.length);
    for(let oldCol=0;oldCol<heights.length;oldCol++)
      h[perm[oldCol]]=heights[oldCol];
    const a=r0.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      b=r1.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      signature=Array.from(h).join(',')+'|'+
        a.map(x=>(x>>>0).toString(36)).join('.')+'|'+
        b.map(x=>(x>>>0).toString(36)).join('.');
    if(best===null||signature<best){
      best=signature;
      bestHeights=h;
      bestR0=a;
      bestR1=b;
    }
  }
  return {signature:best,heights:bestHeights,r0:bestR0,r1:bestR1};
}


function permutationsOfValues(values){
  if(values.length<2)return [[...values]];
  const out=[],a=[...values];
  function visit(i){
    if(i===a.length){out.push([...a]);return;}
    for(let j=i;j<a.length;j++){
      [a[i],a[j]]=[a[j],a[i]];
      visit(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
  }
  visit(0);
  return out;
}


function gf2SolveAffineSmall(rows,rhs,width){
  const matrix=rows.map((mask,i)=>({
      mask:mask>>>0,
      rhs:(rhs[i]??0)&1,
    })),pivots=[];
  let r=0;
  for(let col=0;col<width&&r<matrix.length;col++){
    let pivot=r;
    while(pivot<matrix.length&&!((matrix[pivot].mask>>>col)&1))pivot++;
    if(pivot===matrix.length)continue;
    [matrix[r],matrix[pivot]]=[matrix[pivot],matrix[r]];
    for(let i=0;i<matrix.length;i++)if(i!==r&&((matrix[i].mask>>>col)&1)){
      matrix[i].mask=(matrix[i].mask^matrix[r].mask)>>>0;
      matrix[i].rhs^=matrix[r].rhs;
    }
    pivots.push(col);
    r++;
  }
  for(let i=r;i<matrix.length;i++)
    if(matrix[i].mask===0&&matrix[i].rhs)
      return {consistent:false,particular:0,basis:[]};
  let particular=0;
  for(let i=0;i<r;i++)if(matrix[i].rhs)
    particular|=1<<pivots[i];
  return {
    consistent:true,
    particular:particular>>>0,
    basis:gf2NullspaceBasisSmall(rows,width),
  };
}

function gf2MinAffineCosetSmall(offset,basis,width){
  let out=offset>>>0;
  const pivots=new Array(width).fill(0);
  for(const row of gf2RowBasisSmall(basis,width)){
    const bit=31-Math.clz32(row);
    pivots[bit]=row;
  }
  for(let bit=width-1;bit>=0;bit--)
    if(((out>>>bit)&1)&&pivots[bit])out=(out^pivots[bit])>>>0;
  return out;
}

function compareNumberArraysLex(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
  return a.length-b.length;
}

function canonicalBinaryTieOrientation(encoding){
  const m=encoding.pairCount;
  if(!encoding.binary)return null;
  if(m===0)return {
    orientation:0,
    candidateTranslations:0,
    remainingDimension:0,
  };
  const rows=[],rhs=[];
  let candidateTranslations=0;
  for(const block of encoding.blocks){
    const solution=gf2SolveAffineSmall(rows,rhs,m);
    assert.equal(solution.consistent,true,
      'binary tie canonicalization constraints must remain satisfiable');
    const active=block.activeMask>>>0,
      projectedBasis=gf2RowBasisSmall(
        solution.basis.map(x=>(x&active)>>>0).filter(Boolean),m),
      p0=(solution.particular&active)>>>0,
      candidateHs=new Set();
    let bestFirst=null;
    for(const v of block.vectors){
      const y=gf2MinAffineCosetSmall(
        ((v^p0)&active)>>>0,projectedBasis,m);
      if(bestFirst===null||y<bestFirst){
        bestFirst=y;
        candidateHs.clear();
      }
      if(y===bestFirst)candidateHs.add(((v^y)&active)>>>0);
    }

    let bestImage=null,bestH=0;
    for(const h of candidateHs){
      candidateTranslations++;
      const image=block.vectors
        .map(v=>((v^h)&active)>>>0)
        .sort((a,b)=>a-b);
      if(bestImage===null||compareNumberArraysLex(image,bestImage)<0||
          (compareNumberArraysLex(image,bestImage)===0&&h<bestH)){
        bestImage=image;
        bestH=h;
      }
    }
    assert.notEqual(bestImage,null,
      'binary tie block must have a canonical translated image');

    const stabilizer=deriveBinaryTieStabilizer({
      binary:true,
      pairCount:m,
      blocks:[block],
    });
    for(const check of stabilizer.parityChecks){
      rows.push(check>>>0);
      rhs.push(gf2ParitySmall(check&bestH));
    }
  }
  const final=gf2SolveAffineSmall(rows,rhs,m);
  assert.equal(final.consistent,true,
    'binary tie canonical orientation must remain satisfiable');
  return {
    orientation:final.particular>>>0,
    candidateTranslations,
    remainingDimension:final.basis.length,
  };
}

function canonicalResidualQStateBinaryLinearCompact(heights,r0,r1,width,height){
  const encoding=binaryTieStateEncoding(heights,r0,r1,width,height);
  if(!encoding.binary)return null;
  const linear=canonicalBinaryTieOrientation(encoding),
    order=[];
  let pair=0;
  for(const entry of encoding.entries){
    if(entry.cols.length===1){
      order.push(entry.cols[0]);
    }else{
      const [a,b]=entry.cols;
      if((linear.orientation>>>pair)&1)order.push(b,a);
      else order.push(a,b);
      pair++;
    }
  }
  const pd=makeColumnPermutation(width,height,order),
    {perm}=pd,h=new Uint8Array(width);
  for(let oldCol=0;oldCol<width;oldCol++)
    h[perm[oldCol]]=heights[oldCol];
  const a=r0.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
    b=r1.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
    signature=Array.from(h).join(',')+'|'+
      a.map(x=>(x>>>0).toString(36)).join('.')+'|'+
      b.map(x=>(x>>>0).toString(36)).join('.');
  return {
    signature,
    heights:h,
    r0:a,
    r1:b,
    candidatePermutations:0,
    binaryLinear:true,
    linearTranslationCandidates:linear.candidateTranslations,
    remainingOrientationDimension:linear.remainingDimension,
  };
}


function canonicalResidualQStateRefinedCompact(heights,r0,r1,width,height){
  const {signatures}=refinementColumnSignatures(heights,r0,r1,width,height),
    grouped=new Map();
  for(let col=0;col<width;col++){
    let cols=grouped.get(signatures[col]);
    if(!cols){cols=[];grouped.set(signatures[col],cols);}
    cols.push(col);
  }
  const groupEntries=[...grouped.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0])),
    tieClassSizes=groupEntries
      .map(([,cols])=>cols.length)
      .filter(n=>n>1)
      .sort((a,b)=>b-a),
    groups=groupEntries.map(([,cols])=>permutationsOfValues(cols));
  let candidatePermutations=1;
  for(const group of groups)candidatePermutations*=group.length;

  let best=null,bestHeights=null,bestR0=null,bestR1=null;
  function consider(order){
    const pd=makeColumnPermutation(width,height,order),
      {perm}=pd,h=new Uint8Array(width);
    for(let oldCol=0;oldCol<width;oldCol++)
      h[perm[oldCol]]=heights[oldCol];
    const a=r0.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      b=r1.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      signature=Array.from(h).join(',')+'|'+
        a.map(x=>(x>>>0).toString(36)).join('.')+'|'+
        b.map(x=>(x>>>0).toString(36)).join('.');
    if(best===null||signature<best){
      best=signature;
      bestHeights=h;
      bestR0=a;
      bestR1=b;
    }
  }
  function expand(groupIndex,order){
    if(groupIndex===groups.length){consider(order);return;}
    for(const groupOrder of groups[groupIndex])
      expand(groupIndex+1,order.concat(groupOrder));
  }
  expand(0,[]);
  return {
    signature:best,
    heights:bestHeights,
    r0:bestR0,
    r1:bestR1,
    candidatePermutations,
    tieClassSizes,
  };
}

export function analyzeDirectResidualOrbitGrowthCompact({
  width,height,k,
  nonterminalFrontierBlocker=true,
  moverFinalCapParity=true,
  remainingMoveCapacity=false,
  refinedColumnCanonicalization=false,
  binaryTieLinearCanonicalization=false,
}){
  const cells=width*height;
  assert.ok(cells<=30,'compact direct-growth harness is intentionally bounded to <=30 cells');
  const masks=winMasks(width,height,k),
    permutationData=(refinedColumnCanonicalization||binaryTieLinearCanonicalization)?
      null:columnPermutationData(width,height),
    memo=new Map(),classSignatureToId=new Map(),
    statesByRank=Array(cells+1).fill(0),
    classesByRank=Array(cells+1).fill(0),
    mergedClassesByRank=Array(cells+1).fill(0),
    orbitExcessByRank=Array(cells+1).fill(0),
    maxOrbitStatesPerClassByRank=Array(cells+1).fill(1),
    classValueMask=[],classOrbitCount=[];
  let nextClassId=0,literalActionEdges=0,duplicateEquivalentActionEdges=0,
    earliestDynamicMergeRank=null,rootLegalActions=0,
    rootDistinctOrbitChildren=0,rootDistinctRecursiveChildren=0,
    canonicalPermutationCandidates=0,maxCanonicalPermutationCandidates=0,
    binaryLinearCanonicalizations=0,binaryLinearFallbackCanonicalizations=0,
    binaryLinearTranslationCandidates=0,maxBinaryLinearTranslationCandidates=0,
    remainingMoveCapacityRemovals=0;

  const pack=(classId,value)=>classId*3+(value+1),
    unpackClass=packed=>Math.floor(packed/3),
    unpackValue=packed=>(packed%3)-1;

  function canonicalize(heights,r0,r1){
    let out;
    if(binaryTieLinearCanonicalization){
      out=canonicalResidualQStateBinaryLinearCompact(
        heights,r0,r1,width,height);
      if(out){
        binaryLinearCanonicalizations++;
        binaryLinearTranslationCandidates+=out.linearTranslationCandidates;
        maxBinaryLinearTranslationCandidates=Math.max(
          maxBinaryLinearTranslationCandidates,out.linearTranslationCandidates);
      }else{
        binaryLinearFallbackCanonicalizations++;
        out=canonicalResidualQStateRefinedCompact(
          heights,r0,r1,width,height);
      }
    }else if(refinedColumnCanonicalization){
      out=canonicalResidualQStateRefinedCompact(
        heights,r0,r1,width,height);
    }else{
      out={
        ...canonicalResidualQStateCompact(heights,r0,r1,permutationData),
        candidatePermutations:permutationData.length,
      };
    }
    canonicalPermutationCandidates+=out.candidatePermutations;
    maxCanonicalPermutationCandidates=Math.max(
      maxCanonicalPermutationCandidates,out.candidatePermutations);
    return out;
  }

  function internClass(rank,signature,value){
    let id=classSignatureToId.get(signature);
    if(id===undefined){
      id=nextClassId++;
      classSignatureToId.set(signature,id);
      classesByRank[rank]++;
    }
    const bit=value<0?1:value>0?4:2;
    classValueMask[id]=(classValueMask[id]??0)|bit;
    const count=(classOrbitCount[id]??0)+1;
    classOrbitCount[id]=count;
    if(count===2){
      mergedClassesByRank[rank]++;
      if(earliestDynamicMergeRank===null||rank<earliestDynamicMergeRank)
        earliestDynamicMergeRank=rank;
    }
    if(count>1)orbitExcessByRank[rank]++;
    if(count>maxOrbitStatesPerClassByRank[rank])
      maxOrbitStatesPerClassByRank[rank]=count;
    return id;
  }

  function visitTerminal(rank,kind){
    const key='T:'+rank+':'+kind;
    if(memo.has(key))return {key,packed:memo.get(key)};
    statesByRank[rank]++;
    const value=kind==='P0'?1:kind==='P1'?-1:0,
      classId=internClass(rank,key,value),
      packed=pack(classId,value);
    memo.set(key,packed);
    return {key,packed};
  }

  function visit(state){
    const key='Q:'+state.signature;
    if(memo.has(key))return {key,packed:memo.get(key)};
    const rank=Array.from(state.heights).reduce((a,b)=>a+b,0),
      mover=rank&1,childKeys=[],childClasses=[],childValues=[];

    for(let col=0;col<width;col++)if(state.heights[col]<height){
      literalActionEdges++;
      const cell=state.heights[col]*width+col,bit=1<<cell,
        own=mover?state.r1:state.r0,opponent=mover?state.r0:state.r1,
        ownNext=[];
      let wins=false;
      for(const requirement of own){
        if(requirement&bit){
          const residual=requirement&~bit;
          if(residual===0){wins=true;break;}
          ownNext.push(residual);
        }else ownNext.push(requirement);
      }

      let child;
      if(wins){
        child=visitTerminal(rank+1,mover?'P1':'P0');
      }else{
        const nextHeights=new Uint8Array(state.heights);
        nextHeights[col]++;
        if(rank+1===cells){
          child=visitTerminal(rank+1,'D');
        }else{
          const opponentNext=opponent.filter(requirement=>(requirement&bit)===0),
            ownNormalized=normalizeMaskAntichain(ownNext),
            opponentNormalized=normalizeMaskAntichain(opponentNext),
            r0=mover?opponentNormalized:ownNormalized,
            r1=mover?ownNormalized:opponentNormalized,
            blocked=nonterminalFrontierBlocker?
              applyUniversalFrontierBlocker(
                nextHeights,r0,r1,width,height,{nonterminalOnly:true}):
              {r0,r1,removed:0},
            closed=moverFinalCapParity?
              applyMoverFinalCapParity(
                nextHeights,blocked.r0,blocked.r1,width,height):
              blocked,
            capacity=remainingMoveCapacity?
              applyRemainingMoveCapacity(
                nextHeights,closed.r0,closed.r1,width,height):
              {r0:closed.r0,r1:closed.r1,removed:0},
            canonical=canonicalize(
              nextHeights,capacity.r0,capacity.r1);
          remainingMoveCapacityRemovals+=capacity.removed;
          child=visit(canonical);
        }
      }
      childKeys.push(child.key);
      childClasses.push(unpackClass(child.packed));
      childValues.push(unpackValue(child.packed));
    }

    duplicateEquivalentActionEdges+=
      childKeys.length-new Set(childKeys).size;
    const uniqueClasses=[...new Set(childClasses)].sort((a,b)=>a-b),
      classSignature='N:'+rank+':'+mover+':'+
        uniqueClasses.map(x=>x.toString(36)).join('.'),
      value=mover?Math.min(...childValues):Math.max(...childValues);
    statesByRank[rank]++;
    const classId=internClass(rank,classSignature,value),
      packed=pack(classId,value);
    memo.set(key,packed);

    if(rank===0){
      rootLegalActions=childKeys.length;
      rootDistinctOrbitChildren=new Set(childKeys).size;
      rootDistinctRecursiveChildren=uniqueClasses.length;
    }
    return {key,packed};
  }

  const initialResidual=normalizeMaskAntichain(masks),
    rootHeights=new Uint8Array(width),
    rootBlocked=nonterminalFrontierBlocker?
      applyUniversalFrontierBlocker(
        rootHeights,initialResidual,initialResidual,width,height,{nonterminalOnly:true}):
      {r0:initialResidual,r1:initialResidual,removed:0},
    rootClosed=moverFinalCapParity?
      applyMoverFinalCapParity(
        rootHeights,rootBlocked.r0,rootBlocked.r1,width,height):
      rootBlocked,
    rootCapacity=remainingMoveCapacity?
      applyRemainingMoveCapacity(
        rootHeights,rootClosed.r0,rootClosed.r1,width,height):
      {r0:rootClosed.r0,r1:rootClosed.r1,removed:0},
    root=canonicalize(
      rootHeights,rootCapacity.r0,rootCapacity.r1),
    rootResult=visit(root);
  remainingMoveCapacityRemovals+=rootCapacity.removed;

  let wdlSplitClasses=0;
  for(const mask of classValueMask)
    if(mask!==undefined&&(mask&(mask-1))!==0)wdlSplitClasses++;

  const frontier=statesByRank.map((states,rank)=>({
      rank,states,classes:classesByRank[rank],
    })),
    dynamicMergeByRank=statesByRank.map((_,rank)=>({
      rank,
      mergedRecursiveClasses:mergedClassesByRank[rank],
      orbitExcess:orbitExcessByRank[rank],
      maxOrbitStatesPerRecursiveClass:maxOrbitStatesPerClassByRank[rank],
    }));

  return {
    schema:'connect4.direct-residual-orbit-growth-compact.v1',
    inputs:'root geometry + residual-antichain cofactor rules + support + action relabeling',
    physicalBoardStatesEnumerated:false,
    outcomeLabelsUsedByProducer:false,
    validationUsesDerivedWdl:true,
    fullGraphObjectsRetained:false,
    width,height,k,cells,
    canonicalization:binaryTieLinearCanonicalization?
      'GF(2) binary-tie affine canonicalization + exact nonbinary fallback':
      refinedColumnCanonicalization?
        'refinement-partitioned exact tie search':
        'full column permutation search',
    columnPermutations:permutationData?.length??null,
    canonicalPermutationCandidates,
    maxCanonicalPermutationCandidates,
    refinedColumnCanonicalization,
    binaryTieLinearCanonicalization,
    binaryLinearCanonicalizations,
    binaryLinearFallbackCanonicalizations,
    binaryLinearTranslationCandidates,
    maxBinaryLinearTranslationCandidates,
    nonterminalFrontierBlocker,
    moverFinalCapParity,
    remainingMoveCapacity,
    remainingMoveCapacityRemovals,
    winningLineCount:masks.length,
    residualOrbitStates:memo.size,
    literalActionEdges,
    duplicateEquivalentActionEdges,
    recursiveUnlabelledClasses:nextClassId,
    wdlSplitClasses,
    rootValue:unpackValue(rootResult.packed),
    rootLegalActions,
    rootDistinctOrbitChildren,
    rootDistinctRecursiveChildren,
    earliestDynamicMergeRank,
    dynamicMergeByRank,
    peakOrbitStateFrontier:peakBy(frontier,'states'),
    peakRecursiveClassFrontier:peakBy(frontier,'classes'),
    frontier,
  };
}


export function analyzeDirectResidualOrbitPrefix({
  width,height,k,maxRank,
  nonterminalFrontierBlocker=true,
  moverFinalCapParity=true,
  remainingMoveCapacity=false,
}){
  const cells=width*height;
  assert.ok(cells<=30,
    'direct residual-orbit prefix harness is intentionally bounded to <=30 cells');
  assert.ok(Number.isInteger(maxRank)&&maxRank>=0&&maxRank<=cells,
    'maxRank must be an integer within the board rank range');

  const masks=winMasks(width,height,k),
    workByRank=Array.from({length:maxRank},(_,rank)=>({
      rank,
      literalActionEdges:0,
      duplicateEquivalentActionEdges:0,
      canonicalizationCalls:0,
      canonicalPermutationCandidates:0,
      maxCanonicalPermutationCandidates:0,
      noTieCalls:0,
      binaryTieCalls:0,
      nonbinaryTieCalls:0,
      tieProfileCalls:{},
      remainingMoveCapacityRemovals:0,
      producedDistinctStates:0,
    }));

  function recordCanonicalization(rank,out){
    if(rank<0||rank>=workByRank.length)return;
    const row=workByRank[rank],
      sizes=out.tieClassSizes??[],
      profile=sizes.length?sizes.join('x'):'none';
    row.canonicalizationCalls++;
    row.canonicalPermutationCandidates+=out.candidatePermutations;
    row.maxCanonicalPermutationCandidates=Math.max(
      row.maxCanonicalPermutationCandidates,out.candidatePermutations);
    row.tieProfileCalls[profile]=(row.tieProfileCalls[profile]??0)+1;
    if(!sizes.length)row.noTieCalls++;
    else if(sizes.every(n=>n===2))row.binaryTieCalls++;
    else row.nonbinaryTieCalls++;
  }

  function canonicalize(heights,r0,r1,rank){
    const out=canonicalResidualQStateRefinedCompact(
      heights,r0,r1,width,height);
    recordCanonicalization(rank,out);
    return out;
  }

  const initialResidual=normalizeMaskAntichain(masks),
    rootHeights=new Uint8Array(width),
    rootBlocked=nonterminalFrontierBlocker?
      applyUniversalFrontierBlocker(
        rootHeights,initialResidual,initialResidual,width,height,
        {nonterminalOnly:true}):
      {r0:initialResidual,r1:initialResidual,removed:0},
    rootClosed=moverFinalCapParity?
      applyMoverFinalCapParity(
        rootHeights,rootBlocked.r0,rootBlocked.r1,width,height):
      rootBlocked,
    rootCapacity=remainingMoveCapacity?
      applyRemainingMoveCapacity(
        rootHeights,rootClosed.r0,rootClosed.r1,width,height):
      {r0:rootClosed.r0,r1:rootClosed.r1,removed:0},
    root=canonicalResidualQStateRefinedCompact(
      rootHeights,rootCapacity.r0,rootCapacity.r1,width,height),
    rootKey='Q:'+root.signature,
    rootCanonicalization={
      candidatePermutations:root.candidatePermutations,
      tieClassSizes:root.tieClassSizes,
    },
    frontier=[];

  let current=new Map([[rootKey,{
    key:rootKey,
    terminal:false,
    heights:root.heights,
    r0:root.r0,
    r1:root.r1,
  }]]);

  for(let rank=0;rank<=maxRank;rank++){
    let terminalStates=0,totalResidualRequirements=0,
      maxResidualRequirements=0,maxP0Residuals=0,maxP1Residuals=0;
    for(const rec of current.values()){
      if(rec.terminal){terminalStates++;continue;}
      const n0=rec.r0.length,n1=rec.r1.length,n=n0+n1;
      totalResidualRequirements+=n;
      maxResidualRequirements=Math.max(maxResidualRequirements,n);
      maxP0Residuals=Math.max(maxP0Residuals,n0);
      maxP1Residuals=Math.max(maxP1Residuals,n1);
    }
    const nonterminalStates=current.size-terminalStates;
    frontier.push({
      rank,
      states:current.size,
      nonterminalStates,
      terminalStates,
      totalResidualRequirements,
      averageResidualRequirements:nonterminalStates?
        totalResidualRequirements/nonterminalStates:0,
      maxResidualRequirements,
      maxP0Residuals,
      maxP1Residuals,
    });
    if(rank===maxRank)break;

    const next=new Map(),row=workByRank[rank];
    for(const rec of current.values()){
      if(rec.terminal)continue;
      const mover=rank&1,childKeys=[],
        own=mover?rec.r1:rec.r0,
        opponent=mover?rec.r0:rec.r1;

      for(let col=0;col<width;col++)if(rec.heights[col]<height){
        row.literalActionEdges++;
        const cell=rec.heights[col]*width+col,bit=1<<cell,
          ownNext=[];
        let wins=false;
        for(const requirement of own){
          if(requirement&bit){
            const residual=requirement&~bit;
            if(residual===0){wins=true;break;}
            ownNext.push(residual);
          }else ownNext.push(requirement);
        }

        let childKey,childRec;
        if(wins){
          const kind=mover?'P1':'P0';
          childKey='T:'+(rank+1)+':'+kind;
          childRec={key:childKey,terminal:true,kind};
        }else{
          const nextHeights=new Uint8Array(rec.heights);
          nextHeights[col]++;
          if(rank+1===cells){
            childKey='T:'+(rank+1)+':D';
            childRec={key:childKey,terminal:true,kind:'D'};
          }else{
            const opponentNext=opponent.filter(
                requirement=>(requirement&bit)===0),
              ownNormalized=normalizeMaskAntichain(ownNext),
              opponentNormalized=normalizeMaskAntichain(opponentNext),
              r0=mover?opponentNormalized:ownNormalized,
              r1=mover?ownNormalized:opponentNormalized,
              blocked=nonterminalFrontierBlocker?
                applyUniversalFrontierBlocker(
                  nextHeights,r0,r1,width,height,{nonterminalOnly:true}):
                {r0,r1,removed:0},
              closed=moverFinalCapParity?
                applyMoverFinalCapParity(
                  nextHeights,blocked.r0,blocked.r1,width,height):
                blocked,
              capacity=remainingMoveCapacity?
                applyRemainingMoveCapacity(
                  nextHeights,closed.r0,closed.r1,width,height):
                {r0:closed.r0,r1:closed.r1,removed:0},
              canonical=canonicalize(
                nextHeights,capacity.r0,capacity.r1,rank);
            row.remainingMoveCapacityRemovals+=capacity.removed;
            childKey='Q:'+canonical.signature;
            childRec={
              key:childKey,
              terminal:false,
              heights:canonical.heights,
              r0:canonical.r0,
              r1:canonical.r1,
            };
          }
        }
        childKeys.push(childKey);
        if(!next.has(childKey))next.set(childKey,childRec);
      }
      row.duplicateEquivalentActionEdges+=
        childKeys.length-new Set(childKeys).size;
    }
    row.producedDistinctStates=next.size;
    current=next;
  }

  return {
    schema:'connect4.direct-residual-orbit-prefix.v1',
    inputs:'root geometry + residual-antichain cofactor rules + support + action relabeling',
    physicalBoardStatesEnumerated:false,
    outcomeLabelsUsedByProducer:false,
    width,height,k,cells,maxRank,
    canonicalization:'refinement-partitioned exact tie search',
    nonterminalFrontierBlocker,
    moverFinalCapParity,
    remainingMoveCapacity,
    remainingMoveCapacityRemovals:
      rootCapacity.removed+workByRank.reduce(
        (n,x)=>n+x.remainingMoveCapacityRemovals,0),
    winningLineCount:masks.length,
    rootCanonicalization,
    prefixStates:frontier.reduce((n,x)=>n+x.states,0),
    literalActionEdges:workByRank.reduce(
      (n,x)=>n+x.literalActionEdges,0),
    duplicateEquivalentActionEdges:workByRank.reduce(
      (n,x)=>n+x.duplicateEquivalentActionEdges,0),
    canonicalizationCalls:workByRank.reduce(
      (n,x)=>n+x.canonicalizationCalls,0),
    canonicalPermutationCandidates:workByRank.reduce(
      (n,x)=>n+x.canonicalPermutationCandidates,0),
    maxCanonicalPermutationCandidates:Math.max(
      root.candidatePermutations,
      ...workByRank.map(x=>x.maxCanonicalPermutationCandidates)),
    nonbinaryTieCalls:workByRank.reduce(
      (n,x)=>n+x.nonbinaryTieCalls,0),
    frontier,
    workByRank,
  };
}


export function analyzeUnlabelledQuotientDimensionMatrix({
  cases=[
    {width:3,height:3,k:3},
    {width:4,height:3,k:3},
    {width:3,height:4,k:3},
    {width:4,height:4,k:3},
    {width:4,height:4,k:4},
  ],
}={}){
  return {
    schema:'connect4.unlabelled-quotient.dimension-matrix.v1',
    producerUsesOutcomeLabels:false,
    cases:cases.map(analyzeUnlabelledQuotientDimension),
  };
}
