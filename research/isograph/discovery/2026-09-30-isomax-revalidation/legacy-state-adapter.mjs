// Reference side only: deliberately executes the historical harness prefix.
// This file is NOT part of the independent implementation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const LEGACY_SOURCE=new URL('../2026-09-29-isomax-late-xor-components/run-ooo-sign-channel-coupling.mjs',import.meta.url);
export function legacyStateRecords(W,H,K,emit,{captureOoo=false}={}){
  assert.ok(['6x3-k3','4x5-k4','6x3-k4'].includes(`${W}x${H}-k${K}`),'reference comparator case not authorized');
  const source=fs.readFileSync(LEGACY_SOURCE,'utf8').replace(/\r\n/g,'\n');
  const start=source.indexOf('  const N=W*H;');
  const end=source.indexOf('  function outcomeName(code){',start);
  assert.ok(start>0&&end>start,'reference prefix boundary missing');
  const decoderStart=source.indexOf('  function repairedDecoderAudit(){');
  const decoderMarker='    const matchedDependencyQuotient=matchedDegree2DependencyQuotient();';
  const decoderEnd=source.indexOf(decoderMarker,decoderStart)+decoderMarker.length;
  assert.ok(decoderStart>end&&decoderEnd>decoderStart);
  const decoder=source.slice(decoderStart,decoderEnd)+`
    const ds=Array(descriptorIds.size);for(const [d,i] of descriptorIds)ds[i]=d;
    const semanticTriples=tripleKeys.map(key=>{
      const c=key%pairBase,q=Math.floor(key/pairBase),b=q%pairBase,a=Math.floor(q/pairBase);
      return JSON.stringify([a,b,c].map(raw=>ds[Math.floor((raw-1)/2)]).sort());
    });
    return {structuralClasses:rows.length,semanticTriples,
      dependencies:matchedDependencyQuotient.dependencies,
      lowerRank:matchedDependencyQuotient.degree2RowRank,
      oooRank:matchedDependencyQuotient.oooResidueRank};
  }
  `;
  const output=`
    for(const x of [...states.values()].sort((a,b)=>a.a-b.a||a.b-b.b)){
      const q=x.terminal?null:qOf(x),rfg=q?RFG(q):null,r=reps.get(x.key);
      emit({key:x.key,a:x.a,b:x.b,rank:x.rank,h:x.h,terminal:x.terminal,winner:x.winner,
        wdlAbsolute:values.get(x.key),t2:x.terminal?null:t2.get(x.key),q,rfg,
        components:r?r.comps.map(c=>c.type).sort():null,
        roleCapparZoe:r?[...aggregatedCounts(r,'ROLE_CAPPAR_REL_INC_ZOE')]
          .map(([d,n])=>[d,n&1?'O':'E']).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0):null});
    }
    return {states:states.size,nonterminal:nts.length,t2O:ots.length,
      ooo:captureOoo?repairedDecoderAudit():null};
  `;
  const run=new Function('W','H','K','assert','emit','captureOoo',source.slice(start,end)+decoder+output);
  return {...run(W,H,K,assert,emit,captureOoo),sourceSha256:createHash('sha256').update(source).digest('hex')};
}
