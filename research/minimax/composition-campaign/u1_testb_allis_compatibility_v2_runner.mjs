import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const sourcePath = new URL('./u1_testb_allis_compatibility.mjs', import.meta.url);
let source = fs.readFileSync(sourcePath, 'utf8');
const before = "return{type,squares,fragments,inverses,special,cols,fragmentKeys:new Set(fragments.map(f=>f.key))};";
const after = "return{type,squares,fragments,inverses,special,cols,claims,fragmentKeys:new Set(fragments.map(f=>f.key))};";
assert(source.includes(before), 'expected v1 descriptor return seam not found');
source = source.replace(before, after);
assert(!source.includes(before), 'descriptor repair did not apply uniquely');
const tmp = '/tmp/u1_testb_allis_compatibility_v2.mjs';
fs.writeFileSync(tmp, source);
await import(pathToFileURL(tmp).href + `?v=${Date.now()}`);
