import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  deriveCpcxSaturatedColumnRlcProfile,
} from './cpcx-saturated-column-cofactor.mjs';
import {
  certifyCpcxResidualDefectTransport,
} from './cpcx-residual-defect-transport.mjs';

const g=createCpcxGeometry(),center=3,root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return String.fromCharCode(65+column)+String(row+1);
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}
function maxima(position){
  const q=deriveCpcxSaturatedColumnRlcProfile(position,{column:center});
  if(!q.exact)throw new Error('RLC profile '+q.seam);
  return q.candidates.filter(x=>
    !q.candidates.some(y=>y!==x&&dominates(y,x))
  );
}
function guard(left,right){
  const L=maxima(left),R=maxima(right),
    rs=new Set(R.map(x=>x.column));
  return L.filter(x=>rs.has(x.column))
    .map(x=>x.column).sort((a,b)=>a-b);
}
function pairedEvent(left,right,eventCell){
  const t=certifyCpcxResidualDefectTransport(left,right,{
    eventCell,
    saturatedColumn:center,
  });
  if(!t.exact)throw new Error('defect transport '+t.seam);
  return {
    transport:t,
    left:applyCpcxForcedEvent(left,eventCell),
    right:applyCpcxForcedEvent(right,eventCell),
  };
}

const rows=[];
for(const x of [0,1,2,4,5,6]){
  const sourceLeft=buildCpcxPosition('44444'+(x+1)+'4',{geometry:g}),
    sourceRight=buildCpcxPosition('444444'+(x+1),{geometry:g});

  for(const event1 of frontier(sourceLeft)){
    const p1=pairedEvent(sourceLeft,sourceRight,event1);
    if(p1.left.terminal||p1.right.terminal){
      rows.push({
        x:x+1,
        event1:label(event1),
        firstTriggerTerminal:true,
        leftTerminal:p1.left.terminal,
        rightTerminal:p1.right.terminal,
      });
      continue;
    }

    const gamma1=guard(p1.left,p1.right),
      responseRows=[];

    for(const responseColumn of gamma1){
      if(p1.left.heights[responseColumn]>=g.rows||
         p1.right.heights[responseColumn]>=g.rows)
        throw new Error('guard response not legal');
      const responseCell=
          p1.left.heights[responseColumn]*g.columns+responseColumn,
        p2=pairedEvent(p1.left,p1.right,responseCell);

      if(p2.left.terminal||p2.right.terminal){
        responseRows.push({
          responseColumn:responseColumn+1,
          responseCell:label(responseCell),
          responseTerminal:true,
          leftTerminal:p2.left.terminal,
          rightTerminal:p2.right.terminal,
          safeTerminal:
            p2.left.terminal?.player===0&&
            p2.right.terminal?.player===0,
        });
        continue;
      }

      const nextEvents=[];
      for(const event2 of frontier(p2.left)){
        const p3=pairedEvent(p2.left,p2.right,event2);
        if(p3.left.terminal||p3.right.terminal){
          nextEvents.push({
            event2:label(event2),
            triggerTerminal:true,
            leftTerminal:p3.left.terminal,
            rightTerminal:p3.right.terminal,
            sameTerminal:
              JSON.stringify(p3.left.terminal)===
              JSON.stringify(p3.right.terminal),
            transportKind:p3.transport.kind,
          });
          continue;
        }
        const gamma2=guard(p3.left,p3.right);
        nextEvents.push({
          event2:label(event2),
          triggerTerminal:false,
          gamma2:gamma2.map(c=>c+1),
          gamma2Nonempty:gamma2.length>0,
          sourceDefectSize:p3.transport.sourceDefectSize??null,
          targetDefectSize:p3.transport.targetDefectSize??null,
        });
      }

      responseRows.push({
        responseColumn:responseColumn+1,
        responseCell:label(responseCell),
        responseTerminal:false,
        defectSizeAfterResponse:p2.transport.targetDefectSize??null,
        nextEvents,
        everyNextNonterminalTriggerHasGuard:
          nextEvents.every(e=>e.triggerTerminal||e.gamma2Nonempty),
      });
    }

    rows.push({
      x:x+1,
      event1:label(event1),
      gamma1:gamma1.map(c=>c+1),
      gamma1Nonempty:gamma1.length>0,
      responses:responseRows,
      everyGuardResponsePreservesNextGuard:
        responseRows.every(r=>
          r.responseTerminal
            ?r.safeTerminal
            :r.everyNextNonterminalTriggerHasGuard
        ),
    });
  }
}

const firstRows=rows.filter(r=>!r.firstTriggerTerminal),
  responses=firstRows.flatMap(r=>r.responses.map(x=>({
    x:r.x,event1:r.event1,gamma1:r.gamma1,...x,
  }))),
  next=responses.flatMap(r=>(r.nextEvents??[]).map(x=>({
    x:r.x,event1:r.event1,responseColumn:r.responseColumn,...x,
  }))),
  empty=next.filter(x=>!x.triggerTerminal&&!x.gamma2Nonempty),
  terminalDiff=next.filter(x=>
    x.triggerTerminal&&!x.sameTerminal
  );

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.common-rlc-guard-set-second-layer.v0_1',
  observation:'every first-layer common RLC Pareto response from each turn6 owner-exchange pair, followed by every next common adversary event',
  rows,
  summary:{
    firstTriggerClassCount:firstRows.length,
    firstEmptyGuardCount:firstRows.filter(r=>!r.gamma1Nonempty).length,
    firstGuardResponseCount:responses.length,
    responseTerminalCount:responses.filter(r=>r.responseTerminal).length,
    everyFirstGuardResponsePreservesNextGuard:
      responses.every(r=>
        r.responseTerminal
          ?r.safeTerminal
          :r.everyNextNonterminalTriggerHasGuard
      ),
    nextTriggerCount:next.length,
    nextEmptyGuardCount:empty.length,
    nextTerminalDifferenceCount:terminalDiff.length,
    emptyGuardCases:empty.slice(0,24),
    terminalDifferenceCases:terminalDiff.slice(0,24),
    gamma1CardinalityClasses:[
      ...new Set(firstRows.map(r=>r.gamma1.length))
    ].sort((a,b)=>a-b),
    gamma2CardinalityClasses:[
      ...new Set(next.filter(x=>!x.triggerTerminal)
        .map(x=>x.gamma2.length))
    ].sort((a,b)=>a-b),
  },
  boundary:{
    diagnosticFalsifierOnly:true,
    everyFirstGuardMemberTested:true,
    exactlyTwoAdversaryLayers:true,
    noInductiveTheoremClaim:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
  },
},null,2));
