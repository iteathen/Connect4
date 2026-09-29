import fs from 'node:fs';

const here=new URL('.',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('./AGGREGATE_WITNESS_DATA_0_1.json',here),'utf8'));

const R={
  CASE:5899000,
  ATOM:5899001,
  BINARY_GROUP:5899200,
  RAW_EDGE:5899201,
  REDUCED_EDGE:5899202,
  EDGE_FIRST:5899203,
  EDGE_NEXT:5899204,
  EDGE_LAST:5899205,
  CYCLE_CLOSURE:5899206,
  CONTRADICTORY_PAIR:5899207,
  SPLIT_FIBER:5899210,
  PURE_DISTINCT_FIBER:5899211,
  PARITY_DEFINED_FIBER:5899212,
  DEEPER_BINARY_GROUP:5899220,
  PROP_BINARY:5899221,
  PROP_NONBINARY:5899222,
  PROP_TRANSPORTER:5899223,
  PROP_ERASURE:5899224,
  PROP_TERMINAL:5899225,
  DIRECT_STATE:5899230,
  DIRECT_CLASS:5899231,
  DIRECT_STATE_CLASS:5899232,
  RESPONSE_VECTOR:5899240,
  RESPONSE_BIT:5899241,
  RESPONSE_DEP:5899242,
  RESPONSE_BASIS:5899243,
  RESPONSE_BASIS_BIT:5899244,
  RESPONSE_AUG_BASIS:5899245,
  RESPONSE_AUG_BASIS_BIT:5899246,
  RESPONSE_UNMATCHED_BIT:5899247,
  PARTIAL_DELTA:5899250,
  PARTIAL_OPTIMAL:5899251,
  PARTIAL_LEGAL:5899252,
  PARTIAL_DELTA_BIT:5899253,
  PARTIAL_OPT_BASIS:5899254,
  PARTIAL_OPT_BASIS_BIT:5899255,
  PARTIAL_LEGAL_BASIS:5899256,
  PARTIAL_LEGAL_BASIS_BIT:5899257,
};
const CASE={'4x4-c4':5899100,'4x5-c4':5899101,'5x4-c4':5899102,response:5899103,partial2:5899104};
const BIT0=196900,BIT1=196901;

const raw=new Set([...Object.values(CASE)]);
const tuples=[];
const t=(rel,...args)=>tuples.push([rel,...args]);
for(const c of Object.values(CASE))t(R.CASE,c);

const phaseEntries=[
  ['4x4-c4',data.phase.phase4x4,0],
  ['4x5-c4',data.phase.phase4x5,1],
  ['5x4-c4',data.phase.phase5x4,2],
];

function groupTok(ci,id){const x=6100000+ci*10000+id;raw.add(x);return x;}
function edgeTok(ci,id){const x=6200000+ci*10000+id;raw.add(x);return x;}
function fiberTok(ci,id){const x=6300000+ci*10000+id;raw.add(x);return x;}
function propTok(ci,id){const x=6400000+ci*100000+id;raw.add(x);return x;}
function pairTok(ci,id){const x=6450000+ci*10000+id;raw.add(x);return x;}

function cycleClosures(groupIds,edges){
  const parent=new Map(groupIds.map(id=>[id,id]));
  const phase=new Map(groupIds.map(id=>[id,0]));
  const size=new Map(groupIds.map(id=>[id,1]));
  function find(id){
    const p=parent.get(id);
    if(p===id)return [id,0];
    const [root,up]=find(p),par=phase.get(id)^up;
    parent.set(id,root);phase.set(id,par);
    return [root,par];
  }
  const out=[];
  for(const edge of edges){
    let [ra,pa]=find(edge.from),[rb,pb]=find(edge.to);
    if(ra===rb){
      out.push({edgeId:edge.id,syndrome:pa^pb^edge.delta});
      continue;
    }
    const bridge=pa^pb^edge.delta;
    if(size.get(ra)<size.get(rb)){
      parent.set(ra,rb);phase.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));
    }else{
      parent.set(rb,ra);phase.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));
    }
  }
  return out;
}

