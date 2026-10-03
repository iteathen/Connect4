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
} from './cpcx-wing.mjs';
import {
  canonicalizeCpcxExactReflection,
} from './cpcx-control-quotient.mjs';
import {
  buildCpcxQCarrier,
  keyCpcxQCarrier,
  permuteCpcxQCarrier,
  canonicalizeCpcxQColumnOrbit,
  findCpcxQColumnTransporter,
} from './cpcx-q-quotient.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function play(position,events){
  let p=position;
  for(const cell of events){
    if(p.terminal)return null;
    const meta=cpcxCell(g,cell);
    if(meta.row!==p.heights[meta.column]||p.owner[cell]!==-1)return null;
    p=applyCpcxForcedEvent(p,cell);
  }
  return p;
}
function verifyQTransport(a,b,t){
  if(!t)return {exact:false,seam:'NO_TRANSPORTER'};
  const p=t.permutation,checks=[];
  for(let c=0;c<g.columns;c++){
    if(a.heights[c]>=g.rows)continue;
    const d=p[c];
    if(b.heights[d]>=g.rows)return {
      exact:false,seam:'MAPPED_ACTION_ILLEGAL',column:c,mapped:d,
    };
    const ca=applyCpcxForcedEvent(a,a.heights[c]*g.columns+c),
      cb=applyCpcxForcedEvent(b,b.heights[d]*g.columns+d);
    if((ca.terminal?.player??null)!==(cb.terminal?.player??null))return {
      exact:false,seam:'TERMINAL_MISMATCH',column:c,mapped:d,
    };
    if(!ca.terminal&&!cb.terminal){
      const qa=permuteCpcxQCarrier(buildCpcxQCarrier(ca),p),
        qb=buildCpcxQCarrier(cb);
      if(keyCpcxQCarrier(qa)!==keyCpcxQCarrier(qb))return {
        exact:false,seam:'SUCCESSOR_Q_MISMATCH',column:c,mapped:d,
      };
    }
    checks.push({column:c+1,mappedColumn:d+1});
  }
  return {exact:true,checkCount:checks.length,checks};
}
function stateRow(stage,position,meta){
  const orbit=canonicalizeCpcxQColumnOrbit(position),
    reflection=canonicalizeCpcxExactReflection(position);
  return {
    stage,
    ...meta,
    rank:position.rank,
    mover:position.mover,
    support:Array.from(position.heights),
    qOrbitKey:orbit.key,
    qOrbitPermutation:orbit.permutation.map(x=>x+1),
    reflectionKey:reflection.key,
    position,
  };
}

const states=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    afterSixth=applyCpcxForcedEvent(root,sixthCell),
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells,
    [r1]=wing.anchoredLine.requiredResponseCells;

  states.push(stateRow('AFTER_SIXTH',afterSixth,{
    sixthMove:sixthColumn+1,
  }));

  for(const stolen of [t2,t3]){
    const theft=play(root,[sixthCell,t1,stolen]);
    if(!theft||theft.terminal)throw new Error('invalid theft');
    states.push(stateRow('THEFT',theft,{
      sixthMove:sixthColumn+1,
      theftClass:stolen===t2?'STEAL_TRIGGER_2':'STEAL_TRIGGER_3',
      stolenCell:label(stolen),
    }));

    const repaired=play(theft,[r1]);
    if(!repaired||repaired.terminal)throw new Error('invalid theft repair');
    states.push(stateRow('THEFT_REPAIRED',repaired,{
      sixthMove:sixthColumn+1,
      theftClass:stolen===t2?'STEAL_TRIGGER_2':'STEAL_TRIGGER_3',
      stolenCell:label(stolen),
      repairCell:label(r1),
    }));
  }

  const afterT1=play(root,[sixthCell,t1]);
  if(!afterT1||afterT1.terminal)throw new Error('invalid trigger1');
  for(const defenderCell of frontier(afterT1)){
    if(defenderCell===t2||defenderCell===t3)continue;
    const deviation=defenderCell===r1
      ?{kind:'HONORED_RESPONSE',stealsFutureTrigger:false}
      :classifyCpcxWingDeviation(wing,{
        decisionIndex:0,actualReplyCell:defenderCell,
      });
    if(deviation.stealsFutureTrigger)continue;

    const afterT2=play(afterT1,[defenderCell,t2]);
    if(!afterT2||afterT2.terminal)continue;
    const immediate=classifyCpcxImmediate(afterT2);
    if(immediate.kind!=='FORCED_RESPONSE'||immediate.cell!==t3)
      throw new Error('expected final trigger forced block');
    const finalBlock=play(afterT2,[t3]);
    if(!finalBlock||finalBlock.terminal)
      throw new Error('invalid final block');
    states.push(stateRow('FORCED_FINAL_BLOCK',finalBlock,{
      sixthMove:sixthColumn+1,
      firstReply:label(defenderCell),
      firstReplyClass:defenderCell===r1?'HONOR_FIRST_SUPPORT':'EXTERNAL_NONSTEAL',
      finalBlock:label(t3),
    }));
  }
}

