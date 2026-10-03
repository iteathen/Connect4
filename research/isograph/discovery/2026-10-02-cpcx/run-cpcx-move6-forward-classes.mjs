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
  certifyCpcxTruncatedTargetReservoir,
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

function oneDefectRenewalProbe(position,targetCell,analysis){
  const template=analysis?.selectedFullCoverageTemplate;
  if(!template)return null;
  const rows=[];
  for(const defenderCell of frontier(position)){
    const {column,row}=cpcxCell(g,defenderCell),
      depth=row-position.heights[column],
      partner=template.partner[column],
      prefixLength=template.prefixLength[column];
    let responseCell=null,responseKind=null;
    if(partner>=0&&depth<prefixLength){
      responseCell=(position.heights[partner]+depth)*g.columns+partner;
      responseKind='SYNCHRONIZED_CROSS_RESPONSE';
    }else if(depth+1<analysis.capacity[column]){
      responseCell=defenderCell+g.columns;
      responseKind='VERTICAL_RESPONSE';
    }else{
      const afterDefender=applyCpcxForcedEvent(position,defenderCell),
        repairs=[];
      if(!afterDefender.terminal){
        for(const setupCell of frontier(afterDefender)){
          const child=applyCpcxForcedEvent(afterDefender,setupCell);
          if(child.terminal){
            if(child.terminal.player===0)repairs.push({
              setupCell:label(setupCell),
              repairClass:'ATTACKER_TERMINAL',
              childReservoirRank:null,
            });
            continue;
          }
          const certificate=runCpcxFirstWinCertificate(child,{attacker:0}),
            ordinary=certifyCpcxTruncatedTargetReservoir(
              child,{attacker:0,targetCell}
            ),
            next=analyzeCpcxOneDefectTargetReservoir(
              child,{attacker:0,targetCell}
            ),
            childRank=next.totalRelevantEvents??null,
            exactExistingWin=
              certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0,
            ordinaryWin=
              ordinary.kind==='CERTIFIED_FIRST_WIN'&&ordinary.player===0,
            oneDefectRenewal=
              next.kind==='ONE_DEFECT_STATIC_COVERAGE'&&
              childRank===analysis.totalRelevantEvents-2;
          if(exactExistingWin||ordinaryWin||oneDefectRenewal)repairs.push({
            setupCell:label(setupCell),
            repairClass:exactExistingWin
              ?'EXISTING_CPCX_FIRST_WIN'
              :ordinaryWin
                ?'ORDINARY_RESERVOIR_FIRST_WIN'
                :'ONE_DEFECT_RENEWAL',
            certificateSource:
              certificate.trace?.[0]?.progress?.source??null,
            ordinaryReservoirKind:ordinary.kind,
            oneDefectKind:next.kind,
            childReservoirRank:childRank,
          });
        }
      }
      rows.push({
        defenderCell:label(defenderCell),
        responseKind:'DEFECT_HANDOFF',
        responseCell:null,
        defenderTerminal:afterDefender.terminal,
        discoveryHandoffRepairs:repairs,
        renews:repairs.length>0,
        renewalClass:repairs.length?'DISCOVERY_HANDOFF_REPAIR':'UNRESOLVED_HANDOFF',
      });
      continue;
    }

    const afterDefender=applyCpcxForcedEvent(position,defenderCell);
    if(afterDefender.terminal){
      rows.push({
        defenderCell:label(defenderCell),
        responseKind,
        responseCell:label(responseCell),
        defenderTerminal:afterDefender.terminal,
        renews:false,
      });
      continue;
    }
    const meta=cpcxCell(g,responseCell);
    if(afterDefender.heights[meta.column]!==meta.row||
       afterDefender.owner[responseCell]!==-1){
      rows.push({
        defenderCell:label(defenderCell),
        responseKind,
        responseCell:label(responseCell),
        responseLegal:false,
        renews:false,
      });
      continue;
    }
    const child=applyCpcxForcedEvent(afterDefender,responseCell);
    if(child.terminal){
      rows.push({
        defenderCell:label(defenderCell),
        responseKind,
        responseCell:label(responseCell),
        responseLegal:true,
        terminal:child.terminal,
        renews:child.terminal.player===0,
        renewalClass:child.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
      });
      continue;
    }

    const certificate=runCpcxFirstWinCertificate(child,{attacker:0}),
      ordinary=certifyCpcxTruncatedTargetReservoir(
        child,{attacker:0,targetCell}
      ),
      next=analyzeCpcxOneDefectTargetReservoir(
        child,{attacker:0,targetCell}
      ),
      parentRank=analysis.totalRelevantEvents,
      childRank=next.totalRelevantEvents??null,
      exactExistingWin=
        certificate.kind==='CERTIFIED_FIRST_WIN'&&certificate.player===0,
      ordinaryWin=ordinary.kind==='CERTIFIED_FIRST_WIN'&&ordinary.player===0,
      oneDefectRenewal=
        next.kind==='ONE_DEFECT_STATIC_COVERAGE'&&
        childRank===parentRank-2;
    rows.push({
      defenderCell:label(defenderCell),
      responseKind,
      responseCell:label(responseCell),
      responseLegal:true,
      certificate:{
        kind:certificate.kind,
        player:certificate.player??null,
        seam:certificate.seam??null,
        traceLength:certificate.trace?.length??0,
      },
      ordinaryReservoirKind:ordinary.kind,
      oneDefectKind:next.kind,
      parentReservoirRank:parentRank,
      childReservoirRank:childRank,
      rankDelta:childRank===null?null:parentRank-childRank,
      renewalClass:exactExistingWin
        ?'EXISTING_CPCX_FIRST_WIN'
        :ordinaryWin
          ?'ORDINARY_RESERVOIR_FIRST_WIN'
          :oneDefectRenewal
            ?'ONE_DEFECT_RENEWAL'
            :'UNRESOLVED',
      renews:exactExistingWin||ordinaryWin||oneDefectRenewal,
    });
  }
  return {
    selectedDefect:template.defect,
    rowCount:rows.length,
    renewedCount:rows.filter(x=>x.renews).length,
    defectHandoffCount:rows.filter(x=>x.responseKind==='DEFECT_HANDOFF').length,
    repairedHandoffCount:rows.filter(x=>
      x.responseKind==='DEFECT_HANDOFF'&&x.renews
    ).length,
    allCurrentResponsesRenew:rows.every(x=>x.renews),
    rows,
    proofBoundary:'one current response layer only; recurrent use requires a separately proved well-founded renewal theorem and a certified defect-handoff base case',
  };
}

