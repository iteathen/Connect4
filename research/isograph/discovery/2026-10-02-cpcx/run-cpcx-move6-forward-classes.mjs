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
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';
import {
  analyzeCpcxTargetReservoir,
  analyzeCpcxOneDefectTargetReservoir,
} from './cpcx-reservoir.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function reflectCell(cell){
  const {column,row}=cpcxCell(g,cell);
  return row*g.columns+(g.columns-1-column);
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
  const rank=position.rank+events.length;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function physicalKey(position,reflect=false){
  const heights=reflect
    ?Array.from(position.heights).reverse()
    :Array.from(position.heights),
    owner=[];
  for(let row=0;row<g.rows;row++)for(let column=0;column<g.columns;column++){
    const sourceColumn=reflect?g.columns-1-column:column;
    owner.push(position.owner[row*g.columns+sourceColumn]+1);
  }
  return `${position.mover}|${heights.join(',')}|${owner.join('')}`;
}
function canonicalPhysical(position){
  const direct=physicalKey(position,false),reflected=physicalKey(position,true);
  return reflected<direct?{key:reflected,reflect:true}:{key:direct,reflect:false};
}
function canonCell(cell,reflect){return reflect?reflectCell(cell):cell;}
function canonOrientation(orientation,reflect){
  if(!reflect)return orientation;
  if(orientation==='D+')return 'D-';
  if(orientation==='D-')return 'D+';
  return orientation;
}
function obligationSummary(position,reflect){
  return scanCpcxObligations(position)
    .filter(o=>o.missingCount<=3)
    .map(o=>({
      player:o.player,
      orientation:canonOrientation(o.orientation,reflect),
      missingCount:o.missingCount,
      missing:o.missingCells.map(x=>canonCell(x,reflect)).sort((a,b)=>a-b).map(label),
      playable:o.events.filter(e=>e.supportDistance===0)
        .map(e=>canonCell(e.cell,reflect)).sort((a,b)=>a-b).map(label),
    }))
    .sort((a,b)=>
      a.player-b.player||
      a.missingCount-b.missingCount||
      a.orientation.localeCompare(b.orientation)||
      a.missing.join(',').localeCompare(b.missing.join(','))
    );
}
function defectColumnExhaustionProbe(position,analysis){
  if(!analysis||analysis.kind!=='ODD_RESERVOIR_DEFECT')return [];
  const rows=[];
  for(const column of analysis.oddColumns){
    let current=position,terminal=null,legal=true;
    const events=[],limit=analysis.capacity[column];
    for(let i=0;i<limit;i++){
      const row=current.heights[column];
      if(row>=g.rows){legal=false;break;}
      const cell=row*g.columns+column,owner=current.mover;
      events.push({cell:label(cell),owner});
      current=applyCpcxForcedEvent(current,cell);
      if(current.terminal){terminal=current.terminal;break;}
    }
    const progress=!terminal&&legal
      ?classifyCpcxProgress(current,{player:0})
      :null,
      certificate=!terminal&&legal
        ?runCpcxFirstWinCertificate(current,{attacker:0})
        :null;
    rows.push({
      column:column+1,
      consumedRelevantEvents:events.length,
      expectedRelevantEvents:limit,
      legal,
      terminal,
      events,
      resultingRank:current.rank,
      resultingMover:current.mover,
      progress:progress?{
        kind:progress.kind,
        exact:progress.exact??false,
        player:progress.player??null,
        source:progress.source??null,
        seam:progress.seam??null,
        macroKind:progress.macro?.kind??null,
      }:null,
      certificate:certificate?{
        kind:certificate.kind,
        exact:certificate.exact,
        player:certificate.player??null,
        seam:certificate.seam??null,
        traceLength:certificate.trace?.length??0,
      }:null,
    });
  }
  return rows;
}

