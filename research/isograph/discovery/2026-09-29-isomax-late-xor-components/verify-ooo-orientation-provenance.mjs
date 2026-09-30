import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const warrant=JSON.parse(fs.readFileSync(new URL('./EXPERIMENTAL_WARRANT_RS_071.json',base),'utf8'));
const vocab=JSON.parse(fs.readFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_VOCAB_0_1.json',base),'utf8'));
const isg=fs.readFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_0_1.isg',base),'utf8');
const spec=fs.readFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_SPEC_0_1.md',base),'utf8');

assert.equal(warrant.id,'EW-RS-071');
assert.deepEqual(warrant.cases,['6x3-k3','4x5-k4','6x3-k4']);
assert.equal(warrant.sealedFormulaHoldouts.primary,'3x6-k4');
assert.equal(warrant.sealedFormulaHoldouts.backup,'5x3-k4');
assert.equal(warrant.sealedFormulaHoldouts.outcomesMayBeAccessed,false);

const ids=[...isg.matchAll(/\^(\d+)/g)].map(m=>m[1]).filter(x=>x!=='0');
for(const id of ids){
  assert.ok(vocab.nodes[id]||vocab.relations[id],'undeclared IsoGraph id '+id);
}

const relationIds=new Set(Object.keys(vocab.relations));
for(const line of isg.split('\n')){
  const m=line.match(/\(\^(\d+)\s+(\d+)\s+(\d+)\)/);
  if(!m)continue;
  assert.ok(relationIds.has(m[1]),'edge uses non-relation '+m[1]);
  assert.ok(vocab.nodes[m[2]],'edge source is not node '+m[2]);
  assert.ok(vocab.nodes[m[3]],'edge target is not node '+m[3]);
}

function lines(W,H,K){
  const dirs=[
    {name:'H',dc:1,dr:0},
    {name:'V',dc:0,dr:1},
    {name:'D+',dc:1,dr:1},
    {name:'D-',dc:1,dr:-1}
  ];
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const d of dirs){
    const er=r+(K-1)*d.dr,ec=c+(K-1)*d.dc;
    if(er<0||er>=H||ec<0||ec>=W)continue;
    const cells=[];
    for(let i=0;i<K;i++)cells.push([r+i*d.dr,c+i*d.dc]);
    out.push({ori:d.name,cells});
  }
  return out;
}

function key(cells){
  return cells.map(([r,c])=>r+':'+c).sort().join(',');
}
function reflectedKey(cells,W){
  return key(cells.map(([r,c])=>[r,W-1-c]));
}
function reflectedOri(o){
  return o==='D+'?'D-':o==='D-'?'D+':o;
}

const reflection={};
for(const [W,H,K] of [[6,3,3],[4,5,4],[6,3,4]]){
  const L=lines(W,H,K);
  const lookup=new Map(L.map(x=>[x.ori+'|'+key(x.cells),x]));
  const counts={H:0,V:0,'D+':0,'D-':0};
  let mismatches=0;
  for(const l of L){
    counts[l.ori]++;
    const k=reflectedOri(l.ori)+'|'+reflectedKey(l.cells,W);
    if(!lookup.has(k))mismatches++;
  }
  const label=W+'x'+H+'-k'+K;
  assert.equal(mismatches,0,label+' reflection mismatch');
  assert.equal(counts['D+'],counts['D-'],label+' diagonal reflection cardinality mismatch');
  reflection[label]={lineCount:L.length,counts,mismatches};
}

for(const required of [
  '- H -> H',
  '- V -> V',
  '- D+ -> D-',
  '- D- -> D+',
  'duplicate residual masks',
  'strict-superset absorption'
]){
  assert.ok(spec.toLowerCase().includes(required.toLowerCase()),'spec missing '+required);
}

const out={
  schema:'connect4.isomax.ooo_orientation_provenance_spec_verify.v1',
  warrant:'EW-RS-071',
  status:'PASS',
  reflection,
  isograph:{nodeCount:Object.keys(vocab.nodes).length,relationCount:Object.keys(vocab.relations).length,referencedIds:ids.length},
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_SPEC_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
