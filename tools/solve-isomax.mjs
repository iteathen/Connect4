import {parseArgs} from 'node:util';
import {solve7x6} from '../components/isometric/solve.mjs';
// COLD CLI/reporting; external columns are explicitly zero-based.
const {values}=parseArgs({options:{moves:{type:'string',default:''},workers:{type:'string',default:'1'},
  timeout:{type:'string',default:'120000'},'boundary-depth':{type:'string',default:'2'}}});
const moves=values.moves===''?[]:values.moves.split(',').map(Number);
const result=await solve7x6(moves,{workers:Number(values.workers),timeoutMs:Number(values.timeout),
  boundaryDepth:Number(values['boundary-depth'])});
console.log(JSON.stringify(result,null,2));
if(result.status!=='EXACT')process.exitCode=1;
