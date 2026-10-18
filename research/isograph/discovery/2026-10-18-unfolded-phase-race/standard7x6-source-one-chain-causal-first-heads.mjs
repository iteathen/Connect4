// SOURCE direct fixed-profile FIRST gravity/turn-phase admissible columns.
// NOT strategic action values. Proof frozen in
// docs/research/2026-10-18-single-chain-phase-feasible-head-set-and-causal-frontier.md
// Uses ONE prior source profile-feasibility call; ZERO future-word branching.
import {createOneChainSingletonPhaseRealizer} from './standard7x6-source-one-chain-singletons-phase-realizer.mjs';
export function createOneChainCausalHeadSelector({width:W,height:H,connect:K}){
 const feasibility=createOneChainSingletonPhaseRealizer({width:W,height:H,connect:K});
 function compute(q,profile){
  const result=feasibility.compute(q,profile);
  if(result.status==='INCOMPLETE_INVALID_GUARDS_OR_PHYSICAL_EVENTS')
   return {status:'INCOMPLETE_INVALID_SOURCE_PROFILE',
    exactProjectionAdmissibleHeadColumns:null,rootPerfectWDL:null,bestLevel2Column:null};
  if(result.status==='SOURCE_PROVEN_OWNER_PROJECTION_NOT_REALIZABLE')
   return {status:'SOURCE_PROVEN_NO_REALIZING_COLORED_GRAVITY_FIRST_HEAD',
    reason:result.reason,exactProjectionAdmissibleHeadColumns:[],
    originalRootPerfectWDL:null,originalBestLevel2Column:null,
    sourceStrategicGameValuesComputed:0};
  const p=result.sourceRootMover, eps1=result.phasePrefixEpsilon[0];
  const M=result.sourceMinimumSingletonPrefixPhaseTransitions,s=result.sourceAvailableDistinctSingletonEvents;
  const allowed=[];
  if(eps1===0)allowed.push(result.chainColumn);
  const singletonOk=eps1===1?s>=M:s>=M+2;
  if(singletonOk){
   for(let j=0;j<result.singletonColumns.length;j++)
    if(result.singletonDesiredPhysicalOwnerBits[j]===p)
     allowed.push(result.singletonColumns[j]);
  }
  allowed.sort((a,b)=>a-b);
  if(!allowed.length)throw Error('feasible fixed owner allocation has no physical first move');
  return {
   status:'SOURCE_CERTIFIED_EXACT_FIXED_PROFILE_FIRST_HEAD_SET',
   exactProjectionAdmissibleHeadColumns:allowed,
   sourceFixedProfileHasUniqueFirstColumn:allowed.length===1,
   sourceSingleChainFirstColumnAllowed:eps1===0,
   sourceRequiredPhaseTransitions:M,sourceAvailableSingletons:s,
   sourceFirstChainParityDefect:eps1,
   sourceUnderlyingFeasibilityStatus:result.status,
   oneFixedAllocationCanonicalExample:result.oneSourceCanonicalGravityLegalSegment,
   sourceRequiresNoAlternateGravityWords:true,
   sourceFutureGameValueQueries:0,sourceAlternateFutureGameQObjects:0,
   actualGameBestFirstColumn:'NOT_PROVED',
   ordinaryOriginalRootWDL:'UNKNOWN'
  };
 }
 return Object.freeze({compute});
}
