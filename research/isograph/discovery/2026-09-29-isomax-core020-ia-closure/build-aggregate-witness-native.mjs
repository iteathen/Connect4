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
  FIBER_UCLASS:5899260,
  FIBER_LABEL:5899261,
  LABEL_UCLASS:5899262,
  LABEL_PHASE_LIVE:5899263,
  LABEL_PHASE_INACTIVE:5899264,
  LABEL_RECURSIVE_LIVE:5899265,
  LABEL_RECURSIVE_INACTIVE:5899266,
  GROUP_MEMBER:5899267,
  GROUP_SHEET:5899268,
  GROUP_RANK:5899269,
  PROP_CHANGED:5899270,
  EDGE_PROP:5899271,
  RAW_EDGE_FIRST:5899272,
  RAW_EDGE_NEXT:5899273,
  RAW_EDGE_LAST:5899274,
  DIRECT_ROOT:5899280,
  STATE_RANK:5899281,
  STATE_HEIGHT:5899282,
  STATE_TERMINAL_KIND:5899283,
  STATE_R0_MASK:5899284,
  STATE_R1_MASK:5899285,
  MASK_CELL:5899286,
  STATE_CHILD:5899287,
  RESPONSE_PAIR:5899290,
  RESPONSE_FEATURE_ROLE:5899291,
  RESPONSE_UNMATCHED_CELL:5899292,
  PARTIAL_FEATURE_ROLE:5899293,
  SET_MEMBER:5899400,
  ENUM_AT:5899401,
  BASIS_PIVOT:5899410,
  RESPONSE_COEFF:5899411,
  RESPONSE_AUG_COEFF:5899412,
  RESPONSE_AUG_VECTOR:5899413,
  RESPONSE_FEATURE_FIRST:5899414,
  RESPONSE_FEATURE_NEXT:5899415,
  RESPONSE_FEATURE_LAST:5899416,
  PARTIAL_OPT_COEFF:5899420,
  PARTIAL_LEGAL_COEFF:5899421,
  PARTIAL_FEATURE_FIRST:5899422,
  PARTIAL_FEATURE_NEXT:5899423,
  PARTIAL_FEATURE_LAST:5899424,
  TREE_EDGE:5899430,
  FOREST_ROOT:5899431,
  FOREST_PARENT:5899432,
  FOREST_DEPTH:5899433,
  CYCLE_PATH_NODE:5899434,
  CYCLE_PATH_EDGE:5899435,
  CYCLE_PATH_ACC:5899436,
  CONTRADICT_PATH_NODE:5899440,
  CONTRADICT_PATH_EDGE:5899441,
  CONTRADICT_PATH_ACC:5899442,
  RESPONSE_BASIS_SOURCE_COEFF:5899450,
  RESPONSE_AUG_BASIS_SOURCE_COEFF:5899451,
  PARTIAL_OPT_BASIS_SOURCE_COEFF:5899452,
  PARTIAL_LEGAL_BASIS_SOURCE_COEFF:5899453,
  RESPONSE_DEP_COEFF_PARITY:5899454,
};
const CASE={'4x4-c4':5899100,'4x5-c4':5899101,'5x4-c4':5899102,response:5899103,partial2:5899104};
const SET={
  G44:5901000,C44:5901001,Z44:5901002,N44:5901003,X44:5901004,
  G45:5901010,C45:5901011,Z45:5901012,N45:5901013,X45:5901014,
  G54:5901020,C54:5901021,Z54:5901022,N54:5901023,X54:5901024,
  F44PURE:5901030,F44PARITY:5901031,D44BIN:5901032,
  P44BIN:5901033,P44NONBIN:5901034,P44TRANS:5901035,P44ERASE:5901036,P44TERM:5901037,
  Q44STATES:5901040,Q44CLASSES:5901041,
  RESP:5901050,RESPDEP:5901051,RESPBASIS:5901052,RESPAUG:5901053,
  P2OPT:5901060,P2LEGAL:5901061,P2OPTBASIS:5901062,P2LEGALBASIS:5901063,
  RESPAUGINPUT:5901070,
};
const BIT0=196900,BIT1=196901;
const P0=5899300,P1=5899301;
const LIVE=5899302,INACTIVE=5899303;
const nat=n=>n===0?7001:5000000+n;

const raw=new Set([...Object.values(CASE),...Object.values(SET)]);
const tuples=[];
const t=(rel,...args)=>tuples.push([rel,...args]);

const setRows=new Map();
function addSet(setId,elements){
  raw.add(setId);
  const unique=[...new Set(elements)];
  setRows.set(setId,unique);
  for(let i=0;i<unique.length;i++){
    t(R.SET_MEMBER,setId,unique[i]);
    t(R.ENUM_AT,setId,nat(i),unique[i]);
  }
}
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

function labelTok(ci,id){const x=10000000+ci*500000+id;raw.add(x);return x;}
function uclassTok(ci,id){const x=12000000+ci*300000+id;raw.add(x);return x;}
function slotTok(ci,col){return [231000,231020,231040][ci]+col;}

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


