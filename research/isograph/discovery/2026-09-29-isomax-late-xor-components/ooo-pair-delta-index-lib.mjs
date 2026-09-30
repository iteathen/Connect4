import assert from 'node:assert/strict';
import {filterCompressedPairDelta} from './ooo-pair-delta-family-lib.mjs';

function parseTerms(raw){
  if(raw==='0')return [];
  return raw.split(',').filter(Boolean).map(term=>{
    let m=term.match(/^C:(\d+):([+-])$/);
    if(m)return {family:'C',index:Number(m[1]),sign:m[2],raw:term};
    m=term.match(/^D([01]):(\d+):([+-])$/);
    if(m)return {family:'D'+m[1],index:Number(m[2]),sign:m[3],raw:term};
    throw new Error('unknown C/D signed token '+term);
  });
}

function countKey(prefix,terms,buckets){
  const counts=new Map(buckets.map(x=>[x,0]));
  for(const t of terms){
    const k=prefix(t);
    assert.ok(counts.has(k),'unknown quotient bucket '+k);
    counts.set(k,counts.get(k)+1);
  }
  return [...counts].map(([k,n])=>k+'='+n).join(',');
}

export function quotientPairDelta(aVertex,bVertex,encoding,cMode,dMode){
  assert.ok(encoding==='SIGN'||encoding==='SIGNED_PARITY','unknown encoding '+encoding);
  assert.ok(cMode==='C_ROLELESS'||cMode==='C_EXACT_ROLE','unknown C mode '+cMode);
  assert.ok(['D_DEPTHLESS','D_DEPTH_PARITY','D_EXACT_DEPTH'].includes(dMode),'unknown D mode '+dMode);

  const raw=filterCompressedPairDelta(aVertex,bVertex,encoding,['C','D0','D1']);
  const terms=parseTerms(raw);
  const c=terms.filter(x=>x.family==='C');
  const d=terms.filter(x=>x.family==='D0'||x.family==='D1');

  const cKey=cMode==='C_EXACT_ROLE'
    ? (c.length?c.map(x=>x.raw).sort().join(','):'0')
    : countKey(x=>'C'+x.sign,c,['C+','C-']);

  let dKey;
  if(dMode==='D_EXACT_DEPTH'){
    dKey=d.length?d.map(x=>x.raw).sort().join(','):'0';
  }else if(dMode==='D_DEPTHLESS'){
    dKey=countKey(x=>x.family+x.sign,d,['D0+','D0-','D1+','D1-']);
  }else{
    dKey=countKey(
      x=>x.family+(x.index&1?'O':'E')+x.sign,
      d,
      ['D0E+','D0E-','D0O+','D0O-','D1E+','D1E-','D1O+','D1O-']
    );
  }
  return 'C{'+cKey+'}|D{'+dKey+'}';
}

export function roleDepthTriangleKey(vertices,encoding,cMode,dMode){
  assert.equal(vertices.length,3,'role-depth triangle requires exactly three vertices');
  return [
    quotientPairDelta(vertices[0],vertices[1],encoding,cMode,dMode),
    quotientPairDelta(vertices[0],vertices[2],encoding,cMode,dMode),
    quotientPairDelta(vertices[1],vertices[2],encoding,cMode,dMode)
  ].sort().join('|||');
}
