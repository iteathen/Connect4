// Arbitrary-depth fixed-word OWNER-MASK residual-cofactor composition.
// No continuation choice, game-tree search, policy discovery, solved values,
// or precomputed oracle inputs enter this producer.
//
// Given legal, nonterminal starting q and disjoint future stone events A0/A1:
//  R_i(new) = Min({r\A_i: r in R_i(start), r cap A_(1-i)=empty}).
// Future query upset:
//  U_i(new,S) = exists r in R_i(start): (r cap A_(1-i)=empty)
//                                     and r subseteq (S union A_i).
//
// It processes one supplied legal move event at a time and detects first-win
// via original residuals. Caller/validation owns move selection. This is a
// COMPLETE TRANSITION kernel for given histories, not a full game-value solver.

const subset=(a,b)=>(a&b)===a;
function count(x){let k=0;for(;x;x&=x-1n)k++;return k;}
function minimize(masks){
 const order=[...new Set(masks.map(String))].map(BigInt)
    .sort((a,b)=>count(a)-count(b)||(a<b?-1:a>b?1:0)),out=[];
 for(const x of order)if(!out.some(y=>subset(y,x)))out.push(x);
 return out;
}
export function createAllDepthOwnerMaskLift({width:W,height:H,connect:K},q){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('unsupported Connect-K geometry');
 if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(v=>typeof v!=='bigint'||v===0n))
  throw Error('invalid nonterminal source q');
 const cell=(c,r)=>1n<<BigInt(r*W+c);
 const startRank=q.h.reduce((a,v)=>a+v,0),N=W*H;
 const source={h:q.h.slice(),R0:q.R0.slice(),R1:q.R1.slice()};
 let h=q.h.slice(),newP0=0n,newP1=0n,rank=startRank,terminal=null;
 const metrics={moveEvents:0,terminalFirstWinChecks:0,
  originalResidualLineChecks:0,
  virtualUpsetQueries:0,sourceMembershipComparisons:0,
  derivedQValidationCalls:0,derivedRequirementsExamined:0,
  phaseXorUpdates:0,filledColumnsObserved:0};
 function queryUpset(who,S){
  if(who!==0&&who!==1)throw Error('invalid claimant');
  if(typeof S!=='bigint')throw Error('invalid source future query');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=cell(c,r);
  if((S&~future)!==0n)throw Error('query not inside current future support');
  metrics.virtualUpsetQueries++;
  const mine=who===0?newP0:newP1,op=who===0?newP1:newP0;
  const R=who===0?source.R0:source.R1;
  for(const x of R){
   metrics.sourceMembershipComparisons++;
   if((x&op)===0n&&subset(x,S|mine))return true;
  }
  return false;
 }
 function deriveResidualQForValidation(){
  if(terminal!==null)throw Error('no nonterminal q after terminal');
  metrics.derivedQValidationCalls++;
  function claimed(R,mine,op){
   const a=[];
   for(const x of R){metrics.derivedRequirementsExamined++;
    if((x&op)===0n)a.push(x&~mine);
   }
   const result=minimize(a);
   if(result.includes(0n))throw Error('winning residual reached outside terminal state');
   return result;
  }
  return {h:h.slice(),
   R0:claimed(source.R0,newP0,newP1),
   R1:claimed(source.R1,newP1,newP0)};
 }
 function apply(c){
  if(terminal!==null)throw Error('attempted play after terminal');
  if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
   throw Error('illegal supplied gravity action');
  const move=cell(c,h[c]),who=rank&1;
  if(who===0)newP0|=move;else newP1|=move;
  h[c]++;rank++;metrics.moveEvents++;metrics.phaseXorUpdates++;
  if(h[c]===H)metrics.filledColumnsObserved++;
  const owned=who===0?newP0:newP1,blocked=who===0?newP1:newP0,
    requirements=who===0?source.R0:source.R1;
  metrics.terminalFirstWinChecks++;
  for(const req of requirements){
   metrics.originalResidualLineChecks++;
   if((req&blocked)===0n&&(req&~owned)===0n){
    terminal=who===0?1:-1;break;
   }
  }
  if(terminal===null&&rank===N)terminal=0;
  return {terminal,h:h.slice(),rank,playerJustMoved:who,
   sourceOwnershipP0:newP0,sourceOwnershipP1:newP1,
   legalActionMask:h.reduce((s,v,j)=>v<H?s|(1n<<BigInt(j)):s,0n),
   columnPhase:h.map(v=>(H-v)&1)};
 }
 return Object.freeze({
  apply,queryUpset,deriveResidualQForValidation,
  get() {return {h:h.slice(),rank,terminal,
    sourceOwnedByP0:newP0,sourceOwnedByP1:newP1,
    phase:h.map(v=>(H-v)&1),
    metrics:{...metrics}};
  },
  initialSupport:source.h,
  originalResiduals:[source.R0.slice(),source.R1.slice()],
  scope:'exact fixed-legal-word residual/cofactor and first-win terminal projection, arbitrary rank, NOT WDL/strategy';
 });
}
