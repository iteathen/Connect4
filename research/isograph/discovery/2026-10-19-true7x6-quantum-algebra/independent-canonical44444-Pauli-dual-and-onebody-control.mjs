// Independent ORIGINAL 7x6 K4 source-Pauli dual matching and restricted
// ONE-BODY stabilizer certificate falsifier, frozen BEFORE running this
// second independent test. Uses a separately constructed original physical
// 69 K4 line table, independently reconstructed 44444 owner grid, AND
// checks every signed 0-3-variable fixing across the 18 pair bits.
// These are STATIC quantum-style tensor/Boolean checks, NOT a game tree
// or a WDL oracle. A causal line-completion precedence is checked via
// original gravity partial order (not chronological game search).
import {sourceCanonical44444PauliMatchedCausalAndOneBody}
  from './source-canonical44444-Pauli-dual-veto-and-onebody-cover.mjs';
function independent7x6CanonicalOriginal(){
 const W=7,H=6,K=4,originalDirections=[
  [0,1],[1,0],[1,1],[1,-1]
 ],lines=[],board=new Int8Array(W*H).fill(-1),height=Array(W).fill(0);
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dc,dr] of originalDirections) {
   if(c+3*dc<0||c+3*dc>=W||r+3*dr<0||r+3*dr>=H)continue;
   const cells=[];
   for(let i=0;i<4;i++)cells.push((r+i*dr)*W+c+i*dc);
   const mask=cells.reduce((m,z)=>m|(1n<<BigInt(z)),0n);
   lines.push({cells,mask});
  }
 if(lines.length!==69)throw Error('original 7x6 K4 independent windows not69');
 for(let ply=0;ply<5;ply++){
  const row=height[3]++,cell=row*7+3,p=ply&1;
  board[cell]=p;
  if(lines.some(L=>L.cells.every(z=>board[z]===p)))
    throw Error('canonical 44444 actual game prematurely firstwon');
 }
 function pop(m){let c=0;for(;m;m&=m-1n)c++;return c;}
 function residual(p){
  const terms=[];
  for(const L of lines){
   if(L.cells.some(z=>board[z]===1-p))continue;
   let mask=0n;
   for(const z of L.cells)if(board[z]===-1)mask|=1n<<BigInt(z);
   if(mask===0n)throw Error('real root already WIN');
   terms.push(mask);
  }
  terms.sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  const min=[];
  for(const t of terms)if(!min.some(s=>(t&s)===s))min.push(t);
  return [...new Set(min.map(x=>'0x'+x.toString(16)))];
 }
 const pairs=[];
 for(let c=0;c<W;c++)if(c!==3)
  for(let r=0;r<H;r+=2){
   const id=pairs.length;
   pairs.push({id,lower:r*7+c,upper:(r+1)*7+c});
  }
 return {board,height,lines,R0:residual(0),R1:residual(1),pairs,centerTop:5*7+3};
}
function staticGaugeGrid(physical,lowerbits) {
 const grid=Array.from(physical.board);
 for(const p of physical.pairs) {
  const lower=(lowerbits>>BigInt(p.id))&1n;
  grid[p.lower]=Number(lower);grid[p.upper]=1-Number(lower);
 }
 grid[physical.centerTop]=1;
 if(grid.some(x=>x<0)||grid.filter(x=>x===1).length!==21)
  throw Error('independent static pair gauge quota violation');
 return grid;
}
function physicalRequirementFulfilled(maskHex,owner,grid){
 const m=BigInt(maskHex);
 for(let id=0;id<42;id++)if((m&(1n<<BigInt(id)))!==0n&&grid[id]!==owner)
   return false;
 return true;
}
function originalGravityStrictBefore(lowerHex,upperHex) {
 const lower=BigInt(lowerHex),upper=BigInt(upperHex);
 for(let site=0;site<42;site++){
  if(!(lower&(1n<<BigInt(site))))continue;
  const c=site%7,r=Math.floor(site/7);
  let later=false;
  for(let laterRow=r+1;laterRow<6;laterRow++)
   if((upper&(1n<<BigInt(laterRow*7+c)))!==0n)later=true;
  if(!later)return false;
 }
 return true;
}
function fixedAssignmentContradictsClause(item,fix0,fix1){
 const req0=BigInt(item.must0Hex),req1=BigInt(item.must1Hex);
 return ((req0&fix1)!==0n)||((req1&fix0)!==0n);
}
export function independentCanonical44444PauliDualAnd4Check(){
 const output=sourceCanonical44444PauliMatchedCausalAndOneBody(),
   original=independent7x6CanonicalOriginal(),failure=[];
 const matched=output.PauliMatchedOriginalCausalVetoes,
   residual=output.PauliUnmatchedOriginalP1Clauses;
 const original0=new Set(original.R0),original1=new Set(original.R1);
 if(original0.size!==48||original1.size!==42||matched.length!==12||
    residual.length!==12)
  failure.push({kind:'ORIGINAL_R_OR_CUBIC_SIGNED_MATCH_COUNTS_INCORRECT'});
 for(const m of matched){
  if(!original0.has(m.P0OriginalResidualMask)||!original1.has(m.P1OriginalResidualMask)||
     !originalGravityStrictBefore(m.P0OriginalResidualMask,m.P1OriginalResidualMask)||
     originalGravityStrictBefore(m.P1OriginalResidualMask,m.P0OriginalResidualMask))
   failure.push({kind:'CAUSAL_CERTIFICATE_NOT_ACTUAL_ORIGINAL_GRAVITY',m});
 }
 let testedStatic=0,matchingSignedProjectorChecks=0,physicalQuotas=0;
 let rng=20261019>>>0;
 function rand(){rng=(Math.imul(rng,22695477)+1)>>>0;return rng}
 for(let t=0;t<4096;t++){
  const bits=BigInt((rand()>>>4)&0x3ffff),
    board=staticGaugeGrid(original,bits);
  testedStatic++;
  if(board.filter(p=>p===0).length!==21||
     board.filter(p=>p===1).length!==21)
   failure.push({kind:'STATIC_OWNER_QUOTA_NOT_BALANCED',bits:bits.toString(16)});
  physicalQuotas++;
  for(const m of matched){
   const p0=physicalRequirementFulfilled(m.P0OriginalResidualMask,0,board);
   const p1=physicalRequirementFulfilled(m.P1OriginalResidualMask,1,board);
   if(p0!==p1&&failure.length<12)
    failure.push({kind:'PHYSICAL_P0_P1_PROJECTOR_EQUALITY_FALSE',
     m:m.identity,bits:bits.toString(16),p0,p1});
   matchingSignedProjectorChecks++;
  }
 }
 // Structural independent proof of one Pauli check no-go:
 // no one nonempty support is contained in all 12 cubic supports.
 let shared=(1n<<18n)-1n;
 for(const item of residual)
  shared&=(BigInt(item.must0Hex)|BigInt(item.must1Hex));
 if(shared!==0n)failure.push({kind:'SINGLE_Z_SUPPORT_INTERSECTION_NOT_EMPTY',shared:String(shared)});
 // Verify all choices fixing 0,1,2,3 distinct one-body Pauli Z signs:
 // combinations x two-valued assignments. This enumerates STATIC
 // stabilizer choices, NOT future game continuations or strategic moves.
 const testedByFixedCount={0:0,1:0,2:0,3:0};
 const fullMask=(1<<12)-1;
 let accidentalCoverByAtMost3=0;
 function testVariables(index,start,k,selected){
  if(selected.length===k){
   const combinations=1<<k;
   for(let pattern=0;pattern<combinations;pattern++){
    let fix0=0n,fix1=0n;
    for(let j=0;j<k;j++){
     const bit=1n<<BigInt(selected[j]);
     if((pattern>>j)&1)fix1|=bit;else fix0|=bit;
    }
    let covered=0;
    for(let i=0;i<residual.length;i++)
     if(fixedAssignmentContradictsClause(residual[i],fix0,fix1))
      covered|=1<<i;
    testedByFixedCount[k]++;
    if(covered===fullMask){accidentalCoverByAtMost3++;
     if(failure.length<12)failure.push({kind:'UNEXPECTED_LE3_ONEBODY_COMPLETE_COVER',
       selected,pattern});}
   }
   return;
  }
  for(let j=start;j<=18-(k-selected.length);j++)
   testVariables(index+1,j+1,k,selected.concat(j));
 }
 for(let k=0;k<=3;k++)testVariables(0,0,k,[]);
 const cert=output.restrictedOneBodyExtraStabilizerCover;
 let four0=0n,four1=0n,maskFour=0;
 for(const guard of cert.oneStaticCertificate){
  const site=BigInt(guard.pairVariable),bit=1n<<site;
  if(((four0|four1)&bit)!==0n)
   failure.push({kind:'REPEATED_OR_CONFLICTING_ONEBODY_CHECK',guard});
  if(guard.fixedLowerOwnerBit===0)four0|=bit;else four1|=bit;
 }
 for(let i=0;i<residual.length;i++)
  if(fixedAssignmentContradictsClause(residual[i],four0,four1))maskFour|=1<<i;
 if(cert.minFixedPauliZSingleVariableChecks!==4||
    cert.oneStaticCertificate.length!==4||
    maskFour!==fullMask)
  failure.push({kind:'FOUR_ONEBODY_PAULI_CERTIFICATE_NOT_COVERING_ALL',
   minClaim:cert.minFixedPauliZSingleVariableChecks,
   witness:cert.oneStaticCertificate,maskFour,fullMask});
 const originallyUnmatched=new Set(residual.map(x=>x.originalMaskHex));
 if(originallyUnmatched.size!==12||
    [...originallyUnmatched].some(x=>!original1.has(x)))
  failure.push({kind:'ORIGINAL_UNMATCHED_P1_GENERATORS_NOT_FOUND'});
 const hist={};
 for(const c of residual)hist[c.physicalOriginalGeneratorLength]=(hist[c.physicalOriginalGeneratorLength]??0)+1;
 if(hist[3]!==10||hist[4]!==2)
  failure.push({kind:'ORIGINAL_10_2_RESIDUAL_GENERATOR_COUNT_MISMATCH',hist});
 return {status:failure.length?'CANONICAL_PAULI_DUAL_AND_FOUR_CHECK_COUNTEREXAMPLE':
   'INDEPENDENT_TRUE7X6_CANONICAL_PAULI_12_DUAL_AND_4CHECK_PASS',
  board:[7,6,4],canonical:'44444',actualOriginalR0:original0.size,actualOriginalR1:original1.size,
  physicallyVerifiedMatchedCausalSourcePairs:matched.length,
  checkedOriginalPhysicalLineWindows:original.lines.length,
  independentStaticGaugeColorAssignments:testedStatic,
  physicallyEvaluatedPairedProjectorDualEqualities:matchingSignedProjectorChecks,
  balancedP0P1QuotaPhysicalChecks:physicalQuotas,
  independentRemainingP1OriginalGenerators:originallyUnmatched.size,
  remainingP1PhysicalRequirementCardinalityHistogram:hist,
  intersectionOfAll12FreeVariableSupports:'0x'+shared.toString(16),
  independentStaticOneBodyCheckAssignmentsUpToThree:testedByFixedCount,
  erroneouslyCompleteWithThreeOrFewer:accidentalCoverByAtMost3,
  restrictedFourOneBodyExactCertificate:{
   chosen:cert.oneStaticCertificate,minFixedChecks:cert.minFixedPauliZSingleVariableChecks,
   all12ResidualPauliProjectorsAnnihilated:true,
   strategyReachability:'NOT_PROVED'
  },
  originalWDLRootNotEvaluated:true,originalLevel2BestActionNotProven:true,
  physicalAdversarialGameTreeSearch:0,independentStaticStabilizerChoicesTested:
   Object.values(testedByFixedCount).reduce((a,b)=>a+b,0),
  failures:failure.slice(0,15)};
}
