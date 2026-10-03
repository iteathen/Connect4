import {buildCpcxMove6UnresolvedClassesArtifact} from './cpcx-move6-unresolved-classes.mjs';

const artifact=buildCpcxMove6UnresolvedClassesArtifact();

const targetMissing=['C4','B5','A6'],
  targetSorted=[...targetMissing].sort();

function sameSet(a,b){
  if(a.length!==b.length)return false;
  const x=[...a].sort(),y=[...b].sort();
  return x.every((v,i)=>v===y[i]);
}

function targetRows(cls){
  return cls.obligations.small.filter(o=>
    o.player===0&&
    o.orientation==='D-'&&
    o.missingCount===3&&
    sameSet(o.missing,targetSorted)
  );
}

function supportProfile(cls){
  const h=cls.support;
  return [
    5-h[0], // A6
    4-h[1], // B5
    3-h[2], // C4
  ];
}

function phaseVector(rank){
  const p=rank&1;
  return [p,p^1,p];
}

const rows=artifact.classes.map(cls=>{
  const targets=targetRows(cls),
    moves=[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    absolutePhase=phaseVector(cls.rank);
  return {
    classId:cls.classId,
    rank:cls.rank,
    mover:cls.mover,
    support:[...cls.support],
    sixthMoves:moves,
    targetResidualCount:targets.length,
    targetResidual:targets[0]??null,
    supportProfile:supportProfile(cls),
    absoluteEventParity:absolutePhase,
    relativeEventParity:absolutePhase.map(x=>x^absolutePhase[0]),
  };
});

const supportClasses=new Map();
for(const row of rows){
  const key=row.supportProfile.join(',');
  if(!supportClasses.has(key))supportClasses.set(key,[]);
  supportClasses.get(key).push(row.classId);
}

const phaseClasses=new Map();
for(const row of rows){
  const key=row.absoluteEventParity.join('');
  if(!phaseClasses.has(key))phaseClasses.set(key,[]);
  phaseClasses.get(key).push(row.classId);
}

const sourceMoves=[...new Set(rows.flatMap(r=>r.sixthMoves))].sort((a,b)=>a-b);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.universal-diagonal-defect-census.v0_1',
  sourceArtifactSchema:artifact.schema,
  observation:'reflection-canonical unresolved physical states after theorem-defined wing/debt/vertical processing',
  target:{
    physicalLine:'A6-B5-C4-D3',
    orientation:'D-',
    player:0,
    anchorCell:'D3',
    missingCells:['A6','B5','C4'],
    missingCount:3,
    uc4aInterpretation:'candidate 3-cell / 1-line-anchor diagonal control defect; interpretation is not a theorem premise',
  },
  rows,
  summary:{
    unresolvedPhysicalClassCount:rows.length,
    allClassesContainExactlyOneTargetResidual:rows.every(r=>
      r.targetResidualCount===1
    ),
    targetResidualClassCount:rows.filter(r=>
      r.targetResidualCount===1
    ).length,
    sourceSixthMoves:sourceMoves,
    spansAllSevenSixthMoves:sourceMoves.join(',')==='1,2,3,4,5,6,7',
    supportProfileClassCount:supportClasses.size,
    supportProfileClasses:[...supportClasses.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([profile,classIds])=>({
        supportProfile:profile.split(',').map(Number),
        classIds,
      })),
    absoluteEventPhaseClassCount:phaseClasses.size,
    absoluteEventPhaseClasses:[...phaseClasses.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([phase,classIds])=>({
        phase:phase.split('').map(Number),
        classIds,
      })),
    relativeEventPhaseClassCount:new Set(rows.map(r=>
      r.relativeEventParity.join('')
    )).size,
    relativeEventPhase:[...new Set(rows.map(r=>
      r.relativeEventParity.join('')
    ))].map(x=>x.split('').map(Number)),
    allNextMoverP0:rows.every(r=>r.mover===0),
  },
  proofNotes:{
    anchorDerivation:'a live P0 residual on physical line A6-B5-C4-D3 with exactly the three named missing cells has D3 as its unique occupied line cell; opponent occupancy would kill the residual',
    phaseDerivation:'CPCX event-rank parity on untouched cells is row-relative up to the global rank gauge; A6/B5/C4 therefore has relative signature 0,1,0 at every rank',
    classIdsDiagnosticOnly:true,
    runtimeTheoremUsesClassIds:false,
  },
  boundary:{
    diagnosticOnly:true,
    doesNotProveDefectTransportClosure:true,
    doesNotProveFirstWin:true,
    doesNotProveUc4aIdentity:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    futureTreeGeneration:false,
  },
},null,2));
