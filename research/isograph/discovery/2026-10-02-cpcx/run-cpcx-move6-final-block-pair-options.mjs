import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  canonicalizeCpcxExactReflection,
} from './cpcx-control-quotient.mjs';
import {
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
  analyzeCpcxTruncatedTargetReservoirCoverage,
  certifyCpcxTruncatedTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%position.geometry.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function frontierFromHeights(heights){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function pairCandidates(position){
  const rows=[];
  for(const o of scanCpcxObligations(position)){
    if(o.player!==0||o.missingCount!==2)continue;
    const events=o.missingCells.map(cell=>{
      const {column,row}=cpcxCell(g,cell);
      return {
        cell,column,row,
        distance:row-position.heights[column],
      };
    });
    const playable=events.filter(x=>x.distance===0);
    if(playable.length!==1)continue;
    const setup=playable[0],
      target=events.find(x=>x.cell!==setup.cell);
    rows.push({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      orientation:o.orientation,
      setupCell:setup.cell,
      targetCell:target.cell,
      targetDistance:target.distance,
      distances:events.map(x=>x.distance).sort((a,b)=>a-b),
    });
  }
  return rows.sort((a,b)=>
    a.targetDistance-b.targetDistance||
    a.orientation.localeCompare(b.orientation)||
    a.lineId-b.lineId||
    a.setupCell-b.setupCell
  );
}
function exactExisting(position){
  const c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:c.kind,
    exact:c.exact,
    player:c.player??null,
    seam:c.seam??null,
    traceLength:c.trace?.length??0,
    firstSource:c.trace?.[0]?.progress?.source??
      c.trace?.[0]?.progress?.kind??null,
  };
}
function evaluatePair(position,pair){
  const child=applyCpcxForcedEvent(position,pair.setupCell);
  if(child.terminal)return {
    route:child.terminal.player===0?'TERMINAL_ON_SETUP':'P1_TERMINAL_ON_SETUP',
    certified:child.terminal.player===0,
    afterSetup:null,
    existing:null,
    ordinary:null,
    targetAnalysis:null,
    coverage:null,
    oneDefect:null,
    oneDefectRcic:null,
  };

  const existing=exactExisting(child);
  if(existing.kind==='CERTIFIED_FIRST_WIN'&&existing.player===0)return {
    route:'EXISTING_CPCX',
    certified:true,
    afterSetup:{
      rank:child.rank,mover:child.mover,support:Array.from(child.heights),
    },
    existing,
    ordinary:null,
    targetAnalysis:null,
    coverage:null,
    oneDefect:null,
    oneDefectRcic:null,
  };

  const ordinary=certifyCpcxTruncatedTargetReservoir(
      child,{attacker:0,targetCell:pair.targetCell}
    ),
    targetAnalysis=analyzeCpcxTargetReservoir(
      child,{attacker:0,targetCell:pair.targetCell}
    ),
    coverage=analyzeCpcxTruncatedTargetReservoirCoverage(
      child,{attacker:0,targetCell:pair.targetCell}
    ),
    oneDefect=analyzeCpcxOneDefectTargetReservoir(
      child,{attacker:0,targetCell:pair.targetCell}
    ),
    oneDefectRcic=oneDefect.kind==='ONE_DEFECT_STATIC_COVERAGE'
      ?certifyCpcxOneDefectTargetReservoirRcic(
        child,{attacker:0,targetCell:pair.targetCell,maxNodes:4096}
      )
      :null;

  const certified=ordinary.kind==='CERTIFIED_FIRST_WIN';
  return {
    route:certified
      ?'TRUNCATED_TARGET_RESERVOIR'
      :oneDefectRcic?.kind==='CERTIFIED_FIRST_WIN'
        ?'UNPROMOTED_ONE_DEFECT_RCIC'
        :'NO_CERTIFICATE',
    certified,
    afterSetup:{
      rank:child.rank,mover:child.mover,support:Array.from(child.heights),
    },
    existing,
    ordinary:{
      kind:ordinary.kind,
      player:ordinary.player??null,
      seam:ordinary.seam??null,
    },
    targetAnalysis:{
      kind:targetAnalysis.kind,
      totalRelevantEvents:targetAnalysis.totalRelevantEvents??null,
      totalParity:targetAnalysis.totalParity??null,
      oddColumns:targetAnalysis.oddColumnLabels??targetAnalysis.oddColumns??null,
    },
    coverage:{
      kind:coverage.kind,
      totalRelevantEvents:coverage.totalRelevantEvents??null,
      minimumUncoveredResiduals:coverage.minimumUncoveredResiduals??null,
      fullCoverageTemplateCount:coverage.fullCoverageTemplateCount??null,
    },
    oneDefect:{
      kind:oneDefect.kind,
      totalRelevantEvents:oneDefect.totalRelevantEvents??null,
      minimumUncoveredResiduals:oneDefect.minimumUncoveredResiduals??null,
      fullCoverageTemplateCount:oneDefect.fullCoverageTemplateCount??null,
      selectedDefect:oneDefect.selectedFullCoverageTemplate?.defect?.cellLabel??null,
    },
    oneDefectRcic:oneDefectRcic?{
      kind:oneDefectRcic.kind,
      player:oneDefectRcic.player??null,
      seam:oneDefectRcic.seam??null,
      rootMeasure:oneDefectRcic.rootMeasure??null,
      nodeCount:oneDefectRcic.nodeCount??null,
      evaluatedNodeCount:oneDefectRcic.evaluatedNodeCount??null,
    }:null,
  };
}

const classes=new Map();
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const actionCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    first=verifyCpcxFixedEventScript(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
    ]);
  if(!first.legal||first.terminal)throw new Error('invalid first decision');

  for(const defenderCell of frontierFromHeights(first.finalHeights)){
    if(defenderCell===t2||defenderCell===t3)continue;
    const afterT2=materialize(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
    ]);
    if(!afterT2)throw new Error('invalid nonsteal prefix');
    const immediate=classifyCpcxImmediate(afterT2);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3)
      throw new Error('expected forced final trigger block');
    const state=applyCpcxForcedEvent(afterT2,t3);
    if(state.terminal)throw new Error('final block terminal');
    const canonical=canonicalizeCpcxExactReflection(state);
    if(!classes.has(canonical.key))classes.set(canonical.key,{
      position:canonical.position,
      sources:[],
    });
    classes.get(canonical.key).sources.push({
      sixthMove:sixthColumn+1,
      firstReply:label(defenderCell),
    });
  }
}

