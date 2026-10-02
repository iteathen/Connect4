const freeze=x=>Object.freeze(x);

export const DISPOSITIONS=freeze({
  ROUTABLE:'THEOREM_FAMILY_ROUTABLE',
  MISSING:'THEOREM_FAMILY_ADAPTER_MISSING',
  EXACT_ONLY:'EXACT_STATE_ONLY',
  REJECTED:'OBSOLETE_OR_REJECTED',
  SUPERSEDED:'SUPERSEDED_BY_ROUTABLE',
  CANDIDATE:'CANDIDATE_NOT_QUALIFIED',
});

const q=(id,name,sourceFiles,adapter,extra={})=>freeze({
  id,name,qualification:'QUALIFIED_REUSABLE',
  disposition:DISPOSITIONS.ROUTABLE,
  sourceFiles:freeze(sourceFiles),
  adapter:freeze(adapter),
  ...extra,
});
const s=(id,name,sourceFiles,replacement,extra={})=>freeze({
  id,name,qualification:'QUALIFIED_REUSABLE',
  disposition:DISPOSITIONS.SUPERSEDED,
  sourceFiles:freeze(sourceFiles),
  replacement,
  ...extra,
});
const exact=(id,name,sourceFiles,extra={})=>freeze({
  id,name,qualification:'QUALIFIED_EXACT',
  disposition:DISPOSITIONS.EXACT_ONLY,
  sourceFiles:freeze(sourceFiles),
  adapter:freeze({kind:'EXACT_Q_HANDOFF',exactStateIdentityRequired:true}),
  ...extra,
});
const rejected=(id,name,sourceFiles,extra={})=>freeze({
  id,name,qualification:'REJECTED',
  disposition:DISPOSITIONS.REJECTED,
  sourceFiles:freeze(sourceFiles),
  ...extra,
});
const candidate=(id,name,sourceFiles,extra={})=>freeze({
  id,name,qualification:'CANDIDATE',
  disposition:DISPOSITIONS.CANDIDATE,
  sourceFiles:freeze(sourceFiles),
  ...extra,
});

