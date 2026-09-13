// Research prototype: exact certificate-family compatibility cut for two legal center branches.
// Research direction / self-proving predicate program: Josh Oshiro.
// Formalization and qualification: OpenAI ChatGPT.
// This is a structural certificate experiment, not a perfect-play line oracle.

import assert from 'node:assert/strict';
const W=7,H=6,K=4,dirs=[[1,0],[0,1],[1,1],[1,-1]];
const key=([c,r])=>`${c},${r}`; const label=L=>L.map(([c,r])=>`${'ABCDEFG'[c-1]}${r}`).join('-');
const lines=[];for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const[dc,dr]of dirs){const L=[];for(let i=0;i<K;i++){const x=c+i*dc,y=r+i*dr;if(x<1||x>W||y<1||y>H){L.length=0;break;}L.push([x,y]);}if(L.length===K)lines.push(L);}assert.equal(lines.length,69);
function analyzeState(name,p0Cells,p1Cells){
const P0=new Set(p0Cells.map(key));const P1=new Set(p1Cells.map(key));
const occupied=x=>P0.has(key(x))||P1.has(key(x));
const h={};for(let c=1;c<=W;c++){let r=1;while(r<=H&&occupied([c,r]))r++;h[c]=r-1;}
const targets=lines.filter(L=>!L.some(x=>P1.has(key(x))));
const contains=(L,B)=>B.every(b=>L.some(x=>key(x)===key(b)));
const maskForBlocker=B=>targets.reduce((m,L,i)=>contains(L,B)?m|(1n<<BigInt(i)):m,0n);
const pop=x=>{let n=0;while(x){x&=x-1n;n++;}return n;};
const certs=[];let id=0;
function add(type,name,resources,blocker,extra={}){return addMulti(type,name,resources,[blocker],extra);}
function addMulti(type,name,resources,blockers,extra={}){let cover=0n;for(const blocker of blockers)cover|=maskForBlocker(blocker);return addCoverage(type,name,resources,cover,{blockers:blockers.map(B=>B.map(key)),...extra});}
function addCoverage(type,name,resources,cover,extra={}){if(!cover)return;certs.push({id:id++,type,name,resources:new Set(resources.map(key)),cover,...extra});}
// CE lower odd -> upper even.
for(let c=1;c<=W;c++)for(let lower=1;lower<=5;lower+=2){const up=lower+1;if(occupied([c,lower])||occupied([c,up]))continue;add('CE',`CE ${key([c,lower])}>${key([c,up])}`,[[c,lower],[c,up]],[[c,up]],{edges:[[key([c,lower]),key([c,up])]],ceBottoms:[key([c,lower])]});}
// V lower even -> upper odd.
for(let c=1;c<=W;c++)for(let lower=2;lower<=4;lower+=2){const up=lower+1;if(occupied([c,lower])||occupied([c,up]))continue;add('V',`V ${key([c,lower])}>${key([c,up])}`,[[c,lower],[c,up]],[[c,lower],[c,up]],{edges:[[key([c,lower]),key([c,up])]]});}
const playable=[];for(let c=1;c<=W;c++)if(h[c]<H)playable.push([c,h[c]+1]);
for(let i=0;i<playable.length;i++)for(let j=i+1;j<playable.length;j++){const a=playable[i],b=playable[j];if(targets.some(L=>contains(L,[a,b])))add('BI',`BI ${key(a)}<>${key(b)}`,[a,b],[a,b],{edges:[[key(a),key(b)],[key(b),key(a)]]});}
// Lowinverse: two distinct Vertical resources whose upper cells can share a winning line.
const verticalPairs=[];
for(let c=1;c<=W;c++)for(let lower=2;lower<=4;lower+=2){const up=lower+1;if(occupied([c,lower])||occupied([c,up]))continue;verticalPairs.push({lower:[c,lower],upper:[c,up]});}
for(let i=0;i<verticalPairs.length;i++)for(let j=i+1;j<verticalPairs.length;j++){
  const a=verticalPairs[i],b=verticalPairs[j];if(a.upper[0]===b.upper[0])continue;
  if(!lines.some(L=>contains(L,[a.upper,b.upper])))continue;
  addMulti('LI',`LI ${key(a.lower)}>${key(a.upper)} & ${key(b.lower)}>${key(b.upper)}`,[a.lower,a.upper,b.lower,b.upper],[[a.lower,a.upper],[b.lower,b.upper],[a.upper,b.upper]],{edges:[[key(a.lower),key(a.upper)],[key(b.lower),key(b.upper)]]});
}

// Highinverse: two 3-cell empty columns (lower even, middle odd, upper even).
// A single certificate has several exact pair-blocker consequences. Exact
// pairwise compatibility is applied later from the qualified reference profile.
const hiCols=[];
for(let c=1;c<=W;c++)for(const lower of [2,4]){
  const middle=lower+1,upper=lower+2;
  if([lower,middle,upper].some(r=>occupied([c,r])))continue;
  hiCols.push({c,lower:[c,lower],middle:[c,middle],upper:[c,upper],direct:playable.some(x=>key(x)===key([c,lower]))});
}
for(let i=0;i<hiCols.length;i++)for(let j=i+1;j<hiCols.length;j++){
  const a=hiCols[i],b=hiCols[j]; if(a.c===b.c)continue;
  const blockers=[[a.upper,b.upper],[a.middle,b.middle],[a.upper,a.middle],[b.upper,b.middle]];
  if(a.direct)blockers.push([a.lower,b.upper]);
  if(b.direct)blockers.push([b.lower,a.upper]);
  const useful=blockers.some(B=>maskForBlocker(B)!==0n); if(!useful)continue;
  const cross=[[a.upper,b.upper],[a.middle,b.middle]];
  if(a.direct)cross.push([a.lower,b.upper]);
  if(b.direct)cross.push([b.lower,a.upper]);
  if(!cross.some(B=>lines.some(L=>contains(L,B))))continue;
  addMulti('HI',`HI ${key(a.lower)}-${key(a.upper)} & ${key(b.lower)}-${key(b.upper)}`,[a.lower,a.middle,a.upper,b.lower,b.middle,b.upper],blockers,{exclusive:true,direct:[a.direct,b.direct]});
}

// Baseclaim: three currently playable squares, with an odd-row second square.
// It certifies two pair blockers: {first, above(second)} and {second, third}.
const pairConnect=(a,b)=>lines.some(L=>contains(L,[a,b]));
for(const second of playable){
  if(second[1]%2===0||second[1]>=H)continue;
  const above=[second[0],second[1]+1];
  for(const first of playable){
    if(first[0]===second[0])continue;
    for(const third of playable){
      if(third[0]===second[0]||third[0]===first[0])continue;
      if(!pairConnect(first,above)||!pairConnect(second,third))continue;
      addMulti('BC',`BC ${key(first)} | ${key(second)} | ${key(third)}`,[first,second,third,above],[[first,above],[second,third]],{exclusive:true,ceBottoms:[key(second)]});
    }
  }
}

// Exact Before variation generation following rpachauri/connect4's recursive
// construction, translated to 1-based physical rows from the bottom.
const p1Groups=lines.filter(L=>!L.some(x=>P0.has(key(x))));
const beforeDefs=[];
function beforeOptions([c,r]){
  const out=[];
  // Every non-top empty group square may be the lower square of a Vertical.
  if(r+1<=H)out.push({kind:'V',lower:[c,r],upper:[c,r+1]});
  if(r%2===1){
    // Odd physical row: alternatively use a Vertical immediately below.
    if(r-1>=1&&!occupied([c,r-1]))out.push({kind:'V',lower:[c,r-1],upper:[c,r]});
  }else{
    // Even physical row: alternatively use a Claimeven immediately below.
    if(r-1>=1&&!occupied([c,r-1]))out.push({kind:'CE',lower:[c,r-1],upper:[c,r]});
  }
  return out;
}
for(const G of p1Groups){
  const empty=G.filter(x=>!P1.has(key(x)));
  if(!empty.length||empty.some(([,r])=>r===H))continue;
  const optionLists=empty.map(beforeOptions);
  if(optionLists.some(xs=>xs.length===0))continue;
  const chosen=[];
  function emit(i){
    if(i===optionLists.length){
      if(!chosen.some(q=>q.kind==='V'))return;
      const components=chosen.map(q=>({kind:q.kind,lower:[...q.lower],upper:[...q.upper]}));
      const sig=components.map(q=>`${q.kind}:${key(q.lower)}>${key(q.upper)}`).sort().join('|');
      if(beforeDefs.some(B=>B.group===G&&B.sig===sig))return;
      const B={group:G,empty:empty.map(x=>[...x]),components,sig};
      beforeDefs.push(B);
      const succ=empty.map(([c,r])=>[c,r+1]);
      const resources=[];const blockers=[succ];const ceBottoms=[];
      for(const q of components){
        resources.push(q.lower,q.upper);
        if(q.kind==='CE'){blockers.push([q.upper]);ceBottoms.push(key(q.lower));}
        else blockers.push([q.lower,q.upper]);
      }
      addMulti('BF',`BF ${label(G)} :: ${sig}`,resources,blockers,{ownGroup:label(G),empty:empty.map(key),successors:succ.map(key),components:components.map(q=>`${q.kind}:${key(q.lower)}>${key(q.upper)}`),ceBottoms});
      return;
    }
    for(const q of optionLists[i]){chosen.push(q);emit(i+1);chosen.pop();}
  }
  emit(0);
}

// Aftereven. A P1 nonvertical group qualifies when each empty group cell is
// an even physical row with an empty cell immediately below. The certificate
// contains those Claimeven response pairs. It refutes each CE-covered target
// and any P0 target carrying a cell above every empty Aftereven square.
for(const G of p1Groups){
  const vertical=G.every(x=>x[0]===G[0][0]); if(vertical)continue;
  const empty=G.filter(x=>!P1.has(key(x))); if(!empty.length)continue;
  let valid=true; const resources=[],edges=[];
  for(const [c,r] of empty){
    if(r===H||r%2!==0||r-1<1||occupied([c,r-1])){valid=false;break;}
    resources.push([c,r-1],[c,r]); edges.push([key([c,r-1]),key([c,r])]);
  }
  if(!valid)continue;
  let cover=0n;
  for(const [c,r] of empty)cover|=maskForBlocker([[c,r]]);
  for(let ti=0;ti<targets.length;ti++){
    const T=targets[ti];
    const raceSolved=empty.every(([c,r])=>T.some(([tc,tr])=>tc===c&&tr>r));
    if(raceSolved)cover|=1n<<BigInt(ti);
  }
  addCoverage('AE',`AE ${label(G)}`,[...G,...resources.filter((_,i)=>i%2===0)],cover,{edges,ownGroup:label(G),empty:empty.map(key),race:true,ceBottoms:edges.map(e=>e[0])});
}

// Specialbefore. The internal playable group cell's Vertical is removed and
// replaced by a Baseinverse with an external currently playable square. The
// direct consequences are the BI pair, surviving CE/V component blockers, and
// the external+successor race blocker.
for(const B of beforeDefs){
  const internals=B.group.filter(x=>playable.some(p=>key(p)===key(x)));
  for(const internal of internals){
    const unused=B.components.find(q=>q.kind==='V'&&key(q.lower)===key(internal));
    for(const external of playable){
      if(key(external)===key(internal))continue;
      let ok=true;
      for(const sq of B.empty){
        const succ=[sq[0],sq[1]+1];
        if(external[0]===sq[0]||!pairConnect(external,succ)){ok=false;break;}
      }
      if(!ok)continue;
      const blockers=[[internal,external]];
      const resources=[internal,external];
      const edges=[[key(internal),key(external)],[key(external),key(internal)]];
      for(const q of B.components){
        if(unused&&q===unused)continue;
        resources.push(q.lower,q.upper);
        edges.push([key(q.lower),key(q.upper)]);
        blockers.push(q.kind==='CE'?[q.upper]:[q.lower,q.upper]);
      }
      blockers.push([external,...B.empty.map(([c,r])=>[c,r+1])]);
      addMulti('SPB',`SPB ${label(B.group)} i=${key(internal)} e=${key(external)}`,resources,blockers,{exclusive:true,ownGroup:label(B.group),internal:key(internal),external:key(external),race:true,edges,ceBottoms:B.components.filter(q=>q.kind==='CE').map(q=>key(q.lower)),spbBase:[key(internal),key(external)]});
    }
  }
}

function parseCell(s){const [c,r]=s.split(',').map(Number);return [c,r];}
function disjoint(a,b){for(const x of a.resources)if(b.resources.has(x))return false;return true;}
function byCol(c){const out=new Map();for(const s of c.resources){const [col]=parseCell(s);if(!out.has(col))out.set(col,new Set());out.get(col).add(s);}return out;}
function setEq(a,b){return a.size===b.size&&[...a].every(x=>b.has(x));}
function columnWiseDisjointOrEqual(a,b){const A=byCol(a),B=byCol(b);for(const [col,as] of A){const bs=B.get(col);if(!bs)continue;const intersects=[...as].some(x=>bs.has(x));if(intersects&&!setEq(as,bs))return false;}return true;}
function noClaimevenBelowOrAtInverse(inverse,ce){for(const is of inverse.resources){const [ic,ir]=parseCell(is);for(const cs of ce.ceBottoms||[]){const [cc,cr]=parseCell(cs);if(ic===cc&&ir>=cr)return false;}}return true;}
const order={CE:1,BI:2,V:3,AE:4,LI:5,HI:6,BC:7,BF:8,SPB:9};
function allowedFirst(a,b){
  switch(a.type){
    case 'CE':
      if(['CE','BI','V','AE','BC','BF','SPB'].includes(b.type))return disjoint(a,b);
      if(['LI','HI'].includes(b.type))return noClaimevenBelowOrAtInverse(b,a);
      break;
    case 'BI': return disjoint(a,b);
    case 'V': return disjoint(a,b);
    case 'AE':
      if(['AE','BF','SPB'].includes(b.type))return columnWiseDisjointOrEqual(a,b);
      if(['LI','HI'].includes(b.type))return disjoint(a,b)&&noClaimevenBelowOrAtInverse(b,a);
      if(b.type==='BC')return disjoint(a,b);
      break;
    case 'LI':
      if(['LI','HI'].includes(b.type))return disjoint(a,b);
      if(b.type==='BC')return disjoint(a,b)&&noClaimevenBelowOrAtInverse(a,b);
      if(['BF','SPB'].includes(b.type))return noClaimevenBelowOrAtInverse(a,b)&&columnWiseDisjointOrEqual(a,b);
      break;
    case 'HI':
      if(b.type==='HI')return disjoint(a,b);
      if(['BC','BF','SPB'].includes(b.type))return disjoint(a,b)&&noClaimevenBelowOrAtInverse(a,b);
      break;
    case 'BC': return disjoint(a,b);
    case 'BF': return columnWiseDisjointOrEqual(a,b);
    case 'SPB':
      if(b.type!=='SPB')break;
      for(const s of a.spbBase||[])if(b.resources.has(s))return false;
      return columnWiseDisjointOrEqual(a,b);
  }
  throw new Error(`unhandled compatibility ${a.type}/${b.type}`);
}
function compatible(a,b){
  if(order[a.type]<=order[b.type])return allowedFirst(a,b);
  return allowedFirst(b,a);
}

const conflict=certs.map(()=>new Set());for(let i=0;i<certs.length;i++)for(let j=i+1;j<certs.length;j++)if(!compatible(certs[i],certs[j])){conflict[i].add(j);conflict[j].add(i);}
const active=[...certs].sort((a,b)=>pop(b.cover)-pop(a.cover)||conflict[b.id].size-conflict[a.id].size);
let best={covered:0,mask:0n,chosen:[]};
function dfs(pos,mask,chosen,forbidden){const cnt=pop(mask);if(cnt>best.covered)best={covered:cnt,mask,chosen:[...chosen]};let optimistic=mask;for(let i=pos;i<active.length;i++)if(!forbidden.has(active[i].id))optimistic|=active[i].cover;if(pop(optimistic)<=best.covered)return;for(let i=pos;i<active.length;i++){const c=active[i];if(forbidden.has(c.id))continue;const nf=new Set(forbidden);for(const q of conflict[c.id])nf.add(q);chosen.push(c);dfs(i+1,mask|c.cover,chosen,nf);chosen.pop();}}
dfs(0,0n,[],new Set());
const coverers=targets.map((_,ti)=>active.filter(c=>((c.cover>>BigInt(ti))&1n)!==0n));
function satisfiable(indices){const need=new Set(indices);function rec(forbidden){if(!need.size)return true;let ti=-1,opts=null;for(const x of need){const o=coverers[x].filter(c=>!forbidden.has(c.id));if(opts===null||o.length<opts.length){ti=x;opts=o;if(!o.length)break;}}if(!opts.length)return false;need.delete(ti);for(const c of opts){const removed=[];for(const x of [...need])if(((c.cover>>BigInt(x))&1n)!==0n){need.delete(x);removed.push(x);}const nf=new Set(forbidden);for(const q of conflict[c.id])nf.add(q);if(rec(nf))return true;for(const x of removed)need.add(x);}need.add(ti);return false;}return rec(new Set());}
const all=[...targets.keys()];const fullSat=satisfiable(all);let core=[];if(!fullSat){core=[...all];let progress=true;while(progress){progress=false;for(let i=0;i<core.length;i++){const t=core.slice(0,i).concat(core.slice(i+1));if(!satisfiable(t)){core=t;progress=true;break;}}}for(let i=0;i<core.length;i++)assert(satisfiable(core.slice(0,i).concat(core.slice(i+1))));}

function colResources(c,col){return [...c.resources].filter(s=>s.startsWith(col+','));}
function componentHasLowerEdge(c,col){
  const a=`${col},2`,b=`${col},3`;
  if((c.edges||[]).some(e=>e[0]===a&&e[1]===b))return true;
  if((c.components||[]).some(s=>s===`V:${a}>${b}`))return true;
  return false;
}
function preservesLowerChannel(c,col){
  const rs=colResources(c,col);
  if(!rs.includes(`${col},2`)&&!rs.includes(`${col},3`))return true;
  const ss=new Set(rs);
  return ss.size===2&&ss.has(`${col},2`)&&ss.has(`${col},3`)&&componentHasLowerEdge(c,col);
}
function lowerChannels(c){return [2,3,4].filter(col=>c.resources.has(`${col},2`)&&c.resources.has(`${col},3`));}
function satRestricted(indices,keepCols){
  const need=new Set(indices);
  function rec(forbidden){
    if(!need.size)return true;
    let ti=-1,opts=null;
    for(const x of need){
      const o=coverers[x].filter(c=>!forbidden.has(c.id)&&keepCols.every(col=>preservesLowerChannel(c,col)));
      if(opts===null||o.length<opts.length){ti=x;opts=o;if(!o.length)break;}
    }
    if(!opts||!opts.length)return false;
    need.delete(ti);
    for(const c of opts){
      const removed=[];
      for(const x of [...need])if(((c.cover>>BigInt(x))&1n)!==0n){need.delete(x);removed.push(x);}
      const nf=new Set(forbidden);for(const q of conflict[c.id])nf.add(q);
      if(rec(nf))return true;
      for(const x of removed)need.add(x);
    }
    need.add(ti);return false;
  }
  return rec(new Set());
}
const a3Index=core.find(i=>label(targets[i])==='A3-B3-C3-D3');
assert.notEqual(a3Index,undefined);
const otherCore=core.filter(i=>i!==a3Index);
const preserveTests=[];
for(let m=0;m<8;m++){
  const cols=[2,3,4].filter((_,i)=>(m>>i)&1);
  preserveTests.push({channels:cols,satisfiable:satRestricted(otherCore,cols)});
}
const a3Coverers=coverers[a3Index];
const monotonicityViolations=[];
for(const a of a3Coverers){
  for(const col of lowerChannels(a)){
    for(const c of certs){
      if(c.id===a.id)continue;
      if(compatible(a,c)&&!preservesLowerChannel(c,col))monotonicityViolations.push({a:a.name,col,c:c.name});
    }
  }
}
assert.equal(monotonicityViolations.length,0);
assert(a3Coverers.every(c=>lowerChannels(c).length>=2));
for(const t of preserveTests.filter(t=>t.channels.length===1))assert.equal(t.satisfiable,true);
for(const t of preserveTests.filter(t=>t.channels.length>=2))assert.equal(t.satisfiable,false);

function subset(a,b){return a.every(x=>b.includes(x));}
function uniqueSets(xs){const m=new Map();for(const x of xs){const q=[...x].sort((a,b)=>a-b);m.set(q.join(','),q);}return [...m.values()];}
function minimalAntichain(xs){const u=uniqueSets(xs);return u.filter(a=>!u.some(b=>b!==a&&subset(b,a))).sort((a,b)=>a.join('').localeCompare(b.join('')));}
function maximalAntichain(xs){const u=uniqueSets(xs);return u.filter(a=>!u.some(b=>b!==a&&subset(a,b))).sort((a,b)=>a.join('').localeCompare(b.join('')));}
const minimalDemandAntichain=minimalAntichain(a3Coverers.map(lowerChannels));
const maximalPreservationAntichain=maximalAntichain(preserveTests.filter(t=>t.satisfiable).map(t=>t.channels));
assert.deepEqual(minimalDemandAntichain,[[2,3],[2,4],[3,4]]);
for(const d of minimalDemandAntichain)assert(!maximalPreservationAntichain.some(p=>subset(d,p)));
return {
  name,
  survivingP0Requirements:targets.length,
  candidates:certs.length,
  byType:Object.fromEntries(['CE','V','BI','LI','HI','BC','BF','AE','SPB'].map(t=>[t,certs.filter(c=>c.type===t).length])),
  completeCoverSatisfiable:fullSat,
  maximumCompatibleCoverage:`${best.covered}/${targets.length}`,
  inclusionMinimalCore:core.map(i=>label(targets[i])),
  lowerHorizontalCoverers:a3Coverers.map(c=>({type:c.type,name:c.name,channels:lowerChannels(c)})),
  lowerHorizontalMinimumChannelDemand:Math.min(...a3Coverers.map(c=>lowerChannels(c).length)),
  residualPreservationTests:preserveTests,
  residualMaximumSimultaneouslyPreservableChannels:Math.max(...preserveTests.filter(t=>t.satisfiable).map(t=>t.channels.length)),
  minimalDemandAntichain,
  maximalPreservationAntichain,
  compatibilityProjectionViolations:monotonicityViolations.length,
};
}

const results=[
  analyzeState('451123 / D1 E1 A1 A2 B1 C1',[[4,1],[1,1],[2,1]],[[5,1],[1,2],[3,1]]),
  analyzeState('451132 / D1 E1 A1 A2 C1 B1',[[4,1],[1,1],[3,1]],[[5,1],[1,2],[2,1]]),
];
assert.deepEqual(results[0].inclusionMinimalCore,results[1].inclusionMinimalCore);
assert.equal(results[0].lowerHorizontalMinimumChannelDemand,2);
assert.equal(results[1].lowerHorizontalMinimumChannelDemand,2);
assert.equal(results[0].residualMaximumSimultaneouslyPreservableChannels,1);
assert.equal(results[1].residualMaximumSimultaneouslyPreservableChannels,1);
console.log(JSON.stringify({geometry:{W,H,K,winningLines:lines.length},results},null,2));
