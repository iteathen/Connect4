import fs from 'node:fs';
import assert from 'node:assert/strict';

const input=JSON.parse(fs.readFileSync(new URL('./CARRIER_AUDIT_INPUT_0_1.json',import.meta.url),'utf8'));

function graphAudit(c){
  const ids=[...c.binaryGroupIds],edges=c.edges.map(e=>({...e}));
  assert.equal(new Set(edges.map(e=>e.id)).size,edges.length);
  assert.ok(edges.every(e=>e.delta===0||e.delta===1));
  assert.ok(edges.every(e=>e.targetRank===e.parentRank+1));

  const active=new Set(edges.flatMap(e=>[e.from,e.to])),
    adj=new Map([...active].map(id=>[id,[]])),
    out=new Map(ids.map(id=>[id,[]])),
    rank=new Map();
  for(const e of edges){
    adj.get(e.from).push({to:e.to,delta:e.delta,id:e.id});
    adj.get(e.to).push({to:e.from,delta:e.delta,id:e.id});
    out.get(e.from).push(e);
    if(rank.has(e.from))assert.equal(rank.get(e.from),e.parentRank);else rank.set(e.from,e.parentRank);
    if(rank.has(e.to))assert.equal(rank.get(e.to),e.targetRank);else rank.set(e.to,e.targetRank);
  }
  for(const xs of out.values())xs.sort((a,b)=>a.to-b.to||a.delta-b.delta||a.id-b.id);

  let components=0;const seen=new Set();
  for(const s of active)if(!seen.has(s)){
    components++;const stack=[s];seen.add(s);
    while(stack.length){const u=stack.pop();for(const z of adj.get(u))if(!seen.has(z.to)){seen.add(z.to);stack.push(z.to);}}
  }
  const cycleRank=edges.length-active.size+components;

  function exactness(edgeRows){
    const phi=new Map(),conflicts=[];
    for(const s of active)if(!phi.has(s)){
      phi.set(s,0);const q=[s];
      for(let i=0;i<q.length;i++){
        const u=q[i],pu=phi.get(u);
        for(const z of adj.get(u)){
          const expected=pu^z.delta;
          if(!phi.has(z.to)){phi.set(z.to,expected);q.push(z.to);}
          else if(phi.get(z.to)!==expected)conflicts.push(z.id);
        }
      }
    }
    return {exact:conflicts.length===0,conflictEdgeIds:[...new Set(conflicts)].sort((a,b)=>a-b),potentialSize:phi.size};
  }
  const exact=exactness(edges);

  function basis(rows){
    const parent=new Map(ids.map(x=>[x,x])),parity=new Map(ids.map(x=>[x,0])),size=new Map(ids.map(x=>[x,1]));
    function find(x){
      const p=parent.get(x);if(p===x)return [x,0];
      const [r,q]=find(p),z=parity.get(x)^q;parent.set(x,r);parity.set(x,z);return [r,z];
    }
    let zero=0,nonzero=0,closures=0;
    for(const e of rows){
      let [ra,pa]=find(e.from),[rb,pb]=find(e.to);
      if(ra===rb){const s=pa^pb^e.delta;closures++;if(s)nonzero++;else zero++;continue;}
      const bridge=pa^pb^e.delta;
      if(size.get(ra)<size.get(rb)){parent.set(ra,rb);parity.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));}
      else{parent.set(rb,ra);parity.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));}
    }
    assert.equal(closures,cycleRank);
    return {zero,nonzero,closures};
  }
  const orders={
    source:[...edges],
    reverse:[...edges].reverse(),
    fromTo:[...edges].sort((a,b)=>a.from-b.from||a.to-b.to||a.delta-b.delta||a.id-b.id),
    toFrom:[...edges].sort((a,b)=>a.to-b.to||a.from-b.from||a.delta-b.delta||a.id-b.id),
    delta0First:[...edges].sort((a,b)=>a.delta-b.delta||a.from-b.from||a.to-b.to||a.id-b.id),
    delta1First:[...edges].sort((a,b)=>b.delta-a.delta||a.from-b.from||a.to-b.to||a.id-b.id),
    column:[...edges].sort((a,b)=>a.column-b.column||a.from-b.from||a.to-b.to||a.id-b.id),
  };
  const basisByOrder=Object.fromEntries(Object.entries(orders).map(([k,v])=>[k,basis(v)]));
  const basisNonzeroValues=[...new Set(Object.values(basisByOrder).map(x=>x.nonzero))].sort((a,b)=>a-b);

  const ordered=[...active].sort((a,b)=>(rank.get(a)??999)-(rank.get(b)??999)||a-b);
  let reconvergentPairs=0,contradictoryPairs=0;
  let minimum=null,minimumCount=0;
  for(const source of ordered){
    const states=new Map([[source,{count:[1,0],dist:[0,Infinity],prev:[null,null]}]]);
    for(const u of ordered){
      const cur=states.get(u);if(!cur)continue;
      for(const e of out.get(u)??[]){
        let t=states.get(e.to);
        if(!t){t={count:[0,0],dist:[Infinity,Infinity],prev:[null,null]};states.set(e.to,t);}
        for(let p=0;p<2;p++)if(cur.count[p]){
          const np=p^e.delta;
          t.count[np]=Math.min(2,t.count[np]+cur.count[p]);
          const nd=cur.dist[p]+1;
          if(nd<t.dist[np]){t.dist[np]=nd;t.prev[np]={u,p,e};}
        }
      }
    }
    for(const [target,row] of states){
      if(target===source)continue;
      if(row.count[0]+row.count[1]>1)reconvergentPairs++;
      if(!(row.count[0]&&row.count[1]))continue;
      contradictoryPairs++;
      const score=[row.dist[0]+row.dist[1],Math.max(row.dist[0],row.dist[1])];
      function trace(p){const es=[];let u=target,q=p;while(u!==source){const z=states.get(u).prev[q];assert.ok(z);es.push(z.e.id);u=z.u;q=z.p;}return es.reverse();}
      const candidate={source,target,distances:[...row.dist],score,paths:[trace(0),trace(1)]};
      const better=!minimum||score[0]<minimum.score[0]||(score[0]===minimum.score[0]&&score[1]<minimum.score[1])||
        (score[0]===minimum.score[0]&&score[1]===minimum.score[1]&&(source<minimum.source||(source===minimum.source&&target<minimum.target)));
      if(better){minimum=candidate;minimumCount=1;}
      else if(minimum&&score[0]===minimum.score[0]&&score[1]===minimum.score[1])minimumCount++;
    }
  }

  const gaugeEdges=edges.map(e=>({...e,delta:e.delta^(e.from&1)^(e.to&1)}));
  const gaugeBasis=basis(gaugeEdges),gaugeExact=(()=>{
    const original=new Map(edges.map(e=>[e.id,e.delta]));for(const e of gaugeEdges)original.set(e.id,e.delta);
    const parent=new Map(ids.map(x=>[x,x])),parity=new Map(ids.map(x=>[x,0])),size=new Map(ids.map(x=>[x,1]));
    function find(x){const p=parent.get(x);if(p===x)return [x,0];const [r,q]=find(p),z=parity.get(x)^q;parent.set(x,r);parity.set(x,z);return [r,z];}
    let conflict=false;for(const e of gaugeEdges){let [ra,pa]=find(e.from),[rb,pb]=find(e.to);if(ra===rb){if(pa^pb^e.delta)conflict=true;continue;}const bridge=pa^pb^e.delta;if(size.get(ra)<size.get(rb)){parent.set(ra,rb);parity.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));}else{parent.set(rb,ra);parity.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));}}
    return !conflict;
  })();

  return {
    label:c.label,
    sourceSummary:c.summary_from_source,
    independent:{
      nodesTotal:ids.length,activeNodes:active.size,edges:edges.length,activeComponents:components,cycleRank,
      exactPotentialExists:exact.exact,conflictEdgeIds:exact.conflictEdgeIds,
      scalarCycleFunctionalImageRank:exact.exact?0:1,
      reconvergentPairs,contradictoryPairs,
      minimumContradiction:minimum,minimumScoreMultiplicity:minimumCount,
      basisByOrder,basisNonzeroValues,basisCountVariesAcrossTestedOrders:basisNonzeroValues.length>1,
      gaugeCheck:{exactPotentialExists:gaugeExact,basisSource:gaugeBasis,
        exactnessInvariant:gaugeExact===exact.exact,
        sourceBasisSyndromeCountsInvariant:gaugeBasis.nonzero===basisByOrder.source.nonzero&&gaugeBasis.zero===basisByOrder.source.zero},
    },
    comparisons:{
      cycleRankMatches:cycleRank===c.summary_from_source.cycleRank,
      sourceOrderBasisMatches: basisByOrder.source.zero===c.summary_from_source.zeroCycleSyndromes&&basisByOrder.source.nonzero===c.summary_from_source.nonzeroCycleSyndromes,
      contradictionCountMatches:contradictoryPairs===c.summary_from_source.contradictoryReconvergences,
      integrabilityMatches:exact.exact===c.summary_from_source.globalPhasePotentialExists,
    }
  };
}

