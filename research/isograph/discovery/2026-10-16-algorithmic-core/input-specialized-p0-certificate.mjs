// Oracle-blind, input-specialized P0 WIN region certificate discovery.
// Uses only qualified q support/antichains/cofactors. At P0 choose ONE
// proven action; at P1 prove ALL actions; retain a support-indexed upset
// generator frontier and independently verifiable proof DAG.
//
// Producer is permitted to recurse and search P0 alternatives! It counts
// ALL attempted alternatives. This is candidate-first proof search, not a
// claim of universally eliminated strategic branching.

import {createExactQCore} from './exact-q-core.mjs';

export class DiscoveryBudgetError extends Error {
  constructor(message,metrics){super(message);this.name='DiscoveryBudgetError';this.metrics=metrics;}
}
const DEFAULT={
  maxObligationVisits:60000,maxLocalChecks:300000,
  maxNodes:60000,maxProofEdges:300000,deadlineAt:Infinity,
  useDominance:true
};
const subset=(a,b)=>(a&b)===a;
const rankOf=q=>q.h.reduce((a,b)=>a+b,0);
const supportKey=q=>q.h.join(',');
const domain={width:4,height:3,connect:3};
function favorable(candidate,base) {
  if(candidate.h.some((n,i)=>n!==base.h[i]))return false;
  // Candidate P0 requirements are easier: F0(candidate) >= F0(base).
  for(const r of base.R0)if(!candidate.R0.some(s=>subset(s,r)))return false;
  // Candidate P1 requirements are harder: F1(candidate) <= F1(base).
  for(const r of candidate.R1)if(!base.R1.some(s=>subset(s,r)))return false;
  return true;
}
const asJSON=q=>({h:q.h.slice(),R0:q.R0.map(x=>x.toString(16)),
  R1:q.R1.map(x=>x.toString(16))});
