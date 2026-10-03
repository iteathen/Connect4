// CPCX exact q_o carrier and action-transporter quotient.
//
// Historical theorem provenance:
// - STANDARD_7X6_Q_CONGRUENCE.md
// - Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md
//
// q_o is the qualified ordinary gameplay carrier:
//   support
//   + normalized P0 residual antichain
//   + normalized P1 residual antichain.
//
// Equal q_o gives identical literal-action-labelled ordinary future behavior.
// More generally, if a column bijection transports one complete q_o carrier to
// another, support advance and residual cofactors commute with that bijection.
// Therefore the two future games are exactly isomorphic under the transported
// action labels. This is gameplay/value equivalence only; non-q CPCX proof
// context is not automatically reusable.

import {
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';

function compareArrays(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
  return a.length-b.length;
}

function isSubset(a,b){
  if(a.length>b.length)return false;
  let i=0,j=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue;}
    if(a[i]>b[j]){j++;continue;}
    return false;
  }
  return i===a.length;
}

function normalizeResidualAntichain(rows){
  const uniq=new Map();
  for(const cells of rows){
    const a=[...cells].sort((x,y)=>x-y),
      key=a.join(',');
    if(!uniq.has(key))uniq.set(key,a);
  }
  const ordered=[...uniq.values()].sort((a,b)=>
    a.length-b.length||compareArrays(a,b)
  ),out=[];
  outer:for(const a of ordered){
    for(const b of out)if(isSubset(b,a))continue outer;
    out.push(a);
  }
  return out;
}

export function buildCpcxQCarrier(position){
  if(position.terminal)throw new RangeError('q_o carrier requires nonterminal position');
  const g=position.geometry,
    obligations=scanCpcxObligations(position,{minMissing:1,maxMissing:g.connect}),
    residuals=[[],[]];
  for(const o of obligations)residuals[o.player].push(o.missingCells);
  const R0=normalizeResidualAntichain(residuals[0]),
    R1=normalizeResidualAntichain(residuals[1]);
  return {
    schema:'connect4.cpcx.qo-carrier.v0_1',
    geometry:[g.columns,g.rows,g.connect],
    support:Array.from(position.heights),
    rank:position.rank,
    mover:position.mover,
    residuals:[R0,R1],
  };
}

export function keyCpcxQCarrier(carrier){
  return JSON.stringify({
    geometry:carrier.geometry,
    support:carrier.support,
    residuals:carrier.residuals,
  });
}

export function mapCpcxCellByColumnPermutation(geometry,cell,permutation){
  const {column,row}=cpcxCell(geometry,cell),
    mapped=permutation[column];
  if(!Number.isInteger(mapped)||mapped<0||mapped>=geometry.columns)
    throw new RangeError('column permutation');
  return row*geometry.columns+mapped;
}

function validatePermutation(columns,permutation){
  if(!Array.isArray(permutation)||permutation.length!==columns)
    throw new RangeError('column permutation');
  const seen=new Set(permutation);
  if(seen.size!==columns)throw new RangeError('column permutation');
  for(const x of permutation)
    if(!Number.isInteger(x)||x<0||x>=columns)
      throw new RangeError('column permutation');
}

export function permuteCpcxQCarrier(carrier,permutation){
  const [columns,rows,connect]=carrier.geometry;
  validatePermutation(columns,permutation);
  const support=Array(columns).fill(0);
  for(let c=0;c<columns;c++)support[permutation[c]]=carrier.support[c];

  const residuals=carrier.residuals.map(family=>
    normalizeResidualAntichain(
      family.map(cells=>cells.map(cell=>{
        const column=cell%columns,row=Math.floor(cell/columns);
        return row*columns+permutation[column];
      }))
    )
  );

  return {
    schema:'connect4.cpcx.qo-carrier.v0_1',
    geometry:[columns,rows,connect],
    support,
    rank:carrier.rank,
    mover:carrier.mover,
    residuals,
  };
}

function* permutations(n){
  const a=Array.from({length:n},(_,i)=>i);
  function* rec(k){
    if(k===n){yield [...a];return;}
    for(let i=k;i<n;i++){
      [a[k],a[i]]=[a[i],a[k]];
      yield* rec(k+1);
      [a[k],a[i]]=[a[i],a[k]];
    }
  }
  yield* rec(0);
}

export function canonicalizeCpcxQColumnOrbit(position){
  const carrier=buildCpcxQCarrier(position),
    columns=position.geometry.columns;
  let bestKey=null,bestCarrier=null,bestPermutation=null;
  for(const permutation of permutations(columns)){
    const candidate=permuteCpcxQCarrier(carrier,permutation),
      key=keyCpcxQCarrier(candidate);
    if(bestKey===null||key<bestKey){
      bestKey=key;
      bestCarrier=candidate;
      bestPermutation=permutation;
    }
  }
  return {
    schema:'connect4.cpcx.qo-column-orbit.v0_1',
    exact:true,
    key:bestKey,
    carrier:bestCarrier,
    sourceCarrier:carrier,
    permutation:[...bestPermutation],
    proofRule:'qualified q_o future-behavior congruence plus exact column-action transporter; support advance and residual cofactors commute with the column bijection',
    scope:'ordinary gameplay/value equivalence under transported action labels; non-q CPCX certificate context is not implied',
    theoremProvenance:[
      'STANDARD_7X6_Q_CONGRUENCE.md',
      'Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md',
      'RESIDUAL_Q_COLUMN_ORBIT_RESULT.md',
    ],
  };
}

export function findCpcxQColumnTransporter(a,b){
  const qa=buildCpcxQCarrier(a),
    qb=buildCpcxQCarrier(b),
    target=keyCpcxQCarrier(qb),
    columns=a.geometry.columns;
  if(
    a.geometry.columns!==b.geometry.columns||
    a.geometry.rows!==b.geometry.rows||
    a.geometry.connect!==b.geometry.connect||
    a.rank!==b.rank||
    a.mover!==b.mover
  )return null;

  for(const permutation of permutations(columns)){
    const mapped=permuteCpcxQCarrier(qa,permutation);
    if(keyCpcxQCarrier(mapped)!==target)continue;
    return {
      schema:'connect4.cpcx.qo-column-transporter.v0_1',
      exact:true,
      permutation:[...permutation],
      inverse:(()=>{
        const inv=Array(columns);
        for(let i=0;i<columns;i++)inv[permutation[i]]=i;
        return inv;
      })(),
      source:qa,
      target:qb,
      proofRule:'complete q_o carrier is transported exactly; rank induction transfers the ordinary future game under the same action bijection',
      certificateReuse:'SCALAR_GAMEPLAY_VALUE_ONLY_UNLESS_CPCX_PREMISES_ARE_SEPARATELY_TRANSPORTED',
    };
  }
  return null;
}
