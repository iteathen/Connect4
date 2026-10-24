#!/usr/bin/env node
// CLI for all three JavaScript-only, math-native candidate engines.
import {performance} from 'node:perf_hooks';
import {IsoMaxA,IsoMaxB,IsoMaxC} from './index.mjs';
const args=process.argv.slice(2);const params=new Map();
for(let i=0;i<args.length;i++){
 if(!args[i].startsWith('--'))throw Error(`unexpected ${args[i]}`);
 const key=args[i].slice(2),value=args[++i];
 if(value===undefined)throw Error(`missing value for --${key}`);
 params.set(key,value);
}
const variant=(params.get('variant')||'B').toUpperCase();
const Clazz=({A:IsoMaxA,B:IsoMaxB,C:IsoMaxC})[variant];
if(!Clazz)throw Error('variant must be A/B/C');
const columns=Number(params.get('columns')??7),rows=Number(params.get('rows')??6),
 ttMiB=Number(params.get('tt-mib')??16),nodeLimit=Number(params.get('node-limit')??50000000),
 deadlineMs=Number(params.get('deadline-ms')??0);
const historyString=params.get('history')||'';
// Compact history is 1-based columns 1..9, e.g. 42142544. For column 10,
// and all more general layouts, supply a comma-separated 1-based history:
// --history 4,2,10,3. JSON array uses 0-based column indices.
let history;
if(!historyString)history=[];
else if(historyString[0]==='['){
 history=JSON.parse(historyString);
 if(!Array.isArray(history))throw Error('JSON history must be an array');
}else if(historyString.includes(',')||historyString.includes(' ')){
 history=historyString.split(/[\s,]+/).filter(Boolean).map(x=>{
  if(!/^\d+$/.test(x))throw Error('history must contain positive integers');
  return Number(x)-1;
 });
}else{
 if(!/^[1-9]+$/.test(historyString))throw Error('compact history requires digits 1..9; use CSV for column 10');
 history=[...historyString].map(x=>Number(x)-1);
}
const solver=new Clazz({columns,rows,ttMiB,nodeLimit,deadlineMs});
const started=performance.now();
try{
 console.log(JSON.stringify(solver.solve(history)));
}catch(error){
 if(error?.name!=='DeadlineError'&&error?.name!=='NodeLimitError')throw error;
 const elapsedMs=performance.now()-started;
 console.log(JSON.stringify({version:'0.3.0-alpha.4',variant,status:'INCOMPLETE',
  cause:error.name,error:String(error.message),width:columns,height:rows,
  rank:history.length,elapsedMs,nodes:solver.nodes,
  ttKind:solver.tt.constructor.name,ttRecordBytes:solver.tt.wordsPerEntry*4,
  ttEntries:solver.tt.capacity,ttBytes:solver.tt.bytes,
  ttProbes:solver.tt.probes,ttHits:solver.tt.hits,ttStores:solver.tt.stores}));
 process.exitCode=2;
}
