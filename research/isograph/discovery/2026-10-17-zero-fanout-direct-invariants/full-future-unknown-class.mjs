// Source-only FULL-FUTURE equivalence classes of first-action labels.
// Input: ONE original q, its literal actions and the exact source-local
// WIN/DRAW/LOSS values already derived for some of them.
// NEVER evaluates a child q, future game, policy, QBF or BDD.
// Edges require future-program isomorphism or dynamic inert bisimulation,
// not weak WDL ordering, short-horizon signature or future value table.
import {createEitherMoverExactTransport} from './either-mover-future-transport.mjs';
import {createInertCapacityBisimulation} from '../2026-10-17-dual-obligation-quotient/inert-capacity-bisimulation.mjs';

export function createFullFutureUnknownClass(geometry){
 const {width:W,height:H}=geometry,transport=createEitherMoverExactTransport(geometry),
  neutral=createInertCapacityBisimulation(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const start=Date.now(),legal=[];
  for(let c=0;c<W;c++)if(q.h[c]<H)legal.push(c);
  if(!legal.length)throw Error('nonterminal source with no actions');
  const owner=Array.from({length:W},(_,i)=>i),proofs=[];
  const stats={initialSourceActionLabels:legal.length,
   inertExactProgramEquivalencePairs:0,
   mirrorExactProgramEquivalencePairs:0,
   nongeometricExactTransportPairs:0,
   rawTransportPairs:0,
   staticSourceBooleanOperations:0,
   neutralSourceBooleanOperations:0,
   reflectionSourceBitsetChecks:0,
   sourceEquivalenceGroupUnionAttempts:0,
   exactBehaviorGroups:0,
   gameContinuationStatesMaterialized:0,
   futureGameValueQueries:0,branchingSearchCalls:0,
   certificateProgramIncludesAllFutureActions:true,
   elapsedMs:0};
  const find=x=>{while(owner[x]!==x){owner[x]=owner[owner[x]];x=owner[x];}return x;};
  function group(a,b,kind,witness){
   if(!legal.includes(a)||!legal.includes(b))throw Error('full future equivalence references illegal label');
   stats.sourceEquivalenceGroupUnionAttempts++;
   const x=find(a),y=find(b);
   if(x!==y)owner[Math.max(x,y)]=Math.min(x,y);
   proofs.push({a,b,kind,witness});
  }
  // A fully inert source suffix cannot contribute to ANY eventual
  // winline, so moving in any one inert column is the same neutral
  // tempo-token step. The dynamic transporter may depend on history.
  const inert=neutral.compute(q,{maxOperations,maxMs});
  stats.neutralSourceBooleanOperations=inert.statistics.operations;
  const ncols=inert.inertLiteralColumns;
  for(let i=1;i<ncols.length;i++){
   group(ncols[0],ncols[i],"DYNAMIC_NEUTRAL_TOKEN_FULL_FUTURE_BISIMULATION",
    {allInertColumns:ncols.slice(),totalNeutralCapacity:inert.initialNeutralPoolCapacity});
   stats.inertExactProgramEquivalencePairs++;
  }
  // Original q source reflection is exact future game automorphism if
  // both normalized residual upsets and column supports are invariant.
  let isMirror=q.h.every((n,i)=>n===q.h[W-1-i]);
  function reflectMask(m){
   let out=0n;
   for(let c=0;c<W;c++)for(let row=q.h[c];row<H;row++){
    stats.reflectionSourceBitsetChecks++;
    if((m&bit(c,row))!==0n)out|=bit(W-1-c,row);
   }
   return out;
  }
  for(const family of [q.R0,q.R1]){
   if(!isMirror)break;
   const original=new Set(family.map(String)),
     reflected=new Set(family.map(m=>String(reflectMask(m))));
   if(original.size!==reflected.size||[...original].some(z=>!reflected.has(z)))
     isMirror=false;
  }
  if(isMirror)for(const a of legal){
   const b=W-1-a;
   if(a<b){
    group(a,b,"SOURCE_GAME_AUTOMORPHISM_HORIZONTAL_REFLECTION",
      {reflectionPermutation:legal.map(c=>W-1-c)});
    stats.mirrorExactProgramEquivalencePairs++;
   }
  }
  // Exact mutual completion-upset equality under ONE height-compatible
  // column permutation, not merely two scalar weak-order witnesses.
  // Builds only source cofactor residual generators, never separate
  // future game evaluation obligations.
  const remainingMax=Math.max(1,maxOperations-stats.neutralSourceBooleanOperations-
    stats.reflectionSourceBitsetChecks);
  const t=transport.compute(q,{maxOperations:remainingMax,maxMs:Math.max(1,maxMs-(Date.now()-start))});
  stats.staticSourceBooleanOperations=t.statistics.operations;
  const weakWDLOrderEdges=[];
  for(const record of t.pairs){
   if(record.actions&&record.firstNoHigher)
     weakWDLOrderEdges.push({lowerP0ValueAction:record.actions[0],
       upperP0ValueAction:record.actions[1],
       sourceProofKind:'FULL_FUTURE_P0_FAVORABLE_UPSET_TRANSPORT',
       transporter:record.firstToSecondPermutation});
   if(record.actions&&record.secondNoHigher)
     weakWDLOrderEdges.push({lowerP0ValueAction:record.actions[1],
       upperP0ValueAction:record.actions[0],
       sourceProofKind:'FULL_FUTURE_P0_FAVORABLE_UPSET_TRANSPORT',
       transporter:record.secondToFirstPermutation});
  }
  for(const record of t.pairs){
   stats.rawTransportPairs++;
   if(!record.exactFutureActionMap)continue;
   const [a,b]=record.actions;
   if(find(a)===find(b))continue;
   group(a,b,"SOURCE_RESIDUAL_FULL_FUTURE_COLUMN_ISOMORPHISM",
     {columnTransport:record.exactFutureActionMap,
      reflection:record.exactMapIsReflection});
   if(!record.exactMapIsReflection)stats.nongeometricExactTransportPairs++;
  }
  const map=new Map();
  for(const a of legal){
   const k=find(a);if(!map.has(k))map.set(k,[]);
   map.get(k).push(a);
  }
  const classes=[...map.values()].map(group=>group.sort((x,y)=>x-y))
    .sort((x,y)=>x[0]-y[0]);
  for(const group of classes)for(const a of group)for(const b of group){
    if(a===b)continue;
    weakWDLOrderEdges.push({lowerP0ValueAction:a,upperP0ValueAction:b,
      sourceProofKind:'EXACT_FULL_FUTURE_PROGRAM_EQUIVALENCE_CLASS'});
  }
  stats.exactBehaviorGroups=classes.length;stats.elapsedMs=Date.now()-start;
  return {status:t.status==='COMPLETE'?'EXACT_CERTIFIED_GROUPS':'PARTIAL_BUT_EVERY_REPORTED_GROUP_PROVED',
   legalActionLabels:legal,classes,sourceCertificates:proofs,
   weakFullFutureWDLOrderEdges:weakWDLOrderEdges,
   originalSourceQRank:q.h.reduce((a,b)=>a+b,0),
   statistics:stats,allUnknownClassComparisonsComplete:t.status==='COMPLETE',
   scope:'Only exact full-future program equivalence via source reflection/fixed transport or dynamic neutral-token bisimulation. UNKNOWN between distinct output groups: never infer inequality or equality from missing map.'};
 }
 return Object.freeze({compute,width:W,height:H,connect:geometry.connect});
}
