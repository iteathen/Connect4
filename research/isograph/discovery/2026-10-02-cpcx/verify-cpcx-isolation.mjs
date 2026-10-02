#!/usr/bin/env node
import {readdir,readFile} from 'node:fs/promises';
import {basename,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const names=(await readdir(here))
  .filter(name=>name.endsWith('.mjs'))
  .filter(name=>!name.endsWith('.test.mjs'))
  .filter(name=>name!=='verify-cpcx-isolation.mjs');

const forbiddenLiteralFragments=[
  'cpc-connect4',
  'exactconnect4oracle',
  'components/oracle',
  'solved-actions',
  'openingbook',
  'opening-book',
  'opening_book',
  'bdd_w7_h6',
  'solution_w7_h6',
  'reference/oracles',
];

const violations=[];
for(const name of names){
  const path=resolve(here,name),source=await readFile(path,'utf8');

  // CPCX runtime source is intentionally closed over this prototype directory.
  // This catches static imports, dynamic imports and CommonJS require calls.
  const specs=[];
  for(const re of [
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]){
    let m;
    while((m=re.exec(source))!==null)specs.push(m[1]);
  }
  for(const spec of specs){
    if(!spec.startsWith('./')){
      violations.push({file:name,kind:'NONLOCAL_RUNTIME_IMPORT',spec});
      continue;
    }
    const target=basename(spec);
    if(!target.startsWith('cpcx')){
      violations.push({file:name,kind:'NON_CPCX_RUNTIME_IMPORT',spec});
    }
    if(spec.includes('..')){
      violations.push({file:name,kind:'IMPORT_ESCAPES_PROTOTYPE',spec});
    }
  }

  // Catch hidden data dependencies in runtime string literals without being
  // confused by test assertions or documentation prose.
  const stringRe=/(?:'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)")/g;
  let m;
  while((m=stringRe.exec(source))!==null){
    const value=(m[1]??m[2]??'').toLowerCase();
    for(const token of forbiddenLiteralFragments){
      if(value.includes(token))
        violations.push({file:name,kind:'FORBIDDEN_RUNTIME_LITERAL',token,value});
    }
  }

  for(const api of ['readFile(','readFileSync(','createReadStream(','fetch(']){
    if(source.includes(api))
      violations.push({file:name,kind:'RUNTIME_EXTERNAL_DATA_API',api});
  }
}

if(violations.length){
  console.error(JSON.stringify({status:'FAIL',violations},null,2));
  process.exit(1);
}
console.log(JSON.stringify({
  status:'PASS',
  checkedRuntimeModules:names.sort(),
  rule:'runtime imports remain local to CPCX; no solved/oracle/opening-book dependency strings or runtime external-data reads',
},null,2));
