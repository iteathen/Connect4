// Distribution maintenance only. Never modifies frozen runtime files.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=new URL('../isomax/',import.meta.url),normal=s=>s.replaceAll('\r\n','\n'),
 hash=p=>createHash('sha256').update(normal(readFileSync(new URL(p,base),'utf8'))).digest('hex'),
 previous=JSON.parse(readFileSync(new URL('provenance.json',base),'utf8'));
const files={};
for(const [path,record] of Object.entries(previous.files))if(path.startsWith('runtime/')){
 assert.equal(hash(path),record.sha256,'Frozen runtime changed: '+path);files[path]=record;
}
function include(path){
 const sha256=hash(path),old=previous.files[path];
 files[path]=old?{...old,sha256,...(old.sha256!==sha256&&old.source!=='package-authored'?{
  originalSourceSha256:old.originalSourceSha256??old.sha256,
  transformation:'Public evidence redaction or historical qualification annotation; numeric measurements and source identities preserved.'}: {})}:{source:'package-authored',sha256};
}
function directory(prefix){for(const e of readdirSync(new URL(prefix,base),{withFileTypes:true})){
 const path=prefix+e.name;if(e.isDirectory())directory(path+'/');else include(path);
}}
for(const p of ['index.mjs','cli.mjs','run.mjs','example.mjs','profile.json','package.json','verify.mjs','README.md','LICENSE'])include(p);
directory('test/');directory('evidence/');
const pkg=JSON.parse(readFileSync(new URL('package.json',base),'utf8'));
writeFileSync(new URL('provenance.json',base),JSON.stringify({...previous,version:pkg.version,
 status:'Repository distribution with sanitized self-contained qualification; registry publication disabled',
 files:Object.fromEntries(Object.entries(files).sort())},null,2)+'\n');
console.log('Locked '+Object.keys(files).length+' files; frozen runtime identity preserved.');