function cycleBasisCertificate(groupIds,edges){
  const parent=new Map(groupIds.map(id=>[id,id]));
  const phase=new Map(groupIds.map(id=>[id,0]));
  const size=new Map(groupIds.map(id=>[id,1]));
  const tree=[],closures=[];
  function find(id){
    const p=parent.get(id);
    if(p===id)return [id,0];
    const [root,up]=find(p),par=phase.get(id)^up;
    parent.set(id,root);phase.set(id,par);
    return [root,par];
  }
  for(const edge of edges){
    let [ra,pa]=find(edge.from),[rb,pb]=find(edge.to);
    if(ra===rb){
      closures.push({edge,syndrome:pa^pb^edge.delta});
      continue;
    }
    tree.push(edge);
    const bridge=pa^pb^edge.delta;
    if(size.get(ra)<size.get(rb)){
      parent.set(ra,rb);phase.set(ra,bridge);size.set(rb,size.get(ra)+size.get(rb));
    }else{
      parent.set(rb,ra);phase.set(rb,bridge);size.set(ra,size.get(ra)+size.get(rb));
    }
  }

  const adj=new Map(groupIds.map(id=>[id,[]]));
  for(const edge of tree){
    adj.get(edge.from).push({next:edge.to,edge});
    adj.get(edge.to).push({next:edge.from,edge});
  }
  for(const rows of adj.values())rows.sort((a,b)=>a.next-b.next||a.edge.id-b.edge.id);

  const roots=[],parents=[],depth=new Map(),seen=new Set();
  for(const start of [...groupIds].sort((a,b)=>a-b)){
    if(seen.has(start))continue;
    roots.push(start);seen.add(start);depth.set(start,0);
    const queue=[start];
    for(let qi=0;qi<queue.length;qi++){
      const node=queue[qi];
      for(const row of adj.get(node)){
        if(seen.has(row.next))continue;
        seen.add(row.next);depth.set(row.next,depth.get(node)+1);
        parents.push({child:row.next,parent:node,edge:row.edge});
        queue.push(row.next);
      }
    }
  }

  function treePath(source,target){
    const prev=new Map([[source,null]]),queue=[source];
    for(let qi=0;qi<queue.length&&!prev.has(target);qi++){
      const node=queue[qi];
      for(const row of adj.get(node)){
        if(prev.has(row.next))continue;
        prev.set(row.next,{node,edge:row.edge});queue.push(row.next);
      }
    }
    if(!prev.has(target))throw new Error('closure endpoints disconnected in forest');
    const nodes=[target],pathEdges=[];
    let cur=target;
    while(cur!==source){
      const p=prev.get(cur);pathEdges.push(p.edge);cur=p.node;nodes.push(cur);
    }
    nodes.reverse();pathEdges.reverse();
    return {nodes,edges:pathEdges};
  }

  const cycles=closures.map(row=>{
    const path=treePath(row.edge.from,row.edge.to),acc=[0];
    for(const edge of path.edges)acc.push(acc[acc.length-1]^edge.delta);
    const syndrome=acc[acc.length-1]^row.edge.delta;
    if(syndrome!==row.syndrome)throw new Error('fundamental cycle syndrome certificate mismatch');
    return {...row,path,acc};
  });
  if(tree.length+closures.length!==edges.length)
    throw new Error('forest/closure partition mismatch');
  return {tree,closures,roots,parents,depth,cycles};
}

function contradictoryPathCertificates(groupIds,edges,pairs){
  const outgoing=new Map(groupIds.map(id=>[id,[]]));
  for(const edge of edges)outgoing.get(edge.from).push(edge);
  for(const rows of outgoing.values())rows.sort((a,b)=>a.to-b.to||a.delta-b.delta||a.id-b.id);

  function onePath(source,target,targetParity){
    const failed=new Set();
    function visit(node,parity){
      const key=node+'|'+parity;
      if(failed.has(key))return null;
      if(node===target)return parity===targetParity?[]:null;
      for(const edge of outgoing.get(node)??[]){
        const suffix=visit(edge.to,parity^edge.delta);
        if(suffix)return [edge,...suffix];
      }
      failed.add(key);return null;
    }
    const path=visit(source,0);
    if(!path)throw new Error('missing contradictory path certificate');
    const nodes=[source],acc=[0];
    for(const edge of path){nodes.push(edge.to);acc.push(acc[acc.length-1]^edge.delta);}
    if(nodes[nodes.length-1]!==target||acc[acc.length-1]!==targetParity)
      throw new Error('bad contradictory path certificate');
    return {edges:path,nodes,acc};
  }

  return pairs.map((pair,index)=>({
    index,pair,
    paths:[onePath(pair.source,pair.target,0),onePath(pair.source,pair.target,1)],
  }));
}

