#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const SOURCE='CPC_RANK20_FORCED_C3_LEGACY_PROOF_FAMILY_MATRIX_0_1.json';
const root=resolve(import.meta.dirname,'../../../..');
const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const kernelMod=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-native-negamax-slot64-residual-kernel.mjs')).href);
const domain=await import(pathToFileURL(resolve(root,'research/semantic-quotient/state-identity-unification/src/quotient-negamax-domain-contract.mjs')).href);
const {createSlot64ResidualQuotientKernel}=kernelMod;

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();

function replay(sequence){let id=kernel.rootId;for(const d of sequence){const n=kernel.advance(id,Number(d)-1);if(!Number.isSafeInteger(n)||n<0)throw new Error('bad replay '+sequence);id=n;}return id;}
function rank(id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function landing(id,c){return kernel.supportAccess.landingAt(kernel.states.supportAt(id),c);}
function legal(id){const out=[];for(let c=0;c<7;c++)if(landing(id,c)!==0xff)out.push(c);return out;}
function heights(id){const out=[];for(let c=0;c<7;c++){const x=landing(id,c);out.push(x===0xff?6:Math.floor(x/7));}return out;}
function hasBit(term,cell){return cell<32?(((term[0]>>>cell)&1)!==0):(((term[1]>>>(cell-32))&1)!==0);}
function cells(term){const out=[];for(let i=0;i<42;i++)if(hasBit(term,i))out.push(i);return out;}
function termKeys(id,p){const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cells).map(x=>x.join(',')).sort();}
function exactKey(id){return 'r'+rank(id)+'|h'+heights(id).join(',')+'|p0:'+termKeys(id,0).join(';')+'|p1:'+termKeys(id,1).join(';');}
function qClass(id){return createHash('sha256').update(exactKey(id)).digest('hex').slice(0,16);}
function immediateWin(id){
 if((rank(id)&1)!==0)return false;
 for(const c of legal(id))if(kernel.advance(id,c)===domain.QN_TERMINAL_WIN)return true;
 return false;
}
function immediateWinningColumns(id){
 if((rank(id)&1)!==0)return [];
 const out=[];for(const c of legal(id))if(kernel.advance(id,c)===domain.QN_TERMINAL_WIN)out.push(c+1);return out;
}
function isOverloadLeaf(id){
 if((rank(id)&1)!==1)return false;
 const cols=legal(id);if(!cols.length)return false;
 for(const c of cols){
  const child=kernel.advance(id,c);
  if(child===domain.QN_TERMINAL_WIN||child<0)return false;
  if(!immediateWin(child))return false;
 }
 return true;
}
function findMoveToOverload(id){
 if((rank(id)&1)!==0)return null;
 for(const c of legal(id)){const child=kernel.advance(id,c);if(child>=0&&isOverloadLeaf(child))return {column:c,child};}
 return null;
}
function rankOne(id){
 const w=findMoveToOverload(id);if(!w)return null;
 return {expression:'E(O)',grammarRank:1,rootMove:w.column+1,universalRawBranches:0,universalConsequenceClasses:0,childKinds:[],responseWitnesses:[]};
}
function rankThree(id){
 if((rank(id)&1)!==0)return null;
 for(const rootColumn of legal(id)){
  const defender=kernel.advance(id,rootColumn);
  if(defender<0)continue;
  if(isOverloadLeaf(defender))continue;
  const replies=legal(defender);if(!replies.length)continue;
  const childKinds=[],responseWitnesses=[];let valid=true;
  for(const dc of replies){
   const attacker=kernel.advance(defender,dc);
   if(attacker===domain.QN_TERMINAL_WIN||attacker<0){valid=false;break;}
   if(immediateWin(attacker)){childKinds.push('I');responseWitnesses.push({defenderColumn:dc+1,kind:'I',attackerColumn:null,immediateWinningColumns:immediateWinningColumns(attacker)});continue;}
   const response=findMoveToOverload(attacker);
   if(!response){valid=false;break;}
   childKinds.push('E(O)');responseWitnesses.push({defenderColumn:dc+1,kind:'E(O)',attackerColumn:response.column+1});
  }
  if(!valid)continue;
  const kinds=[...new Set(childKinds)].sort();
  return {expression:'E(A('+kinds.join('|')+'))',grammarRank:3,rootMove:rootColumn+1,universalRawBranches:childKinds.length,universalConsequenceClasses:kinds.length,childKinds:kinds,responseWitnesses};
 }
 return null;
}

