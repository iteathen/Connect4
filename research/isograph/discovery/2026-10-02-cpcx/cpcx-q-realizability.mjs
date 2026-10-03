// CPCX q_o semantic realizability closure.
//
// Ports rule-derived UC4A/C=NC residual eliminations that preserve ordinary
// first-terminal behavior without solved values:
// 1. nonterminal frontier blocker;
// 2. final-event top-cap parity;
// 3. remaining-move capacity;
// 4. support-release turn-slot capacity.
//
// The result is a semantic q-like carrier for equivalence testing. It is not
// substituted for the full q_o representation inside unrelated CPCX proof
// certificates because behaviorally redundant residuals can still simplify
// later representation cofactors (representation non-monotonicity).

import {cpcxCell} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
} from './cpcx-q-quotient.mjs';

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

function legalLandingCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function nonwinningLandingCells(position){
  const out=[];
  for(const cell of legalLandingCells(position)){
    const child=applyCpcxForcedEvent(position,cell);
    if(child.terminal?.player===position.mover)continue;
    out.push(cell);
  }
  return out.sort((a,b)=>a-b);
}

function playerTurnSlots(position,player){
  const remaining=position.geometry.cellCount-position.rank,
    first=player===position.mover?1:2,
    out=[];
  for(let ply=first;ply<=remaining;ply+=2)out.push(ply);
  return out;
}

function releaseFeasible(position,residual,player){
  const slots=playerTurnSlots(position,player);
  if(residual.length>slots.length)return false;
  const releases=residual.map(cell=>{
    const {column,row}=cpcxCell(position.geometry,cell);
    return row-position.heights[column]+1;
  }).sort((a,b)=>a-b);

  let j=0;
  for(const release of releases){
    while(j<slots.length&&slots[j]<release)j++;
    if(j>=slots.length)return false;
    j++;
  }
  return true;
}

function capCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++)
    if(position.heights[c]<g.rows)
      out.push((g.rows-1)*g.columns+c);
  return out.sort((a,b)=>a-b);
}

function remainingMoveCapacity(position,player){
  const remaining=position.geometry.cellCount-position.rank;
  return player===position.mover
    ?Math.ceil(remaining/2)
    :Math.floor(remaining/2);
}

export function closeCpcxQRealizability(position){
  if(position.terminal)throw new RangeError('nonterminal position required');
  const q=buildCpcxQCarrier(position),
    mover=position.mover,
    opponent=mover^1,
    nonwinning=nonwinningLandingCells(position),
    caps=capCells(position),
    remaining=position.geometry.cellCount-position.rank,
    finalPlayer=remaining>0
      ?mover^((remaining-1)&1)
      :null,
    residuals=[[],[]],
    deletions=[];

  for(let player=0;player<2;player++){
    for(const residual of q.residuals[player]){
      let rule=null;

      if(
        player===opponent&&
        isSubset(nonwinning,residual)
      )rule='NONTERMINAL_FRONTIER_BLOCKER';

      if(
        rule===null&&
        caps.length>0&&
        finalPlayer!==null&&
        finalPlayer!==player&&
        isSubset(caps,residual)
      )rule='FINAL_EVENT_CAP_PARITY';

      if(
        rule===null&&
        residual.length>remainingMoveCapacity(position,player)
      )rule='REMAINING_MOVE_CAPACITY';

      if(
        rule===null&&
        !releaseFeasible(position,residual,player)
      )rule='SUPPORT_RELEASE_TURN_CAPACITY';

      if(rule){
        deletions.push({
          player,
          residual:[...residual],
          rule,
        });
      }else residuals[player].push([...residual]);
    }
  }

  for(const family of residuals)family.sort((a,b)=>
    a.length-b.length||compareArrays(a,b)
  );

  const carrier={
    schema:'connect4.cpcx.qo-realizability-closed.v0_1',
    geometry:[...q.geometry],
    support:[...q.support],
    rank:q.rank,
    mover:q.mover,
    residuals,
  };

  return {
    schema:'connect4.cpcx.qo-realizability-closure.v0_1',
    exact:true,
    carrier,
    key:keyCpcxQCarrier(carrier),
    deletions,
    ruleCounts:deletions.reduce((m,x)=>{
      m[x.rule]=(m[x.rule]??0)+1;
      return m;
    },{}),
    proofRule:'delete only residuals proved behaviorally inert or unrealizable by current frontier blocking, final-event parity, remaining-turn capacity, or support-release turn-slot infeasibility',
    theoremProvenance:[
      'RESIDUAL_REALIZABILITY_CLOSURE_RESULT.md',
      'REMAINING_MOVE_CAPACITY_RESULT.md',
      'SUPPORT_RELEASE_TURN_CAPACITY_RESULT.md',
    ],
    boundary:'semantic gameplay closure only; do not assume destructive deletion monotonically improves later structural representation',
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

export function canonicalizeCpcxQRealizabilityOrbit(position){
  const closure=closeCpcxQRealizability(position),
    columns=position.geometry.columns;
  let bestKey=null,bestCarrier=null,bestPermutation=null;
  for(const permutation of permutations(columns)){
    const candidate=permuteCpcxQCarrier(
        closure.carrier,permutation
      ),
      key=keyCpcxQCarrier(candidate);
    if(bestKey===null||key<bestKey){
      bestKey=key;
      bestCarrier=candidate;
      bestPermutation=[...permutation];
    }
  }
  return {
    schema:'connect4.cpcx.qo-realizability-orbit.v0_1',
    exact:true,
    key:bestKey,
    carrier:bestCarrier,
    permutation:bestPermutation,
    closure,
    proofRule:'behavior-preserving UC4A residual closure followed by exact q_o column-action transporter canonicalization',
  };
}
