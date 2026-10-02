import {
  createGenericTargetDistanceMuProofEngine,
} from '../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-distance-mu-proof-lib.mjs';
import {
  createGenericTargetAuxLexProofEngine,
} from '../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-aux-lex-proof-lib.mjs';
import {
  createResolvedTailLexicographicProofEngine,
} from '../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';
import {
  proveDistance2TargetSupportReentry,
} from '../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-distance2-target-support-proof-lib.mjs';
import {
  createResolvedTailCapacityProofEngine,
  STANDARD7X6_C3,
  STANDARD7X6_G3,
} from '../../../semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-proof-lib.mjs';

export const LEGACY_TARGET_ENGINE_KINDS=Object.freeze([
  'LAMBDA',
  'THETA',
  'DISTANCE2_TARGET_SUPPORT',
  'DISTANCE1_RESOLVED_TAIL_CAPACITY',
]);

function failureKind(error){
  const m=String(error?.message??error);
  if(/cap exceeded/i.test(m))return 'RESOURCE_CAP_EXCEEDED';
  return 'ENGINE_ERROR';
}

function compact(engine,out,measure=null){
  return {
    proved:out?.proved===true,
    proofKind:out?.kind??null,
    witness:out?.witness??null,
    witnessKind:out?.witnessKind??out?.witnessRole??null,
    measure:out?.measure??measure??null,
    obligations:out?.obligations??[],
    forcedDefense:out?.forcedDefense??null,
    rejected:(out?.rejected??[]).slice(0,16),
    firstFailure:out?.firstFailure??null,
    routes:out?.routes??null,
    stats:engine?.stats?.()??null,
    resourceFailure:null,
  };
}

export function runLegacyTargetProofFamilies(kernel,state,target,{maxProofStates=100000,maxTargetDistance=5}={}){
  const lambda=createGenericTargetDistanceMuProofEngine(kernel,{maxProofStates,maxTargetDistance});
  const targetDistance=lambda.repair.targetDistance(state,target);
  const rows=[];

  try{
    rows.push({
      engine:'LAMBDA',applicable:true,targetDistance,
      ...compact(lambda,lambda.prove(state,target),lambda.measure(state,target)),
    });
  }catch(error){
    rows.push({
      engine:'LAMBDA',applicable:true,targetDistance,proved:false,proofKind:null,
      resourceFailure:{kind:failureKind(error),message:String(error?.message??error)},
      stats:lambda.stats(),
    });
  }

  const theta=createGenericTargetAuxLexProofEngine(kernel,{maxProofStates,maxTargetDistance});
  try{
    rows.push({
      engine:'THETA',applicable:true,targetDistance,
      ...compact(theta,theta.prove(state,target),theta.measure(state,target)),
    });
  }catch(error){
    rows.push({
      engine:'THETA',applicable:true,targetDistance,proved:false,proofKind:null,
      resourceFailure:{kind:failureKind(error),message:String(error?.message??error)},
      stats:theta.stats(),
    });
  }

  if(targetDistance===2&&(target===STANDARD7X6_C3||target===STANDARD7X6_G3)){
    const lex=createResolvedTailLexicographicProofEngine(kernel,{maxProofStates});
    try{
      rows.push({
        engine:'DISTANCE2_TARGET_SUPPORT',applicable:true,targetDistance,
        ...compact(lex,proveDistance2TargetSupportReentry(kernel,lex,state,target)),
      });
    }catch(error){
      rows.push({
        engine:'DISTANCE2_TARGET_SUPPORT',applicable:true,targetDistance,proved:false,proofKind:null,
        resourceFailure:{kind:failureKind(error),message:String(error?.message??error)},
        stats:lex.stats(),
      });
    }
  }else{
    rows.push({
      engine:'DISTANCE2_TARGET_SUPPORT',
      applicable:false,
      targetDistance,
      reason:targetDistance!==2?'target_distance_not_2':'target_not_c3_or_g3',
      proved:false,
      resourceFailure:null,
    });
  }

  if(targetDistance===1&&(target===STANDARD7X6_C3||target===STANDARD7X6_G3)){
    const tail=createResolvedTailCapacityProofEngine(kernel,{maxProofStates});
    try{
      const out=tail.prove(state,target);
      rows.push({
        engine:'DISTANCE1_RESOLVED_TAIL_CAPACITY',applicable:true,targetDistance,
        proved:out.proved===true,
        proofKind:out.kind??null,
        witness:out.witness??null,
        witnessKind:out.witnessKind??out.witnessRole??null,
        measure:{nu:out.nu??tail.nu(state,target)},
        obligations:[],
        forcedDefense:null,
        rejected:(out.rejected??[]).slice(0,16),
        firstFailure:null,
        routes:null,
        stats:tail.stats(),
        resourceFailure:null,
      });
    }catch(error){
      rows.push({
        engine:'DISTANCE1_RESOLVED_TAIL_CAPACITY',applicable:true,targetDistance,proved:false,proofKind:null,
        resourceFailure:{kind:failureKind(error),message:String(error?.message??error)},
        stats:tail.stats(),
      });
    }
  }else{
    rows.push({
      engine:'DISTANCE1_RESOLVED_TAIL_CAPACITY',
      applicable:false,
      targetDistance,
      reason:targetDistance!==1?'target_distance_not_1':'target_not_c3_or_g3',
      proved:false,
      resourceFailure:null,
    });
  }

  return Object.freeze({
    target,
    targetDistance,
    engines:Object.freeze(rows),
    proved:rows.some(x=>x.applicable&&x.proved===true),
    closingEngines:Object.freeze(rows.filter(x=>x.proved===true).map(x=>x.engine)),
    resourceFailureCount:rows.filter(x=>x.resourceFailure).length,
  });
}
