// Independently implemented TRUE ORIGINAL 7x6 K4 colored physical board,
// all 69 K4 windows, real first-win STOP, and current surviving R0/R1
// normalized source reconstruction ONLY as FALSIFIER of frozen source
// playable 2-cell fork graph theorem and 14 canonical excluded defensive moves.
// Future P1 next replies enumerated in this PHYSICAL validator only; SOURCE
// produces one forced attack fork per excluded label, no game q or WDL values.
import {createOriginalPlayablePairForkFunnel} from './standard7x6-source-playable-pair-fork-frontier-funnel.mjs';
export function verifyOriginalCanonical44444CenterForkGraphPhysical(){
 const W=7,H=6,N=42,id=(c,r)=>7*r+c,bit=z=>1n<<BigInt(z),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const xy=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(xy.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))
   lines.push(xy.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('not original 69 physical winning lines');
 const src=createOriginalPlayablePairForkFunnel({width:W,height:H,connect:4});
 function blank(){return {h:Array(W).fill(0),b:Array(N).fill(-1),n:0,firstWin:null};}
 function clone(v){return {h:v.h.slice(),b:v.b.slice(),n:v.n,firstWin:v.firstWin};}
 function play(q,one){
  const c=one-1,p=q.n&1,row=q.h[c];
  if(!Number.isInteger(c)||c<0||c>=W||row>=H)throw Error('physical K4 gravity illegal');
  const z=id(c,row);if(q.b[z]!==-1)throw Error('occupied physical cell collision');
  q.b[z]=p;q.h[c]++;q.n++;
  const wins=lines.some(L=>L.every(v=>q.b[v]===p));
  if(wins&&q.firstWin===null)q.firstWin={p,absolutePly:q.n,column:one,row:row+1};
  return {p,wins,z};
 }
 function physicallyRebuildQ(q){
  if(q.firstWin!==null)throw Error('q has already achieved physical first WIN');
  const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(z=>q.b[z]===1-p))continue;
    let m=0n;for(const z of L)if(q.b[z]===-1)m|=bit(z);
    if(!m)throw Error('nonterminal original q has completed player line');
    raw.push(m);
   }
   const uniq=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
   for(const m of uniq)if(!out.some(u=>(u&m)===u))out.push(m);
   return out;
  });
  return {h:q.h.slice(),R0:R[0],R1:R[1]};
 }
 const root=blank();
 for(const c of [4,4,4,4,4]){const p=play(root,c);if(p.wins)throw Error('canonical 44444 already terminal');}
 if(root.n!==5||String(root.h)!=='0,0,0,5,0,0,0')
  throw Error('canonical first-five original physical geometry mismatch');
 const wings=[1,2,3,5,6,7],
  expected={1:null,2:[1,3,5],3:[2,5],5:[3,6],6:[3,5,7],7:null};
 const totals={trueOriginalK4Winlines:69,originalRootPly5:true,
  centerCompletedAndSixP0WingRepliesPhysicallyReplayed:0,
  sourceOriginalR0R1FromIndependentGridReconstructed:0,
  physicallyPlayableAttackerSize2GeneratorEdges:0,
  sourceExpectedForkPreemptionSetComparisons:0,
  sourceExcludedP1CurrentActionsWithExplicitAttackerForcedWINMacro:0,
  independentPhysicalP1NextReplyOptionsCheckedAfterAttackerFork:0,
  verifiedOriginalPhysicalAttackerWinsBeforeDefenderHasThirdReply:0,
  falseOriginalSourceForcedWinClaims:0,
  earlyPhysicalP1WinSupersessionClaims:0,
  generatedTrueGameWDLOracleRootValues:0,
  futureStrategicallyDifferentGamesValuedInSource:0};
 const rows=[];
 for(const wing of wings){
  const q=clone(root),a=play(q,4),b=play(q,wing);
  if(a.wins||b.wins||q.firstWin!==null||q.n!==7)
   throw Error('center/full then wing must yield first-win-free original ply7');
  totals.centerCompletedAndSixP0WingRepliesPhysicallyReplayed++;
  const sourceQ=physicallyRebuildQ(q),cert=src.analyze(sourceQ);
  if(cert.status!=='SOURCE_PROVED_NECESSARY_ORIGINAL_DEFENSIVE_FORK_PREEMPTION_FUNNEL')
   throw Error('source failed to classify actual center+wing first-win free root');
  if(sourceQ.R1.some(m=>m===0n))throw Error('physical P1 requirement already complete');
  totals.sourceOriginalR0R1FromIndependentGridReconstructed++;
  if(cert.originalDefenderMinSurvivingGeneratorCardinality!==3)
   throw Error('source claimed wrong original P1 min generator size after center+wing');
  const got=cert.sourceNecessaryDefenderFirstActionSubsetAgainstThisForkFamily;
  const demanded=expected[wing]??wings;
  if(String(got)!==String(demanded))
   throw Error('SOURCE original fork graph required preemption columns unexpected '+JSON.stringify({wing,got,demanded}));
  totals.sourceExpectedForkPreemptionSetComparisons++;
  totals.physicallyPlayableAttackerSize2GeneratorEdges+=cert.sourceOriginalPlayablePairThreatGraphEdges.length;
  const excluded=cert.sourceExcludedDefenderFirstActionsWithForcedOpponentWin;
  for(const d of excluded){
   const witness=cert.sourcePerExcludedDefenderCurrentActionAttackerForcingWitness.find(x=>
    x.excludedDefenderCurrentOriginalColumn===d);
   if(!witness)throw Error('SOURCE excluded defender column without frozen opponent fork macro');
   const stage=clone(q),def=play(stage,d);
   if(def.wins)throw Error('defender P1 FIRST won by supposed excluded fork preemption action');
   const attack=play(stage,witness.forcingAttackerOriginalColumnNext);
   if(attack.wins&&stage.firstWin?.p===0){
    // A first WIN earlier than the predicted final move is an even stronger
    // forced P0 result; no P1 reply is applicable in that case.
    totals.sourceExcludedP1CurrentActionsWithExplicitAttackerForcedWINMacro++;
    continue;
   }
   if(attack.wins||stage.firstWin)
    throw Error('non-P0 terminal after SOURCE attacker fork enabling x');
   totals.sourceExcludedP1CurrentActionsWithExplicitAttackerForcedWINMacro++;
   const nextP1=stage.h.flatMap((z,c)=>z<H?[c+1]:[]);
   for(const e of nextP1){
    const after=clone(stage),reply=play(after,e);
    totals.independentPhysicalP1NextReplyOptionsCheckedAfterAttackerFork++;
    if(reply.wins||after.firstWin?.p===1){
     totals.earlyPhysicalP1WinSupersessionClaims++;
     throw Error('defender P1 has a counterexample immediate FIRST WIN after source fork enabling');
    }
    const threatCols=witness.forcingAttackerThreatChoicesAfterOneMoreDefenderReply;
    const live=threatCols.filter(c=>after.h[c-1]===q.h[c-1]);
    if(!live.length)throw Error('defender blocked both source DISTINCT original singleton threats in one reply');
    const finished=play(after,live[0]);
    if(!finished.wins||after.firstWin?.p!==0){
     totals.falseOriginalSourceForcedWinClaims++;
     throw Error('source promised original P0 immediate first WIN but physical line not completed '+JSON.stringify({wing,d,e,live,witness}));
    }
    totals.verifiedOriginalPhysicalAttackerWinsBeforeDefenderHasThirdReply++;
   }
  }
  rows.push({P0InitialWingReplyAfterP1CompletesCenter:wing,
   physicalP1Rank7MinimumRemainingSourceRequirement:3,
   originalCurrentP1LegalColumns:cert.originalLegalCurrentColumns,
   sourcePlayableP0PairEdges:cert.sourceOriginalPlayablePairThreatGraphEdges.map(e=>e.originalCurrentLegalColumnPair),
   sourceP0ForkTriples:cert.sourceCurrentForkPreemptionTriples.map(t=>t.defenderPreemptionColumnTriple),
   sourceNecessaryP1CurrentReplySubset:got,
   excludedP1RepliesWithConfirmedPhysicalForkLoss:excluded,
   currentExcludedAttackerMacroWitnesses:cert.sourcePerExcludedDefenderCurrentActionAttackerForcingWitness});
 }
 if(totals.sourceExcludedP1CurrentActionsWithExplicitAttackerForcedWINMacro!==14||
    totals.independentPhysicalP1NextReplyOptionsCheckedAfterAttackerFork!==84||
    totals.falseOriginalSourceForcedWinClaims!==0||
    totals.earlyPhysicalP1WinSupersessionClaims!==0)
  throw Error('expected 14 canonical source exclusions and all 84 physical P1 reply cases');
 return {schema:'connect4.original7x6.canonical44444_conditional_center_finished_fork_graph_v0_1',
  date:'2026-10-18',
  status:'SOURCE_14_P1_PREEMPTION_FAILURES_FORCED_P0_WIN_IN_84_PHYSICAL_RESPONSES',
  sourceTheorem:'docs/research/2026-10-18-canonical44444-center-branch-playable-pair-fork-frontier-strategy-funnel.md',
  originalBoard:'TRUE standard7x6 K4 69 winning original four-cell windows and FIRST-win stopping',
  originalFixedHistory:'44444',nextP1ActionCompletesCenter:4,
  actualConditionalP0FirstResponseWings:wings,
  originalRootScalarWDL:'UNKNOWN',
  originalRootP1BestLevel2Column:'INCOMPLETE',
  totals,sourceAndIndependentPhysicalByP0WingReply:rows,
  thisIsNecessaryP1ReplySetNotProofP1AvoidsFutureLoss:true,
  independentlySearchedFutureStrategicGameWDLValues:0,
  Node26CIAndExternalIndependentFormalProof:'NOT_RUN'};
}
