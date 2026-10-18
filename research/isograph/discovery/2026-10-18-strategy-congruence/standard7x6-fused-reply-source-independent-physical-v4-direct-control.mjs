// FROZEN before execution: invoke the previously independently frozen true
// ORIGINAL W7 H6 K4 69-winline physical first-action WDL comparator directly
// against the NEW fused opponent-reply bitmask SOURCE. The tiny adapter
// renames only source output field names; NO mathematical logic or physical
// oracle is altered. Candidate input was frozen BEFORE physical V4 reference.
// V4 factory is supplied at runtime from pinned read-only source bundle and
// separately pinned fixed swap dependency; no source GAME values computed.
import {createSourceBitsetFusedUniformReplyWdlOrder} from './standard7x6-source-bitset-fused-uniform-reply-WDL-order.mjs';
import {checkFrozenUniformReplyFiberCandidates} from './standard7x6-uniform-reply-fiber-independent-physical-v4-marginal-control.mjs';
export function runFusedSourcePhysicalV4DirectControl(frozenPacket,{createV4Source}){
 if(typeof createV4Source!=='function')throw Error('unchanged pinned historical V4 factory required');
 const adaptedSourceFactory=geometry=>{
  const fused=createSourceBitsetFusedUniformReplyWdlOrder(geometry);
  return {
   certify(q){
    const r=fused.compute(q);
    return {
     status:r.status==='SOURCE_CERTIFIED_ONE_BEST_ORIGINAL_ACTION'?
       'SOURCE_CERTIFIED_ONE_BEST_ORIGINAL_ACTION':'INCOMPLETE_UNPROVEN_GLOBAL_ACTION_EXTREMUM',
     sourceWeakOriginalActionOrderEdges:
       r.sourceWeakOriginalFirstActionOrderEdges.map(e=>({
        originalFirstActionA:e.originalFirstActionA,
        originalFirstActionB:e.originalFirstActionB,
        mapKind:e.deterministicRootMapKind,
        sourceNonterminalReplyMaskHex:e.sourceNonterminalReplyMaskHex,
        sourceSafeTerminalReplyMaskHex:e.sourceSafeTerminalReplyMaskHex
       })),
     selectedOriginalBestLiteralColumn:r.selectedOriginalLiteralBestColumn,
     statistics:r.statistics
    };
   }
  };
 };
 const result=checkFrozenUniformReplyFiberCandidates(frozenPacket,{
  createUniformSource:adaptedSourceFactory,
  createV4Source,
  maxPhysicalUniqueStatesPerRoot:250000,
  maxV4MsPerRoot:500,
  maxV4OperationsPerRoot:180000});
 if(result.metrics.physicallyCheckedNovelOriginalWdlWeakEdges!==112||
   result.metrics.physicallyFalseSourceOriginalWdlWeakEdges!==0||
   result.metrics.actuallyNovelBestRootsBeyondFrozenV4!==11||
   result.metrics.sourceNewBestOriginalActionsPhysicallyBest!==12)
   throw Error('new fused source direct physical controls disagree with immutable earlier per-reply result');
 return {...result,
  algorithm:'DIRECT_FUSED_OPPONENT_REPLY_MASK_SOURCE_COMPARED_TO_SAME_IMMUTABLE_PHYSICAL_ORACLE_AND_V4',
  exactOriginalSourcePerReplyFutureQStatesConstructed:0,
  sourceAllRootOpponentReplyMasksEvaluatedAsFiniteGeneratorIncidence:true,
  physicalControlAndSourceCandidatePacketFrozenPriorToCurrentCheck:true};
}