export const RLC_PROOF_LIBRARY_FAMILIES=freeze([
  q('IMMEDIATE_TERMINAL','Immediate exact terminal',
    ['JSMinSys:addons/cpc-connect4.mjs'],
    {kind:'NATIVE_CPC_TERMINAL'}),

  q('FORCED_RESPONSE_FORK','Forced completion / singleton / fork upper certificates',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RANK_LOCAL_FORCED_COMPLETION_UPPER_BOUND_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RANK_LOCAL_FORCED_SINGLETON_LIFT_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_FORCED_COMPLETION_UPPER_ENVELOPE_THEOREM.md',
  ],{kind:'FORCED_COMPLETION_GRAMMAR'}),

  q('REPAIR_CAPACITY','Adaptive repair-capacity induction',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs',
    'docs/research/2026-09-13-repair-capacity-predecessor-induction.md',
  ],{kind:'LEGACY_TARGET_ENGINE',engine:'REPAIR_CAPACITY'}),

  q('LEGACY_TARGET_LAMBDA','Generic target-distance / mu predecessor',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-distance-mu-proof-lib.mjs',
  ],{kind:'LEGACY_TARGET_ENGINE',engine:'LAMBDA'}),

  q('LEGACY_TARGET_THETA','Generic target + auxiliary lexicographic predecessor',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-generic-target-aux-lex-proof-lib.mjs',
  ],{kind:'LEGACY_TARGET_ENGINE',engine:'THETA'}),

  q('DISTANCE2_TARGET_SUPPORT','Distance-2 target-support re-entry',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-distance2-target-support-proof-lib.mjs',
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs',
  ],{kind:'LEGACY_TARGET_ENGINE',engine:'DISTANCE2_TARGET_SUPPORT'}),

  q('DISTANCE1_RESOLVED_TAIL_CAPACITY','Distance-1 resolved-tail capacity',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-proof-lib.mjs',
  ],{kind:'LEGACY_TARGET_ENGINE',engine:'DISTANCE1_RESOLVED_TAIL_CAPACITY'}),

  q('TRUNCATED_TARGET_RESERVOIR','Truncated target-reservoir pairing',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_0_1.json',
  ],{kind:'RCIC_TARGET_RESERVOIR'}),

  q('RLC_RCIC','Controlled-invariant / ranked controlled-invariant calculus',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RLC_RANKED_CONTROLLED_INVARIANT_INSTANTIATION_AUDIT_0_1.json',
  ],{kind:'RCIC_COMBINATOR'}),

  q('CPC_GUARD_SURVIVAL','CPC constructive guard-survival proof kernel',[
    'JSMinSys:addons/cpc-connect4-guard-survival.mjs',
    'JSMinSys:docs/cpc-guard-survival-nees.md',
  ],{
    kind:'JSMINSYS_GUARD_SURVIVAL',
    requiredInputs:['exact_rba_q','odd_defender_guard_mask','odd_horizon'],
    note:'Guard side-state is a proof resource. If it is not reconstructible by a qualified current-state theorem, the adapter reports the missing guard rather than guessing it.',
  }),

  q('RESPONSE_MATROID_CIRCUIT','Response-matroid circuit / defect transfer',[
    'docs/research/2026-09-13-response-matroid-defect-transfer.md',
    'docs/research/evidence/2026-09-13-response-matroid-control.json',
  ],{kind:'RESPONSE_MATROID_COMBINATOR',export:'responseMatroidAudit'}),

  q('COMPATIBLE_COVER_PROGRESS','Compatible-cover + well-founded progress calculus',[
    'docs/research/2026-09-13-compatible-cover-progress-calculus.md',
  ],{
    kind:'COMPATIBLE_COVER_PROGRESS_COMBINATOR',
    export:'compatibleCoverProgressAudit',
    requiredInputs:['qualified_fragments','requirements','compatibility','decreasing_rank'],
  }),

  q('CHOICE_ELIMINATION','Choice-elimination predecessor calculus',[
    'docs/research/2026-09-13-choice-elimination-predecessor-calculus.md',
  ],{kind:'CHOICE_ELIMINATION_COMBINATOR',export:'choiceElimination'}),

  q('WDL_INTERVAL_PREDECESSOR','W/D/L interval predecessor calculus',[
    'docs/research/2026-09-13-wdl-interval-predecessor-calculus.md',
  ],{kind:'INTERVAL_PREDECESSOR_COMBINATOR',export:'predecessorInterval'}),

  q('POST_RESPONSE_PREDECESSOR_TRANSPORT','Exact post-response / controllable-predecessor transport',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RANK_LOCAL_POST_RESPONSE_TRANSPORT_THEOREM.md',
  ],{kind:'EXACT_TRANSPORT_COMBINATOR'}),

  q('RECURSIVE_CONSEQUENCE_Q_CONVERGENCE','Exact semantic-q consequence convergence',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_SAME_PLAYER_COMMUTATION_THEOREM.md',
  ],{kind:'EXACT_Q_EQUIVALENCE',exactStateIdentityRequired:true}),

  s('BX_FINITE_RESERVOIR','Bx viability + finite c7 reservoir',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_BX_VIABILITY_FINITE_RESERVOIR_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_BX_VIABILITY_FINITE_RESERVOIR_0_1.json',
  ],'RLC_RCIC',{subroute:'BX_VIABILITY_FINITE_RESERVOIR'}),

  s('THREE_COLUMN_PHASE_TRANSFER','Exact three-column phase-transfer win family',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json',
  ],'RLC_RCIC',{subroute:'THREE_COLUMN_PHASE_TRANSFER'}),

  q('THREE_PLUS_ONE_DEFERRED_SINGLETON_TAIL_DRAW','3+1 deferred-singleton tail exact-draw theorem',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/rlc-3plus1-deferred-singleton-tail-adapter.mjs',
  ],{
    kind:'EXACT_STRUCTURAL_INTERVAL',
    export:'classifyThreePlusOneDeferredSingletonTail',
    interval:[0,0],
    exactStateIdentityRequired:true,
  }),

  s('TRIGGER5_FORCED_COMPRESSION','Trigger-5 forced compression progress edge',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TRIGGER5_FORCED_COMPRESSION_LEMMA.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TRIGGER5_FORCED_COMPRESSION_0_1.json',
  ],'RLC_RCIC',{subroute:'FORCED_COMPRESSION_PROGRESS_EDGE'}),

  s('PAIR_STAR_HUB_LADDER','Pair-star hub-ladder progress theorem',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_PAIR_STAR_HUB_LADDER_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_PAIR_STAR_FRESH_QUALIFICATION_0_1.json',
  ],'RLC_RCIC',{subroute:'PAIR_STAR_PROGRESS'}),

  s('RANK_LOCAL_BOUNDED_RESPONSE_HORIZON','Bounded synchronized-response survival horizon',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/RANK_LOCAL_BOUNDED_RESPONSE_HORIZON_THEOREM.md',
  ],'RLC_RCIC',{subroute:'CIC_SURVIVAL'}),

  s('FORCED_SINGLETON_UPPER_GRAMMAR','Finite forced-singleton upper grammar closure',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/FORCED_SINGLETON_UPPER_GRAMMAR_CLOSURE_BOUNDARY.md',
  ],'FORCED_RESPONSE_FORK'),

  s('ATTACKER_COMPLETION_PROOF_CLASS','Attacker forced-completion proof-class automaton',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_ATTACKER_COMPLETION_PROOF_CLASS_THEOREM.md',
  ],'FORCED_RESPONSE_FORK'),

  s('ONE_SWITCH_SURVIVAL','One-switch synchronized-response survival',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_ONE_SWITCH_SURVIVAL_THEOREM.md',
  ],'RLC_RCIC',{subroute:'CIC_SURVIVAL'}),

  s('TWO_SWITCH_SURVIVAL','Two-switch synchronized-response survival',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TWO_SWITCH_SURVIVAL_THEOREM.md',
  ],'RLC_RCIC',{subroute:'CIC_SURVIVAL'}),

  exact('LATENT_CONTRACT_FIXED_FAMILY','Fixed latent-contract root/family closures',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-c1-full-closure.mjs',
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-contract-backward-composition.mjs',
  ],{
    boundary:'Fixed latent state/family only. Generic repair tails are routed through REPAIR_CAPACITY/LAMBDA/THETA rather than generalized from the locator.',
  }),

  exact('RANK_SPECIFIC_ROUTED_COMPOSITIONS','Qualified rank-specific exact-q compositions',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_RANK24_REPLY3_SINGLETON_HANDOFF_COMPOSITION_THEOREM.md',
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_RANK24_ZUGZWANG_WIN_COMPOSITION_THEOREM.md',
  ],{
    boundary:'Only exact qualified semantic-q roots are eligible for handoff unless a separate generic theorem is cited.',
  }),

  candidate('RESIDUAL_ANTICHAIN_DOMINANCE','Recursive residual-dominance preorder / antichain boundary',[
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-recursive-dominance.mjs',
    'research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-4665655-proof-frontier-antichain.mjs',
  ],{
    boundary:'The live recursive-dominance source explicitly labels itself a bounded structural simulation test and says zero violations would not establish the theorem.',
  }),

  candidate('CURRENT_STATE_GUARD_RECONSTRUCTION','Current-state guard-set reconstruction theorem candidate',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_CURRENT_STATE_GUARD_SET_RECONSTRUCTION_THEOREM.md',
  ]),

  candidate('FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE','Frontier-residual attachment response theorem candidate',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_FRONTIER_RESIDUAL_ATTACHMENT_RESPONSE_THEOREM.md',
  ]),

  candidate('HORIZONTAL_RESIDUAL_LADDER_TRANSPORT','Horizontal residual-ladder transport theorem candidate',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_HORIZONTAL_RESIDUAL_LADDER_TRANSPORT_THEOREM.md',
  ]),

  rejected('THREE_COORDINATE_DECODER_REJECTED','Direct (Bx,By,Bxy) semantic decoder',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_FORMULA_THREE_COORDINATE_LOCAL_DECODER_THEOREM.md',
  ]),

  rejected('PAIR_STAR_VALUE_PROGRESS_REJECTED','Pair-star scalar value-progress claim',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_PAIR_STAR_VALUE_PROGRESS_REJECTION.md',
  ]),

  rejected('RANK25_C6_HANDOFF_REJECTED','Rank-25 c6 obstruction handoff candidate',[
    'research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_RANK25_REPLY7_C6_OBSTRUCTION_HANDOFF_THEOREM.md',
  ]),
]);