function smallWitnessStats(core,q) {
  // Pure geometric rule-only ranking. These are candidates, not score bounds.
  const p=rankOf(q)&1,actions=core.legal(q);
  return actions.map(a=>{
    const step=core.next(q,a);
    if(step.terminal!==undefined)return {a,step,score:
      step.terminal===1?1e7:step.terminal===-1?-1e7:-1e6};
    const child=step.q;
    let p0Short=0,p1Short=0,p0Ones=0,p1Ones=0;
    for(const r of child.R0){const size=r.toString(2).replace(/0/g,'').length;
      if(size===1)p0Ones++;if(size<=2)p0Short++;}
    for(const r of child.R1){const size=r.toString(2).replace(/0/g,'').length;
      if(size===1)p1Ones++;if(size<=2)p1Short++;}
    // A P0 first-win proof often includes forks; distinguish concrete
    // double-playable threats from generic short residuals.
    const p0ThreatCount=core.legal(child).filter(c=>
      child.R0.some(r=>r===core.bit(c,child.h[c]))).length;
    const p1ThreatCount=core.legal(child).filter(c=>
      child.R1.some(r=>r===core.bit(c,child.h[c]))).length;
    const score=200*p0ThreatCount-350*p1ThreatCount+
      40*p0Ones-60*p1Ones+8*p0Short-12*p1Short+
      2*(actions.length-Math.abs(a-(domain.width-1)/2));
    return {a,step,score};
  }).sort((x,y)=>p===0?y.score-x.score||x.a-y.a:
      x.score-y.score||x.a-y.a);
}
export function discoverInputSpecializedP0Win(options={}) {
  const core=createExactQCore(domain),opts={...DEFAULT,...options};
  const started=Date.now(),metrics={
    obligationVisits:0,uniqueExploredQ:0,localChecks:0,
    candidateActionsRanked:0,attemptedActionEdges:0,
    p0OptionsAttempted:0,p1RepliesAttempted:0,p1UniversalNodes:0,
    p0ExistentialNodes:0,failedProofNodes:0,
    dominanceQueries:0,dominanceHits:0,exactMemoHits:0,
    winGeneratorCount:0,proofEdgeCount:0,
    maxSearchDepth:0,peakActivePath:0,
    maxCachedNonWinStates:0,leafP0Wins:0,
    leafP1Wins:0,leafDraws:0};
  const winners=new Map(),winBySupport=new Map(),refuted=new Set(),
    touched=new Set(),active=new Set(),root=core.createEmpty();
  const key=q=>core.key(q);
  function bound() {
    if(metrics.obligationVisits>=opts.maxObligationVisits||
       metrics.localChecks>=opts.maxLocalChecks||
       winners.size>=opts.maxNodes||
       metrics.proofEdgeCount>=opts.maxProofEdges||Date.now()>=opts.deadlineAt)
      throw new DiscoveryBudgetError('input-specific P0 proof discovery budget exhausted',{...metrics,
        elapsedMs:Date.now()-started});
  }
  function getCertified(q){
    const id=key(q),direct=winners.get(id);
    if(direct){metrics.exactMemoHits++;return direct;}
    if(!opts.useDominance)return null;
    const pool=winBySupport.get(supportKey(q))??[];
    for(const rec of pool){
      metrics.localChecks++;metrics.dominanceQueries++;bound();
      if(favorable(q,rec.q)){metrics.dominanceHits++;return rec;}
    }
    return null;
  }
  function search(q,depth,path){
    bound();metrics.obligationVisits++;
    metrics.maxSearchDepth=Math.max(depth,metrics.maxSearchDepth);
    metrics.peakActivePath=Math.max(metrics.peakActivePath,active.size+1);
    const id=key(q);
    const won=getCertified(q);
    if(won)return won;
    if(refuted.has(id)){metrics.exactMemoHits++;return null;}
    if(active.has(id))throw Error('cycle despite strictly decreasing empty-cell count');
    if(!touched.has(id)){touched.add(id);metrics.uniqueExploredQ++;}
    active.add(id);
    const mover=rankOf(q)&1,actions=smallWitnessStats(core,q);
    metrics.localChecks+=actions.length;
    metrics.candidateActionsRanked+=actions.length;
    bound();
    let edges=[],ok=mover===1,choice=null;
    if(mover===0)metrics.p0ExistentialNodes++;
    else metrics.p1UniversalNodes++;
    for(const {a,step} of actions){
      bound();metrics.attemptedActionEdges++;
      if(mover===0)metrics.p0OptionsAttempted++;else metrics.p1RepliesAttempted++;
      let childRef=null,p0Success=false;
      if(step.terminal!==undefined){
        if(step.terminal===1){metrics.leafP0Wins++;p0Success=true;}
        else if(step.terminal===-1)metrics.leafP1Wins++;
        else metrics.leafDraws++;
      }else{
        const proved=search(step.q,depth+1,[...path,a]);
        if(proved!==null){childRef=proved.id;p0Success=true;}
      }
      if(mover===0&&p0Success){
        edges=[{action:a,terminal:step.terminal===1?'P0_WIN':null,ref:childRef}];
        choice=a;ok=true;break;
      }
      if(mover===1){
        if(!p0Success){ok=false;break;}
        edges.push({action:a,terminal:step.terminal===1?'P0_WIN':null,ref:childRef});
      }
    }
    active.delete(id);
    if(!ok){
      refuted.add(id);metrics.failedProofNodes++;
      metrics.maxCachedNonWinStates=Math.max(metrics.maxCachedNonWinStates,refuted.size);
      return null;
    }
    const node={id,q,sourcePath:path.slice(),policyAction:choice,edges};
    winners.set(id,node);
    if(!winBySupport.has(supportKey(q)))winBySupport.set(supportKey(q),[]);
    winBySupport.get(supportKey(q)).push(node);
    metrics.winGeneratorCount=winners.size;
    metrics.proofEdgeCount+=edges.length;
    return node;
  }
  try{
    const certified=search(root,0,[]);
    if(certified===null)return {status:'P0_WIN_NOT_CERTIFIED',metrics,
      note:'An exhaustive bounded claimant-only search returned no P0 win; not a general draw/loss claim.',
      elapsedMs:Date.now()-started};
    // Produce one CLOSED reachable subset of all accumulated winning proofs.
    // Other successful probes may be orphaned; eliminate them without
    // assuming they are false or changing the searched action policy.
    const reachable=new Set(),todo=[certified.id];
    while(todo.length){
      const id=todo.pop();
      if(reachable.has(id))continue;
      const n=winners.get(id);
      if(!n)throw Error('missing internal winning generator '+id);
      reachable.add(id);
      for(const e of n.edges)if(e.ref!==null)todo.push(e.ref);
    }
    const nodes=[...reachable].map(id=>winners.get(id)).sort((a,b)=>
      rankOf(b.q)-rankOf(a.q)||a.id.localeCompare(b.id));
    const serialized=nodes.map(n=>({id:n.id,q:asJSON(n.q),sourcePath:n.sourcePath.slice(),
      p0SelectedAction:n.policyAction,edges:n.edges.slice().sort((a,b)=>a.action-b.action)}));
    const included=new Set(serialized.map(x=>x.id));
    if(!included.has(certified.id))throw Error('proof root missing');
    return {status:'CANDIDATE_P0_WIN',schema:'connect4.input-specialized-claimant-proof.v0_1',
      board:domain,rootId:certified.id,openingAction:certified.policyAction,
      conclusion:'P0_WIN',nodes:serialized,
      metrics:{...metrics,
        candidateProofNodes:serialized.length,
        candidateProofEdges:serialized.reduce((k,n)=>k+n.edges.length,0),
        orphanedCandidateWinners:winners.size-serialized.length,
        elapsedMs:Date.now()-started},
      semantics:'all P1 actions covered; one P0 action certified; terminal-first rank decreasing; proof refs may use favorable residual dominance',
      discoveryProfile:{useDominance:opts.useDominance},
      noOracleUsed:true,noSolvedValueInputs:true};
  }catch(e){
    if(e instanceof DiscoveryBudgetError)
      return {status:'BUDGET_EXHAUSTED',error:String(e),metrics:{...metrics,
        elapsedMs:Date.now()-started}};
    throw e;
  }
}
export {favorable};
