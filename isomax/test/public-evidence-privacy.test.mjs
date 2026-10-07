import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const base=new URL('../',import.meta.url);
function files(url){return readdirSync(url,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(new URL(e.name+'/',url)):[new URL(e.name,url)]);}
test('public documentation and evidence omit personal computer paths and unrelated application details',()=>{
 const targets=[new URL('README.md',base),new URL('profile.json',base),...files(new URL('evidence/',base))];
 const forbidden=[/C:[\\/]+Users[\\/]+(?!<|USER_HOME)[^\\/\s"']+/i,new RegExp('One'+'Drive','i')];
 for(const target of targets){const text=readFileSync(target,'utf8');for(const pattern of forbidden)assert.doesNotMatch(text,pattern,'Public evidence privacy: '+target.pathname.split('/').slice(-2).join('/'));}
});
test('distribution includes current raw package confirmation and matched review records',()=>{
 for(const p of ['evidence/promotion-20261006/public-default-02/stdout.json','evidence/promotion-20261006/public-default-02/summary.json',
 'evidence/review-validation-20261007/matched/summary.json','evidence/review-validation-20261007/README.md'])
 assert.ok(readFileSync(new URL(p,base)).length>0,p);
});
