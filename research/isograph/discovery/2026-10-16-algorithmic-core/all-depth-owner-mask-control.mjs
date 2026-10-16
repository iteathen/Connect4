#!/usr/bin/env node
// Independent standard 7x6 validation-only game playouts THROUGH FIRST
// TERMINAL, comparing arbitrary-depth source-owner-mask residual projection
// against direct physical geometry and single-ply q cofactor.
// Move choices are generated only for validation, NOT used by candidate.
import {createAllDepthOwnerMaskLift} from './all-depth-owner-mask-lift.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const G={width:7,height:6,connect:4},N=42,MAX_MOVES=20000,
 MAX_UPSET=250000,MAX_RESIDUAL_COMPARISONS=2000000,
 MAX_MS=45000,MAX_SAMPLES=200,MAX_ATTEMPTS=4000;
const SEED=0x7a16c402;
const phys=independentPhysical(G),core=createExactQCore(G);
let rng=SEED;
function word(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function sampleIndex(n){
 const end=Math.floor(0x100000000/n)*n;
 let x;do{x=word();}while(x>=end);
 return x%n;
}
const hex=m=>'0x'+m.toString(16);
const same=(a,b)=>core.key(a)===core.key(b);
function chooseNext(state,avoidTerminal,M){
 const opts=[];
 for(const c of phys.legal(state)){
  if(M.physicalMoveCalls>=MAX_MOVES)
   throw Error('validation physical-move cap in fixture generation');
  const edge=phys.transition(state,c);
  M.physicalMoveCalls++;M.fixtureGenerationMoveCalls++;
  if(!avoidTerminal||edge.terminal===undefined)opts.push({c,edge});
 }
 if(!opts.length&&avoidTerminal){
  // A terminal cannot be avoided forever on some late supports.
  // Play a legal terminal and STOP; this is still a completed game.
  const legal=phys.legal(state);
  if(!legal.length)throw Error('nonterminal legal-state invariant broken');
  const c=legal[sampleIndex(legal.length)];
  if(M.physicalMoveCalls>=MAX_MOVES)throw Error('fixture forced terminal cap');
  const edge=phys.transition(state,c);
  M.physicalMoveCalls++;M.fixtureGenerationMoveCalls++;
  return {c,edge};
 }
 return opts[sampleIndex(opts.length)];
}
export function runAllDepthOwnerMaskQualification(){
 const start=Date.now(),deadline=start+MAX_MS;
 const M={
  completedPhysicalGames:0,generatedFixtureAttempts:0,
  physicalMoveCalls:0,fixtureGenerationMoveCalls:0,
  replayValidationMoves:0,rankCovered:[],rankVisits:{},
  sourceAnchorCheckpoints:0,sourceAnchorKinds:{},
  qComparisonStates:0,onePlyQComparisonStates:0,
  terminalWinChecks:0,terminalDrawChecks:0,terminalP0:0,terminalP1:0,
  drawGames:0,lateRankAtLeast35:0,maxRankReached:0,
  firstWinMismatches:0,rankSupportMismatches:0,
  fullColumnEventChecks:0,GF2PhaseChecks:0,legalityGuardChecks:0,
  virtualFutureQueryChecks:0,upsetQueriesUsed:0,
  residualMembershipComparisonsUsed:0,ownerMaskProjectionCount:0,
  blockerMutationDetected:false,blockerMutationWitness:null,
  distinctNonterminalSupportCount:0
 };
 const supports=new Set(),errors=[],representativePaths=[];
 const baselineEmpty=core.createEmpty(),physEmpty=phys.qfrom(phys.empty());
 if(!same(baselineEmpty,physEmpty))
  return {status:'FAIL',error:'empty q geometry mismatch'};
 const countedPhysTransition=(s,c,fixture=false)=>{
  if(Date.now()>=deadline||M.physicalMoveCalls>=MAX_MOVES)
   throw Error('predeclared physical validation move or wall clock cap');
  M.physicalMoveCalls++;
  if(fixture)M.fixtureGenerationMoveCalls++;
  else M.replayValidationMoves++;
  return phys.transition(s,c);
 };
 // Use only future cells in test sets; deterministically sample both
 // singleton and mixed owner-mask pair/triple incidence queries.
 function checkUpset(lift,q){
  if(M.upsetQueriesUsed>=MAX_UPSET||M.residualMembershipComparisonsUsed>=MAX_RESIDUAL_COMPARISONS)
   throw Error('source virtual-upset validation budget reached');
  const cells=[];
  for(let c=0;c<7;c++)for(let row=q.h[c];row<6;row++)
   cells.push(core.bit(c,row));
  const queries=[];
  for(let i=0;i<Math.min(7,cells.length);i++)queries.push(cells[i]);
  let added=0;
  outer:for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
   if(added++>=6)break outer;
   queries.push(cells[i]|cells[j]);
  }
  added=0;
  outer3:for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)
    for(let k=j+1;k<cells.length;k++){
     if(added++>=4)break outer3;
     queries.push(cells[i]|cells[j]|cells[k]);
   }
  for(const S of queries)for(let who=0;who<2;who++){
   const expected=q[who===0?'R0':'R1'].some(x=>(x&S)===x);
   const actual=lift.queryUpset(who,S);
   M.virtualFutureQueryChecks++;
   if(expected!==actual)throw Error('arbitrary-depth virtual upset mismatch');
  }
 }
 function verifyPath(sequence,label){
  let s=phys.empty(),q=baselineEmpty;
  const global=createAllDepthOwnerMaskLift(G,q);
  const anchors=[];
  let lastRank=0;
  for(let i=0;i<sequence.length;i++){
   const c=sequence[i];
   const physical=countedPhysTransition(s,c);
   const oldRank=s.rank,oldSupport=s.h.slice();
   const newLift=global.apply(c);
   const newQ=core.next(q,c);
   const actualTerminal=physical.terminal,sourceTerminal=newLift.terminal;
   const qTerminal=newQ.terminal;
   if(actualTerminal!==sourceTerminal||actualTerminal!==qTerminal){
    M.firstWinMismatches++;throw Error('terminal guard disagreement on '+label+' ply '+(i+1));
   }
   M.terminalWinChecks++;
   if(sourceTerminal!==undefined&&sourceTerminal!==null){
    M.maxRankReached=Math.max(M.maxRankReached,newLift.rank);
    if(sourceTerminal===0){M.drawGames++;M.terminalDrawChecks++;}
    else if(sourceTerminal===1)M.terminalP0++;else M.terminalP1++;
   }else{
    if(newLift.rank!==physical.state.rank||newLift.h.some((x,j)=>x!==physical.state.h[j])){
     M.rankSupportMismatches++;throw Error('source support/rank mismatch '+label);
    }
    const physicalQ=phys.qfrom(physical.state);
    const normalized=global.deriveResidualQForValidation();
    M.ownerMaskProjectionCount++;
    if(!same(normalized,physicalQ)||!same(normalized,newQ.q)){
     M.qComparisonStates++;
     throw Error('owner-mask path lift or exact q cofactor mismatch '+label+' ply '+(i+1));
    }
    M.qComparisonStates++;M.onePlyQComparisonStates++;
    supports.add(physical.state.h.join(','));
    if(newLift.rank%7===0)checkUpset(global,physicalQ);
    for(const a of anchors){
      const aa=a.lift.apply(c);
      if(aa.terminal!==null)throw Error('anchor terminates before original');
      const anchorQ=a.lift.deriveResidualQForValidation();
      if(!same(anchorQ,physicalQ))throw Error('nonempty source anchor lift differs '+label);
      M.sourceAnchorCheckpoints++;
    }
    if([5,15,30,35].includes(physical.state.rank)){
      const newAnchor=createAllDepthOwnerMaskLift(G,physicalQ);
      anchors.push({from:physical.state.rank,lift:newAnchor});
      M.sourceAnchorKinds[physical.state.rank]=(M.sourceAnchorKinds[physical.state.rank]??0)+1;
    }
    q=newQ.q;
   }
   const changedPhase=oldSupport.map((h,j)=>((6-h)&1)^Number(j===c));
   if(changedPhase.some((x,j)=>x!==newLift.columnPhase[j]))
    throw Error('phase toggling invalid '+label);
   M.GF2PhaseChecks++;
   if(oldSupport[c]===5&&newLift.h[c]===6)M.fullColumnEventChecks++;
   if(newLift.h.some(x=>x===6))M.legalityGuardChecks++;
   const rank=newLift.rank;lastRank=rank;
   M.rankVisits[rank]=(M.rankVisits[rank]??0)+1;
   M.maxRankReached=Math.max(M.maxRankReached,rank);
   s=physical.state;
   if(sourceTerminal!==null){
    if(i!==sequence.length-1)throw Error('frozen sequence continued after terminal '+label);
    break;
   }
  }
  if(lastRank!==sequence.length)throw Error('validation sequence failed to reach planned final rank');
  if(representativePaths.length<35)representativePaths.push({label,
   length:sequence.length,history:sequence.map(x=>x+1).join(''),
   terminal:global.get().terminal,
   maxColumnHeight:Math.max(...s.h),
   centerHeight:s.h[3],
   phase:global.get().phase.join('')});
  M.completedPhysicalGames++;
  if(sequence.length>=35)M.lateRankAtLeast35++;
 }
 function produceSequence(prefix,avoid,label){
  let state=phys.empty(),path=[];
  for(const c1 of prefix){
   const c=c1-1;
   const next=countedPhysTransition(state,c,true);
   path.push(c);state=next.state;
   if(next.terminal!==undefined)throw Error('requested fixture prefix prematurely terminal '+label);
  }
  while(state.rank<N){
   if(Date.now()>deadline||M.physicalMoveCalls>=MAX_MOVES)
    throw Error('fixture generation budget');
   const {c,edge}=chooseNext(state,avoid,M);
   path.push(c);state=edge.state;
   if(edge.terminal!==undefined)break;
  }
  return path;
 }
 try{
  const fixed=[
   {seq:[1,5,2,6,3,7,4],name:'early-P0-horizontal-win'},
   {seq:[7,1,7,2,7,3,6,4],name:'early-P1-horizontal-win'}
  ];
  for(const {seq,name} of fixed){
    const s=seq.map(x=>x-1);verifyPath(s,name);
  }
  const prefixes=[
   {cols:[4,4,4,4,4,4],name:'center-full-on-move6'},
   {cols:[4,4,4,4,4,1,4],name:'center-full-on-move7'},
   {cols:[4,4,4,4,4,1,3,4],name:'center-full-on-move8'}
  ];
  for(const {cols,name} of prefixes){
   const path=produceSequence(cols,true,name);
   verifyPath(path,name);
  }
  for(let i=0;i<MAX_SAMPLES-5&&M.generatedFixtureAttempts<MAX_ATTEMPTS;i++){
   M.generatedFixtureAttempts++;
   const avoid=(i%2)===0;
   const path=produceSequence([],avoid,'seeded-'+i);
   verifyPath(path,'seeded-'+i+(avoid?'-no-early-win':'-any'));
  }
  M.distinctNonterminalSupportCount=supports.size;
  M.rankCovered=Object.keys(M.rankVisits).map(Number).sort((a,b)=>a-b);
  return {schema:'connect4.all-depth-owner-mask-source-residual-cocycle.v0_1',
   date:'2026-10-16',status:'PASS',seed:'0x'+SEED.toString(16),
   metrics:M,examples:representativePaths,
   runMs:Date.now()-start,
   statement:'all-depth fixed legal-word residual cofactor/terminal projection; no strategic quantifier aggregation or solved opening value',
   noPolicySearchInProducer:true,oracleCalls:0};
 }catch(e){
  M.distinctNonterminalSupportCount=supports.size;
  M.rankCovered=Object.keys(M.rankVisits).map(Number).sort((a,b)=>a-b);
  return {schema:'connect4.all-depth-owner-mask-source-residual-cocycle.v0_1',
   date:'2026-10-16',status:'FAIL_OR_BUDGET',error:String(e),seed:'0x'+SEED.toString(16),
   metrics:M,examples:representativePaths,runMs:Date.now()-start};
 }
}
if(process.argv[1]?.endsWith('all-depth-owner-mask-control.mjs')){
 const x=runAllDepthOwnerMaskQualification();
 console.log(JSON.stringify(x,null,2));if(x.status!=='PASS')process.exitCode=1;
}
