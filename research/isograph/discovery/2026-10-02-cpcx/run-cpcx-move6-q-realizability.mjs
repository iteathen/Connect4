import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  canonicalizeCpcxQColumnOrbit,
} from './cpcx-q-quotient.mjs';
import {
  closeCpcxQRealizability,
  canonicalizeCpcxQRealizabilityOrbit,
} from './cpcx-q-realizability.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

const rows=[];
for(let c=0;c<g.columns;c++){
  const cell=root.heights[c]*g.columns+c,
    child=applyCpcxForcedEvent(root,cell),
    raw=canonicalizeCpcxQColumnOrbit(child),
    closed=canonicalizeCpcxQRealizabilityOrbit(child),
    closure=closeCpcxQRealizability(child);
  rows.push({
    sixthMove:c+1,
    support:Array.from(child.heights),
    rawOrbitKey:raw.key,
    closedOrbitKey:closed.key,
    rawResidualCounts:raw.sourceCarrier.residuals.map(x=>x.length),
    closedResidualCounts:closure.carrier.residuals.map(x=>x.length),
    deletionCount:closure.deletions.length,
    ruleCounts:closure.ruleCounts,
    deletions:closure.deletions.map(x=>({
      player:x.player,
      size:x.residual.length,
      cells:x.residual,
      rule:x.rule,
    })),
  });
}

function group(field){
  const m=new Map();
  for(const row of rows){
    const key=row[field];
    if(!m.has(key))m.set(key,[]);
    m.get(key).push(row.sixthMove);
  }
  return [...m.entries()].map(([key,moves])=>({key,moves}))
    .sort((a,b)=>a.moves[0]-b.moves[0]);
}

const raw=group('rawOrbitKey'),
  closed=group('closedOrbitKey');

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.qo-realizability-quotient.v0_1',
  root:'44444',
  rawQOrbit:{
    classCount:raw.length,
    classes:raw.map(x=>x.moves),
  },
  realizabilityClosedOrbit:{
    classCount:closed.length,
    classes:closed.map(x=>x.moves),
    allSevenEquivalent:closed.length===1,
  },
  rows,
  premises:{
    standardBoard:'7x6',
    semanticRules:[
      'NONTERMINAL_FRONTIER_BLOCKER',
      'FINAL_EVENT_CAP_PARITY',
      'REMAINING_MOVE_CAPACITY',
      'SUPPORT_RELEASE_TURN_CAPACITY',
    ],
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    minimax:false,
  },
  boundary:'semantic residual deletion is behavior-preserving but representation-nonmonotone; this diagnostic tests equivalence only and does not replace full q_o inside unrelated CPCX proof certificates',
},null,2));
