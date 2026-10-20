// OWNER-MANDATED ROOT PROVENANCE. Generate ONLY from actual EMPTY
// W=7 H=6 K=4 board; validate EVERY P0 and P1 next move by the
// independently calibrated EXACT strong-score oracle. Different
// reproducible seeds choose ONLY among strong-score optimal ties.
// First-win stopping and 69 actual K4 windows checked independently.
// Any root timeout is INCOMPLETE; NEVER replace with a late root.
// Exact oracle is test-side TEACHER, not the proposed nonsearch WDL.
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ExactConnect4Oracle} from '../../../../components/oracle/exact7x6.mjs';
import {createTrue7x6SurvivingLineObserver} from './source-true7x6-69-lines-surviving-perfect-action-geometry.mjs';

const dirs=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
function physical(){
 const lines=[],byCell=Array.from({length:42},()=>[]);
 for(let c=0;c<7;c++)for(let r=0;r<6;r++)
  for(const [orientation,dx,dy] of dirs){
   if(c+3*dx>=7||r+3*dy<0||r+3*dy>=6)continue;
   const cells=Array.from({length:4},(_,i)=>(r+i*dy)*7+c+i*dx),
    id=lines.length;
   lines.push({id,orientation,cells});
   cells.forEach(e=>byCell[e].push(id));
  }
 if(lines.length!==69)throw Error('original 69 K4 windows invalid');
 return {lines,byCell};
}
function newBoard(){
 return {owners:Array(42).fill(-1),h:Array(7).fill(0),word:'',terminal:null};
}
function play(q,c,G){
 if(q.terminal!==null||!Number.isInteger(c)||c<1||c>7||q.h[c-1]>=6)
  throw Error('illegal original first-win-stopped move');
 const column=c-1,row=q.h[column]++,site=row*7+column,owner=q.word.length%2;
 q.owners[site]=owner;q.word+=c;
 const wins=G.byCell[site].filter(i=>G.lines[i].cells.every(e=>q.owners[e]===owner));
 if(wins.length)q.terminal=owner===0?'P0_WIN':'P1_WIN';
 else if(q.word.length===42)q.terminal='DRAW';
 return {site,winIDs:wins};
}
function count(q,G){
 const cats={empty:0,P0only:0,P1only:0,dead:0},
  orientation=Object.fromEntries(dirs.map(d=>[d[0],{empty:0,P0only:0,P1only:0,dead:0}]));
 for(const L of G.lines){
  let p0=false,p1=false;
  for(const e of L.cells){p0 ||= q.owners[e]===0;p1 ||= q.owners[e]===1;}
  const status=p0&&p1?'dead':p0?'P0only':p1?'P1only':'empty';
  cats[status]++;orientation[L.orientation][status]++;
 }
 if(Object.values(cats).reduce((a,b)=>a+b,0)!==69)
  throw Error('not all 69 original K4 windows counted');
 return {...cats,U:69-cats.dead,L0:cats.empty+cats.P0only,
  L1:cats.empty+cats.P1only,S:69-cats.dead+cats.empty,orientation};
}
function execute(){
 const geom=physical(),observer=createTrue7x6SurvivingLineObserver(),
  oracle=new ExactConnect4Oracle(),q=newBoard(),seed=workerData.seed,
  scored=[],seenWinningLines=new Set();
 if(workerData.origin!=='EMPTY7x6K4'||count(q,geom).U!==69)
  throw Error('root provenance must be literal empty original board');
 parentPort.postMessage({type:'REAL_EMPTY_BOARD',word:'',ply:0,heights:q.h.slice(),
  originalWinlines:69,geomSurvival:count(q,geom),seed});
 while(q.terminal===null){
  const before=q.word,ply=before.length,start=performance.now();
  // Empty-original-root strong score vector uses real gameplay Jx reflection.
  // EXACT four root child solves, not a guessed opening or solved-book value.
  // Reuse the SAME Oracle's transposition cache for every completed class.
  let scores;
  if(before===''){
   scores=Array(7).fill(-1000);
   for(let opening=1;opening<=4;opening++){
    // No single move on empty true 7x6 can complete a K4 line.
    // Negamax side change yields exact first-player candidate score.
    const exactScore=-oracle.solveSequence(String(opening));
    scores[opening-1]=exactScore;
    scores[7-opening]=exactScore;
    parentPort.postMessage({type:'EXACT_EMPTYROOT_MIRRORED_OPENING_CLASS_COMPUTED',
     originalBoard:[7,6,4],rootHistory:'',
     representativeOneBasedColumn:opening,
     reflectedOneBasedColumn:8-opening,
     exactStrongScoreForFirstMover:exactScore,
     transpositionEntriesSoFar:oracle.table.size,
     nodesCumulative:oracle.nodes,
     noPartialChildValueAccepted:true});
   }
  }else{
   scores=Array.from(oracle.analyzeSequence(before));
  }
  const best=Math.max(...scores);
  const optimal=scores.flatMap((x,c)=>x!==-1000&&x===best?[c+1]:[]);
  if(scores.length!==7||optimal.length===0)
   throw Error('qualified exact oracle returned no optimal legal action');
  const selected=optimal[(ply+seed)%optimal.length];
  const changed=play(q,selected,geom);
  changed.winIDs.forEach(x=>seenWinningLines.add(x));
  const independent=count(q,geom),
   reconstruction=observer.board(q.word),reported=observer.observe(reconstruction);
  if(reconstruction.terminal!==q.terminal||
     reconstruction.color.some((x,j)=>q.owners[j]!==x)||
     independent.U!==reported.distinctGeometricallySurviving||
     independent.L0!==reported.liveForP0||
     independent.L1!==reported.liveForP1)
   throw Error('independent physical/game and unfolded-source disagreement');
  const item={type:'QUALIFIED_EMPTYROOT_STRONG_OPTIMAL_PLY',
   before,after:q.word,ply:q.word.length,oldPly:ply,
   mover:ply%2?'P1':'P0',exactStrongScores:scores,optimalOneBasedColumns:optimal,
   chosenColumn:selected,landingPhysicalCell:changed.site,
   originalFirstWinningLineIDs:changed.winIDs,terminal:q.terminal,
   geometricLineStatus:independent,oracleNodes:oracle.nodes,
   oracleComputeMs:performance.now()-start};
  scored.push({before,scores,optimal,selected});parentPort.postMessage(item);
 }
 parentPort.postMessage({type:'COMPLETE_EMPTYROOT_BOTH_PLAYERS_EXACT_PERFECT_GAME',
  firstWinStopped:true,originalGame:[7,6,4],seed,
  completeOneBasedHistory:q.word,terminal:q.terminal,
  allMovesStrongOracleOptimal:true,numberVerifiedMoves:scored.length,
  firstWinOriginalLineIDs:[...seenWinningLines],
  terminalGeometric69LineStatus:count(q,geom),
  fullPerPlyStrongOracleScoreProof:scored,
  noPreselectedMidgameRoot:true,
  oracleIsValidationTeacherNotNonsearchSolution:true});
}
function arg(k,def){
 const s=process.argv.slice(2).find(s=>s.startsWith('--'+k+'='));
 return s?s.slice(k.length+3):def;
}
if(!isMainThread){
 try{execute();}catch(e){parentPort.postMessage({type:'EMPTYROOT_ORACLE_ERROR',
   status:'INCOMPLETE',error:String(e),stack:String(e?.stack??'')});}
}else if(resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)){
 const seed=Number(arg('seed','0')),budget=Number(arg('root-ms','45000')),
  journal=arg('journal','');
 if(!Number.isSafeInteger(seed)||seed<0||!Number.isFinite(budget)||budget<=0)
  throw Error('seed>=0 and budget>0 required');
 const write=obj=>{
  const row=JSON.stringify(obj)+'\n';
  if(journal)appendFileSync(journal,row);
  process.stdout.write(row);
 };
 write({type:'ROOT_CAMPAIGN_STARTED',actualInitialHistory:'',seed,budgetMs:budget,
  geometry:[7,6,4],strictRootProvenance:true});
 const worker=new Worker(import.meta.url,{workerData:{origin:'EMPTY7x6K4',seed},
  resourceLimits:{maxOldGenerationSizeMb:2048,maxYoungGenerationSizeMb:128}});
 let done=false,qualifiedRoot=false;
 const timer=setTimeout(()=>{
  if(done)return;
  done=true;worker.terminate().catch(()=>{});
  write({type:'COLD_EMPTY_ROOT_RESOURCE_LIMIT',status:'INCOMPLETE',
   exactRootScoreVectorComputed:qualifiedRoot,
   perfectRootToTerminalGameNotYetGenerated:true,
   neverSubstitutedMidgameRoot:true,budgetMs:budget});
 },budget);
 worker.on('message',msg=>{
  if(done)return;
  if(msg.type==='QUALIFIED_EMPTYROOT_STRONG_OPTIMAL_PLY'&&msg.oldPly===0)
   qualifiedRoot=true;
  write(msg);
  if(msg.type==='COMPLETE_EMPTYROOT_BOTH_PLAYERS_EXACT_PERFECT_GAME'||
     msg.type==='EMPTYROOT_ORACLE_ERROR'){
   done=true;clearTimeout(timer);worker.terminate().catch(()=>{});
  }
 });
 worker.on('error',e=>{
  if(done)return;
  done=true;clearTimeout(timer);
  write({type:'EMPTYROOT_ORACLE_PROCESS_ERROR',status:'INCOMPLETE',error:String(e)});
 });
 worker.on('exit',code=>{
  if(done)return;
  done=true;clearTimeout(timer);
  write({type:'ROOT_WORKER_EXITED_EARLY',status:'INCOMPLETE',exitCode:code});
 });
}