function contradictoryPairs(groupIds,edges){
  const outgoing=new Map(groupIds.map(id=>[id,[]]));
  const rank=new Map();
  for(const e of edges){
    outgoing.get(e.from).push(e);
    rank.set(e.from,e.parentRank);rank.set(e.to,e.targetRank);
  }
  for(const xs of outgoing.values())xs.sort((a,b)=>a.to-b.to||a.delta-b.delta||a.id-b.id);
  const ordered=[...groupIds].sort((a,b)=>(rank.get(a)??0)-(rank.get(b)??0)||a-b);
  const out=[];
  for(const source of ordered){
    const stats=new Map([[source,[true,false]]]);
    for(const node of ordered){
      const cur=stats.get(node); if(!cur)continue;
      for(const e of outgoing.get(node)){
        let nxt=stats.get(e.to); if(!nxt){nxt=[false,false];stats.set(e.to,nxt);}
        if(cur[0])nxt[e.delta]=true;
        if(cur[1])nxt[1^e.delta]=true;
      }
    }
    for(const [target,bits] of stats)
      if(target!==source&&bits[0]&&bits[1])out.push({source,target});
  }
  return out;
}

for(const [label,row,ci] of phaseEntries){
  const c=CASE[label],w=row.witness,bp=w.binaryPhase;
  for(const id of bp.binaryGroupIds){
    const g=groupTok(ci,id);
    t(R.BINARY_GROUP,c,g);
    t(R.DEEPER_BINARY_GROUP,c,g);
  }
  for(const e of bp.binaryInheritanceEdges){
    const et=edgeTok(ci,e.id),from=groupTok(ci,e.from),to=groupTok(ci,e.to);
    t(R.RAW_EDGE,c,et,from,to,e.delta?BIT1:BIT0,e.column);
  }
  const reduced=bp.reducedEdges;
  for(let i=0;i<reduced.length;i++){
    const e=reduced[i],et=edgeTok(ci,e.id);
    t(R.REDUCED_EDGE,c,et,groupTok(ci,e.from),groupTok(ci,e.to),e.delta?BIT1:BIT0,e.column);
    if(i===0)t(R.EDGE_FIRST,c,et);
    if(i+1<reduced.length)t(R.EDGE_NEXT,c,et,edgeTok(ci,reduced[i+1].id));
    else t(R.EDGE_LAST,c,et);
  }
  const closures=cycleClosures(bp.binaryGroupIds,reduced);
  for(const x of closures)t(R.CYCLE_CLOSURE,c,edgeTok(ci,x.edgeId),x.syndrome?BIT1:BIT0);
  const contradictions=contradictoryPairs(bp.binaryGroupIds,reduced);
  contradictions.forEach((x,i)=>{
    const pt=pairTok(ci,i);
    t(R.CONTRADICTORY_PAIR,c,pt,groupTok(ci,x.source),groupTok(ci,x.target));
  });

  (w.actionLabelledFibers??[]).forEach((f,i)=>{
    const ft=fiberTok(ci,i);t(R.SPLIT_FIBER,c,ft);
    if(f.pureTransporter&&f.allSlotsDistinct)t(R.PURE_DISTINCT_FIBER,c,ft);
    if(f.parityWellDefined)t(R.PARITY_DEFINED_FIBER,c,ft);
  });

  let ps=0;
  for(const rec of w.binaryPropagationRecords??[]){
    for(const ch of rec.changed??[]){
      const pt=propTok(ci,ps++);
      if(ch.type==='binary-continuation')t(R.PROP_BINARY,c,pt);
      else if(ch.type==='nonbinary-continuation')t(R.PROP_NONBINARY,c,pt);
      else if(ch.type==='child-transporter')t(R.PROP_TRANSPORTER,c,pt);
      else if(ch.type==='child-branch-erasure')t(R.PROP_ERASURE,c,pt);
      else if(ch.type==='terminal-or-unknown')t(R.PROP_TERMINAL,c,pt);
      else throw new Error('unknown propagation type '+ch.type);
    }
  }
}

{
  const c=CASE['4x4-c4'],rows=data.phase.phase4x4.witness.directCarrier??[];
  const classSet=new Set();
  rows.forEach((row,i)=>{
    const st=6500000+i;raw.add(st);t(R.DIRECT_STATE,c,st);
    const cl=6600000+row.recursiveUnlabelledClass;raw.add(cl);classSet.add(cl);
    t(R.DIRECT_STATE_CLASS,c,st,cl);
  });
  for(const cl of [...classSet].sort((a,b)=>a-b))t(R.DIRECT_CLASS,c,cl);
}

function hexBits(hex){
  const n=BigInt('0x'+(hex||'0'));
  const out=[];
  let x=n,bit=0;
  while(x){if(x&1n)out.push(bit);x>>=1n;bit++;}
  return out;
}

