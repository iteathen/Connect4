// Independent finite Boolean relation falsifier. Exhaustive 4x4 x 16
// legal P1 reply masks. No game positions, oracles or strategic tree search.
import {reduceUniversalResponseObligations} from './dual-response-obligation.mjs';
export function runGenericDualResponseControl() {
 const t=Date.now(),stats={schema:'connect4.dual-response-generic-control.v0_1',
  status:'PASS',matrices:0,scopedLegalMaskCases:0,
  totalReplyObligationsFullScope:0,minimalUniversalObligationsFullScope:0,
  matricesWithStrictReplyReduction:0,matricesWithoutReduction:0,
  totalStrictlyDominatedSignatureGroups:0,
  maxMinimalReplyAntichainWidth:0,totalProducerOperations:0,
  outcomeMismatches:0,transportMismatches:0,antichainMismatches:0,
  witnessMismatches:0,elapsedMs:0};
 for(let m=0;m<65536;m++){
  const columns=[m&15,(m>>>4)&15,(m>>>8)&15,(m>>>12)&15].map(BigInt);
  const union=columns.reduce((u,v)=>u|v,0n);
  for(let scope=0;scope<16;scope++){
   const legal=BigInt(scope),out=reduceUniversalResponseObligations(columns,legal);
   if(out.allP1RepliesCovered!==((union&legal)===legal)||
     out.oneP0ReplyWorksForAll!==columns.some(c=>(c&legal)===legal))
       throw Error('quantifier mismatch '+m+'/'+scope);
   const zero=[],replies=[];
   for(let b=0;b<4;b++)if((scope&(1<<b))!==0){
    let sig=0n;
    for(let a=0;a<4;a++)if((columns[a]&(1n<<BigInt(b)))!==0n)
      sig|=1n<<BigInt(a);
    replies.push(b);if(sig===0n)zero.push(b);
    const record=out.responseByP1Label.find(x=>x.replyColumn===b);
    if(!record||record.successActionMask!==sig)
      throw Error('label transport mismatch '+m+'/'+scope+'/'+b);
   }
   const best=zero.length?zero:replies;
   if(JSON.stringify(out.P1BestRepliesForBinaryBoundedThreatOnly)!==JSON.stringify(best))
      throw Error('bounded binary-threat best label mismatch');
   const min=out.minimalUniversalObligations;
   for(const g of min)for(const h of min)if(g!==h&&(g.successActionMask&h.successActionMask)===g.successActionMask)
      throw Error('minimal signatures not antichain');
   for(const d of out.redundantUniversalObligations){
    const witness=out.responseByP1Label.find(x=>x.replyColumn===d.dominatedByReplyColumn);
    if(!witness||(witness.successActionMask&d.successActionMask)!==witness.successActionMask)
      throw Error('false dominance certificate');
   }
   stats.scopedLegalMaskCases++;stats.totalProducerOperations+=out.statistics.operations;
   if(scope===15){
    stats.matrices++;stats.totalReplyObligationsFullScope+=4;
    stats.minimalUniversalObligationsFullScope+=min.length;
    stats.totalStrictlyDominatedSignatureGroups+=out.statistics.strictDominanceGroups;
    stats.maxMinimalReplyAntichainWidth=Math.max(stats.maxMinimalReplyAntichainWidth,min.length);
    if(min.length<4)stats.matricesWithStrictReplyReduction++;
    else stats.matricesWithoutReduction++;
   }
  }
 }
 stats.reductionPercent=+(100*(1-stats.minimalUniversalObligationsFullScope/stats.totalReplyObligationsFullScope)).toFixed(6);
 stats.elapsedMs=Date.now()-t;
 return stats;
}
if(import.meta.url===new URL(process.argv[1],'file:').href)
 console.log(JSON.stringify(runGenericDualResponseControl(),null,2));
