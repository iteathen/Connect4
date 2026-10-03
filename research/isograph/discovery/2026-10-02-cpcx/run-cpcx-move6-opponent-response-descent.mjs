import {
  createCpcxGeometry,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from './cpcx-move6-unresolved-classes.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturation,
} from './cpcx-controller-saturation.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseDescent,
} from './cpcx-opponent-response-descent.mjs';

const g=createCpcxGeometry(),
  artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  targetLine='A6-B5-C4-D3';

function positionFromClass(cls){
  const [moverText,heightsText,ownerText]=cls.key.split('|'),
    owner=new Int8Array(g.cellCount);
  for(let i=0;i<ownerText.length;i++)owner[i]=Number(ownerText[i])-1;
  return {
    geometry:g,
    moves:new Uint32Array(0),
    rank:cls.rank,
    mover:Number(moverText),
    heights:new Uint32Array(heightsText.split(',').map(Number)),
    owner,
    terminal:null,
  };
}
function physicalKey(position){
  return `${position.mover}|${Array.from(position.heights).join(',')}|${Array.from(position.owner).map(x=>x+1).join('')}`;
}
function rootResidual(position){
  return scanCpcxObligations(position).find(o=>
    o.player===0&&o.lineLabel===targetLine
  )??null;
}
function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}
function measure(p,r){
  return [r.missingCount,supportDebt(r),p.geometry.cellCount-p.rank];
}

const sources=new Map();

for(const cls of artifact.classes){
  const p=positionFromClass(cls),R=rootResidual(p);
  if(!R)throw new Error(`target residual missing ${cls.classId}`);
  const provenance={
    classId:cls.classId,
    sixthMoves:[...new Set(cls.sources.map(x=>x.sixthMove))].sort((a,b)=>a-b),
  };

  if(p.mover===1){
    const key=physicalKey(p);
    if(!sources.has(key))sources.set(key,{position:p,residual:R,provenance:[]});
    sources.get(key).provenance.push({
      kind:'ORIGINAL_P1_BOUNDARY',
      ...provenance,
    });
    continue;
  }

  const s=certifyCpcxProtectedDiagonalControllerSaturation(p,{
    protectedResidual:R,
  });
  if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION')
    throw new Error(`controller saturation failed ${cls.classId}: ${s.seam??s.kind}`);

  const key=physicalKey(s.finalPosition);
  if(!sources.has(key))sources.set(key,{
    position:s.finalPosition,
    residual:s.finalResidual,
    provenance:[],
  });
  sources.get(key).provenance.push({
    kind:'SATURATED_P1_BOUNDARY',
    ...provenance,
    sourceMeasure:s.sourceMeasure,
    finalMeasure:s.finalMeasure,
  });
}

const rows=[...sources.values()].map((x,index)=>{
  const c=certifyCpcxProtectedDiagonalOpponentResponseDescent(x.position,{
    protectedResidual:x.residual,
  });
  return {
    boundaryId:`B${index+1}`,
    rank:x.position.rank,
    sourceMeasure:measure(x.position,x.residual),
    provenance:x.provenance,
    certificate:{
      kind:c.kind,
      exact:c.exact??false,
      seam:c.seam??null,
      eventCount:c.eventCount??null,
      allCurrentOpponentEventsCovered:
        c.allCurrentOpponentEventsCovered??false,
      everyEventWinsOrStrictlyDescends:
        c.everyEventWinsOrStrictlyDescends??false,
      rowKinds:(c.rows??[]).map(r=>r.kind),
    },
  };
}).sort((a,b)=>
  a.sourceMeasure[0]-b.sourceMeasure[0]||
  a.sourceMeasure[1]-b.sourceMeasure[1]||
  a.sourceMeasure[2]-b.sourceMeasure[2]||
  a.rank-b.rank
);

const failures=rows.filter(x=>!x.certificate.exact),
  moves=[...new Set(rows.flatMap(x=>
    x.provenance.flatMap(p=>p.sixthMoves)
  ))].sort((a,b)=>a-b);

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.opponent-response-descent.v0_1',
  root:'44444',
  targetLine,
  rows,
  summary:{
    p1BoundaryPhysicalClassCount:rows.length,
    exactBoundaryCertificateCount:rows.length-failures.length,
    failureCount:failures.length,
    failures:failures.map(x=>({
      boundaryId:x.boundaryId,
      sourceMeasure:x.sourceMeasure,
      seam:x.certificate.seam,
    })),
    totalCurrentOpponentEvents:rows.reduce(
      (n,x)=>n+(x.certificate.eventCount??0),0
    ),
    everyBoundaryResponseTotal:rows.every(x=>
      x.certificate.allCurrentOpponentEventsCovered
    ),
    everyBoundaryStrictDescentOrWin:rows.every(x=>
      x.certificate.everyEventWinsOrStrictlyDescends
    ),
    sourceMeasureClasses:[...new Set(rows.map(x=>
      JSON.stringify(x.sourceMeasure)
    ))].map(JSON.parse).sort((a,b)=>
      a[0]-b[0]||a[1]-b[1]||a[2]-b[2]
    ),
    representedSixthMoves:moves,
    spansAllSevenSixthMoves:moves.join(',')==='1,2,3,4,5,6,7',
  },
  boundary:{
    applicationUsesGenericOpponentResponseTheorem:true,
    sourceBandBuiltOnlyFromExactUnresolvedClassesAndControllerSaturation:true,
    noSecondFreeOpponentLayer:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
    futureTreeGeneration:false,
    noBestSetConclusion:true,
  },
},null,2));
