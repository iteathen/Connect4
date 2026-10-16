// Exact LOCAL reverse-checker for a proposed standard-7x6 G2 support-fiber map.
// Neither a G2 canonical key nor an oracle, frontier compiler, or recursive solver
// is consulted. A witness maps source open columns to target open columns.
// Completed source columns have witness entry -1.
const W=7,H=6,K=4;
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];

function fail(message){throw new Error('G2_REVERSE_CERTIFICATE: '+message);}
function bit(c,r){return 1n<<BigInt(r*W+c);}
function supportCheck(h,label){
  if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H))
    fail(label+' invalid support');
}
function rank(h){return h.reduce((sum,v)=>sum+v,0);}
function maskOfOccupied(h){
  let m=0n;
  for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)m|=bit(c,r);
  return m;
}
function maskOfFuture(h){
  let m=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)m|=bit(c,r);
  return m;
}
// Independent geometric enumerator: all placements of a four-cell line,
// including both diagonals. Do not derive these from the G2 canonicalizer.
function geometricLines(){
  const out=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++){
    for(const [dx,dy] of DIRECTIONS){
      const ec=c+(K-1)*dx,er=r+(K-1)*dy;
      if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0n;
      for(let k=0;k<K;k++)m|=bit(c+k*dx,r+k*dy);
      out.push(m);
    }
  }
  if(out.length!==69||new Set(out.map(String)).size!==69)fail('geometric basis not 69 distinct lines');
  return out;
}
const LINES=geometricLines();
function residualShapes(h){
  const occupied=maskOfOccupied(h);
  const out=new Map();
  for(const l of LINES){
    const remainder=l&~occupied;
    if(remainder!==0n)out.set(remainder.toString(),remainder);
  }
  return [...out.values()];
}
function equalMaskSets(xs,ys){
  if(xs.length!==ys.length)return false;
  const y=new Set(ys.map(String));
  return xs.every(x=>y.has(String(x)));
}

export function verifyG2ReverseCertificate(source,target,columnMap){
  supportCheck(source,'source');supportCheck(target,'target');
  if(rank(source)!==rank(target))fail('occupied rank differs');
  if(!Array.isArray(columnMap)||columnMap.length!==W)fail('witness length must be 7');
  const seen=new Set(),active=[];
  for(let c=0;c<W;c++){
    const d=columnMap[c];
    if(source[c]===H){if(d!==-1)fail('full column '+c+' must map to -1');continue;}
    if(!Number.isInteger(d)||d<0||d>=W||target[d]===H)fail('illegal target column at '+c);
    if(seen.has(d))fail('non-injective action/chain map');
    if(source[c]!==target[d])fail('gravity-chain length or landing height mismatch');
    seen.add(d);active.push([c,d]);
  }
  if(seen.size!==target.filter(v=>v<H).length)fail('not onto target future chains');

  const sourceFuture=maskOfFuture(source);
  function translate(mask){
    if((mask&~sourceFuture)!==0n)fail('witness applied to a past cell');
    let mapped=0n;
    for(const [c,d] of active){
      for(let r=source[c];r<H;r++)if(mask&bit(c,r))mapped|=bit(d,r);
    }
    return mapped;
  }
  if(translate(sourceFuture)!==maskOfFuture(target))fail('future-cell map not bijective');

  const srcShapes=residualShapes(source),dstShapes=residualShapes(target);
  const translatedShapes=srcShapes.map(translate);
  if(!equalMaskSets(translatedShapes,dstShapes))fail('residual hyperedge incidence not preserved');

  let localCofactorChecks=0,childShapeChecks=0,basicControlChecks=0;
  for(const [c,d] of active){
    const sourceLanding=bit(c,source[c]),targetLanding=bit(d,target[d]);
    if(translate(sourceLanding)!==targetLanding)fail('frontier/action mismatch');
    const sourceChild=source.slice(),targetChild=target.slice();
    sourceChild[c]++;targetChild[d]++;
    const srcChildShapes=residualShapes(sourceChild),dstChildShapes=residualShapes(targetChild);
    if(!equalMaskSets(srcChildShapes.map(translate),dstChildShapes))
      fail('mapped successor residual hyperedges differ for action '+c);
    childShapeChecks+=srcChildShapes.length;
    for(let i=0;i<srcShapes.length;i++){
      const s=srcShapes[i],t=translatedShapes[i];
      // Owner-true: remove the landing event (possibly producing the
      // empty requirement, which is the immediate-win/terminal marker).
      if(translate(s&~sourceLanding)!==(t&~targetLanding))
        fail('owner-true principal cofactor mismatch, action '+c+', shape '+i);
      localCofactorChecks++;
      // Owner-false: the residual requirement survives iff the landing
      // event is absent. Otherwise the requirement is destroyed.
      const sourceKilled=(s&sourceLanding)!==0n;
      const targetKilled=(t&targetLanding)!==0n;
      if(sourceKilled!==targetKilled)fail('owner-false principal cofactor mismatch');
      if(!sourceKilled&&translate(s)!==t)fail('owner-false surviving cofactor mismatch');
      localCofactorChecks++;
    }
  }
  for(const [c,d] of active)for(let r=source[c];r<H;r++){
    // Scope: *basic zero-reservation CPC event-control parity only*.
    // Full CPC/NDC reservations, deadlines and dependency certificates are
    // deliberately NOT asserted by G2.
    const paritySource=(((W-1)*H+r)&1);
    const parityTarget=(((W-1)*H+r)&1);
    if(paritySource!==parityTarget||translate(bit(c,r))!==bit(d,r))
      fail('basic CPC event relation mismatch');
    basicControlChecks++;
  }
  return Object.freeze({
    schema:'connect4.g2-reverse-certificate.v0_1',
    rank:rank(source),
    mappedCells:42-rank(source),
    legalActions:active.length,
    residualShapes:srcShapes.length,
    localCofactorChecks,
    childShapeChecks,
    basicControlChecks,
    recursivelyExpandedStates:0,
    oracleQueries:0
  });
}