function stageGroups(stage){
  const rows=states.filter(x=>x.stage===stage),
    byQ=new Map(),byReflection=new Map();
  for(const row of rows){
    if(!byQ.has(row.qOrbitKey))byQ.set(row.qOrbitKey,[]);
    byQ.get(row.qOrbitKey).push(row);
    if(!byReflection.has(row.reflectionKey))byReflection.set(row.reflectionKey,[]);
    byReflection.get(row.reflectionKey).push(row);
  }

  const qClasses=[...byQ.values()]
    .map((members,classIndex)=>{
      const anchor=members[0],transportChecks=[];
      for(let i=1;i<members.length;i++){
        const t=findCpcxQColumnTransporter(
          anchor.position,members[i].position
        );
        transportChecks.push({
          from:{
            sixthMove:anchor.sixthMove,
            theftClass:anchor.theftClass??null,
            firstReply:anchor.firstReply??null,
          },
          to:{
            sixthMove:members[i].sixthMove,
            theftClass:members[i].theftClass??null,
            firstReply:members[i].firstReply??null,
          },
          permutation:t?.permutation.map(x=>x+1)??null,
          verification:verifyQTransport(
            anchor.position,members[i].position,t
          ),
        });
      }
      return {
        classId:`${stage}-Q${classIndex+1}`,
        members:members.map(x=>({
          sixthMove:x.sixthMove,
          theftClass:x.theftClass??null,
          stolenCell:x.stolenCell??null,
          firstReply:x.firstReply??null,
          firstReplyClass:x.firstReplyClass??null,
          support:x.support,
        })),
        transportChecks,
        allTransportChecksPass:transportChecks.every(x=>x.verification.exact),
      };
    })
    .sort((a,b)=>
      (a.members[0].sixthMove??0)-(b.members[0].sixthMove??0)
    );

  return {
    stage,
    stateCount:rows.length,
    reflectionClassCount:byReflection.size,
    qOrbitClassCount:byQ.size,
    qOrbitClasses:qClasses,
    qStrictlyCoarserThanReflection:byQ.size<byReflection.size,
  };
}

const stages=[
  'AFTER_SIXTH',
  'THEFT',
  'THEFT_REPAIRED',
  'FORCED_FINAL_BLOCK',
].map(stageGroups);

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.q-normalized-boundaries.v0_1',
  root:'44444',
  stages,
  summary:Object.fromEntries(stages.map(x=>[
    x.stage,{
      states:x.stateCount,
      reflectionClasses:x.reflectionClassCount,
      qOrbitClasses:x.qOrbitClassCount,
      qReduction:x.reflectionClassCount-x.qOrbitClassCount,
    },
  ])),
  premises:{
    standardBoard:'7x6',
    theoremDefinedBoundaries:true,
    q_oAuthority:'Q_CONGRUENCE_FINAL_QUALIFICATION_0_2',
    qTransportVerification:'complete current legal action commutation for every discovered q-orbit merge',
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
  boundary:'q_o orbit equality proves ordinary future-game/value equivalence only. Non-q CPCX proof context is not merged. Failure to share a q orbit is not a value distinction.',
},null,2));