for(const [label,row,ci] of phaseEntries){
  const c=CASE[label],w=row.witness,bp=w.binaryPhase;
  raw.add(P0);raw.add(P1);raw.add(LIVE);raw.add(INACTIVE);

  const fibreByLabel=new Map();
  for(const [fi,fr] of (w.actionLabelledFibers??[]).entries()){
    const ft=fiberTok(ci,fi),ut=uclassTok(ci,fr.unlabelledClass);
    t(R.FIBER_UCLASS,c,ft,ut);
    for(let li=0;li<fr.labelledClasses.length;li++){
      const lid=fr.labelledClasses[li],lt=labelTok(ci,lid);
      fibreByLabel.set(lid,fr);
      t(R.FIBER_LABEL,c,ft,lt);
      t(R.LABEL_UCLASS,c,lt,ut);
      const pp=(fr.profiles?.[li]??'').split(',');
      const rp=(fr.recursiveProfiles?.[li]??'').split(',');
      for(let col=0;col<pp.length;col++){
        const sl=slotTok(ci,col),tok=pp[col];
        if(tok==='I'||tok==='')t(R.LABEL_PHASE_INACTIVE,c,lt,sl);
        else if(tok.startsWith('C'))t(R.LABEL_PHASE_LIVE,c,lt,sl,uclassTok(ci,Number(tok.slice(1))));
        else throw new Error('unexpected phase-free token '+tok);
      }
      for(let col=0;col<rp.length;col++){
        const sl=slotTok(ci,col),tok=rp[col];
        if(tok==='I'||tok==='')t(R.LABEL_RECURSIVE_INACTIVE,c,lt,sl);
        else if(tok.startsWith('L'))t(R.LABEL_RECURSIVE_LIVE,c,lt,sl,labelTok(ci,Number(tok.slice(1))));
        else throw new Error('unexpected recursive token '+tok);
      }
    }
  }

  for(const gRow of w.deeperGroups??[]){
    const gt=groupTok(ci,gRow.id);
    t(R.GROUP_RANK,c,gt,nat(gRow.rank));
    gRow.labelledClasses.forEach((lid,si)=>{
      const lt=labelTok(ci,lid);
      t(R.GROUP_MEMBER,c,gt,lt);
      if(gRow.labelledClasses.length===2)t(R.GROUP_SHEET,c,gt,lt,si===0?BIT0:BIT1);
    });
  }

  for(const id of bp.binaryGroupIds){
    const g=groupTok(ci,id);
    t(R.BINARY_GROUP,c,g);
    t(R.DEEPER_BINARY_GROUP,c,g);
  }
  for(let i=0;i<bp.binaryInheritanceEdges.length;i++){
    const e=bp.binaryInheritanceEdges[i],et=edgeTok(ci,e.id),from=groupTok(ci,e.from),to=groupTok(ci,e.to);
    t(R.RAW_EDGE,c,et,from,to,e.delta?BIT1:BIT0,slotTok(ci,e.column));
    if(i===0)t(R.RAW_EDGE_FIRST,c,et);
    if(i+1<bp.binaryInheritanceEdges.length)t(R.RAW_EDGE_NEXT,c,et,edgeTok(ci,bp.binaryInheritanceEdges[i+1].id));
    else t(R.RAW_EDGE_LAST,c,et);
  }
  const reduced=bp.reducedEdges;
  for(let i=0;i<reduced.length;i++){
    const e=reduced[i],et=edgeTok(ci,e.id);
    t(R.REDUCED_EDGE,c,et,groupTok(ci,e.from),groupTok(ci,e.to),e.delta?BIT1:BIT0,slotTok(ci,e.column));
    if(i===0)t(R.EDGE_FIRST,c,et);
    if(i+1<reduced.length)t(R.EDGE_NEXT,c,et,edgeTok(ci,reduced[i+1].id));
    else t(R.EDGE_LAST,c,et);
  }
  const closures=cycleClosures(bp.binaryGroupIds,reduced);
  for(const x of closures)t(R.CYCLE_CLOSURE,c,edgeTok(ci,x.edgeId),x.syndrome?BIT1:BIT0);
  const cycleCert=cycleBasisCertificate(bp.binaryGroupIds,reduced);
  for(const edge of cycleCert.tree)t(R.TREE_EDGE,c,edgeTok(ci,edge.id));
  for(const root of cycleCert.roots)t(R.FOREST_ROOT,c,groupTok(ci,root));
  for(const [node,d] of cycleCert.depth)t(R.FOREST_DEPTH,c,groupTok(ci,node),nat(d));
  for(const row of cycleCert.parents)
    t(R.FOREST_PARENT,c,groupTok(ci,row.child),groupTok(ci,row.parent),edgeTok(ci,row.edge.id));
  for(const row of cycleCert.cycles){
    const ce=edgeTok(ci,row.edge.id);
    row.path.nodes.forEach((node,i)=>t(R.CYCLE_PATH_NODE,c,ce,nat(i),groupTok(ci,node)));
    row.path.edges.forEach((edge,i)=>t(R.CYCLE_PATH_EDGE,c,ce,nat(i),edgeTok(ci,edge.id)));
    row.acc.forEach((bit,i)=>t(R.CYCLE_PATH_ACC,c,ce,nat(i),bit?BIT1:BIT0));
  }
  const contradictions=contradictoryPairs(bp.binaryGroupIds,reduced);
  contradictions.forEach((x,i)=>{
    const pt=pairTok(ci,i);
    t(R.CONTRADICTORY_PAIR,c,pt,groupTok(ci,x.source),groupTok(ci,x.target));
  });
  const contradictionCert=contradictoryPathCertificates(bp.binaryGroupIds,reduced,contradictions);
  for(const row of contradictionCert){
    const pt=pairTok(ci,row.index);
    row.paths.forEach((p,parity)=>{
      const pb=parity?BIT1:BIT0;
      p.nodes.forEach((node,i)=>t(R.CONTRADICT_PATH_NODE,c,pt,pb,nat(i),groupTok(ci,node)));
      p.edges.forEach((edge,i)=>t(R.CONTRADICT_PATH_EDGE,c,pt,pb,nat(i),edgeTok(ci,edge.id)));
      p.acc.forEach((bit,i)=>t(R.CONTRADICT_PATH_ACC,c,pt,pb,nat(i),bit?BIT1:BIT0));
    });
  }

  (w.actionLabelledFibers??[]).forEach((f,i)=>{
    const ft=fiberTok(ci,i);t(R.SPLIT_FIBER,c,ft);
    if(f.pureTransporter&&f.allSlotsDistinct)t(R.PURE_DISTINCT_FIBER,c,ft);
    if(f.parityWellDefined)t(R.PARITY_DEFINED_FIBER,c,ft);
  });

  const propSets={binary:[],nonbinary:[],transporter:[],erasure:[],terminal:[]};
  let ps=0,binaryEdgeCursor=0;
  for(const rec of w.binaryPropagationRecords??[]){
    for(const ch of rec.changed??[]){
      const pt=propTok(ci,ps++);
      t(R.PROP_CHANGED,c,pt,groupTok(ci,rec.groupId),slotTok(ci,ch.column),
        labelTok(ci,ch.left),labelTok(ci,ch.right));
      if(ch.type==='binary-continuation'){
        const e=bp.binaryInheritanceEdges[binaryEdgeCursor++];
        t(R.EDGE_PROP,c,edgeTok(ci,e.id),pt);
        t(R.PROP_BINARY,c,pt);propSets.binary.push(pt);
      } else if(ch.type==='nonbinary-continuation'){t(R.PROP_NONBINARY,c,pt);propSets.nonbinary.push(pt);}
      else if(ch.type==='child-transporter'){t(R.PROP_TRANSPORTER,c,pt);propSets.transporter.push(pt);}
      else if(ch.type==='child-branch-erasure'){t(R.PROP_ERASURE,c,pt);propSets.erasure.push(pt);}
      else if(ch.type==='terminal-or-unknown'){t(R.PROP_TERMINAL,c,pt);propSets.terminal.push(pt);}
      else throw new Error('unknown propagation type '+ch.type);
    }
  }
  const ciSets=ci===0?
    {g:SET.G44,c:SET.C44,z:SET.Z44,n:SET.N44,x:SET.X44}:
    ci===1?{g:SET.G45,c:SET.C45,z:SET.Z45,n:SET.N45,x:SET.X45}:
      {g:SET.G54,c:SET.C54,z:SET.Z54,n:SET.N54,x:SET.X54};
  addSet(ciSets.g,bp.binaryGroupIds.map(id=>groupTok(ci,id)));
  addSet(ciSets.c,closures.map(x=>edgeTok(ci,x.edgeId)));
  addSet(ciSets.z,closures.filter(x=>x.syndrome===0).map(x=>edgeTok(ci,x.edgeId)));
  addSet(ciSets.n,closures.filter(x=>x.syndrome===1).map(x=>edgeTok(ci,x.edgeId)));
  addSet(ciSets.x,contradictions.map((_,i)=>pairTok(ci,i)));
  if(ci===0){
    const fibres=w.actionLabelledFibers??[];
    addSet(SET.F44PURE,fibres.map((f,i)=>f.pureTransporter&&f.allSlotsDistinct?fiberTok(ci,i):null).filter(x=>x!==null));
    addSet(SET.F44PARITY,fibres.map((f,i)=>f.parityWellDefined?fiberTok(ci,i):null).filter(x=>x!==null));
    addSet(SET.D44BIN,bp.binaryGroupIds.map(id=>groupTok(ci,id)));
    addSet(SET.P44BIN,propSets.binary);
    addSet(SET.P44NONBIN,propSets.nonbinary);
    addSet(SET.P44TRANS,propSets.transporter);
    addSet(SET.P44ERASE,propSets.erasure);
    addSet(SET.P44TERM,propSets.terminal);
  }
}