function keyOf(x){return typeof x==='string'?x:JSON.stringify(x);}

export function responseMatroidAudit(obligations,responseSets){
  if(!Array.isArray(obligations)||!(responseSets instanceof Map))throw new TypeError('response matroid requires obligations and responseSets Map');
  const match=new Map();
  const seen=new Set();
  function augment(ob){
    for(const r of responseSets.get(ob)??[]){
      const k=keyOf(r);if(seen.has(k))continue;seen.add(k);
      if(!match.has(k)||augment(match.get(k))){match.set(k,ob);return true;}
    }
    return false;
  }
  let rank=0;
  for(const ob of obligations){seen.clear();if(augment(ob))rank++;}
  return freeze({obligationCount:obligations.length,rank,deficiency:obligations.length-rank,overloaded:rank<obligations.length});
}

export function compatibleCoverProgressAudit({requirements,fragments,compatible,decreases}){
  if(!Array.isArray(requirements)||!Array.isArray(fragments))throw new TypeError('cover audit requires arrays');
  const req=new Set(requirements.map(keyOf));
  const chosen=[];
  const covered=new Set();
  for(const f of fragments){
    if(chosen.some(g=>compatible&&!compatible(g,f)))continue;
    const newly=(f.solves??[]).map(keyOf).filter(x=>req.has(x)&&!covered.has(x));
    if(!newly.length)continue;
    chosen.push(f);for(const x of newly)covered.add(x);
  }
  const coverComplete=covered.size===req.size;
  const progress=coverComplete&&chosen.every(f=>decreases?decreases(f):f.decreases===true);
  return freeze({coverComplete,progress,proved:coverComplete&&progress,chosen:freeze(chosen.map(f=>f.id??null)),coveredCount:covered.size,requirementCount:req.size});
}

