// INDEPENDENT physical original 7x6 K4 geometry and current Oracle
// CORPUS scorer. Inputs: exact externally checkpointed 128 parent
// score vectors, and separately biased30 beginning spotchecks.
// SCORE vectors are pre-supplied solved-game validations, NOT
// calculated by the source non-search surviving-line observer.
// Compare each parent and EVERY strong-optimal move (score=max)
// against ALL other legal but non-strongoptimal choices on SAME
// parent and same ply. This is PERFECT NEXT ACTION conditional on
// each given earlier history, NOT proven root-to-terminal perfect
// play from empty. The 27/28 owner guess is a preregistered
// exploratory count, not tuned by this implementation.
import {createTrue7x6SurvivingLineObserver}
 from './source-true7x6-69-lines-surviving-perfect-action-geometry.mjs';
function independentGeometry(){
 const lines=[],through=Array.from({length:42},()=>[]);
 const orientations=[['F',1,-1],['R',1,1],['V',0,1],['H',1,0]];
 for(let col=0;col<7;col++)for(let row=0;row<6;row++)
  for(const [direction,dx,dy] of orientations){
   if(col+3*dx<0||col+3*dx>=7||row+3*dy<0||row+3*dy>=6)
    continue;
   const originalSites=[0,1,2,3].map(k=>(row+k*dy)*7+col+k*dx),
    i=lines.length;
   lines.push({direction,originalSites});
   originalSites.forEach(id=>through[id].push(i));
  }
 if(lines.length!==69)throw Error('independent original 69 K4 windows absent');
 return {lines,through};
}
function independentOriginalPhysical(word,G) {
 const cells=Array(42).fill(-1),h=Array(7).fill(0);
 let firstWinner=null;
 for(let ply=0;ply<word.length;ply++){
  if(firstWinner!==null)throw Error('input corpus has move AFTER ORIGINAL FIRST WIN');
  const c=+word[ply]-1,r=h[c],p=ply%2;
  if(!Number.isInteger(c)||c<0||c>=7||r>=6)throw Error('oracle corpus original history illegal physical gravity');
  const id=r*7+c;h[c]++;cells[id]=p;
  const firstLines=G.through[id].filter(i=>
   G.lines[i].originalSites.every(z=>cells[z]===p));
  if(firstLines.length)firstWinner=p===0?'P0_WIN':'P1_WIN';
  else if(ply===41)firstWinner='DRAW';
 }
 return {h,cells,firstWinner,ply:word.length};
}
function independentMeasures(s,G){
 const count={empty:0,P0only:0,P1only:0,dead:0},
  dir=Object.fromEntries(['H','V','R','F'].map(k=>[k,{empty:0,P0only:0,P1only:0,dead:0}]));
 for(const L of G.lines){
  let a=false,b=false;
  for(const id of L.originalSites){
   if(s.cells[id]===0)a=true;
   if(s.cells[id]===1)b=true;
  }
  const mode=a&&b?'dead':a?'P0only':b?'P1only':'empty';
  count[mode]++;dir[L.direction][mode]++;
 }
 return {...count,distinctGeometricallySurviving:69-count.dead,
  liveForP0:count.empty+count.P0only,
  liveForP1:count.empty+count.P1only,
  bothOwnerLayerMultiplicity:69-count.dead+count.empty,
  orientation:dir,firstWinTerminal:s.firstWinner,absolutePly:s.ply};
}
function compare(a,b,tag,errs) {
 for(const key of ['empty','P0only','P1only','dead','distinctGeometricallySurviving',
   'liveForP0','liveForP1','bothOwnerLayerMultiplicity'])
  if(a[key]!==b[key])errs.push({kind:'SOURCE_VS_INDEPENDENT_SURVIVAL_METRIC',tag,key,source:a[key],native:b[key]});
 for(const direction of ['H','V','R','F'])
  for(const key of ['empty','P0only','P1only','dead'])
   if(a.orientation[direction][key]!==b.orientation[direction][key])
    errs.push({kind:'SOURCE_VS_INDEPENDENT_ORIENTATION_SURVIVOR',tag,direction,key});
}
function add(hist,key,v) {hist[key]=(hist[key]??0)+v}
function byBucket(n) {return n<=15?'early_0_15':n<=29?'middle_16_29':n<=35?'late_30_35':'end_36_42'}
function aggregate(rows,which){
 const numeric=['empty','P0only','P1only','dead',
  'distinctGeometricallySurviving','liveForP0','liveForP1','bothOwnerLayerMultiplicity'];
 const obj={count:rows.length,rankMin:Math.min(100,...rows.map(x=>x.ply)),
   rankMax:Math.max(-1,...rows.map(x=>x.ply)),
   histSurvivingDistinct:{},histOwnerLayers:{},
   hits27or28ByMetric:Object.fromEntries(numeric.map(k=>[k,0])),
   means:{},medianDistinct:null,observed27or28Distinct:0,
   examplesNear27or28:[]};
 for(const k of numeric)obj.means[k]=rows.reduce((s,x)=>s+x[k],0)/(rows.length||1);
 for(const x of rows){
  add(obj.histSurvivingDistinct,String(x.distinctGeometricallySurviving),1);
  add(obj.histOwnerLayers,String(x.bothOwnerLayerMultiplicity),1);
  for(const k of numeric)if(x[k]===27||x[k]===28)obj.hits27or28ByMetric[k]++;
  if(x.distinctGeometricallySurviving===27||x.distinctGeometricallySurviving===28){
   obj.observed27or28Distinct++;
   if(obj.examplesNear27or28.length<8)obj.examplesNear27or28.push({
    sample:x.sample,sourceSet:x.sourceSet,ply:x.ply,
    distinct:x.distinctGeometricallySurviving,
    dead:x.dead,P0live:x.liveForP0,P1live:x.liveForP1,
    move:x.lastMove??null});
  }
 }
 const sorted=rows.map(x=>x.distinctGeometricallySurviving).sort((a,b)=>a-b);
 obj.medianDistinct=sorted.length?sorted[Math.floor(sorted.length/2)]:null;
 return obj;
}
export function independentlyScoreOriginal7x6OracleSurvivors(corpusEnd,corpusBegin){
 const G=independentGeometry(),source=createTrue7x6SurvivingLineObserver(),
  errs=[],parents=[],opt=[],nonopt=[],perGroup={},terminalChild=[];
 const controls=[[0,0,3],[3,0,7],[3,2,13]];
 for(const [c,r,n] of controls){
  const got=G.through[r*7+c].length;
  if(got!==n)errs.push({kind:'ORIGINAL_PHYSICAL_INCIDENCE_WRONG',c,r,expected:n,got});
 }
 function parse(txt,label){
  if(typeof txt!=='string'||txt.length<10)throw Error('frozen oracle corpus text unavailable');
  const lines=txt.trim().split('\n');
  return lines.map((line,i)=>{
   const [group,sourceSet,sourceLine,moves,value,scoreCSV]=line.split('\t'),
     scores=scoreCSV.split(',').map(Number);
   if(scores.length!==7||!Number.isFinite(+value))
    throw Error('frozen original oracle score vector malformed '+label+':'+i);
   return {group,sourceSet,sourceLine:+sourceLine,moves,parentScore:+value,scores,
    sample:label+':'+(i+1)};
  });
 }
 const records=parse(corpusEnd,'calibration').concat(parse(corpusBegin,'biased-beginning'));
 if(records.length!==158)throw Error('expected exactly 128+30 independently qualified original oracle corpora');
 let parentWinLabelsValidated=0,strongOptimalMoves=0,otherLegalMoves=0,
  sourceGeometryWindowChecks=0,independentOwnedBoardCellChecks=0;
 for(const r of records){
  const native=independentOriginalPhysical(r.moves,G),s=source.board(r.moves);
  if(native.firstWinner!==null||s.terminal!==null)
   errs.push({kind:'FROZEN_ORACLE_ROOT_TERMINAL_BUT_CLAIMED_PLAYABLE',sample:r.sample});
  if(native.ply!==s.ply||native.cells.some((v,i)=>v!==s.color[i]))
   errs.push({kind:'SOURCE_PHYSICAL_ROOT_NOT_SAME_ACTUAL_GAME',sample:r.sample});
  const values=r.scores.filter(score=>score!==-1000);
  if(!values.length||Math.max(...values)!==r.parentScore)
   errs.push({kind:'INDEPENDENT_PARENT_ORACLE_SCORE_MAX_DISAGREES',sample:r.sample});
  parentWinLabelsValidated++;
  const before=independentMeasures(native,G);
  compare(source.observe(s),before,r.sample,errs);
  const parent={...before,sample:r.sample,sourceSet:r.sourceSet,
   ply:native.ply,score:r.parentScore};
  parents.push(parent);
  const legalMovers=native.h.filter(v=>v<6).length;
  if(legalMovers!==values.length)
   errs.push({kind:'EXTERNAL_ORACLE_ILLEGAL_SCORE_SENTINEL_MISMATCH',sample:r.sample});
  for(let c=0;c<7;c++){
   if(native.h[c]>=6||r.scores[c]===-1000)continue;
   const nextWord=r.moves+(c+1),
     childPhysical=independentOriginalPhysical(nextWord,G),
     childMeasured=independentMeasures(childPhysical,G),
     srcMove=source.move(s,c+1);
   compare(srcMove.after,childMeasured,r.sample+'/'+(c+1),errs);
   const currentOpponent=r.moves.length%2===0?1:0;
   const deniedBefore=currentOpponent===0?before.liveForP0:before.liveForP1;
   const deniedAfter=currentOpponent===0?childMeasured.liveForP0:childMeasured.liveForP1;
   if(srcMove.immediateNewOpponentBlockedLines!==deniedBefore-deniedAfter)
    errs.push({kind:'OWNER_LINE_NEWLY_DENIED_COUNT_INCORRECT',sample:r.sample,c});
   const data={...childMeasured,sourceSet:r.sourceSet,
    group:r.group,sample:r.sample,parentPly:native.ply,ply:childPhysical.ply,
    parentScore:r.parentScore,candidateStrongScore:r.scores[c],lastMove:c+1,
    deltaDistinct:childMeasured.distinctGeometricallySurviving-before.distinctGeometricallySurviving,
    newlyOpponentBlocked:deniedBefore-deniedAfter,
    winner:childPhysical.firstWinner};
   if(r.scores[c]===r.parentScore){opt.push(data);strongOptimalMoves++;}
   else{nonopt.push(data);otherLegalMoves++;}
   if(childPhysical.firstWinner!==null)terminalChild.push(data);
   sourceGeometryWindowChecks+=69;independentOwnedBoardCellChecks+=42;
  }
 }
 if(errs.length) return {status:'SOURCE_OR_PHYSICAL_ORACLE_CORPUS_GEOMETRY_REJECTED',
  errors:errs.slice(0,12),recordsParsed:records.length};
 const segments=Object.fromEntries(['early_0_15','middle_16_29','late_30_35','end_36_42'].map(g=>{
  const filter=x=>byBucket(x.ply)===g;
  return [g,{parents:aggregate(parents.filter(filter)),strongOptimalChildren:aggregate(opt.filter(filter)),
   otherLegalChildren:aggregate(nonopt.filter(filter))}];
 }));
 const cohorts=Object.fromEntries([...new Set(records.map(x=>x.sourceSet))].map(set=>[
  set,{parents:aggregate(parents.filter(x=>x.sourceSet===set)),
    strongOptimalChildren:aggregate(opt.filter(x=>x.sourceSet===set)),
    otherLegalChildren:aggregate(nonopt.filter(x=>x.sourceSet===set))}]));
 const perParentComparison=records.map(r=>{
  const p=parents.find(x=>x.sample===r.sample),a=opt.filter(x=>x.sample===r.sample),
    b=nonopt.filter(x=>x.sample===r.sample);
  const avg=xs=>xs.reduce((s,x)=>s+x.distinctGeometricallySurviving,0)/(xs.length||1);
  return {sample:r.sample,sourceSet:r.sourceSet,
   originalRealWord:r.moves,rootPly:p.ply,sourcePerfectPlayValue:r.parentScore,
   rootDistinct:p.distinctGeometricallySurviving,
   rootOwnerLayerMultiplicity:p.bothOwnerLayerMultiplicity,
   rootCancelledBoth:p.dead,
   rootP0Live:p.liveForP0,rootP1Live:p.liveForP1,
   numberStrictStrongOptimalMoves:a.length,numberOtherLegalMoves:b.length,
   oneStepMeanDistinctAfterPerfectStrongAction:avg(a),
   oneStepMeanDistinctAfterOtherLegalAction:b.length?avg(b):null,
   optimalLiteralColumns:a.map(x=>x.lastMove),
   rootStrandOrientationStatuses:p.orientation};
 });
 return {
  status:'INDEPENDENT_ORIGINAL7X6_PER_ACTION_QUALIFIED_ORACLE_SURVIVOR_STATISTICS_PASS',
  originalGame:[7,6,4],firstWinStops:true,
  originalPhysicalWinlines:69,strictFirstWinWordsReplayed:true,
  recordProvenance:'frozen externally qualified Pascal Pons 128 mid/end parent scores and 30 deliberately biased beginning spot checks; move scores generated by separately qualified exact independent Node Oracle',
  corpusParents:records.length,calibrationParents:128,biasedBeginningParents:30,
  independentlyValidatedStrongScoreMaxForEveryParent:parentWinLabelsValidated,
  strongOptimalNextMoveChildren:strongOptimalMoves,
  nonoptimalLegalOneMoveControls:otherLegalMoves,
  physicalNextMovesLandingMeasured:strongOptimalMoves+otherLegalMoves,
  exactSourceGeometryWindowChecks:sourceGeometryWindowChecks,
  independentPhysicalNextChild42OwnerSiteChecks:independentOwnedBoardCellChecks,
  initialCellLineIncidences:{bottomCorner:3,bottomCenter:7,interiorCenterThirdRow:13},
  allParentRecords:perParentComparison,
  aggregates:{
   allParents:aggregate(parents),
   strongOptimalNextMoveChildren:aggregate(opt),
   nonOptimalLegalChildren:aggregate(nonopt),
   terminalOneMoveChildren:aggregate(terminalChild),
   sourceTestCohorts:cohorts,
   absolutePlySegments:segments
  },
  scopeLimitation:'Parent histories are externally solved at last position, not verified to have followed perfect moves FROM EMPTY ROOT; one-step optimal child does not establish entire historical PV was all-perfect. Corpus is selection biased.',
  outcomeInference:'No new source nonsearch WDL/Level2 theorem; any 27-28 frequency is a postulated statistical pattern not root-perfect-play proof.',
  errors:[]};
}
