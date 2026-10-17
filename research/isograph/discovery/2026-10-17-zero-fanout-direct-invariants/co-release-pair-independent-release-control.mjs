// INDEPENDENT structural response-timing falsifier of SOURCE-ONLY
// co-release pairing: explore all possible attacker legal choices on
// small gravity chains, with defender responding at once to the mate.
// This gameplay-order enumeration is VALIDATION ONLY, never producer.
// Guard deliberately invalid shifted-rung pairs with inaccessible mates.
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';

export function runIndependentCoReleasePairResponseControl(){
 const out={schema:'connect4.co-release-pair-independent-response-timing.v0_1',
  status:'PASS',abstractSourceProfilesConsidered:0,
  abstractSourceSinglePairGeneratorsTried:0,
  actualSourceCertificates:0,
  independentlyVerifiedMatchedCellEvents:0,
  attackerLegalMoveOrdersChecked:0,
  independentDefenderMateAvailabilityChecks:0,
  invalidDifferentRelativeReleaseOrdinalsRejected:true,
  invalidUncoveredSourceGeneratorNotCertifiable:true,
  sourceProducerFutureGameEvaluations:0};
 function bit(W,c,r){return 1n<<BigInt(r*W+c);}
 function validatePairing(W,H,heights,pairs){
  const mate=new Map(),sourceCells=new Set();
  for(let c=0;c<W;c++)for(let r=heights[c];r<H;r++)
    sourceCells.add(String(bit(W,c,r)));
  for(const mask of pairs){
   const cells=[];
   for(let c=0;c<W;c++)for(let r=heights[c];r<H;r++)
    if((mask&bit(W,c,r))!==0n)cells.push({c,r,x:String(bit(W,c,r))});
   if(cells.length!==2)throw Error('source match pair has wrong number of cells');
   for(const [i,j] of [[0,1],[1,0]]){
    if(mate.has(cells[i].x))throw Error('source future cell appears in multiple pairs');
    mate.set(cells[i].x,cells[j]);
    out.independentlyVerifiedMatchedCellEvents++;
   }
  }
  if(mate.size!==sourceCells.size)throw Error('source matching leaves unpaired future cells');
  let explored=0;
  function walk(pos){
   out.attackerLegalMoveOrdersChecked++;
   if(++explored>20000)throw Error('small-board proof-control order-exploration limit');
   const choices=[];
   for(let c=0;c<W;c++)if(pos[c]<H)choices.push(c);
   if(choices.length===0)return;
   for(const c of choices){
    const played=String(bit(W,c,pos[c]));
    const other=mate.get(played);
    if(!other)throw Error('attacker first touch not part of source pairing');
    const newPos=pos.slice();newPos[c]++;
    out.independentDefenderMateAvailabilityChecks++;
    if(newPos[other.c]!==other.r)
      throw Error('defender mate INACCESSIBLE after source legal attacker move');
    newPos[other.c]++;
    walk(newPos);
   }
  }
  walk(heights.slice());
 }
 for(const geometry of [{width:2,height:4,connect:2},{width:3,height:3,connect:3}]){
  const {width:W,height:H}=geometry,make=createCoReleasePairBlockProof(geometry),
    profiles=Math.pow(H+1,W);
  for(let code=0;code<profiles;code++){
   let x=code,h=Array.from({length:W},()=>{const y=x%(H+1);x=Math.floor(x/(H+1));return y;});
   const remain=h.reduce((v,z)=>v+H-z,0);
   if(!remain||remain%2)continue;
   out.abstractSourceProfilesConsidered++;
   const cells=[];
   for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)cells.push(bit(W,c,r));
   const targets=[];
   for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)
    targets.push(cells[i]|cells[j]);
   for(const target of targets){
    out.abstractSourceSinglePairGeneratorsTried++;
    const cert=make.prove(h,[target],{maxOperations:300000,maxMs:15000});
    if(cert.status!=='EXACT_GRAVITY_CO_RELEASE_DEFENDER_PAIR_CERTIFICATE')continue;
    out.actualSourceCertificates++;
    const pairs=cert.sourceBlocks.flatMap(block=>block.sourcePairMasksHex.map(BigInt));
    if(!pairs.some(mask=>(mask&target)===mask))
     throw Error('source pairing returned despite missing requested coverage');
    validatePairing(W,H,h,pairs);
   }
  }
 }
 // Two columns, two heights both zero; these crossed cells are paired
 // with DIFFERENT original release ordinals. Attacker can take (c0,r0)
 // immediately, but defender cannot respond at (c1,r1).
 const badH=[0,0],badPairs=[bit(2,0,0)|bit(2,1,1),
     bit(2,0,1)|bit(2,1,0)];
 try{validatePairing(2,2,badH,badPairs);
  out.invalidDifferentRelativeReleaseOrdinalsRejected=false;
 }catch(e){
  if(!String(e).includes('INACCESSIBLE'))throw e;
 }
 if(!out.invalidDifferentRelativeReleaseOrdinalsRejected)
  throw Error('invalid cross pair with distinct release ranks falsely accepted');
 return out;
}
