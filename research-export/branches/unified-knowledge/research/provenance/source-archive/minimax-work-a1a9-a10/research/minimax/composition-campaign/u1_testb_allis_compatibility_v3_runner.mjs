import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const sourcePath = new URL('./u1_testb_allis_compatibility.mjs', import.meta.url);
let source = fs.readFileSync(sourcePath, 'utf8');
const descBefore = "return{type,squares,fragments,inverses,special,cols,fragmentKeys:new Set(fragments.map(f=>f.key))};";
const descAfter = "return{type,squares,fragments,inverses,special,cols,claims,fragmentKeys:new Set(fragments.map(f=>f.key))};";
assert(source.includes(descBefore), 'expected v1 descriptor seam not found');
source = source.replace(descBefore, descAfter);
const genericRe = /function genericCompat\(a,b\)\{[\s\S]*?\n\}\nfunction brief/;
assert(genericRe.test(source), 'genericCompat seam not found');
const generic = `function claimMask(q){let z=0n;for(let r=q.low;r<=q.high;r++)z|=bit(r*W+q.col);return z;}\nfunction inverseMask(inv){let z=0n;for(let r=inv.low;r<=inv.high;r++)z|=bit(r*W+inv.col);return z;}\nfunction genericCompat(a,b){\n const shared=a.squares&b.squares;if((shared&(a.special|b.special))!==0n)return false;\n let shareable=0n;\n const bk=new Map(b.fragments.map(f=>[f.key,f]));for(const f of a.fragments){const g=bk.get(f.key);if(g)shareable|=f.cells;}\n // A claim and an inverse may share boundary/above squares when the claim is not below the inverse.\n // This is expressed only from event intervals, not from A1/A5/A6 type identities.\n for(const q of a.claims)for(const inv of b.inverses)if(q.col===inv.col&&q.high>=inv.low)shareable|=claimMask(q)&inverseMask(inv);\n for(const q of b.claims)for(const inv of a.inverses)if(q.col===inv.col&&q.high>=inv.low)shareable|=claimMask(q)&inverseMask(inv);\n if((shared&~shareable)!==0n)return false;\n if(!constraint2(a,b))return false;\n const x=inverseCols(a),y=inverseCols(b),over=x&y;if(over!==0&&x!==y)return false;\n return true;\n}\nfunction brief`;
source = source.replace(genericRe, generic);
const tmp='/tmp/u1_testb_allis_compatibility_v3.mjs';fs.writeFileSync(tmp,source);await import(pathToFileURL(tmp).href+`?v=${Date.now()}`);