const rows=[];
for(const item of classes.values()){
  const pairs=pairCandidates(item.position),
    options=pairs.map(pair=>({
      pair:{
        lineId:pair.lineId,
        lineLabel:pair.lineLabel,
        orientation:pair.orientation,
        distances:pair.distances,
        setupCell:label(pair.setupCell),
        targetCell:label(pair.targetCell),
        targetDistance:pair.targetDistance,
      },
      result:evaluatePair(item.position,pair),
    }));
  rows.push({
    sources:item.sources,
    rank:item.position.rank,
    support:Array.from(item.position.heights),
    pairCount:pairs.length,
    options,
    certifiedQualifiedOptions:options.filter(x=>x.result.certified),
    unpromotedOneDefectOptions:options.filter(x=>
      x.result.route==='UNPROMOTED_ONE_DEFECT_RCIC'
    ),
  });
}

const targetProfiles={};
for(const row of rows)for(const o of row.options){
  const key=[
    o.pair.orientation,
    o.pair.distances.join(','),
    o.pair.targetDistance,
    o.result.targetAnalysis?.kind??'NONE',
    o.result.targetAnalysis?.totalRelevantEvents??'',
    o.result.oneDefect?.kind??'NONE',
  ].join('|');
  targetProfiles[key]=(targetProfiles[key]??0)+1;
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.final-block-pair-options.v0_1',
  root:'44444',
  exactReflectionClassCount:rows.length,
  rows,
  summary:{
    classCount:rows.length,
    totalPairOptions:rows.reduce((n,x)=>n+x.options.length,0),
    classesWithQualifiedCertificate:rows.filter(x=>
      x.certifiedQualifiedOptions.length>0
    ).length,
    classesWithUnpromotedOneDefectCertificate:rows.filter(x=>
      x.unpromotedOneDefectOptions.length>0
    ).length,
    classesWithAnyOneDefectStaticCoverage:rows.filter(x=>
      x.options.some(o=>
        o.result.oneDefect?.kind==='ONE_DEFECT_STATIC_COVERAGE'
      )
    ).length,
    targetProfiles,
  },
  premises:{
    standardBoard:'7x6',
    exactReflectionQuotient:true,
    pairChoice:'all current P0 two-piece residuals with exactly one playable endpoint; controller choice is current-rank only',
    qualifiedRoutes:[
      'existing CPCX first win',
      'qualified truncated target reservoir',
    ],
    oneDefectRcicStatus:'DISCOVERY_ONLY_NOT_PROMOTED',
    solvedData:false,
    oracle:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));
