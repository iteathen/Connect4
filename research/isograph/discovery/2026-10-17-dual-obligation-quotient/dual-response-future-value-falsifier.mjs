// Independent VALIDATION-ONLY search for unsafe cross-horizon quotienting.
// The source operator never reads child game values. Physical/q reference
// exact recursive WDL follows AFTER the guarded bounded response masks.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createUniversalResponseCover} from '../2026-10-16-algorithmic-core/universal-response-cover-operator.mjs';
import {reduceUniversalResponseObligations} from './dual-response-obligation.mjs';

export function runDualResponseFutureValueFalsifier({
  geometry={width:4,height:3,connect:3},
  maxPhysicalStates=20000,deadlineAt=Infinity}={}){
 const t=Date.now(),{width:W,height:H}=geometry,
  core=createExactQCore(geometry),cover=createUniversalResponseCover(geometry),
  bit=(c,r)=>1n<<BigInt(r*W+c);
 const start={h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''},
  stack=[start],seen=new Set(),qMemo=new Map();
 const out={schema:'connect4.dual-response-future-WDL-falsifier.v0_1',
  profile:geometry,status:'PASS',physicalNonterminalStates:0,sourceP1Positions:0,
  exactP1ActionsChecked:0,fullQReferenceUniqueStatesAcrossSolves:0,
  fullQReferenceTransitionsAcrossSolves:0,fullQReferenceCacheEntries:0,
  equalSignaturePairsChecked:0,equalSignatureDifferentWDLCount:0,
  strictDominancePairsChecked:0,strictDominanceReverseWDLCount:0,
  firstEqualSignatureDifferentWDL:null,
  firstStrictDominanceReverseWDL:null,
  producerUsesFullQChildValues:false,
  unrestrictedGameSolvesUsedByIndependentFalsifier:true,
  elapsedMs:0};
 const terminal=(p0,p1)=>core.lines.some(m=>(p0&m)===m||(p1&m)===m);
 while(stack.length){
  if(Date.now()>deadlineAt||out.physicalNonterminalStates>=maxPhysicalStates){out.status='BUDGET_PARTIAL';break;}
  const s=stack.pop(),key=s.p0.toString(16)+':'+s.p1.toString(16);
  if(seen.has(key))continue;seen.add(key);
  if(terminal(s.p0,s.p1))throw Error('terminal physical source invalid');
  out.physicalNonterminalStates++;
  const q=core.fromPhysical(s);
  if(s.rank&1){
    const source=cover.compute(q),dual=reduceUniversalResponseObligations(
      source.responseCoverByP0Column,source.initialLegalP1Mask);
    const records=[];
    for(const b of core.legal(q)){
      const child=core.next(q,b);
      let value=child.terminal;
      if(value===undefined){
        const ref=core.solve(child.q,{sharedMemo:qMemo,maxStates:20000,maxTransitions:200000});
        value=ref.answer.value;
        out.fullQReferenceUniqueStatesAcrossSolves+=ref.stats.uniqueStates;
        out.fullQReferenceTransitionsAcrossSolves+=ref.stats.transitions;
      }
      records.push({b,signature:dual.responseByP1Label.find(x=>x.replyColumn===b)?.successActionMask,
        fullWDL:value,terminal:child.terminal!==undefined});
      out.exactP1ActionsChecked++;
    }
    for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++){
      const x=records[i],y=records[j];
      if(x.signature===undefined||y.signature===undefined)throw Error('missing bounded response signatures');
      if(x.signature===y.signature){
        out.equalSignaturePairsChecked++;
        if(x.fullWDL!==y.fullWDL){
          out.equalSignatureDifferentWDLCount++;
          if(!out.firstEqualSignatureDifferentWDL)
            out.firstEqualSignatureDifferentWDL={
              legalSourceHistory:s.history,sourceRank:s.rank,
              P1ReplyColumns:[x.b+1,y.b+1],
              commonBoundedSuccessfulP0ResponsesHex:'0x'+x.signature.toString(16),
              exactUnrestrictedP0RelativeActionValues:[x.fullWDL,y.fullWDL],
              actionTerminalGuards:[x.terminal,y.terminal],
              allSourceP0CoverMasksHex:source.responseCoverByP0Column.map(z=>'0x'+z.toString(16)),
              interpretation:'EQUAL fixed-two-P0-own-turn success response signatures do NOT imply equal unrestricted WDL values'};
        }
      }else{
        for(const [hard,soft] of [[x,y],[y,x]]){
          if((hard.signature&soft.signature)!==hard.signature)continue;
          out.strictDominancePairsChecked++;
          if(hard.fullWDL>soft.fullWDL){
            out.strictDominanceReverseWDLCount++;
            if(!out.firstStrictDominanceReverseWDL)
              out.firstStrictDominanceReverseWDL={
                legalSourceHistory:s.history,rank:s.rank,
                boundedHarderP1Reply:hard.b+1,boundedEasierP1Reply:soft.b+1,
                harderBoundedP0SuccessMask:'0x'+hard.signature.toString(16),
                easierBoundedP0SuccessMask:'0x'+soft.signature.toString(16),
                exactUnrestrictedP0RelativeValues:[hard.fullWDL,soft.fullWDL],
                allSourceP0CoverMasksHex:source.responseCoverByP0Column.map(z=>'0x'+z.toString(16)),
                interpretation:'Bounded row dominance reverses unrestricted P0-relative WDL ordering; cannot prune deeper P1 responses from this signature alone'};
          }
        }
      }
    }
    out.sourceP1Positions++;
  }
  for(let b=W-1;b>=0;b--){
    if(s.h[b]>=H)continue;
    const landing=bit(b,s.h[b]);
    const child={h:s.h.slice(),p0:s.p0,p1:s.p1,
      rank:s.rank+1,history:s.history+String(b+1)};
    child.h[b]++;
    if(s.rank&1)child.p1|=landing;else child.p0|=landing;
    if(terminal(child.p0,child.p1)||child.rank===W*H)continue;
    if(!seen.has(child.p0.toString(16)+':'+child.p1.toString(16)))stack.push(child);
  }
 }
 out.fullQReferenceCacheEntries=qMemo.size;
 out.elapsedMs=Date.now()-t;
 return out;
}
