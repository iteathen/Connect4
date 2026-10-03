import {buildCpcxMove6UnresolvedClassesArtifact} from './cpcx-move6-unresolved-classes.mjs';

const artifact=buildCpcxMove6UnresolvedClassesArtifact();

function decodeCanonicalOwner(cls){
  const parts=cls.key.split('|');
  if(parts.length!==3)throw new Error('unexpected physical key');
  const digits=parts[2];
  if(digits.length!==42)throw new Error('unexpected owner key width');
  return Array.from(digits,ch=>Number(ch)-1);
}

function supportTokens(cls){
  const owner=decodeCanonicalOwner(cls),out=[];
  for(let column=0;column<3;column++){
    for(let row=0;row<cls.support[column];row++){
      const player=owner[row*7+column];
      if(player!==0&&player!==1)
        throw new Error('support token is not occupied');
      out.push({
        column,
        columnLabel:String.fromCharCode(65+column),
        row,
        rowLabel:row+1,
        player,
      });
    }
  }
  return out;
}

function tupleKey(xs){return xs.join(',');}

const rows=artifact.classes.map(cls=>{
  const heights=cls.support.slice(0,3),
    tokenCount=heights.reduce((a,b)=>a+b,0),
    tokens=supportTokens(cls),
    ownership=tokens.length===0
      ?'EMPTY'
      :tokens.every(x=>x.player===1)
        ?'ALL_P1'
        :tokens.every(x=>x.player===0)
          ?'ALL_P0'
          :'MIXED',
    supportProfile=[
      5-heights[0],
      4-heights[1],
      3-heights[2],
    ];
  return {
    classId:cls.classId,
    rank:cls.rank,
    mover:cls.mover,
    sixthMoves:[...new Set(cls.sources.map(s=>s.sixthMove))].sort((a,b)=>a-b),
    heights,
    tokenCount,
    tokens,
    ownership,
    supportProfile,
    supportDebt:supportProfile.reduce((a,b)=>a+b,0),
  };
});

const observedTriples=[...new Set(rows.map(r=>tupleKey(r.heights)))]
  .map(s=>s.split(',').map(Number))
  .sort((a,b)=>a.reduce((x,y)=>x+y,0)-b.reduce((x,y)=>x+y,0)||
    a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);

const expectedTriples=[];
for(let a=0;a<=2;a++)for(let b=0;b<=2;b++)for(let c=0;c<=2;c++)
  if(a+b+c<=2)expectedTriples.push([a,b,c]);
expectedTriples.sort((a,b)=>a.reduce((x,y)=>x+y,0)-b.reduce((x,y)=>x+y,0)||
  a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);

const ownershipCounts={};
for(const row of rows)
  ownershipCounts[row.ownership]=(ownershipCounts[row.ownership]??0)+1;

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.diagonal-support-simplex.v0_1',
  sourceArtifactSchema:artifact.schema,
  target:{
    line:'A6-B5-C4-D3',
    missingCells:['A6','B5','C4'],
    supportColumns:['A','B','C'],
  },
  rows,
  summary:{
    classCount:rows.length,
    supportTupleClassCount:observedTriples.length,
    observedSupportHeightTriples:observedTriples,
    expectedDegreeAtMostTwoTriples:expectedTriples,
    exactDegreeAtMostTwoSimplex:
      JSON.stringify(observedTriples)===JSON.stringify(expectedTriples),
    tokenCountClasses:[...new Set(rows.map(r=>r.tokenCount))].sort((a,b)=>a-b),
    allTokenCountsAtMostTwo:rows.every(r=>r.tokenCount<=2),
    supportDebtClasses:[...new Set(rows.map(r=>r.supportDebt))].sort((a,b)=>a-b),
    ownershipCounts,
    nonemptyAllP1ClassCount:rows.filter(r=>r.ownership==='ALL_P1').length,
    nonemptyAllP0ClassCount:rows.filter(r=>r.ownership==='ALL_P0').length,
    mixedOwnershipClassCount:rows.filter(r=>r.ownership==='MIXED').length,
    allP0ExceptionClasses:rows.filter(r=>r.ownership==='ALL_P0')
      .map(r=>r.classId),
    allP0ExceptionSixthMoves:[...new Set(rows
      .filter(r=>r.ownership==='ALL_P0')
      .flatMap(r=>r.sixthMoves))].sort((a,b)=>a-b),
  },
  interpretation:{
    exact:'the universal diagonal defect begins in one of exactly ten support-height states: every weak composition of 0, 1, or 2 occupied support cells across A/B/C',
    ownership:'apart from the explicitly reported all-P0 exception class, every nonempty A/B/C support prefix is P1-owned; no mixed support-owner class occurs',
    candidateState:'support-height triple + support-owner role + global event-phase gauge + protected diagonal ancestry',
  },
  boundary:{
    diagnosticOnly:true,
    doesNotProveTransitionClosure:true,
    doesNotProveFirstWin:true,
    keyDecodingUsedOnlyForExactCurrentSupportOwnership:true,
    classIdsDiagnosticOnly:true,
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    futureTreeGeneration:false,
  },
},null,2));
