// Exact standard-7x6 G2 support-fiber canonicalization and packed-q transport.
// A fiber is the support-conditioned gravity-chain + residual-hyperedge incidence object.
// Canonicalization enumerates only permutations of equal-length future gravity chains.

const W=7,H=6,K=4;
function cellBit(c,r){return 1n<<BigInt(r*W+c);}
function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function* perms(a,at=0){
  if(at===a.length){yield a.slice();return;}
  for(let i=at;i<a.length;i++){[a[at],a[i]]=[a[i],a[at]];yield* perms(a,at+1);[a[at],a[i]]=[a[i],a[at]];}
}
function* productPermutations(groups,at=0,current=[]){
  if(at===groups.length){yield current.slice();return;}
  for(const p of perms(groups[at]))yield* productPermutations(groups,at+1,[...current,p]);
}
function lines(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r);out.push(m);}
  for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c,r+i);out.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r+i);out.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r-i);out.push(m);}
  return out;
}
const LINES=lines();

function supportMask(h){let s=0n;for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)s|=cellBit(c,r);return s;}
export function g2ResidualShapes(h){
  const S=supportMask(h),set=new Map();
  for(const l of LINES){const r=l&~S;if(r!==0n)set.set(r.toString(),r);}
  return [...set.values()].sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b));
}

export function canonicalizeG2Fiber(h){
  if(!Array.isArray(h)||h.length!==W||h.some(x=>!Number.isInteger(x)||x<0||x>H))throw new Error('invalid standard7x6 support');
  const caps=h.map(x=>H-x),active=[];
  for(let c=0;c<W;c++)if(caps[c]>0)active.push(c);
  const byLength=new Map();
  for(const c of active){const l=caps[c];if(!byLength.has(l))byLength.set(l,[]);byLength.get(l).push(c);}
  const lengths=[...byLength.keys()].sort((a,b)=>b-a),groups=lengths.map(l=>byLength.get(l));
  const shapes=g2ResidualShapes(h);
  let best=null,permutationCount=0;
  for(const groupPerms of productPermutations(groups)){
    permutationCount++;
    const cellMap=new Map(),canonicalColumnByFrontierId=new Map();
    let nextCell=0;
    for(let gi=0;gi<lengths.length;gi++){
      const l=lengths[gi],order=groupPerms[gi];
      for(const c of order){
        for(let d=0;d<l;d++){
          const id=nextCell++;
          cellMap.set(c*H+(h[c]+d),id);
          if(d===0)canonicalColumnByFrontierId.set(id,c);
        }
      }
    }
    const shapeKeyByIndex=[];
    for(const shape of shapes){
      const ids=[];
      for(let c=0;c<W;c++)for(let r=h[c];r<H;r++){
        if(shape&cellBit(c,r))ids.push(cellMap.get(c*H+r));
      }
      ids.sort((a,b)=>a-b);
      shapeKeyByIndex.push(ids.join('.'));
    }
    const sortedShapeKeys=shapeKeyByIndex.slice().sort();
    const chainLengths=lengths.flatMap((l,i)=>Array(groups[i].length).fill(l));
    const key=JSON.stringify([chainLengths,sortedShapeKeys]);
    if(best===null||key<best.key){
      const frontierIdByColumn=Array(W).fill(-1);
      for(let c=0;c<W;c++)if(h[c]<H)frontierIdByColumn[c]=cellMap.get(c*H+h[c]);
      best={key,shapeKeyByIndex,frontierIdByColumn,cellMap};
    }
  }
  return Object.freeze({...best,shapes:Object.freeze(shapes),permutationCount});
}

function assertInfoMatchesCanonical(info,canonical,label){
  if(!info||!Array.isArray(info.shapes)||info.shapes.length!==canonical.shapes.length)throw new Error(label+' shape count mismatch');
  for(let i=0;i<info.shapes.length;i++)if(info.shapes[i]!==canonical.shapes[i])throw new Error(label+' shape ordering mismatch');
}
export function createG2PackedTransport(sourceInfo,sourceCanonical,targetInfo,targetCanonical){
  if(sourceCanonical.key!==targetCanonical.key)throw new Error('G2 transport requires equal canonical fiber keys');
  assertInfoMatchesCanonical(sourceInfo,sourceCanonical,'source');
  assertInfoMatchesCanonical(targetInfo,targetCanonical,'target');
  if(sourceInfo.n!==targetInfo.n)throw new Error('G2 transport changed residual-shape cardinality');
  const targetByCanonicalShape=new Map();
  for(let j=0;j<targetCanonical.shapeKeyByIndex.length;j++){
    const k=targetCanonical.shapeKeyByIndex[j];
    if(targetByCanonicalShape.has(k))throw new Error('duplicate target canonical residual key');
    targetByCanonicalShape.set(k,j);
  }
  const shapeMap=sourceCanonical.shapeKeyByIndex.map(k=>{
    const j=targetByCanonicalShape.get(k);
    if(j===undefined)throw new Error('missing target canonical residual shape');
    return j;
  });
  function mapBits(bits){
    let out=0n;
    for(let i=0;i<shapeMap.length;i++)if(bits&(1n<<BigInt(i)))out|=1n<<BigInt(shapeMap[i]);
    return out;
  }
  function unpack(info,q){return{m:q&info.all,o:info.all^((q>>BigInt(info.n))&info.all)};}
  function pack(info,m,o){return m|((info.all^o)<<BigInt(info.n));}
  function q(q){
    const {m,o}=unpack(sourceInfo,q);
    return pack(targetInfo,mapBits(m),mapBits(o));
  }
  const targetColumnByCanonicalFrontier=new Map();
  for(let c=0;c<W;c++){const id=targetCanonical.frontierIdByColumn[c];if(id>=0)targetColumnByCanonicalFrontier.set(id,c);}
  const actionMap=sourceCanonical.frontierIdByColumn.map(id=>id<0?-1:(targetColumnByCanonicalFrontier.get(id)??-1));
  return Object.freeze({q,shapeMap:Object.freeze(shapeMap),actionMap:Object.freeze(actionMap)});
}
export function transportG2Front(sourceInfo,sourceCanonical,targetInfo,targetCanonical,front){
  const t=createG2PackedTransport(sourceInfo,sourceCanonical,targetInfo,targetCanonical);
  const out=front.map(t.q).sort(cmpBig);
  if(new Set(out.map(String)).size!==out.length)throw new Error('G2 transport collapsed distinct frontier generators');
  return out;
}
export function samePackedSet(a,b){
  if(a.length!==b.length)return false;
  const A=a.slice().sort(cmpBig),B=b.slice().sort(cmpBig);
  for(let i=0;i<A.length;i++)if(A[i]!==B[i])return false;
  return true;
}
