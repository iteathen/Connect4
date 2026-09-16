#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const CONTROL = fileURLToPath(new URL('./quotient-standard7x6-off-subsystem-continuation-congruence.mjs', import.meta.url));
const child = spawnSync(process.execPath,[CONTROL],{encoding:'utf-8',timeout:120000,maxBuffer:16*1024*1024});
if(child.error) throw child.error;
if(child.status!==0) throw new Error(`continuation control failed: ${(child.stderr??'').slice(-8000)}`);
const line=(child.stdout??'').split(/\r?\n/).find((value)=>value.startsWith('OFF_SUBSYSTEM_CONTINUATION_CONGRUENCE='));
if(!line) throw new Error('continuation control output missing');
const base=JSON.parse(line.slice('OFF_SUBSYSTEM_CONTINUATION_CONGRUENCE='.length));
assert.equal(base.retainedImmediateLocalEffectClasses,12);
assert.equal(base.continuationObservationClasses,14);
assert.equal(base.splitImmediateClasses,2);

function stable(value){
  if(Array.isArray(value)) return value.map(stable);
  if(value===null||typeof value!=='object') return value;
  const out={};for(const key of Object.keys(value).sort())out[key]=stable(value[key]);return out;
}
function key(value){return JSON.stringify(stable(value));}
function analyze(name,selector){
  let refinedClassCount=0;
  let unresolvedOriginalClasses=0;
  const unresolved=[];
  for(const c of base.classResults){
    const buckets=new Map();
    for(const variant of c.continuationVariants){
      const refinement=selector(variant.continuation,c.signature);
      const k=key(refinement);
      if(!buckets.has(k)) buckets.set(k,[]);
      buckets.get(k).push(variant);
    }
    refinedClassCount+=buckets.size;
    const bad=[...buckets.entries()].filter(([,variants])=>variants.length>1);
    if(bad.length){
      unresolvedOriginalClasses++;
      unresolved.push({
        members:c.members,
        signature:c.signature,
        buckets:bad.map(([refinement,variants])=>({refinement:JSON.parse(refinement),continuationVariants:variants.length,members:variants.flatMap((v)=>v.members)})),
      });
    }
  }
  return {name,refinedClassCount,unresolvedOriginalClasses,continuationCongruent:unresolvedOriginalClasses===0,unresolved};
}

const strategies=[
  analyze('phase_weight_only',(continuation)=>continuation.before?.phaseWeight??null),
  analyze('support_tail_only',(continuation)=>continuation.before?.repairSupportTail??null),
  analyze('exact_GF2_phase_location',(continuation)=>continuation.before?.phaseBits??null),
  analyze('next_enabled_event_dependency_cone',(continuation)=>continuation.before?.nextRepairCellIncidence??null),
  analyze('phase_location_plus_next_event_cone',(continuation)=>({phaseBits:continuation.before?.phaseBits??null,nextRepairCellIncidence:continuation.before?.nextRepairCellIncidence??null})),
];
const byName=Object.fromEntries(strategies.map((s)=>[s.name,s]));
assert.equal(byName.phase_weight_only.continuationCongruent,false,'phase weight unexpectedly repaired continuation congruence');
assert.equal(byName.support_tail_only.continuationCongruent,false,'support tail unexpectedly repaired continuation congruence');
assert.equal(byName.exact_GF2_phase_location.continuationCongruent,true,'exact phase location failed to separate retained split');
assert.equal(byName.exact_GF2_phase_location.refinedClassCount,14,'phase-location refinement class count drift');
assert.equal(byName.next_enabled_event_dependency_cone.continuationCongruent,true,'next event cone failed to separate retained split');
assert.equal(byName.phase_location_plus_next_event_cone.continuationCongruent,true);

console.log(`OFF_SUBSYSTEM_CONTINUATION_REFINEMENT=${JSON.stringify({
  kind:'standard7x6-off-subsystem-continuation-refinement-v1',
  attribution:{
    researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',
    formalizationImplementationQualification:'OpenAI ChatGPT',
  },
  baseImmediateClasses:base.retainedImmediateLocalEffectClasses,
  requiredContinuationClasses:base.continuationObservationClasses,
  strategies,
  boundedConclusion:{
    smallestTestedSingleFieldSeparator:'exact_GF2_phase_location',
    scalarPhaseWeightRejected:true,
    supportTailAloneRejected:true,
    nextEnabledEventDependencyConeAlsoSeparates:true,
    conservativeProgressSignature:'immediate local-effect signature + exact GF2 phase location + next-enabled-event dependency cone',
  },
  interpretation:'Within the retained 20-transition control, exact GF2 phase location is the smallest tested single additional field that refines the 12 immediate event-effect classes to 14 continuation-congruent classes. Phase weight and support-tail type do not repair the split. The next-enabled-event R dependency cone independently separates the same cases and remains load-bearing for stronger residual claims, so the conservative progress signature retains both phase location and that cone.',
  theoremBoundary:'This establishes sufficiency only for the tested exact same-column continuation observation on the retained 20-transition domain. It is not a global state quotient and does not prove continuation congruence for arbitrary later actions.',
  authority:'Derived only from the exact C4-0010 continuation-congruence control. No W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.',
})}`);
