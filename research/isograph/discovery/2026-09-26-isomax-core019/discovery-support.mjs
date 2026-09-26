// Derived view only: every selected occurrence remains addressable in native.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {decode} from './native-tree.mjs';
const native=fs.readFileSync('packet-v2/NATIVE.isg','utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
assert.equal(hash(native),'8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718');
const program=decode(native), support=[];
const names=new Set(['searchCpcOnly','connect4RbaCofactorKnownHeight','connect4RbaCofactorBasis',
  'connect4RbaCanonicalize','compareReflectedSupport','prepareConnect4RbaExecutionProfile',
  'advanceConnect4LiveLineState32','evaluateConnect4LiveLine3x32',
  'probeConnect4RbaExactCacheSlot32','storeConnect4RbaExactCacheSlot32',
  'probeConnect4RbaSharedExactCache32','storeConnect4RbaSharedExactCache32',
  'prepareConnect4RbaAlphaBeta','solveConnect4RbaAlphaBeta','runLazySmpConnect4Rba32']);
function walk(x,path,fn){
  if(!x||typeof x!=='object')return;
  if(x.type)fn(x,path);
  for(const [k,v] of Object.entries(x))if(v&&typeof v==='object')walk(v,`${path}/${k}`,fn);
}
for(let m=0;m<program.modules.length;m++){
  const module=program.modules[m];
  walk(module.program,`/modules/${m}/program`,(node,path)=>{
    if(node.type!=='FunctionDeclaration'||!names.has(node.id?.name))return;
    const operations=[];
    walk(node,path,(n,p)=>{
      if(['IfStatement','ForStatement','WhileStatement','ReturnStatement','AssignmentExpression','CallExpression'].includes(n.type))
        operations.push({path:p,type:n.type,sha256:hash(JSON.stringify(n)),
          ...(n.type==='CallExpression'&&n.callee.type==='Identifier'?{callee:n.callee.name}:{}),
          ...(n.type==='AssignmentExpression'?{operator:n.operator}:{})});
    });
    support.push({name:node.id.name,module:module.path,path,sha256:hash(JSON.stringify(node)),operations});
  });
}
assert.equal(support.length,names.size);
const workerIndex=program.modules.findIndex(m=>m.path.endsWith('/rba-connect4-lazy-smp-worker.mjs'));
assert.ok(workerIndex>=0);
const out={nativeSha256:hash(native),view:'ordered operation support; not standalone semantic authority',
  claimBoundary:'Static occurrence support, not a dynamic call-count or cost profile',support,
  workerEntry:{path:`/modules/${workerIndex}/program`,sha256:hash(JSON.stringify(program.modules[workerIndex].program))}};
fs.writeFileSync('discovery-support.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({functions:support.length,operations:support.reduce((n,f)=>n+f.operations.length,0),nativeSha256:out.nativeSha256}));