{
  const c=CASE.response,w=data.response.witness;
  const feat=bit=>{const x=6710000+bit;raw.add(x);return x;};
  for(const v of w.responseVectors){
    const vt=6700000+v.id;raw.add(vt);t(R.RESPONSE_VECTOR,c,vt);
    for(const b of hexBits(v.bits))t(R.RESPONSE_BIT,vt,feat(b));
    if(w.dependencyLabels.includes(v.label))t(R.RESPONSE_DEP,vt);
  }
  for(const row of w.pairedBasis){
    const bt=6720000+row.pivot;raw.add(bt);t(R.RESPONSE_BASIS,c,bt);
    for(const b of hexBits(row.bits))t(R.RESPONSE_BASIS_BIT,bt,feat(b));
  }
  for(const row of w.augmentedBasis){
    const bt=6730000+row.pivot;raw.add(bt);t(R.RESPONSE_AUG_BASIS,c,bt);
    for(const b of hexBits(row.bits))t(R.RESPONSE_AUG_BASIS_BIT,bt,feat(b));
  }
  for(const b of hexBits(w.unmatchedCenterVector))t(R.RESPONSE_UNMATCHED_BIT,c,feat(b));
}

{
  const c=CASE.partial2,w=data.partial2.witness;
  const all=[...new Set([...w.optimalDistinctDeltas,...w.legalDistinctDeltas])];
  const tokByHex=new Map(all.sort((a,b)=>BigInt('0x'+a)<BigInt('0x'+b)?-1:1).map((hex,i)=>[hex,6800000+i]));
  const bit=pos=>{const x=6810000+pos;raw.add(x);return x;};
  for(const [hex,dt] of tokByHex){raw.add(dt);t(R.PARTIAL_DELTA,c,dt);for(const b of hexBits(hex))t(R.PARTIAL_DELTA_BIT,dt,bit(b));}
  for(const hex of w.optimalDistinctDeltas)t(R.PARTIAL_OPTIMAL,c,tokByHex.get(hex));
  for(const hex of w.legalDistinctDeltas)t(R.PARTIAL_LEGAL,c,tokByHex.get(hex));
  for(const row of w.optimalBasis){
    const bt=6820000+row.pivot;raw.add(bt);t(R.PARTIAL_OPT_BASIS,c,bt);
    for(const b of hexBits(row.bits))t(R.PARTIAL_OPT_BASIS_BIT,bt,bit(b));
  }
  for(const row of w.legalBasis){
    const bt=6830000+row.pivot;raw.add(bt);t(R.PARTIAL_LEGAL_BASIS,c,bt);
    for(const b of hexBits(row.bits))t(R.PARTIAL_LEGAL_BASIS_BIT,bt,bit(b));
  }
}

const relIds=Object.values(R);
let out='[\n  (^0 [ ^150010 ^150013 ^150014 ^150024 ])\n]\n\n';
out+='[\n  (^150013 '+R.CASE+')\n';
for(const id of relIds.filter(x=>x!==R.CASE&&x!==R.ATOM))out+='  (^150014 '+id+')\n';
out+='  (^150013 '+R.ATOM+')\n';
for(const id of [...raw].sort((a,b)=>a-b))out+='  (^150014 '+id+')\n';
out+=']\n\n';
for(const id of [...raw].sort((a,b)=>a-b))out+='[(^150010 '+R.ATOM+' '+id+')]\n';
for(const row of tuples)out+='[(^150024 '+row.join(' ')+')]\n';
fs.writeFileSync(new URL('./AGGREGATE_WITNESS_CORE020_0_1.isg',here),out);

const MAX=10507;
const nat=n=>n===0?7001:5000000+n;
let nums='[\n  (^0 [ ^150010 ^150014 ^150015 ^150016 ])\n]\n\n[\n';
for(let n=1;n<=MAX;n++){
  nums+='  (^150014 '+nat(n)+')\n';
  nums+='  (^150010 7000 '+nat(n)+')\n';
  nums+='  (^150015 '+nat(n)+' 7002)\n';
  nums+='  (^150016 '+nat(n)+' 7003 '+nat(n-1)+')\n';
}
nums+=']\n';
fs.writeFileSync(new URL('./AGGREGATE_NATURALS_CORE020_0_1.isg',here),nums);

console.log(JSON.stringify({
  status:'WROTE_NATIVE',
  rawAtoms:raw.size,
  tuples:tuples.length,
  maxNatural:MAX,
  phase:{
    closures:phaseEntries.map(([label,row])=>[label,row.witness.binaryPhase.reducedEdges.length]),
  },
},null,2));
