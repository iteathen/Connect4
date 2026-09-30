import assert from 'node:assert/strict';

export function parseSelectedVertex(vertex){
  const parts=vertex.split('|');
  assert.equal(parts.length,4,'selected motif vertex must have w|cap|dh0|dh1');
  assert.ok(/^w\d+$/.test(parts[0]),'invalid width field');
  assert.ok(parts[1].startsWith('cap='),'invalid cap field');
  assert.ok(parts[2].startsWith('dh0='),'invalid owner0 depth histogram');
  assert.ok(parts[3].startsWith('dh1='),'invalid owner1 depth histogram');

  const width=Number(parts[0].slice(1));
  const capBody=parts[1].slice(4);
  const caps=capBody===''?[]:capBody.split('.').map(Number);
  assert.equal(caps.length,width,'capacity mask width mismatch');
  for(const c of caps)assert.ok(c===0||c===1,'capacity mask must be binary');

  function parseHist(body){
    const out=new Map();
    if(body==='')return out;
    for(const term of body.split(',').filter(Boolean)){
      const [dText,nText]=term.split(':');
      const d=Number(dText),n=Number(nText);
      assert.ok(Number.isInteger(d)&&d>=0,'depth must be a nonnegative integer');
      assert.ok(Number.isInteger(n)&&n>0,'depth count must be positive');
      assert.ok(!out.has(d),'duplicate depth histogram entry');
      out.set(d,n);
    }
    return new Map([...out].sort((a,b)=>a[0]-b[0]));
  }

  return {
    raw:vertex,
    width,
    caps,
    d0:parseHist(parts[2].slice(4)),
    d1:parseHist(parts[3].slice(4))
  };
}

function vectorCountsParsed(z){
  const m=new Map();
  m.set('W',z.width);
  for(let i=0;i<z.caps.length;i++)if(z.caps[i])m.set('C:'+i,1);
  for(const [d,n] of z.d0)m.set('D0:'+d,n);
  for(const [d,n] of z.d1)m.set('D1:'+d,n);
  return m;
}

function directedDeltaParsed(a,b){
  const va=vectorCountsParsed(a),vb=vectorCountsParsed(b);
  const keys=[...new Set([...va.keys(),...vb.keys()])].sort();
  const terms=[];
  for(const k of keys){
    const d=(vb.get(k)??0)-(va.get(k)??0);
    if(d!==0)terms.push(k+'='+d);
  }
  return terms.length?terms.join(','):'0';
}

export function exactPairDelta(aVertex,bVertex){
  const [lo,hi]=aVertex<=bVertex?[aVertex,bVertex]:[bVertex,aVertex];
  return directedDeltaParsed(parseSelectedVertex(lo),parseSelectedVertex(hi));
}

function l1Hist(a,b){
  const keys=new Set([...a.keys(),...b.keys()]);
  let n=0;
  for(const k of keys)n+=Math.abs((a.get(k)??0)-(b.get(k)??0));
  return n;
}

export function pairNormProfile(aVertex,bVertex){
  const a=parseSelectedVertex(aVertex),b=parseSelectedVertex(bVertex);
  const n=Math.max(a.width,b.width);
  let cap=0;
  for(let i=0;i<n;i++)if((a.caps[i]??0)!==(b.caps[i]??0))cap++;
  return 'dw='+Math.abs(a.width-b.width)+
    '|cap='+cap+
    '|d0='+l1Hist(a.d0,b.d0)+
    '|d1='+l1Hist(a.d1,b.d1);
}

function widthCap(z){
  return 'w'+z.width+'|cap='+z.caps.join('.');
}

function ownerTotal(h){
  let n=0;
  for(const v of h.values())n+=v;
  return n;
}

function depthParity(h){
  return [...h]
    .filter(([,n])=>(n&1)!==0)
    .map(([d])=>d)
    .sort((a,b)=>a-b)
    .join('.');
}

function baseCandidate(vertices,mode,baseIndex){
  const parsed=vertices.map(parseSelectedVertex);
  const base=parsed[baseIndex];
  const legs=[];
  for(let i=0;i<3;i++)if(i!==baseIndex)legs.push(directedDeltaParsed(base,parsed[i]));
  legs.sort();
  const legKey='L|'+legs.join('||');

  if(mode==='BASEFREE_TWO_LEG_EXCHANGE')return legKey;
  if(mode==='BASEFREE_PLUS_BASE_WIDTH_CAP')
    return 'B|'+widthCap(base)+'|'+legKey;
  if(mode==='BASEFREE_PLUS_BASE_WIDTH_CAP_OWNER_TOTALS')
    return 'B|'+widthCap(base)+'|t0='+ownerTotal(base.d0)+'|t1='+ownerTotal(base.d1)+'|'+legKey;
  if(mode==='BASEFREE_PLUS_BASE_WIDTH_CAP_OWNER_DEPTH_PARITY')
    return 'B|'+widthCap(base)+'|p0='+depthParity(base.d0)+'|p1='+depthParity(base.d1)+'|'+legKey;
  if(mode==='BASEFREE_PLUS_BASE_FULL_VERTEX')
    return 'B|'+base.raw+'|'+legKey;
  throw new Error('unknown base exchange mode '+mode);
}

export function exchangeCircuitKey(vertices,mode){
  assert.equal(vertices.length,3,'exchange circuit requires exactly three vertices');
  const vs=[...vertices];

  if(mode==='EXCHANGE_NORM_TRIANGLE'){
    return [
      pairNormProfile(vs[0],vs[1]),
      pairNormProfile(vs[0],vs[2]),
      pairNormProfile(vs[1],vs[2])
    ].sort().join('|||');
  }

  if(mode==='EXCHANGE_EXACT_DELTA_TRIANGLE'){
    return [
      exactPairDelta(vs[0],vs[1]),
      exactPairDelta(vs[0],vs[2]),
      exactPairDelta(vs[1],vs[2])
    ].sort().join('|||');
  }

  if(mode.startsWith('BASEFREE_')){
    return [0,1,2].map(i=>baseCandidate(vs,mode,i)).sort()[0];
  }

  if(mode==='FULL_TRIPLE_MOTIF')return [...vs].sort().join('|||');

  throw new Error('unknown exchange circuit mode '+mode);
}
