// Independent four-action Boolean relation from legal 4x3 Connect3
// prefix 223: quantified-order falsifier, not a Connect4 candidate oracle.
import {createActionROBDDProjection} from './action-robd-output-cone.mjs';
export function runAdaptiveOrderFalsifier(){
 const rowMasks=[0xe,0x4,0xe,0x7],gates=[];let id=4;
 const neg=x=>x===0?Infinity:x===Infinity?0:-x;
 function and(a,b){
  if(a===0||b===0)return 0;if(a===Infinity)return b;
  if(b===Infinity)return a;if(a===b)return a;if(a===neg(b))return 0;
  const g=++id;gates.push({id:g,a,b});return g;
 }
 const or=(a,b)=>neg(and(neg(a),neg(b)));
 const all=xs=>xs.reduce(and,Infinity);
 const eq=(bits,n)=>all(bits.map((id,j)=>(n&(1<<j))?id:neg(id)));
 let out=0;
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)
  if(rowMasks[a]&(1<<b))out=or(out,and(eq([1,2],b),eq([3,4],a)));
 const clauses=gates.flatMap(({id,a,b})=>[[-id,a],[-id,b],[id,-a,-b]]);
 const record={inputVariables:4,auxiliaryVariables:gates.length,
   variables:4+gates.length,clauses,outputLiteral:out};
 const answer=[];
 for(const order of ['chronological','reverse']){
  for(const mode of ['forallReplyThenExistsAction','existsActionThenForallReply']){
   const prefix=mode==='forallReplyThenExistsAction'?
    [{quantifier:'a',vars:[1,2],kind:'action'},{quantifier:'e',vars:[3,4],kind:'action'}]:
    [{quantifier:'e',vars:[3,4],kind:'action'},{quantifier:'a',vars:[1,2],kind:'action'}];
   const solver=createActionROBDDProjection({variableOrder:order,maxNodes:60000,maxOperations:300000,maxMs:15000});
   const result=solver.finish({...record,prefix},{legalColumns:[0,1,2,3]});
   if(result.status!=='EXACT_ACTION_VECTOR')throw Error('incomplete synthetic control');
   const actual=result.actionValues.map(x=>x.threshold),
    want=mode==='forallReplyThenExistsAction'?[true,true,true,true]:[false,false,false,false];
   if(JSON.stringify(actual)!==JSON.stringify(want))
    throw Error('quantifier-order counterexample lost');
   answer.push({order,mode,actionVector:actual,allFirstChoicesCovered:actual.every(Boolean),
     BDDNodes:result.stats.peakAllocatedNodes,BooleanOps:result.stats.operations});
  }
 }
 return {schema:'action-robd-223-adaptive-quantifier-falsifier.v0_1',
  status:'PASS',legalPhysicalReference:'4x3-c3 legal prefix 223',
  responseRows:rowMasks.map(x=>'0x'+x.toString(16)),
  quantifiedOrderPreserved:true,answer};
}
