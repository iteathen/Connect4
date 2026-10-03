// CPCX control-state quotient support.
//
// Runtime-authoritative equivalence in v0.1:
//   exact horizontal reflection only.
//
// Horizontal reflection is an exact Connect-K automorphism on rectangular
// gravity boards: it preserves rank, mover, legality, gravity, first-terminal
// precedence, winning-line incidence, and maps every future legal event to one
// reflected legal event. Therefore reflected positions may share one proof
// representative without assuming any solved value.
//
// This module also exposes a deliberately lossy control projection for theorem
// discovery.  Projection equality is NOT an equivalence proof and MUST NOT be
// used to transfer CERTIFIED_FIRST_WIN until a separate congruence theorem
// proves that the erased information cannot change any admitted CPCX transition.

import {
  buildCpcxPosition,
  cpcxColumnProfiles,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  findCpcxSynchronizedProjectionLadders,
  findCpcxDisjointSynchronizedFamilies,
} from './cpcx-closure.mjs';

export function reflectCpcxColumn(geometry,column){
  if(!Number.isInteger(column)||column<0||column>=geometry.columns)
    throw new RangeError('column');
  return geometry.columns-1-column;
}

export function reflectCpcxCell(geometry,cell){
  if(!Number.isInteger(cell)||cell<0||cell>=geometry.cellCount)
    throw new RangeError('cell');
  const column=cell%geometry.columns,
    row=Math.floor(cell/geometry.columns);
  return row*geometry.columns+reflectCpcxColumn(geometry,column);
}

export function reflectCpcxOrientation(orientation){
  if(orientation==='D+')return 'D-';
  if(orientation==='D-')return 'D+';
  return orientation;
}

export function reflectCpcxPosition(position){
  const g=position.geometry,
    reflectedMoves=Array.from(
      position.moves,
      column=>reflectCpcxColumn(g,column)
    );
  return buildCpcxPosition(reflectedMoves,{
    geometry:g,
    allowPostTerminal:false,
  });
}

function exactKey(position){
  return JSON.stringify({
    geometry:[
      position.geometry.columns,
      position.geometry.rows,
      position.geometry.connect,
    ],
    rank:position.rank,
    mover:position.mover,
    heights:Array.from(position.heights),
    owner:Array.from(position.owner),
    terminal:position.terminal
      ?{player:position.terminal.player,lineId:position.terminal.lineId}
      :null,
  });
}

export function canonicalizeCpcxExactReflection(position){
  const reflected=reflectCpcxPosition(position),
    directKey=exactKey(position),
    reflectedKey=exactKey(reflected);
  if(reflectedKey<directKey)return {
    schema:'connect4.cpcx.exact-reflection-quotient.v0_1',
    exact:true,
    equivalence:'HORIZONTAL_REFLECTION_AUTOMORPHISM',
    reflected:true,
    key:reflectedKey,
    position:reflected,
    sourcePosition:position,
    proofRule:'horizontal reflection preserves gravity, legal-event correspondence, winning-line incidence, alternating mover, and first-terminal precedence',
  };
  return {
    schema:'connect4.cpcx.exact-reflection-quotient.v0_1',
    exact:true,
    equivalence:'HORIZONTAL_REFLECTION_AUTOMORPHISM',
    reflected:false,
    key:directKey,
    position,
    sourcePosition:position,
    proofRule:'horizontal reflection preserves gravity, legal-event correspondence, winning-line incidence, alternating mover, and first-terminal precedence',
  };
}

function role(player,attacker){
  return player===attacker?'ATTACKER':'DEFENDER';
}

function supportProfile(position,obligation){
  return obligation.events
    .map(e=>e.supportDistance)
    .sort((a,b)=>a-b);
}

function normalizedResidualProfile(position,{attacker}){
  const rows=scanCpcxObligations(position).map(o=>({
    role:role(o.player,attacker),
    orientation:o.orientation,
    missingCount:o.missingCount,
    supportShape:o.supportShape,
    supportDistances:supportProfile(position,o),
    playableCount:o.currentlyPlayableCells.length,
    projectedOwnerRoles:o.projectedOwnerVector
      .map(player=>role(player,attacker))
      .sort(),
  }));
  rows.sort((a,b)=>
    a.role.localeCompare(b.role)||
    a.missingCount-b.missingCount||
    a.orientation.localeCompare(b.orientation)||
    a.supportShape.localeCompare(b.supportShape)||
    a.supportDistances.join(',').localeCompare(b.supportDistances.join(','))||
    a.playableCount-b.playableCount||
    a.projectedOwnerRoles.join(',').localeCompare(b.projectedOwnerRoles.join(','))
  );
  return rows;
}