const source=JSON.parse(readFileSync(resolve(import.meta.dirname,SOURCE),'utf8'));
if(source.schema!=='connect4.cpc_rank20_forced_c3_legacy_proof_family_matrix.v1')throw new Error('source schema drift');
const leaves=[];
for(const s of source.states){
 const lambda=s.engines.find(x=>x.engine==='LAMBDA');
 if(!lambda||!lambda.applicable)throw new Error('missing lambda row '+s.id);
 for(const rej of lambda.rejected){
  const action=rej.action.charCodeAt(0)-64;
  const reply=rej.reply.charCodeAt(0)-64;
  const sequence=s.childSequence+String(action)+String(reply);
  leaves.push({leafId:s.id+':'+rej.action+'->'+rej.reply,sourceStateId:s.id,rootAction:rej.action,counterReply:rej.reply,sequence,sourceReason:rej.reason,sourceChildMeasure:rej.childMeasure??null});
 }
}
if(leaves.length!==11)throw new Error('expected 11 first-failure leaves, got '+leaves.length);

const rows=leaves.map(leaf=>{
 const id=replay(leaf.sequence);
 if((rank(id)&1)!==0)throw new Error('leaf not P0 turn '+leaf.leafId);
 const p1=rankOne(id),p3=p1?null:rankThree(id),proof=p1??p3;
 return {...leaf,rank:rank(id),support:heights(id),exactQClass:qClass(id),immediateP0WinningColumns:immediateWinningColumns(id),proved:Boolean(proof),expression:proof?.expression??null,grammarRank:proof?.grammarRank??null,rootMove:proof?.rootMove??null,universalRawBranches:proof?.universalRawBranches??null,universalConsequenceClasses:proof?.universalConsequenceClasses??null,childKinds:proof?.childKinds??[],responseWitnesses:proof?.responseWitnesses??[]};
});
const classes=new Map();for(const row of rows){if(!classes.has(row.exactQClass))classes.set(row.exactQClass,[]);classes.get(row.exactQClass).push(row.leafId);}
const rankOneCount=rows.filter(x=>x.grammarRank===1).length,rankThreeCount=rows.filter(x=>x.grammarRank===3).length;
console.log(JSON.stringify({
 schema:'connect4.cpc_rank20_forced_c3_first_failure_local_grammar_probe.v1',
 date:'2026-10-01',sourceEvidence:SOURCE,
 oracleUsed:false,solvedInputsUsed:false,ordinaryFreeBranchGameTreeUsed:false,productionCpcModified:false,jsMinSysModified:false,bsfpModified:false,
 sourceLeafCount:rows.length,uniqueExactQLeafCount:classes.size,exactQClasses:[...classes].map(([id,members])=>({id,members})),
 rows,
 summary:{provedCount:rankOneCount+rankThreeCount,rankOneCount,rankThreeCount,unresolvedCount:rows.length-rankOneCount-rankThreeCount,provedLeafIds:rows.filter(x=>x.proved).map(x=>x.leafId),unresolvedLeafIds:rows.filter(x=>!x.proved).map(x=>x.leafId)},
 conclusion:[
  'The probe applies only the bounded local positive grammar E(O) and E(A(I|E(O))) to exact first-failure leaves from the legacy proof-family matrix.',
  rankOneCount+rankThreeCount?'At least one prior induction failure leaf collapses under the existing local proof grammar and is available for cross-family predecessor composition.':'None of the first-failure leaves closes under the bounded local proof grammar.',
  'Exact q classes are retained separately from physical trace labels.'
 ],
 boundary:[
  'No oracle, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, or sealed holdout is used.',
  'Production CPC, JSMinSys, and BSFP remain unchanged.',
  'A proved leaf does not by itself close its parent action until all sibling defender replies are compositionally discharged.'
 ]
},null,2));