function normalizedOneDefectHandoff(position,analysis){
  const template=analysis?.selectedFullCoverageTemplate;
  if(!template)return {kind:'NO_FULL_TEMPLATE',exact:false};
  const defectColumn=template.defect.column,
    partner=template.partner[defectColumn],
    prefixLength=template.prefixLength[defectColumn],
    events=[];
  let current=position;

  for(let i=0;i<prefixLength;i++){
    if(current.mover!==1)return {kind:'TURN_MISMATCH',exact:false,events};
    const dRow=current.heights[defectColumn],
      dCell=dRow*g.columns+defectColumn;
    current=applyCpcxForcedEvent(current,dCell);
    events.push({cell:label(dCell),owner:1,role:'DEFECT_PREFIX_TRIGGER'});
    if(current.terminal)return {
      kind:current.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
      exact:true,terminal:current.terminal,position:current,events,
    };
    if(partner<0)return {kind:'PREFIX_PARTNER_MISSING',exact:false,events};
    const rRow=current.heights[partner],
      rCell=rRow*g.columns+partner;
    current=applyCpcxForcedEvent(current,rCell);
    events.push({cell:label(rCell),owner:0,role:'DEFECT_PREFIX_RESPONSE'});
    if(current.terminal)return {
      kind:current.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
      exact:true,terminal:current.terminal,position:current,events,
    };
  }

  let tail=template.defect.tailLength;
  while(tail>1){
    if(current.mover!==1)return {kind:'TURN_MISMATCH',exact:false,events};
    const lowerRow=current.heights[defectColumn],
      lower=lowerRow*g.columns+defectColumn;
    current=applyCpcxForcedEvent(current,lower);
    events.push({cell:label(lower),owner:1,role:'DEFECT_VERTICAL_TRIGGER'});
    if(current.terminal)return {
      kind:current.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
      exact:true,terminal:current.terminal,position:current,events,
    };
    const upperRow=current.heights[defectColumn],
      upper=upperRow*g.columns+defectColumn;
    current=applyCpcxForcedEvent(current,upper);
    events.push({cell:label(upper),owner:0,role:'DEFECT_VERTICAL_RESPONSE'});
    if(current.terminal)return {
      kind:current.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
      exact:true,terminal:current.terminal,position:current,events,
    };
    tail-=2;
  }

  if(tail!==1||current.mover!==1)
    return {kind:'DEFECT_TAIL_INVARIANT_FAILURE',exact:false,events};
  const topRow=current.heights[defectColumn],
    top=topRow*g.columns+defectColumn;
  current=applyCpcxForcedEvent(current,top);
  events.push({cell:label(top),owner:1,role:'UNMATCHED_DEFENDER_TOP_EVENT'});
  if(current.terminal)return {
    kind:current.terminal.player===0?'ATTACKER_TERMINAL':'DEFENDER_TERMINAL',
    exact:true,terminal:current.terminal,position:current,events,
  };
  return {
    kind:'DEFECT_HANDOFF',
    exact:true,
    defectCell:top,
    defectLabel:label(top),
    position:current,
    events,
  };
}

