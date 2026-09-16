import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const C=3,D=4; // 1-based special columns
const key=(c,r)=>`${c},${r}`;

const lines=[];
for(let r=1;r<=H;r++) for(let c=1;c<=W;c++) for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]) {
  const line=[];
  for(let i=0;i<K;i++) {
    const cc=c+i*dc, rr=r+i*dr;
    if(cc<1||cc>W||rr<1||rr>H){line.length=0;break;}
    line.push([cc,rr]);
  }
  if(line.length===K) lines.push(line);
}
assert.equal(lines.length,69);
const lineKey=line=>line.map(([c,r])=>key(c,r)).join('|');
const lineSet=new Set(lines.map(lineKey));

// Normal columns use exact vertical trigger/response macros:
// P0 gets odd rows 1,3,5; P1 immediately gets even rows 2,4,6.
const normalColumns=[1,2,5,6,7];
const singletonBlockers=new Set([key(D,1)]);
for(const c of normalColumns) for(const r of [2,4,6]) singletonBlockers.add(key(c,r));
assert.equal(singletonBlockers.size,16);

// Tiny local automaton for the coupled C/D columns.  It is deliberately
// independent of every other column and of W/D/L values.
const cellBit=(col,row)=>1n<<BigInt((col-C)*H+(row-1));
const start={hC:1,hD:1,p0:cellBit(C,1),p1:cellBit(D,1)};
const stateKey=s=>`${s.hC}/${s.hD}/${s.p0.toString(16)}/${s.p1.toString(16)}`;
const queue=[start], seen=new Set([stateKey(start)]), intermediate=[];
let localMacroEdges=0, invalidResponses=0;
for(let qi=0;qi<queue.length;qi++) {
  const s=queue[qi];
  for(const col of [C,D]) {
    const h=col===C?s.hC:s.hD;
    if(h>=H) continue;
    localMacroEdges++;
    const row=h+1;
    const afterP0={...s,p0:s.p0|cellBit(col,row)};
    if(col===C) afterP0.hC=row; else afterP0.hD=row;
    intermediate.push(afterP0);

    let rc=col, rr=row+1;
    if(row===H) {
      rc=col===C?D:C;
      const oh=rc===C?afterP0.hC:afterP0.hD;
      rr=oh+1;
    }
    if(rr>H) { invalidResponses++; continue; }
    const ns={...afterP0,p1:afterP0.p1|cellBit(rc,rr)};
    if(rc===C) ns.hC=rr; else ns.hD=rr;
    const k=stateKey(ns);
    if(!seen.has(k)){seen.add(k);queue.push(ns);}
  }
}
assert.equal(invalidResponses,0);

const owns=(bits,c,r)=>(bits&cellBit(c,r))!==0n;
const forbiddenPairs=[
  [[C,3],[C,4]],
  [[D,3],[D,4]],
  [[C,3],[D,3]],
  [[C,5],[D,5]],
];
for(const s of intermediate) for(const pair of forbiddenPairs)
  assert(!pair.every(([c,r])=>owns(s.p0,c,r)));

// Support-precedence facts needed by the two race shadows.
for(const s of intermediate) {
  if(owns(s.p0,D,3)) assert(owns(s.p1,D,2));
  if(owns(s.p0,D,5)) assert(owns(s.p1,D,4));
}

// Generic support-shadow race certificate: if every P0 target cell u in R
// can be owned only after P1 owns support cell pred(u), and those supports
// themselves form P1 winning line Q, then Q completes strictly before R.
const raceCertificates=[
  {attacker:[[4,3],[5,3],[6,3],[7,3]], defender:[[4,2],[5,2],[6,2],[7,2]]},
  {attacker:[[4,5],[5,5],[6,5],[7,5]], defender:[[4,4],[5,4],[6,4],[7,4]]},
];
for(const cert of raceCertificates) {
  assert(lineSet.has(lineKey(cert.attacker)));
  assert(lineSet.has(lineKey(cert.defender)));
  for(let i=0;i<K;i++) {
    const [ac,ar]=cert.attacker[i], [dc,dr]=cert.defender[i];
    assert.equal(ac,dc); assert.equal(ar,dr+1);
    if(ac===D) assert([3,5].includes(ar));
    else { assert(normalColumns.includes(ac)); assert([3,5].includes(ar)); }
  }
}

function contains(line,cell){return line.some(([c,r])=>c===cell[0]&&r===cell[1]);}
function containsPair(line,pair){return pair.every(cell=>contains(line,cell));}
const classified={singleton:[],pair:[],race:[],unclassified:[]};
for(const line of lines) {
  if(line.some(([c,r])=>singletonBlockers.has(key(c,r)))) classified.singleton.push(line);
  else if(forbiddenPairs.some(pair=>containsPair(line,pair))) classified.pair.push(line);
  else if(raceCertificates.some(cert=>lineKey(cert.attacker)===lineKey(line))) classified.race.push(line);
  else classified.unclassified.push(line);
}
assert.equal(classified.singleton.length,56);
assert.equal(classified.pair.length,11);
assert.equal(classified.race.length,2);
assert.equal(classified.unclassified.length,0);

console.log(JSON.stringify({
  kind:'opening3-structural-safety-certificate',
  opening:{p0Column:3,p1ReplyColumn:4},
  proofAuthority:{exactGameValuesUsed:false,fullGameTreeUsed:false},
  geometry:{winningLines:lines.length},
  normalColumnLemma:{columns:normalColumns,p0Rows:[1,3,5],p1ResponseRows:[2,4,6]},
  coupledCDLocalAutomaton:{p0TurnStates:queue.length,p0MacroEdges:localMacroEdges,intermediateP0States:intermediate.length,invalidResponses},
  singletonBlockers:[...singletonBlockers].map(s=>s.split(',').map(Number)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
  forbiddenPairs,
  raceCertificates,
  coverage:{singleton:classified.singleton.length,pair:classified.pair.length,race:classified.race.length,total:classified.singleton.length+classified.pair.length+classified.race.length,unclassified:0},
  consequence:'P0 cannot complete any geometric winning line under the constructive P1 response policy; therefore P0 cannot force a win after opening column 3 and reply column 4.'
},null,2));
