// Post-run provenance check. Raw measurements, including their dirty status, stay frozen.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
const [library]=process.argv.slice(2);
const git=(...args)=>execFileSync('git',['-C',library,...args]);
const sha=git('rev-parse','HEAD').toString().trim();
const ledger=JSON.parse(fs.readFileSync(path.join(library,'catalog/addon-cycle-ledger-v0.json')));
const files=Object.keys(ledger.decomposedSourceBlobs).map(file=>{
  const raw=fs.readFileSync(path.join(library,file)),committed=git('show',`HEAD:${file}`);
  assert.ok(raw.equals(committed),`raw bytes differ: ${file}`);
  return {file,sha256:createHash('sha256').update(raw).digest('hex'),rawEqualsCommit:true};
});
assert.equal(git('diff','--name-only').toString().trim(),'');
assert.equal(git('diff','--cached','--name-only').toString().trim(),'');
console.log(JSON.stringify({sha,verificationTime:new Date().toISOString(),files,
  scope:'Post-run check, not a retroactive full runtime attestation. Per-sample cofactor SHA-256 is preserved in every clean sample.'},null,2));
