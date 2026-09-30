import assert from 'node:assert/strict';
const lexical=(a,b)=>a<b?-1:a>b?1:0;
export function xorSorted(a,b){const out=[];let i=0,j=0;while(i<a.length||j<b.length){if(i===a.length){out.push(b[j++]);continue;}if(j===b.length){out.push(a[i++]);continue;}if(a[i]===b[j]){i++;j++;}else if(a[i]<b[j])out.push(a[i++]);else out.push(b[j++]);}return out;}
export function sparseRank(rows){const pivots=new Map();for(const source of rows){let row=source;while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,row);break;}row=xorSorted(row,prior);}}return pivots.size;}
export function freezeKernel(rows,{check=()=>{},maxIncidences=20000000}={}){
  const pivots=new Map(),basisIndices=[],kernel=[];let storedIncidences=0;
  for(let i=0;i<rows.length;i++){check();let row=rows[i],comb=[i];while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,{row,comb});basisIndices.push(i);storedIncidences+=row.length+comb.length;row=null;break;}row=xorSorted(row,prior.row);comb=xorSorted(comb,prior.comb);assert.ok(storedIncidences+row.length+comb.length<=maxIncidences,'RESOURCE_CENSORED: frozen kernel incidence cap');}if(row!==null){kernel.push(comb);storedIncidences+=comb.length;}assert.ok(storedIncidences<=maxIncidences,'RESOURCE_CENSORED: frozen kernel stored incidence cap');}
  return {basisIndices,kernel,rank:pivots.size,storedIncidences};
}
// Alternative verifier: packed BigInt, least pivots, no sparse xor helper.
export function packedRank(rows,{check=()=>{}}={}){const pivots=new Map();let count=0;for(const source of rows){let row=0n;for(const col of source)row^=1n<<BigInt(col);while(row){const p=row&-row;if(pivots.has(p))row^=pivots.get(p);else{pivots.set(p,row);break;}}if(++count%256===0)check();}return pivots.size;}
export function preparePolynomial(signatures,{maxClasses=100000,maxOooKeys=100000,maxIncidences=20000000,check=()=>{}}={}){
  const unique=new Map();
  for(const sig of signatures){
    const sorted=sig.map(([d,z])=>{assert.equal(typeof d,'string');assert.ok(z==='O'||z==='E');return [d,z];}).sort(([a],[b])=>lexical(a,b));
    assert.equal(new Set(sorted.map(([d])=>d)).size,sorted.length,'descriptor repeated in signature');
    unique.set(JSON.stringify(sorted),sorted);assert.ok(unique.size<=maxClasses,'RESOURCE_CENSORED: class cap');
  }
  const classKeys=[...unique.keys()].sort(lexical),classSignatures=classKeys.map(k=>unique.get(k));
  const raw=[],lowSet=new Set(),tripleSet=new Set(),affineSet=new Set();let incidences=0;
  for(const sig of classSignatures){
    check();const atoms=sig.flatMap(([d,z])=>z==='O'?[JSON.stringify(['P',d]),JSON.stringify(['O',d])]:[JSON.stringify(['P',d])]).sort(lexical);
    const affine=['1',...atoms],low=[...affine],high=[],odd=sig.filter(([,z])=>z==='O').map(([d])=>d);
    for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++)low.push(JSON.stringify([atoms[i],atoms[j]]));
    for(let i=0;i<odd.length;i++)for(let j=i+1;j<odd.length;j++)for(let k=j+1;k<odd.length;k++)high.push(JSON.stringify([odd[i],odd[j],odd[k]]));
    low.forEach(k=>lowSet.add(k));high.forEach(k=>tripleSet.add(k));affine.forEach(k=>affineSet.add(k));
    incidences+=low.length+high.length;assert.ok(incidences<=maxIncidences,'RESOURCE_CENSORED: raw incidence cap');assert.ok(tripleSet.size<=maxOooKeys,'RESOURCE_CENSORED: OOO key cap');raw.push({low,high});
  }
  const lowcolumns=[...lowSet].sort(lexical),tripleKeys=[...tripleSet].sort(lexical),triples=tripleKeys.map(JSON.parse);
  const li=new Map(lowcolumns.map((k,i)=>[k,i])),ti=new Map(tripleKeys.map((k,i)=>[k,i]));
  const rowsLow=raw.map(r=>r.low.map(k=>li.get(k)).sort((a,b)=>a-b)),rowsOoo=raw.map(r=>r.high.map(k=>ti.get(k)).sort((a,b)=>a-b));
  const affineColumns=[...affineSet].map(k=>li.get(k)).sort((a,b)=>a-b),affineCols=new Set(affineColumns),rowsAffine=rowsLow.map(row=>row.filter(i=>affineCols.has(i)));
  const pivots=new Map(),dependencies=[],lowerBasisClassIndices=[];
  for(let i=0;i<rowsLow.length;i++){
    check();let row=rowsLow[i],ooo=rowsOoo[i],comb=[i];
    while(row.length){
      const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,{row,ooo,comb});lowerBasisClassIndices.push(i);incidences+=row.length+ooo.length+comb.length;row=null;break;}
      row=xorSorted(row,prior.row);ooo=xorSorted(ooo,prior.ooo);comb=xorSorted(comb,prior.comb);
      assert.ok(incidences+row.length+ooo.length+comb.length<=maxIncidences,'RESOURCE_CENSORED: elimination incidence cap');
    }
    if(row!==null){dependencies.push({sourceIndices:comb,oooResidue:ooo});incidences+=comb.length+ooo.length;}
    assert.ok(incidences<=maxIncidences,'RESOURCE_CENSORED: stored incidence cap');
  }
  const lowerRank=pivots.size,affineRank=sparseRank(rowsAffine),oooRank=sparseRank(dependencies.map(d=>d.oooResidue));
  assert.equal(lowerRank,packedRank(rowsLow,{check}));assert.equal(affineRank,packedRank(rowsAffine,{check}));assert.equal(oooRank,packedRank(dependencies.map(d=>d.oooResidue),{check}));
  for(const dep of dependencies){check();let low=[],high=[];for(const i of dep.sourceIndices){low=xorSorted(low,rowsLow[i]);high=xorSorted(high,rowsOoo[i]);}assert.deepEqual(low,[]);assert.deepEqual(high,dep.oooResidue);}
  const oooKernel=freezeKernel(dependencies.map(d=>d.oooResidue),{check,maxIncidences:maxIncidences-incidences});incidences+=oooKernel.storedIncidences;assert.equal(oooKernel.rank,oooRank);
  return {schema:'fresh.polynomial.v1',classKeys,classSignatures,lowcolumns,triples,rowsLow,rowsOoo,affineColumns,dependencies,lowerBasisClassIndices,oooBasisDependencyIndices:oooKernel.basisIndices,oooKernelDependencyIndices:oooKernel.kernel,lowerRank,affineRank,oooRank,leftNullity:dependencies.length,storedIncidences:incidences,verification:'SPARSE_GREATEST_AND_PACKED_LEAST_RANKS_PLUS_EXPLICIT_DEPENDENCY_XOR'};
}
export function factorization(rows,codes,{check=()=>{},maxIncidences=20000000}={}){
  assert.equal(rows.length,codes.length);const pivots=new Map();let contradictions=0,firstFailure=null,storedIncidences=rows.reduce((n,r)=>n+r.length,0);
  assert.ok(storedIncidences<=maxIncidences,'RESOURCE_CENSORED: scalar incidence cap');
  for(let i=0;i<rows.length;i++){
    check();assert.ok(Number.isInteger(codes[i])&&codes[i]>=0&&codes[i]<=3);let row=rows[i],code=codes[i],comb=[i];
    while(row.length){const p=row.at(-1),prior=pivots.get(p);if(!prior){pivots.set(p,{row,code,comb});storedIncidences+=row.length+comb.length;row=null;break;}row=xorSorted(row,prior.row);code^=prior.code;comb=xorSorted(comb,prior.comb);assert.ok(storedIncidences+row.length+comb.length<=maxIncidences,'RESOURCE_CENSORED: scalar elimination incidence cap');}
    assert.ok(storedIncidences<=maxIncidences,'RESOURCE_CENSORED: scalar stored incidence cap');
    if(row!==null&&code){contradictions++;if(!firstFailure)firstFailure={rowIndices:comb,scalarXor:code,structuralXor:[]};}
  }
  const structuralRank=pivots.size,maxCol=rows.reduce((n,r)=>Math.max(n,r.at(-1)??-1),-1)+1;
  const augmented=rows.map((r,i)=>[...r,...(codes[i]&1?[maxCol]:[]),...(codes[i]&2?[maxCol+1]:[])]);
  const packedStructuralRank=packedRank(rows,{check}),packedAugmentedRank=packedRank(augmented,{check});
  assert.equal(structuralRank,packedStructuralRank);assert.equal(contradictions===0,packedAugmentedRank===packedStructuralRank);
  if(firstFailure){let row=[],code=0;for(const i of firstFailure.rowIndices){row=xorSorted(row,rows[i]);code^=codes[i];}assert.deepEqual(row,[]);assert.equal(code,firstFailure.scalarXor);}
  return {structuralRank,contradictions,firstFailure,exact:contradictions===0,packedStructuralRank,packedAugmentedRank};
}
