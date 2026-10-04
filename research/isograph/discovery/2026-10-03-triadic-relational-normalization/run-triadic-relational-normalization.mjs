import fs from 'node:fs';

import {
  createCpcxGeometry,
  scanCpcxObligations,
} from '../2026-10-02-cpcx/cpcx.mjs';
import {
  classifyCpcxImmediate,
} from '../2026-10-02-cpcx/cpcx-closure.mjs';
import {
  classifyCpcxProgress,
} from '../2026-10-02-cpcx/cpcx-progress.mjs';
import {
  buildCpcxMove6UnresolvedClassesArtifact,
} from '../2026-10-02-cpcx/cpcx-move6-unresolved-classes.mjs';
import {
  certifyCpcxProtectedDiagonalControllerSaturationV2,
} from '../2026-10-02-cpcx/cpcx-controller-saturation-v2.mjs';
import {
  certifyCpcxProtectedDiagonalOpponentResponseDescentV2,
} from '../2026-10-02-cpcx/cpcx-opponent-response-descent-v2.mjs';

const uc4aPath=new URL(
  '../2026-09-30-universal-structural-policy/UC4A_IP_REGIME_SUBSPACE_TOMOGRAPHY_0_1.json',
  import.meta.url
);
const uc4a=JSON.parse(fs.readFileSync(uc4aPath,'utf8'));

const CHANNELS=['0','1','2'];
const MASK_NAMES=['000','100','010','110','001','101','011','111'];
const g=createCpcxGeometry();
const rootLine='A6-B5-C4-D3';

function bitMask(active){
  let m=0;
  for(const i of active)m|=1<<i;
  return m;
}
function maskText(m){
  return [0,1,2].map(i=>(m&(1<<i))?'1':'0').join('');
}
function cardinality(m){
  let n=0;
  for(let i=0;i<3;i++)if(m&(1<<i))n++;
  return n;
}
function projectMask(m,drop){
  return [0,1,2].filter(i=>i!==drop).map(i=>(m&(1<<i))?'1':'0').join('');
}
function permutations(xs){
  const out=[];
  for(const a of xs)for(const b of xs)if(b!==a)
    for(const c of xs)if(c!==a&&c!==b)out.push([a,b,c]);
  return out;
}
function permuteMask(m,p){
  let out=0;
  for(let i=0;i<3;i++)if(m&(1<<i))out|=1<<p[i];
  return out;
}
function histogram(records,key='mask'){
  const out={};
  for(const r of records){
    const k=maskText(r[key]);
    out[k]=(out[k]??0)+1;
  }
  return Object.fromEntries(Object.entries(out).sort());
}
function setMasks(records){
  return [...new Set(records.map(x=>x.mask))].sort((a,b)=>a-b);
}
function maskCardinalityHistogram(records){
  const out={singleton:0,pair:0,triple:0};
  for(const r of records){
    const c=cardinality(r.mask);
    if(c===1)out.singleton++;
    else if(c===2)out.pair++;
    else if(c===3)out.triple++;
  }
  return out;
}