function columnProfileMultiset(position){
  return cpcxColumnProfiles(position)
    .map(x=>({
      height:x.height,
      remaining:x.remaining,
      neutralPairCount:x.neutralPairCount,
      unmatchedTopDefect:x.unmatchedTopDefect,
    }))
    .sort((a,b)=>
      a.height-b.height||
      a.remaining-b.remaining||
      a.neutralPairCount-b.neutralPairCount||
      a.unmatchedTopDefect-b.unmatchedTopDefect
    );
}

function projectionLadderProfiles(position,{attacker}){
  return findCpcxSynchronizedProjectionLadders(
    scanCpcxObligations(position)
  )
    .filter(x=>x.player===attacker)
    .map(x=>({
      orientation:x.orientation,
      missingCount:x.missingCount,
      levelCount:x.levels.length,
      supportDistances:x.levels
        .map(y=>y.supportDistance)
        .sort((a,b)=>a-b),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.levelCount-b.levelCount||
      a.supportDistances.join(',').localeCompare(b.supportDistances.join(','))
    );
}

function disjointFamilyProfiles(position,{attacker}){
  return findCpcxDisjointSynchronizedFamilies(
    scanCpcxObligations(position),
    {minLevels:2}
  )
    .filter(x=>x.player===attacker)
    .map(x=>({
      orientation:x.orientation,
      missingCount:x.missingCount,
      familyALevels:x.familyA.levels.length,
      familyBLevels:x.familyB.levels.length,
      familyASupport:x.familyA.levels
        .map(y=>y.supportDistance)
        .sort((a,b)=>a-b),
      familyBSupport:x.familyB.levels
        .map(y=>y.supportDistance)
        .sort((a,b)=>a-b),
    }))
    .sort((a,b)=>
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.familyALevels-b.familyALevels||
      a.familyBLevels-b.familyBLevels||
      a.familyASupport.join(',').localeCompare(b.familyASupport.join(','))||
      a.familyBSupport.join(',').localeCompare(b.familyBSupport.join(','))
    );
}

export function projectCpcxControlState(position,{
  attacker=position.mover,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');

  const immediate=classifyCpcxImmediate(position),
    descriptor={
      schema:'connect4.cpcx.control-projection.v0_1',
      proofStatus:'DISCOVERY_ONLY_NOT_A_CONGRUENCE',
      geometry:[
        position.geometry.columns,
        position.geometry.rows,
        position.geometry.connect,
      ],
      moverRole:role(position.mover,attacker),
      terminalRole:position.terminal
        ?role(position.terminal.player,attacker)
        :null,
      immediateKind:immediate.kind,
      columnProfileMultiset:columnProfileMultiset(position),
      residualProfile:normalizedResidualProfile(position,{attacker}),
      projectionLadders:projectionLadderProfiles(position,{attacker}),
      disjointFamilies:disjointFamilyProfiles(position,{attacker}),
    };

  return {
    ...descriptor,
    key:JSON.stringify(descriptor),
    erasedInformation:[
      'absolute column identity',
      'exact occupied-cell ownership outside residual/profile summaries',
      'winning-line ancestry identifiers',
      'exact residual cell attachment graph',
      'exact frontier-to-residual incidence',
      'exact future event correspondence',
    ],
    boundary:'projection equality is discovery evidence only; no certificate transport is authorized without a separate control-state congruence theorem',
  };
}

export function compareCpcxControlProjection(a,b,{attackerA=a.mover,attackerB=b.mover}={}){
  const pa=projectCpcxControlState(a,{attacker:attackerA}),
    pb=projectCpcxControlState(b,{attacker:attackerB});
  return {
    equal:pa.key===pb.key,
    a:pa,
    b:pb,
    authoritative:false,
    reason:pa.key===pb.key
      ?'lossy projections match, but congruence is not proved'
      :'lossy projections already differ',
  };
}
