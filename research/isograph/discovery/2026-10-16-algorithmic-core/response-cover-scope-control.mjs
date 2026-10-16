#!/usr/bin/env node
// Validation-only census for algebraically determined response-cover masks.
// Searches NO winning policies. Finite state enumeration is exclusively
// to inspect and try to falsify the pre-derived quantifier-scope distinction.
import {createUniversalResponseCover} from './universal-response-cover-operator.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';
const CONFIGS=[{width:4,height:3,connect:3,name:'4x3-c3'},
 {width:4,height:4,connect:4,name:'4x4-c4'}];
const MAX_STATES=200000,MAX_GRAPH_EDGES=800000,MAX_ROWS=300000,MAX_MS=30000;
const pc=x=>{let n=0;for(;x;x&=x-1n)n++;return n;},hx=x=>'0x'+x.toString(16);
function maximalCover(C){
 const unique=[...new Set(C.filter(x=>x!==0n).map(String))].map(BigInt);
 return unique.filter(x=>!unique.some(y=>x!==y&&(x&y)===x))
   .sort((a,b)=>pc(b)-pc(a)||(a<b?-1:a>b?1:0));
}
function auditBoard(config){
 const phys=independentPhysical(config),operator=createUniversalResponseCover(config),
   start=Date.now(),deadline=start+MAX_MS,seen=new Set(),states=[];
 const stats={
  totalReachableNonterminalStates:0,physicalGraphEdges:0,
  P1StatesProcessed:0,responseRows:0,
  allNonzeroActionMasks:0,distinctNonzeroActionMasks:0,
  inclusionMaximalMasks:0,prunedRedundantCoverMasks:0,
  adaptiveUniversalTrue:0,staticFullCoverActionTrue:0,
  adaptiveOnlyUniversalTrue:0,adaptiveOnlyByRank:{},
  maxRawCoverSize:0,maxMaximalAntichainWidth:0,
  maxWidthViolationCount:0,unionPreservationMismatches:0,
  staticFullPreservationMismatches:0,
  sourceResidualQueries:0,
  naturalWitness223Replayed:false,
  checkedNaturalWitnessPhysicalActions:0,
  encounteredP1ImmediateWinCases:0
 };
 const examples={firstAdaptiveOnly:null,firstFullStatic:null,natural223:null,
   maximalAntichainMaxWitness:null};
 function visit(s){
  if(Date.now()>deadline||states.length>=MAX_STATES||stats.physicalGraphEdges>=MAX_GRAPH_EDGES)
   throw Error('bounded physical fixture census exhausted');
  const key=phys.key(s);
  if(seen.has(key))return;
  seen.add(key);states.push(s);stats.totalReachableNonterminalStates++;
  for(const a of phys.legal(s)){
   if(stats.physicalGraphEdges>=MAX_GRAPH_EDGES)throw Error('graph edge budget');
   stats.physicalGraphEdges++;
   const child=phys.transition(s,a);
   if(child.terminal===undefined)visit(child.state);
  }
 }
 try{visit(phys.empty());}
 catch(e){return {board:config,status:'BUDGET_EXHAUSTED',reason:String(e),stats,elapsedMs:Date.now()-start};}
 let partial=false;
 for(const s of states){
  if((s.rank&1)!==1)continue;
  if(Date.now()>deadline){partial=true;break;}
  const q=phys.qfrom(s),result=operator.compute(q);
  const rows=result.statistics.P0ReplyActionLabels;
  if(stats.responseRows+rows>MAX_ROWS){partial=true;break;}
  stats.responseRows+=rows;stats.sourceResidualQueries+=result.statistics.sourceResidualMembershipQueries;
  stats.P1StatesProcessed++;
  const C=result.responseCoverByP0Column,L=result.initialLegalP1Mask,all=maximalCover(C);
  const nonzero=C.filter(x=>x!==0n),distinct=new Set(nonzero.map(String)).size;
  const union=C.reduce((a,b)=>a|b,0n),maxUnion=all.reduce((a,b)=>a|b,0n);
  const staticFull=C.some(x=>x===L),staticMax=all.some(x=>x===L);
  if(union!==maxUnion)stats.unionPreservationMismatches++;
  if(staticFull!==staticMax)stats.staticFullPreservationMismatches++;
  if(union===L&&!staticFull){
   stats.adaptiveOnlyUniversalTrue++;
   stats.adaptiveOnlyByRank[s.rank]=(stats.adaptiveOnlyByRank[s.rank]||0)+1;
   if(!examples.firstAdaptiveOnly)examples.firstAdaptiveOnly={
    history:s.sequence,support:s.h,
    legal:hx(L),covers:C.map(hx),maximal:all.map(hx)};
  }
  if(union===L)stats.adaptiveUniversalTrue++;
  if(staticFull)stats.staticFullCoverActionTrue++;
  stats.allNonzeroActionMasks+=nonzero.length;
  stats.distinctNonzeroActionMasks+=distinct;
  stats.inclusionMaximalMasks+=all.length;
  stats.prunedRedundantCoverMasks+=C.length-all.length;
  stats.maxRawCoverSize=Math.max(stats.maxRawCoverSize,nonzero.length);
  if(all.length>stats.maxMaximalAntichainWidth){
   stats.maxMaximalAntichainWidth=all.length;
   examples.maximalAntichainMaxWitness={history:s.sequence,support:s.h,
    covers:C.map(hx),maximal:all.map(hx)};
  }
  if(all.length>6)stats.maxWidthViolationCount++; // W=4 => Sperner 6
  if(!examples.firstFullStatic&&staticFull)examples.firstFullStatic={
   history:s.sequence,support:s.h,legal:hx(L),covers:C.map(hx)};
  if(result.statistics.P1FirstWinGuards)stats.encounteredP1ImmediateWinCases++;
  if(config.width===4&&config.height===3&&s.sequence==='223'){
   stats.naturalWitness223Replayed=true;
   if(L!==15n||C.map(String).join(',')!=='14,4,14,7'||union!==15n||staticFull||
      all.map(String).sort().join(',')!=='14,7')
     throw Error('frozen quantifier witness 223 changed');
   // Independent physical response-mask recheck using literal play,
   // allowed here as falsifier/validator (NOT candidate generation).
   let actual=Array(config.width).fill(0n);
   for(const b of phys.legal(s)){
    const pb=phys.transition(s,b);stats.checkedNaturalWitnessPhysicalActions++;
    if(pb.terminal!==undefined)continue;
    for(const a of phys.legal(pb.state)){
     const pa=phys.transition(pb.state,a);stats.checkedNaturalWitnessPhysicalActions++;
     let works=pa.terminal===1;
     if(pa.terminal===undefined){
      works=true;
      for(const d of phys.legal(pa.state)){
       const pd=phys.transition(pa.state,d);stats.checkedNaturalWitnessPhysicalActions++;
       if(pd.terminal!==undefined){works=false;break;}
       let immediate=false;
       for(const e of phys.legal(pd.state)){
        const pe=phys.transition(pd.state,e);stats.checkedNaturalWitnessPhysicalActions++;
        if(pe.terminal===1){immediate=true;break;}
       }
       if(!immediate){works=false;break;}
      }
     }
     if(works)actual[a]|=1n<<BigInt(b);
    }
   }
   if(actual.some((v,i)=>v!==C[i]))
    throw Error('natural quantifier distinction failed independent physical recheck');
   examples.natural223={history:s.sequence,support:s.h,
    legal:hx(L),covers:C.map(hx),maximal:all.map(hx),
    forallP1ExistsP0:true,existsOneP0ForallP1:false,
    directPhysicalValidationMoves:stats.checkedNaturalWitnessPhysicalActions};
  }
 }
 return {
  board:config,status:stats.unionPreservationMismatches||stats.staticFullPreservationMismatches||
   stats.maxWidthViolationCount?'FAIL':partial?'PASS_BOUNDED_PARTIAL':'PASS',
  stats,examples,partial,
  elapsedMs:Date.now()-start,
  producerUsesGameTreeSearch:false,
  resultType:'maximal response-cover antichain preserves union and full-mask existential, not arbitrary deeper strategy quantifiers'
 };
}
export function runScopeControl(){
 const cases=CONFIGS.map(auditBoard);
 return {schema:'connect4.response-cover.quantifier-scope.v0_1',
  date:'2026-10-16',
  status:cases.some(x=>x.status==='FAIL')?'FAIL':
   cases.every(x=>x.status==='PASS')?'PASS':'PARTIAL',
  cases,solvedOracleQueries:0,policySearchInputs:0};
}
if(process.argv[1]?.endsWith('response-cover-scope-control.mjs')){
 const x=runScopeControl();console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