// ---------- UC4A normalization ----------
function ucChannel(field){
  if(field.startsWith('P.'))return 2;
  if(
    field.startsWith('I.coreReflection.leftRightFixed.')||
    field.startsWith('I.coreReflection.geometryOnlyTopBottomFixed.')
  )return 0;
  if(field.startsWith('I.'))return 1;
  return null;
}
function basisMask(regime){
  const active=new Set();
  for(const row of regime?.rrefBasis??[])
    for(const x of row){
      const c=ucChannel(x.field);
      if(c!==null)active.add(c);
    }
  return bitMask(active);
}
const ucRegimes=new Map(
  (uc4a.part1?.regimes??[]).map(x=>[x.regimeId,x])
);
const ucRecords=[];
function walkUc(node){
  if(!node||typeof node!=='object')return;
  if(
    typeof node.sourceRegime==='string'&&
    typeof node.targetRegime==='string'&&
    Array.isArray(node.directions)
  ){
    const sourceMask=basisMask(ucRegimes.get(node.sourceRegime)),
      targetMask=basisMask(ucRegimes.get(node.targetRegime));
    for(const d of node.directions){
      const active=new Set();
      for(const x of d.nonzeroCoordinates??[]){
        const c=ucChannel(x.field);
        if(c!==null)active.add(c);
      }
      const mask=bitMask(active);
      if(mask)ucRecords.push({
        system:'UC4A',
        directionId:d.directionId,
        axis:node.axis??null,
        family:node.family??null,
        sourceRegime:node.sourceRegime,
        targetRegime:node.targetRegime,
        sourceMask,
        targetMask,
        mask,
        recurring:d.extendedGridRecurring===true,
        rowCount:d.rowCount??null,
      });
    }
  }
  if(Array.isArray(node))for(const x of node)walkUc(x);
  else for(const v of Object.values(node))walkUc(v);
}
walkUc(uc4a);
const ucUnique=new Map();
for(const r of ucRecords){
  const k=[
    r.directionId,r.axis,r.family,r.sourceRegime,r.targetRegime,
  ].join('|');
  if(!ucUnique.has(k))ucUnique.set(k,r);
}
const uc=[...ucUnique.values()];

function ucProjectionAmbiguity(drop){
  const groups=new Map();
  for(const r of uc){
    const key=[
      r.axis??'?',r.family??'?',
      projectMask(r.sourceMask,drop),
    ].join('|');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(r);
  }
  const ambiguous=[];
  for(const [key,rows] of groups){
    const outcomes=[...new Set(rows.map(x=>x.mask))];
    if(outcomes.length>1)ambiguous.push({
      key,
      recordCount:rows.length,
      fullMasks:outcomes.map(maskText).sort(),
      examples:rows.slice(0,4).map(x=>x.directionId),
    });
  }
  return ambiguous;
}

// ---------- CPCX normalization ----------
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
function physicalKey(p){
  return `${p.mover}|${Array.from(p.heights).join(',')}|${Array.from(p.owner).map(x=>x+1).join('')}`;
}
function rootResidual(p){
  return scanCpcxObligations(p).find(o=>
    o.player===0&&o.lineLabel===rootLine
  )??null;
}
function supportDebt(r){
  return r.events.reduce((n,e)=>n+e.supportDistance,0);
}
function carrierSig(r){
  return JSON.stringify({
    orientation:r.orientation,
    lineId:r.lineId,
    missingCount:r.missingCount,
    missing:[...r.missingCells].sort((a,b)=>a-b),
  });
}
function supportSig(r){
  return JSON.stringify({
    debt:supportDebt(r),
    events:[...r.events]
      .sort((a,b)=>a.cell-b.cell)
      .map(e=>[e.cell,e.supportDistance,e.eventRank&1]),
  });
}
function responseSig(p){
  const immediate=classifyCpcxImmediate(p),
    progress=classifyCpcxProgress(p,{player:0});
  return JSON.stringify({
    mover:p.mover,
    immediate:immediate.kind,
    progressKind:progress.kind,
    progressExact:progress.exact??false,
    progressSource:progress.source??null,
    macroKind:progress.macro?.kind??null,
    blockerCount:progress.obligation?.blockingCells?.length??0,
  });
}
function channels(p,r){
  return [carrierSig(r),supportSig(r),responseSig(p)];
}
function changedMask(a,b){
  const active=[];
  for(let i=0;i<3;i++)if(a[i]!==b[i])active.push(i);
  return bitMask(active);
}

const unresolved=buildCpcxMove6UnresolvedClassesArtifact(),
  sourceMap=new Map(),
  sourceFailures=[];
