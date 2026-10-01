#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const SOURCE='CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json';
const root=resolve(import.meta.dirname,'../../../..');
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});

const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
assert.equal(source.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
assert.equal(source.summary.rank5ProvedCount,0);
assert.equal(source.summary.unresolvedCount,11);
assert.equal(source.oracleUsed,false);
assert.equal(source.solvedInputsUsed,false);
assert.equal(source.ordinaryFreeBranchGameTreeUsed,false);

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})
});
kernel.prepareSearchStorage();

function sha(text){return createHash('sha256').update(text).digest('hex');}
function replay(sequence){
  let id=kernel.rootId;
  for(const d of sequence){
    const c=Number(d)-1;
    const support=kernel.states.supportAt(id);
    if(kernel.supportAccess.landingAt(support,c)===0xff)throw new Error('illegal replay '+sequence);
    const child=kernel.advance(id,c);
    if(!Number.isSafeInteger(child)||child<0)throw new Error('replay crossed terminal '+sequence);
    id=child;
  }
  return id;
}
function rank(id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function support(id){
  const s=kernel.states.supportAt(id),out=[];
  for(let c=0;c<7;c++){
    const x=kernel.supportAccess.landingAt(s,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function termCells(term){const out=[];for(let c=0;c<42;c++)if(hasBit(term,c))out.push(c);return out;}
function termKeys(id,p){
  const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);
  return kernel.classes.terms(cid).map(termCells).map(cells=>cells.join(',')).sort();
}
function exactKey(id){return 'r'+rank(id)+'|h'+support(id).join(',')+'|p0:'+termKeys(id,0).join(';')+'|p1:'+termKeys(id,1).join(';');}
function qClass(id){return sha(exactKey(id)).slice(0,16);}
function qDesc(id){return {rank:rank(id),support:support(id),p0Residuals:termKeys(id,0),p1Residuals:termKeys(id,1),exactQClass:qClass(id)};}
function longestCommonPrefix(a,b){let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i;}
function eventMultiset(word){return [...word].sort().join('');}
function permutations(word){
  const counts=new Map();
  for(const c of word)counts.set(c,(counts.get(c)??0)+1);
  const chars=[...counts.keys()].sort();
  const out=[];
  function rec(prefix){
    if(prefix.length===word.length){out.push(prefix);return;}
    for(const c of chars){
      const n=counts.get(c);
      if(!n)continue;
      counts.set(c,n-1);rec(prefix+c);counts.set(c,n);
    }
  }
  rec('');
  return out;
}
function advanceWord(baseId,word){
  let id=baseId;
  for(let i=0;i<word.length;i++){
    const c=Number(word[i])-1;
    const s=kernel.states.supportAt(id);
    if(kernel.supportAccess.landingAt(s,c)===0xff){
      return {word,status:'ILLEGAL',stopIndex:i,stopRank:rank(id),column:c+1};
    }
    const child=kernel.advance(id,c);
    if(child===domain.QN_TERMINAL_WIN){
      return {word,status:'TERMINAL',stopIndex:i,stopRank:rank(id),terminalMover:(rank(id)&1)===0?'P0':'P1',column:c+1};
    }
    if(!Number.isSafeInteger(child)||child<0){
      return {word,status:'NEGATIVE_TERMINAL_OR_INVALID',stopIndex:i,stopRank:rank(id),code:child,column:c+1};
    }
    id=child;
  }
  return {word,status:'NONTERMINAL',...qDesc(id)};
}
function swapNeighbor(word,i){
  if(i<0||i>=word.length-1||word[i]===word[i+1])return null;
  const a=[...word];[a[i],a[i+1]]=[a[i+1],a[i]];return a.join('');
}
function buildSwapGraph(rows){
  const byWord=new Map(rows.filter(x=>x.status==='NONTERMINAL').map(x=>[x.word,x]));
  const edges=[];
  const seen=new Set();
  for(const word of byWord.keys()){
    for(let i=0;i<word.length-1;i++){
      const n=swapNeighbor(word,i);
      if(!n||!byWord.has(n))continue;
      const key=[word,n].sort().join('|');
      if(seen.has(key))continue;
      seen.add(key);
      const a=byWord.get(word),b=byWord.get(n);
      edges.push({
        a:word,b:n,swapIndex:i,
        kind:a.exactQClass===b.exactQClass?'Q_PRESERVING_SWAP':'Q_CHANGING_SWAP',
        aQ:a.exactQClass,bQ:b.exactQClass
      });
    }
  }
  return {byWord,edges};
}
function shortestPath(start,end,graph,preserve=false){
  if(start===end)return {distance:0,path:[start]};
  if(!graph.byWord.has(start)||!graph.byWord.has(end))return null;
  const adj=new Map([...graph.byWord.keys()].map(x=>[x,[]]));
  for(const e of graph.edges){
    if(preserve&&e.kind!=='Q_PRESERVING_SWAP')continue;
    adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);
  }
  const queue=[start],prev=new Map([[start,null]]);
  for(let qi=0;qi<queue.length;qi++){
    const x=queue[qi];
    for(const y of adj.get(x)){
      if(prev.has(y))continue;
      prev.set(y,x);
      if(y===end){
        const path=[];let z=y;
        while(z!==null){path.push(z);z=prev.get(z);}
        path.reverse();return {distance:path.length-1,path};
      }
      queue.push(y);
    }
  }
  return null;
}
function difference(before,after){
  const b=new Set(before),a=new Set(after);
  return {removed:before.filter(x=>!a.has(x)),added:after.filter(x=>!b.has(x))};
}
function residualDelta(base,final){
  return {p0:difference(base.p0Residuals,final.p0Residuals),p1:difference(base.p1Residuals,final.p1Residuals)};
}
function sizeProfile(keys){
  const out={};
  for(const key of keys){
    const n=key===''?0:key.split(',').length;
    out[n]=(out[n]??0)+1;
  }
  return out;
}
function residualDeltaProfile(delta){
  return {
    p0Removed:sizeProfile(delta.p0.removed),p0Added:sizeProfile(delta.p0.added),
    p1Removed:sizeProfile(delta.p1.removed),p1Added:sizeProfile(delta.p1.added)
  };
}
function firstOccurrencePattern(word,mapping=null){
  const map=mapping??new Map();let next=0;const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let out='';
  for(const c of word){
    if(!map.has(c))map.set(c,letters[next++]);
    out+=map.get(c);
  }
  return {pattern:out,mapping:map};
}
function multiplicityPattern(word){
  const counts={};for(const c of word)counts[c]=(counts[c]??0)+1;
  return Object.values(counts).sort((a,b)=>b-a).join('-');
}

const transitions=[];
for(const row of source.rows){
  const leafId=replay(row.sequence);
  assert.equal(rank(leafId),30);
  assert.equal(qClass(leafId),row.exactQClass);
  for(const attempt of row.rootMoveAttempts){
    const u=attempt.firstUnresolved;
    if(u?.kind!=='NO_RANK_LE3_PROOF')continue;
    const sequence=row.sequence+String(attempt.rootMove)+String(u.defenderColumn);
    const id=replay(sequence);
    assert.equal(rank(id),32);
    assert.equal(qClass(id),u.lowerQClass,'frozen lower q-class drift');
    assert.deepEqual(support(id),u.support,'frozen lower support drift');
    transitions.push({
      sourceLeafId:row.sourceLeafId,sourceLeafQClass:row.exactQClass,
      sourceLeafSequence:row.sequence,rootMove:attempt.rootMove,
      defenderColumn:u.defenderColumn,provedReplyPrefixCount:attempt.provedReplyPrefixCount,
      sequence,lowerQClass:u.lowerQClass,lowerSupport:u.support
    });
  }
}
assert.equal(transitions.length,36,'unresolved transition count drift');
const sourceGroups=new Map();
for(const x of transitions){if(!sourceGroups.has(x.lowerQClass))sourceGroups.set(x.lowerQClass,[]);sourceGroups.get(x.lowerQClass).push(x);}
assert.equal(sourceGroups.size,24,'distinct source q-class count drift');
const repeated=[...sourceGroups.entries()].filter(([,g])=>g.length===2);
assert.equal(repeated.length,12,'repeated source q-class count drift');
assert.equal([...sourceGroups.values()].filter(g=>g.length===1).length,12,'singleton source q-class count drift');

const repeatedClasses=[];
for(const [sourceQ,occurrences0] of repeated.sort((a,b)=>a[0].localeCompare(b[0]))){
  const occurrences=[...occurrences0].sort((a,b)=>a.sequence.localeCompare(b.sequence));
  const [a,b]=occurrences;
  const lcp=longestCommonPrefix(a.sequence,b.sequence);
  const prefix=a.sequence.slice(0,lcp),suffixA=a.sequence.slice(lcp),suffixB=b.sequence.slice(lcp);
  const baseId=replay(prefix),base=qDesc(baseId);
  const commonPrefixRank=rank(baseId);
  const sameEventMultiset=eventMultiset(suffixA)===eventMultiset(suffixB);
  assert.equal(commonPrefixRank,28,'repeated class common prefix rank drift '+sourceQ);
  assert.equal(suffixA.length,4);assert.equal(suffixB.length,4);assert(sameEventMultiset);

  const words=permutations(suffixA);
  const permutationRows=words.map(word=>advanceWord(baseId,word));
  const legalNonterminal=permutationRows.filter(x=>x.status==='NONTERMINAL');
  const qGroups=new Map();
  for(const x of legalNonterminal){if(!qGroups.has(x.exactQClass))qGroups.set(x.exactQClass,[]);qGroups.get(x.exactQClass).push(x.word);}
  const graph=buildSwapGraph(permutationRows);
  const unrestricted=shortestPath(suffixA,suffixB,graph,false);
  const preserving=shortestPath(suffixA,suffixB,graph,true);
  const sourceWordsSameExactQ=legalNonterminal.find(x=>x.word===suffixA)?.exactQClass===legalNonterminal.find(x=>x.word===suffixB)?.exactQClass;
  assert(sourceWordsSameExactQ);
  const sourceOrbit=qGroups.get(sourceQ)??[];
  assert(sourceOrbit.includes(suffixA)&&sourceOrbit.includes(suffixB),'source q orbit lost frozen words');

  const sourceFinal=legalNonterminal.find(x=>x.word===suffixA);
  const delta=residualDelta(base,sourceFinal);
  const mapInfo=firstOccurrencePattern(suffixA);
  const sourcePatternA=mapInfo.pattern;
  const sourcePatternB=firstOccurrencePattern(suffixB,mapInfo.mapping).pattern;
  const qPartitionSizes=[...qGroups.values()].map(g=>g.length).sort((x,y)=>y-x);
  const qPreservingSwapEdgeCount=graph.edges.filter(x=>x.kind==='Q_PRESERVING_SWAP').length;
  const supportDelta=sourceFinal.support.map((x,i)=>x-base.support[i]);
  const profile=residualDeltaProfile(delta);
  const topologySignature=JSON.stringify({
    multiplicityPattern:multiplicityPattern(suffixA),
    sourcePatternPair:[sourcePatternA,sourcePatternB].sort(),
    legalNonterminalPermutationCount:legalNonterminal.length,
    qClassCount:qGroups.size,
    qPartitionSizes,
    sourceQOrbitSize:sourceOrbit.length,
    qPreservingSwapEdgeCount,
    sourceQPreservingSwapDistance:preserving?.distance??null,
    residualDeltaSizeProfile:profile
  });
  repeatedClasses.push({
    sourceQClass:sourceQ,
    sourceOccurrences:occurrences,
    commonPrefix:prefix,commonPrefixRank,
    sourceSuffixLength:suffixA.length,
    sourceWords:[suffixA,suffixB],
    sameEventMultiset,
    eventMultiset:eventMultiset(suffixA),
    multiplicityPattern:multiplicityPattern(suffixA),
    sourceWordPatterns:[sourcePatternA,sourcePatternB],
    permutationCount:words.length,
    legalNonterminalPermutationCount:legalNonterminal.length,
    terminalPermutationCount:permutationRows.filter(x=>x.status==='TERMINAL').length,
    illegalPermutationCount:permutationRows.filter(x=>x.status==='ILLEGAL').length,
    otherStoppedPermutationCount:permutationRows.filter(x=>!['NONTERMINAL','TERMINAL','ILLEGAL'].includes(x.status)).length,
    exactQPartition:[...qGroups.entries()].sort((x,y)=>y[1].length-x[1].length||x[0].localeCompare(y[0])).map(([q,ws])=>({exactQClass:q,count:ws.length,words:ws.sort(),isSourceQ:q===sourceQ})),
    sourceWordsSameExactQ,
    sourceQOrbitSize:sourceOrbit.length,
    swapEdges:graph.edges,
    qPreservingSwapEdgeCount,
    qChangingSwapEdgeCount:graph.edges.length-qPreservingSwapEdgeCount,
    sourceAdjacentSwapDistance:unrestricted?.distance??null,
    sourceAdjacentSwapPath:unrestricted?.path??null,
    sourceQPreservingSwapDistance:preserving?.distance??null,
    sourceQPreservingSwapPath:preserving?.path??null,
    baseQ:base,
    sourceFinalQ:sourceFinal,
    supportDelta,
    residualDelta:delta,
    residualDeltaSizeProfile:profile,
    topologySignature,
    topologySignatureId:sha(topologySignature).slice(0,16),
    permutationRows
  });
}

const motifMap=new Map();
for(const x of repeatedClasses){
  if(!motifMap.has(x.topologySignatureId))motifMap.set(x.topologySignatureId,[]);
  motifMap.get(x.topologySignatureId).push(x);
}
const motifGroups=[...motifMap.entries()].map(([id,rows])=>({
  motifId:id,count:rows.length,sourceQClasses:rows.map(x=>x.sourceQClass).sort(),
  multiplicityPattern:rows[0].multiplicityPattern,
  sourceWordPatterns:rows[0].sourceWordPatterns,
  legalNonterminalPermutationCount:rows[0].legalNonterminalPermutationCount,
  exactQPartitionSizes:rows[0].exactQPartition.map(x=>x.count).sort((a,b)=>b-a),
  sourceQOrbitSize:rows[0].sourceQOrbitSize,
  qPreservingSwapEdgeCount:rows[0].qPreservingSwapEdgeCount,
  sourceQPreservingSwapDistance:rows[0].sourceQPreservingSwapDistance,
  residualDeltaSizeProfile:rows[0].residualDeltaSizeProfile
})).sort((a,b)=>b.count-a.count||a.motifId.localeCompare(b.motifId));

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_rank32_consequence_exchange_census.v1',
  date:'2026-10-01',
  design:'CPC_RANK20_RANK32_CONSEQUENCE_EXCHANGE_CENSUS_DESIGN_0_1.md',
  sourceEvidence:SOURCE,
  sourceTransitionCount:transitions.length,
  distinctSourceQClasses:sourceGroups.size,
  repeatedSourceQClassCount:repeated.length,
  singletonSourceQClassCount:[...sourceGroups.values()].filter(g=>g.length===1).length,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  sourceTransitions:transitions,
  repeatedClasses,
  motifGroups,
  summary:{
    repeatedClasses:repeatedClasses.length,
    topologyMotifCount:motifGroups.length,
    repeatedMotifGroups:motifGroups.filter(x=>x.count>1).length,
    sourcePairsConnectedByLegalAdjacentSwaps:repeatedClasses.filter(x=>x.sourceAdjacentSwapDistance!==null).length,
    sourcePairsConnectedByQPreservingSwaps:repeatedClasses.filter(x=>x.sourceQPreservingSwapDistance!==null).length,
    averageSourceQOrbitSize:repeatedClasses.reduce((s,x)=>s+x.sourceQOrbitSize,0)/repeatedClasses.length,
    averageLegalPermutationCount:repeatedClasses.reduce((s,x)=>s+x.legalNonterminalPermutationCount,0)/repeatedClasses.length
  },
  conclusion:[
    'The 36 frozen rank-5 first-unresolved transitions are reconstructed exactly and retain 24 exact-q classes, including 12 doubled classes.',
    'Every doubled class is traced to a common rank-28 ancestor and two four-event words with the same event multiset.',
    'Complete legal permutation orbits distinguish exact q-preserving exchange from mere multiset coincidence; terminal and illegal permutations remain explicit falsifiers.',
    repeatedClasses.some(x=>x.sourceQPreservingSwapDistance!==null)
      ? 'At least one repeated source pair is connected by a path of adjacent q-preserving swaps, providing concrete local exchange/trace structure for consequence-class transport.'
      : 'No repeated source pair is connected by an all-q-preserving adjacent-swap path; the observed convergence is not reducible to simple local commutation.'
  ],
  boundary:[
    'This is exact transition/consequence-class evidence only and is not yet a winning certificate.',
    'No oracle, solved W/D/L, minimax, unrestricted search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
