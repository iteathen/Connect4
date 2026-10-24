// Source + evidence hashes for each snapshot. Generated files are excluded,
// preventing a self-referential manifest. No external tools, native libraries,
// network, or oracle data are used to generate source identities.
import {createHash} from 'node:crypto';
import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const entries=[];
function walk(dir){for(const name of readdirSync(dir).sort()){
 const p=join(dir,name),r=relative(root,p).replaceAll('\\','/');
 if(r==='provenance.json')continue;
 if(statSync(p).isDirectory())walk(p);
 else entries.push({path:r,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')});
}}
walk(root);
writeFileSync(join(root,'provenance.json'),JSON.stringify({package:'@iteathen/isomax-next-abc',version:'0.3.0-alpha.2',
 language:'JavaScript (ESM) only',runtimeMeasured:'Node 22.16.0',v8Measured:'12.4.254.21-node.26',
 release:'experimental; no GitHub publication; old IsoMax 0.2.0-rc.6 untouched',
 exactSourceIdentity:entries},null,2)+'\n');
