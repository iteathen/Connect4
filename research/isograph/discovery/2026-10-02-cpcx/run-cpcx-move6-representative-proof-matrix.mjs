import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  applyCpcxForcedEvent,
} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
  classifyCpcxWingDeviation,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  canonicalizeCpcxExactReflection,
} from './cpcx-control-quotient.mjs';
import {runCpcxFirstWinCertificate} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function frontierFromHeights(heights){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function materialize(position,events){
  let current=position;
  for(const event of events){
    if(current.terminal)return null;
    if(current.mover!==event.owner)return null;
    const meta=cpcxCell(g,event.cell);
    if(current.heights[meta.column]!==meta.row||
       current.owner[event.cell]!==-1)return null;
    current=applyCpcxForcedEvent(current,event.cell);
  }
  return current;
}

function certificateSummary(position){
  const c=runCpcxFirstWinCertificate(position,{attacker:0});
  return {
    kind:c.kind,
    exact:c.exact,
    player:c.player??null,
    seam:c.seam??null,
    traceLength:c.trace?.length??0,
    firstProgress:c.trace?.[0]?.progress?.kind??null,
    firstSource:c.trace?.[0]?.progress?.source??null,
  };
}

const physical=[];
for(let column=0;column<g.columns;column++){
  const sixthCell=root.heights[column]*g.columns+column,
    child=applyCpcxForcedEvent(root,sixthCell),
    canonical=canonicalizeCpcxExactReflection(child);
  physical.push({
    sixthMove:column+1,
    sixthCell,
    child,
    canonicalKey:canonical.key,
  });
}

const classMap=new Map();
for(const row of physical){
  if(!classMap.has(row.canonicalKey))classMap.set(row.canonicalKey,[]);
  classMap.get(row.canonicalKey).push(row);
}

const classes=[];
for(const members of classMap.values()){
  members.sort((a,b)=>a.sixthMove-b.sixthMove);
  const representative=members[0],
    sixthMove=representative.sixthMove,
    actionCell=representative.sixthCell,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells,
    firstPrefix=verifyCpcxFixedEventScript(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
    ]);

  if(!firstPrefix.legal||firstPrefix.terminal)
    throw new Error('invalid first wing decision prefix');

  const firstRows=[];
  for(const defenderCell of frontierFromHeights(firstPrefix.finalHeights)){
    if(defenderCell===r1){
      firstRows.push({
        defenderCell:label(defenderCell),
        class:'HONOR_FIRST_SUPPORT',
      });
      continue;
    }
    const d=classifyCpcxWingDeviation(wing,{
      decisionIndex:0,
      actualReplyCell:defenderCell,
    });
    firstRows.push({
      defenderCell:label(defenderCell),
      class:d.stealsFutureTrigger
        ?defenderCell===t2
          ?'STEAL_TRIGGER_2'
          :'STEAL_TRIGGER_3'
        :'EXTERNAL_NONSTEAL',
      inSurvivingWing:d.inSurvivingWing,
    });
  }

  const nonstealRows=[];
  for(const row of firstRows.filter(x=>
    x.class==='HONOR_FIRST_SUPPORT'||x.class==='EXTERNAL_NONSTEAL'
  )){
    const defenderCell=(()=>{
      for(const cell of frontierFromHeights(firstPrefix.finalHeights))
        if(label(cell)===row.defenderCell)return cell;
      throw new Error('defender cell lookup');
    })();
    const afterT2=materialize(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
    ]);
    if(!afterT2||afterT2.terminal)
      throw new Error('invalid nonsteal advance');
    const immediate=classifyCpcxImmediate(afterT2);
    nonstealRows.push({
      defenderCell:row.defenderCell,
      sourceClass:row.class,
      immediateKind:immediate.kind,
      forcedCell:Number.isInteger(immediate.cell)?label(immediate.cell):null,
      exactForcedFinalBlock:
        immediate.kind==='FORCED_RESPONSE'&&immediate.cell===t3,
    });
  }

  const finalBlockExamples=[];
  for(const row of nonstealRows){
    if(!row.exactForcedFinalBlock)continue;
    const defenderCell=(()=>{
      for(const cell of frontierFromHeights(firstPrefix.finalHeights))
        if(label(cell)===row.defenderCell)return cell;
      throw new Error('defender cell lookup');
    })();
    const state=materialize(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
      {cell:defenderCell,owner:1},
      {cell:t2,owner:0},
      {cell:t3,owner:1},
    ]);
    if(!state||state.terminal)
      throw new Error('invalid final-block state');
    finalBlockExamples.push({
      firstReply:row.defenderCell,
      rank:state.rank,
      support:Array.from(state.heights),
      certificate:certificateSummary(state),
      reflectionClass:canonicalizeCpcxExactReflection(state).key,
    });
  }

  const theftStates=[
    ['STEAL_TRIGGER_2',t2],
    ['STEAL_TRIGGER_3',t3],
  ].map(([kind,stolen])=>{
    const state=materialize(root,[
      {cell:actionCell,owner:1},
      {cell:t1,owner:0},
      {cell:stolen,owner:1},
    ]);
    if(!state||state.terminal)throw new Error('invalid theft state');
    return {
      class:kind,
      stolenCell:label(stolen),
      rank:state.rank,
      support:Array.from(state.heights),
      certificate:certificateSummary(state),
      reflectionClass:canonicalizeCpcxExactReflection(state).key,
    };
  });

  classes.push({
    classId:`R${classes.length+1}`,
    members:members.map(x=>x.sixthMove),
    representative:sixthMove,
    reflectionProofReuseAuthorized:true,
    actionCell:label(actionCell),
    childCertificate:certificateSummary(representative.child),
    wing:{
      survivingColumns:wing.survivingFamily.columns.map(x=>x+1),
      triggers:[t1,t2,t3].map(label),
      requiredResponses:wing.anchoredLine.requiredResponseCells.map(label),
      honoredPathFirstWin:
        wing.honoredPath.exact&&wing.honoredPath.terminalOnThirdTrigger,
    },
    firstDecisionPartition:{
      rows:firstRows,
      counts:Object.fromEntries(
        ['HONOR_FIRST_SUPPORT','STEAL_TRIGGER_2','STEAL_TRIGGER_3','EXTERNAL_NONSTEAL']
          .map(kind=>[kind,firstRows.filter(x=>x.class===kind).length])
      ),
      nonstealToForcedFinalBlock:
        nonstealRows.every(x=>x.exactForcedFinalBlock),
      nonstealRows,
    },
    remainingFamilies:{
      theft:theftStates,
      forcedFinalBlock:{
        instanceCount:finalBlockExamples.length,
        examples:finalBlockExamples,
        allCurrentCertificates:firstBlock=>undefined,
      },
    },
  });
}

