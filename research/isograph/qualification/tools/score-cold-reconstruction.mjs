import fs from 'node:fs';
const base='out/isograph-cold';
const report=JSON.parse(fs.readFileSync(base+'/PARSED_REPORT.json','utf8'));
const a=JSON.parse(fs.readFileSync('research/isograph/qualification/COLD_ASSERTIONS_0_1.json','utf8'));
const errors=[];
function eq(label,x,y){if(JSON.stringify(x)!==JSON.stringify(y))errors.push(label+': expected '+JSON.stringify(y)+' got '+JSON.stringify(x));}
eq('source_revision',report.source_revision,a.frozen_source_revision);
eq('authority_state',report.authority_state,a.expected.authority_state);
eq('current_logic_documents',report.corpus_counts?.current_logic_documents,a.expected.current_logic_documents);
eq('source_objects',report.corpus_counts?.source_objects,a.expected.exact_source_objects);
eq('canonical_claims',report.corpus_counts?.canonical_claims,a.expected.canonical_claims);
eq('semantic_items',report.corpus_counts?.semantic_items,a.expected.semantic_items);
eq('canonical_owner',report.research_ownership?.canonical_owner,a.expected.canonical_research_owner);
eq('solver_branches_own_research',report.research_ownership?.solver_branches_own_research,a.expected.solver_branches_own_research);

const gotClaims=[...(report.claim_inventory||[])].map(x=>({id:x.id,status:x.status,guard_count:x.guard_count,relation_count:x.relation_count,source_count:x.source_count,scope_present:x.scope_present})).sort((x,y)=>x.id.localeCompare(y.id));
eq('claim_inventory',gotClaims,a.claim_inventory);
const gotUnresolved=[...(report.unresolved_inventory||[])].map(x=>({id:x.id,status:x.status,qu_state:x.qu_state})).sort((x,y)=>x.id.localeCompare(y.id));
eq('unresolved_inventory',gotUnresolved,[...a.unresolved].sort((x,y)=>x.id.localeCompare(y.id)));
const gotNegative=[...(report.negative_inventory||[])].map(x=>({id:x.id,status:x.status})).sort((x,y)=>x.id.localeCompare(y.id));
eq('negative_inventory',gotNegative,[...a.negative].sort((x,y)=>x.id.localeCompare(y.id)));
eq('authority_can_promote_now',report.authority_promotion?.can_promote_now,a.expected.authority_can_promote_now);

for(const k of ['multiple_vs_unique_immediate_completion','race_free_vs_temporal_ndc','representation_result_vs_rejected_implementation','deductive_theorem_vs_empirical_qualification','source_native_vs_rendering_uncertainty']){
  if(typeof report.critical_distinctions?.[k]!=='string'||report.critical_distinctions[k].trim().length<20) errors.push('missing substantive critical distinction '+k);
}
if(typeof report.qu_bridge_assessment?.incomplete_scope_usage_sound!=='boolean') errors.push('missing QU soundness judgment');
if(typeof report.qu_bridge_assessment?.claims_complete_realization_universe!=='boolean') errors.push('missing QU realization-universe judgment');
for(const k of ['material_omissions','material_strengthenings','material_weakenings']) if(!Array.isArray(report[k])) errors.push(k+' must be array');

const score={schema:1,mechanical_disposition:errors.length?'FAIL':'PASS',semantic_disposition:report.disposition??null,error_count:errors.length,errors};
fs.writeFileSync(base+'/SCORE.json',JSON.stringify(score,null,2)+'\n');
console.log(JSON.stringify(score,null,2));
if(errors.length) process.exit(1);