{
  const c=CASE['4x4-c4'],rows=data.phase.phase4x4.witness.directCarrier??[];
  const classSet=new Set(),stateByKey=new Map(),maskByValue=new Map();
  rows.forEach((row,i)=>{const st=6500000+i;raw.add(st);stateByKey.set(row.key,st);});
  const maskTok=value=>{
    if(!maskByValue.has(value)){const mt=14000000+maskByValue.size;maskByValue.set(value,mt);raw.add(mt);
      let v=value>>>0,bit=0;while(v){if(v&1)t(R.MASK_CELL,mt,233000+Math.floor(bit/4)*10+(bit%4));v>>>=1;bit++;}
    }return maskByValue.get(value);
  };
  const kinds=new Map(),kindTok=k=>{if(!kinds.has(k)){const x=15000000+kinds.size;kinds.set(k,x);raw.add(x);}return kinds.get(k);};
  rows.forEach((row,i)=>{
    const st=stateByKey.get(row.key);t(R.DIRECT_STATE,c,st);
    if(row.rank===0)t(R.DIRECT_ROOT,c,st);
    t(R.STATE_RANK,c,st,nat(row.rank));
    if(row.kind!==null&&row.kind!==undefined)t(R.STATE_TERMINAL_KIND,c,st,kindTok(String(row.kind)));
    (row.heights??[]).forEach((h,col)=>t(R.STATE_HEIGHT,c,st,slotTok(0,col),nat(h)));
    for(const m of row.p0Residuals??[])t(R.STATE_R0_MASK,c,st,maskTok(m));
    for(const m of row.p1Residuals??[])t(R.STATE_R1_MASK,c,st,maskTok(m));
    for(const child of row.children??[])t(R.STATE_CHILD,c,st,stateByKey.get(child));
    const cl=uclassTok(0,row.recursiveUnlabelledClass);classSet.add(cl);
    t(R.DIRECT_STATE_CLASS,c,st,cl);
  });
  for(const cl of [...classSet].sort((a,b)=>a-b))t(R.DIRECT_CLASS,c,cl);
  addSet(SET.Q44STATES,rows.map((_,i)=>6500000+i));
  addSet(SET.Q44CLASSES,[...classSet].sort((a,b)=>a-b));
}

