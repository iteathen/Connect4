import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {attemptCpcxDisjointWingFirstWin} from './cpcx-move6-certificate.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g}),rows=[];

for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex:0}),
    vertical=repair.guaranteedResiduals.find(r=>
      r.missingCount===2&&r.orientation==='V'&&
      r.events.some(e=>e.minSupportDistance===0&&e.maxSupportDistance===0)&&
      r.events.some(e=>e.minSupportDistance===1&&e.maxSupportDistance===1)
    );

  rows.push({
    sixthMove:column+1,
    actionCell,
    untouchedWing:wing.survivingFamily.columns.map(x=>x+1),
    honoredPath:{
      exact:wing.honoredPath.exact,
      terminalOnThirdTrigger:wing.honoredPath.terminalOnThirdTrigger,
      terminal:wing.honoredPath.verification.terminal,
    },
    firstDeviation:{
      quantifiedFrontier:repair.deviationFrontier,
      firstWinGuardPassed:repair.firstWinGuardPassed,
      postRepairFirstWinGuardPassed:repair.postRepairFirstWinGuardPassed,
      repairLegal:repair.repairLegalAtDecision,
      guaranteedPairCount:repair.guaranteedResiduals.filter(x=>x.missingCount===2).length,
      verticalTwoPiece:vertical?{
        line:vertical.lineLabel,
        cells:vertical.missingCells,
        events:vertical.events,
      }:null,
    },
  });
}

const certificateAttempt=attemptCpcxDisjointWingFirstWin(root,{attacker:0});

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6-first-win-report.v0_2',
  root:'44444',
  requestedAttacker:0,
  productionCpcModified:false,
  externalSolvedDataUsed:false,
  recursiveReplyTraversalUsed:false,
  rows,
  certificateAttempt:{
    kind:certificateAttempt.kind,
    exact:certificateAttempt.exact,
    player:certificateAttempt.player??null,
    firstSeam:certificateAttempt.firstSeam,
    currentResponseSet:certificateAttempt.currentResponseSet,
    universalCurrentResponseQuantification:certificateAttempt.universalCurrentResponseQuantification,
    flatResponseSetOnly:certificateAttempt.flatResponseSetOnly,
    perSixthAction:certificateAttempt.rows.map(r=>({
      actionColumn:r.actionColumn+1,
      selectedMacro:r.selectedMacro??null,
      survivingWing:r.survivingWing?.map(x=>x+1)??null,
      allResponseClassesCertified:r.allResponseClassesCertified??false,
      responseClasses:r.responseClasses?.map(x=>({
        class:x.class,
        quantifiedCells:x.quantifiedCells??null,
        resultKind:x.result.kind,
        seam:x.result.seam??null,
      }))??[],
    })),
  },
  exactConclusions:[
    'every legal sixth action leaves a disjoint synchronized wing available',
    'if the first two same-column defender responses are honored, P0 gets the first terminal on the third wing trigger',
    'first and second wing deviations are represented as set-wise debt-repair classes rather than recursive reply paths',
    'debt repair preserves guaranteed residual carriers under explicit first-win guards'
  ],
  semantics:'CERTIFIED_FIRST_WIN is the only positive game conclusion; NO_CERTIFICATE means only that CPCX structural closure stopped.',
},null,2));
