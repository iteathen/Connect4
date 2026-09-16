import assert from 'node:assert/strict';

const key=([c,r])=>`${c},${r}`;
const byColumn=squares=>{
  const out=new Map();
  for(const [c,r] of squares){if(!out.has(c))out.set(c,new Set());out.get(c).add(r);}
  return out;
};
const setEq=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x));

// Legal branch representative after D1 E1 A1 A2 B1 C1.
// P1 owns A2, E1, C1; P0 owns D1, A1, B1.
// The candidate Before group is A2-B2-C2-D2. A2 is already P1;
// B2,C2,D2 are empty, so their successor response pairs are verticals.
const beforeGroup=[[1,2],[2,2],[3,2],[4,2]];
const emptyBefore=[[2,2],[3,2],[4,2]];
const beforeVerticals=emptyBefore.map(([c,r])=>[[c,r],[c,r+1]]);
const beforeSquares=beforeVerticals.flat();
const beforeSuccessors=emptyBefore.map(([c,r])=>[c,r+1]);
const targetH3=[[1,3],[2,3],[3,3],[4,3]];
assert(beforeSuccessors.every(x=>targetH3.some(y=>key(x)===key(y))));

// Lower D/E Lowinverse used by the center pair field.
const lowinverseSquares=[[4,2],[4,3],[5,2],[5,3]];

// Allis BE/LI compatibility condition 3: in every shared column the
// square sets must be disjoint or equal. Here D is exactly equal;
// B/C occur only in the Before and E only in the inverse.
const B=byColumn(beforeSquares),L=byColumn(lowinverseSquares);
let columnWiseDisjointOrEqual=true;
for(const [c,bs] of B){
  if(!L.has(c))continue;
  const ls=L.get(c);
  const intersects=[...bs].some(r=>ls.has(r));
  if(intersects&&!setEq(bs,ls))columnWiseDisjointOrEqual=false;
}
assert(columnWiseDisjointOrEqual);
assert(setEq(B.get(4),L.get(4)));

// Allis condition 2 also applies: no Claimeven component of the Before
// may be below the inverse. This Before has only Verticals because the
// cells below B2/C2/D2 are occupied.
const beforeClaimevens=[];
assert.equal(beforeClaimevens.length,0);
const noClaimevenBelowInverse=true;

assert(columnWiseDisjointOrEqual&&noClaimevenBelowInverse);

console.log(JSON.stringify({
  legalBranch:'D1 E1 A1 A2 B1 C1',
  before:{
    group:beforeGroup.map(key),
    empty:emptyBefore.map(key),
    verticals:beforeVerticals.map(P=>P.map(key)),
    successors:beforeSuccessors.map(key),
    solvesH3:beforeSuccessors.every(x=>targetH3.some(y=>key(x)===key(y)))
  },
  lowerDELowinverse:{squares:lowinverseSquares.map(key)},
  compatibility:{
    condition2_noClaimevenBelowInverse:noClaimevenBelowInverse,
    condition3_columnWiseDisjointOrEqual:columnWiseDisjointOrEqual,
    sharedDColumnIsExactSameVertical:setEq(B.get(4),L.get(4)),
    allowed:true
  },
  interpretation:'The local row-3 horizontal is repairable by a Before that is compatible with the lower D/E Lowinverse. Therefore the row-3 defect is not itself an invariant; the remaining obstruction must be global certificate/response compatibility.'
},null,2));
