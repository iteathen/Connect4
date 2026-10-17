// EXACT source-only P1 scalar-min value obligation elimination.
// Consumes proven whole-future P1 first-action weak WDL comparisons from
// a source-residual column-transport certificate, NEVER solved outcomes.
// Strongly connected weak orders are WDL-EQUAL groups, but cannot
// erase any original move labels from a complete optimum set without
// strict/equality value proof. No game tree or policy enumeration.
export function quotientP1RootActionValueObligations(sourceCertificate, {
 maxOperations=300000,maxNodes=60000,maxMs=15000
}={}){
 const started=Date.now(),legal=sourceCertificate?.legalP1Columns;
 if(!Array.isArray(legal)||legal.length===0||legal.length>42||
    new Set(legal).size!==legal.length||legal.some(c=>!Number.isInteger(c)||c<0))
  throw Error('source-certified literal P1 root labels required');
 const n=legal.length,sourceOps=sourceCertificate.statistics?.operations??0;
 const stats={sourceTransportOperations:sourceOps,
  legalFirstActions:n,certifiedDirectWeakEdges:0,
  certifiedExactFutureProgramMaps:0,graphTransitiveChecks:0,
  SCCMembershipChecks:0,condensationIncomingChecks:0,
  pathSearchNodeVisits:0,proofTransportedActionLabels:0,
  graphOperations:0,wholeProcessCountedOperations:sourceOps,
  independentRootWDLQueriesInProducer:0,
  gameContinuationsEnumeratedInProducer:0};
 class Limit extends Error{constructor(kind){super('ROOT_ACTION_DOMINANCE_'+kind+'_LIMIT');this.kind=kind;}}
 function charge(key){stats[key]++;stats.graphOperations++;
  stats.wholeProcessCountedOperations=sourceOps+stats.graphOperations;
  if(stats.wholeProcessCountedOperations>maxOperations)throw new Limit('OPERATIONS');
  if(Date.now()-started>maxMs)throw new Limit('TIME');
 }
 if(n>maxNodes)throw new Limit('NODES');
 const index=new Map(legal.map((v,i)=>[v,i]));
 const direct=Array.from({length:n},()=>Array(n).fill(false)),
   refEvidence=new Map();
 function link(source,target,proof){
  const i=index.get(source),j=index.get(target);
  if(i===undefined||j===undefined)throw Error('certificate has action not legal');
  if(i===j)return;
  if(!direct[i][j]){direct[i][j]=true;stats.certifiedDirectWeakEdges++;}
  if(!refEvidence.has(i+':'+j))refEvidence.set(i+':'+j,proof);
 }
 const mirrorOnlyDirect=Array.from({length:n},()=>Array(n).fill(false));
 for(const pair of sourceCertificate.pairs??[]){
  const [a,b]=pair.actions??[];
  if(!index.has(a)||!index.has(b))throw Error('pair references illegal first action');
  if(pair.firstNoHigher)link(a,b,{
     pair:[a,b],whichDirection:'FIRST_LEQ_SECOND',
     columnPermutation:pair.firstToSecondPermutation});
  if(pair.secondNoHigher)link(b,a,{
     pair:[a,b],whichDirection:'SECOND_LEQ_FIRST',
     columnPermutation:pair.secondToFirstPermutation});
  if(pair.exactFutureActionMap){
   stats.certifiedExactFutureProgramMaps++;
   if(!pair.firstNoHigher||!pair.secondNoHigher)
    throw Error('exact program isomorphism missing both value directions');
   if(pair.exactMapIsReflection){
    mirrorOnlyDirect[index.get(a)][index.get(b)]=true;
    mirrorOnlyDirect[index.get(b)][index.get(a)]=true;
   }
  }
 }
 function analyze(initial){
  const reach=initial.map((row,i)=>row.map((x,j)=>x||i===j));
  for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++){
   charge('graphTransitiveChecks');
   if(reach[i][k]&&reach[k][j])reach[i][j]=true;
  }
  const labelsSeen=new Set(),components=[];
  for(let i=0;i<n;i++){
   if(labelsSeen.has(i))continue;
   const group=[];
   for(let j=0;j<n;j++){
    charge('SCCMembershipChecks');
    if(reach[i][j]&&reach[j][i])group.push(j);
   }
   for(const j of group)labelsSeen.add(j);
   components.push(group);
  }
  const undominated=components.filter((g,i)=>
    !components.some((h,j)=>j!==i&&h.some(x=>g.some(y=>{
      charge('condensationIncomingChecks');return reach[x][y];
    }))));
  const scalarReps=undominated.map(g=>legal[g.slice().sort((x,y)=>legal[x]-legal[y])[0]])
    .sort((x,y)=>x-y);
  // Every omitted P1 first choice is weakly no better for minimization
  // than some retained representative via a certified directed path.
  const proofForOmitted=[];
  function proofPath(from,to){
   if(from===to)return [legal[from]];
   const visited=new Set([from]),pending=[[from,[from]]];
   while(pending.length){
    const [v,steps]=pending.shift();charge('pathSearchNodeVisits');
    for(let j=0;j<n;j++)if(initial[v][j]&&!visited.has(j)){
     if(j===to)return [...steps,j].map(x=>legal[x]);
     visited.add(j);pending.push([j,[...steps,j]]);
    }
   }
   throw Error('transitive closure lacks original direct proof path');
  }
  for(const a of legal){
   if(scalarReps.includes(a))continue;
   const candidate=scalarReps.find(r=>reach[index.get(r)][index.get(a)]);
   if(candidate===undefined)throw Error('no surviving min witness for deleted scalar evaluation');
   const path=proofPath(index.get(candidate),index.get(a));
   stats.proofTransportedActionLabels++;
   proofForOmitted.push({omittedLiteralColumn:a,
     retainedNoWorseLiteralColumn:candidate,
     weakOrderPath:path,
     edgeProofs:path.slice(1).map((col,t)=>
       refEvidence.get(index.get(path[t])+':'+index.get(col))??null)});
  }
  const equalityClasses=components.map(c=>c.map(i=>legal[i]).sort((a,b)=>a-b));
  return {reach,scalarReps,proofForOmitted,equalityClasses,
   undominatedWDLValueClasses:undominated.map(c=>c.map(i=>legal[i]).sort((a,b)=>a-b))};
 }
 try{
  const all=analyze(direct),baseline=analyze(mirrorOnlyDirect);
  return {
   status:'EXACT_SCALAR_VALUE_OBLIGATION_QUOTIENT',
   allLegalP1ActionLabels:legal.slice(),
   scalarRootValueRepresentatives:all.scalarReps,
   scalarRootEvaluationsNotNeeded:all.proofForOmitted,
   fullWDLValueEquivalenceClasses:all.equalityClasses,
   undominatedValueClasses:all.undominatedWDLValueClasses,
   reflectionOnlyScalarRepresentatives:baseline.scalarReps,
   additionalScalarEvaluationsAvoidedBeyondReflection:
     baseline.scalarReps.length-all.scalarReps.length,
   exactUnrestrictedRootValue:null,
   completeOptimalP1MoveSet:null,
   allOriginalPotentiallyOptimalLabelsPreserved:legal.slice(),
   statistics:{...stats,elapsedMs:Date.now()-started,
    scalarRootValueEvaluationsNeeded:all.scalarReps.length,
    scalarRootValueEvaluationsEliminated:legal.length-all.scalarReps.length,
    equalityClassesWithTwoOrMoreLabels:all.equalityClasses.filter(c=>c.length>1).length},
   scope:'P1 minimum over exact unrestricted WDL child values preserved. Source-only proof, no child WDL queried. Weakly dominated labels may TIE; full exact optimum move set remains UNKNOWN unless values/strict comparisons independently certified.'
  };
 }catch(e){
  if(e instanceof Limit)return {status:'BUDGET_PARTIAL',kind:e.kind,
   allLegalP1ActionLabels:legal.slice(),scalarRootValueRepresentatives:null,
   completeOptimalP1MoveSet:null,statistics:stats};
  throw e;
 }
}
