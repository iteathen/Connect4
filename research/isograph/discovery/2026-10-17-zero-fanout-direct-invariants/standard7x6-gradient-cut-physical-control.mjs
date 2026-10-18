// FROZEN independent REAL 7x6 Connect4 physical / original q one-ply
// cut-interface tests. No game-tree search, solved policy or future value.
import {createGradientCutInterface} from './standard7x6-gradient-cut-interface.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H,
 cutProducer=createGradientCutInterface({width:W,height:H,connect:K}),
 core=createExactQCore({width:W,height:H,connect:K}),
 bit=(c,r)=>1n<<BigInt(r*W+c);
if(core.lineCount!==69||cutProducer.originalLineCount!==69)throw Error('wrong Connect4 geometry');
let seed=0xB074C171>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const results={schema:'connect4.standard7x6.source_K_banded_cut_interface_v0_1',
 date:'2026-10-17',geometry:{W,H,K,originalWins:69},seedStart:seed,
 staticOriginalGeometricCutWindows:[],
 sampledGenuineNonterminalPhysicalQ:0,distinctExactQ:0,
 perCutSourceEncodeDecodeChecks:0,perCutLiteralActionOneStepChecks:0,
 exactNonterminalResultingQ:0,exactFirstWins:0,exactLastDraws:0,
 badCutState:0,badTerminal:0,
 sampleCanonical:[],sourceCrossCutBridgeChecks:0,
 cutBridgeMovesThatDeleteBridgeByOwnerBlock:0,
 normalizedBridgeLossFromPhysicallyOutsideOriginalCutBand:0,
 firstFarActionNonlocalMinBridgeWitness:null,
 futureGameValuesEvaluated:0,
 sourceOnlyStaticCutProofWork:true,byPly:{}};
function assert(x,m){if(!x)throw Error(m);}
function blank(){return {h:Array(W).fill(0),P:[0n,0n],n:0,hist:'',won:false};}
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function step(st,c){
 const r=st.h[c],p=st.n&1,h=st.h.slice(),P=st.P.slice();
 if(c<0||c>=W||r>=H||st.won)throw Error('invalid source first-win action');
 h[c]++;P[p]|=bit(c,r);
 const win=core.lines.some(m=>(P[p]&m)===m);
 return {h,P,n:st.n+1,hist:st.hist+String(c+1),won:win,who:p};
}
function fromHistory(str){
 let st=blank();
 for(const letter of str){st=step(st,Number(letter)-1);assert(!st.won,'canonical already terminal');}
 return st;
}
const seen=new Set();
function bridgeSignatures(view){
 return view.family.map(f=>f.filter(z=>z.left&&z.right).map(z=>String(z.left|z.right)).sort().join(','));
}
function inspect(st,canon=false){
 assert(!st.won&&st.n<N,'actual legal nonterminal required');
 const q=core.fromPhysical({h:st.h,p0:st.P[0],p1:st.P[1]});
 const key=core.key(q);seen.add(key);
 results.sampledGenuineNonterminalPhysicalQ++;
 const stats=results.byPly[st.n]??(results.byPly[st.n]={positions:0,cutActions:0});
 stats.positions++;
 const canonical={history:st.hist,ply:st.n,h:st.h.slice(),
  R:[q.R0.length,q.R1.length],cut:[]};
 const values=core.legal(q).map(a=>[a,core.next(q,a)]);
 for(let b=0;b<W-1;b++){
  const v=cutProducer.encode(q,b),decoded=cutProducer.decode(v),
   diag=cutProducer.cutStatistics(q,b);
  results.perCutSourceEncodeDecodeChecks++;
  if(core.key(decoded)!==key){results.badCutState++;throw Error('cut source encoding lost q identity');}
  const directOriginal=cutProducer.windowCutStatistics(b);
  const actualStatic=results.staticOriginalGeometricCutWindows[b];
  if(directOriginal.total!==actualStatic.total ||
   JSON.stringify(directOriginal.byKind)!==JSON.stringify(actualStatic.byKind))
    throw Error('cut original window count changed across source');
  const bits=bridgeSignatures(v);
  results.sourceCrossCutBridgeChecks+=diag.bridges.length;
  if(canon)canonical.cut.push({afterColumn:b+1,
   P0:diag.sourceP0,P1:diag.sourceP1,
   originalWindowsCrossing:diag.originalKWindowsCrossingCut,
   sourceBridges:diag.bridges.length,delta:diag.heightGradient});
  for(const [a,want] of values){
   const got=cutProducer.next(v,a);
   results.perCutLiteralActionOneStepChecks++;stats.cutActions++;
   if('terminal' in want){
    if(want.terminal!==got.terminal||want.kind!==got.kind){
     results.badTerminal++;throw Error('source K-interface terminal mismatch');
    }
    if(want.kind==='win')results.exactFirstWins++;else results.exactLastDraws++;
    continue;
   }
   const d=cutProducer.decode(got.view);
   if(core.key(d)!==core.key(want.q)){
    results.badCutState++;throw Error('source cut transfer / normalization result mismatched exact original q');
   }
   results.exactNonterminalResultingQ++;
   const afterBits=bridgeSignatures(got.view);
   if(diag.bridges.length>afterBits.join(',').split(',').length)
    results.cutBridgeMovesThatDeleteBridgeByOwnerBlock++;
   // New source action lands outside the UNION of columns touched by
   // any ORIGINAL K-line crossing cut. Such an action cannot directly
   // edit a raw source bridge generator, but global Min can delete it.
   const min=directOriginal.earliestOriginalLineColumn,
    max=directOriginal.latestOriginalLineColumn;
   if(a<min||a>max){
    if(bits[0]!==afterBits[0]||bits[1]!==afterBits[1]){
     results.normalizedBridgeLossFromPhysicallyOutsideOriginalCutBand++;
     if(!results.firstFarActionNonlocalMinBridgeWitness)
      results.firstFarActionNonlocalMinBridgeWitness={
       history:st.hist,action:a+1,cutAfterColumn:b+1,
       originalWindowBandOneBased:[min+1,max+1],
       bridgesBefore:[diag.sourceP0.bridge,diag.sourceP1.bridge],
       beforeSignatures:bits,afterSignatures:afterBits
      };
    }
   }
  }
 }
 if(canon)results.sampleCanonical.push(canonical);
}
for(let b=0;b<W-1;b++)results.staticOriginalGeometricCutWindows.push(
 cutProducer.windowCutStatistics(b));
for(const history of ['','4','44444','444444','444441','4444442'])
 inspect(fromHistory(history),true);
for(let game=0;game<520;game++){
 let st=blank();
 while(st.n<N){
  if([0,4,5,6,7,12,18,25,31,35,38,40,41].includes(st.n))
   inspect(st);
  const safe=[];
  for(let a=0;a<W;a++)if(st.h[a]<H){
   const z=step(st,a);
   if(!z.won)safe.push(z);
  }
  if(!safe.length)break;
  st=safe[rand()%safe.length];
 }
}
results.distinctExactQ=seen.size;results.seedFinal=seed;
console.log(JSON.stringify(results,null,2));