function decomposeHex(hex,basisRows){
  let x=BigInt('0x'+(hex||'0'));
  const byPivot=new Map(basisRows.map(row=>[row.pivot,BigInt('0x'+row.bits)]));
  const coeff=[];
  const max=Math.max(-1,...basisRows.map(row=>row.pivot));
  for(let bit=max;bit>=0;bit--)if((x>>BigInt(bit))&1n){
    const row=byPivot.get(bit);
    if(row===undefined)throw new Error('vector not in basis span at pivot '+bit);
    x^=row;coeff.push(bit);
  }
  if(x!==0n)throw new Error('basis decomposition residue');
  return coeff;
}


function basisSourceCertificate(hexRows,width,basisRows){
  const basis=new Array(width).fill(null);
  for(let i=0;i<hexRows.length;i++){
    let row=BigInt('0x'+(hexRows[i]||'0')),combo=1n<<BigInt(i),inserted=false;
    for(let bit=width-1;bit>=0;bit--)if((row>>BigInt(bit))&1n){
      if(basis[bit]){row^=basis[bit].row;combo^=basis[bit].combo;}
      else{basis[bit]={row,combo};inserted=true;break;}
    }
    if(!inserted&&row!==0n)throw new Error('basis certificate elimination residue');
  }
  const expected=new Map(basisRows.map(row=>[row.pivot,BigInt('0x'+row.bits)]));
  const out=[];
  for(let pivot=0;pivot<width;pivot++){
    const row=basis[pivot],want=expected.get(pivot);
    if(!row){
      if(want!==undefined)throw new Error('missing expected basis pivot '+pivot);
      continue;
    }
    if(want===undefined||row.row!==want)throw new Error('basis row mismatch at pivot '+pivot);
    const sources=[];
    for(let i=0;i<hexRows.length;i++)if((row.combo>>BigInt(i))&1n)sources.push(i);
    out.push({pivot,sources});
  }
  if(out.length!==basisRows.length)throw new Error('basis certificate rank mismatch');
  return out;
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
  const unmatchedVector=6740000;raw.add(unmatchedVector);t(R.RESPONSE_AUG_VECTOR,c,unmatchedVector);
  t(R.RESPONSE_FEATURE_FIRST,c,feat(0));
  for(let bit=0;bit<137;bit++)t(R.RESPONSE_FEATURE_NEXT,c,feat(bit),feat(bit+1));
  t(R.RESPONSE_FEATURE_LAST,c,feat(137));
  for(const v of w.responseVectors){
    const vt=6700000+v.id;raw.add(vt);t(R.RESPONSE_VECTOR,c,vt);
    const m=v.label.match(/^c(\d+):r(\d+)-(\d+)$/);
    if(!m)throw new Error('unexpected response label '+v.label);
    const col=Number(m[1])-1,r0=Number(m[2])-1,r1=Number(m[3])-1;
    t(R.RESPONSE_PAIR,vt,231060+col,233300+r0*10+col,233300+r1*10+col);
    for(const b of hexBits(v.bits))t(R.RESPONSE_BIT,vt,feat(b));
    if(w.dependencyLabels.includes(v.label))t(R.RESPONSE_DEP,vt);
  }
  for(const row of w.pairedBasis){
    const bt=6720000+row.pivot;raw.add(bt);t(R.RESPONSE_BASIS,c,bt);
    t(R.BASIS_PIVOT,bt,feat(row.pivot));
    for(const b of hexBits(row.bits))t(R.RESPONSE_BASIS_BIT,bt,feat(b));
  }
  for(const row of w.augmentedBasis){
    const bt=6730000+row.pivot;raw.add(bt);t(R.RESPONSE_AUG_BASIS,c,bt);
    t(R.BASIS_PIVOT,bt,feat(row.pivot));
    for(const b of hexBits(row.bits))t(R.RESPONSE_AUG_BASIS_BIT,bt,feat(b));
  }
  const responseBasisCert=basisSourceCertificate(w.responseVectors.map(v=>v.bits),138,w.pairedBasis);
  for(const row of responseBasisCert)
    for(const i of row.sources)t(R.RESPONSE_BASIS_SOURCE_COEFF,6720000+row.pivot,6700000+w.responseVectors[i].id);
  const augmentedHex=[...w.responseVectors.map(v=>v.bits),w.unmatchedCenterVector];
  const augmentedBasisCert=basisSourceCertificate(augmentedHex,138,w.augmentedBasis);
  for(const row of augmentedBasisCert)for(const i of row.sources)
    t(R.RESPONSE_AUG_BASIS_SOURCE_COEFF,6730000+row.pivot,
      i<w.responseVectors.length?6700000+w.responseVectors[i].id:unmatchedVector);
  for(const b of hexBits(w.unmatchedCenterVector))t(R.RESPONSE_UNMATCHED_BIT,c,feat(b));
  for(const v of w.responseVectors){
    const vt=6700000+v.id;
    for(const pivot of decomposeHex(v.bits,w.pairedBasis))
      t(R.RESPONSE_COEFF,vt,6720000+pivot);
    for(const pivot of decomposeHex(v.bits,w.augmentedBasis))
      t(R.RESPONSE_AUG_COEFF,vt,6730000+pivot);
  }
  for(const pivot of decomposeHex(w.unmatchedCenterVector,w.augmentedBasis))
    t(R.RESPONSE_AUG_COEFF,unmatchedVector,6730000+pivot);
  for(const row of w.pairedBasis){
    let parity=0;
    for(const v of w.responseVectors)if(w.dependencyLabels.includes(v.label)&&
      decomposeHex(v.bits,w.pairedBasis).includes(row.pivot))parity^=1;
    t(R.RESPONSE_DEP_COEFF_PARITY,c,6720000+row.pivot,parity?BIT1:BIT0);
  }
  t(R.RESPONSE_UNMATCHED_CELL,c,233353);
  for(let bit=0;bit<138;bit++){
    const player=bit<69?P0:P1,line=bit%69;
    t(R.RESPONSE_FEATURE_ROLE,feat(bit),player,234300+line);
  }
  addSet(SET.RESP,w.responseVectors.map(v=>6700000+v.id));
  addSet(SET.RESPDEP,w.responseVectors.filter(v=>w.dependencyLabels.includes(v.label)).map(v=>6700000+v.id));
  addSet(SET.RESPBASIS,w.pairedBasis.map(row=>6720000+row.pivot));
  addSet(SET.RESPAUG,w.augmentedBasis.map(row=>6730000+row.pivot));
  addSet(SET.RESPAUGINPUT,[...w.responseVectors.map(v=>6700000+v.id),unmatchedVector]);
}