function oneDefectViabilityChainProbe(position,targetCell){
  let current=position;
  const stages=[];
  for(let stage=0;stage<24;stage++){
    const ordinary=certifyCpcxTruncatedTargetReservoir(
        current,{attacker:0,targetCell}
      );
    if(ordinary.kind==='CERTIFIED_FIRST_WIN')return {
      kind:'DISCOVERY_CHAIN_TO_ORDINARY_RESERVOIR',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length,
      stages,
    };

    const analysis=analyzeCpcxOneDefectTargetReservoir(
      current,{attacker:0,targetCell}
    );
    if(analysis.kind!=='ONE_DEFECT_STATIC_COVERAGE')return {
      kind:'DISCOVERY_CHAIN_BREAK',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length,
      seam:analysis.kind,
      stages,
    };

    const parentRank=analysis.totalRelevantEvents,
      handoff=normalizedOneDefectHandoff(current,analysis);
    if(handoff.kind==='ATTACKER_TERMINAL')return {
      kind:'DISCOVERY_CHAIN_TO_ATTACKER_TERMINAL',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length+1,
      stages:stages.concat([{
        parentReservoirRank:parentRank,
        defect:analysis.selectedFullCoverageTemplate.defect,
        handoffKind:handoff.kind,
        handoffEvents:handoff.events,
      }]),
    };
    if(handoff.kind!=='DEFECT_HANDOFF')return {
      kind:'DISCOVERY_CHAIN_BREAK',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length,
      seam:handoff.kind,
      stages,
    };

    const repairs=[];
    for(const repairCell of frontier(handoff.position)){
      const child=applyCpcxForcedEvent(handoff.position,repairCell);
      if(child.terminal){
        if(child.terminal.player===0)repairs.push({
          cell:repairCell,
          label:label(repairCell),
          kind:'ATTACKER_TERMINAL',
          child:null,
          childRank:-1,
        });
        continue;
      }
      const childOrdinary=certifyCpcxTruncatedTargetReservoir(
          child,{attacker:0,targetCell}
        ),
        childAnalysis=analyzeCpcxOneDefectTargetReservoir(
          child,{attacker:0,targetCell}
        ),
        childRank=childAnalysis.totalRelevantEvents??null;
      if(childOrdinary.kind==='CERTIFIED_FIRST_WIN')repairs.push({
        cell:repairCell,
        label:label(repairCell),
        kind:'ORDINARY_RESERVOIR_FIRST_WIN',
        child,
        childRank:0,
      });
      else if(
        childAnalysis.kind==='ONE_DEFECT_STATIC_COVERAGE'&&
        Number.isInteger(childRank)&&
        childRank<parentRank
      )repairs.push({
        cell:repairCell,
        label:label(repairCell),
        kind:'ONE_DEFECT_RENEWAL',
        child,
        childRank,
      });
    }
    repairs.sort((a,b)=>
      a.childRank-b.childRank||a.cell-b.cell
    );
    if(!repairs.length)return {
      kind:'DISCOVERY_CHAIN_BREAK',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length+1,
      seam:'NO_HANDOFF_REPAIR',
      stages:stages.concat([{
        parentReservoirRank:parentRank,
        defect:analysis.selectedFullCoverageTemplate.defect,
        handoffKind:handoff.kind,
        handoffEvents:handoff.events,
        repairCandidates:[],
      }]),
    };

    const selected=repairs[0];
    stages.push({
      parentReservoirRank:parentRank,
      defect:analysis.selectedFullCoverageTemplate.defect,
      handoffKind:handoff.kind,
      handoffEvents:handoff.events,
      repairCandidates:repairs.map(x=>({
        cell:x.label,kind:x.kind,childRank:x.childRank,
      })),
      selectedRepair:{
        cell:selected.label,
        kind:selected.kind,
        childRank:selected.childRank,
      },
    });
    if(selected.kind==='ATTACKER_TERMINAL'||
       selected.kind==='ORDINARY_RESERVOIR_FIRST_WIN')return {
      kind:selected.kind==='ATTACKER_TERMINAL'
        ?'DISCOVERY_CHAIN_TO_ATTACKER_TERMINAL'
        :'DISCOVERY_CHAIN_TO_ORDINARY_RESERVOIR',
      exactDiscovery:true,
      certifiedByTheorem:false,
      stageCount:stages.length,
      stages,
    };
    current=selected.child;
  }
  return {
    kind:'DISCOVERY_CHAIN_STEP_BOUND',
    exactDiscovery:true,
    certifiedByTheorem:false,
    stageCount:stages.length,
    stages,
  };
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
    oneDefectRenewal:afterSetup.terminal?null:oneDefectRenewalProbe(
      afterSetup,targetCell,oneDefectReservoirAnalysis
    ),
    oneDefectViabilityChain:afterSetup.terminal?null:
      oneDefectViabilityChainProbe(afterSetup,targetCell),
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
    oneDefectRenewalProbe:'one theorem-template response layer only; tests reconstruction of the same one-defect class with reservoir rank reduced by two and does not recursively traverse descendants',
    defectHandoffRepairProbe:'discovery-only scan of one current P0 setup after an unmatched top event; successful cells are not proof premises until a generic repair theorem is established',
    oneDefectViabilityChainProbe:'discovery-only deterministic normalization through unmatched top events; ordinary defender choices are discharged only by the static template invariant, while one locally synthesized repair is followed at each decreasing reservoir rank; this is not yet a promoted theorem',
  },
},null,2));