// Remove an accidental function-valued placeholder before serialization.
for(const row of classes)
  delete row.remainingFamilies.forcedFinalBlock.allCurrentCertificates;

const finalBlockReflectionClasses=new Map();
for(const row of classes)for(const x of row.remainingFamilies.forcedFinalBlock.examples){
  if(!finalBlockReflectionClasses.has(x.reflectionClass))
    finalBlockReflectionClasses.set(x.reflectionClass,[]);
  finalBlockReflectionClasses.get(x.reflectionClass).push({
    representative:row.representative,
    firstReply:x.firstReply,
  });
}

const theftReflectionClasses=new Map();
for(const row of classes)for(const x of row.remainingFamilies.theft){
  if(!theftReflectionClasses.has(x.reflectionClass))
    theftReflectionClasses.set(x.reflectionClass,[]);
  theftReflectionClasses.get(x.reflectionClass).push({
    representative:row.representative,
    theftClass:x.class,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.representative-proof-matrix.v0_1',
  root:'44444',
  authoritativeReflectionClasses:classes.map(x=>({
    classId:x.classId,
    members:x.members,
    representative:x.representative,
  })),
  classes,
  remainingBurden:{
    representativeClassCount:classes.length,
    theftExactReflectionStateCount:theftReflectionClasses.size,
    forcedFinalBlockExactReflectionStateCount:finalBlockReflectionClasses.size,
    theoremFamilies:[
      'FIRST_DECISION_STEAL_TRIGGER_2',
      'FIRST_DECISION_STEAL_TRIGGER_3',
      'NONSTEAL_TO_FORCED_FINAL_TRIGGER_BLOCK',
    ],
    proofTarget:'prove P0 first win for each remaining structural class representative; reflection transfers the certificate to every member of its authoritative class',
  },
  premises:{
    standardBoard:'7x6',
    reflectionQuotient:'EXACT_AND_AUTHORIZED',
    solvedData:false,
    oracle:false,
    recursiveSearch:false,
    delayEquivalenceAssumed:false,
  },
},null,2));