{
  const c=CASE.partial2,w=data.partial2.witness;
  const all=[...new Set([...w.optimalDistinctDeltas,...w.legalDistinctDeltas])];
  const pfeat=pos=>6810000+pos;
  t(R.PARTIAL_FEATURE_FIRST,c,pfeat(0));
  for(let pos=0;pos<39;pos++)t(R.PARTIAL_FEATURE_NEXT,c,pfeat(pos),pfeat(pos+1));
  t(R.PARTIAL_FEATURE_LAST,c,pfeat(39));
  const tokByHex=new Map(all.sort((a,b)=>BigInt('0x'+a)<BigInt('0x'+b)?-1:1).map((hex,i)=>[hex,6800000+i]));
  const bit=pos=>{const x=6810000+pos;raw.add(x);return x;};
  for(let pos=0;pos<40;pos++){
    const player=pos<20?P0:P1,local=pos%20,line=Math.floor(local/2),pair=local%2;
    t(R.PARTIAL_FEATURE_ROLE,bit(pos),player,234000+line,pair===0?BIT0:BIT1);
  }
  for(const [hex,dt] of tokByHex){raw.add(dt);t(R.PARTIAL_DELTA,c,dt);for(const b of hexBits(hex))t(R.PARTIAL_DELTA_BIT,dt,bit(b));}
  for(const hex of w.optimalDistinctDeltas)t(R.PARTIAL_OPTIMAL,c,tokByHex.get(hex));
  for(const hex of w.legalDistinctDeltas)t(R.PARTIAL_LEGAL,c,tokByHex.get(hex));
  for(const row of w.optimalBasis){
    const bt=6820000+row.pivot;raw.add(bt);t(R.PARTIAL_OPT_BASIS,c,bt);
    t(R.BASIS_PIVOT,bt,bit(row.pivot));
    for(const b of hexBits(row.bits))t(R.PARTIAL_OPT_BASIS_BIT,bt,bit(b));
  }
  for(const row of w.legalBasis){
    const bt=6830000+row.pivot;raw.add(bt);t(R.PARTIAL_LEGAL_BASIS,c,bt);
    t(R.BASIS_PIVOT,bt,bit(row.pivot));
    for(const b of hexBits(row.bits))t(R.PARTIAL_LEGAL_BASIS_BIT,bt,bit(b));
  }
  const optHex=w.optimalDistinctDeltas;
  const legalHex=w.legalDistinctDeltas;
  const optBasisCert=basisSourceCertificate(optHex,40,w.optimalBasis);
  for(const row of optBasisCert)for(const i of row.sources)
    t(R.PARTIAL_OPT_BASIS_SOURCE_COEFF,6820000+row.pivot,tokByHex.get(optHex[i]));
  const legalBasisCert=basisSourceCertificate(legalHex,40,w.legalBasis);
  for(const row of legalBasisCert)for(const i of row.sources)
    t(R.PARTIAL_LEGAL_BASIS_SOURCE_COEFF,6830000+row.pivot,tokByHex.get(legalHex[i]));
  for(const hex of w.optimalDistinctDeltas){
    const dt=tokByHex.get(hex);
    for(const pivot of decomposeHex(hex,w.optimalBasis))
      t(R.PARTIAL_OPT_COEFF,dt,6820000+pivot);
  }
  for(const hex of w.legalDistinctDeltas){
    const dt=tokByHex.get(hex);
    for(const pivot of decomposeHex(hex,w.legalBasis))
      t(R.PARTIAL_LEGAL_COEFF,dt,6830000+pivot);
  }
  addSet(SET.P2OPT,w.optimalDistinctDeltas.map(hex=>tokByHex.get(hex)));
  addSet(SET.P2LEGAL,w.legalDistinctDeltas.map(hex=>tokByHex.get(hex)));
  addSet(SET.P2OPTBASIS,w.optimalBasis.map(row=>6820000+row.pivot));
  addSet(SET.P2LEGALBASIS,w.legalBasis.map(row=>6830000+row.pivot));
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


// Physical 4x4 game/value/partial2 witness is intentionally sharded so every
// durable GitHub artifact remains below the repository file-size limit.
const PRODUCER_REL={
  PHYS_STATE:5899460,
  PHYS_ROOT:5899461,
  PHYS_P0_MASK:5899462,
  PHYS_P1_MASK:5899463,
  PHYS_VALUE:5899464,
  PHYS_TERMINAL:5899465,
  PHYS_WINNER:5899466,
  PHYS_LEGAL_EDGE:5899467,
  PHYS_OPT_EDGE:5899468,
  PHYS_PARTIAL_VECTOR:5899469,
  PHYS_PARTIAL_BIT:5899470,
  MASK16:5899471,
};
const PRODUCER_CARRIER={
  STATE:5899480,
  MASK:5899481,
  PARTIAL_VECTOR:5899482,
  VALUE:5899483,
};
const DRAW=5899304,NEG=5899310,ZERO=5899311,POS=5899312;
const valueTok=v=>v<0?NEG:v>0?POS:ZERO;
const maskTok16=v=>19000000+(v>>>0);

const physicalFiles=fs.readdirSync(here)
  .filter(name=>/^PARTIAL2_PHYSICAL_CARRIER_0_1_\d\d\.json$/.test(name))
  .sort();
const physicalShards=physicalFiles.map(name=>
  JSON.parse(fs.readFileSync(new URL('./'+name,here),'utf8')));
const physicalRows=physicalShards.flatMap(shard=>shard.rows);
if(physicalRows.length!==161029)
  throw new Error('unexpected physical carrier size '+physicalRows.length);
const physicalByKey=new Map();
let globalIndex=0;
for(const shard of physicalShards)for(const row of shard.rows){
  const expected=shard.start_index+(globalIndex-shard.start_index);
  const st=6900000+globalIndex++;
  if(physicalByKey.has(row.key))throw new Error('duplicate physical key '+row.key);
  physicalByKey.set(row.key,st);
}
if(!physicalByKey.has(0))throw new Error('missing empty physical root');

const partialHex=[...new Set(physicalRows.map(row=>row.partial2))]
  .sort((a,b)=>BigInt('0x'+a)<BigInt('0x'+b)?-1:BigInt('0x'+a)>BigInt('0x'+b)?1:0);
const partialTok=new Map(partialHex.map((hex,i)=>[hex,20000000+i]));

let schema='[\n  (^0 [ ^150010 ^150013 ^150014 ^150024 ])\n]\n\n[\n';
for(const id of Object.values(PRODUCER_REL))schema+='  (^150014 '+id+')\n';
for(const id of Object.values(PRODUCER_CARRIER))schema+='  (^150013 '+id+')\n';
for(const id of [DRAW,NEG,ZERO,POS])schema+='  (^150014 '+id+')\n';
schema+=
  '  (^150010 '+PRODUCER_CARRIER.VALUE+' '+NEG+')\n'+
  '  (^150010 '+PRODUCER_CARRIER.VALUE+' '+ZERO+')\n'+
  '  (^150010 '+PRODUCER_CARRIER.VALUE+' '+POS+')\n'+
  ']\n';
fs.writeFileSync(new URL('./PRODUCER_WITNESS_SCHEMA_CORE020_0_1.isg',here),schema);

let masks='[\n  (^0 [ ^150010 ^150014 ^150024 ])\n]\n\n[\n';
for(let value=0;value<65536;value++){
  const mt=maskTok16(value);
  masks+='  (^150014 '+mt+')\n';
  masks+='  (^150010 '+PRODUCER_CARRIER.MASK+' '+mt+')\n';
  for(let bit=0;bit<16;bit++)if((value>>>bit)&1)
    masks+='  (^150024 '+R.MASK_CELL+' '+mt+' '+(233000+Math.floor(bit/4)*10+(bit%4))+')\n';
}
masks+=']\n';
fs.writeFileSync(new URL('./MASK16_CORE020_0_1.isg',here),masks);

let vectors='[\n  (^0 [ ^150010 ^150014 ^150024 ])\n]\n\n[\n';
for(const hex of partialHex){
  const vt=partialTok.get(hex);
  vectors+='  (^150014 '+vt+')\n';
  vectors+='  (^150010 '+PRODUCER_CARRIER.PARTIAL_VECTOR+' '+vt+')\n';
  for(const pos of hexBits(hex))
    vectors+='  (^150024 '+PRODUCER_REL.PHYS_PARTIAL_BIT+' '+vt+' '+(6810000+pos)+')\n';
}
vectors+=']\n';
fs.writeFileSync(new URL('./PARTIAL2_VECTOR_WITNESS_CORE020_0_1.isg',here),vectors);

for(const shard of physicalShards){
  let out='[\n  (^0 [ ^150010 ^150014 ^150024 ])\n]\n\n[\n';
  for(let local=0;local<shard.rows.length;local++){
    const global=shard.start_index+local,row=shard.rows[local],st=6900000+global;
    if(physicalByKey.get(row.key)!==st)
      throw new Error('physical key/token mismatch '+row.key);
    out+='  (^150014 '+st+')\n';
    out+='  (^150010 '+PRODUCER_CARRIER.STATE+' '+st+')\n';
    out+='  (^150024 '+PRODUCER_REL.PHYS_STATE+' '+CASE.partial2+' '+st+')\n';
    if(row.key===0)out+='  (^150024 '+PRODUCER_REL.PHYS_ROOT+' '+CASE.partial2+' '+st+')\n';
    out+='  (^150024 '+R.STATE_RANK+' '+CASE.partial2+' '+st+' '+nat(row.rank)+')\n';
    out+='  (^150024 '+PRODUCER_REL.PHYS_P0_MASK+' '+st+' '+maskTok16(row.p0)+')\n';
    out+='  (^150024 '+PRODUCER_REL.PHYS_P1_MASK+' '+st+' '+maskTok16(row.p1)+')\n';
    out+='  (^150024 '+PRODUCER_REL.PHYS_VALUE+' '+st+' '+valueTok(row.value)+')\n';
    if(row.terminal){
      out+='  (^150024 '+PRODUCER_REL.PHYS_TERMINAL+' '+st+')\n';
      if(row.winner===0)out+='  (^150024 '+PRODUCER_REL.PHYS_WINNER+' '+st+' '+P0+')\n';
      else if(row.winner===1)out+='  (^150024 '+PRODUCER_REL.PHYS_WINNER+' '+st+' '+P1+')\n';
      else out+='  (^150024 '+PRODUCER_REL.PHYS_WINNER+' '+st+' '+DRAW+')\n';
    }
    for(const edge of row.legalChildren){
      const child=physicalByKey.get(edge.childKey);
      if(child===undefined)throw new Error('missing physical legal child '+edge.childKey);
      out+='  (^150024 '+PRODUCER_REL.PHYS_LEGAL_EDGE+' '+st+' '+(231000+edge.column)+' '+child+')\n';
    }
    for(const edge of row.optimalChildren){
      const child=physicalByKey.get(edge.childKey);
      if(child===undefined)throw new Error('missing physical optimal child '+edge.childKey);
      out+='  (^150024 '+PRODUCER_REL.PHYS_OPT_EDGE+' '+st+' '+(231000+edge.column)+' '+child+')\n';
    }
    out+='  (^150024 '+PRODUCER_REL.PHYS_PARTIAL_VECTOR+' '+st+' '+partialTok.get(row.partial2)+')\n';
  }
  out+=']\n';
  const suffix=String(shard.shard_index).padStart(2,'0');
  fs.writeFileSync(new URL('./PARTIAL2_PHYSICAL_WITNESS_CORE020_0_1_'+suffix+'.isg',here),out);
}

console.log(JSON.stringify({
  status:'WROTE_PRODUCER_NATIVE_SHARDS',
  physicalStates:physicalRows.length,
  physicalShards:physicalShards.length,
  partialVectors:partialHex.length,
  maskCarrier:65536,
},null,2));
