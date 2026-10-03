// CPCX branch-local q_o Transition-Isomorph witness verifier.
//
// This is a proof-transport lemma, not a game solver and not a witness search.
// A supplied witness must map every current legal action.  Terminal observations
// must agree, and every nonterminal child pair must be related by an explicit
// exact q_o column transporter.
//
// Qualified q_o authority then closes the future below each child.  The parent
// equivalence therefore needs only one finite current-frontier layer:
//
//   current action bijection
//     -> same first-terminal observation
//     -> exact q_o child transporter
//     -> qualified q_o future-behavior congruence.
//
// The action mapping may be branch-local: different current actions may use
// different child column transporters.  This is intentionally weaker than one
// global column permutation and intentionally stronger than scalar W/D/L
// equality.
//
// Scope: ordinary future-game/value equivalence only.  Non-q CPCX proof state,
// resource/debt/guard context and certificate provenance are not implied.

import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
} from './cpcx-q-quotient.mjs';

function legalColumns(position){
  const out=[];
  for(let c=0;c<position.geometry.columns;c++)
    if(position.heights[c]<position.geometry.rows)out.push(c);
  return out;
}

function validatePermutation(columns,permutation){
  if(!Array.isArray(permutation)||permutation.length!==columns)return false;
  const seen=new Set(permutation);
  if(seen.size!==columns)return false;
  return permutation.every(x=>Number.isInteger(x)&&x>=0&&x<columns);
}

function fullDraw(position){
  return !position.terminal&&
    Array.from(position.heights).every(h=>h>=position.geometry.rows);
}

function observation(position){
  if(position.terminal)return {
    kind:'TERMINAL',
    player:position.terminal.player,
  };
  if(fullDraw(position))return {kind:'DRAW',player:null};
  return {kind:'NONTERMINAL',player:null};
}

export function verifyCpcxQBranchLocalTi(a,b,witness){
  if(!a||!b)throw new TypeError('positions');
  const ga=a.geometry,gb=b.geometry;
  if(
    ga.columns!==gb.columns||
    ga.rows!==gb.rows||
    ga.connect!==gb.connect
  )return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'GEOMETRY_MISMATCH',
  };
  if(a.terminal||b.terminal)return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'ROOT_MUST_BE_NONTERMINAL',
  };
  if(a.mover!==b.mover||a.rank!==b.rank)return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'MOVER_OR_RANK_MISMATCH',
    aMover:a.mover,
    bMover:b.mover,
    aRank:a.rank,
    bRank:b.rank,
  };
  if(!witness||typeof witness!=='object')return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'TI_WITNESS_REQUIRED',
  };

  const la=legalColumns(a),lb=legalColumns(b),
    map=witness.actionMap;
  if(!Array.isArray(map)||map.length!==ga.columns)return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'ACTION_MAP_SHAPE',
  };

  const lbSet=new Set(lb),images=[];
  for(const c of la){
    const d=map[c];
    if(!Number.isInteger(d)||!lbSet.has(d))return {
      schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'ACTION_MAP_NOT_LEGAL',
      sourceColumn:c,
      mappedColumn:d??null,
    };
    images.push(d);
  }
  if(images.length!==lb.length||new Set(images).size!==images.length)return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    seam:'ACTION_MAP_NOT_BIJECTIVE',
    sourceLegalColumns:la,
    targetLegalColumns:lb,
    images,
  };

  const childTransporters=witness.childTransporters??{},
    edges=[];

  for(const c of la){
    const d=map[c],
      ca=applyCpcxForcedEvent(a,a.heights[c]*ga.columns+c),
      cb=applyCpcxForcedEvent(b,b.heights[d]*gb.columns+d),
      oa=observation(ca),ob=observation(cb);

    if(oa.kind!==ob.kind||oa.player!==ob.player)return {
      schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'TERMINAL_OBSERVATION_MISMATCH',
      sourceColumn:c,
      mappedColumn:d,
      sourceObservation:oa,
      targetObservation:ob,
    };

    if(oa.kind!=='NONTERMINAL'){
      edges.push({
        sourceColumn:c,
        mappedColumn:d,
        observation:oa,
        childTransporter:null,
      });
      continue;
    }

    const p=childTransporters[String(c)]??childTransporters[c];
    if(!validatePermutation(ga.columns,p))return {
      schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'CHILD_TRANSPORTER_REQUIRED',
      sourceColumn:c,
      mappedColumn:d,
    };

    const qa=permuteCpcxQCarrier(buildCpcxQCarrier(ca),p),
      qb=buildCpcxQCarrier(cb);
    if(keyCpcxQCarrier(qa)!==keyCpcxQCarrier(qb))return {
      schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
      kind:'NO_CERTIFICATE',
      exact:false,
      seam:'CHILD_Q_TRANSPORT_MISMATCH',
      sourceColumn:c,
      mappedColumn:d,
      childTransporter:p,
    };

    edges.push({
      sourceColumn:c,
      mappedColumn:d,
      observation:oa,
      childTransporter:[...p],
    });
  }

  return {
    schema:'connect4.cpcx.qo-branch-local-ti.v0_1',
    kind:'CERTIFIED_Q_FUTURE_EQUIVALENCE',
    exact:true,
    mover:a.mover,
    rank:a.rank,
    actionMap:[...map],
    edges,
    comparisonView:'ORDINARY_FIRST_TERMINAL_FUTURE_GAME',
    proofRule:'one current action bijection preserves first-terminal observations and every nonterminal child is transported into an equal qualified q_o carrier; qualified standard-7x6 q_o rank induction closes the full future below each child',
    theoremProvenance:[
      'STANDARD_7X6_Q_CONGRUENCE.md',
      'Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md',
      'RESIDUAL_Q_COLUMN_ORBIT_RESULT.md',
      'IsoGraph DTS 0.1 view-scoped Transition Isomorph discipline',
    ],
    consequences:{
      ordinaryWdlEquivalent:true,
      ordinaryDistanceValueEquivalent:true,
      literalActionLabelsIdentical:false,
      physicalStateIdentity:false,
      cpcxProofStateIdentity:false,
    },
    recursive:false,
    gameTreeTraversal:false,
    solvedData:false,
    oracle:false,
  };
}