export function choiceElimination(actions,nonWinningActions){
  const eliminated=new Set(nonWinningActions);
  return freeze(actions.filter(a=>!eliminated.has(a)));
}

export function predecessorInterval(player,childIntervals){
  if(player!==0&&player!==1)throw new RangeError('player must be 0 or 1');
  if(!Array.isArray(childIntervals)||childIntervals.length===0)throw new RangeError('child intervals required');
  for(const x of childIntervals){
    if(!Array.isArray(x)||x.length!==2||x[0]>x[1]||x[0]<-1||x[1]>1)throw new RangeError('invalid WDL interval');
  }
  const fn=player===0?Math.max:Math.min;
  return freeze([
    fn(...childIntervals.map(x=>x[0])),
    fn(...childIntervals.map(x=>x[1])),
  ]);
}

export function auditCatalog(){
  const byId=new Map(RLC_PROOF_LIBRARY_FAMILIES.map(x=>[x.id,x]));
  const invalidSupersessions=[];
  for(const f of RLC_PROOF_LIBRARY_FAMILIES){
    if(f.disposition!==DISPOSITIONS.SUPERSEDED)continue;
    const r=byId.get(f.replacement);
    if(!r||(r.disposition!==DISPOSITIONS.ROUTABLE&&r.disposition!==DISPOSITIONS.SUPERSEDED)){
      invalidSupersessions.push({id:f.id,replacement:f.replacement});
    }
  }
  const missing=RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.MISSING);
  return freeze({
    unclassifiedCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>!Object.values(DISPOSITIONS).includes(x.disposition)).length,
    adapterMissingCount:missing.length,
    adapterMissingIds:freeze(missing.map(x=>x.id)),
    invalidSupersessionCount:invalidSupersessions.length,
    invalidSupersessions:freeze(invalidSupersessions),
    routableFamilyCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.ROUTABLE).length,
    supersededFamilyCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.SUPERSEDED).length,
    exactStateOnlyCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.EXACT_ONLY).length,
    rejectedCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.REJECTED).length,
    candidateCount:RLC_PROOF_LIBRARY_FAMILIES.filter(x=>x.disposition===DISPOSITIONS.CANDIDATE).length,
  });
}
