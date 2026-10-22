/**
 * C4 experimental exact checks: signed descriptor triangle versus 7x6 C6.
 * Source-derived integer/Boolean operations only; no solved WDL or oracle.
 * Scope: exhaustive five-level scalar triples and six legal source atoms.
 * Research-only; node >= 22. Prints exact machine-readable JSON.
 */
function check(condition, message) { if (!condition) throw Error(message); }
const sign = x => Number(x > 0) - Number(x < 0);
let triples = 0, nonzero = 0, binary = 0, binaryNonzero = 0;
for (let a = 0; a <= 4; a++)
for (let b = 0; b <= 4; b++)
for (let c = 0; c <= 4; c++) {
  const dAB = b-a, dBC = c-b, dCA = a-c;
  const kappa = sign(dAB) + sign(dBC) + sign(dCA);
  const vandermonde = sign((b-a)*(c-a)*(c-b));
  const oldPairSignsProduct = sign(b-a)*sign(c-a)*sign(c-b);
  check(dAB+dBC+dCA === 0, 'raw triangle must be gradient');
  check(kappa === vandermonde && kappa === oldPairSignsProduct, 'sign order identity');
  check((kappa === 0) === (a === b || b === c || a === c), 'tie condition');
  triples++; if (kappa !== 0) nonzero++;
  if (a < 2 && b < 2 && c < 2) {binary++;if (kappa !== 0) binaryNonzero++;}
}
const ids=[1,2,8,9,16,18], signs=[1,-1,1,-1,-1,1], labels=['00','01','10'];
const bits=id=>Array.from({length:5},(_,k)=>(id>>(4-k))&1);
const atoms=ids.map((id,i)=>({id,z:signs[i],x:bits(id),left:bits(id).slice(0,2).join(''),right:bits(id).slice(3).join('')}));
check(atoms.every(a=>a.x[2]===0),'center role fixed');
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const z=atoms.map(a=>a.z);
const incidence=atoms.map(a=>[
  ...labels.map(x=>Number(a.left===x)),
  ...labels.map(x=>Number(a.right===x))]);
function rankQ(matrix) {
  const a=matrix.map(row=>row.map(x=>x)),n=a.length,m=a[0].length;
  const gcd=(p,q)=>q?gcd(q,p%q):Math.abs(p);
  let rank=0;
  for(let col=0;col<m&&rank<n;col++){
    let k=rank;while(k<n&&a[k][col]===0)k++;
    if(k===n)continue;
    [a[k],a[rank]]=[a[rank],a[k]];
    for(let i=rank+1;i<n;i++)if(a[i][col]!==0) {
      const u=a[rank][col],v=a[i][col];
      a[i]=a[i].map((x,j)=>u*x-v*a[rank][j]);
      const g=a[i].reduce((gg,x)=>gcd(gg,x),0);
      if(g>1)a[i]=a[i].map(x=>x/g);
    }
    rank++;
  }
  return rank;
}
check(rankQ(incidence)===5,'C6 vertex-potential rational rank');
for(let j=0;j<6;j++)check(dot(z,incidence.map(row=>row[j]))===0,'cycle on potential');
for(let side of ['left','right'])for(let token of labels){
  check(atoms.filter(a=>a.z===1&&a[side]===token).length === 1,'positive perfect matching');
  check(atoms.filter(a=>a.z===-1&&a[side]===token).length === 1,'negative perfect matching');
}
const cases=[];
for(const anchor of [1,7]){
  const S=atoms.map(atom=>{
    const six=anchor===1?[1,...atom.x]:[...atom.x,1];
    check(![0,1,2,3].some(k=>six.slice(k,k+3).every(x=>x===1)),'guard P0 first center live');
    return Number(![0,1,2,3].some(k=>six.slice(k,k+3).every(x=>x===0)));
  });
  const X=atoms.map(a=>a.x[0]);
  const SX=S.map((v,i)=>v*X[i]);
  check(dot(z,S)===0&&dot(z,X)===0&&dot(z,SX)===1,'delayed firstwin correlation');
  check(S.filter((v,i)=>v&&z[i]===1).length===1,'positive survivor count');
  check(S.filter((v,i)=>v&&z[i]===-1).length===1,'negative survivor count');
  check(rankQ([...incidence[0].map((_,j)=>incidence.map(row=>row[j])), SX])===6,'single nonpotential extension');
  cases.push({anchor,S,X,zS:dot(z,S),zX:dot(z,X),zSX:dot(z,SX)});
}
console.log(JSON.stringify({
  schema:'connect4.cross_era.sign_order_c6_analytical_check.v1',
  status:'PASS',
  triplesChecked:triples,
  nonzeroSignOrder:nonzero,
  binaryCapacityTriples:binary,
  binaryCapacityNonzero:binaryNonzero,
  C6SourceIds:ids,
  C6cycle:z,
  incidenceRankQ:rankQ(incidence),
  C6CycleDimension:6-rankQ(incidence),
  anchors:cases,
  historicalOOOScalarFactorization:'NOT_RUN',
  fullOriginal69K4EulerIndependentControl:'SEE_SEPARATE_CHECKED_IN_VERIFIER',
  emptyRootWin:'NOT_PROVED'
},null,2));