const cases=input.cases.map(graphAudit);
const out={
  schema:'connect4.isomax.foundational_prior_audit.carrier.v1',
  date_author_local:'2026-09-29',
  method:{
    rawCarrier:'existing producer edge list only',
    independentChecks:[
      'undirected component/cycle-rank reconstruction',
      'potential-consistency constraint solve',
      'union-find parity fundamental-cycle audit under seven deterministic edge orders',
      'rank-DAG parity reachability / contradictory source-target enumeration',
      'minimum opposite-parity path-pair search',
      'node-gauge flip invariance'
    ]
  },
  cases,
  labelConsequences:{
    fundamentalNonzeroCount:cases.some(x=>x.independent.basisCountVariesAcrossTestedOrders)?
      'BASIS_DEPENDENT_DIAGNOSTIC__DO_NOT_TREAT_AS_INTRINSIC_MAGNITUDE':
      'NO_VARIATION_SEEN_IN_TESTED_ORDERS__STILL_DEFINED_RELATIVE_TO_CHOSEN_FUNDAMENTAL_BASIS',
    obstructed:'INTRINSIC_TO_DECLARED_EDGE_COCYCLE_IFF_NO_GLOBAL_Z2_POTENTIAL',
    cycleRank:'GRAPH_INVARIANT_OF_DECLARED_ACTIVE_CARRIER',
    contradictoryReconvergenceCount:'DIRECTED_DECLARED_CARRIER_PROPERTY',
    scalarObstructionDimension:'for a single Z2-valued edge cochain, the image on cycle space has dimension 0 if exact and 1 if non-exact; counts of nonzero basis cycles are not obstruction dimension'
  }
};
assert.ok(cases.every(x=>Object.values(x.comparisons).every(Boolean)));
fs.writeFileSync(new URL('./CARRIER_PRIOR_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'CARRIER_PRIOR_AUDIT_COMPLETE',cases:cases.map(x=>({label:x.label,independent:x.independent,comparisons:x.comparisons})),labels:out.labelConsequences},null,2));