function pairCompressionProbe(position){
  if(position.mover!==0)return null;
  const pair=scanCpcxObligations(position).find(o=>
    o.player===0&&
    o.missingCount===2&&
    o.events.filter(e=>e.supportDistance===0).length===1
  );
  if(!pair)return null;
  const playable=pair.events.find(e=>e.supportDistance===0)?.cell;
  if(!Number.isInteger(playable))return null;
  const targetCell=pair.missingCells.find(x=>x!==playable),
    afterSetup=applyCpcxForcedEvent(position,playable),
    reservoirAnalysis=afterSetup.terminal?null:analyzeCpcxTargetReservoir(
      afterSetup,{attacker:0,targetCell}
    ),
    oneDefectReservoirAnalysis=afterSetup.terminal?null:
      analyzeCpcxOneDefectTargetReservoir(
        afterSetup,{attacker:0,targetCell}
      );
  if(afterSetup.terminal)return {
    pairLine:pair.lineLabel,
    setupCell:label(playable),
    terminalOnSetup:afterSetup.terminal,
    replies:[],
  };
  const replies=[];
  for(const replyCell of frontier(afterSetup)){
    const afterReply=applyCpcxForcedEvent(afterSetup,replyCell),
      cert=runCpcxFirstWinCertificate(afterReply,{attacker:0}),
      secondSetups=[];
    if(!afterReply.terminal&&afterReply.mover===0){
      for(const secondCell of frontier(afterReply)){
        const afterSecond=applyCpcxForcedEvent(afterReply,secondCell),
          secondCert=runCpcxFirstWinCertificate(afterSecond,{attacker:0});
        if(secondCert.kind==='CERTIFIED_FIRST_WIN'&&secondCert.player===0)
          secondSetups.push({
            cell:label(secondCell),
            terminal:afterSecond.terminal,
            certificateSource:secondCert.trace?.[0]?.progress?.source??null,
            traceLength:secondCert.trace?.length??0,
          });
      }
    }
    replies.push({
      replyCell:label(replyCell),
      replyTerminal:afterReply.terminal,
      certificate:{
        kind:cert.kind,
        exact:cert.exact,
        player:cert.player??null,
        seam:cert.seam??null,
        traceLength:cert.trace?.length??0,
      },
      discoverySecondSetups:secondSetups,
    });
  }
  return {
    pairLine:pair.lineLabel,
    pairCells:pair.missingCells.map(label),
    setupCell:label(playable),
    targetCell:label(targetCell),
    afterSetupSupport:Array.from(afterSetup.heights),
    reservoirAnalysis,
    oneDefectReservoirAnalysis,
    defectColumnExhaustion:afterSetup.terminal?[]:defectColumnExhaustionProbe(afterSetup,reservoirAnalysis),
    replies,
    closedReplyCount:replies.filter(x=>
      x.certificate.kind==='CERTIFIED_FIRST_WIN'&&x.certificate.player===0
    ).length,
    allRepliesClosed:replies.every(x=>
      x.certificate.kind==='CERTIFIED_FIRST_WIN'&&x.certificate.player===0
    ),
  };
}

function progressSummary(position){
  const p=classifyCpcxProgress(position,{player:0}),
    c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    progress:{
      kind:p.kind,exact:p.exact??false,player:p.player??null,
      source:p.source??null,seam:p.seam??null,
      macroKind:p.macro?.kind??null,
    },
    certificate:{
      kind:c.kind,exact:c.exact,player:c.player??null,
      seam:c.seam??null,traceLength:c.trace?.length??0,
    },
  };
}

const groups=new Map();
function add(position,source){
  const canonical=canonicalPhysical(position);
  if(!groups.has(canonical.key)){
    const reflect=canonical.reflect;
    groups.set(canonical.key,{
      key:canonical.key,
      reflect,
      rank:position.rank,
      mover:position.mover,
      support:reflect?Array.from(position.heights).reverse():Array.from(position.heights),
      ...progressSummary(position),
      pairCompressionProbe:pairCompressionProbe(position),
      obligations:obligationSummary(position,reflect),
      sources:[],
    });
  }
  groups.get(canonical.key).sources.push(source);
}

for(let column=0;column<g.columns;column++){
  const sixthCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells,
    first=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
    ]);
  if(!first)throw new Error('invalid first trigger');

  for(const defenderCell of frontier(first)){
    const afterD=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
    ]);
    if(!afterD)continue;

    if(defenderCell===t2||defenderCell===t3){
      add(afterD,{
        sixthMove:column+1,
        responseClass:defenderCell===t2?'STEAL_TRIGGER_2':'STEAL_TRIGGER_3',
        defenderCell:label(defenderCell),
        triggerOrder:[t1,t2,t3].map(label),
      });
      continue;
    }

    const afterT2=materialize(root,[
      {cell:sixthCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
    ]);
    if(!afterT2)continue;
    const immediate=classifyCpcxImmediate(afterT2);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3)
      throw new Error('expected forced trigger-3 block');
    const normalized=applyCpcxForcedEvent(afterT2,t3);
    add(normalized,{
      sixthMove:column+1,
      responseClass:defenderCell===r1?'HONOR_THEN_FORCED_BLOCK':'EXTERNAL_THEN_FORCED_BLOCK',
      defenderCell:label(defenderCell),
      forcedBlock:label(t3),
      triggerOrder:[t1,t2,t3].map(label),
    });
  }
}

const classes=[...groups.values()]
  .sort((a,b)=>a.rank-b.rank||a.key.localeCompare(b.key))
  .map((x,i)=>({...x,classId:`F${i+1}`}));

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.forward-class-quotient.v0_1',
  root:'44444',
  classCount:classes.length,
  classes,
  premises:{
    standardBoard:'7x6',
    quotient:'exact occupancy/support/mover modulo horizontal reflection only',
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    delayEquivalenceAssumed:false,
    pairCompressionProbe:'one P0 setup on the unique playable endpoint of a two-cell residual, followed by one flat P1 frontier audit',
    discoverySecondSetupProbe:'bounded theorem-discovery scan only; enumerates one additional current P0 setup per P1 reply and is forbidden as a proof premise until generalized',
    defectColumnExhaustionProbe:'discovery-only same-column normalization of each odd reservoir column through its truncated relevant capacity; no claim that the opponent is forced to choose this order',
  },
},null,2));