for(const cls of unresolved.classes){
  const p=positionFromClass(cls),R=rootResidual(p);
  if(!R){
    sourceFailures.push({classId:cls.classId,seam:'ROOT_RESIDUAL_MISSING'});
    continue;
  }
  const sixthMoves=[...new Set(cls.sources.map(x=>x.sixthMove))].sort((a,b)=>a-b);
  let q=p,Q=R,sourceKind='ORIGINAL_P1';
  if(p.mover===0){
    const s=certifyCpcxProtectedDiagonalControllerSaturationV2(
      p,{protectedResidual:R}
    );
    if(!s.exact||s.kind!=='PROTECTED_DIAGONAL_CONTROLLER_SATURATION_V2'){
      sourceFailures.push({
        classId:cls.classId,
        seam:s.seam??s.kind,
      });
      continue;
    }
    q=s.finalPosition;
    Q=s.finalResidual;
    sourceKind='SATURATED_P1_V2';
  }
  const key=physicalKey(q);
  if(!sourceMap.has(key))sourceMap.set(key,{
    position:q,
    residual:Q,
    provenance:[],
  });
  sourceMap.get(key).provenance.push({
    classId:cls.classId,
    sixthMoves,
    sourceKind,
  });
}

const cpcx=[],terminals=[],descentFailures=[];
for(const source of sourceMap.values()){
  const sourceChannels=channels(source.position,source.residual),
    sourceSixthMoves=[...new Set(source.provenance.flatMap(x=>x.sixthMoves))]
      .sort((a,b)=>a-b),
    cert=certifyCpcxProtectedDiagonalOpponentResponseDescentV2(
      source.position,{protectedResidual:source.residual}
    );
  if(!cert.exact||cert.kind!=='PROTECTED_DIAGONAL_OPPONENT_RESPONSE_DESCENT_V2'){
    descentFailures.push({
      physicalKey:physicalKey(source.position),
      seam:cert.seam??cert.kind,
      failureCount:cert.failures?.length??null,
      sixthMoves:sourceSixthMoves,
    });
    continue;
  }
  for(const row of cert.rows){
    if(row.kind==='CERTIFIED_FIRST_WIN'){
      terminals.push({
        eventCell:row.eventCell??null,
        sixthMoves:sourceSixthMoves,
      });
      continue;
    }
    if(!row.finalPosition||!row.finalResidual){
      descentFailures.push({
        physicalKey:physicalKey(source.position),
        seam:'NONTERMINAL_ROW_MISSING_FINAL',
        eventCell:row.eventCell??null,
        sixthMoves:sourceSixthMoves,
      });
      continue;
    }
    const target=source.residual.missingCells.includes(row.eventCell),
      finalChannels=channels(row.finalPosition,row.finalResidual),
      mask=changedMask(sourceChannels,finalChannels);
    cpcx.push({
      system:'CPCX',
      selector:target?'TARGET':'EXTERNAL',
      transportKind:row.transportKind??null,
      sourceChannels,
      finalChannels,
      mask,
      sixthMoves:sourceSixthMoves,
      sourceMeasure:row.sourceMeasure??null,
      finalMeasure:row.finalMeasure??null,
    });
  }
}

function cpcProjectionAmbiguity(drop){
  const groups=new Map();
  for(const r of cpcx){
    const kept=r.sourceChannels.filter((_,i)=>i!==drop);
    const key=JSON.stringify([r.selector,...kept]);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(r);
  }
  const ambiguous=[];
  for(const [key,rows] of groups){
    const masks=[...new Set(rows.map(x=>x.mask))];
    if(masks.length>1)ambiguous.push({
      key,
      recordCount:rows.length,
      fullMasks:masks.map(maskText).sort(),
      transportKinds:[...new Set(rows.map(x=>x.transportKind))].sort(),
    });
  }
  return ambiguous;
}

const cpcMaskBySixth=new Map();
for(const r of cpcx){
  if(!cpcMaskBySixth.has(r.mask))cpcMaskBySixth.set(r.mask,new Set());
  for(const m of r.sixthMoves)cpcMaskBySixth.get(r.mask).add(m);
}
const cpcRecurringMasks=[...cpcMaskBySixth]
  .filter(([,moves])=>moves.size===7)
  .map(([mask])=>mask)
  .sort((a,b)=>a-b);
const ucRecurring=uc.filter(x=>x.recurring);

