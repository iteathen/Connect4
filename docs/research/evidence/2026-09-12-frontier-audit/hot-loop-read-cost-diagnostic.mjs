import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const base=pathToFileURL(resolve('research/semantic-quotient/state-identity-unification/src')+'/');
const {createSlot64ResidualQuotientKernel}=await import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs',base));
const {createSemanticSharedTtArena}=await import(new URL('quotient-semantic-shared-tt.mjs',base));
const {createOnlineSemanticQuotientPort}=await import(new URL('quotient-online-semantic-search-lib.mjs',base));
const spec={columns:7,rows:6,connect:4};
const {kernel}=createSlot64ResidualQuotientKernel(spec,{cacheEdges:false,prefixClasses:4096});
const semantic=createOnlineSemanticQuotientPort(kernel,createSemanticSharedTtArena({entryCapacity:4096,termCapacity:1048576,domainSpec:spec}));
semantic.port.ensureProofKey(kernel.rootId);
const originalLoad=Atomics.load;
let loads=0;
let readResults;
try {
 Atomics.load=(...args)=>{loads++;return originalLoad(...args);};
 const lower=semantic.proofStore.lower(kernel.rootId);const afterLower=loads;
 const upper=semantic.proofStore.upper(kernel.rootId);const afterUpper=loads;
 const hint=semantic.proofStore.bestMove(kernel.rootId);
 readResults={lower,upper,hint,loads:{lower:afterLower,upper:afterUpper-afterLower,bestMove:loads-afterUpper,total:loads}};
} finally {Atomics.load=originalLoad;}
const order=kernel.frontierOrder;const seed=order.createRootSeed();
const result={kind:'frontier-hot-loop-read-cost-diagnostic',sourceRevision:'9c778bcaf010372ca2a3a91a7cdcec8debf5518f',scope:'one stable READY semantic proof entry; wrapper counts loads without changing return values; no worker or root solve',readResults,geometry:{lineCount:order.profile.lineCount,stateWords:order.profile.stateWords,emptyLandingScores:Array.from({length:7},(_,c)=>order.valueAtSeed(seed,0,c))}};
fs.writeFileSync('../frontier-audit-results/hot-loop-read-cost.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
