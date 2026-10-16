#!/usr/bin/env node
// Independent STANDARD 7x6 validation of the original-q response-cover
// operator. Full physical continuation enumeration is VALIDATION ONLY;
// producer never uses these move words or any winning policy/value table.
import {createUniversalResponseCover} from './universal-response-cover-operator.mjs';
import {createDirectTwoMovePullback} from './direct-two-move-pullback.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const G={width:7,height:6,connect:4};
const SEED=0x4c2a2028,MAX_ATTEMPTS=4000,MAX_CASES=12,
 MAX_PHYSICAL=30000,MAX_LOOKUPS=50000,MAX_MS=30000;
const source=createUniversalResponseCover(G),direct=createDirectTwoMovePullback(G),
 physical=independentPhysical(G);
const mask=x=>'0x'+x.toString(16);
const rank=h=>h.reduce((s,v)=>s+v,0);
const mirrorMask=m=>{
 let out=0n;for(let c=0;c<7;c++)if((m&(1n<<BigInt(c)))!==0n)
 out|=1n<<BigInt(6-c);return out;
};
let rng=SEED;
function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function randInt(n){const max=Math.floor(0x100000000/n)*n;
 let x;do{x=random();}while(x>=max);return x%n;}
export function runStandardResponseCoverControl(){
 const start=Date.now(),deadline=start+MAX_MS;
 const M={sourceStates:0,sourceResponseRows:0,sourceResidualLookups:0,
  algebraicChildQReferenceObjects:0,algebraicMaskMismatches:0,
  physicalValidationMoveCalls:0,physicalResponseMaskMismatches:0,
  physicalImmediateP0MoveTrials:0,seedFixtureMoveCalls:0,
  mirrorMismatches:0,sourceChildQObjectsCreated:0,
  firstP1MovesPhysicallyChecked:0,secondP1MovesPhysicallyChecked:0,
  distinctLatePositions:0,attempts:0,rootPrefixChecked:false,
  universalPositiveStates:0};
 const samples=[],seen=new Set();
 const physMove=(s,c,fixture=false)=>{
  if(M.physicalValidationMoveCalls>=MAX_PHYSICAL||Date.now()>=deadline)
   throw Error('fixed physical validation move/time cap reached');
  M.physicalValidationMoveCalls++;
  if(fixture)M.seedFixtureMoveCalls++;
  return physical.transition(s,c);
 };
 function immediateP0(s){
  for(const c of physical.legal(s)){
   M.physicalImmediateP0MoveTrials++;
   if(physMove(s,c).terminal===1)return true;
  }
  return false;
 }
 function check(qState,label){
  if((qState.rank&1)!==1)throw Error('P1-to-move input required');
  const q=physical.qfrom(qState);
  const output=source.compute(q);
  M.sourceStates++;M.sourceResponseRows+=output.statistics.P0ReplyActionLabels;
  M.sourceResidualLookups+=output.statistics.sourceResidualMembershipQueries;
  if(M.sourceResidualLookups>MAX_LOOKUPS)throw Error('fixed residual lookup cap reached');
  let expectedCoverage=0n;
  for(const b of physical.legal(qState)){
   M.firstP1MovesPhysicallyChecked++;
   const afterB=physMove(qState,b),col=1n<<BigInt(b);
   const expected=afterB.terminal===undefined?
     direct.compute(physical.qfrom(afterB.state)).forcedWinningFirstActionsMask:0n;
   if(afterB.terminal===undefined)M.algebraicChildQReferenceObjects++;
   const actual=output.responseActionsByP1.find(x=>x.initialP1===b)?.certifiedP0RepliesMask;
   if(actual!==expected){M.algebraicMaskMismatches++;
    throw Error('source vs cofactor child mismatch '+label+' P1 col '+(b+1));
   }
   let physicalMask=0n;
   if(afterB.terminal===undefined){
    for(const a of physical.legal(afterB.state)){
     const afterA=physMove(afterB.state,a);
     let success=afterA.terminal===1;
     if(afterA.terminal===undefined){
      success=true;
      for(const d of physical.legal(afterA.state)){
       M.secondP1MovesPhysicallyChecked++;
       const afterD=physMove(afterA.state,d);
       if(afterD.terminal!==undefined||!immediateP0(afterD.state)){
        success=false;break;
       }
      }
     }
     if(success)physicalMask|=1n<<BigInt(a);
    }
   }
   if(physicalMask!==actual){M.physicalResponseMaskMismatches++;
    throw Error('physical first-win reply mask mismatch '+label+' col '+(b+1));
   }
   if(actual!==0n)expectedCoverage|=col;
  }
  if(expectedCoverage!==output.coveredInitialP1Mask||
    output.universalBoundedP0Win!==(expectedCoverage===output.initialLegalP1Mask))
    throw Error('universal response cover outcome mismatch '+label);
  if(output.universalBoundedP0Win)M.universalPositiveStates++;
  const reflect=source.compute(physical.qfrom(physical.reflected(qState)));
  for(let a=0;a<7;a++)
   if(mirrorMask(output.responseCoverByP0Column[a])!==
      reflect.responseCoverByP0Column[6-a]){
    M.mirrorMismatches++;
    throw Error('column transporter disagrees '+label);
   }
  const report={label,sequence:qState.sequence,rank:qState.rank,
    support:qState.h,
    initialP1LegalMask:mask(output.initialLegalP1Mask),
    coveredP1Mask:mask(output.coveredInitialP1Mask),
    rowMasksByP0Action:output.responseCoverByP0Column.map(mask),
    universalBoundedWin:output.universalBoundedP0Win,
    rowCount:output.statistics.P0ReplyActionLabels};
  samples.push(report);
 }
 try{
  let root=physical.empty();
  for(const c of '44444'){
   const after=physMove(root,Number(c)-1,true);
   if(after.terminal!==undefined)throw Error('early terminal on 44444 prefix');
   root=after.state;
  }
  check(root,'turn6-44444');
  M.rootPrefixChecked=true;
  for(let i=0;i<MAX_ATTEMPTS&&M.distinctLatePositions<MAX_CASES;i++){
   M.attempts++;
   let s=physical.empty();
   while(s.rank<35){
    const eligible=[];
    for(const c of physical.legal(s)){
     const after=physMove(s,c,true);
     if(after.terminal===undefined)eligible.push(after.state);
    }
    if(!eligible.length)break;
    s=eligible[randInt(eligible.length)];
   }
   if(s.rank!==35)continue;
   const k=physical.key(s);if(seen.has(k))continue;seen.add(k);
   check(s,'rank35-'+(M.distinctLatePositions+1));
   M.distinctLatePositions++;
  }
  return {
   schema:'connect4.standard7x6.source-response-cover-control.v0_1',
   date:'2026-10-16',
   status:M.distinctLatePositions===MAX_CASES?'PASS':'PARTIAL',
   seed:mask(BigInt(SEED)),M,samples,
   budget:{maxAttempts:MAX_ATTEMPTS,maxLateCases:MAX_CASES,
    maxPhysicalMoves:MAX_PHYSICAL,maxSourceResidualLookups:MAX_LOOKUPS,maxWallMs:MAX_MS},
   scope:'fixed 4-ply P1/P0/P1/P0 first-win outcome only; not eventual game WDL',
   producerUsedSolvedLabels:false,
   producerUsedPolicySearch:false,
   elapsedMs:Date.now()-start
  };
 }catch(e){
  return {schema:'connect4.standard7x6.source-response-cover-control.v0_1',
   status:'FAIL_OR_BUDGET',reason:String(e),seed:mask(BigInt(SEED)),
   metrics:M,samples,elapsedMs:Date.now()-start};
 }
}
if(process.argv[1]?.endsWith('universal-response-cover-7x6-control.mjs')){
 const r=runStandardResponseCoverControl();
 console.log(JSON.stringify(r,null,2));
 if(r.status!=='PASS')process.exitCode=1;
}
