import fs from 'node:fs';
const base='out/isograph-1-1-cold';
const r=JSON.parse(fs.readFileSync(base+'/PARSED_REPORT.json','utf8'));
const a=JSON.parse(fs.readFileSync('research/isograph/successor/qualification/COLD_ASSERTIONS_1_1.json','utf8'));
const errors=[];
function eq(label,x,y){if(JSON.stringify(x)!==JSON.stringify(y))errors.push(label+': expected '+JSON.stringify(y)+' got '+JSON.stringify(x));}
eq('source_revision',r.source_revision,a.frozen_source_revision);
eq('authority_state',r.authority_state,'SUCCESSOR_CANDIDATE');
eq('existing_authority',r.existing_authority,'1.0');
for(const [k,v] of Object.entries(a.expected)){
  if(k==='canonical_research_owner'||k==='solver_branches_own_research'||k==='authority_can_promote_now') continue;
  const map={corpus_objects:'corpus_objects',native_images:'native_images',content_addressed_only:'content_addressed_only',semantic_items:'semantic_items',dependency_edges:'dependency_edges',missing_dependency_targets:'missing_dependency_targets'};
  if(map[k]) eq('corpus_counts.'+k,r.corpus_counts?.[map[k]],v);
}
eq('role_counts',r.role_counts,a.role_counts);
eq('canonical_owner',r.research_ownership?.canonical_owner,a.expected.canonical_research_owner);
eq('solver_branches_own_research',r.research_ownership?.solver_branches_own_research,a.expected.solver_branches_own_research);

const gotClaims=[...(r.claim_inventory||[])].map(x=>({id:x.id,status:x.status,guard_count:x.guard_count,relation_count:x.relation_count,source_count:x.source_count,scope_present:x.scope_present})).sort((x,y)=>x.id.localeCompare(y.id));
eq('claim_inventory',gotClaims,a.claims);
const gotU=[...(r.canonical_unresolved_claims||[])].map(x=>({id:x.id,status:x.status})).sort((x,y)=>x.id.localeCompare(y.id));
eq('canonical_unresolved_claims',gotU,a.unresolved_claims.map(x=>({id:x.id,status:x.status})).sort((x,y)=>x.id.localeCompare(y.id)));
const gotN=[...(r.negative_claims||[])].map(x=>({id:x.id,status:x.status})).sort((x,y)=>x.id.localeCompare(y.id));
eq('negative_claims',gotN,a.negative_claims.map(x=>({id:x.id,status:x.status})).sort((x,y)=>x.id.localeCompare(y.id)));

eq('uncertainty.inherited',r.uncertainty?.inherited_incomplete_scope,a.expected.inherited_incomplete_scope);
eq('uncertainty.added',r.uncertainty?.added_incomplete_scope,a.expected.added_incomplete_scope);
eq('uncertainty.total',r.uncertainty?.total_incomplete_scope,a.expected.total_incomplete_scope);
eq('uncertainty.rendering',r.uncertainty?.rendering_created_uncertainty,a.expected.rendering_created_uncertainty);

for(const k of ['root_policy_present','research_index_present','evidence_policy_present','evidence_independence_requirement_present','experiment_policy_present','provenance_policy_present','untriaged_policy_present','state_identity_unification_present']){
  eq('omission_controls.'+k,r.omission_controls?.[k],true);
}
eq('R0044',r.evidence_lineage?.['C4-R0044']&&{
  citation_occurrences:r.evidence_lineage['C4-R0044'].citation_occurrences,
  distinct_artifacts:r.evidence_lineage['C4-R0044'].distinct_artifacts,
  independently_countable_lineages:r.evidence_lineage['C4-R0044'].independently_countable_lineages
},a.evidence_lineage_controls['C4-R0044']);
eq('R0045.lineage_count',r.evidence_lineage?.['C4-R0045']?.lineage_count,2);
eq('R0045.independence',r.evidence_lineage?.['C4-R0045']?.cross_lineage_independence,'UNKNOWN');
eq('R0037_R0038.shared',r.evidence_lineage?.['C4-R0037_R0038']?.shared_independence_group,true);
eq('R0074.events',r.evidence_lineage?.['C4-R0074']?.event_count,2);
eq('R0074.reproduction',r.evidence_lineage?.['C4-R0074']?.reproduction_relation,true);
eq('R0074.lineages',r.evidence_lineage?.['C4-R0074']?.independently_countable_lineages,1);
eq('deductive_independence_not_applicable',[...(r.evidence_lineage?.deductive_independence_not_applicable||[])].sort(),[...a.evidence_lineage_controls.deductive_independence_not_applicable].sort());
eq('authority_can_promote_now',r.authority_promotion?.can_promote_now,a.expected.authority_can_promote_now);
for(const k of ['material_omissions','material_strengthenings','material_weakenings','evidence_double_counting_risks']) if(!Array.isArray(r[k])) errors.push(k+' must be an array');
if(typeof r.semantic_candidate_qualifies!=='boolean') errors.push('semantic_candidate_qualifies must be boolean');

const score={schema:1,mechanical_disposition:errors.length?'FAIL':'PASS',semantic_disposition:r.disposition??null,semantic_candidate_qualifies:r.semantic_candidate_qualifies??null,error_count:errors.length,errors};
fs.writeFileSync(base+'/SCORE.json',JSON.stringify(score,null,2)+'\n');
console.log(JSON.stringify(score,null,2));
if(errors.length) process.exit(1);
