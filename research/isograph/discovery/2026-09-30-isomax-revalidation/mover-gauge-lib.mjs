import assert from 'node:assert/strict';
const swappedCache=new Map();
function parse(d){
  const p=d.split('|');assert.equal(p.length,4);
  const width=Number(p[0].slice(1)),caps=p[1].slice(4).split('.').map(Number);
  assert.equal(caps.length,width);assert.ok(caps.every(c=>c===0||c===1));
  const residual=s=>s===''?[]:s.split(';').map(mask=>mask.split(',').map(cell=>cell.split(':').map(Number)));
  return {width,caps,owners:[residual(p[2].slice(3)),residual(p[3].slice(3))]};
}
export function swapDescriptorOwners(d){
  if(swappedCache.has(d))return swappedCache.get(d);
  const {width,caps,owners}=parse(d),perm=Array(width),used=new Set();let best=null;
  function visit(i){
    if(i<width){for(let j=0;j<width;j++)if(!used.has(j)){used.add(j);perm[i]=j;visit(i+1);used.delete(j);}return;}
    const c=Array(width);for(let role=0;role<width;role++)c[perm[role]]=caps[role];
    const encode=rs=>rs.map(mask=>mask.map(([depth,role])=>`${depth}:${perm[role]}`).sort().join(',')).sort().join(';');
    const key=`w${width}|cap=${c.join('.')}|r0=${encode(owners[1])}|r1=${encode(owners[0])}`;
    if(best===null||key<best)best=key;
  }
  visit(0);swappedCache.set(d,best);return best;
}
export function moverFromSignature(signature,cellCount){
  let remainingParity=0;
  for(const [d,z] of signature){assert.ok(z==='O'||z==='E');if(z==='O')for(const cap of parse(d).caps)remainingParity^=cap;}
  return (cellCount&1)^remainingParity;
}
export function gaugeSignature(signature,cellCount,mode){
  assert.ok(['FIXED','OWNER_SWAPPED_CANONICAL','MOVER_CANONICAL'].includes(mode));
  const swap=mode==='OWNER_SWAPPED_CANONICAL'||(mode==='MOVER_CANONICAL'&&moverFromSignature(signature,cellCount)===1);
  const out=signature.map(([d,z])=>[swap?swapDescriptorOwners(d):d,z]).sort(([a],[b])=>a<b?-1:a>b?1:0);
  assert.equal(new Set(out.map(([d])=>d)).size,out.length,'owner swap must be descriptor-bijective');return out;
}
export function selectedVertex(d){
  const {width,caps,owners}=parse(d);
  const hist=rs=>{const h=new Map();for(const mask of rs)for(const [depth] of mask)h.set(depth,(h.get(depth)??0)+1);return [...h].sort((a,b)=>a[0]-b[0]).map(([depth,n])=>`${depth}:${n}`).join(',');};
  return `w${width}|cap=${caps.join('.')}|dh0=${hist(owners[0])}|dh1=${hist(owners[1])}`;
}