const perms=permutations([0,1,2]).map(p=>{
  const mappedAll=new Set(setMasks(uc).map(m=>permuteMask(m,p))),
    mappedRecurring=new Set(setMasks(ucRecurring).map(m=>permuteMask(m,p))),
    cAll=new Set(setMasks(cpcx)),
    cRec=new Set(cpcRecurringMasks),
    allIntersection=[...mappedAll].filter(x=>cAll.has(x)),
    recurringIntersection=[...mappedRecurring].filter(x=>cRec.has(x));
  return {
    permutation:p,
    ucToCpc:{
      U_A:['C','S','R'][p[0]],
      U_R:['C','S','R'][p[1]],
      U_P:['C','S','R'][p[2]],
    },
    allOverlap:allIntersection.length,
    allUnion:new Set([...mappedAll,...cAll]).size,
    recurringOverlap:recurringIntersection.length,
    recurringUnion:new Set([...mappedRecurring,...cRec]).size,
    mappedUcAll:[...mappedAll].sort((a,b)=>a-b).map(maskText),
    mappedUcRecurring:[...mappedRecurring].sort((a,b)=>a-b).map(maskText),
    cpcAll:[...cAll].sort((a,b)=>a-b).map(maskText),
    cpcRecurring:[...cRec].sort((a,b)=>a-b).map(maskText),
  };
}).sort((a,b)=>
  b.recurringOverlap-a.recurringOverlap||
  a.recurringUnion-b.recurringUnion||
  b.allOverlap-a.allOverlap||
  a.allUnion-b.allUnion
);

const result={
  schema:'connect4.triadic-relational-normalization.v0_1',
  date:'2026-10-03',
  branch:'experiment/triadic-relational-normalization-20261003',
  normalization:{
    uc4aChannels:{
      A:'axis-core: LR/TB reflection-fixed incidence/core fields',
      R:'rotation-core: rotation180 and remaining incidence/core fields',
      P:'phase-path: P.* fields',
    },
    cpcxChannels:{
      C:'protected carrier identity/role',
      S:'support profile/debt/phase',
      R:'immediate/progress/response interface',
    },
  },
  uc4a:{
    recordCount:uc.length,
    recurringRecordCount:ucRecurring.length,
    maskHistogram:histogram(uc),
    recurringMaskHistogram:histogram(ucRecurring),
    distinctMasks:setMasks(uc).map(maskText),
    distinctRecurringMasks:setMasks(ucRecurring).map(maskText),
    cardinality:maskCardinalityHistogram(uc),
    recurringCardinality:maskCardinalityHistogram(ucRecurring),
    dropChannelAmbiguity:{
      A:ucProjectionAmbiguity(0),
      R:ucProjectionAmbiguity(1),
      P:ucProjectionAmbiguity(2),
    },
  },
  cpcx:{
    unresolvedClassCount:unresolved.classCount,
    openBoundaryCount:sourceMap.size,
    sourceFailures,
    descentFailures,
    nonterminalRowCount:cpcx.length,
    terminalRowCount:terminals.length,
    maskHistogram:histogram(cpcx),
    distinctMasks:setMasks(cpcx).map(maskText),
    recurringMasks:cpcRecurringMasks.map(maskText),
    cardinality:maskCardinalityHistogram(cpcx),
    dropChannelAmbiguity:{
      C:cpcProjectionAmbiguity(0),
      S:cpcProjectionAmbiguity(1),
      R:cpcProjectionAmbiguity(2),
    },
    transportKinds:Object.fromEntries(
      [...new Set(cpcx.map(x=>x.transportKind))].sort().map(k=>[
        k,cpcx.filter(x=>x.transportKind===k).length
      ])
    ),
  },
  crossSystem:{
    permutations:perms,
    bestPermutation:perms[0],
  },
  boundary:{
    structuralOnly:true,
    oracleUsed:false,
    solvedDataUsed:false,
    noThreeBodyClaim:true,
    noValueClaim:true,
    noRemotenessClaim:true,
  },
};
console.log(JSON.stringify(result,null,2));
